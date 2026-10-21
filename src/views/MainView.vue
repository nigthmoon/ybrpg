<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import { useAuthStore } from '../stores/auth';
import { confirmDialog } from '../composables/useConfirm';

const router = useRouter();
const store = useGameStore();
const auth = useAuthStore();

// 是否已进入游戏（登录 或 游客）
const entered = computed(() => auth.isLoggedIn || auth.guest);

function enterGuest() {
  auth.enterGuest();
}

// 返回上级：登录用户需二次确认后退出登录；游客直接退回入口态
async function backToEntry() {
  if (auth.isLoggedIn) {
    if (await confirmDialog({ message: '确定退出登录并返回吗？' })) {
      await auth.logout();
    }
    return;
  }
  auth.exitGuest();
}
</script>

<template>
  <div class="main-page">
    <!-- 角落用户中心入口（仅已进入态显示） -->
    <button v-if="entered" class="account-fab" title="用户中心" @click="store.openAccount()">👤</button>

    <div class="hero">
      <div class="hero-logo">✦</div>
      <h1 class="hero-title">星河之契</h1>
      <p class="hero-subtitle">在星海深处，缔结你的契约与传说</p>

      <!-- 入口态：登录 / 注册 / 游客 -->
      <div v-if="!entered" class="hero-actions">
        <button class="act-btn primary" @click="router.push('/login')">
          <span class="act-icon">🔑</span> 登录
        </button>
        <button class="act-btn" @click="router.push('/register')">
          <span class="act-icon">📝</span> 注册
        </button>
        <button class="act-btn" @click="enterGuest">
          <span class="act-icon">🎮</span> 游客进入
        </button>
      </div>

      <!-- 已进入态：开始新游戏 / 读取存档 / 设置 / 返回上级 -->
      <div v-else class="hero-actions">
        <button class="act-btn primary" @click="store.newGame()">
          <span class="act-icon">✦</span> 开始新游戏
        </button>
        <button class="act-btn" @click="router.push('/save')">
          <span class="act-icon">📂</span> 读取存档
        </button>
        <button class="act-btn" @click="router.push('/settings')">
          <span class="act-icon">⚙</span> 设置
        </button>
        <button class="act-btn back" @click="backToEntry">
          <span class="act-icon">‹</span> 返回上级
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 50% 20%, #1a237e 0%, #0d1020 60%, #05070f 100%);
}
.account-fab {
  position: fixed;
  top: 34px;
  right: 14px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(20, 24, 38, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e8ecf6;
  font-size: 20px;
  cursor: pointer;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.account-fab:hover {
  background: rgba(60, 80, 140, 0.9);
}
.hero {
  text-align: center;
  padding: 32px;
  max-width: 420px;
  width: 100%;
}
.hero-logo {
  font-size: 56px;
  color: #64b5f6;
  text-shadow: 0 0 24px rgba(100, 181, 246, 0.6);
  animation: twinkle 2.4s ease-in-out infinite;
}
.hero-title {
  font-size: 32px;
  margin: 12px 0 8px;
  letter-spacing: 6px;
  color: #e8eaf6;
}
.hero-subtitle {
  color: #90a4ae;
  font-size: 13px;
  margin-bottom: 36px;
}
.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.act-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0;
  font-size: 16px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  color: #e8eaf6;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  transition: all 0.2s;
}
.act-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}
.act-btn.primary {
  background: linear-gradient(135deg, #1565c0, #1e88e5);
  border-color: #42a5f5;
  font-weight: bold;
}
.act-btn.primary:hover {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
}
.act-btn.back {
  background: rgba(255, 255, 255, 0.03);
  color: #b0b8cc;
}
.act-icon {
  font-size: 18px;
}
@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
}
</style>
