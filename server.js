/**
 * 星河之契 - 纯 Node.js 静态服务器（零依赖，仅使用内置模块）
 *
 * 启动方式：
 *   node server.js          （手动启动，自动用 Chrome 打开）
 *   npm run dev / npm start （等价）
 *   start.bat               （双击启动，自动开 Chrome）
 * 关闭：stop.bat 或 Ctrl+C
 * 端口可用环境变量覆盖：PORT=8080 node server.js
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

  // 1) 优先 public 目录（模拟 Vite：public 内容映射到站点根路径，如 /image/... -> public/image/...）
  const pubPath = safeJoin(PUBLIC_DIR, reqPath);
  if (pubPath && (await existsFile(pubPath))) return pubPath;

  // 2) 项目根目录（如 /src/main.js、/index.html）
  const rootPath = safeJoin(ROOT, reqPath);
  if (rootPath && (await existsFile(rootPath))) return rootPath;

  // 3) 仅当请求「无扩展名」（看起来像前端路由）时，才兜底回退到 index.html；
  //    带扩展名的缺失资源（.js/.png 等）直接返回 null -> 404，避免把 HTML 当模块/图片解析
  const lastSeg = reqPath.split('/').pop();
  if (!lastSeg.includes('.')) {
    const fallback = safeJoin(ROOT, '/index.html');
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

server.listen(PORT, HOST, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`[星河之契] 服务器已启动: ${url}`);
  openBrowser(url);
});
