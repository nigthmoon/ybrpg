import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../authMiddleware.js';

const router = Router();
router.use(authRequired); // 以下接口全部需要登录

const SLOTS = [0, 1, 2, 3, 4];

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

// GET /api/saves —— 当前用户全部存档
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT slot, data, updated_at FROM saves WHERE user_id = ? ORDER BY slot').all(req.user.id);
  return res.json({
    saves: rows.map(r => ({ slot: r.slot, exists: true, data: safeParse(r.data), updated_at: r.updated_at })),
  });
});

// GET /api/saves/:slot —— 读取某槽位
router.get('/:slot', (req, res) => {
  const slot = Number(req.params.slot);
  if (!SLOTS.includes(slot)) return res.status(400).json({ error: 'BAD_SLOT', message: '无效存档槽位' });
  const row = db.prepare('SELECT data, updated_at FROM saves WHERE user_id = ? AND slot = ?').get(req.user.id, slot);
  if (!row) return res.json({ slot, exists: false, data: null, updated_at: null });
  return res.json({ slot, exists: true, data: safeParse(row.data), updated_at: row.updated_at });
});

// PUT /api/saves/:slot  { data } —— 保存/覆盖某槽位
router.put('/:slot', (req, res) => {
  const slot = Number(req.params.slot);
  if (!SLOTS.includes(slot)) return res.status(400).json({ error: 'BAD_SLOT', message: '无效存档槽位' });
  const data = req.body?.data;
  if (data == null) return res.status(400).json({ error: 'NO_DATA', message: '缺少存档数据' });
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  db.prepare(`
    INSERT INTO saves (user_id, slot, data, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, slot) DO UPDATE SET data = excluded.data, updated_at = datetime('now')
  `).run(req.user.id, slot, json);
  return res.json({ ok: true, slot });
});

// DELETE /api/saves/:slot —— 删除某槽位
router.delete('/:slot', (req, res) => {
  const slot = Number(req.params.slot);
  if (!SLOTS.includes(slot)) return res.status(400).json({ error: 'BAD_SLOT', message: '无效存档槽位' });
  db.prepare('DELETE FROM saves WHERE user_id = ? AND slot = ?').run(req.user.id, slot);
  return res.json({ ok: true, slot });
});

export default router;
