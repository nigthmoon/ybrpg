// ====== 星河之契 - 重构战斗核心系统 (事件驱动版) ======

import { shared } from '../shared.js';
import { contentList } from '../contentList.js';
import { characterList, characterTemplate } from '../characterList.js';
import { BREAKTHROUGH_BUFF_LIBRARY } from '../charBreakthroughConfig.js';
import { confirmDialog } from '../ui/utils.js';
import { Stat } from '../game/system.js';

class Battle {}


// TODO: window.autoBattle / window.currentTeam / window.charBagData 等可变状态
// 在 mode.js 改造完成后迁移到 src/store.js 共享模块

// ====== 1. 全局状态声明 ======

/**@type {battleState}战斗信息 */
let battleState = null;
/** ====== 目标选择 ====== */
let targetSelection = null;
/**全局锁，防止重入 */
let isProcessing = false; // 全局锁，防止重入

// ====== 事件系统 ======
const BattleEvents = {
	// 事件类型
	BEFORE_DAMAGE: 'beforeDamage',
	AFTER_DAMAGE: 'afterDamage',
	BEFORE_HEAL: 'beforeHeal',
	AFTER_HEAL: 'afterHeal',
	BEFORE_TURN: 'beforeTurn',
	AFTER_TURN: 'afterTurn',
	BEFORE_ROUND: 'beforeRound',
	AFTER_ROUND: 'afterRound',
	BEFORE_ACTION: 'beforeAction',
	AFTER_ACTION: 'afterAction',
	// ===== 【新增】事件类型 =====
	AFTER_SKILL_EXEC: 'afterSkillExecution',  // 技能指令结算后
	AFTER_PUGONG_EXEC: 'afterPugongExecution', // 普攻指令结算后
	AFTER_DAMAGE_TAKEN: 'afterDamageTaken',    // 受到伤害后（指令结算后）
	ALL_MISS: 'allMiss',                       // 全部闪避

	// 监听器存储
	_listeners: {},

	// 注册监听器
	on(eventType, listener) {
		if (!this._listeners[eventType]) this._listeners[eventType] = [];
		this._listeners[eventType].push(listener);
	},

	// 移除监听器
	off(eventType, listener) {
		if (!this._listeners[eventType]) return;
		const index = this._listeners[eventType].indexOf(listener);
		if (index >= 0) this._listeners[eventType].splice(index, 1);
	},

	// 触发事件（同步，可修改数据）
	emit(eventType, data) {
		const listeners = this._listeners[eventType];
		if (!listeners || listeners.length === 0) return data;
		// 逐个调用监听器，传递数据
		let result = data;
		for (const listener of listeners) {
			// 监听器可以修改result对象
			const ret = listener(result);
			if (ret !== undefined) result = ret;
		}
		return result;
	},

	// 触发异步事件（不支持修改数据，仅通知）
	emitAsync(eventType, data, callback) {
		const listeners = this._listeners[eventType];
		if (!listeners || listeners.length === 0) {
			if (callback) callback();
			return;
		}
		let index = 0;
		const next = () => {
			if (index >= listeners.length) {
				if (callback) callback();
				return;
			}
			const listener = listeners[index++];
			listener(data, next);
		};
		next();
	}
};

// 事件对象通过 core.js 的 Game.Battle.events 暴露，不再挂全局 window

// ====== 2. 基础工具函数 ======

/**
 * 
 * @param {*} msg 战斗信息记录 
 * @returns 战斗信息记录 
 */
Battle.log = function addBattleLog(msg) {
	if (!battleState) return;
	battleState.log.push(msg);
	const logEl = document.getElementById('battle-log');
	if (logEl) {
		const line = document.createElement('div');
		line.className = 'battle-log-line';
		line.textContent = msg;
		logEl.appendChild(line);
		logEl.scrollTop = logEl.scrollHeight;
	}
	console.log('[Battle]', msg);
}

/**
 * 同步单位的状态图标层：每个状态对应一个独立 DOM 节点，避免图标互相覆盖
 * （原先所有状态共用 ::after 伪元素，多状态时后者会覆盖前者，例如眩晕被封印的锁头覆盖）
 */
function syncStatusIcons(slot, unit) {
	const layer = slot.querySelector('.status-icon-layer');
	if (!layer) return;
	const defs = [
		{ cls: 'status-stunned', on: !!unit.stunned, emoji: '💫' },
		{ cls: 'status-sealed', on: !!(unit.sealed || unit.permanentlySealed), emoji: '🔒' },
		{ cls: 'status-paralyzed', on: !!unit.paralyzed, emoji: '⚡' },
		{ cls: 'status-heal-blocked', on: !!unit.healBlocked, emoji: '🚫' },
		{ cls: 'status-poisoned', on: unit.poisonDamage > 0, emoji: '🤢' },
	];
	defs.forEach(d => {
		let el = layer.querySelector('.' + d.cls);
		if (d.on && !el) {
			el = document.createElement('span');
			el.className = 'status-icon ' + d.cls;
			el.textContent = d.emoji;
			layer.appendChild(el);
		} else if (!d.on && el) {
			el.remove();
		}
	});
}

/**
 * 
 * @returns 战斗画面更新
 */
Battle.updateUI = function updateBattleUI() {
	const bs = battleState;
	if (!bs) return;

	const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u);
	allUnits.forEach(unit => {
		const slot = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
		if (!slot) return;

		if (!unit.alive) {
			slot.classList.add('dead');
			// 死人不应显示任何 buff 视觉效果
			slot.classList.remove('sealed', 'stunned', 'paralyzed', 'heal-blocked-effect', 'poisoned');
			const _sl = slot.querySelector('.status-icon-layer');
			if (_sl) _sl.innerHTML = '';
		} else {
			slot.classList.remove('dead');

			if (unit.sealed || unit.permanentlySealed) slot.classList.add('sealed');
			else slot.classList.remove('sealed');

			if (unit.stunned) slot.classList.add('stunned');
			else slot.classList.remove('stunned');

			if (unit.paralyzed) slot.classList.add('paralyzed');
			else slot.classList.remove('paralyzed');

			if (unit.healBlocked) slot.classList.add('heal-blocked-effect');
			else slot.classList.remove('heal-blocked-effect');

			if (unit.poisonDamage > 0) slot.classList.add('poisoned');
			else slot.classList.remove('poisoned');

			syncStatusIcons(slot, unit);
		}

		if (bs.currentTurnSide === unit.side && bs.currentTurnIndex === unit.slotIndex && unit.alive) {
			slot.classList.add('active-turn');
		} else {
			slot.classList.remove('active-turn');
		}

		const hpFill = slot.querySelector('.battle-hp-fill');
		if (hpFill) {
			const pct = Math.max(0, unit.hp / unit.maxHp * 100);
			hpFill.style.width = pct + '%';
			if (pct > 60) hpFill.style.background = '#44cc44';
			else if (pct > 30) hpFill.style.background = '#ccaa22';
			else hpFill.style.background = '#cc3333';
		}

		const hpText = slot.querySelector('.battle-hp-text');
		if (hpText) hpText.textContent = `${unit.hp}/${unit.maxHp}`;

		const pips = slot.querySelectorAll('.energy-pip');
		pips.forEach((pip, i) => {
			pip.classList.toggle('filled', i < unit.energy);
			pip.classList.toggle('skill-ready', i < 4 && unit.energy >= 4);
		});
	});
}

/**
 * 
 * @param {*} unit 目标
 * @param {*} value 数值
 * @param {object} type 类型
 * @returns 显示伤害数字
 */
Battle.showDamageNumber = function showDamageNumber(unit, value, type) {
	const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
	if (!slotEl) return;
	const float = document.createElement('div');
	float.className = 'damage-float ' + (type.isHeal ? 'heal' : 'damage');

	if (type.isHeal) {
		float.style.color = '#00ff00';
		float.textContent = '+' + value;
	} else if (type.isShanbi) {
		float.style.color = '#28e3ce';
		float.textContent = '闪避';
	} else if (type.isCrit) {
		float.style.color = '#ffdd00'; // 暴击偏黄色
		float.textContent = '暴击 ' + value;
	} else if (type.isBlock) {
		float.style.color = '#4488ff'; // 格挡偏蓝色
		float.textContent = '格挡 ' + value;
	} else {
		float.style.color = '#ff0000';
		float.textContent = value;
	}
	if (type.isPoison) {
		float.style.color = '#ff00ff';
		float.textContent = '中毒 ' + value;
	}
	if (type.isTrue) {
		float.style.color = '#fff';
	}

	// ===== 【新增】统一添加1px黑色描边 =====
	float.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000';

	float.style.position = 'absolute';
	float.style.left = '50%';
	float.style.top = '50%';
	float.style.transform = 'translate(-50%, -50%)';
	float.style.fontSize = '20px';
	float.style.fontWeight = 'bold';
	float.style.zIndex = '100';
	slotEl.appendChild(float);
	setTimeout(() => float.remove(), 800);
}




/**
 * 暂时不清晰，疑似是进入某角色回合或者游戏结算时调用，最终会清除高亮
 */
Battle.hidePlayerActionUI = function hidePlayerActionUI() {
	const panel = document.getElementById('battle-action-panel');
	if (panel) panel.remove();
	clearTargetHighlights();
}

/**
 * 清除高亮
 */
Battle.clearTargetHighlights = function clearTargetHighlights() {
	document.querySelectorAll('.battle-unit.selectable').forEach(el => {
		el.classList.remove('selectable', 'target-selected');
		el.onclick = null;
	});
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 判断该阵营的存活角色数
 */
Battle.getAliveUnits = function getAliveUnits(side) {
	const units = side === 'player' ? battleState.playerUnits : battleState.enemyUnits;
	return units.filter(u => u && u.alive);
}

// ===== 【调试】暴露当前战斗状态，供控制台查看阵容 =====
Battle.getBattleState = function getBattleState() {
	return battleState;
}

// ===== 【调试】在控制台排版输出双方阵容关键数据 =====
Battle.dumpLineup = function dumpLineup() {
	const bs = battleState;
	if (!bs) {
		console.log('当前没有进行中的战斗（battleState 为空）。');
		return;
	}
	const fmt = (u) => {
		if (!u || !u.name) return '　(空)';
		const tags = [];
		if (!u.alive) tags.push('阵亡');
		if (u.sealed) tags.push('封印');
		if (u.stunned) tags.push('眩晕');
		if (u.paralyzed) tags.push('麻痹');
		const skillId = (u.skills && u.skills[1]) || '-';
		const sp = u.skills && u.skills[1] && String(u.skills[1]).startsWith('spskill_') ? '必杀' : '技能';
		return [
			`#${u.slotIndex} ${u.name}`,
			`[${u.rank}]`,
			`HP ${u.hp}/${u.maxHp}`,
			`ATK ${u.atk}`,
			`DEF ${u.def}`,
			`SPD ${u.spe}`,
			`能量 ${u.energy}`,
			`突破${u.tupolevel || 0}`,
			`${sp}:${skillId}`,
			`暴击${u.baoji} 抗暴${u.kangbao} 命中${u.mingzhong} 闪避${u.shanbi} 格挡${u.gedang} 破击${u.poji}`,
			`增伤${u.pctDealUp || 0} 减伤${u.pctTakeDn || 0} 治疗${u.pctHeal || 0}`,
			tags.length ? `状态:${tags.join(',')}` : ''
		].filter(Boolean).join(' | ');
	};
	console.log('===== 我方阵容 =====');
	(bs.playerUnits || []).forEach(u => console.log(fmt(u)));
	console.log('===== 敌方阵容 =====');
	(bs.enemyUnits || []).forEach(u => console.log(fmt(u)));
	console.log('===== 当前回合 =====', `第${bs.round}轮`, `先手:${bs.firstSide}`, `阶段:${bs.phase || '-'}`);
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 判断该阵营是否全灭
 */
Battle.isSideDefeated = function isSideDefeated(side) {
	return getAliveUnits(side).length === 0;
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 检索该阵营的首个可未行动角色
 */
Battle.findNextActor = function findNextActor(side) {
	const bs = battleState;
	const units = side === 'player' ? bs.playerUnits : bs.enemyUnits;
	for (let i = 0; i < 6; i++) {
		if (bs.actedSlots[side].has(i)) continue;
		const unit = units[i];
		if (unit && unit.alive) return unit;
	}
	return null;
}

/**
 * 生成等待记录的已行动的角色对象
 */
Battle.resetActedSlots = function resetActedSlots() {
	const bs = battleState;
	bs.actedSlots = { player: new Set(), enemy: new Set() };
}

/**
 * 
 * @param {array} array 填入角色组成的数组
 * @returns 随机重新排序（其他随机选目标会直接调用其前随机数值个角色未目标）
 */
Battle.shuffleArray = function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// ====== 3. 核心结算模块 (事件化) ======

/**
 * 
 * @param {*} attacker 攻击者
 * @param {*} defender 被攻击者
 * @param {*} coefficient 攻击系数
 * @param {*} extraEnergy 因额外消耗能量导致的技能增伤
 * @returns 计算最终伤害值
 */
// 计算无视防御比例：读取攻击方 buff 数组中的 ignore_def_* 字符串 id
// attackType: 'pugong' | 'skill'（spskill 也按 'skill' 处理）
function getIgnoreDefPercent(unit, attackType) {
	const buffs = unit.buff || [];
	let pct = 0;
	buffs.forEach(id => {
		if (id === 'ignore_def_all_100') pct = Math.min(1, pct + 1);
		else if (id === 'ignore_def_all_60') pct = Math.min(1, pct + 0.6);
		else if (id === 'ignore_def_all_30') pct = Math.min(1, pct + 0.3);
		else if (attackType === 'pugong') {
			if (id === 'ignore_def_pugong_100') pct = Math.min(1, pct + 1);
			else if (id === 'ignore_def_pugong_80') pct = Math.min(1, pct + 0.8);
			else if (id === 'ignore_def_pugong_50') pct = Math.min(1, pct + 0.5);
		} else if (attackType === 'skill') {
			if (id === 'ignore_def_skill_100') pct = Math.min(1, pct + 1);
			else if (id === 'ignore_def_skill_80') pct = Math.min(1, pct + 0.8);
			else if (id === 'ignore_def_skill_50') pct = Math.min(1, pct + 0.5);
		}
	});
	return pct;
}

Battle.calculateDamage = function calculateDamage(attacker, defender, coefficient, extraEnergy = 0, attackType = 'skill') {
	let atk = Number(attacker.atk) || 0;
	// ===== 【新增】攻击力百分比 buff（atkPctBonus，来自 atk 类 buff）=====
	atk = Math.floor(atk * (1 + (Number(attacker.atkPctBonus) || 0)));
	const def = Number(defender.def) || 0;
	// 无视防御：根据攻击类型读取攻击方 buff 中的 ignore_def_* id，按比例削减防御
	const ignoreDefPercent = getIgnoreDefPercent(attacker, attackType);
	const effectiveDef = Math.floor(def * (1 - ignoreDefPercent));
	const coeff = Number(coefficient) || 1.0;

	let baseDmg = Math.floor(atk * coeff);
	if (extraEnergy > 0) {
		baseDmg = Math.floor(baseDmg * (1 + extraEnergy * 0.1));
	}

	// ===== 第一步：命中/闪避判定 =====
	const hitRate = Math.max(0, ((attacker.mingzhong ?? 10000) - (defender.shanbi ?? 0))) / 10000;
	const isMiss = Math.random() > hitRate;

	if (isMiss) {
		addBattleLog(`${attacker.name} 攻击 ${defender.name}，但被闪避了！`);
		showDamageNumber(defender, 0, { isShanbi: true });

		// ===== 【新增】闪避触发 onDodge 效果 =====
		const dodgeEffects = getEffectsByTrigger(defender, 'onDodge');
		dodgeEffects.forEach(effect => {
			if (effect.filter && effect.filter.call(defender, attacker)) {
				effect.content.call(defender, attacker);
			}
		});

		return { damage: 0, isMiss: true };  // 修改返回值
	}

	// ===== 第二步：暴击/抗暴判定 =====
	const critRate = Math.max(0, ((attacker.baoji ?? 0) - (defender.kangbao ?? 0))) / 10000;
	let isCrit = Math.random() < critRate;

	// ===== 【硬逻辑】免暴 / 必定格挡 buff：用标记强制，而非数值堆叠 =====
	// 暴击/抗暴可无限培养，数值堆叠（如 +10000）无法保证 100% 生效，故在此做硬判定。
	//   no_crit    ：强制 isCrit=false（无法被暴击）
	//   must_block ：强制 isBlock=true（必定格挡，伤害减半并触发格挡反击）
	const _defBuffs = defender.buffList || [];
	const _hasNoCrit = _defBuffs.some(b => b.type === 'no_crit');
	const _hasMustBlock = _defBuffs.some(b => b.type === 'must_block');
	if (_hasNoCrit || _hasMustBlock) isCrit = false;

	let finalDmg = baseDmg;
	let isBlock = false;

	if (isCrit) {
		// 暴击成功：伤害 = 基础伤害 × (攻击方暴伤 + 15000 - 被攻击方守护) / 10000
		const critMultiplier = Math.max(0, (Number(attacker.baoshang ?? 0) + 15000 - Number(defender.shouhu ?? 0))) / 10000;
		finalDmg = Math.floor(baseDmg * critMultiplier);
	} else {
		// ===== 第三步：格挡判定（仅当不暴击时） =====
		const blockRate = Math.max(0, ((defender.gedang ?? 0) - (attacker.poji ?? 0))) / 10000;
		isBlock = Math.random() < blockRate;

		// ===== 【硬逻辑】必定格挡 buff：直接强制格挡成功（无视格挡率数值） =====
		if (_hasMustBlock) isBlock = true;

		if (isBlock) {
			// 格挡成功：伤害减半
			finalDmg = Math.floor(baseDmg * 0.5);
		}
	}

	// ===== 第四步：防御减免（格挡时也减半防御，已应用无视防御） =====
	if (isBlock) {
		finalDmg = Math.max(1, Math.floor(finalDmg - Math.floor(effectiveDef * 0.5)));
	} else {
		finalDmg = Math.max(1, Math.floor(finalDmg - effectiveDef));
	}

	// ===== 第五步：普通增减伤（pctDealUp / pctTakeDn）分步结算 =====
	// 普通增减伤以「比值」形式加算后，统一乘以 (1 + 增伤 - 减伤)，独立结算一步。
	const normalPctDmg = (attacker.pctDealUp ?? 0) - (defender.pctTakeDn ?? 0);
	if (normalPctDmg !== 0) {
		finalDmg = Math.floor(finalDmg * (1 + normalPctDmg));
	}

	// ===== 第六步：条件性增减伤（onDamageCalc / onDamageTaken）分步结算 =====
	// 与普通增减伤分开，单独作为一个结算步骤。
	// content 不返回值，而是对传入的可变参数对象赋值来传出比值：
	//   effect.content.call(this, defender/attacker, currentDmg, mod)
	//   - 攻击方条件增伤（onDamageCalc）：mod.pct += 0.5 表示增伤 50%
	//   - 防守方条件减伤（onDamageTaken）：mod.pct += 0.2 表示减伤 20%（内部作为减项）
	// 多个效果对同一 mod.pct 累加，最后统一乘一次 (1 + 条件增伤 - 条件减伤)。
	let condBuffPct = 0;
	let condDebuffPct = 0;

	// 攻击方条件增伤
	// mod.attackType 传出本次攻击类型（'pugong' | 'skill'），供「仅技能增伤」等效果判断
	const atkMod = { pct: 0, attackType };
	const atkModifyEffects = getEffectsByTrigger(attacker, 'onDamageCalc');
	atkModifyEffects.forEach(effect => {
		if (effect.filter && effect.filter.call(attacker, defender, finalDmg)) {
			effect.content.call(attacker, defender, finalDmg, atkMod);
		}
	});
	condBuffPct += atkMod.pct;

	// buff 类条件增伤：造成伤害增减统一在此结算（与 onDamageCalc 的 skill_effect 同管道）
	//   dealUp（造成增加）：正值，condBuffPct += value
	//   dealDn（造成减少）：负值，condBuffPct -= value
	(attacker.buffList || []).forEach(b => {
		if (b.type === 'dealUp' && b.value) condBuffPct += b.value;
		else if (b.type === 'dealDn' && b.value) condBuffPct -= b.value;
	});

	// 防守方条件减伤
	const defMod = { pct: 0, attackType };
	const defModifyEffects = getEffectsByTrigger(defender, 'onDamageTaken');
		defModifyEffects.forEach(effect => {
		if (effect.filter && effect.filter.call(defender, attacker, finalDmg)) {
			effect.content.call(defender, attacker, finalDmg, defMod);
		}
	});
	// buff 类条件减伤：受伤增减统一在此结算（与 onDamageTaken 的 skill_effect 同管道）
	//   takeDn（减伤）：正值，condDebuffPct += value
	//   takeUp（受伤增加）：负值，condDebuffPct -= value
	(defender.buffList || []).forEach(b => {
		if (b.type === 'takeDn' && b.value) condDebuffPct += b.value;
		else if (b.type === 'takeUp' && b.value) condDebuffPct -= b.value;
	});
	condDebuffPct += defMod.pct;

	const condPctDmg = condBuffPct - condDebuffPct;
	if (condPctDmg !== 0) {
		finalDmg = Math.floor(finalDmg * (1 + condPctDmg));
	}

	// 固定加减伤（保持原顺序：比值结算之后再加固定值）
	const totalFixedDmg = (attacker.fixedDealUp ?? 0) - (defender.fixedTakeDn ?? 0);
	finalDmg += totalFixedDmg;

	finalDmg = Math.max(1, Math.floor(finalDmg));

	// ===== 日志输出 =====
	if (isCrit) {
		addBattleLog(`${attacker.name} 暴击 ${defender.name}，造成 ${finalDmg} 点伤害！`);
	} else if (isBlock) {
		addBattleLog(`${attacker.name} 攻击 ${defender.name}，${defender.name} 格挡，受到 ${finalDmg} 点伤害`);
	} else {
		addBattleLog(`${attacker.name} 攻击 ${defender.name}，造成 ${finalDmg} 点伤害`);
	}

	// ===== 记录战斗信息用于后续效果 =====
	attacker._lastHitIsCrit = isCrit;
	defender._lastHitIsBlock = isBlock;
	defender._lastDamage = finalDmg;

	return { damage: finalDmg, isCrit, isBlock };
}




/**
 * 
 * @param {*} target 受伤角色
 * @param {*} dmg 伤害值
 * @param {*} attacker 伤害来源
 * @param {*} callback 后续触发的事件
 * @param {*} skillContext 技能上下文（新增）
 * @returns 结算伤害事件
 */
Battle.applyDamage = function applyDamage(target, dmgResult, attacker, callback, skillContext = {}) {
	if (!target || !target.alive) {
		if (callback) callback();
		return;
	}

	// 解构伤害结果
	let dmg, isCrit, isBlock;
	let isMiss = false;
	if (typeof dmgResult === 'object') {
		dmg = dmgResult.damage;
		isCrit = dmgResult.isCrit || false;
		isBlock = dmgResult.isBlock || false;
		isMiss = dmgResult.isMiss || false;
	} else {
		dmg = dmgResult;
		isCrit = false;
		isBlock = false;
	}

	// ===== 【新增】闪避时触发 onDodge =====
	if (isMiss) {
		const dodgeEffects = getEffectsByTrigger(target, 'onDodge');
		dodgeEffects.forEach(effect => {
			if (effect.filter && effect.filter.call(target, attacker)) {
				effect.content.call(target, attacker);
			}
		});
		if (callback) callback();
		return;
	}

	let finalDmg = dmg;

	// ======== 执行目标的受击效果（onHitSelf） ========
	const defendEffects = getEffectsByTrigger(target, 'onHitSelf');
	defendEffects.forEach(effect => {
		if (effect.filter && effect.filter.call(target, attacker, finalDmg)) {
			const result = effect.content.call(target, attacker, finalDmg);
			if (typeof result === 'number') {
				finalDmg = result;
			}
		}
	});

	// ======== 【新增】格挡反击：触发 onBlock 效果 ========
	// 仅当本次伤害被格挡、且不是由「特殊攻击」（格挡反击自身）造成时触发，避免嵌套无限反击。
	// content 中通过 Game.Battle.applyDamage(..., { isSpecial: true }) 发起特殊攻击。
	if (isBlock && !skillContext.isSpecial) {
		const blockEffects = getEffectsByTrigger(target, 'onBlock');
		blockEffects.forEach(effect => {
			if (effect.filter && effect.filter.call(target, attacker)) {
				effect.content.call(target, attacker);
			}
		});
	}

	// 触发 beforeDamage 事件
	const damageEvent = BattleEvents.emit(BattleEvents.BEFORE_DAMAGE, {
		target,
		attacker,
		baseDamage: dmg,
		finalDamage: finalDmg,
		skill: skillContext.skillData || null,
		type: 'damage'
	});
	finalDmg = damageEvent.finalDamage;

	target.hp -= finalDmg;
	addBattleLog(`${target.name} 受到 ${finalDmg} 点伤害`);
	showDamageNumber(target, finalDmg, { isCrit: isCrit, isBlock: isBlock });
	updateBattleUI();

	// ======== 执行攻击者的命中效果 ========
	const trigger = skillContext.trigger || 'pugongHit';
	const attackEffects = getEffectsByTrigger(attacker, trigger);
	attackEffects.forEach(effect => {
		if (effect.filter && effect.filter.call(attacker, target)) {
			effect.content.call(attacker, target);
		}
	});

	// 触发 afterDamage 事件
	BattleEvents.emitAsync(BattleEvents.AFTER_DAMAGE, {
		target,
		attacker,
		damage: finalDmg,
		killed: target.hp <= 0,
		isCrit,
		isBlock
	}, () => {
		if (target.hp <= 0) {
			target.hp = 0;
			target.alive = false;
			clearBuffsOnDeath(target);
			addBattleLog(`${target.name} 阵亡！`);

			triggerSelfEffect(target, 'dieSelf', attacker);
			triggerGlobalEffect('dieGlobal', target, attacker);

			if (attacker && attacker.alive) {
				triggerSelfEffect(attacker, 'onKill', target);
				attacker.energy = Math.min(8, attacker.energy + 1);
				// ===== 【移除以移除】 =====
				// 击杀能量回复改由 onKill 效果控制
			}

			updateBattleUI();
			setTimeout(() => {
				if (callback) callback();
			}, 500);
		}
		else {
			// ===== 【移除】target.energy = Math.min(8, target.energy + 1); =====
			updateBattleUI();
			if (callback) callback();
		}
	});
}





/**
 * 
 * @param {*} target 被治疗者
 * @param {*} healAmount 治疗数值
 * @param {*} callback 治疗后续事件
 * @returns 结算治疗事件
 */
Battle.applyHeal = function applyHeal(target, healAmount, callback, source) {
	if (!target || !target.alive) {
		if (callback) callback();
		return;
	}

	if (target.healBlocked) {
		addBattleLog(`${target.name} 处于禁疗状态，无法被治疗`);
		if (callback) callback();
		return;
	}

	// ===== 【新增】治疗者自身的固定/百分比治疗加成 =====
	// 注意：applyHeal 不直接知道治疗者是谁，需要从调用方传递
	// 这里假设 healAmount 已经是算上了治疗者加成的数值
	// 被治疗者的加成在这里应用

	// 触发 beforeHeal 事件，允许修改治疗量
	const healEvent = BattleEvents.emit(BattleEvents.BEFORE_HEAL, {
		target,
		baseHeal: healAmount,
		finalHeal: healAmount,
		type: 'heal'
	});
	let finalHeal = healEvent.finalHeal;

	// ===== 【新增】被治疗者自身的加成 =====
	// 固定被治疗量增加
	finalHeal += (target.fixedBeHeal ?? 0);
	// 百分比被治疗量增加
	finalHeal = Math.floor(finalHeal * (1 + (target.pctBeHeal ?? 0)));
	// ===== 【新增】治疗者自身的治疗效果加成（pctHeal，来自 self_stat_percent 编译）=====
	if (source && source.pctHeal) {
		finalHeal = Math.floor(finalHeal * (1 + source.pctHeal));
	}

	const maxHp = Number(target.maxHp) || 1;
	const currentHp = Number(target.hp) || 0;

	if (finalHeal > 0) {
		target.hp += Math.min(finalHeal, maxHp - currentHp);
		addBattleLog(`${target.name} 恢复了 ${finalHeal} 点生命值`);
		showDamageNumber(target, finalHeal, { isHeal: true });
		updateBattleUI();
	}

	// 触发 afterHeal 事件
	BattleEvents.emitAsync(BattleEvents.AFTER_HEAL, {
		target,
		heal: finalHeal
	}, () => {
		if (callback) callback();
	});
}


// ====== 4. 行动执行模块 ======

/**
 * 
 * @param {*} actor 执行者
 * @param {*} targets 目标
 * @param {*} callback 后续
 * @returns 执行普攻事件
 */
Battle.executePugong = function executePugong(actor, targets, callback) {
	if (!targets || targets.length === 0) {
		if (callback) callback();
		return;
	}

	// 记录本次行动类型，供突破效果（如「使用技能后获得buff」）的 filter 判断
	actor._lastActionType = 'pugong';

	updateBattleUI();
	addBattleLog(`${actor.name} 发动普攻`);

	let index = 0;
	let hitCount = 0;      // 命中次数
	let missCount = 0;     // 闪避次数
	const skillId = actor.skills[0] || 'attack1';
	const sData = (contentList && contentList.pugong && contentList.pugong[skillId]);
	const isRecover = (sData && sData.isRecover === true);
	const coeff = (sData && sData.coefficient) ? Number(sData.coefficient) : 1.0;
	const totalTargets = targets.filter(t => t && t.alive).length;

	function processNextTarget() {
		if (index >= targets.length) {
			// ===== 普攻指令结算完毕 =====
			// 触发 AFTER_PUGONG_EXEC 事件，传入命中次数和闪避次数
		BattleEvents.emit(BattleEvents.AFTER_PUGONG_EXEC, {
			actor: actor,
			targets: targets,
			skillData: sData,
			hitCount: hitCount,
			missCount: missCount,
			totalTargets: totalTargets
		});

		// ===== 【新增】普攻结束时机：供「每次普攻后…」类效果（如吴爽突破）=====
		if (actor && actor.alive) {
			triggerSelfEffect(actor, 'pugongEnd', { hitCount, missCount });
		}

		// 普攻命中至少1个目标才回复能量
			if (hitCount > 0) {
				actor.energy = Math.min(8, actor.energy + 1);
				addBattleLog(`${actor.name} 普攻命中，恢复 1 能量`);
			} else {
				console.log(`${actor.name} 普攻全部被闪避，未恢复能量`);
			}
			updateBattleUI();

			if (callback) callback();
			return;
		}

		const target = targets[index++];
		if (!target || !target.alive) {
			processNextTarget();
			return;
		}

		function onHitComplete() {
			processNextTarget();
		}

		if (isRecover) {
			let healAmt = Math.floor(actor.atk * coeff);
			applyHeal(target, healAmt, () => {
				hitCount++;  // 治疗也算命中
				onHitComplete();
			}, actor);
		} else {
			const dmgResult = calculateDamage(actor, target, coeff, 0, 'pugong');

			if (dmgResult.isMiss) {
				missCount++;  // 记录闪避
			} else {
				hitCount++;   // 记录命中
			}

			applyDamage(target, dmgResult, actor, onHitComplete, {
				skillData: sData,
				trigger: 'pugongHit',
				skillId: skillId,
				isPugong: true
			});
		}
	}

	processNextTarget();
}



/**
 * 
 * @param {*} actor 执行者
 * @param {*} skillType 技能类型（常规技能或者必杀）
 * @param {*} skillId 技能id
 * @param {*} targets 目标集体
 * @param {*} energyCost 能量消耗
 * @param {*} callback 技能后续
 * @returns 执行技能事件
 */
Battle.executeSkill = function executeSkill(actor, skillType, skillId, targets, energyCost, callback) {
	if (!targets || targets.length === 0) {
		if (callback) callback();
		return;
	}

	// 记录本次行动类型（'skill' | 'spskill'），供突破效果（如「使用技能后获得buff」）的 filter 判断
	actor._lastActionType = skillType;

	actor.energy = Math.max(0, actor.energy - energyCost);
	updateBattleUI();

	const sData = (contentList && contentList[skillType] && contentList[skillType][skillId]);
	const skillName = sData ? sData.name : skillId;
	addBattleLog(`${actor.name} 使用了【${skillName}】`);

	const coeff = (sData && sData.coefficient) ? Number(sData.coefficient) : 1.0;
	const isRecover = (sData && sData.isRecover === true);
	const extraEnergy = Math.max(0, energyCost - 4);

	const triggerMap = { 'pugong': 'pugongHit', 'skill': 'skillHit', 'spskill': 'spskillHit' };
	const trigger = triggerMap[skillType] || 'onHit';

	let index = 0;
	let hitCount = 0;      // 命中次数
	let missCount = 0;     // 闪避次数
	let hadCrit = false;   // 本次技能是否出现过暴击
	const totalTargets = targets.filter(t => t && t.alive).length;

	function processNextTarget() {
		if (index >= targets.length) {
			// ===== 技能指令结算完毕 =====
			// 触发 AFTER_SKILL_EXEC 事件，传入命中次数和闪避次数
			BattleEvents.emit(BattleEvents.AFTER_SKILL_EXEC, {
				actor: actor,
				targets: targets,
				skillData: sData,
				skillType: skillType,
				skillId: skillId,
				hitCount: hitCount,
				missCount: missCount,
				totalTargets: totalTargets
			});

			// ===== 怒攻（spskill）结束时点：传出本次是否出现暴击 =====
			// ===== 技能（含必杀）结束时点：传出本次是否出现暴击 =====
			// 注：原"怒攻"在本文语境即等同于"技能（含必杀）"，故对 skill 与 spskill 均触发。
			// content/filter 收到 { hadCrit }，供「技能（含必杀）后若出现过暴击回复能量/回血」等效果使用
			if ((skillType === 'skill' || skillType === 'spskill') && actor && actor.alive) {
				triggerSelfEffect(actor, 'skillEnd', { hadCrit: hadCrit });
			}

			// 技能不再回复能量（无论是否命中）
			// 仅保留日志用于调试
			if (hitCount === 0 && missCount > 0) {
				addBattleLog(`${actor.name} 的技能全部被闪避`);
			}
			updateBattleUI();

			if (callback) callback();
			return;
		}

		const target = targets[index++];
		if (!target || !target.alive) {
			processNextTarget();
			return;
		}

		function onHitComplete() {
			processNextTarget();
		}

		if (isRecover) {
			let healAmt = Math.floor(actor.atk * coeff);
			if (extraEnergy > 0) {
				healAmt = Math.floor(healAmt * (1 + extraEnergy * 0.1));
			}
			applyHeal(target, healAmt, () => {
				hitCount++;  // 治疗也算命中
				onHitComplete();
			}, actor);
			// ===== 【新增】治疗也触发「命中类」突破/技能效果（如「增加目标能量」「提升目标减伤」）=====
			const healHitEffects = getEffectsByTrigger(actor, trigger);
			healHitEffects.forEach(effect => {
				if (effect.filter && effect.filter.call(actor, target)) {
					effect.content.call(actor, target);
				}
			});
		} else {
			const dmgResult = calculateDamage(actor, target, coeff, extraEnergy, 'skill');

			if (dmgResult.isMiss) {
				missCount++;  // 记录闪避
			} else {
				hitCount++;   // 记录命中
				if (dmgResult.isCrit) hadCrit = true; // 本次技能出现过暴击
			}

			applyDamage(target, dmgResult, actor, onHitComplete, {
				skillData: sData,
				trigger: trigger,
				skillId: skillId,
				isSkill: true,
				skillType: skillType
			});
		}
	}

	processNextTarget();
}




// ====== 5. 战斗循环控制 (明晰化) ======

/**
 * 控制游戏进入下一回合
 * @returns 控制游戏进入下一回合
 */
Battle.nextTurn = function nextTurn() {
	if (isProcessing) return;

	try {
		isProcessing = true;
		const bs = battleState;
		if (!bs || bs.phase === 'ended') { isProcessing = false; return; }
		if (isSideDefeated('player')) { endBattle('enemy'); isProcessing = false; return; }
		if (isSideDefeated('enemy')) { endBattle('player'); isProcessing = false; return; }

		const secondSide = bs.firstSide === 'player' ? 'enemy' : 'player';

		// 确定下一个行动方
		let nextSide = null;
		const lastSide = bs.currentTurnSide;

		if (!lastSide) {
			nextSide = bs.firstSide;
		} else {
			const otherSide = lastSide === bs.firstSide ? secondSide : bs.firstSide;
			const otherActor = findNextActor(otherSide);
			if (otherActor) {
				nextSide = otherSide;
			} else {
				nextSide = lastSide;
			}
		}

		let nextActor = findNextActor(nextSide);

		if (!nextActor) {
			if (lastSide && nextSide === lastSide) {
				const otherSide = lastSide === bs.firstSide ? secondSide : bs.firstSide;
				nextActor = findNextActor(otherSide);
				if (nextActor) {
					nextSide = otherSide;
				}
			}
			if (!nextActor) {
				endRound();
				isProcessing = false;
				return;
			}
		}

		// ===== 【新增】在标记已行动前获取当前行动编号 =====
		const currentActorNumberInSide = (bs.actedSlots[nextSide]?.size || 0) + 1;

		const sideLabel = nextSide === 'player' ? '先手' : '后手';
		// 标记该角色已行动
		bs.actedSlots[nextSide].add(nextActor.slotIndex);
		bs.currentTurnSide = nextSide;
		bs.currentTurnIndex = nextActor.slotIndex;
		// 在 nextTurn 中，标记完 actedSlots 后：
	nextActor._currentActionSlotKey = `${sideLabel}${currentActorNumberInSide}`;

	// ===== 每位格「行动世代」计数：每次该位格开始行动时 +1 =====
	// 用途：addBuff 记录 buff 创建于该位格的第几世代；processBuffDecayBySlotKey
	// 仅对「早于当前世代」创建的 buff 衰减，从而使「本次行动内施加的 buff」
	// 在本次行动结束时不衰减（存活到该位格下次行动，即「持续1回合」语义）。
	bs.slotGen = bs.slotGen || {};
	bs.slotGen[nextActor._currentActionSlotKey] = (bs.slotGen[nextActor._currentActionSlotKey] || 0) + 1;

	// ===== buff 衰减已改到「行动后」结算（见 afterAction），此处不再衰减 =====
		// 原因：由某位格施加的 buff 应覆盖该位格本次行动（尤其条件增/减伤），
		// 因此改为在其行动完全结束后才 remainRounds-1，以区分「行动前 / 行动后」。

		// 触发 beforeTurn 事件
		BattleEvents.emit(BattleEvents.BEFORE_TURN, {
			actor: nextActor,
			side: nextSide,
			round: bs.round
		});

		triggerGlobalEffect('actionStartGlobal', nextActor);
		triggerSelfEffect(nextActor, 'actionStartSelf');

		const sideName = nextSide === 'player' ? '我方' : '敌方';
		const turnNumber = currentActorNumberInSide;
		addBattleLog(`${sideName}第${turnNumber}个角色行动：${nextActor.name}`);

		updateBattleUI();

		if (nextActor.stunned) {
			addBattleLog(`${nextActor.name} 眩晕，跳过回合`);
			setTimeout(() => {
				isProcessing = false;
				afterAction();
			}, 600);
			return;
		}

		if (nextActor.paralyzed) {
			addBattleLog(`${nextActor.name} 麻痹，跳过回合`);
			setTimeout(() => {
				isProcessing = false;
				afterAction();
			}, 600);
			return;
		}

		if (nextSide === 'player') {
			bs.phase = 'player_action';
			showPlayerActionUI(nextActor);
		} else {
			bs.phase = 'enemy_action';
			executeAITurn(nextActor);
		}

		isProcessing = false;

	} catch (e) {
		console.error('[Loop] Error in nextTurn:', e);
		isProcessing = false;
	}
}



/**
 * 
 * @returns 回合结束
 */
Battle.afterAction = function afterAction() {
	if (isProcessing) return;

	try {
		isProcessing = true;
		const bs = battleState;
		if (bs.phase === 'ended') { isProcessing = false; return; }

		if (isSideDefeated('player')) { endBattle('enemy'); isProcessing = false; return; }
		if (isSideDefeated('enemy')) { endBattle('player'); isProcessing = false; return; }

		const unit = bs.currentTurnSide === 'player'
			? bs.playerUnits[bs.currentTurnIndex]
			: bs.enemyUnits[bs.currentTurnIndex];

		// ======== 触发自身行动结束效果 ========
		if (unit && unit.alive) {
			triggerSelfEffect(unit, 'actionEndSelf');
		}

		// ===== 【新增】中毒伤害：角色行动结束后触发真实伤害 =====
		if (unit && unit.alive && unit.poisonDamage && unit.poisonDamage > 0) {
			const poisonDmg = unit.poisonDamage;
			unit.hp -= poisonDmg;
			addBattleLog(`${unit.name} 中毒发作，失去 ${poisonDmg} 生命`);
			showDamageNumber(unit, poisonDmg, { isPoison: true });
			if (unit.hp <= 0) {
				unit.hp = 0;
				unit.alive = false;
				clearBuffsOnDeath(unit);
				addBattleLog(`${unit.name} 因中毒阵亡！`);
			}
			updateBattleUI();
		}
		// ==========================================

		// 触发 afterTurn 事件
		BattleEvents.emitAsync(BattleEvents.AFTER_TURN, {
			actor: unit,
			side: bs.currentTurnSide
		}, () => {
			// ======== 触发全局行动结束效果 ========
			if (unit && unit.alive) {
				triggerGlobalEffect('actionEndGlobal', unit);
			}

			// 检查额外回合
			if (unit && unit.alive && (unit.extraTurnCount > 0 || unit.extraTurn)) {
				if (unit.extraTurnCount > 0) unit.extraTurnCount--;
				else unit.extraTurn = false;

				addBattleLog(`${unit.name} 获得额外回合！`);
				updateBattleUI();

				if (unit.side === 'player') {
					bs.phase = 'player_action';
					showPlayerActionUI(unit);
				} else {
					bs.phase = 'enemy_action';
					executeAITurn(unit);
				}
				isProcessing = false;
				return;
			}

			// ===== buff 衰减：在行动位格「行动后」结算 =====
			// 由当前行动位格施加的 buff，在其本次行动（含额外回合）完全结束后才 remainRounds-1，
			// 使条件增/减伤等能覆盖施加者本次行动（区分「行动前 / 行动后」）。
			if (unit && unit._currentActionSlotKey) {
				processBuffDecayBySlotKey(unit._currentActionSlotKey);
			}

			isProcessing = false;
			nextTurn();
		});

	} catch (e) {
		console.error('[Loop] Error in afterAction:', e);
		isProcessing = false;
	}
}



/**
 * 一轮结束进入下一轮
 */
Battle.endRound = function endRound() {
	const bs = battleState;

	// // ===== 【新增】轮次结束前处理中毒伤害 =====
	// const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u && u.alive);
	// allUnits.forEach(unit => {
	// 	if (unit.poisonDamage && unit.poisonDamage > 0) {
	// 		unit.hp -= unit.poisonDamage;
	// 		addBattleLog(`${unit.name} 中毒失去 ${unit.poisonDamage} 生命`);
	// 		showDamageNumber(unit, unit.poisonDamage, { isPoison: true });
	// 		if (unit.hp <= 0) {
	// 			unit.hp = 0;
	// 			unit.alive = false;
	// 			addBattleLog(`${unit.name} 因中毒阵亡！`);
	// 		}
	// 		updateBattleUI();
	// 	}
	// });

	// ===== 【新增】轮次结束时处理 buff 存续 =====
	// processBuffExpiryOnRoundEnd();

	// ===== 【新增】触发轮次结束效果 =====
	triggerGlobalEffect('roundEnd', bs.round);

	// 触发 beforeRound 事件
	BattleEvents.emit(BattleEvents.BEFORE_ROUND, { round: bs.round + 1 });

	bs.round++;
	resetActedSlots();
	bs.currentTurnSide = null;
	bs.currentTurnIndex = 0;

	triggerGlobalEffect('roundStart', bs.round);

	addBattleLog(`—— 第 ${bs.round} 轮 ——`);
	updateBattleUI();

	BattleEvents.emitAsync(BattleEvents.AFTER_ROUND, { round: bs.round }, () => {
		setTimeout(() => {
			nextTurn();
		}, 100);
	});
}



/**
 * 劳模函数
 * @param {*} actor 
 * @param {*} action 
 * @param {*} callback 
 * @returns 
 */
Battle.bs_animateAction = function bs_animateAction(actor, action, callback) {
	const bs = battleState;
	if (!bs) return;

	const skillType = action.type === 'pugong' ? 'pugong' : action.skillType;

	// 先在行动者身上播放光晕
	const slotEl = document.querySelector(`.battle-unit[data-side="${actor.side}"][data-slot="${actor.slotIndex}"]`);
	if (slotEl) {
		const glowClass = skillType === 'spskill' ? 'spskill-glow'
			: skillType === 'skill' ? 'skill-glow'
				: 'pugong-glow';
		const glow = document.createElement('div');
		glow.className = `action-glow ${glowClass}`;
		slotEl.appendChild(glow);
		setTimeout(() => {
			if (glow.parentNode) glow.remove();
		}, 600);
	}

	// 确定技能Emoji特效
	const effectInfo = getSkillEffectInfo(action);
	const targets = action.targets || [];

	// 延迟200ms后，在目标身上播放Emoji特效
	setTimeout(() => {
		if (targets.length === 0) {
			if (callback) callback();
			return;
		}

		// 判断是否为行列攻击（多目标且特效适宜行列展示）
		const isRowOrColumnEffect = ['wind-effect', 'sword-effect', 'lightning-effect'].includes(effectInfo.effectClass);

		if (isRowOrColumnEffect && targets.length > 1) {
			// 行列攻击：一次性播放从左到右/从上到下的动画效果
			// 将特效容器放在第一个目标上，但使其跨越整个行/列
			showSkillEffectOnTargets(targets, effectInfo);
		} else {
			// 单体攻击或治疗：每个目标独立播放
			targets.forEach(t => showSkillEffect(t, effectInfo));
		}
	}, 200);

	// 600ms后结算伤害
	setTimeout(() => {
		function onActionComplete() {
			updateBattleUI();

			if (isSideDefeated('player') || isSideDefeated('enemy')) {
				setTimeout(() => {
					if (isSideDefeated('player')) endBattle('enemy');
					else endBattle('player');
				}, 500);
				return;
			}

			if (callback) setTimeout(callback, 500);
		}

		if (action.type === 'pugong') {
			executePugong(actor, targets, onActionComplete);
		} else {
			executeSkill(actor, action.skillType, action.skillId, targets, action.energyCost, onActionComplete);
		}
	}, 600);
}


/**
 * 
 * @param {*} actor 当前行动角色
 * @returns ai行动
 */
Battle.executeAITurn = function executeAITurn(actor) {
	const action = aiChooseAction(actor);
	if (!action || action.targets.length === 0) {
		addBattleLog(`${actor.name} 无法行动`);
		setTimeout(() => afterAction(), 600);
		return;
	}
	hidePlayerActionUI();
	bs_animateAction(actor, action, () => {
		setTimeout(() => afterAction(), 400);
	});
}

/**
 * 
 * @param {*} actor 当前行动的角色
 * @param {*} action 
 * @returns 玩家行动
 */
Battle.executePlayerTurn = function executePlayerTurn(actor, action) {
	const bs = battleState;
	if (!bs) return;
	hidePlayerActionUI();
	bs_animateAction(actor, action, () => {
		setTimeout(() => afterAction(), 400);
	});
}

/**
 * 显示战斗介绍并处理战斗开始时的逻辑。
 * 
 * 该函数负责初始化战斗状态，触发所有单位的战斗开始被动效果，
 * 并在完成后进入下一个回合。如果战斗已经开始，则直接延迟进入下一回合。
 * 
 */
Battle.showBattleIntro = function showBattleIntro() {
	const bs = battleState;
	resetActedSlots();

	// ======== 新增：触发第一轮开始效果 ========
	triggerGlobalEffect('roundStart', 1);
	// ==========================================

	addBattleLog(`—— 第 1 轮 ——`);
	addBattleLog(`${bs.firstSide === 'player' ? '我方' : '敌方'}先手`);

	setTimeout(() => {
		nextTurn();
	}, 500);
}
/**
 * 结算战斗
 * @param {string} winner 显示胜者，player为玩家胜，否则玩家败
 * 
 */
Battle.end = function endBattle(winner) {
	const bs = battleState;
	bs.phase = 'ended';
	addBattleLog(winner === 'player' ? '战斗胜利！' : '战斗失败...');

	setTimeout(() => {
		showBattleResult(winner);
	}, 800);
}

// ====== 6. 玩家操作面板 ======

/**
 * 
 * @param {*} skillType 输入技能类型（普通技能或必杀技能）
 * @param {*} skillId 输入技能的id便于调用
 * @returns 确认该技能的符号
 */
Battle.getSkillEmoji = function getSkillEmoji(skillType, skillId) {
	const sData = contentList && contentList[skillType] && contentList[skillType][skillId];
	if (!sData || !sData.target) return '🔥';
	let isRecover = false;
	if (sData.isRecover === true) isRecover = true;
	if (isRecover) return '🧪';
	const targetMode = sData.target[0];
	if (targetMode === 'row') return '⚔️';
	if (targetMode === 'column') return '⚡';
	return '🔥';
}

/**
 * 
 * @param {*} actor 当前回合角色
 * @returns 展示当前角色的行动可选择项
 */
Battle.showPlayerActionUI = function showPlayerActionUI(actor) {
	hidePlayerActionUI();

	if (window.autoBattle && actor && actor.alive) {
		const action = aiChooseAction(actor);
		if (action && action.targets.length > 0) {
			battleState.phase = 'animating';
			executePlayerTurn(actor, action);
			return;
		}
	}

	const slot = document.querySelector(`.battle-unit[data-side="${actor.side}"][data-slot="${actor.slotIndex}"]`);
	if (!slot) {
		setTimeout(() => showPlayerActionUI(actor), 50);
		return;
	}

	const panel = document.createElement('div');
	panel.className = 'battle-action-overlay';
	panel.id = 'battle-action-panel';

	// 普攻按钮
	const pugongId = actor.skills[0] || 'attack1';
	const pugongBtn = document.createElement('button');
	pugongBtn.className = 'action-btn pugong-btn';
	pugongBtn.textContent = '普攻 ' + getSkillEmoji('pugong', pugongId);
	pugongBtn.onclick = (e) => {
		e.stopPropagation();
		enterTargetSelection(actor, 'pugong', pugongId, 0);
	};
	panel.appendChild(pugongBtn);

	// 【新概念】技能/必杀按钮合并 - 统一从 skills[1] 获取
	const skillId = actor.skills[1];
	if (skillId) {
		const isSealed = actor.sealed || actor.permanentlySealed;
		const canUseSkill = actor.energy >= 4 && !isSealed;

		const isSpskill = typeof skillId === 'string' && skillId.startsWith('spskill_');

		const btn = document.createElement('button');
		btn.className = 'action-btn skill-btn' + (canUseSkill ? '' : ' disabled');

		btn.textContent = isSpskill ? '必杀 ' + getSkillEmoji('spskill', skillId) : '技能 ' + getSkillEmoji('skill', skillId);

		if (canUseSkill) {
			btn.onclick = (e) => {
				e.stopPropagation();
				// ===== 【修复】根据 isSpskill 传入正确的 skillType =====
				enterTargetSelection(actor, isSpskill ? 'spskill' : 'skill', skillId, 4);
			};
		} else {
			btn.onclick = (e) => {
				e.stopPropagation();
				toast(isSealed ? '已被封印' : '能量不足', 'warning');
			};
		}
		panel.appendChild(btn);
	}

	// 【移除】不再单独显示必杀按钮

	slot.appendChild(panel);
}


// ====== 7. 目标选择逻辑 ======

/**
 * 
 * @param {*} actor 当前行动角色
 * @param {*} skillType 技能类型（普攻，技能，必杀）
 * @param {*} skillId 技能id（以便调用该技能数据）
 * @param {*} energyCost 能量消耗
 * @returns 选择普攻或技能后，选择目标
 */
Battle.enterTargetSelection = function enterTargetSelection(actor, skillType, skillId, energyCost) {
	const sData = contentList && contentList[skillType] && contentList[skillType][skillId];
	if (!sData) return;

	let isRecover = false;
	if (sData.isRecover === true) isRecover = true;
	else if (sData.content && sData.content.toString().includes('rpg_recover')) isRecover = true;

	const targetSide = isRecover ? actor.side : (actor.side === 'player' ? 'enemy' : 'player');
	const targetConfig = sData.target || ['one', 'first'];
	const mode = targetConfig[0];
	const count = targetConfig[2] || 1;

	targetSelection = {
		actor, skillType, skillId, energyCost,
		targetMode: mode, targetCount: count,
		isRecover, targetSide, selectedTargets: []
	};

	if (['all', 'lowest_hp_multi'].includes(mode)) {
		const targets = resolveSkillTargets(sData, actor, targetSide);
		if (targets.length > 0) {
			const action = { type: skillType === 'pugong' ? 'pugong' : 'skill', skillType, skillId, targets, energyCost };
			executePlayerTurn(actor, action);
		} else {
			toast('没有有效目标', 'warning');
		}
		return;
	}

	addBattleLog('请点击选择目标');
	highlightSelectableTargets(mode, isRecover, targetSide);
}

/**
 * 高亮以显示可操作的目标群体
 * @param {*} mode 技能模式，一行、一列、单体、全体等
 * @param {*} isRecover 技能类型（暂时在这个函数里没有调用）
 * @param {*} targetSide 可选择的目标群体
 */
Battle.highlightSelectableTargets = function highlightSelectableTargets(mode, isRecover, targetSide) {
	const aliveUnits = getAliveUnits(targetSide);
	aliveUnits.forEach(u => {
		if (mode === 'exclude_self' && u.side === targetSelection.actor.side && u.slotIndex === targetSelection.actor.slotIndex) {
			return;
		}
		const el = document.querySelector(`.battle-unit[data-side="${u.side}"][data-slot="${u.slotIndex}"]`);
		if (el) {
			el.classList.add('selectable');
			if (mode === 'manual_multi') {
				const isSelected = targetSelection.selectedTargets.some(t => t.slotIndex === u.slotIndex && t.side === u.side);
				if (isSelected) el.classList.add('target-selected');
			}
			el.onclick = () => onTargetClicked(u);
		}
	});
}

/**
 * 多选目标时，支持多选目标
 * @param {*} target 选择目标
 * @returns 
 */
Battle.onTargetClicked = function onTargetClicked(target) {
	if (!targetSelection) return;
	const ts = targetSelection;
	const side = ts.targetSide;

	let finalTargets = [];

	if (ts.targetMode === 'manual_multi') {
		const existingIndex = ts.selectedTargets.findIndex(t => t.slotIndex === target.slotIndex && t.side === target.side);
		if (existingIndex !== -1) {
			ts.selectedTargets.splice(existingIndex, 1);
			clearTargetHighlights();
			highlightSelectableTargets('manual_multi', ts.isRecover, ts.targetSide);
			return;
		} else {
			if (ts.selectedTargets.length < ts.targetCount) {
				ts.selectedTargets.push(target);
			} else {
				toast('已达到最大目标数量', 'warning');
				return;
			}
		}
		clearTargetHighlights();
		highlightSelectableTargets('manual_multi', ts.isRecover, ts.targetSide);

		const allValidTargets = getAliveUnits(side).filter(u => {
			if (ts.targetMode === 'exclude_self' && u.side === ts.actor.side && u.slotIndex === ts.actor.slotIndex) return false;
			return true;
		});

		if (ts.selectedTargets.length === ts.targetCount || ts.selectedTargets.length >= allValidTargets.length) {
			finalTargets = [...ts.selectedTargets];
		} else {
			return;
		}
	}
	else if (ts.targetMode === 'one' || ts.targetMode === 'exclude_self') {
		finalTargets = [target];
	}
	else if (ts.targetMode === 'row') {
		const rowStart = target.slotIndex < 3 ? 0 : 3;
		finalTargets = getAliveUnits(side).filter(u => u.slotIndex >= rowStart && u.slotIndex < rowStart + 3);
	}
	else if (ts.targetMode === 'column') {
		const col = target.slotIndex % 3;
		finalTargets = getAliveUnits(side).filter(u => u.slotIndex % 3 === col);
	}
	else {
		finalTargets = [target];
	}

	if (finalTargets.length === 0) {
		toast('没有有效目标', 'warning');
		return;
	}

	const action = {
		type: ts.skillType === 'pugong' ? 'pugong' : 'skill',
		skillType: ts.skillType,
		skillId: ts.skillId,
		targets: finalTargets,
		energyCost: ts.energyCost,
	};

	targetSelection = null;
	clearTargetHighlights();
	executePlayerTurn(ts.actor, action);
}

// ====== 8. AI 逻辑 ======

/**
 * ai指挥当前行动角色该做什么决策
 * @param {*} actor 当前行动角色
 * @returns 格式为 { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
 */
Battle.aiChooseAction = function aiChooseAction(actor) {
	const bs = battleState;
	const enemySide = actor.side === 'player' ? 'enemy' : 'player';
	const friendlySide = actor.side;

	if (actor.sealed || actor.permanentlySealed) {
		const pugongId = actor.skills[0] || 'attack1';
		const pData = contentList && contentList.pugong && contentList.pugong[pugongId];
		if (pData) {
			const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
			return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
		}
		const aliveEnemies = getAliveUnits(enemySide);
		return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
	}

	// 【新概念】统一使用 skills[1] 作为技能，能量消耗固定为4
	// 不再单独检查 skills[2] 的8能量必杀
	if (actor.energy >= 4 && actor.skills[1]) {
		const skillId = actor.skills[1];
		// 判断是否是必杀技（用于决定从哪个数据源读取）
		const isSpskill = typeof skillId === 'string' && skillId.startsWith('spskill_');
		const sData = isSpskill
			? (contentList && contentList.spskill && contentList.spskill[skillId])
			: (contentList && contentList.skill && contentList.skill[skillId]);

		if (sData) {
			const targets = aiSelectTargets(actor, sData, enemySide, friendlySide);
			if (targets.length > 0) {
				// return { type: 'skill', skillType: 'skill', skillId, targets, energyCost: 4 };

				return { type: 'skill', skillType: isSpskill ? 'spskill' : 'skill', skillId, targets, energyCost: 4 };
			}
		}
	}

	// 普攻
	const pugongId = actor.skills[0] || 'attack1';
	const pData = contentList && contentList.pugong && contentList.pugong[pugongId];
	if (pData) {
		const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
		return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
	}

	const aliveEnemies = getAliveUnits(enemySide);
	return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
}


/**
 * ai选择目标
 * @param {*} actor 当前行动角色
 * @param {*} skillData 该技能的对象
 * @param {*} enemySide 能量消耗（这里疑似没有调用
 * @param {*} friendlySide 该角色座位号？这里没有调用
 * @returns 
 */
Battle.aiSelectTargets = function aiSelectTargets(actor, skillData, enemySide, friendlySide) {
	let isRecover = false;
	if (skillData.isRecover === true) isRecover = true;
	else if (skillData.content && skillData.content.toString().includes('rpg_recover')) isRecover = true;

	const targetSide = isRecover ? actor.side : (actor.side === 'player' ? 'enemy' : 'player');
	let candidates = getAliveUnits(targetSide);
	if (candidates.length === 0) return [];
	return resolveSkillTargets(skillData, actor, targetSide, { isRecover });
}

/**
 * 啊？看不懂，疑似根据技能模式补全所有应当被选择的合法目标
 * @param {*} skillData 技能的对象
 * @param {*} actor 行动者
 * @param {*} intendedSide 选取的目标的阵营
 * @param {*} options 啊？
 * @returns 疑似根据技能模式补全所有应当被选择的合法目标
 */
Battle.resolveSkillTargets = function resolveSkillTargets(skillData, actor, intendedSide, options) {
	if (!skillData || !skillData.target) return [];
	const mode = skillData.target[0];
	const pref = skillData.target[1] || 'first';
	const count = skillData.target[2] || 1;

	let candidates = getAliveUnits(intendedSide);
	if (candidates.length === 0) return [];

	if (mode === 'exclude_self') {
		candidates = candidates.filter(u => !(u.side === actor.side && u.slotIndex === actor.slotIndex));
	}
	if (candidates.length === 0) return [];

	switch (mode) {
		case 'all': return candidates;
		case 'one':
		case 'exclude_self':
			return [selectBestSingleTarget(candidates, pref, actor, options)];
		case 'manual_multi':
			// return shuffleArray([...candidates]).slice(0, Math.min(count, candidates.length));
			// 根据 pref 选择
			let selected = [...candidates];
			switch (pref) {
				case 'lowest':
					// 按血量百分比升序排序（血量最低的排前面）
					selected.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
					break;
				case 'highest':
					// 按血量百分比降序排序
					selected.sort((a, b) => (b.hp / b.maxHp) - (a.hp / a.maxHp));
					break;
				case 'manahighest':
					// 按能量降序排序
					selected.sort((a, b) => (b.energy || 0) - (a.energy || 0));
					break;
				case 'random':
					// 随机打乱
					shuffleArray(selected);
					break;
				// 'first' 或其他：保持原顺序
			}
			return selected.slice(0, Math.min(count, selected.length));
		case 'row':
			return selectRowTargetsSmart(candidates, pref, actor);
		case 'column':
			return selectColumnTargetsSmart(candidates, pref, actor);
		default:
			return [candidates[0]];
	}
}
/**
 * 看不懂
 * @param {*} candidates 
 * @param {*} pref 
 * @param {*} actor 
 * @param {*} options 
 * @returns 
 */
Battle.selectBestSingleTarget = function selectBestSingleTarget(candidates, pref, actor, options = {}) {
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0];

	switch (pref) {
		case 'random':
			return candidates[Math.floor(Math.random() * candidates.length)];

		case 'last':
			// 选择后排/最后一个目标
			return candidates[candidates.length - 1];

		case 'lowest':
			// 选择血量最低的目标
			return candidates.reduce((min, c) => (c.hp / c.maxHp) < (min.hp / min.maxHp) ? c : min);

		case 'highest':
			// 选择血量最高的目标
			return candidates.reduce((max, c) => (c.hp / c.maxHp) > (max.hp / max.maxHp) ? c : max);

		case 'manahighest':
			// 选择能量最高的目标
			return candidates.reduce((max, c) => (c.energy || 0) > (max.energy || 0) ? c : max);

		case 'first':
		default:
			// 默认选择第一个（前排）
			return candidates[0];
	}
}

/**
 * 根据选中目标补全同一行的所有存活目标
 * @param {*} candidates 候选目标列表
 * @param {*} pref 偏好（如 'first', 'last', 'random'）
 * @param {*} actor 行动者
 * @returns 同行所有存活目标
 */
Battle.selectRowTargetsSmart = function selectRowTargetsSmart(candidates, pref, actor) {
	if (candidates.length === 0) return [];

	let seedTarget;
	switch (pref) {
		case 'random':
			seedTarget = candidates[Math.floor(Math.random() * candidates.length)];
			break;
		case 'last':
			seedTarget = candidates[candidates.length - 1];
			break;
		case 'lowest':
			seedTarget = candidates.reduce((min, c) => (c.hp / c.maxHp) < (min.hp / min.maxHp) ? c : min);
			break;
		case 'highest':
			seedTarget = candidates.reduce((max, c) => (c.hp / c.maxHp) > (max.hp / max.maxHp) ? c : max);
			break;
		case 'manahighest':
			seedTarget = candidates.reduce((max, c) => (c.energy || 0) > (max.energy || 0) ? c : max);
			break;
		default: // 'first'
			seedTarget = candidates[0];
	}

	if (!seedTarget) return [];

	const rowStart = seedTarget.slotIndex < 3 ? 0 : 3;
	const side = seedTarget.side;
	return candidates.filter(u => u.side === side && u.slotIndex >= rowStart && u.slotIndex < rowStart + 3);
}


/**
 * 根据选中目标补全同一列的所有存活目标
 * @param {*} candidates 候选目标列表
 * @param {*} pref 偏好（如 'first', 'last', 'random'）
 * @param {*} actor 行动者
 * @returns 同列所有存活目标
 */
Battle.selectColumnTargetsSmart = function selectColumnTargetsSmart(candidates, pref, actor) {
	if (candidates.length === 0) return [];


	let seedTarget;
	switch (pref) {
		case 'random':
			seedTarget = candidates[Math.floor(Math.random() * candidates.length)];
			break;
		case 'last':
			seedTarget = candidates[candidates.length - 1];
			break;
		case 'lowest':
			seedTarget = candidates.reduce((min, c) => (c.hp / c.maxHp) < (min.hp / min.maxHp) ? c : min);
			break;
		case 'highest':
			seedTarget = candidates.reduce((max, c) => (c.hp / c.maxHp) > (max.hp / max.maxHp) ? c : max);
			break;
		case 'manahighest':
			seedTarget = candidates.reduce((max, c) => (c.energy || 0) > (max.energy || 0) ? c : max);
			break;
		default: // 'first'
			seedTarget = candidates[0];
	}

	if (!seedTarget) return [];

	const rowStart = seedTarget.slotIndex < 3 ? 0 : 3;
	const side = seedTarget.side;
	return candidates.filter(u => u.side === side && u.slotIndex >= rowStart && u.slotIndex < rowStart + 3);
}
// ====== 9. 结算界面 ======

/**
 * 战斗结算
 * @param {*} winner 胜者，player或其他
 * @returns 
 */
Battle.showBattleResult = function showBattleResult(winner) {
	const bs = battleState;
	hidePlayerActionUI();
	const container = document.getElementById('battle-view');
	if (!container) return;

	const overlay = document.createElement('div');
	overlay.className = 'battle-result-overlay';
	const dialog = document.createElement('div');
	dialog.className = 'battle-result-dialog';

	const title = document.createElement('div');
	title.className = 'battle-result-title';
	title.textContent = winner === 'player' ? '战斗胜利' : '战斗失败';
	title.style.color = winner === 'player' ? '#ffd700' : '#ff4444';
	dialog.appendChild(title);

	const playerAlive = getAliveUnits('player').length;
	const enemyAlive = getAliveUnits('enemy').length;
	const stats = document.createElement('div');
	stats.className = 'battle-result-stats';
	stats.textContent = `我方存活: ${playerAlive} | 敌方存活: ${enemyAlive} | 总轮数: ${bs.round}`;
	dialog.appendChild(stats);

	if (winner === 'player') {
		const goldReward = bs.expectedGold || 0;
		const rewardDiv = document.createElement('div');
		rewardDiv.className = 'battle-result-stats';
		rewardDiv.style.color = '#ffd700';
		rewardDiv.style.marginTop = '8px';
		rewardDiv.innerHTML = `💰 金币奖励: +${goldReward}`;
		dialog.appendChild(rewardDiv);
	}

	const btn = document.createElement('button');
	btn.className = 'ybrpg-btn';
	btn.textContent = '返回';
	btn.onclick = () => {
		battleState = null;
		targetSelection = null;
		container.style.display = 'none';
		const bottomBar = document.querySelector('.ybrpg-bottom-bar');
		if (bottomBar) bottomBar.style.display = 'flex';

		if (winner === 'player' && bs.onWin) bs.onWin();
		else if (winner === 'enemy' && bs.onLose) bs.onLose();
		else {
			const dungeonView = document.getElementById('dungeon-view');
			if (dungeonView) {
				shared.hideOtherViews('dungeon-view');
				dungeonView.style.display = 'flex';
				if (bs.chapterKey) {
					shared.renderDungeonView(dungeonView, bs.chapterKey);
				}
			}
		}
	};
	dialog.appendChild(btn);
	overlay.appendChild(dialog);
	container.appendChild(overlay);
}

// ====== 10. 初始化与 UI 渲染 (保留原有逻辑) ======

// 注意：BREAKTHROUGH_BUFF_LIBRARY 来自循环依赖模块，不能在顶层求值（会触发 TDZ）。
// 改为在使用处惰性取值，避免模块初始化顺序问题。

/**
 * 根据输入的突破信息编译成对应的突破能力对象
 * @param {*} data 突破能力对象或者待调用的字符串
 * @param {*} index 该突破能力对应的序号
 * @returns 编译后的突破对象
 */
Battle.normalizeBreakthroughData = function normalizeBreakthroughData(data, index) {
	if (data && typeof data === 'object' && !Array.isArray(data)) return data;
	if (typeof data === 'string') {
		const libData = (BREAKTHROUGH_BUFF_LIBRARY || {})[data];
		if (libData) {
			// 先深拷贝，再修改 level
			const clone = JSON.parse(JSON.stringify(libData));
			clone.level = index;  // 修改拷贝后的对象
			return clone;
		} else {
			console.warn(`[BattleInit] Breakthrough ID '${data}' not found.`);
			return null;
		}
	}
	if (Array.isArray(data)) {
		console.error(`[BattleInit] Array format for breakthrough NOT supported.`);
		return null;
	}
	return null;
}

// ====== 效果适配器（统一三种来源 → 契约格式） ======

/**
 * 适配器 A：突破 skill_effect → 统一契约格式
 * BREAKTHROUGH_BUFF_LIBRARY 里的 skill_effect 已是 {trigger, filter, content} 格式，直接透传
 */
Battle.adaptBreakthroughSkillEffect = function adaptBreakthroughSkillEffect(buff) {
	if (!buff || buff.type !== 'skill_effect') return null;
	if (typeof buff.content !== 'function') return null;
	return {
		trigger: buff.trigger,
		filter: typeof buff.filter === 'function' ? buff.filter : function () { return true; },
		content: buff.content,
		desc: buff.desc || '',
		source: 'breakthrough',
		id: buff.id || buff._libId || ''
	};
}

/**
 * 适配器 B：宝物 effectSkills（字符串 id 引用） → 统一契约格式
 * 宝物用 effectSkills: ['库id', ...] 引用 BREAKTHROUGH_BUFF_LIBRARY 里的效果
 */
Battle.adaptTreasureEffects = function adaptTreasureEffects(treasureDef) {
	var out = [];
	var ids = (treasureDef && treasureDef.effectSkills) || [];
	ids.forEach(function (id) {
		var buff = (BREAKTHROUGH_BUFF_LIBRARY || {})[id];
		var eff = adaptBreakthroughSkillEffect(buff);
		if (eff) {
			eff.source = 'treasure';
			out.push(eff);
		} else {
			console.warn('[宝物] effectSkills id \'' + id + '\' 未找到');
		}
	});
	return out;
}

/**
 * 战斗开始，初始化信息
 * @param {*} playerTeam 
 * @param {*} enemyTeam 
 * @param {*} options 
 */
Battle.start = function startBattle(playerTeam, enemyTeam, options = {}) {
	// ===== 【新增】刷新全队编译属性 =====
	const teamBonuses = Stat.teamBonuses();
	(window.currentTeam || []).forEach(instId => {
		if (instId && window.charBagData) {
			Stat.final(instId, teamBonuses);
		}
	});

	function buildUnit(data, side, slotIndex, teamBonuses = null) {
		if (!data || !data.id) return null;

		const isPreCompiled = data.statsPreCompiled === true || !data.instanceId;

		let rank = data.rank;
		let template = data.template;
		if (!rank || !template) {
			const baseDef = characterList && characterList[data.id];
			if (baseDef) {
				rank = rank || baseDef.rank || 'common';
				template = template || baseDef.template || 'balanced';
			} else {
				rank = rank || 'common';
				template = template || 'balanced';
			}
		}

		const rawTupoList = data.tupoList || [];
		const tupolevel = data.tupolevel || 0;
		const normalizedTupoList = rawTupoList.map((item, index) => normalizeBreakthroughData(item, index));

		// 只处理非属性类突破效果
		let bonusEnergy = 0;
		let passiveBuffs = [];
		const effectSkills = [];

		// 辅助函数：从技能数据中提取 effect 到 skills
		function extractSkillContentsToSkills(skillType, skillIndex) {
			const baseSkills = Array.isArray(data.skills) ? data.skills : ['attack1', null, null];
			const skillId = baseSkills[skillIndex];
			if (!skillId || typeof skillId !== 'string') return;

			const sData = contentList && contentList[skillType] && contentList[skillType][skillId];
			if (!sData || !sData.contents || !Array.isArray(sData.contents)) return;

			const triggerMap = { 'pugong': 'pugongHit', 'skill': 'skillHit', 'spskill': 'spskillHit' };
			const trigger = triggerMap[skillType];
			if (!trigger) return;

		sData.contents.forEach(content => {
			if (content.content && typeof content.content === 'function') {
				effectSkills.push({
					// 允许 content 通过 trigger 字段覆盖默认触发时机
					// （如「释放普攻」需挂在 skillEnd 而非逐目标命中的 skillHit）
					trigger: content.trigger || trigger,
					filter: content.filter || function () { return true; },
					content: content.content,
					desc: content.desc || ''
				});
			}
		});
		}

		// ===== 【修复】必杀解锁状态决定载入哪个技能特效 =====
		// 必须在此处（而非下方的 baseSkills 替换逻辑）先确定，否则 skill 与 spskill 的 contents 会被一起载入
		const _spSkillId = (Array.isArray(data.skills) && data.skills[2]) || null;
		const _normalSkillId = (Array.isArray(data.skills) && data.skills[1]) || null;
		const _isSpskillUnlocked = data.openSpskill === true;

		// 提取普攻特效（始终生效）
		extractSkillContentsToSkills('pugong', 0);
		// 仅载入当前激活技能的特效：必杀已解锁 → 只载入必杀；否则 → 只载入普通技能
		if (_isSpskillUnlocked && _spSkillId) {
			extractSkillContentsToSkills('spskill', 2);
		} else if (_normalSkillId) {
			extractSkillContentsToSkills('skill', 1);
		}

		// 编译非属性类的突破效果
		for (let i = 0; i < tupolevel; i++) {
			if (!normalizedTupoList[i]) continue;
			const buff = normalizedTupoList[i];
			const type = buff.type;

			switch (type) {
				case 'self_energy':
					bonusEnergy += Number(buff.value || 0);
					break;

				case 'passive_effect':
					if (buff.effectId) passiveBuffs.push(buff.effectId);
					break;

				case 'skill_effect':
					{
						var e = adaptBreakthroughSkillEffect(buff);
						if (e) effectSkills.push(e);
					}
					break;

				case 'death_effect':
					effectSkills.push({
						trigger: 'dieSelf',
						filter: function () { return true; },
						content: function (killer) {
							if (buff.effects && Array.isArray(buff.effects)) {
								buff.effects.forEach(effect => {
									if (effect.type === 'seal_killer' && killer && killer.alive) {
										if (effect.permanent) {
											killer.permanentlySealed = true;
											addBattleLog(`${this.name} 阵亡时永久封印了 ${killer.name}`);
										} else {
											addBuff(killer, {
												id: 'seal_death', name: '死亡封印', type: 'seal', remainRounds: 1,
												sourceSide: this.side, sourceId: this.instanceId,
												ownerSlot: this._currentActionSlotKey || null
											});
										}
										updateBattleUI();
									}
								});
							}
						}
					});
					break;

				case 'behit_effect':
					effectSkills.push({
						trigger: 'onHitSelf',
						filter: function (attacker, damage) {
							if (buff.effects && Array.isArray(buff.effects)) {
								return buff.effects.some(effect => {
									if (effect.type === 'damage_reduce' && effect.condition === 'self_hp_gt_50') {
										return this.hp / this.maxHp > 0.5;
									}
									return false;
								});
							}
							return false;
						},
						content: function (attacker, damage) {
							if (buff.effects && Array.isArray(buff.effects)) {
								for (const effect of buff.effects) {
									if (effect.type === 'damage_reduce') {
										const reduced = Math.floor(damage * (1 - (effect.value || 0.5)));
										addBattleLog(`${this.name} 触发减伤，伤害降低 ${Math.floor((effect.value || 0.5) * 100)}%`);
										return reduced;
									}
								}
							}
							return damage;
						}
					});
					break;

				default:
					break;
			}
		}

		// ========== 计算最终属性 ==========
		let finalHp, finalAtk, finalDef, finalSpe;
		let finalEnergy = 2;

		// ===== 【新增】新属性初始值 =====
		let finalHit = 10000;
		let finalDodge = 0;
	let finalCrit = 0;
	let finalCritResist = 0;
	let finalBaoShang = 0;
	let finalShouhu = 0;
		let finalPierce = 0;
		let finalBlock = 0;

		let finalFixedDealUp = 0;
		let finalFixedTakeDn = 0;
		let finalPctDealUp = 0;
		let finalPctTakeDn = 0;

		let finalFixedHeal = 0;
		let finalFixedBeHeal = 0;
		let finalPctHeal = 0;
		let finalPctBeHeal = 0;

		let compiled = null;  // 统一引用编译结果，用于后续读取 _teamBuffs

		if (data._compiledStats) {
			compiled = data._compiledStats;
			finalHp = data._compiledStats.totalHp;
			finalAtk = data._compiledStats.totalAtk;
			finalDef = data._compiledStats.totalDef;
			finalSpe = data._compiledStats.totalSpe;

			// ===== 【新增】从编译结果读取新属性 =====
			finalHit = data._compiledStats.mingzhong ?? 10000;
			finalDodge = data._compiledStats.shanbi ?? 0;
		finalCrit = data._compiledStats.baoji ?? 0;
		finalCritResist = data._compiledStats.kangbao ?? 0;
		finalBaoShang = data._compiledStats.baoshang ?? 0;
		finalShouhu = data._compiledStats.shouhu ?? 0;
			finalPierce = data._compiledStats.poji ?? 0;
			finalBlock = data._compiledStats.gedang ?? 0;

			finalFixedDealUp = data._compiledStats.fixedDealUp ?? 0;
			finalFixedTakeDn = data._compiledStats.fixedTakeDn ?? 0;
			finalPctDealUp = data._compiledStats.pctDealUp ?? 0;
			finalPctTakeDn = data._compiledStats.pctTakeDn ?? 0;

			finalFixedHeal = data._compiledStats.fixedHeal ?? 0;
			finalFixedBeHeal = data._compiledStats.fixedBeHeal ?? 0;
			finalPctHeal = data._compiledStats.pctHeal ?? 0;
			finalPctBeHeal = data._compiledStats.pctBeHeal ?? 0;
		} else if (data.statsPreCompiled) {
			// 【新增】直接从 data 读取预编译属性
			finalHp = data.hp || 0;
			finalAtk = data.atk || 0;
			finalDef = data.def || 0;
			finalSpe = data.spe || 0;

			finalHit = data.mingzhong ?? 10000;
			finalDodge = data.shanbi ?? 0;
		finalCrit = data.baoji ?? 0;
		finalCritResist = data.kangbao ?? 0;
		finalBaoShang = data.baoshang ?? 0;
		finalShouhu = data.shouhu ?? 0;
			finalPierce = data.poji ?? 0;
			finalBlock = data.gedang ?? 0;

			finalFixedDealUp = data.fixedDealUp ?? 0;
			finalFixedTakeDn = data.fixedTakeDn ?? 0;
			finalPctDealUp = data.pctDealUp ?? 0;
			finalPctTakeDn = data.pctTakeDn ?? 0;

			finalFixedHeal = data.fixedHeal ?? 0;
			finalFixedBeHeal = data.fixedBeHeal ?? 0;
			finalPctHeal = data.pctHeal ?? 0;
			finalPctBeHeal = data.pctBeHeal ?? 0;
		} else {
			// ===== 【修改】使用 compileEnemyStats 编译属性 =====
			compiled = compileEnemyStats(data.id, data.level || 1, data.tupolevel || 0, data, teamBonuses);

			finalHp = compiled.hp;
			finalAtk = compiled.atk;
			finalDef = compiled.def;
			finalSpe = compiled.spe;

			finalHit = compiled.mingzhong;
			finalDodge = compiled.shanbi;
		finalCrit = compiled.baoji;
		finalCritResist = compiled.kangbao;
		finalBaoShang = compiled.baoshang ?? 0;
		finalShouhu = compiled.shouhu ?? 0;
			finalPierce = compiled.poji;
			finalBlock = compiled.gedang;

			finalFixedDealUp = compiled.fixedDealUp;
			finalFixedTakeDn = compiled.fixedTakeDn;
			finalPctDealUp = compiled.pctDealUp;
			finalPctTakeDn = compiled.pctTakeDn;

			finalFixedHeal = compiled.fixedHeal;
			finalFixedBeHeal = compiled.fixedBeHeal;
			finalPctHeal = compiled.pctHeal;
			finalPctBeHeal = compiled.pctBeHeal;
		}


		finalEnergy += bonusEnergy;

		var activeTreasures = Array.isArray(data.treasures) ? data.treasures : [];
		activeTreasures.forEach(function (def) {
			adaptTreasureEffects(def).forEach(function (e) { effectSkills.push(e); });
		});

		// 基础技能（普攻 + 技能）
		let baseSkills = [...(data.skills || []), null, null, null].slice(0, 3);

		// ===== 【新概念】必杀技解锁后替换普通技能 =====
		const spSkillId = baseSkills[2];  // skills[2] 是必杀ID（如 'spskill_001'）
		const normalSkillId = baseSkills[1]; // skills[1] 是普通技能ID
		const isSpskillUnlocked = data.openSpskill === true;

		if (spSkillId && isSpskillUnlocked) {
			// 必杀已解锁：用必杀技替换普通技能
			baseSkills[1] = spSkillId;
			// skills[2] 置空（必杀不再单独占用一个槽位）
			baseSkills[2] = null;
		} else {
			// 必杀未解锁：保持普通技能
			// skills[1] 保持不变
			// skills[2] 需要置空，防止战斗系统误以为有8能量技能
			baseSkills[2] = null;
		}
		// const spSkillId = baseSkills[2];  // skills[2] 已经是必杀ID
		// const isSpskillUnlocked = data.openSpskill === true;

		// // 只有在解锁状态下才将必杀加入技能数组
		// if (spSkillId && isSpskillUnlocked) {
		// 	// 必杀已解锁，直接使用 baseSkills[2] 中的ID
		// } else {
		// 	// 未解锁时，不添加必杀技能
		// 	baseSkills[2] = null;
		// }

		const allSkills = [...baseSkills, ...effectSkills];

		// ===== 构建单位对象 =====
		const unit = {
			id: data.id,
			instanceId: data.instanceId || data.id,
			name: data.name || '未知单位',
			side,
			slotIndex,
			rank,
			template,
			maxHp: finalHp,
			hp: finalHp,
			atk: finalAtk,
			baseAtk: finalAtk, // 战斗开始时的攻击力基准（供「敌方减员加攻」等效果使用）
			def: finalDef,
			spe: finalSpe,
			energy: Math.min(8, finalEnergy),
			buff: Array.isArray(data.buff) ? [...data.buff] : [],

			// ===== 【新增】结构化 buff 列表 =====
			buffList: [],  // 用于存储结构化的 buff 对象
			skills: allSkills,
			alive: true,
			treasures: activeTreasures,
			sealed: false,
			sealTurns: 0,
			sealOwner: null,
			permanentlySealed: false,
			paralyzed: false,
			stunned: false,
			healBlocked: false,
			poisonDamage: 0,
			extraTurnCount: 0,
			tupoList: normalizedTupoList,
			tupolevel: tupolevel,
			hasAttacked: false,

			// ===== 【新增】战斗概率属性 =====
			mingzhong: finalHit,
			shanbi: finalDodge,
		baoji: finalCrit,
		kangbao: finalCritResist,
		baoshang: finalBaoShang,
		shouhu: finalShouhu,
			poji: finalPierce,
			gedang: finalBlock,

			// ===== 【新增】增伤/减伤 =====
			fixedDealUp: finalFixedDealUp,
			fixedTakeDn: finalFixedTakeDn,
			pctDealUp: finalPctDealUp,
			pctTakeDn: finalPctTakeDn,

			// ===== 【新增】治疗相关 =====
			fixedHeal: finalFixedHeal,
			fixedBeHeal: finalFixedBeHeal,
			pctHeal: finalPctHeal,
			pctBeHeal: finalPctBeHeal,
		};

		// ===== 【新增】存储团队加成信息（用于后续 applyTeamBreakthroughBuffs） =====
		if (compiled && compiled._teamBuffs) {
			unit._teamBuffs = [compiled._teamBuffs];
		}
		if (compiled && compiled._teamPercentBuffs) {
			unit._teamPercentBuffs = [compiled._teamPercentBuffs];
		}

		if (passiveBuffs.length > 0) unit.buff.push(...passiveBuffs);
		return unit;
	}


	// ===== 【新增】计算敌人的全队突破加成 =====
	const enemyTeamBonuses = calculateEnemyTeamBonuses(enemyTeam);

	const playerUnits = playerTeam.map((u, i) => buildUnit(u, 'player', i));
	const enemyUnits = enemyTeam.map((u, i) => buildUnit(u, 'enemy', i, enemyTeamBonuses));
	// ===== 【移除】不再需要 applyTeamBreakthroughBuffs，因为属性已在 calculateInstanceFinalStats 中编译 =====
	// applyTeamBreakthroughBuffs(playerUnits);
	// applyTeamBreakthroughBuffs(enemyUnits);

	const playerSpeSum = playerUnits.filter(u => u).reduce((s, u) => s + u.spe, 0);
	const enemySpeSum = enemyUnits.filter(u => u).reduce((s, u) => s + u.spe, 0);
	let firstSide = 'player';
	if (enemySpeSum > playerSpeSum) firstSide = 'enemy';

	/**@type {battleState}战斗信息 */
	battleState = {
		playerUnits,
		enemyUnits,
		firstSide,
		round: 1,
		currentTurnIndex: 0,
		currentTurnSide: null,
		phase: 'intro',
		actedSlots: { player: new Set(), enemy: new Set() },
		selectedSkill: null,
		selectedTargets: [],
		difficulty: options.difficulty || 'normal',
		eventId: options.eventId || null,
		eventType: options.eventType || 'battle',
		chapterKey: options.chapterKey || null,
		goldScale: options.goldScale || 1.0,
		enemyCount: enemyTeam.filter(e => e && e.id).length,
		onWin: options.onWin || null,
		// ===== 【调试】暴露到 window 方便控制台查看 =====
		_dumpUnits: function() {
			[playerUnits, enemyUnits].forEach((units, sideIdx) => {
				const label = sideIdx === 0 ? '我方' : '敌方';
				units.forEach((u, i) => {
					if (!u || !u.name) return;
					console.log(
						`[${label}][${i}] ${u.name} | HP:${u.hp}/${u.maxHp} ATK:${u.atk} DEF:${u.def} SPE:${u.spe} ` +
						`命中:${u.mingzhong} 闪避:${u.shanbi} 暴击:${u.baoji} 抗暴:${u.kangbao} 破击:${u.poji} 格挡:${u.gedang} ` +
						`固伤↑:${u.fixedDealUp} 固伤↓:${u.fixedTakeDn} 百伤↑:${u.pctDealUp} 百伤↓:${u.pctTakeDn}`,
						u
					);
				});
			});
		},
		onLose: options.onLose || null,
		log: [],
		battleStarted: false,
		expectedGold: options.goldReward || 0,
	};

	renderBattleView();
	showBattleIntro();
}
/**
 * 从角色的 skills 中获取指定 trigger 的效果对象
 * @param {*} actor 角色
 * @param {string} trigger 触发时机
 * @returns {Array} 匹配的效果对象数组
 */
Battle.getEffectsByTrigger = function getEffectsByTrigger(actor, trigger) {
	if (!actor || !actor.skills || !Array.isArray(actor.skills)) return [];

	return actor.skills.filter(skill => {
		if (typeof skill === 'string' || skill === null) return false; // 跳过技能ID字符串

		// ===== 【改造】支持 trigger 为数组 =====
		if (Array.isArray(skill.trigger)) {
			// 如果 trigger 是数组，检查是否包含当前 trigger
			return skill.trigger.includes(trigger);
		}

		// 单个字符串的 trigger
		return skill.trigger === trigger;
	});
}

/**
 * 触发所有存活角色的指定时机效果
 * @param {string} trigger 触发时机
 * @param {...any} context 上下文参数
 */
Battle.triggerGlobalEffect = function triggerGlobalEffect(trigger, ...context) {
	const bs = battleState;
	if (!bs) return;

	const allUnits = [...bs.playerUnits, ...bs.enemyUnits];
	allUnits.forEach(unit => {
		if (!unit || !unit.alive) return;
		triggerSelfEffect(unit, trigger, ...context);
	});
}

/**
 * 触发指定角色的指定时机效果
 * @param {*} unit 目标角色
 * @param {string} trigger 触发时机
 * @param {...any} context 上下文参数
 */
Battle.triggerSelfEffect = function triggerSelfEffect(unit, trigger, ...context) {
	if (!unit || !unit.alive) return;

	const effects = getEffectsByTrigger(unit, trigger);
	effects.forEach(effect => {
		if (effect.filter && effect.filter.call(unit, ...context)) {
			effect.content.call(unit, ...context);
		}
	});
}


/**
 * 根据角色突破等级，初始化这些角色的基本数值
 * @param {*} units 传入角色数组
 */
Battle.applyTeamBreakthroughBuffs = function applyTeamBreakthroughBuffs(units) {
	let teamFlatBonus = { atk: 0, def: 0, hp: 0 };
	let teamPercentBonus = { atk: 0, def: 0, hp: 0 };

	units.forEach(u => {
		if (!u) return;
		if (u._teamBuffs && Array.isArray(u._teamBuffs)) {
			u._teamBuffs.forEach(b => {
				if (b.atk) teamFlatBonus.atk += Number(b.atk);
				if (b.def) teamFlatBonus.def += Number(b.def);
				if (b.hp) teamFlatBonus.hp += Number(b.hp);
			});
		}
		if (u._teamPercentBuffs && Array.isArray(u._teamPercentBuffs)) {
			u._teamPercentBuffs.forEach(b => {
				if (b.atk) teamPercentBonus.atk += Number(b.atk);
				if (b.def) teamPercentBonus.def += Number(b.def);
				if (b.hp) teamPercentBonus.hp += Number(b.hp);
			});
		}
		delete u._teamBuffs;
		delete u._teamPercentBuffs;
	});

	units.forEach(u => {
		if (!u) return;
		u.atk += teamFlatBonus.atk;
		u.def += teamFlatBonus.def;
		u.maxHp += teamFlatBonus.hp;
		u.hp += teamFlatBonus.hp;
	});

	units.forEach(u => {
		if (!u) return;
		const atkMult = 1 + teamPercentBonus.atk;
		const defMult = 1 + teamPercentBonus.def;
		const hpMult = 1 + teamPercentBonus.hp;
		u.atk = Math.floor(u.atk * atkMult);
		u.def = Math.floor(u.def * defMult);
		u.maxHp = Math.floor(u.maxHp * hpMult);
		u.hp = Math.floor(u.hp * hpMult);
	});
}

/**
 * 生成战斗页面
 * @returns 
 */
Battle.renderBattleView = function renderBattleView() {
	const container = document.getElementById('battle-view');
	if (!container) return;
	container.innerHTML = '';
	const bs = battleState;

	const field = document.createElement('div');
	field.className = 'battle-field';
	field.id = 'battle-field';

	// Enemy Area
	const enemyArea = document.createElement('div');
	enemyArea.className = 'battle-side enemy-side';
	const enemyLabel = document.createElement('div');
	enemyLabel.className = 'battle-side-label';
	enemyLabel.textContent = '敌方';
	enemyArea.appendChild(enemyLabel);
	const enemyGrid = document.createElement('div');
	enemyGrid.className = 'battle-grid';
	[5, 4, 3, 2, 1, 0].forEach(idx => {
		const unit = bs.enemyUnits[idx];
		const slot = createUnitSlot(unit, 'enemy', idx);
		enemyGrid.appendChild(slot);
	});
	enemyArea.appendChild(enemyGrid);
	field.appendChild(enemyArea);

	// Divider
	const divider = document.createElement('div');
	divider.className = 'battle-divider';
	divider.id = 'battle-divider';
	const vsLabel = document.createElement('div');
	vsLabel.className = 'battle-vs-label';
	vsLabel.textContent = 'VS';
	divider.appendChild(vsLabel);
	const logArea = document.createElement('div');
	logArea.className = 'battle-log-area';
	logArea.id = 'battle-log';
	divider.appendChild(logArea);
	field.appendChild(divider);

	// Player Area
	const playerArea = document.createElement('div');
	playerArea.className = 'battle-side player-side';
	const playerLabel = document.createElement('div');
	playerLabel.className = 'battle-side-label';
	playerLabel.textContent = '我方';
	playerArea.appendChild(playerLabel);
	const playerGrid = document.createElement('div');
	playerGrid.className = 'battle-grid';
	[0, 1, 2, 3, 4, 5].forEach(idx => {
		const unit = bs.playerUnits[idx];
		const slot = createUnitSlot(unit, 'player', idx);
		playerGrid.appendChild(slot);
	});
	playerArea.appendChild(playerGrid);
	field.appendChild(playerArea);

	container.appendChild(field);

	addBattleLog(`—— 第 ${bs.round} 轮 ——`);
	addBattleLog(`${bs.firstSide === 'player' ? '我方' : '敌方'}先手`);

	const bottomBar = document.querySelector('.ybrpg-bottom-bar');
	if (bottomBar) bottomBar.style.display = 'none';
	shared.hideOtherViews('battle-view');

	const controlsDiv = document.createElement('div');
	controlsDiv.style.cssText = 'display:flex; flex-direction:column; align-items:center; width:100%; margin-top:10px; gap:5px;';

	const autoBtn = document.createElement('button');
	autoBtn.className = 'ybrpg-btn';
	autoBtn.style.cssText = 'width:auto;padding:4px 16px;font-size:12px;';
	autoBtn.textContent = window.autoBattle ? '🎮 自动战斗' : '🎮 手动战斗';
	autoBtn.id = 'battle-auto-btn';
	autoBtn.onclick = () => {
		window.autoBattle = !window.autoBattle;
		autoBtn.textContent = window.autoBattle ? '🎮 自动战斗' : '🎮 手动战斗';
		if (window.autoBattle && battleState && battleState.phase === 'player_action') {
			const currentUnit = battleState.currentTurnSide === 'player' ? battleState.playerUnits[battleState.currentTurnIndex] : null;
			if (currentUnit && currentUnit.alive) {
				const action = aiChooseAction(currentUnit);
				if (action && action.targets.length > 0) executePlayerTurn(currentUnit, action);
			}
		}
	};
	controlsDiv.appendChild(autoBtn);

	const escapeBtn = document.createElement('button');
	escapeBtn.className = 'ybrpg-btn';
	escapeBtn.style.cssText = 'width:auto;padding:4px 16px;font-size:12px;background-color:#d9534f;border-color:#d43f3a;color:#fff;';
	escapeBtn.textContent = '🏃 逃跑';
	escapeBtn.onclick = () => {
		if (confirmDialog) {
			confirmDialog('确定要放弃本次战斗吗？', () => endBattle('enemy'));
		} else {
			endBattle('enemy');
		}
	};
	controlsDiv.appendChild(escapeBtn);
	field.appendChild(controlsDiv);
	container.style.display = 'flex';
}

/**
 * 生成角色实体
 * @param {*} unit 该角色对象
 * @param {*} side 阵营
 * @param {*} slotIndex 序号
 * @returns 
 */
Battle.createUnitSlot = function createUnitSlot(unit, side, slotIndex) {
	const slot = document.createElement('div');
	slot.className = 'battle-unit';
	slot.dataset.side = side;
	slot.dataset.slot = slotIndex;

	if (!unit || !unit.id) {
		slot.classList.add('empty-slot');
		slot.innerHTML = '<span class="empty-text">空</span>';
		return slot;
	}

	const img = document.createElement('img');
	img.className = 'battle-unit-img';
	img.src = `/image/character/${unit.id}.jpg`;
	img.alt = unit.name;
	img.onerror = function () {
		this.onerror = function () { this.style.display = 'none'; slot.classList.add('battle-unit-noimg'); };
		this.src = `/image/character/${unit.id}.webp`;
	};
	slot.appendChild(img);

	const infoOverlay = document.createElement('div');
	infoOverlay.className = 'battle-unit-info';

	const nameEl = document.createElement('div');
	nameEl.className = 'battle-unit-name';
	const RANK_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	if (RANK_COLORS[unit.rank]) nameEl.style.color = RANK_COLORS[unit.rank];
	nameEl.textContent = unit.name + (unit.tupolevel ? `+${unit.tupolevel}` : '');
	infoOverlay.appendChild(nameEl);

	const hpBar = document.createElement('div');
	hpBar.className = 'battle-hp-bar';
	const hpFill = document.createElement('div');
	hpFill.className = 'battle-hp-fill';
	hpFill.style.width = '100%';
	hpBar.appendChild(hpFill);
	infoOverlay.appendChild(hpBar);

	const hpText = document.createElement('div');
	hpText.className = 'battle-hp-text';
	hpText.textContent = `${unit.hp}/${unit.maxHp}`;
	infoOverlay.appendChild(hpText);

	const energyBar = document.createElement('div');
	energyBar.className = 'battle-energy-bar';
	for (let i = 0; i < 8; i++) {
		const pip = document.createElement('div');
		pip.className = 'energy-pip';
		energyBar.appendChild(pip);
	}
	infoOverlay.appendChild(energyBar);
	slot.appendChild(infoOverlay);

	// 状态图标层（眩晕/封印/麻痹/中毒/禁疗 等独立图标，互不覆盖）
	const statusLayer = document.createElement('div');
	statusLayer.className = 'status-icon-layer';
	slot.appendChild(statusLayer);

	return slot;
}

/**
 * 为行/列攻击的所有目标槽位依次播放特效（带延迟）
 */
Battle.showSkillEffectOnTargets = function showSkillEffectOnTargets(targets, effectInfo) {
	targets.forEach((t, i) => {
		setTimeout(() => {
			showSkillEffect(t, effectInfo);
		}, i * 100);  // 每个目标间隔100ms
	});
}
/**
 * 在指定角色槽位上播放技能Emoji特效
 */
Battle.showSkillEffect = function showSkillEffect(unit, effectInfo) {
	const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
	if (!slotEl) return;

	const el = document.createElement('div');
	el.className = `skill-effect ${effectInfo.effectClass}`;
	el.textContent = effectInfo.emoji;
	slotEl.appendChild(el);

	setTimeout(() => el.remove(), 650);
}

/**
 * 获取Emoji特效类
 * @param {*} emoji 
 * @returns 
 */
Battle.getEmojiClass = function getEmojiClass(emoji) {
	switch (emoji) {
		case '🔥':
		case 'fire':
			return { emoji: '🔥', effectClass: 'fire-effect' };
		case '⚡':
		case 'lightning':
			return { emoji: '⚡', effectClass: 'lightning-effect' };
		case '🧪':
		case 'heal':
			return { emoji: '🧪', effectClass: 'heal-effect' };
		case '🌙':
		case 'moon':
			return { emoji: '🌙', effectClass: 'moon-effect' };
		case '❤️':
		case 'heart':
			return { emoji: '❤️', effectClass: 'heart-effect' };
		case '💎':
		case 'diamond':
			return { emoji: '💎', effectClass: 'diamond-effect' };
		case '💀':
		case 'skull':
			return { emoji: '💀', effectClass: 'skull-effect' };
		case '💥':
		case 'explosion':
			return { emoji: '💥', effectClass: 'explosion-effect' };
		case '🌪️':
		case 'wind':
			return { emoji: '🌪️', effectClass: 'wind-effect' };
		case '⚔️':
		case 'sword':
			return { emoji: '⚔️', effectClass: 'sword-effect' };
		case '🧊':
		case 'ice':
			return { emoji: '🧊', effectClass: 'ice-effect' };
		case '💧':
		case 'rain':
			return { emoji: '💧', effectClass: 'rain-effect' };
		case '❄️':
		case 'snow':
			return { emoji: '❄️', effectClass: 'snow-effect' };
		case '⭐':
		case 'star':
			return { emoji: '⭐', effectClass: 'star-effect' };
		case '☄️':
		case 'comet':
			return { emoji: '☄️', effectClass: 'comet-effect' };
		case '🎵':
		case 'music':
			return { emoji: '🎵', effectClass: 'music-effect' };
		case '🌺':
		case 'flower':
			return { emoji: '🌺', effectClass: 'flower-effect' };
		case '🍁':
		case 'maple':
			return { emoji: '🍁', effectClass: 'maple-effect' };
		case '🪨':
		case 'rock':
			return { emoji: '🪨', effectClass: 'rock-effect' };
		default:
			return { emoji: '🔥', effectClass: 'fire-effect' };
	}
}
// ====== 技能Emoji特效 ======
/**
 * 根据技能的target模式确定特效类型 (优化版 - 根据目标数量决定特效样式)
 * @param {*} action 技能对象
 * @returns {{ emoji: string, effectClass: string }}
 */
Battle.getSkillEffectInfo = function getSkillEffectInfo(action) {
	const skillType = action.type === 'pugong' ? 'pugong' : action.skillType;
	const skillId = action.type === 'pugong' ? action.skillId : action.skillId;
	const sData = contentList[skillType] && contentList[skillType][skillId];

	// const sData = contentList && contentList[skillType] && contentList[skillType][skillId];

	// ===== 【修改】优先使用技能数据中定义的 emoji =====
	if (sData && sData.emoji) {

		return getEmojiClass(sData.emoji);
	}
	if (action.emoji) return getEmojiClass(action.emoji);
	if (!sData || !sData.target) {
		// fallback: 单体攻击
		return { emoji: '🔥', effectClass: 'fire-effect' };
	}

	const targetMode = sData.target[0];
	const aiPref = sData.target[1];
	const targetCount = action.targets ? action.targets.length : 1;

	// 优先使用 isRecover 字段
	let isRecover = false;
	if (sData.isRecover === true) {
		isRecover = true;
	}

	if (isRecover) {
		return { emoji: '🧪', effectClass: 'heal-effect' };
	}

	switch (targetMode) {
		case 'row':
			// 行攻击：如果有多个目标则用 wind（横扫），否则用 sword（单体斩击）
			if (targetCount >= 2) {
				return { emoji: '🌪️', effectClass: 'wind-effect' };
			}
			return { emoji: '⚔️', effectClass: 'sword-effect' };
		case 'column':
			// 列攻击：多个目标用 lightning（贯穿），否则也用 lightning（单体穿刺）
			return { emoji: '⚡', effectClass: 'lightning-effect' };
		case 'all':
			// 全体攻击：用 explosion（爆炸）
			return { emoji: '💥', effectClass: 'explosion-effect' };
		case 'one':
		default:
			return { emoji: '🔥', effectClass: 'fire-effect' };
	}
}
/**
 * 获取角色在当前轮次的行动位次编号
 * @param {string} side - 'player' 或 'enemy'
 * @param {number} slotIndex - 角色在阵营中的索引
 * @returns {number} 在本轮中的行动顺序编号，从1开始
 */
Battle.getActionOrderInRound = function getActionOrderInRound(side, slotIndex) {
	const bs = battleState;
	if (!bs) return 0;

	// 先手方所有存活角色的行动顺序
	const firstSide = bs.firstSide;
	const secondSide = firstSide === 'player' ? 'enemy' : 'player';

	// 当前方在 actedSlots 中的已行动数量 + 1 就是本方的行动编号
	const actedCount = bs.actedSlots[side]?.size || 0;
	const actorNumber = actedCount + 1;

	return actorNumber;
}

/**
 * 获取角色在本轮唯一的行动位次标识
 * @param {string} side - 'player' 或 'enemy'
 * @param {number} slotIndex - 角色索引
 * @returns {string} 如 'player1', 'enemy2' 等
 */
Battle.getActionSlotKey = function getActionSlotKey(side, actorNumber) {
	const bs = battleState;
	if (!bs) return `${side}0`;

	const firstSide = bs.firstSide;
	const secondSide = firstSide === 'player' ? 'enemy' : 'player';

	// 先手方的编号就是 actorNumber
	// 后手方的编号也是 actorNumber
	// 但全局轮次中，先手1→后手1→先手2→后手2...
	// 所以这里直接用 actorNumber 作为位次编号
	return `${side}${actorNumber}`;
}
/**
 * 为角色添加一个 buff
 * @param {Object} target - 目标角色
 * @param {Object} buffConfig - buff 配置
 * @param {string} buffConfig.id - buff 唯一标识
 * @param {string} buffConfig.name - buff 名称
 * @param {string} buffConfig.type - buff 类型：'seal'|'stun'|'paralyze'|'healBlock'|'healReduce'|'poison'|'takeUp'(受伤增加)|'takeDn'(减伤)|'baoji'|'kangbao'|'baoshang'|'shouhu'|'mingzhong'|'shanbi'|'poji'|'gedang'（特种属性 value 为万分数，如 3000 = 30%；healReduce 的 value 为被治疗量降低比例，如 0.8 = 降疗80%；takeUp 的 value 为该单位受到伤害增加比例，如 0.3 = 受伤+30%）
 * @param {number} buffConfig.remainRounds - 持续轮次（-1 永久）
 * @param {string} buffConfig.sourceSide - 施加者阵营（可选）
 * @param {string} buffConfig.sourceId - 施加者 instanceId
 * @param {any} buffConfig.value - 附加数值
 * @param {string} buffConfig.ownerSlot - 施加者行动位次（可选，如不传则自动获取）
 */
Battle.addBuff = function addBuff(target, buffConfig) {
	if (!target || !target.buffList) {
		target.buffList = [];
	}

	const bs = battleState;
	if (!bs) return;

	// 获取施加者的行动位次
	let ownerSlot = buffConfig.ownerSlot;
	if (!ownerSlot) {
		const currentActor = bs.currentTurnSide === 'player'
			? bs.playerUnits[bs.currentTurnIndex]
			: bs.enemyUnits[bs.currentTurnIndex];
		if (currentActor && currentActor._currentActionSlotKey) {
			ownerSlot = currentActor._currentActionSlotKey;
		} else {
			const sourceSide = buffConfig.sourceSide || bs.currentTurnSide;
			const actorNumber = (bs.actedSlots[sourceSide]?.size || 0);
			const sideLabel = sourceSide === 'player' ? '先手' : '后手';
			ownerSlot = `${sideLabel}${actorNumber}`;
		}
	}

	// 检查是否已存在同ID的 buff
	const existingIndex = target.buffList.findIndex(b => b.id === buffConfig.id);

	if (existingIndex !== -1) {
		const existing = target.buffList[existingIndex];
		// 如果已有的buff剩余轮次 >= 新buff的轮次，则不覆盖
		if (existing.remainRounds >= buffConfig.remainRounds && buffConfig.remainRounds !== -1) {
			return;
		}
		// 否则替换
		target.buffList[existingIndex] = {
			id: buffConfig.id,
			name: buffConfig.name,
			type: buffConfig.type,
			remainRounds: buffConfig.remainRounds,
			ownerSlot: ownerSlot,
			createdAtSlotGen: (battleState.slotGen && battleState.slotGen[ownerSlot]) || 0,
			sourceId: buffConfig.sourceId || '',
			value: buffConfig.value || null,
		};
	} else {
		target.buffList.push({
			id: buffConfig.id,
			name: buffConfig.name,
			type: buffConfig.type,
			remainRounds: buffConfig.remainRounds,
			ownerSlot: ownerSlot,
			createdAtSlotGen: (battleState.slotGen && battleState.slotGen[ownerSlot]) || 0,
			sourceId: buffConfig.sourceId || '',
			value: buffConfig.value || null,
		});
	}

	// 立即应用buff效果
	applyBuffEffect(target, buffConfig);
}

// 暴露给 charBreakthroughConfig.js 等回调模块使用（避免循环import）
// 注意：必须用 Battle.addBuff 而非裸名 addBuff，裸名由文件末尾别名块定义，顶层引用会触发 TDZ
shared.addBuff = Battle.addBuff;

/**
 * 应用 buff 的即时效果
 */
Battle.applyBuffEffect = function applyBuffEffect(target, buffConfig) {
	switch (buffConfig.type) {
		case 'seal':
			target.sealed = true;
			addBattleLog(`${target.name} 被封印${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'stun':
			target.stunned = true;
			addBattleLog(`${target.name} 被眩晕${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'paralyze':
			target.paralyzed = true;
			addBattleLog(`${target.name} 被麻痹${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'healBlock':
			target.healBlocked = true;
			addBattleLog(`${target.name} 被禁疗${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'healReduce':
			// 降疗：被治疗百分率（pctBeHeal）降低 value（如 0.8 = 降疗80%），下限 -1（即治疗量降为0）
			target.pctBeHeal = Math.max(-1, (target.pctBeHeal ?? 0) - (buffConfig.value || 0));
			addBattleLog(`${target.name} 被治疗量降低 ${Math.round((buffConfig.value || 0) * 100)}%`);
			break;
		case 'poison':
			// 中毒伤害叠加
			target.poisonDamage = (target.poisonDamage || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 中毒，每回合失去 ${buffConfig.value} 生命`);
			break;
		case 'dealUp':
			// 造成伤害增加：作为攻击方条件增伤的正值，在伤害结算第六步（onDamageCalc）读取 buffList 计入
			addBattleLog(`${target.name} 造成伤害增加${(buffConfig.value * 100).toFixed(0)}%`);
			break;
		case 'dealDn':
			// 造成伤害减少：作为攻击方条件增伤的负值，在第六步读取 buffList 计入
			addBattleLog(`${target.name} 造成伤害减少${(buffConfig.value * 100).toFixed(0)}%`);
			break;
		case 'takeUp':
			// 受伤增加：作为目标条件减伤的负值，在伤害结算第六步（onDamageTaken）读取 buffList 计入
			addBattleLog(`${target.name} 受伤增加${(buffConfig.value * 100).toFixed(0)}%`);
			break;
		case 'takeDn':
			// 减伤：作为目标条件减伤的正值，在伤害结算第六步（onDamageTaken）读取 buffList 统一计入
			addBattleLog(`${target.name} 减伤${(buffConfig.value * 100).toFixed(0)}%`);
			break;
		// ===== 【新增】特种属性类 buff（value 为万分数，如 3000 = 30%） =====
		case 'baoji':
			target.baoji = (target.baoji || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 暴击率提升 ${buffConfig.value}`);
			break;
		case 'kangbao':
			target.kangbao = (target.kangbao || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 抗暴率提升 ${buffConfig.value}`);
			break;
		case 'baoshang':
			target.baoshang = (target.baoshang || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 暴伤提升 ${buffConfig.value}`);
			break;
		case 'shouhu':
			target.shouhu = (target.shouhu || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 守护提升 ${buffConfig.value}`);
			break;
		case 'mingzhong':
			target.mingzhong = (target.mingzhong || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 命中率提升 ${buffConfig.value}`);
			break;
		case 'shanbi':
			target.shanbi = (target.shanbi || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 闪避率提升 ${buffConfig.value}`);
			break;
		case 'poji':
			target.poji = (target.poji || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 破击率提升 ${buffConfig.value}`);
			break;
		case 'gedang':
			target.gedang = (target.gedang || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 格挡率提升 ${buffConfig.value}`);
			break;
		// ===== 【新增】攻击力百分比 buff（atk：value 为带符号分数，如 0.3 增 / -0.3 减）=====
		case 'atk':
			target.atkPctBonus = (target.atkPctBonus || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 攻击力${buffConfig.value >= 0 ? '提升' : '降低'} ${Math.round(Math.abs(buffConfig.value) * 100)}%`);
			break;
		// ===== 【新增】治疗效果百分比 buff（healBoost：value 为带符号分数）=====
		case 'healBoost':
			target.healBoost = (target.healBoost || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 治疗效果${buffConfig.value >= 0 ? '提升' : '降低'} ${Math.round(Math.abs(buffConfig.value) * 100)}%`);
			break;
		// 可以扩展更多 buff 类型
	}
	updateBattleUI();
}

/**
 * 移除角色的指定 buff
 */
Battle.removeBuff = function removeBuff(target, buffId) {
	if (!target || !target.buffList) return;

	const index = target.buffList.findIndex(b => b.id === buffId);
	if (index === -1) return;

	const buff = target.buffList[index];
	target.buffList.splice(index, 1);

	// 移除 buff 效果
	removeBuffEffect(target, buff);
}

/**
 * 移除 buff 效果
 */
Battle.removeBuffEffect = function removeBuffEffect(target, buff) {
	switch (buff.type) {
		case 'seal':
			target.sealed = false;
			addBattleLog(`${target.name} 的封印已解除`);
			break;
		case 'stun':
			target.stunned = false;
			addBattleLog(`${target.name} 的眩晕已解除`);
			break;
		case 'paralyze':
			target.paralyzed = false;
			addBattleLog(`${target.name} 的麻痹已解除`);
			break;
		case 'healBlock':
			target.healBlocked = false;
			addBattleLog(`${target.name} 的禁疗已解除`);
			break;
		case 'healReduce':
			// 降疗移除时，被治疗百分率加回原值
			target.pctBeHeal = (target.pctBeHeal ?? 0) + (buff.value || 0);
			addBattleLog(`${target.name} 的降疗效果已解除`);
			break;
		case 'poison':
			// ===== 【修改】中毒移除时，减去对应数值 =====
			if (buff.value) {
				target.poisonDamage = Math.max(0, (target.poisonDamage || 0) - buff.value);
				if (target.poisonDamage <= 0) {
					addBattleLog(`${target.name} 的中毒已解除`);
				} else {
					addBattleLog(`${target.name} 的中毒效果部分解除，剩余中毒伤害 ${target.poisonDamage}`);
				}
			}
			break;
		case 'dealUp':
		case 'dealDn':
			// 造成伤害增减由第六步伤害结算读取 buffList 处理，此处无需回退字段
			break;
		case 'takeUp':
			// 受伤增加由第六步伤害结算读取 buffList 处理，此处无需回退字段
			break;
		case 'takeDn':
			// 减伤由第六步伤害结算读取 buffList 处理，此处无需回退字段
			break;
		// ===== 【新增】特种属性类 buff 移除时反向减回（与 applyBuffEffect 对应） =====
		case 'baoji':
			target.baoji = Math.max(0, (target.baoji || 0) - (buff.value || 0));
			break;
		case 'kangbao':
			target.kangbao = Math.max(0, (target.kangbao || 0) - (buff.value || 0));
			break;
		case 'baoshang':
			target.baoshang = Math.max(0, (target.baoshang || 0) - (buff.value || 0));
			break;
		case 'shouhu':
			target.shouhu = Math.max(0, (target.shouhu || 0) - (buff.value || 0));
			break;
		case 'mingzhong':
			target.mingzhong = Math.max(0, (target.mingzhong || 0) - (buff.value || 0));
			break;
		case 'shanbi':
			target.shanbi = Math.max(0, (target.shanbi || 0) - (buff.value || 0));
			break;
		case 'poji':
			target.poji = Math.max(0, (target.poji || 0) - (buff.value || 0));
			break;
		case 'gedang':
			target.gedang = Math.max(0, (target.gedang || 0) - (buff.value || 0));
			break;
		case 'atk':
			target.atkPctBonus = (target.atkPctBonus || 0) - (buff.value || 0);
			break;
		case 'healBoost':
			target.healBoost = (target.healBoost || 0) - (buff.value || 0);
			break;
	}
	updateBattleUI();
}

/**
 * 角色阵亡时清除所有 buff
 */
Battle.clearBuffsOnDeath = function clearBuffsOnDeath(target) {
	if (!target || !target.buffList || target.buffList.length === 0) {
		// 即使 buffList 为空，也要清理直接状态（如 permanentlySealed）
		if (target) {
			target.permanentlySealed = false;
			target.sealed = false;
			target.stunned = false;
			target.paralyzed = false;
			target.healBlocked = false;
			target.poisonDamage = 0;
		}
		return;
	}

	// 从后往前移除所有 buff（避免索引错乱），但不刷屏日志
	const buffs = [...target.buffList];
	buffs.reverse().forEach(buff => {
		removeBuffEffect(target, buff);
	});
	target.buffList = [];

	// 兜底清理直接状态
	target.permanentlySealed = false;
}


/**
 * 轮次结算时处理所有 buff 的存续
 * 在 endRound 中调用
 */
Battle.processBuffExpiryOnRoundEnd = function processBuffExpiryOnRoundEnd() {
	const bs = battleState;
	if (!bs) return;

	const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u && u.alive);

	allUnits.forEach(unit => {
		if (!unit.buffList || unit.buffList.length === 0) return;

		const expiredBuffs = [];

		unit.buffList.forEach((buff, index) => {
			if (buff.remainRounds === -1) return; // 永久 buff 不处理

			// buff 持续轮次 -1
			buff.remainRounds--;

			if (buff.remainRounds <= 0) {
				expiredBuffs.push(index);
			}
		});

		// 从后往前移除过期 buff
		expiredBuffs.reverse().forEach(index => {
			const buff = unit.buffList[index];
			unit.buffList.splice(index, 1);
			removeBuffEffect(unit, buff);
		});
	});
}

/**
 * 在角色行动开始时处理 buff 的存续
 * 在 nextTurn 中找到行动角色后调用
 */
Battle.processBuffExpiryOnActionStart = function processBuffExpiryOnActionStart(actor) {
	if (!actor || !actor.buffList) return;

	const bs = battleState;
	if (!bs) return;

	const expiredBuffs = [];

	actor.buffList.forEach((buff, index) => {
		if (buff.remainRounds === -1) return;

		// 获取施加者的行动位次信息
		const ownerSide = buff.ownerSlot.replace(/\d+$/, '');
		const ownerNumber = parseInt(buff.ownerSlot.match(/\d+$/)[0]);

		// 获取当前角色的行动位次
		const currentSide = actor.side;
		const actorNumber = bs.actedSlots[currentSide]?.size || 0;

		// 判断：如果当前角色的位次与施加者位次相同（同编号），则 buff 轮次 -1
		// 即：施加者位次编号 == 当前角色位次编号，且阵营相同
		if (ownerSide === currentSide && ownerNumber === actorNumber) {
			buff.remainRounds--;

			if (buff.remainRounds <= 0) {
				expiredBuffs.push(index);
			}
		}
	});

	// 从后往前移除过期 buff
	expiredBuffs.reverse().forEach(index => {
		const buff = actor.buffList[index];
		actor.buffList.splice(index, 1);
		removeBuffEffect(actor, buff);
	});
}
/**
 * 根据行动位次标识，处理所有角色身上由该位次施加的buff衰减
 * @param {string} actionSlotKey - 如 '先手1', '后手3' 等
 */
Battle.processBuffDecayBySlotKey = function processBuffDecayBySlotKey(actionSlotKey) {
	const bs = battleState;
	if (!bs) return;

	const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u && u.alive);

	allUnits.forEach(unit => {
		if (!unit.buffList || unit.buffList.length === 0) return;

		const expiredBuffs = [];

		unit.buffList.forEach((buff, index) => {
			if (buff.remainRounds === -1) return; // 永久buff不衰减

			// 判断：buff的施加者位次是否等于当前行动位次
			if (buff.ownerSlot === actionSlotKey) {
				// 仅对「早于当前行动世代」创建的 buff 衰减。
				// 本次行动内刚施加的 buff（createdAtSlotGen === 当前世代）跳过本次衰减，
				// 使其存活到该位格下次行动（即「持续1回合」的准确语义）。
				const curGen = (bs.slotGen && bs.slotGen[actionSlotKey]) || 0;
				if ((buff.createdAtSlotGen ?? 0) < curGen) {
					buff.remainRounds--;

					if (buff.remainRounds <= 0) {
						expiredBuffs.push(index);
					}
				}
			}
		});

		// 从后往前移除过期buff
		expiredBuffs.reverse().forEach(index => {
			const buff = unit.buffList[index];
			unit.buffList.splice(index, 1);
			removeBuffEffect(unit, buff);
		});
	});
}
/**
 * 根据角色ID、等级、突破等级编译敌方角色属性
 * @param {string} charId - 角色ID
 * @param {number} level - 等级
 * @param {number} tupolevel - 突破等级
 * @param {Object} overrides - 可选，覆盖特定属性
 * @param {Object} teamBonuses - 可选，全队突破加成汇总
 * @returns {Object} 编译后的角色属性
 */
Battle.compileEnemyStats = function compileEnemyStats(charId, level, tupolevel, overrides = {}, teamBonuses = null) {
	const baseChar = characterList[charId];
	if (!baseChar) {
		return {
			hp: 500, atk: 50, def: 25, spe: 50,
			maxHp: 500,
			mingzhong: 10000, shanbi: 0, baoji: 0, kangbao: 0, baoshang: 0, shouhu: 0, poji: 0, gedang: 0,
			fixedDealUp: 0, fixedTakeDn: 0, pctDealUp: 0, pctTakeDn: 0,
			fixedHeal: 0, fixedBeHeal: 0, pctHeal: 0, pctBeHeal: 0
		};
	}

	const rank = overrides.rank || baseChar.rank || 'common';
	const template = overrides.template || baseChar.template || 'balanced';

	// 1. 获取模板基础属性
	const templateData = characterTemplate || characterTemplate;
	let baseStats;
	if (templateData && templateData[template] && templateData[template][rank]) {
		baseStats = { ...templateData[template][rank] };
	} else {
		baseStats = { hp: 500, atk: 50, def: 25, spe: 50 };
	}

	// 2. 计算等级成长
	const growthFactor = (100 + 10 * (level - 1)) / 100;
	let hp = Math.floor(baseStats.hp * growthFactor);
	let atk = Math.floor(baseStats.atk * growthFactor);
	let def = Math.floor(baseStats.def * growthFactor);
	let spe = Math.floor(baseStats.spe * growthFactor);

	// ===== 【新增】突破基础收益：每次突破增加模板基础值的一半 =====
	const tupoLevel = tupolevel || 0;
	hp += Math.floor(baseStats.hp * 0.5 * tupoLevel);
	atk += Math.floor(baseStats.atk * 0.5 * tupoLevel);
	def += Math.floor(baseStats.def * 0.5 * tupoLevel);
	spe += Math.floor(baseStats.spe * 0.5 * tupoLevel);

	// 3. 初始化特殊属性（基础值）
	let mingzhong = 10000;
	let shanbi = 0;
	let baoji = 0;
	let kangbao = 0;
	let baoshang = 0;
	let shouhu = 0;
	let poji = 0;
	let gedang = 0;
	let fixedDealUp = 0;
	let fixedTakeDn = 0;
	let pctDealUp = 0;
	let pctTakeDn = 0;
	let fixedHeal = 0;
	let fixedBeHeal = 0;
	let pctHeal = 0;
	let pctBeHeal = 0;

	// 4. 应用突破加成（自身）
	const tupoList = baseChar.tupoList || [];
	const effectiveTupoLevel = Math.min(tupolevel || 0, tupoList.length);

	// 收集自身的 team_stat 加成，用于计算全队汇总
	let selfTeamFlat = { hp: 0, atk: 0, def: 0, spe: 0, mingzhong: 0, shanbi: 0, baoji: 0, kangbao: 0, baoshang: 0, shouhu: 0, poji: 0, gedang: 0, fixedDealUp: 0, fixedTakeDn: 0, fixedHeal: 0, fixedBeHeal: 0 };
	let selfTeamPercent = { atk: 0, def: 0, hp: 0, spe: 0, pctDealUp: 0, pctTakeDn: 0, pctHeal: 0, pctBeHeal: 0 };

	for (let i = 0; i < effectiveTupoLevel; i++) {
		const buff = tupoList[i];
		if (!buff) continue;

		let resolvedBuff = buff;
		if (typeof buff === 'string') {
			const lib = BREAKTHROUGH_BUFF_LIBRARY || {};
			resolvedBuff = lib[buff];
		}
		if (!resolvedBuff) continue;

		const type = resolvedBuff.type;
		switch (type) {
			case 'self_stat_flat':
				if (resolvedBuff.hp !== undefined) hp += Number(resolvedBuff.hp);
				if (resolvedBuff.atk !== undefined) atk += Number(resolvedBuff.atk);
				if (resolvedBuff.def !== undefined) def += Number(resolvedBuff.def);
				if (resolvedBuff.spe !== undefined) spe += Number(resolvedBuff.spe);
				if (resolvedBuff.mingzhong !== undefined) mingzhong += Number(resolvedBuff.mingzhong);
				if (resolvedBuff.shanbi !== undefined) shanbi += Number(resolvedBuff.shanbi);
			if (resolvedBuff.baoji !== undefined) baoji += Number(resolvedBuff.baoji);
			if (resolvedBuff.kangbao !== undefined) kangbao += Number(resolvedBuff.kangbao);
			if (resolvedBuff.baoshang !== undefined) baoshang += Number(resolvedBuff.baoshang);
			if (resolvedBuff.shouhu !== undefined) shouhu += Number(resolvedBuff.shouhu);
				if (resolvedBuff.poji !== undefined) poji += Number(resolvedBuff.poji);
				if (resolvedBuff.gedang !== undefined) gedang += Number(resolvedBuff.gedang);
				if (resolvedBuff.fixedDealUp !== undefined) fixedDealUp += Number(resolvedBuff.fixedDealUp);
				if (resolvedBuff.fixedTakeDn !== undefined) fixedTakeDn += Number(resolvedBuff.fixedTakeDn);
				if (resolvedBuff.fixedHeal !== undefined) fixedHeal += Number(resolvedBuff.fixedHeal);
				if (resolvedBuff.fixedBeHeal !== undefined) fixedBeHeal += Number(resolvedBuff.fixedBeHeal);
				break;

			case 'self_stat_percent':
				if (resolvedBuff.atk !== undefined) atk = Math.floor(atk * (1 + Number(resolvedBuff.atk)));
				if (resolvedBuff.def !== undefined) def = Math.floor(def * (1 + Number(resolvedBuff.def)));
				if (resolvedBuff.hp !== undefined) hp = Math.floor(hp * (1 + Number(resolvedBuff.hp)));
				if (resolvedBuff.spe !== undefined) spe = Math.floor(spe * (1 + Number(resolvedBuff.spe)));
				if (resolvedBuff.pctDealUp !== undefined) pctDealUp += Number(resolvedBuff.pctDealUp);
				if (resolvedBuff.pctTakeDn !== undefined) pctTakeDn += Number(resolvedBuff.pctTakeDn);
				if (resolvedBuff.pctHeal !== undefined) pctHeal += Number(resolvedBuff.pctHeal);
				if (resolvedBuff.pctBeHeal !== undefined) pctBeHeal += Number(resolvedBuff.pctBeHeal);
				break;

			case 'team_stat_flat':
				// 收集全队固定加成
				if (resolvedBuff.hp !== undefined) selfTeamFlat.hp += Number(resolvedBuff.hp);
				if (resolvedBuff.atk !== undefined) selfTeamFlat.atk += Number(resolvedBuff.atk);
				if (resolvedBuff.def !== undefined) selfTeamFlat.def += Number(resolvedBuff.def);
				if (resolvedBuff.spe !== undefined) selfTeamFlat.spe += Number(resolvedBuff.spe);
				if (resolvedBuff.mingzhong !== undefined) selfTeamFlat.mingzhong += Number(resolvedBuff.mingzhong);
				if (resolvedBuff.shanbi !== undefined) selfTeamFlat.shanbi += Number(resolvedBuff.shanbi);
			if (resolvedBuff.baoji !== undefined) selfTeamFlat.baoji += Number(resolvedBuff.baoji);
			if (resolvedBuff.kangbao !== undefined) selfTeamFlat.kangbao += Number(resolvedBuff.kangbao);
			if (resolvedBuff.baoshang !== undefined) selfTeamFlat.baoshang += Number(resolvedBuff.baoshang);
			if (resolvedBuff.shouhu !== undefined) selfTeamFlat.shouhu += Number(resolvedBuff.shouhu);
				if (resolvedBuff.poji !== undefined) selfTeamFlat.poji += Number(resolvedBuff.poji);
				if (resolvedBuff.gedang !== undefined) selfTeamFlat.gedang += Number(resolvedBuff.gedang);
				if (resolvedBuff.fixedDealUp !== undefined) selfTeamFlat.fixedDealUp += Number(resolvedBuff.fixedDealUp);
				if (resolvedBuff.fixedTakeDn !== undefined) selfTeamFlat.fixedTakeDn += Number(resolvedBuff.fixedTakeDn);
				if (resolvedBuff.fixedHeal !== undefined) selfTeamFlat.fixedHeal += Number(resolvedBuff.fixedHeal);
				if (resolvedBuff.fixedBeHeal !== undefined) selfTeamFlat.fixedBeHeal += Number(resolvedBuff.fixedBeHeal);
				break;

			case 'team_stat_percent':
				// 收集全队百分比加成
				if (resolvedBuff.atk !== undefined) selfTeamPercent.atk += Number(resolvedBuff.atk);
				if (resolvedBuff.def !== undefined) selfTeamPercent.def += Number(resolvedBuff.def);
				if (resolvedBuff.hp !== undefined) selfTeamPercent.hp += Number(resolvedBuff.hp);
				if (resolvedBuff.spe !== undefined) selfTeamPercent.spe += Number(resolvedBuff.spe);
				if (resolvedBuff.pctDealUp !== undefined) selfTeamPercent.pctDealUp += Number(resolvedBuff.pctDealUp);
				if (resolvedBuff.pctTakeDn !== undefined) selfTeamPercent.pctTakeDn += Number(resolvedBuff.pctTakeDn);
				if (resolvedBuff.pctHeal !== undefined) selfTeamPercent.pctHeal += Number(resolvedBuff.pctHeal);
				if (resolvedBuff.pctBeHeal !== undefined) selfTeamPercent.pctBeHeal += Number(resolvedBuff.pctBeHeal);
				break;
		}
	}

	// ===== 【新增】应用全队突破加成 =====
	if (teamBonuses) {
		// 全队固定加成
		hp += teamBonuses.teamFlat.hp || 0;
		atk += teamBonuses.teamFlat.atk || 0;
		def += teamBonuses.teamFlat.def || 0;
		spe += teamBonuses.teamFlat.spe || 0;
		mingzhong += teamBonuses.teamFlat.mingzhong || 0;
		shanbi += teamBonuses.teamFlat.shanbi || 0;
		baoji += teamBonuses.teamFlat.baoji || 0;
		kangbao += teamBonuses.teamFlat.kangbao || 0;
		baoshang += teamBonuses.teamFlat.baoshang || 0;
		shouhu += teamBonuses.teamFlat.shouhu || 0;
		poji += teamBonuses.teamFlat.poji || 0;
		gedang += teamBonuses.teamFlat.gedang || 0;
		fixedDealUp += teamBonuses.teamFlat.fixedDealUp || 0;
		fixedTakeDn += teamBonuses.teamFlat.fixedTakeDn || 0;
		fixedHeal += teamBonuses.teamFlat.fixedHeal || 0;
		fixedBeHeal += teamBonuses.teamFlat.fixedBeHeal || 0;

		// 全队百分比加成（在固定加成之后应用）
		const teamPercentHp = teamBonuses.teamPercent.hp || 0;
		const teamPercentAtk = teamBonuses.teamPercent.atk || 0;
		const teamPercentDef = teamBonuses.teamPercent.def || 0;
		const teamPercentSpe = teamBonuses.teamPercent.spe || 0;

		if (teamPercentHp > 0) hp = Math.floor(hp * (1 + teamPercentHp));
		if (teamPercentAtk > 0) atk = Math.floor(atk * (1 + teamPercentAtk));
		if (teamPercentDef > 0) def = Math.floor(def * (1 + teamPercentDef));
		if (teamPercentSpe > 0) spe = Math.floor(spe * (1 + teamPercentSpe));

		pctDealUp += teamBonuses.teamPercent.pctDealUp || 0;
		pctTakeDn += teamBonuses.teamPercent.pctTakeDn || 0;
		pctHeal += teamBonuses.teamPercent.pctHeal || 0;
		pctBeHeal += teamBonuses.teamPercent.pctBeHeal || 0;
	}

	// 5. 应用覆盖值
	if (overrides.hp !== undefined) hp = overrides.hp;
	if (overrides.atk !== undefined) atk = overrides.atk;
	if (overrides.def !== undefined) def = overrides.def;
	if (overrides.spe !== undefined) spe = overrides.spe;
	if (overrides.mingzhong !== undefined) mingzhong = overrides.mingzhong;
	// ... 其他覆盖值保持不变 ...

	return {
		hp, atk, def, spe,
		maxHp: hp,
		mingzhong, shanbi, baoji, kangbao, baoshang, shouhu, poji, gedang,
		fixedDealUp, fixedTakeDn, pctDealUp, pctTakeDn,
		fixedHeal, fixedBeHeal, pctHeal, pctBeHeal,
		// ===== 【新增】返回团队加成信息 =====
		_teamBuffs: selfTeamFlat,
		_teamPercentBuffs: selfTeamPercent
	};
}

/**
 * 计算敌人队伍的全队突破加成汇总
 * @param {Array} enemyTeam - 敌人队伍数组
 * @returns {Object} { teamFlat: {...}, teamPercent: {...} }
 */
Battle.calculateEnemyTeamBonuses = function calculateEnemyTeamBonuses(enemyTeam) {
    const teamFlat = { hp: 0, atk: 0, def: 0, spe: 0, mingzhong: 0, shanbi: 0, baoji: 0, kangbao: 0, baoshang: 0, shouhu: 0, poji: 0, gedang: 0, fixedDealUp: 0, fixedTakeDn: 0, fixedHeal: 0, fixedBeHeal: 0 };
    const teamPercent = { hp: 0, atk: 0, def: 0, spe: 0, pctDealUp: 0, pctTakeDn: 0, pctHeal: 0, pctBeHeal: 0 };

    enemyTeam.forEach(data => {
        if (!data || !data.id) return;
        const baseChar = characterList[data.id];
        if (!baseChar) return;

        const tupoList = data.tupoList || baseChar.tupoList || [];
        const tupolevel = data.tupolevel || 0;
        const effectiveLevel = Math.min(tupolevel, tupoList.length);

        for (let i = 0; i < effectiveLevel; i++) {
            const buff = tupoList[i];
            if (!buff) continue;

            let resolvedBuff = buff;
            if (typeof buff === 'string') {
                const lib = BREAKTHROUGH_BUFF_LIBRARY || BREAKTHROUGH_BUFF_LIBRARY || {};
                resolvedBuff = lib[buff];
            }
            if (!resolvedBuff) continue;

            const type = resolvedBuff.type;
            switch (type) {
                case 'team_stat_flat':
                    if (resolvedBuff.hp !== undefined) teamFlat.hp += Number(resolvedBuff.hp);
                    if (resolvedBuff.atk !== undefined) teamFlat.atk += Number(resolvedBuff.atk);
                    if (resolvedBuff.def !== undefined) teamFlat.def += Number(resolvedBuff.def);
                    if (resolvedBuff.spe !== undefined) teamFlat.spe += Number(resolvedBuff.spe);
                    if (resolvedBuff.mingzhong !== undefined) teamFlat.mingzhong += Number(resolvedBuff.mingzhong);
                    if (resolvedBuff.shanbi !== undefined) teamFlat.shanbi += Number(resolvedBuff.shanbi);
                    if (resolvedBuff.baoji !== undefined) teamFlat.baoji += Number(resolvedBuff.baoji);
                    if (resolvedBuff.kangbao !== undefined) teamFlat.kangbao += Number(resolvedBuff.kangbao);
                    if (resolvedBuff.baoshang !== undefined) teamFlat.baoshang += Number(resolvedBuff.baoshang);
                    if (resolvedBuff.shouhu !== undefined) teamFlat.shouhu += Number(resolvedBuff.shouhu);
                    if (resolvedBuff.poji !== undefined) teamFlat.poji += Number(resolvedBuff.poji);
                    if (resolvedBuff.gedang !== undefined) teamFlat.gedang += Number(resolvedBuff.gedang);
                    if (resolvedBuff.fixedDealUp !== undefined) teamFlat.fixedDealUp += Number(resolvedBuff.fixedDealUp);
                    if (resolvedBuff.fixedTakeDn !== undefined) teamFlat.fixedTakeDn += Number(resolvedBuff.fixedTakeDn);
                    if (resolvedBuff.fixedHeal !== undefined) teamFlat.fixedHeal += Number(resolvedBuff.fixedHeal);
                    if (resolvedBuff.fixedBeHeal !== undefined) teamFlat.fixedBeHeal += Number(resolvedBuff.fixedBeHeal);
                    break;

                case 'team_stat_percent':
                    if (resolvedBuff.atk !== undefined) teamPercent.atk += Number(resolvedBuff.atk);
                    if (resolvedBuff.def !== undefined) teamPercent.def += Number(resolvedBuff.def);
                    if (resolvedBuff.hp !== undefined) teamPercent.hp += Number(resolvedBuff.hp);
                    if (resolvedBuff.spe !== undefined) teamPercent.spe += Number(resolvedBuff.spe);
                    if (resolvedBuff.pctDealUp !== undefined) teamPercent.pctDealUp += Number(resolvedBuff.pctDealUp);
                    if (resolvedBuff.pctTakeDn !== undefined) teamPercent.pctTakeDn += Number(resolvedBuff.pctTakeDn);
                    if (resolvedBuff.pctHeal !== undefined) teamPercent.pctHeal += Number(resolvedBuff.pctHeal);
                    if (resolvedBuff.pctBeHeal !== undefined) teamPercent.pctBeHeal += Number(resolvedBuff.pctBeHeal);
                    break;
            }
        }
    });

    return { teamFlat, teamPercent };
}
// 战斗流程函数通过 core.js 的 Game.Battle 暴露，不再挂全局 window


// ====== 快捷适配层：把 Battle 静态方法镜像为模块级裸名，供内部裸名互调 ======
Battle.events = BattleEvents;
const {
  log: addBattleLog,
  updateUI: updateBattleUI,
  showDamageNumber,
  hidePlayerActionUI,
  clearTargetHighlights,
  getAliveUnits,
  isSideDefeated,
  findNextActor,
  resetActedSlots,
  shuffleArray,
  calculateDamage,
  applyDamage,
  applyHeal,
  executePugong,
  executeSkill,
  nextTurn,
  afterAction,
  endRound,
  bs_animateAction,
  executeAITurn,
  executePlayerTurn,
  showBattleIntro,
  end: endBattle,
  getSkillEmoji,
  showPlayerActionUI,
  enterTargetSelection,
  highlightSelectableTargets,
  onTargetClicked,
  aiChooseAction,
  aiSelectTargets,
  resolveSkillTargets,
  selectBestSingleTarget,
  selectRowTargetsSmart,
  selectColumnTargetsSmart,
  showBattleResult,
  normalizeBreakthroughData,
  adaptBreakthroughSkillEffect,
  adaptTreasureEffects,
  start: startBattle,
  getEffectsByTrigger,
  triggerGlobalEffect,
  triggerSelfEffect,
  applyTeamBreakthroughBuffs,
  renderBattleView,
  createUnitSlot,
  showSkillEffectOnTargets,
  showSkillEffect,
  getEmojiClass,
  getSkillEffectInfo,
  getActionOrderInRound,
  getActionSlotKey,
  addBuff,
  applyBuffEffect,
  removeBuff,
  removeBuffEffect,
  clearBuffsOnDeath,
  processBuffExpiryOnRoundEnd,
  processBuffExpiryOnActionStart,
  processBuffDecayBySlotKey,
  compileEnemyStats,
  calculateEnemyTeamBonuses,
} = Battle;

export { Battle, BattleEvents };
