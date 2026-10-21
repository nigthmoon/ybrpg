import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT || 4000);
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change';
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
// SQLite 数据文件路径：
//  - 默认放在项目根 data/app.db（在 server/ 之外，部署时上传 server 目录不会带上本地库）
//  - 服务器生产环境务必用环境变量 DB_PATH 指向服务器专属路径，与本地隔离、避免覆盖
export const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data', 'app.db');

// 在线状态 / 单登录参数
export const SESSION_ONLINE_WINDOW_SEC = 120;  // 2 分钟无心跳判定离线（释放登录名额）
export const SESSION_IDLE_KICK_SEC = 1800;     // 30 分钟无存档同步判定挂机并踢下线
