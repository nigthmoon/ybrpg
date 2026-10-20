/**
 * 前端 API client（账密 + 云存档）
 * ------------------------------------------------------------
 * 统一走相对路径 /api：
 *  - 开发期：Vite server.proxy 将 /api 代理到后端 http://localhost:4000
 *  - 生产期：后端同源托管 dist，/api 直接命中后端
 * 这里也是"将来换后端/换域名"的唯一抽象点。
 *
 * 后端离线识别：经开发代理时，后端不可达会表现为 500，与"接口自身 500"难以区分；
 * 故遇 5xx 时额外探测 /api/health，探测也失败才判定后端离线并上报。
 */

import { markOffline, markOnline } from '../composables/useBackend';

const TOKEN_KEY = 'ybrpg_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

// 401（被顶号/挂机踢/过期）全局回调，由应用层注册用于提示并回登录
let onAuthErrorCb = null;
export function setOnAuthError(cb) { onAuthErrorCb = cb; }

const OFFLINE_MSG = '无法连接游戏服务器(后端未启动)。请双击 start.bat 启动服务后重试。';

/** 基础请求：自动带 token、解析 JSON、非 2xx 抛错（带 status） */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = 'Bearer ' + t;
  }
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    markOffline();
    const e = new Error(OFFLINE_MSG);
    e.status = 0;
    e.backendDown = true;
    throw e;
  }
  // 经开发代理时后端不可达表现为 500；探测 health 以与“接口自身 500”区分
  if (res.status >= 500) {
    let down = false;
    try { const h = await fetch('/api/health'); down = !h.ok; } catch { down = true; }
    if (down) {
      markOffline();
      const e = new Error(OFFLINE_MSG);
      e.status = 0;
      e.backendDown = true;
      throw e;
    }
  }
  markOnline();
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const e = new Error((data && data.message) || ('HTTP ' + res.status));
    e.status = res.status;
    e.data = data;
    if (res.status === 401 && onAuthErrorCb) { try { onAuthErrorCb(e); } catch (err) { /* ignore */ } }
    throw e;
  }
  return data;
}

export const api = {
  register: (username, password) =>
    request('/auth/register', { method: 'POST', body: { username, password }, auth: false }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password }, auth: false }),
  me: () => request('/me'),
  listSaves: () => request('/saves'),
  getSave: (slot) => request('/saves/' + slot),
  putSave: (slot, data) => request('/saves/' + slot, { method: 'PUT', body: { data } }),
  deleteSave: (slot) => request('/saves/' + slot, { method: 'DELETE' }),
  setNickname: (nickname) => request('/auth/nickname', { method: 'PUT', body: { nickname } }),
  setAvatar: (avatar) => request('/auth/avatar', { method: 'PUT', body: { avatar } }),
  changePassword: (oldPassword, newPassword) => request('/auth/password', { method: 'PUT', body: { oldPassword, newPassword } }),
  deleteAccount: (password) => request('/auth/delete-account', { method: 'POST', body: { password } }),
  sessionPing: (saved) => request('/session/ping', { method: 'POST', body: { saved: !!saved } }),
  sessionLogout: () => request('/session/logout', { method: 'POST' }),
};
