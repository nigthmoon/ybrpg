/**
 * 夜白旅程 - 角色突破配置与Buff库
 */

// ==================== 1. 全局 Buff 库定义 ====================
// 用于 passive_effect 类型的 effectId 引用
const BREAKTHROUGH_BUFF_LIBRARY = {
    // --- 增伤/减伤类 ---
    'dmg_up_10': { type: 'stat_percent', stat: 'dmg_dealt', value: 0.1, desc: '获得10%增伤' },
    'dmg_up_20': { type: 'stat_percent', stat: 'dmg_dealt', value: 0.2, desc: '获得20%增伤' },
    'dmg_up_30': { type: 'stat_percent', stat: 'dmg_dealt', value: 0.3, desc: '获得30%增伤' },
    'dmg_up_50': { type: 'stat_percent', stat: 'dmg_dealt', value: 0.5, desc: '获得50%增伤' },
    'dmg_reduce_10': { type: 'stat_percent', stat: 'dmg_taken', value: -0.1, desc: '获得10%减伤' }, // 负值表示减伤
    'dmg_reduce_20': { type: 'stat_percent', stat: 'dmg_taken', value: -0.2, desc: '获得20%减伤' },
    'dmg_reduce_30': { type: 'stat_percent', stat: 'dmg_taken', value: -0.3, desc: '获得30%减伤' },
    'dmg_reduce_50': { type: 'stat_percent', stat: 'dmg_taken', value: -0.5, desc: '获得50%减伤' },

    // --- 吸血类 ---
    'lifesteal_pugong_50': { type: 'on_hit_source', trigger: 'pugong', percent: 0.5, desc: '普攻后吸血50%' },
    'lifesteal_pugong_75': { type: 'on_hit_source', trigger: 'pugong', percent: 0.75, desc: '普攻后吸血75%' },
    'lifesteal_pugong_100': { type: 'on_hit_source', trigger: 'pugong', percent: 1.0, desc: '普攻后吸血100%' },

    'lifesteal_skill_50': { type: 'on_hit_source', trigger: 'skill', percent: 0.5, desc: '技能后吸血50%' },
    'lifesteal_skill_75': { type: 'on_hit_source', trigger: 'skill', percent: 0.75, desc: '技能后吸血75%' },
    'lifesteal_skill_100': { type: 'on_hit_source', trigger: 'skill', percent: 1.0, desc: '技能后吸血100%' },
    // --- 亡语类 (On Death) ---
    'death_heal_self_atk100': { type: 'on_death', effect: 'heal_self', value: 'atk_100', limit: 1, desc: '亡语，每局限一次，恢复生命值至攻击力*100%' },
    'death_energy_drain_enemy_2': { type: 'on_death', effect: 'drain_energy_all_enemy', value: 2, desc: '亡语，令所有敌人降低能量2' },
    'death_energy_drain_enemy_all': { type: 'on_death', effect: 'drain_energy_all_enemy', value: 'all', desc: '亡语，令所有敌人能量归零' },
    'death_heal_team_atk100': { type: 'on_death', effect: 'heal_team', value: 'self_atk_100', desc: '亡语，令所有队友恢复生命为自身攻击力*100%' },
    'death_energy_team_2': { type: 'on_death', effect: 'add_energy_team', value: 2, desc: '亡语，令所有队友恢复2能量' },
    'death_dmg_true_enemy_atk100': { type: 'on_death', effect: 'dmg_true_all_enemy', value: 'self_atk_100', desc: '亡语，对所有敌人造成攻击力*100%真实伤害' },

    // --- 无视防御类 (Ignore Defense) ---
    // 注意：代码逻辑需处理同类型取最大，不同类型加算
    'ignore_def_pugong_50': { type: 'ignore_def', trigger: 'pugong', value: 0.5, desc: '普攻时，无视对方50%防御力' },
    'ignore_def_pugong_80': { type: 'ignore_def', trigger: 'pugong', value: 0.8, desc: '普攻时，无视对方80%防御力' },
    'ignore_def_pugong_100': { type: 'ignore_def', trigger: 'pugong', value: 1.0, desc: '普攻时，无视对方全部防御力' },
    
    'ignore_def_skill_50': { type: 'ignore_def', trigger: 'skill', value: 0.5, desc: '技能时，无视对方50%防御力' },
    'ignore_def_skill_80': { type: 'ignore_def', trigger: 'skill', value: 0.8, desc: '技能时，无视对方80%防御力' },
    'ignore_def_skill_100': { type: 'ignore_def', trigger: 'skill', value: 1.0, desc: '技能时，无视对方全部防御力' },
    
    'ignore_def_all_30': { type: 'ignore_def', trigger: 'all', value: 0.3, desc: '所有伤害无视对方30%防御力' },
    'ignore_def_all_60': { type: 'ignore_def', trigger: 'all', value: 0.6, desc: '所有伤害无视对方60%防御力' },
    'ignore_def_all_100': { type: 'ignore_def', trigger: 'all', value: 1.0, desc: '所有伤害无视对方全部防御力' },

    // --- 控制类：封印 (Seal) ---
    'seal_target_30_pugong': { type: 'on_pugong_hit_target', chance: 0.3, effect: 'seal_1', desc: '普攻时，30%几率封印目标一回合' },
    'seal_target_60_pugong': { type: 'on_pugong_hit_target', chance: 0.6, effect: 'seal_1', desc: '普攻时，60%几率封印目标一回合' },
    'seal_target_100_pugong': { type: 'on_pugong_hit_target', chance: 1.0, effect: 'seal_1', desc: '普攻时，100%几率封印目标一回合' },

    'seal_target_30_skill': { type: 'on_pugong_hit_target', chance: 0.3, effect: 'seal_1', desc: '使用技能后，30%几率封印目标一回合' },
    'seal_target_60_skill': { type: 'on_pugong_hit_target', chance: 0.6, effect: 'seal_1', desc: '使用技能后，60%几率封印目标一回合' },
    'seal_target_100_skill': { type: 'on_pugong_hit_target', chance: 1.0, effect: 'seal_1', desc: '使用技能后，100%几率封印目标一回合' },

    // --- 控制类：减能 (Energy Drain) ---
    'drain_energy_1_20_skill': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'drain_energy_1', desc: '使用技能后，20%几率减少目标1能量' },
    'drain_energy_1_50_skill': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'drain_energy_1', desc: '使用技能后，50%几率减少目标1能量' },
    'drain_energy_1_80_skill': { type: 'on_pugong_hit_target', chance: 0.8, effect: 'drain_energy_1', desc: '使用技能后，80%几率减少目标1能量' },
    
    'drain_energy_2_20_skill': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'drain_energy_2', desc: '使用技能后，20%几率减少目标2能量' },
    'drain_energy_2_50_skill': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'drain_energy_2', desc: '使用技能后，50%几率减少目标2能量' },

    'drain_energy_1_20_pugong': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'drain_energy_1', desc: '普攻时，20%几率令目标降低1能量' },
    'drain_energy_1_50_pugong': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'drain_energy_1', desc: '普攻时，50%几率令目标降低1能量' },
    'drain_energy_1_80_pugong': { type: 'on_pugong_hit_target', chance: 0.8, effect: 'drain_energy_1', desc: '普攻时，80%几率令目标降低1能量' },

    // --- 控制类：眩晕 (Stun) ---
    'stun_target_1_20_pugong': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'stun_target_1', desc: '普攻时，20%几率令目标眩晕1回合' },
    'stun_target_1_50_pugong': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'stun_target_1', desc: '普攻时，50%几率令目标眩晕1回合' },
    
    'stun_target_1_20_skill': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'stun_target_1', desc: '使用技能后，20%几率令目标眩晕1回合' },
    'stun_target_1_50_skill': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'stun_target_1', desc: '使用技能后，50%几率令目标眩晕1回合' },

    // --- 控制类：中毒 (Poison) ---
    // 系数为攻击力百分比，可叠加
    'poison_5_atk_20_pugong': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'poison', value: 0.05, desc: '普攻时，20%几率令目标永久中毒，系数为攻击力5%' },
    'poison_5_atk_50_pugong': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'poison', value: 0.05, desc: '普攻时，50%几率令目标永久中毒，系数为攻击力5%' },
    'poison_5_atk_100_pugong': { type: 'on_pugong_hit_target', chance: 1.0, effect: 'poison', value: 0.05, desc: '普攻时，100%几率令目标永久中毒，系数为攻击力5%' },
    
    'poison_10_atk_20_skill': { type: 'on_pugong_hit_target', chance: 0.2, effect: 'poison', value: 0.10, desc: '使用技能后，20%几率令目标永久中毒，系数为攻击力10%' },
    'poison_10_atk_50_skill': { type: 'on_pugong_hit_target', chance: 0.5, effect: 'poison', value: 0.10, desc: '使用技能后，50%几率令目标永久中毒，系数为攻击力10%' },
    'poison_10_atk_110_skill': { type: 'on_pugong_hit_target', chance: 1.1, effect: 'poison', value: 0.10, desc: '使用技能后，必中且超额判定，令目标永久中毒，系数为攻击力10%' },

    // --- 首回合特效 ---
    'first_hit_dmg_up_50': { type: 'first_hit_bonus', stat: 'dmg_dealt', value: 0.5, desc: '进入战斗的首次普攻或技能伤害增加50%' },
    'first_taken_dmg_reduce_75': { type: 'first_taken_bonus', stat: 'dmg_taken', value: -0.75, desc: '进入战斗的首次受到普攻或技能伤害减少75%' },

    // --- 受击特效 ---
    'on_hit_energy_team_50': { type: 'on_hit_self', chance: 0.5, effect: 'add_energy_team_1', desc: '受到普攻或技能伤害，50%几率令全体队友增加1能量' },
    
    'on_hit_drain_source_1_25': { type: 'on_hit_self', chance: 0.25, effect: 'drain_source_1', desc: '受到普攻或技能伤害时，25%几率减少来源1能量' },
    'on_hit_drain_source_1_50': { type: 'on_hit_self', chance: 0.5, effect: 'drain_source_1', desc: '受到普攻或技能伤害时，50%几率减少来源1能量' },
    
    'on_hit_self_energy_1': { type: 'on_hit_self', chance: 1.0, effect: 'add_self_energy_1', desc: '受到普攻或技能伤害时，自身增加1能量' },
    
    'on_hit_stun_target_10': { type: 'on_hit_self', chance: 0.1, effect: 'stun_source_1', desc: '受到普攻或技能伤害时，10%几率令来源眩晕1回合' },
    'on_hit_stun_target_20': { type: 'on_hit_self', chance: 0.2, effect: 'stun_source_1', desc: '受到普攻或技能伤害时，20%几率令来源眩晕1回合' },

    'on_hit_counter_100': { 
        type: 'on_hit_self', 
        chance: 1.0, 
        effect: 'counter_pugong', 
        coefficient: 1.0, 
        desc: '受到普攻或技能伤害时，对来源进行一次特殊普攻，造成100%攻击力的伤害' 
    },
    'on_hit_counter_75': { 
        type: 'on_hit_self', 
        chance: 1.0, 
        effect: 'counter_pugong', 
        coefficient: 0.75, 
        desc: '受到普攻或技能伤害时，对来源进行一次特殊普攻，造成75%攻击力的伤害' 
    },
    'on_hit_counter_50': { 
        type: 'on_hit_self', 
        chance: 1.0, 
        effect: 'counter_pugong', 
        coefficient: 0.5, 
        desc: '受到普攻或技能伤害时，对来源进行一次特殊普攻，造成50%攻击力的伤害' 
    },
    
    'on_hit_poison_source_5_20': { type: 'on_hit_self', chance: 0.2, effect: 'poison_source', value: 0.05, desc: '受到普攻或技能伤害时，20%几率令来源中毒，系数为攻击力5%' },
    'on_hit_poison_source_5_50': { type: 'on_hit_self', chance: 0.5, effect: 'poison_source', value: 0.05, desc: '受到普攻或技能伤害时，50%几率令来源中毒，系数为攻击力5%' },
    'on_hit_poison_source_5_100': { type: 'on_hit_self', chance: 1.0, effect: 'poison_source', value: 0.05, desc: '受到普攻或技能伤害时，100%几率令来源中毒，系数为攻击力5%' },

    // --- 普攻辅助特效 ---
    'pugong_energy_team_25': { type: 'on_pugong_start', chance: 0.25, effect: 'add_energy_team_1', desc: '普攻时，25%增加全队1能量' },
    'pugong_energy_lowest_1': { type: 'on_pugong_start', chance: 1.0, effect: 'add_energy_lowest_1', desc: '普攻时，令能量最低的一名队友增加1能量' },

    'pugong_energy_self_1': { type: 'on_pugong_start', chance: 1.0, effect: 'add_energy_self_1', desc: '普攻时，恢复1点能量' },
    'pugong_energy_self_2': { type: 'on_pugong_start', chance: 1.0, effect: 'add_energy_self_2', desc: '普攻时，恢复2点能量' },
        // --- 技能类：杂项

    'skill_energy_self_2': { type: 'on_skill_end', chance: 1.0, effect: 'add_energy_self_2', desc: '使用技能后，恢复2点能量' },
    'extra_pugong': { type: 'on_skill_end', chance: 1.0, effect: 'extra_pugong', desc: '使用技能后，立即进行一次自动普攻（不触发部分手动选择逻辑）' },
    
    // 【新增】无敌一回合 (持续到下一轮本角色行动前)
    'skill_invincible_1': { 
        type: 'on_skill_end', 
        chance: 1.0, 
        effect: 'apply_invincible_1', 
        desc: '使用技能后，获得1回合无敌状态（免疫所有伤害，直到下一轮你的回合开始前）' 
    },
    // 【新增】击杀后获得额外回合
    'kill_extra_turn_1': { 
        type: 'on_kill', // 假设我们定义一个 on_kill 触发类型，或者在代码中特殊处理
        chance: 1.0, 
        effect: 'add_extra_turn_1', 
        desc: '成功击杀敌人后，获得1个额外行动回合' 
    },
    'kill_add_energy_self_2': { 
        type: 'on_kill', 
        chance: 1.0, 
        effect: 'add_energy_self_2', 
        desc: '成功击杀敌人后，获得2能量' 
    },
    // 【新增】禁疗一回合 (持续到下一轮目标行动前)
    // 注意：虽然配置在 on_skill_end，但逻辑上我们会让它作用于 targets
    'skill_heal_block_1': { 
        type: 'on_skill_hit_target', // 建议改为 on_skill_hit，或者在代码中特殊处理 on_skill_end 作用于目标
        chance: 1.0, 
        effect: 'apply_heal_block_1', 
        desc: '技能命中后，令目标禁疗1回合（直到下一轮目标的回合开始前）' 
    },

    // --- 治疗系专属 ---
    'heal_up_10': { type: 'stat_percent', stat: 'heal_done', value: 0.1, desc: '治疗量增加10%' },
    'heal_up_25': { type: 'stat_percent', stat: 'heal_done', value: 0.25, desc: '治疗量增加25%' },
    'heal_up_50': { type: 'stat_percent', stat: 'heal_done', value: 0.5, desc: '治疗量增加50%' },
    
    'heal_energy_target_1_pugong': { type: 'on_heal', trigger: 'pugong', effect: 'add_target_energy_1', desc: '普攻时，令被治疗目标增加1能量' },
    'heal_energy_target_1_skill': { type: 'on_heal', trigger: 'skill', effect: 'add_target_energy_1', desc: '技能时，令被治疗目标增加1能量' },
    'heal_cleanse_target_skill': { type: 'on_heal', trigger: 'skill', effect: 'cleanse_target', desc: '技能时，解除被治疗目标的负面效果' },
};

// ==================== 2. 标准突破等级模板 (0-19) ====================
// 对应策划案中的 20 个阶段
// 注意：这是一个通用模板。如果需要为特定角色定制，可以在 charList 中引用此模板并覆盖特定层级，
// 或者直接在此处修改数值。

const STANDARD_BREAKTHROUGH_TEMPLATE = [
    // Level 0
    {
        level: 0,
        type: 'self_stat_flat',
        stat: 'atk',
        value: 100,
        desc: '初始化时攻击+100固定数值'
    },
    // Level 1
    {
        level: 1,
        type: 'self_energy',
        value: 1,
        desc: '初始能量+1'
    },
    // Level 2
    {
        level: 2,
        type: 'self_stat_flat',
        stat: 'def',
        value: 50,
        desc: '初始化时防御+50固定数值'
    },
    // Level 3
    {
        level: 3,
        type: 'self_energy',
        value: 1,
        desc: '初始能量+1'
    },
    // Level 4
    {
        level: 4,
        type: 'self_stat_flat',
        stat: 'hp',
        value: 200,
        desc: '初始化时血量+200固定数值'
    },
    // Level 5 (角色专有突破buff - 示例：无视防御)
    {
        level: 5,
        type: 'passive_effect',
        effectId: 'ignore_def_pugong_50', // 引用上方库
        desc: '【专属】普攻时，无视对方50%防御力'
    },
    // Level 6
    {
        level: 6,
        type: 'self_stat_percent',
        stats: ['atk', 'def', 'hp'],
        percent: 0.1,
        desc: '初始化时获得10%的攻防血加成'
    },
    // Level 7
    {
        level: 7,
        type: 'self_energy',
        value: 1,
        desc: '初始能量+1'
    },
    // Level 8 (角色专属buff - 示例：增伤)
    {
        level: 8,
        type: 'passive_effect',
        effectId: 'dmg_up_10',
        desc: '【专属】获得10%增伤'
    },
    // Level 9
    {
        level: 9,
        type: 'team_stat_flat',
        stat: 'atk',
        value: 200,
        desc: '初始化时全队获得攻击+200固定数值'
    },
    // Level 10 (角色专属buff - 示例：吸血)
    {
        level: 10,
        type: 'passive_effect',
        effectId: 'lifesteal_pugong_50',
        desc: '【专属】普攻后吸血50%'
    },
    // Level 11
    {
        level: 11,
        type: 'self_energy',
        value: 1,
        desc: '初始能量+1'
    },
    // Level 12
    {
        level: 12,
        type: 'team_stat_flat',
        stat: 'def',
        value: 100,
        desc: '初始化时全队获得防御+100固定数值'
    },
    // Level 13 (专属buff - 示例：减伤)
    {
        level: 13,
        type: 'passive_effect',
        effectId: 'dmg_reduce_10',
        desc: '【专属】获得10%减伤'
    },
    // Level 14
    {
        level: 14,
        type: 'team_stat_flat',
        stat: 'hp',
        value: 300,
        desc: '初始化时全队获得血量+300固定数值'
    },
    // Level 15
    {
        level: 15,
        type: 'self_energy',
        value: 1,
        desc: '初始能量+1'
    },
    // Level 16 (专属buff - 示例：首击特效)
    {
        level: 16,
        type: 'passive_effect',
        effectId: 'first_hit_dmg_up_50',
        desc: '【专属】进入战斗的首次普攻或技能伤害增加50%'
    },
    // Level 17
    {
        level: 17,
        type: 'team_stat_percent',
        stats: ['atk', 'def', 'hp'],
        percent: 0.1,
        desc: '初始化时全队获得10%的攻防血加成'
    },
    // Level 18 (专属buff - 示例：控制抗性/反击)
    {
        level: 18,
        type: 'passive_effect',
        effectId: 'on_hit_self_energy_1',
        desc: '【专属】受到普攻或技能伤害时，自身增加1能量'
    },
    // Level 19
    {
        level: 19,
        type: 'self_energy',
        value: 1,
        desc: '初始能量+1'
    }
];

// 导出配置
window.BREAKTHROUGH_BUFF_LIBRARY = BREAKTHROUGH_BUFF_LIBRARY;
window.STANDARD_BREAKTHROUGH_TEMPLATE = STANDARD_BREAKTHROUGH_TEMPLATE;