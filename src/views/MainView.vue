<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="main-view">
    <div class="hero">
      <h1>星河之契</h1>
      <p class="subtitle">在星海深处，缔结你的契约与传说</p>
      <div class="actions">
        <button class="ybrpg-btn" @click="router.push('/save')">读取 / 新建存档</button>
        <button class="ybrpg-btn" @click="router.push('/dungeon')">开始冒险</button>
        <button class="ybrpg-btn" @click="router.push('/shop')">进入商店</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero {
  text-align: center;
}
.hero h1 {
  font-size: 34px;
  color: #ffd700;
  letter-spacing: 6px;
  margin-bottom: 8px;
}
.subtitle {
  color: #8fa3c8;
  margin-bottom: 28px;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
