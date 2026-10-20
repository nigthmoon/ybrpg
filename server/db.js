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
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login    TEXT
);

CREATE TABLE IF NOT EXISTS saves (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  slot       INTEGER NOT NULL,          -- 0 = 自动存档；1-4 = 手动存档
  data       TEXT NOT NULL,             -- 游戏存档 JSON 文本
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, slot),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saves_user ON saves(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  jti        TEXT NOT NULL UNIQUE,
  device     TEXT,
  last_seen  TEXT NOT NULL DEFAULT (datetime('now')),
  last_save  TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
-- 每个用户同时只允许一个未吊销会话（防 Race 顶号）
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_active ON sessions(user_id) WHERE revoked_at IS NULL;
`);

// 兼容旧库：为已存在的 users 表补充新列（已存在则忽略错误）
try { db.exec('ALTER TABLE users ADD COLUMN nickname TEXT'); } catch (e) { /* 列已存在，忽略 */ }
try { db.exec('ALTER TABLE users ADD COLUMN avatar TEXT'); } catch (e) { /* 列已存在，忽略 */ }

export default db;
