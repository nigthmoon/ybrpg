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

/**
 * 初始化并启动战斗
 * @param {Array} playerTeam - 我方队伍 [{id, name, hp, atk, def, spe, skills, ...}]
 * @param {Array} enemyTeam  - 敌方队伍 [{id, name, hp, atk, def, spe, buff, ...}]
 * @param {Object} options   - { difficulty, eventId, eventType, chapterKey, onWin, onLose }
 */
function startBattle(playerTeam, enemyTeam, options = {}) {
    // 构建战斗角色数据（深拷贝，附带战斗状态）
    const buildUnit = (data, side, slotIndex) => {
        // 空位或无id的角色不创建战斗单位
        if (!data || !data.id) return null;
        
        // 【核心修复】如果 data 中缺少 rank/template，从 characterList 补全
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

        // 【修复】防御性编程：确保数值类型正确
        // 注意：这里先获取基础数值，后续会加上突破加成
        let finalHp = Number(data.hp) || 100;
        let finalAtk = Number(data.atk) || 10;
        let finalDef = Number(data.def) || 0;
        let finalSpe = Number(data.spe) || 0;
        let finalEnergy = 2; // 基础初始能量

        let activeTreasures = [];
        // 优先使用传入的 treasures 数据（我方队伍已由 mode.js 预处理）
        if (data.treasures && Array.isArray(data.treasures)) {
            const treasureDefs = gameData.getTreasureList();
            activeTreasures = data.treasures.filter(tid => tid && treasureDefs[tid]);
        } else {
            // 兼容逻辑：如果没有传入 treasures，尝试从全局数据读取
            const lookupKey = data.instanceId || data.id;
            const charTreasures = (window.treasureEquipData && window.treasureEquipData[lookupKey]) || [null, null, null, null, null, null];
            const treasureDefs = gameData.getTreasureList();
            activeTreasures = charTreasures.filter(tid => tid && treasureDefs[tid]);
        }

        // 【新增】处理突破 Buff
        // 使用 data.tupoList 作为该角色的突破能力列表
        const tupoList = data.tupoList || window.STANDARD_BREAKTHROUGH_TEMPLATE || [];
        
        // 获取突破等级，如果没有则默认为 0 (即只应用 level 0 的效果，或者不应用如果tupoList为空)
        // 假设 data.tupolevel 代表当前解锁的最高突破等级索引
        const tupolevel = data.tupolevel || 0;

        let bonusAtk = 0, bonusDef = 0, bonusHp = 0, bonusEnergy = 0;
        let passiveBuffs = [];
        let teamBuffs = [];     // 暂存全队固定加成
        let teamPercentBuffs = []; // 暂存全队百分比加成

        // 累加 0 到当前突破等级的所有效果
        for (let i = 0; i <= tupolevel; i++) {
            if (!tupoList[i]) continue;
            const buff = tupoList[i];
            
            if (buff.type === 'self_stat_flat') {
                if(Array.isArray(buff.stat)){
                    buff.stat.forEach((stat,index) => {
                        if (stat === 'atk') bonusAtk += buff.value[index];
                        if (stat === 'def') bonusDef += buff.value[index];
                        if (stat === 'hp') bonusHp += buff.value[index];
                    });
                }
                if (buff.stat === 'atk') bonusAtk += buff.value;
                if (buff.stat === 'def') bonusDef += buff.value;
                if (buff.stat === 'hp') bonusHp += buff.value;
            } else if (buff.type === 'self_energy') {
                bonusEnergy += buff.value;
            } else if (buff.type === 'passive_effect') {
                if (buff.effectId) passiveBuffs.push(buff.effectId);
            } else if (buff.type === 'team_stat_flat') {
                teamBuffs.push(buff);
            } else if (buff.type === 'team_stat_percent') {
                teamPercentBuffs.push(buff);
            }
            // 其他类型如 self_stat_percent 可以在这里扩展
        }

        // 应用自身的基础数值加成
        finalAtk += bonusAtk;
        finalDef += bonusDef;
        finalHp += bonusHp;
        finalEnergy += bonusEnergy;

        // 构建返回的单位对象
        const unit = {
            id: data.id,
            instanceId: data.instanceId || data.id,
            name: data.name || '未知单位',
            side,
            slotIndex,
            rank: rank,
            template: template,
            maxHp: finalHp,
            hp: finalHp,
            atk: finalAtk,
            def: finalDef,
            spe: finalSpe,
            energy: Math.min(8, finalEnergy), // 上限8
            buff: Array.isArray(data.buff) ? [...data.buff] : [],
            skills: Array.isArray(data.skills) ? [...data.skills] : ['attack1', null, null],
            alive: true,
            treasures: activeTreasures,
            sealed: false,
            sealTurns: 0,
            sealOwner: null,
            permanentlySealed: false,
            extraTurn: false,
            // 暂存全队Buff用于后续统一计算
            _teamBuffs: teamBuffs, 
            _teamPercentBuffs: teamPercentBuffs
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
        currentTurnIndex: 0,  // 当前回合号 0-5（对应格子序号）
        currentTurnSide: null, // 当前该谁行动
        phase: 'intro',       // intro / player_action / enemy_action / animating / round_end / ended
        actedSlots: { player: new Set(), enemy: new Set() }, // 本轮已行动的格子序号
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
        battleStarted: false,  // 标记战斗开始宝物是否已触发
        // 【新增】保存预期的金币奖励，用于结算界面显示
        expectedGold: options.goldReward || 0, 
    };

    // 渲染战斗界面
    renderBattleView();
    // 播放开场
    showBattleIntro();
}
function applyTeamBreakthroughBuffs(units) {
    // 1. 收集所有单位产生的全队固定加成
    let teamFlatBonus = { atk: 0, def: 0, hp: 0 };
    let teamPercentBonus = { atk: 0, def: 0, hp: 0 };

    units.forEach(u => {
        if (!u) return;
        if (u._teamBuffs) {
            u._teamBuffs.forEach(b => {
                if(Array.isArray(b.stat)){
                    buff.stat.forEach((stat,index) => {
                        if (stat === 'atk') bonusAtk += b.value[index]||b.value;
                        if (stat === 'def') bonusDef += b.value[index]||b.value;
                        if (stat === 'hp') bonusHp += b.value[index]||b.value;
                    });
                }
                if (b.stat === 'atk') teamFlatBonus.atk += b.value;
                if (b.stat === 'def') teamFlatBonus.def += b.value;
                if (b.stat === 'hp') teamFlatBonus.hp += b.value;
            });
        }
        if (u._teamPercentBuffs) {
            u._teamPercentBuffs.forEach(b => {
                if (b.stats.includes('atk')) teamPercentBonus.atk += b.percent;
                if (b.stats.includes('def')) teamPercentBonus.def += b.percent;
                if (b.stats.includes('hp')) teamPercentBonus.hp += b.percent;
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
        u.atk = Math.floor(u.atk * (1 + teamPercentBonus.atk));
        u.def = Math.floor(u.def * (1 + teamPercentBonus.def));
        u.maxHp = Math.floor(u.maxHp * (1 + teamPercentBonus.hp));
        u.hp = Math.floor(u.hp * (1 + teamPercentBonus.hp));
    });
}
// ====== 战斗顺序 ======
/**
 * 找到某一方序号最小的存活的未行动角色
 * @returns {object|null} 可行动的单位，或 null
 */
function findNextActor(side) {
    const bs = battleState;
    const units = side === 'player' ? bs.playerUnits : bs.enemyUnits;
    for (let i = 0; i < 6; i++) {
        if (bs.actedSlots[side].has(i)) continue;  // 本轮已行动
        const unit = units[i];
        if (unit && unit.alive) return unit;
    }
    return null;  // 没有可行动角色
}

/** 重置本轮行动记录 */
function resetActedSlots() {
    const bs = battleState;
    bs.actedSlots = { player: new Set(), enemy: new Set() };
}

/**
 * 根据阵营和槽位索引获取存活的单位对象
 * @param {string} side - 阵营标识，'player' 表示玩家方，其他值表示敌方
 * @param {number} slotIndex - 单位在数组中的槽位索引
 * @returns {Object|null} 如果对应位置存在且存活的单位则返回该单位对象，否则返回 null
 */
function getUnit(side, slotIndex) {
    // 根据阵营选择对应的单位数组
    const units = side === 'player' ? battleState.playerUnits : battleState.enemyUnits;
    const unit = units[slotIndex];
    // 仅当单位存在且处于存活状态时返回，否则返回 null
    return (unit && unit.alive) ? unit : null;
}

function getAliveUnits(side) {
    const units = side === 'player' ? battleState.playerUnits : battleState.enemyUnits;
    return units.filter(u => u && u.alive);
}

function isSideDefeated(side) {
    return getAliveUnits(side).length === 0;
}

/**
 * 推进战斗流程至下一个行动回合。
 * 
 * 该函数负责处理战斗的核心循环逻辑，包括：
 * 1. 检查战斗是否结束或某一方是否被击败。
 * 2. 确定当前轮次的先手和后手方。
 * 3. 寻找双方可行动的角色。
 * 4. 若双方均无可用角色，则结束当前轮次，进入下一轮并重置状态。
 * 5. 若有可行动角色，则根据先手优先原则执行行动，触发回合开始效果，并切换至相应的玩家操作或AI执行阶段。
 * 
 * @returns {void}
 */
// ====== 战斗流程控制 ======
function nextTurn() {
    const bs = battleState;
    if (bs.phase === 'ended') return;

    // 检查胜负条件，若某一方被击败则结束战斗
    if (isSideDefeated('player')) {
        endBattle('enemy');
        return;
    }
    if (isSideDefeated('enemy')) {
        endBattle('player');
        return;
    }

    const secondSide = bs.firstSide === 'player' ? 'enemy' : 'player';

    // 尝试为先手方找可行动角色
    const firstActor = findNextActor(bs.firstSide);
    // 尝试为后手方找可行动角色
    const secondActor = findNextActor(secondSide);

    // 双方都没有可行动角色 → 本轮结束，进入下一轮
    // 在 nextTurn 函数中：
    // 双方都没有可行动角色 → 本轮结束，进入下一轮
    if (!firstActor && !secondActor) {
        bs.round++;
        resetActedSlots();
        addBattleLog(`—— 第 ${bs.round} 轮 ——`);
        
        // 【修改】调用新的统一状态处理函数
        processStatusTurns(bs.firstSide); 
        // 2. 【新增】结算中毒伤害
        applyPoisonDamage(); // 确保这个函数已定义
        
        updateBattleUI();
        nextTurn();
        return;
    }
    // 先手方有角色则行动，否则空过
    // 在 nextTurn 中，找到准备让 firstActor 或 secondActor 行动的地方

    // 示例：先手方行动前
    if (firstActor) {
        bs.actedSlots[bs.firstSide].add(firstActor.slotIndex);
        bs.currentTurnSide = bs.firstSide;
        bs.currentTurnIndex = firstActor.slotIndex;
        updateBattleUI();

        // 【新增】检查是否眩晕
        if (firstActor.stunned) {
            addBattleLog(`${firstActor.name} 处于【眩晕】状态，无法行动！`);
            // 直接跳过，不触发 triggerOnTurnStart，直接进入 afterAction 或下一位
            setTimeout(() => afterAction(), 500); 
            return;
        }

        // 正常行动流程
        triggerOnTurnStart(firstActor, () => {
            updateBattleUI();
            if (bs.firstSide === 'player') {
                bs.phase = 'player_action';
                showPlayerActionUI(firstActor);
            } else {
                bs.phase = 'enemy_action';
                executeAITurn(firstActor);
            }
        });
        return;
    }

    // 先手方空过，直接执行后手方
    if (secondActor) {
        bs.actedSlots[secondSide].add(secondActor.slotIndex);
        bs.currentTurnSide = secondSide;
        bs.currentTurnIndex = secondActor.slotIndex;
        updateBattleUI();
    
        // 【新增】检查是否眩晕
        if (secondActor.stunned) {
            addBattleLog(`${secondActor.name} 处于【眩晕】状态，无法行动！`);
            setTimeout(() => afterAction(), 500);
            return;
        }
        // 回合开始时触发宝物，动画结束后继续
        triggerOnTurnStart(secondActor, () => {
            updateBattleUI();
            if (secondSide === 'player') {
                bs.phase = 'player_action';
                showPlayerActionUI(secondActor);
            } else {
                bs.phase = 'enemy_action';
                executeAITurn(secondActor);
            }
        });
        return;
    }
}

/**
 * 处理一次行动完成后的逻辑流程。
 * 
 * 主要职责包括：
 * 1. 检查战斗是否结束（胜负判定）。
 * 2. 处理当前单位因【连破】获得的额外行动回合。
 * 3. 若为先手方行动结束，切换至后手方进行行动；若后手方无可用单位，则直接进入下一回合。
 * 4. 若为后手方行动结束，或先手行动后后手方空过，则进入下一回合。
 * 
 * @returns {void}
 */
function afterAction() {
    const bs = battleState;
    if (bs.phase === 'ended') return;

    // 检查胜负条件，若任意一方被击败则结束战斗
    if (isSideDefeated('player')) {
        endBattle('enemy');
        return;
    }
    if (isSideDefeated('enemy')) {
        endBattle('player');
        return;
    }

    // 检查当前行动者是否触发【连破】机制以获得额外行动机会
    const currentUnit = bs.currentTurnSide === 'player'
        ? bs.playerUnits[bs.currentTurnIndex]
        : bs.enemyUnits[bs.currentTurnIndex];

    if (currentUnit && currentUnit.alive && currentUnit.extraTurn) {
        currentUnit.extraTurn = false;
        addBattleLog(`${currentUnit.name} 因【连破】获得额外行动！`);
        updateBattleUI();
        if (currentUnit.side === 'player') {
            bs.phase = 'player_action';
            showPlayerActionUI(currentUnit);
        } else {
            bs.phase = 'enemy_action';
            executeAITurn(currentUnit);
        }
        return;
    }

    const secondSide = bs.firstSide === 'player' ? 'enemy' : 'player';

    // 若当前为先手方行动完毕，尝试寻找后手方可行动单位并切换回合顺序
    if (bs.currentTurnSide === bs.firstSide) {
        const secondActor = findNextActor(secondSide);
        if (secondActor) {
            bs.actedSlots[secondSide].add(secondActor.slotIndex);
            bs.currentTurnSide = secondSide;
            bs.currentTurnIndex = secondActor.slotIndex;
            // 触发回合开始时的宝物效果，待动画结束后继续执行行动逻辑
            updateBattleUI()
            triggerOnTurnStart(secondActor, () => {
                updateBattleUI();
                if (secondSide === 'player') {
                    bs.phase = 'player_action';
                    showPlayerActionUI(secondActor);
                } else {
                    bs.phase = 'enemy_action';
                    executeAITurn(secondActor);
                }
            });
            return;
        }
        // 后手方无人可行动，进入下一回合
    }

    // 后手方行动完毕，或先手行动后后手方无可用单位，推进至下一回合
    nextTurn();
}
function calcDamage(attacker, defender, coefficient, extraEnergy, skillType) {
    // 【核心修复】强制转换为数字，防止 undefined/null 导致 NaN
    const atk = Number(attacker.atk) || 0;
    const def = Number(defender.def) || 0;
    const coeff = Number(coefficient) || 1.0;
    const extraE = Number(extraEnergy) || 0;

    let baseDmg = Math.floor(atk * coeff);
    
    // 【新增】计算无视防御比例
    let ignoreDefPercent = 0;
    
    // 检查 attacker 的 Buff/Treasures
    const buffs = attacker.buff || [];
    const treasures = attacker.treasures || [];
    // 注意：treasures 存储的是 ID 字符串，buffs 存储的是 effectId 字符串
    // 假设 ignore_def_xx 是存储在 buff 数组中的字符串 ID
    const allEffects = [...buffs, ...treasures]; 

    // 1. 通用无视防御
    if (allEffects.includes('ignore_def_all')) ignoreDefPercent = 1.0;
    else if (allEffects.includes('ignore_def_60')) ignoreDefPercent = 0.6;
    else if (allEffects.includes('ignore_def_30')) ignoreDefPercent = 0.3;

    // 2. 特定技能类型无视防御 (累加)
    if (skillType === 'pugong') {
        if (allEffects.includes('ignore_def_pugong_all')) ignoreDefPercent = Math.min(1.0, ignoreDefPercent + 1.0);
        else if (allEffects.includes('ignore_def_pugong_80')) ignoreDefPercent = Math.min(1.0, ignoreDefPercent + 0.8);
        else if (allEffects.includes('ignore_def_pugong_50')) ignoreDefPercent = Math.min(1.0, ignoreDefPercent + 0.5);
    } else if (skillType === 'skill') {
         // 如果有技能特定的无视防御，可以在这里添加
         // 例如: if (allEffects.includes('ignore_def_skill_50')) ...
    }

    // 计算有效防御
    const effectiveDef = Math.floor(def * (1 - ignoreDefPercent));
    
    // 超过4能量增伤
    if (extraE > 0) {
        baseDmg = Math.floor(baseDmg * (1 + extraE * 0.1));
    }

    let finalDmg = baseDmg - effectiveDef;
    
    // 【关键】如果最终伤害计算结果为 NaN，返回 1
    if (isNaN(finalDmg)) {
        console.warn(`[CalcDamage] NaN detected. Atk:${atk}, Def:${def}, Coeff:${coeff}`);
        return 1;
    }
    
    return Math.max(1, finalDmg);
}

/**
 * 执行角色技能逻辑
 * 
 * @param {Object} actor - 发动技能的角色对象
 * @param {string} skillType - 技能类型标识（对应 contentList 中的键）
 * @param {string} skillId - 具体技能ID
 * @param {Array} targets - 技能作用的目标角色数组
 * @param {number} energyCost - 技能消耗的能量值
 * @param {Function} callback - 技能执行完毕后的回调函数
 */
// ====== 技能执行 ======
// ====== 技能执行 ======
function executeSkill(actor, skillType, skillId, targets, energyCost, callback) {
    const bs = battleState;
    if (!bs) { if(callback) callback(); return; }

    // 【修复】确保 contentList 存在
    if (!window.contentList || !window.contentList[skillType]) {
        addBattleLog(`${actor.name} 技能数据缺失，行动失败`);
        if (callback) callback();
        return;
    }

    const sData = window.contentList[skillType][skillId];
    if (!sData) {
        addBattleLog(`${actor.name} 尝试使用未知技能(${skillId})，行动失败`);
        if (callback) callback();
        return;
    }

    // 消耗能量
    actor.energy -= energyCost;
    if (actor.energy < 0) actor.energy = 0; // 防止负数

    addBattleLog(`${actor.name} 使用了【${sData.name}】`);
    
    // --- 【核心修复开始】安全获取系数和恢复标识 ---
    let coefficient = 1.0; // 默认系数设为 1.0，避免乘以 0 导致无伤害，或 undefined 导致 NaN
    let isRecover = false;
    
    // 尝试从 contentList 中获取最新数据
    const skillKey = Object.keys(window.contentList[skillType]).find(k => k === skillId);
    
    if (skillKey && window.contentList[skillType][skillKey]) {
        const currentSkillData = window.contentList[skillType][skillKey];
        
        // 1. 获取系数：优先使用 coefficient 字段，如果没有则尝试解析 content 或默认为 1.0
        if (currentSkillData.coefficient !== undefined && currentSkillData.coefficient !== null) {
            coefficient = Number(currentSkillData.coefficient);
        } else if (currentSkillData.content) {
            // 兼容旧版：尝试从 content 字符串解析系数 (例如 "player.atk * 1.5")
            const src = currentSkillData.content.toString();
            const match = src.match(/player\.atk\s*\*\s*([\d.]+)/);
            if (match) {
                coefficient = parseFloat(match[1]);
            }
        }
        
        // 确保 coefficient 是有效数字
        if (isNaN(coefficient)) {
            console.warn(`[Battle] Skill ${skillId} has invalid coefficient. Defaulting to 1.0`);
            coefficient = 1.0;
        }

        // 2. 获取是否为治疗技能
        if (currentSkillData.isRecover === true) {
            isRecover = true;
        } else if (currentSkillData.content && currentSkillData.content.toString().includes('rpg_recover')) {
            isRecover = true;
        }
    }
    // --- 【核心修复结束】 ---

    const extraEnergy = Math.max(0, energyCost - 4);

    // 使用异步序列处理每个目标
    let targetIndex = 0;
    // 收集需要触发on_hit的目标（延迟到技能特效播完后统一触发）
    const pendingOnHitTargets = [];

    function processNextTarget() {
        if (targetIndex >= targets.length) {
            // 所有目标处理完毕
            
            // 【新增】1. 先触发原有的 on_skill 宝物/被动 (如狂骨等)
            triggerOnSkill(actor, targets, energyCost, isRecover, () => {
                
                // 【新增】2. 检查并执行突破带来的“技能后”特殊效果
                handlePostSkillBreakthroughEffects(actor, targets,'on_skill_hit', () => {
                    // 3. 最后触发被攻击者的 on_hit (如果之前延迟了)
                    triggerPendingOnHits(pendingOnHitTargets, actor, callback);
                });
            });
            return;
        }

        const t = targets[targetIndex++];
        if (!t || !t.alive) { // 【修复】增加 t 的空值检查
            processNextTarget();
            return;
        }

        if (isRecover) {
            // 【检查禁疗】
            if (t.healBlocked) {
                addBattleLog(`${t.name} 处于【禁疗】状态，无法被治疗！`);
                showDamageNumber(t, 0, true); // 显示0治疗
                // 依然需要更新UI或处理后续逻辑，但不加血
                processNextTarget();
                return;
            }

            // 【修复】确保 actor.atk 是数字
            const atk = Number(actor.atk) || 0;
            let healAmount = Math.floor(atk * coefficient);
            if (extraEnergy > 0) {
                healAmount = Math.floor(healAmount * (1 + extraEnergy * 0.1));
            }
            // 确保 maxHp 和 hp 是数字
            const maxHp = Number(t.maxHp) || 1;
            const currentHp = Number(t.hp) || 0;
            const actualHeal = Math.min(healAmount, maxHp - currentHp);
            
            t.hp = currentHp + actualHeal; // 更新血量
            
            addBattleLog(`${t.name} 回复了 ${actualHeal} 生命值`);
            showDamageNumber(t, actualHeal, true);
            updateBattleUI();
            processNextTarget();
        }else {
            // 【修复】确保传入 calcDamage 的参数都是数字
            const atk = Number(actor.atk) || 0;
            const def = Number(t.def) || 0;
            
            // 注意：calcDamage 内部已经处理了 attacker 对象，但为了安全，这里确保基础值正常
            let dmg = calcDamage(actor, t, coefficient, extraEnergy, skillType);
            
            if (isNaN(dmg)) {
                console.error(`[Battle] Damage calculation resulted in NaN...`);
                dmg = 1;
            }

            dmg = applyTreasureDamageModifier(actor, dmg);
            dmg = Math.max(1, Math.floor(dmg));

            addBattleLog(`${t.name} 受到了 ${dmg} 点伤害`);
            
            // 【新增】处理技能吸血逻辑
            // 在 applyDamage 之前或之后计算吸血均可，建议在造成伤害确认后计算
            const lifestealPercent = getLifestealPercent(actor, 'skill');
            
            applyDamage(t, dmg, actor, false, false, () => {
                // 【新增】执行吸血
                if (lifestealPercent > 0 && actor.alive) {
                    const healAmount = Math.floor(dmg * lifestealPercent);
                    if (healAmount > 0) {
                        const actualHeal = Math.min(healAmount, actor.maxHp - actor.hp);
                        if (actualHeal > 0) {
                            actor.hp += actualHeal;
                            addBattleLog(`${actor.name} 通过【技能吸血】恢复了 ${actualHeal} 点生命值`);
                            showDamageNumber(actor, actualHeal, true); // 绿色飘字
                            updateBattleUI();
                        }
                    }
                }

                // 【修复】触发造成伤害后的宝物效果（如狂骨）
                triggerOnDamageDealt(actor, t, () => {
                    if (t.alive) {
                        pendingOnHitTargets.push(t);
                    }
                    processNextTarget();
                });
            }, true);
        }
    }

    processNextTarget();
}
/**
 * 执行角色普通攻击逻辑
 * 
 * @param {Object} actor - 发动普攻的角色对象
 * @param {Array} targets - 普攻作用的目标角色数组
 * @param {Function} callback - 普攻执行完毕后的回调函数
 */
function executePugong(actor, targets, callback) {
    const bs = battleState;
    if (!bs) { if(callback) callback(); return; }

    const skillId = actor.skills[0] || 'attack1';
    
    // 【修复】确保 contentList 存在
    // if (!window.contentList || !window.contentList.pugong) {
    //     if (callback) callback();
    //     return;
    // }
    let sData = null;
    if (window.contentList && window.contentList.pugong) {
        sData = window.contentList.pugong[skillId];
    }
    // 如果找不到技能数据，使用默认普攻数据
    if (!sData) {
        console.warn(`[Battle] Pugong skill '${skillId}' not found in contentList. Using default.`);
        sData = {
            name: '普攻',
            content: 'player.atk * 1.0', // 默认系数 1.0
            target: ['one', 'first']     // 默认单体
        };
    }
    // const sData = window.contentList.pugong[skillId];
    // if (!sData) {
    //     if (callback) callback();
    //     return;
    // }

    // 普攻指令下达，立即回复1能量
    actor.energy = Math.min(8, actor.energy + 1);
    updateBattleUI();

    addBattleLog(`${actor.name} 使用了【${sData.name}】`);

    const skillKey = Object.keys(contentList.pugong).find(k => k === skillId);
    const skillType = 'pugong'
    
    // 【修复】安全获取普攻系数
    let coefficient = 1.0;
    if (skillKey && contentList[skillType][skillKey]) {
        const pData = contentList[skillType][skillKey];
        if (pData.coefficient !== undefined && pData.coefficient !== null) {
            coefficient = Number(pData.coefficient);
        } else if (pData.content) {
             const src = pData.content.toString();
             const match = src.match(/player\.atk\s*\*\s*([\d.]+)/);
             if (match) coefficient = parseFloat(match[1]);
        }
        if (isNaN(coefficient)) coefficient = 1.0;
    }

    const isRecover = contentList[skillType][skillKey] ? contentList[skillType][skillKey].isRecover : false;

    // 如果找到对应的技能键且存在内容，则检查是否包含恢复标识
    // if (skillKey && contentList[skillType][skillKey].content) {
    //     const src = contentList[skillType][skillKey].content.toString();
    //     isRecover = src.includes('rpg_recover');
    // }
    // if(skillKey&&contentList[skillType][skillKey].type){
    //     isRecover = contentList[skillType][skillKey].type==='recover';
    // }

    // 检查是否拥有绝情宝物（普攻改为真实伤害）
    const hasJueqing = hasTreasure(actor, 'jueqing');

    // 处理每个目标，使用异步序列
    let targetIndex = 0;
    // 收集需要触发on_hit的目标（延迟到普攻特效播完后统一触发）
    const pendingOnHitTargets = [];

    function processNextTarget() {
        if (targetIndex >= targets.length) {
            // 所有目标处理完毕，触发被攻击宝物
            // 【新增】1. 先触发突破带来的“普攻命中后”特殊效果 (中毒、封印等)
            handlePostActionBreakthroughEffects(actor, targets, 'on_pugong_hit', () => {

                // 2. 再触发原有的宝物/被动 (如狂骨等)
                triggerPendingOnHits(pendingOnHitTargets, actor, callback);
            });

            return;
        }

        const t = targets[targetIndex++];
        if (!t || !t.alive) {
            processNextTarget();
            return;
        }

        if (isRecover) {
            // 治疗普攻
            // 【检查禁疗】
            if (t.healBlocked) {
                addBattleLog(`${t.name} 处于【禁疗】状态，无法被治疗！`);
                showDamageNumber(t, 0, true); // 显示0治疗
                // 依然需要更新UI或处理后续逻辑，但不加血
                processNextTarget();
                return;
            }

            let healAmount = Math.floor(actor.atk * coefficient);
            const actualHeal = Math.min(healAmount, t.maxHp - t.hp);
            t.hp += actualHeal;
            showDamageNumber(t, actualHeal, true);
            updateBattleUI();
            addBattleLog(`${t.name} 回复了 ${actualHeal} 生命值`);
            processNextTarget();
        } else if (hasJueqing) {
            // 绝情：真实伤害
            addBattleLog(`${actor.name} 的【绝情】效果发动，普攻改为真实伤害！`);
            let dmg = Math.floor(actor.atk * coefficient);
            dmg = applyTreasureDamageModifier(actor, dmg);
            t.hp -= dmg;
            showDamageNumber(t, dmg, false);
            updateBattleUI();
            addBattleLog(`${t.name} 受到了 ${dmg} 点真实伤害`);
            if (t.hp <= 0) {
                t.hp = 0;
                t.alive = false;
                addBattleLog(`${t.name} 阵亡！`);
                actor.energy = Math.min(8, actor.energy + 1);
                addBattleLog(`${actor.name} 击杀目标，恢复1能量`);
                updateBattleUI();
                // 绝情不触发亡语，但应触发击杀监听（以便连破等宝物生效）
                triggerOnEnemyDeath(t, actor, () => {
                    triggerOnDamageDealt(actor, t, processNextTarget);
                });
                return; // 注意：这里需要return，因为triggerOnEnemyDeath是异步的，后续逻辑应在回调中执行
            }
            // 未击杀，正常触发伤害后
            triggerOnDamageDealt(actor, t, processNextTarget);
        } else {
            // 普通普攻
            const atk = Number(actor.atk) || 0;
            const def = Number(t.def) || 0;
        
            let dmg = calcDamage(actor, t, coefficient, 0, 'pugong'); 
            if (isNaN(dmg)) dmg = 1;

            dmg = applyTreasureDamageModifier(actor, dmg);
            
            // 【新增】获取普攻吸血比例
            const lifestealPercent = getLifestealPercent(actor, 'pugong');

            addBattleLog(`${t.name} 受到了 ${dmg} 点伤害`);
            
            applyDamage(t, dmg, actor, false, false, () => {
                // 【新增】执行普攻吸血
                if (lifestealPercent > 0 && actor.alive) {
                    const healAmount = Math.floor(dmg * lifestealPercent);
                    if (healAmount > 0) {
                        const actualHeal = Math.min(healAmount, actor.maxHp - actor.hp);
                        if (actualHeal > 0) {
                            actor.hp += actualHeal;
                            addBattleLog(`${actor.name} 通过【普攻吸血】恢复了 ${actualHeal} 点生命值`);
                            showDamageNumber(actor, actualHeal, true);
                            updateBattleUI();
                        }
                    }
                }

                // 【修复】触发造成伤害后的宝物效果（如狂骨）
                triggerOnDamageDealt(actor, t, () => {
                    if (t.alive) {
                        pendingOnHitTargets.push(t);
                    }
                    processNextTarget();
                });
            }, true);
        }
    }

    processNextTarget();
}

function applyDamage(unit, dmg, attacker, isSpecialPugong = false, isTrueDamage = false, callback, deferOnHit = false) {
    // 【检查无敌】
    if (unit.invincible) {
        addBattleLog(`${unit.name} 处于【无敌】状态，免疫了本次伤害！`);
        showDamageNumber(unit, "免疫", false); // 可以显示特殊文字
        if (callback) callback();
        return;
    }

    unit.hp -= dmg;
    showDamageNumber(unit, dmg, false);
    // 立即更新血条显示，让伤害反馈即时可见
    updateBattleUI();
    if (unit.hp <= 0) {
        unit.hp = 0;
        unit.alive = false;
        addBattleLog(`${unit.name} 阵亡！`);
        // 击杀者恢复1能量
        if (attacker && attacker.alive) {
            attacker.energy = Math.min(8, attacker.energy + 1);
            addBattleLog(`${attacker.name} 击杀目标，恢复1能量`);
        }
        // 触发亡语宝物（断肠、追忆），动画结束后触发敌方阵亡监听
        triggerOnDeath(unit, attacker, () => {
            triggerOnEnemyDeath(unit, attacker, () => {
                if (callback) callback();
            });
        });
        return;
    }
    // --- 【核心新增】处理受击突破/宝物效果 (on_hit_self) ---
    // 只有当角色还活着，且不是特殊普攻/真实伤害时，才触发受击效果
    // 注意：这里我们暂时不限制 deferOnHit，因为受击效果通常独立于刚烈等宝物
    if (!isTrueDamage && !isSpecialPugong) {
        // 触发 on_hit_self 类型的突破被动
        // 参数: actor(受害者), targets([攻击者]), triggerType
        handlePostActionBreakthroughEffects(unit, [attacker], 'on_hit_self', () => {
            // 回调中继续执行原有的受击+1能量逻辑
            if (!isTrueDamage) {
                unit.energy = Math.min(8, unit.energy + 1);
            }
            
            // 触发原有的被攻击宝物（如刚烈 on_hit）
            // 注意：原有的 triggerOnHit 也是受击逻辑，这里我们要确保顺序合理
            if (attacker && !deferOnHit) {
                triggerOnHit(unit, attacker, () => {
                    if (callback) callback();
                });
            } else {
                if (callback) callback();
            }
        });
    } else {
        // 如果是真实伤害或特殊普攻，跳过受击特效，直接执行基础逻辑
        if (!isTrueDamage) {
             unit.energy = Math.min(8, unit.energy + 1);
        }
        if (attacker && !isSpecialPugong && !isTrueDamage && !deferOnHit) {
            triggerOnHit(unit, attacker, () => {
                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }
    }
}

// ====== AI行动 ======
function aiChooseAction(actor) {
    const bs = battleState;
    const enemySide = actor.side === 'player' ? 'enemy' : 'player';
    const friendlySide = actor.side;

    // 封印状态下只能普攻
    if (actor.sealed || actor.permanentlySealed) {
        const pugongId = actor.skills[0] || 'attack1';
        const pData = contentList.pugong && contentList.pugong[pugongId];
        if (pData) {
            const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
            return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
        }
        const aliveEnemies = getAliveUnits(enemySide);
        return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
    }

    // 8能量时，优先使用必杀
    if (actor.energy >= 8 && actor.skills[2]) {
        const spId = actor.skills[2];
        const spData = contentList.spskill && contentList.spskill[spId];
        if (spData) {
            const targets = aiSelectTargets(actor, spData, enemySide, friendlySide);
            if (targets.length > 0) {
                return { type: 'skill', skillType: 'spskill', skillId: spId, targets, energyCost: actor.energy };
            }
        }
    }

    // 有4+能量时，使用技能
    if (actor.energy >= 4 && actor.skills[1]) {
        const skillId = actor.skills[1];
        const sData = contentList.skill && contentList.skill[skillId];
        if (sData) {
            const targets = aiSelectTargets(actor, sData, enemySide, friendlySide);
            if (targets.length > 0) {
                return { type: 'skill', skillType: 'skill', skillId, targets, energyCost: actor.energy };
            }
        }
    }

    // 否则普攻
    const pugongId = actor.skills[0] || 'attack1';
    const pData = contentList.pugong && contentList.pugong[pugongId];
    if (pData) {
        const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
        return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
    }

    // fallback
    const aliveEnemies = getAliveUnits(enemySide);
    return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
}
/**
 * AI选择技能目标
 * 根据技能配置和战场状态，为AI角色选择合适的攻击或治疗目标
 * 
 * 
 * @param {Object} actor - 发起动作的角色对象
 * @param {Object} skillData - 技能数据配置，包含target模式和偏好设置
 * @param {Array} enemySide - 敌方单位数组
 * @param {Array} friendlySide - 友方单位数组
 * @returns {Array} 选中的目标单位数组，若无有效目标则返回空数组
 */
// function aiSelectTargets(actor, skillData, enemySide, friendlySide) {
    
//     // 获取当前角色的序号 (0-5)
//     const slotIndex = actor.slotIndex;
    
//     // 可选：根据序号进行特定逻辑判断或日志记录
//     // addBattleLog(`${actor.name} (位置:${slotIndex}) 开始行动`);

//     const targetMode = skillData.target ? skillData.target[0] : 'one';
//     const aiPref = skillData.target ? skillData.target[1] : 'first';

//     // 判断技能是否为恢复类技能，以确定目标阵营
//     const isRecover = skillData.content ? skillData.content.toString().includes('rpg_recover') : false;
//     const targetSide = isRecover ? friendlySide : enemySide;
//     const aliveTargets = getAliveUnits(targetSide);

//     if (aliveTargets.length === 0) return [];

//     /**
//      * [5][4][3]
//      * [2][1][0]
//      * ↑敌方
//      *     我方↓
//      * [0][1][2]
//      * [3][4][5]
//      * 
//      * 根据角色位置和偏好生成目标优先级列表
//      * @param {number} num - 角色槽位索引 (0-5)
//      * @param {boolean} first - true: 优先前排/特定列序, false: 优先后排/反向列序
//      * @returns {number[]} 排序后的槽位索引数组
//      */
//     function getTargetForSelf(num, first) {
//         const col = num % 3;         // 0: Left, 1: Mid, 2: Right
        
//         // 定义列的优先级顺序 (基于原switch逻辑归纳)
//         // Left(0) prefers Right(2)>Mid(1)>Left(0)
//         // Mid(1) prefers Mid(1)>Left(0)>Right(2)
//         // Right(2) prefers Left(0)>Mid(1)>Right(2)
//         const colOrders = [
//             [2, 1, 0], // Col 0
//             [1, 0, 2], // Col 1
//             [0, 1, 2]  // Col 2
//         ];
//         const preferredCols = colOrders[col];
        
//         // 确定行的优先级顺序
//         // 原逻辑中 first=true 总是优先前排(0,1,2)，first=false 总是优先后排(3,4,5)
//         const frontIndices = [0, 1, 2];
//         const backIndices = [3, 4, 5];
        
//         const primaryGroup = first ? frontIndices : backIndices;
//         const secondaryGroup = first ? backIndices : frontIndices;

//         // 辅助函数：根据列偏好对一组索引排序
//         const sortByColPref = (indices) => {
//             return indices.slice().sort((a, b) => {
//                 const colA = a % 3;
//                 const colB = b % 3;
//                 return preferredCols.indexOf(colA) - preferredCols.indexOf(colB);
//             });
//         };

//         return [...sortByColPref(primaryGroup), ...sortByColPref(secondaryGroup)];
//     }

//     switch (targetMode) {
//         case 'one': {
//             // 单个目标模式：根据AI偏好选择最低血量、随机或首个存活单位
//             if (aiPref === 'lowest') {
//                 return [aliveTargets.reduce((a, b) => a.hp < b.hp ? a : b)];
//             }
//             if (aiPref === 'random') {
//                 return [aliveTargets[Math.floor(Math.random() * aliveTargets.length)]];
//             }
//             // first: 使用新的数学方法判定目标
//             // 获取基于 actor 位置的优先级列表
//             const priorityList = getTargetForSelf(slotIndex, true);
            
//             // 在优先级列表中查找第一个存在的存活敌人
//             for (const idx of priorityList) {
//                 const target = aliveTargets.find(u => u.slotIndex === idx);
//                 if (target) return [target];
//             }
//             // 如果优先级列表中没有找到（理论上不会发生，除非 aliveTargets 为空）， fallback 到第一个
//             return [aliveTargets[0]];
//         }
//         case 'all':
//             // 全体目标模式：返回所有存活单位
//             return [...aliveTargets];
//         case 'row': {
//             // 行目标模式：根据位置索引区分前排和后排，依据偏好选择对应排位的存活单位
//             const front = aliveTargets.filter(u => u.slotIndex < 3);
//             const back = aliveTargets.filter(u => u.slotIndex >= 3);
//             if (aiPref === 'last') {
//                 return back.length > 0 ? back : front;
//             }
//             return front.length > 0 ? front : back;
//         }
//         case 'column': {
//             // 列目标模式：按slotIndex模3分组为三列，优先选择存活单位最多的列
//             const columns = [[], [], []];
//             aliveTargets.forEach(u => {
//                 const col = u.slotIndex % 3;
//                 columns[col].push(u);
//             });
//             // 选非空列中目标最多的列
//             const validCols = columns.filter(c => c.length > 0);
//             if (validCols.length === 0) return [];
//             // 按AI倾向选择：first取最左列，random取随机列
//             let chosenCol;
//             if (aiPref === 'random') {
//                 chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
//             } else {
//                 const priorityList = getTargetForSelf(slotIndex, true);
            
//                 // 在优先级列表中查找第一个存在的存活敌人
//                 for (const idx of priorityList) {
//                     const target = aliveTargets.find(u => u.slotIndex === idx);
//                     if (target) return [target];
//                 }
//                 // // first: 取最左列
//                 // for (let c = 0; c < 3; c++) {
//                 //     if (columns[c].length > 0) { chosenCol = columns[c]; break; }
//                 // }
//             }
//             return chosenCol || aliveTargets;
//         }
//         default:
//             // 默认情况：返回首个存活单位
//             return [aliveTargets[0]];
//     }
// }
/**
 * AI选择技能目标 (重构版)
 */
/**
 * AI选择技能目标 (最终修复版)
 */
function aiSelectTargets(actor, skillData, enemySide, friendlySide) {
    // 1. 严格确定目标阵营
    let isRecover = false;
    if (skillData.isRecover === true) {
        isRecover = true;
    } else if (skillData.content && skillData.content.toString().includes('rpg_recover')) {
        isRecover = true;
    }
    
    // 【核心修复】动态决定 targetSide
    const targetSide = isRecover ? actor.side : (actor.side === 'player' ? 'enemy' : 'player');

    // 2. 获取该阵营的存活单位
    let candidates = getAliveUnits(targetSide);
    if (candidates.length === 0) return [];

    // 3. 调用通用解析器
    return resolveSkillTargets(skillData, actor, targetSide,{isRecover});
}
// ====== executeAITurn & executePlayerTurn ======
/**
 * 执行AI角色的回合行动
 * @param {Object} actor - 执行行动的AI角色对象
 */
function executeAITurn(actor) {
    // AI选择行动目标
    const action = aiChooseAction(actor);

    // 如果无法选择有效行动或没有目标，则记录日志并延迟结束回合
    if (!action || action.targets.length === 0) {
        addBattleLog(`${actor.name} 无法行动`);
        setTimeout(() => afterAction(), 600);
        return;
    }

    // 播放行动动画，并在动画结束后延迟触发回合结束逻辑
    bs_animateAction(actor, action, () => {
        setTimeout(() => afterAction(), 400);
    });
}
/**
 * 通用目标解析器 (重构版)
 * 根据技能配置、施法者和战场状态，计算出合法的目标列表
 * @param {Object} skillData - 技能数据 (包含 target: [mode, pref, count?, exclude?])
 * @param {Object} actor - 施法者
 * @param {string} intendedSide - 'player' | 'enemy' (由技能是否治疗决定)
 * @returns {Array} 目标单位数组
 */
function resolveSkillTargets(skillData, actor, intendedSide,ooo) {
    if (!skillData || !skillData.target) return [];
    
    const mode = skillData.target[0];      // e.g., 'one', 'manual_multi', 'exclude_self', 'row', 'column'
    const pref = skillData.target[1] || 'first'; // e.g., 'lowest_hp', 'highest_atk', 'random', 'front', 'back', 'mirror'
    const count = skillData.target[2] || 1; // 可选：指定数量
    
    let candidates = getAliveUnits(intendedSide);
    if (candidates.length === 0) return [];

    // 1. 预处理：过滤无效目标 (如排除自身)
    if (mode === 'exclude_self') {
        candidates = candidates.filter(u => !(u.side === actor.side && u.slotIndex === actor.slotIndex));
    }
    
    // 如果过滤后无目标，返回空
    if (candidates.length === 0) return [];

    // 2. 根据模式选择目标
    switch (mode) {
        case 'all':
            return candidates;
        
        case 'one':
        case 'exclude_self':
            // 单体选择：使用加权评分系统
            return [selectBestSingleTarget(candidates, pref, actor,ooo)];

        case 'manual_multi':
            // 随机选择 N 个不同目标
            return shuffleArray([...candidates]).slice(0, Math.min(count, candidates.length));

        case 'row':
            // 行攻击：需要根据偏好和施法者位置确定具体哪一行
            return selectRowTargetsSmart(candidates, pref, actor);

        case 'column':
            // 列攻击：优先选择施法者所在列，若无则按偏好
            return selectColumnTargetsSmart(candidates, pref, actor);
            
        case 'lowest_hp_multi':
            // 选择血量百分比最低的 N 个
            return [...candidates].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp)).slice(0, count);

        default:
            // 默认 fallback 到第一个
            return [candidates[0]];
    }
}

/**
 * 智能单体目标选择 (加权评分 - 修正对位逻辑)
 * 
 * 阵型参考：
 * 敌方: [5][4][3] (后)
 *       [2][1][0] (前)
 * 我方: [0][1][2] (前)
 *       [3][4][5] (后)
 * 
 * 对位逻辑：
 * - 同列 (Column Match): slotIndex % 3 相同。例如我方0(左前)对敌方0(左前)，我方3(左后)对敌方3(左后-虽然后排索引不同，但列相同)。
 *   注意：在你提供的敌方布局中，左列是0和3? 不，看图：
 *   敌方左列是 index 0(前) 和 index ? 
 *   让我们重新映射列：
 *   敌方 Col 0 (左): Index 0 (前), Index 3 (后)? 
 *   看布局: 
 *   [5] [4] [3]
 *   [2] [1] [0]
 *   左列: 2(前), 5(后) -> %3 = 2? 不，2%3=2, 5%3=2. 
 *   中列: 1(前), 4(后) -> %3 = 1.
 *   右列: 0(前), 3(后) -> %3 = 0.
 *   
 *   我方:
 *   [0] [1] [2]
 *   [3] [4] [5]
 *   左列: 0(前), 3(后) -> %3 = 0.
 *   中列: 1(前), 4(后) -> %3 = 1.
 *   右列: 2(前), 5(后) -> %3 = 2.
 * 
 *   **关键发现**：
 *   我方左列 (%3==0) 对应 敌方右列 (%3==0, indices 0,3)。
 *   我方中列 (%3==1) 对应 敌方中列 (%3==1, indices 1,4)。
 *   我方右列 (%3==2) 对应 敌方左列 (%3==2, indices 2,5)。
 * 
 *   如果“镜像对位”是指视觉上的正对面（左对左，右对右）：
 *   我方左 (0,3) 应该打 敌方左 (2,5)。
 *   这意味着 **列索引之和为 2** (0+2=2, 1+1=2, 2+0=2) 或者 **绝对值差最大**?
 *   
 *   通常简单做法：
 *   如果希望“左打左”，则需要转换列索引。
 *   我方 col = slotIndex % 3.
 *   敌方对应镜像列 = 2 - (slotIndex % 3).
 *   
 *   如果希望“左打右”（交叉/旋转），则 col 相同。
 * 
 *   根据你的描述“索引相同是旋转对称位”，暗示索引相同不是正对面。
 *   正对面（镜像）通常是左右翻转。
 *   我方 index 0 (左前) 的镜像对面是 敌方 index 2 (右前) 或 5 (右后)?
 *   看布局：
 *   我: 0(左) 1(中) 2(右)
 *   敌: 2(左) 1(中) 0(右)  <-- 注意敌方数组索引0在右边！
 *   
 *   所以：
 *   我方 Col 0 (Left) <-> 敌方 Col 2 (Left in visual, but index 2 is Right in array? No.)
 *   让我们看敌方数组索引对应的视觉位置：
 *   Index 0: 右前
 *   Index 1: 中前
 *   Index 2: 左前
 *   Index 3: 右后
 *   Index 4: 中后
 *   Index 5: 左后
 * 
 *   我方数组索引对应的视觉位置：
 *   Index 0: 左前
 *   Index 1: 中前
 *   Index 2: 右前
 *   Index 3: 左后
 *   Index 4: 中后
 *   Index 5: 右后
 * 
 *   **镜像对位 (Visual Mirror)**:
 *   我左前 (0) vs 敌左前 (2)
 *   我中前 (1) vs 敌中前 (1)
 *   我右前 (2) vs 敌右前 (0)
 *   我左后 (3) vs 敌左后 (5)
 *   我中后 (4) vs 敌中后 (4)
 *   我右后 (5) vs 敌右后 (3)
 * 
 *   规律：
 *   如果 row 相同 (都是前或都是后):
 *   我 index i, 敌 index j.
 *   前: 0<->2, 1<->1, 2<->0.  (j = 2 - i)
 *   后: 3<->5, 4<->4, 5<->3.  (j = 8 - i ? 3+5=8, 4+4=8. Yes, j = 8 - i for back row)
 *   
 *   简化逻辑：
 *   计算视觉列 (Visual Col):
 *   我: vCol = slotIndex % 3. (0=Left, 1=Mid, 2=Right)
 *   敌: vCol = 2 - (slotIndex % 3). (因为敌方索引0是右，2是左)
 *   
 *   所以，如果要打“正对面”（同视觉列）：
 *   我 vCol == 敌 vCol
 *   => myCol == 2 - enemyCol
 *   => myCol + enemyCol == 2
 * 
 *   如果要打“旋转/交叉”（同数组索引列，即左打右）：
 *   我 vCol == 敌 vCol (Array Col)
 *   => myCol == enemyCol
 * 
 *   通常“对位”指视觉正对面。我们将采用 **视觉同列优先**。
 * 从候选目标列表中选择最佳的单一目标。
 *
 * 智能单体目标选择 (加权评分 - 增强版)
 * 
 * @param {Array} candidates - 候选目标列表
 * @param {string} pref - 偏好配置 (e.g., 'lowest_hp', 'first', 'random')
 * @param {Object} actor - 施法者
 * @param {Object} options - 额外选项 { isRecover: boolean }
 * @returns {Object|null} 最佳目标
 */
function selectBestSingleTarget(candidates, pref, actor, options = {}) {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    const { isRecover = false } = options;

    // 如果是随机，直接返回
    if (pref === 'random') {
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    let bestTarget = candidates[0];
    let maxScore = -Infinity;

    // 施法者的视觉列 (0:左, 1:中, 2:右)
    const actorVisualCol = actor.slotIndex % 3;
    // 施法者的行 (0:前, 1:后)
    const actorRow = actor.slotIndex < 3 ? 0 : 1;

    candidates.forEach(target => {
        let score = 0;
        
        // 目标的视觉列
        const targetVisualCol = target.side === 'enemy' 
            ? (2 - (target.slotIndex % 3)) 
            : (target.slotIndex % 3);
            
        const targetRow = target.slotIndex < 3 ? 0 : 1;

        // --- 核心逻辑分支：治疗 vs 伤害 ---
        
        if (isRecover) {
            // 【治疗逻辑】
            // 1. 优先选择血量百分比最低的（急救原则）
            if (pref === 'lowest' || pref === 'lowest_hp' || pref === 'first') {
                // 对于治疗，'first' 也通常意味着优先救最危险的或前排受伤的
                score += (1 - target.hp / target.maxHp) * 200; // 提高权重
            } else if (pref === 'highest') {
                // 如果偏好是 highest，可能是为了刷buff或防止溢出，但通常较少见
                score += (target.hp / target.maxHp) * 50;
            }
            
            // 2. 位置偏好：治疗通常优先前排（承受伤害多）或特定对位
            else if (pref === 'front') {
                if (targetRow === 0) score += 50;
            } else if (pref === 'back') {
                if (targetRow === 1) score += 50;
            }
            
            // 3. 对位加分：优先治疗正对面的队友（如果存在对位逻辑）
            if (targetVisualCol === actorVisualCol) {
                score += 20; 
            }

        } else {
            // 【伤害逻辑】
            // 1. 基础偏好
            if (pref === 'lowest' || pref === 'lowest_hp') {
                // 收割逻辑：优先打残血
                score += (1 - target.hp / target.maxHp) * 100;
            } else if (pref === 'highest' || pref === 'highest_hp') {
                // 破防/压血线逻辑：优先打满血
                score += (target.hp / target.maxHp) * 100;
            } else if (pref === 'front') {
                if (targetRow === 0) score += 50;
            } else if (pref === 'back') {
                if (targetRow === 1) score += 50;
            } else if (pref === 'first') {
                // 传统逻辑：优先左侧/前排
                score += (10 - target.slotIndex); 
            }

            // 2. 位置对位评分 (核心修复：视觉镜像对位)
            // 优先攻击视觉上是“正对面”的敌人
            if (targetVisualCol === actorVisualCol) {
                score += 30; // 高权重：正对面
                if(pref !== 'last' && targetRow === 0) {
                    score += 120; // 优先打前排对位
                }
                else if(targetRow==1){
                	score+=120
                }
            } 
            // 次选：相邻列
            else if (Math.abs(targetVisualCol - actorVisualCol) === 1) {
                score += 5;
                if(pref !== 'last' && targetRow === 0) {
                    score += 120;
                }
                else if(targetRow==1){
                	score+=120
                }
            }
        }

        if (score > maxScore) {
            maxScore = score;
            bestTarget = target;
        }
    });

    return bestTarget;
}

/**
 * 智能行目标选择
 */
function selectRowTargetsSmart(candidates, pref, actor) {
    const front = candidates.filter(u => u.slotIndex < 3);
    const back = candidates.filter(u => u.slotIndex >= 3);

    if (front.length === 0) return back;
    if (back.length === 0) return front;

    if (pref === 'back' || pref === 'last') {
        return back;
    }
    
    // 默认优先前排
    return front;
}

/**
 * 智能列目标选择 (视觉列)
 */
function selectColumnTargetsSmart(candidates, pref, actor) {
    // 计算演员的视觉列
    const actorVisualCol = actor.side === 'enemy' 
        ? (2 - (actor.slotIndex % 3)) 
        : (actor.slotIndex % 3);

    // 筛选出与演员视觉列相同的目标
    // 注意：candidates 已经是同一阵营的（通常是敌方），所以我们需要用敌方的视觉列计算方式
    const colTargets = candidates.filter(u => {
        const uVisualCol = 2 - (u.slotIndex % 3); // 敌方视觉列
        return uVisualCol === actorVisualCol;
    });
    
    if (colTargets.length > 0) return colTargets;
    
    // 如果该列没人， fallback 到所有存活单位，或按偏好
    const cols = [[], [], []]; // 视觉列 0, 1, 2
    candidates.forEach(u => {
        const vCol = 2 - (u.slotIndex % 3);
        cols[vCol].push(u);
    });
    
    const validCols = cols.filter(c => c.length > 0);
    if (validCols.length === 0) return [];

    if (pref === 'random') {
        const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
        return randomCol;
    }

    // 默认：返回最左边（视觉左，即敌方索引2,5所在列）有人的列
    // 视觉左是 index 0 in cols array? 
    // cols[0] is Visual Left (Enemy indices 2,5)
    // cols[1] is Visual Mid (Enemy indices 1,4)
    // cols[2] is Visual Right (Enemy indices 0,3)
    for (let c = 0; c < 3; c++) {
        if (cols[c].length > 0) return cols[c];
    }
    
    return candidates;
}

// 辅助：洗牌算法 (保持不变)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function executePlayerTurn(actor, action) {
    battleState.phase = 'animating';
    hidePlayerActionUI();

    bs_animateAction(actor, action, () => {
        setTimeout(() => afterAction(), 400);
    });
}

function bs_animateAction(actor, action, callback) {
    const bs = battleState; // 【修复】定义 bs 变量
    if (!bs) return;

    const skillType = action.type === 'pugong' ? 'pugong' : action.skillType;

    // 先在行动者身上播放光晕
    const slotEl = document.querySelector(`.battle-unit[data-side="${actor.side}"][data-slot="${actor.slotIndex}"]`);
    if (slotEl) {
        const glowClass = skillType === 'spskill' ? 'spskill-glow'
                        : skillType === 'skill'  ? 'skill-glow'
                        : 'pugong-glow';
        const glow = document.createElement('div');
        glow.className = `action-glow ${glowClass}`;
        slotEl.appendChild(glow);
        setTimeout(() => {
            if (glow.parentNode) glow.remove();
        }, 600);
    }

    // 确定技能Emoji特效
    const effectInfo = getSkillEffectInfo(action);

    // 延迟200ms后，在目标身上播放Emoji特效
    setTimeout(() => {
        const targets = action.targets;
        if (!targets || targets.length === 0) {
            if (callback) callback();
            return;
        }
        
        if (effectInfo.effectClass === 'sword-effect' || effectInfo.effectClass === 'moon-effect') {
            showSkillEffectOnTargets(targets, effectInfo);
        } else if (effectInfo.effectClass === 'bolt-effect') {
            showSkillEffectOnTargets(targets, effectInfo);
        } else {
            targets.forEach(t => showSkillEffect(t, effectInfo));
        }
    }, 200);

    // 600ms后结算伤害
    setTimeout(() => {
        function onActionComplete() {
            updateBattleUI();

            if (isSideDefeated('player') || isSideDefeated('enemy')) {
                setTimeout(() => {
                    if (isSideDefeated('player')) endBattle('enemy');
                    else endBattle('player');
                }, 500);
                return;
            }

            if (callback) setTimeout(callback, 500);
        }

        if (action.type === 'pugong') {
            executePugong(actor, action.targets, onActionComplete);
        } else {
            executeSkill(actor, action.skillType, action.skillId, action.targets, action.energyCost, onActionComplete);
        }
    }, 600);
}

function endBattle(winner) {
    const bs = battleState;
    bs.phase = 'ended';
    addBattleLog(winner === 'player' ? '战斗胜利！' : '战斗失败...');

    setTimeout(() => {
        showBattleResult(winner);
    }, 800);
}

// ====== 战斗日志 ======
function addBattleLog(msg) {
    if (!battleState) return;
    battleState.log.push(msg);
    const logEl = document.getElementById('battle-log');
    if (logEl) {
        const line = document.createElement('div');
        line.className = 'battle-log-line';
        line.textContent = msg;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    }
}

// ====== 技能Emoji特效 ======
/**
 * 根据技能的target模式确定特效类型 (修复版 - 支持 isRecover 字段)
 * @returns {{ emoji: string, effectClass: string, targets: Array }}
 */
function getSkillEffectInfo(action) {
    const skillType = action.type === 'pugong' ? 'pugong' : action.skillType;
    const skillId = action.type === 'pugong' ? action.skillId : action.skillId;
    const sData = contentList[skillType] && contentList[skillType][skillId];

    if (!sData || !sData.target) {
        // fallback: 单体攻击
        return { emoji: '🔥', effectClass: 'fire-effect' };
    }

    const targetMode = sData.target[0];
    const aiPref = sData.target[1];
    
    // 【核心修复】优先使用 isRecover 字段，其次检查 content 字符串
    let isRecover = false;
    if (sData.isRecover === true) {
        isRecover = true;
    }

    if (isRecover) {
        if (targetMode === 'one' || targetMode === 'all') {
            return { emoji: '🧪', effectClass: 'heal-effect' };
        }
        // 全体治疗也用药剂
        return { emoji: '🧪', effectClass: 'heal-effect' };
    }

    switch (targetMode) {
        case 'row':
            if (aiPref === 'last') {
                return { emoji: '🌙', effectClass: 'moon-effect' };
            }
            return { emoji: '⚔️', effectClass: 'sword-effect' };
        case 'column':
            return { emoji: '⚡', effectClass: 'bolt-effect' };
        case 'one':
        default:
            return { emoji: '🔥', effectClass: 'fire-effect' };
    }
}

/**
 * 在指定角色槽位上播放技能Emoji特效
 */
function showSkillEffect(unit, effectInfo) {
    const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
    if (!slotEl) return;

    const el = document.createElement('div');
    el.className = `skill-effect ${effectInfo.effectClass}`;
    el.textContent = effectInfo.emoji;
    slotEl.appendChild(el);

    setTimeout(() => el.remove(), 650);
}

/**
 * 为行/列攻击的所有目标槽位依次播放特效（带延迟）
 */
function showSkillEffectOnTargets(targets, effectInfo) {
    targets.forEach((t, i) => {
        setTimeout(() => {
            showSkillEffect(t, effectInfo);
        }, i * 100);  // 每个目标间隔100ms
    });
}

// ====== 伤害飘字 ======
function showDamageNumber(unit, value, isHeal) {
    const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
    if (!slotEl) return;

    const float = document.createElement('div');
    float.className = 'damage-float ' + (isHeal ? 'heal' : 'damage');
    float.textContent = (isHeal ? '+' : '-') + value;
    slotEl.appendChild(float);

    setTimeout(() => float.remove(), 1000);
}

// ====== 战斗UI渲染 ======
function renderBattleView() {
    const container = document.getElementById('battle-view');
    if (!container) return;
    container.innerHTML = '';

    const bs = battleState;

    // 战场区域
    const field = document.createElement('div');
    field.className = 'battle-field';
    field.id = 'battle-field';

    // 敌方区域
    const enemyArea = document.createElement('div');
    enemyArea.className = 'battle-side enemy-side';
    const enemyLabel = document.createElement('div');
    enemyLabel.className = 'battle-side-label';
    enemyLabel.textContent = '敌方';
    enemyArea.appendChild(enemyLabel);
    const enemyGrid = document.createElement('div');
    enemyGrid.className = 'battle-grid';

    // 敌方阵型（视角：6,5,4 / 3,2,1），但存储索引 0-5
    // 渲染顺序：后排(5,4,3) → 前排(2,1,0)
    const enemyDisplayOrder = [5, 4, 3, 2, 1, 0];
    enemyDisplayOrder.forEach(idx => {
        const unit = bs.enemyUnits[idx];
        const slot = createUnitSlot(unit, 'enemy', idx);
        enemyGrid.appendChild(slot);
    });
    enemyArea.appendChild(enemyGrid);
    field.appendChild(enemyArea);

    // 中间VS+日志区域
    const divider = document.createElement('div');
    divider.className = 'battle-divider';
    divider.id = 'battle-divider';
    const vsLabel = document.createElement('div');
    vsLabel.className = 'battle-vs-label';
    vsLabel.textContent = 'VS';
    divider.appendChild(vsLabel);
    const logArea = document.createElement('div');
    logArea.className = 'battle-log-area';
    logArea.id = 'battle-log';
    divider.appendChild(logArea);
    field.appendChild(divider);

    // 我方区域
    const playerArea = document.createElement('div');
    playerArea.className = 'battle-side player-side';
    const playerLabel = document.createElement('div');
    playerLabel.className = 'battle-side-label';
    playerLabel.textContent = '我方';
    playerArea.appendChild(playerLabel);
    const playerGrid = document.createElement('div');
    playerGrid.className = 'battle-grid';

    // 我方阵型：1,2,3 / 4,5,6，存储索引 0-5
    // 渲染顺序：前排(0,1,2) → 后排(3,4,5)
    const playerDisplayOrder = [0, 1, 2, 3, 4, 5];
    playerDisplayOrder.forEach(idx => {
        const unit = bs.playerUnits[idx];
        const slot = createUnitSlot(unit, 'player', idx);
        playerGrid.appendChild(slot);
    });
    playerArea.appendChild(playerGrid);
    field.appendChild(playerArea);

    container.appendChild(field);

    // 先后手信息
    addBattleLog(`—— 第 ${bs.round} 轮 ——`);
    addBattleLog(`${bs.firstSide === 'player' ? '我方' : '敌方'}先手`);

        // ... 前面的代码不变 ...

    // 隐藏底部导航
    const bottomBar = document.querySelector('.ybrpg-bottom-bar');
    if (bottomBar) bottomBar.style.display = 'none';

    // 显示战斗视图
    hideOtherViews('battle-view');
    
    // --- 底部按钮区域 ---
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'display:flex; flex-direction:column; align-items:center; width:100%; margin-top:10px; gap:5px;';

    // 1. 自动战斗按钮
    const autoBtn = document.createElement('button');
    autoBtn.className = 'ybrpg-btn';
    autoBtn.style.cssText = 'width:auto;padding:4px 16px;font-size:12px;';
    autoBtn.textContent = window.autoBattle ? '🎮 自动战斗' : '🎮 手动战斗';
    autoBtn.id = 'battle-auto-btn';
    autoBtn.onclick = () => {
        window.autoBattle = !window.autoBattle;
        autoBtn.textContent = window.autoBattle ? '🎮 自动战斗' : '🎮 手动战斗';
        
        // 如果切换为自动且当前处于玩家回合，立即行动
        if (window.autoBattle && battleState && battleState.phase === 'player_action') {
            const currentUnit = battleState.currentTurnSide === 'player'
                ? battleState.playerUnits[battleState.currentTurnIndex]
                : null;
            if (currentUnit && currentUnit.alive) {
                const action = aiChooseAction(currentUnit);
                if (action && action.targets.length > 0) {
                    executePlayerTurn(currentUnit, action);
                }
            }
        }
    };
    controlsDiv.appendChild(autoBtn);

    // 2. 【修改】逃跑按钮 - 使用项目自带 confirmDialog
    const escapeBtn = document.createElement('button');
    escapeBtn.className = 'ybrpg-btn';
    escapeBtn.style.cssText = 'width:auto;padding:4px 16px;font-size:12px;background-color:#d9534f;border-color:#d43f3a;color:#fff;';
    escapeBtn.textContent = '🏃 逃跑';
    escapeBtn.onclick = () => {
        // 调用项目自带的确认对话框
        confirmDialog('确定要放弃本次战斗吗？', () => {
            // 确认回调：判定为敌方胜利（玩家失败）
            endBattle('enemy');
        }, () => {
            // 取消回调：什么都不做，或者可以加个提示
            // toast('已取消逃跑', 'info');
        });
    };
    controlsDiv.appendChild(escapeBtn);

    // 将控制面板添加到战场区域
    field.appendChild(controlsDiv);
    
    container.appendChild(field);
    container.style.display = 'flex';
}

function createUnitSlot(unit, side, slotIndex) {
    const slot = document.createElement('div');
    slot.className = 'battle-unit';
    slot.dataset.side = side;
    slot.dataset.slot = slotIndex;

    if (!unit || !unit.id) {
        slot.classList.add('empty-slot');
        slot.innerHTML = '<span class="empty-text">空</span>';
        return slot;
    }

    // 头像（占满整个卡片）
    const img = document.createElement('img');
    img.className = 'battle-unit-img';
    img.src = `./image/character/${unit.id}.jpg`;
    img.alt = unit.name;
    img.onerror = function() {
        this.onerror = function() {
            this.style.display = 'none';
            slot.classList.add('battle-unit-noimg');
            const placeholder = document.createElement('div');
            placeholder.className = 'battle-unit-placeholder';
            placeholder.textContent = unit.name.charAt(0);
            slot.insertBefore(placeholder, slot.firstChild);
        };
        this.src = `./image/character/${unit.id}.webp`;
    };
    slot.appendChild(img);

    // 底部半透明信息遮罩（名称 + 血条 + 能量）
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'battle-unit-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'battle-unit-name';
    nameEl.textContent = unit.name;
    infoOverlay.appendChild(nameEl);

    const hpBar = document.createElement('div');
    hpBar.className = 'battle-hp-bar';
    const hpFill = document.createElement('div');
    hpFill.className = 'battle-hp-fill';
    hpFill.style.width = '100%';
    hpBar.appendChild(hpFill);
    infoOverlay.appendChild(hpBar);

    const hpText = document.createElement('div');
    hpText.className = 'battle-hp-text';
    hpText.textContent = `${unit.hp}/${unit.maxHp}`;
    infoOverlay.appendChild(hpText);

    const energyBar = document.createElement('div');
    energyBar.className = 'battle-energy-bar';
    for (let i = 0; i < 8; i++) {
        const pip = document.createElement('div');
        pip.className = 'energy-pip';
        energyBar.appendChild(pip);
    }
    infoOverlay.appendChild(energyBar);

    slot.appendChild(infoOverlay);

    return slot;
}

/**
 * 更新战斗界面的用户界面显示。
 * 
 * 该函数根据当前的 battleState 状态，同步更新所有玩家和敌方单位槽位的视觉表现，
 * 包括生死状态、封印状态、当前行动高亮、血条进度与颜色、血量数值以及能量点显示。
 * 
 * @returns {void}
 */
function updateBattleUI() {
    const bs = battleState;
    if (!bs) return;

    // 遍历所有存在的单位，同步其对应的 DOM 槽位状态
    const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u);
    allUnits.forEach(unit => {
        const slot = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
        if (!slot) return;

        // 处理单位的死亡状态样式
        if (!unit.alive) {
            slot.classList.add('dead');
        }

        // 处理单位的封印状态样式
        if (unit.sealed || unit.permanentlySealed) {
            slot.classList.add('sealed');
        } else {
            slot.classList.remove('sealed');
        }

        // 标记当前回合正在行动的单位
        if (bs.currentTurnSide === unit.side && bs.currentTurnIndex === unit.slotIndex && unit.alive) {
            slot.classList.add('active-turn');
        } else {
            slot.classList.remove('active-turn');
        }

        // 更新血条宽度及根据血量百分比改变颜色
        const hpFill = slot.querySelector('.battle-hp-fill');
        if (hpFill) {
            const pct = Math.max(0, unit.hp / unit.maxHp * 100);
            hpFill.style.width = pct + '%';
            // 颜色变化
            if (pct > 60) hpFill.style.background = '#44cc44';
            else if (pct > 30) hpFill.style.background = '#ccaa22';
            else hpFill.style.background = '#cc3333';
        }

        // 更新血量文本显示
        const hpText = slot.querySelector('.battle-hp-text');
        if (hpText) hpText.textContent = `${unit.hp}/${unit.maxHp}`;

        // 更新能量点填充状态及技能就绪指示
        const pips = slot.querySelectorAll('.energy-pip');
        pips.forEach((pip, i) => {
            pip.classList.toggle('filled', i < unit.energy);
            pip.classList.toggle('skill-ready', i < 4 && unit.energy >= 4);
        });
    });
}

// ====== 玩家操作面板（浮在角色图片上的半透明遮罩） ======
/** 根据技能类型和ID获取对应的特效emoji (修复版) */
function getSkillEmoji(skillType, skillId) {
    const sData = contentList[skillType] && contentList[skillType][skillId];
    if (!sData || !sData.target) return '🔥';

    // 【核心修复】优先使用 isRecover 字段
    let isRecover = false;
    if (sData.isRecover === true) {
        isRecover = true;
    }

    if (isRecover) return '🧪';

    const targetMode = sData.target[0];
    const aiPref = sData.target[1];

    switch (targetMode) {
        case 'row': return aiPref === 'last' ? '🌙' : '⚔️';
        case 'column': return '⚡';
        case 'one':
        default: return '🔥';
    }
}

/**
 * 显示玩家操作UI面板，或根据自动战斗状态执行AI行动
 * 
 * @param {Object} actor - 当前行动的角色对象
 * @param {boolean} [actor.alive] - 角色是否存活
 * @param {string} [actor.side] - 角色所属阵营
 * @param {number} [actor.slotIndex] - 角色在战场上的插槽索引
 * @param {Array<string>} [actor.skills] - 角色技能ID列表，索引0为普攻，1为技能，2为必杀
 * @param {number} [actor.energy] - 角色当前能量值
 * @param {boolean} [actor.sealed] - 角色是否被暂时封印
 * @param {boolean} [actor.permanentlySealed] - 角色是否被永久封印
 */
function showPlayerActionUI(actor) {
    // 处理自动战斗逻辑：若开启自动战斗且角色存活，则执行AI选择动作并播放动画
    if (window.autoBattle && actor && actor.alive) {
        const action = aiChooseAction(actor);
        if (action && action.targets.length > 0) {
            battleState.phase = 'animating';
            bs_animateAction(actor, action, () => {
                setTimeout(() => afterAction(), 400);
            });
            return;
        }
    }
    
    // 隐藏旧的操作UI
    hidePlayerActionUI();

    // 获取角色对应的DOM插槽元素，若不存在则终止
    const slot = document.querySelector(`.battle-unit[data-side="${actor.side}"][data-slot="${actor.slotIndex}"]`);
    if (!slot) return;

    // 创建操作面板容器
    const panel = document.createElement('div');
    panel.className = 'battle-action-overlay';
    panel.id = 'battle-action-panel';

    // 创建普攻按钮
    const pugongId = actor.skills[0] || 'attack1';
    const pugongBtn = document.createElement('button');
    pugongBtn.className = 'action-btn pugong-btn';
    pugongBtn.textContent = '普攻 ' + getSkillEmoji('pugong', pugongId);
    pugongBtn.onclick = (e) => {
        e.stopPropagation();
        enterTargetSelection(actor, 'pugong', pugongId, 0);
    };
    panel.appendChild(pugongBtn);

    // 创建技能按钮（若存在技能ID）
    const skillId = actor.skills[1];
    if (skillId) {
        const isSealed = actor.sealed || actor.permanentlySealed;
        const canUseSkill = actor.energy >= 4 && !isSealed;
        const skillBtn = document.createElement('button');
        skillBtn.className = 'action-btn skill-btn' + (canUseSkill ? '' : ' disabled');
        skillBtn.textContent = '技能 ' + getSkillEmoji('skill', skillId);
        if (canUseSkill) {
            skillBtn.onclick = (e) => {
                e.stopPropagation();
                enterTargetSelection(actor, 'skill', skillId, actor.energy);
            };
        } else {
            skillBtn.onclick = (e) => {
                e.stopPropagation();
                if (isSealed) toast('已被封印，无法使用技能', 'warning');
                else toast('能量不足4，无法使用技能', 'warning');
            };
        }
        panel.appendChild(skillBtn);
    }

    // 创建必杀按钮（若存在必杀ID）
    const spId = actor.skills[2];
    if (spId) {
        const isSealed = actor.sealed || actor.permanentlySealed;
        const canUseSp = actor.energy >= 8 && !isSealed;
        const spBtn = document.createElement('button');
        spBtn.className = 'action-btn spskill-btn' + (canUseSp ? '' : ' disabled');
        spBtn.textContent = '必杀 ' + getSkillEmoji('spskill', spId);
        if (canUseSp) {
            spBtn.onclick = (e) => {
                e.stopPropagation();
                enterTargetSelection(actor, 'spskill', spId, actor.energy);
            };
        } else {
            spBtn.onclick = (e) => {
                e.stopPropagation();
                if (isSealed) toast('已被封印，无法使用必杀', 'warning');
                else toast('能量不足8，无法使用必杀', 'warning');
            };
        }
        panel.appendChild(spBtn);
    }

    // 将操作面板添加到角色插槽中
    slot.appendChild(panel);
}

function hidePlayerActionUI() {
    const panel = document.getElementById('battle-action-panel');
    if (panel) panel.remove();
    clearTargetHighlights();
}
// 【新增】在这里插入 clearTargetHighlights 定义
function clearTargetHighlights() {
    document.querySelectorAll('.battle-unit.selectable').forEach(el => {
        el.classList.remove('selectable', 'target-selected');
        el.onclick = null;
    });
}
// ====== 目标选择 ======
let targetSelection = null;

// function enterTargetSelection(actor, skillType, skillId, energyCost) {
//     const sData = contentList[skillType] && contentList[skillType][skillId];
//     if (!sData) return;

//     const isRecover = sData.content ? sData.content.toString().includes('rpg_recover') : false;
//     const targetMode = sData.target ? sData.target[0] : 'one';

//     targetSelection = { actor, skillType, skillId, energyCost, targetMode, isRecover, selectedTargets: [] };

//     // 如果是全体/行/列自动选目标
//     if (targetMode === 'all') {
//         const side = isRecover ? 'player' : 'enemy';
//         const targets = getAliveUnits(side);
//         if (targets.length === 0) {
//             toast('没有可选目标', 'warning');
//             targetSelection = null;
//             return;
//         }
//         // 直接执行
//         const action = { type: skillType === 'pugong' ? 'pugong' : 'skill', skillType, skillId, targets, energyCost };
//         executePlayerTurn(actor, action);
//         targetSelection = null;
//         return;
//     }

//     // 需要手动选择目标
//     highlightSelectableTargets(targetMode, isRecover);
//     addBattleLog('请选择目标');
// }

// function highlightSelectableTargets(targetMode, isRecover) {
//     const side = isRecover ? 'player' : 'enemy';
//     const aliveUnits = getAliveUnits(side);

//     aliveUnits.forEach(u => {
//         const el = document.querySelector(`.battle-unit[data-side="${u.side}"][data-slot="${u.slotIndex}"]`);
//         if (el) {
//             el.classList.add('selectable');
//             el.onclick = () => onTargetClicked(u);
//         }
//     });
// }


// function clearTargetHighlights() {
//     document.querySelectorAll('.battle-unit.selectable').forEach(el => {
//         el.classList.remove('selectable', 'target-selected');
//         el.onclick = null;
//     });
// }

// function onTargetClicked(target) {
//     if (!targetSelection) return;
//     const ts = targetSelection;
//     const side = ts.isRecover ? 'player' : 'enemy';

//     if (ts.targetMode === 'one') {
//         // 单体目标，直接确认
//         const action = {
//             type: ts.skillType === 'pugong' ? 'pugong' : 'skill',
//             skillType: ts.skillType,
//             skillId: ts.skillId,
//             targets: [target],
//             energyCost: ts.energyCost,
//         };
//         targetSelection = null;
//         executePlayerTurn(ts.actor, action);
//     } else if (ts.targetMode === 'row') {
//         // 行攻击，选中目标的所在行
//         const rowStart = target.slotIndex < 3 ? 0 : 3;
//         const targets = getAliveUnits(side).filter(u => u.slotIndex >= rowStart && u.slotIndex < rowStart + 3);
//         const action = {
//             type: ts.skillType === 'pugong' ? 'pugong' : 'skill',
//             skillType: ts.skillType,
//             skillId: ts.skillId,
//             targets,
//             energyCost: ts.energyCost,
//         };
//         targetSelection = null;
//         executePlayerTurn(ts.actor, action);
//     } else if (ts.targetMode === 'column') {
//         // 列攻击，选中目标所在列
//         const col = target.slotIndex % 3;
//         const targets = getAliveUnits(side).filter(u => u.slotIndex % 3 === col);
//         const action = {
//             type: ts.skillType === 'pugong' ? 'pugong' : 'skill',
//             skillType: ts.skillType,
//             skillId: ts.skillId,
//             targets,
//             energyCost: ts.energyCost,
//         };
//         targetSelection = null;
//         executePlayerTurn(ts.actor, action);
//     }
// }

/**
 * 进入技能目标选择状态
 * 
 * @param {Object} actor - 释放技能的行动者对象
 * @param {string} skillType - 技能类型，用于从 contentList 中索引
 * @param {string|number} skillId - 技能ID，用于从 contentList 中索引具体技能数据
 * @param {number} energyCost - 技能消耗的能量值
 * @returns {void}
 */
function enterTargetSelection(actor, skillType, skillId, energyCost) {
    const sData = contentList[skillType] && contentList[skillType][skillId];
    if (!sData) {
        console.warn(`[Battle] Skill data not found for ${skillId}`);
        return;
    }

    // 1. 严格判断是否为治疗
    let isRecover = false;
    if (sData.isRecover === true) {
        isRecover = true;
    } else if (sData.content && sData.content.toString().includes('rpg_recover')) {
        isRecover = true;
    }

    // 2. 【核心修复】动态计算目标阵营
    // 治疗 -> 友方 (actor.side)
    // 攻击 -> 敌方 (actor.side === 'player' ? 'enemy' : 'player')
    const targetSide = isRecover ? actor.side : (actor.side === 'player' ? 'enemy' : 'player');

    const targetConfig = sData.target || ['one', 'first'];
    const mode = targetConfig[0];
    const count = targetConfig[2] || 1; // 默认选择1个，如果是 manual_multi 通常会指定数量

    // 初始化全局目标选择状态对象
    targetSelection = { 
        actor, 
        skillType, 
        skillId, 
        energyCost, 
        targetMode: mode, 
        targetCount: count,
        isRecover, 
        targetSide, // 【新增】存储正确的目标阵营
        selectedTargets: [] 
    };

    // --- 自动释放的情况 (无需玩家逐个点选) ---
    // 注意：manual_multi 必须从这里的数组中移除，否则会变成自动随机选择
    if (['all', 'lowest_hp_multi'].includes(mode)) {
        const targets = resolveSkillTargets(sData, actor, targetSide);
        
        if (targets.length > 0) {
            const action = {
                type: skillType === 'pugong' ? 'pugong' : 'skill',
                skillType: skillType,
                skillId: skillId,
                targets: targets,
                energyCost: energyCost
            };
            executePlayerTurn(actor, action);
        } else {
            toast('没有有效目标', 'warning');
        }
        return; 
    }

    // --- 手动选择情况 ---
    
    // 1. 单体选择 (one / exclude_self)
    if (mode === 'one' || mode === 'exclude_self') {
        addBattleLog('请点击选择目标');
        highlightSelectableTargets(mode, isRecover, targetSide);
    } 
    // 2. 行/列选择 (需要点击一个目标来确定哪一行/列)
    else if (mode === 'row' || mode === 'column') {
        addBattleLog(`请点击选择${mode === 'row' ? '行' : '列'}中的一个目标`);
        highlightSelectableTargets(mode, isRecover, targetSide);
    }
    // 3. 【关键修复】手动多选 (manual_multi)
    else if (mode === 'manual_multi') {
        addBattleLog(`请依次选择 ${count} 个目标 (已选: 0/${count})`);
        highlightSelectableTargets('manual_multi', isRecover, targetSide);
    }
    // 4. 其他未知模式 fallback
    else {
        console.warn(`[Battle] Unknown target mode: ${mode}. Defaulting to one.`);
        addBattleLog('请点击选择目标');
        highlightSelectableTargets('one', isRecover, targetSide);
    }
}



function highlightSelectableTargets(mode, isRecover, targetSide) {
    // 【核心修复】使用传入的 targetSide，而不是根据 isRecover 硬编码
    const aliveUnits = getAliveUnits(targetSide);

    aliveUnits.forEach(u => {
        // 排除自身逻辑 (如果需要，例如 exclude_self 模式)
        if (mode === 'exclude_self' && u.side === targetSelection.actor.side && u.slotIndex === targetSelection.actor.slotIndex) {
            return; 
        }

        const el = document.querySelector(`.battle-unit[data-side="${u.side}"][data-slot="${u.slotIndex}"]`);
        if (el) {
            el.classList.add('selectable');
            
            // 如果是手动多选，检查是否已被选中，给予不同样式
            if (mode === 'manual_multi') {
                const isSelected = targetSelection.selectedTargets.some(t => t.slotIndex === u.slotIndex && t.side === u.side);
                if (isSelected) {
                    el.classList.add('target-selected');
                }
            }

            // 绑定点击事件
            el.onclick = () => onTargetClicked(u);
        }
    });
}

function onTargetClicked(target) {
    if (!targetSelection) return;
    const ts = targetSelection;
    // console.log('点击了目标:', ts);
    const side = ts.isRecover ? 'player' : 'enemy';
    
    let finalTargets = [];

    // --- 处理手动多选模式 (Manual Multi) ---
    if (ts.targetMode === 'manual_multi') {
        // 检查是否已经选过这个目标
        const existingIndex = ts.selectedTargets.findIndex(t => t.slotIndex === target.slotIndex && t.side === target.side);
        
        if (existingIndex !== -1) {
            // 【修改点1】如果点击已选中的目标，取消选择
            ts.selectedTargets.splice(existingIndex, 1);
            addBattleLog(`取消选择: ${target.name} (已选: ${ts.selectedTargets.length}/${ts.targetCount})`);
            
            // 刷新高亮
            clearTargetHighlights();
            highlightSelectableTargets('manual_multi', ts.isRecover);
            return; // 取消选择后不释放，等待继续选择
        } else {
            // 如果未选，且未达到上限，则加入
            if (ts.selectedTargets.length < ts.targetCount) {
                ts.selectedTargets.push(target);
                addBattleLog(`选中: ${target.name} (已选: ${ts.selectedTargets.length}/${ts.targetCount})`);
            } else {
                // 【修改点2】已达到上限，提示
                toast('已达到最大目标数量', 'warning');
                return; 
            }
        }

        // 刷新高亮状态
        clearTargetHighlights();
        highlightSelectableTargets('manual_multi', ts.isRecover);

        // 【核心修复】判断是否应该释放技能
        // 条件A: 选满了
        // 条件B: 场上所有存活且合法的目标都已经选中了（即使没满，也没得选了）
        const allValidTargets = getAliveUnits(side).filter(u => {
             // 排除自身逻辑如果需要
             if (ts.targetMode === 'exclude_self' && u.side === ts.actor.side && u.slotIndex === ts.actor.slotIndex) return false;
             return true;
        });
        
        const isAllSelected = ts.selectedTargets.length >= allValidTargets.length;
        const isFull = ts.selectedTargets.length === ts.targetCount;

        if (isFull || isAllSelected) {
            finalTargets = [...ts.selectedTargets];
            // 执行技能
        } else {
            // 还没选满，且还有可选目标，等待下一次点击
            return; 
        }
    }
    
    // --- 处理其他原有模式 (保持不变) ---
    else if (ts.targetMode === 'one' || ts.targetMode === 'exclude_self') {
        finalTargets = [target];
    } 
    else if (ts.targetMode === 'row') {
        const rowStart = target.slotIndex < 3 ? 0 : 3;
        finalTargets = getAliveUnits(side).filter(u => u.slotIndex >= rowStart && u.slotIndex < rowStart + 3);
    } 
    else if (ts.targetMode === 'column') {
        const col = target.slotIndex % 3;
        finalTargets = getAliveUnits(side).filter(u => u.slotIndex % 3 === col);
    }
    else if (ts.targetMode === 'manual_multi') {
        let candidates = getAliveUnits(side);
        if (ts.targetMode === 'exclude_self') {
             candidates = candidates.filter(u => !(u.side === ts.actor.side && u.slotIndex === ts.actor.slotIndex));
        }
        finalTargets = shuffleArray([...candidates]).slice(0, ts.targetCount);
        addBattleLog(`随机选中了: ${finalTargets.map(t=>t.name).join(', ')}`);
    }
    else if (ts.targetMode === 'all') {
        finalTargets = getAliveUnits(side);
    }
    else if (ts.targetMode === 'lowest_hp_multi') {
         let candidates = getAliveUnits(side);
         finalTargets = [...candidates].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp).slice(0, ts.targetCount);
         addBattleLog(`选中血量最低: ${finalTargets.map(t=>t.name).join(', ')}`);
    }

    if (finalTargets.length === 0) {
        if (ts.targetMode !== 'manual_multi') {
            toast('没有有效目标', 'warning');
        }
        return;
    }

    const action = {
        type: ts.skillType === 'pugong' ? 'pugong' : 'skill',
        skillType: ts.skillType,
        skillId: ts.skillId,
        targets: finalTargets,
        energyCost: ts.energyCost,
    };

    // 执行前清空选择状态
    targetSelection = null;
    clearTargetHighlights();
    executePlayerTurn(ts.actor, action);
}


// ====== 战斗开场/结果 ======

/**
 * 显示战斗介绍并处理战斗开始时的逻辑。
 * 
 * 该函数负责初始化战斗状态，触发所有单位的战斗开始被动效果，
 * 并在完成后进入下一个回合。如果战斗已经开始，则直接延迟进入下一回合。
 * 
 * @returns {void}
 */
function showBattleIntro() {
    const bs = battleState;
    resetActedSlots();

    // 战斗开始时触发被动宝物（祸首等）
    if (!bs.battleStarted) {
        bs.battleStarted = true;
        const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u);
        let index = 0;

        /**
         * 递归触发下一个单位的战斗开始被动效果。
         * 当所有单位处理完毕后，更新UI并延迟进入下一回合。
         */
        function triggerNext() {
            if (index >= allUnits.length) {
                updateBattleUI();
                // 所有被动宝物触发完毕，开始回合
                setTimeout(() => {
                    nextTurn();
                }, 300);
                return;
            }

            const u = allUnits[index++];
            if (u && u.alive) {
                triggerBattleStartPassive(u, triggerNext);
            } else {
                triggerNext();
            }
        }

        triggerNext();
        return;
    }

    // 战斗已启动，直接延迟进入下一回合
    setTimeout(() => {
        nextTurn();
    }, 500);
}

/**
 * 显示战斗结果界面，包括胜负标题、存活统计及奖励信息，并提供返回按钮以清理状态和跳转视图。
 * 
 * @param {string} winner - 战斗胜利方标识，'player' 表示玩家胜利，其他值表示失败。
 */
function showBattleResult(winner) {
    const bs = battleState;
    hidePlayerActionUI();

    const container = document.getElementById('battle-view');

    // 创建并配置战斗结果遮罩层及对话框容器
    const overlay = document.createElement('div');
    overlay.className = 'battle-result-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'battle-result-dialog';

    // 设置胜负标题及颜色
    const title = document.createElement('div');
    title.className = 'battle-result-title';
    title.textContent = winner === 'player' ? '战斗胜利' : '战斗失败';
    title.style.color = winner === 'player' ? '#ffd700' : '#ff4444';
    dialog.appendChild(title);

    // 存活统计
    const playerAlive = getAliveUnits('player').length;
    const enemyAlive = getAliveUnits('enemy').length;
    const stats = document.createElement('div');
    stats.className = 'battle-result-stats';
    stats.textContent = `我方存活: ${playerAlive}  |  敌方存活: ${enemyAlive}  |  总轮数: ${bs.round}`;
    dialog.appendChild(stats);

    // 胜利时显示金币奖励
     // 胜利时显示金币奖励
    if (winner === 'player') {
        // 【修改】直接读取 startBattle 时传入的预期金币
        const goldReward = bs.expectedGold || 0;
        
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'battle-result-stats';
        rewardDiv.style.color = '#ffd700';
        rewardDiv.style.marginTop = '8px';
        
        // 显示金币
        rewardDiv.innerHTML = `💰 金币奖励: +${goldReward}`;
        dialog.appendChild(rewardDiv);
    }

    // 创建返回按钮，处理状态清理、UI恢复及后续流程回调
    const btn = document.createElement('button');
    btn.className = 'ybrpg-btn';
    btn.textContent = '返回';
    btn.onclick = () => {
        // 清理战斗状态
        battleState = null;
        targetSelection = null;
        container.style.display = 'none';

        // 恢复底部导航
        const bottomBar = document.querySelector('.ybrpg-bottom-bar');
        if (bottomBar) bottomBar.style.display = 'flex';

        // 回调
        if (winner === 'player' && bs.onWin) bs.onWin();
        else if (winner === 'enemy' && bs.onLose) bs.onLose();
        else {
            // 默认返回副本视图（当前章节）
            const dungeonView = document.getElementById('dungeon-view');
            if (dungeonView) {
                hideOtherViews('dungeon-view');
                dungeonView.style.display = 'flex';
                if (bs.chapterKey) {
                    renderDungeonView(dungeonView, bs.chapterKey);
                }
            }
        }
    };
    dialog.appendChild(btn);

    overlay.appendChild(dialog);
    container.appendChild(overlay);
}

// ====== 退出战斗 ======
function exitBattle() {
    battleState = null;
    targetSelection = null;
    const container = document.getElementById('battle-view');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    const bottomBar = document.querySelector('.ybrpg-bottom-bar');
    if (bottomBar) bottomBar.style.display = 'flex';
}

// ====== 宝物时点触发系统 ======

/**
 * 显示宝物特效动画
 * @param {Object} unit - 目标角色
 * @param {string} treasureId - 宝物ID
 * @param {string} effectType - 效果类型: 'heal', 'damage', 'atk-up', 'def-up', 'default'
 * @param {Function} callback - 动画结束回调
 */
function showTreasureEffect(unit, treasureId, effectType = 'default', callback) {
    const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
    if (!slotEl) {
        if (callback) callback();
        return;
    }

    const treasureDefs = gameData.getTreasureList();
    const tDef = treasureDefs[treasureId];
    const treasureName = tDef ? tDef.name : treasureId;

    // 创建特效容器
    const effectDiv = document.createElement('div');
    effectDiv.className = 'treasure-effect-group';
    slotEl.appendChild(effectDiv);

    // 根据效果类型确定CSS类
    let effectClass = '';

    switch (effectType) {
        case 'heal':
            effectClass = 'heal';
            break;
        case 'damage':
            effectClass = 'damage';
            break;
        case 'atk-up':
            effectClass = 'atk-up';
            break;
        case 'def-up':
            effectClass = 'def-up';
            break;
        default:
            effectClass = '';
    }

    // 宝物图片飘字（仅显示宝物图片或名称，不显示emoji）
    const nameEl = document.createElement('div');
    nameEl.className = 'treasure-effect';
    if (tDef && tDef.icon) {
        // 只显示宝物图片
        const img = document.createElement('img');
        img.src = tDef.icon;
        img.style.cssText = 'width:32px;height:32px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(255,215,0,0.9));';
        img.onerror = function() {
            nameEl.textContent = `【${treasureName}】`;
        };
        nameEl.appendChild(img);
    } else {
        nameEl.textContent = `【${treasureName}】`;
    }
    effectDiv.appendChild(nameEl);

    // 动画结束后移除
    setTimeout(() => {
        if (effectDiv.parentNode) {
            effectDiv.parentNode.removeChild(effectDiv);
        }
        if (callback) callback();
    }, 1000);
}

/**
 * 构建宝物触发上下文（异步版本，支持动画回调）
 * @param {Object} extra - 额外参数
 * @returns {Object} context 对象
 */
function buildTreasureContext(extra = {}) {
    return {
        addLog: addBattleLog,
        calcDamage,
        getAliveUnits,
        showDamageNumber,
        showTreasureEffect,
        triggerOnDeath,
        triggerOnEnemyDeath,
        ...extra,
    };
}

/**
 * 伤害修正：武圣增伤10%
 * @param {Object} unit - 攻击者
 * @param {number} dmg - 原始伤害
 * @returns {number} 修正后伤害
 */
function applyTreasureDamageModifier(unit, dmg) {
    if (!unit.treasures) return dmg;
    const treasureDefs = gameData.getTreasureList();
    for (const tid of unit.treasures) {
        if (!tid || !treasureDefs[tid]) continue;
        if (tid === 'wusheng') {
            dmg = Math.floor(dmg * 1.1);
        }
    }
    return dmg;
}

/**
 * 检查角色是否拥有指定宝物
 */
function hasTreasure(unit, treasureId) {
    return unit.treasures && unit.treasures.includes(treasureId);
}

/**
 * 对角色装备的所有宝物，按指定时点触发效果（异步版本）
 * @param {Object} unit - 拥有宝物的角色
 * @param {string} timing - 时点类型 (on_turn_start / passive / on_death / on_any_death / on_hit / on_skill / on_damage_dealt / on_kill / on_pugong)
 * @param {Object} extraCtx - 额外上下文参数
 * @param {Function} callback - 所有宝物效果执行完毕后的回调
 */
function triggerTreasures(unit, timing, extraCtx = {}, callback) {
    if (!unit || (timing !== 'on_death' && !unit.alive)) {
        if (callback) callback();
        return;
    }
    if (!unit.treasures || unit.treasures.length === 0) {
        if (callback) callback();
        return;
    }

    const treasureDefs = gameData.getTreasureList();
    // 筛选出符合条件的宝物
    const matchingTreasures = unit.treasures.filter(tid =>
        tid && treasureDefs[tid] && treasureDefs[tid].type === timing
    );

    if (matchingTreasures.length === 0) {
        if (callback) callback();
        return;
    }

    // 逐个触发宝物效果（串行执行，等待动画完成）
    let index = 0;

    function triggerNext() {
        // 延迟100ms再发动宝物
        setTimeout(() => {
            if (index >= matchingTreasures.length) {
                if (callback) callback();
                return;
            }

            const tid = matchingTreasures[index++];
            const tDef = treasureDefs[tid];

            // 根据宝物的 effectType 显示动画
            const effectType = tDef.effectType || 'default';
            showTreasureEffect(unit, tid, effectType, () => {
                // 动画结束后执行效果
                const ctx = buildTreasureContext({ unit, ...extraCtx });
                if (typeof tDef.effect === 'function') {
                    tDef.effect(ctx);
                }
                // 宝物效果执行后立即更新UI，确保血条/状态即时反馈
                updateBattleUI();
                // 等待效果执行后，继续下一个
                setTimeout(triggerNext, 100);
            });
        }, 100);
    }

    triggerNext();
}

/**
 * 回合开始时触发宝物（异步）
 */
function triggerOnTurnStart(unit, callback) {
    triggerTreasures(unit, 'on_turn_start', {}, callback);
}

/**
 * 战斗开始时触发被动宝物（异步）
 */
function triggerBattleStartPassive(unit, callback) {
    triggerTreasures(unit, 'passive', {}, callback);
}

/**
 * 角色阵亡时触发亡语（异步）
 */
function triggerOnDeath(unit, killer, callback) {
    if (!unit || !unit.treasures) {
        if (callback) callback();
        return;
    }
    const treasureDefs = gameData.getTreasureList();
    const matchingTreasures = unit.treasures.filter(tid =>
        tid && treasureDefs[tid] && treasureDefs[tid].type === 'on_death'
    );

    if (matchingTreasures.length === 0) {
        if (callback) callback();
        return;
    }

    let index = 0;

    function triggerNext() {
        if (index >= matchingTreasures.length) {
            if (callback) callback();
            return;
        }

        const tid = matchingTreasures[index++];
        const tDef = treasureDefs[tid];

        showTreasureEffect(unit, tid, 'damage', () => {
            const ctx = buildTreasureContext({ unit, killer });
            if (typeof tDef.effect === 'function') {
                tDef.effect(ctx);
            }
            // 亡语效果执行后立即更新UI
            updateBattleUI();
            setTimeout(triggerNext, 100);
        });
    }

    triggerNext();
}

/**
 * 敌方角色阵亡时触发（异步，遍历对方存活角色）
 */
function triggerOnEnemyDeath(deadUnit, killer, callback) {
    const bs = battleState;
    if (!bs) {
        if (callback) callback();
        return;
    }

    const friendlySide = deadUnit.side === 'player' ? 'enemy' : 'player';
    const friendlies = getAliveUnits(friendlySide);

    // 触发 on_any_death 时点
    let index = 0;

    function triggerNext() {
        if (index >= friendlies.length) {
            // 触发击杀者的 on_kill 时点
            if (killer && killer.alive) {
                triggerTreasures(killer, 'on_kill', { deadUnit, killer }, callback);
            } else {
                if (callback) callback();
            }
            return;
        }

        const f = friendlies[index++];
        triggerTreasures(f, 'on_any_death', { deadUnit, killer }, triggerNext);
    }

    triggerNext();
}

/**
 * 被攻击时触发（异步）
 */
function triggerOnHit(unit, attacker, callback) {
    triggerTreasures(unit, 'on_hit', { attacker }, callback);
}

/**
 * 串行触发多个目标的被攻击宝物（延迟触发用）
 * @param {Array} targets - 需要触发on_hit的目标数组
 * @param {Object} attacker - 攻击者
 * @param {Function} callback - 全部完成后的回调
 */
function triggerPendingOnHits(targets, attacker, callback) {
    if (!targets || targets.length === 0) {
        if (callback) callback();
        return;
    }
    let index = 0;
    function processNext() {
        if (index >= targets.length) {
            if (callback) callback();
            return;
        }
        const t = targets[index++];
        triggerOnHit(t, attacker, processNext);
    }
    processNext();
}

/**
 * 使用技能后触发（异步）
 */
function triggerOnSkill(unit, targets, energyCost, isRecover, callback) {
    triggerTreasures(unit, 'on_skill', { targets, energyCost, isRecover }, callback);
}

/**
 * 造成伤害后触发（异步）
 */
function triggerOnDamageDealt(unit, target, callback) {
    triggerTreasures(unit, 'on_damage_dealt', { target }, callback);
}

/**
 * 处理状态持续时间检查：封印、无敌、禁疗、眩晕
 * 逻辑：
 * 1. 如果标记为 permanent，不处理。
 * 2. 如果 ownerSide 匹配当前行动方：
 *    - 如果有 turnsLeft，则 turnsLeft--。
 *    - 如果 turnsLeft 减为 0，则清除状态。
 */
function processStatusTurns(side) {
    const bs = battleState;
    if (!bs) return;

    const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u && u.alive);
    
    allUnits.forEach(u => {
        // 辅助函数：处理单个状态的回合递减
        const handleStatusTick = (statusKey, ownerKey, permanentKey, logMsg, cssClass) => {
            // 如果状态不存在，或处于永久状态，跳过
            if (!u[statusKey] || u[permanentKey]) return;

            // 只有当施加者阵营与当前行动阵营一致时，才计数
            if (u[ownerKey] === side) {
                // 获取剩余回合数，默认为 1 (兼容旧逻辑：如果没有设置 turnsLeft，视为持续1回合)
                let left = u[statusKey + 'TurnsLeft'] !== undefined ? u[statusKey + 'TurnsLeft'] : 1;
                
                left--; // 经过了一轮，减1

                if (left <= 0) {
                    // 回合数耗尽，清除状态
                    u[statusKey] = false;
                    u[ownerKey] = null;
                    u[statusKey + 'TurnsLeft'] = 0;
                    addBattleLog(logMsg);
                    
                    // 移除 CSS
                    if (cssClass) {
                        const slotEl = document.querySelector(`.battle-unit[data-side="${u.side}"][data-slot="${u.slotIndex}"]`);
                        if (slotEl) slotEl.classList.remove(cssClass);
                    }
                } else {
                    // 更新剩余回合数
                    u[statusKey + 'TurnsLeft'] = left;
                    // 可选：可以在这里添加日志提示还剩几回合，或者在UI上显示
                    // addBattleLog(`${u.name} 的${logMsg.split('的')[1]}还剩 ${left} 回合。`);
                }
            }
        };

        // 1. 处理封印 (Seal)
        // 注意：permanentlySealed 是原有字段，这里我们复用 logic
        if (u.sealed && !u.permanentlySealed) {
             handleStatusTick('sealed', 'sealOwner', 'sealPermanent', `${u.name} 的封印已解除！`, 'sealed');
        }

        // 2. 处理无敌 (Invincible)
        if (u.invincible) {
            handleStatusTick('invincible', 'invincibleOwnerSide', 'invinciblePermanent', `${u.name} 的【无敌】状态结束了。`, 'invincible-effect');
        }

        // 3. 处理禁疗 (Heal Block)
        if (u.healBlocked) {
            handleStatusTick('healBlocked', 'healBlockOwnerSide', 'healBlockPermanent', `${u.name} 的【禁疗】状态结束了。`, 'heal-blocked-effect');
        }

        // 4. 处理眩晕 (Stun)
        if (u.stunned) {
            handleStatusTick('stunned', 'stunOwner', 'stunPermanent', `${u.name} 从【眩晕】中恢复！`, 'stunned');
        }
    });
}
/**
 * 通用行动后突破效果处理器 (支持普攻和技能)
 * @param {Object} actor - 发起行动的角色
 * @param {Array} targets - 行动的目标列表
 * @param {String} triggerType - 触发类型 ('on_pugong_hit' 或 'on_skill_hit')
 * @param {Function} callback - 完成后的回调
 */
function handlePostSkillBreakthroughEffects(actor, targets, triggerType, callback) {
    if (!actor || !actor.buff) {
        if (callback) callback();
        return;
    }

    const library = window.BREAKTHROUGH_BUFF_LIBRARY || {};
    let effectsToProcess = [];

    // 1. 收集所有匹配的突破被动效果
    const passiveIds = actor.buff.filter(b => typeof b === 'string');
    
    passiveIds.forEach(effectId => {
        const def = library[effectId];
        if (def && def.type === triggerType) {
            // 判定几率
            if (Math.random() < (def.chance || 1.0)) {
                // 如果是命中类效果，通常作用于目标
                if (targets && targets.length > 0) {
                    targets.forEach(t => {
                        if (t.alive) {
                            effectsToProcess.push({ def, targetUnit: t, effectId: effectId });
                        }
                    });
                } else {
                    // 如果没有目标（比如全体buff），作用于自己
                    effectsToProcess.push({ def, targetUnit: actor, effectId: effectId });
                }
            }
        }
    });

    if (effectsToProcess.length === 0) {
        if (callback) callback();
        return;
    }

    // 2. 执行队列
    let index = 0;
    function processNextEffect() {
        if (index >= effectsToProcess.length) {
            if (callback) callback();
            return;
        }

        const item = effectsToProcess[index++];
        const effectDef = item.def;
        const unit = item.targetUnit; 
        const effectType = effectDef.effect;
        
        // 【关键】从 effectId 提取持续回合数 (如 stun_2 -> 2)
        const durationMatch = item.effectId.match(/_(\d+)$/);
        const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

        addBattleLog(`${unit.name} 触发了突破效果：${effectDef.desc}`);

        // --- 具体效果实现 ---

        // A. 控制类：眩晕
        if (effectType.startsWith('stun_')) {
            if (unit && unit.alive) {
                unit.stunned = true;
                unit.stunOwner = actor.side;
                unit.stunnedTurnsLeft = duration;
                unit.stunPermanent = false;
                addBattleLog(`${unit.name} 被【眩晕】了，持续 ${duration} 回合！`);
                const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
                if (slotEl) slotEl.classList.add('stunned');
            }
            setTimeout(processNextEffect, 100);
        }
        // B. 控制类：封印
        else if (effectType.startsWith('seal_')) {
            if (unit && unit.alive) {
                unit.sealed = true;
                unit.sealOwner = actor.side;
                unit.sealedTurnsLeft = duration;
                unit.sealPermanent = false;
                addBattleLog(`${unit.name} 被【封印】了，持续 ${duration} 回合！`);
                const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
                if (slotEl) slotEl.classList.add('sealed');
            }
            setTimeout(processNextEffect, 100);
        }
        // C. 控制类：中毒 (Poison)
        else if (effectType === 'poison') {
            if (unit && unit.alive) {
                if (!unit.poisonStacks) unit.poisonStacks = [];
                const poisonCoeff = effectDef.value || 0.05;
                unit.poisonStacks.push({
                    coeff: poisonCoeff,
                    atkRef: actor.atk, // 记录施加者攻击力
                    sourceSide: actor.side
                });
                addBattleLog(`${unit.name} 陷入了【中毒】状态！(层数: ${unit.poisonStacks.length})`);
                const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
                if (slotEl) slotEl.classList.add('poisoned');
            }
            setTimeout(processNextEffect, 100);
        }
        // D. 其他效果 (如减能 drain_energy_1 等，可根据需要继续添加)
        else if (effectType.startsWith('drain_energy_')) {
             const amount = parseInt(effectType.split('_')[2]) || 1;
             if (unit && unit.alive) {
                 unit.energy = Math.max(0, unit.energy - amount);
                 addBattleLog(`${unit.name} 降低了 ${amount} 点能量`);
                 updateBattleUI();
             }
             setTimeout(processNextEffect, 100);
        }
        // E. 无敌/禁疗等状态 (如果需要技能后给自己加状态，也可以在这里处理)
        else if (effectType.startsWith('apply_invincible')) {
             unit.invincible = true;
             unit.invincibleOwnerSide = actor.side;
             unit.invincibleTurnsLeft = duration;
             unit.invinciblePermanent = false;
             addBattleLog(`${unit.name} 获得了【无敌】状态，持续 ${duration} 回合！`);
             const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
             if (slotEl) slotEl.classList.add('invincible-effect');
             setTimeout(processNextEffect, 100);
        }
        else if (effectType.startsWith('apply_heal_block')) {
             unit.healBlocked = true;
             unit.healBlockOwnerSide = actor.side;
             unit.healBlockedTurnsLeft = duration;
             unit.healBlockPermanent = false;
             addBattleLog(`${unit.name} 被【禁疗】了，持续 ${duration} 回合！`);
             const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
             if (slotEl) slotEl.classList.add('heal-blocked-effect');
             setTimeout(processNextEffect, 100);
        }
        else {
            console.warn(`[Battle] Unhandled breakthrough effect: ${effectType}`);
            setTimeout(processNextEffect, 50);
        }
    }

    processNextEffect();
}

/**
 * 通用行动后突破效果处理器
 * @param {Object} actor - 发起行动的角色
 * @param {Array} targets - 行动的目标列表
 * @param {String} triggerType - 触发类型 ('on_pugong_hit' 或 'on_skill_hit')
 * @param {Function} callback - 完成后的回调
 */
function handlePostActionBreakthroughEffects(actor, targets, triggerType, callback) {
    if (!actor || !actor.buff) { if(callback) callback(); return; }
    
    const library = window.BREAKTHROUGH_BUFF_LIBRARY || {};
    let effectsToProcess = [];

    actor.buff.forEach(effectId => {
        const def = library[effectId];
        if (def && def.type === triggerType) {
            if (Math.random() < (def.chance || 1.0)) {
                // 如果是命中类效果，通常作用于目标；如果是自身增益，作用于 actor
                // 这里简化处理：假设 on_xxx_hit 都是作用于 targets
                let targetUnit = actor; // 默认作用于自己
                
                if (triggerType.includes('_hit')) {
                    // 命中类：作用于传入的 targets (敌人)
                    if (targets && targets.length > 0) {
                         targets.forEach(t => {
                             if(t.alive) effectsToProcess.push({ def, targetUnit: t, effectId });
                         });
                    }
                } else if (triggerType === 'on_hit_self') {
                    // 受击类：效果通常作用于“攻击者”(targets[0])，或者是给自己加Buff
                    // 这里需要根据 effectDef.effect 的具体内容判断
                    // 例如：add_self_energy_1 -> 作用于 actor
                    // 例如：stun_source_1 -> 作用于 targets[0]
                    
                    if (def.effect.includes('source')) {
                        // 反弹类效果
                        const source = targets && targets.length > 0 ? targets[0] : null;
                        if (source && source.alive) {
                            effectsToProcess.push({ def, targetUnit: source, effectId, isSource: true });
                        }
                    } else {
                        // 自身增益类
                        effectsToProcess.push({ def, targetUnit: actor, effectId });
                    }
                } else {
                    // 行动结束类：作用于自己
                    effectsToProcess.push({ def, targetUnit: actor, effectId });
                }
            }
        }
    });

    if (effectsToProcess.length === 0) {
        if (callback) callback();
        return;
    }

    // 2. 执行队列 (复用之前的逻辑结构)
    let index = 0;
    function processNextEffect() {
        if (index >= effectsToProcess.length) {
            if (callback) callback();
            return;
        }

        const item = effectsToProcess[index++];
        const effectDef = item.def;
        const unit = item.targetUnit; 
        const effectType = effectDef.effect;
        
        // 【关键】从 effectId 提取持续回合数 (如 stun_2 -> 2)
        const durationMatch = item.effectId.match(/_(\d+)$/);
        const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

        addBattleLog(`${unit.name} 触发了突破效果：${effectDef.desc}`);

        // --- 具体效果实现 (复用并扩展之前的 switch case) ---

        // A. 控制类：眩晕
        if (effectType.startsWith('stun_')) {
            if (unit && unit.alive) {
                unit.stunned = true;
                unit.stunOwner = actor.side;
                unit.stunnedTurnsLeft = duration;
                unit.stunPermanent = false;
                addBattleLog(`${unit.name} 被【眩晕】了，持续 ${duration} 回合！`);
                const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
                if (slotEl) slotEl.classList.add('stunned');
            }
            setTimeout(processNextEffect, 100);
        }
        // B. 控制类：封印
        else if (effectType.startsWith('seal_')) {
            if (unit && unit.alive) {
                unit.sealed = true;
                unit.sealOwner = actor.side;
                unit.sealedTurnsLeft = duration;
                unit.sealPermanent = false;
                addBattleLog(`${unit.name} 被【封印】了，持续 ${duration} 回合！`);
                const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
                if (slotEl) slotEl.classList.add('sealed');
            }
            setTimeout(processNextEffect, 100);
        }
        // C. 控制类：中毒 (Poison)
        else if (effectType === 'poison') {
            if (unit && unit.alive) {
                if (!unit.poisonStacks) unit.poisonStacks = [];
                const poisonCoeff = effectDef.value || 0.05;
                unit.poisonStacks.push({
                    coeff: poisonCoeff,
                    atkRef: actor.atk, // 记录施加者攻击力
                    sourceSide: actor.side
                });
                addBattleLog(`${unit.name} 陷入了【中毒】状态！(层数: ${unit.poisonStacks.length})`);
                const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
                if (slotEl) slotEl.classList.add('poisoned');
            }
            setTimeout(processNextEffect, 100);
        }
        // ... 之前的眩晕、封印、中毒逻辑 ...

        // F. 受击回能 (add_self_energy_1)
        else if (effectType === 'add_self_energy_1') {
            if (unit && unit.alive) {
                unit.energy = Math.min(8, unit.energy + 1);
                addBattleLog(`${unit.name} 因【受击】恢复了1点能量`);
                updateBattleUI();
            }
            setTimeout(processNextEffect, 100);
        }
        
        // G. 受击反晕攻击者 (stun_source_1)
        // 注意：在 on_hit_self 语境下，targetUnit 是受害者(unit)，但效果要作用于 攻击者(attacker)
        // 我们的通用函数里 item.targetUnit 默认是 unit (受害者)。
        // 对于 stun_source，我们需要特殊处理：作用于 attacker。
        else if (effectType === 'stun_source_1') {
            // 这里的 unit 是受害者。我们需要找到攻击者。
            // 由于 handlePostActionBreakthroughEffects 的第二个参数 targets 传的是 [attacker]
            // 所以我们可以从 targets 里拿，或者在调用时特殊处理。
            // 修正：在 applyDamage 调用时，我们传的是 [attacker] 作为 targets。
            // 但在 handlePostActionBreakthroughEffects 内部，对于 on_hit_self，
            // 我们通常希望效果作用于“来源”。
            
            // 简单做法：在通用函数里，如果 effect 包含 source，则作用于 targets[0] (即攻击者)
            const sourceUnit = targets && targets.length > 0 ? targets[0] : null;
            if (sourceUnit && sourceUnit.alive) {
                 sourceUnit.stunned = true;
                 sourceUnit.stunOwner = unit.side; // 记录是谁晕的
                 sourceUnit.stunnedTurnsLeft = 1; // 默认1回合，或者从 effectId 解析
                 sourceUnit.stunPermanent = false;
                 addBattleLog(`${sourceUnit.name} 被 ${unit.name} 的【反震】眩晕了！`);
                 const slotEl = document.querySelector(`.battle-unit[data-side="${sourceUnit.side}"][data-slot="${sourceUnit.slotIndex}"]`);
                 if (slotEl) slotEl.classList.add('stunned');
            }
            setTimeout(processNextEffect, 100);
        }

        // H. 受击给队友加能 (add_energy_team_1)
        else if (effectType === 'add_energy_team_1') {
             // 需要获取队友列表
             const teamSide = unit.side;
             const teammates = getAliveUnits(teamSide).filter(u => u !== unit);
             teammates.forEach(tm => {
                 tm.energy = Math.min(8, tm.energy + 1);
             });
             addBattleLog(`${unit.name} 的【羁绊】使全队增加了1能量`);
             updateBattleUI();
             setTimeout(processNextEffect, 100);
        }

        // D. 其他效果 (如减能 drain_energy_1 等，可根据需要继续添加)
        else if (effectType.startsWith('drain_energy_')) {
             const amount = parseInt(effectType.split('_')[2]) || 1;
             if (unit && unit.alive) {
                 unit.energy = Math.max(0, unit.energy - amount);
                 addBattleLog(`${unit.name} 降低了 ${amount} 点能量`);
                 updateBattleUI();
             }
             setTimeout(processNextEffect, 100);
        }
        else {
            console.warn(`[Battle] Unhandled breakthrough effect in Pugong: ${effectType}`);
            setTimeout(processNextEffect, 50);
        }
    }

    processNextEffect();
}

/**
 * 计算角色的总吸血比例
 * @param {Object} unit - 角色对象
 * @param {string} triggerType - 触发类型: 'pugong' 或 'skill'
 * @returns {number} 吸血比例 (0-1)
 */
function getLifestealPercent(unit, triggerType) {
    if (!unit || !unit.buff) return 0;
    
    const library = window.BREAKTHROUGH_BUFF_LIBRARY || {};
    let totalPercent = 0;

    // 遍历角色身上的所有 buff ID
    unit.buff.forEach(buffId => {
        // 如果 buffId 是字符串，去库裡查定义
        if (typeof buffId === 'string') {
            const def = library[buffId];
            if (def && def.type === 'lifesteal' && def.trigger === triggerType) {
                totalPercent += (def.percent || 0);
            }
        } 
        // 兼容旧版：如果 buff 是直接嵌入的对象（虽然推荐用 ID 引用）
        else if (typeof buffId === 'object' && buffId.type === 'lifesteal' && buffId.trigger === triggerType) {
            totalPercent += (buffId.percent || 0);
        }
    });

    // 限制最大吸血比例为 100% (可选，防止溢出)
    return Math.min(totalPercent, 1.0);
}

/**
 * 结算所有单位的中毒伤害
 * 通常在 processStatusTurns 之后或 nextTurn 开始时调用
 */
function applyPoisonDamage() {
    const bs = battleState;
    if (!bs) return;

    const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u && u.alive);

    allUnits.forEach(unit => {
        if (unit.poisonStacks && unit.poisonStacks.length > 0) {
            let totalDmg = 0;
            
            // 计算每一层中毒的伤害
            unit.poisonStacks.forEach(stack => {
                // 假设中毒伤害基于【当前攻击力】或【最大生命值】？
                // 通常中毒基于最大生命值或固定值。
                // 根据你的配置 value: 0.05，这里假设是基于【攻击者】当时的攻击力？
                // 但攻击者可能已经不在了。
                // 简化方案：基于【中毒者】的最大生命值百分比，或者固定数值。
                // 既然配置里写的是 "系数为攻击力5%"，我们需要存储施法者当时的 ATK，或者简化为基于中毒者 MaxHP。
                
                // 方案 A：基于中毒者 MaxHP (更稳定)
                // const dmg = Math.floor(unit.maxHp * stack.coeff);
                
                // 方案 B：基于施法者 ATK (需要在施加时存储 atk 值)
                // 让我们修改施加逻辑，存储当时的 atk
                const atkRef = stack.atkRef || 100; //  fallback
                const dmg = Math.floor(atkRef * stack.coeff);
                
                totalDmg += dmg;
            });

            if (totalDmg > 0) {
                // 直接扣血，不触发受击特效（通常中毒不触发刚烈等）
                unit.hp -= totalDmg;
                addBattleLog(`${unit.name} 因【中毒】受到了 ${totalDmg} 点伤害`);
                showDamageNumber(unit, totalDmg, false); // 红色飘字
                
                // 检查死亡
                if (unit.hp <= 0) {
                    unit.hp = 0;
                    unit.alive = false;
                    addBattleLog(`${unit.name} 因中毒阵亡！`);
                    // 触发亡语等
                    triggerOnDeath(unit, null, () => {}); 
                }
            }
        }
    });
    
    updateBattleUI();
}

