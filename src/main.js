import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
// 迁移期间暂用原全局样式（src/style.css），后续逐步拆分为组件样式
import './style.css';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');

// 启动时恢复登录态（有 token 则校验并拉取用户信息）
useAuthStore(pinia).bootstrap();
