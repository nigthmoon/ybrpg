/**
 * 星河之契 - 角色突破配置与Buff库
 * 
 * 所有技能统一使用 {trigger, filter, content} 格式
 * 战斗系统通过 normalizeBreakthroughData 编译后，直接推入角色的 skills 数组
 * 由 triggerSelfEffect / triggerGlobalEffect 根据 trigger 时机自动调用
 */

// ==================== 全局 Buff 库定义 ====================
const BREAKTHROUGH_BUFF_LIBRARY = {
	'dmg_up_10': { 
		type: 'self_stat_percent',
		pctDmgUp: 0.1,	// 增伤10%
		desc: '获得10%增伤' 
	},
	'dmg_up_20': { 
		type: 'self_stat_percent',
		pctDmgUp: 0.2,	
		desc: '获得20%增伤' 
	},
	'dmg_up_30': { 
		type: 'self_stat_percent',
		pctDmgUp: 0.3,
		desc: '获得30%增伤' 
	},
	'dmg_up_50': { 
		type: 'self_stat_percent',
		pctDmgUp: 0.5,
		desc: '获得50%增伤' 
	},
	'dmg_reduce_10': { 
		type: 'self_stat_percent',
		pctDmgDown: 0.1,
		desc: '获得10%减伤' 
	},
	'dmg_reduce_20': { 
		type: 'self_stat_percent',
		pctDmgDown: 0.2,
		desc: '获得20%减伤'
	},
	'dmg_reduce_30': { 
		type: 'self_stat_percent',
		pctDmgDown: 0.3,
		desc: '获得30%减伤' 
	},
	'dmg_reduce_50': { 
		type: 'self_stat_percent',
		pctDmgDown: 0.5,
		desc: '获得50%减伤' 
	},

	// --- 吸血类 ---
	'lifesteal_pugong_50': {
		type: 'skill_effect',
		desc: '普攻后吸血50%',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.alive && target && target._lastDamage) {
				const healAmt = Math.floor(target._lastDamage * 0.5);
				this.hp = Math.min(this.maxHp, this.hp + healAmt);
				addBattleLog(`${this.name} 吸血 ${healAmt} 点`);
				updateBattleUI();
			}
		}
	},
	'lifesteal_pugong_75': {
		type: 'skill_effect',
		desc: '普攻后吸血75%',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.alive && target && target._lastDamage) {
				const healAmt = Math.floor(target._lastDamage * 0.75);
				this.hp = Math.min(this.maxHp, this.hp + healAmt);
				addBattleLog(`${this.name} 吸血 ${healAmt} 点`);
				updateBattleUI();
			}
		}
	},
	'lifesteal_pugong_100': {
		type: 'skill_effect',
		desc: '普攻后吸血100%',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.alive && target && target._lastDamage) {
				const healAmt = Math.floor(target._lastDamage * 1.0);
				this.hp = Math.min(this.maxHp, this.hp + healAmt);
				addBattleLog(`${this.name} 吸血 ${healAmt} 点`);
				updateBattleUI();
			}
		}
	},
	'lifesteal_skill_50': {
		type: 'skill_effect',
		desc: '技能后吸血50%',
		trigger: 'skillHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.alive && target && target._lastDamage) {
				const healAmt = Math.floor(target._lastDamage * 0.5);
				this.hp = Math.min(this.maxHp, this.hp + healAmt);
				addBattleLog(`${this.name} 吸血 ${healAmt} 点`);
				updateBattleUI();
			}
		}
	},
	'lifesteal_skill_75': {
		type: 'skill_effect',
		desc: '技能后吸血75%',
		trigger: 'skillHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.alive && target && target._lastDamage) {
				const healAmt = Math.floor(target._lastDamage * 0.75);
				this.hp = Math.min(this.maxHp, this.hp + healAmt);
				addBattleLog(`${this.name} 吸血 ${healAmt} 点`);
				updateBattleUI();
			}
		}
	},
	'lifesteal_skill_100': {
		type: 'skill_effect',
		desc: '技能后吸血100%',
		trigger: 'skillHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.alive && target && target._lastDamage) {
				const healAmt = Math.floor(target._lastDamage * 1.0);
				this.hp = Math.min(this.maxHp, this.hp + healAmt);
				addBattleLog(`${this.name} 吸血 ${healAmt} 点`);
				updateBattleUI();
			}
		}
	},

	// --- 亡语类 ---
	'death_heal_self_atk100': {
		type: 'skill_effect',
		desc: '亡语，每局限一次，恢复生命值至攻击力*100%',
		trigger: 'dieSelf',
		filter: function () {
			if (!this._deathHealUsed) {
				this._deathHealUsed = true;
				return true;
			}
			return false;
		},
		content: function (killer) {
			const healAmt = this.atk || 0;
			this.hp = Math.min(this.maxHp, this.hp + healAmt);
			this.alive = true; // 复活
			addBattleLog(`${this.name} 触发亡语，恢复 ${healAmt} 生命值！`);
			updateBattleUI();
		}
	},
	'death_energy_drain_enemy_2': {
		type: 'skill_effect',
		desc: '亡语，令所有敌人降低能量2',
		trigger: 'dieSelf',
		filter: function () { return true; },
		content: function (killer) {
			const enemySide = this.side === 'player' ? 'enemy' : 'player';
			const enemies = getAliveUnits(enemySide);
			enemies.forEach(e => {
				e.energy = Math.max(0, e.energy - 2);
			});
			addBattleLog(`${this.name} 亡语，所有敌人降低2能量`);
			updateBattleUI();
		}
	},
	'death_energy_drain_enemy_all': {
		type: 'skill_effect',
		desc: '亡语，令所有敌人能量归零',
		trigger: 'dieSelf',
		filter: function () { return true; },
		content: function (killer) {
			const enemySide = this.side === 'player' ? 'enemy' : 'player';
			const enemies = getAliveUnits(enemySide);
			enemies.forEach(e => {
				e.energy = 0;
			});
			addBattleLog(`${this.name} 亡语，所有敌人能量归零！`);
			updateBattleUI();
		}
	},
	'death_heal_team_atk100': {
		type: 'skill_effect',
		desc: '亡语，令所有队友恢复生命为自身攻击力*100%',
		trigger: 'dieSelf',
		filter: function () { return true; },
		content: function (killer) {
			const allies = getAliveUnits(this.side);
			const healAmt = this.atk || 0;
			allies.forEach(ally => {
				if (ally.alive) {
					ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
					addBattleLog(`${ally.name} 恢复 ${healAmt} 生命`);
				}
			});
			updateBattleUI();
		}
	},
	'death_energy_team_2': {
		type: 'skill_effect',
		desc: '亡语，令所有队友恢复2能量',
		trigger: 'dieSelf',
		filter: function () { return true; },
		content: function (killer) {
			const allies = getAliveUnits(this.side);
			allies.forEach(ally => {
				if (ally.alive) {
					ally.energy = Math.min(8, ally.energy + 2);
				}
			});
			addBattleLog(`${this.name} 亡语，所有队友恢复2能量`);
			updateBattleUI();
		}
	},
	'death_dmg_true_enemy_atk100': {
		type: 'skill_effect',
		desc: '亡语，对所有敌人造成攻击力*100%真实伤害',
		trigger: 'dieSelf',
		filter: function () { return true; },
		content: function (killer) {
			const enemySide = this.side === 'player' ? 'enemy' : 'player';
			const enemies = getAliveUnits(enemySide);
			const dmg = this.atk || 0;
			enemies.forEach(e => {
				if (e.alive) {
					e.hp -= dmg;
					showDamageNumber(e, dmg, false);
					addBattleLog(`${e.name} 受到 ${dmg} 点真实伤害`);
					if (e.hp <= 0) {
						e.hp = 0;
						e.alive = false;
						addBattleLog(`${e.name} 阵亡！`);
					}
				}
			});
			updateBattleUI();
		}
	},

	// --- 无视防御类 ---
	// 注意：无视防御需要在 calculateDamage 中处理，不适合 trigger 格式。
	// 暂时保留为 passive_effect，后续在 buildUnit 中特殊处理。
	'ignore_def_pugong_50': { type: 'passive_effect', effectId: 'ignore_def_pugong_50', desc: '普攻时，无视对方50%防御力' },
	'ignore_def_pugong_80': { type: 'passive_effect', effectId: 'ignore_def_pugong_80', desc: '普攻时，无视对方80%防御力' },
	'ignore_def_pugong_100': { type: 'passive_effect', effectId: 'ignore_def_pugong_100', desc: '普攻时，无视对方全部防御力' },
	'ignore_def_skill_50': { type: 'passive_effect', effectId: 'ignore_def_skill_50', desc: '技能时，无视对方50%防御力' },
	'ignore_def_skill_80': { type: 'passive_effect', effectId: 'ignore_def_skill_80', desc: '技能时，无视对方80%防御力' },
	'ignore_def_skill_100': { type: 'passive_effect', effectId: 'ignore_def_skill_100', desc: '技能时，无视对方全部防御力' },
	'ignore_def_all_30': { type: 'passive_effect', effectId: 'ignore_def_all_30', desc: '所有伤害无视对方30%防御力' },
	'ignore_def_all_60': { type: 'passive_effect', effectId: 'ignore_def_all_60', desc: '所有伤害无视对方60%防御力' },
	'ignore_def_all_100': { type: 'passive_effect', effectId: 'ignore_def_all_100', desc: '所有伤害无视对方全部防御力' },

	// --- 控制类：封印 ---
	// 注意：封印效果通过 addBuff 系统管理，自动在对应的行动位次轮次衰减并解除
	'seal_target_30_pugong': {
		type: 'skill_effect',
		desc: '普攻时，30%几率封印目标一回合',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.3; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'seal_pugong', name: '封印', type: 'seal', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'seal_target_60_pugong': {
		type: 'skill_effect',
		desc: '普攻时，60%几率封印目标一回合',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.6; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'seal_pugong', name: '封印', type: 'seal', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'seal_target_100_pugong': {
		type: 'skill_effect',
		desc: '普攻时，100%几率封印目标一回合',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'seal_pugong', name: '封印', type: 'seal', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'seal_target_30_skill': {
		type: 'skill_effect',
		desc: '使用技能后，30%几率封印目标一回合',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.3; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'seal_skill', name: '封印', type: 'seal', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'seal_target_60_skill': {
		type: 'skill_effect',
		desc: '使用技能后，60%几率封印目标一回合',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.6; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'seal_skill', name: '封印', type: 'seal', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'seal_target_100_skill': {
		type: 'skill_effect',
		desc: '使用技能后，100%几率封印目标一回合',
		trigger: 'skillHit',
		filter: function () { return true; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'seal_skill', name: '封印', type: 'seal', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},

	// --- 控制类：减能 ---
	'drain_energy_1_20_skill': {
		type: 'skill_effect',
		desc: '使用技能后，20%几率减少目标1能量',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 1);
				addBattleLog(`${target.name} 损失1点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_1_50_skill': {
		type: 'skill_effect',
		desc: '使用技能后，50%几率减少目标1能量',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 1);
				addBattleLog(`${target.name} 损失1点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_1_80_skill': {
		type: 'skill_effect',
		desc: '使用技能后，80%几率减少目标1能量',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.8; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 1);
				addBattleLog(`${target.name} 损失1点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_2_20_skill': {
		type: 'skill_effect',
		desc: '使用技能后，20%几率减少目标2能量',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 2);
				addBattleLog(`${target.name} 损失2点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_2_50_skill': {
		type: 'skill_effect',
		desc: '使用技能后，50%几率减少目标2能量',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 2);
				addBattleLog(`${target.name} 损失2点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_1_20_pugong': {
		type: 'skill_effect',
		desc: '普攻时，20%几率令目标降低1能量',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 1);
				addBattleLog(`${target.name} 降低1点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_1_50_pugong': {
		type: 'skill_effect',
		desc: '普攻时，50%几率令目标降低1能量',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 1);
				addBattleLog(`${target.name} 降低1点能量`);
				updateBattleUI();
			}
		}
	},
	'drain_energy_1_80_pugong': {
		type: 'skill_effect',
		desc: '普攻时，80%几率令目标降低1能量',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.8; },
		content: function (target) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.max(0, target.energy - 1);
				addBattleLog(`${target.name} 降低1点能量`);
				updateBattleUI();
			}
		}
	},

	// --- 控制类：眩晕 ---
	// 注意：眩晕效果通过 addBuff 系统管理，自动在对应的行动位次轮次衰减并解除
	'stun_target_1_20_pugong': {
		type: 'skill_effect',
		desc: '普攻时，20%几率令目标眩晕1回合',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'stun_pugong', name: '眩晕', type: 'stun', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'stun_target_1_50_pugong': {
		type: 'skill_effect',
		desc: '普攻时，50%几率令目标眩晕1回合',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'stun_pugong', name: '眩晕', type: 'stun', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'stun_target_1_20_skill': {
		type: 'skill_effect',
		desc: '使用技能后，20%几率令目标眩晕1回合',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'stun_skill', name: '眩晕', type: 'stun', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'stun_target_1_50_skill': {
		type: 'skill_effect',
		desc: '使用技能后，50%几率令目标眩晕1回合',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'stun_skill', name: '眩晕', type: 'stun', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},

	// --- 控制类：中毒 ---
	// 注意：中毒需要在每轮结束时造成伤害。需要战斗系统在 roundEnd 时遍历所有中毒单位。
	'poison_5_atk_20_pugong': {
		type: 'skill_effect',
		desc: '普攻时，20%几率令目标永久中毒，系数为攻击力5%',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.05);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(target, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
				// 注意：addBuff 内部的 applyBuffEffect 已经会累加中毒伤害并打印日志
				updateBattleUI();
			}
		}
	},
	'poison_5_atk_50_pugong': {
		type: 'skill_effect',
		desc: '普攻时，50%几率令目标永久中毒，系数为攻击力5%',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.05);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(target, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
				// 注意：addBuff 内部的 applyBuffEffect 已经会累加中毒伤害并打印日志
				updateBattleUI();
			}
		}
	},
	'poison_5_atk_100_pugong': {
		type: 'skill_effect',
		desc: '普攻时，100%几率令目标永久中毒，系数为攻击力5%',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (target && target.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.05);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(target, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
				// 注意：addBuff 内部的 applyBuffEffect 已经会累加中毒伤害并打印日志
				updateBattleUI();
			}
		}
	},
	'poison_10_atk_20_skill': {
		type: 'skill_effect',
		desc: '使用技能后，20%几率令目标永久中毒，系数为攻击力10%',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.2; },
		content: function (target) {
			if (target && target.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.10);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(target, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
				// 注意：addBuff 内部的 applyBuffEffect 已经会累加中毒伤害并打印日志
				updateBattleUI();
			}
		}
	},
	'poison_10_atk_50_skill': {
		type: 'skill_effect',
		desc: '使用技能后，50%几率令目标永久中毒，系数为攻击力10%',
		trigger: 'skillHit',
		filter: function () { return Math.random() < 0.5; },
		content: function (target) {
			if (target && target.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.10);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(target, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
				// 注意：addBuff 内部的 applyBuffEffect 已经会累加中毒伤害并打印日志
				updateBattleUI();
			}
		}
	},
	'poison_10_atk_110_skill': {
		type: 'skill_effect',
		desc: '使用技能后，必中令目标永久中毒，系数为攻击力10%',
		trigger: 'skillHit',
		filter: function () { return true; },
		content: function (target) {
			if (target && target.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.10);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(target, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
				// 注意：addBuff 内部的 applyBuffEffect 已经会累加中毒伤害并打印日志
				updateBattleUI();
			}
		}
	},

	// --- 首回合特效 ---
	'first_hit_dmg_up_50': {
		type: 'skill_effect',
		desc: '进入战斗的首次普攻或技能伤害增加50%',
		trigger: 'actionStartSelf',
		filter: function () {
			if (!this._firstHitBonusUsed) {
				this._firstHitBonusUsed = true;
				return this._firstAttack; // 首次攻击标记
			}
			return false;
		},
		content: function () {
			this.dmgBoost = (this.dmgBoost || 0) + 0.5;
			addBattleLog(`${this.name} 首次攻击伤害增加50%`);
		}
	},
	'first_taken_dmg_reduce_75': {
		type: 'skill_effect',
		desc: '进入战斗的首次受到普攻或技能伤害减少75%',
		trigger: 'onHitSelf',
		filter: function () {
			if (!this._firstTakenBonusUsed) {
				this._firstTakenBonusUsed = true;
				return true;
			}
			return false;
		},
		content: function (attacker, damage) {
			// 在 applyDamage 中通过检查 this.dmgReduce 来实现
			this.dmgReduce = (this.dmgReduce || 0) + 0.75;
			addBattleLog(`${this.name} 首次受击伤害减少75%`);
			// 注意：这里只是设置标记，实际减伤需要在 applyDamage 中计算
		}
	},

	// --- 受击特效 ---
	'on_hit_energy_team_50': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害，50%几率令全体队友增加1能量',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.5; },
		content: function (attacker, damage) {
			const allies = getAliveUnits(this.side);
			allies.forEach(ally => {
				if (ally.alive) {
					ally.energy = Math.min(8, ally.energy + 1);
				}
			});
			addBattleLog(`${this.name} 受击，全体队友恢复1能量`);
			updateBattleUI();
		}
	},
	'on_hit_drain_source_1_25': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，25%几率减少来源1能量',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.25; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive && attacker.energy !== undefined) {
				attacker.energy = Math.max(0, attacker.energy - 1);
				addBattleLog(`${attacker.name} 被减少1点能量`);
				updateBattleUI();
			}
		}
	},
	'on_hit_drain_source_1_50': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，50%几率减少来源1能量',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.5; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive && attacker.energy !== undefined) {
				attacker.energy = Math.max(0, attacker.energy - 1);
				addBattleLog(`${attacker.name} 被减少1点能量`);
				updateBattleUI();
			}
		}
	},
	'on_hit_self_energy_1': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，自身增加1能量',
		trigger: 'onHitSelf',
		filter: function () { return true; },
		content: function (attacker, damage) {
			if (this.alive && this.energy !== undefined) {
				this.energy = Math.min(8, this.energy + 1);
				addBattleLog(`${this.name} 受击，恢复1点能量`);
				updateBattleUI();
			}
		}
	},
	'on_hit_stun_target_10': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，10%几率令来源眩晕1回合',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.1; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				addBuff(attacker, {
					id: 'stun_reflect', name: '眩晕', type: 'stun', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'on_hit_stun_target_20': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，20%几率令来源眩晕1回合',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.2; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				addBuff(attacker, {
					id: 'stun_reflect', name: '眩晕', type: 'stun', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},
	'on_hit_counter_100': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，对来源进行一次特殊普攻，造成100%攻击力的伤害',
		trigger: 'onHitSelf',
		filter: function () { return true; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				addBattleLog(`${this.name} 触发反击！`);
				const pugongId = this.skills[0] || 'attack1';
				const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
				const coeff = 1.0; // 固定100%系数
				const dmg = calculateDamage(this, attacker, coeff, 0);
				applyDamage(attacker, dmg, this, function () { }, { skillData: pData, trigger: 'pugongHit' });
			}
		}
	},
	'on_hit_counter_75': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，对来源进行一次特殊普攻，造成75%攻击力的伤害',
		trigger: 'onHitSelf',
		filter: function () { return true; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				addBattleLog(`${this.name} 触发反击！`);
				const dmg = calculateDamage(this, attacker, 0.75, 0);
				applyDamage(attacker, dmg, this, function () { }, { trigger: 'pugongHit' });
			}
		}
	},
	'on_hit_counter_50': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，对来源进行一次特殊普攻，造成50%攻击力的伤害',
		trigger: 'onHitSelf',
		filter: function () { return true; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				addBattleLog(`${this.name} 触发反击！`);
				const dmg = calculateDamage(this, attacker, 0.5, 0);
				applyDamage(attacker, dmg, this, function () { }, { trigger: 'pugongHit' });
			}
		}
	},
	'on_hit_poison_source_5_20': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，20%几率令来源中毒，系数为攻击力5%',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.2; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.05);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(attacker, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
			}
		}
	},
	'on_hit_poison_source_5_50': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，50%几率令来源中毒，系数为攻击力5%',
		trigger: 'onHitSelf',
		filter: function () { return Math.random() < 0.5; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.05);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(attacker, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
			}
		}
	},
	'on_hit_poison_source_5_100': {
		type: 'skill_effect',
		desc: '受到普攻或技能伤害时，100%几率令来源中毒，系数为攻击力5%',
		trigger: 'onHitSelf',
		filter: function () { return true; },
		content: function (attacker, damage) {
			if (attacker && attacker.alive) {
				const poisonDmg = Math.floor((this.atk || 0) * 0.05);
				// ===== 【修改】使用 addBuff 系统 =====
				addBuff(attacker, {
					id: 'poison',
					name: '中毒',
					type: 'poison',
					remainRounds: -1,  // -1 表示永久持续（直到战斗结束或被清除）
					sourceSide: this.side,
					sourceId: this.instanceId || this.id,
					value: poisonDmg,
				});
			}
		}
	},
	// --- 普攻辅助特效 ---
	'pugong_energy_team_25': {
		type: 'skill_effect',
		desc: '普攻时，25%增加全队1能量',
		trigger: 'pugongHit',
		filter: function () { return Math.random() < 0.25; },
		content: function (target) {
			const allies = getAliveUnits(this.side);
			allies.forEach(ally => {
				if (ally.alive) {
					ally.energy = Math.min(8, ally.energy + 1);
				}
			});
			addBattleLog(`${this.name} 普攻，全体队友恢复1能量`);
			updateBattleUI();
		}
	},
	'pugong_energy_lowest_1': {
		type: 'skill_effect',
		desc: '普攻时，令能量最低的一名队友增加1能量',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			const allies = getAliveUnits(this.side);
			if (allies.length === 0) return;
			// 找到能量最低的队友
			let lowestAlly = allies[0];
			allies.forEach(ally => {
				if ((ally.energy || 0) < (lowestAlly.energy || 0)) {
					lowestAlly = ally;
				}
			});
			lowestAlly.energy = Math.min(8, lowestAlly.energy + 1);
			addBattleLog(`${lowestAlly.name} 获得1点能量（能量最低）`);
			updateBattleUI();
		}
	},
	'pugong_energy_self_1': {
		type: 'skill_effect',
		desc: '普攻时，恢复1点能量',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.energy !== undefined) {
				this.energy = Math.min(8, this.energy + 1);
				addBattleLog(`${this.name} 普攻，恢复1点能量`);
				updateBattleUI();
			}
		}
	},
	'pugong_energy_self_2': {
		type: 'skill_effect',
		desc: '普攻时，恢复2点能量',
		trigger: 'pugongHit',
		filter: function () { return true; },
		content: function (target) {
			if (this.energy !== undefined) {
				this.energy = Math.min(8, this.energy + 2);
				addBattleLog(`${this.name} 普攻，恢复2点能量`);
				updateBattleUI();
			}
		}
	},

	// --- 技能类：杂项 ---
	'skill_energy_self_2': {
		type: 'skill_effect',
		desc: '使用技能后，恢复2点能量',
		trigger: 'actionEndSelf',
		filter: function () {
			// 避免普攻时也触发，检查是否使用了技能
			return this._lastActionType === 'skill' || this._lastActionType === 'spskill';
		},
		content: function () {
			if (this.energy !== undefined) {
				this.energy = Math.min(8, this.energy + 2);
				addBattleLog(`${this.name} 技能后，恢复2点能量`);
				updateBattleUI();
			}
		}
	},
	'extra_pugong': {
		type: 'skill_effect',
		desc: '使用技能后，立即进行一次自动普攻（不触发部分手动选择逻辑）',
		trigger: 'actionEndSelf',
		filter: function () {
			return this._lastActionType === 'skill' || this._lastActionType === 'spskill';
		},
		content: function () {
			const enemySide = this.side === 'player' ? 'enemy' : 'player';
			const enemies = getAliveUnits(enemySide);
			if (enemies.length > 0) {
				const target = enemies[Math.floor(Math.random() * enemies.length)];
				addBattleLog(`${this.name} 触发额外普攻！`);
				const pugongId = this.skills[0] || 'attack1';
				const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
				const coeff = (pData && pData.coefficient) ? Number(pData.coefficient) : 1.0;
				const dmg = calculateDamage(this, target, coeff, 0);
				applyDamage(target, dmg, this, function () { }, {
					skillData: pData,
					trigger: 'pugongHit',
					skillId: pugongId
				});
			}
		}
	},
	'skill_invincible_1': {
		type: 'skill_effect',
		desc: '使用技能后，获得1回合无敌状态（免疫所有伤害，直到下一轮你的回合开始前）',
		trigger: 'actionEndSelf',
		filter: function () {
			return this._lastActionType === 'skill' || this._lastActionType === 'spskill';
		},
		content: function () {
			this.invincible = true;
			addBattleLog(`${this.name} 获得无敌状态！`);
			updateBattleUI();
		}
	},
	'kill_extra_turn_1': {
		type: 'skill_effect',
		desc: '成功击杀敌人后，获得1个额外行动回合',
		trigger: 'onKill',
		filter: function () { return true; },
		content: function (target) {
			this.extraTurn = true;
			addBattleLog(`${this.name} 击杀敌人，获得额外回合！`);
		}
	},
	'kill_add_energy_self_2': {
		type: 'skill_effect',
		desc: '成功击杀敌人后，获得2能量',
		trigger: 'onKill',
		filter: function () { return true; },
		content: function (target) {
			if (this.energy !== undefined) {
				this.energy = Math.min(8, this.energy + 2);
				addBattleLog(`${this.name} 击杀敌人，恢复2点能量`);
				updateBattleUI();
			}
		}
	},
	'skill_heal_block_1': {
		type: 'skill_effect',
		desc: '技能命中后，令目标禁疗1回合（直到下一轮目标的回合开始前）',
		trigger: 'skillHit',
		filter: function () { return true; },
		content: function (target) {
			if (target && target.alive) {
				addBuff(target, {
					id: 'healBlock', name: '禁疗', type: 'healBlock', remainRounds: 1,
					sourceSide: this.side, sourceId: this.instanceId,
					ownerSlot: this._currentActionSlotKey || null
				});
			}
		}
	},

	// --- 治疗系专属 ---
	// 常驻效果，保留为 passive_effect
	'heal_up_10': { type: 'passive_effect', effectId: 'heal_up_10', desc: '治疗量增加10%' },
	'heal_up_25': { type: 'passive_effect', effectId: 'heal_up_25', desc: '治疗量增加25%' },
	'heal_up_50': { type: 'passive_effect', effectId: 'heal_up_50', desc: '治疗量增加50%' },

	'heal_energy_target_1_pugong': {
		type: 'skill_effect',
		desc: '普攻时，令被治疗目标增加1能量',
		trigger: 'onHeal',
		filter: function () { return true; },
		content: function (target, healAmount) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.min(8, target.energy + 1);
				addBattleLog(`${target.name} 获得1点能量`);
				updateBattleUI();
			}
		}
	},
	'heal_energy_target_1_skill': {
		type: 'skill_effect',
		desc: '技能时，令被治疗目标增加1能量',
		trigger: 'onHeal',
		filter: function () { return true; },
		content: function (target, healAmount) {
			if (target && target.alive && target.energy !== undefined) {
				target.energy = Math.min(8, target.energy + 1);
				addBattleLog(`${target.name} 获得1点能量`);
				updateBattleUI();
			}
		}
	},
	'heal_cleanse_target_skill': {
		type: 'skill_effect',
		desc: '技能时，解除被治疗目标的负面效果',
		trigger: 'onHeal',
		filter: function () { return true; },
		content: function (target, healAmount) {
			if (target && target.alive) {
				// 清除负面 buff（seal/stun/healBlock/poison）
				const debuffTypes = ['seal', 'stun', 'healBlock', 'poison'];
				const toRemove = [];
				(target.buffList || []).forEach(function (buff, index) {
					if (debuffTypes.includes(buff.type)) {
						toRemove.push(index);
					}
				});
				// 从后往前移除，避免索引错乱
				toRemove.reverse().forEach(function (index) {
					const buff = target.buffList[index];
					target.buffList.splice(index, 1);
					removeBuffEffect(target, buff);
				});
				if (toRemove.length === 0) {
					// 兜底：兼容尚未走 addBuff 系统的旧数据
					target.stunned = false;
					target.sealed = false;
					target.healBlocked = false;
					target.poisonDamage = 0;
				}
				addBattleLog(`${target.name} 的负面效果已被清除`);
				updateBattleUI();
			}
		}
	},



























	tupo0: {
		type: 'self_stat_flat',
		atk: 100,
		desc: '初始化时攻击+100固定数值'
	},
	tupo1: {
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	tupo2: {
		type: 'self_stat_flat',
		def: 50,
		desc: '初始化时防御+50固定数值'
	},
	tupo3: {
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	tupo4: {
		type: 'self_stat_flat',
		hp: 200,
		desc: '初始化时血量+200固定数值'
	},
	tupo6: {
		type: 'self_stat_percent',
		atk: 0.1,
		def: 0.1,
		hp: 0.1,
		desc: '初始化时获得10%的攻防血加成'
	},
	tupo7: {
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	tupo9: {
		type: 'team_stat_flat',
		atk: 200,
		desc: '初始化时全队获得攻击+200固定数值'
	},
	tupo11: {
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	tupo12: {
		type: 'team_stat_flat',
		def: 100,
		desc: '初始化时全队获得防御+100固定数值'
	},
	tupo14: {
		type: 'team_stat_flat',
		hp: 300,
		desc: '初始化时全队获得血量+300固定数值'
	},
	tupo15: {
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	tupo16: {
		type: "self_stat_flat",
		atk: 1000,
		def: 500,
		hp: 2000,
		desc: "攻击+1000，防御+500，血量+2000",
	},
	tupo17: {
		type: 'team_stat_percent',
		atk: 0.1,
		def: 0.1,
		hp: 0.1,
		desc: '初始化时全队获得10%的攻防血加成'
	},
	tupo19: {
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},

	// newtupo0:{
	// },
	newtupo1:{
		type: 'self_stat_flat',
		atk: 100,
		def: 80,
		hp: 400,
		desc: '攻击+100，防御+80，血量+400'
	},
	newtupo2:{
		type: 'team_stat_flat',
		atk: 250,
		desc: '全队获得攻击+250固定数值'
	},
	// newtupo3:{},//每名角色各异
	// newtupo4:{},//每名角色各异
	newtupo5:{
		type: 'self_energy',
		value: 2,
		desc: '初始能量+2'
	},
	// newtupo6:{},//每名角色各异
	// newtupo7:{},//每名角色各异
	newtupo8:{
		type: 'team_stat_flat',
		hp: 2500,
		desc: '全队获得血量+2500'
	},
	// newtupo9:{},//每名角色各异
	newtupo10:{
		type: 'self_stat_percent',
		atk: 0.06,
		def: 0.06,
		hp: 0.06,
		desc: '获得6%的攻防血加成'
	},
	// newtupo11:{},//每名角色各异
	newtupo12:{
		type: 'team_stat_flat',
		fixedDmgUp: 3000,
		fixedDmgDown: 3000,
		hp: 8000,
		desc: '全队获得固定增伤+3000，固定减伤+3000，血量+8000'
	},
	// newtupo13:{},//每名角色各异
	newtupo14:{
		type: "self_stat_flat",
		atk: 3000,
		def: 1500,
		hp: 20000,
		desc: "攻击+3000，防御+1500，血量+20000",
	},
	// newtupo15:{},//每名角色各异
	newtupo16:{
		type: 'self_stat_flat',
		atk: 3000,
		def: 3000,
		hp: 24000,
		desc: '攻击+3000，防御+3000，血量+48000'
	},
	// newtupo17:{},//每名角色各异
	newtupo18:{
		type: 'self_stat_percent',
		atk: 0.1,
		def: 0.1,
		hp: 0.1,
		openSpskill: true,
		desc:'获得10%的攻防血加成，解锁必杀（如果有必杀才会生效）'
	},
	// newtupo19:{},//每名角色各异

};

// ==================== 标准突破等级模板 (0-19) ====================
const STANDARD_BREAKTHROUGH_TEMPLATE = [
	// Level 0
	{
		level: 0,
		type: 'self_stat_flat',
		atk: 100,
		desc: '初始化时攻击+100固定数值'
	},
	// Level 1
	{
		level: 1,
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	// Level 2
	{
		level: 2,
		type: 'self_stat_flat',
		def: 50,
		desc: '初始化时防御+50固定数值'
	},
	// Level 3
	{
		level: 3,
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	// Level 4
	{
		level: 4,
		type: 'self_stat_flat',
		hp: 200,
		desc: '初始化时血量+200固定数值'
	},
	// Level 5 (角色专有突破buff)
	{
		level: 5,
	},
	// Level 6
	{
		level: 6,
		type: 'self_stat_percent',
		atk: 0.1,
		def: 0.1,
		hp: 0.1,
		desc: '初始化时获得10%的攻防血加成'
	},
	// Level 7
	{
		level: 7,
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	// Level 8 (角色专属buff)
	{
		level: 8,
	},
	// Level 9
	{
		level: 9,
		type: 'team_stat_flat',
		atk: 200,
		desc: '初始化时全队获得攻击+200固定数值'
	},
	// Level 10 (角色专属buff)
	{
		level: 10,
	},
	// Level 11
	{
		level: 11,
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	// Level 12
	{
		level: 12,
		type: 'team_stat_flat',
		def: 100,
		desc: '初始化时全队获得防御+100固定数值'
	},
	// Level 13 (专属buff)
	{
		level: 13,
	},
	// Level 14
	{
		level: 14,
		type: 'team_stat_flat',
		hp: 300,
		desc: '初始化时全队获得血量+300固定数值'
	},
	// Level 15
	{
		level: 15,
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	},
	// Level 16 (专属buff)
	{
		level: 16,
		type: "self_stat_flat",
		atk: 1000,
		def: 500,
		hp: 2000,
		desc: "攻击+1000，防御+500，血量+2000",
	},
	// Level 17
	{
		level: 17,
		type: 'team_stat_percent',
		atk: 0.1,
		def: 0.1,
		hp: 0.1,
		desc: '初始化时全队获得10%的攻防血加成'
	},
	// Level 18 (专属buff)
	{
		level: 18,
	},
	// Level 19
	{
		level: 19,
		type: 'self_energy',
		value: 1,
		desc: '初始能量+1'
	}
];

// 导出配置
window.BREAKTHROUGH_BUFF_LIBRARY = BREAKTHROUGH_BUFF_LIBRARY;
window.STANDARD_BREAKTHROUGH_TEMPLATE = STANDARD_BREAKTHROUGH_TEMPLATE;
