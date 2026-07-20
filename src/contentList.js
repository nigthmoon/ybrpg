//🗡️⚡🧊💧❄️☄️🔥⭐🧪🌙请使用这些作为技能特效。使用方法：
//最后一个药剂🧪为治疗特效专用，在被治疗的角色头上向下落在角色身上，然后再出治疗数字。
//🗡️为攻击一行敌人，且ai倾向为前排的专用特效，方法为从方阵最左边横穿该行，然后出伤害数字。
//🌙为攻击一行敌人，且ai倾向为后排的专用特效，方法为从方阵最左边横穿该行，然后出伤害数字。
//⚡为攻击一列敌人专用特效，从前方贯穿该列最后方，然后出伤害数字。
//🔥为攻击一名敌人专用，方法为从角色头上降落，然后出伤害数字
//其他的以后再说，先不用管
// const contentList = {
// 	pugong:{
// 		attack1:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为125%',//常规描述
// 			ai_intro:'对前排单体造成伤害，伤害系数为125%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1.25,
// 			isRecover:false,
// 			emoji:'🔥',
// 		},
// 		attack2:{
// 			name:'攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为65%',//常规描述
// 			ai_intro:'对敌方前排造成伤害，伤害系数为65%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.65,
// 			isRecover:false,
// 			emoji:'🌪️',
// 		},
// 		attack3:{
// 			name:'攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为75%',//常规描述
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为75%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.75,
// 			isRecover:false,
// 			emoji:'⚡',
// 		},
// 		attack4:{
// 			name:'攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为55%',//常规描述
// 			ai_intro:'对敌方后排造成伤害，伤害系数为55%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.55,
// 			isRecover:false,
// 			emoji:'🌙',
// 		},

// 		attack5:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为115%',//常规描述
// 			ai_intro:'对前排单体造成伤害，伤害系数为115%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1.15,
// 			isRecover:false,
// 			emoji:'🔥',
// 		},
// 		attack6:{
// 			name:'攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为60%',//常规描述
// 			ai_intro:'对敌方前排造成伤害，伤害系数为60%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.6,
// 			isRecover:false,
// 			emoji:'🌪️',
// 		},
// 		attack7:{
// 			name:'攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为70%',//常规描述
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为70%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.7,
// 			isRecover:false,
// 			emoji:'⚡',
// 		},
// 		attack8:{
// 			name:'攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为50%',//常规描述
// 			ai_intro:'对敌方后排造成伤害，伤害系数为50%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.5,
// 			isRecover:false,
// 			emoji:'🌙',
// 		},
// 		attack9:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为105%',//常规描述
// 			ai_intro:'对后排单体造成伤害，伤害系数为105%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1.05,
// 			isRecover:false,
// 			emoji:'⭐',
// 		},

// 		attack10:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为105%',//常规描述
// 			ai_intro:'对前排单体造成伤害，伤害系数为105%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1.05,
// 			isRecover:false,
// 			emoji:'🔥',
// 		},
// 		attack11:{
// 			name:'攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为65%',//常规描述
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.65,
// 			isRecover:false,
// 			emoji:'⚡',
// 		},

// 		attack12:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为95%',//常规描述
// 			ai_intro:'对前排单体造成伤害，伤害系数为95%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.95,
// 			isRecover:false,
// 			emoji:'🔥',
// 		},
// 		attack13:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为85%',//常规描述
// 			ai_intro:'对后排单体造成伤害，伤害系数为85%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.85,
// 			isRecover:false,
// 			emoji:'⭐',
// 		},

// 		attack14:{
// 			name:'攻击',
// 			intro:'对单体造成伤害，伤害系数为90%',//常规描述
// 			ai_intro:'对前排单体造成伤害，伤害系数为90%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.9,
// 			isRecover:false,
// 			emoji:'🔥',
// 		},
// 		attack15:{
// 			name:'攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为55%',//常规描述
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为55%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:0.55,
// 			isRecover:false,
// 			emoji:'🌪️',
// 		},

// 		attack999:{
// 			name:'攻击',
// 			intro:'对全体敌人造成伤害，伤害系数为100%',//常规描述
// 			ai_intro:'对全体敌人造成伤害，伤害系数为100%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['all','all'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1,
// 			isRecover:false,
// 			emoji:'⚡',
// 		},
// 		attack998:{
// 			name:'攻击',
// 			intro:'对全体敌人造成伤害，伤害系数为100%',//常规描述
// 			ai_intro:'对全体敌人造成伤害，伤害系数为100%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['all','all'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1,
// 			isRecover:false,
// 			emoji:'🌪️',
// 		},
// 		attack997:{
// 			name:'攻击',
// 			intro:'对全体敌人造成伤害，伤害系数为100%',//常规描述
// 			ai_intro:'对全体敌人造成伤害，伤害系数为100%',//代表ai的倾向
// 			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
// 			target:['all','all'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1,
// 			isRecover:false,
// 			emoji:'🌺',
// 		},

// 		recover1:{
// 			name:'回复',
// 			intro:'治疗我方单体，系数为1',//常规描述
// 			ai_intro:'治疗我方体力最低的单体，系数为1',//代表ai的倾向
// 			target:['one','lowest'],//第一个元素代表选目标模式，第二个元素ai倾向
// 			coefficient:1,
// 			isRecover:true,
// 			emoji:'🧪',
// 		}
// 	},
// 	skill:{
// 		attack_skill1:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为305%',
// 			ai_intro:'对血量最少的敌方造成伤害，伤害系数为305%',
// 			target:['one','lowest'],
// 			coefficient:3.05,
// 			isRecover:false,
// 		},
// 		attack_skill2:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为190%',
// 			ai_intro:'对敌方前排敌人造成伤害，伤害系数为190%',
// 			target:['row','first'],
// 			coefficient:1.9,
// 			isRecover:false,
// 		},
// 		attack_skill3:{
// 			name:'技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为225%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为225%',
// 			target:['column','first'],
// 			coefficient:2.25,
// 			isRecover:false,
// 		},
// 		attack_skill4:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为170%',
// 			ai_intro:'对敌方后排敌人造成伤害，伤害系数为170%',
// 			target:['row','last'],
// 			coefficient:1.7,
// 			isRecover:false,
// 		},
// 		attack_skill5:{
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为180%',
// 			ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为180%',
// 			target:['manual_multi','random',3],
// 			coefficient:1.8,
// 			isRecover:false,
// 		},

// 		attack_skill6:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为325%',
// 			ai_intro:'对敌方前排单体造成伤害，伤害系数为325%',
// 			target:['one','first'],
// 			coefficient:3.25,
// 		},
// 		attack_skill7:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为165%',
// 			ai_intro:'对敌方前排敌人造成伤害，伤害系数为165%',
// 			target:['row','first'],
// 			coefficient:1.65,
// 			isRecover:false,
// 		},
// 		attack_skill8:{
// 			name:'技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为195%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为195%',
// 			target:['column','first'],
// 			coefficient:1.95,
// 			isRecover:false,
// 		},
// 		attack_skill9:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为155%',
// 			ai_intro:'对敌方后排敌人造成伤害，伤害系数为155%',
// 			target:['row','last'],
// 			coefficient:1.55,
// 			isRecover:false,
// 		},
// 		attack_skill10:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为175%',
// 			ai_intro:'对敌方前排敌人造成伤害，伤害系数为175%',
// 			target:['row','first'],
// 			coefficient:1.75,
// 			isRecover:false,
// 		},

// 		attack_skill11:{
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为130%',
// 			ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为130%',
// 			target:['manual_multi','manahighest',3],
// 			coefficient:1.3,
// 			isRecover:false,
// 		},
// 		attack_skill12:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为335%',
// 			ai_intro:'对敌方血量最高单体造成伤害，伤害系数为335%',
// 			target:['one','highest'],
// 			coefficient:3.35,
// 			isRecover:false,
// 		},
// 		attack_skill13:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为305%',
// 			ai_intro:'对敌方前排单体造成伤害，伤害系数为305%',
// 			target:['one','first'],
// 			coefficient:3.05,
// 			isRecover:false,
// 		},
// 		attack_skill14:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为150%',
// 			ai_intro:'对敌方前排敌人造成伤害，伤害系数为150%',
// 			target:['row','first'],
// 			coefficient:1.5,
// 			isRecover:false,
// 		},
// 		attack_skill15:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为140%',
// 			ai_intro:'对敌方后排敌人造成伤害，伤害系数为140%',
// 			target:['row','last'],
// 			coefficient:1.4,
// 			isRecover:false,
// 		},
// 		attack_skill16:{
// 			name:'技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为180%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为180%',
// 			target:['column','first'],
// 			coefficient:1.8,
// 			isRecover:false,
// 		},
// 		attack_skill17:{
// 			name:'技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为205%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%',
// 			target:['column','first'],
// 			coefficient:2.05,
// 			isRecover:false,
// 		},
// 		attack_skill18:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为145%',
// 			ai_intro:'对敌方后排敌人造成伤害，伤害系数为145%',
// 			target:['row','last'],
// 			coefficient:1.45,
// 			isRecover:false,

// 		},
// 		attack_skill19:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为265%',
// 			ai_intro:'对血量最少的敌方造成伤害，伤害系数为265%',
// 			target:['one','lowest'],
// 			coefficient:2.65,
// 			isRecover:false,
// 		},
// 		attack_skill20:{
// 			name:'技能攻击',
// 			intro:'对全体造成伤害，伤害系数为105%',
// 			ai_intro:'对全体敌方造成伤害，伤害系数为105%',
// 			target:['all','all'],
// 			coefficient:1.05,
// 			isRecover:false,
// 		},

// 		attack_skill21:{
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为135%',
// 			ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为135%',
// 			target:['manual_multi','manahighest',3],
// 			coefficient:1.35,
// 			isRecover:false,

// 		},
// 		attack_skill22:{
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为150%',
// 			ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为150%',
// 			target:['manual_multi','random',3],
// 			coefficient:1.5,
// 			isRecover:false,

// 		},
// 		attack_skill23:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为285%',
// 			ai_intro:'对敌方后排单体造成伤害，伤害系数为285%',
// 			target:['one','last'],
// 			coefficient:2.85,
// 			isRecover:false,
// 		},

// 		attack_skill24:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为255%',
// 			ai_intro:'对敌方后排单体造成伤害，伤害系数为255%',
// 			target:['one','last'],
// 			coefficient:2.55,
// 			isRecover:false,

// 		},
// 		attack_skill25:{
// 			name:'技能攻击',
// 			intro:'对全体造成伤害，伤害系数为90%',
// 			ai_intro:'对全体敌方造成伤害，伤害系数为90%',
// 			target:['all','all'],
// 			coefficient:0.9,
// 			isRecover:false,
// 		},
// 		attack_skill27:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为285%',
// 			ai_intro:'对敌方前排单体造成伤害，伤害系数为285%',
// 			target:['one','first'],
// 			coefficient:2.85,
// 			isRecover:false,
// 		},
// 		attack_skill28:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为140%',
// 			ai_intro:'对敌方前排敌人造成伤害，伤害系数为140%',
// 			target:['row','first'],
// 			coefficient:1.4,
// 			isRecover:false,
// 		},
// 		attack_skill29:{
// 			name:'技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为170%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为170%',
// 			target:['column','first'],
// 			coefficient:1.7,
// 		},
// 		attack_skill30:{
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为135%',
// 			ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为135%',
// 			target:['manual_multi','random',3],
// 			coefficient:1.35,
// 			isRecover:false,

// 		},
// 		attack_skill31:{
// 			name:'技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为130%',
// 			ai_intro:'对敌方后排敌人造成伤害，伤害系数为130%',
// 			target:['row','last'],
// 			coefficient:1.3,
// 			isRecover:false,
// 		},
// 		attack_skill32:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为230%',
// 			ai_intro:'对血量最少的敌方造成伤害，伤害系数为230%',
// 			target:['one','lowest'],
// 			coefficient:2.3,
// 			isRecover:false,
// 		},
// 		attack_skill33:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为310%',
// 			ai_intro:'对敌方血量最高单体造成伤害，伤害系数为310%',
// 			target:['one','highest'],
// 			coefficient:3.1,
// 			isRecover:false,
// 		},

// 		attack_skill34:{
// 			name:'技能攻击',
// 			intro:'对单体造成伤害，伤害系数为270%',
// 			ai_intro:'对敌方前排单体造成伤害，伤害系数为270%',
// 			target:['one','first'],
// 			coefficient:2.7,
// 			isRecover:false,
// 		},
// 		attack_skill35:{
// 			name:'技能攻击',
// 			intro:'对全体造成伤害，伤害系数为85%',
// 			ai_intro:'对全体敌方造成伤害，伤害系数为85%',
// 			target:['all','all'],
// 			coefficient:0.85,
// 			isRecover:false,
// 		},
// 		attack_skill36:{
// 			name:'技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为160%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为160%',
// 			target:['column','first'],
// 			coefficient:1.6,
// 			isRecover:false,
// 		},
// 		attack_skill37:{
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为130%',
// 			ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为130%',
// 			target:['manual_multi','random',3],
// 			coefficient:1.3,
// 			isRecover:false,
// 		},

// 		attack_skill38:{//主角专用的
// 			name:'技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为165%',
// 			ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为165%',
// 			target:['manual_multi','random',3],
// 			coefficient:1.65,
// 			isRecover:false,

// 		},

// 		attack_skill999:{
// 			name:'技能攻击',
// 			intro:'对全体造成伤害，伤害系数为100%',
// 			ai_intro:'对全体敌方造成伤害，伤害系数为100%',
// 			target:['all','all'],
// 			coefficient:1,
// 			isRecover:false,
// 		},
// 		attack_skill998:{
// 			name:'技能攻击',
// 			intro:'对全体造成伤害，伤害系数为100%',
// 			ai_intro:'对全体敌方造成伤害，伤害系数为100%',
// 			target:['all','all'],
// 			coefficient:1,
// 			isRecover:false,
// 		},
// 		attack_skill997:{
// 			name:'技能攻击',
// 			intro:'对全体造成伤害，伤害系数为100%',
// 			ai_intro:'对全体敌方造成伤害，伤害系数为100%',
// 			target:['all','all'],
// 			coefficient:1,
// 			isRecover:false,
// 		},

// 		recover_skill1:{
// 			name:'技能回复',
// 			intro:'治疗全体友方，系数为125%',
// 			ai_intro:'治疗全体友方，系数为125%',
// 			target:['all','all'],
// 			coefficient:1.25,
// 			isRecover:true,
// 		},
// 		recover_skill2:{
// 			name:'技能回复',
// 			intro:'治疗全体友方，系数为115%',
// 			ai_intro:'治疗全体友方，系数为115%',
// 			target:['all','all'],
// 			coefficient:1.15,
// 			isRecover:true,
// 		},
// 		recover_skill3:{
// 			name:'技能回复',
// 			intro:'治疗全体友方，系数为100%',
// 			ai_intro:'治疗全体友方，系数为100%',
// 			target:['all','all'],
// 			coefficient:1,
// 			isRecover:true,
// 		},
// 	},
// 	spskill:{
// 		attack_spskill1:{
// 			name:'必杀技能攻击',
// 			intro:'对单体造成伤害，伤害系数为335%',
// 			ai_intro:'对血量最少的敌方造成伤害，伤害系数为335%',
// 			target:['one','lowest'],
// 			coefficient:3.35,
// 			isRecover:false,
// 		},
// 		attack_spskill2:{
// 			name:'必杀技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为210%',
// 			ai_intro:'对敌方前排敌人造成伤害，伤害系数为210%',
// 			target:['row','first'],
// 			coefficient:2.1,
// 			isRecover:false,
// 		},
// 		attack_spskill3:{
// 			name:'必杀技能攻击',
// 			intro:'对一列敌人造成伤害，伤害系数为250%',
// 			ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为250%',
// 			target:['column','first'],
// 			coefficient:2.5,
// 			isRecover:false,
// 		},
// 		attack_spskill4:{
// 			name:'必杀技能攻击',
// 			intro:'对一行敌人造成伤害，伤害系数为190%',
// 			ai_intro:'对敌方后排敌人造成伤害，伤害系数为190%',
// 			target:['row','last'],
// 			coefficient:1.9,
// 			isRecover:false,
// 		},
// 		attack_spskill5:{
// 			name:'必杀技能攻击',
// 			intro:'对三名敌人造成伤害，伤害系数为200%',
// 			ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为200%',
// 			target:['manual_multi','random',3],
// 			coefficient:2,
// 			isRecover:true,
// 		},
// 		recover_spskill1:{
// 			name:'必杀技能回复',
// 			intro:'治疗全体友方，系数为150%',
// 			ai_intro:'治疗全体友方，系数为150%',
// 			target:['all','all'],
// 			coefficient:1.5,
// 			isRecover:true,
// 		}

// 	},
// }
// ==================== contentList.js ====================
// 技能定义库 - 方案1：每个角色拥有专属技能ID
// 保留原始的攻击系数和目标模式
// ==================== contentList.js ====================
// 完全搬运原始数据，只改ID格式

const contentList = {
	pugong: {
		pugong_000: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为125%",
			ai_intro: "对前排单体造成伤害，伤害系数为125%",
			target: ["one", "first"],
			coefficient: 1.25,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_001: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为65%",
			ai_intro: "对敌方前排造成伤害，伤害系数为65%",
			target: ["row", "first"],
			coefficient: 0.65,
			isRecover: false,
			emoji: "❤️",
		},
		pugong_002: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为125%",
			ai_intro: "对前排单体造成伤害，伤害系数为125%",
			target: ["one", "first"],
			coefficient: 1.25,
			isRecover: false,
			emoji: "☄️",
		},
		pugong_003: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为125%",
			ai_intro: "对前排单体造成伤害，伤害系数为125%",
			target: ["one", "first"],
			coefficient: 1.25,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_004: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为55%", //常规描述
			ai_intro: "对敌方后排造成伤害，伤害系数为55%", //代表ai的倾向
			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
			target: ["row", "last"], //第一个元素代表选目标模式，第二个元素ai倾向
			coefficient: 0.55,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_005: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		pugong_006: {
			name: "攻击",
			intro: "对一列敌人造成伤害，伤害系数为75%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为75%",
			target: ["column", "first"],
			coefficient: 0.75,
			isRecover: false,
			emoji: "🍁",
		},
		pugong_007: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为125%",
			ai_intro: "对前排单体造成伤害，伤害系数为125%",
			target: ["row", "last"],
			coefficient: 0.55,
			isRecover: false,
			emoji: "💧",
		},
		pugong_008: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为125%",
			ai_intro: "对前排单体造成伤害，伤害系数为125%",
			target: ["one", "first"],
			coefficient: 1.25,
			isRecover: false,
			emoji: "❤️",
		},
		pugong_009: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为125%",
			ai_intro: "对前排单体造成伤害，伤害系数为125%",
			target: ["one", "first"],
			coefficient: 1.25,
			isRecover: false,
			emoji: "🧊",
		},
		pugong_010: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},

		pugong_101: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		pugong_102: {
			name: "攻击",
			intro: "对一列敌人造成伤害，伤害系数为70%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为70%",
			target: ["column", "first"],
			coefficient: 0.7,
			isRecover: false,
			emoji: "🎵",
		},
		pugong_103: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为60%",
			ai_intro: "对敌方前排造成伤害，伤害系数为60%",
			target: ["row", "first"],
			coefficient: 0.6,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_104: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "☄️",
		},
		pugong_105: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "💧",
		},
		pugong_106: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为50%",
			ai_intro: "对敌方后排造成伤害，伤害系数为50%",
			target: ["row", "last"],
			coefficient: 0.5,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_107: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对后排单体造成伤害，伤害系数为105%",
			target: ["one", "last"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "❄️",
		},
		pugong_108: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_109: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_110: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_111: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		pugong_112: {
			name: "攻击",
			intro: "对一列敌人造成伤害，伤害系数为70%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为70%",
			target: ["column", "first"],
			coefficient: 0.7,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_113: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为60%",
			ai_intro: "对敌方前排造成伤害，伤害系数为60%",
			target: ["row", "first"],
			coefficient: 0.6,
			isRecover: false,
			emoji: "🌪️",
		},
		pugong_114: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_115: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_116: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_117: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_118: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对后排单体造成伤害，伤害系数为105%",
			target: ["one", "last"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "⭐",
		},
		pugong_119: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_120: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为50%",
			ai_intro: "对敌方后排造成伤害，伤害系数为50%",
			target: ["row", "last"],
			coefficient: 0.5,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_201: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		pugong_202: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🎵",
		},
		pugong_203: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为50%",
			ai_intro: "对敌方后排造成伤害，伤害系数为50%",
			target: ["row", "last"],
			coefficient: 0.5,
			isRecover: false,
			emoji: "🧪",
		},
		pugong_204: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🧊",
		},
		pugong_205: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🌺",
		},
		pugong_206: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "❄️",
		},
		pugong_207: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🌺",
		},
		pugong_208: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_209: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🎵",
		},
		pugong_210: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		pugong_211: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🧊",
		},
		pugong_212: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🧊",
		},
		pugong_213: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_214: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "💀",
		},
		pugong_215: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "🔥",
		},
		pugong_216: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为50%",
			ai_intro: "对敌方后排造成伤害，伤害系数为50%",
			target: ["row", "last"],
			coefficient: 0.5,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_217: {
			name: "攻击",
			intro: "对一行敌人造成伤害，伤害系数为50%",
			ai_intro: "对敌方后排造成伤害，伤害系数为50%",
			target: ["row", "last"],
			coefficient: 0.5,
			isRecover: false,
			emoji: "💧",
		},
		pugong_218: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为115%",
			ai_intro: "对前排单体造成伤害，伤害系数为115%",
			target: ["one", "first"],
			coefficient: 1.15,
			isRecover: false,
			emoji: "⭐",
		},
		pugong_301: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "💧",
		},
		pugong_302: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "❤️",
		},
		pugong_303: {
			name: "攻击",
			intro: "对一列敌人造成伤害，伤害系数为65%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%",
			target: ["column", "first"],
			coefficient: 0.65,
			isRecover: false,
			emoji: "🎵",
		},
		pugong_304: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "❤️",
		},
		pugong_305: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "💥",
		},
		pugong_306: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "💥",
		},
		pugong_307: {
			name: "攻击",
			intro: "对一列敌人造成伤害，伤害系数为65%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%",
			target: ["column", "first"],
			coefficient: 0.65,
			isRecover: false,
			emoji: "🧊",
		},
		pugong_308: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "💎",
		},
		pugong_309: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "🌙",
		},
		pugong_310: {
			name: "回复",
			intro: "治疗我方单体，系数为1",
			ai_intro: "治疗我方体力最低的单体，系数为1",
			target: ["one", "lowest"],
			coefficient: 1,
			isRecover: true,
			emoji: "❤️",
		},
		pugong_311: {
			name: "攻击",
			intro: "对一列敌人造成伤害，伤害系数为65%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%",
			target: ["column", "first"],
			coefficient: 0.65,
			isRecover: false,
			emoji: "🧊",
		},
		pugong_312: {
			name: "攻击",
			intro: "对单体造成伤害，伤害系数为105%",
			ai_intro: "对前排单体造成伤害，伤害系数为105%",
			target: ["one", "first"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "❄️",
		},

		pugong_501: {
			name: "攻击",
			intro: "对全体敌人造成伤害，伤害系数为100%", //常规描述
			ai_intro: "对全体敌人造成伤害，伤害系数为100%", //代表ai的倾向
			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
			target: ["all", "all"], //第一个元素代表选目标模式，第二个元素ai倾向
			coefficient: 1,
			isRecover: false,
			emoji: "⚡",
		},
		pugong_502: {
			name: "攻击",
			intro: "对全体敌人造成伤害，伤害系数为100%", //常规描述
			ai_intro: "对全体敌人造成伤害，伤害系数为100%", //代表ai的倾向
			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
			target: ["all", "all"], //第一个元素代表选目标模式，第二个元素ai倾向
			coefficient: 1,
			isRecover: false,
			emoji: "🌪️",
		},
		pugong_503: {
			name: "攻击",
			intro: "对全体敌人造成伤害，伤害系数为100%", //常规描述
			ai_intro: "对全体敌人造成伤害，伤害系数为100%", //代表ai的倾向
			//名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
			target: ["all", "all"], //第一个元素代表选目标模式，第二个元素ai倾向
			coefficient: 1,
			isRecover: false,
			emoji: "🌺",
		},
	},
	skill: {
		//部分技能带有额外效果，默认省略前提：释放技能或技能命中等，
		//根据实际效果或类似效果决定
		skill_000: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为165%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为165%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.65,
			isRecover: false,
			emoji: "🔥",
		},
		skill_001: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为190%，45%几率释放普攻",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为190%，45%几率释放普攻",
			target: ["row", "first"],
			coefficient: 1.9,
			isRecover: false,
			emoji: "❤️",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return Math.random() < 0.45;
					},
					desc: "45%几率释放普攻",
					content: function (info) {
						const pId = this.skills[0];
						const pData = (contentList && contentList.pugong && contentList.pugong[pId]) || null;
						if (!pData) return;
						const enemySide = this.side === "player" ? "enemy" : "player";
						const targets = Game.Battle.resolveSkillTargets(pData, this, enemySide);
						if (targets && targets.length) {
							Game.Battle.executePugong(this, targets, function () {});
						}
					},
				},
			],
		},
		skill_002: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为305%，60%几率提升30%攻击2回合", //（以战斗开始时的攻击力计算）
			ai_intro: "对血量最少的敌方造成伤害，伤害系数为305%，60%几率提升30%攻击2回合",
			target: ["one", "lowest"],
			coefficient: 3.05,
			isRecover: false,
			emoji: "☄️",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return Math.random() < 0.6;
					},
					desc: "60%几率提升30%攻击2回合",
					content: function (info) {
						Game.Battle.addBuff(this, { id: "atk_up_self_30", name: "攻击提升", type: "atk", value: 0.3, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_003: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为190%，75%几率封印目标1回合",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为190%，75%几率封印目标1回合",
			target: ["row", "first"],
			coefficient: 1.9,
			isRecover: false,
			emoji: "🌪️",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.75;
					},
					desc: "75%几率封印目标1回合",
					content: function (target) {
						Game.Battle.addBuff(target, { id: "seal_target", name: "封印", type: "seal", remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_004: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为170%，75%几率封印目标1回合",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为170%，75%几率封印目标1回合",
			target: ["row", "last"],
			coefficient: 1.7,
			isRecover: false,
			emoji: "🌙",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.75;
					},
					desc: "75%几率封印目标1回合",
					content: function (target) {
						Game.Battle.addBuff(target, { id: "seal_target", name: "封印", type: "seal", remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_005: {
			name: "技能回复",
			//不死效果解释：限一次的亡语效果，回复生命至1点。
			//其实原游戏的表现为受到致命伤害，但负值的血量自动变成0，然后飘出一个1的回复量
			intro: "治疗全体友方，系数为125%，40%几率为目标施加不死效果1回合",
			ai_intro: "治疗全体友方，系数为125%，40%几率为目标施加不死效果1回合",
			target: ["all", "all"],
			coefficient: 1.25,
			isRecover: true,
			emoji: "🧪",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.4;
					},
					desc: "40%几率施加不死效果1回合",
					content: function (target) {
						// 每次施加生成独立 id，使多个不死成为独立实体（FIFO 消耗、触发时移除被激发的那个）
						const seq = (target._undyingSeq = (target._undyingSeq || 0) + 1);
						Game.Battle.addBuff(target, { id: "undying_" + seq, name: "不死", type: "undying", value: 1, remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_006: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为225%，100%几率提升自身4000暴击2回合",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为225%，100%几率提升自身4000暴击2回合",
			target: ["column", "first"],
			coefficient: 2.25,
			isRecover: false,
			emoji: "🍁",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return true;
					},
					desc: "100%几率提升自身4000暴击2回合",
					content: function (info) {
						Game.Battle.addBuff(this, { id: "baoji_self_4000", name: "暴击提升", type: "baoji", value: 4000, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_007: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为190%，100%几率提升自身4000格挡2回合",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为190%，100%几率提升自身4000格挡2回合",
			target: ["row", "first"],
			coefficient: 1.9,
			isRecover: false,
			emoji: "💧",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return true;
					},
					desc: "100%几率提升自身4000格挡2回合",
					content: function (info) {
						Game.Battle.addBuff(this, { id: "gedang_self_4000", name: "格挡提升", type: "gedang", value: 4000, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_008: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为190%，40%几率眩晕目标1回合",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为190%，40%几率眩晕目标1回合",
			target: ["row", "first"],
			coefficient: 1.9,
			isRecover: false,
			emoji: "❤️",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.4;
					},
					desc: "40%几率眩晕目标1回合",
					content: function (target) {
						Game.Battle.addBuff(target, { id: "stun_target", name: "眩晕", type: "stun", remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		skill_009: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为180%，20%几率减少目标2点能量",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为180%，20%几率减少目标2点能量",
			target: ["manual_multi", "random", 3],
			coefficient: 1.8,
			isRecover: false,
			emoji: "🧊",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.2;
					},
					desc: "20%几率减少目标2点能量",
					content: function (target) {
						target.energy = Math.max(0, (target.energy || 0) - 2);
						Game.Battle.log(`${this.name} 减少 ${target.name} 2 点能量`);
					},
				},
			],
		},
		skill_010: {
			name: "技能回复",
			intro: "治疗全体友方，系数为125%，35%几率增加目标1点能量",
			ai_intro: "治疗全体友方，系数为125%，35%几率增加目标1点能量",
			target: ["all", "all"],
			coefficient: 1.25,
			isRecover: true,
			emoji: "🧪",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.35;
					},
					desc: "35%几率增加目标1点能量",
					content: function (target) {
						target.energy = Math.min(8, (target.energy || 0) + 1);
						Game.Battle.log(`${this.name} 为 ${target.name} 增加 1 点能量`);
					},
				},
			],
		},
		skill_101: {
			name: "技能回复",
			intro: "治疗全体友方，系数为115%，20%几率令目标恢复1能量",
			ai_intro: "治疗全体友方，系数为115%，20%几率令目标恢复1能量",
			target: ["all", "all"],
			coefficient: 1.15,
			isRecover: true,
			emoji: "🧪",
		},
		skill_102: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为195%，65%几率提升自身4000暴击2回合",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为195%，65%几率提升自身4000暴击2回合",
			target: ["column", "first"],
			coefficient: 1.95,
			isRecover: false,
			emoji: "🎵",
		},
		skill_103: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为165%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为165%",
			target: ["row", "first"],
			coefficient: 1.65,
			isRecover: false,
			emoji: "🌙",
		},
		skill_104: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为205%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%",
			target: ["column", "first"],
			coefficient: 2.05,
			isRecover: false,
			emoji: "☄️",
		},
		skill_105: {
			name: "技能攻击",
			intro: "对全体造成伤害，伤害系数为105%",
			ai_intro: "对全体敌方造成伤害，伤害系数为105%",
			target: ["all", "all"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "💧",
		},
		skill_106: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为155%",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为155%",
			target: ["row", "last"],
			coefficient: 1.55,
			isRecover: false,
			emoji: "🌙",
		},
		skill_107: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为155%",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为155%",
			target: ["row", "last"],
			coefficient: 1.55,
			isRecover: false,
			emoji: "❄️",
		},
		skill_108: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为165%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为165%",
			target: ["row", "first"],
			coefficient: 1.65,
			isRecover: false,
			emoji: "🔥",
		},
		skill_109: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为325%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为325%",
			target: ["one", "first"],
			coefficient: 3.25,
			isRecover: false,
			emoji: "🪨",
		},
		skill_110: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为265%",
			ai_intro: "对血量最少的敌方造成伤害，伤害系数为265%",
			target: ["one", "lowest"],
			coefficient: 2.65,
			isRecover: false,
			emoji: "🔥",
		},
		skill_111: {
			name: "技能回复",
			intro: "治疗全体友方，系数为115%",
			ai_intro: "治疗全体友方，系数为115%",
			target: ["all", "all"],
			coefficient: 1.15,
			isRecover: true,
			emoji: "🧪",
		},
		skill_112: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为195%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为195%",
			target: ["column", "first"],
			coefficient: 1.95,
			isRecover: false,
			emoji: "🌙",
		},
		skill_113: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为165%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为165%",
			target: ["row", "first"],
			coefficient: 1.65,
			isRecover: false,
			emoji: "🌪️",
		},
		skill_114: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为325%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为325%",
			target: ["one", "first"],
			coefficient: 3.25,
			isRecover: false,
			emoji: "🪨",
		},
		skill_115: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为165%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为165%",
			target: ["row", "first"],
			coefficient: 1.65,
			isRecover: false,
			emoji: "🌙",
		},
		skill_116: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为325%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为325%",
			target: ["one", "first"],
			coefficient: 3.25,
			isRecover: false,
			emoji: "🔥",
		},
		skill_117: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为205%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%",
			target: ["column", "first"],
			coefficient: 2.05,
			isRecover: false,
			emoji: "🌙",
		},
		skill_118: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为155%",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为155%",
			target: ["row", "last"],
			coefficient: 1.55,
			isRecover: false,
			emoji: "⭐",
		},
		skill_119: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为325%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为325%",
			target: ["one", "first"],
			coefficient: 3.25,
			isRecover: false,
			emoji: "🔥",
		},
		skill_120: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为155%",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为155%",
			target: ["row", "last"],
			coefficient: 1.55,
			isRecover: false,
			emoji: "🌙",
		},
		skill_201: {
			name: "技能回复",
			intro: "治疗全体友方，系数为100%",
			ai_intro: "治疗全体友方，系数为100%",
			target: ["all", "all"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		skill_202: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为305%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为305%",
			target: ["one", "first"],
			coefficient: 3.05,
			isRecover: false,
			emoji: "🎵",
		},
		skill_203: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为310%",
			ai_intro: "对敌方血量最高单体造成伤害，伤害系数为310%",
			target: ["one", "highest"],
			coefficient: 3.1,
			isRecover: false,
			emoji: "🧪",
		},
		skill_204: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为150%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🧊",
		},
		skill_205: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为150%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🌺",
		},
		skill_206: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为145%",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为145%",
			target: ["row", "last"],
			coefficient: 1.45,
			isRecover: false,
			emoji: "❄️",
		},
		skill_207: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为305%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为305%",
			target: ["one", "first"],
			coefficient: 3.05,
			isRecover: false,
			emoji: "🌺",
		},
		skill_208: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为150%",
			target: ["row", "first"],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🌪️",
		},
		skill_209: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为130%",
			ai_intro: "对三名敌方能量最高的敌人造成伤害，伤害系数为130%",
			target: ["manual_multi", "manahighest", 3],
			coefficient: 1.3,
			isRecover: false,
			emoji: "🎵",
		},
		skill_210: {
			name: "技能回复",
			intro: "治疗全体友方，系数为100%",
			ai_intro: "治疗全体友方，系数为100%",
			target: ["all", "all"],
			coefficient: 1,
			isRecover: true,
			emoji: "🧪",
		},
		skill_211: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为150%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🧊",
		},
		skill_212: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为150%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🧊",
		},
		skill_213: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为145%",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为145%",
			target: ["row", "last"],
			coefficient: 1.45,
			isRecover: false,
			emoji: "🌙",
		},
		skill_214: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为130%",
			ai_intro: "对三名敌方能量最高的敌人造成伤害，伤害系数为130%",
			target: ["manual_multi", "manahighest", 3],
			coefficient: 1.3,
			isRecover: false,
			emoji: "💀",
		},
		skill_215: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为180%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为180%",
			target: ["column", "first"],
			coefficient: 1.8,
			isRecover: false,
			emoji: "💥",
		},
		skill_216: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为310%",
			ai_intro: "对敌方血量最高单体造成伤害，伤害系数为310%",
			target: ["one", "highest"],
			coefficient: 3.1,
			isRecover: false,
			emoji: "🌙",
		},
		skill_217: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为150%",
			target: ["row", "first"],
			coefficient: 1.5,
			isRecover: false,
			emoji: "💧",
		},
		skill_218: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为150%",
			target: ["row", "first"],
			coefficient: 1.5,
			isRecover: false,
			emoji: "⭐",
		},
		skill_301: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为285%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为285%",
			target: ["one", "first"],
			coefficient: 2.85,
			isRecover: false,
			emoji: "💧",
		},
		skill_302: {
			name: "技能回复",
			intro: "治疗全体友方，系数为100%",
			ai_intro: "治疗全体友方，系数为100%",
			target: ["all", "all"],
			coefficient: 1,
			isRecover: true,
			emoji: "❤️",
		},
		skill_303: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为205%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%",
			target: ["column", "first"],
			coefficient: 2.05,
			isRecover: false,
			emoji: "🎵",
		},
		skill_304: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为285%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为285%",
			target: ["one", "first"],
			coefficient: 2.85,
			isRecover: false,
			emoji: "❤️",
		},
		skill_305: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为150%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.5,
			isRecover: false,
			emoji: "💥",
		},
		skill_306: {
			name: "技能攻击",
			intro: "对全体造成伤害，伤害系数为105%",
			ai_intro: "对全体敌方造成伤害，伤害系数为105%",
			target: ["all", "all"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "💥",
		},
		skill_307: {
			name: "技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为205%",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%",
			target: ["column", "first"],
			coefficient: 2.05,
			isRecover: false,
			emoji: "🧊",
		},
		skill_308: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为285%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为285%",
			target: ["one", "first"],
			coefficient: 2.85,
			isRecover: false,
			emoji: "💎",
		},
		skill_309: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为150%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为150%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🌙",
		},
		skill_310: {
			name: "技能回复",
			intro: "治疗全体友方，系数为100%",
			ai_intro: "治疗全体友方，系数为100%",
			target: ["all", "all"],
			coefficient: 1,
			isRecover: true,
			emoji: "❤️",
		},
		skill_311: {
			name: "技能攻击",
			intro: "对全体造成伤害，伤害系数为105%",
			ai_intro: "对全体敌方造成伤害，伤害系数为105%",
			target: ["all", "all"],
			coefficient: 1.05,
			isRecover: false,
			emoji: "🧊",
		},
		skill_312: {
			name: "技能攻击",
			intro: "对单体造成伤害，伤害系数为285%",
			ai_intro: "对敌方前排单体造成伤害，伤害系数为285%",
			target: ["one", "first"],
			coefficient: 2.85,
			isRecover: false,
			emoji: "❄️",
		},

		skill_501: {
			name: "技能攻击",
			intro: "对全体造成伤害，伤害系数为150%",
			ai_intro: "对全体敌方造成伤害，伤害系数为150%",
			target: ["all", "all"],
			coefficient: 1.5,
			isRecover: false,
			emoji: "⚡",
		},
		skill_502: {
			name: "技能攻击",
			intro: "对全体造成伤害，伤害系数为150%",
			ai_intro: "对全体敌方造成伤害，伤害系数为150%",
			target: ["all", "all"],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🌪️",
		},
		skill_503: {
			name: "技能攻击",
			intro: "对全体造成伤害，伤害系数为150%",
			ai_intro: "对全体敌方造成伤害，伤害系数为150%",
			target: ["all", "all"],
			coefficient: 1.5,
			isRecover: false,
			emoji: "🌺",
		},
	},
	spskill: {
		spskill_000: {
			name: "技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为185%",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为185%",
			target: ["manual_multi", "random", 3],
			coefficient: 1.85,
			isRecover: false,
			emoji: "🔥",
		},
		spskill_001: {
			name: "必杀技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为210%，100%几率释放普攻",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为210%，100%几率释放普攻",
			target: ["row", "first"],
			coefficient: 2.1,
			isRecover: false,
			emoji: "❤️",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return true;
					},
					desc: "100%几率释放普攻",
					content: function (info) {
						const pId = this.skills[0];
						const pData = (contentList && contentList.pugong && contentList.pugong[pId]) || null;
						if (!pData) return;
						const enemySide = this.side === "player" ? "enemy" : "player";
						const targets = Game.Battle.resolveSkillTargets(pData, this, enemySide);
						if (targets && targets.length) {
							Game.Battle.executePugong(this, targets, function () {});
						}
					},
				},
			],
		},
		spskill_002: {
			name: "必杀技能攻击",
			intro: "对单体造成伤害，伤害系数为335%，100%几率提升45%攻击2回合",
			ai_intro: "对血量最少的敌方造成伤害，伤害系数为335%，100%几率提升45%攻击2回合",
			target: ["one", "lowest"],
			coefficient: 3.35,
			isRecover: false,
			emoji: "☄️",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return true;
					},
					desc: "100%几率提升45%攻击2回合",
					content: function (info) {
						Game.Battle.addBuff(this, { id: "atk_up_self_45", name: "攻击提升", type: "atk", value: 0.45, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_003: {
			name: "技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为210%，75%几率封印目标2回合",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为210%，75%几率封印目标2回合",
			target: ["row", "first"],
			coefficient: 2.1,
			isRecover: false,
			emoji: "🌪️",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.75;
					},
					desc: "75%几率封印目标2回合",
					content: function (target) {
						Game.Battle.addBuff(target, { id: "seal_target", name: "封印", type: "seal", remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_004: {
			name: "必杀技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为190%，75%几率封印目标2回合",
			ai_intro: "对敌方后排敌人造成伤害，伤害系数为190%，75%几率封印目标2回合",
			target: ["row", "last"],
			coefficient: 1.9,
			isRecover: false,
			emoji: "🌙",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.75;
					},
					desc: "75%几率封印目标2回合",
					content: function (target) {
						Game.Battle.addBuff(target, { id: "seal_target", name: "封印", type: "seal", remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_005: {
			name: "必杀技能回复",
			intro: "治疗全体友方，系数为150%，85%几率为目标施加不死效果1回合",
			ai_intro: "治疗全体友方，系数为150%，85%几率为目标施加不死效果1回合",
			target: ["all", "all"],
			coefficient: 1.5,
			isRecover: true,
			emoji: "🧪",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.85;
					},
					desc: "85%几率施加不死效果1回合",
					content: function (target) {
						// 每次施加生成独立 id，使多个不死成为独立实体（FIFO 消耗、触发时移除被激发的那个）
						const seq = (target._undyingSeq = (target._undyingSeq || 0) + 1);
						Game.Battle.addBuff(target, { id: "undying_" + seq, name: "不死", type: "undying", value: 1, remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_006: {
			name: "必杀技能攻击",
			intro: "对一列敌人造成伤害，伤害系数为250%，100%几率提升自身10000暴击2回合",
			ai_intro: "对敌方默认前排所在的一列敌人造成伤害，伤害系数为250%，100%几率提升自身10000暴击2回合",
			target: ["column", "first"],
			coefficient: 2.5,
			isRecover: false,
			emoji: "🍁",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return true;
					},
					desc: "100%几率提升自身10000暴击2回合",
					content: function (info) {
						Game.Battle.addBuff(this, { id: "baoji_self_10000", name: "暴击提升", type: "baoji", value: 10000, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_007: {
			name: "必杀技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为210%，100%几率提升自身10000格挡2回合",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为210%，100%几率提升自身10000格挡2回合",
			target: ["row", "first"],
			coefficient: 2.1,
			isRecover: false,
			emoji: "💧",
			contents: [
				{
					trigger: "skillEnd",
					filter: function () {
						return true;
					},
					desc: "100%几率提升自身10000格挡2回合",
					content: function (info) {
						Game.Battle.addBuff(this, { id: "gedang_self_10000", name: "格挡提升", type: "gedang", value: 10000, remainRounds: 2, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_008: {
			name: "必杀技能攻击",
			intro: "对一行敌人造成伤害，伤害系数为210%，75%几率眩晕目标1回合",
			ai_intro: "对敌方前排敌人造成伤害，伤害系数为210%，75%几率眩晕目标1回合",
			target: ["row", "first"],
			coefficient: 2.1,
			isRecover: false,
			emoji: "❤️",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.75;
					},
					desc: "75%几率眩晕目标1回合",
					content: function (target) {
						Game.Battle.addBuff(target, { id: "stun_target", name: "眩晕", type: "stun", remainRounds: 1, ownerSlot: this._currentActionSlotKey || null });
					},
				},
			],
		},
		spskill_009: {
			name: "必杀技能攻击",
			intro: "对三名敌人造成伤害，伤害系数为200%，50%几率减少目标2点能量",
			ai_intro: "对敌方随机三名敌人造成伤害，伤害系数为200%，50%几率减少目标2点能量",
			target: ["manual_multi", "random", 3],
			coefficient: 2,
			isRecover: false,
			emoji: "🧊",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.5;
					},
					desc: "50%几率减少目标2点能量",
					content: function (target) {
						target.energy = Math.max(0, (target.energy || 0) - 2);
						Game.Battle.log(`${this.name} 减少 ${target.name} 2 点能量`);
					},
				},
			],
		},
		spskill_010: {
			name: "必杀技能回复",
			intro: "治疗全体友方，系数为150%，70%几率增加目标1点能量",
			ai_intro: "治疗全体友方，系数为150%，70%几率增加目标1点能量",
			target: ["all", "all"],
			coefficient: 1.5,
			isRecover: true,
			emoji: "🧪",
			contents: [
				{
					filter: function (target) {
						return Math.random() < 0.7;
					},
					desc: "70%几率增加目标1点能量",
					content: function (target) {
						target.energy = Math.min(8, (target.energy || 0) + 1);
						Game.Battle.log(`${this.name} 为 ${target.name} 增加 1 点能量`);
					},
				},
			],
		},
	},
};
// ==================== 普攻 (pugong) ====================

// ==================== 必杀 (spskill) - 留空供你自行编写 ====================

// ==================== 导出 ====================
export { contentList };
export {};

/*
target元素释义
one:单个目标
all:全体目标
row:行目标
column:列目标
all:所有目标

lowest:血量最低目标
first:行/列第一个目标
last:行/列最后一个目标
random:随机目标
all:所有目标


*/
// const contentList = {
//	 pugong:{
//		 attack1:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为125%',//常规描述
//			 ai_intro:'对前排单体造成伤害，伤害系数为125%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.25);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack2:{
//			 name:'攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为65%',//常规描述
//			 ai_intro:'对敌方前排造成伤害，伤害系数为65%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.65);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack3:{
//			 name:'攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为75%',//常规描述
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为75%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.75);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack4:{
//			 name:'攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为55%',//常规描述
//			 ai_intro:'对敌方后排造成伤害，伤害系数为55%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.55);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack5:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为115%',//常规描述
//			 ai_intro:'对前排单体造成伤害，伤害系数为115%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.15);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack6:{
//			 name:'攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为60%',//常规描述
//			 ai_intro:'对敌方前排造成伤害，伤害系数为60%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.6);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack7:{
//			 name:'攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为70%',//常规描述
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为70%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.7);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack8:{
//			 name:'攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为50%',//常规描述
//			 ai_intro:'对敌方后排造成伤害，伤害系数为50%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.5);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack9:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为105%',//常规描述
//			 ai_intro:'对后排单体造成伤害，伤害系数为105%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.05);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack10:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为105%',//常规描述
//			 ai_intro:'对前排单体造成伤害，伤害系数为105%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.05);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack11:{
//			 name:'攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为65%',//常规描述
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.65);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack12:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为95%',//常规描述
//			 ai_intro:'对前排单体造成伤害，伤害系数为95%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.95);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack13:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为85%',//常规描述
//			 ai_intro:'对后排单体造成伤害，伤害系数为85%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.85);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack14:{
//			 name:'攻击',
//			 intro:'对单体造成伤害，伤害系数为90%',//常规描述
//			 ai_intro:'对前排单体造成伤害，伤害系数为90%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.9);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack15:{
//			 name:'攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为55%',//常规描述
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为55%',//代表ai的倾向
//			 //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//			 target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.55);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 recover1:{
//			 name:'回复',
//			 intro:'治疗我方单体，系数为1',//常规描述
//			 ai_intro:'治疗我方体力最低的单体，系数为1',//代表ai的倾向
//			 target:['one','lowest'],//第一个元素代表选目标模式，第二个元素ai倾向
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk);
//				 player.rpg_recover(targets,num);
//				 game.log(player, "对目标进行了治疗");
//			 }
//		 }
//	 },
//	 skill:{
//		 attack_skill1:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为305%',
//			 ai_intro:'对血量最少的敌方造成伤害，伤害系数为305%',
//			 target:['one','lowest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*3.05);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill2:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为190%',
//			 ai_intro:'对敌方前排敌人造成伤害，伤害系数为190%',
//			 target:['row','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.9);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill3:{
//			 name:'技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为225%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为225%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.25);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill4:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为170%',
//			 ai_intro:'对敌方后排敌人造成伤害，伤害系数为170%',
//			 target:['row','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.7);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill5:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为180%',
//			 ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为180%',
//			 target:['triple','random'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.80);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack_skill6:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为325%',
//			 ai_intro:'对敌方前排单体造成伤害，伤害系数为325%',
//			 target:['one','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*3.25);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill7:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为165%',
//			 ai_intro:'对敌方前排敌人造成伤害，伤害系数为165%',
//			 target:['row','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.65);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill8:{
//			 name:'技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为195%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为195%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.95);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill9:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为155%',
//			 ai_intro:'对敌方后排敌人造成伤害，伤害系数为155%',
//			 target:['row','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.55);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill10:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为175%',
//			 ai_intro:'对敌方前排敌人造成伤害，伤害系数为175%',
//			 target:['row','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.75);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack_skill11:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为130%',
//			 ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为130%',
//			 target:['triple','manahighest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.3);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill12:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为335%',
//			 ai_intro:'对敌方血量最高单体造成伤害，伤害系数为335%',
//			 target:['one','highest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*3.35);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill13:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为305%',
//			 ai_intro:'对敌方前排单体造成伤害，伤害系数为305%',
//			 target:['one','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*3.05);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill14:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为150%',
//			 ai_intro:'对敌方前排敌人造成伤害，伤害系数为150%',
//			 target:['row','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.5);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill15:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为140%',
//			 ai_intro:'对敌方后排敌人造成伤害，伤害系数为140%',
//			 target:['row','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.40);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill16:{
//			 name:'技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为180%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为180%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.8);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill17:{
//			 name:'技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为205%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.05);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill18:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为145%',
//			 ai_intro:'对敌方后排敌人造成伤害，伤害系数为145%',
//			 target:['row','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.45);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill19:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为265%',
//			 ai_intro:'对血量最少的敌方造成伤害，伤害系数为265%',
//			 target:['one','lowest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.65);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill20:{
//			 name:'技能攻击',
//			 intro:'对全体造成伤害，伤害系数为105%',
//			 ai_intro:'对全体敌方造成伤害，伤害系数为105%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.05);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack_skill21:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为135%',
//			 ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为135%',
//			 target:['triple','manahighest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.35);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill22:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为150%',
//			 ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为150%',
//			 target:['triple','random'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.50);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill23:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为285%',
//			 ai_intro:'对敌方后排单体造成伤害，伤害系数为285%',
//			 target:['one','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.85);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack_skill24:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为255%',
//			 ai_intro:'对敌方后排单体造成伤害，伤害系数为255%',
//			 target:['one','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.55);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill25:{
//			 name:'技能攻击',
//			 intro:'对全体造成伤害，伤害系数为90%',
//			 ai_intro:'对全体敌方造成伤害，伤害系数为90%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.9);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill27:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为285%',
//			 ai_intro:'对敌方前排单体造成伤害，伤害系数为285%',
//			 target:['one','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.85);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill28:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为140%',
//			 ai_intro:'对敌方前排敌人造成伤害，伤害系数为140%',
//			 target:['row','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.40);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill29:{
//			 name:'技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为170%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为170%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.7);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill30:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为135%',
//			 ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为135%',
//			 target:['triple','random'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.35);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill31:{
//			 name:'技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为130%',
//			 ai_intro:'对敌方后排敌人造成伤害，伤害系数为130%',
//			 target:['row','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.45);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill32:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为230%',
//			 ai_intro:'对血量最少的敌方造成伤害，伤害系数为230%',
//			 target:['one','lowest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.3);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill33:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为310%',
//			 ai_intro:'对敌方血量最高单体造成伤害，伤害系数为310%',
//			 target:['one','highest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*3.1);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack_skill34:{
//			 name:'技能攻击',
//			 intro:'对单体造成伤害，伤害系数为270%',
//			 ai_intro:'对敌方前排单体造成伤害，伤害系数为270%',
//			 target:['one','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.7);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill35:{
//			 name:'技能攻击',
//			 intro:'对全体造成伤害，伤害系数为85%',
//			 ai_intro:'对全体敌方造成伤害，伤害系数为85%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*0.85);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill36:{
//			 name:'技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为160%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为160%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.6);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_skill37:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为130%',
//			 ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为130%',
//			 target:['triple','random'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.3);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 attack_skill38:{
//			 name:'技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为165%',
//			 ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为165%',
//			 target:['triple','random'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.65);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },

//		 recover_skill1:{
//			 name:'技能回复',
//			 intro:'治疗全体友方，系数为125%',
//			 ai_intro:'治疗全体友方，系数为125%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.25);
//				 player.rpg_recover(targets,num);
//				 game.log(player, "对目标进行了治疗");
//			 }
//		 },
//		 recover_skill2:{
//			 name:'技能回复',
//			 intro:'治疗全体友方，系数为115%',
//			 ai_intro:'治疗全体友方，系数为115%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.15);
//				 player.rpg_recover(targets,num);
//				 game.log(player, "对目标进行了治疗");
//			 }
//		 },
//		 recover_skill3:{
//			 name:'技能回复',
//			 intro:'治疗全体友方，系数为100%',
//			 ai_intro:'治疗全体友方，系数为100%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1);
//				 player.rpg_recover(targets,num);
//				 game.log(player, "对目标进行了治疗");
//			 }
//		 },
//	 },
//	 spskill:{
//		 attack_spskill1:{
//			 name:'必杀技能攻击',
//			 intro:'对单体造成伤害，伤害系数为335%',
//			 ai_intro:'对血量最少的敌方造成伤害，伤害系数为335%',
//			 target:['one','lowest'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*3.35);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_spskill2:{
//			 name:'必杀技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为210%',
//			 ai_intro:'对敌方前排敌人造成伤害，伤害系数为210%',
//			 target:['row','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.1);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_spskill3:{
//			 name:'必杀技能攻击',
//			 intro:'对一列敌人造成伤害，伤害系数为250%',
//			 ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为250%',
//			 target:['column','first'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2.5);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_spskill4:{
//			 name:'必杀技能攻击',
//			 intro:'对一行敌人造成伤害，伤害系数为190%',
//			 ai_intro:'对敌方后排敌人造成伤害，伤害系数为190%',
//			 target:['row','last'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.9);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 attack_spskill5:{
//			 name:'必杀技能攻击',
//			 intro:'对三名敌人造成伤害，伤害系数为200%',
//			 ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为200%',
//			 target:['triple','random'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*2);
//				 player.rpg_attack(targets,num);
//				 game.log(player, "对目标造成了伤害");
//			 }
//		 },
//		 recover_spskill1:{
//			 name:'必杀技能回复',
//			 intro:'治疗全体友方，系数为150%',
//			 ai_intro:'治疗全体友方，系数为150%',
//			 target:['all','all'],
//			 content:function(event,player){
//				 var targets=event.targets;
//				 var num=Math.floor(player.atk*1.5);
//				 player.rpg_recover(targets,num);
//				 game.log(player, "对目标进行了治疗");
//			 }
//		 }

//	 },
// }
