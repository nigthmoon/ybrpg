// ====== 夜白旅程 - 重构战斗核心系统 (事件驱动版) ======

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

// 导出全局事件对象（方便其他模块访问）
window.BattleEvents = BattleEvents;

// ====== 2. 基础工具函数 ======

/**
 * 
 * @param {*} msg 战斗信息记录 
 * @returns 战斗信息记录 
 */
function addBattleLog(msg) {
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
 * 
 * @returns 战斗画面更新
 */
function updateBattleUI() {
	const bs = battleState;
	if (!bs) return;

	const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u);
	allUnits.forEach(unit => {
		const slot = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
		if (!slot) return;

		if (!unit.alive) slot.classList.add('dead');
		else slot.classList.remove('dead');

		if (unit.sealed || unit.permanentlySealed) slot.classList.add('sealed');
		else slot.classList.remove('sealed');

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
function showDamageNumber(unit, value, type) {
	const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
	if (!slotEl) return;
	const float = document.createElement('div');
	float.className = 'damage-float ' + (type.isHeal ? 'heal' : 'damage');

	if(type.isHeal){
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
	if(type.isPoison){
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
function hidePlayerActionUI() {
	const panel = document.getElementById('battle-action-panel');
	if (panel) panel.remove();
	clearTargetHighlights();
}

/**
 * 清除高亮
 */
function clearTargetHighlights() {
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
function getAliveUnits(side) {
	const units = side === 'player' ? battleState.playerUnits : battleState.enemyUnits;
	return units.filter(u => u && u.alive);
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 判断该阵营是否全灭
 */
function isSideDefeated(side) {
	return getAliveUnits(side).length === 0;
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 检索该阵营的首个可未行动角色
 */
function findNextActor(side) {
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
function resetActedSlots() {
	const bs = battleState;
	bs.actedSlots = { player: new Set(), enemy: new Set() };
}

/**
 * 
 * @param {array} array 填入角色组成的数组
 * @returns 随机重新排序（其他随机选目标会直接调用其前随机数值个角色未目标）
 */
function shuffleArray(array) {
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
function calculateDamage(attacker, defender, coefficient, extraEnergy = 0) {
	const atk = Number(attacker.atk) || 0;
	const def = Number(defender.def) || 0;
	const coeff = Number(coefficient) || 1.0;

	let baseDmg = Math.floor(atk * coeff);
	if (extraEnergy > 0) {
		baseDmg = Math.floor(baseDmg * (1 + extraEnergy * 0.1));
	}

	// ===== 第一步：命中/闪避判定 =====
	const hitRate = Math.max(0, ((attacker.hit ?? 10000) - (defender.dodge ?? 0))) / 10000;
	const isMiss = Math.random() > hitRate;

	if (isMiss) {
		addBattleLog(`${attacker.name} 攻击 ${defender.name}，但被闪避了！`);
		showDamageNumber(defender, 0, { isShanbi: true });  // 修改这里
		return 0;
	}

	// ===== 第二步：暴击/抗暴判定 =====
	const critRate = Math.max(0, ((attacker.crit ?? 0) - (defender.critResist ?? 0))) / 10000;
	const isCrit = Math.random() < critRate;

	let finalDmg = baseDmg;
	let isBlock = false;

	if (isCrit) {
		// 暴击成功：伤害×2，不进行格挡判定
		finalDmg = baseDmg * 2;
	} else {
		// ===== 第三步：格挡判定（仅当不暴击时） =====
		const blockRate = Math.max(0, ((defender.block ?? 0) - (attacker.pierce ?? 0))) / 10000;
		isBlock = Math.random() < blockRate;

		if (isBlock) {
			// 格挡成功：伤害减半
			finalDmg = Math.floor(baseDmg * 0.5);
		}
	}

	// ===== 第四步：防御减免（格挡时也减半防御） =====
	if (isBlock) {
		finalDmg = Math.max(1, Math.floor(finalDmg - Math.floor(def * 0.5)));
	} else {
		finalDmg = Math.max(1, Math.floor(finalDmg - def));
	}

	// ===== 第五步：增伤/减伤 =====
	const totalPctDmg = (attacker.pctDmgUp ?? 0) - (defender.pctDmgDown ?? 0);
	if (totalPctDmg !== 0) {
		finalDmg = Math.floor(finalDmg * (1 + totalPctDmg));
	}

	const totalFixedDmg = (attacker.fixedDmgUp ?? 0) - (defender.fixedDmgDown ?? 0);
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
function applyDamage(target, dmgResult, attacker, callback, skillContext = {}) {
	if (!target || !target.alive) {
		if (callback) callback();
		return;
	}

	// 解构伤害结果
	let dmg, isCrit, isBlock;
	if (typeof dmgResult === 'object') {
		dmg = dmgResult.damage;
		isCrit = dmgResult.isCrit;
		isBlock = dmgResult.isBlock;
	} else {
		// 兼容旧格式
		dmg = dmgResult;
		isCrit = false;
		isBlock = false;
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
			addBattleLog(`${target.name} 阵亡！`);

			triggerSelfEffect(target, 'dieSelf', attacker);
			triggerGlobalEffect('dieGlobal', target, attacker);

			if (attacker && attacker.alive) {
				triggerSelfEffect(attacker, 'onKill', target);
				attacker.energy = Math.min(8, attacker.energy + 1);
				addBattleLog(`${attacker.name} 击杀目标，恢复 1 能量`);
			}

			updateBattleUI();
			setTimeout(() => {
				if (callback) callback();
			}, 500);
		}
		else {
			target.energy = Math.min(8, target.energy + 1);
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
function applyHeal(target, healAmount, callback) {
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
function executePugong(actor, targets, callback) {
	if (!targets || targets.length === 0) {
		if (callback) callback();
		return;
	}

	actor.energy = Math.min(8, actor.energy + 1);
	updateBattleUI();
	addBattleLog(`${actor.name} 发动普攻`);

	let index = 0;
	const skillId = actor.skills[0] || 'attack1';
	const sData = (window.contentList && window.contentList.pugong && window.contentList.pugong[skillId]);
	const isRecover = (sData && sData.isRecover === true);
	const coeff = (sData && sData.coefficient) ? Number(sData.coefficient) : 1.0;

	function processNextTarget() {
		if (index >= targets.length) {
			if (callback) callback();
			return;
		}

		const target = targets[index++];
		if (!target || !target.alive) {
			processNextTarget();
			return;
		}

		if (isRecover) {
			let healAmt = Math.floor(actor.atk * coeff);
			applyHeal(target, healAmt, processNextTarget);
		} else {
			const dmgResult = calculateDamage(actor, target, coeff, 0);
			applyDamage(target, dmgResult, actor, processNextTarget, {
				skillData: sData,
				trigger: 'pugongHit',
				skillId: skillId
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
function executeSkill(actor, skillType, skillId, targets, energyCost, callback) {
	if (!targets || targets.length === 0) {
		if (callback) callback();
		return;
	}

	actor.energy = Math.max(0, actor.energy - energyCost);
	updateBattleUI();

	const sData = (window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId]);
	const skillName = sData ? sData.name : skillId;
	addBattleLog(`${actor.name} 使用了【${skillName}】`);

	const coeff = (sData && sData.coefficient) ? Number(sData.coefficient) : 1.0;
	const isRecover = (sData && sData.isRecover === true);
	const extraEnergy = Math.max(0, energyCost - 4);

	// ======== 映射技能类型到 trigger ========
	const triggerMap = { 'pugong': 'pugongHit', 'skill': 'skillHit', 'spskill': 'spskillHit' };
	const trigger = triggerMap[skillType] || 'onHit';
	// =========================================

	let index = 0;
	function processNextTarget() {
		if (index >= targets.length) {
			if (callback) callback();
			return;
		}

		const target = targets[index++];
		if (!target || !target.alive) {
			processNextTarget();
			return;
		}

		if (isRecover) {
			let healAmt = Math.floor(actor.atk * coeff);
			if (extraEnergy > 0) {
				healAmt = Math.floor(healAmt * (1 + extraEnergy * 0.1));
			}
			applyHeal(target, healAmt, processNextTarget);
		} else {
			// 在 executeSkill 中：
			const dmgResult = calculateDamage(actor, target, coeff, extraEnergy);
			applyDamage(target, dmgResult, actor, processNextTarget, {
				skillData: sData,
				trigger: trigger,
				skillId: skillId
			});
			// ============================================
		}
	}

	processNextTarget();
}


// ====== 5. 战斗循环控制 (明晰化) ======

/**
 * 控制游戏进入下一回合
 * @returns 控制游戏进入下一回合
 */
function nextTurn() {
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

		// ===== 【新增】处理buff衰减：当前行动位次施加的buff，轮次-1 =====
		const sideLabel = nextSide === 'player' ? '先手' : '后手';
		const actionSlotKey = `${sideLabel}${currentActorNumberInSide}`;
		// 标记该角色已行动
		bs.actedSlots[nextSide].add(nextActor.slotIndex);
		bs.currentTurnSide = nextSide;
		bs.currentTurnIndex = nextActor.slotIndex;
		// 在 nextTurn 中，标记完 actedSlots 后：
		nextActor._currentActionSlotKey = `${sideLabel}${currentActorNumberInSide}`;

		processBuffDecayBySlotKey(actionSlotKey);

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
function afterAction() {
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
function endRound() {
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
function bs_animateAction(actor, action, callback) {
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
function executeAITurn(actor) {
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
function executePlayerTurn(actor, action) {
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
function showBattleIntro() {
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
function endBattle(winner) {
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
function getSkillEmoji(skillType, skillId) {
	const sData = window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId];
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
function showPlayerActionUI(actor) {
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

	const pugongId = actor.skills[0] || 'attack1';
	const pugongBtn = document.createElement('button');
	pugongBtn.className = 'action-btn pugong-btn';
	pugongBtn.textContent = '普攻 ' + getSkillEmoji('pugong', pugongId);
	pugongBtn.onclick = (e) => {
		e.stopPropagation();
		enterTargetSelection(actor, 'pugong', pugongId, 0);
	};
	panel.appendChild(pugongBtn);

	const skillId = actor.skills[1];
	if (skillId) {
		const isSealed = actor.sealed || actor.permanentlySealed;
		const canUseSkill = actor.energy >= 4 && !isSealed;
		const skillBtn = document.createElement('button');
		skillBtn.className = 'action-btn skill-btn' + (canUseSkill ? '' : ' disabled');
		skillBtn.textContent = '技能 ' + getSkillEmoji('skill', skillId);
		if (canUseSkill) {
			skillBtn.onclick = (e) => {
				e.stopPropagation();
				enterTargetSelection(actor, 'skill', skillId, actor.energy);
			};
		} else {
			skillBtn.onclick = (e) => {
				e.stopPropagation();
				toast(isSealed ? '已被封印' : '能量不足', 'warning');
			};
		}
		panel.appendChild(skillBtn);
	}

	const spId = actor.skills[2];
	if (spId) {
		const isSealed = actor.sealed || actor.permanentlySealed;
		const canUseSp = actor.energy >= 8 && !isSealed;
		const spBtn = document.createElement('button');
		spBtn.className = 'action-btn spskill-btn' + (canUseSp ? '' : ' disabled');
		spBtn.textContent = '必杀 ' + getSkillEmoji('spskill', spId);
		if (canUseSp) {
			spBtn.onclick = (e) => {
				e.stopPropagation();
				enterTargetSelection(actor, 'spskill', spId, actor.energy);
			};
		} else {
			spBtn.onclick = (e) => {
				e.stopPropagation();
				toast(isSealed ? '已被封印' : '能量不足', 'warning');
			};
		}
		panel.appendChild(spBtn);
	}

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
function enterTargetSelection(actor, skillType, skillId, energyCost) {
	const sData = window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId];
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
function highlightSelectableTargets(mode, isRecover, targetSide) {
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
function onTargetClicked(target) {
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
function aiChooseAction(actor) {
	const bs = battleState;
	const enemySide = actor.side === 'player' ? 'enemy' : 'player';
	const friendlySide = actor.side;

	if (actor.sealed || actor.permanentlySealed) {
		const pugongId = actor.skills[0] || 'attack1';
		const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
		if (pData) {
			const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
			return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
		}
		const aliveEnemies = getAliveUnits(enemySide);
		return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
	}

	if (actor.energy >= 8 && actor.skills[2]) {
		const spId = actor.skills[2];
		const spData = window.contentList && window.contentList.spskill && window.contentList.spskill[spId];
		if (spData) {
			const targets = aiSelectTargets(actor, spData, enemySide, friendlySide);
			if (targets.length > 0) {
				return { type: 'skill', skillType: 'spskill', skillId: spId, targets, energyCost: actor.energy };
			}
		}
	}

	if (actor.energy >= 4 && actor.skills[1]) {
		const skillId = actor.skills[1];
		const sData = window.contentList && window.contentList.skill && window.contentList.skill[skillId];
		if (sData) {
			const targets = aiSelectTargets(actor, sData, enemySide, friendlySide);
			if (targets.length > 0) {
				return { type: 'skill', skillType: 'skill', skillId, targets, energyCost: actor.energy };
			}
		}
	}

	const pugongId = actor.skills[0] || 'attack1';
	const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
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
function aiSelectTargets(actor, skillData, enemySide, friendlySide) {
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
function resolveSkillTargets(skillData, actor, intendedSide, options) {
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
			return shuffleArray([...candidates]).slice(0, Math.min(count, candidates.length));
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
function selectBestSingleTarget(candidates, pref, actor, options = {}) {
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0];
	if (pref === 'random') return candidates[Math.floor(Math.random() * candidates.length)];
	return candidates[0]; // 简化版：默认第一个
}
/**
 * 根据选中目标补全同一行的所有存活目标
 * @param {*} candidates 候选目标列表
 * @param {*} pref 偏好（如 'first', 'last', 'random'）
 * @param {*} actor 行动者
 * @returns 同行所有存活目标
 */
function selectRowTargetsSmart(candidates, pref, actor) {
	if (candidates.length === 0) return [];

	// 根据 pref 选择第一个目标
	let seedTarget;
	if (pref === 'random') {
		seedTarget = candidates[Math.floor(Math.random() * candidates.length)];
	} else if (pref === 'last') {
		seedTarget = candidates[candidates.length - 1];
	} else { // 'first' 或其他
		seedTarget = candidates[0];
	}

	if (!seedTarget) return [];

	// 确定该目标所在的行（前排行: 0,1,2；后排行: 3,4,5）
	const rowStart = seedTarget.slotIndex < 3 ? 0 : 3;

	// 过滤出同一行的所有存活目标
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
function selectColumnTargetsSmart(candidates, pref, actor) {
	if (candidates.length === 0) return [];

	// 根据 pref 选择第一个目标
	let seedTarget;
	if (pref === 'random') {
		seedTarget = candidates[Math.floor(Math.random() * candidates.length)];
	} else if (pref === 'last') {
		seedTarget = candidates[candidates.length - 1];
	} else { // 'first' 或其他
		seedTarget = candidates[0];
	}

	if (!seedTarget) return [];

	// 确定该目标所在的列（0:左列, 1:中列, 2:右列）
	const col = seedTarget.slotIndex % 3;

	// 过滤出同一列的所有存活目标
	const side = seedTarget.side;
	return candidates.filter(u => u.side === side && u.slotIndex % 3 === col);
}
// ====== 9. 结算界面 ======

/**
 * 战斗结算
 * @param {*} winner 胜者，player或其他
 * @returns 
 */
function showBattleResult(winner) {
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
				hideOtherViews('dungeon-view');
				dungeonView.style.display = 'flex';
				if (bs.chapterKey) {
					renderDungeonView(dungeonView, bs.chapterKey);
				}
			}
		}
	};
	dialog.appendChild(btn);
	overlay.appendChild(dialog);
	container.appendChild(overlay);
}

// ====== 10. 初始化与 UI 渲染 (保留原有逻辑) ======

const BREAKTHROUGH_LIB = window.BREAKTHROUGH_BUFF_LIBRARY || {};

/**
 * 根据输入的突破信息编译成对应的突破能力对象
 * @param {*} data 突破能力对象或者待调用的字符串
 * @param {*} index 该突破能力对应的序号
 * @returns 编译后的突破对象
 */
function normalizeBreakthroughData(data, index) {
	if (data && typeof data === 'object' && !Array.isArray(data)) return data;
	if (typeof data === 'string') {
		const libData = BREAKTHROUGH_LIB[data];
		if (libData) {
			libData.level = index;
			// 深度拷贝，避免引用问题
			const clone = JSON.parse(JSON.stringify(libData));
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


/**
 * 战斗开始，初始化信息
 * @param {*} playerTeam 
 * @param {*} enemyTeam 
 * @param {*} options 
 */
function startBattle(playerTeam, enemyTeam, options = {}) {
	// ===== 【新增】刷新全队编译属性 =====
	const teamBonuses = calculateTeamBreakthroughBonuses();
	(window.currentTeam || []).forEach(instId => {
		if (instId && window.charBagData) {
			calculateInstanceFinalStats(instId, teamBonuses);
		}
	});

	function buildUnit(data, side, slotIndex) {
		if (!data || !data.id) return null;

		const isPreCompiled = data.statsPreCompiled === true || !data.instanceId;

		let rank = data.rank;
		let template = data.template;
		if (!rank || !template) {
			const baseDef = window.characterList && window.characterList[data.id];
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

			const sData = window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId];
			if (!sData || !sData.contents || !Array.isArray(sData.contents)) return;

			const triggerMap = { 'pugong': 'pugongHit', 'skill': 'skillHit', 'spskill': 'spskillHit' };
			const trigger = triggerMap[skillType];
			if (!trigger) return;

			sData.contents.forEach(content => {
				if (content.content && typeof content.content === 'function') {
					effectSkills.push({
						trigger: trigger,
						filter: content.filter || function () { return true; },
						content: content.content,
						desc: content.desc || ''
					});
				}
			});
		}

		// 提取普攻、技能、必杀的效果
		extractSkillContentsToSkills('pugong', 0);
		extractSkillContentsToSkills('skill', 1);
		extractSkillContentsToSkills('spskill', 2);

		// 编译非属性类的突破效果
		for (let i = 0; i <= tupolevel; i++) {
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
						const skillIndex = buff.skillIndex;
						const triggerMap = { 0: 'pugongHit', 1: 'skillHit', 2: 'spskillHit' };
						const trigger = triggerMap[skillIndex];
						if (trigger) {
							effectSkills.push({
								trigger: trigger,
								filter: function () { return Math.random() < (buff.chance || 0.2); },
								content: function (target) {
									if (buff.effects && Array.isArray(buff.effects)) {
										buff.effects.forEach(effect => {
											switch (effect.type) {
												case 'stun':
													target.stunned = true;
													addBattleLog(`${target.name} 被眩晕${effect.turns || 1}回合`);
													break;
												case 'reduceEnergy':
													target.energy = Math.max(0, target.energy - (effect.amount || 1));
													addBattleLog(`${target.name} 损失 ${effect.amount || 1} 点能量`);
													break;
												case 'seal':
													target.sealed = true;
													addBattleLog(`${target.name} 被封印`);
													break;
											}
										});
									}
									updateBattleUI();
								}
							});
						}
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
										} else {
											killer.sealed = true;
										}
										addBattleLog(`${this.name} 阵亡时封印了 ${killer.name}`);
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
		let finalPierce = 0;
		let finalBlock = 0;

		let finalFixedDmgUp = 0;
		let finalFixedDmgDown = 0;
		let finalPctDmgUp = 0;
		let finalPctDmgDown = 0;

		let finalFixedHeal = 0;
		let finalFixedBeHeal = 0;
		let finalPctHeal = 0;
		let finalPctBeHeal = 0;

		if (data._compiledStats) {
			finalHp = data._compiledStats.totalHp;
			finalAtk = data._compiledStats.totalAtk;
			finalDef = data._compiledStats.totalDef;
			finalSpe = data._compiledStats.totalSpe;

			// ===== 【新增】从编译结果读取新属性 =====
			finalHit = data._compiledStats.hit ?? 10000;
			finalDodge = data._compiledStats.dodge ?? 0;
			finalCrit = data._compiledStats.crit ?? 0;
			finalCritResist = data._compiledStats.critResist ?? 0;
			finalPierce = data._compiledStats.pierce ?? 0;
			finalBlock = data._compiledStats.block ?? 0;

			finalFixedDmgUp = data._compiledStats.fixedDmgUp ?? 0;
			finalFixedDmgDown = data._compiledStats.fixedDmgDown ?? 0;
			finalPctDmgUp = data._compiledStats.pctDmgUp ?? 0;
			finalPctDmgDown = data._compiledStats.pctDmgDown ?? 0;

			finalFixedHeal = data._compiledStats.fixedHeal ?? 0;
			finalFixedBeHeal = data._compiledStats.fixedBeHeal ?? 0;
			finalPctHeal = data._compiledStats.pctHeal ?? 0;
			finalPctBeHeal = data._compiledStats.pctBeHeal ?? 0;
		} else {
			finalHp = Number(data.hp) || 100;
			finalAtk = Number(data.atk) || 10;
			finalDef = Number(data.def) || 0;
			finalSpe = Number(data.spe) || 0;

			// ===== 【新增】敌方角色也初始化新属性 =====
			if (data.hit !== undefined) finalHit = Number(data.hit);
			if (data.dodge !== undefined) finalDodge = Number(data.dodge);
			if (data.crit !== undefined) finalCrit = Number(data.crit);
			if (data.critResist !== undefined) finalCritResist = Number(data.critResist);
			if (data.pierce !== undefined) finalPierce = Number(data.pierce);
			if (data.block !== undefined) finalBlock = Number(data.block);
			if (data.fixedDmgUp !== undefined) finalFixedDmgUp = Number(data.fixedDmgUp);
			if (data.fixedDmgDown !== undefined) finalFixedDmgDown = Number(data.fixedDmgDown);
			if (data.pctDmgUp !== undefined) finalPctDmgUp = Number(data.pctDmgUp);
			if (data.pctDmgDown !== undefined) finalPctDmgDown = Number(data.pctDmgDown);
			if (data.fixedHeal !== undefined) finalFixedHeal = Number(data.fixedHeal);
			if (data.fixedBeHeal !== undefined) finalFixedBeHeal = Number(data.fixedBeHeal);
			if (data.pctHeal !== undefined) finalPctHeal = Number(data.pctHeal);
			if (data.pctBeHeal !== undefined) finalPctBeHeal = Number(data.pctBeHeal);
		}

		finalEnergy += bonusEnergy;

		let activeTreasures = [];

		const baseSkills = Array.isArray(data.skills) ? [...data.skills] : ['attack1', null, null];
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
			extraTurnCount: 0,
			tupoList: normalizedTupoList,
			tupolevel: tupolevel,
			hasAttacked: false,

			// ===== 【新增】战斗概率属性 =====
			hit: finalHit,
			dodge: finalDodge,
			crit: finalCrit,
			critResist: finalCritResist,
			pierce: finalPierce,
			block: finalBlock,

			// ===== 【新增】增伤/减伤 =====
			fixedDmgUp: finalFixedDmgUp,
			fixedDmgDown: finalFixedDmgDown,
			pctDmgUp: finalPctDmgUp,
			pctDmgDown: finalPctDmgDown,

			// ===== 【新增】治疗相关 =====
			fixedHeal: finalFixedHeal,
			fixedBeHeal: finalFixedBeHeal,
			pctHeal: finalPctHeal,
			pctBeHeal: finalPctBeHeal,
		};

		if (passiveBuffs.length > 0) unit.buff.push(...passiveBuffs);
		return unit;
	}


	const playerUnits = playerTeam.map((u, i) => buildUnit(u, 'player', i));
	const enemyUnits = enemyTeam.map((u, i) => buildUnit(u, 'enemy', i));

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
function getEffectsByTrigger(actor, trigger) {
	if (!actor || !actor.skills || !Array.isArray(actor.skills)) return [];

	return actor.skills.filter(skill => {
		if (typeof skill === 'string') return false; // 跳过技能ID字符串
		return skill.trigger === trigger;
	});
}

/**
 * 触发所有存活角色的指定时机效果
 * @param {string} trigger 触发时机
 * @param {...any} context 上下文参数
 */
function triggerGlobalEffect(trigger, ...context) {
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
function triggerSelfEffect(unit, trigger, ...context) {
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
function applyTeamBreakthroughBuffs(units) {
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
function renderBattleView() {
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
	hideOtherViews('battle-view');

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
		if (window.confirmDialog) {
			window.confirmDialog('确定要放弃本次战斗吗？', () => endBattle('enemy'));
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
function createUnitSlot(unit, side, slotIndex) {
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
	img.src = `./image/character/${unit.id}.jpg`;
	img.alt = unit.name;
	img.onerror = function () {
		this.onerror = function () { this.style.display = 'none'; slot.classList.add('battle-unit-noimg'); };
		this.src = `./image/character/${unit.id}.webp`;
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
	return slot;
}

/**
 * 为行/列攻击的所有目标槽位依次播放特效（带延迟）
 */
function showSkillEffectOnTargets(targets, effectInfo) {
	targets.forEach((t, i) => {
		setTimeout(() => {
			showSkillEffect(t, effectInfo);
		}, i * 100);  // 每个目标间隔100ms
	});
}
/**
 * 在指定角色槽位上播放技能Emoji特效
 */
function showSkillEffect(unit, effectInfo) {
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
function getEmojiClass(emoji) {
	switch (emoji) {
		case '🔥' | 'fire':
			return { emoji: '🔥', effectClass: 'fire-effect' };
			break;
		case '⚡' | 'lightning':
			return { emoji: '⚡', effectClass: 'lightning-effect' };
			break;
		case '🧪' | 'heal':
			return { emoji: '🧪', effectClass: 'heal-effect' };
			break;
		case '🌙' | 'moon':
			return { emoji: '🌙', effectClass: 'moon-effect' };
			break;
		case '❤️' | 'heart':
			return { emoji: '❤️', effectClass: 'heart-effect' };
			break;
		case '💀' | 'skull':
			return { emoji: '💀', effectClass: 'skull-effect' };
			break;
		case '💥' | 'explosion':
			return { emoji: '💥', effectClass: 'explosion-effect' };
			break;
		case '🌪️' | 'wind':
			return { emoji: '🌪️', effectClass: 'wind-effect' };
			break;
		case '⚔️' | 'sword':
			return { emoji: '⚔️', effectClass: 'sword-effect' };
			break;
		case '🧊' | 'ice':
			return { emoji: '🧊', effectClass: 'ice-effect' };
			break;
		case '💧' | 'rain':
			return { emoji: '💧', effectClass: 'rain-effect' };
			break;
		case '❄️' | 'snow':
			return { emoji: '❄️', effectClass: 'snow-effect' };
			break;
		case '⭐' | 'star':
			return { emoji: '⭐', effectClass: 'star-effect' };
			break;
		case '☄️' | 'comet':
			return { emoji: '☄️', effectClass: 'comet-effect' };
			break;
		case '🎵' | 'music':
			return { emoji: '🎵', effectClass: 'music-effect' };
			break;
		case '🪨' | 'rock':
			return { emoji: '🪨', effectClass: 'rock-effect' };
			break;
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
function getSkillEffectInfo(action) {
	const skillType = action.type === 'pugong' ? 'pugong' : action.skillType;
	const skillId = action.type === 'pugong' ? action.skillId : action.skillId;
	const sData = contentList[skillType] && contentList[skillType][skillId];

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
function getActionOrderInRound(side, slotIndex) {
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
function getActionSlotKey(side, actorNumber) {
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
 * @param {string} buffConfig.type - buff 类型（'seal', 'stun', 'healBlock', 'poison' 等）
 * @param {number} buffConfig.remainRounds - 持续轮次（-1 永久）
 * @param {string} buffConfig.sourceSide - 施加者阵营（可选）
 * @param {string} buffConfig.sourceId - 施加者 instanceId
 * @param {any} buffConfig.value - 附加数值
 * @param {string} buffConfig.ownerSlot - 施加者行动位次（可选，如不传则自动获取）
 */
function addBuff(target, buffConfig) {
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
			sourceId: buffConfig.sourceId || '',
			value: buffConfig.value || null,
		});
	}

	// 立即应用buff效果
	applyBuffEffect(target, buffConfig);
}


/**
 * 应用 buff 的即时效果
 */
function applyBuffEffect(target, buffConfig) {
	switch (buffConfig.type) {
		case 'seal':
			target.sealed = true;
			addBattleLog(`${target.name} 被封印${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'stun':
			target.stunned = true;
			addBattleLog(`${target.name} 被眩晕${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'healBlock':
			target.healBlocked = true;
			addBattleLog(`${target.name} 被禁疗${buffConfig.remainRounds === -1 ? '（永久）' : buffConfig.remainRounds + '回合'}`);
			break;
		case 'poison':
			// 中毒伤害叠加
			target.poisonDamage = (target.poisonDamage || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 中毒，每回合失去 ${buffConfig.value} 生命`);
			break;
		case 'dmgUp':
			target.pctDmgUp = (target.pctDmgUp || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 增伤${(buffConfig.value * 100).toFixed(0)}%`);
			break;
		case 'dmgDown':
			target.pctDmgDown = (target.pctDmgDown || 0) + (buffConfig.value || 0);
			addBattleLog(`${target.name} 减伤${(buffConfig.value * 100).toFixed(0)}%`);
			break;
		// 可以扩展更多 buff 类型
	}
	updateBattleUI();
}

/**
 * 移除角色的指定 buff
 */
function removeBuff(target, buffId) {
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
function removeBuffEffect(target, buff) {
	switch (buff.type) {
		case 'seal':
			target.sealed = false;
			addBattleLog(`${target.name} 的封印已解除`);
			break;
		case 'stun':
			target.stunned = false;
			addBattleLog(`${target.name} 的眩晕已解除`);
			break;
		case 'healBlock':
			target.healBlocked = false;
			addBattleLog(`${target.name} 的禁疗已解除`);
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
		case 'dmgUp':
			target.pctDmgUp = Math.max(0, (target.pctDmgUp || 0) - (buff.value || 0));
			break;
		case 'dmgDown':
			target.pctDmgDown = Math.max(0, (target.pctDmgDown || 0) - (buff.value || 0));
			break;
	}
	updateBattleUI();
}


/**
 * 轮次结算时处理所有 buff 的存续
 * 在 endRound 中调用
 */
function processBuffExpiryOnRoundEnd() {
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
function processBuffExpiryOnActionStart(actor) {
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
function processBuffDecayBySlotKey(actionSlotKey) {
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
				buff.remainRounds--;

				if (buff.remainRounds <= 0) {
					expiredBuffs.push(index);
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
