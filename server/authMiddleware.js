import jwt from 'jsonwebtoken';
import db from './db.js';
import { JWT_SECRET, SESSION_IDLE_KICK_SEC } from './config.js';

/**
 * 必须登录：校验 Bearer token + 会话有效（单登录）。
 *  - token 无 jti 或会话不存在/已吊销 → 401（被顶号/已登出）
 *  - 超过 SESSION_IDLE_KICK_SEC 无存档同步 → 判定挂机，吊销并 401
 */
export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'NO_TOKEN', message: '未登录' });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: '登录已过期，请重新登录' });
  }
  if (!payload.jti) {
    return res.status(401).json({ error: 'SESSION_REVOKED', message: '登录状态已失效，请重新登录' });
  }
  const s = db.prepare('SELECT id, last_save FROM sessions WHERE jti = ? AND revoked_at IS NULL').get(payload.jti);
  if (!s) {
    return res.status(401).json({ error: 'SESSION_REVOKED', message: '你已被踢下线（其他设备登录或长时间挂机）' });
  }
  // 挂机踢：超过 SESSION_IDLE_KICK_SEC 未产生存档同步则吊销
  const idle = db.prepare("SELECT id FROM sessions WHERE id = ? AND last_save < datetime('now', ?)").get(s.id, `-${SESSION_IDLE_KICK_SEC} seconds`);
  if (idle) {
    db.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE id = ?").run(s.id);
    return res.status(401).json({ error: 'SESSION_IDLE', message: '长时间未产生存档，已自动退出，请重新登录' });
  }
  req.user = { id: payload.sub, username: payload.username, jti: payload.jti };
  next();
}
