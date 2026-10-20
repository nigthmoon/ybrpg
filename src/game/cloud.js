/**
 * 云存档同步适配层（cloud.js）
 * ------------------------------------------------------------
 * 设计原则：不改动 SaveManager 内部，只在 store 层外包一层。
 *  - 本地 localStorage 仍是权威缓存；云端按用户隔离保存同一份 JSON。
 *  - 手动槽 slot(1-4) 对应 key：ybrpg_save_<slot>
 *  - 自动档 slot 0 对应两个 key：ybrpg_save_0（精简）+ ybrpg_autosave（完整）
 * 上传/下载都以 { key: 原始JSON字符串 } 的形式打包，保证两端字节一致。
 */
import { api } from '../api/client';

const KEY_BASE = 'ybrpg_save';
const AUTO_KEY = 'ybrpg_autosave';

/** 某槽位对应的 localStorage key 列表 */
export function keysForSlot(slot) {
  if (Number(slot) === 0) return [`${KEY_BASE}_0`, AUTO_KEY];
  return [`${KEY_BASE}_${slot}`];
}

/** 打包本地某槽为 { key: rawJson }；该槽无本地数据时返回空对象 */
export function packLocal(slot) {
  const out = {};
  for (const k of keysForSlot(slot)) {
    const raw = localStorage.getItem(k);
    if (raw != null) out[k] = raw;
  }
  return out;
}

/** 本地是否已存在某槽数据 */
export function hasLocal(slot) {
  return Object.keys(packLocal(slot)).length > 0;
}

/** 将云端 data 解包写回本地；返回是否有写入 */
export function unpackToLocal(slot, data) {
  if (!data || typeof data !== 'object') return false;
  let wrote = false;
  for (const k of keysForSlot(slot)) {
    if (typeof data[k] === 'string') {
      localStorage.setItem(k, data[k]);
      wrote = true;
    }
  }
  return wrote;
}

/** 上传本地某槽到云端 */
export async function uploadSlot(slot) {
  const packed = packLocal(slot);
  if (Object.keys(packed).length === 0) return false;
  await api.putSave(slot, packed);
  return true;
}

/**
 * 从云端下载某槽到本地。
 * 默认本地已有则不覆盖（force=true 时强制以云端为准）。
 */
export async function downloadSlot(slot, { force = false } = {}) {
  if (!force && hasLocal(slot)) return false;
  const r = await api.getSave(slot);
  if (!r || !r.exists || !r.data) return false;
  return unpackToLocal(slot, r.data);
}

/** 删除云端某槽 */
export async function deleteCloudSlot(slot) {
  await api.deleteSave(slot);
}
