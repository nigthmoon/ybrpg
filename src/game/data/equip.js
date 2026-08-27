const TREASURE_DEFS= {
	wusheng: {
		id: 'wusheng',
		name: '武圣',
		desc: function(star){
			return `攻击加${star*200}，暴击加1000。`;
		},
		atk: 200,
		baoji: 1000,
		icon: '/image/skill/wusheng.png',
		price: { gold: 2000, diamond: 2 },// 300 金币
	},
	ganglie: {
		id: 'ganglie',
		name: '刚烈',
		desc: function(star){
			return `防御加${star*100}，格挡加1000。`;
		},
		def: 100,
		gedang: 1000,
		icon: '/image/skill/ganglie.png',
		price: { gold: 2000, diamond: 2 },
	},
	guipu: {
		id: 'guipu',
		name: '鬼仆',
		icon: '/image/skill/guipu.png',
		price: { gold: 2000, diamond: 2 },
		kangbao: 1000,
		desc:function(star){
			return `生命加${star*2000}，抗暴加1000。`;
		},
		hp: 2000,
	},
	paoxiao:{
		id: 'paoxiao',
		name: '咆哮',
		atk:200,
		mingzhong: 1000,
		desc: function(star){
			return `攻击加${star*200}，命中加1000。`;
		},
		icon: '/image/skill/paoxiao.png',
		price: { gold: 2000, diamond: 2 },
	},
	shelie: {
		id: 'shelie',
		name: '涉猎',
		hp:2000,
		shanbi: 800,
		desc: function(star){
			return `生命加${star*2000}，闪避加800。`;
		},
		icon: '/image/skill/shelie.png',
		price: { gold: 2000, diamond: 2 },
	},
	zhengnan: {
		id: 'zhengnan',
		name: '征南',
		def:100,
		poji: 1000,
		desc: function(star){
			return `防御加${star*100}，破击加1000。`;
		},
		icon: '/image/skill/zhengnan.png',
		price: { gold: 2000, diamond: 2 },
	},
	qingguo:{
		id: 'qingguo',
		name: '倾国',
		def:200,
		shanbi:3200,
		desc: function(star){
			return `防御加${star*200}，闪避加3200。`;
		},
		icon: '/image/skill/qingguo.png',
		price: { gold: 8000, diamond: 8 },
	},
	wansha:{
		id: 'wansha',
		name: '完杀',
		atk:400,
		effectSkills:['seal_target_100_skill'],
		desc: function(star){
			return `攻击加${star*400}，使用技能后，100%几率封印目标一回合。`;
		},
		icon: '/image/skill/wanbao.png',
		price: { gold: 8000, diamond: 8 },
	},


	//以上均为测试版
	//为避免bug，测试版宝物不得删除
	//以下为正式版
	//这些是原游戏未使用素材
	bw_10041:{
		id: 'bw_10041',
		name: '宝物10041',
		icon: '/image/equip/bws_10041.png',
		iconbig: '/image/equip-big/bw_10041.png',
		desc: function(star){
			return `请输入文本。`;
		},
	},
	bw_10042:{
		id: 'bw_10042',
		name: '宝物10042',
		icon: '/image/equip/bws_10042.png',
		iconbig: '/image/equip-big/bw_10042.png',
		desc: function(star){
			return `请输入文本。`;
		},
	},
	bw_11625:{
		id: 'bw_11625',
		name: '宝物11625',
		icon: '/image/equip/bws_11625.png',
		iconbig: '/image/equip-big/bw_11625.png',
		desc: function(star){
			return `请输入文本。`;
		},
	},
	bw_11626:{
		id: 'bw_11626',
		name: '宝物11626',
		icon: '/image/equip/bws_11626.png',
		iconbig: '/image/equip-big/bw_11626.png',
		desc: function(star){
			return `请输入文本。`;
		},
	},
	bw_21625:{
		id: 'bw_21625',
		name: '宝物21625',
		icon: '/image/equip/bws_21625.png',
		iconbig: '/image/equip-big/bw_21625.png',
		desc: function(star){
			return `请输入文本。`;
		},
	},
	bw_21626:{
		id: 'bw_21626',
		name: '宝物21626',
		icon: '/image/equip/bws_21626.png',
		iconbig: '/image/equip-big/bw_21626.png',
		desc: function(star){
			return `请输入文本。`;
		},
	},

	//品质1
	bw_10501:{
		id: 'bw_10501',
		name: '狂火拳',
		icon: '/image/equip/bws_10501.png',
		iconbig: '/image/equip-big/bw_10501.png',
		rank:1,
		sellPrice: 20,
		price: { gold: 200 },
		atk:20,
		// 特效：造成伤害时，若血量高于对方，则伤害增加20%（内联完整效果，不引用库）
		effects: [{
			trigger: 'onDamageCalc',
			filter: function () { return true; },
			content: function (defender, damage, mod) {
				if (this.hp > defender.hp) mod.pct += 0.2;
			}
		}],
		// 【预留接口】吸收宝物方案：未来可开启跨 id 吸收，expYield 为作为材料时的经验产出
		absorb: { enabled: false, crossBase: false, expYield: 1 },
		desc: function(star){
			return `攻击加${star*20}，造成伤害时，若血量高于对方，则伤害增加20%。`;
		},
		maxLevel: 10,
	},
	bw_10502:{
		id: 'bw_10502',
		name: '金钟罩',
		icon: '/image/equip/bws_10502.png',
		iconbig: '/image/equip-big/bw_10502.png',
		rank:1,
		sellPrice: 20,
		price: { gold: 200 },
		hp:120,
		// 特效：受到伤害时，若血量高于对方，则伤害减少20%（内联完整效果，不引用库）
		effects: [{
			trigger: 'onDamageTaken',
			filter: function () { return true; },
			content: function (attacker, damage, mod) {
				if (this.hp > attacker.hp) mod.pct += 0.2;
			}
		}],
		// 【预留接口】吸收宝物方案
		absorb: { enabled: false, crossBase: false, expYield: 1 },
		desc: function(star){
			return `血量加${star*120}，受到伤害时，若血量高于对方，则伤害减少20%。`;
		},
		maxLevel: 10,
	},
	bw_20501:{
		id: 'bw_20501',
		name: '威武将军',
		icon: '/image/equip/bws_20501.png',
		iconbig: '/image/equip-big/bw_20501.png',
		rank:1,
		sellPrice: 20,
		price: { gold: 200 },
		atk:20,
		// 特效：造成伤害时，若血量低于对方，则伤害增加20%（内联完整效果，不引用库）
		effects: [{
			trigger: 'onDamageCalc',
			filter: function () { return true; },
			content: function (defender, damage, mod) {
				if (this.hp < defender.hp) mod.pct += 0.2;
			}
		}],
		// 【预留接口】吸收宝物方案
		absorb: { enabled: false, crossBase: false, expYield: 1 },
		desc: function(star){
			return `攻击加${star*20}，造成伤害时，若血量低于对方，则伤害增加20%。`;
		},
		maxLevel: 10,
	},
	bw_20502:{
		id: 'bw_20502',
		name: '天雷猪',
		icon: '/image/equip/bws_20502.png',
		iconbig: '/image/equip-big/bw_20502.png',
		rank:1,
		sellPrice: 20,
		price: { gold: 200 },
		hp:120,
		// 特效：受到伤害时，若血量低于对方，则伤害减少20%（内联完整效果，不引用库）
		effects: [{
			trigger: 'onDamageTaken',
			filter: function () { return true; },
			content: function (attacker, damage, mod) {
				if (this.hp < attacker.hp) mod.pct += 0.2;
			}
		}],
		// 【预留接口】吸收宝物方案
		absorb: { enabled: false, crossBase: false, expYield: 1 },
		desc: function(star){
			return `血量加${star*120}，受到伤害时，若血量低于对方，则伤害减少20%。`;
		},
		maxLevel: 10,
	},

	//品质2
	bw_10606:{
		id: 'bw_10606',
		name: '唐门毒经',
		icon: '/image/equip/bws_10606.png',
		iconbig: '/image/equip-big/bw_10606.png',
		rank:2,
		sellPrice: 100,
		price: { gold: 800 },
		hp:240,
		// 普攻命中时，50%几率令目标中毒2回合（每回合失去 施加者攻击力*33% 生命）
		effects: [{
			trigger: 'pugongHit',
			filter: function () { return Game.Battle.rollChance(this, 0.5); },
			content: function (target) {
				if (target && target.alive) {
					Game.Battle.addBuff(target, {
						id: 'poison', name: '中毒', type: 'poison', remainRounds: 2,
						sourceSide: this.side, sourceId: this.instanceId,
						value: Math.floor((this.atk || 0) * 0.33),
					});
				}
			}
		}],
		desc: function(star){
			return `血量加${star*240}，普攻，50%几率令目标中毒2回合，毒素伤害为施加者攻击力的33%。`;
		},
		maxLevel: 10,
	},
	bw_10607:{
		id: 'bw_10607',
		name: '五行八卦掌',
		icon: '/image/equip/bws_10607.png',
		iconbig: '/image/equip-big/bw_10607.png',
		rank:2,
		sellPrice: 100,
		price: { gold: 800 },
		hp:240,
		// 普攻命中时，20%几率眩晕目标1回合
		effects: [{
			trigger: 'pugongHit',
			filter: function () { return Game.Battle.rollChance(this, 0.2); },
			content: function (target) {
				if (target && target.alive) {
					Game.Battle.addBuff(target, {
						id: 'stun_bw', name: '眩晕', type: 'stun', remainRounds: 1,
						sourceSide: this.side, sourceId: this.instanceId,
					});
				}
			}
		}],
		desc: function(star){
			return `血量加${star*240}，普攻命中时，20%几率眩晕目标1回合。`;
		},
		maxLevel: 10,
	},
	bw_10608:{
		id: 'bw_10608',
		name: '狂雕霹雳爪',
		icon: '/image/equip/bws_10608.png',
		iconbig: '/image/equip-big/bw_10608.png',
		rank:2,
		sellPrice: 100,
		price: { gold: 800 },
		hp:240,
		// 普攻命中时，80%几率减少目标45%防御1回合（def 类 buff，value 为带符号分数）
		effects: [{
			trigger: 'pugongHit',
			filter: function () { return Game.Battle.rollChance(this, 0.8); },
			content: function (target) {
				if (target && target.alive) {
					Game.Battle.addBuff(target, {
						id: 'def_down_bw', name: '破甲', type: 'def', remainRounds: 1,
						sourceSide: this.side, sourceId: this.instanceId,
						value: -0.45,
					});
				}
			}
		}],
		desc: function(star){
			return `血量加${star*240}，普攻后，80%几率减少目标45%防御1回合。`;
		},
		maxLevel: 10,
	},
	bw_20605:{
		id: 'bw_20605',
		name: '地蛇',
		icon: '/image/equip/bws_20605.png',
		iconbig: '/image/equip-big/bw_20605.png',
		rank:2,
		sellPrice: 100,
		price: { gold: 800 },
		atk:40,
		// 技能命中时，20%几率封印目标1回合
		effects: [{
			trigger: 'skillHit',
			filter: function () { return Game.Battle.rollChance(this, 0.2); },
			content: function (target) {
				if (target && target.alive) {
					Game.Battle.addBuff(target, {
						id: 'seal_bw', name: '封印', type: 'seal', remainRounds: 1,
						sourceSide: this.side, sourceId: this.instanceId,
					});
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*40}，技能命中时，20%几率封印目标1回合`;
		},
		maxLevel: 10,
	},
	bw_20606:{
		id: 'bw_20606',
		name: '灵蛛',
		icon: '/image/equip/bws_20606.png',
		iconbig: '/image/equip-big/bw_20606.png',
		rank:2,
		sellPrice: 100,
		price: { gold: 800 },
		atk:40,
		// 技能命中时，20%几率减少目标1能量
		effects: [{
			trigger: 'skillHit',
			filter: function () { return Game.Battle.rollChance(this, 0.2); },
			content: function (target) {
				if (target && target.alive && target.energy !== undefined) {
					target.energy = Math.max(0, target.energy - 1);
					Game.Battle.log(`${target.name} 损失1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*40}，技能命中时，20%几率减少目标1能量`;
		},
		maxLevel: 10,
	},
	bw_20607:{
		id: 'bw_20607',
		name: '百醉蜈蚣',
		icon: '/image/equip/bws_20607.png',
		iconbig: '/image/equip-big/bw_20607.png',
		rank:2,
		sellPrice: 100,
		price: { gold: 800 },
		atk:40,
		// 技能命中时，50%几率令目标中毒2回合（每回合失去 施加者攻击力*33% 生命）
		effects: [{
			trigger: 'skillHit',
			filter: function () { return Game.Battle.rollChance(this, 0.5); },
			content: function (target) {
				if (target && target.alive) {
					Game.Battle.addBuff(target, {
						id: 'poison', name: '中毒', type: 'poison', remainRounds: 2,
						sourceSide: this.side, sourceId: this.instanceId,
						value: Math.floor((this.atk || 0) * 0.33),
					});
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*40}，技能命中时，50%几率令目标中毒2回合，毒素伤害为施加者攻击力的33%。`;
		},
		maxLevel: 10,
	},

	//品质3
	bw_10803:{
		id: 'bw_10803',
		name: '经验银书',
		icon: '/image/equip/bws_10803.png',
		iconbig: '/image/equip-big/bw_10803.png',
		rank:3,
		sellPrice: 5000,
		price: { gold: 5000, diamond: 5 },
		desc: function(star){
			return `出售可获得 5000 金币。`;
		},
		maxLevel: 10,
	},
	bw_11012:{
		id: 'bw_11012',
		name: '真空波动拳',
		icon: '/image/equip/bws_11012.png',
		iconbig: '/image/equip-big/bw_11012.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		hp:600,
		gedang:200,
		// 格挡反击：格挡成功时，对来源发起一次特殊普攻（50%攻击系数），isSpecial 防止反击再触发格挡反击
		effects: [{
			trigger: 'onBlock',
			filter: function () { return true; },
			content: function (attacker) {
				if (attacker && attacker.alive) {
					var B = Game.Battle;
					B.log(`${this.name} 触发格挡反击！`);
					var dmg = B.calculateDamage(this, attacker, 0.5, 0, 'pugong');
					B.applyDamage(attacker, dmg, this, function () {}, { trigger: 'counterHit', isSpecial: true });
				}
			}
		}],
		desc: function(star){
			return `血量加${star*600}，格挡+200，格挡反击，造成50%伤害。`;
		},
		maxLevel: 10,
	},
	bw_11013:{
		id: 'bw_11013',
		name: '逆天神功',
		icon: '/image/equip/bws_11013.png',
		iconbig: '/image/equip-big/bw_11013.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		hp:600,
		shanbi:200,
		desc: function(star){
			return `血量加${star*600}，闪避+200。`;
		},
		maxLevel: 10,
	},
	bw_11014:{
		id: 'bw_11014',
		name: '南冥神功',
		icon: '/image/equip/bws_11014.png',
		iconbig: '/image/equip-big/bw_11014.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		hp:600,
		kangbao:200,
		desc: function(star){
			return `血量加${star*600}，抗暴+200。`;
		},
		maxLevel: 10,
	},
	bw_11109:{
		id: 'bw_11109',
		name: '荆棘神功',
		icon: '/image/equip/bws_11109.png',
		iconbig: '/image/equip-big/bw_11109.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		hp:600,
		gedang:200,
		desc: function(star){
			return `血量加${star*600}，格挡+200。`;
		},
		maxLevel: 10,
	},
	bw_11110:{
		id: 'bw_11110',
		name: '吸蜂神功',
		icon: '/image/equip/bws_11110.png',
		iconbig: '/image/equip-big/bw_11110.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		hp:600,
		kangbao:200,
		// 受到伤害时，20%几率减少来源1能量
		effects: [{
			trigger: 'onHitSelf',
			filter: function () { return Game.Battle.rollChance(this, 0.2); },
			content: function (attacker, damage) {
				if (attacker && attacker.alive && attacker.energy !== undefined) {
					attacker.energy = Math.max(0, attacker.energy - 1);
					Game.Battle.log(`${attacker.name} 被减少1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*600}，抗暴+200，受到攻击时，20%几率减少来源1能量。`;
		},
		maxLevel: 10,
	},
	bw_11111:{
		id: 'bw_11111',
		name: '天降春雨',
		icon: '/image/equip/bws_11111.png',
		iconbig: '/image/equip-big/bw_11111.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		hp:600,
		shanbi:200,
		// 治疗效果+20%：战斗开始（首轮）时给自身叠加 pctHeal（applyHeal 读取施术者 pctHeal 生效）
		effects: [{
			trigger: 'roundStart',
			filter: function (round) { return round === 1 && !this._bwHealBoostDone; },
			content: function () {
				this._bwHealBoostDone = true;
				this.pctHeal = (this.pctHeal || 0) + 0.2;
			}
		}],
		desc: function(star){
			return `血量加${star*600}，闪避+200，治疗效果+20%。`;
		},
		maxLevel: 10,
	},
	bw_20803:{
		id: 'bw_20803',
		name: '经验银兽',
		icon: '/image/equip/bws_20803.png',
		iconbig: '/image/equip-big/bw_20803.png',
		rank:3,
		sellPrice: 5000,
		price: { gold: 5000, diamond: 5 },
		desc: function(star){
			return `出售可获得 5000 金币。`;
		},
		maxLevel: 10,
	},
	bw_21012:{
		id: 'bw_21012',
		name: '天灵鸟',
		icon: '/image/equip/bws_21012.png',
		iconbig: '/image/equip-big/bw_21012.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		atk:100,
		baoji:200,
		// 装备者发动「治疗系普攻」且命中队友时，20%几率令该队友增加1能量（正向收益，仅治疗普攻触发 healPugongHit）
		effects: [{
			trigger: 'healPugongHit',
			filter: function(){ return Game.Battle.rollChance(this, 0.2); },
			content: function(target){
				if (target && target.alive && target.energy !== undefined){
					target.energy = Math.min(8, target.energy + 1);
					Game.Battle.log(`${target.name} 获得1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*100}，暴击+200，发动治疗系普攻命中队友时，20%几率令该队友增加1能量。`;
		},
		maxLevel: 10,
	},
	bw_21013:{
		id: 'bw_21013',
		name: '鬼虎',
		icon: '/image/equip/bws_21013.png',
		iconbig: '/image/equip-big/bw_21013.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		atk:100,
		baoji:200,
		desc: function(star){
			return `攻击加${star*100}，暴击+200。`;
		},
		maxLevel: 10,
	},
	bw_21014:{
		id: 'bw_21014',
		name: '黑背棍猿',
		icon: '/image/equip/bws_21014.png',
		iconbig: '/image/equip-big/bw_21014.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		atk:100,
		mingzhong:200,
		desc: function(star){
			return `攻击加${star*100}，命中+200。`;
		},
		maxLevel: 10,
	},
	bw_21109:{
		id: 'bw_21109',
		name: '五煞之龙',
		icon: '/image/equip/bws_21109.png',
		iconbig: '/image/equip-big/bw_21109.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		atk:100,
		poji:200,
		desc: function(star){
			return `攻击加${star*100}，破击+200。`;
		},
		maxLevel: 10,
	},
	bw_21110:{
		id: 'bw_21110',
		name: '风雷紫电兽',
		icon: '/image/equip/bws_21110.png',
		iconbig: '/image/equip-big/bw_21110.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		atk:100,
		poji:200,
		// 普攻命中时，对左右相邻目标造成50%溅射伤害（复用【吴爽】溅射写法 Battle.splashToAdjacent）
		effects: [{
			trigger: 'pugongHit',
			filter: function(){ return true; },
			content: function(target){
				Game.Battle.splashToAdjacent(this, target, 0.5, 'pugong');
			}
		}],
		desc: function(star){
			return `攻击加${star*100}，破击+200，普攻命中时，对左右目标造成50%伤害。`;
		},
		maxLevel: 10,
	},
	bw_21111:{
		id: 'bw_21111',
		name: '九尾穿云豹',
		icon: '/image/equip/bws_21111.png',
		iconbig: '/image/equip-big/bw_21111.png',
		rank:3,
		sellPrice: 300,
		price: { gold: 5000, diamond: 5 },
		atk:100,
		mingzhong:200,
		// 普攻命中时，20%几率减少目标1能量
		effects: [{
			trigger: 'pugongHit',
			filter: function(){ return Game.Battle.rollChance(this, 0.2); },
			content: function(target){
				if (target && target.alive && target.energy !== undefined) {
					target.energy = Math.max(0, target.energy - 1);
					Game.Battle.log(`${target.name} 被减少1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*100}，命中+200，普攻命中时，20%几率减少目标1能量。`;
		},
		maxLevel: 10,
	},

	//品质4
	bw_11304:{
		id: 'bw_11304',
		name: '经验金书',
		icon: '/image/equip/bws_11304.png',
		iconbig: '/image/equip-big/bw_11304.png',
		rank:4,
		sellPrice: 20000,
		price: { gold: 40000, diamond: 40 },
		desc: function(star){
			return `出售可获得 20000 金币。`;
		},
		maxLevel: 10,
	},
	bw_11615:{
		id: 'bw_11615',
		name: '女娲补天诀',
		icon: '/image/equip/bws_11615.png',
		iconbig: '/image/equip-big/bw_11615.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		kangbao:400,
		// 受到暴击时，降低来源1能量（onHitSelf 触发时攻击方 _lastHitIsCrit 已记录本次是否暴击）
		effects: [{
			trigger: 'onHitSelf',
			filter: function(attacker){ return !!(attacker && attacker._lastHitIsCrit); },
			content: function(attacker){
				if (attacker && attacker.alive && attacker.energy !== undefined) {
					attacker.energy = Math.max(0, attacker.energy - 1);
					Game.Battle.log(`${attacker.name} 被减少1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，受到暴击时，降低来源1能量。`;
		},
		maxLevel: 10,
	},
	bw_11616:{
		id: 'bw_11616',
		name: '山海之印',
		icon: '/image/equip/bws_11616.png',
		iconbig: '/image/equip-big/bw_11616.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		shanbi:400,
		// 触发闪避时，对来源造成本次伤害等额真实伤害。
		// 注意：闪避发生在 calculateDamage 命中判定处，彼时"本次伤害"尚未计算；
		// 这里用 (来源攻击力 - 自身防御) 估算一次普攻等效伤害作为真实伤害（近似实现，避免递归调用 calculateDamage）。
		effects: [{
			trigger: 'onDodge',
			filter: function(){ return true; },
			content: function(attacker){
				if (attacker && attacker.alive) {
					var B = Game.Battle;
					var dmg = Math.max(1, (attacker.atk || 0) - (this.def || 0));
					attacker.hp -= dmg;
					B.showDamageNumber(attacker, dmg, { isTrue: true });
					B.log(`${attacker.name} 受到 ${dmg} 点真实伤害（闪避反伤）`);
					if (attacker.hp <= 0) { attacker.hp = 0; attacker.alive = false; B.log(`${attacker.name} 阵亡！`); }
					B.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，闪避+400，触发闪避时，对来源造成本次伤害等额真实伤害。`;
		},
		maxLevel: 10,
	},
	bw_11617:{
		id: 'bw_11617',
		name: '先蚕驱凤诀',
		icon: '/image/equip/bws_11617.png',
		iconbig: '/image/equip-big/bw_11617.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		gedang:400,
		// 格挡反击：格挡成功时，对来源发起一次特殊普攻（75%攻击系数）
		effects: [{
			trigger: 'onBlock',
			filter: function(){ return true; },
			content: function(attacker){
				if (attacker && attacker.alive) {
					var B = Game.Battle;
					B.log(`${this.name} 触发格挡反击！`);
					var dmg = B.calculateDamage(this, attacker, 0.75, 0, 'pugong');
					B.applyDamage(attacker, dmg, this, function(){}, { trigger: 'counterHit', isSpecial: true });
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，格挡+400，格挡反击，造成75%伤害。`;
			//由于可能由于角色突破或其他效果已获得格挡反击，如果已有格挡反击词条，则改为令格挡反击的伤害加上这个系数
		},
		maxLevel: 10,
	},
	bw_11618:{
		id: 'bw_11618',
		name: '狂雷葬世',
		icon: '/image/equip/bws_11618.png',
		iconbig: '/image/equip-big/bw_11618.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		kangbao:400,
		shouhu:2000,
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，守护+2000。`;
		},
		maxLevel: 10,
	},
	bw_11619:{
		id: 'bw_11619',
		name: '狂火千爆',
		icon: '/image/equip/bws_11619.png',
		iconbig: '/image/equip-big/bw_11619.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		shanbi:400,
		// 受到非真实伤害时，反伤20%（onHitSelf 仅在非真实伤害路径触发，自动满足"非真实"条件）
		effects: [{
			trigger: 'onHitSelf',
			filter: function(){ return true; },
			content: function(attacker, damage){
				if (attacker && attacker.alive) {
					var B = Game.Battle;
					var rdmg = Math.floor((damage || 0) * 0.2);
					if (rdmg > 0) {
						attacker.hp -= rdmg;
						B.showDamageNumber(attacker, rdmg, { isTrue: true });
						B.log(`${attacker.name} 受到 ${rdmg} 点真实伤害（反伤）`);
						if (attacker.hp <= 0) { attacker.hp = 0; attacker.alive = false; B.log(`${attacker.name} 阵亡！`); }
						B.updateUI();
					}
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，闪避+400，受到非真实伤害时，反伤20%。`;
		},
		maxLevel: 10,
	},
	bw_11620:{
		id: 'bw_11620',
		name: '造化战诀',
		icon: '/image/equip/bws_11620.png',
		iconbig: '/image/equip-big/bw_11620.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		gedang:400,
		// 触发格挡时，回复1能量
		effects: [{
			trigger: 'onBlock',
			filter: function(){ return true; },
			content: function(){
				if (this.energy !== undefined) {
					this.energy = Math.min(8, this.energy + 1);
					Game.Battle.log(`${this.name} 获得1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，格挡+400，触发格挡时，回复1能量。`;
		},
		maxLevel: 10,
	},
	bw_11621:{
		id: 'bw_11621',
		name: '轩辕御龙诀',
		icon: '/image/equip/bws_11621.png',
		iconbig: '/image/equip-big/bw_11621.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		kangbao:400,
		// 受到暴击时，回复1能量
		effects: [{
			trigger: 'onHitSelf',
			filter: function(attacker){ return !!(attacker && attacker._lastHitIsCrit); },
			content: function(){
				if (this.energy !== undefined) {
					this.energy = Math.min(8, this.energy + 1);
					Game.Battle.log(`${this.name} 获得1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，受到暴击时，回复1能量。`;
		},
		maxLevel: 10,
	},
	bw_11622:{
		id: 'bw_11622',
		name: '灵枢通天诀',
		icon: '/image/equip/bws_11622.png',
		iconbig: '/image/equip-big/bw_11622.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		kangbao:400,
		// 概率修正：敌方发动特效判定概率时，其成功率 -20%（通过引擎 rollChance 的 probMod.enemy 生效）
		effects: [{
			trigger: '__probMod__',
			probMod: { enemy: 0.2 },
			filter: function(){ return false; },
			content: function(){}
		}],
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，敌方发动特效判定概率时，令本次成功率降低20%。`;
		},
		maxLevel: 10,
	},
	bw_11623:{
		id: 'bw_11623',
		name: '天道战意诀',
		icon: '/image/equip/bws_11623.png',
		iconbig: '/image/equip-big/bw_11623.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		gedang:400,
		// 被攻击时，40%几率令来源减少1能量
		effects: [{
			trigger: 'onHitSelf',
			filter: function(){ return Game.Battle.rollChance(this, 0.4); },
			content: function(attacker){
				if (attacker && attacker.alive && attacker.energy !== undefined) {
					attacker.energy = Math.max(0, attacker.energy - 1);
					Game.Battle.log(`${attacker.name} 被减少1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，格挡+400，被攻击时，40%几率令来源减少1能量。`;
		},
		maxLevel: 10,
	},
	bw_11624:{
		id: 'bw_11624',
		name: '凤舞天音诀',
		icon: '/image/equip/bws_11624.png',
		iconbig: '/image/equip-big/bw_11624.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		hp:1200,
		shanbi:400,
		// 触发闪避时，20%几率恢复全队1能量
		effects: [{
			trigger: 'onDodge',
			filter: function(){ return Game.Battle.rollChance(this, 0.2); },
			content: function(){
				var B = Game.Battle;
				B.getAliveUnits(this.side).forEach(function(u){
					if (u && u.energy !== undefined) u.energy = Math.min(8, u.energy + 1);
				});
				B.log(`${this.name} 全队恢复1点能量`);
				B.updateUI();
			}
		}],
		desc: function(star){
			return `血量加${star*1200}，闪避+400，触发闪避时，20%几率恢复全队1能量。`;
		},
		maxLevel: 10,
	},
	bw_21304:{
		id: 'bw_21304',
		name: '经验金兽',
		icon: '/image/equip/bws_21304.png',
		iconbig: '/image/equip-big/bw_21304.png',
		rank:4,
		sellPrice: 20000,
		price: { gold: 40000, diamond: 40 },
		desc: function(star){
			return `出售可获得 20000 金币。`;
		},
		maxLevel: 10,
	},
	bw_21615:{
		id: 'bw_21615',
		name: '玄武',
		icon: '/image/equip/bws_21615.png',
		iconbig: '/image/equip-big/bw_21615.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		mingzhong:400,
		// 发出攻击指令后，若实际目标数少于额定最大目标数，每少一个目标，本次伤害 +25%
		// 额定最大目标数硬编码：全体=6，一行=3，一列=2，单体=1（由引擎 _currentAttack 提供）
		effects: [{
			trigger: 'onDamageCalc',
			filter: function(){ return true; },
			content: function(defender, finalDmg, mod){
				var ca = this._currentAttack;
				if (!ca) return;
				var missing = ca.maxTargets - ca.actualTargets;
				if (missing > 0) mod.pct += missing * 0.25;
			}
		}],
		desc: function(star){
			return `攻击加${star*200}，命中+400，若发出攻击指令后，目标数少于可指定的最大角色数，每减少一个目标，本次伤害+25%。`;
		},
		maxLevel: 10,
	},
	bw_21616:{
		id: 'bw_21616',
		name: '闪电雕',
		icon: '/image/equip/bws_21616.png',
		iconbig: '/image/equip-big/bw_21616.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		mingzhong:400,
		// 对封印的目标造成伤害+50%
		effects: [{
			trigger: 'onDamageCalc',
			filter: function(defender){ return !!(defender && defender.buffList && defender.buffList.some(function(b){ return b.type === 'seal'; })); },
			content: function(defender, finalDmg, mod){ mod.pct += 0.5; }
		}],
		desc: function(star){
			return `攻击加${star*200}，命中+400，对封印的目标造成伤害+50%。`;
		},
		maxLevel: 10,
	},
	bw_21617:{
		id: 'bw_21617',
		name: '朱雀',
		icon: '/image/equip/bws_21617.png',
		iconbig: '/image/equip-big/bw_21617.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		mingzhong:400,
		// 普攻命中时对目标额外造成 20% 攻击力的真实伤害（原意"指令下达后先造成"，当前无前置 trigger，近似置于命中时；真实伤害无视防御/闪避）
		effects: [{
			trigger: 'pugongHit',
			filter: function(){ return true; },
			content: function(target){
				if (target && target.alive) {
					var B = Game.Battle;
					var tdmg = Math.max(1, Math.floor((this.atk || 0) * 0.2));
					target.hp -= tdmg;
					B.showDamageNumber(target, tdmg, { isTrue: true });
					B.log(`${target.name} 受到 ${tdmg} 点真实伤害`);
					if (target.hp <= 0) { target.hp = 0; target.alive = false; target._trueDeath = true; B.log(`${target.name} 阵亡！`); }
					B.updateUI();
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*200}，命中+400，普攻时，对目标造成20%普攻伤害的真实伤害。`;//（当普攻或技能锁定目标后，即使目标已死，仍会鞭尸；同时修改击杀设定：造成非真实伤害后，若目标死亡，则判定为击杀；届时可以回能等判定）
		},
		maxLevel: 10,
	},
	bw_21618:{
		id: 'bw_21618',
		name: '五毒蛟龙',
		icon: '/image/equip/bws_21618.png',
		iconbig: '/image/equip-big/bw_21618.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		poji:400,
		// 造成伤害时（普攻/技能），100%几率令目标中毒2回合（毒素伤害为施加者攻击力33%）
		effects: [
			{ trigger: 'pugongHit', filter: function(){ return true; }, content: function(target){ if (target && target.alive){ Game.Battle.addBuff(target, { id: 'poison', name: '中毒', type: 'poison', remainRounds: 2, sourceSide: this.side, sourceId: this.instanceId, value: Math.floor((this.atk || 0) * 0.33) }); } } },
			{ trigger: 'skillHit', filter: function(){ return true; }, content: function(target){ if (target && target.alive){ Game.Battle.addBuff(target, { id: 'poison', name: '中毒', type: 'poison', remainRounds: 2, sourceSide: this.side, sourceId: this.instanceId, value: Math.floor((this.atk || 0) * 0.33) }); } } }
		],
		desc: function(star){
			return `攻击加${star*200}，破击+400，造成伤害时，100%几率令目标中毒2回合（毒素伤害为施加者的33%）。`;
		},
		maxLevel: 10,
	},
	bw_21619:{
		id: 'bw_21619',
		name: '鬼眼雕王',
		icon: '/image/equip/bws_21619.png',
		iconbig: '/image/equip-big/bw_21619.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		poji:400,
		// 技能后，恢复2能量
		effects: [{
			trigger: 'skillEnd',
			filter: function(){ return true; },
			content: function(){
				if (this.energy !== undefined) {
					this.energy = Math.min(8, this.energy + 2);
					Game.Battle.log(`${this.name} 获得2点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*200}，破击+400，技能后，恢复2能量。`;
		},
		maxLevel: 10,
	},
	bw_21620:{
		id: 'bw_21620',
		name: '白虎',
		icon: '/image/equip/bws_21620.png',
		iconbig: '/image/equip-big/bw_21620.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		baoji:400,
		baoshang:2000,
		desc: function(star){
			return `攻击加${star*200}，暴击+400，暴击伤害+2000。`;
		},
		maxLevel: 10,
	},
	bw_21621:{
		id: 'bw_21621',
		name: '青龙',
		icon: '/image/equip/bws_21621.png',
		iconbig: '/image/equip-big/bw_21621.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		baoji:400,
		// 技能命中时，对左右相邻目标造成80%溅射伤害（复用【吴爽】溅射写法 Battle.splashToAdjacent）
		effects: [{
			trigger: 'skillHit',
			filter: function(){ return true; },
			content: function(target){
				Game.Battle.splashToAdjacent(this, target, 0.8, 'skill');
			}
		}],
		desc: function(star){
			return `攻击加${star*200}，暴击+400，技能命中时，对左右目标造成80%伤害。`;
		},
		maxLevel: 10,
	},
	bw_21622:{
		id: 'bw_21622',
		name: '碧眼玉麟',
		icon: '/image/equip/bws_21622.png',
		iconbig: '/image/equip-big/bw_21622.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		poji:400,
		// 概率修正：自身发动特效判定概率时，成功率 +20%（通过引擎 rollChance 的 probMod.self 生效）
		effects: [{
			trigger: '__probMod__',
			probMod: { self: 0.2 },
			filter: function(){ return false; },
			content: function(){}
		}],
		desc: function(star){
			return `攻击加${star*200}，破击+400，发动特效判定概率时，令概率加20%。`;
		},
		maxLevel: 10,
	},
	bw_21623:{
		id: 'bw_21623',
		name: '血棘异兽',
		icon: '/image/equip/bws_21623.png',
		iconbig: '/image/equip-big/bw_21623.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		poji:400,
		// 普攻命中时吸血60%（借鉴突破库的 lifesteal_pugong，按本次实际伤害 _lastDamage 回血）
		effects: [{
			trigger: 'pugongHit',
			filter: function(){ return true; },
			content: function(target){
				if (this.alive && target && target._lastDamage) {
					var healAmt = Math.floor(target._lastDamage * 0.6);
					this.hp = Math.min(this.maxHp, this.hp + healAmt);
					Game.Battle.log(`${this.name} 吸血 ${healAmt} 点`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `攻击加${star*200}，破击+400，普攻命中时吸血60%。`;
		},
		maxLevel: 10,
	},
	bw_21624:{
		id: 'bw_21624',
		name: '青鸾',
		icon: '/image/equip/bws_21624.png',
		iconbig: '/image/equip-big/bw_21624.png',
		rank:4,
		sellPrice: 600,
		price: { gold: 40000, diamond: 40 },
		atk:200,
		baoji:400,
		// 技能系数 +20%、普攻系数 +10%（通过 coeffBonus 时点接入，见 Battle.getCoeffBonus）
		effects: [{
			trigger: 'coeffBonus',
			filter: function(){ return true; },
			content: function(attackType){
				if (attackType === 'skill') return 0.2;
				if (attackType === 'pugong') return 0.1;
				return 0;
			}
		}],
		desc: function(star){
			return `攻击加${star*200}，暴击+400，技能系数提升20%，普攻系数提升10%。`;
		},
		maxLevel: 10,
	},

	//品质5
	bw_12025:{
		id: 'bw_12025',
		name: '破天灭神诀',
		icon: '/image/equip/bws_12025.png',
		iconbig: '/image/equip-big/bw_12025.png',
		rank:5,
		sellPrice: 1000,
		price: { diamond: 100 },
		hp:9000,
		gedang:500,
		// 格挡反击：格挡成功时，对来源发起一次特殊普攻（100%攻击系数）
		effects: [{
			trigger: 'onBlock',
			filter: function(){ return true; },
			content: function(attacker){
				if (attacker && attacker.alive) {
					var B = Game.Battle;
					B.log(`${this.name} 触发格挡反击！`);
					var dmg = B.calculateDamage(this, attacker, 1.0, 0, 'pugong');
					B.applyDamage(attacker, dmg, this, function(){}, { trigger: 'counterHit', isSpecial: true });
				}
			}
		}],
		desc: function(star){
			return `血量加${star*9000}，格挡+500，格挡反击，造成100%伤害。`;
		},
		maxLevel: 10,
	},
	bw_12026:{
		id: 'bw_12026',
		name: '万道轮回诀',
		icon: '/image/equip/bws_12026.png',
		iconbig: '/image/equip-big/bw_12026.png',
		rank:5,
		sellPrice: 1000,
		price: { diamond: 100 },
		hp:9000,
		shanbi:500,
		// 触发闪避时，增加自身1能量
		effects: [{
			trigger: 'onDodge',
			filter: function(){ return true; },
			content: function(){
				if (this.energy !== undefined) {
					this.energy = Math.min(8, this.energy + 1);
					Game.Battle.log(`${this.name} 获得1点能量`);
					Game.Battle.updateUI();
				}
			}
		}],
		desc: function(star){
			return `血量加${star*9000}，闪避+500，触发闪避时，增加自身1能量。`;
		},
		maxLevel: 10,
	},
	bw_12027:{
		id: 'bw_12027',
		name: '灵域封天诀',
		icon: '/image/equip/bws_12027.png',
		iconbig: '/image/equip-big/bw_12027.png',
		rank:5,
		sellPrice: 1000,
		price: { diamond: 100 },
		hp:9000,
		kangbao:500,
		// 受到非真实伤害时，反伤50%真实伤害（onHitSelf 仅在非真实伤害路径触发，自动满足"非真实"条件）
		effects: [{
			trigger: 'onHitSelf',
			filter: function(){ return true; },
			content: function(attacker, damage){
				if (attacker && attacker.alive) {
					var B = Game.Battle;
					var rdmg = Math.floor((damage || 0) * 0.5);
					if (rdmg > 0) {
						attacker.hp -= rdmg;
						B.showDamageNumber(attacker, rdmg, { isTrue: true });
						B.log(`${attacker.name} 受到 ${rdmg} 点真实伤害（反伤）`);
						if (attacker.hp <= 0) { attacker.hp = 0; attacker.alive = false; B.log(`${attacker.name} 阵亡！`); }
						B.updateUI();
					}
				}
			}
		}],
		desc: function(star){
			return `血量加${star*9000}，抗暴+500，受到非真实伤害时，反伤50%。`;
			//反伤概念：对来源造成该伤害的指定比值，且为真实伤害，不受其他效果影响，真实伤害造成击杀不会触发亡语等结算
		},
		maxLevel: 10,
	},
	bw_22025:{
		id: 'bw_22025',
		name: '叱雷天狼',
		icon: '/image/equip/bws_22025.png',
		iconbig: '/image/equip-big/bw_22025.png',
		rank:5,
		sellPrice: 1000,
		price: { diamond: 100 },
		atk:1500,
		baoji:500,
		// 暴击时，增加1能量（普攻/技能命中且本次为暴击时触发，攻击方 _lastHitIsCrit 已记录）
		effects: [
			{ trigger: 'pugongHit', filter: function(){ return !!this._lastHitIsCrit; }, content: function(){ if (this.energy !== undefined){ this.energy = Math.min(8, this.energy + 1); Game.Battle.log(`${this.name} 获得1点能量`); Game.Battle.updateUI(); } } },
			{ trigger: 'skillHit', filter: function(){ return !!this._lastHitIsCrit; }, content: function(){ if (this.energy !== undefined){ this.energy = Math.min(8, this.energy + 1); Game.Battle.log(`${this.name} 获得1点能量`); Game.Battle.updateUI(); } } }
		],
		desc: function(star){
			return `攻击加${star*1500}，暴击+500，暴击时，增加1能量。`;
		},
		maxLevel: 10,
	},
	bw_22026:{
		id: 'bw_22026',
		name: '灵渊魔蛟',
		icon: '/image/equip/bws_22026.png',
		iconbig: '/image/equip-big/bw_22026.png',
		rank:5,
		sellPrice: 1000,
		price: { diamond: 100 },
		atk:1500,
		mingzhong:500,
		// 无视60%防御：战斗开始（首轮）时把 ignore_def_all_60 写入 unit.buff，供 getIgnoreDefPercent 读取
		effects: [{
			trigger: 'roundStart',
			filter: function(round){ return round === 1 && !this._bwIgnoreDefDone; },
			content: function(){
				this._bwIgnoreDefDone = true;
				this.buff = this.buff || [];
				this.buff.push('ignore_def_all_60');
				Game.Battle.log(`${this.name} 获得无视60%防御`);
			}
		}],
		desc: function(star){
			return `攻击加${star*1500}，命中+500，无视60%防御。`;
		},
		maxLevel: 10,
	},
	bw_22027:{
		id: 'bw_22027',
		name: '魑魅天鸟',
		icon: '/image/equip/bws_22027.png',
		iconbig: '/image/equip-big/bw_22027.png',
		rank:5,
		sellPrice: 1000,
		price: { diamond: 100 },
		atk:1500,
		poji:500,
		// 战斗开始时，对全体敌人造成攻击力55%的真实伤害（roundStart round===1 在战斗开始触发）
		effects: [{
			trigger: 'roundStart',
			filter: function(round){ return round === 1 && !this._bwAoeDone; },
			content: function(){
				this._bwAoeDone = true;
				var B = Game.Battle;
				var tdmg = Math.max(1, Math.floor((this.atk || 0) * 0.55));
				B.getAliveUnits(this.side === 'player' ? 'enemy' : 'player').forEach(function(e){
					if (e && e.alive) {
						e.hp -= tdmg;
						B.showDamageNumber(e, tdmg, { isTrue: true });
						B.log(`${e.name} 受到 ${tdmg} 点真实伤害`);
						if (e.hp <= 0) { e.hp = 0; e.alive = false; B.log(`${e.name} 阵亡！`); }
					}
				});
				B.updateUI();
			}
		}],
		desc: function(star){
			return `攻击加${star*1500}，破击+500，战斗开始时，对全体敌人造成攻击力55%的真实伤害。`;
		},
		maxLevel: 10,
	},

	//品质6
	bw_13028:{
		id: 'bw_13028',
		name: '江山社稷图',
		icon: '/image/equip/bws_13028.png',
		iconbig: '/image/equip-big/bw_13028.png',
		rank:6,
		sellPrice: 2000,
		price: { diamond: 200 },
		hp:12000,
		gedang:3000,
		desc: function(star){
			return `血量加${star*12000}，格挡+3000。`;
		},
		maxLevel: 10,
	},
	bw_13029:{
		id: 'bw_13029',
		name: '混沌长明诀',
		icon: '/image/equip/bws_13029.png',
		iconbig: '/image/equip-big/bw_13029.png',
		rank:6,
		sellPrice: 2000,
		price: { diamond: 200 },
		hp:12000,
		shanbi:3000,
		desc: function(star){
			return `血量加${star*12000}，闪避+3000。`;
		},
		maxLevel: 10,
	},
	bw_13030:{
		id: 'bw_13030',
		name: '山海经',
		icon: '/image/equip/bws_13030.png',
		iconbig: '/image/equip-big/bw_13030.png',
		rank:6,
		sellPrice: 2000,
		price: { diamond: 200 },
		hp:12000,
		kangbao:3000,
		desc: function(star){
			return `血量加${star*12000}，抗暴+3000。`;
		},
		maxLevel: 10,
	},
	bw_23028:{
		id: 'bw_23028',
		name: '浮屠沧蛟',
		icon: '/image/equip/bws_23028.png',
		iconbig: '/image/equip-big/bw_23028.png',
		rank:6,
		sellPrice: 2000,
		price: { diamond: 200 },
		atk:2000,
		baoji:3000,
		desc: function(star){
			return `攻击加${star*2000}，暴击+3000。`;
		},
		maxLevel: 10,
	},
	bw_23029:{
		id: 'bw_23029',
		name: '炎烬凤凰',
		icon: '/image/equip/bws_23029.png',
		iconbig: '/image/equip-big/bw_23029.png',
		rank:6,
		sellPrice: 2000,
		price: { diamond: 200 },
		atk:2000,
		mingzhong:3000,
		desc: function(star){
			return `攻击加${star*2000}，命中+3000。`;
		},
		maxLevel: 10,
	},
	bw_23030:{
		id: 'bw_23030',
		name: '烈阳真龙',
		icon: '/image/equip/bws_23030.png',
		iconbig: '/image/equip-big/bw_23030.png',
		rank:6,
		sellPrice: 2000,
		price: { diamond: 200 },
		atk:2000,
		poji:3000,
		desc: function(star){
			return `攻击加${star*2000}，破击+3000。`;
		},
		maxLevel: 10,
	},


}
export { TREASURE_DEFS };
