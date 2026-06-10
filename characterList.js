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
		skills: ["pugong_000", "skill_000"],
		spskill: {
			id: "spskill_000",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		isFixed: true,
		template: "balanced", rank: "common", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 平凡 (Junk) - 编号: 501-503 =====
	ybsl_leimoying: {
		name: "雷魔鹰", group: "zhujue", sex: "female",
		skills: ["pugong_501", "skill_501"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_fengmolang: {
		name: "风魔狼", group: "zhujue", sex: "female",
		skills: ["pugong_502", "skill_502"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_yanmohua: {
		name: "魇魔花", group: "zhujue", sex: "female",
		skills: ["pugong_503", "skill_503"],
		template: "balanced", rank: "junk", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 传说级 (Legend) - YB_memory (编号: 001-005) =====
	ybsl_017xiaohong: {
		name: "涂山小红", group: "YB_memory", sex: "female",
		skills: ["pugong_001", "skill_001"],
		spskill: {
			id: "spskill_001",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_059starsFall1: {
		name: "鞠熒", group: "YB_memory", sex: "female",
		skills: ["pugong_002", "skill_002"],
		spskill: {
			id: "spskill_002",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_047shan: {
		name: "彡", group: "YB_memory", sex: "female",
		skills: ["pugong_003", "skill_003"],
		spskill: {
			id: "spskill_003",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_041mmuqin: {
		name: "慕琴", group: "YB_memory", sex: "female",
		skills: ["pugong_004", "skill_004"],
		spskill: {
			id: "spskill_004",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "balanced", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_049waner: {
		name: "王婉儿", group: "YB_memory", sex: "female",
		skills: ["pugong_005", "skill_005"],
		spskill: {
			id: "spskill_005",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "balanced", rank: "legend", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 传说级 (Legend) - YB_dream (编号: 006-010) =====
	ybsl_048wushuang: {
		name: "吴爽", group: "YB_dream", sex: "female",
		skills: ["pugong_006", "skill_006"],
		spskill: {
			id: "spskill_006",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_076zhujun: {
		name: "朱焌", group: "YB_dream", sex: "female",
		skills: ["pugong_007", "skill_007"],
		spskill: {
			id: "spskill_007",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "defense", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_107tushanshuili: {
		name: "涂山水璃", group: "YB_dream", sex: "female",
		skills: ["pugong_008", "skill_008"],
		spskill: {
			id: "spskill_008",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "damger", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_008wuyuxin: {
		name: "吴雨欣", group: "YB_dream", sex: "female",
		skills: ["pugong_009", "skill_009"],
		spskill: {
			id: "spskill_009",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "balanced", rank: "legend", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_002chenailin: {
		name: "陈爱琳", group: "YB_dream", sex: "female",
		skills: ["pugong_010", "skill_010"],
		spskill: {
			id: "spskill_010",
			unlockType: "breakthrough",
			breakLevel: 18
		},
		template: "balanced", rank: "legend", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 史诗级 (Epic) - YB_memory (编号: 101-110) =====
	ybsl_015wanghairu: {
		name: "王海茹", group: "YB_memory", sex: "female",
		skills: ["pugong_101", "skill_101"],
		template: "balanced", rank: "epic", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_016manchengqi: {
		name: "满城柒", group: "YB_memory", sex: "female",
		skills: ["pugong_102", "skill_102"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_018zhangqing: {
		name: "张晴", group: "YB_memory", sex: "female",
		skills: ["pugong_103", "skill_103"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_059starsFall3: {
		name: "周靈", group: "YB_memory", sex: "female",
		skills: ["pugong_104", "skill_104"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_059starsFall4: {
		name: "李曉", group: "YB_memory", sex: "female",
		skills: ["pugong_105", "skill_105"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_068qingyue: {
		name: "清月姑娘", group: "YB_memory", sex: "female",
		skills: ["pugong_106", "skill_106"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_070lvyanqiu: {
		name: "吕艳秋", group: "YB_memory", sex: "female",
		skills: ["pugong_107", "skill_107"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_033xiaohui: {
		name: "小慧", group: "YB_memory", sex: "female",
		skills: ["pugong_108", "skill_108"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_038bianqiuwen: {
		name: "卞秋雯", group: "YB_memory", sex: "female",
		skills: ["pugong_109", "skill_109"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	db_ybsl_067snake: {
		name: "蛇妃", group: "YB_memory", sex: "female",
		skills: ["pugong_110", "skill_110"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 史诗级 (Epic) - YB_dream (编号: 111-120) =====
	ybsl_069xiangzi: {
		name: "香紫姑娘", group: "YB_dream", sex: "female",
		skills: ["pugong_111", "skill_111"],
		template: "balanced", rank: "epic", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_001sunlisong: {
		name: "孙丽松", group: "YB_dream", sex: "female",
		skills: ["pugong_112", "skill_112"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_006wanghanzhen: {
		name: "王汉桢", group: "YB_dream", sex: "female",
		skills: ["pugong_113", "skill_113"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_009liyushan: {
		name: "李玉珊", group: "YB_dream", sex: "female",
		skills: ["pugong_114", "skill_114"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_010zhouyue: {
		name: "周玥", group: "YB_dream", sex: "female",
		skills: ["pugong_115", "skill_115"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_013yinji: {
		name: "尹超跃", group: "YB_dream", sex: "female",
		skills: ["pugong_116", "skill_116"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_018huanqing: {
		name: "幻晴", group: "YB_dream", sex: "female",
		skills: ["pugong_117", "skill_117"],
		template: "balanced", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_036bright: {
		name: "熙", group: "YB_dream", sex: "female",
		skills: ["pugong_118", "skill_118"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_092handan: {
		name: "玉蝶心", group: "YB_dream", sex: "female",
		skills: ["pugong_119", "skill_119"],
		template: "defense", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_083xiaozhu: {
		name: "小筑", group: "YB_dream", sex: "female",
		skills: ["pugong_120", "skill_120"],
		template: "damger", rank: "epic", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 伪史诗 (Epicfake) - YB_memory (编号: 201-209) =====
	ybsl_025shiqingyu: {
		name: "史庆宇", group: "YB_memory", sex: "female",
		skills: ["pugong_201", "skill_201"],
		template: "balanced", rank: "epicfake", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_020jiayutong: {
		name: "贾雨桐", group: "YB_memory", sex: "female",
		skills: ["pugong_202", "skill_202"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_025wanghe: {
		name: "王贺", group: "YB_memory", sex: "female",
		skills: ["pugong_203", "skill_203"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_042pingzi: {
		name: "蘋姉", group: "YB_memory", sex: "female",
		skills: ["pugong_204", "skill_204"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_043fangjiayu: {
		name: "房佳谕", group: "YB_memory", sex: "female",
		skills: ["pugong_205", "skill_205"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_046jiangxuewu: {
		name: "江雪舞", group: "YB_memory", sex: "female",
		skills: ["pugong_206", "skill_206"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_059starsFall2: {
		name: "宋橤", group: "YB_memory", sex: "female",
		skills: ["pugong_207", "skill_207"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_060liutianhang: {
		name: "刘天杭", group: "YB_memory", sex: "female",
		skills: ["pugong_208", "skill_208"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_079xiaoxin: {
		name: "小新", group: "YB_memory", sex: "female",
		skills: ["pugong_209", "skill_209"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 伪史诗 (Epicfake) - YB_dream (编号: 210-218) =====
	ybsl_003yanshuang: {
		name: "闫爽", group: "YB_dream", sex: "female",
		skills: ["pugong_210", "skill_210"],
		template: "balanced", rank: "epicfake", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_004zhangyujie: {
		name: "张玉洁", group: "YB_dream", sex: "female",
		skills: ["pugong_211", "skill_211"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_005wangruobing: {
		name: "王若冰", group: "YB_dream", sex: "female",
		skills: ["pugong_212", "skill_212"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_007wugege: {
		name: "吴格格", group: "YB_dream", sex: "female",
		skills: ["pugong_213", "skill_213"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_011gaoyuhang: {
		name: "高宇航", group: "YB_dream", sex: "female",
		skills: ["pugong_214", "skill_214"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_047zhangmi: {
		name: "张汨", group: "YB_dream", sex: "female",
		skills: ["pugong_215", "skill_215"],
		template: "damger", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_026can: {
		name: "蚕", group: "YB_dream", sex: "female",
		skills: ["pugong_216", "skill_216"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_027rain: {
		name: "雨", group: "YB_dream", sex: "female",
		skills: ["pugong_217", "skill_217"],
		template: "defense", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_029dawn: {
		name: "黎", group: "YB_dream", sex: "female",
		skills: ["pugong_218", "skill_218"],
		template: "balanced", rank: "epicfake", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 稀有 (Rare) - YB_memory (编号: 301-306) =====
	ybsl_019shengyan: {
		name: "盛妍", group: "YB_memory", sex: "female",
		skills: ["pugong_301", "skill_301"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_045gaocong: {
		name: "高聪", group: "YB_memory", sex: "female",
		skills: ["pugong_302", "skill_302"],
		template: "balanced", rank: "rare", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_024yuetong: {
		name: "岳瞳", group: "YB_memory", sex: "female",
		skills: ["pugong_303", "skill_303"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_053qiuer: {
		name: "秋儿", group: "YB_memory", sex: "female",
		skills: ["pugong_304", "skill_304"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_054yueer: {
		name: "悦儿", group: "YB_memory", sex: "female",
		skills: ["pugong_305", "skill_305"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_055zhengyan: {
		name: "郑琰", group: "YB_memory", sex: "female",
		skills: ["pugong_306", "skill_306"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},

	// ===== 稀有 (Rare) - YB_dream (编号: 307-312) =====
	ybsl_012zhengjiayi: {
		name: "郑佳怡", group: "YB_dream", sex: "female",
		skills: ["pugong_307", "skill_307"],
		template: "damger", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_037diamondqueen: {
		name: "方块公主", group: "YB_dream", sex: "female",
		skills: ["pugong_308", "skill_308"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_044huruihang: {
		name: "胡瑞航", group: "YB_dream", sex: "female",
		skills: ["pugong_309", "skill_309"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_121tujing: {
		name: "涂静", group: "YB_dream", sex: "female",
		skills: ["pugong_310", "skill_310"],
		template: "balanced", rank: "rare", tip: "recover", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_122wangbingyu: {
		name: "王冰雨", group: "YB_dream", sex: "female",
		skills: ["pugong_311", "skill_311"],
		template: "balanced", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
	},
	ybsl_123xuelang: {
		name: "雪琅", group: "YB_dream", sex: "female",
		skills: ["pugong_312", "skill_312"],
		template: "defense", rank: "rare", tip: "damage", ties: [],
		tupoList: generateTupoList_new([null, null, null, null, null, null, null, null, null, null])
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

