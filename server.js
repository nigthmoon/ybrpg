/**
 * 星河之契 - 纯 Node.js 静态服务器（零依赖，仅使用内置模块）
 *
 * 用途：托管「已构建」的游戏（npm run build 生成的 dist 目录），双击即玩、无需 Vite。
 * 启动方式：
 *   node server.js           （自动用 Chrome 打开 http://localhost:3000）
 *   npm start / npm run serve（等价）
 *   start.bat                （开发模式：npm run dev 启动 Vite，带热更新）
 * 关闭：stop.bat 或 Ctrl+C
 * 端口可用环境变量覆盖：PORT=8080 node server.js
 *
 * 注意：本服务器只提供静态文件，不会编译 .vue。若 dist 不存在，会回退到项目根目录，
 *       但根目录的源码（/src/main.js、*.vue）无法被浏览器直接运行——请先 `npm run build`。
 */
import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');
// 优先使用构建产物 dist；未构建时回退到项目根（仅适合已被其它方式编译的场景）
const WEB_ROOT = existsSync(DIST_DIR) ? DIST_DIR : ROOT;
const USING_DIST = WEB_ROOT === DIST_DIR;
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function safeJoin(base, target) {
  const p = path.normalize(path.join(base, target));
  // 防止目录穿越：解析后的路径必须仍在 base 之内
  if (p !== base && !p.startsWith(base + path.sep)) return null;
  return p;
}

async function existsFile(p) {
  try {
    const s = await stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function resolveFile(urlPath) {
  let reqPath = decodeURIComponent(urlPath.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // 1) 优先以 WEB_ROOT（dist 或项目根）解析
  const webPath = safeJoin(WEB_ROOT, reqPath);
  if (webPath && (await existsFile(webPath))) return webPath;

  // 2) 开发模式兼容：public 目录内容映射到站点根（如 /image/... -> public/image/...）
  if (!USING_DIST) {
    const pubPath = safeJoin(PUBLIC_DIR, reqPath);
    if (pubPath && (await existsFile(pubPath))) return pubPath;
  }

  // 3) 仅当请求「无扩展名」（看起来像前端路由）时，才兜底回退到 index.html；
  //    带扩展名的缺失资源（.js/.png 等）直接返回 null -> 404，避免把 HTML 当模块/图片解析
  const lastSeg = reqPath.split('/').pop();
  if (!lastSeg.includes('.')) {
    const fallback = safeJoin(WEB_ROOT, '/index.html');
    if (fallback && (await existsFile(fallback))) return fallback;
  }

  return null;
}

// 优先用 Chrome 打开，找不到则退回系统默认浏览器
function openBrowser(url) {
  const run = (cmd) => {
    try {
      exec(cmd);
      return true;
    } catch {
      return false;
    }
  };
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA &&
        path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ].filter(Boolean);
    for (const p of candidates) {
      if (existsSync(p)) return run(`"${p}" ${url}`);
    }
    return run(`cmd /c start ${url}`); // 退回默认浏览器
  }
  if (process.platform === 'darwin') return run(`open ${url}`);
  return run(`xdg-open ${url}`);
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = await resolveFile(req.url);
    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[server] 处理请求出错:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[星河之契] 端口 ${PORT} 已被占用！请先运行 stop.bat 关闭旧服务，或改用 PORT=8080 node server.js`);
  } else {
    console.error('[星河之契] 服务器启动失败:', err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`[星河之契] 服务器已启动: ${url}`);
  console.log(`[星河之契] 服务模式: ${USING_DIST ? '生产构建(dist)' : '项目根(未构建, 建议先 npm run build)'}`);
  openBrowser(url);
});
