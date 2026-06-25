const TREASURE_DEFS= {
	wusheng: {
		id: 'wusheng',
		name: '武圣',
		desc: '攻击力加200。',
		atk: 200,
		icon: './image/skill/lianpo.png',
		price: 200,// 300 金币
	},
	ganglie: {
		id: 'ganglie',
		name: '刚烈',
		desc: '防御加100。',
		def: 100,
		icon: './image/skill/ganglie.png',
		price: 100,
	},
	guipu: {
		id: 'guipu',
		name: '鬼仆',
		icon: './image/skill/guipu.png',
		price: 1000,
		desc: '生命加1000。',
		hp: 100,
	},
	paoxiao:{
		id: 'paoxiao',
		name: '咆哮',
		desc: '暴击加150。',
		baoji: 150,
		icon: './image/skill/paoxiao.png',
		price: 1500,
	},
	shelie: {
		id: 'shelie',
		name: '涉猎',
		desc: '命中加150。',
		mingzhong: 150,
		icon: './image/skill/shelie.png',
		price: 1500,
	},
	zhengnan: {
		id: 'zhengnan',
		name: '征南',
		desc: '破击加150。',
		poji: 150,
		icon: './image/skill/zhengnan.png',
		price: 1500,
	},
}
window.TREASURE_DEFS = TREASURE_DEFS;
