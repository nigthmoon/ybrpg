import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // 相对路径，产物可部署到任意静态托管（GitHub Pages 子路径 / 服务器子目录均可）
  base: './',
  publicDir: 'public',
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist',
    // 单页应用：任意前端路由回退到 index.html
  },
});
