const SPeventList = {
    spEvent1:{
        name: '主角升阶秘境',
        difficulty:'normal',
        procedure: [
            'sp1-1', 'sp1-2', 'sp1-3', 'sp1-4', 'sp1-5',
            'sp1-6', 'sp1-7', 'sp1-8', 'sp1-9', 'sp1-10',
            'sp1-11', 'sp1-12', 'sp1-13', 'sp1-14', 'sp1-15',
            'sp1-16', 'sp1-17', 'sp1-18', 'sp1-19', 'sp1-20',
        ],
        eventPack:{
            'sp1-1': {
                name: '1阶秘境',
                id: 'sp1-1',
                type: 'battle',
                text: '通过本关会令主角突破至1阶',
                prev: null,
                gold: 300,
                enemy: [
                    {}, {}, {}, {}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 800, atk: 100, def: 50, spe: 50, buff: [],tupolevel:6,}, {}
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
                    {}, {}, {}, {}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 1200, atk: 125, def: 65, spe: 65, buff: [],tupolevel:6,}, {}
                ],
            },
            'sp1-3': {
                name: '3阶秘境',
                id: 'sp1-3',
                type: 'battle',
                text: '通过本关会令主角突破至3阶',
                prev: 'sp2-2',
                gold: 700,
                enemy: [
                    {}, {}, {}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 1500, atk: 150, def: 80, spe: 80, buff: [],tupolevel:6,}, {}
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
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 1200, atk: 65, def: 65, spe: 65, buff: [], tupolevel: 6, },{}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 800, atk: 100, def: 50, spe: 50, buff: [], tupolevel: 6, },{}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 1500, atk: 150, def: 80, spe: 80, buff: [], tupolevel: 6, }, {}
                ],

            },
            'sp1-5': {
                name: '5阶秘境',
                id: 'sp1-5',
                type: 'battle',
                text: '通过本关会令主角突破至5阶',
                prev: 'sp2-3',
                gold: 1500,
                enemy: [
                    {}, {}, {}, {}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 1800, atk: 175, def: 95, spe: 95, buff: [],tupolevel:6,}, {}
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
                    {}, {}, {}, {}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 2000, atk: 200, def: 110, spe: 110, buff: [],tupolevel:6,}, {}
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
                    {}, {}, {}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 2500, atk: 250, def: 150, spe: 120, buff: [],tupolevel:6,}, {}
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
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 2000, atk: 200, def: 110, spe: 110, buff: [],tupolevel:6,},{}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 1800, atk: 175, def: 95, spe: 95, buff: [],tupolevel:6,}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 2500, atk: 250, def: 150, spe: 120, buff: [],tupolevel:6,}, {}
                ],

            },
            'sp1-9': {
                name: '9阶秘境',
                id: 'sp1-9',
                type: 'battle',
                text: '通过本关会令主角突破至9阶',
                prev: 'sp2-4',
                gold: 2800,
                enemy: [
                    {}, {}, {}, {}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 3000, atk: 300, def: 180, spe: 150, buff: [],tupolevel:6,}, {}
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
                    {}, {}, {}, {}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 3500, atk: 350, def: 200, spe: 180, buff: [],tupolevel:6,}, {}
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
                    {}, {}, {}, {},
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,},{}, 
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
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 3000, atk: 300, def: 180, spe: 150, buff: [],tupolevel:6,},{}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 3500, atk: 350, def: 200, spe: 180, buff: [],tupolevel:6,}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,},{}
                ]
            },
            'sp1-13': {
                name: '13阶秘境',
                id: 'sp1-13',
                type: 'battle',
                text: '通过本关会令主角突破至13阶',
                prev: 'sp2-5',
                gold: 5500,
                enemy: [
                    { name: '涂山小红', id: 'ybsl_017xiaohong', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,},{}, 
                    {}, {}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},{}
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
                    { name: '彡', id: 'ybsl_047shan', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,},{}, 
                    {}, {}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 9000, atk: 900, def: 325, spe: 245, buff: [],tupolevel:6,},{}, 
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
                    { name: '鞠熒', id: 'ybsl_059starsFall1', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,},{}, 
                    {}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 10000, atk: 1000, def: 350, spe: 270, buff: [],tupolevel:6,},{}, 
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
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},
                    { name: '慕琴', id: 'ybsl_041mmuqin', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 9000, atk: 900, def: 325, spe: 245, buff: [],tupolevel:6,}, 
                    { name: '王婉儿', id: 'ybsl_049waner', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 10000, atk: 1000, def: 350, spe: 270, buff: [],tupolevel:6,},
                    { name: '吴爽', id: 'ybsl_048wushuang', hp: 5000, atk: 500, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                ]
            },
            'sp1-17': {
                name: '17阶秘境',
                id: 'sp1-17',
                type: 'battle',
                text: '通过本关会令主角突破至17阶',
                prev: 'sp2-6',
                gold: 40000,
                enemy: [
                    { name: '李曉', id: 'ybsl_059starsFall4', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},
                    { name: '周靈', id: 'ybsl_059starsFall3', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '宋橤', id: 'ybsl_059starsFall2', hp: 9000, atk: 900, def: 325, spe: 245, buff: [],tupolevel:6,}, 
                    { name: '清月姑娘', id: 'ybsl_068qingyue', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '鞠熒', id: 'ybsl_059starsFall1', hp: 15000, atk: 1300, def: 500, spe: 300, buff: [],tupolevel:6,},
                    { name: '香紫姑娘', id: 'ybsl_069xiangzi', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
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
                    { name: '小慧', id: 'ybsl_033xiaohui', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},
                    { name: '幻晴', id: 'ybsl_018huanqing', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '张晴', id: 'ybsl_018zhangqing', hp: 9000, atk: 900, def: 325, spe: 245, buff: [],tupolevel:6,}, 
                    { name: '涂山小红', id: 'ybsl_017xiaohong', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '王海茹', id: 'ybsl_015wanghairu', hp: 15000, atk: 1300, def: 500, spe: 300, buff: [],tupolevel:6,},
                    { name: '满城柒', id: 'ybsl_016manchengqi', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                ]
            },
            'sp1-19': {
                name: '19阶秘境',
                id: 'sp1-19',
                type: 'battle',
                text: '通过本关会令主角突破至19阶',
                prev: 'sp1-18',
                gold: 40000,
                enemy: [
                    { name: '高宇航', id: 'ybsl_011gaoyuhang', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},
                    { name: '周玥', id: 'ybsl_010zhouyue', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '王若冰', id: 'ybsl_005wangruobing', hp: 9000, atk: 900, def: 325, spe: 245, buff: [],tupolevel:6,}, 
                    { name: '陈爱琳', id: 'ybsl_002chenailin', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '吴雨欣', id: 'ybsl_008wuyuxin', hp: 15000, atk: 1300, def: 500, spe: 300, buff: [],tupolevel:6,},
                    { name: '郑佳怡', id: 'ybsl_012zhengjiayi', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                ]
            },
            'sp1-20': {
                name: '20阶秘境',
                id: 'sp1-20',
                type: 'battle',
                text: '通过本关会令主角突破至20阶',
                prev: 'sp1-16',
                gold: 40000,
                enemy: [
                    { name: '尹超跃', id: 'ybsl_013yinji', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},
                    { name: '玉蝶心', id: 'ybsl_092handan', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '陈爱琳', id: 'ybsl_002chenailin', hp: 9000, atk: 900, def: 325, spe: 245, buff: [],tupolevel:6,}, 
                    { name: '吴格格', id: 'ybsl_007wugege', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                    { name: '王汉桢', id: 'ybsl_006wanghanzhen', hp: 15000, atk: 1300, def: 500, spe: 300, buff: [],tupolevel:6,},
                    { name: '孙丽松', id: 'ybsl_001sunlisong', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, 
                ]
            },
        }
    },
    spEvent2:{
        name: '主角蜕变秘境',
        difficulty:'hard',
        procedure: [
            // 'sp2-1', 
            'sp2-2', 'sp2-3', 'sp2-4', 'sp2-5','sp2-6'
        ],
        eventPack:{
            'sp2-1': {
                name: '平凡试炼',
                id: 'sp2-1',
                type: 'battle',
                text: '通过本关会令主角升品至普通',
                prev: 'sp1-1',
                gold : 900,
                enemy: [
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 800, atk: 100, def: 50, spe: 50, buff: [], tupolevel: 6, },{}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 800, atk: 100, def: 50, spe: 50, buff: [], tupolevel: 6, },{}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 800, atk: 100, def: 50, spe: 50, buff: [], tupolevel: 6, }, {}
                ],
            },
            'sp2-2': {
                name: '精英试炼',
                id: 'sp2-2',
                type: 'battle',
                text: '通过本关会令主角升品至精品',
                prev: 'sp1-2',
                gold : 1200,
                enemy: [
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 1200, atk: 125, def: 65, spe: 65, buff: [], tupolevel: 6, },{}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 1200, atk: 125, def: 65, spe: 65, buff: [], tupolevel: 6, },{}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 1200, atk: 125, def: 65, spe: 65, buff: [], tupolevel: 6, }, {}
                ],
            },
            'sp2-3': {
                name: '史诗试炼',
                id: 'sp2-3',
                type: 'battle',
                text: '通过本关会令主角升品至史诗',
                prev: 'sp1-4',
                gold : 2400,
                enemy: [
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 1500, atk: 150, def: 80, spe: 80, buff: [], tupolevel: 6, },{}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 1500, atk: 150, def: 80, spe: 80, buff: [], tupolevel: 6, },{}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 1500, atk: 150, def: 80, spe: 80, buff: [], tupolevel: 6, }, {}
                ],
            },
            'sp2-4': {
                name: '真史诗试炼',
                id: 'sp2-4',
                type: 'battle',
                text: '通过本关会令主角升品为真史诗',
                prev: 'sp1-8',
                gold : 4800,
                enemy: [
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 2500, atk: 250, def: 150, spe: 120, buff: [],tupolevel:6,},{}, 
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 2500, atk: 250, def: 150, spe: 120, buff: [],tupolevel:6,}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 2500, atk: 250, def: 150, spe: 120, buff: [],tupolevel:6,}, {}
                ]
            },
            'sp2-5': {
                name: '传说试炼',
                id: 'sp2-5',
                type: 'battle',
                text: '通过本关会令主角升品为传说',
                prev: 'sp1-12',
                gold : 9600,
                enemy: [
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 5000, atk: 500, def: 300, spe: 150, buff: [],tupolevel:6,},{}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 5000, atk: 500, def: 300, spe: 150, buff: [],tupolevel:6,}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 5000, atk: 500, def: 300, spe: 150, buff: [],tupolevel:6,},{}
                ]
            },
            'sp2-6': {
                name: '真神秘境',
                id: 'sp2-6',
                type: 'battle',
                text: '通过本关会令主角升品为神品',
                prev: 'sp1-16',
                gold : 19200,
                enemy: [
                    { name: '风魔狼', id: 'ybsl_fengmolang', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},{}, 
                    { name: '雷魔鹰', id: 'ybsl_leimoying', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,}, {}, 
                    { name: '魇魔花', id: 'ybsl_yanmohua', hp: 8000, atk: 800, def: 300, spe: 220, buff: [],tupolevel:6,},{}
                ]
            },
        },
    },
}
const eventList = {//事件列表
    // ===== 敌人位置映射说明 =====
    // 玩家视角敌人阵地布局:
    //     [5] [4] [3]  <- 后排 (或上方)
    //     [2] [1] [0]  <- 前排 (或下方)
    // 数组索引对应:
    //     [0] -> 位置1 (左前)
    //     [1] -> 位置2 (中前)
    //     [2] -> 位置3 (右前)
    //     [3] -> 位置4 (左后)
    //     [4] -> 位置5 (中后)
    //     [5] -> 位置6 (右后)
    // 空对象 {} 代表该位置无敌人
    // 注意: 普通难度敌人使用初始值(无skills)，困难/地狱难度数值递增

    // ========== 第一章：初入梦境 ==========
    chapter1: {
        name: '第一章：初入梦境',
        difficulty: 'normal',
        procedure: [
            'c1-1', 'c1-2', 'c1-3', 'c1-4', 'c1-5',
            'c1-6', 'c1-7', 'c1-8', 'c1-9', 'c1-10'
        ],
        eventPack: {
            // --- 1~3关: 1名稀有敌人 ---
            'c1-1': {
                name: '初遇陈爱琳',
                id: 'c1-1',
                type: 'battle',
                text: '在记忆的深处，你遇见了她...',
                prev: null,
                enemy: [
                    { name: '陈爱琳', id: 'ybsl_002chenailin', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}, {}, {}
                ],
            },
            'c1-2': {
                name: '挑战张玉洁',
                id: 'c1-2',
                type: 'battle',
                text: '她的剑术凌厉无比...',
                prev: 'c1-1',
                enemy: [
                    { name: '张玉洁', id: 'ybsl_004zhangyujie', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}, {}, {}
                ],
            },
            'c1-3': {
                name: '双敌来袭', // 原文本是双敌，但按要求1-3关只有一名敌人，这里修正为单敌，或者你可以保留双敌但降低数值。根据要求“1~3小关只有一名敌人”，此处改为单敌。
                id: 'c1-3',
                type: 'battle',
                text: '一名强敌拦在前方...',
                prev: 'c1-2',
                enemy: [
                    { name: '王若冰', id: 'ybsl_005wangruobing', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}, {}, {}
                ],
            },
            
            // --- 4~6关: 2名稀有敌人 ---
            'c1-4': {
                name: '涂山小红',
                id: 'c1-4',
                type: 'battle',
                text: '来自涂山的少女...',
                prev: 'c1-3',
                enemy: [
                    { name: '涂山小红', id: 'ybsl_017xiaohong', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '吴格格', id: 'ybsl_007wugege', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}, {}
                ],
            },
            'c1-5': {
                name: '记忆交错',
                id: 'c1-5',
                type: 'battle',
                text: '两名故人拦在前方...',
                prev: 'c1-4',
                enemy: [
                    { name: '李玉珊', id: 'ybsl_009liyushan', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '周玥', id: 'ybsl_010zhouyue', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}, {}
                ],
            },
            'c1-6': {
                name: '高宇航',
                id: 'c1-6',
                type: 'battle',
                text: '她的攻击迅猛无比...',
                prev: 'c1-5',
                enemy: [
                    { name: '高宇航', id: 'ybsl_011gaoyuhang', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '郑佳怡', id: 'ybsl_012zhengjiayi', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}, {}
                ],
            },

            // --- 7~9关: 3名稀有敌人 ---
            'c1-7': {
                name: '双重考验',
                id: 'c1-7',
                type: 'battle',
                text: '考验你的实力！',
                prev: 'c1-6',
                enemy: [
                    { name: '尹超跃', id: 'ybsl_013yinji', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '贾雨桐', id: 'ybsl_020jiayutong', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '王汉桢', id: 'ybsl_006wanghanzhen', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}
                ],
            },
            'c1-8': {
                name: '满城柒',
                id: 'c1-8',
                type: 'battle',
                text: '传说级角色登场...',
                prev: 'c1-7',
                enemy: [
                    { name: '满城柒', id: 'ybsl_016manchengqi', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '闫爽', id: 'ybsl_003yanshuang', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '张晴', id: 'ybsl_018zhangqing', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}
                ],
            },
            'c1-9': {
                name: '双子拦路',
                id: 'c1-9',
                type: 'battle',
                text: '她们不会让你轻易通过...',
                prev: 'c1-8',
                enemy: [
                    { name: '岳瞳', id: 'ybsl_024yuetong', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '王贺', id: 'ybsl_025wanghe', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '史庆宇', id: 'ybsl_025shiqingyu', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}, {}
                ],
            },

            // --- Boss关: 1伪史诗 + 3稀有 ---
            'c1-10': {
                name: '第一章BOSS',
                id: 'c1-10',
                type: 'boss',
                text: '第一章最终BOSS战！',
                prev: 'c1-9',
                enemy: [
                    // 伪史诗 Boss
                    { name: '吴雨欣', id: 'ybsl_008wuyuxin', hp: 1500, atk: 220, def: 80, spe: 160, buff: [] },
                    // 3个稀有小弟
                    { name: '秋儿', id: 'ybsl_053qiuer', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '孙丽松', id: 'ybsl_001sunlisong', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    { name: '王海茹', id: 'ybsl_015wanghairu', hp: 1000, atk: 150, def: 50, spe: 150, buff: [] },
                    {}, {}
                ],
            },
        }
    },

    // ========== 第二章：记忆觉醒 ==========
    // 系数: HP*1.15, ATK*1.1, DEF*1.08, SPE*1.02
    // 稀有基准: HP:1150, ATK:165, DEF:54, SPE:153
    // 伪史诗基准: HP:1725, ATK:242, DEF:86, SPE:163
    chapter2: {
        name: '第二章：记忆觉醒',
        difficulty: 'normal',
        procedure: [
            'c2-1', 'c2-2', 'c2-3', 'c2-4', 'c2-5',
            'c2-6', 'c2-7', 'c2-8', 'c2-9', 'c2-10'
        ],
        eventPack: {
            // --- 1~9关: 4名稀有敌人 ---
            'c2-1': {
                name: '记忆碎片',
                id: 'c2-1',
                type: 'battle',
                text: '新的记忆正在苏醒...',
                prev: null,
                enemy: [
                    { name: '闫爽', id: 'ybsl_003yanshuang', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '张晴', id: 'ybsl_018zhangqing', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '岳瞳', id: 'ybsl_024yuetong', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '王贺', id: 'ybsl_025wanghe', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-2': {
                name: '岳瞳',
                id: 'c2-2',
                type: 'battle',
                text: '她的眼神中藏着秘密...',
                prev: 'c2-1',
                enemy: [
                    { name: '史庆宇', id: 'ybsl_025shiqingyu', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '蘋姉', id: 'ybsl_042pingzi', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '盛妍', id: 'ybsl_019shengyan', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '王婉儿', id: 'ybsl_049waner', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-3': {
                name: '双重身影',
                id: 'c2-3',
                type: 'battle',
                text: '她们的身影重叠在一起...',
                prev: 'c2-2',
                enemy: [
                    { name: '悦儿', id: 'ybsl_054yueer', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '郑琰', id: 'ybsl_055zhengyan', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '房佳谕', id: 'ybsl_043fangjiayu', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '高聪', id: 'ybsl_045gaocong', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-4': {
                name: '蘋姉',
                id: 'c2-4',
                type: 'battle',
                text: '神秘的角色出现了...',
                prev: 'c2-3',
                enemy: [
                    { name: '鞠熒', id: 'ybsl_059starsFall1', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '宋橤', id: 'ybsl_059starsFall2', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '周靈', id: 'ybsl_059starsFall3', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '李曉', id: 'ybsl_059starsFall4', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-5': {
                name: '三人同行',
                id: 'c2-5',
                type: 'battle',
                text: '三位记忆中的伙伴...',
                prev: 'c2-4',
                enemy: [
                    { name: '清月姑娘', id: 'ybsl_068qingyue', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '吕艳秋', id: 'ybsl_070lvyanqiu', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '小慧', id: 'ybsl_033xiaohui', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '蛇妃', id: 'db_ybsl_067snake', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-6': {
                name: '郑琰',
                id: 'c2-6',
                type: 'battle',
                text: '她的攻击令人防不胜防...',
                prev: 'c2-5',
                enemy: [
                    { name: '幻晴', id: 'ybsl_018huanqing', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '江雪舞', id: 'ybsl_046jiangxuewu', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '蚕', id: 'ybsl_026can', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '雨', id: 'ybsl_027rain', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-7': {
                name: '记忆漩涡',
                id: 'c2-7',
                type: 'battle',
                text: '记忆的漩涡将你卷入...',
                prev: 'c2-6',
                enemy: [
                    { name: '彡', id: 'ybsl_047shan', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '玉蝶心', id: 'ybsl_092handan', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '黎', id: 'ybsl_029dawn', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '熙', id: 'ybsl_036bright', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-8': {
                name: '闫爽',
                id: 'c2-8',
                type: 'battle',
                text: '她再次出现在你面前...',
                prev: 'c2-7',
                enemy: [
                    { name: '方块公主', id: 'ybsl_037diamondqueen', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '卞秋雯', id: 'ybsl_038bianqiuwen', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '胡瑞航', id: 'ybsl_044huruihang', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '张汨', id: 'ybsl_047zhangmi', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },
            'c2-9': {
                name: '星辰汇聚',
                id: 'c2-9',
                type: 'battle',
                text: '星辰之力在此汇聚...',
                prev: 'c2-8',
                enemy: [
                    { name: '吴爽', id: 'ybsl_048wushuang', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '王冰雨', id: 'ybsl_122wangbingyu', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '涂静', id: 'ybsl_121tujing', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '雪琅', id: 'ybsl_123xuelang', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}, {}
                ],
            },

            // --- Boss关: 1伪史诗 + 5稀有 ---
            'c2-10': {
                name: '第二章BOSS',
                id: 'c2-10',
                type: 'boss',
                text: '第二章最终BOSS战！',
                prev: 'c2-9',
                enemy: [
                    // 伪史诗 Boss
                    { name: '香紫姑娘', id: 'ybsl_069xiangzi', hp: 1725, atk: 242, def: 86, spe: 163, buff: [] },
                    // 5个稀有
                    { name: '朱焌', id: 'ybsl_076zhujun', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '涂山水璃', id: 'ybsl_107tushanshuili', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '陈爱琳', id: 'ybsl_002chenailin', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '张玉洁', id: 'ybsl_004zhangyujie', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    { name: '王若冰', id: 'ybsl_005wangruobing', hp: 1150, atk: 165, def: 54, spe: 153, buff: [] },
                    {}
                ],
            },
        }
    },

    // ========== 第三章：梦境交错 ==========
    // 系数: HP*1.32 (1.15^2), ATK*1.21, DEF*1.17, SPE*1.04
    // 稀有基准: HP:1320, ATK:181, DEF:58, SPE:156
    // 伪史诗基准: HP:1980, ATK:266, DEF:94, SPE:166
    chapter3: {
        name: '第三章：梦境交错',
        difficulty: 'normal',
        procedure: [
            'c3-1', 'c3-2', 'c3-3', 'c3-4', 'c3-5',
            'c3-6', 'c3-7', 'c3-8', 'c3-9', 'c3-10'
        ],
        eventPack: {
            // --- 1~9关: 6名稀有敌人 (塞满) ---
            'c3-1': {
                name: '吕艳秋',
                id: 'c3-1',
                type: 'battle',
                text: '秋日的记忆如此清晰...',
                prev: null,
                enemy: [
                    { name: '陈爱琳', id: 'ybsl_002chenailin', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '张玉洁', id: 'ybsl_004zhangyujie', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '王若冰', id: 'ybsl_005wangruobing', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '满城柒', id: 'ybsl_016manchengqi', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '涂山小红', id: 'ybsl_017xiaohong', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '贾雨桐', id: 'ybsl_020jiayutong', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-2': {
                name: '三人幻影',
                id: 'c3-2',
                type: 'battle',
                text: '幻影中浮现三个身影...',
                prev: 'c3-1',
                enemy: [
                    { name: '李玉珊', id: 'ybsl_009liyushan', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '周玥', id: 'ybsl_010zhouyue', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '高宇航', id: 'ybsl_011gaoyuhang', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '郑佳怡', id: 'ybsl_012zhengjiayi', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '尹超跃', id: 'ybsl_013yinji', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '吴格格', id: 'ybsl_007wugege', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-3': {
                name: '蛇妃',
                id: 'c3-3',
                type: 'battle',
                text: '危险的气息弥漫开来...',
                prev: 'c3-2',
                enemy: [
                    { name: '闫爽', id: 'ybsl_003yanshuang', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '张晴', id: 'ybsl_018zhangqing', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '岳瞳', id: 'ybsl_024yuetong', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '王贺', id: 'ybsl_025wanghe', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '史庆宇', id: 'ybsl_025shiqingyu', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '蘋姉', id: 'ybsl_042pingzi', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-4': {
                name: '梦境四重奏',
                id: 'c3-4',
                type: 'battle',
                text: '四个身影在梦境中起舞...',
                prev: 'c3-3',
                enemy: [
                    { name: '盛妍', id: 'ybsl_019shengyan', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '王婉儿', id: 'ybsl_049waner', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '悦儿', id: 'ybsl_054yueer', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '郑琰', id: 'ybsl_055zhengyan', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '房佳谕', id: 'ybsl_043fangjiayu', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '高聪', id: 'ybsl_045gaocong', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-5': {
                name: '黎明的使者',
                id: 'c3-5',
                type: 'battle',
                text: '黎明前的黑暗最为深沉...',
                prev: 'c3-4',
                enemy: [
                    { name: '鞠熒', id: 'ybsl_059starsFall1', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '宋橤', id: 'ybsl_059starsFall2', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '周靈', id: 'ybsl_059starsFall3', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '李曉', id: 'ybsl_059starsFall4', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '清月姑娘', id: 'ybsl_068qingyue', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '吕艳秋', id: 'ybsl_070lvyanqiu', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-6': {
                name: '五重梦境',
                id: 'c3-6',
                type: 'battle',
                text: '五道身影将你包围...',
                prev: 'c3-5',
                enemy: [
                    { name: '小慧', id: 'ybsl_033xiaohui', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '蛇妃', id: 'db_ybsl_067snake', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '幻晴', id: 'ybsl_018huanqing', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '江雪舞', id: 'ybsl_046jiangxuewu', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '蚕', id: 'ybsl_026can', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '雨', id: 'ybsl_027rain', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-7': {
                name: '香紫姑娘',
                id: 'c3-7',
                type: 'battle',
                text: '紫色的香气令人沉醉...',
                prev: 'c3-6',
                enemy: [
                    { name: '彡', id: 'ybsl_047shan', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '玉蝶心', id: 'ybsl_092handan', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '黎', id: 'ybsl_029dawn', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '熙', id: 'ybsl_036bright', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '方块公主', id: 'ybsl_037diamondqueen', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '卞秋雯', id: 'ybsl_038bianqiuwen', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-8': {
                name: '四方围攻',
                id: 'c3-8',
                type: 'battle',
                text: '四面的敌人同时袭来...',
                prev: 'c3-7',
                enemy: [
                    { name: '胡瑞航', id: 'ybsl_044huruihang', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '张汨', id: 'ybsl_047zhangmi', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '吴爽', id: 'ybsl_048wushuang', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '王冰雨', id: 'ybsl_122wangbingyu', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '涂静', id: 'ybsl_121tujing', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '雪琅', id: 'ybsl_123xuelang', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },
            'c3-9': {
                name: '朱焌',
                id: 'c3-9',
                type: 'battle',
                text: '朱红的身影闪烁着危险的光芒...',
                prev: 'c3-8',
                enemy: [
                    { name: '香紫姑娘', id: 'ybsl_069xiangzi', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '朱焌', id: 'ybsl_076zhujun', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '涂山水璃', id: 'ybsl_107tushanshuili', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '王海茹', id: 'ybsl_015wanghairu', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '孙丽松', id: 'ybsl_001sunlisong', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '吴雨欣', id: 'ybsl_008wuyuxin', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] }
                ],
            },

            // --- Boss关: 1伪史诗 + 5稀有 ---
            'c3-10': {
                name: '第三章BOSS',
                id: 'c3-10',
                type: 'boss',
                text: '第三章最终BOSS战！',
                prev: 'c3-9',
                enemy: [
                    // 伪史诗 Boss
                    { name: '王汉桢', id: 'ybsl_006wanghanzhen', hp: 1980, atk: 266, def: 94, spe: 166, buff: [] },
                    // 5个稀有
                    { name: '陈爱琳', id: 'ybsl_002chenailin', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '张玉洁', id: 'ybsl_004zhangyujie', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '王若冰', id: 'ybsl_005wangruobing', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '满城柒', id: 'ybsl_016manchengqi', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    { name: '涂山小红', id: 'ybsl_017xiaohong', hp: 1320, atk: 181, def: 58, spe: 156, buff: [] },
                    {}
                ],
            },
        }
    },

    // ========== 第四章：记忆风暴 ==========
    chapter4:{
        name:'第四章：记忆风暴',
        difficulty:'normal',
        procedure:[
            'c4-1','c4-2','c4-3','c4-4','c4-5',
            'c4-6','c4-7','c4-8','c4-9','c4-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c4-1':{
                name:'风暴前夕',
                id:'c4-1',
                type:'battle',
                text:'记忆的风暴即将来临...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c4-2':{
                name:'记忆洪流',
                id:'c4-2',
                type:'battle',
                text:'记忆的洪流汹涌而来...',
                prev: 'c4-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c4-3':{
                name:'交织的命运',
                id:'c4-3',
                type:'battle',
                text:'命运的丝线将她们交织...',
                prev: 'c4-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c4-4':{
                name:'记忆回响',
                id:'c4-4',
                type:'battle',
                text:'记忆在脑海中回响...',
                prev: 'c4-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c4-5':{
                name:'星辰之怒',
                id:'c4-5',
                type:'battle',
                text:'星辰们愤怒了...',
                prev: 'c4-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c4-6':{
                name:'记忆迷宫',
                id:'c4-6',
                type:'battle',
                text:'记忆的迷宫错综复杂...',
                prev: 'c4-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c4-7':{
                name:'元素风暴',
                id:'c4-7',
                type:'battle',
                text:'元素之力在咆哮...',
                prev: 'c4-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c4-8':{
                name:'梦境深渊',
                id:'c4-8',
                type:'battle',
                text:'深渊中的敌人蠢蠢欲动...',
                prev: 'c4-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c4-9':{
                name:'记忆核心',
                id:'c4-9',
                type:'battle',
                text:'记忆的核心就在眼前...',
                prev: 'c4-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c4-10':{
                name:'第四章BOSS',
                id:'c4-10',
                type:'boss',
                text:'第四章最终BOSS战！',
                prev: 'c4-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },

    // ========== 第五章：记忆深渊 ==========
    chapter5:{
        name:'第五章：记忆深渊',
        difficulty:'normal',
        procedure:[
            'c5-1','c5-2','c5-3','c5-4','c5-5',
            'c5-6','c5-7','c5-8','c5-9','c5-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c5-1':{
                name:'深渊入口',
                id:'c5-1',
                type:'battle',
                text:'深渊的入口已经打开...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c5-2':{
                name:'深渊回响',
                id:'c5-2',
                type:'battle',
                text:'深渊中传来阵阵回响...',
                prev: 'c5-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c5-3':{
                name:'深渊阴影',
                id:'c5-3',
                type:'battle',
                text:'阴影在深渊中蔓延...',
                prev: 'c5-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c5-4':{
                name:'深渊漩涡',
                id:'c5-4',
                type:'battle',
                text:'巨大的漩涡将一切卷入...',
                prev: 'c5-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c5-5':{
                name:'深渊裂隙',
                id:'c5-5',
                type:'battle',
                text:'裂隙中透出诡异的光芒...',
                prev: 'c5-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c5-6':{
                name:'深渊之眼',
                id:'c5-6',
                type:'battle',
                text:'深渊之眼正在注视着你...',
                prev: 'c5-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c5-7':{
                name:'深渊咆哮',
                id:'c5-7',
                type:'battle',
                text:'深渊发出震耳的咆哮...',
                prev: 'c5-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c5-8':{
                name:'深渊守护',
                id:'c5-8',
                type:'battle',
                text:'深渊的守护者们现身...',
                prev: 'c5-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c5-9':{
                name:'深渊之心',
                id:'c5-9',
                type:'battle',
                text:'深渊的心脏就在前方...',
                prev: 'c5-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c5-10':{
                name:'第五章BOSS',
                id:'c5-10',
                type:'boss',
                text:'第五章最终BOSS战！',
                prev: 'c5-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },

    // ========== 第六章：记忆彼岸 ==========
    chapter6:{
        name:'第六章：记忆彼岸',
        difficulty:'normal',
        procedure:[
            'c6-1','c6-2','c6-3','c6-4','c6-5',
            'c6-6','c6-7','c6-8','c6-9','c6-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c6-1':{
                name:'彼岸之门',
                id:'c6-1',
                type:'battle',
                text:'通往彼岸的门已经开启...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c6-2':{
                name:'彼岸花海',
                id:'c6-2',
                type:'battle',
                text:'彼岸的花海绚烂而危险...',
                prev: 'c6-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c6-3':{
                name:'彼岸迷雾',
                id:'c6-3',
                type:'battle',
                text:'迷雾遮蔽了前方的道路...',
                prev: 'c6-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c6-4':{
                name:'彼岸幻影',
                id:'c6-4',
                type:'battle',
                text:'幻影在彼岸飘荡...',
                prev: 'c6-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c6-5':{
                name:'彼岸星辰',
                id:'c6-5',
                type:'battle',
                text:'星辰在彼岸闪烁...',
                prev: 'c6-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c6-6':{
                name:'彼岸月影',
                id:'c6-6',
                type:'battle',
                text:'月影在彼岸舞动...',
                prev: 'c6-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c6-7':{
                name:'彼岸元素',
                id:'c6-7',
                type:'battle',
                text:'元素在彼岸交织...',
                prev: 'c6-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c6-8':{
                name:'彼岸晶石',
                id:'c6-8',
                type:'battle',
                text:'晶石在彼岸闪耀...',
                prev: 'c6-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c6-9':{
                name:'彼岸彼岸',
                id:'c6-9',
                type:'battle',
                text:'彼岸的尽头近在咫尺...',
                prev: 'c6-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c6-10':{
                name:'第六章BOSS',
                id:'c6-10',
                type:'boss',
                text:'第六章最终BOSS战！',
                prev: 'c6-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },

    // ========== 第七章：记忆黄昏 ==========
    chapter7:{
        name:'第七章：记忆黄昏',
        difficulty:'normal',
        procedure:[
            'c7-1','c7-2','c7-3','c7-4','c7-5',
            'c7-6','c7-7','c7-8','c7-9','c7-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c7-1':{
                name:'黄昏序曲',
                id:'c7-1',
                type:'battle',
                text:'黄昏的序曲正在奏响...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c7-2':{
                name:'黄昏暗涌',
                id:'c7-2',
                type:'battle',
                text:'暗流在黄昏中涌动...',
                prev: 'c7-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c7-3':{
                name:'黄昏余晖',
                id:'c7-3',
                type:'battle',
                text:'余晖在黄昏中燃烧...',
                prev: 'c7-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c7-4':{
                name:'黄昏残阳',
                id:'c7-4',
                type:'battle',
                text:'残阳在黄昏中陨落...',
                prev: 'c7-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c7-5':{
                name:'黄昏星辰',
                id:'c7-5',
                type:'battle',
                text:'星辰在黄昏中隐现...',
                prev: 'c7-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c7-6':{
                name:'黄昏月升',
                id:'c7-6',
                type:'battle',
                text:'月亮在黄昏中升起...',
                prev: 'c7-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c7-7':{
                name:'黄昏交织',
                id:'c7-7',
                type:'battle',
                text:'光影在黄昏中交织...',
                prev: 'c7-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c7-8':{
                name:'黄昏守望',
                id:'c7-8',
                type:'battle',
                text:'守望者在黄昏中出现...',
                prev: 'c7-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c7-9':{
                name:'黄昏将至',
                id:'c7-9',
                type:'battle',
                text:'黄昏即将过去...',
                prev: 'c7-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c7-10':{
                name:'第七章BOSS',
                id:'c7-10',
                type:'boss',
                text:'第七章最终BOSS战！',
                prev: 'c7-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },

    // ========== 第八章：记忆永恒 ==========
    chapter8:{
        name:'第八章：记忆永恒',
        difficulty:'normal',
        procedure:[
            'c8-1','c8-2','c8-3','c8-4','c8-5',
            'c8-6','c8-7','c8-8','c8-9','c8-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c8-1':{
                name:'永恒序章',
                id:'c8-1',
                type:'battle',
                text:'永恒的序章就此展开...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c8-2':{
                name:'永恒流转',
                id:'c8-2',
                type:'battle',
                text:'时间在永恒中流转...',
                prev: 'c8-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c8-3':{
                name:'永恒轮回',
                id:'c8-3',
                type:'battle',
                text:'生命在永恒中轮回...',
                prev: 'c8-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c8-4':{
                name:'永恒守望',
                id:'c8-4',
                type:'battle',
                text:'记忆在永恒中守望...',
                prev: 'c8-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c8-5':{
                name:'永恒星陨',
                id:'c8-5',
                type:'battle',
                text:'星辰在永恒中陨落...',
                prev: 'c8-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c8-6':{
                name:'永恒月华',
                id:'c8-6',
                type:'battle',
                text:'月华在永恒中流淌...',
                prev: 'c8-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c8-7':{
                name:'永恒元素',
                id:'c8-7',
                type:'battle',
                text:'元素在永恒中交融...',
                prev: 'c8-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c8-8':{
                name:'永恒晶华',
                id:'c8-8',
                type:'battle',
                text:'晶华在永恒中闪耀...',
                prev: 'c8-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c8-9':{
                name:'永恒彼岸',
                id:'c8-9',
                type:'battle',
                text:'彼岸在永恒中等待...',
                prev: 'c8-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c8-10':{
                name:'第八章BOSS',
                id:'c8-10',
                type:'boss',
                text:'第八章最终BOSS战！',
                prev: 'c8-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },

    // ========== 第九章：记忆终焉 ==========
    chapter9:{
        name:'第九章：记忆终焉',
        difficulty:'normal',
        procedure:[
            'c9-1','c9-2','c9-3','c9-4','c9-5',
            'c9-6','c9-7','c9-8','c9-9','c9-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c9-1':{
                name:'终焉序曲',
                id:'c9-1',
                type:'battle',
                text:'终焉的序曲已经响起...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c9-2':{
                name:'终焉降临',
                id:'c9-2',
                type:'battle',
                text:'终焉正在降临...',
                prev: 'c9-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c9-3':{
                name:'终焉咆哮',
                id:'c9-3',
                type:'battle',
                text:'终焉发出震天的咆哮...',
                prev: 'c9-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c9-4':{
                name:'终焉挣扎',
                id:'c9-4',
                type:'battle',
                text:'最后的挣扎在终焉中展开...',
                prev: 'c9-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c9-5':{
                name:'终焉星陨',
                id:'c9-5',
                type:'battle',
                text:'星辰在终焉中陨落...',
                prev: 'c9-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c9-6':{
                name:'终焉月沉',
                id:'c9-6',
                type:'battle',
                text:'月亮在终焉中沉没...',
                prev: 'c9-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c9-7':{
                name:'终焉崩溃',
                id:'c9-7',
                type:'battle',
                text:'一切在终焉中崩溃...',
                prev: 'c9-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c9-8':{
                name:'终焉破碎',
                id:'c9-8',
                type:'battle',
                text:'一切在终焉中破碎...',
                prev: 'c9-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c9-9':{
                name:'终焉之门',
                id:'c9-9',
                type:'battle',
                text:'终焉之门即将关闭...',
                prev: 'c9-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c9-10':{
                name:'第九章BOSS',
                id:'c9-10',
                type:'boss',
                text:'第九章最终BOSS战！',
                prev: 'c9-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },

    // ========== 第十章：记忆新生 ==========
    chapter10:{
        name:'第十章：记忆新生',
        difficulty:'normal',
        procedure:[
            'c10-1','c10-2','c10-3','c10-4','c10-5',
            'c10-6','c10-7','c10-8','c10-9','c10-10'
        ],
        eventPack:{
            // 关卡1：六敌 - 陈爱琳 + 张玉洁 + 王若冰 + 满城柒 + 涂山小红 + 贾雨桐
            'c10-1':{
                name:'新生黎明',
                id:'c10-1',
                type:'battle',
                text:'新生的黎明即将到来...',
                prev: null,
                enemy:[
                    {name:'陈爱琳',id:'ybsl_002chenailin',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'张玉洁',id:'ybsl_004zhangyujie',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'王若冰',id:'ybsl_005wangruobing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'满城柒',id:'ybsl_016manchengqi',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'涂山小红',id:'ybsl_017xiaohong',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'贾雨桐',id:'ybsl_020jiayutong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡2：六敌 - 李玉珊 + 周玥 + 高宇航 + 郑佳怡 + 尹超跃 + 吴格格
            'c10-2':{
                name:'新生希望',
                id:'c10-2',
                type:'battle',
                text:'希望在新生中闪耀...',
                prev: 'c10-1',
                enemy:[
                    {name:'李玉珊',id:'ybsl_009liyushan',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'周玥',id:'ybsl_010zhouyue',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'高宇航',id:'ybsl_011gaoyuhang',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'郑佳怡',id:'ybsl_012zhengjiayi',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'尹超跃',id:'ybsl_013yinji',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'吴格格',id:'ybsl_007wugege',hp:840,atk:187,def:40,spe:150,buff:[]},
                ],
            },
            // 关卡3：六敌 - 闫爽 + 张晴 + 岳瞳 + 王贺 + 史庆宇 + 蘋姉
            'c10-3':{
                name:'新生力量',
                id:'c10-3',
                type:'battle',
                text:'力量在新生中涌现...',
                prev: 'c10-2',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'张晴',id:'ybsl_018zhangqing',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'岳瞳',id:'ybsl_024yuetong',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王贺',id:'ybsl_025wanghe',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'史庆宇',id:'ybsl_025shiqingyu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'蘋姉',id:'ybsl_042pingzi',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡4：六敌 - 盛妍 + 王婉儿 + 悦儿 + 郑琰 + 房佳谕 + 高聪
            'c10-4':{
                name:'新生羁绊',
                id:'c10-4',
                type:'battle',
                text:'羁绊在新生中延续...',
                prev: 'c10-3',
                enemy:[
                    {name:'盛妍',id:'ybsl_019shengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王婉儿',id:'ybsl_049waner',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'悦儿',id:'ybsl_054yueer',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'郑琰',id:'ybsl_055zhengyan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'房佳谕',id:'ybsl_043fangjiayu',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'高聪',id:'ybsl_045gaocong',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡5：六敌 - 闫爽 + 秋儿 + 鞠熒 + 宋橤 + 周靈 + 李曉
            'c10-5':{
                name:'新生星辰',
                id:'c10-5',
                type:'battle',
                text:'星辰在新生中重新排列...',
                prev: 'c10-4',
                enemy:[
                    {name:'闫爽',id:'ybsl_003yanshuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'秋儿',id:'ybsl_053qiuer',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'鞠熒',id:'ybsl_059starsFall1',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'宋橤',id:'ybsl_059starsFall2',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'周靈',id:'ybsl_059starsFall3',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'李曉',id:'ybsl_059starsFall4',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡6：六敌 - 清月姑娘 + 吕艳秋 + 小慧 + 蛇妃 + 幻晴 + 江雪舞
            'c10-6':{
                name:'新生月光',
                id:'c10-6',
                type:'battle',
                text:'月光在新生中更加明亮...',
                prev: 'c10-5',
                enemy:[
                    {name:'清月姑娘',id:'ybsl_068qingyue',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'吕艳秋',id:'ybsl_070lvyanqiu',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'小慧',id:'ybsl_033xiaohui',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'蛇妃',id:'db_ybsl_067snake',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'幻晴',id:'ybsl_018huanqing',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'江雪舞',id:'ybsl_046jiangxuewu',hp:1400,atk:128,def:66,spe:160,buff:[]},
                ],
            },
            // 关卡7：六敌 - 蚕 + 雨 + 彡 + 玉蝶心 + 黎 + 熙
            'c10-7':{
                name:'新生融合',
                id:'c10-7',
                type:'battle',
                text:'万物在新生中融合...',
                prev: 'c10-6',
                enemy:[
                    {name:'蚕',id:'ybsl_026can',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'雨',id:'ybsl_027rain',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'彡',id:'ybsl_047shan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'玉蝶心',id:'ybsl_092handan',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'黎',id:'ybsl_029dawn',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {name:'熙',id:'ybsl_036bright',hp:896,atk:200,def:42,spe:160,buff:[]},
                ],
            },
            // 关卡8：六敌 - 方块公主 + 卞秋雯 + 胡瑞航 + 张汨 + 吴爽 + 王冰雨
            'c10-8':{
                name:'新生结晶',
                id:'c10-8',
                type:'battle',
                text:'结晶在新生中升华...',
                prev: 'c10-7',
                enemy:[
                    {name:'方块公主',id:'ybsl_037diamondqueen',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'卞秋雯',id:'ybsl_038bianqiuwen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'胡瑞航',id:'ybsl_044huruihang',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'张汨',id:'ybsl_047zhangmi',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'吴爽',id:'ybsl_048wushuang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'王冰雨',id:'ybsl_122wangbingyu',hp:1050,atk:150,def:50,spe:150,buff:[]},
                ],
            },
            // 关卡9：六敌 - 涂静 + 雪琅 + 香紫姑娘 + 朱焌 + 涂山水璃 + 王海茹
            'c10-9':{
                name:'新生彼岸',
                id:'c10-9',
                type:'battle',
                text:'彼岸在新生中重塑...',
                prev: 'c10-8',
                enemy:[
                    {name:'涂静',id:'ybsl_121tujing',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'雪琅',id:'ybsl_123xuelang',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'香紫姑娘',id:'ybsl_069xiangzi',hp:896,atk:200,def:42,spe:160,buff:[]},
                    {name:'朱焌',id:'ybsl_076zhujun',hp:1400,atk:128,def:66,spe:160,buff:[]},
                    {name:'涂山水璃',id:'ybsl_107tushanshuili',hp:840,atk:187,def:40,spe:150,buff:[]},
                    {name:'王海茹',id:'ybsl_015wanghairu',hp:1120,atk:160,def:53,spe:160,buff:[]},
                ],
            },
            // 关卡10：最终BOSS - 吴雨欣 + 王汉桢 + 孙丽松
            'c10-10':{
                name:'最终BOSS',
                id:'c10-10',
                type:'boss',
                text:'最终决战！记忆的新生即将完成！',
                prev: 'c10-9',
                enemy:[
                    {name:'吴雨欣',id:'ybsl_008wuyuxin',hp:1312,atk:120,def:62,spe:150,buff:[]},
                    {name:'王汉桢',id:'ybsl_006wanghanzhen',hp:1050,atk:150,def:50,spe:150,buff:[]},
                    {name:'孙丽松',id:'ybsl_001sunlisong',hp:1120,atk:160,def:53,spe:160,buff:[]},
                    {},{},{}
                ],
            },
        }
    },
};
