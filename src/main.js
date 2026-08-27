import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
// 迁移期间暂用原全局样式（src/style.css），后续逐步拆分为组件样式
import './style.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
