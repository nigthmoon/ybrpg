// ====== 夜白旅程 战斗系统 ======

/**
 * 战斗流程：
 * 1. 确定先后手（双方速度总和，相同则玩家先手）
 * 2. 每轮6个回合，每回合先手方→后手方各行动一个角色（序号最小的存活的未行动角色），无角色则空过
 * 3. 每个角色行动时选择普攻或技能
 * 4. 能量系统：上限8，4点可释放技能，超4点每多1点增伤10%，普攻+1能量，受击+1能量
 * 5. 伤害公式：攻击力 × 系数 - 防御力 = 最终伤害（最低1）
 * 6. 某方全灭则失败
 */
//🗡️⚡🧊💧❄️☄️🔥⭐🧪

// ====== 战斗状态 ======
let battleState = null;
// ====== 夜白旅程 战斗系统 - 初始化模块 ======

/**
 * 全局突破库引用
 * 假设 BREAKTHROUGH_BUFF_LIBRARY 已在全局或上层作用域定义
 */
const BREAKTHROUGH_LIB = window.BREAKTHROUGH_BUFF_LIBRARY || {};

/**
 * 标准化突破数据
 * 1. 如果是对象：直接返回（保留原样）
 * 2. 如果是字符串：从库中查找并返回对应对象
 * 3. 如果是数组：报错并返回 null
 * 4. 其他/未找到：返回 null
 * 
 * @param {any} data - 原始突破数据
 * @returns {Object|null} 标准化后的突破对象，或 null
 */
function normalizeBreakthroughData(data) {
    // 1. 已经是对象，直接返回
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data;
    }

    // 2. 是字符串，尝试从库中编译
    if (typeof data === 'string') {
        const libData = BREAKTHROUGH_LIB[data];
        if (libData) {
            // 建议深拷贝一份，防止修改库中原型数据影响其他角色
            return JSON.parse(JSON.stringify(libData));
        } else {
            console.warn(`[BattleInit] Breakthrough ID '${data}' not found in library.`);
            return null;
        }
    }

    // 3. 是数组，目前不兼容，报错并置空
    if (Array.isArray(data)) {
        console.error(`[BattleInit] Array format for single breakthrough slot is NOT supported. Data:`, data);
        return null;
    }

    // 4. 其他无效数据
    return null;
}

/**
 * 初始化并启动战斗
 * @param {Array} playerTeam - 我方队伍
 * @param {Array} enemyTeam  - 敌方队伍
 * @param {Object} options   - 选项
 */
function startBattle(playerTeam, enemyTeam, options = {}) {
    
    /**
     * 构建单个战斗单位
     */
    const buildUnit = (data, side, slotIndex) => {
        if (!data || !data.id) return null;
        
        // --- 1. 基础信息补全 ---
        let rank = data.rank;
        let template = data.template;
        if (!rank || !template) {
            const baseDef = characterList[data.id];
            if (baseDef) {
                rank = rank || baseDef.rank || 'common';
                template = template || baseDef.template || 'balanced';
            } else {
                rank = rank || 'common';
                template = template || 'balanced';
            }
        }

        // --- 2. 突破数据标准化与预处理 ---
        const rawTupoList = data.tupoList || [];
        const tupolevel = data.tupolevel || 0;
        
        // 【核心】标准化突破列表：将字符串转为对象，数组转为 null
        const normalizedTupoList = rawTupoList.map(item => normalizeBreakthroughData(item));
        
        // 过滤掉 null 值，只保留有效的突破对象
        // 注意：这里我们只取 <= tupolevel 的部分用于初始化属性计算
        // 但为了战斗逻辑中能随时查阅所有突破（包括高等级未解锁的描述等，或者动态解锁），
        // 我们通常保留整个 normalized 列表，但在计算属性时只遍历到 tupolevel
        
        let bonusAtk = 0, bonusDef = 0, bonusHp = 0, bonusEnergy = 0;
        let passiveBuffs = []; // 存储 passive_effect 的 effectId
        let teamBuffs = [];    // 存储全队固定加成对象
        let teamPercentBuffs = []; // 存储全队百分比加成对象

        // 累加 0 到当前突破等级 (tupolevel) 的所有【初始化类】效果
        for (let i = 0; i <= tupolevel; i++) {
            // 确保索引存在且数据有效
            if (!normalizedTupoList[i]) continue;
            
            const buff = normalizedTupoList[i];
            const type = buff.type;

            // --- A. 自身固定属性 (self_stat_flat) ---
            if (type === 'self_stat_flat') {
                // 新结构支持直接读取 atk, def, hp 字段
                if (buff.atk) bonusAtk += Number(buff.atk);
                if (buff.def) bonusDef += Number(buff.def);
                if (buff.hp) bonusHp += Number(buff.hp);
            } 
            // --- B. 自身能量 (self_energy) ---
            else if (type === 'self_energy') {
                bonusEnergy += Number(buff.value || 0);
            }
            // --- C. 被动效果ID (passive_effect) ---
            else if (type === 'passive_effect') {
                if (buff.effectId) passiveBuffs.push(buff.effectId);
            }
            // --- D. 全队固定属性 (team_stat_flat) ---
            else if (type === 'team_stat_flat') {
                // 暂存对象，后续统一计算
                teamBuffs.push(buff);
            }
            // --- E. 全队百分比属性 (team_stat_percent) ---
            else if (type === 'team_stat_percent') {
                // 暂存对象，后续统一计算
                teamPercentBuffs.push(buff);
            }
            // --- F. 其他类型 (如 self_stat_percent) ---
            // 如果需要支持自身百分比，可以在这里扩展
            // else if (type === 'self_stat_percent') { ... }
        }

        // --- 3. 计算最终基础数值 ---
        let finalHp = Number(data.hp) || 100;
        let finalAtk = Number(data.atk) || 10;
        let finalDef = Number(data.def) || 0;
        let finalSpe = Number(data.spe) || 0;
        let finalEnergy = 2; // 基础初始能量

        // 应用自身固定加成
        finalAtk += bonusAtk;
        finalDef += bonusDef;
        finalHp += bonusHp;
        finalEnergy += bonusEnergy;

        // --- 4. 处理宝物 (保持原有逻辑) ---
        let activeTreasures = [];
        if (data.treasures && Array.isArray(data.treasures)) {
            const treasureDefs = gameData.getTreasureList();
            activeTreasures = data.treasures.filter(tid => tid && treasureDefs[tid]);
        } else {
            const lookupKey = data.instanceId || data.id;
            const charTreasures = (window.treasureEquipData && window.treasureEquipData[lookupKey]) || [null, null, null, null, null, null];
            const treasureDefs = gameData.getTreasureList();
            activeTreasures = charTreasures.filter(tid => tid && treasureDefs[tid]);
        }

        // --- 5. 构建单位对象 ---
        const unit = {
            id: data.id,
            instanceId: data.instanceId || data.id,
            name: data.name || '未知单位',
            side,
            slotIndex,
            rank: rank,
            template: template,
            
            // 核心属性 (已包含自身固定突破加成)
            maxHp: finalHp,
            hp: finalHp,
            atk: finalAtk,
            def: finalDef,
            spe: finalSpe,
            energy: Math.min(8, finalEnergy),
            
            // 战斗状态
            buff: Array.isArray(data.buff) ? [...data.buff] : [],
            skills: Array.isArray(data.skills) ? [...data.skills] : ['attack1', null, null],
            alive: true,
            treasures: activeTreasures,
            sealed: false,
            sealTurns: 0,
            sealOwner: null,
            permanentlySealed: false,
            extraTurnCount: 0,
            
            // 突破数据引用 (已标准化)
            tupoList: normalizedTupoList, 
            tupolevel: tupolevel,
            
            // 暂存全队Buff对象，供后续 applyTeamBreakthroughBuffs 使用
            _teamBuffs: teamBuffs, 
            _teamPercentBuffs: teamPercentBuffs,
            
            hasAttacked: false
        };

        // 将被动Buff ID 存入 unit.buff 数组，供战斗逻辑检查
        if (passiveBuffs.length > 0) {
            unit.buff.push(...passiveBuffs);
        }

        return unit;
    };

    const playerUnits = playerTeam.map((u, i) => buildUnit(u, 'player', i));
    const enemyUnits = enemyTeam.map((u, i) => buildUnit(u, 'enemy', i));

    // 【关键步骤】处理全队 Buff (固定数值 + 百分比)
    // 注意：applyTeamBreakthroughBuffs 也需要适配新的数据结构（直接从对象读取 atk/hp 等）
    applyTeamBreakthroughBuffs(playerUnits);
    applyTeamBreakthroughBuffs(enemyUnits);

    // 确定先后手
    const playerSpeSum = playerUnits.filter(u => u).reduce((s, u) => s + u.spe, 0);
    const enemySpeSum = enemyUnits.filter(u => u).reduce((s, u) => s + u.spe, 0);
    let firstSide = 'player';
    if (enemySpeSum > playerSpeSum) firstSide = 'enemy';

    battleState = {
        playerUnits,
        enemyUnits,
        firstSide,
        round: 1,
        currentTurnIndex: 0,
        currentTurnSide: null,
        phase: 'intro',
        actedSlots: { player: new Set(), enemy: new Set() },
        selectedSkill: null,
        selectedTargets: [],
        difficulty: options.difficulty || 'normal',
        eventId: options.eventId || null,
        eventType: options.eventType || 'battle',
        chapterKey: options.chapterKey || null,
        goldScale: options.goldScale || 1.0,
        enemyCount: enemyTeam.filter(e => e && e.id).length,
        onWin: options.onWin || null,
        onLose: options.onLose || null,
        log: [],
        battleStarted: false,
        expectedGold: options.goldReward || 0, 
    };

    // 渲染战斗界面
    renderBattleView();
    // 播放开场
    showBattleIntro();
}

/**
 * 应用全队突破加成
 * 适配新的数据结构：直接从 buff 对象读取 atk, def, hp, percent 等字段
 */
function applyTeamBreakthroughBuffs(units) {
    // 1. 收集所有单位产生的全队固定加成
    let teamFlatBonus = { atk: 0, def: 0, hp: 0 };
    let teamPercentBonus = { atk: 0, def: 0, hp: 0 };

    units.forEach(u => {
        if (!u) return;
        
        // 处理全队固定加成
        if (u._teamBuffs && Array.isArray(u._teamBuffs)) {
            u._teamBuffs.forEach(b => {
                // 新结构：直接读取字段
                if (b.atk) teamFlatBonus.atk += Number(b.atk);
                if (b.def) teamFlatBonus.def += Number(b.def);
                if (b.hp) teamFlatBonus.hp += Number(b.hp);
            });
        }

        // 处理全队百分比加成
        if (u._teamPercentBuffs && Array.isArray(u._teamPercentBuffs)) {
            u._teamPercentBuffs.forEach(b => {
                // 新结构：直接读取字段
                if (b.atk) teamPercentBonus.atk += Number(b.atk);
                if (b.def) teamPercentBonus.def += Number(b.def);
                if (b.hp) teamPercentBonus.hp += Number(b.hp);
            });
        }
        
        // 清理临时字段
        delete u._teamBuffs;
        delete u._teamPercentBuffs;
    });

    // 2. 应用固定加成
    units.forEach(u => {
        if (!u) return;
        u.atk += teamFlatBonus.atk;
        u.def += teamFlatBonus.def;
        u.maxHp += teamFlatBonus.hp;
        u.hp += teamFlatBonus.hp; // 当前血量也增加
    });

    // 3. 应用百分比加成 (在固定值之后)
    units.forEach(u => {
        if (!u) return;
        // 防止除以零或负数系数导致错误，虽然通常系数为正
        const atkMult = 1 + teamPercentBonus.atk;
        const defMult = 1 + teamPercentBonus.def;
        const hpMult = 1 + teamPercentBonus.hp;

        u.atk = Math.floor(u.atk * atkMult);
        u.def = Math.floor(u.def * defMult);
        u.maxHp = Math.floor(u.maxHp * hpMult);
        u.hp = Math.floor(u.hp * hpMult);
    });
}