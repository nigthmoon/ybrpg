<template>
  <transition name="fade">
    <div v-if="confirmState.visible" class="confirm-mask" @click.self="resolveConfirm(false)">
      <div class="confirm-box" :class="{ danger: confirmState.danger }">
        <div class="confirm-title">{{ confirmState.title }}</div>
        <div class="confirm-message">{{ confirmState.message }}</div>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" @click="resolveConfirm(false)">{{ confirmState.cancelText }}</button>
          <button class="confirm-btn ok" @click="resolveConfirm(true)">{{ confirmState.confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { confirmState, resolveConfirm } from '../composables/useConfirm';
</script>

<style scoped>
.confirm-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.confirm-box {
  width: 88%;
  max-width: 360px;
  background: rgba(22, 26, 40, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
}
.confirm-box.danger { border-color: rgba(229, 57, 53, 0.6); }
.confirm-title {
  font-size: 17px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 10px;
}
.confirm-box.danger .confirm-title { color: #ff7b7b; }
.confirm-message {
  font-size: 14px;
  color: #d6dcec;
  line-height: 1.6;
  margin-bottom: 18px;
  text-align: center;
  white-space: pre-line;
}
.confirm-actions { display: flex; gap: 12px; }
.confirm-btn {
  flex: 1;
  padding: 10px;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.confirm-btn.cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #cfd6e6;
  border-color: rgba(255, 255, 255, 0.18);
}
.confirm-btn.ok {
  background: linear-gradient(180deg, #5b8cff, #3f6fe0);
  color: #fff;
}
.confirm-box.danger .confirm-btn.ok {
  background: linear-gradient(180deg, #e53935, #b71c1c);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
