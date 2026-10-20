import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, 'config', 'bannedWords.json');

/** 读取屏蔽词列表（每次调用都读文件，改文件即时生效，无需重启） */
function load() {
  try {
    const raw = readFileSync(FILE, 'utf-8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.trim()) : [];
  } catch (e) {
    return [];
  }
}

/** 文本是否包含屏蔽词（大小写不敏感；列表为空则放行） */
export function containsBanned(text) {
  if (typeof text !== 'string') return false;
  const words = load();
  if (!words.length) return false;
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(String(w).toLowerCase()));
}
