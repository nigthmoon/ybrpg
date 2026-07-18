//此文件作废
//此文件作废
//此文件作废
//此文件作废
//此文件作废
//此文件作废
//此文件作废

// ====== 夜白旅程 - 纯净战斗核心系统 (整理版) ======

// ====== 1. 全局状态声明 ======

/**@type {battleState}战斗信息 */
let battleState = null;
/** ====== 目标选择 ====== */
let targetSelection = null;
/**全局锁，防止重入 */
let isProcessing = false; // 全局锁，防止重入

// ====== 2. 基础工具函数 ======

/**
 * 
 * @param {*} msg 战斗信息记录 
 * @returns 战斗信息记录 
 */
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
    console.log('[Battle]', msg);
}

/**
 * 
 * @returns 战斗画面更新
 */
function updateBattleUI() {
    const bs = battleState;
    if (!bs) return;

    const allUnits = [...bs.playerUnits, ...bs.enemyUnits].filter(u => u);
    allUnits.forEach(unit => {
        const slot = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
        if (!slot) return;

        if (!unit.alive) slot.classList.add('dead');
        else slot.classList.remove('dead');

        if (unit.sealed || unit.permanentlySealed) slot.classList.add('sealed');
        else slot.classList.remove('sealed');

        if (bs.currentTurnSide === unit.side && bs.currentTurnIndex === unit.slotIndex && unit.alive) {
            slot.classList.add('active-turn');
        } else {
            slot.classList.remove('active-turn');
        }

        const hpFill = slot.querySelector('.battle-hp-fill');
        if (hpFill) {
            const pct = Math.max(0, unit.hp / unit.maxHp * 100);
            hpFill.style.width = pct + '%';
            if (pct > 60) hpFill.style.background = '#44cc44';
            else if (pct > 30) hpFill.style.background = '#ccaa22';
            else hpFill.style.background = '#cc3333';
        }

        const hpText = slot.querySelector('.battle-hp-text');
        if (hpText) hpText.textContent = `${unit.hp}/${unit.maxHp}`;

        const pips = slot.querySelectorAll('.energy-pip');
        pips.forEach((pip, i) => {
            pip.classList.toggle('filled', i < unit.energy);
            pip.classList.toggle('skill-ready', i < 4 && unit.energy >= 4);
        });
    });
}

/**
 * 
 * @param {*} unit 目标
 * @param {*} value 数值
 * @param {boolean} isHeal 类型，通常治疗为true，显示绿色（以后可能会有其他改动
 * @returns 显示伤害数字
 */
function showDamageNumber(unit, value, isHeal) {
    const slotEl = document.querySelector(`.battle-unit[data-side="${unit.side}"][data-slot="${unit.slotIndex}"]`);
    if (!slotEl) return;
    const float = document.createElement('div');
    float.className = 'damage-float ' + (isHeal ? 'heal' : 'damage');
    float.style.color = isHeal ? '#00ff00' : '#ff0000';
    float.textContent = (isHeal ? '+' : '-') + value;
    float.style.position = 'absolute';
    float.style.left = '50%';
    float.style.top = '50%';
    float.style.transform = 'translate(-50%, -50%)';
    float.style.fontSize = '20px';
    float.style.fontWeight = 'bold';
    float.style.zIndex = '100';
    slotEl.appendChild(float);
    setTimeout(() => float.remove(), 800);
}

/**
 * 暂时不清晰，疑似是进入某角色回合或者游戏结算时调用，最终会清除高亮
 */
function hidePlayerActionUI() {
    const panel = document.getElementById('battle-action-panel');
    if (panel) panel.remove();
    clearTargetHighlights();
}

/**
 * 清除高亮
 */
function clearTargetHighlights() {
    document.querySelectorAll('.battle-unit.selectable').forEach(el => {
        el.classList.remove('selectable', 'target-selected');
        el.onclick = null;
    });
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 判断该阵营的存活角色数
 */
function getAliveUnits(side) {
    const units = side === 'player' ? battleState.playerUnits : battleState.enemyUnits;
    return units.filter(u => u && u.alive);
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 判断该阵营是否全灭
 */
function isSideDefeated(side) {
    return getAliveUnits(side).length === 0;
}

/**
 * 
 * @param {string} side 为player或不为player
 * @returns 检索该阵营的首个可未行动角色
 */
function findNextActor(side) {
    const bs = battleState;
    const units = side === 'player' ? bs.playerUnits : bs.enemyUnits;
    for (let i = 0; i < 6; i++) {
        if (bs.actedSlots[side].has(i)) continue;
        const unit = units[i];
        if (unit && unit.alive) return unit;
    }
    return null;
}

/**
 * 生成等待记录的已行动的角色对象
 */
function resetActedSlots() {
    const bs = battleState;
    bs.actedSlots = { player: new Set(), enemy: new Set() };
}

/**
 * 
 * @param {array} array 填入角色组成的数组
 * @returns 随机重新排序（其他随机选目标会直接调用其前随机数值个角色未目标）
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ====== 3. 核心结算模块 ======

/**
 * 
 * @param {*} attacker 攻击者
 * @param {*} defender 被攻击者
 * @param {*} coefficient 攻击系数
 * @param {*} extraEnergy 因额外消耗能量导致的技能增伤
 * @returns 计算最终伤害值
 */
function calculateDamage(attacker, defender, coefficient, extraEnergy = 0) {
    const atk = Number(attacker.atk) || 0;
    const def = Number(defender.def) || 0;
    const coeff = Number(coefficient) || 1.0;
    
    let baseDmg = Math.floor(atk * coeff);
    if (extraEnergy > 0) {
        baseDmg = Math.floor(baseDmg * (1 + extraEnergy * 0.1));
    }
    let finalDmg = baseDmg - def;
    return Math.max(1, Math.floor(finalDmg));
}

/**
 * 
 * @param {*} target 受伤角色
 * @param {*} dmg 伤害值
 * @param {*} attacker 伤害来源
 * @param {*} callback 后续触发的事件
 * @returns 结算伤害事件
 */
function applyDamage(target, dmg, attacker, callback) {
    if (!target || !target.alive) {
        if (callback) callback();
        return;
    }

    target.hp -= dmg;
    addBattleLog(`${target.name} 受到 ${dmg} 点伤害`);
    showDamageNumber(target, dmg, false); 
    updateBattleUI();

    if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
        addBattleLog(`${target.name} 阵亡！`);
        
        if (attacker && attacker.alive) {
            attacker.energy = Math.min(8, attacker.energy + 1);
            addBattleLog(`${attacker.name} 击杀目标，恢复 1 能量`);
        }
        
        updateBattleUI();
        setTimeout(() => {
            if (callback) callback();
        }, 500);
    } else {
        target.energy = Math.min(8, target.energy + 1);
        updateBattleUI();
        if (callback) callback();
    }
}

/**
 * 
 * @param {*} target 被治疗者
 * @param {*} healAmount 治疗数值
 * @param {*} callback 治疗后续事件
 * @returns 结算治疗事件
 */
function applyHeal(target, healAmount, callback) {
    if (!target || !target.alive) {
        if (callback) callback();
        return;
    }

    if (target.healBlocked) {
        addBattleLog(`${target.name} 处于禁疗状态，无法被治疗`);
        if (callback) callback();
        return;
    }

    const maxHp = Number(target.maxHp) || 1;
    const currentHp = Number(target.hp) || 0;
    // const actualHeal = Math.min(healAmount, maxHp - currentHp);
    
    if (healAmount > 0) {
        target.hp += Math.min(healAmount, maxHp - currentHp);
        addBattleLog(`${target.name} 恢复了 ${healAmount} 点生命值`);
        showDamageNumber(target, healAmount, true); 
        updateBattleUI();
    }

    setTimeout(() => {
        if (callback) callback();
    }, 300);
}

// ====== 4. 行动执行模块 ======

/**
 * 
 * @param {*} actor 执行者
 * @param {*} targets 目标
 * @param {*} callback 后续
 * @returns 执行普攻事件
 */
function executePugong(actor, targets, callback) {
    if (!targets || targets.length === 0) {
        if (callback) callback();
        return;
    }

    actor.energy = Math.min(8, actor.energy + 1);
    updateBattleUI();
    addBattleLog(`${actor.name} 发动普攻`);

    let index = 0;
	const skillId = actor.skills[0] || 'attack1';
	const sData = (window.contentList && window.contentList.pugong && window.contentList.pugong[skillId]);
    const isRecover = (sData && sData.isRecover === true);
	const coeff = (sData && sData.coefficient) ? Number(sData.coefficient) : 1.0;
    function processNextTarget() {
        if (index >= targets.length) {
            if (callback) callback();
            return;
        }

        const target = targets[index++];
        if (!target || !target.alive) {
            processNextTarget();
            return;
        }
		if (isRecover) {
            // --- 治疗逻辑 ---
            let healAmt = Math.floor(actor.atk * coeff);
            // 普攻通常不享受能量增伤，如果需要可以加上: * (1 + extraEnergy * 0.1)
            applyHeal(target, healAmt, processNextTarget);
        } else {
            // --- 伤害逻辑 ---
            const dmg = calculateDamage(actor, target, coeff, 0);
            applyDamage(target, dmg, actor, processNextTarget);
        }
    }

    processNextTarget();
}

/**
 * 
 * @param {*} actor 执行者
 * @param {*} skillType 技能类型（常规技能或者必杀）
 * @param {*} skillId 技能id
 * @param {*} targets 目标集体
 * @param {*} energyCost 能量消耗
 * @param {*} callback 技能后续
 * @returns 执行技能事件
 */
function executeSkill(actor, skillType, skillId, targets, energyCost, callback) {
    if (!targets || targets.length === 0) {
        if (callback) callback();
        return;
    }

    actor.energy = Math.max(0, actor.energy - energyCost);
    updateBattleUI();
    
    const sData = (window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId]);
    const skillName = sData ? sData.name : skillId;
    addBattleLog(`${actor.name} 使用了【${skillName}】`);

    const coeff = (sData && sData.coefficient) ? Number(sData.coefficient) : 1.0;
    const isRecover = (sData && sData.isRecover === true);
    const extraEnergy = Math.max(0, energyCost - 4);

    let index = 0;
    function processNextTarget() {
        if (index >= targets.length) {
            if (callback) callback();
            return;
        }

        const target = targets[index++];
        if (!target || !target.alive) {
            processNextTarget();
            return;
        }

        if (isRecover) {
            let healAmt = Math.floor(actor.atk * coeff);
            if (extraEnergy > 0) {
                healAmt = Math.floor(healAmt * (1 + extraEnergy * 0.1));
            }
            applyHeal(target, healAmt, processNextTarget);
        } else {
            const dmg = calculateDamage(actor, target, coeff, extraEnergy);
            applyDamage(target, dmg, actor, processNextTarget);
        }
    }

    processNextTarget();
}

// ====== 5. 战斗循环控制 ======

/**
 * 控制游戏进入下一回合
 * @returns 控制游戏进入下一回合
 */
function nextTurn() {
    if (isProcessing) return;
    
    try {
        isProcessing = true;
		/**@type {battleState} */
        const bs = battleState;
        if (!bs || bs.phase === 'ended') { isProcessing = false; return; }
		//判断某一方是否团灭决定胜负
        if (isSideDefeated('player')) { endBattle('enemy'); isProcessing = false; return; }
        if (isSideDefeated('enemy')) { endBattle('player'); isProcessing = false; return; }
		/**后手 */
        const secondSide = bs.firstSide === 'player' ? 'enemy' : 'player';
        
        // let actor = findNextActor(bs.firstSide);
        // // 2. 寻找双方可行动角色
        // const firstActor = findNextActor(bs.firstSide);
        // const secondActor = findNextActor(secondSide);

        // let isSecondSide = false;
        // if (!actor) {
        //     actor = findNextActor(secondSide);
        //     isSecondSide = true;
        // }

        // if (!actor) {
        //     endRound();
        //     isProcessing = false;
        //     return;
        // }
		
        // 2. 确定下一个行动方（轮流切换）
        let nextSide = null;
        const lastSide = bs.currentTurnSide; // 上一次行动的阵营
        
        if (!lastSide) {
            // 第一回合，选择先手方
            nextSide = bs.firstSide;
        } else {
            // 尝试切换到另一方
            const otherSide = lastSide === bs.firstSide ? secondSide : bs.firstSide;
            const otherActor = findNextActor(otherSide);
            if (otherActor) {
                nextSide = otherSide;
            } else {
                // 另一方没有可行动角色，继续当前方
                nextSide = lastSide;
            }
        }
        
        // 3. 寻找下一个行动角色
        let nextActor = findNextActor(nextSide);
        if (!nextActor) {
            // 当前阵营没有可行动角色，尝试另一方（如果之前没有尝试过）
            if (lastSide && nextSide === lastSide) {
                const otherSide = lastSide === bs.firstSide ? secondSide : bs.firstSide;
                nextActor = findNextActor(otherSide);
                if (nextActor) {
                    nextSide = otherSide;
                }
            }
            // 如果仍然没有找到，说明双方都没有可行动角色，结束本轮
            if (!nextActor) {
                endRound();
                isProcessing = false;
                return;
            }
        }
        
        // 4. 标记该角色已行动（立即标记，防止重复选取）
        bs.actedSlots[nextSide].add(nextActor.slotIndex);
        bs.currentTurnSide = nextSide;
        bs.currentTurnIndex = nextActor.slotIndex;
        

        updateBattleUI();

        if (nextActor.stunned) {
            addBattleLog(`${nextActor.name} 眩晕，跳过回合`);
            setTimeout(() => { 
				isProcessing = false; 
				afterAction(); 
			}, 600);
            return;
        }

        if (nextSide === 'player') {
            bs.phase = 'player_action';
            showPlayerActionUI(nextActor);
        } else {
            bs.phase = 'enemy_action';
            executeAITurn(nextActor);
        }
        
        isProcessing = false;

    } catch (e) {
        console.error('[Loop] Error in nextTurn:', e);
        isProcessing = false;
    }
}

/**
 * 
 * @returns 回合结束
 */
function afterAction() {
    if (isProcessing) return;

    try {
        isProcessing = true;
        const bs = battleState;
        if (bs.phase === 'ended') { isProcessing = false; return; }

        if (isSideDefeated('player')) { endBattle('enemy'); isProcessing = false; return; }
        if (isSideDefeated('enemy')) { endBattle('player'); isProcessing = false; return; }

        const unit = bs.currentTurnSide === 'player'
            ? bs.playerUnits[bs.currentTurnIndex]
            : bs.enemyUnits[bs.currentTurnIndex];

        // 检查额外回合
        if (unit && unit.alive && (unit.extraTurnCount > 0 || unit.extraTurn)) {
            if (unit.extraTurnCount > 0) unit.extraTurnCount--;
            else unit.extraTurn = false;
            
            addBattleLog(`${unit.name} 获得额外回合！`);
            updateBattleUI();
            
            if (unit.side === 'player') {
                bs.phase = 'player_action';
                showPlayerActionUI(unit);
            } else {
                bs.phase = 'enemy_action';
                executeAITurn(unit);
            }
            isProcessing = false;
            return;
        }

        isProcessing = false;
        nextTurn();

    } catch (e) {
        console.error('[Loop] Error in afterAction:', e);
        isProcessing = false;
    }
}

/**
 * 一轮结束进入下一轮
 */
function endRound() {
    const bs = battleState;
    bs.round++;
    resetActedSlots();
    addBattleLog(`—— 第 ${bs.round} 轮 ——`);
    updateBattleUI();
    
    setTimeout(() => {
        nextTurn();
    }, 100);
}

/**
 * 
 * @param {*} actor 当前行动角色
 * @returns ai行动
 */
function executeAITurn(actor) {
    const action = aiChooseAction(actor); 
    if (!action || action.targets.length === 0) {
        addBattleLog(`${actor.name} 无法行动`);
        setTimeout(() => afterAction(), 600);
        return;
    }
    
    battleState.phase = 'animating';
    
    if (action.type === 'pugong') {
        executePugong(actor, action.targets, () => {
            setTimeout(() => afterAction(), 400);
        });
    } else {
        executeSkill(actor, action.skillType, action.skillId, action.targets, action.energyCost, () => {
            setTimeout(() => afterAction(), 400);
        });
    }
}

/**
 * 
 * @param {*} actor 当前行动的角色
 * @param {*} action 
 * @returns 玩家行动
 */
function executePlayerTurn(actor, action) {
    const bs = battleState;
    if (!bs) return;

    bs.phase = 'animating';
    hidePlayerActionUI();
    
    if (action.type === 'pugong') {
        executePugong(actor, action.targets, () => {
            setTimeout(() => afterAction(), 400);
        });
    } else {
        executeSkill(actor, action.skillType, action.skillId, action.targets, action.energyCost, () => {
            setTimeout(() => afterAction(), 400);
        });
    }
}

/**
 * 显示战斗介绍并处理战斗开始时的逻辑。
 * 
 * 该函数负责初始化战斗状态，触发所有单位的战斗开始被动效果，
 * 并在完成后进入下一个回合。如果战斗已经开始，则直接延迟进入下一回合。
 * 
 */
function showBattleIntro() {
    const bs = battleState;
    resetActedSlots();
    addBattleLog(`—— 第 1 轮 ——`);
    addBattleLog(`${bs.firstSide === 'player' ? '我方' : '敌方'}先手`);
    
    setTimeout(() => {
        nextTurn();
    }, 500);
}

/**
 * 结算战斗
 * @param {string} winner 显示胜者，player为玩家胜，否则玩家败
 * 
 */
function endBattle(winner) {
    const bs = battleState;
    bs.phase = 'ended';
    addBattleLog(winner === 'player' ? '战斗胜利！' : '战斗失败...');

    setTimeout(() => {
        showBattleResult(winner);
    }, 800);
}

// ====== 6. 玩家操作面板 ======

/**
 * 
 * @param {*} skillType 输入技能类型（普通技能或必杀技能）
 * @param {*} skillId 输入技能的id便于调用
 * @returns 确认该技能的符号
 */
function getSkillEmoji(skillType, skillId) {
    const sData = window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId];
    if (!sData || !sData.target) return '🔥';
    let isRecover = false;
    if (sData.isRecover === true) isRecover = true;
    if (isRecover) return '🧪';
    const targetMode = sData.target[0];
    if (targetMode === 'row') return '⚔️';
    if (targetMode === 'column') return '⚡';
    return '🔥';
}

/**
 * 
 * @param {*} actor 当前回合角色
 * @returns 展示当前角色的行动可选择项
 */
function showPlayerActionUI(actor) {
    hidePlayerActionUI(); 
    
    if (window.autoBattle && actor && actor.alive) {
        const action = aiChooseAction(actor);
        if (action && action.targets.length > 0) {
            battleState.phase = 'animating';
            executePlayerTurn(actor, action);
            return;
        }
    }

    const slot = document.querySelector(`.battle-unit[data-side="${actor.side}"][data-slot="${actor.slotIndex}"]`);
    if (!slot) {
        setTimeout(() => showPlayerActionUI(actor), 50);
        return;
    }

    const panel = document.createElement('div');
    panel.className = 'battle-action-overlay';
    panel.id = 'battle-action-panel';

    const pugongId = actor.skills[0] || 'attack1';
    const pugongBtn = document.createElement('button');
    pugongBtn.className = 'action-btn pugong-btn';
    pugongBtn.textContent = '普攻 ' + getSkillEmoji('pugong', pugongId);
    pugongBtn.onclick = (e) => {
        e.stopPropagation();
        enterTargetSelection(actor, 'pugong', pugongId, 0);
    };
    panel.appendChild(pugongBtn);

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
                toast(isSealed ? '已被封印' : '能量不足', 'warning');
            };
        }
        panel.appendChild(skillBtn);
    }

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
                toast(isSealed ? '已被封印' : '能量不足', 'warning');
            };
        }
        panel.appendChild(spBtn);
    }

    slot.appendChild(panel);
}

// ====== 7. 目标选择逻辑 ======

/**
 * 
 * @param {*} actor 当前行动角色
 * @param {*} skillType 技能类型（普攻，技能，必杀）
 * @param {*} skillId 技能id（以便调用该技能数据）
 * @param {*} energyCost 能量消耗
 * @returns 选择普攻或技能后，选择目标
 */
function enterTargetSelection(actor, skillType, skillId, energyCost) {
    const sData = window.contentList && window.contentList[skillType] && window.contentList[skillType][skillId];
    if (!sData) return;

    let isRecover = false;
    if (sData.isRecover === true) isRecover = true;
    else if (sData.content && sData.content.toString().includes('rpg_recover')) isRecover = true;

    const targetSide = isRecover ? actor.side : (actor.side === 'player' ? 'enemy' : 'player');
    const targetConfig = sData.target || ['one', 'first'];
    const mode = targetConfig[0];
    const count = targetConfig[2] || 1;

    targetSelection = { 
        actor, skillType, skillId, energyCost, 
        targetMode: mode, targetCount: count,
        isRecover, targetSide, selectedTargets: [] 
    };

    if (['all', 'lowest_hp_multi'].includes(mode)) {
        const targets = resolveSkillTargets(sData, actor, targetSide);
        if (targets.length > 0) {
            const action = { type: skillType === 'pugong' ? 'pugong' : 'skill', skillType, skillId, targets, energyCost };
            executePlayerTurn(actor, action);
        } else {
            toast('没有有效目标', 'warning');
        }
        return; 
    }

    addBattleLog('请点击选择目标');
    highlightSelectableTargets(mode, isRecover, targetSide);
}

/**
 * 高亮以显示可操作的目标群体
 * @param {*} mode 技能模式，一行、一列、单体、全体等
 * @param {*} isRecover 技能类型（暂时在这个函数里没有调用）
 * @param {*} targetSide 可选择的目标群体
 */
function highlightSelectableTargets(mode, isRecover, targetSide) {
    const aliveUnits = getAliveUnits(targetSide);
    aliveUnits.forEach(u => {
        if (mode === 'exclude_self' && u.side === targetSelection.actor.side && u.slotIndex === targetSelection.actor.slotIndex) {
            return; 
        }
        const el = document.querySelector(`.battle-unit[data-side="${u.side}"][data-slot="${u.slotIndex}"]`);
        if (el) {
            el.classList.add('selectable');
            if (mode === 'manual_multi') {
                const isSelected = targetSelection.selectedTargets.some(t => t.slotIndex === u.slotIndex && t.side === u.side);
                if (isSelected) el.classList.add('target-selected');
            }
            el.onclick = () => onTargetClicked(u);
        }
    });
}

/**
 * 多选目标时，支持多选目标
 * @param {*} target 选择目标
 * @returns 
 */
function onTargetClicked(target) {
    if (!targetSelection) return;
    const ts = targetSelection;
    const side = ts.targetSide;
    
    let finalTargets = [];

    if (ts.targetMode === 'manual_multi') {
        const existingIndex = ts.selectedTargets.findIndex(t => t.slotIndex === target.slotIndex && t.side === target.side);
        if (existingIndex !== -1) {
            ts.selectedTargets.splice(existingIndex, 1);
            clearTargetHighlights();
            highlightSelectableTargets('manual_multi', ts.isRecover, ts.targetSide);
            return;
        } else {
            if (ts.selectedTargets.length < ts.targetCount) {
                ts.selectedTargets.push(target);
            } else {
                toast('已达到最大目标数量', 'warning');
                return; 
            }
        }
        clearTargetHighlights();
        highlightSelectableTargets('manual_multi', ts.isRecover, ts.targetSide);

        const allValidTargets = getAliveUnits(side).filter(u => {
             if (ts.targetMode === 'exclude_self' && u.side === ts.actor.side && u.slotIndex === ts.actor.slotIndex) return false;
             return true;
        });
        
        if (ts.selectedTargets.length === ts.targetCount || ts.selectedTargets.length >= allValidTargets.length) {
            finalTargets = [...ts.selectedTargets];
        } else {
            return; 
        }
    }
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
    else {
        finalTargets = [target];
    }

    if (finalTargets.length === 0) {
        toast('没有有效目标', 'warning');
        return;
    }

    const action = {
        type: ts.skillType === 'pugong' ? 'pugong' : 'skill',
        skillType: ts.skillType,
        skillId: ts.skillId,
        targets: finalTargets,
        energyCost: ts.energyCost,
    };

    targetSelection = null;
    clearTargetHighlights();
    executePlayerTurn(ts.actor, action);
}

// ====== 8. AI 逻辑 ======

/**
 * ai指挥当前行动角色该做什么决策
 * @param {*} actor 当前行动角色
 * @returns 格式为 { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
 */
function aiChooseAction(actor) {
    const bs = battleState;
    const enemySide = actor.side === 'player' ? 'enemy' : 'player';
    const friendlySide = actor.side;

    if (actor.sealed || actor.permanentlySealed) {
        const pugongId = actor.skills[0] || 'attack1';
        const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
        if (pData) {
            const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
            return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
        }
        const aliveEnemies = getAliveUnits(enemySide);
        return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
    }

    if (actor.energy >= 8 && actor.skills[2]) {
        const spId = actor.skills[2];
        const spData = window.contentList && window.contentList.spskill && window.contentList.spskill[spId];
        if (spData) {
            const targets = aiSelectTargets(actor, spData, enemySide, friendlySide);
            if (targets.length > 0) {
                return { type: 'skill', skillType: 'spskill', skillId: spId, targets, energyCost: actor.energy };
            }
        }
    }

    if (actor.energy >= 4 && actor.skills[1]) {
        const skillId = actor.skills[1];
        const sData = window.contentList && window.contentList.skill && window.contentList.skill[skillId];
        if (sData) {
            const targets = aiSelectTargets(actor, sData, enemySide, friendlySide);
            if (targets.length > 0) {
                return { type: 'skill', skillType: 'skill', skillId, targets, energyCost: actor.energy };
            }
        }
    }

    const pugongId = actor.skills[0] || 'attack1';
    const pData = window.contentList && window.contentList.pugong && window.contentList.pugong[pugongId];
    if (pData) {
        const targets = aiSelectTargets(actor, pData, enemySide, friendlySide);
        return { type: 'pugong', skillType: 'pugong', skillId: pugongId, targets, energyCost: 0 };
    }

    const aliveEnemies = getAliveUnits(enemySide);
    return { type: 'pugong', skillType: 'pugong', skillId: 'attack1', targets: [aliveEnemies[0]], energyCost: 0 };
}

/**
 * ai选择目标
 * @param {*} actor 当前行动角色
 * @param {*} skillData 该技能的对象
 * @param {*} enemySide 能量消耗（这里疑似没有调用
 * @param {*} friendlySide 该角色座位号？这里没有调用
 * @returns 
 */
function aiSelectTargets(actor, skillData, enemySide, friendlySide) {
    let isRecover = false;
    if (skillData.isRecover === true) isRecover = true;
    else if (skillData.content && skillData.content.toString().includes('rpg_recover')) isRecover = true;
    
    const targetSide = isRecover ? actor.side : (actor.side === 'player' ? 'enemy' : 'player');
    let candidates = getAliveUnits(targetSide);
    if (candidates.length === 0) return [];
    return resolveSkillTargets(skillData, actor, targetSide, {isRecover});
}

/**
 * 啊？看不懂，疑似根据技能模式补全所有应当被选择的合法目标
 * @param {*} skillData 技能的对象
 * @param {*} actor 行动者
 * @param {*} intendedSide 选取的目标的阵营
 * @param {*} options 啊？
 * @returns 疑似根据技能模式补全所有应当被选择的合法目标
 */
function resolveSkillTargets(skillData, actor, intendedSide, options) {
    if (!skillData || !skillData.target) return [];
    const mode = skillData.target[0];
    const pref = skillData.target[1] || 'first';
    const count = skillData.target[2] || 1;
    
    let candidates = getAliveUnits(intendedSide);
    if (candidates.length === 0) return [];

    if (mode === 'exclude_self') {
        candidates = candidates.filter(u => !(u.side === actor.side && u.slotIndex === actor.slotIndex));
    }
    if (candidates.length === 0) return [];

    switch (mode) {
        case 'all': return candidates;
        case 'one':
        case 'exclude_self':
            return [selectBestSingleTarget(candidates, pref, actor, options)];
        case 'manual_multi':
            return shuffleArray([...candidates]).slice(0, Math.min(count, candidates.length));
        case 'row':
            return selectRowTargetsSmart(candidates, pref, actor);
        case 'column':
            return selectColumnTargetsSmart(candidates, pref, actor);
        default:
            return [candidates[0]];
    }
}
/**
 * 看不懂
 * @param {*} candidates 
 * @param {*} pref 
 * @param {*} actor 
 * @param {*} options 
 * @returns 
 */
function selectBestSingleTarget(candidates, pref, actor, options = {}) {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    if (pref === 'random') return candidates[Math.floor(Math.random() * candidates.length)];
    return candidates[0]; // 简化版：默认第一个
}
/**
 * ？
 * @param {*} candidates 
 * @param {*} pref 
 * @param {*} actor 
 * @returns 
 */

function selectRowTargetsSmart(candidates, pref, actor) { return [candidates[0]]; }
/**
 * ？
 * @param {*} candidates 
 * @param {*} pref 
 * @param {*} actor 
 * @returns 
 */
function selectColumnTargetsSmart(candidates, pref, actor) { return [candidates[0]]; }

// ====== 9. 结算界面 ======

/**
 * 战斗结算
 * @param {*} winner 胜者，player或其他
 * @returns 
 */
function showBattleResult(winner) {
    const bs = battleState;
    hidePlayerActionUI();
    const container = document.getElementById('battle-view');
    if (!container) return;

    const overlay = document.createElement('div');
    overlay.className = 'battle-result-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'battle-result-dialog';

    const title = document.createElement('div');
    title.className = 'battle-result-title';
    title.textContent = winner === 'player' ? '战斗胜利' : '战斗失败';
    title.style.color = winner === 'player' ? '#ffd700' : '#ff4444';
    dialog.appendChild(title);

    const playerAlive = getAliveUnits('player').length;
    const enemyAlive = getAliveUnits('enemy').length;
    const stats = document.createElement('div');
    stats.className = 'battle-result-stats';
    stats.textContent = `我方存活: ${playerAlive} | 敌方存活: ${enemyAlive} | 总轮数: ${bs.round}`;
    dialog.appendChild(stats);

    if (winner === 'player') {
        const goldReward = bs.expectedGold || 0;
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'battle-result-stats';
        rewardDiv.style.color = '#ffd700';
        rewardDiv.style.marginTop = '8px';
        rewardDiv.innerHTML = `💰 金币奖励: +${goldReward}`;
        dialog.appendChild(rewardDiv);
    }

    const btn = document.createElement('button');
    btn.className = 'ybrpg-btn';
    btn.textContent = '返回';
    btn.onclick = () => {
        battleState = null;
        targetSelection = null;
        container.style.display = 'none';
        const bottomBar = document.querySelector('.ybrpg-bottom-bar');
        if (bottomBar) bottomBar.style.display = 'flex';
        
        if (winner === 'player' && bs.onWin) bs.onWin();
        else if (winner === 'enemy' && bs.onLose) bs.onLose();
        else {
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

// ====== 10. 初始化与 UI 渲染 (保留原有逻辑) ======

const BREAKTHROUGH_LIB = window.BREAKTHROUGH_BUFF_LIBRARY || {};

/**
 * 根据输入的突破信息编译成对应的突破能力对象
 * @param {*} data 突破能力对象或者待调用的字符串
 * @param {*} index 该突破能力对应的序号
 * @returns 编译后的突破对象
 */
function normalizeBreakthroughData(data,index) {
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
    if (typeof data === 'string') {
        const libData = BREAKTHROUGH_LIB[data];
        if (libData) {
			libData.level=index;
			return JSON.parse(JSON.stringify(libData));
		}
        else {
            console.warn(`[BattleInit] Breakthrough ID '${data}' not found.`);
            return null;
        }
    }
    if (Array.isArray(data)) {
        console.error(`[BattleInit] Array format for breakthrough NOT supported.`);
        return null;
    }
    return null;
}

/**
 * 战斗开始，初始化信息
 * @param {*} playerTeam 
 * @param {*} enemyTeam 
 * @param {*} options 
 */
function startBattle(playerTeam, enemyTeam, options = {}) {
    const buildUnit = (data, side, slotIndex) => {
        if (!data || !data.id) return null;
        
        let rank = data.rank;
        let template = data.template;
        if (!rank || !template) {
            const baseDef = window.characterList && window.characterList[data.id];
            if (baseDef) {
                rank = rank || baseDef.rank || 'common';
                template = template || baseDef.template || 'balanced';
            } else {
                rank = rank || 'common';
                template = template || 'balanced';
            }
        }

        const rawTupoList = data.tupoList || [];
        const tupolevel = data.tupolevel || 0;
        const normalizedTupoList = rawTupoList.map((item,index) => normalizeBreakthroughData(item,index));
        
        let bonusAtk = 0, bonusDef = 0, bonusHp = 0, bonusEnergy = 0;
        let passiveBuffs = [];
        let teamBuffs = [];
        let teamPercentBuffs = [];

        for (let i = 0; i <= tupolevel; i++) {
            if (!normalizedTupoList[i]) continue;
            const buff = normalizedTupoList[i];
            const type = buff.type;
            if (type === 'self_stat_flat') {
                if (buff.atk) bonusAtk += Number(buff.atk);
                if (buff.def) bonusDef += Number(buff.def);
                if (buff.hp) bonusHp += Number(buff.hp);
            } else if (type === 'self_energy') {
                bonusEnergy += Number(buff.value || 0);
            } else if (type === 'passive_effect') {
                if (buff.effectId) passiveBuffs.push(buff.effectId);
            } else if (type === 'team_stat_flat') {
                teamBuffs.push(buff);
            } else if (type === 'team_stat_percent') {
                teamPercentBuffs.push(buff);
            }
        }

        let finalHp = Number(data.hp) || 100;
        let finalAtk = Number(data.atk) || 10;
        let finalDef = Number(data.def) || 0;
        let finalSpe = Number(data.spe) || 0;
        let finalEnergy = 2;

        finalAtk += bonusAtk;
        finalDef += bonusDef;
        finalHp += bonusHp;
        finalEnergy += bonusEnergy;

        let activeTreasures = [];
        if (data.treasures && Array.isArray(data.treasures)) {
            const treasureDefs = window.gameData && window.gameData.getTreasureList();
            if (treasureDefs) activeTreasures = data.treasures.filter(tid => tid && treasureDefs[tid]);
        } else {
            const lookupKey = data.instanceId || data.id;
            const charTreasures = (window.treasureEquipData && window.treasureEquipData[lookupKey]) || [null, null, null, null, null, null];
            const treasureDefs = window.gameData && window.gameData.getTreasureList();
            if (treasureDefs) activeTreasures = charTreasures.filter(tid => tid && treasureDefs[tid]);
        }

        const unit = {
            id: data.id,
            instanceId: data.instanceId || data.id,
            name: data.name || '未知单位',
            side, slotIndex, rank, template,
            maxHp: finalHp, hp: finalHp,
            atk: finalAtk, def: finalDef, spe: finalSpe,
            energy: Math.min(8, finalEnergy),
            buff: Array.isArray(data.buff) ? [...data.buff] : [],
            skills: Array.isArray(data.skills) ? [...data.skills] : ['attack1', null, null],
            alive: true,
            treasures: activeTreasures,
            sealed: false, sealTurns: 0, sealOwner: null, permanentlySealed: false,
            extraTurnCount: 0,
            tupoList: normalizedTupoList, tupolevel: tupolevel,
            _teamBuffs: teamBuffs, _teamPercentBuffs: teamPercentBuffs,
            hasAttacked: false
        };

        if (passiveBuffs.length > 0) unit.buff.push(...passiveBuffs);
        return unit;
    };

    const playerUnits = playerTeam.map((u, i) => buildUnit(u, 'player', i));
    const enemyUnits = enemyTeam.map((u, i) => buildUnit(u, 'enemy', i));

    applyTeamBreakthroughBuffs(playerUnits);
    applyTeamBreakthroughBuffs(enemyUnits);

    const playerSpeSum = playerUnits.filter(u => u).reduce((s, u) => s + u.spe, 0);
    const enemySpeSum = enemyUnits.filter(u => u).reduce((s, u) => s + u.spe, 0);
    let firstSide = 'player';
    if (enemySpeSum > playerSpeSum) firstSide = 'enemy';

	/**@type {battleState}战斗信息 */
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

    renderBattleView();
    showBattleIntro();
}

/**
 * 根据角色突破等级，初始化这些角色的基本数值
 * @param {*} units 传入角色数组
 */
function applyTeamBreakthroughBuffs(units) {
    let teamFlatBonus = { atk: 0, def: 0, hp: 0 };
    let teamPercentBonus = { atk: 0, def: 0, hp: 0 };

    units.forEach(u => {
        if (!u) return;
        if (u._teamBuffs && Array.isArray(u._teamBuffs)) {
            u._teamBuffs.forEach(b => {
                if (b.atk) teamFlatBonus.atk += Number(b.atk);
                if (b.def) teamFlatBonus.def += Number(b.def);
                if (b.hp) teamFlatBonus.hp += Number(b.hp);
            });
        }
        if (u._teamPercentBuffs && Array.isArray(u._teamPercentBuffs)) {
            u._teamPercentBuffs.forEach(b => {
                if (b.atk) teamPercentBonus.atk += Number(b.atk);
                if (b.def) teamPercentBonus.def += Number(b.def);
                if (b.hp) teamPercentBonus.hp += Number(b.hp);
            });
        }
        delete u._teamBuffs;
        delete u._teamPercentBuffs;
    });

    units.forEach(u => {
        if (!u) return;
        u.atk += teamFlatBonus.atk;
        u.def += teamFlatBonus.def;
        u.maxHp += teamFlatBonus.hp;
        u.hp += teamFlatBonus.hp;
    });

    units.forEach(u => {
        if (!u) return;
        const atkMult = 1 + teamPercentBonus.atk;
        const defMult = 1 + teamPercentBonus.def;
        const hpMult = 1 + teamPercentBonus.hp;
        u.atk = Math.floor(u.atk * atkMult);
        u.def = Math.floor(u.def * defMult);
        u.maxHp = Math.floor(u.maxHp * hpMult);
        u.hp = Math.floor(u.hp * hpMult);
    });
}

/**
 * 生成战斗页面
 * @returns 
 */
function renderBattleView() {
    const container = document.getElementById('battle-view');
    if (!container) return;
    container.innerHTML = '';
    const bs = battleState;

    const field = document.createElement('div');
    field.className = 'battle-field';
    field.id = 'battle-field';

    // Enemy Area
    const enemyArea = document.createElement('div');
    enemyArea.className = 'battle-side enemy-side';
    const enemyLabel = document.createElement('div');
    enemyLabel.className = 'battle-side-label';
    enemyLabel.textContent = '敌方';
    enemyArea.appendChild(enemyLabel);
    const enemyGrid = document.createElement('div');
    enemyGrid.className = 'battle-grid';
    [5, 4, 3, 2, 1, 0].forEach(idx => {
        const unit = bs.enemyUnits[idx];
        const slot = createUnitSlot(unit, 'enemy', idx);
        enemyGrid.appendChild(slot);
    });
    enemyArea.appendChild(enemyGrid);
    field.appendChild(enemyArea);

    // Divider
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

    // Player Area
    const playerArea = document.createElement('div');
    playerArea.className = 'battle-side player-side';
    const playerLabel = document.createElement('div');
    playerLabel.className = 'battle-side-label';
    playerLabel.textContent = '我方';
    playerArea.appendChild(playerLabel);
    const playerGrid = document.createElement('div');
    playerGrid.className = 'battle-grid';
    [0, 1, 2, 3, 4, 5].forEach(idx => {
        const unit = bs.playerUnits[idx];
        const slot = createUnitSlot(unit, 'player', idx);
        playerGrid.appendChild(slot);
    });
    playerArea.appendChild(playerGrid);
    field.appendChild(playerArea);

    container.appendChild(field);

    addBattleLog(`—— 第 ${bs.round} 轮 ——`);
    addBattleLog(`${bs.firstSide === 'player' ? '我方' : '敌方'}先手`);

    const bottomBar = document.querySelector('.ybrpg-bottom-bar');
    if (bottomBar) bottomBar.style.display = 'none';
    hideOtherViews('battle-view');
    
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'display:flex; flex-direction:column; align-items:center; width:100%; margin-top:10px; gap:5px;';
    
    const autoBtn = document.createElement('button');
    autoBtn.className = 'ybrpg-btn';
    autoBtn.style.cssText = 'width:auto;padding:4px 16px;font-size:12px;';
    autoBtn.textContent = window.autoBattle ? '🎮 自动战斗' : '🎮 手动战斗';
    autoBtn.id = 'battle-auto-btn';
    autoBtn.onclick = () => {
        window.autoBattle = !window.autoBattle;
        autoBtn.textContent = window.autoBattle ? '🎮 自动战斗' : '🎮 手动战斗';
        if (window.autoBattle && battleState && battleState.phase === 'player_action') {
            const currentUnit = battleState.currentTurnSide === 'player' ? battleState.playerUnits[battleState.currentTurnIndex] : null;
            if (currentUnit && currentUnit.alive) {
                const action = aiChooseAction(currentUnit);
                if (action && action.targets.length > 0) executePlayerTurn(currentUnit, action);
            }
        }
    };
    controlsDiv.appendChild(autoBtn);

    const escapeBtn = document.createElement('button');
    escapeBtn.className = 'ybrpg-btn';
    escapeBtn.style.cssText = 'width:auto;padding:4px 16px;font-size:12px;background-color:#d9534f;border-color:#d43f3a;color:#fff;';
    escapeBtn.textContent = '🏃 逃跑';
    escapeBtn.onclick = () => {
        if (window.confirmDialog) {
            window.confirmDialog('确定要放弃本次战斗吗？', () => endBattle('enemy'));
        } else {
            endBattle('enemy');
        }
    };
    controlsDiv.appendChild(escapeBtn);
    field.appendChild(controlsDiv);
    container.style.display = 'flex';
}

/**
 * 生成角色实体
 * @param {*} unit 该角色对象
 * @param {*} side 阵营
 * @param {*} slotIndex 序号
 * @returns 
 */
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

    const img = document.createElement('img');
    img.className = 'battle-unit-img';
    img.src = `/image/character/${unit.id}.jpg`;
    img.alt = unit.name;
    img.onerror = function() {
        this.onerror = function() { this.style.display = 'none'; slot.classList.add('battle-unit-noimg'); };
        this.src = `/image/character/${unit.id}.webp`;
    };
    slot.appendChild(img);
    
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'battle-unit-info';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'battle-unit-name';
    const RANK_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
    if (RANK_COLORS[unit.rank]) nameEl.style.color = RANK_COLORS[unit.rank];
    nameEl.textContent = unit.name + (unit.tupolevel ? `+${unit.tupolevel}` : '');
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
 * 预想中的真回合循环
 */
// function gotoTurn(){
// 	//游戏开始
// 	gameStart();
// 	//此处判断存活角色
// 	for(var i=0;i<6;i++){
// 		//此处执行循环
// 	}
// }
export {};