<script setup>
defineProps({
  title: { type: String, default: '建设中' },
});
</script>

<template>
  <div class="placeholder-view">
    <h2>{{ title }}</h2>
    <p class="placeholder-hint">该模块正在迁移到 Vue3 中，敬请期待。</p>
  </div>
</template>

<style scoped>
.placeholder-view {
  text-align: center;
  padding: 60px 20px;
  color: #8fa3c8;
}
.placeholder-hint {
  margin-top: 12px;
  font-size: 14px;
  color: rgba(143, 163, 200, 0.7);
}
</style>
