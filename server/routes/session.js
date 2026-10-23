import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../authMiddleware.js';

const router = Router();
router.use(authRequired);

// 心跳：刷新 last_seen；saved=true 时同时刷新 last_save（挂机踢依据）
router.post('/ping', (req, res) => {
  const saved = req.body && req.body.saved ? 1 : 0;
  db.prepare("UPDATE sessions SET last_seen = datetime('now', '+8 hours'), last_save = CASE WHEN ? = 1 THEN datetime('now', '+8 hours') ELSE last_save END WHERE jti = ? AND revoked_at IS NULL")
    .run(saved, req.user.jti);
  res.json({ ok: true });
});

// 主动登出：立即吊销当前会话（不用等离线窗口）
router.post('/logout', (req, res) => {
  db.prepare("UPDATE sessions SET revoked_at = datetime('now', '+8 hours') WHERE jti = ? AND revoked_at IS NULL").run(req.user.jti);
  res.json({ ok: true });
});

export default router;
