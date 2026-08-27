<script setup>
import { GAME_VERSION } from '../version';
</script>

<template>
  <div class="settings-view">
    <h2 class="section-title">设置</h2>
    <div class="setting-card">
      <div class="setting-row">
        <span class="setting-label">游戏版本</span>
        <span class="setting-value">{{ GAME_VERSION }}</span>
      </div>
      <div class="setting-row">
        <span class="setting-label">引擎</span>
        <span class="setting-value">Vue 3 重构版（迁移中）</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 640px;
  margin: 0 auto;
}
.section-title {
  color: #ffd700;
  margin-bottom: 14px;
}
.setting-card {
  background: rgba(13, 27, 51, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  padding: 6px 14px;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(143, 163, 200, 0.15);
}
.setting-row:last-child {
  border-bottom: none;
}
.setting-label {
  color: #dfe6f2;
}
.setting-value {
  color: #8fa3c8;
  font-size: 13px;
}
</style>
