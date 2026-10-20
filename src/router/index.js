import { createRouter, createWebHashHistory } from 'vue-router';

// 使用 hash 路由：静态托管无需服务器 rewrite 配置，直接可用
// 游戏内视图（队伍/背包/副本/商店/战斗/设置/存档）由宿主层管理，不走路由
const routes = [
  { path: '/', name: 'main', component: () => import('../views/MainView.vue') },
  { path: '/save', name: 'save', component: () => import('../views/SaveView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/account', name: 'account', component: () => import('../views/AccountView.vue') },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 已登录则跳过登录/注册页；游客模式不强校验，可进入其它页面本地游玩
router.beforeEach((to) => {
  const token = localStorage.getItem('ybrpg_token');
  if (token && (to.name === 'login' || to.name === 'register')) {
    return { name: 'main' };
  }
});

export default router;
