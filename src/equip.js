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
		price: 2000,// 300 金币
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
		price: 2000,
	},
	guipu: {
		id: 'guipu',
		name: '鬼仆',
		icon: '/image/skill/guipu.png',
		price: 2000,
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
		price: 2000,
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
		price: 2000,
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
		price: 2000,
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
		price: 8000,
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
		price: 8000,
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
	},
	bw_10042:{
		id: 'bw_10042',
		name: '宝物10042',
		icon: '/image/equip/bws_10042.png',
		iconbig: '/image/equip-big/bw_10042.png',
	},
	bw_11625:{
		id: 'bw_11625',
		name: '宝物11625',
		icon: '/image/equip/bws_11625.png',
		iconbig: '/image/equip-big/bw_11625.png',
	},
	bw_11626:{
		id: 'bw_11626',
		name: '宝物11626',
		icon: '/image/equip/bws_11626.png',
		iconbig: '/image/equip-big/bw_11626.png',
	},
	bw_21625:{
		id: 'bw_21625',
		name: '宝物21625',
		icon: '/image/equip/bws_21625.png',
		iconbig: '/image/equip-big/bw_21625.png',
	},
	bw_21626:{
		id: 'bw_21626',
		name: '宝物21626',
		icon: '/image/equip/bws_21626.png',
		iconbig: '/image/equip-big/bw_21626.png',
	},

	//品质1
	bw_10501:{
		id: 'bw_10501',
		name: '狂火拳',
		icon: '/image/equip/bws_10501.png',
		iconbig: '/image/equip-big/bw_10501.png',
		rank:1,
		price: 200,
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
	},
	bw_10502:{
		id: 'bw_10502',
		name: '金钟罩',
		icon: '/image/equip/bws_10502.png',
		iconbig: '/image/equip-big/bw_10502.png',
		rank:1,
		price: 200,
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
	},
	bw_20501:{
		id: 'bw_20501',
		name: '威武将军',
		icon: '/image/equip/bws_20501.png',
		iconbig: '/image/equip-big/bw_20501.png',
		rank:1,
		price: 200,
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
	},
	bw_20502:{
		id: 'bw_20502',
		name: '天雷猪',
		icon: '/image/equip/bws_20502.png',
		iconbig: '/image/equip-big/bw_20502.png',
		rank:1,
		price: 200,
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
	},

	//品质2
	bw_10606:{
		id: 'bw_10606',
		name: '唐门毒经',
		icon: '/image/equip/bws_10606.png',
		iconbig: '/image/equip-big/bw_10606.png',
		rank:2,
		price: 800,
		hp:240,
		desc: function(star){
			return `血量加${star*240}，普攻，50%几率令目标中毒2回合，毒素伤害为施加者攻击力的33%。`;
		},
	},
	bw_10607:{
		id: 'bw_10607',
		name: '五行八卦掌',
		icon: '/image/equip/bws_10607.png',
		iconbig: '/image/equip-big/bw_10607.png',
		rank:2,
		price: 800,
		desc: function(star){
			return `血量加${star*240}，普攻命中时，20%几率眩晕目标1回合。`;
		},
	},
	bw_10608:{
		id: 'bw_10608',
		name: '狂雕霹雳爪',
		icon: '/image/equip/bws_10608.png',
		iconbig: '/image/equip-big/bw_10608.png',
		rank:2,
		price: 800,
		desc: function(star){
			return `血量加${star*240}，普攻后，80%几率减少目标45%防御1回合。`;
		},
	},
	bw_20605:{
		id: 'bw_20605',
		name: '地蛇',
		icon: '/image/equip/bws_20605.png',
		iconbig: '/image/equip-big/bw_20605.png',
		rank:2,
		price: 800,
		desc: function(star){
			return `攻击加${star*40}，技能命中时，20%几率封印目标1回合`;
		},
	},
	bw_20606:{
		id: 'bw_20606',
		name: '灵蛛',
		icon: '/image/equip/bws_20606.png',
		iconbig: '/image/equip-big/bw_20606.png',
		rank:2,
		price: 800,
		desc: function(star){
			return `攻击加${star*40}，技能命中时，20%几率减少目标1能量`;
		},
	},
	bw_20607:{
		id: 'bw_20607',
		name: '百醉蜈蚣',
		icon: '/image/equip/bws_20607.png',
		iconbig: '/image/equip-big/bw_20607.png',
		rank:2,
		price: 800,
		desc: function(star){
			return `攻击加${star*40}，技能命中时，50%几率令目标中毒2回合，毒素伤害为施加者攻击力的33%。`;
		},
	},

	//品质3
	bw_10803:{
		id: 'bw_10803',
		name: '经验银书',
		icon: '/image/equip/bws_10803.png',
		iconbig: '/image/equip-big/bw_10803.png',
		rank:3,
		price: 5000,
	},
	bw_11012:{
		id: 'bw_11012',
		name: '真空波动拳',
		icon: '/image/equip/bws_11012.png',
		iconbig: '/image/equip-big/bw_11012.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `血量加${star*600}，格挡+200，格挡反击，造成50%伤害。`;
		},
	},
	bw_11013:{
		id: 'bw_11013',
		name: '逆天神功',
		icon: '/image/equip/bws_11013.png',
		iconbig: '/image/equip-big/bw_11013.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `血量加${star*600}，闪避+200。`;
		},
	},
	bw_11014:{
		id: 'bw_11014',
		name: '南冥神功',
		icon: '/image/equip/bws_11014.png',
		iconbig: '/image/equip-big/bw_11014.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `血量加${star*600}，抗暴+200。`;
		},
	},
	bw_11109:{
		id: 'bw_11109',
		name: '荆棘神功',
		icon: '/image/equip/bws_11109.png',
		iconbig: '/image/equip-big/bw_11109.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `血量加${star*600}，格挡+200。`;
		},
	},
	bw_11110:{
		id: 'bw_11110',
		name: '吸蜂神功',
		icon: '/image/equip/bws_11110.png',
		iconbig: '/image/equip-big/bw_11110.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `血量加${star*600}，抗暴+200，受到攻击时，20%几率减少来源1能量。`;
		},
	},
	bw_11111:{
		id: 'bw_11111',
		name: '天降春雨',
		icon: '/image/equip/bws_11111.png',
		iconbig: '/image/equip-big/bw_11111.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `血量加${star*600}，闪避+200，治疗效果+20%。`;
		},
	},
	bw_20803:{
		id: 'bw_20803',
		name: '经验银兽',
		icon: '/image/equip/bws_20803.png',
		iconbig: '/image/equip-big/bw_20803.png',
		rank:3,
		price: 5000,
	},
	bw_21012:{
		id: 'bw_21012',
		name: '天灵鸟',
		icon: '/image/equip/bws_21012.png',
		iconbig: '/image/equip-big/bw_21012.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `攻击加${star*100}，暴击+200，治疗普攻时，20%几率令目标增加1能量。`;
		},
	},
	bw_21013:{
		id: 'bw_21013',
		name: '鬼虎',
		icon: '/image/equip/bws_21013.png',
		iconbig: '/image/equip-big/bw_21013.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `攻击加${star*100}，暴击+200。`;
		},
	},
	bw_21014:{
		id: 'bw_21014',
		name: '黑背棍猿',
		icon: '/image/equip/bws_21014.png',
		iconbig: '/image/equip-big/bw_21014.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `攻击加${star*100}，命中+200。`;
		},
	},
	bw_21109:{
		id: 'bw_21109',
		name: '五煞之龙',
		icon: '/image/equip/bws_21109.png',
		iconbig: '/image/equip-big/bw_21109.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `攻击加${star*100}，破击+200。`;
		},
	},
	bw_21110:{
		id: 'bw_21110',
		name: '风雷紫电兽',
		icon: '/image/equip/bws_21110.png',
		iconbig: '/image/equip-big/bw_21110.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `攻击加${star*100}，破击+200，普攻命中时，对左右目标造成50%伤害。`;
		},
	},
	bw_21111:{
		id: 'bw_21111',
		name: '九尾穿云豹',
		icon: '/image/equip/bws_21111.png',
		iconbig: '/image/equip-big/bw_21111.png',
		rank:3,
		price: 5000,
		desc: function(star){
			return `攻击加${star*100}，命中+200，普攻命中时，20%几率减少目标1能量。`;
		},
	},

	//品质4
	bw_11304:{
		id: 'bw_11304',
		name: '经验金书',
		icon: '/image/equip/bws_11304.png',
		iconbig: '/image/equip-big/bw_11304.png',
		rank:4,
		price: 40000,
	},
	bw_11615:{
		id: 'bw_11615',
		name: '女娲补天诀',
		icon: '/image/equip/bws_11615.png',
		iconbig: '/image/equip-big/bw_11615.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，受到暴击时，降低来源1能量。`;
		},
	},
	bw_11616:{
		id: 'bw_11616',
		name: '山海之印',
		icon: '/image/equip/bws_11616.png',
		iconbig: '/image/equip-big/bw_11616.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，闪避+400，触发闪避时，对来源造成本次伤害等额真实伤害。`;
		},
	},
	bw_11617:{
		id: 'bw_11617',
		name: '先蚕驱凤诀',
		icon: '/image/equip/bws_11617.png',
		iconbig: '/image/equip-big/bw_11617.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，格挡+400，格挡反击，造成75%伤害。`;
			//由于可能由于角色突破或其他效果已获得格挡反击，如果已有格挡反击词条，则改为令格挡反击的伤害加上这个系数
		},
	},
	bw_11618:{
		id: 'bw_11618',
		name: '狂雷葬世',
		icon: '/image/equip/bws_11618.png',
		iconbig: '/image/equip-big/bw_11618.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，守护+2000。`;
		},
	},
	bw_11619:{
		id: 'bw_11619',
		name: '狂火千爆',
		icon: '/image/equip/bws_11619.png',
		iconbig: '/image/equip-big/bw_11619.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，闪避+400，受到非真实伤害时，反伤20%。`;
		},
	},
	bw_11620:{
		id: 'bw_11620',
		name: '造化战诀',
		icon: '/image/equip/bws_11620.png',
		iconbig: '/image/equip-big/bw_11620.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，格挡+400，触发格挡时，回复1能量。`;
		},
	},
	bw_11621:{
		id: 'bw_11621',
		name: '轩辕御龙诀',
		icon: '/image/equip/bws_11621.png',
		iconbig: '/image/equip-big/bw_11621.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，受到暴击时，回复1能量。`;
		},
	},
	bw_11622:{
		id: 'bw_11622',
		name: '灵枢通天诀',
		icon: '/image/equip/bws_11622.png',
		iconbig: '/image/equip-big/bw_11622.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，抗暴+400，敌方判断概率时，令本次成功率降低20%。`;
		},
		//有些效果写的是100%，是可以被这个减少的，但是代码里直接true了没判断，先不用回头修改，等统一汇总再决策
	},
	bw_11623:{
		id: 'bw_11623',
		name: '天道战意诀',
		icon: '/image/equip/bws_11623.png',
		iconbig: '/image/equip-big/bw_11623.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，格挡+400，被攻击时，40%几率令来源减少1能量。`;
		},
	},
	bw_11624:{
		id: 'bw_11624',
		name: '凤舞天音诀',
		icon: '/image/equip/bws_11624.png',
		iconbig: '/image/equip-big/bw_11624.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `血量加${star*1200}，闪避+400，触发闪避时，20%几率恢复全队1能量。`;
		},
	},
	bw_21304:{
		id: 'bw_21304',
		name: '经验金兽',
		icon: '/image/equip/bws_21304.png',
		iconbig: '/image/equip-big/bw_21304.png',
		rank:4,
		price: 40000,
	},
	bw_21615:{
		id: 'bw_21615',
		name: '玄武',
		icon: '/image/equip/bws_21615.png',
		iconbig: '/image/equip-big/bw_21615.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，命中+400，若发出攻击指令后，目标数少于可指定的最大角色数，每减少一个目标，本次伤害+25%。`;
			//（比如skill_105最大目标是6但只打了4人，则本次伤害增加50%）
		},
	},
	bw_21616:{
		id: 'bw_21616',
		name: '闪电雕',
		icon: '/image/equip/bws_21616.png',
		iconbig: '/image/equip-big/bw_21616.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，命中+400，对封印的目标造成伤害+50%。`;
		},
	},
	bw_21617:{
		id: 'bw_21617',
		name: '朱雀',
		icon: '/image/equip/bws_21617.png',
		iconbig: '/image/equip-big/bw_21617.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，命中+400，普攻指令下达后，先对目标造成20%普攻伤害的真实伤害。`;//（当普攻或技能锁定目标后，即使目标已死，仍会鞭尸；同时修改击杀设定：造成非真实伤害后，若目标死亡，则判定为击杀；届时可以回能等判定）
		},
	},
	bw_21618:{
		id: 'bw_21618',
		name: '五毒蛟龙',
		icon: '/image/equip/bws_21618.png',
		iconbig: '/image/equip-big/bw_21618.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，破击+400，造成伤害时，100%几率令目标中毒2回合（毒素伤害为施加者的33%）。`;
		},
	},
	bw_21619:{
		id: 'bw_21619',
		name: '鬼眼雕王',
		icon: '/image/equip/bws_21619.png',
		iconbig: '/image/equip-big/bw_21619.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，破击+400，技能后，恢复2能量。`;
		},
	},
	bw_21620:{
		id: 'bw_21620',
		name: '白虎',
		icon: '/image/equip/bws_21620.png',
		iconbig: '/image/equip-big/bw_21620.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，暴击+400，暴击伤害+2000。`;
		},
	},
	bw_21621:{
		id: 'bw_21621',
		name: '青龙',
		icon: '/image/equip/bws_21621.png',
		iconbig: '/image/equip-big/bw_21621.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，暴击+400，技能命中时，对左右目标造成80%伤害。`;
		},
	},
	bw_21622:{
		id: 'bw_21622',
		name: '碧眼玉麟',
		icon: '/image/equip/bws_21622.png',
		iconbig: '/image/equip-big/bw_21622.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，破击+400，发动特效判断概率时，令概率加20%。`;
		},
	},
	bw_21623:{
		id: 'bw_21623',
		name: '血棘异兽',
		icon: '/image/equip/bws_21623.png',
		iconbig: '/image/equip-big/bw_21623.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，破击+400，普攻时回复自身60%伤害值的血量。`;
		},
	},
	bw_21624:{
		id: 'bw_21624',
		name: '青鸾',
		icon: '/image/equip/bws_21624.png',
		iconbig: '/image/equip-big/bw_21624.png',
		rank:4,
		price: 40000,
		desc: function(star){
			return `攻击加${star*200}，暴击+400，技能系数提升20%，普攻系数提升10%。`;
		},
	},

	//品质5
	bw_12025:{
		id: 'bw_12025',
		name: '破天灭神诀',
		icon: '/image/equip/bws_12025.png',
		iconbig: '/image/equip-big/bw_12025.png',
		rank:5,
		price: 100000,
		desc: function(star){
			return `血量加${star*9000}，格挡+500，格挡反击，造成100%伤害。`;
		},
	},
	bw_12026:{
		id: 'bw_12026',
		name: '万道轮回诀',
		icon: '/image/equip/bws_12026.png',
		iconbig: '/image/equip-big/bw_12026.png',
		rank:5,
		price: 100000,
		desc: function(star){
			return `血量加${star*9000}，闪避+500，触发闪避时，增加自身1能量。`;
		},
	},
	bw_12027:{
		id: 'bw_12027',
		name: '灵域封天诀',
		icon: '/image/equip/bws_12027.png',
		iconbig: '/image/equip-big/bw_12027.png',
		rank:5,
		price: 100000,
		desc: function(star){
			return `血量加${star*9000}，抗暴+500，受到非真实伤害时，反伤50%。`;
			//反伤概念：对来源造成该伤害的指定比值，且为真实伤害，不受其他效果影响，真实伤害造成击杀不会触发亡语等结算
		},
	},
	bw_22025:{
		id: 'bw_22025',
		name: '叱雷天狼',
		icon: '/image/equip/bws_22025.png',
		iconbig: '/image/equip-big/bw_22025.png',
		rank:5,
		price: 100000,
		desc: function(star){
			return `攻击加${star*1500}，暴击+500，暴击时，增加1能量。`;
		},
	},
	bw_22026:{
		id: 'bw_22026',
		name: '灵渊魔蛟',
		icon: '/image/equip/bws_22026.png',
		iconbig: '/image/equip-big/bw_22026.png',
		rank:5,
		price: 100000,
		desc: function(star){
			return `攻击加${star*1500}，命中+500，无视60%防御。`;
		},
	},
	bw_22027:{
		id: 'bw_22027',
		name: '魑魅天鸟',
		icon: '/image/equip/bws_22027.png',
		iconbig: '/image/equip-big/bw_22027.png',
		rank:5,
		price: 100000,
		desc: function(star){
			return `攻击加${star*1500}，破击+500，战斗开始时，对全体敌人造成攻击力55%的真实伤害。`;
		},
	},

	//品质6
	bw_13028:{
		id: 'bw_13028',
		name: '江山社稷图',
		icon: '/image/equip/bws_13028.png',
		iconbig: '/image/equip-big/bw_13028.png',
		rank:6,
		price: 200000,
		desc: function(star){
			return `血量加${star*12000}，格挡+3000。`;
		},
	},
	bw_13029:{
		id: 'bw_13029',
		name: '混沌长明诀',
		icon: '/image/equip/bws_13029.png',
		iconbig: '/image/equip-big/bw_13029.png',
		rank:6,
		price: 200000,
		desc: function(star){
			return `血量加${star*12000}，闪避+3000。`;
		},
	},
	bw_13030:{
		id: 'bw_13030',
		name: '山海经',
		icon: '/image/equip/bws_13030.png',
		iconbig: '/image/equip-big/bw_13030.png',
		rank:6,
		price: 200000,
		desc: function(star){
			return `血量加${star*12000}，抗暴+3000。`;
		},
	},
	bw_23028:{
		id: 'bw_23028',
		name: '浮屠沧蛟',
		icon: '/image/equip/bws_23028.png',
		iconbig: '/image/equip-big/bw_23028.png',
		rank:6,
		price: 200000,
		desc: function(star){
			return `攻击加${star*2000}，暴击+3000。`;
		},
	},
	bw_23029:{
		id: 'bw_23029',
		name: '炎烬凤凰',
		icon: '/image/equip/bws_23029.png',
		iconbig: '/image/equip-big/bw_23029.png',
		rank:6,
		price: 200000,
		desc: function(star){
			return `攻击加${star*2000}，命中+3000。`;
		},
	},
	bw_23030:{
		id: 'bw_23030',
		name: '烈阳真龙',
		icon: '/image/equip/bws_23030.png',
		iconbig: '/image/equip-big/bw_23030.png',
		rank:6,
		price: 200000,
		desc: function(star){
			return `攻击加${star*2000}，破击+3000。`;
		},
	},


}
export { TREASURE_DEFS };
