// ====== 战斗核心系统类型定义 ======

// ====== 战斗状态类型 ======

/**
 * 战斗阶段枚举
 * - 'intro': 战斗开始介绍阶段
 * - 'player_action': 等待玩家选择行动
 * - 'enemy_action': AI执行行动
 * - 'animating': 动画播放中
 * - 'ended': 战斗已结束
 */
type BattlePhase = 'intro' | 'player_action' | 'enemy_action' | 'animating' | 'ended';

/** 阵营：player = 我方，enemy = 敌方 */
type Side = 'player' | 'enemy';

/** 战斗难度 */
type Difficulty = 'normal' | 'nightmare' | 'hell';

/**
 * 技能类型
 * - 'pugong': 普攻
 * - 'skill': 技能（消耗4能量）
 * - 'spskill': 必杀（消耗8能量）
 */
type SkillType = 'pugong' | 'skill' | 'spskill';

/**
 * 效果触发时机
 * - 'pugongHit': 普攻命中目标时
 * - 'skillHit': 技能命中目标时
 * - 'spskillHit': 必杀命中目标时
 * - 'onHit': 造成伤害时（通用）
 * - 'onHitSelf': 自身受到伤害时
 * - 'onKill': 击杀目标时
 * - 'dieGlobal': 场上任意角色阵亡时
 * - 'dieSelf': 自身阵亡时
 */
type TriggerType = 'pugongHit' | 'skillHit' | 'spskillHit' | 'onHit' | 'onHitSelf' | 'onKill' | 'dieGlobal' | 'dieSelf';

/**
 * 目标选择模式
 * - 'one': 单体目标
 * - 'all': 全体目标
 * - 'row': 行目标（前后排）
 * - 'column': 列目标（左中右）
 * - 'manual_multi': 手动多选目标
 * - 'lowest_hp_multi': 血量最低的多个目标
 * - 'exclude_self': 除自身外的目标
 */
type TargetMode = 'one' | 'all' | 'row' | 'column' | 'manual_multi' | 'lowest_hp_multi' | 'exclude_self';

/**
 * AI选择偏好
 * - 'first': 优先选择第一个目标
 * - 'last': 优先选择最后一个目标
 * - 'random': 随机选择目标
 */
type AIPreference = 'first' | 'last' | 'random';

/**
 * 角色稀有度（影响名字颜色）
 * - 'kami': 神级（金色）
 * - 'legend': 传说（红色）
 * - 'epic': 史诗（亮红色）
 * - 'rare': 稀有（紫色）
 * - 'common': 普通（蓝色）
 * - 'junk': 垃圾（绿色）
 */
type Rank = 'kami' | 'legend' | 'epic' | 'rare' | 'common' | 'junk';

/** 角色模板类型（影响基础属性分配） */
type Template = 'balanced' | 'offensive' | 'defensive' | 'support';

// ====== 角色突破类型 ======

/** 突破效果数据对象 */
interface BreakthroughBuff {
    /** 突破类型：self_stat_flat | self_energy | passive_effect | team_stat_flat | team_stat_percent | skill_effect | death_effect | behit_effect */
    type: string;
    /** 突破等级（从0开始） */
    level?: number;
    /** 攻击力加成 */
    atk?: number;
    /** 防御力加成 */
    def?: number;
    /** 生命值加成 */
    hp?: number;
    /** 能量值 */
    value?: number;
    /** 被动效果ID */
    effectId?: string;
    /** 绑定的技能索引：0=普攻，1=技能，2=必杀 */
    skillIndex?: number;
    /** 触发概率（0-1之间） */
    chance?: number;
    /** 效果数组 */
    effects?: Effect[];
    /** 效果描述文本 */
    desc?: string;
}

// ====== 效果类型 ======

/** 单个效果定义 */
interface Effect {
    /** 效果类型：'stun' | 'reduceEnergy' | 'seal' | 'seal_killer' | 'damage_reduce' | 'extraDamage' */
    type: string;
    /** 持续回合数（眩晕等效果使用） */
    turns?: number;
    /** 能量变化量 */
    amount?: number;
    /** 是否永久生效 */
    permanent?: boolean;
    /** 数值参数（如减伤百分比，0.5表示降低50%） */
    value?: number;
    /** 触发条件（如 'self_hp_gt_50' 表示自身血量大于50%） */
    condition?: string;
}

/** 存储在角色skills中的效果对象 */
interface SkillEffect {
    /** 触发时机 */
    trigger: TriggerType;
    /** 判定函数，返回true则执行content */
    filter: (this: Unit, ...args: any[]) => boolean;
    /** 执行函数，根据trigger不同接收不同参数 */
    content: (this: Unit, ...args: any[]) => any;
    /** 效果描述 */
    desc?: string;
}

// ====== 技能数据（contentList 中的定义） ======

/** 普攻/技能/必杀的数据定义 */
interface SkillData {
    /** 技能名称 */
    name: string;
    /** 技能描述（显示给玩家） */
    intro: string;
    /** AI决策描述（影响AI选择偏好） */
    ai_intro?: string;
    /**
     * 目标选择配置
     * 第一个元素：选择模式
     * 第二个元素：AI偏好
     * 第三个元素：目标数量（仅manual_multi模式使用）
     */
    target: [TargetMode, AIPreference, number?];
    /** 伤害/治疗系数（乘以攻击力得到最终数值） */
    coefficient: number;
    /** 是否为治疗技能 */
    isRecover?: boolean;
    /** 旧版恢复检测字符串（遗留兼容） */
    content?: string;
    /**
     * 技能附带的效果数组
     * 每个元素可包含：
     * - content: 可执行函数（直接写逻辑）
     * - filter: 判定函数
     * - type: 效果类型
     * - trigger: 触发配置
     * - effects: 效果数组
     * - desc: 描述文本
     */
    contents?: Array<{
        content?: (target: Unit, attacker: Unit, battleState?: BattleState) => boolean | void;
        filter?: (...args: any[]) => boolean;
        type?: string;
        trigger?: { chance: number };
        effects?: Effect[];
        desc: string;
    }>;
}

// ====== 角色单位类型 ======

/** 战斗中的角色单位 */
interface Unit {
    /** 角色唯一标识 */
    id: string;
    /** 角色实例ID（同一角色不同实例） */
    instanceId: string;
    /** 角色显示名称 */
    name: string;
    /** 所属阵营 */
    side: Side;
    /** 站位索引（0-5） */
    slotIndex: number;
    /** 稀有度 */
    rank: Rank;
    /** 模板类型 */
    template: Template;
    /** 最大生命值 */
    maxHp: number;
    /** 当前生命值 */
    hp: number;
    /** 攻击力 */
    atk: number;
    /** 防御力 */
    def: number;
    /** 速度（决定先手顺序） */
    spe: number;
    /** 当前能量（0-8，4能量可放技能，8能量可放必杀） */
    energy: number;
    /** 被动效果列表 */
    buff: string[];
    /**
     * skills数组：
     * - 前3项为技能ID字符串（普攻/技能/必杀）
     * - 后续项为SkillEffect效果对象
     */
    skills: (string | SkillEffect)[];
    /** 是否存活 */
    alive: boolean;
    /** 宝物列表（暂未实现） */
    treasures: any[];
    /** 是否被封印（无法使用技能和必杀） */
    sealed: boolean;
    /** 封印剩余回合数 */
    sealTurns: number;
    /** 封印来源角色 */
    sealOwner: Unit | null;
    /** 是否被永久封印 */
    permanentlySealed: boolean;
    /** 是否眩晕（眩晕时跳过回合） */
    stunned?: boolean;
    /** 额外回合次数 */
    extraTurnCount: number;
    /** 是否获得额外回合（标记） */
    extraTurn?: boolean;
    /** 是否禁疗 */
    healBlocked?: boolean;
    /** 突破列表（原始数据） */
    tupoList: BreakthroughBuff[];
    /** 当前突破等级 */
    tupolevel: number;
    /** 临时属性：团队固定属性加成（构建时使用后删除） */
    _teamBuffs?: BreakthroughBuff[];
    /** 临时属性：团队百分比属性加成（构建时使用后删除） */
    _teamPercentBuffs?: BreakthroughBuff[];
    /** 是否已经行动过（标记） */
    hasAttacked: boolean;
}

// ====== 战斗状态类型 ======

/** 完整的战斗状态 */
interface BattleState {
    /** 我方队伍（6个站位，null表示空位） */
    playerUnits: (Unit | null)[];
    /** 敌方队伍（6个站位，null表示空位） */
    enemyUnits: (Unit | null)[];
    /** 先手方 */
    firstSide: Side;
    /** 当前轮数（从1开始） */
    round: number;
    /** 当前行动角色在队伍中的索引 */
    currentTurnIndex: number;
    /** 当前行动角色所属阵营 */
    currentTurnSide: Side | null;
    /** 当前战斗阶段 */
    phase: BattlePhase;
    /** 记录已行动角色的阵营和索引 */
    actedSlots: {
        player: Set<number>;
        enemy: Set<number>;
    };
    /** 已选择的技能（暂未使用） */
    selectedSkill: any;
    /** 已选择的目标（少数情况下使用） */
    selectedTargets: any[];
    /** 战斗难度 */
    difficulty?: Difficulty;
    /** 事件ID */
    eventId: string | null;
    /** 事件类型：普通战斗或Boss战 */
    eventType?: 'battle' | 'boss';
    /** 所属章节 */
    chapterKey: string | null;
    /** 金币倍率 */
    goldScale?: number;
    /** 敌方单位数量 */
    enemyCount: number;
    /** 战斗胜利回调函数 */
    onWin: Function | null;
    /** 战斗失败回调函数 */
    onLose: Function | null;
    /** 战斗日志 */
    log: string[];
    /** 标记战斗是否已正式开始（用于宝物触发等） */
    battleStarted: boolean;
    /** 预期获得的金币奖励 */
    expectedGold: number;
}

// ====== 目标选择状态 ======

/** 玩家选择目标时的临时状态 */
interface TargetSelection {
    /** 当前行动的角色 */
    actor: Unit;
    /** 当前选择的技能类型 */
    skillType: SkillType;
    /** 当前选择的技能ID */
    skillId: string;
    /** 消耗的能量 */
    energyCost: number;
    /** 目标选择模式 */
    targetMode: TargetMode;
    /** 需要选择的目标数量 */
    targetCount: number;
    /** 是否为治疗技能 */
    isRecover: boolean;
    /** 目标所属阵营 */
    targetSide: Side;
    /** 已选中的目标列表（多选模式使用） */
    selectedTargets: Unit[];
}

// ====== 动作对象 ======

/** 行动指令（包含角色将要执行的动作） */
interface Action {
    /** 行动类型 */
    type: 'pugong' | 'skill';
    /** 技能类型 */
    skillType: SkillType;
    /** 技能ID */
    skillId: string;
    /** 目标列表 */
    targets: Unit[];
    /** 消耗的能量值 */
    energyCost: number;
}

// ====== 伤害事件上下文 ======

/** 传递给applyDamage的额外上下文信息 */
interface DamageSkillContext {
    /** 技能数据对象 */
    skillData?: SkillData;
    /** 触发时机 */
    trigger?: TriggerType;
    /** 技能ID */
    skillId?: string;
}

// ====== 事件系统类型 ======

/** 事件系统传递的数据 */
interface BattleEventData {
    /** 目标角色 */
    target?: Unit;
    /** 攻击者角色 */
    attacker?: Unit;
    /** 基础伤害值 */
    baseDamage?: number;
    /** 最终伤害值（可被修改） */
    finalDamage?: number;
    /** 技能数据 */
    skill?: SkillData | null;
    /** 事件类型标识 */
    type?: string;
    /** 造成/受到的伤害值 */
    damage?: number;
    /** 是否被击杀 */
    killed?: boolean;
    /** 治疗量 */
    heal?: number;
    /** 基础治疗量 */
    baseHeal?: number;
    /** 最终治疗量（可被修改） */
    finalHeal?: number;
    /** 行动角色 */
    actor?: Unit;
    /** 阵营 */
    side?: Side;
    /** 轮数 */
    round?: number;
}

// ====== 技能特效信息 ======

/** 技能特效配置 */
interface SkillEffectInfo {
    /** 显示的Emoji符号 */
    emoji: string;
    /** CSS类名 */
    effectClass: string;
}

// ====== 函数类型定义 ======

// ====== 全局变量 ======

/** 当前战斗状态（全局单例） */
declare let battleState: BattleState | null;
/** 当前目标选择状态（全局单例） */
declare let targetSelection: TargetSelection | null;
/** 全局锁，防止函数重入 */
declare let isProcessing: boolean;

// ====== 事件系统 ======

/**
 * 事件系统 - 用于模块间通信
 * 支持同步（emit）和异步（emitAsync）两种触发方式
 */
declare const BattleEvents: {
    /** 伤害计算前事件（可修改伤害值） */
    BEFORE_DAMAGE: 'beforeDamage';
    /** 伤害计算后事件 */
    AFTER_DAMAGE: 'afterDamage';
    /** 治疗计算前事件（可修改治疗量） */
    BEFORE_HEAL: 'beforeHeal';
    /** 治疗计算后事件 */
    AFTER_HEAL: 'afterHeal';
    /** 回合开始前事件 */
    BEFORE_TURN: 'beforeTurn';
    /** 回合结束后事件 */
    AFTER_TURN: 'afterTurn';
    /** 轮次开始前事件 */
    BEFORE_ROUND: 'beforeRound';
    /** 轮次结束后事件 */
    AFTER_ROUND: 'afterRound';
    /** 行动前事件 */
    BEFORE_ACTION: 'beforeAction';
    /** 行动后事件 */
    AFTER_ACTION: 'afterAction';
    
    /** 监听器存储 */
    _listeners: Record<string, Function[]>;
    
    /** 注册事件监听器 */
    on(eventType: string, listener: (...args: any[]) => any): void;
    /** 移除事件监听器 */
    off(eventType: string, listener: (...args: any[]) => any): void;
    /** 触发同步事件（返回可修改的数据） */
    emit(eventType: string, data: BattleEventData): BattleEventData;
    /** 触发异步事件（串行执行，完成后回调） */
    emitAsync(eventType: string, data: BattleEventData, callback: () => void): void;
};

// ====== 基础工具函数 ======

/** 添加战斗日志（同时更新DOM和console） */
declare function addBattleLog(msg: string): void;
/** 更新所有角色的UI显示（血量、能量、状态等） */
declare function updateBattleUI(): void;
/**
 * 在角色上方显示漂浮数字
 * @param unit 目标角色
 * @param value 数值
 * @param isHeal true=治疗(绿色)，false=伤害(红色)
 */
declare function showDamageNumber(unit: Unit, value: number, isHeal: boolean): void;
/** 隐藏玩家行动面板 */
declare function hidePlayerActionUI(): void;
/** 清除所有目标高亮 和 click事件绑定 */
declare function clearTargetHighlights(): void;
/** 获取指定阵营的存活角色列表 */
declare function getAliveUnits(side: Side): Unit[];
/** 判断指定阵营是否全灭 */
declare function isSideDefeated(side: Side): boolean;
/** 查找指定阵营中下一个可行动的角色 */
declare function findNextActor(side: Side): Unit | null;
/** 重置所有角色的"已行动"标记（新轮次开始时调用） */
declare function resetActedSlots(): void;
/** Fisher-Yates 洗牌算法，随机打乱数组顺序 */
declare function shuffleArray(array: any[]): any[];

// ====== 核心结算模块 ======

/**
 * 计算伤害值
 * @param attacker 攻击者
 * @param defender 防御者
 * @param coefficient 伤害系数
 * @param extraEnergy 额外消耗的能量（用于技能增伤）
 * @returns 最终伤害值（至少为1）
 * 公式：floor(max(1, floor(atk * coeff * (1 + extraEnergy * 0.1)) - def))
 */
declare function calculateDamage(attacker: Unit, defender: Unit, coefficient: number, extraEnergy?: number): number;

/**
 * 应用伤害到目标
 * @param target 受伤角色
 * @param dmg 伤害值
 * @param attacker 伤害来源
 * @param callback 结算完成后的回调
 * @param skillContext 技能上下文（包含技能数据、触发时机等）
 * 
 * 流程：
 * 1. 触发目标的受击效果（onHitSelf）
 * 2. 触发 beforeDamage 事件（可修改伤害）
 * 3. 扣除生命值
 * 4. 触发攻击者的命中效果（pugongHit/skillHit/spskillHit）
 * 5. 触发 afterDamage 事件
 * 6. 判断是否阵亡：
 *    - 阵亡：触发亡语效果，攻击者回能
 *    - 未阵亡：目标回能
 */
declare function applyDamage(target: Unit, dmg: number, attacker: Unit, callback: () => void, skillContext?: DamageSkillContext): void;

/**
 * 应用治疗到目标
 * @param target 被治疗者
 * @param healAmount 治疗量
 * @param callback 结算完成后的回调
 * 
 * 流程：
 * 1. 检查是否存活和禁疗
 * 2. 触发 beforeHeal 事件（可修改治疗量）
 * 3. 恢复生命值（不超过最大生命值）
 * 4. 触发 afterHeal 事件
 */
declare function applyHeal(target: Unit, healAmount: number, callback: () => void): void;

// ====== 行动执行模块 ======

/** 执行普攻行动 */
declare function executePugong(actor: Unit, targets: Unit[], callback: () => void): void;
/** 执行技能/必杀行动 */
declare function executeSkill(actor: Unit, skillType: SkillType, skillId: string, targets: Unit[], energyCost: number, callback: () => void): void;
/**
 * 从角色的skills中获取指定触发时机的效果对象
 * @param actor 角色
 * @param trigger 触发时机
 * @returns 匹配的效果对象数组
 */
declare function getEffectsByTrigger(actor: Unit, trigger: TriggerType): SkillEffect[];

// ====== 战斗循环控制 ======

/** 进入下一回合（查找下一个行动角色） */
declare function nextTurn(): void;
/** 当前行动结束，处理回合后逻辑（额外回合、战斗结束判断等） */
declare function afterAction(): void;
/** 结束当前轮次，进入下一轮（重置 actedSlots，轮数+1） */
declare function endRound(): void;
/** 播放行动动画（光晕、特效、延迟结算） */
declare function bs_animateAction(actor: Unit, action: Action, callback: () => void): void;
/** AI执行回合（选择行动并执行） */
declare function executeAITurn(actor: Unit): void;
/** 玩家执行回合（由onTargetClicked等调用） */
declare function executePlayerTurn(actor: Unit, action: Action): void;
/** 显示战斗介绍并开始第一回合 */
declare function showBattleIntro(): void;
/** 结束战斗（胜利/失败） */
declare function endBattle(winner: Side): void;

// ====== 玩家操作面板 ======

/** 获取技能对应的Emoji图标 */
declare function getSkillEmoji(skillType: SkillType, skillId: string): string;
/** 显示玩家行动选择面板（普攻/技能/必杀按钮） */
declare function showPlayerActionUI(actor: Unit): void;

// ====== 目标选择逻辑 ======

/** 进入目标选择状态（点击技能按钮后触发） */
declare function enterTargetSelection(actor: Unit, skillType: SkillType, skillId: string, energyCost: number): void;
/** 高亮可选择的角色（添加selectable类） */
declare function highlightSelectableTargets(mode: TargetMode, isRecover: boolean, targetSide: Side): void;
/** 目标被点击时触发（确定最终目标列表） */
declare function onTargetClicked(target: Unit): void;

// ====== AI 逻辑 ======

/** AI选择行动（优先必杀>技能>普攻） */
declare function aiChooseAction(actor: Unit): Action | null;
/** AI选择目标（根据技能配置） */
declare function aiSelectTargets(actor: Unit, skillData: SkillData, enemySide: Side, friendlySide: Side): Unit[];
/** 根据技能的目标配置解析合法目标列表 */
declare function resolveSkillTargets(skillData: SkillData, actor: Unit, intendedSide: Side, options?: any): Unit[];
/** 选择最优单体目标 */
declare function selectBestSingleTarget(candidates: Unit[], pref: AIPreference, actor: Unit, options?: any): Unit | null;
/** 选择行目标 */
declare function selectRowTargetsSmart(candidates: Unit[], pref: AIPreference, actor: Unit): Unit[];
/** 选择列目标 */
declare function selectColumnTargetsSmart(candidates: Unit[], pref: AIPreference, actor: Unit): Unit[];

// ====== 结算界面 ======

/** 显示战斗结算界面（胜利/失败） */
declare function showBattleResult(winner: Side): void;

// ====== 初始化与渲染 ======

/**
 * 编译突破数据
 * @param data 原始突破数据（对象或库ID字符串）
 * @param index 突破等级
 * @returns 编译后的突破对象
 */
declare function normalizeBreakthroughData(data: BreakthroughBuff | string | null, index: number): BreakthroughBuff | null;

/**
 * 开始战斗
 * @param playerTeam 玩家队伍配置
 * @param enemyTeam 敌方队伍配置
 * @param options 额外选项
 * 
 * 流程：
 * 1. buildUnit构建所有角色（包含突破效果编译）
 * 2. 应用团队突破加成
 * 3. 根据速度决定先手
 * 4. 初始化战斗状态
 * 5. 渲染战斗界面
 * 6. 显示战斗介绍
 */
declare function startBattle(playerTeam: any[], enemyTeam: any[], options?: {
    difficulty?: Difficulty;
    eventId?: string;
    eventType?: 'battle' | 'boss';
    chapterKey?: string;
    goldScale?: number;
    goldReward?: number;
    onWin?: Function;
    onLose?: Function;
}): void;

/** 应用团队突破加成到所有角色 */
declare function applyTeamBreakthroughBuffs(units: (Unit | null)[]): void;
/** 渲染战斗视图 */
declare function renderBattleView(): void;
/** 创建单个角色的UI槽位元素 */
declare function createUnitSlot(unit: Unit | null, side: Side, slotIndex: number): HTMLDivElement;

// ====== 特效函数 ======

/** 为多个目标依次播放技能特效（每目标间隔100ms） */
declare function showSkillEffectOnTargets(targets: Unit[], effectInfo: SkillEffectInfo): void;
/** 在单个目标上播放技能特效 */
declare function showSkillEffect(unit: Unit, effectInfo: SkillEffectInfo): void;
/** 根据行动对象获取技能特效信息 */
declare function getSkillEffectInfo(action: Action): SkillEffectInfo;

// ====== 效果处理函数（旧版，建议迁移到skills方案） ======

/** 处理命中后的效果（旧版数据方案） */
declare function processOnHitEffects(target: Unit, attacker: Unit, skillData: any): void;
/** 应用单个效果（旧版数据方案） */
declare function applyEffect(target: Unit, source: Unit, effect: Effect): void;
/** 触发角色的亡语效果（旧版数据方案） */
declare function triggerDeathEffects(target: Unit, killer: Unit): void;

// ====== 全局变量 ======

/** 突破效果库（通过字符串ID查找突破配置） */
declare const BREAKTHROUGH_LIB: Record<string, BreakthroughBuff>;
/** 全局技能/普攻/必杀数据 */
declare const contentList: {
    pugong: Record<string, SkillData>;
    skill: Record<string, SkillData>;
    spskill: Record<string, SkillData>;
};
/** 角色基础属性定义库 */
declare const characterList: Record<string, {
    rank: Rank;
    template: Template;
}>;

/** 显示提示信息 */
declare function toast(msg: string, type?: string): void;
/** 隐藏其他视图，只保留指定视图 */
declare function hideOtherViews(viewId: string): void;
/** 渲染副本视图 */
declare function renderDungeonView(container: HTMLElement, chapterKey: string): void;

// ====== 自动战斗开关（全局） ======
declare var autoBattle: boolean;

// ====== 确认对话框（全局） ======
declare var confirmDialog: ((msg: string, onConfirm: () => void) => void) | undefined;
