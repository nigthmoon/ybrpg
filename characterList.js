
const characterList = {
	zhujue:{
		name: "主角",
		group: "zhujue",
		sex: "female",
		tupolevel: 0,
		skills: ['attack1', 'attack_skill38'], 
		isFixed: true, 
		template: 'balanced',
		rank: "common",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_leimoying: {
		name: "雷魔鹰",
		group: "zhujue",
		sex: "female",
		tupolevel: 0,
		skills: ['attack999', 'attack_skill999'], // 攻击普攻1, 攻击技能1
		template: 'balanced', // 均衡
		rank: "junk",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
	},
	ybsl_fengmolang: {
		name: "风魔狼",
		group: "zhujue",
		sex: "female",
		tupolevel: 0,
		skills: ['attack998', 'attack_skill998'], // 攻击普攻1, 攻击技能1
		template: 'balanced', // 均衡
		rank: "junk",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
	},
	ybsl_yanmohua: {
		name: "魇魔花",
		group: "zhujue",
		sex: "female",
		tupolevel: 0,
		skills: ['attack997', 'attack_skill997'], // 攻击普攻1, 攻击技能1
		template: 'balanced', // 均衡
		rank: "junk",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
	},
	// --- 传说级 (Legend) ---
	ybsl_017xiaohong: {
		name: "涂山小红",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack2', 'attack_skill2'], // 攻击普攻2, 攻击技能2
		template: 'damger', // 偏攻
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_059starsFall1: {
		name: "鞠熒",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack1', 'attack_skill1'], // 攻击普攻1, 攻击技能1
		template: 'damger', // 偏攻
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_047shan: {
		name: "彡",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack1', 'attack_skill2'], // 攻击普攻1, 攻击技能2
		template: 'damger', // 偏攻
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_041mmuqin: {
		name: "慕琴",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack4', 'attack_skill4'], // 攻击普攻4, 攻击技能4
		template: 'balanced', // 均衡
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_049waner: {
		name: "王婉儿",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill1'], // 治疗普攻, 治疗技能1
		template: 'balanced', // 治疗默认均衡
		rank: "legend",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_048wushuang: {
		name: "吴爽",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack3', 'attack_skill3'], // 攻击普攻3, 攻击技能3
		template: 'damger', // 偏攻
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_076zhujun: {
		name: "朱焌",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack1', 'attack_skill2'], // 攻击普攻1, 攻击技能2
		template: 'defense', // 偏防
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_107tushanshuili: {
		name: "涂山水璃",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack1', 'attack_skill2'], // 攻击普攻1, 攻击技能2
		template: 'damger', // 偏攻
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_008wuyuxin: {
		name: "吴雨欣",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack1', 'attack_skill5'], // 攻击普攻1, 攻击技能3
		template: 'balanced', // 均衡
		rank: "legend",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_002chenailin: {
		name: "陈爱琳",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill1'], // 治疗普攻, 治疗技能1
		template: 'balanced', // 治疗默认均衡
		rank: "legend",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},

	// --- 史诗级 (Epic) ---
	ybsl_015wanghairu: {
		name: "王海茹",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill2'], // 治疗普攻, 治疗技能2
		template: 'balanced', // 治疗默认均衡
		rank: "epic",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_016manchengqi: {
		name: "满城柒",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack7', 'attack_skill8'], // 攻击普攻7, 攻击技能8
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_018zhangqing: {
		name: "张晴",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack6', 'attack_skill7'], // 攻击普攻6, 攻击技能7
		template: 'balanced', // 均衡
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_059starsFall3: {
		name: "周靈",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill17'], // 攻击普攻5, 攻击技能17
		template: 'balanced', // 均衡
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_059starsFall4: {
		name: "李曉",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill20'], // 攻击普攻5, 攻击技能20
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_068qingyue: {
		name: "清月姑娘",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack8', 'attack_skill9'], // 攻击普攻8, 攻击技能9
		template: 'balanced', // 均衡
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_070lvyanqiu: {
		name: "吕艳秋",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack9', 'attack_skill9'], // 攻击普攻9, 攻击技能9
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_033xiaohui: {
		name: "小慧",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill7'], // 攻击普攻5, 攻击技能7
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_038bianqiuwen: {
		name: "卞秋雯",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill6'], // 攻击普攻5, 攻击技能6
		template: 'defense', // 偏防
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	db_ybsl_067snake: {
		name: "蛇妃",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill19'], // 攻击普攻5, 攻击技能19
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},


	ybsl_069xiangzi: {
		name: "香紫姑娘",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill2'], // 治疗普攻, 治疗技能2
		template: 'balanced', // 治疗默认均衡
		rank: "epic",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_001sunlisong: {
		name: "孙丽松",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack7', 'attack_skill8'], // 攻击普攻7, 攻击技能8
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_006wanghanzhen: {
		name: "王汉桢",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack6', 'attack_skill7'], // 攻击普攻6, 攻击技能7
		template: 'balanced', // 均衡
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_009liyushan: {
		name: "李玉珊",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill6'], // 攻击普攻5, 攻击技能6
		template: 'defense', // 偏防
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_010zhouyue: {
		name: "周玥",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill7'], // 攻击普攻5, 攻击技能7
		template: 'balanced', // 均衡
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_013yinji: {
		name: "尹超跃",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill6'], // 攻击普攻5, 攻击技能6
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_018huanqing: {
		name: "幻晴",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill17'], // 攻击普攻5, 攻击技能17
		template: 'balanced', // 均衡
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_036bright: {
		name: "熙",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack9', 'attack_skill9'], // 攻击普攻9, 攻击技能9
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_092handan: {
		name: "玉蝶心",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill6'], // 攻击普攻5, 攻击技能6
		template: 'defense', // 偏防
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_083xiaozhu: {
		name: "小筑",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack8', 'attack_skill9'], // 攻击普攻8, 攻击技能9
		template: 'damger', // 偏攻
		rank: "epic",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},

	// --- 伪史诗 (Epicfake) ---
	ybsl_025shiqingyu: {
		name: "史庆宇",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill3'], // 治疗普攻, 治疗技能3
		template: 'balanced', // 治疗默认均衡
		rank: "epicfake",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_020jiayutong: {
		name: "贾雨桐",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill13'], // 攻击普攻5, 攻击技能13
		template: 'defense', // 偏防
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_025wanghe: {
		name: "王贺",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack8', 'attack_skill33'], // 攻击普攻8, 攻击技能33
		template: 'defense', // 偏防
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_042pingzi: {
		name: "蘋姉",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill22'], // 攻击普攻5, 攻击技能22
		template: 'damger', // 偏攻
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_043fangjiayu: {
		name: "房佳谕",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill22'], // 攻击普攻5, 攻击技能22
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_046jiangxuewu: {
		name: "江雪舞",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill18'], // 攻击普攻5, 攻击技能18
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_059starsFall2: {
		name: "宋橤",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill13'], // 攻击普攻5, 攻击技能13
		template: 'defense', // 偏防
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_060liutianhang: {
		name: "刘天杭",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill14'], // 攻击普攻5, 攻击技能14
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_079xiaoxin: {
		name: "小新",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill11'], // 攻击普攻5, 攻击技能11
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_003yanshuang: {
		name: "闫爽",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill3'], // 治疗普攻, 治疗技能3
		template: 'balanced', // 治疗默认均衡
		rank: "epicfake",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_004zhangyujie: {
		name: "张玉洁",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill22'], // 攻击普攻5, 攻击技能22
		template: 'damger', // 偏攻
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_005wangruobing: {
		name: "王若冰",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill22'], // 攻击普攻5, 攻击技能22
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_007wugege: {
		name: "吴格格",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill18'], // 攻击普攻5, 攻击技能18
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_011gaoyuhang: {
		name: "高宇航",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill11'], // 攻击普攻5, 攻击技能11
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_047zhangmi: {
		name: "张汨",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill16'], // 攻击普攻5, 攻击技能16
		template: 'damger', // 偏攻
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_026can: {
		name: "蚕",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack8', 'attack_skill33'], // 攻击普攻8, 攻击技能33
		template: 'defense', // 偏防
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_027rain: {
		name: "雨",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack8', 'attack_skill13'], // 攻击普攻8, 攻击技能13
		template: 'defense', // 偏防
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_029dawn: {
		name: "黎",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack5', 'attack_skill14'], // 攻击普攻5, 攻击技能14
		template: 'balanced', // 均衡
		rank: "epicfake",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},

	// --- 稀有 (Rare) ---
	ybsl_019shengyan: {
		name: "盛妍",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill27'], // 攻击普攻14, 攻击技能34
		template: 'defense', // 偏防
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_045gaocong: {
		name: "高聪",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill4'], // 治疗普攻, 治疗技能4 (注意: contentList中只有recover_skill1-3, 这里假设你有recover_skill4或者复用recover_skill3? 根据上下文contentList只有recover_skill1-3。如果recover_skill4不存在，可能需要改为recover_skill3或添加新技能。此处暂按你写的写，若报错请改为recover_skill3)
		// 修正：查看contentList，只有recover_skill1, recover_skill2, recover_skill3。
		// 通常“治疗技能4”可能指代其他，或者你需要添加。这里暂时改为 recover_skill3 以防报错，或者你可以确认是否有skill4。
		// 鉴于你写了“治疗技能4”，而系统只有1-3，我建议改为 recover_skill3 或者确认是否漏了定义。
		// 这里我先写成 recover_skill3 并备注，或者如果你有自定义逻辑则保留。
		// 为了代码可运行，我将其改为 recover_skill3 (最强群体治疗之外的单体? 不，recover1是单体。recover_skill3是全体100%。)
		// 既然你指定了4，而库里没有，这可能是一个笔误，或者是未展示的skill。
		// 暂时改为 recover_skill3 (全体100%) 作为替代，或者你可以手动添加。
		skills: ['recover1', 'recover_skill3'], 
		template: 'balanced', // 治疗默认均衡
		rank: "rare",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_024yuetong: {
		name: "岳瞳",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack11', 'attack_skill17'], // 攻击普攻15, 攻击技能36
		template: 'balanced', // 均衡
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_053qiuer: {
		name: "秋儿",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill27'], // 攻击普攻14, 攻击技能34
		template: 'defense', // 偏防
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_054yueer: {
		name: "悦儿",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill22'], // 攻击普攻14, 攻击技能37
		template: 'balanced', // 均衡
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_055zhengyan: {
		name: "郑琰",
		group: "YB_memory",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill20'], // 攻击普攻14, 攻击技能35
		template: 'balanced', // 均衡
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_012zhengjiayi: {
		name: "郑佳怡",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack11', 'attack_skill17'], // 攻击普攻15, 攻击技能36
		template: 'damger', // 偏攻
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_037diamondqueen: {
		name: "方块公主",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill27'], // 攻击普攻14, 攻击技能34
		template: 'defense', // 偏防
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_044huruihang: {
		name: "胡瑞航",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill22'], // 攻击普攻14, 攻击技能37
		template: 'balanced', // 均衡
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_121tujing: {
		name: "涂静",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['recover1', 'recover_skill4'], // 同样，recover_skill4不存在，改为recover_skill3
		skills: ['recover1', 'recover_skill3'],
		template: 'balanced', // 治疗默认均衡
		rank: "rare",
		tip: 'recover',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_122wangbingyu: {
		name: "王冰雨",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack11', 'attack_skill20'], // 攻击普攻15, 攻击技能35
		template: 'balanced', // 均衡
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
	ybsl_123xuelang: {
		name: "雪琅",
		group: "YB_dream",
		sex: "female",
		tupolevel: 0,
		skills: ['attack10', 'attack_skill27'], // 攻击普攻14, 攻击技能34
		template: 'defense', // 偏防
		rank: "rare",
		tip: 'damage',
		ties:[],//预留接口，一并粘贴
		tupoList:[],//预留接口，一并粘贴
	},
};

const characterTemplate = {
	damger: {
		kami:{ hp: 896, atk: 200, def: 42, spe: 160 },
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
}
/*
所有治疗默认为均衡系，且带有治疗系的标签
否则均为伤害系，根据偏攻，偏防，均衡分类

涂山小红 传说 偏攻 攻击普攻2 攻击技能2
鞠熒 传说 偏攻 攻击普攻1 攻击技能1
彡 传说 偏攻 攻击普攻1 攻击技能2
慕琴 传说 均衡 攻击普攻4 攻击技能4
王婉儿 传说 治疗 治疗普攻 治疗技能1

王海茹 史诗 治疗 治疗普攻 治疗技能2
满城柒 史诗 偏攻 攻击普攻7 攻击技能8
张晴 史诗 均衡 攻击普攻6 攻击技能7
周靈 史诗 均衡 攻击普攻5 攻击技能17
李曉 史诗 偏攻 攻击普攻5 攻击技能20
清月姑娘 史诗 均衡 攻击普攻8 攻击技能9
吕艳秋 史诗 偏攻 攻击普攻9 攻击技能9
小慧 史诗 偏攻 攻击普攻5 攻击技能7
卞秋雯 史诗 偏防 攻击普攻5 攻击技能6
蛇妃 史诗 偏攻 攻击普攻5 攻击技能19

史庆宇 伪史诗 治疗 治疗普攻 治疗技能3
贾雨桐 伪史诗 偏防 攻击普攻5 攻击技能13
王贺 伪史诗 偏防 攻击普攻8 攻击技能33
蘋姉 伪史诗 偏攻 攻击普攻5 攻击技能22
房佳谕 伪史诗 均衡 攻击普攻5 攻击技能22
江雪舞 伪史诗 均衡 攻击普攻5 攻击技能18
宋橤 伪史诗 偏防 攻击普攻5 攻击技能13
刘天杭 伪史诗 均衡 攻击普攻5 攻击技能14
小新 伪史诗 均衡 攻击普攻5 攻击技能11

盛妍 稀有 偏防 攻击普攻14 攻击技能34
高聪 稀有 治疗 治疗普攻 治疗技能4 
岳瞳 稀有 均衡 攻击普攻15 攻击技能36
秋儿 稀有 偏防 攻击普攻14 攻击技能34
悦儿 稀有 均衡 攻击普攻14 攻击技能37
郑琰 稀有 均衡 攻击普攻14 攻击技能35


吴爽 传说 偏攻 攻击普攻3 攻击技能3
朱焌 传说 偏防 攻击普攻1 攻击技能2
涂山水璃 传说 偏攻 攻击普攻1 攻击技能2
吴雨欣 传说 均衡 攻击普攻1 攻击技能3
陈爱琳 传说 治疗 治疗普攻 治疗技能1

香紫姑娘 史诗 治疗 治疗普攻 治疗技能2
孙丽松 史诗 偏攻 攻击普攻7 攻击技能8
王汉桢 史诗 均衡 攻击普攻6 攻击技能7
李玉珊 史诗 偏防 攻击普攻5 攻击技能6
周玥 史诗 均衡 攻击普攻5 攻击技能7
尹超跃 史诗 偏攻 攻击普攻5 攻击技能6
幻晴 史诗 均衡 攻击普攻5 攻击技能17
熙 史诗 偏攻 攻击普攻9 攻击技能9
玉蝶心 史诗 偏防 攻击普攻5 攻击技能6
小筑 史诗 偏攻 攻击普攻8 攻击技能9

闫爽 伪史诗 治疗 治疗普攻 治疗技能3
张玉洁 伪史诗 偏攻 攻击普攻5 攻击技能22
王若冰 伪史诗 均衡 攻击普攻5 攻击技能22
吴格格 伪史诗 均衡 攻击普攻5 攻击技能18
高宇航 伪史诗 均衡 攻击普攻5 攻击技能11
张汨 伪史诗 偏攻 攻击普攻5 攻击技能16
蚕 伪史诗 偏防 攻击普攻8 攻击技能33
雨 伪史诗 偏防 攻击普攻8 攻击技能13
黎 伪史诗 均衡 攻击普攻5 攻击技能14

郑佳怡 稀有 偏攻 攻击普攻15 攻击技能36
方块公主 稀有 偏防 攻击普攻14 攻击技能34
胡瑞航 稀有 均衡 攻击普攻14 攻击技能37
涂静 稀有 治疗 治疗普攻 治疗技能4
王冰雨 稀有 均衡 攻击普攻15 攻击技能35
雪琅 稀有 偏防 攻击普攻14 攻击技能34





*/
/**

		group:'YB_memory',//阵营
		hp:1120,//血量
		atk:160,//攻击力
		def:53,//防御力
		spe:160,//速度
		skills:[],//第一个元素是普攻，第二个元素是技能，第三个元素是终极技能（需依靠培养解锁）
		rank:'legend',//评级

	传说级品质武将的四维属性从以下选一组适配
	legend
	{//均衡
		hp:1120,//血量
		atk:160,//攻击力
		def:53,//防御力
		spe:160,//速度
	}
	{//偏攻
		hp:896,//血量
		atk:200,//攻击力
		def:42,//防御力
		spe:160,//速度
	}
	{//偏防
		hp:1400,//血量
		atk:128,//攻击力
		def:66,//防御力
		spe:160,//速度
	}
    
	史诗级以下选一组适配
	epic
	{//均衡
		hp:1050,//血量
		atk:150,//攻击力
		def:50,//防御力
		spe:150,//速度
	}
	{//偏攻
		hp:840,//血量
		atk:187,//攻击力
		def:40,//防御力
		spe:150,//速度
	}
	{//偏防
		hp:1312,//血量
		atk:120,//攻击力
		def:62,//防御力
		spe:150,//速度
	}

	//次等史诗
	//未实装
	{//均衡
		hp:840,//血量
		atk:120,//攻击力
		def:40,//防御力
		spe:120,//速度
	}
	{//偏攻
		hp:672,//血量
		atk:150,//攻击力
		def:32,//防御力
		spe:120,//速度
	}
	{//偏防
		hp:1050,//血量
		atk:96,//攻击力
		def:50,//防御力
		spe:120,//速度
	}


	精品
	rare
	{//均衡
		hp:700,//血量
		atk:100,//攻击力
		def:33,//防御力
		spe:100,//速度
	}
	{//偏攻
		hp:560,//血量
		atk:125,//攻击力
		def:26,//防御力
		spe:100,//速度
	}
	{//偏防
		hp:875,//血量
		atk:80,//攻击力
		def:41,//防御力
		spe:100,//速度
	}
    

	普通
	common
	{//均衡
		hp:336,//血量
		atk:75,//攻击力
		def:16,//防御力
		spe:60,//速度
	}
	{//偏防
		hp:420,//血量
		atk:60,//攻击力
		def:20,//防御力
		spe:60,//速度
	}

    
	废材
	junk
	{//均衡
		hp:168,//血量
		atk:37,//攻击力
		def:8,//防御力
		spe:30,//速度
	}
	{//偏防
		hp:210,//血量
		atk:30,//攻击力
		def:10,//防御力
		spe:30,//速度
	}


 */

// const characterTemplate = {
// 	damger: {
// 		kami:{
// 			hp: 896,//血量
// 			atk: 200,//攻击力
// 			def: 42,//防御力
// 			spe: 160,//速度
// 		},
// 		legend: {
// 			hp: 896,//血量
// 			atk: 200,//攻击力
// 			def: 42,//防御力
// 			spe: 160,//速度
// 		},
// 		epic: {
// 			hp: 840,//血量
// 			atk: 187,//攻击力
// 			def: 40,//防御力
// 			spe: 150,//速度
// 		},
// 		epicfake: {
// 			hp: 672,//血量
// 			atk: 150,//攻击力
// 			def: 32,//防御力
// 			spe: 120,//速度
// 		},
// 		rare: {
// 			hp: 560,//血量
// 			atk: 125,//攻击力
// 			def: 26,//防御力
// 			spe: 100,//速度
// 		},
// 	},
// 	defense: {
// 		kami: {
// 			hp: 1400,//血量
// 			atk: 128,//攻击力
// 			def: 66,//防御力
// 			spe: 160,//速度
// 		},
// 		legend: {
// 			hp: 1400,//血量
// 			atk: 128,//攻击力
// 			def: 66,//防御力
// 			spe: 160,//速度
// 		},
// 		epic: {
// 			hp: 1312,//血量
// 			atk: 120,//攻击力
// 			def: 62,//防御力
// 			spe: 150,//速度
// 		},
// 		epicfake: {
// 			hp: 1050,//血量
// 			atk: 96,//攻击力
// 			def: 50,//防御力
// 			spe: 120,//速度
// 		},
// 		rare: {
// 			hp: 875,//血量
// 			atk: 80,//攻击力
// 			def: 41,//防御力
// 			spe: 100,//速度
// 		},
// 		common: {
// 			hp: 420,//血量
// 			atk: 60,//攻击力
// 			def: 20,//防御力
// 			spe: 60,//速度
// 		},
// 		junk: {
// 			hp: 210,//血量
// 			atk: 30,//攻击力
// 			def: 10,//防御力
// 			spe: 30,//速度
// 		},
// 	},
// 	balanced: {
// 		kami: {
// 			hp: 1120,//血量
// 			atk: 160,//攻击力
// 			def: 53,//防御力
// 			spe: 160,//速度
// 		},
// 		legend: {
// 			hp: 1120,//血量
// 			atk: 160,//攻击力
// 			def: 53,//防御力
// 			spe: 160,//速度
// 		},
// 		epic: {
// 			hp: 1050,//血量
// 			atk: 150,//攻击力
// 			def: 50,//防御力
// 			spe: 150,//速度
// 		},
// 		epicfake: {
// 			hp: 840,//血量
// 			atk: 120,//攻击力
// 			def: 40,//防御力
// 			spe: 120,//速度
// 		},
// 		rare: {
// 			hp: 700,//血量
// 			atk: 100,//攻击力
// 			def: 33,//防御力
// 			spe: 100,//速度
// 		},
// 		common: {
// 			hp: 336,//血量
// 			atk: 75,//攻击力
// 			def: 16,//防御力
// 			spe: 60,//速度
// 		},
// 		junk: {
// 			hp: 168,//血量
// 			atk: 37,//攻击力
// 			def: 8,//防御力
// 			spe: 30,//速度
// 		},
// 	},
// }