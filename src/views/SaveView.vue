<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

const router = useRouter();
const store = useGameStore();

onMounted(async () => {
  await store.initGame();
  await store.ensureCloudSaves();
});

function fmtTime(t) {
  if (!t) return '未知时间';
  return new Date(t).toLocaleString('zh-CN', { hour12: false });
}

function confirmDelete(slot) {
  window.Game.confirmDialog(`确定删除「存档 ${slot}」吗？删除后无法恢复。`, () => {
    store.deleteSlot(slot);
  });
}
</script>

<template>
  <div class="save-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/')">‹ 返回</button>
      <h2 class="page-title">存档管理</h2>
      <span class="header-spacer"></span>
    </div>

    <div class="save-grid">
      <!-- 自动存档 -->
      <div class="save-card" :class="{ empty: !store.hasAuto }">
        <div class="save-top">
          <span class="save-tag auto">自动</span>
          <span class="save-name">自动存档</span>
        </div>
        <div v-if="store.hasAuto" class="save-time">{{ fmtTime(store.autoSaveTime) }}</div>
        <div v-else class="save-time empty">暂无自动存档</div>
        <div class="save-actions">
          <button
            class="mini-btn load"
            :disabled="!store.hasAuto"
            @click="store.loadAuto()"
          >读取</button>
        </div>
      </div>

      <!-- 手动槽位 -->
      <div
        v-for="s in store.saves"
        :key="s.slot"
        class="save-card"
        :class="{ empty: !s.exists }"
      >
        <div class="save-top">
          <span class="save-tag">{{ s.slot }}</span>
          <span class="save-name">{{ s.name }}</span>
        </div>
        <div v-if="s.exists" class="save-time">{{ fmtTime(s.time) }}</div>
        <div v-else class="save-time empty">空存档</div>
        <div class="save-actions">
          <template v-if="s.exists">
            <button class="mini-btn load" @click="store.loadSlot(s.slot)">读取</button>
            <button class="mini-btn del" @click="confirmDelete(s.slot)">删除</button>
          </template>
        </div>
      </div>
    </div>

    <div class="save-toolbar">
      <button class="tool-btn" @click="store.importSave()">⬆ 导入存档</button>
      <p class="tool-hint">导入时将选择目标存档栏位，请留意覆盖提示</p>
    </div>
  </div>
</template>

<style scoped>
.save-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.back-btn {
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.35);
  color: #e8eaf6;
  border: 1px solid #455a64;
  border-radius: 6px;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  margin: 0;
  color: #e8eaf6;
}
.header-spacer {
  width: 64px;
}
.save-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.save-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
.save-card.empty {
  opacity: 0.55;
}
.save-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.save-tag {
  flex-shrink: 0;
  min-width: 34px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  background: #1565c0;
  color: #fff;
}
.save-tag.auto {
  background: #6a1b9a;
}
.save-name {
  font-size: 15px;
  color: #e8eaf6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.save-time {
  font-size: 12px;
  color: #90a4ae;
  margin: 0 10px;
  flex-shrink: 0;
}
.save-time.empty {
  color: #546e7a;
}
.save-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.mini-btn {
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.mini-btn.load {
  background: #2e7d32;
  color: #fff;
  border-color: #43a047;
}
.mini-btn.load:hover {
  background: #388e3c;
}
.mini-btn.load:disabled {
  background: #37474f;
  border-color: #455a64;
  color: #78909c;
  cursor: not-allowed;
}
.mini-btn.del {
  background: #b71c1c;
  color: #fff;
  border-color: #e53935;
}
.mini-btn.del:hover {
  background: #c62828;
}
.save-toolbar {
  margin-top: 20px;
  text-align: center;
}
.tool-btn {
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  background: linear-gradient(135deg, #00695c, #00897b);
  color: #fff;
  border: 1px solid #26a69a;
  border-radius: 8px;
}
.tool-btn:hover {
  filter: brightness(1.15);
}
.tool-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #607d8b;
}
</style>
