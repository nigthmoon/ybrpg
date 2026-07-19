/**
 * 生成完整的20阶突破列表
 * @param {Array} exclusiveEffects - 5个专属位的库ID或自定义对象
 *	  索引对应: [level5, level8, level10, level13, level18]
 *	  每个元素可以是:
 *		- string: 库中的 effectId (如 'seal_target_30_skill')
 *		- null: 空专属位
 *		- object: 自定义突破对象
 * @returns {Array} 完整的20阶突破列表
 */
function generateTupoList(exclusiveEffects = [null, null, null, null, null]) {
	// 通用项：直接用库ID字符串
	const result = [
		'tupo0',   // level 0
		'tupo1',   // level 1
		'tupo2',   // level 2
		'tupo3',   // level 3
		'tupo4',   // level 4
		null,	  // level 5 (专属位，占位)
		'tupo6',   // level 6
		'tupo7',   // level 7
		null,	  // level 8 (专属位，占位)
		'tupo9',   // level 9
		null,	  // level 10 (专属位，占位)
		'tupo11',  // level 11
		'tupo12',  // level 12
		null,	  // level 13 (专属位，占位)
		'tupo14',  // level 14
		'tupo15',  // level 15
		'tupo16',  // level 16
		'tupo17',  // level 17
		null,	  // level 18 (专属位，占位)
		'tupo19',  // level 19
	];

	// 专属位映射：索引 → level
	const exclusiveMap = [5, 8, 10, 13, 18];

	// 填充专属位
	exclusiveEffects.forEach((effect, idx) => {
		if (effect !== null && effect !== undefined) {
			const level = exclusiveMap[idx];
			if (typeof effect === 'string') {
				// 字符串：直接使用库ID
				result[level] = effect;
			} else if (typeof effect === 'object') {
				// 对象：直接作为突破项
				effect.level = level;
				result[level] = effect;
			}
		}
	});

	return result;
}

function generateTupoList_new(exclusiveEffects = [null, null, null, null, null, null, null, null, null, null]) {
	// 通用项：直接用库ID字符串
	const result = [
		null,   // level 0//任何角色第一次突破都不带有任何技能
		'newtupo1',   // level 1
		'newtupo2',   // level 2
		null,   // level 3
		null,   // level 4
		'newtupo5',	  // level 5 (专属位，占位)
		null,   // level 6
		null,   // level 7
		'newtupo8',	  // level 8 (专属位，占位)
		null,   // level 9
		'newtupo10',	  // level 10 (专属位，占位)
		null,  // level 11
		'newtupo12',  // level 12
		null,	  // level 13 (专属位，占位)
		'newtupo14',  // level 14
		null,  // level 15
		'newtupo16',  // level 16
		null,  // level 17
		'newtupo18',	  // level 18 (专属位，占位)
		null,  // level 19
	];
	// 专属位映射：索引 → level
	const exclusiveMap = [3, 4, 6, 7, 9, 11, 13, 15, 17, 19];
	// 填充专属位
	exclusiveEffects.forEach((effect, idx) => {
		if (effect !== null && effect !== undefined) {
			const level = exclusiveMap[idx];
			if (typeof effect === 'string') {
				// 字符串：直接使用库ID
				result[level] = effect;
			} else if (typeof effect === 'object') {
				// 对象：直接作为突破项
				effect.level = level;
				result[level] = effect;
			}
		}
	});

	return result;
}

// ==================== 角色列表 ====================
const characterList = {
	// ===== 主角 (编号: 000) =====
	zhujue: {
		name: "主角", group: "zhujue", sex: "female", tupolevel: 0,
		skills: ["pugong_000", "skill_000", "spskill_000"],
		isFixed: true,
		template: "balanced", rank: "common", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				gongji: 100,
				desc: '攻击+100'
			},
			{
				type: 'self_stat_flat',
				shanbi: 400,
				desc: '闪避+400'
			},
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'self_stat_flat',
				gedang: 3000,
				desc: '格挡+3000'
			}, 
			{
				type: 'self_stat_flat',
				baoji: 3000,
				desc: '暴击+3000'
			}, 
			{
				type: 'skill_effect',
				desc: '获得10%增伤',
				trigger: 'onDamageCalc',
				filter: function () { return true; },
				content: function (target, dmg, mod) {
					mod.pct += 0.1; // 无条件增伤 10%
				}
			}, 
			{
				type: 'self_stat_flat',
				shanbi: 1200,
				desc: '闪避+1200'
			},
			{
				type: 'self_stat_flat',
				mingzhong: 1500,
				desc: '命中+1500'
			}, 
			{
				type: 'self_stat_flat',
				kangbao: 2000,
				desc: '抗暴+2000'
			},
			{
				type: 'skill_effect',
				desc: '获得30%减伤',
				trigger: 'onDamageTaken',
				filter: function () { return true; },
				content: function (attacker, dmg, mod) {
					mod.pct += 0.3; // 无条件减伤 30%
				}
			}, 
		])
	},

	// ===== 平凡 (Junk) - 编号: 501-503 =====
	ybsl_leimoying: {
		name: "雷魔鹰", group: "zhujue", sex: "female",
		skills: ["pugong_501", "skill_501"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_fengmolang: {
		name: "风魔狼", group: "zhujue", sex: "female",
		skills: ["pugong_502", "skill_502"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_yanmohua: {
		name: "魇魔花", group: "zhujue", sex: "female",
		skills: ["pugong_503", "skill_503"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},

	// ===== 传说级 (Legend) - YB_memory (编号: 001-005) =====
	ybsl_017xiaohong: {
		name: "涂山小红", group: "YB_memory", sex: "female",
		skills: ["pugong_001", "skill_001", "spskill_001"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'self_stat_flat',
				baoji: 1500,
				baoshang:3000,
				desc: '暴击+1500，暴伤+3000'
			},
			{
				type: 'skill_effect',
				desc: '自身血量高于目标时，对其伤害增加30%',
				trigger: 'onDamageCalc',
				filter: function (target) {
					// 自身当前血量百分比高于目标时触发
					return target && target.alive && (this.hp / this.maxHp) > (target.hp / target.maxHp);
				},
				content: function (target, dmg, mod) {
					mod.pct += 0.3; // 增伤 30%
				}
			}, 
			{
				type: 'skill_effect',
				desc: '技能（含必杀）后，若本次技能出现过暴击，回复2能量',
				trigger: 'skillEnd',
				filter: function (info) {
					return info && info.hadCrit === true;
				},
				content: function (info) {
					this.energy = Math.min(8, (this.energy || 0) + 2);
					Game.Battle.log(`${this.name} 技能暴击，回复2能量（当前 ${this.energy}）`);
				}
			}, 
			{
				type: 'self_stat_flat',
				poji:1500,
				desc: '破击+1500'
			},
			{
				type: 'skill_effect',
				desc: '技能增伤50%（条件增伤）',
				trigger: 'onDamageCalc',
				filter: function () { return true; },
				content: function (target, dmg, mod) {
					// 仅技能（含必杀，不含普攻）增伤 50%
					if (mod.attackType === 'skill') mod.pct += 0.5;
				}
			},
			{
				type: 'self_stat_flat',
				kangbao: 2000,
				desc: '抗暴+2000'
			}, 
			{
				type: 'skill_effect',
				desc: '技能（含必杀）时，为自身回复100%攻击力的生命值',//注：由于这类回复并非治疗系普攻技能直接带来的，因此不会被治疗系数等影响
				trigger: 'skillEnd',
				filter: function () { return true; },
				content: function () {
					// 直接回血，不走治疗系数/降疗等体系
					const heal = Math.floor(this.atk);
					this.hp = Math.min(this.maxHp, (this.hp || 0) + heal);
					Game.Battle.log(`${this.name} 技能回血 ${heal}（当前 ${this.hp}/${this.maxHp}）`);
				}
			},
			{
				type: 'skill_effect',
				desc: '普攻命中后，45%令目标获得受到伤害增加30%，持续1回合',//注：本游戏中的持续一回合，指的时持续至下X轮的施法者所处位格行动后
				trigger: 'pugongHit',
				filter: function (target) {
					return target && target.alive;
				},
				content: function (target) {
					if (Math.random() < 0.45) {
						shared.addBuff(target, {
							id: 'xh_vuln',
							name: '受伤增加',
							type: 'takeUp',
							remainRounds: 1,
							value: 0.3,
							sourceSide: this.side,
							sourceId: this.instanceId,
							ownerSlot: this._currentActionSlotKey || null
						});
						Game.Battle.log(`${this.name} 令 ${target.name} 受伤增加30%（持续至施法者位格行动后）`);
					}
				}
			},
			{
				type: 'self_stat_percent',
				hp: 0.5,
				desc: '血量增加50%',
			},
		])
	},
	ybsl_059starsFall1: {
		name: "鞠熒", group: "YB_memory", sex: "female",
		skills: ["pugong_002", "skill_002", "spskill_002"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'self_stat_flat',
				mingzhong: 10000,
				desc: '命中+10000'
			},
			{
				type: 'skill_effect',
				desc: '成功击杀敌人后，获得1个额外行动回合',
				trigger: 'onKill',
				filter: function () { return true; },
				content: function (target) {
					this.extraTurn = true;
					Game.Battle.log(`${this.name} 击杀敌人，获得额外回合！`);
				}
			}, 
			{
				type: 'skill_effect',
				desc: '目标血量低于50%时，对其造成的伤害增加50%',
				trigger: 'onDamageCalc',
				filter: function (target) {
					return target && target.alive && (target.hp / target.maxHp) < 0.5;
				},
				content: function (target, dmg, mod) {
					mod.pct += 0.5; // 通过对传入参数赋值传出比值：增伤 50%
				}
			}, 
			{
				type: 'self_stat_flat',
				baoji: 750,
				baoshang:1500,
				desc: '暴击+750，暴伤+1500'
			},
			{
				type: 'passive_effect', 
				effectId: 'ignore_def_all_60', 
				desc: '所有伤害无视对方60%防御力'
			},
			{
				type: 'self_stat_flat',
				poji: 2000,
				desc: '破击+2000'
			}, 
			{
				type: 'skill_effect',
				desc: '技能命中后，令目标降疗100%，持续2回合',
				trigger: 'skillHit',
				filter: function () { return true; },
				content: function (target) {
					if (target && target.alive) {
						shared.addBuff(target, {
							id: 'healReduce_skill_100',
							name: '降疗100%',
							type: 'healReduce',
							value: 1.0,
							remainRounds: 2,
							ownerSlot: this._currentActionSlotKey || null
						});
					}
				}
			},
			{
				type: 'skill_effect',
				desc: '普攻命中后，60%几率令目标降疗80%，持续1回合',
				trigger: 'pugongHit',
				filter: function () { return Math.random() < 0.6; },
				content: function (target) {
					if (target && target.alive) {
						shared.addBuff(target, {
							id: 'healReduce_pugong_80',
							name: '降疗80%',
							type: 'healReduce',
							value: 0.8,
							remainRounds: 1,
							ownerSlot: this._currentActionSlotKey || null
						});
					}
				}
			},
			{
				type: 'skill_effect',
				desc: '战斗中，敌方每次减员，增加自身攻击力10%（基于战斗开始时的攻击力）',
				trigger: 'dieGlobal',
				filter: function (deadUnit) {
					// 仅当阵亡单位属于敌方（与本单位不同阵营）时触发
					return deadUnit && deadUnit.alive === false && deadUnit.side !== this.side;
				},
				content: function (deadUnit) {
					const add = Math.floor(this.baseAtk * 0.1);
					this.atk += add;
					Game.Battle.log(`${this.name} 敌方减员，攻击力提升 ${add}（当前 ${this.atk}）`);
				}
			},
		])
	},
	ybsl_047shan: {
		name: "彡", group: "YB_memory", sex: "female",
		skills: ["pugong_003", "skill_003", "spskill_003"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				gedang: 1000,
				desc:'格挡+1000'
			},
			{
				type: 'self_stat_flat',
				gedang: 3000,
				desc:'格挡+3000'
			},
			{
				type: 'skill_effect',
				desc:'格挡反击，造成75%伤害',
				trigger: 'onBlock',
				filter: function (source) { return source && source.alive; },
				content: function (source) {
				// 格挡反击：复用普攻伤害流程（calculateDamage，attackType='pugong'），
				// 因此与普攻一样可正常触发【暴击 / 格挡 / 闪避】判定（伤害减半、showDamageNumber 等均生效）。
				// 与普攻的区别：
				//   1) trigger='blockCounter' → 不触发攻击者的「普攻命中时机」(pugongHit) 效果；
				//   2) isSpecial=true → 被击者再次格挡时不会触发其格挡反击，避免无限嵌套。
				// 被击者的受击效果(onHitSelf)仍正常触发，与普攻一致。
				// 伤害系数 = 普攻系数 × 格挡反击系数(75%)。
				const pugongId = this.skills[0] || 'attack1';
					const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
					const baseCoeff = (pData && pData.coefficient) ? Number(pData.coefficient) : 1.0;
					const coeff = baseCoeff * 0.75;
					Game.Battle.log(`${this.name} 触发格挡反击！`);
					const dmg = Game.Battle.calculateDamage(this, source, coeff, 0, 'pugong');
					Game.Battle.applyDamage(source, dmg, this, function () {}, { isSpecial: true, trigger: 'blockCounter' });
				}
			},
			{
				type: 'skill_effect',
				desc:'自身血量高于50%时，受到伤害减少50%（条件减伤）',
				trigger: 'onDamageTaken',
				filter: function (attacker, currentDmg) {
					return this.alive && (this.hp / this.maxHp) > 0.5;
				},
				content: function (attacker, currentDmg, defMod) {
					defMod.pct += 0.5;
				}
			},
			{
				type: 'self_stat_flat',
				gedang: 1500,
				desc:'格挡+1500'
			},
			{
				type: 'skill_effect',
				desc:'被普攻/技能命中时，25%几率减少来源1点能量。',
				trigger: 'onHitSelf',
				filter: function (attacker, damage) { return Math.random() < 0.25; },
				content: function (attacker, damage) {
					if (attacker && attacker.alive && attacker.energy !== undefined) {
						attacker.energy = Math.max(0, attacker.energy - 1);
						Game.Battle.log(`${attacker.name} 被减少1点能量`);
						Game.Battle.updateUI();
					}
				}
			},
			{
				type: 'self_stat_flat',
				kangbao: 2000,
				desc:'抗暴+2000'
			},
			{
				type: 'self_stat_percent',
				hp: 0.5,
				desc:'血量+50%'
			},
			{
				type: 'skill_effect',
				desc:'普攻命中时，45%几率减少目标1点能量。',
				trigger: 'pugongHit',
				filter: function (target) { return Math.random() < 0.45; },
				content: function (target) {
					if (target && target.alive && target.energy !== undefined) {
						target.energy = Math.max(0, target.energy - 1);
						Game.Battle.log(`${target.name} 被减少1点能量`);
						Game.Battle.updateUI();
					}
				}
			},
			{
				type: 'skill_effect',
				desc:'使用技能后，自身获得buff：无法被暴击，必定格挡，持续1回合。',
				trigger: 'actionEndSelf',
				filter: function () {
					return this._lastActionType === 'skill' || this._lastActionType === 'spskill';
				},
				content: function () {
					// 【硬逻辑】免暴 + 必定格挡：用 buff 标记强制，而非数值堆叠。
					// （暴击/抗暴可无限培养，数值堆叠无法保证 100% 生效）
					//   no_crit    → calculateDamage 强制 isCrit=false（无法被暴击）
				//   must_block → calculateDamage 强制 isBlock=true（必定格挡，伤害减半并触发反击）
				// 注：衰减机制已改为「按位格行动世代」结算——本次行动内施加的 buff 当回合不衰减，
				// 故 remainRounds:1 即表示「持续至施法者下个位格行动后」（=持续1回合），无需再用 2。
				Game.Battle.addBuff(this, {
					id: 'no_crit_buff',
					name: '免暴',
					type: 'no_crit',
					remainRounds: 1,
					ownerSlot: this._currentActionSlotKey || null
				});
				Game.Battle.addBuff(this, {
					id: 'must_block_buff',
					name: '必定格挡',
					type: 'must_block',
					remainRounds: 1,
					ownerSlot: this._currentActionSlotKey || null
				});
					Game.Battle.log(`${this.name} 获得免暴与必定格挡（持续1回合）`);
				}
			}
		])
	},
	ybsl_041mmuqin: {
		name: "慕琴", group: "YB_memory", sex: "female",
		skills: ["pugong_004", "skill_004", "spskill_004"],
		template: "balanced", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				shanbi: 800,
				desc: '闪避+800'
			},
			{
				type: 'self_stat_flat',
				shanbi: 1800,
				desc: '闪避+1800'
			}, 
			{
				type: 'skill_effect',
				desc: '释放技能后，提升后排2000暴击持续2回合',
				trigger: 'skillEnd',
				filter: function () { return true; },
				content: function (info) {
					const allies = Game.Battle.getAliveUnits(this.side).filter(u => u.slotIndex >= 3);
					allies.forEach(ally => {
						Game.Battle.addBuff(ally, { id: 'baoji_back_2000', name: '暴击提升', type: 'baoji', value: 2000, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					});
				}
			}, 
			{
				type: 'skill_effect',
				desc: '上场后限三次，自身受到伤害减少75%',
				trigger: 'onDamageTaken',
				filter: function (attacker, dmg) {
					if (!this._dmgReduceTimes) this._dmgReduceTimes = 0;
					if (this._dmgReduceTimes < 3) {
						this._dmgReduceTimes++;
						return true;
					}
					return false;
				},
				content: function (attacker, dmg, mod) {
					mod.pct += 0.75;
				}
			}, 
			{
				type: 'self_stat_flat',
				baoji: 1500,
				desc: '暴击+1500'
			},
			{
				type: 'skill_effect',
				desc: '自身血量高于目标时，对其伤害增加50%',
				trigger: 'onDamageCalc',
				filter: function (target) {
					return target && target.alive && (this.hp / this.maxHp) > (target.hp / target.maxHp);
				},
				content: function (target, dmg, mod) {
					mod.pct += 0.5;
				}
			}, 
			{
				type: 'self_stat_flat',
				kangbao: 2000,
				desc: '抗暴+2000'
			}, 
			{
				type: 'skill_effect',
				desc: '收到技能伤害减少50%',
				trigger: 'onDamageTaken',
				filter: function () { return true; },
				content: function (attacker, dmg, mod) {
					if (mod.attackType === 'skill') mod.pct += 0.5;
				}
			}, 
			{
				type: 'skill_effect',
				desc: '普攻命中时，15%几率令目标麻痹，持续1回合',
				trigger: 'pugongHit',
				filter: function (target) { return Math.random() < 0.15; },
				content: function (target) {
					Game.Battle.addBuff(target, { id: 'paralyze_target', name: '麻痹', type: 'paralyze', remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			}, 
			{
				type: 'skill_effect',
				desc: '释放技能后，令血量最少的三名敌人减少35%的被治疗率，持续2回合',
				trigger: 'skillEnd',
				filter: function () { return true; },
				content: function (info) {
					const enemySide = this.side === 'player' ? 'enemy' : 'player';
					const enemies = Game.Battle.getAliveUnits(enemySide)
						.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))
						.slice(0, 3);
					enemies.forEach(e => {
						Game.Battle.addBuff(e, { id: 'healReduce_target_35', name: '降疗', type: 'healReduce', value: 0.35, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					});
				}
			}
		])
	},
	ybsl_049waner: {
		name: "王婉儿", group: "YB_memory", sex: "female",
		skills: ["pugong_005", "skill_005", "spskill_005"],
		template: "balanced", rank: "legend", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'self_stat_percent',
				pctTakeDn: 0.18,
				desc: '受到伤害减少18%'
			}, 
			{
				type: 'self_stat_flat',
				shanbi: 1800,
				desc: '闪避+1800'
			},
			{
				type: 'self_stat_percent',
				pctHeal: 0.3,
				pctTakeDn: 0.15,
				desc: '治疗效果+30%，受到伤害减少15%'
			},
			{
				type: 'self_stat_flat',
				baoji: 1500,
				desc: '暴击+1500'
			},
			{
				type: 'self_stat_percent',
				pctTakeDn: 0.3,
				desc: '受到伤害减少30%'
			},
			{
				type: 'self_stat_flat',
				shanbi: 1200,
				desc: '闪避+1200'
			},
			{
				// 亡语：100%几率减少全体敌方1点能量（暂未实现，跳过）
			},
			{
				type: 'skill_effect',
				desc: '普攻时，100%几率提升目标30%减伤一回合',
				trigger: 'pugongHit',
				filter: function () { return true; },
				content: function (target) {
					Game.Battle.addBuff(target, { id: 'takeDn_target_30', name: '减伤', type: 'takeDn', value: 0.3, remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			},
			{
				type: 'skill_effect',
				desc: '技能时，100%几率提升目标25%减伤一回合',
				trigger: 'skillHit',
				filter: function () { return true; },
				content: function (target) {
					Game.Battle.addBuff(target, { id: 'takeDn_target_25', name: '减伤', type: 'takeDn', value: 0.25, remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			}
		])
	},

	// ===== 传说级 (Legend) - YB_dream (编号: 006-010) =====
	ybsl_048wushuang: {
		name: "吴爽", group: "YB_dream", sex: "female",
		skills: ["pugong_006", "skill_006", "spskill_006"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'skill_effect',
				desc: '暴击时，增加1点能量',
				trigger: ['pugongHit', 'skillHit'],
				filter: function (target) { return this._lastHitIsCrit === true; },
				content: function (target) {
					this.energy = Math.min(8, (this.energy || 0) + 1);
					Game.Battle.log(`${this.name} 暴击，回复 1 能量`);
				}
			}, 
			{
				type: 'skill_effect',
				desc: '普攻命中时，对额定目标的左右角色造成60%伤害',
				trigger: 'pugongHit',
				filter: function () { return true; },
				content: function (target) {
					if (!target || !target.alive) return;
					const side = target.side;
					const idx = target.slotIndex;
					const neighbors = [idx - 1, idx + 1]
						.map(i => Game.Battle.getAliveUnits(side).find(u => u.slotIndex === i))
						.filter(Boolean);
					neighbors.forEach(n => {
						const dmg = Game.Battle.calculateDamage(this, n, 0.6, 0, 'pugong');
						Game.Battle.applyDamage(n, dmg, this, function () {}, { trigger: 'extraHit', isSpecial: true });
					});
				}
			}, 
			{
				type: 'skill_effect',
				desc: '每次普攻或技能后，增加10%攻击，最多30%',
				trigger: ['pugongEnd', 'skillEnd'],
				filter: function () { return true; },
				content: function (info) {
					if ((this.atkPctBonus || 0) + 0.1 <= 0.3) {
						Game.Battle.addBuff(this, { id: 'atk_stack', name: '攻击提升', type: 'atk', value: 0.1, remainRounds: -1, ownerSlot: this._currentActionSlotKey || null });
					}
				}
			}, 
			{
				type: 'self_stat_flat',
				mingzhong: 1500,
				desc: '命中+1500'
			},
			{
				type: 'passive_effect',
				effectId: 'ignore_def_skill_100',
				desc: '技能无视100%防御'
			}, 
			{
				type: 'self_stat_flat',
				mingzhong: 2000,
				desc: '命中+2000'
			}, 
			{
				type: 'skill_effect',
				desc: '技能命中时，100%几率降低目标75%被治疗率2回合',
				trigger: 'skillHit',
				filter: function () { return true; },
				content: function (target) {
					Game.Battle.addBuff(target, { id: 'healReduce_target_75', name: '降疗', type: 'healReduce', value: 0.75, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
				}
			}, 
			{
				type: 'skill_effect',
				desc: '普攻时，45%几率增加1能量',
				trigger: 'pugongHit',
				filter: function () { return Math.random() < 0.45; },
				content: function (target) {
					this.energy = Math.min(8, (this.energy || 0) + 1);
					Game.Battle.log(`${this.name} 普攻，回复 1 能量`);
				}
			}, 
			{
				type: 'self_stat_percent',
				pctTakeDn: 0.3,
				desc: '受到伤害减少30%'
			}
		])
	},
	ybsl_076zhujun: {
		name: "朱焌", group: "YB_dream", sex: "female",
		skills: ["pugong_007", "skill_007", "spskill_007"],
		template: "defense", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				gedang: 1000,
				desc: '格挡+1000'
			},
			{
				type: 'skill_effect',
				desc: '格挡反击，造成75%伤害',
				trigger: 'onBlock',
				filter: function () { return true; },
				content: function (attacker) {
					const dmg = Game.Battle.calculateDamage(this, attacker, 0.75, 0, 'pugong');
					Game.Battle.applyDamage(attacker, dmg, this, function () {}, { trigger: 'blockCounter', isSpecial: true });
				}
			}, 
			{
				type: 'skill_effect',
				desc: '自身血量低于50%时，受到伤害减少30%',
				trigger: 'onDamageTaken',
				filter: function () { return (this.hp / this.maxHp) < 0.5; },
				content: function (attacker, dmg, mod) {
					mod.pct += 0.3;
				}
			}, 
			{
				// 亡语限一次，回复自身150%攻击力的生命值（暂未实现，跳过）
			}, 
			{
				type: 'self_stat_flat',
				gedang: 1500,
				desc: '格挡+1500'
			}, 
			{
				type: 'skill_effect',
				desc: '被攻击时，15%几率眩晕目标1回合',
				trigger: 'onHitSelf',
				filter: function (attacker, dmg) { return Math.random() < 0.15; },
				content: function (attacker) {
					Game.Battle.addBuff(attacker, { id: 'stun_attacker', name: '眩晕', type: 'stun', remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			}, 
			{
				type: 'self_stat_flat',
				kangbao: 2000,
				desc: '抗暴+2000'
			}, 
			{
				type: 'self_stat_percent',
				hp: 0.5,
				desc: '血量+50%'
			}, 
			{
				type: 'skill_effect',
				desc: '普攻命中时，30%几率眩晕目标1回合',
				trigger: 'pugongHit',
				filter: function (target) { return Math.random() < 0.3; },
				content: function (target) {
					Game.Battle.addBuff(target, { id: 'stun_target', name: '眩晕', type: 'stun', remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			}, 
			{
				type: 'skill_effect',
				desc: '技能时，100%几率提升自身减伤60%一回合',
				trigger: 'skillEnd',
				filter: function () { return true; },
				content: function (target) {
					Game.Battle.addBuff(this, { id: 'takeDn_self_60', name: '减伤', type: 'takeDn', value: 0.6, remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			}
		])
	},
	ybsl_107tushanshuili: {
		name: "涂山水璃", group: "YB_dream", sex: "female",
		skills: ["pugong_008", "skill_008", "spskill_008"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'self_stat_flat',
				baoji: 3000,
				desc: '暴击+3000'
			}, 
			{
				type: 'skill_effect',
				desc: '被攻击时，若血量低于对方，伤害减少30%',
				trigger: 'onDamageTaken',
				filter: function (attacker) { return this.hp < (attacker ? attacker.hp : 0); },
				content: function (attacker, dmg, mod) {
					mod.pct += 0.3;
				}
			}, 
			{
				type: 'skill_effect',
				desc: '自身血量每减少10%，造成伤害增加100%',
				trigger: 'onDamageCalc',
				filter: function () { return true; },
				content: function (target, dmg, mod) {
					const lost = 1 - (this.hp / this.maxHp);
					mod.pct += lost * 10; // 每少10%血 → +100%伤
				}
			}, 
			{
				type: 'self_stat_flat',
				poji: 1500,
				desc: '破击+1500'
			},
			{
				type: 'self_stat_flat',
				baoji: 2500,
				baoshang: 5000,
				desc: '暴击+2500，暴伤+5000'
			},
			{
				type: 'self_stat_flat',
				kangbao: 2000,
				desc: '抗暴+2000'
			}, 
			{
				type: 'skill_effect',
				desc: '受到技能伤害减少50%',
				trigger: 'onDamageTaken',
				filter: function () { return true; },
				content: function (attacker, dmg, mod) {
					if (mod.attackType === 'skill') mod.pct += 0.5;
				}
			}, 
			{
				type: 'skill_effect',
				desc: '普攻命中后，为自身回复45%伤害值的生命值',
				trigger: 'pugongHit',
				filter: function () { return true; },
				content: function (target) {
					const dealt = target._lastDamage || 0;
					Game.Battle.applyHeal(this, Math.floor(dealt * 0.45), function () {}, this);
				}
			}, 
			{
				type: 'skill_effect',
				desc: '技能伤害增加20%；技能免伤增加20%',
				trigger: ['onDamageCalc', 'onDamageTaken'],
				filter: function () { return true; },
				content: function (target, dmg, mod) {
					if (mod.attackType === 'skill') mod.pct += 0.2;
				}
			}
		])
	},
	ybsl_008wuyuxin: {
		name: "吴雨欣", group: "YB_dream", sex: "female",
		skills: ["pugong_009", "skill_009", "spskill_009"],
		template: "balanced", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				mingzhong: 1000,
				desc: '命中+1000'
			},
			{
				type: 'self_stat_flat',
				baoji: 3000,
				desc: '暴击+3000'
			}, 
			{
				type: 'skill_effect',
				desc: '自身血量高于50%时，造成伤害增加30%',
				trigger: 'onDamageCalc',
				filter: function (target) { return (this.hp / this.maxHp) > 0.5; },
				content: function (target, dmg, mod) {
					mod.pct += 0.3;
				}
			}, 
			{
				type: 'self_stat_flat',
				shanbi: 3000,
				desc: '闪避+3000'
			},
			{
				type: 'self_stat_flat',
				baoji: 750,
				baoshang: 1500,
				desc: '暴击+750，暴伤+1500'
			},
			{
				type: 'skill_effect',
				desc: '技能后，75%几率令自身增加2能量',
				trigger: 'skillEnd',
				filter: function () { return Math.random() < 0.75; },
				content: function (info) {
					this.energy = Math.min(8, (this.energy || 0) + 2);
					Game.Battle.log(`${this.name} 技能后，回复 2 能量`);
				}
			}, 
			{
				type: 'skill_effect',
				desc: '上场后限三次，自身受到伤害减少30%',
				trigger: 'onDamageTaken',
				filter: function (attacker, dmg) {
					if (!this._dmgReduceTimes) this._dmgReduceTimes = 0;
					if (this._dmgReduceTimes < 3) {
						this._dmgReduceTimes++;
						return true;
					}
					return false;
				},
				content: function (attacker, dmg, mod) {
					mod.pct += 0.3;
				}
			}, 
			{
				type: 'skill_effect',
				desc: '技能伤害提升50%',
				trigger: 'onDamageCalc',
				filter: function () { return true; },
				content: function (target, dmg, mod) {
					if (mod.attackType === 'skill') mod.pct += 0.5;
				}
			}, 
			{
				type: 'skill_effect',
				desc: '普攻命中时，75%几率令目标沉默1回合',
				trigger: 'pugongHit',
				filter: function (target) { return Math.random() < 0.75; },
				content: function (target) {
					Game.Battle.addBuff(target, { id: 'stun_target', name: '沉默', type: 'stun', remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
				}
			}, 
			{
				type: 'skill_effect',
				desc: '技能后，100%几率降低能量最高的一名敌人30%的攻击力两回合',
				trigger: 'skillEnd',
				filter: function () { return true; },
				content: function (info) {
					const enemySide = this.side === 'player' ? 'enemy' : 'player';
					const target = Game.Battle.getAliveUnits(enemySide)
						.sort((a, b) => (b.energy || 0) - (a.energy || 0))[0];
					if (target) {
						Game.Battle.addBuff(target, { id: 'atk_down_enemy_30', name: '攻击降低', type: 'atk', value: -0.3, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					}
				}
			}
		])
	},
	ybsl_002chenailin: {
		name: "陈爱琳", group: "YB_dream", sex: "female",
		skills: ["pugong_010", "skill_010", "spskill_010"],
		template: "balanced", rank: "legend", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{
				type: 'self_stat_flat',
				baoji: 1000,
				desc: '暴击+1000'
			},
			{
				type: 'self_stat_flat',
				shanbi: 1800,
				desc: '闪避+1800'
			},
			{
				type: 'self_stat_flat',
				shanbi: 1800,
				desc: '闪避+1800'
			},
			{
				type: 'self_stat_percent',
				pctHeal: 0.5,
				desc: '治疗效果+50%'
			},
			{
				type: 'self_stat_flat',
				baoji: 1500,
				desc: '暴击+1500'
			},
			{
				type: 'skill_effect',
				desc: '上场后限三次，自身受到伤害减少75%',
				trigger: 'onDamageTaken',
				filter: function (attacker, dmg) {
					if (!this._dmgReduceTimes) this._dmgReduceTimes = 0;
					if (this._dmgReduceTimes < 3) {
						this._dmgReduceTimes++;
						return true;
					}
					return false;
				},
				content: function (attacker, dmg, mod) {
					mod.pct += 0.75;
				}
			},
			{
				// 亡语：回复全体友方目标30%攻击力的生命值（暂未实现，跳过）
			},
			{
				type: 'skill_effect',
				desc: '受到技能伤害减少30%',
				trigger: 'onDamageTaken',
				filter: function () { return true; },
				content: function (attacker, dmg, mod) {
					if (mod.attackType === 'skill') mod.pct += 0.3;
				}
			}, 
			{
				type: 'skill_effect',
				desc: '普攻时，45%几率增加目标1能量',
				trigger: 'pugongHit',
				filter: function (target) { return Math.random() < 0.45; },
				content: function (target) {
					target.energy = Math.min(8, (target.energy || 0) + 1);
					Game.Battle.log(`${this.name} 为 ${target.name} 增加 1 点能量`);
				}
			}, 
			{
				type: 'skill_effect',
				desc: '技能时，75%几率增加自身2能量',
				trigger: 'skillEnd',
				filter: function () { return Math.random() < 0.75; },
				content: function (info) {
					this.energy = Math.min(8, (this.energy || 0) + 2);
					Game.Battle.log(`${this.name} 技能后，回复 2 能量`);
				}
			}
		])
	},

	// ===== 史诗级 (Epic) - YB_memory (编号: 101-110) =====
	ybsl_015wanghairu: {
		name: "王海茹", group: "YB_memory", sex: "female",
		skills: ["pugong_101", "skill_101"],
		template: "balanced", rank: "epic", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_016manchengqi: {
		name: "满城柒", group: "YB_memory", sex: "female",
		skills: ["pugong_102", "skill_102"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_018zhangqing: {
		name: "张晴", group: "YB_memory", sex: "female",
		skills: ["pugong_103", "skill_103"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_059starsFall3: {
		name: "周靈", group: "YB_memory", sex: "female",
		skills: ["pugong_104", "skill_104"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_059starsFall4: {
		name: "李曉", group: "YB_memory", sex: "female",
		skills: ["pugong_105", "skill_105"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_068qingyue: {
		name: "清月姑娘", group: "YB_memory", sex: "female",
		skills: ["pugong_106", "skill_106"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_070lvyanqiu: {
		name: "吕艳秋", group: "YB_memory", sex: "female",
		skills: ["pugong_107", "skill_107"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_033xiaohui: {
		name: "小慧", group: "YB_memory", sex: "female",
		skills: ["pugong_108", "skill_108"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_038bianqiuwen: {
		name: "卞秋雯", group: "YB_memory", sex: "female",
		skills: ["pugong_109", "skill_109"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	db_ybsl_067snake: {
		name: "蛇妃", group: "YB_memory", sex: "female",
		skills: ["pugong_110", "skill_110"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},

	// ===== 史诗级 (Epic) - YB_dream (编号: 111-120) =====
	ybsl_069xiangzi: {
		name: "香紫姑娘", group: "YB_dream", sex: "female",
		skills: ["pugong_111", "skill_111"],
		template: "balanced", rank: "epic", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_001sunlisong: {
		name: "孙丽松", group: "YB_dream", sex: "female",
		skills: ["pugong_112", "skill_112"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_006wanghanzhen: {
		name: "王汉桢", group: "YB_dream", sex: "female",
		skills: ["pugong_113", "skill_113"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_009liyushan: {
		name: "李玉珊", group: "YB_dream", sex: "female",
		skills: ["pugong_114", "skill_114"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_010zhouyue: {
		name: "周玥", group: "YB_dream", sex: "female",
		skills: ["pugong_115", "skill_115"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_013yinji: {
		name: "尹超跃", group: "YB_dream", sex: "female",
		skills: ["pugong_116", "skill_116"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_018huanqing: {
		name: "幻晴", group: "YB_dream", sex: "female",
		skills: ["pugong_117", "skill_117"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_036bright: {
		name: "熙", group: "YB_dream", sex: "female",
		skills: ["pugong_118", "skill_118"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_092handan: {
		name: "玉蝶心", group: "YB_dream", sex: "female",
		skills: ["pugong_119", "skill_119"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_083xiaozhu: {
		name: "小筑", group: "YB_dream", sex: "female",
		skills: ["pugong_120", "skill_120"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},

	// ===== 伪史诗 (Epicfake) - YB_memory (编号: 201-209) =====
	ybsl_025shiqingyu: {
		name: "史庆宇", group: "YB_memory", sex: "female",
		skills: ["pugong_201", "skill_201"],
		template: "balanced", rank: "epicfake", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_020jiayutong: {
		name: "贾雨桐", group: "YB_memory", sex: "female",
		skills: ["pugong_202", "skill_202"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_025wanghe: {
		name: "王贺", group: "YB_memory", sex: "female",
		skills: ["pugong_203", "skill_203"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_042pingzi: {
		name: "蘋姉", group: "YB_memory", sex: "female",
		skills: ["pugong_204", "skill_204"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_043fangjiayu: {
		name: "房佳谕", group: "YB_memory", sex: "female",
		skills: ["pugong_205", "skill_205"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_046jiangxuewu: {
		name: "江雪舞", group: "YB_memory", sex: "female",
		skills: ["pugong_206", "skill_206"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_059starsFall2: {
		name: "宋橤", group: "YB_memory", sex: "female",
		skills: ["pugong_207", "skill_207"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_060liutianhang: {
		name: "刘天杭", group: "YB_memory", sex: "female",
		skills: ["pugong_208", "skill_208"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_079xiaoxin: {
		name: "小新", group: "YB_memory", sex: "female",
		skills: ["pugong_209", "skill_209"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},

	// ===== 伪史诗 (Epicfake) - YB_dream (编号: 210-218) =====
	ybsl_003yanshuang: {
		name: "闫爽", group: "YB_dream", sex: "female",
		skills: ["pugong_210", "skill_210"],
		template: "balanced", rank: "epicfake", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_004zhangyujie: {
		name: "张玉洁", group: "YB_dream", sex: "female",
		skills: ["pugong_211", "skill_211"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_005wangruobing: {
		name: "王若冰", group: "YB_dream", sex: "female",
		skills: ["pugong_212", "skill_212"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_007wugege: {
		name: "吴格格", group: "YB_dream", sex: "female",
		skills: ["pugong_213", "skill_213"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_011gaoyuhang: {
		name: "高宇航", group: "YB_dream", sex: "female",
		skills: ["pugong_214", "skill_214"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_047zhangmi: {
		name: "张汨", group: "YB_dream", sex: "female",
		skills: ["pugong_215", "skill_215"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_026can: {
		name: "蚕", group: "YB_dream", sex: "female",
		skills: ["pugong_216", "skill_216"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_027rain: {
		name: "雨", group: "YB_dream", sex: "female",
		skills: ["pugong_217", "skill_217"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_029dawn: {
		name: "黎", group: "YB_dream", sex: "female",
		skills: ["pugong_218", "skill_218"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},

	// ===== 稀有 (Rare) - YB_memory (编号: 301-306) =====
	ybsl_019shengyan: {
		name: "盛妍", group: "YB_memory", sex: "female",
		skills: ["pugong_301", "skill_301"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_045gaocong: {
		name: "高聪", group: "YB_memory", sex: "female",
		skills: ["pugong_302", "skill_302"],
		template: "balanced", rank: "rare", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_024yuetong: {
		name: "岳瞳", group: "YB_memory", sex: "female",
		skills: ["pugong_303", "skill_303"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_053qiuer: {
		name: "秋儿", group: "YB_memory", sex: "female",
		skills: ["pugong_304", "skill_304"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_054yueer: {
		name: "悦儿", group: "YB_memory", sex: "female",
		skills: ["pugong_305", "skill_305"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_055zhengyan: {
		name: "郑琰", group: "YB_memory", sex: "female",
		skills: ["pugong_306", "skill_306"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},

	// ===== 稀有 (Rare) - YB_dream (编号: 307-312) =====
	ybsl_012zhengjiayi: {
		name: "郑佳怡", group: "YB_dream", sex: "female",
		skills: ["pugong_307", "skill_307"],
		template: "damger", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_037diamondqueen: {
		name: "方块公主", group: "YB_dream", sex: "female",
		skills: ["pugong_308", "skill_308"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_044huruihang: {
		name: "胡瑞航", group: "YB_dream", sex: "female",
		skills: ["pugong_309", "skill_309"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_121tujing: {
		name: "涂静", group: "YB_dream", sex: "female",
		skills: ["pugong_310", "skill_310"],
		template: "balanced", rank: "rare", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_122wangbingyu: {
		name: "王冰雨", group: "YB_dream", sex: "female",
		skills: ["pugong_311", "skill_311"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
	ybsl_123xuelang: {
		name: "雪琅", group: "YB_dream", sex: "female",
		skills: ["pugong_312", "skill_312"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			{},
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}, 
			{}
		])
	},
};
const characterTemplate = {
	damger: {
		kami: { hp: 896, atk: 200, def: 42, spe: 160 },
		legend: { hp: 896, atk: 200, def: 42, spe: 160 },
		epic: { hp: 840, atk: 187, def: 40, spe: 150 },
		epicfake: { hp: 672, atk: 150, def: 32, spe: 120 },
		rare: { hp: 560, atk: 125, def: 26, spe: 100 },
	},
	defense: {
		kami: { hp: 1400, atk: 128, def: 66, spe: 160 },
		legend: { hp: 1400, atk: 128, def: 66, spe: 160 },
		epic: { hp: 1312, atk: 120, def: 62, spe: 150 },
		epicfake: { hp: 1050, atk: 96, def: 50, spe: 120 },
		rare: { hp: 875, atk: 80, def: 41, spe: 100 },
		common: { hp: 420, atk: 60, def: 20, spe: 60 },
		junk: { hp: 210, atk: 30, def: 10, spe: 30 },
	},
	balanced: {
		kami: { hp: 1120, atk: 160, def: 53, spe: 160 },
		legend: { hp: 1120, atk: 160, def: 53, spe: 160 },
		epic: { hp: 1050, atk: 150, def: 50, spe: 150 },
		epicfake: { hp: 840, atk: 120, def: 40, spe: 120 },
		rare: { hp: 700, atk: 100, def: 33, spe: 100 },
		common: { hp: 336, atk: 75, def: 16, spe: 60 },
		junk: { hp: 168, atk: 37, def: 8, spe: 30 },
	},
};
window.characterList = characterList;
window.characterTemplate = characterTemplate;
export { characterList, characterTemplate, generateTupoList, generateTupoList_new };

