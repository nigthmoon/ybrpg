import { createRouter, createWebHashHistory } from 'vue-router';

// 使用 hash 路由：静态托管无需服务器 rewrite 配置，直接可用
// 游戏内视图（队伍/背包/副本/商店/战斗/设置/存档）由宿主层管理，不走路由
const routes = [
  { path: '/', name: 'main', component: () => import('../views/MainView.vue') },
  { path: '/save', name: 'save', component: () => import('../views/SaveView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
