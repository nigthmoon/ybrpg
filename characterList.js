
const characterList = {
	// --- 批量添加 YB_memory 阵营角色 (Female, Legend/Epic) ---
	ybsl_015wanghairu: {
		name: "王海茹", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['recover1', 'recover_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "recover",
	},
	ybsl_016manchengqi: {
		name: "满城柒", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_017xiaohong: {
		name: "涂山小红", 
		group: "YB_memory",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack2', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_018zhangqing: {
		name: "张晴", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack3', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_019shengyan: {
		name: "盛妍", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['recover1', 'recover_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "recover",
	},
	ybsl_020jiayutong: {
		name: "贾雨桐", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_024yuetong: {
		name: "岳瞳", 
		group: "YB_memory",
		sex: "female",
		hp: 840,
		atk: 187,
		def: 40,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_025wanghe: {
		name: "王贺", 
		group: "YB_memory",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_025shiqingyu: {
		name: "史庆宇", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_041mmuqin :{
		name: "慕琴", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_042pingzi: {
		name: "蘋姉", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['recover1', 'recover_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "recover",
	},
	ybsl_043fangjiayu: {
		name: "房佳谕", 
		group: "YB_memory",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_045gaocong: {
		name: "高聪", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_046jiangxuewu: {
		name: "江雪舞", 
		group: "YB_memory",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_047shan: {
		name: "彡", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_049waner: {
		name: "王婉儿", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},

	ybsl_053qiuer: {
		name: "秋儿", 
		group: "YB_memory",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_054yueer: {
		name: "悦儿", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_055zhengyan: {
		name: "郑琰", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_059starsFall1: {
		name: "鞠熒", 
		group: "YB_memory",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_059starsFall2: {
		name: "宋橤", 
		group: "YB_memory",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_059starsFall3: {
		name: "周靈", 
		group: "YB_memory",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_059starsFall4: {
		name: "李曉", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_060liutianhang:{
		name: "刘天杭", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_068qingyue: {
		name: "清月姑娘", 
		group: "YB_memory",
		sex: "female",
		hp: 840,
		atk: 187,
		def: 40,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_070lvyanqiu: {
		name: "吕艳秋", 
		group: "YB_memory",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_033xiaohui: {
		name: "小慧", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	db_ybsl_067snake: {
		name: "蛇妃", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},





    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
    //-----------------------分割线----------------------//
	// --- 批量添加 YB_dream 阵营角色 (Legend/Epic) ---
	ybsl_001sunlisong: {
		name: "孙丽松",
		group: "YB_dream", 
		sex: "female",
		hp: 1120, 
		atk: 160, 
		def: 53, 
		spe: 160, 
		skills: ['recover1', 'recover_skill1'], // 修改: 移除前缀
		rank: "legend", 
		tip: "recover",
	},
	ybsl_002chenailin: {
		name: "陈爱琳", 
		group: "YB_dream",
		sex: "female", 
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_003yanshuang: {
		name: "闫爽", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['recover1', 'recover_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "recover",
	},
	ybsl_004zhangyujie: {
		name: "张玉洁", 
		group: "YB_dream",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_005wangruobing: {
		name: "王若冰", 
		group: "YB_dream",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_006wanghanzhen: {
		name: "王汉桢", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['recover1', 'recover_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "recover",
	},
	ybsl_007wugege: {
		name: "吴格格", 
		group: "YB_dream",
		sex: "female",
		hp: 840,
		atk: 187,
		def: 40,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_008wuyuxin: {
		name: "吴雨欣", 
		group: "YB_dream",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_009liyushan: {
		name: "李玉珊", 
		group: "YB_dream",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_010zhouyue: {
		name: "周玥", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_011gaoyuhang: {
		name: "高宇航", 
		group: "YB_dream",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_012zhengjiayi: {
		name: "郑佳怡", 
		group: "YB_dream",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_013yinji: {
		name: "尹超跃", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
    
	ybsl_018huanqing: {
		name: "幻晴", 
		group: "YB_dream",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_026can: {
		name: "蚕", 
		group: "YB_dream",
		sex: "female",
		hp: 840,
		atk: 187,
		def: 40,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_027rain: {
		name: "雨", 
		group: "YB_dream",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_029dawn: {
		name: "黎", 
		group: "YB_dream",
		sex: "female",
		hp: 1120,
		atk: 160,
		def: 53,
		spe: 160, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_036bright: {
		name: "熙", 
		group: "YB_dream",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_037diamondqueen: {
		name: "方块公主", 
		group: "YB_dream",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_038bianqiuwen: {
		name: "卞秋雯", 
		group: "YB_memory",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_044huruihang: {
		name: "胡瑞航", 
		group: "YB_dream",
		sex: "female",
		hp: 840,
		atk: 187,
		def: 40,
		spe: 150, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_047zhangmi: {
		name: "张汨", 
		group: "YB_dream",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_048wushuang: {
		name: "吴爽", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_069xiangzi: {
		name: "香紫姑娘", 
		group: "YB_dream",
		sex: "female",
		hp: 896,
		atk: 200,
		def: 42,
		spe: 160, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_076zhujun: {
		name: "朱焌", 
		group: "YB_dream",
		sex: "female",
		hp: 1400,
		atk: 128,
		def: 66,
		spe: 160, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "legend",
		tip: "damage",
	},
	ybsl_092handan: {
		name: "玉蝶心", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_107tushanshuili: {
		name: "涂山水璃", 
		group: "YB_dream",
		sex: "female",
		hp: 840,
		atk: 187,
		def: 40,
		spe: 150, 
		skills: ['attack4', 'attack_skill4'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_121tujing: {
		name: "涂静", 
		group: "YB_dream",
		sex: "female",
		hp: 1312,
		atk: 120,
		def: 62,
		spe: 150, 
		skills: ['attack1', 'attack_skill2'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_122wangbingyu: {
		name: "王冰雨", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack2', 'attack_skill3'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
	ybsl_123xuelang: {
		name: "雪琅", 
		group: "YB_dream",
		sex: "female",
		hp: 1050,
		atk: 150,
		def: 50,
		spe: 150, 
		skills: ['attack3', 'attack_skill1'], // 修改: 移除前缀
		rank: "epic",
		tip: "damage",
	},
};
/*
这些是我希望你帮我批量设置的史诗或传说角色
ybsl_015wanghairu
ybsl_016manchengqi
ybsl_017xiaohong
ybsl_018zhangqing
ybsl_018huanqing
ybsl_019shengyan
ybsl_020jiayutong
ybsl_024yuetong
ybsl_025wanghe
ybsl_025shiqingyu
ybsl_042pingzi
ybsl_043fangjiayu
ybsl_045gaocong
ybsl_046jiangxuewu
ybsl_047shan
ybsl_049waner
ybsl_053qiuer
ybsl_054yueer
ybsl_055zhengyan
ybsl_059starsFall1
ybsl_059starsFall2
ybsl_059starsFall3
ybsl_059starsFall4
ybsl_068qingyue
ybsl_070lvyanqiu
以上阵营均为YB_memory，性别均为female

ybsl_002chenailin
ybsl_003yanshuang
ybsl_004zhangyujie
ybsl_005wangruobing
ybsl_006wanghanzhen
ybsl_007wugege
ybsl_008wuyuxin
ybsl_009liyushan
ybsl_010zhouyue
ybsl_011gaoyuhang
ybsl_012zhengjiayi
ybsl_013yinji
ybsl_026can
ybsl_027rain
ybsl_029dawn
ybsl_033xiaohui
ybsl_036bright
ybsl_037diamondqueen
ybsl_038bianqiuwen
ybsl_044huruihang
ybsl_047zhangmi
ybsl_048wushuang
db_ybsl_067snake
ybsl_069xiangzi
ybsl_076zhujun
ybsl_092handan
ybsl_107tushanshuili
ybsl_121tujing
ybsl_122wangbingyu
ybsl_123xuelang
以上阵营均为YB_dream

角色的name从里找对应的翻译填充
D:\liu\无名杀win32-x64\resources\app\extension\夜白神略\source\exts\YB_01_character\translate.js







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