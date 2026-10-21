/**
 * 云存档同步适配层（cloud.js）
 * ------------------------------------------------------------
 * 本地 localStorage 为权威缓存；云端按用户隔离保存同一份 JSON。
 * 防重复 + 跨设备实时同步：
 *  - 每个存档带唯一标识 sid（存于存档 JSON 内，保存时保留既有 sid）
 *  - 内容指纹 fp（排除 saveTime，避免同进度因保存时间不同而重复上传）
 *  - 上传记录存本地（按身份命名空间）；从云端拉取时用云端 sid/fp 校准本地记录
 *  - 上传规则：同 sid 同 fp 跳过；同 sid 不同 fp 覆盖上传（实时同步）；
 *              首次/旧档（无记录）仅云端为空才上传（防旧本地档覆盖已有云端档）
 */
import { api } from '../api/client';
import { getSaveNamespace } from './saveNs';

/** 生成存档唯一标识 */
export function genSid() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 某槽位对应的 localStorage key 列表（带身份命名空间前缀，与 SaveManager 同源） */
export function keysForSlot(slot) {
  const ns = getSaveNamespace();
  if (Number(slot) === 0) return [`${ns}:ybrpg_save_0`, `${ns}:ybrpg_autosave`];
  return [`${ns}:ybrpg_save_${slot}`];
}

/** 某槽位“完整存档”的 key（sid / 指纹以此为准） */
function compatKeyForSlot(slot) {
  const ns = getSaveNamespace();
  if (Number(slot) === 0) return `${ns}:ybrpg_autosave`;
  return `${ns}:ybrpg_save_${slot}`;
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

// ---- 内容指纹 / 唯一标识 ----
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
/** 存档内容指纹（排除 saveTime，避免同进度因保存时间不同而重复上传） */
function fpOf(raw) {
  try {
    const o = JSON.parse(raw);
    const copy = Object.assign({}, o);
    delete copy.saveTime;
    return hashStr(JSON.stringify(copy));
  } catch (e) {
    return hashStr(String(raw));
  }
}
function getSid(raw) {
  try { const o = JSON.parse(raw); return (o && o.sid) ? String(o.sid) : null; }
  catch (e) { return null; }
}
/** 确保本地该槽完整档带有 sid（旧档无标识时补一个并写回） */
function ensureSaveSid(slot) {
  const key = compatKeyForSlot(slot);
  const raw = localStorage.getItem(key);
  if (raw == null) return;
  try {
    const o = JSON.parse(raw);
    if (o && typeof o === 'object' && !o.sid) {
      o.sid = genSid();
      localStorage.setItem(key, JSON.stringify(o));
    }
  } catch (e) { /* ignore */ }
}

// ---- 上传记录（按身份命名空间，本地）----
function recKey() { return getSaveNamespace() + ':ybrpg_uploaded'; }
function getUploadRec(slot) {
  try { const all = JSON.parse(localStorage.getItem(recKey()) || '{}'); return all[String(slot)] || null; }
  catch (e) { return null; }
}
function setUploadRec(slot, rec) {
  try {
    const all = JSON.parse(localStorage.getItem(recKey()) || '{}');
    all[String(slot)] = rec;
    localStorage.setItem(recKey(), JSON.stringify(all));
  } catch (e) { /* ignore */ }
}
function clearUploadRec(slot) {
  try {
    const all = JSON.parse(localStorage.getItem(recKey()) || '{}');
    delete all[String(slot)];
    localStorage.setItem(recKey(), JSON.stringify(all));
  } catch (e) { /* ignore */ }
}

/** 上传本地某槽到云端（防重复 + 实时同步 + 旧档仅空云端首次上传） */
export async function uploadSlot(slot) {
  if (Object.keys(packLocal(slot)).length === 0) return false;
  ensureSaveSid(slot); // 旧档无 sid 先补
  const packed = packLocal(slot);
  const raw = packed[compatKeyForSlot(slot)];
  if (!raw) return false;
  const sid = getSid(raw);
  if (!sid) return false;
  const fp = fpOf(raw);
  const rec = getUploadRec(slot);
  if (rec && rec.sid === sid) {
    if (rec.fp === fp) return false;   // 同内容已传，跳过（防重复）
    await api.putSave(slot, packed);    // 内容更新，覆盖上传（实时同步）
    setUploadRec(slot, { sid, fp });
    return true;
  }
  // 首次上传 / 旧本地档：仅云端为空才上传（防旧档覆盖已有云端档）
  const cloud = await api.getSave(slot);
  if (cloud && cloud.exists) return false;
  await api.putSave(slot, packed);
  setUploadRec(slot, { sid, fp });
  return true;
}

/**
 * 从云端下载某槽到本地。默认本地已有则不覆盖（force=true 时以云端为准）。
 * 拉取成功后，用云端档的 sid/fp 校准本地“上传记录”，
 * 以便跨设备时后续保存能正确识别为“同 sid 内容更新”而覆盖同步。
 */
export async function downloadSlot(slot, { force = false } = {}) {
  if (!force && hasLocal(slot)) return false;
  const r = await api.getSave(slot);
  if (!r || !r.exists || !r.data) return false;
  const wrote = unpackToLocal(slot, r.data);
  if (wrote) {
    const raw = r.data[compatKeyForSlot(slot)];
    const sid = raw ? getSid(raw) : null;
    if (sid) setUploadRec(slot, { sid, fp: fpOf(raw) });
  }
  return wrote;
}

/** 删除云端某槽，并清除本地上传记录（删后重存按首次处理） */
export async function deleteCloudSlot(slot) {
  await api.deleteSave(slot);
  clearUploadRec(slot);
}
