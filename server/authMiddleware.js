import jwt from 'jsonwebtoken';
import db from './db.js';
import { JWT_SECRET } from './config.js';

/**
 * 必须登录：校验 Bearer token + 会话有效（单登录）。
 *  - token 无 jti 或会话不存在/已吊销 → 401（被异地顶号 / 已主动登出）
 *  - 不再有“挂机踢 / 关网页踢”：会话仅在“其他设备登录顶号”或主动登出时失效。
 *    原设备下次请求（心跳/存档/me）会拿到 401，前端提示“账号已异地登录，请重新登录”。
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
  const s = db.prepare('SELECT id FROM sessions WHERE jti = ? AND revoked_at IS NULL').get(payload.jti);
  if (!s) {
    return res.status(401).json({ error: 'SESSION_REVOKED', message: '你的账号已在其他设备登录，请重新登录' });
  }
  req.user = { id: payload.sub, username: payload.username, jti: payload.jti };
  next();
}
