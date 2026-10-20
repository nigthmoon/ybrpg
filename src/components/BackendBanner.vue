<template>
  <transition name="fade">
    <div v-if="backendState.offline" class="backend-offline">
      <div class="bo-icon">⚠</div>
      <div class="bo-text">
        无法连接游戏服务器(后端未启动)。<br>
        请双击游戏目录下的 <b>start.bat</b> 启动服务。
      </div>
      <button class="bo-retry" @click="retry">重试连接</button>
    </div>
  </transition>
</template>

<script setup>
import { backendState, markOnline } from '../composables/useBackend';

async function retry() {
  try {
    const r = await fetch('/api/health');
    if (r.ok) markOnline();
  } catch (e) { /* 仍不在线，保持提示 */ }
}
</script>

<style scoped>
.backend-offline {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  background: linear-gradient(180deg, #c62828, #8e1616);
  color: #fff;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}
.bo-icon { font-size: 18px; }
.bo-text { flex: 1; line-height: 1.4; }
.bo-retry {
  background: #fff;
  color: #b71c1c;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  font-weight: bold;
  flex-shrink: 0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
