/**
 * 宝物定义列表
 * 
 * 每个宝物包含以下字段：
 *   id:		  宝物唯一标识
 *   name:		宝物名称
 *   emoji:	   宝物表情符号（用于无图标时的占位）
 *   desc:		宝物描述
 *   type:		触发时点，可选值：
 *				- 'on_kill':		击杀时触发
 *				- 'on_any_death':   有人阵亡时触发
 *				- 'on_turn_start':  回合开始时触发
 *				- 'on_hit':		 被攻击时触发
 *				- 'on_skill':	   使用技能后触发
 *				- 'on_damage_dealt':造成伤害后触发
 *				- 'on_attack':	  普攻时触发
 *				- 'passive':		被动（战斗开始时生效一次）
 *				- 'on_death':	   亡语，阵亡时触发
 *				- 'on_pugong':	  普攻特殊效果
 *   effectType:  效果类型标识（用于UI显示，如 'heal'/'damage'/'atk-up'/'def-up'/'default'）
 *   icon:		图标路径
 *   price:	   售价（金币）
 *   effect(ctx): 效果函数
 *				context 包含: { unit, targets, attacker, killer, deadUnit, energyCost, isRecover,
 *							   addLog, heal, damage, calcDamage, getAliveUnits, showDamageNumber,
 *							   triggerOnDeath, triggerOnEnemyDeath }
 */
const TREASURE_DEFS = {
	lianpo: {
		id: 'lianpo',
		name: '连破',
		emoji: '⚔️',
		desc: '击杀目标时，再进行一次行动。',
		type: 'on_kill',
		effectType: 'default',
		icon: './image/equip/lianpo.png',
		price: 300,
		effect(ctx) {
			if (ctx.killer && ctx.killer.alive) {
				// ctx.killer.extraTurn = true;
				ctx.killer.extraTurnCount++;
				ctx.addLog(`${ctx.killer.name} 的【连破】发动，可再进行一次行动！`);
			}
		},
	},
	shelie: {
		id: 'shelie',
		name: '涉猎',
		emoji: '📚',
		desc: '行动开始前，令本角色攻击力随机增加5~20点。',
		type: 'on_turn_start',
		effectType: 'atk-up',
		icon: './image/equip/shelie.png',
		price: 200,
		effect(ctx) {
			const atkBoost = Math.floor(Math.random() * 16) + 5;
			ctx.unit.atk += atkBoost;
			ctx.addLog(`${ctx.unit.name} 的【涉猎】发动，攻击力增加 ${atkBoost}！`);
		},
	},
	guipu: {
		id: 'guipu',
		name: '鬼仆',
		emoji: '👻',
		desc: '敌方有角色阵亡时，此角色恢复10%生命力。',
		type: 'on_any_death',
		effectType: 'heal',
		icon: './image/equip/guipu.png',
		price: 250,
		effect(ctx) {
			const healAmt = Math.floor(ctx.unit.maxHp * 0.1);
			const actualHeal = Math.min(healAmt, ctx.unit.maxHp - ctx.unit.hp);
			if (actualHeal > 0) {
				ctx.unit.hp += actualHeal;
				ctx.showDamageNumber(ctx.unit, actualHeal, true);
				ctx.addLog(`${ctx.unit.name} 的【鬼仆】发动，恢复了 ${actualHeal} 生命力`);
			}
		},
	},
	zhengnan: {
		id: 'zhengnan',
		name: '征南',
		emoji: '🏹',
		desc: '敌方有角色阵亡时，本角色增加15点攻击力。',
		type: 'on_any_death',
		effectType: 'atk-up',
		icon: './image/equip/zhengnan.png',
		price: 250,
		effect(ctx) {
			ctx.unit.atk += 15;
			ctx.addLog(`${ctx.unit.name} 的【征南】发动，攻击力增加15！`);
		},
	},
	ganglie: {
		id: 'ganglie',
		name: '刚烈',
		emoji: '💥',
		desc: '受到非特殊普攻的攻击伤害后，对伤害来源进行一次特殊普攻。',
		type: 'on_hit',
		effectType: 'damage',
		icon: './image/equip/ganglie.png',
		price: 350,
		effect(ctx) {
			const attacker = ctx.attacker;
			if (!attacker) return;
			const dmg = ctx.calcDamage(ctx.unit, attacker.def, 1.25);
			attacker.hp -= dmg;
			ctx.showDamageNumber(attacker, dmg, false);
			ctx.addLog(`${ctx.unit.name} 的【刚烈】发动，对 ${attacker.name} 造成 ${dmg} 点特殊普攻伤害！`);
			if (attacker.hp <= 0) {
				attacker.hp = 0;
				attacker.alive = false;
				ctx.addLog(`${attacker.name} 阵亡！`);
				ctx.unit.energy = Math.min(8, ctx.unit.energy + 1);
				// 触发亡语和击杀效果
				ctx.triggerOnDeath(attacker, ctx.unit);
				ctx.triggerOnEnemyDeath(attacker, ctx.unit);
			} else {
				attacker.energy = Math.min(8, attacker.energy + 1);
			}
		},
	},
	luoshen: {
		id: 'luoshen',
		name: '洛神',
		emoji: '💧',
		desc: '行动开始前，令本角色恢复1能量。',
		type: 'on_turn_start',
		effectType: 'default',
		icon: './image/equip/luoshen.png',
		price: 150,
		effect(ctx) {
			ctx.unit.energy = Math.min(8, ctx.unit.energy + 1);
			ctx.addLog(`${ctx.unit.name} 的【洛神】发动，恢复1点能量！`);
		},
	},
	xiaoji: {
		id: 'xiaoji',
		name: '枭姬',
		emoji: '🦅',
		desc: '发动技能攻击后，攻击力提升4×消耗能量点。',
		type: 'on_skill',
		effectType: 'atk-up',
		icon: './image/equip/xiaoji.png',
		price: 280,
		effect(ctx) {
			if (ctx.isRecover) return;
			const atkBoost = 4 * ctx.energyCost;
			ctx.unit.atk += atkBoost;
			ctx.addLog(`${ctx.unit.name} 的【枭姬】发动，攻击力提升 ${atkBoost}！`);
		},
	},
	tieji: {
		id: 'tieji',
		name: '铁骑',
		emoji: '🔒',
		desc: '发动技能攻击后，对命中的敌方30%几率施加封印一轮。',
		type: 'on_skill',
		effectType: 'default',
		icon: './image/equip/tieji.png',
		price: 320,
		effect(ctx) {
			if (ctx.isRecover) return;
			(ctx.targets || []).forEach(t => {
				if (!t.alive) return;
				if (Math.random() < 0.3) {
					t.sealed = true;
					t.sealTurns = 1;
					t.sealOwner = ctx.unit.side;
					ctx.addLog(`${t.name} 被【铁骑】封印一轮！`);
				}
			});
		},
	},
	huoshou: {
		id: 'huoshou',
		name: '祸首',
		emoji: '🔥',
		desc: '装备角色增加30点攻击（仅战斗开始时生效一次）。',
		type: 'passive',
		effectType: 'atk-up',
		icon: './image/equip/huoshou.png',
		price: 180,
		effect(ctx) {
			ctx.unit.atk += 30;
			ctx.addLog(`${ctx.unit.name} 的【祸首】发动，攻击力增加30！`);
		},
	},
	qice: {
		id: 'qice',
		name: '奇策',
		emoji: '📜',
		desc: '发动技能后，回复两点能量。',
		type: 'on_skill',
		effectType: 'default',
		icon: './image/equip/qice.png',
		price: 200,
		effect(ctx) {
			ctx.unit.energy = Math.min(8, ctx.unit.energy + 2);
			ctx.addLog(`${ctx.unit.name} 的【奇策】发动，恢复2点能量！`);
		},
	},
	kuanggu: {
		id: 'kuanggu',
		name: '狂骨',
		emoji: '🦴',
		desc: '造成伤害后，令自己恢复自身15%攻击力的血量。',
		type: 'on_damage_dealt',
		effectType: 'heal',
		icon: './image/equip/kuanggu.png',
		price: 280,
		effect(ctx) {
			const healAmt = Math.floor(ctx.unit.atk * 0.15);
			const actualHeal = Math.min(healAmt, ctx.unit.maxHp - ctx.unit.hp);
			if (actualHeal > 0) {
				ctx.unit.hp += actualHeal;
				ctx.showDamageNumber(ctx.unit, actualHeal, true);
				ctx.addLog(`${ctx.unit.name} 的【狂骨】恢复了 ${actualHeal} 生命力`);
			}
		},
	},
	wusheng: {
		id: 'wusheng',
		name: '武圣',
		emoji: '⚡',
		desc: '造成的最终伤害增加10%。',
		type: 'passive',
		effectType: 'default',
		icon: './image/equip/wusheng.png',
		price: 350,
		// 武圣的效果在伤害计算时直接调用，见 applyTreasureDamageModifier
	},
	jueqing: {
		id: 'jueqing',
		name: '绝情',
		emoji: '💔',
		desc: '普攻改为真实伤害。',
		type: 'on_pugong',
		effectType: 'default',
		icon: './image/equip/jueqing.png',
		price: 400,
		// 绝情的效果在普攻执行时直接判断，见 executePugong
	},
	duanchang: {
		id: 'duanchang',
		name: '断肠',
		emoji: '🕸️',
		desc: '亡语，阵亡时发动，永久封印击杀者。',
		type: 'on_death',
		effectType: 'damage',
		icon: './image/equip/duanchang.png',
		price: 300,
		effect(ctx) {
			if (ctx.killer) {
				ctx.killer.permanentlySealed = true;
				ctx.killer.sealed = true;
				ctx.addLog(`${ctx.unit.name} 的【断肠】发动，永久封印了 ${ctx.killer.name}！`);
			}
		},
	},
	zhuiyi: {
		id: 'zhuiyi',
		name: '追忆',
		emoji: '💫',
		desc: '亡语，阵亡时发动，恢复全体友方生命力，恢复值为自身攻击力×1.5。',
		type: 'on_death',
		effectType: 'heal',
		icon: './image/equip/zhuiyi.png',
		price: 350,
		effect(ctx) {
			const healAmount = Math.floor(ctx.unit.atk * 1.5);
			const friendlies = ctx.getAliveUnits(ctx.unit.side);
			friendlies.forEach(f => {
				const actualHeal = Math.min(healAmount, f.maxHp - f.hp);
				if (actualHeal > 0) {
					f.hp += actualHeal;
					ctx.showDamageNumber(f, actualHeal, true);
					ctx.addLog(`${f.name} 被【追忆】恢复了 ${actualHeal} 生命力`);
				}
			});
		},
	},
};
