import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

/** 必须登录：校验 Authorization: Bearer <token>，通过后挂 req.user */
export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'NO_TOKEN', message: '未登录' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: '登录已过期，请重新登录' });
  }
}
