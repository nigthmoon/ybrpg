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
        const hp = Number(data.hp) || 100;
        const atk = Number(data.atk) || 10;
        const def = Number(data.def) || 0;
        const spe = Number(data.spe) || 0;

        let activeTreasures = [];
        // 优先使用传入的 treasures 数据（我方队伍已由 mode.js 预处理）
        if (data.treasures && Array.isArray(data.treasures)) {
            const treasureDefs = gameData.getTreasureList();
            activeTreasures = data.treasures.filter(tid => tid && treasureDefs[tid]);
        } else {
            // 兼容逻辑：如果没有传入 treasures，尝试从全局数据读取（主要用于敌方或旧代码兼容）
            // 注意：敌方单位通常不需要读取玩家的 treasureEquipData，此处保留原逻辑但修正 key
            const lookupKey = data.instanceId || data.id;
            const charTreasures = (window.treasureEquipData && window.treasureEquipData[lookupKey]) || [null, null, null, null, null, null];
            const treasureDefs = gameData.getTreasureList();
            activeTreasures = charTreasures.filter(tid => tid && treasureDefs[tid]);
        }

        return {
            id: data.id,
            instanceId: data.instanceId || data.id,
            name: data.name || '未知单位',
            side,
            slotIndex,
            
            rank: rank,
            template: template,

            maxHp: hp,
            hp: hp,
            atk: atk,
            def: def,
            spe: spe,
            energy: 0,
            buff: Array.isArray(data.buff) ? [...data.buff] : [],
            skills: Array.isArray(data.skills) ? [...data.skills] : ['attack1', null, null],
            alive: true,
            treasures: activeTreasures,
            sealed: false,
            sealTurns: 0,
            sealOwner: null,
            permanentlySealed: false,
            extraTurn: false,
        };
    };

    const playerUnits = playerTeam.map((u, i) => buildUnit(u, 'player', i));
    const enemyUnits = enemyTeam.map((u, i) => buildUnit(u, 'enemy', i));

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
    };

    // 渲染战斗界面
    renderBattleView();
    // 播放开场
    showBattleIntro();
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
    if (!firstActor && !secondActor) {
        bs.round++;
        resetActedSlots();
        addBattleLog(`—— 第 ${bs.round} 轮 ——`);
        // 新轮开始，处理封印轮数（先手方视角）
        processSealTurns(bs.firstSide);
        updateBattleUI();
        nextTurn();
        return;
    }

    // 先手方有角色则行动，否则空过
    if (firstActor) {
        bs.actedSlots[bs.firstSide].add(firstActor.slotIndex);
        bs.currentTurnSide = bs.firstSide;
        bs.currentTurnIndex = firstActor.slotIndex;
        updateBattleUI()
        // 回合开始时触发宝物（涉猎、洛神），动画结束后继续
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
        updateBattleUI()
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
function calcDamage(attacker, defValue, coefficient, extraEnergy = 0) {
    let baseDmg = Math.floor(attacker.atk * coefficient);
    // 超过4能量，每多一点增伤10%
    if (extraEnergy > 0) {
        baseDmg = Math.floor(baseDmg * (1 + extraEnergy * 0.1));
    }
    let finalDmg = baseDmg - defValue;
    return Math.max(1, finalDmg);
}

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
    
    // 根据技能类型获取系数
    let coefficient = 0;
    let isRecover = false;
    const skillKey = Object.keys(contentList[skillType]).find(k => k === skillId);
    if (skillKey && contentList[skillType][skillKey].content) {
        const src = contentList[skillType][skillKey].content.toString();
        const match = src.match(/player\.atk\s*\*\s*([\d.]+)/);
        if (match) coefficient = parseFloat(match[1]);
    }

    if (skillKey && contentList[skillType][skillKey].content) {
        const src = contentList[skillType][skillKey].content.toString();
        isRecover = src.includes('rpg_recover');
    }

    const extraEnergy = Math.max(0, energyCost - 4);

    // 使用异步序列处理每个目标
    let targetIndex = 0;
    // 收集需要触发on_hit的目标（延迟到技能特效播完后统一触发）
    const pendingOnHitTargets = [];

    function processNextTarget() {
        if (targetIndex >= targets.length) {
            // 所有目标处理完毕，先触发技能后宝物效果，再触发被攻击宝物
            triggerOnSkill(actor, targets, energyCost, isRecover, () => {
                // 串行触发所有待处理的on_hit
                triggerPendingOnHits(pendingOnHitTargets, actor, callback);
            });
            return;
        }

        const t = targets[targetIndex++];
        if (!t.alive) {
            processNextTarget();
            return;
        }

        if (isRecover) {
            let healAmount = Math.floor(actor.atk * coefficient);
            if (extraEnergy > 0) {
                healAmount = Math.floor(healAmount * (1 + extraEnergy * 0.1));
            }
            const actualHeal = Math.min(healAmount, t.maxHp - t.hp);
            t.hp += actualHeal;
            addBattleLog(`${t.name} 回复了 ${actualHeal} 生命值`);
            showDamageNumber(t, actualHeal, true);
            updateBattleUI();
            processNextTarget();
        } else {
            let dmg = calcDamage(actor, t.def, coefficient, extraEnergy);
            dmg = applyTreasureDamageModifier(actor, dmg);
            addBattleLog(`${t.name} 受到了 ${dmg} 点伤害`);
            // 延迟触发on_hit，等技能宝物效果后再触发
                        // 延迟触发on_hit，等技能宝物效果后再触发
            applyDamage(t, dmg, actor, false, false, () => {
                // 【修复】触发造成伤害后的宝物效果（如狂骨）
                triggerOnDamageDealt(actor, t, () => {
                    // 记录需要触发on_hit的目标（仅存活且未被记录的）
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

    // 解析系数
    let coefficient = 1.0;
    const src = sData.content ? sData.content.toString() : '';
    const match = src.match(/player\.atk\s*\*\s*([\d.]+)/);
    if (match) coefficient = parseFloat(match[1]);

    const isRecover = src.includes('rpg_recover');

    // 检查是否拥有绝情宝物（普攻改为真实伤害）
    const hasJueqing = hasTreasure(actor, 'jueqing');

    // 处理每个目标，使用异步序列
    let targetIndex = 0;
    // 收集需要触发on_hit的目标（延迟到普攻特效播完后统一触发）
    const pendingOnHitTargets = [];

    function processNextTarget() {
        if (targetIndex >= targets.length) {
            // 所有目标处理完毕，触发被攻击宝物
            triggerPendingOnHits(pendingOnHitTargets, actor, callback);
            return;
        }

        const t = targets[targetIndex++];
        if (!t || !t.alive) {
            processNextTarget();
            return;
        }

        if (isRecover) {
            // 治疗普攻
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
            let dmg = calcDamage(actor, t.def, coefficient);
            dmg = applyTreasureDamageModifier(actor, dmg);
            addBattleLog(`${t.name} 受到了 ${dmg} 点伤害`);
            // 延迟触发on_hit，等普攻特效播完后再触发
                        // 延迟触发on_hit，等普攻特效播完后再触发
            applyDamage(t, dmg, actor, false, false, () => {
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
    // 受击+1能量（如果还活着，非真实伤害时）
    if (!isTrueDamage) {
        unit.energy = Math.min(8, unit.energy + 1);
    }
    // 触发被攻击宝物（刚烈）—— 仅非特殊普攻触发
    if (attacker && !isSpecialPugong && !isTrueDamage && !deferOnHit) {
        triggerOnHit(unit, attacker, () => {
            if (callback) callback();
        });
    } else {
        if (callback) callback();
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
function aiSelectTargets(actor, skillData, enemySide, friendlySide) {
    // 1. 确定目标阵营
    const isRecover = skillData.content ? skillData.content.toString().includes('rpg_recover') : false;
    const targetSide = isRecover ? friendlySide : enemySide;

    // 2. 调用通用解析器
    // 注意：resolveSkillTargets 需要知道 actor 以便处理 exclude_self 或列偏好
    return resolveSkillTargets(skillData, actor, targetSide);
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
 * 通用目标解析器
 * 根据技能配置、施法者和战场状态，计算出合法的目标列表
 * @param {Object} skillData - 技能数据 (包含 target: [mode, pref, count?, exclude?])
 * @param {Object} actor - 施法者
 * @param {string} intendedSide - 'player' | 'enemy' (由技能是否治疗决定)
 * @returns {Array} 目标单位数组
 */
function resolveSkillTargets(skillData, actor, intendedSide) {
    if (!skillData || !skillData.target) return [];
    
    const mode = skillData.target[0];      // e.g., 'one', 'manual_multi', 'exclude_self'
    const pref = skillData.target[1] || 'first'; // e.g., 'lowest_hp', 'highest_atk', 'random'
    const count = skillData.target[2] || 1; // 可选：指定数量
    const extraParam = skillData.target[3]; // 可选：额外参数

    let candidates = getAliveUnits(intendedSide);
    if (candidates.length === 0) return [];

    // 1. 预处理：过滤无效目标 (如排除自身)
    if (mode === 'exclude_self') {
        candidates = candidates.filter(u => u.slotIndex !== actor.slotIndex || u.side !== actor.side);
    }
    
    // 如果过滤后无目标，返回空
    if (candidates.length === 0) return [];

    // 2. 根据模式选择目标
    switch (mode) {
        case 'all':
            return candidates;
        
        case 'one':
        case 'exclude_self': // 排除自身后选一个
            return selectSingleTarget(candidates, pref, actor);

        case 'manual_multi':
            // 随机选择 N 个不同目标
            return shuffleArray([...candidates]).slice(0, Math.min(count, candidates.length));

        case 'row':
            return selectRowTargets(candidates, pref, actor);

        case 'column':
            return selectColumnTargets(candidates, pref, actor);
            
        case 'lowest_hp_multi':
            // 选择血量最低的 N 个
            return [...candidates].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp).slice(0, count);

        default:
            // 默认 fallback 到第一个
            return [candidates[0]];
    }
}
/**
 * AI/自动战斗专用的单体目标选择逻辑（带权重）
 */
function selectSingleTarget(candidates, pref, actor) {
    if (candidates.length === 0) return [];
    
    // 如果是随机，直接返回
    if (pref === 'random') {
        return [candidates[Math.floor(Math.random() * candidates.length)]];
    }

    // 评分系统：分数越高越优先
    let bestTarget = candidates[0];
    let maxScore = -Infinity;

    candidates.forEach(target => {
        let score = 0;
        
        // 基础偏好评分
        if (pref === 'lowest') {
            // 血量百分比越低分越高
            score += (1 - target.hp / target.maxHp) * 100;
        } else if (pref === 'highest') {
             // 血量百分比越高分越高 (用于驱散等)
             score += (target.hp / target.maxHp) * 100;
        } else if (pref === 'first') {
            // 优先前排/左侧 (简化逻辑：slotIndex 越小分越高)
            score += (10 - target.slotIndex); 
        }

        // 额外权重：如果目标是当前行动者的直接对面 (同列)，加分
        if (Math.abs(target.slotIndex - actor.slotIndex) % 3 === 0 && Math.floor(target.slotIndex/3) !== Math.floor(actor.slotIndex/3)) {
             score += 5; // 轻微偏好对位
        }

        if (score > maxScore) {
            maxScore = score;
            bestTarget = target;
        }
    });

    return [bestTarget];
}

// 辅助：洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 辅助：行选择逻辑复用
function selectRowTargets(candidates, pref, actor) {
    // 简单实现：如果 pref 是 last，优先后排，否则优先前排
    // 这里可以结合 actor 的位置优化，暂时保持原逻辑
    const front = candidates.filter(u => u.slotIndex < 3);
    const back = candidates.filter(u => u.slotIndex >= 3);
    
    if (pref === 'last') return back.length > 0 ? back : front;
    return front.length > 0 ? front : back;
}

// 辅助：列选择逻辑复用
function selectColumnTargets(candidates, pref, actor) {
    // 优先选择 actor 所在列，如果没有则随机列
    const actorCol = actor.slotIndex % 3;
    const colTargets = candidates.filter(u => u.slotIndex % 3 === actorCol);
    
    if (colTargets.length > 0) return colTargets;
    
    // 如果本列没人，随机选其他列
    const cols = [[], [], []];
    candidates.forEach(u => cols[u.slotIndex % 3].push(u));
    const validCols = cols.filter(c => c.length > 0);
    if (validCols.length > 0) {
        return validCols[Math.floor(Math.random() * validCols.length)];
    }
    return [];
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
 * 根据技能的target模式确定特效类型
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
    const isRecover = sData.content ? sData.content.toString().includes('rpg_recover') : false;

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

    // 隐藏底部导航
    const bottomBar = document.querySelector('.ybrpg-bottom-bar');
    if (bottomBar) bottomBar.style.display = 'none';

    // 显示战斗视图
    hideOtherViews('battle-view');
    // 添加 AI 托管按钮（位于我方区域下方居中）
const autoBtnDiv = document.createElement('div');
autoBtnDiv.style.cssText = 'display:flex;justify-content:center;margin-top:6px;width:100%;';

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
autoBtnDiv.appendChild(autoBtn);
// 将按钮插入到我方区域之后（field末尾）
field.appendChild(autoBtnDiv);
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
/** 根据技能类型和ID获取对应的特效emoji */
function getSkillEmoji(skillType, skillId) {
    const sData = contentList[skillType] && contentList[skillType][skillId];
    if (!sData || !sData.target) return '🔥';

    const targetMode = sData.target[0];
    const aiPref = sData.target[1];
    const isRecover = sData.content ? sData.content.toString().includes('rpg_recover') : false;

    if (isRecover) return '🧪';

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
    if (!sData) return;

    // 判断技能是否为恢复类技能
    const isRecover = sData.content ? sData.content.toString().includes('rpg_recover') : false;
    // 解析目标配置：模式、数量等
    const targetConfig = sData.target || ['one', 'first'];
    const mode = targetConfig[0];
    const count = targetConfig[2] || 1;

    // 初始化全局目标选择状态对象
    targetSelection = { 
        actor, 
        skillType, 
        skillId, 
        energyCost, 
        targetMode: mode, 
        targetCount: count,
        isRecover, 
        selectedTargets: [] // 用于存储手动多选的目标
    };

    // --- 自动释放的情况 (无需玩家逐个点选) ---
    if (['all', 'row', 'column', 'manual_multi', 'lowest_hp_multi'].includes(mode)) {
        addBattleLog(`请选择触发目标 (技能将自动判定范围)`);
        highlightSelectableTargets(mode, isRecover);
        return;
    }

    // --- 手动选择情况 ---
    if (mode === 'one' || mode === 'exclude_self') {
        addBattleLog('请点击选择目标');
        highlightSelectableTargets('one', isRecover);
    } 
    else if (mode === 'manual_multi') {
        // 新增：手动多选模式
        addBattleLog(`请依次选择 ${count} 个目标 (已选: 0/${count})`);
        highlightSelectableTargets('manual_multi', isRecover);
    }
}


function highlightSelectableTargets(mode, isRecover) {
    const side = isRecover ? 'player' : 'enemy';
    const aliveUnits = getAliveUnits(side);

    aliveUnits.forEach(u => {
        // 排除自身逻辑 (如果需要)
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

function showBattleResult(winner) {
    const bs = battleState;
    hidePlayerActionUI();

    const container = document.getElementById('battle-view');

    const overlay = document.createElement('div');
    overlay.className = 'battle-result-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'battle-result-dialog';

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
    if (winner === 'player') {
        const isBoss = bs.eventType === 'boss';
        const baseGold = 50 + (bs.enemyCount || 1) * 30;
        const goldScale = bs.goldScale || 1.0;
        const goldReward = Math.floor((isBoss ? baseGold * 2 : baseGold) * goldScale);
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'battle-result-stats';
        rewardDiv.style.color = '#ffd700';
        rewardDiv.style.marginTop = '8px';
        const scaleText = goldScale > 1 ? ` (x${goldScale})` : '';
        rewardDiv.innerHTML = `💰 金币奖励: +${goldReward}${scaleText}`;
        dialog.appendChild(rewardDiv);
    }

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
 * 封印轮数检查：每轮开始时，检查封印是否到期
 * 附加buff X轮：从施加者的回合算起，下X轮的该回合开始此buff失效
 */
function processSealTurns(side) {
    const bs = battleState;
    if (!bs) return;

    const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u && u.alive);
    allUnits.forEach(u => {
        if (u.sealed && !u.permanentlySealed && u.sealOwner === side) {
            u.sealTurns--;
            if (u.sealTurns <= 0) {
                u.sealed = false;
                u.sealOwner = null;
                addBattleLog(`${u.name} 的封印已解除！`);
            }
        }
    });
}
