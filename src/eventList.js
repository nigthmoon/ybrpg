const SPeventList = {
	spEvent1: {
		name: '主角升阶秘境',
		difficulty: 'normal',
		procedure: [
			'sp1-1', 'sp1-2', 'sp1-3', 'sp1-4', 'sp1-5',
			'sp1-6', 'sp1-7', 'sp1-8', 'sp1-9', 'sp1-10',
			'sp1-11', 'sp1-12', 'sp1-13', 'sp1-14', 'sp1-15',
			'sp1-16', 'sp1-17', 'sp1-18', 'sp1-19', 'sp1-20',
		],
		eventPack: {
			// ===== 第1阶段：突破0→4，敌人突破4 =====
			'sp1-1': {
				name: '1阶秘境',
				id: 'sp1-1',
				type: 'battle',
				text: '通过本关会令主角突破至1阶',
				prev: null,
				gold: 300,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 5, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 5, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 5, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-2': {
				name: '2阶秘境',
				id: 'sp1-2',
				type: 'battle',
				text: '通过本关会令主角突破至2阶',
				prev: 'sp1-1',
				gold: 500,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 10, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 10, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 10, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-3': {
				name: '3阶秘境',
				id: 'sp1-3',
				type: 'battle',
				text: '通过本关会令主角突破至3阶',
				prev: 'sp1-2',
				gold: 700,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 15, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 15, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 15, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-4': {
				name: '4阶秘境',
				id: 'sp1-4',
				type: 'battle',
				text: '通过本关会令主角突破至4阶',
				prev: 'sp1-3',
				gold: 1000,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 20, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 20, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 20, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{}
				],
			},

			// ===== 第2阶段：突破4→8，敌人突破8 =====
			'sp1-5': {
				name: '5阶秘境',
				id: 'sp1-5',
				type: 'battle',
				text: '通过本关会令主角突破至5阶',
				prev: 'sp1-4',
				gold: 1500,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 25, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 25, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 25, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-6': {
				name: '6阶秘境',
				id: 'sp1-6',
				type: 'battle',
				text: '通过本关会令主角突破至6阶',
				prev: 'sp1-5',
				gold: 1750,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 30, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 30, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 30, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-7': {
				name: '7阶秘境',
				id: 'sp1-7',
				type: 'battle',
				text: '通过本关会令主角突破至7阶',
				prev: 'sp1-6',
				gold: 2000,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 35, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 35, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 35, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-8': {
				name: '8阶秘境',
				id: 'sp1-8',
				type: 'battle',
				text: '通过本关会令主角突破至8阶',
				prev: 'sp1-7',
				gold: 2200,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 40, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 40, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 40, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},

			// ===== 第3阶段：突破8→12，敌人突破12 =====
			'sp1-9': {
				name: '9阶秘境',
				id: 'sp1-9',
				type: 'battle',
				text: '通过本关会令主角突破至9阶',
				prev: 'sp1-8',
				gold: 2800,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 45, tupolevel: 12, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 45, tupolevel: 12, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 45, tupolevel: 12, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-10': {
				name: '10阶秘境',
				id: 'sp1-10',
				type: 'battle',
				text: '通过本关会令主角突破至10阶',
				prev: 'sp1-9',
				gold: 3300,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 50, tupolevel: 12, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 50, tupolevel: 12, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 50, tupolevel: 12, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},
			'sp1-11': {
				name: '11阶秘境',
				id: 'sp1-11',
				type: 'battle',
				text: '通过本关会令主角突破至11阶',
				prev: 'sp1-10',
				gold: 3800,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 55, tupolevel: 12, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 55, tupolevel: 12, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 55, tupolevel: 12, rank: 'epic', template: 'defense', buff: [] },
					{}
				]
			},
			'sp1-12': {
				name: '12阶秘境',
				id: 'sp1-12',
				type: 'battle',
				text: '通过本关会令主角突破至12阶',
				prev: 'sp1-11',
				gold: 4300,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 60, tupolevel: 12, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 60, tupolevel: 12, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 60, tupolevel: 12, rank: 'epic', template: 'defense', buff: [] },
					{}
				]
			},

			// ===== 第4阶段：突破12→16，敌人突破16 =====
			'sp1-13': {
				name: '13阶秘境',
				id: 'sp1-13',
				type: 'battle',
				text: '通过本关会令主角突破至13阶',
				prev: 'sp1-12',
				gold: 5500,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 70, tupolevel: 16, rank: 'legend', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 70, tupolevel: 16, rank: 'legend', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 70, tupolevel: 16, rank: 'legend', template: 'defense', buff: [] },
					{}
				]
			},
			'sp1-14': {
				name: '14阶秘境',
				id: 'sp1-14',
				type: 'battle',
				text: '通过本关会令主角突破至14阶',
				prev: 'sp1-13',
				gold: 6700,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 80, tupolevel: 16, rank: 'legend', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 80, tupolevel: 16, rank: 'legend', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 80, tupolevel: 16, rank: 'legend', template: 'defense', buff: [] },
					{}
				]
			},
			'sp1-15': {
				name: '15阶秘境',
				id: 'sp1-15',
				type: 'battle',
				text: '通过本关会令主角突破至15阶',
				prev: 'sp1-14',
				gold: 7900,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 90, tupolevel: 16, rank: 'legend', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 90, tupolevel: 16, rank: 'legend', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 90, tupolevel: 16, rank: 'legend', template: 'defense', buff: [] },
					{}
				]
			},
			'sp1-16': {
				name: '16阶秘境',
				id: 'sp1-16',
				type: 'battle',
				text: '通过本关会令主角突破至16阶',
				prev: 'sp1-15',
				gold: 9000,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 100, tupolevel: 16, rank: 'legend', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 100, tupolevel: 16, rank: 'legend', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 100, tupolevel: 16, rank: 'legend', template: 'defense', buff: [] },
					{}
				]
			},

			// ===== 第5阶段：突破16→20，敌人突破20 =====
			// ===== 第5阶段：突破16→20，敌人突破20 =====
			'sp1-17': {
				name: '17阶秘境',
				id: 'sp1-17',
				type: 'battle',
				text: '通过本关会令主角突破至17阶',
				prev: 'sp1-16',
				gold: 20000,
				enemy: [
					{ name: '李曉', id: 'ybsl_059starsFall4', level: 120, tupolevel: 20, buff: [] },
					{ name: '周靈', id: 'ybsl_059starsFall3', level: 120, tupolevel: 20, buff: [] },
					{ name: '宋橤', id: 'ybsl_059starsFall2', level: 120, tupolevel: 20, buff: [] },
					{ name: '清月姑娘', id: 'ybsl_068qingyue', level: 120, tupolevel: 20, buff: [] },
					{ name: '鞠熒', id: 'ybsl_059starsFall1', level: 120, tupolevel: 20, buff: [] },
					{ name: '香紫姑娘', id: 'ybsl_069xiangzi', level: 120, tupolevel: 20, buff: [] },
				]
			},
			'sp1-18': {
				name: '18阶秘境',
				id: 'sp1-18',
				type: 'battle',
				text: '通过本关会令主角突破至18阶',
				prev: 'sp1-17',
				gold: 40000,
				enemy: [
					{ name: '小慧', id: 'ybsl_033xiaohui', level: 140, tupolevel: 20, buff: [] },
					{ name: '幻晴', id: 'ybsl_018huanqing', level: 140, tupolevel: 20, buff: [] },
					{ name: '张晴', id: 'ybsl_018zhangqing', level: 140, tupolevel: 20, buff: [] },
					{ name: '涂山小红', id: 'ybsl_017xiaohong', level: 140, tupolevel: 20, buff: [] },
					{ name: '王海茹', id: 'ybsl_015wanghairu', level: 140, tupolevel: 20, buff: [] },
					{ name: '满城柒', id: 'ybsl_016manchengqi', level: 140, tupolevel: 20, buff: [] },
				]
			},
			'sp1-19': {
				name: '19阶秘境',
				id: 'sp1-19',
				type: 'battle',
				text: '通过本关会令主角突破至19阶',
				prev: 'sp1-18',
				gold: 60000,
				enemy: [
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 160, tupolevel: 20, buff: [] },
					{ name: '周玥', id: 'ybsl_010zhouyue', level: 160, tupolevel: 20, buff: [] },
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 160, tupolevel: 20, buff: [] },
					{ name: '陈爱琳', id: 'ybsl_002chenailin', level: 160, tupolevel: 20, buff: [] },
					{ name: '吴雨欣', id: 'ybsl_008wuyuxin', level: 160, tupolevel: 20, buff: [] },
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 160, tupolevel: 20, buff: [] },
				]
			},
			'sp1-20': {
				name: '20阶秘境',
				id: 'sp1-20',
				type: 'battle',
				text: '通过本关会令主角突破至20阶',
				prev: 'sp1-19',
				gold: 80000,
				enemy: [
					{ name: '尹超跃', id: 'ybsl_013yinji', level: 180, tupolevel: 20, buff: [] },
					{ name: '玉蝶心', id: 'ybsl_092handan', level: 180, tupolevel: 20, buff: [] },
					{ name: '陈爱琳', id: 'ybsl_002chenailin', level: 180, tupolevel: 20, buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 180, tupolevel: 20, buff: [] },
					{ name: '王汉桢', id: 'ybsl_006wanghanzhen', level: 180, tupolevel: 20, buff: [] },
					{ name: '孙丽松', id: 'ybsl_001sunlisong', level: 180, tupolevel: 20, buff: [] },
				]
			},
		}
	},
	spEvent2: {
		name: '主角蜕变秘境',
		difficulty: 'hard',
		procedure: [
			// 'sp2-1', 
			'sp2-2', 'sp2-3', 'sp2-4', 'sp2-5','sp2-6'
		],
		eventPack:{
			'sp2-1': {
				name: '平凡试炼',
				id: 'sp2-1',
				type: 'battle',
				text: '通过本关会令主角升品至精品',
				prev: 'sp1-1',
				gold : 900,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying',  level: 1, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },{}, 
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 1, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },{}, 
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 1, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: []}, {}
				],
			},
			'sp2-2': {
				name: '精英试炼',
				id: 'sp2-2',
				type: 'battle',
				text: '通过本关会令主角升品至稀有',
				prev: 'sp1-2',
				gold: 1200,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 20, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 20, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 20, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{}
				],
			},
			'sp2-3': {
				name: '史诗试炼',
				id: 'sp2-3',
				type: 'battle',
				text: '通过本关会令主角升品至史诗',
				prev: 'sp1-4',
				gold: 2400,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 40, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 40, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 40, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{}
				],
			},
			'sp2-4': {
				name: '真史诗试炼',
				id: 'sp2-4',
				type: 'battle',
				text: '通过本关会令主角升品为真史诗',
				prev: 'sp1-8',
				gold: 4800,
				enemy: [
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 60, tupolevel: 12, rank: 'epic', template: 'balanced', buff: [] },
					{},
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 60, tupolevel: 12, rank: 'epic', template: 'damger', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 60, tupolevel: 12, rank: 'epic', template: 'defense', buff: [] },
					{}
				]
			},
			'sp2-5': {
				name: '传说试炼',
				id: 'sp2-5',
				type: 'battle',
				text: '通过本关会令主角升品为传说',
				prev: 'sp1-12',
				gold: 9600,
				enemy: [
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 80, tupolevel: 16, rank: 'legend', template: 'damger', buff: [] },
					{},
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 80, tupolevel: 16, rank: 'legend', template: 'balanced', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 80, tupolevel: 16, rank: 'legend', template: 'defense', buff: [] },
					{}
				]
			},
			'sp2-6': {
				name: '真神秘境',
				id: 'sp2-6',
				type: 'battle',
				text: '通过本关会令主角升品为神品',
				prev: 'sp1-16',
				gold: 19200,
				enemy: [
					{ name: '风魔狼', id: 'ybsl_fengmolang', level: 120, tupolevel: 20, rank: 'kami', template: 'damger', buff: [] },
					{},
					{ name: '雷魔鹰', id: 'ybsl_leimoying', level: 120, tupolevel: 20, rank: 'kami', template: 'balanced', buff: [] },
					{},
					{ name: '魇魔花', id: 'ybsl_yanmohua', level: 120, tupolevel: 20, rank: 'kami', template: 'defense', buff: [] },
					{}
				]
			},
		},
	},
};
const eventList = {//事件列表
	// ===== 敌人位置映射说明 =====
	// 玩家视角敌人阵地布局:
	//	 [5] [4] [3]  <- 后排 (或上方)
	//	 [2] [1] [0]  <- 前排 (或下方)
	// 数组索引对应:
	//	 [0] -> 位置1 (左前)
	//	 [1] -> 位置2 (中前)
	//	 [2] -> 位置3 (右前)
	//	 [3] -> 位置4 (左后)
	//	 [4] -> 位置5 (中后)
	//	 [5] -> 位置6 (右后)
	// 空对象 {} 代表该位置无敌人
	// 注意: 普通难度敌人使用初始值(无skills)，困难/地狱难度数值递增

	// ========== 第一章：神秘教会 ==========
	// 敌人布阵规则：
	// - 除第1小节外，每小节3名敌人放在 1/3/5 号位（数组索引 0/2/4）
	// - boss 关：boss 固定 5 号位（索引 4）
	// - 杂兵用稀有(rare)角色顶皮套登场（配置里的 name 即临时命名）
	// 章节 boss：c1-1 雪琅（单人）、c1-5 张玉洁、c1-10 吴爽（雪琅/张玉洁/吴爽 依次站 1/3/5 号位）
	chapter1: {
		name: '第一章：神秘教会',
		difficulty: 'normal',
		procedure: [
			'c1-1', 'c1-2', 'c1-3', 'c1-4', 'c1-5',
			'c1-6', 'c1-7', 'c1-8', 'c1-9', 'c1-10'
		],
		eventPack: {
			// --- 第1小节：单个雪琅（5号位，索引4） ---
			'c1-1': {
				name: '雪夜的不速之客',
				id: 'c1-1',
				type: 'battle',
				text: '风雪中，一名白衣少女拦住了你的去路。她自称来自「教会」...',
				prev: null,
				enemy: [
					{}, {}, {}, {},
					{ name: '雪琅', id: 'ybsl_123xuelang', level: 1, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{}
				],
			},
			'c1-2': {
				name: '教会的耳目',
				id: 'c1-2',
				type: 'battle',
				text: '雪琅退走后，教会的眼线很快盯上了你...',
				prev: 'c1-1',
				enemy: [
					{ name: '教会信徒', id: 'ybsl_019shengyan', level: 1, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '唱诗班修女', id: 'ybsl_045gaocong', level: 1, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					{ name: '持烛者', id: 'ybsl_024yuetong', level: 1, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{}
				],
			},
			'c1-3': {
				name: '深巷堵截',
				id: 'c1-3',
				type: 'battle',
				text: '狭窄的巷子两头被堵死了，只能杀出一条路...',
				prev: 'c1-2',
				enemy: [
					{ name: '守门人', id: 'ybsl_053qiuer', level: 2, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{},
					{ name: '狂信者', id: 'ybsl_054yueer', level: 2, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					{ name: '灰袍见习生', id: 'ybsl_055zhengyan', level: 2, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{}
				],
			},
			'c1-4': {
				name: '礼拜堂外围',
				id: 'c1-4',
				type: 'battle',
				text: '教会礼拜堂近在眼前，守卫却比想象中森严...',
				prev: 'c1-3',
				enemy: [
					{ name: '苦修士', id: 'ybsl_012zhengjiayi', level: 3, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{},
					{ name: '圣殿侍卫', id: 'ybsl_037diamondqueen', level: 3, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '黑袍执事', id: 'ybsl_019shengyan', level: 3, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{}
				],
			},

			// --- 第5小节 BOSS：张玉洁（5号位，索引4） ---
			'c1-5': {
				name: 'BOSS·执刑者张玉洁',
				id: 'c1-5',
				type: 'boss',
				text: '礼拜堂深处，执刑者张玉洁缓缓起身：「不请自来者，接受裁决吧。」',
				prev: 'c1-4',
				enemy: [
					{ name: '祭坛护卫', id: 'ybsl_121tujing', level: 3, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '祷告修女', id: 'ybsl_122wangbingyu', level: 3, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{},
					{ name: '张玉洁', id: 'ybsl_004zhangyujie', level: 4, tupolevel: 0, rank: 'epicfake', template: 'balanced', buff: [] },
					{}
				],
			},
			'c1-6': {
				name: '地下回廊',
				id: 'c1-6',
				type: 'battle',
				text: '击败张玉洁后，你循着密道深入教会地下...',
				prev: 'c1-5',
				enemy: [
					{ name: '忏悔者', id: 'ybsl_024yuetong', level: 4, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '香炉侍者', id: 'ybsl_053qiuer', level: 4, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					{ name: '执灯修士', id: 'ybsl_019shengyan', level: 4, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{}
				],
			},

			// --- 7~9关: 3名稀有敌人（1/3/5号位，索引 0/2/4） ---
			'c1-7': {
				name: '回廊伏击',
				id: 'c1-7',
				type: 'battle',
				text: '幽暗的回廊里杀机四伏，教会的死士早已在此设伏...',
				prev: 'c1-6',
				enemy: [
					{ name: '守夜人', id: 'ybsl_054yueer', level: 5, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					{ name: '巡游祭司', id: 'ybsl_055zhengyan', level: 5, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '持盾修士', id: 'ybsl_053qiuer', level: 5, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{}
				],
			},
			'c1-8': {
				name: '圣堂守卫',
				id: 'c1-8',
				type: 'battle',
				text: '逼近圣堂核心，守卫的实力又上了一层台阶...',
				prev: 'c1-7',
				enemy: [
					{ name: '圣咏者', id: 'ybsl_012zhengjiayi', level: 6, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '烛光侍女', id: 'ybsl_122wangbingyu', level: 6, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					{ name: '密令信使', id: 'ybsl_121tujing', level: 6, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{}
				],
			},
			'c1-9': {
				name: '审判前夜',
				id: 'c1-9',
				type: 'battle',
				text: '审判将至，最后的阻挡者倾巢而出，只为拖延你的脚步...',
				prev: 'c1-8',
				enemy: [
					{ name: '黑纱修女', id: 'ybsl_045gaocong', level: 7, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					{ name: '银甲卫', id: 'ybsl_037diamondqueen', level: 7, tupolevel: 0, rank: 'rare', template: 'balanced', buff: [] },
					{},
					{ name: '泪痕信徒', id: 'ybsl_019shengyan', level: 7, tupolevel: 0, rank: 'rare', template: 'defense', buff: [] },
					{}
				],
			},

			// --- 第10小节 BOSS：雪琅(1号位)、张玉洁(3号位)、吴爽(5号位/BOSS，索引 0/2/4) ---
			'c1-10': {
				name: 'BOSS·教廷三方审判',
				id: 'c1-10',
				type: 'boss',
				text: '圣堂之巅，雪琅、张玉洁与传说中的吴爽同时现身：「踏入此地者，当受三方审判。」',
				prev: 'c1-9',
				enemy: [
					// 雪琅（1号位，索引0）
					{ name: '雪琅', id: 'ybsl_123xuelang', level: 8, tupolevel: 0, rank: 'rare', template: 'damger', buff: [] },
					{},
					// 张玉洁（3号位，索引2）
					{ name: '张玉洁', id: 'ybsl_004zhangyujie', level: 10, tupolevel: 0, rank: 'epicfake', template: 'balanced', buff: [] },
					{},
					// 吴爽（5号位/BOSS，索引4）
					{ name: '吴爽', id: 'ybsl_048wushuang', level: 12, tupolevel: 0, rank: 'legend', template: 'balanced', buff: [] },
					{}
				],
			},
		}
	},

	// ========== 第二章：雪国学院篇·上 ==========
	// 敌人阵容：每小节 6 人（填满 6 个位置）
	// 第 2、5 小节为小 BOSS，第 10 小节为大 BOSS
	// 默认突破等级 tupolevel = 2；等级随小节递进（Lv.3 → Lv.16）
	// 主力角色：高宇航/周玥/吴雨欣/李玉珊/王若冰/吴格格/闫爽/郑佳怡（尽可能全部登场）
	chapter2: {
		name: '第二章：雪国学院篇·上',
		difficulty: 'normal',
		procedure: [
			'c2-1', 'c2-2', 'c2-3', 'c2-4', 'c2-5',
			'c2-6', 'c2-7', 'c2-8', 'c2-9', 'c2-10'
		],
		eventPack: {
			// --- 1~9关: 4名稀有敌人 ---
			'c2-1': {
				name: '入学测验',
				id: 'c2-1',
				type: 'battle',
				text: '踏进雪国学院的第一道门槛，便是这群拦路的学员...',
				prev: null,
				enemy: [
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 3, tupolevel: 2, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '闫爽', id: 'ybsl_003yanshuang', level: 3, tupolevel: 2, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 3, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 3, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 3, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 3, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			'c2-2': {
				name: '小BOSS·学生会会长周玥',
				id: 'c2-2',
				type: 'boss',
				text: '学生会长周玥挡在阶前：「想通过？先胜过我。」',
				prev: 'c2-1',
				enemy: [
					{ name: '周玥', id: 'ybsl_010zhouyue', level: 5, tupolevel: 2, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 5, tupolevel: 2, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 5, tupolevel: 2, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 5, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 5, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '巡逻队员', id: 'ybsl_055zhengyan', level: 5, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			'c2-3': {
				name: '学院后山',
				id: 'c2-3',
				type: 'battle',
				text: '后山的试炼场里，守卫倾巢而出...',
				prev: 'c2-2',
				enemy: [
					{ name: '李玉珊', id: 'ybsl_009liyushan', level: 6, tupolevel: 2, rank: 'epic', template: 'defense', buff: [] },
					{ name: '学院医师', id: 'ybsl_037diamondqueen', level: 6, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_024yuetong', level: 6, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '雪原猎手', id: 'ybsl_121tujing', level: 6, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '低年级生', id: 'ybsl_122wangbingyu', level: 6, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '高年级生', id: 'ybsl_123xuelang', level: 6, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			'c2-4': {
				name: '风纪巡查',
				id: 'c2-4',
				type: 'battle',
				text: '风纪队循着踪迹追来，态度强硬...',
				prev: 'c2-3',
				enemy: [
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 7, tupolevel: 2, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '闫爽', id: 'ybsl_003yanshuang', level: 7, tupolevel: 2, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 7, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 7, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 7, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] },
					{ name: '巡逻队员', id: 'ybsl_055zhengyan', level: 7, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			'c2-5': {
				name: '小BOSS·剑道导师李玉珊',
				id: 'c2-5',
				type: 'boss',
				text: '剑道导师李玉珊横剑而立：「此路，唯胜者可行。」',
				prev: 'c2-4',
				enemy: [
					{ name: '李玉珊', id: 'ybsl_009liyushan', level: 9, tupolevel: 2, rank: 'epic', template: 'defense', buff: [] },
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 9, tupolevel: 2, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 9, tupolevel: 2, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 9, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 9, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_019shengyan', level: 9, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			'c2-6': {
				name: '图书馆骚动',
				id: 'c2-6',
				type: 'battle',
				text: '图书馆深处传来异响，埋伏者一拥而上...',
				prev: 'c2-5',
				enemy: [
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 10, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院医师', id: 'ybsl_037diamondqueen', level: 10, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '雪原猎手', id: 'ybsl_121tujing', level: 10, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '低年级生', id: 'ybsl_122wangbingyu', level: 10, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '高年级生', id: 'ybsl_123xuelang', level: 10, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 10, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			'c2-7': {
				name: '冰封回廊',
				id: 'c2-7',
				type: 'battle',
				text: '回廊结满寒霜，冰系学员封锁了去路...',
				prev: 'c2-6',
				enemy: [
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 11, tupolevel: 2, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 11, tupolevel: 2, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 11, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 11, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] },
					{ name: '巡逻队员', id: 'ybsl_055zhengyan', level: 11, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 11, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			'c2-8': {
				name: '社团冲突',
				id: 'c2-8',
				type: 'battle',
				text: '两大学生社团爆发冲突，你被卷了进来...',
				prev: 'c2-7',
				enemy: [
					{ name: '闫爽', id: 'ybsl_003yanshuang', level: 12, tupolevel: 2, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 12, tupolevel: 2, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 12, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_122wangbingyu', level: 12, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院医师', id: 'ybsl_037diamondqueen', level: 12, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '雪原猎手', id: 'ybsl_121tujing', level: 12, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			'c2-9': {
				name: '学院祭前夜',
				id: 'c2-9',
				type: 'battle',
				text: '学院祭前夜，群聚的学员将你团团围住...',
				prev: 'c2-8',
				enemy: [
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 13, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '高年级生', id: 'ybsl_123xuelang', level: 13, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '低年级生', id: 'ybsl_122wangbingyu', level: 13, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 13, tupolevel: 2, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 13, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 13, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] }
				],
			},

			// --- 第10小节 大BOSS：吴雨欣（legend） ---
			'c2-10': {
				name: '大BOSS·学院首席吴雨欣',
				id: 'c2-10',
				type: 'boss',
				text: '学院首席吴雨欣立于高台：「能通过此战，方算真正的雪国学院之人。」',
				prev: 'c2-9',
				enemy: [
					{ name: '吴雨欣', id: 'ybsl_008wuyuxin', level: 16, tupolevel: 2, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '周玥', id: 'ybsl_010zhouyue', level: 16, tupolevel: 2, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '李玉珊', id: 'ybsl_009liyushan', level: 16, tupolevel: 2, rank: 'epic', template: 'defense', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 16, tupolevel: 2, rank: 'rare', template: 'defense', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 16, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_024yuetong', level: 16, tupolevel: 2, rank: 'rare', template: 'damger', buff: [] }
				],
			},
		}
	},

	// ========== 第三章：雪国学院篇·下 ==========
	// 敌人阵容：每小节 6 人（填满 6 个位置）
	// 第 2、5 小节为小 BOSS，第 10 小节为大 BOSS
	// 默认突破等级 tupolevel = 4；等级随小节递进（Lv.8 → Lv.25）
	// 主力角色同上篇，沿用并强化
	chapter3: {
		name: '第三章：雪国学院篇·下',
		difficulty: 'normal',
		procedure: [
			'c3-1', 'c3-2', 'c3-3', 'c3-4', 'c3-5',
			'c3-6', 'c3-7', 'c3-8', 'c3-9', 'c3-10'
		],
		eventPack: {
			// --- 1~9关: 6名稀有敌人 (塞满) ---
			'c3-1': {
				name: '深冬返校',
				id: 'c3-1',
				type: 'battle',
				text: '雪国学院的下篇拉开帷幕，归校的学员已非吴下阿蒙...',
				prev: null,
				enemy: [
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 8, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '闫爽', id: 'ybsl_003yanshuang', level: 8, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 8, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 8, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 8, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 8, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			'c3-2': {
				name: '小BOSS·学生会会长周玥',
				id: 'c3-2',
				type: 'boss',
				text: '再度相遇，周玥的气势已截然不同：「这次，可没那么好对付了。」',
				prev: 'c3-1',
				enemy: [
					{ name: '周玥', id: 'ybsl_010zhouyue', level: 10, tupolevel: 4, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 10, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 10, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 10, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 10, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '巡逻队员', id: 'ybsl_055zhengyan', level: 10, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			'c3-3': {
				name: '学院后山·夜',
				id: 'c3-3',
				type: 'battle',
				text: '夜幕下的后山试炼场，守卫的实力水涨船高...',
				prev: 'c3-2',
				enemy: [
					{ name: '李玉珊', id: 'ybsl_009liyushan', level: 12, tupolevel: 4, rank: 'epic', template: 'defense', buff: [] },
					{ name: '学院医师', id: 'ybsl_037diamondqueen', level: 12, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_054yueer', level: 12, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '雪原猎手', id: 'ybsl_121tujing', level: 12, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '低年级生', id: 'ybsl_122wangbingyu', level: 12, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '高年级生', id: 'ybsl_123xuelang', level: 12, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			'c3-4': {
				name: '风纪巡查·夜',
				id: 'c3-4',
				type: 'battle',
				text: '夜间巡查的风纪队战力再升，配合默契...',
				prev: 'c3-3',
				enemy: [
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 13, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '闫爽', id: 'ybsl_003yanshuang', level: 13, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 13, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 13, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 13, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] },
					{ name: '巡逻队员', id: 'ybsl_055zhengyan', level: 13, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			'c3-5': {
				name: '小BOSS·剑道导师李玉珊',
				id: 'c3-5',
				type: 'boss',
				text: '李玉珊剑势更盛：「学院的下篇，由我亲自送你过关。」',
				prev: 'c3-4',
				enemy: [
					{ name: '李玉珊', id: 'ybsl_009liyushan', level: 15, tupolevel: 4, rank: 'epic', template: 'defense', buff: [] },
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 15, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 15, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 15, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 15, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_019shengyan', level: 15, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			'c3-6': {
				name: '图书馆骚动·夜',
				id: 'c3-6',
				type: 'battle',
				text: '深夜的图书馆，伏击者比白日更凶悍...',
				prev: 'c3-5',
				enemy: [
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 16, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院医师', id: 'ybsl_037diamondqueen', level: 16, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '雪原猎手', id: 'ybsl_121tujing', level: 16, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '低年级生', id: 'ybsl_122wangbingyu', level: 16, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '高年级生', id: 'ybsl_123xuelang', level: 16, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 16, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			'c3-7': {
				name: '冰封回廊·极',
				id: 'c3-7',
				type: 'battle',
				text: '极寒回廊中，冰系精锐结阵以待...',
				prev: 'c3-6',
				enemy: [
					{ name: '王若冰', id: 'ybsl_005wangruobing', level: 18, tupolevel: 4, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '吴格格', id: 'ybsl_007wugege', level: 18, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 18, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 18, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] },
					{ name: '巡逻队员', id: 'ybsl_055zhengyan', level: 18, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 18, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			'c3-8': {
				name: '社团冲突·总决',
				id: 'c3-8',
				type: 'battle',
				text: '社团总决战，双方精锐悉数上阵...',
				prev: 'c3-7',
				enemy: [
					{ name: '闫爽', id: 'ybsl_003yanshuang', level: 19, tupolevel: 4, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '高宇航', id: 'ybsl_011gaoyuhang', level: 19, tupolevel: 4, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 19, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_045gaocong', level: 19, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院医师', id: 'ybsl_037diamondqueen', level: 19, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '雪原猎手', id: 'ybsl_121tujing', level: 19, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			'c3-9': {
				name: '学院祭前夜·终',
				id: 'c3-9',
				type: 'battle',
				text: '学院祭前夜的最后围堵，学员倾尽所学...',
				prev: 'c3-8',
				enemy: [
					{ name: '郑佳怡', id: 'ybsl_012zhengjiayi', level: 20, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '高年级生', id: 'ybsl_123xuelang', level: 20, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '低年级生', id: 'ybsl_122wangbingyu', level: 20, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '学院卫兵', id: 'ybsl_019shengyan', level: 20, tupolevel: 4, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '风纪委员', id: 'ybsl_045gaocong', level: 20, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '图书管理员', id: 'ybsl_024yuetong', level: 20, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] }
				],
			},

			// --- 第10小节 大BOSS：吴雨欣（legend） ---
			'c3-10': {
				name: '大BOSS·学院首席吴雨欣·极',
				id: 'c3-10',
				type: 'boss',
				text: '学院首席吴雨欣全力出手：「雪国学院的下篇，到此为止——若你接得住。」',
				prev: 'c3-9',
				enemy: [
					{ name: '吴雨欣', id: 'ybsl_008wuyuxin', level: 25, tupolevel: 4, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '周玥', id: 'ybsl_010zhouyue', level: 25, tupolevel: 4, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '李玉珊', id: 'ybsl_009liyushan', level: 25, tupolevel: 4, rank: 'epic', template: 'defense', buff: [] },
					{ name: '学生会干事', id: 'ybsl_053qiuer', level: 25, tupolevel: 4, rank: 'rare', template: 'defense', buff: [] },
					{ name: '冰晶傀儡', id: 'ybsl_054yueer', level: 25, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] },
					{ name: '试炼傀儡', id: 'ybsl_122wangbingyu', level: 25, tupolevel: 4, rank: 'rare', template: 'damger', buff: [] }
				],
			},
		}
	},

	// ========== 第四章：堕魂深渊 ==========
	chapter4: {
		name: '第四章：堕魂深渊',
		difficulty: 'normal',
		procedure: [
			'c4-1', 'c4-2', 'c4-3', 'c4-4', 'c4-5',
			'c4-6', 'c4-7', 'c4-8', 'c4-9', 'c4-10'
		],
		eventPack: {
			// --- 第1小节：深渊前哨（6杂兵，Lv.25） ---
			'c4-1': {
				name: '深渊前哨',
				id: 'c4-1',
				type: 'battle',
				text: '堕魂深渊的入口处，无数被吞噬的怨灵在黑暗中蠢蠢欲动，前哨的爪牙已列阵相候。',
				prev: null,
				enemy: [
					{ name: '堕魂哨兵', id: 'ybsl_019shengyan', level: 25, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '深渊爪牙', id: 'ybsl_024yuetong', level: 25, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '怨灵祭司', id: 'ybsl_045gaocong', level: 25, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 25, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '噬魂者', id: 'ybsl_054yueer', level: 25, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 25, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// --- 第2小节：深渊回响（6杂兵，Lv.27） ---
			'c4-2': {
				name: '深渊回响',
				id: 'c4-2',
				type: 'battle',
				text: '越往深处，怨念越浓。回廊两侧的噬魂之物循声涌来。',
				prev: 'c4-1',
				enemy: [
					{ name: '深渊游魂', id: 'ybsl_037diamondqueen', level: 27, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 27, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '寒霜怨灵', id: 'ybsl_122wangbingyu', level: 27, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '堕魂哨兵', id: 'ybsl_019shengyan', level: 27, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '噬魂者', id: 'ybsl_054yueer', level: 27, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 27, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// --- 第3小节：小BOSS·尹超跃（Lv.29） ---
			'c4-3': {
				name: '裂渊哨岗',
				id: 'c4-3',
				type: 'boss',
				text: '深渊守将尹超跃横身拦路：「想靠近深渊之心？先闯过我这关。」',
				prev: 'c4-2',
				enemy: [
					{ name: '尹超跃', id: 'ybsl_013yinji', level: 29, tupolevel: 6, rank: 'epic', template: 'damger', buff: [] },
					{ name: '深渊爪牙', id: 'ybsl_024yuetong', level: 29, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 29, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '怨灵祭司', id: 'ybsl_045gaocong', level: 29, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 29, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '寒霜怨灵', id: 'ybsl_122wangbingyu', level: 29, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// --- 第4小节：深渊迷雾（6杂兵，Lv.31） ---
			'c4-4': {
				name: '深渊迷雾',
				id: 'c4-4',
				type: 'battle',
				text: '浓雾中杀机四伏，迷失者尽数化作深渊的养分。',
				prev: 'c4-3',
				enemy: [
					{ name: '深渊游魂', id: 'ybsl_037diamondqueen', level: 31, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '堕魂哨兵', id: 'ybsl_019shengyan', level: 31, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '噬魂者', id: 'ybsl_054yueer', level: 31, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 31, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 31, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 31, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// --- 第5小节：魂潮奔涌（6杂兵，Lv.33） ---
			'c4-5': {
				name: '魂潮奔涌',
				id: 'c4-5',
				type: 'battle',
				text: '深渊之心传来搏动，魂潮如洪流般向你卷来。',
				prev: 'c4-4',
				enemy: [
					{ name: '深渊爪牙', id: 'ybsl_024yuetong', level: 33, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '寒霜怨灵', id: 'ybsl_122wangbingyu', level: 33, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '怨灵祭司', id: 'ybsl_045gaocong', level: 33, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 33, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 33, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '深渊游魂', id: 'ybsl_037diamondqueen', level: 33, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// --- 第6小节：小BOSS·孙丽松（Lv.36） ---
			'c4-6': {
				name: '蓝焰炼狱',
				id: 'c4-6',
				type: 'boss',
				text: '孙丽松自魂雾中现身，指尖凝起幽蓝火焰：「这一程，由我送你下坠。」',
				prev: 'c4-5',
				enemy: [
					{ name: '孙丽松', id: 'ybsl_001sunlisong', level: 36, tupolevel: 6, rank: 'epic', template: 'damger', buff: [] },
					{ name: '堕魂哨兵', id: 'ybsl_019shengyan', level: 36, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '噬魂者', id: 'ybsl_054yueer', level: 36, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 36, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 36, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '寒霜怨灵', id: 'ybsl_122wangbingyu', level: 36, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// --- 第7小节：残魂炼狱（6杂兵，Lv.38） ---
			'c4-7': {
				name: '残魂炼狱',
				id: 'c4-7',
				type: 'battle',
				text: '炼狱般的深渊底层，残魂被炼作厮杀的兵器。',
				prev: 'c4-6',
				enemy: [
					{ name: '深渊游魂', id: 'ybsl_037diamondqueen', level: 38, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '深渊爪牙', id: 'ybsl_024yuetong', level: 38, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '怨灵祭司', id: 'ybsl_045gaocong', level: 38, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 38, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 38, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 38, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// --- 第8小节：深渊之喉（6杂兵，Lv.40） ---
			'c4-8': {
				name: '深渊之喉',
				id: 'c4-8',
				type: 'battle',
				text: '逼近深渊之喉，守卫的嘶吼震得魂屑簌簌而落。',
				prev: 'c4-7',
				enemy: [
					{ name: '堕魂哨兵', id: 'ybsl_019shengyan', level: 40, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '噬魂者', id: 'ybsl_054yueer', level: 40, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '寒霜怨灵', id: 'ybsl_122wangbingyu', level: 40, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 40, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 40, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '深渊游魂', id: 'ybsl_037diamondqueen', level: 40, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// --- 第9小节：小BOSS·王汉桢（Lv.43） ---
			'c4-9': {
				name: '霜喉终垒',
				id: 'c4-9',
				type: 'boss',
				text: '王汉桢立于深渊之喉尽头，剑光如霜：「再往前，便是主人的领域。」',
				prev: 'c4-8',
				enemy: [
					{ name: '王汉桢', id: 'ybsl_006wanghanzhen', level: 43, tupolevel: 6, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '深渊爪牙', id: 'ybsl_024yuetong', level: 43, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '怨灵祭司', id: 'ybsl_045gaocong', level: 43, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 43, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 43, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '寒霜怨灵', id: 'ybsl_122wangbingyu', level: 43, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// --- 第10小节：大BOSS·堕魂之主陈爱琳（Lv.46） ---
			'c4-10': {
				name: '堕魂终焉',
				id: 'c4-10',
				type: 'boss',
				text: '深渊尽头，堕魂之主陈爱琳自王座起身，尹超跃、孙丽松、王汉桢分立其身侧：「归来的魂魄啊，这一次，由我亲自收下。」',
				prev: 'c4-9',
				enemy: [
					{ name: '陈爱琳', id: 'ybsl_002chenailin', level: 46, tupolevel: 6, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '孙丽松', id: 'ybsl_001sunlisong', level: 46, tupolevel: 6, rank: 'epic', template: 'damger', buff: [] },
					{ name: '王汉桢', id: 'ybsl_006wanghanzhen', level: 46, tupolevel: 6, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '尹超跃', id: 'ybsl_013yinji', level: 46, tupolevel: 6, rank: 'epic', template: 'damger', buff: [] },
					{ name: '镇魂卫', id: 'ybsl_053qiuer', level: 46, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '裂魂傀儡', id: 'ybsl_121tujing', level: 46, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
		}
	},

	// ========== 第五章：书道峰会 ==========
	chapter5: {
		name: '第五章：书道峰会',
		difficulty: 'normal',
		procedure: [
			'c5-1', 'c5-2', 'c5-3', 'c5-4', 'c5-5',
			'c5-6', 'c5-7', 'c5-8', 'c5-9', 'c5-10'
		],
		eventPack: {
			// 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
			'c5-1': {
				name: '笔墨序曲',
				id: 'c5-1',
				type: 'battle',
				text: '书道峰会拉开帷幕，笔墨纸砚已备好，初赛的执笔者们正整装待发。',
				prev: null,
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 47, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 47, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 47, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 47, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 47, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '题字客', id: 'ybsl_121tujing', level: 47, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
			'c5-2': {
				name: '临池试笔',
				id: 'c5-2',
				type: 'boss',
				text: '张晴坐镇临帖台，笑意盈盈：「来，先与我比一比这横平竖直。」',
				prev: 'c5-1',
				enemy: [
					{ name: '张晴', id: 'ybsl_018zhangqing', level: 48, tupolevel: 6, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 48, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 48, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 48, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 48, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '钤印童', id: 'ybsl_122wangbingyu', level: 48, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
			'c5-3': {
				name: '砚池清风',
				id: 'c5-3',
				type: 'battle',
				text: '砚池旁微风轻拂，几位学子正琢磨着笔锋的转折。',
				prev: 'c5-2',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 49, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 49, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇纸客', id: 'ybsl_053qiuer', level: 49, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 49, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_121tujing', level: 49, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 49, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
			'c5-4': {
				name: '纸上行云',
				id: 'c5-4',
				type: 'battle',
				text: '宣纸之上云气流转，参赛者们在行云流水中寻找手感。',
				prev: 'c5-3',
				enemy: [
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 50, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 50, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '点苔手', id: 'ybsl_053qiuer', level: 50, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 50, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 50, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 50, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
			'c5-5': {
				name: '染墨小筑',
				id: 'c5-5',
				type: 'boss',
				text: '小慧挽袖研墨，俏皮道：「看我的笔，可不比谁慢哦。」',
				prev: 'c5-4',
				enemy: [
					{ name: '小慧', id: 'ybsl_033xiaohui', level: 51, tupolevel: 6, rank: 'epic', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 51, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 51, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 51, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 51, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '钤印童', id: 'ybsl_122wangbingyu', level: 51, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
			'c5-6': {
				name: '笔走龙蛇',
				id: 'c5-6',
				type: 'battle',
				text: '赛场上笔走龙蛇，满堂喝彩声此起彼伏。',
				prev: 'c5-5',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 52, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 52, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 52, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_121tujing', level: 52, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 52, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '点苔手', id: 'ybsl_053qiuer', level: 52, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
			'c5-7': {
				name: '墨香盈袖',
				id: 'c5-7',
				type: 'battle',
				text: '墨香盈袖，大家在交流中渐入佳境。',
				prev: 'c5-6',
				enemy: [
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 53, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 53, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇纸客', id: 'ybsl_053qiuer', level: 53, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 53, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 53, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '钤印童', id: 'ybsl_122wangbingyu', level: 53, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
			'c5-8': {
				name: '飞白流韵',
				id: 'c5-8',
				type: 'battle',
				text: '飞白的枯笔韵味十足，围观者连连称妙。',
				prev: 'c5-7',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 54, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 54, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 54, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 54, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 54, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '晾纸人', id: 'ybsl_121tujing', level: 54, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
			'c5-9': {
				name: '宣纸铺陈',
				id: 'c5-9',
				type: 'battle',
				text: '宣纸铺陈，决赛前的最后热身已然开始。',
				prev: 'c5-8',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 55, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 55, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 55, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇纸客', id: 'ybsl_053qiuer', level: 55, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '补白人', id: 'ybsl_121tujing', level: 55, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 55, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
			'c5-10': {
				name: '双毫竞秀',
				id: 'c5-10',
				type: 'boss',
				text: '秋儿与悦儿并肩立于终审台前，异口同声：「这一局，可要好好请教啦。」',
				prev: 'c5-9',
				enemy: [
					{ name: '秋儿', id: 'ybsl_053qiuer', level: 56, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '悦儿', id: 'ybsl_054yueer', level: 56, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 56, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 56, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 56, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '钤印童', id: 'ybsl_019shengyan', level: 56, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
		}
	},

	// ========== 第六章：书道峰会·盛会 ==========
	chapter6: {
		name: '第六章：书道峰会·盛会',
		difficulty: 'normal',
		procedure: [
			'c6-1', 'c6-2', 'c6-3', 'c6-4', 'c6-5',
			'c6-6', 'c6-7', 'c6-8', 'c6-9', 'c6-10'
		],
		eventPack: {
			// 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
			'c6-1': {
				name: '盛会初临',
				id: 'c6-1',
				type: 'battle',
				text: '峰会进入盛会阶段，四方书友齐聚，气氛愈发热闹。',
				prev: null,
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 58, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 58, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 58, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 58, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 58, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '题字客', id: 'ybsl_121tujing', level: 58, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
			'c6-2': {
				name: '题笺飞雪',
				id: 'c6-2',
				type: 'boss',
				text: '江雪舞执笔而立，霜雪般的字迹飘然落下：「试试这落笔的轻重？」',
				prev: 'c6-1',
				enemy: [
					{ name: '江雪舞', id: 'ybsl_046jiangxuewu', level: 59, tupolevel: 6, rank: 'epic', template: 'defense', buff: [] },
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 59, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 59, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 59, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 59, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '钤印童', id: 'ybsl_122wangbingyu', level: 59, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
			'c6-3': {
				name: '梅香入墨',
				id: 'c6-3',
				type: 'battle',
				text: '梅香入墨，有人在红梅图上题下小诗，引得众人围观。',
				prev: 'c6-2',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 60, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 60, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇纸客', id: 'ybsl_053qiuer', level: 60, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 60, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_121tujing', level: 60, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 60, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
			'c6-4': {
				name: '红袖临风',
				id: 'c6-4',
				type: 'battle',
				text: '红袖临风，参赛者们的衣袂随挥毫的节奏轻轻扬起。',
				prev: 'c6-3',
				enemy: [
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 61, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 61, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '悦然客', id: 'ybsl_054yueer', level: 61, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 61, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 61, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '题字客', id: 'ybsl_121tujing', level: 61, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
			'c6-5': {
				name: '丹染春山',
				id: 'c6-5',
				type: 'boss',
				text: '涂山小红笑盈盈举起朱笔：「看我这红，比你那墨如何？」',
				prev: 'c6-4',
				enemy: [
					{ name: '涂山小红', id: 'ybsl_017xiaohong', level: 62, tupolevel: 6, rank: 'legend', template: 'damger', buff: [] },
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 62, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 62, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 62, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 62, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 62, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
			'c6-6': {
				name: '抚卷听雨',
				id: 'c6-6',
				type: 'battle',
				text: '抚卷听雨，雨声与笔声相和，别有一番雅趣。',
				prev: 'c6-5',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 63, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 63, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 63, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 63, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_121tujing', level: 63, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 63, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
			'c6-7': {
				name: '汉韵晋风',
				id: 'c6-7',
				type: 'battle',
				text: '汉韵晋风，大家在古帖的临摹中各抒己见。',
				prev: 'c6-6',
				enemy: [
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 64, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 64, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇纸客', id: 'ybsl_053qiuer', level: 64, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 64, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 64, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '钤印童', id: 'ybsl_122wangbingyu', level: 64, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
			'c6-8': {
				name: '满纸烟岚',
				id: 'c6-8',
				type: 'battle',
				text: '满纸烟岚，山水意境在笔端缓缓晕开。',
				prev: 'c6-7',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 65, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 65, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '悦然客', id: 'ybsl_054yueer', level: 65, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 65, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '补白人', id: 'ybsl_037diamondqueen', level: 65, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '晾纸人', id: 'ybsl_121tujing', level: 65, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
			'c6-9': {
				name: '墨宝琳琅',
				id: 'c6-9',
				type: 'battle',
				text: '墨宝琳琅，佳作纷呈，盛会渐入高潮。',
				prev: 'c6-8',
				enemy: [
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 66, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 66, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 66, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇纸客', id: 'ybsl_053qiuer', level: 66, tupolevel: 6, rank: 'rare', template: 'defense', buff: [] },
					{ name: '补白人', id: 'ybsl_121tujing', level: 66, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '题字客', id: 'ybsl_122wangbingyu', level: 66, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
			'c6-10': {
				name: '墨海同晖',
				id: 'c6-10',
				type: 'boss',
				text: '王海茹与满城柒同展长卷，含笑相邀：「这最后一笔，便与你共题。」',
				prev: 'c6-9',
				enemy: [
					{ name: '王海茹', id: 'ybsl_015wanghairu', level: 67, tupolevel: 6, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '满城柒', id: 'ybsl_016manchengqi', level: 67, tupolevel: 6, rank: 'epic', template: 'damger', buff: [] },
					{ name: '执笔童子', id: 'ybsl_019shengyan', level: 67, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '研墨侍女', id: 'ybsl_024yuetong', level: 67, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '临帖学子', id: 'ybsl_045gaocong', level: 67, tupolevel: 6, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷人', id: 'ybsl_055zhengyan', level: 67, tupolevel: 6, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
		}
	},

	// ========== 第七章：往昔回廊 ==========
	// 阵容：蘋姉、蛇妃、房佳谕(章节boss)、贾雨桐、史庆宇、王贺、高聪
	// 突破统一 tupolevel = 8；等级随小节递进 70 → 97
	// 章节boss 房佳谕 坐镇 c7-10（主boss + 次boss蛇妃/蘋姉 + 3杂兵）
	chapter7: {
		name: '第七章：往昔回廊',
		difficulty: 'normal',
		procedure: [
			'c7-1', 'c7-2', 'c7-3', 'c7-4', 'c7-5',
			'c7-6', 'c7-7', 'c7-8', 'c7-9', 'c7-10'
		],
		eventPack: {
			// 关卡1：蘋姉初遇 + 杂兵
			'c7-1': {
				name: '回廊初醒',
				id: 'c7-1',
				type: 'battle',
				text: '往昔回廊的迷雾中，一道熟悉的身影率先拦住了去路——蘋姉似笑非笑：「这么多年，你还是改不了乱闯的毛病。」',
				prev: null,
				enemy: [
					{ name: '蘋姉', id: 'ybsl_042pingzi', level: 70, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '回廊游魂', id: 'ybsl_024yuetong', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '往昔残影', id: 'ybsl_019shengyan', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '旧忆卫', id: 'ybsl_045gaocong', level: 70, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 70, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '霜傀', id: 'ybsl_122wangbingyu', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡2：高聪 + 史庆宇 + 杂兵
			'c7-2': {
				name: '旧友相逢',
				id: 'c7-2',
				type: 'battle',
				text: '回廊深处，高聪与史庆宇并肩而立：「来的可是贵客，正好拿你试试手。」',
				prev: 'c7-1',
				enemy: [
					{ name: '高聪', id: 'ybsl_045gaocong', level: 73, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '史庆宇', id: 'ybsl_025shiqingyu', level: 73, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '回廊游魂', id: 'ybsl_024yuetong', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '往昔残影', id: 'ybsl_019shengyan', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂使', id: 'ybsl_053qiuer', level: 73, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '噬忆者', id: 'ybsl_054yueer', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡3：王贺 + 贾雨桐 + 杂兵
			'c7-3': {
				name: '回廊堵截',
				id: 'c7-3',
				type: 'battle',
				text: '狭窄的廊道两头被王贺与贾雨桐封死，退路尽断。',
				prev: 'c7-2',
				enemy: [
					{ name: '王贺', id: 'ybsl_025wanghe', level: 76, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '贾雨桐', id: 'ybsl_020jiayutong', level: 76, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '旧忆卫', id: 'ybsl_045gaocong', level: 76, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 76, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '霜傀', id: 'ybsl_122wangbingyu', level: 76, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷灵', id: 'ybsl_121tujing', level: 76, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡4：蛇妃现身 + 杂兵
			'c7-4': {
				name: '蛇影初缠',
				id: 'c7-4',
				type: 'battle',
				text: '幽香袭来，蛇妃自廊柱后探出身子，笑意里藏着危险的盘算。',
				prev: 'c7-3',
				enemy: [
					{ name: '蛇妃', id: 'db_ybsl_067snake', level: 79, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '回廊游魂', id: 'ybsl_024yuetong', level: 79, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '往昔残影', id: 'ybsl_019shengyan', level: 79, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '晶卫', id: 'ybsl_037diamondqueen', level: 79, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '镇魂使', id: 'ybsl_053qiuer', level: 79, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '噬忆者', id: 'ybsl_054yueer', level: 79, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡5：蘋姉 + 高聪 + 杂兵
			'c7-5': {
				name: '残忆交叠',
				id: 'c7-5',
				type: 'battle',
				text: '蘋姉与高聪再度拦路，往昔的记忆如潮水般涌来。',
				prev: 'c7-4',
				enemy: [
					{ name: '蘋姉', id: 'ybsl_042pingzi', level: 82, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '高聪', id: 'ybsl_045gaocong', level: 82, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 82, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '霜傀', id: 'ybsl_122wangbingyu', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷灵', id: 'ybsl_121tujing', level: 82, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '晶卫', id: 'ybsl_037diamondqueen', level: 82, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡6：史庆宇 + 王贺 + 杂兵
			'c7-6': {
				name: '双壁合击',
				id: 'c7-6',
				type: 'battle',
				text: '史庆宇与王贺的配合越发默契，攻守之间滴水不漏。',
				prev: 'c7-5',
				enemy: [
					{ name: '史庆宇', id: 'ybsl_025shiqingyu', level: 85, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '王贺', id: 'ybsl_025wanghe', level: 85, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '回廊游魂', id: 'ybsl_024yuetong', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '往昔残影', id: 'ybsl_019shengyan', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '镇魂使', id: 'ybsl_053qiuer', level: 85, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '噬忆者', id: 'ybsl_054yueer', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡7：贾雨桐 + 蛇妃 + 杂兵
			'c7-7': {
				name: '蛇与雨',
				id: 'c7-7',
				type: 'battle',
				text: '贾雨桐撑起屏障，蛇妃于其后吐信而笑，攻守一体。',
				prev: 'c7-6',
				enemy: [
					{ name: '贾雨桐', id: 'ybsl_020jiayutong', level: 88, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '蛇妃', id: 'db_ybsl_067snake', level: 88, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '旧忆卫', id: 'ybsl_045gaocong', level: 88, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 88, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '霜傀', id: 'ybsl_122wangbingyu', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷灵', id: 'ybsl_121tujing', level: 88, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡8：蘋姉 + 王贺 + 杂兵
			'c7-8': {
				name: '锋锐相争',
				id: 'c7-8',
				type: 'battle',
				text: '蘋姉与王贺同时出剑，快慢交织的攻势令人难以招架。',
				prev: 'c7-7',
				enemy: [
					{ name: '蘋姉', id: 'ybsl_042pingzi', level: 91, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '王贺', id: 'ybsl_025wanghe', level: 91, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '回廊游魂', id: 'ybsl_024yuetong', level: 91, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '往昔残影', id: 'ybsl_019shengyan', level: 91, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '晶卫', id: 'ybsl_037diamondqueen', level: 91, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '镇魂使', id: 'ybsl_053qiuer', level: 91, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡9：高聪 + 贾雨桐 + 史庆宇 + 杂兵（最终前哨）
			'c7-9': {
				name: '回廊合流',
				id: 'c7-9',
				type: 'battle',
				text: '高聪、贾雨桐、史庆宇三人集结于此，似在等待某人号令。',
				prev: 'c7-8',
				enemy: [
					{ name: '高聪', id: 'ybsl_045gaocong', level: 94, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '贾雨桐', id: 'ybsl_020jiayutong', level: 94, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '史庆宇', id: 'ybsl_025shiqingyu', level: 94, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '引魂人', id: 'ybsl_055zhengyan', level: 94, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '霜傀', id: 'ybsl_122wangbingyu', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '守卷灵', id: 'ybsl_121tujing', level: 94, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡10 BOSS：房佳谕（主boss）+ 蛇妃 + 蘋姉（次boss）+ 杂兵
			'c7-10': {
				name: 'BOSS·往昔回廊之主房佳谕',
				id: 'c7-10',
				type: 'boss',
				text: '回廊尽头，房佳谕自王座起身，蛇妃与蘋姉分立其左右：「踏过这条回廊的人，都得留下点什么。」',
				prev: 'c7-9',
				enemy: [
					{ name: '房佳谕', id: 'ybsl_043fangjiayu', level: 97, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '蛇妃', id: 'db_ybsl_067snake', level: 97, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '蘋姉', id: 'ybsl_042pingzi', level: 97, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '回廊游魂', id: 'ybsl_024yuetong', level: 97, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '往昔残影', id: 'ybsl_019shengyan', level: 97, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '旧忆卫', id: 'ybsl_045gaocong', level: 97, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
		}
	},

	// ========== 第八章：云上之城 ==========
	// 阵容：刘天杭、慕琴、鞠熒(章节boss)、宋橤、周靈、李曉
	// 突破统一 tupolevel = 8；等级随小节递进 70 → 97
	// 章节boss 鞠熒 坐镇 c8-10（主boss + 次boss刘天杭/慕琴 + 3杂兵）
	chapter8: {
		name: '第八章：云上之城',
		difficulty: 'normal',
		procedure: [
			'c8-1', 'c8-2', 'c8-3', 'c8-4', 'c8-5',
			'c8-6', 'c8-7', 'c8-8', 'c8-9', 'c8-10'
		],
		eventPack: {
			// 关卡1：刘天杭 + 慕琴 + 杂兵
			'c8-1': {
				name: '云城初临',
				id: 'c8-1',
				type: 'battle',
				text: '云上之城的大门在脚下铺展，刘天杭与慕琴并肩而立：「这座城，可没那么好进。」',
				prev: null,
				enemy: [
					{ name: '刘天杭', id: 'ybsl_060liutianhang', level: 70, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '慕琴', id: 'ybsl_041mmuqin', level: 70, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '云城游魂', id: 'ybsl_024yuetong', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城残影', id: 'ybsl_019shengyan', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城卫士', id: 'ybsl_055zhengyan', level: 70, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云城盾从', id: 'ybsl_053qiuer', level: 70, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡2：宋橤 + 周靈 + 杂兵
			'c8-2': {
				name: '云阶对峙',
				id: 'c8-2',
				type: 'battle',
				text: '拾级而上，宋橤撑起护盾，周靈在侧蓄势：「再往上，可就没这么温柔了。」',
				prev: 'c8-1',
				enemy: [
					{ name: '宋橤', id: 'ybsl_059starsFall2', level: 73, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '周靈', id: 'ybsl_059starsFall3', level: 73, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '云城刺客', id: 'ybsl_054yueer', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云衡使', id: 'ybsl_045gaocong', level: 73, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云晶傀', id: 'ybsl_037diamondqueen', level: 73, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '云霜傀', id: 'ybsl_122wangbingyu', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡3：李曉 + 刘天杭 + 杂兵
			'c8-3': {
				name: '云海交锋',
				id: 'c8-3',
				type: 'battle',
				text: '云海翻涌，李曉剑光如星，刘天杭回身再战：「又见面了，这次可不会留手。」',
				prev: 'c8-2',
				enemy: [
					{ name: '李曉', id: 'ybsl_059starsFall4', level: 76, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '刘天杭', id: 'ybsl_060liutianhang', level: 76, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '云城游魂', id: 'ybsl_024yuetong', level: 76, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城残影', id: 'ybsl_019shengyan', level: 76, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云卷灵', id: 'ybsl_121tujing', level: 76, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云城盾从', id: 'ybsl_053qiuer', level: 76, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡4：慕琴 + 宋橤 + 杂兵
			'c8-4': {
				name: '云台合奏',
				id: 'c8-4',
				type: 'battle',
				text: '云台之上，慕琴与宋橤的配合行云流水，攻守相生。',
				prev: 'c8-3',
				enemy: [
					{ name: '慕琴', id: 'ybsl_041mmuqin', level: 79, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '宋橤', id: 'ybsl_059starsFall2', level: 79, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '云城卫士', id: 'ybsl_055zhengyan', level: 79, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云城刺客', id: 'ybsl_054yueer', level: 79, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云衡使', id: 'ybsl_045gaocong', level: 79, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云晶傀', id: 'ybsl_037diamondqueen', level: 79, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡5：周靈 + 李曉 + 杂兵
			'c8-5': {
				name: '星落云巅',
				id: 'c8-5',
				type: 'battle',
				text: '周靈与李曉双星辉映，云巅之上星光如雨倾泻。',
				prev: 'c8-4',
				enemy: [
					{ name: '周靈', id: 'ybsl_059starsFall3', level: 82, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '李曉', id: 'ybsl_059starsFall4', level: 82, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '云霜傀', id: 'ybsl_122wangbingyu', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城游魂', id: 'ybsl_024yuetong', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城残影', id: 'ybsl_019shengyan', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云卷灵', id: 'ybsl_121tujing', level: 82, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡6：刘天杭 + 慕琴 + 杂兵
			'c8-6': {
				name: '云城双壁',
				id: 'c8-6',
				type: 'battle',
				text: '刘天杭与慕琴再度联手，云城双壁的攻势愈发凌厉。',
				prev: 'c8-5',
				enemy: [
					{ name: '刘天杭', id: 'ybsl_060liutianhang', level: 85, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '慕琴', id: 'ybsl_041mmuqin', level: 85, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '云城盾从', id: 'ybsl_053qiuer', level: 85, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '云城刺客', id: 'ybsl_054yueer', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云衡使', id: 'ybsl_045gaocong', level: 85, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云晶傀', id: 'ybsl_037diamondqueen', level: 85, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡7：宋橤 + 周靈 + 杂兵
			'c8-7': {
				name: '云影轮转',
				id: 'c8-7',
				type: 'battle',
				text: '宋橤与周靈轮转攻防，云影在脚下不断变幻。',
				prev: 'c8-6',
				enemy: [
					{ name: '宋橤', id: 'ybsl_059starsFall2', level: 88, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '周靈', id: 'ybsl_059starsFall3', level: 88, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '云城游魂', id: 'ybsl_024yuetong', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城残影', id: 'ybsl_019shengyan', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城卫士', id: 'ybsl_055zhengyan', level: 88, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云霜傀', id: 'ybsl_122wangbingyu', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡8：李曉 + 刘天杭 + 杂兵
			'c8-8': {
				name: '星剑破云',
				id: 'c8-8',
				type: 'battle',
				text: '李曉星剑破云，刘天杭乘势突进，云层被生生撕裂。',
				prev: 'c8-7',
				enemy: [
					{ name: '李曉', id: 'ybsl_059starsFall4', level: 91, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '刘天杭', id: 'ybsl_060liutianhang', level: 91, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '云城刺客', id: 'ybsl_054yueer', level: 91, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云卷灵', id: 'ybsl_121tujing', level: 91, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云衡使', id: 'ybsl_045gaocong', level: 91, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '云城盾从', id: 'ybsl_053qiuer', level: 91, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡9：慕琴 + 宋橤 + 周靈 + 杂兵（最终前哨）
			'c8-9': {
				name: '云城合流',
				id: 'c8-9',
				type: 'battle',
				text: '慕琴、宋橤、周靈三人集结于城心，似在等待城主现身。',
				prev: 'c8-8',
				enemy: [
					{ name: '慕琴', id: 'ybsl_041mmuqin', level: 94, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '宋橤', id: 'ybsl_059starsFall2', level: 94, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '周靈', id: 'ybsl_059starsFall3', level: 94, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '云城游魂', id: 'ybsl_024yuetong', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城残影', id: 'ybsl_019shengyan', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云城卫士', id: 'ybsl_055zhengyan', level: 94, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡10 BOSS：鞠熒（主boss）+ 刘天杭 + 慕琴（次boss）+ 杂兵
			'c8-10': {
				name: 'BOSS·云上之城之主鞠熒',
				id: 'c8-10',
				type: 'boss',
				text: '云城之巅，鞠熒于星轨环绕中现身，刘天杭与慕琴分立其左右：「能走到这里，你确实不简单。」',
				prev: 'c8-9',
				enemy: [
					{ name: '鞠熒', id: 'ybsl_059starsFall1', level: 97, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '刘天杭', id: 'ybsl_060liutianhang', level: 97, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '慕琴', id: 'ybsl_041mmuqin', level: 97, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '云城盾从', id: 'ybsl_053qiuer', level: 97, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '云城刺客', id: 'ybsl_054yueer', level: 97, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '云衡使', id: 'ybsl_045gaocong', level: 97, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
		}
	},

	// ========== 第九章：星月神话 ==========
	// 阵容：岳瞳、盛妍、彡(章节boss)、卞秋雯、小新、王婉儿
	// 突破统一 tupolevel = 8；等级随小节递进 70 → 97
	// 章节boss 彡 坐镇 c9-10（主boss + 次boss岳瞳/王婉儿 + 3杂兵）
	chapter9: {
		name: '第九章：星月神话',
		difficulty: 'normal',
		procedure: [
			'c9-1', 'c9-2', 'c9-3', 'c9-4', 'c9-5',
			'c9-6', 'c9-7', 'c9-8', 'c9-9', 'c9-10'
		],
		eventPack: {
			// 关卡1：岳瞳 + 盛妍 + 杂兵
			'c9-1': {
				name: '星月初升',
				id: 'c9-1',
				type: 'battle',
				text: '星月交辉的夜空下，岳瞳与盛妍率先现身：「这片星空，容不得外人踏足。」',
				prev: null,
				enemy: [
					{ name: '岳瞳', id: 'ybsl_024yuetong', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '盛妍', id: 'ybsl_019shengyan', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘游魂', id: 'ybsl_054yueer', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘残影', id: 'ybsl_045gaocong', level: 70, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘卫士', id: 'ybsl_055zhengyan', level: 70, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星尘盾从', id: 'ybsl_053qiuer', level: 70, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡2：卞秋雯 + 小新 + 杂兵
			'c9-2': {
				name: '月下双影',
				id: 'c9-2',
				type: 'battle',
				text: '卞秋雯稳守如山，小新巧笑倩兮：「想过去？先过我们这关。」',
				prev: 'c9-1',
				enemy: [
					{ name: '卞秋雯', id: 'ybsl_038bianqiuwen', level: 73, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '小新', id: 'ybsl_079xiaoxin', level: 73, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '星尘刺客', id: 'ybsl_054yueer', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星衡使', id: 'ybsl_045gaocong', level: 73, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星晶傀', id: 'ybsl_037diamondqueen', level: 73, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '星霜傀', id: 'ybsl_122wangbingyu', level: 73, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡3：王婉儿 + 岳瞳 + 杂兵
			'c9-3': {
				name: '星辉守望',
				id: 'c9-3',
				type: 'battle',
				text: '王婉儿立于星辉之中，与岳瞳一同拦路：「神话的篇章，由我们守护。」',
				prev: 'c9-2',
				enemy: [
					{ name: '王婉儿', id: 'ybsl_049waner', level: 76, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '岳瞳', id: 'ybsl_024yuetong', level: 76, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘游魂', id: 'ybsl_054yueer', level: 76, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星卷灵', id: 'ybsl_121tujing', level: 76, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星尘残影', id: 'ybsl_045gaocong', level: 76, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘盾从', id: 'ybsl_053qiuer', level: 76, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡4：盛妍 + 卞秋雯 + 杂兵
			'c9-4': {
				name: '神话回响',
				id: 'c9-4',
				type: 'battle',
				text: '盛妍与卞秋雯的攻势交织，神话的余音在夜空回荡。',
				prev: 'c9-3',
				enemy: [
					{ name: '盛妍', id: 'ybsl_019shengyan', level: 79, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '卞秋雯', id: 'ybsl_038bianqiuwen', level: 79, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '星尘卫士', id: 'ybsl_055zhengyan', level: 79, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星尘刺客', id: 'ybsl_054yueer', level: 79, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星衡使', id: 'ybsl_045gaocong', level: 79, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星晶傀', id: 'ybsl_037diamondqueen', level: 79, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡5：小新 + 王婉儿 + 杂兵
			'c9-5': {
				name: '星河轻语',
				id: 'c9-5',
				type: 'battle',
				text: '小新与王婉儿相视一笑，星河仿佛也轻声呢喃起来。',
				prev: 'c9-4',
				enemy: [
					{ name: '小新', id: 'ybsl_079xiaoxin', level: 82, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '王婉儿', id: 'ybsl_049waner', level: 82, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '星霜傀', id: 'ybsl_122wangbingyu', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘游魂', id: 'ybsl_054yueer', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘残影', id: 'ybsl_045gaocong', level: 82, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星卷灵', id: 'ybsl_121tujing', level: 82, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡6：岳瞳 + 盛妍 + 杂兵
			'c9-6': {
				name: '双星并耀',
				id: 'c9-6',
				type: 'battle',
				text: '岳瞳与盛妍双星并耀，星月光华几乎令人无法直视。',
				prev: 'c9-5',
				enemy: [
					{ name: '岳瞳', id: 'ybsl_024yuetong', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '盛妍', id: 'ybsl_019shengyan', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘盾从', id: 'ybsl_053qiuer', level: 85, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '星尘刺客', id: 'ybsl_054yueer', level: 85, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星衡使', id: 'ybsl_045gaocong', level: 85, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星晶傀', id: 'ybsl_037diamondqueen', level: 85, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡7：卞秋雯 + 小新 + 杂兵
			'c9-7': {
				name: '月影流光',
				id: 'c9-7',
				type: 'battle',
				text: '卞秋雯与小新再度拦路，月影流光间暗藏杀机。',
				prev: 'c9-6',
				enemy: [
					{ name: '卞秋雯', id: 'ybsl_038bianqiuwen', level: 88, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '小新', id: 'ybsl_079xiaoxin', level: 88, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '星尘游魂', id: 'ybsl_054yueer', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘残影', id: 'ybsl_045gaocong', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘卫士', id: 'ybsl_055zhengyan', level: 88, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星霜傀', id: 'ybsl_122wangbingyu', level: 88, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡8：王婉儿 + 岳瞳 + 杂兵
			'c9-8': {
				name: '神话交汇',
				id: 'c9-8',
				type: 'battle',
				text: '王婉儿与岳瞳的力量交汇，星与月的光轨在脚下缠绕。',
				prev: 'c9-7',
				enemy: [
					{ name: '王婉儿', id: 'ybsl_049waner', level: 91, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '岳瞳', id: 'ybsl_024yuetong', level: 91, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘刺客', id: 'ybsl_054yueer', level: 91, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星卷灵', id: 'ybsl_121tujing', level: 91, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星衡使', id: 'ybsl_045gaocong', level: 91, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '星尘盾从', id: 'ybsl_053qiuer', level: 91, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] }
				],
			},
			// 关卡9：盛妍 + 卞秋雯 + 小新 + 杂兵（最终前哨）
			'c9-9': {
				name: '星月合流',
				id: 'c9-9',
				type: 'battle',
				text: '盛妍、卞秋雯、小新三人汇聚，星月的彼端似有巨影苏醒。',
				prev: 'c9-8',
				enemy: [
					{ name: '盛妍', id: 'ybsl_019shengyan', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '卞秋雯', id: 'ybsl_038bianqiuwen', level: 94, tupolevel: 8, rank: 'epic', template: 'defense', buff: [] },
					{ name: '小新', id: 'ybsl_079xiaoxin', level: 94, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '星尘游魂', id: 'ybsl_054yueer', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘残影', id: 'ybsl_045gaocong', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星尘卫士', id: 'ybsl_055zhengyan', level: 94, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
			// 关卡10 BOSS：彡（主boss）+ 岳瞳 + 王婉儿（次boss）+ 杂兵
			'c9-10': {
				name: 'BOSS·星月神话之主彡',
				id: 'c9-10',
				type: 'boss',
				text: '星月交缠的核心，彡踏光而来，岳瞳与王婉儿分立其左右：「神话的尽头，由我来书写。」',
				prev: 'c9-9',
				enemy: [
					{ name: '彡', id: 'ybsl_047shan', level: 97, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '岳瞳', id: 'ybsl_024yuetong', level: 97, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '王婉儿', id: 'ybsl_049waner', level: 97, tupolevel: 8, rank: 'legend', template: 'balanced', buff: [] },
					{ name: '星尘盾从', id: 'ybsl_053qiuer', level: 97, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '星尘刺客', id: 'ybsl_054yueer', level: 97, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '星衡使', id: 'ybsl_045gaocong', level: 97, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] }
				],
			},
		}
	},

	// ========== 第十章：梦里星河 ==========
	// 阵容：蚕、雨、黎、熙、涂山水璃、朱焌、张汨、清月、香紫（全章节 boss 配置）
	// 突破统一 tupolevel = 8；等级随小节递进 92 → 110
	// 每一关 = 1主boss + 2次boss + 3杂兵；第3/6/9/10小节为全体真名boss（All-True-Name）
	chapter10: {
		name: '第十章：梦里星河',
		difficulty: 'normal',
		procedure: [
			'c10-1', 'c10-2', 'c10-3', 'c10-4', 'c10-5',
			'c10-6', 'c10-7', 'c10-8', 'c10-9', 'c10-10'
		],
		eventPack: {
			// 关卡1：主蚕 + 次雨/黎 + 杂兵
			'c10-1': {
				name: '星河初梦',
				id: 'c10-1',
				type: 'boss',
				text: '梦里星河荡漾，蚕自茧中探身：「这里的梦，由不得你醒。」',
				prev: null,
				enemy: [
					{ name: '蚕', id: 'ybsl_026can', level: 92, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '雨', id: 'ybsl_027rain', level: 92, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '黎', id: 'ybsl_029dawn', level: 92, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '梦魇卫士', id: 'ybsl_055zhengyan', level: 92, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '梦魇盾从', id: 'ybsl_053qiuer', level: 92, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '梦魇刺客', id: 'ybsl_054yueer', level: 92, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡2：主张汨 + 次清月/香紫 + 杂兵
			'c10-2': {
				name: '梦泊双姝',
				id: 'c10-2',
				type: 'boss',
				text: '张汨与清月、香紫临水而立，梦泊之上波光潋滟。',
				prev: 'c10-1',
				enemy: [
					{ name: '张汨', id: 'ybsl_047zhangmi', level: 94, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '清月', id: 'ybsl_068qingyue', level: 94, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '香紫', id: 'ybsl_069xiangzi', level: 94, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '梦衡使', id: 'ybsl_045gaocong', level: 94, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '梦晶傀', id: 'ybsl_037diamondqueen', level: 94, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '梦霜傀', id: 'ybsl_122wangbingyu', level: 94, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡3：全体真名boss - 涂山水璃 + 朱焌 + 熙 + 蚕 + 雨 + 黎
			'c10-3': {
				name: '真名·星河之主',
				id: 'c10-3',
				type: 'boss',
				text: '星河核心，涂山水璃与朱焌并肩，身侧熙、蚕、雨、黎环伺——此战，全员真名。',
				prev: 'c10-2',
				enemy: [
					{ name: '涂山水璃', id: 'ybsl_107tushanshuili', level: 96, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '朱焌', id: 'ybsl_076zhujun', level: 96, tupolevel: 8, rank: 'legend', template: 'defense', buff: [] },
					{ name: '熙', id: 'ybsl_036bright', level: 96, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '蚕', id: 'ybsl_026can', level: 96, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '雨', id: 'ybsl_027rain', level: 96, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '黎', id: 'ybsl_029dawn', level: 96, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] }
				],
			},
			// 关卡4：主熙 + 次张汨/清月 + 杂兵
			'c10-4': {
				name: '梦刃流光',
				id: 'c10-4',
				type: 'boss',
				text: '熙剑光夺目，张汨与清月一左一右封锁去路。',
				prev: 'c10-3',
				enemy: [
					{ name: '熙', id: 'ybsl_036bright', level: 98, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '张汨', id: 'ybsl_047zhangmi', level: 98, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '清月', id: 'ybsl_068qingyue', level: 98, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '梦卷灵', id: 'ybsl_121tujing', level: 98, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '梦魇游魂', id: 'ybsl_024yuetong', level: 98, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '梦魇残影', id: 'ybsl_019shengyan', level: 98, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡5：主香紫 + 次黎/雨 + 杂兵
			'c10-5': {
				name: '梦紫低语',
				id: 'c10-5',
				type: 'boss',
				text: '香紫低语缠绕，黎与雨织成梦的牢笼。',
				prev: 'c10-4',
				enemy: [
					{ name: '香紫', id: 'ybsl_069xiangzi', level: 100, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '黎', id: 'ybsl_029dawn', level: 100, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] },
					{ name: '雨', id: 'ybsl_027rain', level: 100, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '梦魇卫士', id: 'ybsl_055zhengyan', level: 100, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '梦魇盾从', id: 'ybsl_053qiuer', level: 100, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '梦魇刺客', id: 'ybsl_054yueer', level: 100, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡6：全体真名boss - 朱焌 + 涂山水璃 + 清月 + 张汨 + 香紫 + 黎
			'c10-6': {
				name: '真名·星河守望',
				id: 'c10-6',
				type: 'boss',
				text: '朱焌撑起梦之壁垒，涂山水璃、清月、张汨、香紫、黎齐至——全员真名，再无杂兵。',
				prev: 'c10-5',
				enemy: [
					{ name: '朱焌', id: 'ybsl_076zhujun', level: 102, tupolevel: 8, rank: 'legend', template: 'defense', buff: [] },
					{ name: '涂山水璃', id: 'ybsl_107tushanshuili', level: 102, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '清月', id: 'ybsl_068qingyue', level: 102, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '张汨', id: 'ybsl_047zhangmi', level: 102, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '香紫', id: 'ybsl_069xiangzi', level: 102, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '黎', id: 'ybsl_029dawn', level: 102, tupolevel: 8, rank: 'epicfake', template: 'balanced', buff: [] }
				],
			},
			// 关卡7：主蚕 + 次张汨/香紫 + 杂兵
			'c10-7': {
				name: '梦茧缠丝',
				id: 'c10-7',
				type: 'boss',
				text: '蚕吐梦丝成网，张汨与香紫于网中伏击。',
				prev: 'c10-6',
				enemy: [
					{ name: '蚕', id: 'ybsl_026can', level: 104, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '张汨', id: 'ybsl_047zhangmi', level: 104, tupolevel: 8, rank: 'epicfake', template: 'damger', buff: [] },
					{ name: '香紫', id: 'ybsl_069xiangzi', level: 104, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '梦衡使', id: 'ybsl_045gaocong', level: 104, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '梦晶傀', id: 'ybsl_037diamondqueen', level: 104, tupolevel: 8, rank: 'rare', template: 'defense', buff: [] },
					{ name: '梦霜傀', id: 'ybsl_122wangbingyu', level: 104, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡8：主雨 + 次熙/清月 + 杂兵
			'c10-8': {
				name: '梦雨倾盆',
				id: 'c10-8',
				type: 'boss',
				text: '雨幕倾盆而下，熙与清月藏于雨中突袭。',
				prev: 'c10-7',
				enemy: [
					{ name: '雨', id: 'ybsl_027rain', level: 106, tupolevel: 8, rank: 'epicfake', template: 'defense', buff: [] },
					{ name: '熙', id: 'ybsl_036bright', level: 106, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '清月', id: 'ybsl_068qingyue', level: 106, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '梦卷灵', id: 'ybsl_121tujing', level: 106, tupolevel: 8, rank: 'rare', template: 'balanced', buff: [] },
					{ name: '梦魇游魂', id: 'ybsl_024yuetong', level: 106, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] },
					{ name: '梦魇残影', id: 'ybsl_019shengyan', level: 106, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡9：全体真名boss（乱入）- 涂山水璃 + 朱焌 + 彡 + 房佳谕 + 鞠熒 + 岳瞳
			'c10-9': {
				name: '真名·万念交汇',
				id: 'c10-9',
				type: 'boss',
				text: '星河尽头万念交汇，涂山水璃、朱焌、彡率房佳谕、鞠熒、岳瞳跨界而来——全员真名，故人齐聚。',
				prev: 'c10-8',
				enemy: [
					{ name: '涂山水璃', id: 'ybsl_107tushanshuili', level: 108, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '朱焌', id: 'ybsl_076zhujun', level: 108, tupolevel: 8, rank: 'legend', template: 'defense', buff: [] },
					{ name: '彡', id: 'ybsl_047shan', level: 108, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '房佳谕', id: 'ybsl_043fangjiayu', level: 108, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '鞠熒', id: 'ybsl_059starsFall1', level: 108, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '岳瞳', id: 'ybsl_024yuetong', level: 108, tupolevel: 8, rank: 'rare', template: 'damger', buff: [] }
				],
			},
			// 关卡10：最终全体真名boss - 涂山水璃 + 朱焌 + 彡 + 熙 + 清月 + 香紫
			'c10-10': {
				name: '真名·梦里星河终结',
				id: 'c10-10',
				type: 'boss',
				text: '星河尽头，涂山水璃、朱焌、彡立于梦的彼岸，熙、清月、香紫随行。这场梦，由你亲手终结。',
				prev: 'c10-9',
				enemy: [
					{ name: '涂山水璃', id: 'ybsl_107tushanshuili', level: 110, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '朱焌', id: 'ybsl_076zhujun', level: 110, tupolevel: 8, rank: 'legend', template: 'defense', buff: [] },
					{ name: '彡', id: 'ybsl_047shan', level: 110, tupolevel: 8, rank: 'legend', template: 'damger', buff: [] },
					{ name: '熙', id: 'ybsl_036bright', level: 110, tupolevel: 8, rank: 'epic', template: 'damger', buff: [] },
					{ name: '清月', id: 'ybsl_068qingyue', level: 110, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] },
					{ name: '香紫', id: 'ybsl_069xiangzi', level: 110, tupolevel: 8, rank: 'epic', template: 'balanced', buff: [] }
				],
			},
		}
	},
};
export { SPeventList, eventList };
