const TREASURE_DEFS= {
	lianpo: {
        id: 'lianpo',
        name: '连破',
        desc: '攻击力加200。',
		atk: 200,
        icon: './image/equip/lianpo.png',
        price: 300,// 300 金币
    },
	
    shelie: {
        id: 'shelie',
        name: '涉猎',
        desc: '攻击力加100。',
		atk: 100,
        icon: './image/equip/shelie.png',
        price: 200,
    },
    guipu: {
        id: 'guipu',
        name: '鬼仆',
        icon: './image/equip/guipu.png',
        price: 250,
		desc: '生命加600。',
		hp: 600,
    },
    zhengnan: {
        id: 'zhengnan',
        name: '征南',
        desc: '攻击力加150。',
		atk: 150,
        icon: './image/equip/zhengnan.png',
        price: 250,

    },
    ganglie: {
        id: 'ganglie',
        name: '刚烈',
        desc: '防御加100。',
		def: 100,
        icon: './image/equip/ganglie.png',
        price: 350,
    },
}
window.TREASURE_DEFS = TREASURE_DEFS;