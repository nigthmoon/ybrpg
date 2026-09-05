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

// 动态加载的逻辑层模块引用（首次 initGame 后缓存）
let otherApi = null;

// 各渲染函数分散在不同模块，统一在此聚合，供 _renderView 调用
let renderFns = null;

export const useGameStore = defineStore('game', {
  state: () => ({
    ready: false,          // 逻辑层是否已加载完成
    inGame: false,         // 是否处于游戏态（宿主层显示）
    activeView: '',        // 当前激活的游戏视图 id（team-view 等）
    saves: [],             // 手动存档槽位快照（Vue 存档页用）
    hasAuto: false,        // 是否存在自动存档
    autoSaveTime: null,    // 自动存档时间
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
        const raw = localStorage.getItem('ybrpg_save_0');
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
     * 开始新游戏：初始化逻辑层 → initNewGame → 进入队伍视图
     */
    async newGame() {
      await this.initGame();
      otherApi.initNewGame();
      await this.enterGame('team-view');
    },

    /**
     * 读取手动存档并进入游戏
     */
    async loadSlot(slot) {
      await this.initGame();
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
      return window.Game.SaveManager.saveToSlot(slot);
    },

    /**
     * 删除指定槽位存档
     */
    deleteSlot(slot) {
      if (!this.ready) return;
      window.Game.SaveManager.deleteSlot(slot);
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
      ['team-view', 'bag-view', 'dungeon-view', 'shop-view', 'battle-view', 'settings-view', 'save-view'].forEach((id) => {
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
    },

    /**
     * 退出游戏返回主界面
     */
    exitGame() {
      this.inGame = false;
      this.activeView = '';
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
