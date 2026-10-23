<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from './stores/game';
import { useAuthStore } from './stores/auth';
import { setOnAuthError } from './api/client';
import { confirmDialog } from './composables/useConfirm';
import { GAME_VERSION } from './version';
import ConfirmHost from './components/ConfirmHost.vue';
import BackendBanner from './components/BackendBanner.vue';

const store = useGameStore();
const auth = useAuthStore();
const router = useRouter();

// 被顶号 / 挂机踢 / 登录过期：弹提示并回登录页
onMounted(() => {
  setOnAuthError((e) => {
    if (!auth.isLoggedIn) return;
    confirmDialog({
      title: '登录状态',
      message: e.message || '你已被踢下线，请重新登录',
      danger: true,
      confirmText: '知道了',
    }).then(() => {
      auth.logout();
      if (router.currentRoute.value.path !== '/') router.push('/');
    });
  });

  // ===== 版本更新检测：前端/后端有新版本时，弹窗提示刷新 =====
  let prompted = false;
  const promptUpdate = () => {
    if (prompted) return;
    prompted = true;
    confirmDialog({
      title: '发现新版本',
      message: '检测到游戏已更新，刷新即可加载最新内容。',
      confirmText: '立即刷新',
    }).then(() => location.reload()).catch(() => {});
  };
  const checkUpdate = async () => {
    try {
      // 后端版本（/api/health）
      const h = await fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
      if (h && h.version) {
        if (window.__beVer && h.version !== window.__beVer) return promptUpdate();
        window.__beVer = h.version;
      }
      // 前端版本（线上 index.html 的 GAME_VERSION）
      const html = await fetch('/', { cache: 'no-store' }).then(r => r.text()).catch(() => '');
      const m = html.match(/GAME_VERSION\s*=\s*['"]([^'"]+)['"]/);
      if (m && m[1] && m[1] !== GAME_VERSION) return promptUpdate();
    } catch (e) { /* ignore */ }
  };
  checkUpdate();
  setInterval(checkUpdate, 60000); // 每 60 秒检测一次
});

// 同步账号信息到全局（供游戏 DOM 层主页顶栏读取）
watch(() => [auth.user, auth.token, auth.guest], () => {
  window.__ybrpgAccount = {
    isGuest: !auth.token,
    avatar: (auth.user && auth.user.avatar) || null,
    nickname: (auth.user && auth.user.nickname) || null,
  };
}, { immediate: true });

// 游戏态底部导航（秘境/竞技暂不规划，占位）
const navs = [
  { id: 'home-view', label: '主页' },
  { id: 'team-view', label: '队伍' },
  { id: 'dungeon-view', label: '副本' },
  { id: '__jingmi', label: '秘境', disabled: true },
  { id: '__jingji', label: '竞技', disabled: true },
];

function switchView(n) {
  if (n && n.disabled) {
    if (window.Game && window.Game.toast) window.Game.toast('暂未开放，敬请期待', 'warning');
    return;
  }
  store.showView(n.id);
}
</script>

<template>
  <div class="app-shell">
    <!-- ============ 主界面态：Vue 路由视图 ============ -->
    <div v-show="!store.inGame" class="main-layer">
      <header class="app-header">
        <div class="app-title">星河之契</div>
        <div class="app-version">{{ GAME_VERSION }}</div>
      </header>
      <main class="app-main">
        <router-view />
      </main>
    </div>

    <!-- ============ 游戏态：宿主层（旧逻辑层渲染容器） ============ -->
    <div v-show="store.inGame" class="game-shell">
      <!-- 资源条：Vue 提供骨架，逻辑层 ensureResourceHUD 填充数值 -->
      <div id="ybrpg-res-hud" class="ybrpg-res-hud">
        <span class="res-item">💰 <span id="ybrpg-res-gold">0</span> 金币</span>
        <span class="res-item">⚡ <span id="ybrpg-res-stamina">0/0</span> 体力</span>
        <!-- 钻石兑金币功能暂隐藏：保留 store.openDiamondExchange() 入口备用，需要时给下方 span 加 class="res-diamond" @click="store.openDiamondExchange()" 即可恢复 -->
        <span class="res-item">💎 <span id="ybrpg-res-diamond">0</span> 钻石</span>
      </div>

      <!-- 游戏视图容器：由旧 render* 函数填充 -->
      <div id="team-view"></div>
      <div id="bag-view"></div>
      <div id="dungeon-view"></div>
      <div id="shop-view"></div>
      <div id="battle-view"></div>
      <div id="settings-view"></div>
      <div id="save-view"></div>
      <div id="home-view"></div>

      <!-- 游戏态底部导航（Vue 渲染，事件走 store） -->
      <nav class="game-nav-bar">
        <button
          v-for="n in navs"
          :key="n.id"
          class="game-nav-btn"
          :class="{ active: store.activeView === n.id }"
          @click="switchView(n)"
        >
          {{ n.label }}
        </button>
        <!-- 主界面按钮：保留功能备用，暂不显示（功能见 store.exitGame()） -->
        <!-- <button class="game-nav-btn home" @click="store.exitGame()">主界面</button> -->
      </nav>
    </div>

    <!-- 全局确认弹窗 -->
    <ConfirmHost />
    <!-- 后端离线提示 -->
    <BackendBanner />
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* ---------- 主界面态 ---------- */
.main-layer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(135deg, #1a237e, #283593);
  color: #fff;
  flex-shrink: 0;
}
.app-title {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
}
.app-version {
  font-size: 12px;
  opacity: 0.8;
}
.app-main {
  flex: 1;
  overflow-y: auto;
}

/* ---------- 游戏态宿主层 ---------- */
.game-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.game-shell :deep(#team-view),
.game-shell :deep(#bag-view),
.game-shell :deep(#dungeon-view),
.game-shell :deep(#shop-view),
.game-shell :deep(#battle-view),
.game-shell :deep(#settings-view),
.game-shell :deep(#save-view),
.game-shell :deep(#home-view) {
  display: none;
}
.game-nav-bar {
  flex-shrink: 0;
  width: 90%;
  max-width: 800px;
  margin: auto auto 0; /* 沉底，视图区自动压缩 */
  display: flex;
  align-items: center;
  padding: 5px 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}
.game-nav-btn {
  flex: 1;
  margin: 0 1px;
  padding: 6px 0;
  font-size: 12px;
  cursor: pointer;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 5px;
  transition: all 0.2s;
  text-align: center;
  min-width: 0;
  white-space: nowrap;
}
.game-nav-btn:hover {
  background: #444;
  border-color: #777;
}
.game-nav-btn.active {
  background: #1976d2;
  border-color: #42a5f5;
  color: #fff;
}
.game-nav-btn.home {
  background: #b71c1c;
  border-color: #e53935;
}
</style>
