import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 构建时间戳：每次构建唯一，用于检测线上版本是否已更新
const BUILD_TIME = Date.now();
let PKG_VERSION = '0.0.0';
try {
  PKG_VERSION = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')).version || PKG_VERSION;
} catch (e) {
  /* ignore */
}

// 构建产物写出 version.json（含构建时间戳），供前端轮询比对
function writeVersionJson() {
  try {
    fs.writeFileSync(
      path.resolve(__dirname, 'dist', 'version.json'),
      JSON.stringify({ version: PKG_VERSION, buildTime: BUILD_TIME }, null, 2)
    );
  } catch (e) {
    /* dist 目录可能尚未创建，忽略 */
  }
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'emit-version-json',
      apply: 'build',
      closeBundle() {
        writeVersionJson();
      },
    },
  ],
  // 相对路径，产物可部署到任意静态托管（GitHub Pages 子路径 / 服务器子目录均可）
  base: './',
  publicDir: 'public',
  define: {
    // 把构建时间戳注入前端：运行时与 version.json 比对，不一致即提示重启
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  server: {
    host: true,
    port: 3000,
    strictPort: false, // 端口被占用时自动顺延(3001...)，避免启动即退出
    open: false, // 关闭内置打开；由 start.bat 统一用谷歌浏览器打开
    // 开发期把 /api 代理到本地后端（生产期后端同源托管，无需代理）
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // 本机 IDE 对批量删除有安全拦截，构建时跳过 outDir 清空（同名文件覆盖写）
    emptyOutDir: false,
    // 单页应用：任意前端路由回退到 index.html
  },
});
