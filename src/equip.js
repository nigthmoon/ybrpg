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

}
export { TREASURE_DEFS };
