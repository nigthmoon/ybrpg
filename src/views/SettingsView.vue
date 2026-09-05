<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

const router = useRouter();
const store = useGameStore();
const host = ref(null);

onMounted(async () => {
  await store.initGame();
  store.renderSettingsInto(host.value);
});
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/')">‹ 返回</button>
      <h2 class="page-title">设置</h2>
      <span class="header-spacer"></span>
    </div>

    <!-- 旧设置视图渲染容器（图鉴/每日任务/签到/兑换码/偏好设置等） -->
    <div ref="host" class="settings-host"></div>
  </div>
</template>

<style scoped>
.settings-page {
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
.settings-host {
  min-height: 300px;
}
</style>
