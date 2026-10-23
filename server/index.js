import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import db from './db.js';
import authRouter, { parseAvatar } from './routes/auth.js';
import savesRouter from './routes/saves.js';
import sessionRouter from './routes/session.js';
import { authRequired } from './authMiddleware.js';
import { PORT } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 后端版本号（取自 package.json，供前端检测更新）
let APP_VERSION = '0.0.0';
try { APP_VERSION = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version || APP_VERSION; } catch (e) { /* ignore */ }

const app = express();
app.use(express.json({ limit: '10mb' }));

// ---- API ----
app.get('/api/health', (_req, res) => res.json({ ok: true, version: APP_VERSION }));
app.use('/api/auth', authRouter);
// 当前用户信息（查库，注销后能正确返回 401）
app.get('/api/me', authRequired, (req, res) => {
  const u = db.prepare('SELECT id, username, nickname, avatar, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
  if (!u) return res.status(401).json({ error: 'NO_USER', message: '账号不存在或已注销' });
  res.json({ user: { id: u.id, username: u.username, nickname: u.nickname || null, avatar: parseAvatar(u.avatar), created_at: u.created_at, last_login: u.last_login } });
});
app.use('/api/saves', savesRouter);
app.use('/api/session', sessionRouter);

// ---- 静态托管构建产物（生产部署用；开发期 dist 可能不存在，跳过） ----
const distDir = join(__dirname, '..', 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA 兜底：非 /api 的未知路径都回 index.html（hash 路由其实不太需要，这里双保险）
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(join(distDir, 'index.html'));
  });
}

// 启动即清理历史会话：时区基准统一为 UTC+8 后，重启前建立的旧会话其 last_save/last_seen 是旧时区值，
// 会被新的“挂机踢/在线判断”误判成超时/离线而导致莫名掉线；启动时统一吊销，客户端重新登录即可
// （新会话使用 +8 基准，之后不再误踢）。副作用：每次重启后需重新登录一次。
try { db.prepare("UPDATE sessions SET revoked_at = datetime('now', '+8 hours') WHERE revoked_at IS NULL").run(); } catch (e) { /* ignore */ }

app.listen(PORT, () => {
  console.log(`[api] ybrpg backend listening on http://localhost:${PORT}`);
});
