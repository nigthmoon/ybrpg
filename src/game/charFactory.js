/**
 * 武将实例工厂（charFactory.js）
 * ------------------------------------------------------------
 * 分层思想：公共基座（buildBase）+ 可插拔的“版本/体系构建器”(builders)。
 *  - 不同版本/体系的武將用不同 builder 生成实例；
 *  - 读档绝不重建实例（原样加载），因此旧版本实例保持旧结构 = 版本限定武将；
 *  - 当前 v1 / v2 的唯一差别就是“接引数组”(fodder_*)：
 *      v1 旧版不加（历史产物，默认不再主动生成）；
 *      v2 当前版加 buildFodderArrays（接引数组本身即“新版本/可接引”的标识）。
 *  将来新版本/体系：registerBuilder('v3'|'体系X', fn) 追加专属字段即可，旧实例不受影响。
 */
import { characterList } from './data/characterList';
import { compileCharacterStats, mergeNoOverwrite, buildFodderArrays } from './team';

// 版本/体系构建器注册表
const builders = {
  v1: () => { /* 旧版本结构：不加接引数组（历史产物，默认不再主动生成；需要时用 { builder:'v1' }） */ },
  v2: (inst, base) => { Object.assign(inst, buildFodderArrays(base.rank || 'junk')); }, // 当前版：生成接引空数组
};

/** 注册新的版本/体系构建器 */
export function registerBuilder(key, fn) { builders[key] = fn; }

/**
 * 生成一个武将实例并写入 charBagData，返回实例 id（失败返回 null）。
 * @param {string} id 角色 id（characterList 键）
 * @param {Object} opts { builder='v2', addToHandbook=false }
 */
export function createCharacter(id, opts = {}) {
  const base = characterList[id];
  if (!base) { if (window.Game && Game.toast) Game.toast('角色数据错误', 'error'); return null; }
  const builder = opts.builder || 'v2';
  const stats = compileCharacterStats(base);
  const instId = Game.genId(id);
  // ---- 公共基座（所有版本共享）----
  const inst = {
    charId: id,
    level: 1,
    hp: stats.hp, atk: stats.atk, def: stats.def, spe: stats.spe,
    currentHp: stats.hp, maxHp: stats.hp,
    openSpskill: false,
  };
  mergeNoOverwrite(inst, base);
  // ---- 版本/体系构建器 ----
  const fn = builders[builder];
  if (fn) fn(inst, base);
  window.charBagData[instId] = inst;
  if (opts.addToHandbook && typeof Game.Data.addToHandbook === 'function') Game.Data.addToHandbook(id);
  return instId;
}
