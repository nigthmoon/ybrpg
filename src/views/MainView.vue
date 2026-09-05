<script setup>
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

const router = useRouter();
const store = useGameStore();
</script>

<template>
  <div class="main-page">
    <div class="hero">
      <div class="hero-logo">✦</div>
      <h1 class="hero-title">星河之契</h1>
      <p class="hero-subtitle">在星海深处，缔结你的契约与传说</p>

      <div class="hero-actions">
        <button class="act-btn primary" @click="store.newGame()">
          <span class="act-icon">✦</span> 开始新游戏
        </button>
        <button class="act-btn" @click="router.push('/save')">
          <span class="act-icon">📂</span> 读取存档
        </button>
        <button class="act-btn" @click="router.push('/settings')">
          <span class="act-icon">⚙</span> 设置
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
.act-icon {
  font-size: 18px;
}
@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
}
</style>
