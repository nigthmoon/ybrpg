import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authRequired } from '../authMiddleware.js';
import { containsBanned } from '../bannedWords.js';
import { JWT_SECRET, JWT_EXPIRES, SESSION_ONLINE_WINDOW_SEC } from '../config.js';
import { randomUUID } from 'node:crypto';

const router = Router();

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

function parseAvatar(raw) {
  if (!raw) return null;
  try {
    const a = JSON.parse(raw);
    if (a && (a.type === 'char' || a.type === 'treasure') && a.id && a.name) {
      return { type: a.type, id: String(a.id), name: String(a.name) };
    }
  } catch (e) { /* ignore */ }
  return null;
}

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    nickname: u.nickname || null,
    avatar: parseAvatar(u.avatar),
    created_at: u.created_at,
    last_login: u.last_login,
  };
}

function issueToken(u) {
	return jwt.sign({ sub: u.id, username: u.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
// 单登录：建会话并签发带 jti 的 token（先顶掉该用户旧的未吊销会话）
function startSession(userId, username, req) {
	db.prepare("UPDATE sessions SET revoked_at = datetime('now', '+8 hours') WHERE user_id = ? AND revoked_at IS NULL").run(userId);
	const jti = randomUUID();
	const device = (req && req.headers && req.headers['user-agent']) ? String(req.headers['user-agent']).slice(0, 200) : null;
	db.prepare("INSERT INTO sessions (user_id, jti, device, last_seen, last_save) VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))").run(userId, jti, device);
	return jwt.sign({ sub: userId, username, jti }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
// 该用户是否有“在线”会话（最近 SESSION_ONLINE_WINDOW_SEC 秒内有过心跳）
function hasOnlineSession(userId) {
	const row = db.prepare("SELECT id FROM sessions WHERE user_id = ? AND revoked_at IS NULL AND last_seen > datetime('now', '+8 hours', ?)").get(userId, `-${SESSION_ONLINE_WINDOW_SEC} seconds`);
	return !!row;
}

// POST /api/auth/register  { username, password }
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'BAD_USERNAME', message: '用户名需 3-20 位字母/数字/下划线' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'BAD_PASSWORD', message: '密码至少 6 位' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    return res.status(409).json({ error: 'USERNAME_TAKEN', message: '用户名已被注册' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, datetime('now', '+8 hours'))").run(username, hash);
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid));
  const token = startSession(u.id, u.username, req);
  return res.json({ token, user: publicUser(u) });
});

// POST /api/auth/login  { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '参数不完整' });
  }
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: '用户名或密码错误' });
  }
  db.prepare("UPDATE users SET last_login = datetime('now', '+8 hours') WHERE id = ?").run(u.id);
  // 单登录（顶号）：直接走 startSession，它会吊销该账号所有旧会话；旧设备下次请求即失效并提示异地登录
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id);
  const token = startSession(fresh.id, fresh.username, req);
  return res.json({ token, user: publicUser(fresh) });
});

// PUT /api/auth/nickname  { nickname } —— 设置昵称（自由填写，1-20 字，预留屏蔽词校验）
router.put('/nickname', authRequired, (req, res) => {
  const { nickname } = req.body || {};
  if (typeof nickname !== 'string' || !nickname.trim() || nickname.length > 20) {
    return res.status(400).json({ error: 'BAD_NICKNAME', message: '昵称需 1-20 个字符' });
  }
  if (containsBanned(nickname)) {
    return res.status(400).json({ error: 'BANNED_WORD', message: '昵称包含不允许的词汇' });
  }
  db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname.trim(), req.user.id);
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!u) return res.status(401).json({ error: 'NO_USER', message: '账号不存在' });
  return res.json({ user: publicUser(u) });
});

// PUT /api/auth/avatar  { avatar: { type:'char'|'treasure', id, name } } —— 设置头像
router.put('/avatar', authRequired, (req, res) => {
  const { avatar } = req.body || {};
  const a = parseAvatar(avatar && typeof avatar === 'object' ? JSON.stringify(avatar) : avatar);
  if (!a) {
    return res.status(400).json({ error: 'BAD_AVATAR', message: '头像参数不合法' });
  }
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(JSON.stringify(a), req.user.id);
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!u) return res.status(401).json({ error: 'NO_USER', message: '账号不存在' });
  return res.json({ user: publicUser(u) });
});

// PUT /api/auth/password  { oldPassword, newPassword } —— 修改密码
router.put('/password', authRequired, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'BAD_PASSWORD', message: '新密码至少 6 位' });
  }
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!u) return res.status(401).json({ error: 'NO_USER', message: '账号不存在' });
  if (!bcrypt.compareSync(oldPassword, u.password_hash)) {
    return res.status(401).json({ error: 'WRONG_PASSWORD', message: '原密码错误' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, u.id);
  return res.json({ ok: true });
});

// POST /api/auth/delete-account  { password } —— 注销账号（级联删除其存档）
router.post('/delete-account', authRequired, (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '参数不完整' });
  }
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!u) return res.status(401).json({ error: 'NO_USER', message: '账号不存在' });
  if (!bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).json({ error: 'WRONG_PASSWORD', message: '密码错误' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(u.id); // saves 表级联删除
  return res.json({ ok: true });
});

export { parseAvatar, publicUser };

export default router;
