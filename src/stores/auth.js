/**
 * 账号状态 store（auth.js）
 * ------------------------------------------------------------
 *  - token 持久化在 localStorage，启动时 bootstrap 拉取 /me 恢复登录态
 *  - 游客模式：无 token 且 guest=true，可本地游玩；登录后才启用云存档
 *  - 401 时自动清理本地登录态
 */
import { defineStore } from 'pinia';
import { api, getToken, setToken } from '../api/client';
import { setSaveNamespace } from '../game/saveNs';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    user: null,          // { id, username, nickname, created_at, last_login }
    initialized: false,
    guest: false,        // 游客模式（本机会话，不落库）
    savedLogins: [],     // 本地缓存的账密列表（快捷登录用，最近登录在前）：[{ u, p }]
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    isGuest: (s) => !s.token,
    isGuestActive: (s) => !s.token && s.guest,
  },

  actions: {
    /** 启动时恢复登录态（有 token 就校验并拉用户信息） */
    async bootstrap() {
      this._loadSavedLogin();
      if (this.initialized) return;
      if (!this.token) { this.initialized = true; return; }
      try {
        const d = await api.me();
        this.user = d.user;
        setSaveNamespace('u' + d.user.id);
      } catch (e) {
        if (e.status === 401) this._clearLocal();
        // 其它网络错误：保留 token，下次再试
      }
      this.initialized = true;
    },

    async login(username, password, remember = true) {
      const d = await api.login(username, password);
      this.token = d.token;
      setToken(d.token);
      this.user = d.user;
      this.guest = false;
      this.initialized = true;
      setSaveNamespace('u' + d.user.id);
      if (remember) this._saveSavedLogin(username, password);
      // 未勾选“记住”：不缓存该账号，但不清空其它已缓存账号
      return d.user;
    },

    async register(username, password) {
      const d = await api.register(username, password);
      this.token = d.token;
      setToken(d.token);
      this.user = d.user;
      this.guest = false;
      this.initialized = true;
      setSaveNamespace('u' + d.user.id);
      this._saveSavedLogin(username, password);
      return d.user;
    },

    async setNickname(nickname) {
      const d = await api.setNickname(nickname);
      this.user = d.user;
      return d.user;
    },

    async setAvatar(avatar) {
      const d = await api.setAvatar(avatar);
      this.user = d.user;
      return d.user;
    },

    async changePassword(oldPassword, newPassword) {
      await api.changePassword(oldPassword, newPassword);
    },

    async deleteAccount(password) {
      await api.deleteAccount(password);
      this._clearLocal();
    },

    enterGuest() { this.guest = true; setSaveNamespace('guest'); },
    exitGuest() { this.guest = false; setSaveNamespace('guest'); },

    async logout() {
      // 先通知服务端吊销会话（单登录释放名额），失败也在本地登出
      try { await api.sessionLogout(); } catch (e) { /* 后端不在也继续本地登出 */ }
      this._clearLocal();
    },

    _clearLocal() {
      this.token = '';
      this.user = null;
      this.guest = false;
      setSaveNamespace('guest');
      setToken('');
    },

    /** 快捷登录：用指定账号的缓存账密；不传则用最近登录的第一个 */
    async quickLogin(u) {
      const target = u ? this.savedLogins.find(x => x.u === u) : this.savedLogins[0];
      if (!target) throw new Error('没有缓存的登录信息');
      return this.login(target.u, target.p);
    },
    /** 读取本地缓存的账密列表（兼容旧版单值 {u,p}） */
    _loadSavedLogin() {
      try {
        const raw = localStorage.getItem('ybrpg_saved_login');
        if (!raw) return;
        const o = JSON.parse(raw);
        if (Array.isArray(o)) {
          this.savedLogins = o.filter(x => x && x.u).map(x => ({ u: x.u, p: this._b64d(x.p) }));
        } else if (o && o.u) {
          this.savedLogins = [{ u: o.u, p: this._b64d(o.p) }];
        }
      } catch (e) { /* ignore */ }
    },
    /** 缓存账密到本地（列表，最近登录在前；同名更新并前置，最多 8 个；密码 base64 降可见，非加密） */
    _saveSavedLogin(u, p) {
      try {
        const list = this.savedLogins.filter(x => x.u !== u);
        list.unshift({ u: u, p: p });
        this.savedLogins = list.slice(0, 8);
        localStorage.setItem('ybrpg_saved_login', JSON.stringify(this.savedLogins.map(x => ({ u: x.u, p: this._b64e(x.p) }))));
      } catch (e) { /* ignore */ }
    },
    /** 清除所有缓存的账密 */
    _clearSavedLogin() {
      try { localStorage.removeItem('ybrpg_saved_login'); } catch (e) { /* ignore */ }
      this.savedLogins = [];
    },
    /** 移除某个缓存的账号 */
    removeSavedLogin(u) {
      this.savedLogins = this.savedLogins.filter(x => x.u !== u);
      try { localStorage.setItem('ybrpg_saved_login', JSON.stringify(this.savedLogins.map(x => ({ u: x.u, p: this._b64e(x.p) })))); } catch (e) { /* ignore */ }
    },
    _b64e(s) { try { return btoa(unescape(encodeURIComponent(String(s)))); } catch (e) { return String(s); } },
    _b64d(s) { try { return decodeURIComponent(escape(atob(s))); } catch (e) { return s; } },
  },
});
