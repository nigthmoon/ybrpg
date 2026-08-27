<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { GAME_VERSION } from './version';

const route = useRoute();

const navs = [
  { name: 'main', label: '主界面', path: '/' },
  { name: 'save', label: '存档', path: '/save' },
  { name: 'team', label: '队伍', path: '/team' },
  { name: 'bag', label: '背包', path: '/bag' },
  { name: 'dungeon', label: '副本', path: '/dungeon' },
  { name: 'shop', label: '商店', path: '/shop' },
  { name: 'gallery', label: '图鉴', path: '/gallery' },
  { name: 'settings', label: '设置', path: '/settings' },
];

const activeNav = computed(() => route.name);
</script>

<template>
  <div class="app-shell">
    <div class="app-header">
      <span class="app-title">星河之契</span>
      <span class="app-version">{{ GAME_VERSION }}</span>
    </div>

    <main class="app-main">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <button
        v-for="nav in navs"
        :key="nav.name"
        class="nav-btn"
        :class="{ active: activeNav === nav.name }"
        @click="$router.push(nav.path)"
      >
        {{ nav.label }}
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(135deg, #1a2a4a, #0d1b33);
  color: #ffd700;
  border-bottom: 1px solid rgba(255, 215, 0, 0.25);
}
.app-title {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
}
.app-version {
  font-size: 12px;
  color: rgba(255, 215, 0, 0.7);
}
.app-main {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}
.bottom-nav {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  background: rgba(13, 27, 51, 0.95);
  border-top: 1px solid rgba(255, 215, 0, 0.25);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
}
.nav-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #8fa3c8;
  font-size: 14px;
  padding: 8px 0;
  cursor: pointer;
}
.nav-btn.active {
  color: #ffd700;
  font-weight: bold;
}
</style>
