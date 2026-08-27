import { createRouter, createWebHashHistory } from 'vue-router';

// 使用 hash 路由：静态托管无需服务器 rewrite 配置，直接可用
const placeholder = (title) => ({
  component: () => import('../views/PlaceholderView.vue'),
  props: { title },
});

const routes = [
  { path: '/', name: 'main', component: () => import('../views/MainView.vue') },
  { path: '/save', name: 'save', ...placeholder('存档') },
  { path: '/team', name: 'team', ...placeholder('队伍') },
  { path: '/bag', name: 'bag', ...placeholder('背包') },
  { path: '/dungeon', name: 'dungeon', ...placeholder('副本') },
  { path: '/shop', name: 'shop', ...placeholder('商店') },
  { path: '/battle', name: 'battle', ...placeholder('战斗') },
  { path: '/gallery', name: 'gallery', ...placeholder('图鉴') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
