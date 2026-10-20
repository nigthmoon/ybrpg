import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT || 4000);
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change';
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
// SQLite 数据文件存放目录（默认 server/data/app.db，可用环境变量覆盖）
export const DB_PATH = process.env.DB_PATH || join(__dirname, 'data', 'app.db');

// 在线状态 / 单登录参数
export const SESSION_ONLINE_WINDOW_SEC = 120;  // 2 分钟无心跳判定离线（释放登录名额）
export const SESSION_IDLE_KICK_SEC = 1800;     // 30 分钟无存档同步判定挂机并踢下线
