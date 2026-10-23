/**
 * 游戏状态 store（game.js）
 * ------------------------------------------------------------
 * 桥接旧逻辑层（src/game/*）与 Vue 视图层：
 *  - 动态加载逻辑层（首次进入时才拉取，不拖慢首屏）
 *  - 通过 window.Game.SaveManager 操作存档
 *  - 通过旧 render* 函数填充"游戏宿主层"（App.vue 中的 v-show 区域）
 *  - 维护 inGame / activeView 等 Vue 响应式状态
 *
 * 视图层级：
 *  - 主界面态（inGame=false）：Vue 路由视图（主界面 / 存档 / 设置）
 *  - 游戏态（inGame=true）  ：宿主层（#team-view 等 7 个容器 + HUD + 底部导航）
 */
import { defineStore } from 'pinia';
import { nextTick } from 'vue';
import router from '../router';
import { useAuthStore } from './auth';
import { downloadSlot, uploadSlot, deleteCloudSlot } from '../game/cloud';
import { getSaveNamespace } from '../game/saveNs';
import { api } from '../api/client';
import { confirmDialog } from '../composables/useConfirm';

// 动态加载的逻辑层模块引用（首次 initGame 后缓存）
let otherApi = null;

// 各渲染函数分散在不同模块，统一在此聚合，供 _renderView 调用
let renderFns = null;
let hbTimer = null;   // 在线心跳定时器
let hbVis = null;     // 可见性变化处理器

export const useGameStore = defineStore('game', {
  state: () => ({
    ready: false,          // 逻辑层是否已加载完成
    inGame: false,         // 是否处于游戏态（宿主层显示）
    activeView: '',        // 当前激活的游戏视图 id（team-view 等）
    saves: [],             // 手动存档槽位快照（Vue 存档页用）
    hasAuto: false,        // 是否存在自动存档
    autoSaveTime: null,    // 自动存档时间
    accountReturnToGame: false, // 账号页是否应返回游戏内（从游戏内进入时为 true）
  }),

  actions: {
    /**
     * 初始化逻辑层（幂等）：加载依赖链并注册 window.Game / window.__ybrpgBridge
     */
    async initGame() {
      if (otherApi) return;
      await import('../game/init');   // 副作用入口：拉取整条依赖链
      otherApi = await import('../game/other');
      // 渲染函数分散在不同模块，逐个导入并聚合（失败时退化为空，不影响其余功能）
      const [team, bag, dungeon, shop] = await Promise.all([
        import('../game/team'),
        import('../game/bag'),
        import('../game/dungeon'),
        import('../game/shop'),
      ]);
      renderFns = {
        renderTeamView: team.renderTeamView,
        renderBagView: bag.renderBagView,
        renderDungeonView: dungeon.renderDungeonView,
        renderShopView: shop.renderShopView,
        renderHomeView: otherApi.renderHomeView,
      };
      this.ready = true;
      this._registerBridge();
    },

    /**
     * 注册 Vue 桥接钩子，供逻辑层反向调用（返回主界面 / 存档管理跳转）
     */
    _registerBridge() {
      if (window.__ybrpgBridge) return;
      window.__ybrpgBridge = {
        exitGame: () => this.exitGame(),
        logoutAndExit: () => this.logoutAndExit(),
        goAccount: () => this.goAccount(),
        goSaves: () => {
          if (this.inGame) this.showView('save-view');
          else router.push('/save');
        },
      };
    },

    /**
     * 刷新存档列表快照（主界面存档页 / 操作后刷新）
     */
    refreshSaves() {
      if (!this.ready) return;
      const sm = window.Game.SaveManager;
      this.hasAuto = sm.hasAutoSave();
      this.autoSaveTime = null;
      try {
        const raw = localStorage.getItem(getSaveNamespace() + ':ybrpg_save_0');
        if (raw) {
          const d = JSON.parse(raw);
          this.autoSaveTime = d?.baseInfo?.saveTime || d?.saveTime || null;
        }
      } catch (e) { /* 忽略解析错误 */ }
      this.saves = sm.getAllSaves().map(s => ({
        slot: s.slot,
        exists: s.exists,
        name: s.data?.saveName || `存档${s.slot}`,
        time: s.data?.saveTime || null,
      }));
    },

    /**
     * 登录态：把云端该账号的存档拉齐到本地（供存档页展示与读取），再刷新列表。
     * 换设备登录同一账号时，靠它从云端继承存档。
     */
    async ensureCloudSaves() {
      if (!this.ready) return;
      if (useAuthStore().isLoggedIn) {
        try {
          const d = await api.listSaves();
          const list = (d && d.saves) || [];
          for (const s of list) {
            if (s && s.exists) { try { await downloadSlot(s.slot); } catch (e) { /* 单个失败忽略 */ } }
          }
        } catch (e) { /* 后端不在/网络异常：仅用本地 */ }
      }
      this.refreshSaves();
    },

    /**
     * 开始新游戏：初始化逻辑层 → initNewGame → 进入队伍视图
     */
    async newGame() {
      await this.initGame();
      // 已有自动存档时，开始新游戏会覆盖进度，需二次确认
      const sm = window.Game.SaveManager;
      if (sm && typeof sm.hasAutoSave === 'function' && sm.hasAutoSave()) {
        const ok = await confirmDialog({
          title: '开始新游戏',
          message: '当前已有自动存档进度。\n开始新游戏将重置当前进度(自动存档会被覆盖)。\n确定开始吗？重要进度建议先保存到手动存档。',
          danger: true,
          confirmText: '开始新游戏',
        });
        if (!ok) return;
      }
      otherApi.initNewGame();
      await this.enterGame('team-view');
    },

    /**
     * 读取手动存档并进入游戏
     */
    async loadSlot(slot) {
      await this.initGame();
      // 已登录且本地无该槽时，先从云端拉取（本地已有则不覆盖）
      if (useAuthStore().isLoggedIn) {
        try { await downloadSlot(slot); } catch (e) { /* 忽略，回退本地 */ }
      }
      window.Game.SaveManager.loadFromSlot(slot);
      await this.enterGame('team-view');
    },

    /**
     * 读取自动存档并进入游戏
     */
    async loadAuto() {
      if (window.ybrpgShowLoading) window.ybrpgShowLoading('正在读取自动存档…');
      try {
        await this.initGame();
        // 已登录且本地无自动档时，先从云端拉取
        if (useAuthStore().isLoggedIn) {
          try { await downloadSlot(0); } catch (e) { /* 忽略，回退本地 */ }
        }
        window.Game.SaveManager.loadAutoSave();
        await this.enterGame('team-view');
      } finally {
        // 等待新视图渲染完成后再隐藏
        setTimeout(() => { if (window.ybrpgHideLoading) window.ybrpgHideLoading(); }, 350);
      }
    },

    /**
     * 保存当前进度到指定槽位（1-4），返回保存结果
     */
    saveSlot(slot) {
      if (!this.ready) return null;
      const result = window.Game.SaveManager.saveToSlot(slot);
      // 已登录：异步上传到云端（不阻塞界面）
      if (useAuthStore().isLoggedIn && result) {
        uploadSlot(slot).catch(e => console.warn('[云存档] 上传失败:', e));
      }
      return result;
    },

    /**
     * 删除指定槽位存档
     */
    deleteSlot(slot) {
      if (!this.ready) return;
      window.Game.SaveManager.deleteSlot(slot);
      if (useAuthStore().isLoggedIn) {
        deleteCloudSlot(slot).catch(() => {});
      }
      this.refreshSaves();
    },

    /**
     * 进入游戏态：显示宿主层并渲染初始视图
     */
    async enterGame(viewId) {
      this.inGame = true;
      this.activeView = viewId;
      await nextTick(); // 等待宿主层 v-show 挂载完成
      otherApi.ensureResourceHUD();
      this._forceReset(); // 清空全部视图，读取新存档后强制刷新
      this.showView(viewId);
      this.startHeartbeat(); // 登录态启动在线心跳
    },

    /**
     * 切换游戏内视图（导航按钮 / 逻辑层跳转）：
     *  - 已渲染过的视图保留状态（只切换显示）
     *  - 未渲染过的视图懒渲染
     */
    showView(viewId) {
      if (!otherApi) return;
      const el = document.getElementById(viewId);
      otherApi.hideOtherViews(viewId);
      if (!el) return;
      if (!el.children.length) this._renderView(viewId, el);
      el.style.display = 'flex';
      this.activeView = viewId;
    },

    /**
     * 清空全部游戏视图容器（读取新存档 / 新游戏后强制重渲染，防旧档残留）
     */
    _forceReset() {
      ['team-view', 'bag-view', 'dungeon-view', 'shop-view', 'battle-view', 'settings-view', 'save-view', 'home-view'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
    },

    /**
     * 懒渲染：根据视图 id 调用对应的旧 render 函数
     */
    _renderView(viewId, el) {
      const m = otherApi;
      const r = renderFns || {};
      if (viewId === 'team-view' && r.renderTeamView) r.renderTeamView(el);
      else if (viewId === 'bag-view' && r.renderBagView) r.renderBagView(el);
      else if (viewId === 'dungeon-view' && r.renderDungeonView) r.renderDungeonView(el);
      else if (viewId === 'shop-view' && r.renderShopView) r.renderShopView(el);
      else if (viewId === 'settings-view') m.renderSettingsView(el);
      else if (viewId === 'save-view') m.renderSaveView(el, true);
      else if (viewId === 'home-view' && r.renderHomeView) r.renderHomeView(el);
      },

    /**
     * 退出游戏返回主界面
     */
    startHeartbeat() {
      this.stopHeartbeat();
      if (!useAuthStore().isLoggedIn) return; // 仅登录用户有会话
      const ping = (saved) => { api.sessionPing(saved).catch(() => {}); };
      ping(false);
      hbTimer = setInterval(() => ping(false), 45000); // 45s 心跳（<2 分钟窗口）
      hbVis = () => { if (document.visibilityState === 'visible') ping(false); };
      document.addEventListener('visibilitychange', hbVis);
    },
    stopHeartbeat() {
      if (hbTimer) { clearInterval(hbTimer); hbTimer = null; }
      if (hbVis) { document.removeEventListener('visibilitychange', hbVis); hbVis = null; }
    },

    exitGame() {
      // 已登录：退出时把当前自动档上传云端做备份
      if (this.ready && useAuthStore().isLoggedIn) {
        uploadSlot(0).catch(() => {});
      }
      this.stopHeartbeat();
      this.inGame = false;
      this.activeView = '';
      if (router.currentRoute.value.path !== '/') router.push('/');
    },

    /** 游戏内进入账号页：保留游戏 DOM（仅 v-show 隐藏），记录返回时恢复游戏 */
    goAccount() {
      this.accountReturnToGame = this.inGame;
      this.stopHeartbeat();
      this.inGame = false; // 隐藏游戏层，但 DOM 不销毁，返回时可恢复
      if (router.currentRoute.value.path !== '/account') router.push('/account');
    },

    /** 主界面级进入账号页（返回回主界面） */
    openAccount() {
      this.accountReturnToGame = false;
      if (router.currentRoute.value.path !== '/account') router.push('/account');
    },

    /** 账号页返回：来自游戏内则恢复游戏层，否则回主界面 */
    backFromAccount() {
      const rt = this.accountReturnToGame;
      this.accountReturnToGame = false;
      if (rt) {
        this.inGame = true;
        this.startHeartbeat();
        // 返回游戏：重渲染当前视图，确保昵称/主角名等改动即时生效
        const el = this.activeView && document.getElementById(this.activeView);
        if (el) { el.innerHTML = ''; this._renderView(this.activeView, el); el.style.display = 'flex'; }
      }
      if (router.currentRoute.value.path !== '/') router.push('/');
    },

    /** 退出登录并返回主界面（等待重新登录） */
    async logoutAndExit() {
      // 退出前尝试上传自动档
      if (this.ready && useAuthStore().isLoggedIn) {
        uploadSlot(0).catch(() => {});
      }
      await useAuthStore().logout();
      this.stopHeartbeat();
      this.inGame = false;
      this.activeView = '';
      this._forceReset();
      if (router.currentRoute.value.path !== '/') router.push('/');
    },

    /**
     * 导入存档（弹文件选择器 → 槽位选择 → 写入）
     */
    async importSave() {
      await this.initGame();
      otherApi.importSaveData();
      // 槽位选择弹窗异步交互，稍后刷新列表
      setTimeout(() => this.refreshSaves(), 800);
    },

    /**
     * 导出当前存档（仅游戏态可用，导出按钮只渲染在游戏内存档页）
     */
    exportSave() {
      if (!otherApi) return false;
      return otherApi.exportCurrentSave();
    },

    /**
     * 钻石兑换金币弹窗（HUD 钻石点击）
     */
    openDiamondExchange() {
      if (otherApi) otherApi.openDiamondExchange();
    },

    /**
     * 将旧设置视图渲染进指定容器（主界面态设置页复用）
     */
    renderSettingsInto(el) {
      if (otherApi) otherApi.renderSettingsView(el);
    },
  },
});
