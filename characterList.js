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
		'newtupo0',   // level 0
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
		'nuetupo16',  // level 16
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
	// ===== 主角 =====
	zhujue: {
		name: "主角", group: "zhujue", sex: "female", tupolevel: 0,
		skills: ["attack1", "attack_skill38"], isFixed: true,
		template: "balanced", rank: "common", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 平凡 (Junk) =====
	ybsl_leimoying: {
		name: "雷魔鹰", group: "zhujue", sex: "female",
		skills: ["attack999", "attack_skill999"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_fengmolang: {
		name: "风魔狼", group: "zhujue", sex: "female",
		skills: ["attack998", "attack_skill998"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_yanmohua: {
		name: "魇魔花", group: "zhujue", sex: "female",
		skills: ["attack997", "attack_skill997"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 传说级 (Legend) - YB_memory =====
	ybsl_017xiaohong: {
		name: "涂山小红", group: "YB_memory", sex: "female",
		skills: ["attack2", "attack_skill2"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_059starsFall1: {
		name: "鞠熒", group: "YB_memory", sex: "female",
		skills: ["attack1", "attack_skill1"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_047shan: {
		name: "彡", group: "YB_memory", sex: "female",
		skills: ["attack1", "attack_skill2"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_041mmuqin: {
		name: "慕琴", group: "YB_memory", sex: "female",
		skills: ["attack4", "attack_skill4"],
		template: "balanced", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_049waner: {
		name: "王婉儿", group: "YB_memory", sex: "female",
		skills: ["recover1", "recover_skill1"],
		template: "balanced", rank: "legend", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 传说级 (Legend) - YB_dream =====
	ybsl_048wushuang: {
		name: "吴爽", group: "YB_dream", sex: "female",
		skills: ["attack3", "attack_skill3"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_076zhujun: {
		name: "朱焌", group: "YB_dream", sex: "female",
		skills: ["attack1", "attack_skill2"],
		template: "defense", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_107tushanshuili: {
		name: "涂山水璃", group: "YB_dream", sex: "female",
		skills: ["attack1", "attack_skill2"],
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_008wuyuxin: {
		name: "吴雨欣", group: "YB_dream", sex: "female",
		skills: ["attack1", "attack_skill5"],
		template: "balanced", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_002chenailin: {
		name: "陈爱琳", group: "YB_dream", sex: "female",
		skills: ["recover1", "recover_skill1"],
		template: "balanced", rank: "legend", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 史诗级 (Epic) - YB_memory =====
	ybsl_015wanghairu: {
		name: "王海茹", group: "YB_memory", sex: "female",
		skills: ["recover1", "recover_skill2"],
		template: "balanced", rank: "epic", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_016manchengqi: {
		name: "满城柒", group: "YB_memory", sex: "female",
		skills: ["attack7", "attack_skill8"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_018zhangqing: {
		name: "张晴", group: "YB_memory", sex: "female",
		skills: ["attack6", "attack_skill7"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_059starsFall3: {
		name: "周靈", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill17"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_059starsFall4: {
		name: "李曉", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill20"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_068qingyue: {
		name: "清月姑娘", group: "YB_memory", sex: "female",
		skills: ["attack8", "attack_skill9"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_070lvyanqiu: {
		name: "吕艳秋", group: "YB_memory", sex: "female",
		skills: ["attack9", "attack_skill9"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_033xiaohui: {
		name: "小慧", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill7"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_038bianqiuwen: {
		name: "卞秋雯", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill6"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	db_ybsl_067snake: {
		name: "蛇妃", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill19"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 史诗级 (Epic) - YB_dream =====
	ybsl_069xiangzi: {
		name: "香紫姑娘", group: "YB_dream", sex: "female",
		skills: ["recover1", "recover_skill2"],
		template: "balanced", rank: "epic", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_001sunlisong: {
		name: "孙丽松", group: "YB_dream", sex: "female",
		skills: ["attack7", "attack_skill8"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_006wanghanzhen: {
		name: "王汉桢", group: "YB_dream", sex: "female",
		skills: ["attack6", "attack_skill7"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_009liyushan: {
		name: "李玉珊", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill6"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_010zhouyue: {
		name: "周玥", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill7"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_013yinji: {
		name: "尹超跃", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill6"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_018huanqing: {
		name: "幻晴", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill17"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_036bright: {
		name: "熙", group: "YB_dream", sex: "female",
		skills: ["attack9", "attack_skill9"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_092handan: {
		name: "玉蝶心", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill6"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_083xiaozhu: {
		name: "小筑", group: "YB_dream", sex: "female",
		skills: ["attack8", "attack_skill9"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 伪史诗 (Epicfake) - YB_memory =====
	ybsl_025shiqingyu: {
		name: "史庆宇", group: "YB_memory", sex: "female",
		skills: ["recover1", "recover_skill3"],
		template: "balanced", rank: "epicfake", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_020jiayutong: {
		name: "贾雨桐", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill13"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_025wanghe: {
		name: "王贺", group: "YB_memory", sex: "female",
		skills: ["attack8", "attack_skill33"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_042pingzi: {
		name: "蘋姉", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill22"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_043fangjiayu: {
		name: "房佳谕", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill22"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_046jiangxuewu: {
		name: "江雪舞", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill18"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_059starsFall2: {
		name: "宋橤", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill13"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_060liutianhang: {
		name: "刘天杭", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill14"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_079xiaoxin: {
		name: "小新", group: "YB_memory", sex: "female",
		skills: ["attack5", "attack_skill11"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 伪史诗 (Epicfake) - YB_dream =====
	ybsl_003yanshuang: {
		name: "闫爽", group: "YB_dream", sex: "female",
		skills: ["recover1", "recover_skill3"],
		template: "balanced", rank: "epicfake", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_004zhangyujie: {
		name: "张玉洁", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill22"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_005wangruobing: {
		name: "王若冰", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill22"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_007wugege: {
		name: "吴格格", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill18"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_011gaoyuhang: {
		name: "高宇航", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill11"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_047zhangmi: {
		name: "张汨", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill16"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_026can: {
		name: "蚕", group: "YB_dream", sex: "female",
		skills: ["attack8", "attack_skill33"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_027rain: {
		name: "雨", group: "YB_dream", sex: "female",
		skills: ["attack8", "attack_skill13"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_029dawn: {
		name: "黎", group: "YB_dream", sex: "female",
		skills: ["attack5", "attack_skill14"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 稀有 (Rare) - YB_memory =====
	ybsl_019shengyan: {
		name: "盛妍", group: "YB_memory", sex: "female",
		skills: ["attack10", "attack_skill27"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_045gaocong: {
		name: "高聪", group: "YB_memory", sex: "female",
		skills: ["recover1", "recover_skill3"],
		template: "balanced", rank: "rare", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_024yuetong: {
		name: "岳瞳", group: "YB_memory", sex: "female",
		skills: ["attack11", "attack_skill17"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_053qiuer: {
		name: "秋儿", group: "YB_memory", sex: "female",
		skills: ["attack10", "attack_skill27"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_054yueer: {
		name: "悦儿", group: "YB_memory", sex: "female",
		skills: ["attack10", "attack_skill22"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_055zhengyan: {
		name: "郑琰", group: "YB_memory", sex: "female",
		skills: ["attack10", "attack_skill20"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},

	// ===== 稀有 (Rare) - YB_dream =====
	ybsl_012zhengjiayi: {
		name: "郑佳怡", group: "YB_dream", sex: "female",
		skills: ["attack11", "attack_skill17"],
		template: "damger", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_037diamondqueen: {
		name: "方块公主", group: "YB_dream", sex: "female",
		skills: ["attack10", "attack_skill27"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_044huruihang: {
		name: "胡瑞航", group: "YB_dream", sex: "female",
		skills: ["attack10", "attack_skill22"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_121tujing: {
		name: "涂静", group: "YB_dream", sex: "female",
		skills: ["recover1", "recover_skill3"],
		template: "balanced", rank: "rare", tip: "recover", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_122wangbingyu: {
		name: "王冰雨", group: "YB_dream", sex: "female",
		skills: ["attack11", "attack_skill20"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
		])
	},
	ybsl_123xuelang: {
		name: "雪琅", group: "YB_dream", sex: "female",
		skills: ["attack10", "attack_skill27"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([
			null, null, null, null, null,
			null, null, null, null, null
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