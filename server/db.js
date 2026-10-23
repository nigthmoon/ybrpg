// 使用 Node 内置 node:sqlite（零原生依赖，Node >= 22.5；仅实验性警告，不影响使用）
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DB_PATH } from './config.js';

// 确保数据目录存在
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nickname      TEXT,                        -- 自定义昵称（自由填写）
  avatar        TEXT,                        -- 头像 { type:'char'|'treasure', id, name } 的 JSON
  created_at    TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
  last_login    TEXT
);

CREATE TABLE IF NOT EXISTS saves (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  slot       INTEGER NOT NULL,          -- 0 = 自动存档；1-4 = 手动存档
  data       TEXT NOT NULL,             -- 游戏存档 JSON 文本
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
  UNIQUE(user_id, slot),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saves_user ON saves(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  jti        TEXT NOT NULL UNIQUE,
  device     TEXT,
  last_seen  TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
  last_save  TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
-- 每个用户同时只允许一个未吊销会话（防 Race 顶号）
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_active ON sessions(user_id) WHERE revoked_at IS NULL;
`);

// 兼容旧库：为已存在的 users 表补充新列（已存在则忽略错误）
try { db.exec('ALTER TABLE users ADD COLUMN nickname TEXT'); } catch (e) { /* 列已存在，忽略 */ }
try { db.exec('ALTER TABLE users ADD COLUMN avatar TEXT'); } catch (e) { /* 列已存在，忽略 */ }

// ===== 一次性时区迁移（旧库 UTC → 北京时间 +8）=====
// 背景：早期版本时间列用 datetime('now')（UTC，且旧库建表 DEFAULT 仍是旧式，改 db.js 的 DEFAULT 对已存在的表无效）。
// 检测 users 表建表语句：若仍是旧式 datetime('now')（无 +8 hours），说明是旧库，首次启动时
// 把所有时间列整体 +8 小时；仅执行一次（meta 标记）。新库（建表即 +8）不会触发。
try {
	const tbl = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
	const schemaSql = (tbl && tbl.sql) || '';
	const isOldSchema = /datetime\('now'\)/.test(schemaSql); // 旧式 DEFAULT（无 +8 修饰）
	let done = false;
	try {
		const m = db.prepare("SELECT value FROM meta WHERE key='tz_migrated'").get();
		done = !!(m && m.value === '1');
	} catch (e) { /* meta 表未建 */ }
	if (isOldSchema && !done) {
		db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);');
		const shiftCols = (table, cols) => {
			for (const c of cols) {
				try { db.prepare(`UPDATE ${table} SET ${c} = datetime(${c}, '+8 hours') WHERE ${c} IS NOT NULL`).run(); } catch (e) { /* 列可能不存在，忽略 */ }
			}
		};
		shiftCols('users', ['created_at', 'last_login']);
		shiftCols('saves', ['updated_at']);
		shiftCols('sessions', ['last_seen', 'last_save', 'created_at', 'revoked_at']);
		db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('tz_migrated', '1')").run();
		console.log('[tz] 旧库时间列已一次性 +8 小时（UTC → 北京时间）');
	}
} catch (e) { /* ignore */ }

export default db;
