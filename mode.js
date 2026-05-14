
/**
 * 飘字提示函数 - 替代原生 alert
 * @param {string} message 提示文本
 * @param {string} type 类型: 'info'(默认) | 'success' | 'error' | 'warning'
 * @param {number} duration 显示时长(ms)，默认 1500
 */
function toast(message, type = 'info', duration = 1500) {
    let container = document.querySelector('.ybrpg-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'ybrpg-toast-container';
        container.style.zIndex = '20000';  // 高优先级，覆盖所有弹窗
        document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `ybrpg-toast ${type}`;
    toastEl.textContent = message;
    container.appendChild(toastEl);

    setTimeout(() => {
        if (toastEl.parentNode) {
            toastEl.parentNode.removeChild(toastEl);
        }
    }, duration + 800);
}


/**
 * 确认对话框函数 - 替代原生 confirm
 * @param {string} message 确认文本
 * @param {Function} onConfirm 确认回调
 * @param {Function} onCancel 取消回调（可选）
 */
function confirmDialog(message, onConfirm, onCancel) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'ybrpg-confirm-dialog';

    dialog.innerHTML = `
        <div class="ybrpg-confirm-message">${message}</div>
        <div class="ybrpg-confirm-buttons">
            <button class="ybrpg-confirm-btn cancel">取消</button>
            <button class="ybrpg-confirm-btn confirm">确认</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 关闭函数
    const close = () => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    };

    // 取消按钮
    dialog.querySelector('.cancel').onclick = () => {
        close();
        if (onCancel) onCancel();
    };

    // 确认按钮
    dialog.querySelector('.confirm').onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };

    // 点击遮罩也可关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            close();
            if (onCancel) onCancel();
        }
    };
}

/**
 * 生成唯一的角色实例ID
 * @param {string} charId 基础角色ID
 * @returns {string} 唯一实例ID
 */
function generateInstanceId(charId) {
    return `${charId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function showteam(){
    const teamView = document.getElementById('team-view');
    // 每次都重新渲染，以更新状态
    renderTeamView(teamView);

    const mainView = document.getElementById('main-view');
    if (mainView) mainView.style.display = 'none';
    if (teamView) teamView.style.display = 'flex';
}


/**
 * 渲染团队视图界面
 * 
 * 该函数负责在指定的容器元素中构建完整的团队管理界面，包括：
 * 1. 6个可拖拽的武将槽位网格
 * 2. 中部武将详情展示区域
 * 3. 底部功能导航栏（更换、培养、其他）
 * 
 * @param {HTMLElement} container - 用于承载团队视图内容的DOM容器元素
 * @returns {void}
 */
function renderTeamView(container) {
    container.innerHTML = '';

    // 创建网格容器
    const gridDiv = document.createElement('div');
    gridDiv.className = 'team-grid';
    gridDiv.id = 'team-grid';

    // 创建6个方格
    for (let i = 0; i < 6; i++) {
        const slot = document.createElement('div');
        slot.className = 'team-slot';
        slot.dataset.slotIndex = i;
        slot.draggable = true;
        renderTeamSlot(slot, i);
        // 点击方格
        slot.addEventListener('click', () => onTeamSlotClick(i));
        // 桌面端拖拽事件
        slot.addEventListener('dragstart', (e) => onSlotDragStart(e, i));
        slot.addEventListener('dragover', (e) => onSlotDragOver(e));
        slot.addEventListener('dragenter', (e) => onSlotDragEnter(e, i));
        slot.addEventListener('dragleave', (e) => onSlotDragLeave(e));
        slot.addEventListener('drop', (e) => onSlotDrop(e, i));
        slot.addEventListener('dragend', (e) => onSlotDragEnd(e));
        // 移动端触摸拖拽事件
        slot.addEventListener('touchstart', (e) => onSlotTouchStart(e, i), { passive: false });
        slot.addEventListener('touchmove', (e) => onSlotTouchMove(e), { passive: false });
        slot.addEventListener('touchend', (e) => onSlotTouchEnd(e));
        gridDiv.appendChild(slot);
    }

    // 中部区域：武将详情或空白
    const infoDiv = document.createElement('div');
    infoDiv.id = 'team-info-area';
    infoDiv.className = 'team-info-area';

    // 底部导航栏：更换 / 培养 / 其他
    const navDiv = document.createElement('div');
    navDiv.className = 'team-footer';
    navDiv.id = 'team-nav';

    const navBtns = [
        { id: 'btn-team-change', text: '更换', action: () => onTeamNavChange() },
        { id: 'btn-team-train', text: '培养', action: () => onTeamNavTrain() },
        { id: 'btn-team-other', text: '其他', action: () => { console.log('其他 - 预留接口'); } },
    ];
    navBtns.forEach(cfg => {
        const btn = document.createElement('button');
        btn.className = 'ybrpg-team-btn';
        btn.id = cfg.id;
        btn.textContent = cfg.text;
        btn.onclick = cfg.action;
        navDiv.appendChild(btn);
    });

    container.appendChild(gridDiv);
    container.appendChild(infoDiv);
    container.appendChild(navDiv);

    // 记录当前选中的方格索引
    window._selectedSlotIndex = null;
}

/**
 * 渲染单个布阵方格的内容
 * @param {HTMLElement} slotEl - 需要渲染内容的DOM元素节点
 * @param {number} index - 当前方格在队伍数组中的索引位置
 */
function renderTeamSlot(slotEl, index) {
    slotEl.innerHTML = '';
    // 修改：currentTeam 现在存储的是 instanceId
    const instanceId = window.currentTeam[index];
    
    if (instanceId && window.charBagData && window.charBagData[instanceId]) {
        const instanceData = window.charBagData[instanceId];
        const charId = instanceData.charId || instanceId; // 兼容旧数据
        const char = characterList[charId];
        
        if (!char) {
            // 如果基础角色定义丢失，显示错误
            slotEl.style.borderColor = '#f00';
            slotEl.textContent = 'Err';
            return;
        }

        const RANK_BORDER_COLORS = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
        const borderColor = RANK_BORDER_COLORS[char.rank] || '#888';

        const img = document.createElement('img');
        img.src = `./image/character/${charId}.jpg`;
        img.alt = char.name;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px;pointer-events:none;';
        
        // 图片加载失败处理：尝试加载webp格式，若再次失败则显示角色名称
        img.onerror = function() {
            this.onerror = function() {
                this.style.display = 'none';
                const p = document.createElement('div');
                p.style.cssText = 'color:#aaa;font-size:14px;display:flex;justify-content:center;align-items:center;width:100%;height:100%;';
                p.textContent = char.name;
                this.parentNode.appendChild(p);
            };
            this.src = `./image/character/${charId}.webp`;
        };

        slotEl.style.borderColor = borderColor;
        slotEl.style.overflow = 'hidden';
        slotEl.appendChild(img);

        // 名字标签
        const nameTag = document.createElement('div');
        nameTag.className = 'team-slot-name';
        nameTag.textContent = char.name;
        slotEl.appendChild(nameTag);
    } else {
        // 渲染空位状态
        slotEl.style.borderColor = '#444';
        const emptyText = document.createElement('span');
        emptyText.style.cssText = 'color:#555;font-size:12px;pointer-events:none;';
        emptyText.textContent = '空位';
        slotEl.appendChild(emptyText);
    }
}

// 刷新单个方格
function refreshTeamSlot(index) {
    const gridDiv = document.getElementById('team-grid');
    if (!gridDiv) return;
    const slotEl = gridDiv.children[index];
    if (slotEl) renderTeamSlot(slotEl, index);
}

// 刷新所有方格
function refreshAllTeamSlots() {
    const gridDiv = document.getElementById('team-grid');
    if (!gridDiv) return;
    for (let i = 0; i < 6; i++) {
        const slotEl = gridDiv.children[i];
        if (slotEl) renderTeamSlot(slotEl, i);
    }
}

// ========== 布阵交互逻辑 ==========

// 点击方格
function onTeamSlotClick(index) {
    window._selectedSlotIndex = index;
    // 修改：获取 instanceId
    const instanceId = window.currentTeam[index];
    
    if (instanceId && window.charBagData && window.charBagData[instanceId]) {
        const instanceData = window.charBagData[instanceId];
        const charId = instanceData.charId || instanceId;
        // 已有武将，在下方展示详情
        showTeamCharInfo(index, instanceId, charId);
    } else {
        // 空位，展示选将浮窗
        showCharSelectPopup(index);
    }
}

// 底部导航-更换
function onTeamNavChange() {
    const idx = window._selectedSlotIndex;
    if (idx === null || idx === undefined) {
        toast('请先选择一个方格', 'warning');
        return;
    }
    showCharSelectPopup(idx);
}

// 底部导航-培养
function onTeamNavTrain() {
    const idx = window._selectedSlotIndex;
    if (idx === null || idx === undefined) {
        toast('请先选择一个方格', 'warning');
        return;
    }
    const instanceId = window.currentTeam[idx];
    if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
        toast('当前方格为空', 'warning');
        return;
    }
    const instData = window.charBagData[instanceId];
    const charId = instData.charId || instanceId;
    const char = characterList[charId];
    if (!char) {
        toast('角色数据异常', 'error');
        return;
    }
    // 调用背包中的角色详情弹窗（带升级功能）
    showBagCharDetailPopup(instanceId, charId);
}


// 在team-info-area中展示选中武将的详情
// 修改参数：增加 instanceId
function showTeamCharInfo(slotIndex, instanceId, charId) {
    const infoArea = document.getElementById('team-info-area');
    if (!infoArea) return;
    infoArea.innerHTML = '';

    // 修改：从 instanceData 获取存档数据
    const instanceData = window.charBagData[instanceId];
    const char = characterList[charId];
    
    if (!char || !instanceData) return;

    const saveData = instanceData; // 直接使用实例数据
    const RANK_LABELS = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
    const RANK_COLORS = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
    const TIP_LABELS = { damage: '偏攻', recover: '偏防', balance: '均衡' };

    // 左侧：武将图片 + 宝物格阵
    const leftDiv = document.createElement('div');
    leftDiv.className = 'team-info-left';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'team-info-img-container';
    const img = document.createElement('img');
    img.className = 'team-info-img';
    img.src = `./image/character/${charId}.jpg`;
    img.alt = char.name;
    img.onerror = function() {
        this.onerror = function() {
            this.style.display = 'none';
            const p = document.createElement('div');
            p.className = 'gallery-char-placeholder';
            p.style.width = '120px';
            p.style.height = '150px';
            p.style.fontSize = '36px';
            p.textContent = char.name.charAt(0);
            this.parentNode.appendChild(p);
        };
        this.src = `./image/character/${charId}.webp`;
    };
    imgDiv.appendChild(img);
    imgDiv.onclick = () => showFullImage(charId, char.name);
    leftDiv.appendChild(imgDiv);

    // 宝物格阵（3×2，2列×3行）
    // 注意：宝物装备逻辑也需要适配 instanceId，这里暂时假设 gameData 内部处理了 instanceId 映射
    // 如果 gameData 仍基于 charId，则需要修改 gameData 或在此处做转换。
    // 鉴于 gameData 封装在黑盒中，我们假设 syncTreasureEquipData 和 gameData 能够处理 instanceId 或者我们暂时沿用 charId 作为宝物挂载点（这会导致同角色不同实例共享宝物，如需隔离需大改 gameData）。
    // *为了最小化改动，此处暂时沿用 charId 进行宝物查询，但需注意同角色多实例共享宝物的局限性*
    const treasureLabel = document.createElement('div');
    treasureLabel.className = 'treasure-grid-label';
    treasureLabel.textContent = '宝物';
    leftDiv.appendChild(treasureLabel);

    const treasureGrid = document.createElement('div');
    treasureGrid.className = 'treasure-grid';
    const treasureDefs = gameData.getTreasureList();
    // 修改：传入 instanceId 或 charId? 
    // 如果 gameData 不支持 instanceId，这里传 charId 会导致所有同名角色共享宝物。
    // 理想情况：gameData.equipTreasure(instanceId, ...)
    // 临时方案：假设 gameData 已更新支持 instanceId，或者我们只传 charId 接受共享限制。
    // 此处代码保持原样调用，但需意识到如果 gameData 内部 key 是 charId，则多实例共享宝物。
    // const charTreasures = gameData.getCharTreasures(charId); 
    const charTreasures = gameData.getCharTreasures(instanceId);
    for (let i = 0; i < 6; i++) {
        const tSlot = document.createElement('div');
        tSlot.className = 'treasure-slot';
        tSlot.dataset.slotIndex = i;
        const tId = charTreasures[i];
        if (tId && treasureDefs[tId]) {
            const tDef = treasureDefs[tId];
            tSlot.title = `${tDef.name}: ${tDef.desc}`;
            if (tDef.icon) {
                const tImg = document.createElement('img');
                tImg.src = tDef.icon;
                tImg.className = 'treasure-slot-icon';
                tImg.onerror = function() { this.style.display = 'none'; };
                tSlot.appendChild(tImg);
            } else {
                tSlot.textContent = tDef.name.charAt(0);
            }
        } else {
            tSlot.textContent = '+';
            tSlot.classList.add('empty');
        }
        // 点击格子弹出宝物选择
        // tSlot.onclick = () => showTreasureSelectPopup(charId, i);
        tSlot.onclick = () => showTreasureSelectPopup(instanceId, i);
        treasureGrid.appendChild(tSlot);
    }
    leftDiv.appendChild(treasureGrid);

    // 右侧：属性信息
    const attrDiv = document.createElement('div');
    attrDiv.className = 'team-info-attr';

    // 名称
    const nameEl = document.createElement('div');
    nameEl.className = 'team-info-name';
    nameEl.textContent = char.name;
    attrDiv.appendChild(nameEl);

    // 品质 + 等级
    const rankEl = document.createElement('div');
    rankEl.className = 'team-info-rank';
    const rankText = RANK_LABELS[char.rank] || char.rank;
    const levelText = saveData ? `Lv.${saveData.level}` : 'Lv.1';
    rankEl.innerHTML = `<span style="color:${RANK_COLORS[char.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:12px;margin-left:6px">${levelText}</span>`;
    attrDiv.appendChild(rankEl);

    // 类型
    const tipEl = document.createElement('div');
    tipEl.className = 'team-info-tip';
    tipEl.textContent = TIP_LABELS[char.tip] || char.tip || '';
    attrDiv.appendChild(tipEl);

    // 四维属性
    const attrs = [
        { label: '生命', value: saveData ? saveData.hp : char.hp, icon: '❤' },
        { label: '攻击', value: saveData ? saveData.atk : char.atk, icon: '⚔' },
        { label: '防御', value: saveData ? saveData.def : char.def, icon: '🛡' },
        { label: '速度', value: saveData ? saveData.spe : char.spe, icon: '💨' },
    ];
    attrs.forEach(a => {
        const row = document.createElement('div');
        row.className = 'team-info-attr-row';
        row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${a.value}</span>`;
        attrDiv.appendChild(row);
    });

    // 技能详细描述
    const skillIds = char.skills || [];
    const skillSections = [
        { key: 0, type: 'pugong', label: '普攻', color: '#5ba8ff' },
        { key: 1, type: 'skill', label: '技能', color: '#ff8c00' },
        { key: 2, type: 'spskill', label: '必杀', color: '#ffd700' },
    ];
    for (const sec of skillSections) {
        const sId = skillIds[sec.key];
        const sData = sId && contentList[sec.type] && contentList[sec.type][sId];
        if (!sData) continue;

        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'team-info-skill-section';

        const headerRow = document.createElement('div');
        headerRow.className = 'team-info-skill-row';
        headerRow.innerHTML = `<span class="skill-label" style="color:${sec.color}">${sec.label}</span><span class="skill-name">${sData.name}</span>`;
        sectionDiv.appendChild(headerRow);

        if (sData.intro) {
            const introEl = document.createElement('div');
            introEl.className = 'team-info-skill-desc';
            introEl.textContent = sData.intro;
            sectionDiv.appendChild(introEl);
        }
        if (sData.ai_intro) {
            const aiEl = document.createElement('div');
            aiEl.className = 'team-info-skill-ai';
            aiEl.textContent = 'AI倾向：' + sData.ai_intro;
            sectionDiv.appendChild(aiEl);
        }

        attrDiv.appendChild(sectionDiv);
    }

    infoArea.appendChild(leftDiv);
    infoArea.appendChild(attrDiv);

    // 高亮选中方格
    highlightTeamSlot(slotIndex);
}

// ====== 宝物选择弹窗 ======
/**
 * 宝物选择弹窗（修改版，支持 instanceId）
 * @param {string} instanceId - 角色实例ID
 * @param {number} slotIndex - 宝物槽位 (0-5)
 */
function showTreasureSelectPopup(instanceId, slotIndex) {
    const existing = document.getElementById('treasure-select-popup');
    if (existing) existing.remove();

    // 从 charBagData 获取角色基本ID（用于显示和操作宝物定义）
    const instData = window.charBagData && window.charBagData[instanceId];
    const charId = instData ? instData.charId : instanceId; // 兼容旧数据
    const char = characterList[charId];
    if (!char) {
        toast('角色数据异常', 'error');
        return;
    }

    const treasureDefs = gameData.getTreasureList();
    const treasureBag = gameData.getTreasureInventory();
    // 使用 instanceId 获取当前宝物
    const currentTreasureId = gameData.getCharTreasures(instanceId)[slotIndex];

    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';
    overlay.id = 'treasure-select-popup';

    const popup = document.createElement('div');
    popup.className = 'treasure-select-popup';

    // 标题（显示角色名和槽位）
    const title = document.createElement('div');
    title.className = 'treasure-select-title';
    title.textContent = `选择宝物 - ${char.name}`;
    popup.appendChild(title);

    // 当前槽位信息
    const slotInfo = document.createElement('div');
    slotInfo.className = 'treasure-slot-info';
    if (currentTreasureId && treasureDefs[currentTreasureId]) {
        slotInfo.textContent = `当前: ${treasureDefs[currentTreasureId].name}`;
    } else {
        slotInfo.textContent = '当前: 空';
    }
    popup.appendChild(slotInfo);

    // 卸下按钮（如果当前有宝物）
    if (currentTreasureId) {
        const unequipBtn = document.createElement('button');
        unequipBtn.className = 'treasure-select-btn unequip';
        unequipBtn.textContent = '卸下宝物';
        unequipBtn.onclick = () => {
            gameData.equipTreasure(instanceId, slotIndex, null);
            syncTreasureEquipData();
            overlay.remove();
            // 刷新角色详情
            const idx = window._selectedSlotIndex;
            if (idx !== null && idx !== undefined) {
                const teamInstId = window.currentTeam[idx];
                if (teamInstId && window.charBagData && window.charBagData[teamInstId]) {
                    const teamCharId = window.charBagData[teamInstId].charId;
                    showTeamCharInfo(idx, teamInstId, teamCharId);
                }
            }
            toast('已卸下宝物', 'success');
        };
        popup.appendChild(unequipBtn);
        SaveManager.autoSave();
        
    }

    // 宝物列表滚动区
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'treasure-select-scroll';

    // 只遍历背包中已有的宝物
    const treasureIds = Object.keys(treasureBag).filter(tid => 
        treasureBag[tid] && treasureBag[tid].count > 0 && treasureDefs[tid]
    );

    treasureIds.forEach(tid => {
        const tDef = treasureDefs[tid];
        const isEquipped = tid === currentTreasureId;
        
        // 检查该角色（通过 instanceId）是否已在其他槽位装备了同样的宝物
        const charTreasures = gameData.getCharTreasures(instanceId);
        const alreadyEquippedInOtherSlot = charTreasures.some((t, i) => t === tid && i !== slotIndex);
        
        // 可装备条件：宝物可装备（有剩余数量）且未在当前槽位或其他槽位装备
        const remaining = (treasureBag[tid].count || 0) - (treasureBag[tid].equippedBy ? treasureBag[tid].equippedBy.length : 0);
        const isAvailable = remaining > 0 && !isEquipped && !alreadyEquippedInOtherSlot;

        const row = document.createElement('div');
        row.className = 'treasure-select-row' + (isEquipped ? ' current' : '') + (!isAvailable && !isEquipped ? ' unavailable' : '');

        // 图标
        const iconDiv = document.createElement('div');
        iconDiv.className = 'treasure-select-icon';
        if (tDef.icon) {
            const img = document.createElement('img');
            img.src = tDef.icon;
            img.className = 'treasure-icon-img';
            img.onerror = function() { 
                this.style.display = 'none'; 
                iconDiv.textContent = tDef.name.charAt(0); 
            };
            iconDiv.appendChild(img);
        } else {
            iconDiv.textContent = tDef.name.charAt(0);
        }
        row.appendChild(iconDiv);

        // 名称和描述
        const infoDiv = document.createElement('div');
        infoDiv.className = 'treasure-select-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'treasure-select-name';
        nameEl.textContent = tDef.name + (remaining > 1 ? ` ×${remaining}` : '');
        infoDiv.appendChild(nameEl);
        const descEl = document.createElement('div');
        descEl.className = 'treasure-select-desc';
        descEl.textContent = tDef.desc;
        infoDiv.appendChild(descEl);

        // 如果宝物已被其他角色装备，显示装备者名字（注意：equippedBy 现在存储的是 instanceId）
        if (treasureBag[tid] && treasureBag[tid].equippedBy && treasureBag[tid].equippedBy.length > 0) {
            const equippedByEl = document.createElement('div');
            equippedByEl.className = 'treasure-equipped-by';
            // 转换为可读名称（从 instanceId 获取 charId 再获取名字）
            const equipperNames = treasureBag[tid].equippedBy.map(instId => {
                const inst = window.charBagData && window.charBagData[instId];
                const cCharId = inst ? inst.charId : instId;
                const cData = characterList[cCharId];
                return cData ? cData.name : cCharId;
            });
            equippedByEl.textContent = `装备者: ${equipperNames.join(', ')}`;
            infoDiv.appendChild(equippedByEl);
        }

        row.appendChild(infoDiv);

        // 选择按钮
        const selectBtn = document.createElement('button');
        selectBtn.className = 'treasure-select-btn';
        if (isEquipped) {
            selectBtn.textContent = '已装备';
            selectBtn.disabled = true;
        } else if (isAvailable) {
            selectBtn.textContent = '装备';
            selectBtn.onclick = (e) => {
                e.stopPropagation();
                gameData.equipTreasure(instanceId, slotIndex, tid);
                syncTreasureEquipData();
                overlay.remove();
                // 刷新角色详情
                const idx = window._selectedSlotIndex;
                if (idx !== null && idx !== undefined) {
                    const teamInstId = window.currentTeam[idx];
                    if (teamInstId && window.charBagData && window.charBagData[teamInstId]) {
                        const teamCharId = window.charBagData[teamInstId].charId;
                        showTeamCharInfo(idx, teamInstId, teamCharId);
                    }
                }
                toast(`已装备【${tDef.name}】`, 'success');
                SaveManager.autoSave();
            };
        } else {
            selectBtn.textContent = '不可用';
            selectBtn.disabled = true;
        }
        row.appendChild(selectBtn);

        scrollDiv.appendChild(row);
    });

    // 如果没有可用宝物
    if (treasureIds.length === 0) {
        const emptyTip = document.createElement('div');
        emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
        emptyTip.textContent = '背包中暂无宝物';
        scrollDiv.appendChild(emptyTip);
    }

    popup.appendChild(scrollDiv);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'treasure-select-close-btn';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => overlay.remove();
    popup.appendChild(closeBtn);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}


/**
 * 同步宝物装备数据到 window（供战斗系统读取）
 * 已改为使用 instanceId 作为键
 */
function syncTreasureEquipData() {
    if (!window.treasureEquipData) window.treasureEquipData = {};
    if (!window.treasureBagData) window.treasureBagData = {};

    // 从 gameData 同步所有宝物装备数据（此时 _treasures 的键应为 instanceId）
    window.treasureEquipData = JSON.parse(JSON.stringify(gameData.data._treasures || {}));

    // 获取宝物背包数据
    const treasureBag = gameData.getTreasureInventory();
    const treasureDefs = gameData.getTreasureList();

    // 初始化所有宝物的 equippedBy 为空数组
    Object.keys(treasureDefs).forEach(tid => {
        if (!treasureBag[tid]) return;
        treasureBag[tid].equippedBy = [];
    });

    // 遍历所有角色的装备（键为 instanceId），记录装备者
    Object.keys(window.treasureEquipData).forEach(instId => {
        const treasures = window.treasureEquipData[instId];
        if (!treasures) return;
        treasures.forEach(tid => {
            if (!tid) return;
            if (!treasureBag[tid]) {
                treasureBag[tid] = { count: 0, equippedBy: [] };
            }
            if (!treasureBag[tid].equippedBy) {
                treasureBag[tid].equippedBy = [];
            }
            // 存储 instanceId 而不是 charId
            if (!treasureBag[tid].equippedBy.includes(instId)) {
                treasureBag[tid].equippedBy.push(instId);
            }
        });
    });

    window.treasureBagData = JSON.parse(JSON.stringify(treasureBag));
}


// 高亮选中的方格
function highlightTeamSlot(index) {
    const gridDiv = document.getElementById('team-grid');
    if (!gridDiv) return;
    for (let i = 0; i < gridDiv.children.length; i++) {
        gridDiv.children[i].classList.toggle('team-slot-selected', i === index);
    }
}

// ====== 布阵拖拽相关 ======
let _dragSourceIndex = null;

// 交换两个方格的武将（公共逻辑）
function swapTeamSlots(fromIndex, toIndex) {
    if (fromIndex === null || fromIndex === toIndex) return;
    const team = window.currentTeam;
    const temp = team[toIndex];
    team[toIndex] = team[fromIndex];
    team[fromIndex] = temp;

    refreshTeamSlot(toIndex);
    refreshTeamSlot(fromIndex);

    // 如果当前有选中方格的详情展示，也刷新
    const selectedIdx = window._selectedSlotIndex;
    if (selectedIdx === toIndex || selectedIdx === fromIndex) {
        const instanceId = team[selectedIdx];
        // 修改：从 instanceId 获取 charId
        if (instanceId && window.charBagData && window.charBagData[instanceId]) {
            const charId = window.charBagData[instanceId].charId;
            if (charId && characterList[charId]) {
                showTeamCharInfo(selectedIdx, instanceId, charId);
            }
        }
    }

    toast('已交换位置', 'success');
    SaveManager.autoSave();
}

function _clearDragStyles() {
    document.querySelectorAll('.team-slot-dragging, .team-slot-drag-over').forEach(el => {
        el.classList.remove('team-slot-dragging', 'team-slot-drag-over');
    });
}

// --- 桌面端 Drag & Drop ---
function onSlotDragStart(e, index) {
    _dragSourceIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    e.target.classList.add('team-slot-dragging');
}

function onSlotDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function onSlotDragEnter(e, index) {
    e.preventDefault();
    if (index !== _dragSourceIndex) {
        e.target.closest('.team-slot')?.classList.add('team-slot-drag-over');
    }
}

function onSlotDragLeave(e) {
    e.target.closest('.team-slot')?.classList.remove('team-slot-drag-over');
}

function onSlotDrop(e, targetIndex) {
    e.preventDefault();
    e.target.closest('.team-slot')?.classList.remove('team-slot-drag-over');
    swapTeamSlots(_dragSourceIndex, targetIndex);
    _dragSourceIndex = null;
}

function onSlotDragEnd(e) {
    _clearDragStyles();
    _dragSourceIndex = null;
}

// --- 移动端触摸拖拽 ---
let _touchDragEl = null;     // 跟随手指的克隆元素
let _touchSourceSlot = null;  // 触摸的原始方格DOM
let _touchSourceIndex = null; // 触摸的原始方格索引
let _touchStartX = 0;        // 触摸起始X坐标
let _touchStartY = 0;        // 触摸起始Y坐标
let _touchDragging = false;  // 是否已进入拖拽模式
let _touchCurrentTarget = null; // 当前悬停的目标方格
const _TOUCH_DRAG_THRESHOLD = 8; // 移动超过此像素数才视为拖拽

function _createTouchGhost(touch) {
    const rect = _touchSourceSlot.getBoundingClientRect();
    _touchDragEl = _touchSourceSlot.cloneNode(true);
    _touchDragEl.classList.add('team-slot-touch-ghost');
    _touchDragEl.style.width = rect.width + 'px';
    _touchDragEl.style.height = rect.height + 'px';
    _touchDragEl.style.left = (touch.clientX - rect.width / 2) + 'px';
    _touchDragEl.style.top = (touch.clientY - rect.height / 2) + 'px';
    document.body.appendChild(_touchDragEl);
    _touchSourceSlot.classList.add('team-slot-dragging');
}

function onSlotTouchStart(e, index) {
    const touch = e.touches[0];
    _touchSourceSlot = e.currentTarget;
    _touchSourceIndex = index;
    _touchStartX = touch.clientX;
    _touchStartY = touch.clientY;
    _touchDragging = false;
    _touchCurrentTarget = null;
}

function onSlotTouchMove(e) {
    if (_touchSourceIndex === null) return;

    const touch = e.touches[0];

    // 未进入拖拽模式时，判断是否超过阈值
    if (!_touchDragging) {
        const dx = touch.clientX - _touchStartX;
        const dy = touch.clientY - _touchStartY;
        if (dx * dx + dy * dy < _TOUCH_DRAG_THRESHOLD * _TOUCH_DRAG_THRESHOLD) return;
        // 超过阈值，进入拖拽模式
        e.preventDefault();
        _touchDragging = true;
        _createTouchGhost(touch);
        return;
    }

    e.preventDefault(); // 阻止页面滚动

    // 移动克隆元素
    if (_touchDragEl) {
        const w = parseFloat(_touchDragEl.style.width);
        const h = parseFloat(_touchDragEl.style.height);
        _touchDragEl.style.left = (touch.clientX - w / 2) + 'px';
        _touchDragEl.style.top = (touch.clientY - h / 2) + 'px';
    }

    // 判断手指下方是哪个方格
    if (_touchDragEl) _touchDragEl.style.pointerEvents = 'none';
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (_touchDragEl) _touchDragEl.style.pointerEvents = '';

    const targetSlot = elemBelow?.closest('.team-slot');

    // 清除上一个悬停目标的高亮
    if (_touchCurrentTarget && _touchCurrentTarget !== targetSlot) {
        _touchCurrentTarget.classList.remove('team-slot-drag-over');
    }

    if (targetSlot && targetSlot !== _touchSourceSlot) {
        targetSlot.classList.add('team-slot-drag-over');
        _touchCurrentTarget = targetSlot;
    } else {
        _touchCurrentTarget = null;
    }
}

function onSlotTouchEnd(e) {
    // 如果处于拖拽模式，执行交换逻辑
    if (_touchDragging) {
        // 移除克隆元素
        if (_touchDragEl) {
            _touchDragEl.remove();
            _touchDragEl = null;
        }

        if (_touchCurrentTarget) {
            const targetIdx = parseInt(_touchCurrentTarget.dataset.slotIndex);
            _clearDragStyles();
            swapTeamSlots(_touchSourceIndex, targetIdx);
        } else {
            _clearDragStyles();
        }
    }

    _touchSourceSlot = null;
    _touchSourceIndex = null;
    _touchDragging = false;
    _touchCurrentTarget = null;
}

// 展示选将浮窗
/**
 * 弹出角色属性详情面板（可在任意场景调用）
 */
function showCharDetailPopup(charId) {
    const char = characterList[charId];
    if (!char) return;

    const saveData = getCharSaveData(charId);
    const RANK_LABELS = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
    const RANK_COLORS = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
    const TIP_LABELS = { damage: '偏攻', recover: '偏防', balance: '均衡' };

    const overlay = document.createElement('div');
    overlay.className = 'gallery-fullimg-overlay';
    overlay.style.zIndex = '10002';

    const dialog = document.createElement('div');
    dialog.className = 'char-detail-popup';
    dialog.onclick = (e) => e.stopPropagation();

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'char-select-close-btn';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '8px';
    closeBtn.style.right = '8px';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => overlay.remove();

    // 上方：图片+基本信息
    const topDiv = document.createElement('div');
    topDiv.className = 'char-detail-top';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'team-info-img-container';
    imgDiv.style.cursor = 'pointer';
    const img = document.createElement('img');
    img.className = 'team-info-img';
    img.src = `./image/character/${charId}.jpg`;
    img.alt = char.name;
    img.onerror = function() {
        this.onerror = function() {
            this.style.display = 'none';
            const p = document.createElement('div');
            p.className = 'gallery-char-placeholder';
            p.style.width = '120px';
            p.style.height = '150px';
            p.style.fontSize = '36px';
            p.textContent = char.name.charAt(0);
            this.parentNode.appendChild(p);
        };
        this.src = `./image/character/${charId}.webp`;
    };
    imgDiv.appendChild(img);
    imgDiv.onclick = () => showFullImage(charId, char.name);
    topDiv.appendChild(imgDiv);

    // 右侧属性
    const attrDiv = document.createElement('div');
    attrDiv.className = 'team-info-attr';

    const nameEl = document.createElement('div');
    nameEl.className = 'team-info-name';
    nameEl.textContent = char.name;
    attrDiv.appendChild(nameEl);

    const rankEl = document.createElement('div');
    rankEl.className = 'team-info-rank';
    const rankText = RANK_LABELS[char.rank] || char.rank;
    const levelText = saveData ? `Lv.${saveData.level}` : 'Lv.1';
    rankEl.innerHTML = `<span style="color:${RANK_COLORS[char.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:12px;margin-left:6px">${levelText}</span>`;
    attrDiv.appendChild(rankEl);

    const tipEl = document.createElement('div');
    tipEl.className = 'team-info-tip';
    tipEl.textContent = TIP_LABELS[char.tip] || char.tip || '';
    attrDiv.appendChild(tipEl);

    const attrs = [
        { label: '生命', value: saveData ? saveData.hp : char.hp, icon: '❤' },
        { label: '攻击', value: saveData ? saveData.atk : char.atk, icon: '⚔' },
        { label: '防御', value: saveData ? saveData.def : char.def, icon: '🛡' },
        { label: '速度', value: saveData ? saveData.spe : char.spe, icon: '💨' },
    ];
    attrs.forEach(a => {
        const row = document.createElement('div');
        row.className = 'team-info-attr-row';
        row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${a.value}</span>`;
        attrDiv.appendChild(row);
    });

    topDiv.appendChild(attrDiv);
    dialog.appendChild(topDiv);

    // 下方：技能详情
    const skillIds = char.skills || [];
    const skillSections = [
        { key: 0, type: 'pugong', label: '普攻', color: '#5ba8ff' },
        { key: 1, type: 'skill', label: '技能', color: '#ff8c00' },
        { key: 2, type: 'spskill', label: '必杀', color: '#ffd700' },
    ];
    for (const sec of skillSections) {
        const sId = skillIds[sec.key];
        const sData = sId && contentList[sec.type] && contentList[sec.type][sId];
        if (!sData) continue;

        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'team-info-skill-section';

        const headerRow = document.createElement('div');
        headerRow.className = 'team-info-skill-row';
        headerRow.innerHTML = `<span class="skill-label" style="color:${sec.color}">${sec.label}</span><span class="skill-name">${sData.name}</span>`;
        sectionDiv.appendChild(headerRow);

        if (sData.intro) {
            const introEl = document.createElement('div');
            introEl.className = 'team-info-skill-desc';
            introEl.textContent = sData.intro;
            sectionDiv.appendChild(introEl);
        }
        if (sData.ai_intro) {
            const aiEl = document.createElement('div');
            aiEl.className = 'team-info-skill-desc';
            aiEl.style.color = '#aaa';
            aiEl.textContent = sData.ai_intro;
            sectionDiv.appendChild(aiEl);
        }

        dialog.appendChild(sectionDiv);
    }

    dialog.appendChild(closeBtn);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

function showCharSelectPopup(slotIndex) {
    // 移除已有浮窗
    const existing = document.getElementById('char-select-popup');
    if (existing) existing.remove();

    const RANK_ORDER = { legend: 0, epic: 1, rare: 2, common: 3, junk: 4 };
    const RANK_BORDER_COLORS = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
    const RANK_LABELS = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
    const TIP_LABELS = { damage: '偏攻', recover: '偏防', balance: '均衡' };

    // 遮罩
    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';
    overlay.id = 'char-select-popup';

    // 浮窗容器
    const popup = document.createElement('div');
    popup.className = 'char-select-popup';

    // 标题
    const title = document.createElement('div');
    title.className = 'char-select-title';
    title.textContent = '选择武将';
    popup.appendChild(title);

    // 武将列表滚动区
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'char-select-scroll';

    // 修改：获取拥有的角色实例列表
    // window.charBagData 结构: { [instanceId]: { charId, level, ... } }
    const ownedInstanceIds = Object.keys(window.charBagData || {});
    
    // 转换为包含基础信息的数组以便排序
    const ownedInstances = ownedInstanceIds.map(instId => {
        const instData = window.charBagData[instId];
        const charId = instData.charId || instId;
        const baseData = characterList[charId];
        if (!baseData) return null;
        return {
            instanceId: instId,
            charId: charId,
            ...baseData,
            level: instData.level,
            hp: instData.hp,
            atk: instData.atk,
            def: instData.def,
            spe: instData.spe
        };
    }).filter(Boolean);

    // 排序：先按品质，再按等级
    ownedInstances.sort((a, b) => {
        const rankDiff = (RANK_ORDER[a.rank] || 99) - (RANK_ORDER[b.rank] || 99);
        if (rankDiff !== 0) return rankDiff;
        return (b.level || 1) - (a.level || 1);
    });

    for (const charInst of ownedInstances) {
        const borderColor = RANK_BORDER_COLORS[charInst.rank] || '#888';
        const isInTeam = window.currentTeam && window.currentTeam.includes(charInst.instanceId);

        const row = document.createElement('div');
        row.className = 'char-select-row';
        if (isInTeam) row.classList.add('in-team');

        // 左侧：图标+品质边框
        const iconDiv = document.createElement('div');
        iconDiv.className = 'char-select-icon';
        iconDiv.style.borderColor = borderColor;
        iconDiv.style.cursor = 'pointer';
        const img = document.createElement('img');
        img.src = `./image/character/${charInst.charId}.jpg`;
        img.alt = charInst.name;
        img.className = 'gallery-char-img';
        img.onerror = function() {
            this.onerror = function() {
                this.style.display = 'none';
                const p = document.createElement('div');
                p.className = 'gallery-char-placeholder';
                p.textContent = charInst.name.charAt(0);
                this.parentNode.appendChild(p);
            };
            this.src = `./image/character/${charInst.charId}.webp`;
        };
        iconDiv.appendChild(img);
        // 点击图标查看角色属性
        iconDiv.onclick = (e) => {
            e.stopPropagation();
            showBagCharDetail({ id: charInst.charId, ...charInst }); // 传递基础信息用于展示
        };
        row.appendChild(iconDiv);

        // 中间：武将名称 + 等级/类型
        const infoDiv = document.createElement('div');
        infoDiv.className = 'char-select-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'char-select-name';
        nameEl.textContent = charInst.name;
        if (charInst.rank === 'legend') nameEl.style.color = '#ff6666';
        else if (charInst.rank === 'epic') nameEl.style.color = '#ffaa44';
        infoDiv.appendChild(nameEl);

        const detailEl = document.createElement('div');
        detailEl.className = 'char-select-detail';
        const lvText = `Lv.${charInst.level || 1}`;
        const tipText = TIP_LABELS[charInst.tip] || charInst.tip || '';
        detailEl.textContent = `${lvText}  ${tipText}`;
        infoDiv.appendChild(detailEl);

        if (isInTeam) {
            const inTeamTag = document.createElement('div');
            inTeamTag.style.cssText = 'font-size:10px;color:#ffd700;';
            inTeamTag.textContent = '已上阵';
            infoDiv.appendChild(inTeamTag);
        }
        row.appendChild(infoDiv);

        // 右侧：选择按钮
        const selectBtn = document.createElement('button');
        selectBtn.className = 'char-select-btn';
        selectBtn.textContent = '选择';
        selectBtn.onclick = (e) => {
            e.stopPropagation();
            const existIdx = window.currentTeam.indexOf(charInst.instanceId);
            const oldInstanceId = window.currentTeam[slotIndex];

            if (existIdx !== -1) {
                // 角色已在其他方格，视为交换位置
                window.currentTeam[existIdx] = oldInstanceId;
                refreshTeamSlot(existIdx);
            } else if (oldInstanceId) {
                // 新角色上阵，原方格角色被换下，转移宝物
                if (typeof gameData.transferTreasures === 'function') {
                    gameData.transferTreasures(oldInstanceId, charInst.instanceId);
                }
            }

            window.currentTeam[slotIndex] = charInst.instanceId;
            refreshTeamSlot(slotIndex);
            toast(`${charInst.name} (Lv.${charInst.level}) 已上阵`, 'success');
            overlay.remove();
            window._selectedSlotIndex = slotIndex;
            showTeamCharInfo(slotIndex, charInst.instanceId, charInst.charId);
            SaveManager.autoSave();
        };

        row.appendChild(selectBtn);

        scrollDiv.appendChild(row);
    }

    if (ownedInstances.length === 0) {
        const emptyTip = document.createElement('div');
        emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
        emptyTip.textContent = '暂无角色';
        scrollDiv.appendChild(emptyTip);
    }

    popup.appendChild(scrollDiv);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'char-select-close-btn';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => overlay.remove();
    popup.appendChild(closeBtn);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

function renderBagView(container) {
    container.innerHTML = '';



    // 当前选中的子标签
    if (!window.bagTab) window.bagTab = 'char';

    // 上方子标签
    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'bag-tabs';

    const tabConfigs = [
        { key: 'item', label: '道具' },
        { key: 'equip', label: '装备' },
        { key: 'char', label: '武将' },
        { key: 'other', label: '其他' },
    ];

    tabConfigs.forEach(cfg => {
        const btn = document.createElement('button');
        btn.className = 'bag-tab-btn' + (window.bagTab === cfg.key ? ' active' : '');
        btn.textContent = cfg.label;
        btn.onclick = () => {
            window.bagTab = cfg.key;
            renderBagView(container);
        };
        tabsDiv.appendChild(btn);
    });
    container.appendChild(tabsDiv);

    // 中间：背包主体
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'bag-body';

    if (window.bagTab === 'char') {
        renderBagCharContent(bodyDiv);
    } else if (window.bagTab === 'item') {
        // 预留接口
        const tip = document.createElement('div');
        tip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:30px;';
        tip.textContent = '道具背包 - 敬请期待';
        bodyDiv.appendChild(tip);
    } else if (window.bagTab === 'equip') {
        renderBagEquipContent(bodyDiv);
    } else {
        const tip = document.createElement('div');
        tip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:30px;';
        tip.textContent = '其他 - 敬请期待';
        bodyDiv.appendChild(tip);
    }

    container.appendChild(bodyDiv);

    // 下方：详情横框
    const detailBar = document.createElement('div');
    detailBar.className = 'bag-detail-bar';
    detailBar.id = 'bag-detail-bar';

    if (window.bagTab === 'char') {
        // 武将详情横框
        // 左侧：武将头像
        const iconDiv = document.createElement('div');
        iconDiv.className = 'bag-detail-icon bag-detail-char-icon';
        iconDiv.id = 'bag-detail-char-icon';
        iconDiv.textContent = '?';
        iconDiv.style.cursor = 'pointer';
        iconDiv.onclick = () => {
            const charId = detailBar.dataset.charId;
            if (charId && characterList[charId]) {
                showBagCharDetail({ id: charId, ...characterList[charId] });
            }
        };
        detailBar.appendChild(iconDiv);

        // 中间：武将简介
        const infoDiv = document.createElement('div');
        infoDiv.className = 'bag-detail-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'bag-detail-name';
        nameEl.id = 'bag-detail-char-name';
        nameEl.textContent = '选择武将查看详情';
        infoDiv.appendChild(nameEl);
        const descEl = document.createElement('div');
        descEl.className = 'bag-detail-desc';
        descEl.id = 'bag-detail-char-desc';
        descEl.textContent = '点击背包中的武将查看信息';
        infoDiv.appendChild(descEl);
        detailBar.appendChild(infoDiv);

        // 右侧：查看按钮
        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'bag-detail-btns';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'bag-detail-action-btn';
        viewBtn.id = 'bag-detail-view-btn';
        viewBtn.textContent = '查看';
        viewBtn.onclick = () => {
            const instanceId = detailBar.dataset.instanceId;
            const charId = detailBar.dataset.charId;
            if (instanceId && charId && characterList[charId]) {
                // 使用背包专用详情弹窗（带升级功能）
                showBagCharDetailPopup(instanceId, charId);
            }
        };
        btnsDiv.appendChild(viewBtn);
        detailBar.appendChild(btnsDiv);

    } else if (window.bagTab === 'equip') {
        // 宝物详情横框
        const iconDiv = document.createElement('div');
        iconDiv.className = 'bag-detail-icon bag-detail-equip-icon';
        iconDiv.id = 'bag-detail-equip-icon';
        iconDiv.textContent = '?';
        iconDiv.style.cursor = 'pointer';
        iconDiv.onclick = () => {
            const tid = detailBar.dataset.treasureId;
            if (tid && gameData.getTreasureList()[tid]) {
                showBagTreasureDetail(tid);
            }
        };
        detailBar.appendChild(iconDiv);

        // 中间：宝物简介
        const infoDiv = document.createElement('div');
        infoDiv.className = 'bag-detail-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'bag-detail-name';
        nameEl.id = 'bag-detail-equip-name';
        nameEl.textContent = '选择宝物查看详情';
        infoDiv.appendChild(nameEl);
        const descEl = document.createElement('div');
        descEl.className = 'bag-detail-desc';
        descEl.id = 'bag-detail-equip-desc';
        descEl.textContent = '点击背包中的宝物查看信息';
        infoDiv.appendChild(descEl);
        detailBar.appendChild(infoDiv);

        // 右侧：出售按钮
        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'bag-detail-btns';
        const sellBtn = document.createElement('button');
        sellBtn.className = 'bag-detail-action-btn';
        sellBtn.textContent = '出售';
        sellBtn.onclick = () => {
            const tid = detailBar.dataset.treasureId;
            if (!tid) return;
            const tDef = gameData.getTreasureList()[tid];
            if (!tDef) return;
            const sellPrice = Math.floor((tDef.price || 100) * 0.5);
            gameData.removeTreasure(tid, 1);
            window.gameGold = (window.gameGold || 0) + sellPrice;
            toast(`出售【${tDef.name}】，获得 ${sellPrice} 金币`, 'success');
            // 刷新背包视图
            const bagContainer = document.querySelector('.bag-view') || container;
            renderBagView(bagContainer);
        };
        btnsDiv.appendChild(sellBtn);
        detailBar.appendChild(btnsDiv);
    } else {
        // 道具详情横框（原有逻辑）
        // 左侧：道具图标
        const iconDiv = document.createElement('div');
        iconDiv.className = 'bag-detail-icon';
        iconDiv.textContent = '?';
        iconDiv.style.cursor = 'pointer';
        detailBar.appendChild(iconDiv);

        // 中间：道具简介
        const infoDiv = document.createElement('div');
        infoDiv.className = 'bag-detail-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'bag-detail-name';
        nameEl.textContent = '选择道具查看详情';
        infoDiv.appendChild(nameEl);
        const descEl = document.createElement('div');
        descEl.className = 'bag-detail-desc';
        descEl.textContent = '点击背包中的道具查看信息';
        infoDiv.appendChild(descEl);
        detailBar.appendChild(infoDiv);

        // 右侧：使用和出售按钮
        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'bag-detail-btns';
        const useBtn = document.createElement('button');
        useBtn.className = 'bag-detail-action-btn';
        useBtn.textContent = '使用';
        useBtn.onclick = () => {
            // 预留接口
            toast('使用功能 - 预留接口', 'info');
        };
        btnsDiv.appendChild(useBtn);
        const sellBtn = document.createElement('button');
        sellBtn.className = 'bag-detail-action-btn';
        sellBtn.textContent = '出售';
        sellBtn.onclick = () => {
            // 预留接口
            toast('出售功能 - 预留接口', 'info');
        };
        btnsDiv.appendChild(sellBtn);
        detailBar.appendChild(btnsDiv);
    }

    container.appendChild(detailBar);
}

// 渲染装备背包内容（宝物浏览）
function renderBagEquipContent(container) {
    const treasureDefs = gameData.getTreasureList();
    const treasureBag = gameData.getTreasureInventory();

    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'bag-char-scroll';

    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    // 获取拥有的宝物
    const ownedTreasureIds = Object.keys(treasureBag).filter(tid => treasureBag[tid] && treasureBag[tid].count > 0 && treasureDefs[tid]);

    for (const tid of ownedTreasureIds) {
        const tDef = treasureDefs[tid];
        const bagItem = treasureBag[tid];

        const card = document.createElement('div');
        card.className = 'gallery-char-card equipbag-treasure-card';
        card.dataset.treasureId = tid;

        // 图标
        const iconDiv = document.createElement('div');
        iconDiv.className = 'gallery-char-icon equipbag-icon';

        if (tDef.icon) {
            const img = document.createElement('img');
            img.className = 'gallery-char-img equipbag-icon-img';
            img.src = tDef.icon;
            img.alt = tDef.name;
            img.onerror = function() {
                this.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'gallery-char-placeholder';
                fallback.textContent = tDef.emoji || tDef.name.charAt(0);
                this.parentNode.appendChild(fallback);
            };
            iconDiv.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'gallery-char-placeholder';
            placeholder.textContent = tDef.emoji || tDef.name.charAt(0);
            iconDiv.appendChild(placeholder);
        }
        card.appendChild(iconDiv);

        // 名称
        const nameDiv = document.createElement('div');
        nameDiv.className = 'gallery-char-name';
        nameDiv.textContent = tDef.name;
        card.appendChild(nameDiv);

        // 数量角标
        if (bagItem.count > 1) {
            const countBadge = document.createElement('div');
            countBadge.className = 'equipbag-count-badge';
            countBadge.textContent = `x${bagItem.count}`;
            card.appendChild(countBadge);
        }

        // 已装备标记
        if (bagItem.equippedBy && bagItem.equippedBy.length > 0) {
            const eqBadge = document.createElement('div');
            eqBadge.className = 'equipbag-equipped-badge';
            eqBadge.textContent = '装';
            card.appendChild(eqBadge);
        }

        // 点击选中宝物，显示到底部详情横框
        card.onclick = () => {
            updateBagEquipDetailBar(tid, tDef, bagItem);
            document.querySelectorAll('.equipbag-treasure-card.selected').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        };

        grid.appendChild(card);
    }

    if (ownedTreasureIds.length === 0) {
        const emptyTip = document.createElement('div');
        emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
        emptyTip.textContent = '暂无宝物';
        grid.appendChild(emptyTip);
    }

    scrollDiv.appendChild(grid);
    container.appendChild(scrollDiv);
}

// 更新底部宝物详情横框
function updateBagEquipDetailBar(tid, tDef, bagItem) {
    const detailBar = document.getElementById('bag-detail-bar');
    if (!detailBar) return;

    const remaining = bagItem.count - (bagItem.equippedBy ? bagItem.equippedBy.length : 0);

    detailBar.dataset.treasureId = tid;
    detailBar.classList.add('equip-selected');

    // 更新图标
    const iconDiv = document.getElementById('bag-detail-equip-icon');
    if (iconDiv) {
        iconDiv.textContent = '';
        if (tDef.icon) {
            const img = document.createElement('img');
            img.src = tDef.icon;
            img.alt = tDef.name;
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:4px;';
            img.onerror = function() {
                this.style.display = 'none';
                iconDiv.textContent = tDef.emoji || tDef.name.charAt(0);
                iconDiv.style.fontSize = '18px';
                iconDiv.style.color = '#ffd700';
            };
            iconDiv.appendChild(img);
        } else {
            iconDiv.textContent = tDef.emoji || tDef.name.charAt(0);
            iconDiv.style.fontSize = '18px';
            iconDiv.style.color = '#ffd700';
        }
    }

    // 更新名称
    const nameEl = document.getElementById('bag-detail-equip-name');
    if (nameEl) {
        nameEl.textContent = tDef.name;
        nameEl.style.color = '#ffd700';
    }

    // 更新描述
    const descEl = document.getElementById('bag-detail-equip-desc');
    if (descEl) {
        let descText = tDef.desc || '';
        descText += ` | 持有:${bagItem.count} 可用:${remaining}`;
        if (bagItem.equippedBy && bagItem.equippedBy.length > 0) {
            const equipperNames = bagItem.equippedBy.map(cid => {
                const cData = characterList[cid];
                return cData ? cData.name : cid;
            });
            descText += ` | 装备者:${equipperNames.join(', ')}`;
        }
        descEl.textContent = descText;
    }
}

// 渲染武将背包内容
function renderBagCharContent(container) {
    const RANK_ORDER = { legend: 0, epic: 1, rare: 2, common: 3, junk: 4 };
    const RANK_BORDER_COLORS = {
        legend: '#ff4444',
        epic: '#ff8800',
        rare: '#44aaff',
        common: '#88cc88',
        junk: '#888888'
    };

    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'bag-char-scroll';

    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    // 从存档中获取拥有的角色实例并按品质排序
    const ownedInstanceIds = Object.keys(window.charBagData || {});
    const ownedInstances = ownedInstanceIds.map(instId => {
        const instData = window.charBagData[instId];
        const charId = instData.charId || instId;
        const baseData = characterList[charId];
        if (!baseData) return null;
        return {
            instanceId: instId,
            charId: charId,
            ...baseData,
            level: instData.level
        };
    }).filter(Boolean);
    
    ownedInstances.sort((a, b) => (RANK_ORDER[a.rank] || 99) - (RANK_ORDER[b.rank] || 99));

    for (const charInst of ownedInstances) {
        const borderColor = RANK_BORDER_COLORS[charInst.rank] || '#888';
        const isInTeam = window.currentTeam && window.currentTeam.includes(charInst.instanceId);

        const card = document.createElement('div');
        card.className = 'gallery-char-card charbag-char-card';
        card.dataset.charId = charInst.charId; // 保留 charId 用于某些兼容查找
        card.dataset.instanceId = charInst.instanceId; // 新增 instanceId

        const iconDiv = document.createElement('div');
        iconDiv.className = 'gallery-char-icon';
        iconDiv.style.borderColor = borderColor;

        const img = document.createElement('img');
        img.className = 'gallery-char-img';
        img.src = `./image/character/${charInst.charId}.jpg`;
        img.alt = charInst.name;
        img.onerror = function() {
            this.onerror = function() {
                this.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'gallery-char-placeholder';
                placeholder.textContent = charInst.name.charAt(0);
                this.parentNode.appendChild(placeholder);
            };
            this.src = `./image/character/${charInst.charId}.webp`;
        };
        iconDiv.appendChild(img);
        card.appendChild(iconDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'gallery-char-name';
        nameDiv.textContent = charInst.name;
        if (charInst.rank === 'legend') nameDiv.style.color = '#ff6666';
        else if (charInst.rank === 'epic') nameDiv.style.color = '#ffaa44';
        card.appendChild(nameDiv);

        // 已上阵标记
        if (isInTeam) {
            const badge = document.createElement('div');
            badge.className = 'charbag-in-team-badge';
            badge.textContent = '阵';
            card.appendChild(badge);
        }

        // 点击选中武将，显示到底部详情横框
        card.onclick = () => {
            // 传递完整实例信息
            updateBagCharDetailBar(charInst);
            // 高亮选中卡片
            document.querySelectorAll('.charbag-char-card.selected').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        };

        grid.appendChild(card);
    }

    if (ownedInstances.length === 0) {
        const emptyTip = document.createElement('div');
        emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
        emptyTip.textContent = '暂无角色';
        grid.appendChild(emptyTip);
    }

    scrollDiv.appendChild(grid);
    container.appendChild(scrollDiv);
}

// 更新底部武将详情横框
function updateBagCharDetailBar(charInst) {
    const detailBar = document.getElementById('bag-detail-bar');
    if (!detailBar) return;

    // charInst 现在包含 instanceId, charId, level 等
    const saveData = window.charBagData[charInst.instanceId];
    const rankLabels = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
    const tipLabels = { damage: '偏攻', recover: '偏防', balance: '均衡' };
    const level = saveData ? saveData.level : 1;
    const rankText = rankLabels[charInst.rank] || charInst.rank;
    const tipText = tipLabels[charInst.tip] || charInst.tip || '';

    // 保存当前选中的武将 InstanceID
    detailBar.dataset.instanceId = charInst.instanceId;
    detailBar.dataset.charId = charInst.charId; // 兼容
    detailBar.classList.add('char-selected');

    // 更新头像
    const iconDiv = document.getElementById('bag-detail-char-icon');
    if (iconDiv) {
        iconDiv.textContent = '';
        const img = document.createElement('img');
        img.src = `./image/character/${charInst.charId}.jpg`;
        img.alt = charInst.name;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:4px;';
        img.onerror = function() {
            this.onerror = function() {
                this.style.display = 'none';
                iconDiv.textContent = charInst.name.charAt(0);
                iconDiv.style.fontSize = '18px';
                iconDiv.style.color = '#eee';
            };
            this.src = `./image/character/${charInst.charId}.webp`;
        };
        iconDiv.appendChild(img);
    }

    // 更新名称
    const nameEl = document.getElementById('bag-detail-char-name');
    const rankColors = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
    if (nameEl) {
        nameEl.textContent = charInst.name;
        nameEl.style.color = rankColors[charInst.rank] || '#eee';
    }

    // 更新描述（品质 + 等级 + 偏向）
    const descEl = document.getElementById('bag-detail-char-desc');
    if (descEl) {
        descEl.textContent = `${rankText} · Lv.${level} · ${tipText}`;
    }
    const levelText = saveData ? `Lv.${saveData.level}` : 'Lv.1';
    const attrDiv = document.createElement('div');
    attrDiv.className = 'team-info-attr';
    
}

// 背包中查看宝物详情弹窗
function showBagTreasureDetail(tid) {
    const tDef = gameData.getTreasureList()[tid];
    if (!tDef) return;
    const bagItem = gameData.getTreasureInventory()[tid] || { count: 0, equippedBy: [] };
    const remaining = bagItem.count - (bagItem.equippedBy ? bagItem.equippedBy.length : 0);
    const typeLabels = {
        on_kill: '击杀时触发',
        on_any_death: '有人阵亡时触发',
        on_turn_start: '回合开始时触发',
        on_hit: '被攻击时触发',
        on_skill: '使用技能后触发',
        on_damage_dealt: '造成伤害后触发',
        on_attack: '普攻时触发',
        passive: '被动',
        on_death: '亡语',
        on_pugong: '普攻特殊效果',
    };

    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'gallery-detail-dialog';

    // 名称
    const nameDiv = document.createElement('div');
    nameDiv.className = 'gallery-detail-name';
    nameDiv.textContent = tDef.name;
    dialog.appendChild(nameDiv);

    // 上半区：图标 + 属性
    const topDiv = document.createElement('div');
    topDiv.className = 'gallery-detail-top';

    // 图标
    const imgDiv = document.createElement('div');
    imgDiv.className = 'gallery-detail-img-container';
    if (tDef.icon) {
        const img = document.createElement('img');
        img.className = 'gallery-detail-img';
        img.src = tDef.icon;
        img.alt = tDef.name;
        img.style.objectFit = 'contain';
        img.onerror = function() {
            this.style.display = 'none';
            const p = document.createElement('div');
            p.className = 'gallery-char-placeholder';
            p.style.width = '168px';
            p.style.height = '207px';
            p.style.fontSize = '50px';
            p.textContent = tDef.emoji || tDef.name.charAt(0);
            this.parentNode.appendChild(p);
        };
        imgDiv.appendChild(img);
    } else {
        const p = document.createElement('div');
        p.className = 'gallery-char-placeholder';
        p.style.width = '168px';
        p.style.height = '207px';
        p.style.fontSize = '50px';
        p.textContent = tDef.emoji || tDef.name.charAt(0);
        imgDiv.appendChild(p);
    }
    topDiv.appendChild(imgDiv);

    // 属性区
    const attrDiv = document.createElement('div');
    attrDiv.className = 'gallery-detail-attr';

    // 触发时点
    const typeDiv = document.createElement('div');
    typeDiv.className = 'gallery-detail-rank';
    typeDiv.innerHTML = `<span style="color:#ffd700">${typeLabels[tDef.type] || tDef.type || '未知'}</span>`;
    attrDiv.appendChild(typeDiv);

    // 持有信息
    const infoRows = [
        { label: '持有', value: bagItem.count },
        { label: '可用', value: remaining },
        { label: '价值', value: (tDef.price || 0) + ' 金' },
    ];
    infoRows.forEach(a => {
        const row = document.createElement('div');
        row.className = 'gallery-detail-attr-row';
        row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${a.value}</span>`;
        attrDiv.appendChild(row);
    });

    // 装备者
    if (bagItem.equippedBy && bagItem.equippedBy.length > 0) {
        const equipperNames = bagItem.equippedBy.map(cid => {
            const cData = characterList[cid];
            return cData ? cData.name : cid;
        });
        const eqRow = document.createElement('div');
        eqRow.className = 'gallery-detail-attr-row';
        eqRow.innerHTML = `<span class="attr-label">装备者</span><span class="attr-value" style="color:#ffa500">${equipperNames.join(', ')}</span>`;
        attrDiv.appendChild(eqRow);
    }

    topDiv.appendChild(attrDiv);
    dialog.appendChild(topDiv);

    // 描述
    const descSection = document.createElement('div');
    descSection.className = 'gallery-detail-skills';
    const descBox = document.createElement('div');
    descBox.className = 'gallery-skill-section';
    const descTitle = document.createElement('div');
    descTitle.className = 'gallery-skill-title';
    descTitle.textContent = '效果描述';
    descBox.appendChild(descTitle);
    const descContent = document.createElement('div');
    descContent.className = 'gallery-skill-intro';
    descContent.textContent = tDef.desc || '无描述';
    descBox.appendChild(descContent);
    descSection.appendChild(descBox);
    dialog.appendChild(descSection);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ybrpg-btn';
    closeBtn.style.width = '80px';
    closeBtn.style.padding = '6px';
    closeBtn.style.fontSize = '13px';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
    dialog.appendChild(closeBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    };
}

// 修改renderSettingsView函数中的按钮事件
function renderSettingsView(container) {
    // 清空容器以防重复渲染
    container.innerHTML = '';
    
    // 创建按钮组容器
    const groupDiv = document.createElement('div');
    groupDiv.className = 'settings-btn-group';
    
    // 图鉴行：角色图鉴 + 宝物图鉴
    const galleryRow = document.createElement('div');
    galleryRow.style.cssText = 'display:flex;gap:20px;justify-content:center;';
    
    // 角色图鉴按钮
    const galleryBtn = document.createElement('button');
    galleryBtn.className = 'ybrpg-settings-btn';
    galleryBtn.id = 'btn-setting-gallery';
    galleryBtn.textContent = '角色图鉴';
    galleryBtn.onclick = () => renderGalleryView(container);
    galleryRow.appendChild(galleryBtn);
    
    // 宝物图鉴按钮
    const treasureBtn = document.createElement('button');
    treasureBtn.className = 'ybrpg-settings-btn';
    treasureBtn.id = 'btn-setting-treasure-gallery';
    treasureBtn.textContent = '宝物图鉴';
    treasureBtn.onclick = () => renderTreasureGalleryView(container);
    galleryRow.appendChild(treasureBtn);
    
    groupDiv.appendChild(galleryRow);
    
// ... 之前的图鉴行 ...

// AI托管设置
const autoSettingRow = document.createElement('div');
autoSettingRow.style.cssText = 'display:flex;gap:15px;justify-content:center;align-items:center;width:100%;margin-top:10px;';

const autoLabel = document.createElement('span');
autoLabel.style.color = '#ccc';
autoLabel.style.fontSize = '14px';
autoLabel.textContent = 'AI战斗托管: ';

const autoToggle = document.createElement('button');
autoToggle.className = 'ybrpg-settings-btn';
autoToggle.style.cssText = 'width:70px;height:40px;font-size:14px;';
autoToggle.textContent = window.autoBattle ? '开启' : '关闭';
autoToggle.onclick = () => {
    window.autoBattle = !window.autoBattle;
    autoToggle.textContent = window.autoBattle ? '开启' : '关闭';
    toast(`AI战斗托管已${window.autoBattle ? '开启' : '关闭'}`, 'info');
};
autoSettingRow.appendChild(autoLabel);
autoSettingRow.appendChild(autoToggle);
groupDiv.appendChild(autoSettingRow);

// ... 存档管理按钮 ...


    // 存档管理按钮
    const saveBtn = document.createElement('button');
    saveBtn.className = 'ybrpg-settings-btn';
    saveBtn.id = 'btn-setting-save';
    saveBtn.textContent = '存档管理';
    saveBtn.onclick = () => showSaveView();
    groupDiv.appendChild(saveBtn);
    
    container.appendChild(groupDiv);
}

// 新增: 渲染角色图鉴视图
function renderGalleryView(container) {
    container.innerHTML = '';

    // 返回按钮
    const backBtn = document.createElement('button');
    backBtn.className = 'ybrpg-back-btn';
    backBtn.textContent = '← 返回';
    backBtn.onclick = () => {
        renderSettingsView(container);
    };
    container.appendChild(backBtn);

    // 阵营切换 Tab（回忆 / 梦境）
    if (!window.galleryTab) window.galleryTab = 'YB_memory';
    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'gallery-tabs';

    const tabMemory = document.createElement('button');
    tabMemory.className = 'gallery-tab-btn' + (window.galleryTab === 'YB_memory' ? ' active' : '');
    tabMemory.textContent = '回忆';
    tabMemory.onclick = () => {
        window.galleryTab = 'YB_memory';
        renderGalleryView(container);
    };

    const tabDream = document.createElement('button');
    tabDream.className = 'gallery-tab-btn' + (window.galleryTab === 'YB_dream' ? ' active' : '');
    tabDream.textContent = '梦境';
    tabDream.onclick = () => {
        window.galleryTab = 'YB_dream';
        renderGalleryView(container);
    };

    tabsDiv.appendChild(tabMemory);
    tabsDiv.appendChild(tabDream);
    container.appendChild(tabsDiv);

    // 按品质排序：传说 → 史诗（后续扩展：精品 → 普通 → 废材）
    const RANK_ORDER = ['legend', 'epic', 'rare', 'common', 'junk'];
    const RANK_LABELS = {
        legend: '传说',
        epic: '史诗',
        rare: '精品',
        common: '普通',
        junk: '废材'
    };
    const RANK_BORDER_COLORS = {
        legend: '#ff4444',
        epic: '#ff8800',
        rare: '#44aaff',
        common: '#88cc88',
        junk: '#888888'
    };

    // 筛选当前阵营的角色
    const currentGroup = window.galleryTab;
    const filteredChars = Object.entries(characterList).filter(
        ([, charData]) => charData.group === currentGroup
    );

    // 按品质分组
    const grouped = {};
    for (const [charId, charData] of filteredChars) {
        const rank = charData.rank || 'common';
        if (!grouped[rank]) grouped[rank] = [];
        grouped[rank].push({ id: charId, ...charData });
    }

    // 获取已拥有角色列表（调试：临时全部解锁）
    // const ownedChars = Object.keys(characterList);
    const ownedChars = gameData.data.handbook.ownedCharacters

    // 滚动容器
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'gallery-scroll';

    // 按 RANK_ORDER 顺序渲染各组
    for (const rank of RANK_ORDER) {
        if (!grouped[rank] || grouped[rank].length === 0) continue;

        // 品质标题
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'gallery-section-title';
        sectionTitle.textContent = RANK_LABELS[rank] || rank;
        sectionTitle.style.borderLeftColor = RANK_BORDER_COLORS[rank] || '#888';
        scrollDiv.appendChild(sectionTitle);

        // 角色网格
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        for (const char of grouped[rank]) {
            const isOwned = ownedChars.includes(char.id);
            const borderColor = RANK_BORDER_COLORS[rank] || '#888';

            const card = document.createElement('div');
            card.className = 'gallery-char-card';

            // 角色图标（64x64）
            const iconDiv = document.createElement('div');
            iconDiv.className = 'gallery-char-icon';
            iconDiv.style.borderColor = borderColor;

            if (isOwned) {
                // 尝试加载角色图片
                const img = document.createElement('img');
                img.className = 'gallery-char-img';
                img.src = `./image/character/${char.id}.jpg`;
                img.alt = char.name;
                img.onerror = function() {
                    // 图片加载失败，尝试 .webp
                    this.onerror = function() {
                        // .webp也失败，显示占位
                        this.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'gallery-char-placeholder';
                        placeholder.textContent = char.name.charAt(0);
                        this.parentNode.appendChild(placeholder);
                    };
                    this.src = `./image/character/${char.id}.webp`;
                };
                iconDiv.appendChild(img);
            } else {
                // 未拥有：显示问号
                const placeholder = document.createElement('div');
                placeholder.className = 'gallery-char-placeholder locked';
                placeholder.textContent = '?';
                iconDiv.appendChild(placeholder);
            }

            card.appendChild(iconDiv);

            // 角色名称
            const nameDiv = document.createElement('div');
            nameDiv.className = 'gallery-char-name';
            nameDiv.textContent = isOwned ? char.name : '???';
            if (isOwned && rank === 'legend') {
                nameDiv.style.color = '#ff6666';
            } else if (isOwned && rank === 'epic') {
                nameDiv.style.color = '#ffaa44';
            }
            card.appendChild(nameDiv);

            // 点击查看详情（已拥有的角色）
            if (isOwned) {
                card.style.cursor = 'pointer';
                card.onclick = () => {
                    showCharDetail(container, char);
                };
            }

            grid.appendChild(card);
        }

        scrollDiv.appendChild(grid);
    }

    container.appendChild(scrollDiv);
}

// 显示角色详情弹窗
function showCharDetail(_parentContainer, charData) {
    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'gallery-detail-dialog';

    // 角色名
    const nameDiv = document.createElement('div');
    nameDiv.className = 'gallery-detail-name';
    nameDiv.textContent = charData.name;
    dialog.appendChild(nameDiv);

    // 上半部分：图片 + 属性 横向排列
    const topDiv = document.createElement('div');
    topDiv.className = 'gallery-detail-top';

    // 角色大图（168x207，偏左上）
    const imgDiv = document.createElement('div');
    imgDiv.className = 'gallery-detail-img-container';
    const img = document.createElement('img');
    img.className = 'gallery-detail-img';
    img.src = `./image/character/${charData.id}.jpg`;
    img.alt = charData.name;
    img.onerror = function() {
        this.onerror = function() {
            this.style.display = 'none';
            const p = document.createElement('div');
            p.className = 'gallery-char-placeholder';
            p.style.width = '168px';
            p.style.height = '207px';
            p.style.fontSize = '50px';
            p.textContent = charData.name.charAt(0);
            this.parentNode.appendChild(p);
        };
        this.src = `./image/character/${charData.id}.webp`;
    };
    // 点击图片查看高清原图
    imgDiv.onclick = () => {
        showFullImage(charData.id, charData.name);
    };
    imgDiv.appendChild(img);
    topDiv.appendChild(imgDiv);

    // 右侧属性区域
    const attrDiv = document.createElement('div');
    attrDiv.className = 'gallery-detail-attr';

    const rankLabels = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
    const rankColors = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
    const tipLabels = { damage: '偏攻', recover: '偏防', balance: '均衡' };

    // 品质 + 等级（图鉴中显示基础等级 Lv.1）
    const rankDiv = document.createElement('div');
    rankDiv.className = 'gallery-detail-rank';
    const rankText = rankLabels[charData.rank] || charData.rank;
    rankDiv.innerHTML = `<span style="color:${rankColors[charData.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">Lv.1</span>`;
    attrDiv.appendChild(rankDiv);

    // 属性标签
    const tipDiv = document.createElement('div');
    tipDiv.style.fontSize = '12px';
    tipDiv.style.color = '#aaa';
    tipDiv.style.marginBottom = '4px';
    tipDiv.textContent = tipLabels[charData.tip] || charData.tip || '';
    attrDiv.appendChild(tipDiv);

    // 四维属性（图鉴显示基础值）
    const attrs = [
        { label: '生命', value: charData.hp },
        { label: '攻击', value: charData.atk },
        { label: '防御', value: charData.def },
        { label: '速度', value: charData.spe },
    ];
    attrs.forEach(a => {
        const row = document.createElement('div');
        row.className = 'gallery-detail-attr-row';
        row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${a.value}</span>`;
        attrDiv.appendChild(row);
    });

    topDiv.appendChild(attrDiv);
    dialog.appendChild(topDiv);

    // 下半部分：技能信息
    const skillsDiv = document.createElement('div');
    skillsDiv.className = 'gallery-detail-skills';

    // 获取角色的 skills 数组：[普攻id, 技能id, 必杀id(可选)]
    const skillIds = charData.skills || [];

    // 普攻
    if (skillIds[0] && contentList.pugong && contentList.pugong[skillIds[0]]) {
        const pg = contentList.pugong[skillIds[0]];
        const section = document.createElement('div');
        section.className = 'gallery-skill-section';

        const title = document.createElement('div');
        title.className = 'gallery-skill-title pugong';
        title.textContent = '普攻';
        section.appendChild(title);

        const nameEl = document.createElement('div');
        nameEl.className = 'gallery-skill-name';
        nameEl.textContent = pg.name;
        section.appendChild(nameEl);

        const intro = document.createElement('div');
        intro.className = 'gallery-skill-intro';
        intro.textContent = pg.intro;
        section.appendChild(intro);

        const aiIntro = document.createElement('div');
        aiIntro.className = 'gallery-skill-ai';
        aiIntro.textContent = 'AI倾向：' + pg.ai_intro;
        section.appendChild(aiIntro);

        skillsDiv.appendChild(section);
    }

    // 技能
    if (skillIds[1] && contentList.skill && contentList.skill[skillIds[1]]) {
        const sk = contentList.skill[skillIds[1]];
        const section = document.createElement('div');
        section.className = 'gallery-skill-section';

        const title = document.createElement('div');
        title.className = 'gallery-skill-title skill';
        title.textContent = '技能';
        section.appendChild(title);

        const nameEl = document.createElement('div');
        nameEl.className = 'gallery-skill-name';
        nameEl.textContent = sk.name;
        section.appendChild(nameEl);

        const intro = document.createElement('div');
        intro.className = 'gallery-skill-intro';
        intro.textContent = sk.intro;
        section.appendChild(intro);

        const aiIntro = document.createElement('div');
        aiIntro.className = 'gallery-skill-ai';
        aiIntro.textContent = 'AI倾向：' + sk.ai_intro;
        section.appendChild(aiIntro);

        skillsDiv.appendChild(section);
    }

    // 必杀
    if (skillIds[2] && contentList.spskill && contentList.spskill[skillIds[2]]) {
        const sp = contentList.spskill[skillIds[2]];
        const section = document.createElement('div');
        section.className = 'gallery-skill-section';

        const title = document.createElement('div');
        title.className = 'gallery-skill-title spskill';
        title.textContent = '必杀';
        section.appendChild(title);

        const nameEl = document.createElement('div');
        nameEl.className = 'gallery-skill-name';
        nameEl.textContent = sp.name;
        section.appendChild(nameEl);

        const intro = document.createElement('div');
        intro.className = 'gallery-skill-intro';
        intro.textContent = sp.intro;
        section.appendChild(intro);

        const aiIntro = document.createElement('div');
        aiIntro.className = 'gallery-skill-ai';
        aiIntro.textContent = 'AI倾向：' + sp.ai_intro;
        section.appendChild(aiIntro);

        skillsDiv.appendChild(section);
    }

    dialog.appendChild(skillsDiv);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ybrpg-btn';
    closeBtn.style.width = '80px';
    closeBtn.style.padding = '6px';
    closeBtn.style.fontSize = '13px';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
    dialog.appendChild(closeBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    };
}

// 显示高清原图弹窗
function showFullImage(charId, charName) {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-fullimg-overlay';

    const img = document.createElement('img');
    img.src = `./image/character/${charId}.jpg`;
    img.alt = charName;
    img.onerror = function() {
        this.onerror = function() {
            this.style.display = 'none';
            const p = document.createElement('div');
            p.style.color = '#666';
            p.style.fontSize = '24px';
            p.textContent = '图片不可用';
            this.parentNode.appendChild(p);
        };
        this.src = `./image/character/${charId}.webp`;
    };

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // 点击任意位置关闭
    overlay.onclick = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
}

// ========== 宝物图鉴 ==========

/**
 * 宝物触发时点中文映射
 */
const TREASURE_TYPE_LABELS = {
    'on_kill': '击杀时',
    'on_any_death': '有人阵亡时',
    'on_turn_start': '回合开始',
    'on_hit': '被攻击时',
    'on_skill': '技能后',
    'on_damage_dealt': '伤害后',
    'on_attack': '普攻时',
    'passive': '被动',
    'on_death': '亡语',
    'on_pugong': '普攻特效',
};

/**
 * 宝物品质颜色映射（按价格区间）
 */
function getTreasureRankInfo(price) {
    if (price >= 350) return { label: '珍稀', color: '#ff8800' };
    if (price >= 250) return { label: '上品', color: '#44aaff' };
    if (price >= 180) return { label: '良品', color: '#88cc88' };
    return { label: '普通', color: '#888' };
}

/**
 * 渲染宝物图鉴视图
 */
function renderTreasureGalleryView(container) {
    container.innerHTML = '';

    // 返回按钮
    const backBtn = document.createElement('button');
    backBtn.className = 'ybrpg-back-btn';
    backBtn.textContent = '← 返回';
    backBtn.onclick = () => {
        renderSettingsView(container);
    };
    container.appendChild(backBtn);

    // 标题
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'text-align:center;color:#ffd700;font-size:18px;font-weight:bold;margin:10px 0 5px;';
    titleDiv.textContent = '宝物图鉴';
    container.appendChild(titleDiv);

    // 统计
    const treasureDefs = gameData.getTreasureList();
    const treasureIds = Object.keys(treasureDefs);
    const ownedBag = window.treasureBagData || {};
    const ownedCount = Object.keys(ownedBag).length;

    const statDiv = document.createElement('div');
    statDiv.style.cssText = 'text-align:center;color:#aaa;font-size:12px;margin-bottom:10px;';
    statDiv.textContent = `已收集 ${ownedCount} / ${treasureIds.length}`;
    container.appendChild(statDiv);

    // 按触发时点分类
    const TYPE_ORDER = ['passive', 'on_turn_start', 'on_pugong', 'on_hit', 'on_skill', 'on_damage_dealt', 'on_kill', 'on_any_death', 'on_death'];
    const grouped = {};
    for (const tid of treasureIds) {
        const tDef = treasureDefs[tid];
        const type = tDef.type || 'other';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push({ id: tid, ...tDef });
    }

    // 滚动容器
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'gallery-scroll';

    for (const typeKey of TYPE_ORDER) {
        if (!grouped[typeKey] || grouped[typeKey].length === 0) continue;

        // 类型标题
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'gallery-section-title';
        sectionTitle.textContent = TREASURE_TYPE_LABELS[typeKey] || typeKey;
        sectionTitle.style.borderLeftColor = '#c0a060';
        scrollDiv.appendChild(sectionTitle);

        // 宝物网格
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        for (const t of grouped[typeKey]) {
            const isOwned = ownedBag[t.id] && ownedBag[t.id].count > 0;
            const rankInfo = getTreasureRankInfo(t.price || 0);

            const card = document.createElement('div');
            card.className = 'gallery-char-card';
            card.style.cursor = 'pointer';

            // 宝物图标
            const iconDiv = document.createElement('div');
            iconDiv.className = 'gallery-char-icon';
            iconDiv.style.borderColor = isOwned ? rankInfo.color : '#555';

            if (isOwned && t.icon) {
                const img = document.createElement('img');
                img.className = 'gallery-char-img';
                img.src = t.icon;
                img.alt = t.name;
                img.style.objectFit = 'contain';
                img.onerror = function() {
                    this.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'gallery-char-placeholder';
                    placeholder.textContent = t.name.charAt(0);
                    this.parentNode.appendChild(placeholder);
                };
                iconDiv.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'gallery-char-placeholder' + (isOwned ? '' : ' locked');
                if (isOwned) {
                    placeholder.textContent = t.name.charAt(0);
                } else {
                    placeholder.textContent = '?';
                }
                iconDiv.appendChild(placeholder);
            }

            card.appendChild(iconDiv);

            // 宝物名称
            const nameDiv = document.createElement('div');
            nameDiv.className = 'gallery-char-name';
            nameDiv.textContent = isOwned ? t.name : '???';
            if (isOwned) nameDiv.style.color = rankInfo.color;
            card.appendChild(nameDiv);

            // 点击查看详情
            card.onclick = () => {
                showTreasureGalleryDetail(t, isOwned, rankInfo);
            };

            grid.appendChild(card);
        }

        scrollDiv.appendChild(grid);
    }

    container.appendChild(scrollDiv);
}

/**
 * 宝物图鉴详情弹窗
 */
function showTreasureGalleryDetail(tDef, isOwned, rankInfo) {
    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'gallery-detail-dialog';

    // 宝物名称
    const nameDiv = document.createElement('div');
    nameDiv.className = 'gallery-detail-name';
    nameDiv.textContent = isOwned ? tDef.name : '???';
    dialog.appendChild(nameDiv);

    // 上半部分：图标 + 属性 横向排列
    const topDiv = document.createElement('div');
    topDiv.className = 'gallery-detail-top';

    // 宝物大图
    const imgDiv = document.createElement('div');
    imgDiv.className = 'gallery-detail-img-container';
    imgDiv.style.cssText = 'width:140px;height:140px;display:flex;align-items:center;justify-content:center;background:#2a2a2a;';

    if (isOwned && tDef.icon) {
        const img = document.createElement('img');
        img.src = tDef.icon;
        img.alt = tDef.name;
        img.style.cssText = 'max-width:120px;max-height:120px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,215,0,0.4));';
        img.onerror = function() {
            imgDiv.innerHTML = '';
            const p = document.createElement('div');
            p.className = 'gallery-char-placeholder';
            p.style.cssText = 'width:140px;height:140px;font-size:60px;';
            p.textContent = tDef.name.charAt(0);
            imgDiv.appendChild(p);
        };
        imgDiv.appendChild(img);
    } else {
        const p = document.createElement('div');
        p.className = 'gallery-char-placeholder locked';
        p.style.cssText = 'width:140px;height:140px;font-size:50px;';
        p.textContent = '?';
        imgDiv.appendChild(p);
    }
    topDiv.appendChild(imgDiv);

    // 右侧属性区域
    const attrDiv = document.createElement('div');
    attrDiv.className = 'gallery-detail-attr';

    if (isOwned) {
        // 品质
        const rankDiv = document.createElement('div');
        rankDiv.className = 'gallery-detail-rank';
        rankDiv.innerHTML = `<span style="color:${rankInfo.color}">${rankInfo.label}</span>`;
        attrDiv.appendChild(rankDiv);

        // 触发时点
        const typeRow = document.createElement('div');
        typeRow.className = 'gallery-detail-attr-row';
        typeRow.innerHTML = `<span class="attr-label">触发时点</span><span class="attr-value" style="color:#ffd700">${TREASURE_TYPE_LABELS[tDef.type] || tDef.type}</span>`;
        attrDiv.appendChild(typeRow);

        // 价格
        const priceRow = document.createElement('div');
        priceRow.className = 'gallery-detail-attr-row';
        priceRow.innerHTML = `<span class="attr-label">售价</span><span class="attr-value" style="color:#ffcc00">${tDef.price || 0} 金</span>`;
        attrDiv.appendChild(priceRow);

        // 持有数量
        const bag = window.treasureBagData || {};
        const count = bag[tDef.id] ? bag[tDef.id].count : 0;
        const countRow = document.createElement('div');
        countRow.className = 'gallery-detail-attr-row';
        countRow.innerHTML = `<span class="attr-label">持有</span><span class="attr-value">${count}</span>`;
        attrDiv.appendChild(countRow);

        // 装备者
        if (bag[tDef.id] && bag[tDef.id].equippedBy && bag[tDef.id].equippedBy.length > 0) {
            const equipNames = bag[tDef.id].equippedBy.map(cid => {
                const cData = characterList[cid];
                return cData ? cData.name : cid;
            });
            const eqRow = document.createElement('div');
            eqRow.className = 'gallery-detail-attr-row';
            eqRow.innerHTML = `<span class="attr-label">装备者</span><span class="attr-value" style="color:#ffa500;font-size:11px;">${equipNames.join(', ')}</span>`;
            attrDiv.appendChild(eqRow);
        }
    } else {
        const lockDiv = document.createElement('div');
        lockDiv.style.cssText = 'color:#666;font-size:13px;text-align:center;margin-top:20px;';
        lockDiv.textContent = '尚未获得';
        attrDiv.appendChild(lockDiv);
    }

    topDiv.appendChild(attrDiv);
    dialog.appendChild(topDiv);

    // 下半部分：描述
    const descDiv = document.createElement('div');
    descDiv.className = 'gallery-detail-skills';

    const descSection = document.createElement('div');
    descSection.className = 'gallery-skill-section';

    const descTitle = document.createElement('div');
    descTitle.className = 'gallery-skill-title skill';
    descTitle.textContent = '效果描述';
    descSection.appendChild(descTitle);

    const descText = document.createElement('div');
    descText.className = 'gallery-skill-intro';
    descText.style.cssText = 'font-size:13px;color:#ccc;line-height:1.6;';
    descText.textContent = isOwned ? (tDef.desc || '暂无描述') : '???';
    descSection.appendChild(descText);

    descDiv.appendChild(descSection);
    dialog.appendChild(descDiv);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ybrpg-btn';
    closeBtn.style.cssText = 'width:80px;padding:6px;font-size:13px;';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
    dialog.appendChild(closeBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    };
}

// ========== 角色背包数据 ==========

// 获取存档中的角色数据（含等级、实际数值）
function getCharSaveData(charId) {
    if (!window.charBagData) window.charBagData = {};
    if (!window.charBagData[charId]) {
        const base = characterList[charId];
        if (!base) return null;
        window.charBagData[charId] = {
            level: 1,
            hp: base.hp,
            atk: base.atk,
            def: base.def,
            spe: base.spe,
            buff: [],
        };
    }
    return window.charBagData[charId];
}


// 新增: 渲染副本视图
function renderDungeonView(container, selectedChapterKey = null) {
    // 清空容器以防重复渲染
    container.innerHTML = '';

    // 确保容器本身有合适的布局上下文，防止子元素绝对定位溢出等导致覆盖
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = '100%'; // 假设父容器有高度，或者根据需要调整
    container.style.overflow = 'hidden'; // 防止整体溢出

    // 如果传入了 selectedChapterKey，则渲染该章节的事件目录（子页面）
    if (selectedChapterKey && eventList[selectedChapterKey]) {
        renderChapterEventList(container, selectedChapterKey);
        return;
    }

    // 否则渲染章节列表（主页面）

    // 1. 上方展示难度按钮 (普通, 噩梦, 地狱)
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.display = 'flex';
    difficultyContainer.style.justifyContent = 'center';
    difficultyContainer.style.gap = '10px';
    difficultyContainer.style.marginBottom = '20px'; 
    difficultyContainer.style.width = '100%';
    difficultyContainer.style.flexShrink = '0'; 

    const difficulties = [
        { name: '普通', key: 'normal' },
        { name: '噩梦', key: 'nightmare' },
        { name: '地狱', key: 'hell' }
    ];
    
    // 获取当前选中的难度，默认为普通
    let currentDifficulty = window.currentDifficulty || 'normal';

    // 获取所有章节key并排序（提前声明，供难度解锁检查和章节列表共用）
    const chapterKeys = Object.keys(eventList).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    // 检查难度解锁状态 - 只要存在任意一章该难度可玩，即视为解锁
    const isDifficultyUnlocked = (diffKey) => {
        if (diffKey === 'normal') return true;
        
        // 遍历所有章节，只要有任意一章满足解锁条件即可
        for (const chKey of chapterKeys) {
            const chNum = parseInt(chKey.replace(/\D/g, '')) || 0;
            if (diffKey === 'nightmare') {
                // 噩梦解锁：上一章噩梦通关 + 当前章普通通关
                const normalLastEvent = `c${chNum}-10`;
                const prevNightmareLastEvent = `c${chNum - 1}-10_nightmare`;
                const prevOk = chNum === 1 || !!window.playerProgress?.[prevNightmareLastEvent];
                if (prevOk && !!window.playerProgress?.[normalLastEvent]) return true;
            } else if (diffKey === 'hell') {
                // 地狱解锁：上一章地狱通关 + 当前章噩梦通关
                const nightmareLastEvent = `c${chNum}-10_nightmare`;
                const prevHellLastEvent = `c${chNum - 1}-10_hell`;
                const prevOk = chNum === 1 || !!window.playerProgress?.[prevHellLastEvent];
                if (prevOk && !!window.playerProgress?.[nightmareLastEvent]) return true;
            }
        }
        return false;
    };

    difficulties.forEach(diff => {
        const btn = document.createElement('button');
        btn.className = 'ybrpg-btn';
        btn.style.width = '80px';
        btn.style.padding = '5px';
        btn.style.fontSize = '14px';
        btn.textContent = diff.name;
        
        const unlocked = isDifficultyUnlocked(diff.key);
        const isSelected = currentDifficulty === diff.key;

        if (isSelected) {
            btn.style.borderColor = '#ffd700';
            btn.style.background = '#444';
        } else {
            btn.style.borderColor = '#555';
            btn.style.background = '#333';
        }

        if (!unlocked) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = '尚未解锁';
        }

        btn.onclick = () => {
            if (!unlocked) return;
            console.log(`切换难度: ${diff.name}`);
            window.currentDifficulty = diff.key;
            renderDungeonView(container, null); // 重新渲染以更新按钮状态
        };
        difficultyContainer.appendChild(btn);
    });
    container.appendChild(difficultyContainer);

    // 2. 中央展示章节列表
    const listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.alignItems = 'center';
    listContainer.style.gap = '10px';
    listContainer.style.width = '100%';
    listContainer.style.maxWidth = '400px';
    listContainer.style.flex = '1'; 
    listContainer.style.overflowY = 'auto'; 
    listContainer.style.paddingBottom = '20px'; 

    let prevChapterCompleted = true; // 第一章默认前置条件满足
    // currentDifficulty 已在函数开头声明，直接使用

    // 遍历章节
    for (const chapterKey of chapterKeys) {
        const chapterData = eventList[chapterKey];
        if (!chapterData.eventPack) continue;

        // 检查前一章是否完成，如果未完成，则当前章及后续章节隐藏
        if (!prevChapterCompleted) {
            break; // 跳出循环，隐藏后续章节
        }

        // 高难度额外解锁条件：当前章低一难度通关
        const chapterNum = parseInt(chapterKey.replace(/\D/g, '')) || 1;
        let chapterVisible = true;
        if (currentDifficulty === 'nightmare') {
            // 噩梦：需要当前章普通通关
            const normalLastEvent = `c${chapterNum}-10`;
            chapterVisible = !!window.playerProgress?.[normalLastEvent];
        } else if (currentDifficulty === 'hell') {
            // 地狱：需要当前章噩梦通关
            const nightmareLastEvent = `c${chapterNum}-10_nightmare`;
            chapterVisible = !!window.playerProgress?.[nightmareLastEvent];
        }

        if (!chapterVisible) {
            // 当前章低一难度未通关，隐藏当前章及后续
            break;
        }

        // 章节标题按钮
        const chapterBtn = document.createElement('button');
        chapterBtn.className = 'ybrpg-btn';
        chapterBtn.style.width = '95%';
        chapterBtn.style.marginBottom = '5px';
        // 将 chapter1 转换为更友好的显示名称，如 "章节 1"
        const chapterName = chapterData.name || chapterKey.replace(/chapter/i, '章节 ').replace(/(\d+)/, '$1'); 
        chapterBtn.textContent = `▶ ${chapterName}`;
        
        // 章节按钮点击事件：进入该章节的子页面
        chapterBtn.onclick = () => {
            // 保存当前选中的章节，用于难度解锁判断
            window.selectedChapter = chapterKey;
            renderDungeonView(container, chapterKey);
        };

        listContainer.appendChild(chapterBtn);

        // 检查当前章节是否完成，以决定下一章是否显示
        // 根据当前难度判断章节完成状态
        const procedure = chapterData.procedure || [];
        const eventIds = procedure.length > 0 ? procedure : Object.keys(chapterData.eventPack);
        let lastEventId = eventIds[eventIds.length - 1];
        
        // 如果是噩梦/地狱难度，需要使用对应的eventId
        if (currentDifficulty === 'nightmare') {
            lastEventId = lastEventId + '_nightmare';
        } else if (currentDifficulty === 'hell') {
            lastEventId = lastEventId + '_hell';
        }
        
        // 更新 prevChapterCompleted 状态
        // 如果当前章节没有任何事件，或者最后一个事件已完成，则下一章解锁
        if (lastEventId) {
            prevChapterCompleted = !!window.playerProgress?.[lastEventId];
        } else {
            prevChapterCompleted = false; // 如果没有事件，默认不解锁下一章
        }
    }

    container.appendChild(listContainer);
}

// 新增: 难度缩放配置
const DIFFICULTY_SCALE = {
    normal: { hp: 1.0, atk: 1.0, def: 1.0, gold: 1.0, name: '普通' },
    nightmare: { hp: 1.5, atk: 1.3, def: 1.3, gold: 1.5, name: '噩梦' },
    hell: { hp: 2.0, atk: 1.6, def: 1.6, gold: 2.0, name: '地狱' }
};

// 根据难度获取事件数据（支持噩梦和地狱难度）
function getEventForDifficulty(chapterKey, eventId, difficulty) {
    if (difficulty === 'normal') {
        return eventList[chapterKey]?.eventPack?.[eventId];
    }
    
    // 噩梦/地狱难度：尝试从 eventPack 中查找对应难度的事件
    const nightmareEventId = eventId + '_' + difficulty;
    return eventList[chapterKey]?.eventPack?.[nightmareEventId];
}

/**
 * 构建玩家战斗队伍数据
 * 
 * 该函数根据当前选中的队伍实例ID列表，从角色背包数据和基础角色配置中提取信息，
 * 组装成适用于战斗系统的标准化角色对象数组。
 * 
 * @returns {Array<Object>} 返回包含战斗所需角色信息的对象数组。
 *                          每个对象包含以下属性：
 *                          - id: 角色基础ID (charId)
 *                          - instanceId: 角色实例ID
 *                          - name: 角色名称
 *                          - hp: 生命值
 *                          - atk: 攻击力
 *                          - def: 防御力
 *                          - spe: 速度
 *                          - skills: 技能列表
 *                          - buff: 增益状态列表
 *                          - treasures: 装备的宝物列表
 */
function buildPlayerTeamForBattle() {
    return (window.currentTeam || []).map(instanceId => {
        const instData = window.charBagData && window.charBagData[instanceId];
        
        // 如果找不到实例数据，返回默认的空角色对象以防止后续逻辑出错
        if (!instData) return { id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [], treasures: [] };

        const charId = instData.charId || instanceId;
        const base = characterList[charId];
        
        // 获取实例独立的宝物列表（使用 instanceId）
        const treasures = (window.treasureEquipData && window.treasureEquipData[instanceId]) || [];

        return {
            id: charId,                             // 战斗内技能查找仍用 charId
            instanceId: instanceId,                  // 传递实例ID供宝物系统使用
            name: base ? base.name : charId,
            hp: instData.hp || (base ? base.hp : 0),
            atk: instData.atk || (base ? base.atk : 0),
            def: instData.def || (base ? base.def : 0),
            spe: instData.spe || (base ? base.spe : 0),
            skills: base ? base.skills : [],
            buff: instData.buff || [],
            treasures: treasures,                    // 宝物数组，用于战斗内时点触发
        };
    });
}


// 新增: 渲染特定章节的事件列表（子页面）
function renderChapterEventList(container, chapterKey) {
    // 修复: 清空容器以防重复渲染
    container.innerHTML = '';
    
    const chapterData = eventList[chapterKey];
    if (!chapterData) return;

    // 获取当前难度
    let currentDifficulty = window.currentDifficulty || 'normal';

    // 创建返回按钮和章节标题容器
    const headerDiv = document.createElement('div');
    headerDiv.style.width = '100%';
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '10px';
    headerDiv.style.paddingLeft = '10px';
    headerDiv.style.paddingRight = '10px';
    headerDiv.style.boxSizing = 'border-box';

    const backBtn = document.createElement('button');
    backBtn.className = 'ybrpg-btn';
    backBtn.style.width = 'auto';
    backBtn.style.padding = '5px 15px';
    backBtn.textContent = '← 返回';
    backBtn.onclick = () => {
        renderDungeonView(container, null); // 返回主视图
    };
    headerDiv.appendChild(backBtn);

    // 右侧显示章节标题和难度
    const chapterName = chapterData.name || chapterKey.replace(/chapter/i, '章节 ').replace(/(\d+)/, '$1');
    const difficultyName = DIFFICULTY_SCALE[currentDifficulty]?.name || '普通';
    const headerTitle = document.createElement('div');
    headerTitle.textContent = `${chapterName} [${difficultyName}]`;
    headerTitle.style.color = '#ffd700';
    headerTitle.style.fontSize = '15px';
    headerTitle.style.whiteSpace = 'nowrap';
    headerTitle.style.flexShrink = '0';
    headerDiv.appendChild(headerTitle);

    container.appendChild(headerDiv);

    // 创建事件列表容器
    const listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.alignItems = 'center';
    listContainer.style.gap = '10px';
    listContainer.style.width = '100%';
    listContainer.style.maxWidth = '400px';
    listContainer.style.flex = '1'; 
    listContainer.style.overflowY = 'auto'; 
    listContainer.style.paddingBottom = '20px'; 

    // 模拟玩家通关状态
    const playerProgress = window.playerProgress || {};

    // 生成该章节下的所有子剧本按钮
    const procedure = chapterData.procedure || [];
    // 如果 procedure 为空，则遍历 eventPack 的所有 key
    const eventIds = procedure.length > 0 ? procedure : Object.keys(chapterData.eventPack);

    // 获取难度缩放配置
    const scale = DIFFICULTY_SCALE[currentDifficulty] || DIFFICULTY_SCALE.normal;

    // 解锁条件检查
    const chapterNum = parseInt(chapterKey.replace(/\D/g, '')) || 1;
    
    // 高难度解锁条件：上一章通关 + 当前章通关
    // 普通难度章节1默认解锁
    // 噩梦章节N解锁：普通章节N-1通关 AND 普通章节N通关
    // 地狱章节N解锁：噩梦章节N-1通关 AND 噩梦章节N通关
    let difficultyUnlocked = true; // 普通难度默认解锁
    
    if (currentDifficulty === 'nightmare') {
        // 噩梦难度：需要上一章噩梦通关 + 当前章普通通关
        const normalLastEvent = `c${chapterNum}-10`;
        const prevNightmareLastEvent = `c${chapterNum - 1}-10_nightmare`;
        const prevChapterCompleted = chapterNum === 1 || !!window.playerProgress?.[prevNightmareLastEvent];
        difficultyUnlocked = prevChapterCompleted && !!window.playerProgress?.[normalLastEvent];
    } else if (currentDifficulty === 'hell') {
        // 地狱难度：需要上一章地狱通关 + 当前章噩梦通关
        const nightmareLastEvent = `c${chapterNum}-10_nightmare`;
        const prevHellLastEvent = `c${chapterNum - 1}-10_hell`;
        const prevChapterCompleted = chapterNum === 1 || !!window.playerProgress?.[prevHellLastEvent];
        difficultyUnlocked = prevChapterCompleted && !!window.playerProgress?.[nightmareLastEvent];
    }

    // 第一个事件是否解锁（难度已解锁时，第一个事件才解锁）
    let firstEventUnlocked = difficultyUnlocked;
    let prevEventCompleted = false; // 前一个事件是否完成，初始为false

    eventIds.forEach((eventId, index) => {
        // 根据难度获取事件数据
        let event = chapterData.eventPack[eventId];
        
        // 如果是噩梦/地狱难度，尝试获取对应难度的事件
        if (currentDifficulty !== 'normal') {
            const diffEventId = eventId + '_' + currentDifficulty;
            if (chapterData.eventPack[diffEventId]) {
                event = chapterData.eventPack[diffEventId];
            } else {
                // 如果没有噩梦/地狱难度的事件，则使用普通难度事件但应用缩放
                // 克隆事件以避免修改原始数据
                event = JSON.parse(JSON.stringify(chapterData.eventPack[eventId]));
                // 应用难度缩放
                event.enemy = event.enemy.map(e => {
                    if (e && e.id) {
                        return {
                            ...e,
                            hp: Math.floor(e.hp * scale.hp),
                            atk: Math.floor(e.atk * scale.atk),
                            def: Math.floor(e.def * scale.def)
                        };
                    }
                    return e;
                });
            }
        }
        
        if (!event) return;

        // 如果难度未解锁，则隐藏所有事件
        if (!difficultyUnlocked) {
            return; // 难度未解锁，隐藏所有事件
        }
        
        // 所有难度：事件需要逐个解锁才能显示
        let canShow = index === 0 || prevEventCompleted;
        
        if (!canShow) {
            return; // 跳过当前及后续事件
        }

        // 高难度解锁逻辑：第一个事件难度解锁即解锁，后续根据当前难度进度
        let isUnlocked = false;
        
        if (currentDifficulty === 'normal') {
            // 普通难度：根据前驱事件判断
            const prevEventId = event.prev;
            isUnlocked = !prevEventId || !!playerProgress[prevEventId];
        } else {
            // 高难度：第一个事件难度解锁即解锁，后续根据前一个事件完成状态
            if (index === 0) {
                isUnlocked = firstEventUnlocked;
            } else {
                // 检查前一个事件在该难度下是否完成（始终使用带难度后缀的ID）
                const prevEventId = eventIds[index - 1] + '_' + currentDifficulty;
                isUnlocked = !!playerProgress[prevEventId];
            }
        }

        // 根据难度调整当前事件的完成状态检查
        // 高难度下始终使用带难度后缀的ID检查进度，避免与普通难度进度混淆
        let checkEventId = eventId;
        if (currentDifficulty !== 'normal') {
            checkEventId = eventId + '_' + currentDifficulty;
        }
        const currentEventCompleted = !!playerProgress[checkEventId];
        
        const levelBtn = document.createElement('button');
        levelBtn.className = 'ybrpg-btn';
        levelBtn.style.width = '90%';
        levelBtn.style.fontSize = '14px';
        levelBtn.style.padding = '8px';
        levelBtn.textContent = `${event.name}`;
        
        if (!isUnlocked) {
            levelBtn.disabled = true;
            levelBtn.style.opacity = '0.5';
            levelBtn.style.cursor = 'not-allowed';
            levelBtn.textContent += ' [未解锁]';
        } else {
            levelBtn.onclick = () => {
                console.log(`进入副本: ${event.name}, ID: ${checkEventId}, 难度: ${currentDifficulty}`);
                
                // 确保宝物装备数据已同步
                syncTreasureEquipData();

                // 修改：使用新的辅助函数构建队伍数据
                const playerTeam = buildPlayerTeamForBattle();

                // 补齐6个位置
                while (playerTeam.length < 6) {
                    playerTeam.push({ id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [] });
                }

                // 构建敌方数据（普通难度时event.enemy为原始数据，其他难度已在上游缩放）
                const enemyTeam = (event.enemy || []).map(e => {
                    if (!e || !e.id) return { id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [] };
                    const base = characterList[e.id] || {};
                    return {
                        id: e.id,
                        name: e.name || base.name || e.id,
                        hp: e.hp || 0,
                        atk: e.atk || 0,
                        def: e.def || 0,
                        spe: e.spe || 0,
                        skills: base.skills || [],
                        buff: e.buff || [],
                        treasures: e.treasures || [],
                    };
                });

                // 补齐6个位置
                while (enemyTeam.length < 6) {
                    enemyTeam.push({ id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [] });
                }

                // 启动战斗
                startBattle(playerTeam, enemyTeam, {
                    difficulty: currentDifficulty,
                    eventId: checkEventId,
                    eventType: event.type || 'battle',
                    chapterKey: chapterKey,
                    goldScale: DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0,
                    onWin: () => {
                        if (!window.playerProgress) window.playerProgress = {};
                        window.playerProgress[checkEventId] = true;
                        // 战斗胜利金币奖励
                        const enemyCount = (event.enemy || []).filter(e => e && e.id).length;
                        const isBoss = event.type === 'boss';
                        const baseGold = 50 + enemyCount * 30;
                        const goldScale = DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0;
                        const goldReward = Math.floor((isBoss ? baseGold * 2 : baseGold) * goldScale);
                        window.gameGold = (window.gameGold || 0) + goldReward;
                        // 事件完成后自动存档
                        SaveManager.autoSave();
                        toast(`恭喜通关 ${DIFFICULTY_SCALE[currentDifficulty]?.name || ''}: ${event.name}！获得 ${goldReward} 金币`, 'success');
                        // 重新渲染副本视图
                        const dungeonView = document.getElementById('dungeon-view');
                        if (dungeonView) {
                            hideOtherViews('dungeon-view');
                            dungeonView.style.display = 'flex';
                            renderDungeonView(dungeonView, chapterKey);
                        }
                    },
                    onLose: () => {
                        toast(`挑战失败: ${event.name}`, 'warning');
                        const dungeonView = document.getElementById('dungeon-view');
                        if (dungeonView) {
                            hideOtherViews('dungeon-view');
                            dungeonView.style.display = 'flex';
                            renderDungeonView(dungeonView, chapterKey);
                        }
                    }
                });
            };
        }
        listContainer.appendChild(levelBtn);

        // 更新 prevEventCompleted 供下一次循环使用
        // 只有当前事件已完成，下一个事件才会显示
        prevEventCompleted = currentEventCompleted;
    });

    container.appendChild(listContainer);
}


// 新增: 渲染商店视图
// 商店数据：存储在 window.shopData 中
// { items: [{type:'treasure'|'character', id, price, sold}], refreshCost: 50 }

/**
 * 获取角色品质对应价格
 */
function getCharPrice(rank) {
    return { legend: 500, epic: 300 }[rank] || 200;
}

/**
 * 获取角色品质颜色
 */
function getRankColor(rank) {
    return { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' }[rank] || '#888';
}

/**
 * 获取角色品质中文名
 */
function getRankName(rank) {
    return { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' }[rank] || '普通';
}

/**
 * 刷新商店物品
 */
function refreshShopItems() {
    if (!window.shopData) window.shopData = { items: [], refreshCost: 50 };
    const items = [];

    // 随机生成8个宝物
    const allTreasureIds = Object.keys(gameData.getTreasureList());
    const shuffledTreasures = [...allTreasureIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(8, shuffledTreasures.length); i++) {
        const tid = shuffledTreasures[i];
        const tDef = gameData.getTreasureList()[tid];
        if (tDef) {
            items.push({
                type: 'treasure',
                id: tid,
                name: tDef.name,
                desc: tDef.desc,
                price: tDef.price || 200,
                sold: false,
                icon: tDef.icon || `./image/equip/${tid}.png`,
            });
        }
    }

    // 修改：随机生成8个角色（允许重复，不再排除已拥有）
    const allCharIds = Object.keys(characterList || {});
    // 不再过滤 unownedChars，直接从 allCharIds 中随机
    const shuffledChars = [...allCharIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(8, shuffledChars.length); i++) {
        const cid = shuffledChars[i];
        const cData = characterList[cid];
        if (cData) {
            items.push({
                type: 'character',
                id: cid,
                name: cData.name,
                desc: `${getRankName(cData.rank)} | HP:${cData.hp} ATK:${cData.atk} DEF:${cData.def}`,
                price: getCharPrice(cData.rank),
                sold: false,
                rank: cData.rank,
                icon: `./image/character/${cid}.jpg`,
            });
        }
    }

    window.shopData.items = items;
    window.shopData.refreshCost = 50;
    return items;
}

// 显示物品/角色详情弹窗
function showItemDetail(item) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-detail-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // 创建详情卡片
    const card = document.createElement('div');
    card.style.cssText = `
        background: #2a2a2a;
        border: 2px solid #555;
        border-radius: 12px;
        padding: 20px;
        max-width: 320px;
        width: 90%;
        color: #fff;
    `;
    
    let content = '';
    
    if (item.type === 'character') {
        // 角色详情
        const charData = characterList[item.id] || {};
        const rankColor = getRankColor(item.rank) || '#fff';
        content = `
            <div style="text-align:center;margin-bottom:15px;">
                <div style="width:80px;height:80px;margin:0 auto;border:3px solid ${rankColor};border-radius:8px;overflow:hidden;background:#444;">
                    ${item.icon ? `<img src="${item.icon}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='?'">` : '<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:30px;">?</span>'}
                </div>
                <h3 style="margin:10px 0 5px;color:${rankColor};">${item.name}</h3>
                <div style="font-size:12px;color:#888;">${getRankText(item.rank)}</div>
            </div>
            <div style="font-size:14px;line-height:1.8;">
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #444;">
                    <span style="color:#aaa;">生命</span>
                    <span style="color:#4caf50;">❤️ ${charData.hp || 0}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #444;">
                    <span style="color:#aaa;">攻击</span>
                    <span style="color:#f44336;">⚔️ ${charData.atk || 0}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #444;">
                    <span style="color:#aaa;">防御</span>
                    <span style="color:#2196f3;">🛡️ ${charData.def || 0}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #444;">
                    <span style="color:#aaa;">速度</span>
                    <span style="color:#ff9800;">⚡ ${charData.spe || 0}</span>
                </div>
                ${item.desc ? `<div style="margin-top:10px;padding:8px;background:#333;border-radius:6px;font-size:12px;color:#ccc;">${item.desc}</div>` : ''}
            </div>
        `;
    } else {
        // 宝物详情
        content = `
            <div style="text-align:center;margin-bottom:15px;">
                <div style="width:80px;height:80px;margin:0 auto;border:3px solid #888;border-radius:8px;overflow:hidden;background:#444;">
                    ${item.icon ? `<img src="${item.icon}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='?'">` : '<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:30px;">?</span>'}
                </div>
                <h3 style="margin:10px 0 5px;color:#fff;">${item.name}</h3>
            </div>
            ${item.desc ? `<div style="padding:8px;background:#333;border-radius:6px;font-size:14px;color:#ccc;line-height:1.6;">${item.desc}</div>` : '<div style="color:#888;text-align:center;">暂无描述</div>'}
        `;
    }
    
    card.innerHTML = content;
    
    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        width: 100%;
        margin-top: 15px;
        padding: 10px;
        background: #555;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#666';
    closeBtn.onmouseout = () => closeBtn.style.background = '#555';
    closeBtn.onclick = () => overlay.remove();
    
    card.appendChild(closeBtn);
    overlay.appendChild(card);
    
    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
    
    document.body.appendChild(overlay);
}

// 获取品质颜色（与图鉴一致）
function getRankColor(rank) {
    const colors = {
        'legend': '#ff4444',
        'epic': '#ff8800',
        'rare': '#44aaff',
        'common': '#88cc88',
        'junk': '#888888'
    };
    return colors[rank] || '#fff';
}

// 获取品质文本
function getRankText(rank) {
    const texts = {
        'common': '普通',
        'rare': '稀有',
        'epic': '史诗',
        'legend': '传说',
        'myth': '神话'
    };
    return texts[rank] || rank || '普通';
}

function renderShopView(container) {
    // 清空容器以防重复渲染
    container.innerHTML = '';

    // 金币显示
    const goldBar = document.createElement('div');
    goldBar.className = 'shop-gold-bar';
    goldBar.innerHTML = `<span class="shop-gold-icon">💰</span> <span id="shop-gold-display">${window.gameGold || 0}</span> 金币`;
    container.appendChild(goldBar);

    // 新增: 创建子按钮容器 (普通商店, 高级商店)
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'shop-tabs-container';

    // 获取当前状态，如果未初始化则默认为普通商店
    if (!window.shopMode) window.shopMode = 'normal';

    const btnNormal = document.createElement('button');
    btnNormal.className = 'shop-sub-btn' + (window.shopMode === 'normal' ? ' active' : '');
    btnNormal.textContent = '普通商店';
    btnNormal.onclick = () => {
        window.shopMode = 'normal';
        renderShopView(container);
    };

    const btnAdvanced = document.createElement('button');
    btnAdvanced.className = 'shop-sub-btn' + (window.shopMode === 'advanced' ? ' active' : '');
    btnAdvanced.textContent = '高级商店';
    btnAdvanced.onclick = () => {
        window.shopMode = 'advanced';
        renderShopView(container);
    };

    tabsContainer.appendChild(btnNormal);
    tabsContainer.appendChild(btnAdvanced);
    container.appendChild(tabsContainer);

    // 确保商店数据存在
    if (!window.shopData || !window.shopData.items || window.shopData.items.length === 0) {
        refreshShopItems();
    }

    // 普通商店显示宝物，高级商店显示角色
    const items = window.shopData.items.filter(item =>
        window.shopMode === 'normal' ? item.type === 'treasure' : item.type === 'character'
    );

    //创建网格容器
    const gridDiv = document.createElement('div');
    gridDiv.className = 'shop-grid';

    // 生成商品 (2列 x 4行，共8个位置)
    const totalItems = 8;
    for (let i = 0; i < totalItems; i++) {
        const item = items[i] || null;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item' + (item && item.sold ? ' sold-out' : '');

        // 左侧：图片占位 (70x70)
        const imgPlaceholder = document.createElement('div');
        imgPlaceholder.className = 'shop-item-img' + (item && item.type === 'character' ? ' character-icon' : '');
        if (item && !item.sold && item.icon) {
            const img = document.createElement('img');
            img.src = item.icon;
            img.onerror = function() {
                this.style.display = 'none';
                imgPlaceholder.textContent = item.type === 'treasure' ? '宝' : '将';
                imgPlaceholder.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:20px;color:#888;';
            };
            imgPlaceholder.appendChild(img);
        } else {
            imgPlaceholder.textContent = item ? (item.sold ? '—' : (item.type === 'treasure' ? '宝' : '将')) : '';
        }
        // 点击商品图标弹出详情
        if (item && !item.sold) {
            imgPlaceholder.style.cursor = 'pointer';
            imgPlaceholder.onclick = () => {
                if (item.type === 'character') {
                    const cData = characterList[item.id];
                    if (cData) {
                        showCharDetail(null, { id: item.id, ...cData });
                    }
                } else {
                    showItemDetail(item);
                }
            };
        }
        itemDiv.appendChild(imgPlaceholder);

        // 右侧：信息容器
        const infoDiv = document.createElement('div');
        infoDiv.className = 'shop-item-info';

        // 右侧上半部分：名称和数量
        const headerDiv = document.createElement('div');
        headerDiv.className = 'shop-item-header';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'shop-item-name';
        if (item && item.type === 'character' && item.rank) {
            nameDiv.style.color = getRankColor(item.rank);
        }
        nameDiv.textContent = item ? item.name : '空';
        headerDiv.appendChild(nameDiv);

        const countDiv = document.createElement('div');
        countDiv.className = 'shop-item-count';
        countDiv.textContent = item ? `数量: 1` : '';
        headerDiv.appendChild(countDiv);

        infoDiv.appendChild(headerDiv);

        // 右侧下半部分：购买按钮（显示价格）
        const buyBtn = document.createElement('button');
        buyBtn.className = 'shop-buy-btn';
        if (!item || item.sold) {
            buyBtn.textContent = item ? '已售' : '—';
            if (item) buyBtn.disabled = true;
        } else {
            buyBtn.textContent = `${item.price}金`;
            buyBtn.onclick = () => {
                if ((window.gameGold || 0) < item.price) {
                    toast('金币不足！', 'error');
                    return;
                }
                // 扣费
                window.gameGold = (window.gameGold || 0) - item.price;
                if (item.type === 'treasure') {
                    gameData.addTreasure(item.id, 1);
                    syncTreasureEquipData();
                    toast(`购买了宝物【${item.name}】`, 'success');
                } else if (item.type === 'character') {
                    if (!window.charBagData) window.charBagData = {};
                    const cData = characterList[item.id];
                    if (cData) {
                        // 修改：生成唯一 instanceId
                        const instanceId = generateInstanceId(item.id);
                        window.charBagData[instanceId] = {
                            charId: item.id, // 存储基础ID
                            level: 1,
                            hp: cData.hp,
                            atk: cData.atk,
                            def: cData.def,
                            spe: cData.spe,
                            buff: [],
                        };
                        // 注意：gameData.addToHandbook 可能仍基于 charId，这是正确的（图鉴只需记录拥有过该角色）
                        gameData.addToHandbook(item.id);
                    }
                    toast(`招募了角色【${item.name}】`, 'success');
                }
                item.sold = true;
                // 更新金币显示
                const goldDisplay = document.getElementById('shop-gold-display');
                if (goldDisplay) goldDisplay.textContent = window.gameGold;
                renderShopView(container);
            };
        }
        infoDiv.appendChild(buyBtn);

        itemDiv.appendChild(infoDiv);

        gridDiv.appendChild(itemDiv);
    }

    container.appendChild(gridDiv);

    // 刷新按钮
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'shop-refresh-btn';
    const cost = window.shopData.refreshCost || 50;
    refreshBtn.textContent = `刷新商品（${cost}金）`;
    refreshBtn.onclick = () => {
        if ((window.gameGold || 0) < cost) {
            toast('金币不足，无法刷新！', 'error');
            return;
        }
        window.gameGold = (window.gameGold || 0) - cost;
        refreshShopItems();
        renderShopView(container);
        toast('商店已刷新', 'info');
    };
    container.appendChild(refreshBtn);
}

// 占位函数，防止报错

// 新增: 封装隐藏其他视图的函数
// 修改hideOtherViews函数，加入save-view
function hideOtherViews(currentViewId) {
    const views = ['main-view', 'team-view', 'bag-view', 'dungeon-view', 'shop-view', 'settings-view', 'save-view', 'battle-view'];
    views.forEach(viewId => {
        if (viewId !== currentViewId) {
            const view = document.getElementById(viewId);
            if (view) {
                view.style.display = 'none';
            }
        }
    });
}


// 初始化事件监听
function initEventListeners() {
    const btnTeam = document.getElementById('btn-team');
    const btnBag = document.getElementById('btn-bag');
    const btnDungeon = document.getElementById('btn-dungeon');
    const btnShop = document.getElementById('btn-shop');
    const btnSettings = document.getElementById('btn-settings');

    // 添加一个全局的"返回主界面"逻辑
    // 当从游戏内任何地方想要返回主界面时，都应该调用showMainView()
    
    if (btnTeam) {
        btnTeam.addEventListener('click', () => {
            const teamView = document.getElementById('team-view');
            renderTeamView(teamView);
            hideOtherViews('team-view');
            if (teamView) teamView.style.display = 'flex';
        });
    }

    if (btnBag) {
        btnBag.addEventListener('click', () => {
            const bagView = document.getElementById('bag-view');
            renderBagView(bagView);
            hideOtherViews('bag-view');
            if (bagView) bagView.style.display = 'flex';
        });
    }
    if (btnDungeon) {
        btnDungeon.addEventListener('click', () => {
            const dungeonView = document.getElementById('dungeon-view');

            // 每次点击都重新渲染，以便更新解锁状态（如果有动态变化）
            // 或者只在第一次渲染，后续通过其他方式更新
            if (dungeonView) {
                renderDungeonView(dungeonView);
            }

            // 使用封装函数隐藏其他视图
            hideOtherViews('dungeon-view');

            // 显示当前视图
            if (dungeonView) dungeonView.style.display = 'flex';
        });
    }
    
    // 新增: 商店按钮事件
    if (btnShop) {
        btnShop.addEventListener('click', () => {
            const shopView = document.getElementById('shop-view');

            // 每次进入商店都重新渲染，确保金币等信息是最新的
            if (shopView) {
                renderShopView(shopView);
            }

            // 使用封装函数隐藏其他视图
            hideOtherViews('shop-view');

            // 显示当前视图
            if (shopView) shopView.style.display = 'flex';
        });
    }

    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            const settingsView = document.getElementById('settings-view');

            // 如果设置视图已经初始化过，直接显示即可
            if (settingsView && settingsView.children.length === 0) {
                renderSettingsView(settingsView);
            }

            // 使用封装函数隐藏其他视图
            hideOtherViews('settings-view');

            // 显示当前视图
            if (settingsView) settingsView.style.display = 'flex';
        });
    }

}

// // 当 DOM 加载完成后初始化事件
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initEventListeners);
// } else {
//     initEventListeners();
// }
// 修改DOM加载后的初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initEventListeners();
        // 初始显示主界面（新游戏/读取存档）
        showMainView();
    });
} else {
    initEventListeners();
    showMainView();
}

// const viewList = [
//     'main','team','bag','dungeon','shop','settings'
// ]
//-------------------------存档
// // 修改showMainView函数
// function showMainView() {
//     const mainView = document.getElementById('main-view');
//     const bottomBar = document.querySelector('.ybrpg-bottom-bar');
//     const saveView = document.getElementById('save-view');
    
//     // 隐藏底部导航栏
//     if (bottomBar) bottomBar.style.display = 'none';
    
//     // 清空存档界面，防止下次进入时重复渲染
//     if (saveView) {
//         saveView.innerHTML = '';
//         saveView.style.display = 'none';
//     }
    
//     // 显示主界面
//     if (mainView) {
//         mainView.style.display = 'flex';
//         mainView.style.flexDirection = 'column';
//         mainView.style.alignItems = 'center';
//         mainView.style.justifyContent = 'center';
        
//         // 清空主界面内容
//         mainView.innerHTML = '';
        
//         // 创建新游戏按钮
//         const newGameBtn = document.createElement('button');
//         newGameBtn.className = 'main-start-btn';
//         newGameBtn.textContent = '新游戏';
//         newGameBtn.onclick = () => {
//             // 初始化新游戏
//             initNewGame();
//             // 显示底部导航栏，进入游戏
//             if (bottomBar) bottomBar.style.display = 'flex';
//             // 切换到队伍视图或其他默认视图
//             const teamView = document.getElementById('team-view');
//             hideOtherViews('team-view');
//             if (teamView) teamView.style.display = 'flex';
//         };
//         mainView.appendChild(newGameBtn);
        
//         // 创建读取存档按钮
//         const loadGameBtn = document.createElement('button');
//         loadGameBtn.className = 'main-start-btn';
//         loadGameBtn.textContent = '读取存档';
//         loadGameBtn.onclick = () => {
//             // 显示存档界面
//             showSaveView();
//         };
//         mainView.appendChild(loadGameBtn);
//     }
// }
// 美化版showMainView函数
function showMainView() {
    const mainView = document.getElementById('main-view');
    const bottomBar = document.querySelector('.ybrpg-bottom-bar');
    const saveView = document.getElementById('save-view');
    
    // 隐藏底部导航栏
    if (bottomBar) bottomBar.style.display = 'none';
    
    // 清空存档界面，防止下次进入时重复渲染
    if (saveView) {
        saveView.innerHTML = '';
        saveView.style.display = 'none';
    }
    
    // 显示主界面
    if (mainView) {
        mainView.style.display = 'flex';
        mainView.style.flexDirection = 'column';
        mainView.style.alignItems = 'center';
        mainView.style.justifyContent = 'flex-end'; // 从底部开始
        
        // 清空主界面内容
        mainView.innerHTML = '';
        
        // 添加背景装饰
        const backgroundDiv = document.createElement('div');
        backgroundDiv.className = 'main-background';
        mainView.appendChild(backgroundDiv);
        
        // 添加游戏标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'game-title';
        titleDiv.textContent = '夜白旅程';
        mainView.appendChild(titleDiv);
        
        // 创建按钮容器
        const btnContainer = document.createElement('div');
        btnContainer.className = 'main-btn-container';
        
        // 创建新游戏按钮
        const newGameBtn = document.createElement('button');
        newGameBtn.className = 'main-start-btn';
        newGameBtn.textContent = '▶ 新游戏';
        newGameBtn.onclick = () => {
            // 初始化新游戏
            initNewGame();
            // 显示底部导航栏，进入游戏
            if (bottomBar) bottomBar.style.display = 'flex';
            // 切换到队伍视图或其他默认视图
            const teamView = document.getElementById('team-view');
            hideOtherViews('team-view');
            if (teamView) teamView.style.display = 'flex';
        };
        btnContainer.appendChild(newGameBtn);
        
        // 创建读取存档按钮
        const loadGameBtn = document.createElement('button');
        loadGameBtn.className = 'main-start-btn';
        loadGameBtn.textContent = '▶ 读取存档';
        loadGameBtn.onclick = () => {
            // 显示存档界面（从主界面进入，允许删除）
            showSaveView(false);
        };
        btnContainer.appendChild(loadGameBtn);
        
        mainView.appendChild(btnContainer);
        
        // 添加版本信息
        const versionDiv = document.createElement('div');
        versionDiv.style.color = '#888';
        versionDiv.style.fontSize = '12px';
        versionDiv.style.marginTop = '20px';
        versionDiv.textContent = '独立版 v1.0';
        mainView.appendChild(versionDiv);
    }
}


// 初始化新游戏
function initNewGame() {
    // 重置游戏状态
    window.playerProgress = {};
    window.currentTeam = [null, null, null, null, null, null];
    window.currentDifficulty = 'normal';
    window.shopMode = 'normal';
    window.gameGold = 1000; // 初始金币
    window.charBagData = {}; // 角色背包数据（等级、实际数值）
    window.treasureEquipData = {}; // 宝物装备数据
    window.treasureBagData = {}; // 宝物背包数据
    window.autoBattle = false;

    // 开局福利：随机获得1名武将
    const allCharIds = Object.keys(characterList);
    const shuffledAll = [...allCharIds].sort(() => Math.random() - 0.5);
    const pickedAll = shuffledAll.slice(0, 1);
    pickedAll.forEach(id => {
        const base = characterList[id];
        // 修改：生成 instanceId
        const instanceId = generateInstanceId(id);
        window.charBagData[instanceId] = {
            charId: id,
            level: 1,
            hp: base.hp,
            atk: base.atk,
            def: base.def,
            spe: base.spe,
            buff: [],
        };
    });
    syncTreasureEquipData();

    // 初始化商店数据
    window.shopData = { items: [], refreshCost: 50 };

    // 初始化队伍视图
    const teamView = document.getElementById('team-view');
    if (teamView && teamView.children.length === 0) {
        renderTeamView(teamView);
    }
    
    console.log('新游戏已初始化，初始角色:', pickedAll);
}

// 显示存档界面
function showSaveView(fromGame = true) {
    const saveView = document.getElementById('save-view');
    const mainView = document.getElementById('main-view');
    
    // 渲染存档视图（每次重新渲染以适应不同入口）
    if (saveView) {
        renderSaveView(saveView, fromGame);
    }
    
    // 隐藏其他视图
    hideOtherViews('save-view');
    
    // 显示存档视图
    if (saveView) saveView.style.display = 'flex';
    if (mainView) mainView.style.display = 'none';
}
//---------------存档
// 存档数据管理 - 基于 GameData 类统一管理
const SaveManager = {
    SLOT_COUNT: gameData.SLOT_COUNT,

    // 获取所有手动存档（跳过索引0的自动存档）
    getAllSaves() {
        // 手动存档使用索引1-4，自动存档使用索引0
        const manualSlots = [];
        for (let i = 1; i <= this.SLOT_COUNT; i++) {
            const key = `${gameData.STORAGE_KEY}_${i}`;
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const data = JSON.parse(savedData);
                manualSlots.push({
                    slot: i,
                    data: {
                        baseInfo: data.baseInfo || {},
                        team: data.team || {},
                        bag: data.bag || {},
                        dungeon: data.dungeon || {},
                        shop: data.shop || {},
                        handbook: data.handbook || {},
                        saveTime: data.baseInfo?.saveTime || null,
                        saveName: data.baseInfo?.saveName || `存档${i}`,
                        playerProgress: window.playerProgress || {},
                        currentTeam: window.currentTeam || [null, null, null, null, null, null],
                        currentDifficulty: window.currentDifficulty || 'normal',
                        shopMode: window.shopMode || 'normal',
                        shopData: window.shopData || { items: [], refreshCost: 50 },
                        charBagData: window.charBagData || {},
                        treasureEquipData: window.treasureEquipData || {},
                        treasureBagData: window.treasureBagData || {}
                    },
                    exists: true
                });
            } else {
                manualSlots.push({
                    slot: i,
                    data: null,
                    exists: false
                });
            }
        }
        return manualSlots;
    },

    // 保存到指定槽位（同步 GameData 和 window 变量）
    saveToSlot(slot) {
        // 确保 gameData.data 完整
        if (!gameData.data || !gameData.data.team) {
            gameData.data = gameData.getDefaultData();
        }
        // 同步 GameData 数据
        gameData.data.team.members = (window.currentTeam || []).filter(Boolean);
        gameData.data.bag.gold = window.gameGold || 1000;
        gameData.data._charBag = JSON.parse(JSON.stringify(window.charBagData || {}));
        gameData.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData || {}));
        gameData.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData || {}));
        gameData.data.baseInfo.saveName = `存档${slot}`;
        gameData.data.baseInfo.saveTime = new Date().toISOString();

        // 保存到 localStorage（索引0留给自动存档，手动存档从索引1开始）
        gameData.save(slot);

        // 同时保存 window 变量（兼容性）
        const compatData = {
            playerProgress: window.playerProgress || {},
            currentTeam: window.currentTeam || [null, null, null, null, null, null],
            currentDifficulty: window.currentDifficulty || 'normal',
            shopMode: window.shopMode || 'normal',
            shopData: window.shopData || { items: [], refreshCost: 50 },
            gameGold: window.gameGold || 1000,
            charBagData: window.charBagData || {},
            treasureEquipData: window.treasureEquipData || {},
            treasureBagData: window.treasureBagData || {},
            autoBattle: window.autoBattle || false,
            saveTime: new Date().toLocaleString(),
            saveName: `存档${slot}`
        };
        localStorage.setItem(`ybrpg_save_${slot}`, JSON.stringify(compatData));

        console.log(`已保存到槽位${slot}`);
        return compatData;
    },

    // 从指定槽位读取（同步到 GameData 和 window）
    loadFromSlot(slot) {
        // 使用 GameData 加载（索引0留给自动存档，手动存档从索引1开始）
        const data = gameData.load(slot);
    
        // ========== 新增：迁移旧版宝物数据 ==========
        migrateTreasuresToInstanceId();  // 在 window 变量恢复前迁移
    
        // 兼容旧格式或加载失败时使用 window 变量
        const compatKey = `ybrpg_save_${slot}`;
        const compatData = localStorage.getItem(compatKey);
    
        if (compatData) {
            const parsed = JSON.parse(compatData);
    
            // 迁移逻辑：检查 charBagData 是否需要从 charId-key 迁移到 instanceId-key
            let charBag = parsed.charBagData || {};
            if (charBag && typeof charBag === 'object') {
                const needsMigration = Object.keys(charBag).some(key => !key.includes('_') || key.split('_').length < 3);
                if (needsMigration) {
                    console.log('[存档加载] 检测到旧版角色数据，正在迁移...');
                    const newCharBag = {};
                    Object.entries(charBag).forEach(([key, val]) => {
                        if (val.charId || characterList[key]) {
                            const actualCharId = val.charId || key;
                            const newInstanceId = generateInstanceId(actualCharId);
                            newCharBag[newInstanceId] = { ...val, charId: actualCharId };
                        } else {
                            newCharBag[key] = val;
                        }
                    });
                    charBag = newCharBag;
                }
            }
    
            window.playerProgress = parsed.playerProgress || {};
            window.currentTeam = parsed.currentTeam || [null, null, null, null, null, null];
    
            if (parsed.currentTeam) {
                window.currentTeam = parsed.currentTeam.map(charId => {
                    if (!charId) return null;
                    const instId = Object.keys(charBag).find(k => charBag[k].charId === charId);
                    return instId || charId;
                });
            }
    
            window.currentDifficulty = parsed.currentDifficulty || 'normal';
            window.shopMode = parsed.shopMode || 'normal';
            window.shopData = parsed.shopData || { items: [], refreshCost: 50 };
            window.gameGold = parsed.gameGold || 1000;
            window.charBagData = charBag;
            window.treasureEquipData = parsed.treasureEquipData || {};
            window.treasureBagData = parsed.treasureBagData || {};
            window.autoBattle = parsed.autoBattle || false;
            // 同步 window 变量回 gameData 内存
            gameData.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData));
            gameData.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData));
            gameData.data._charBag = JSON.parse(JSON.stringify(window.charBagData));
        } else if (data) {
            // 如果只有 GameData 格式，从 GameData 恢复 window 变量
            window.currentTeam = [...(data.team?.members || []), ...Array(6).fill(null)].slice(0, 6);
            window.gameGold = data.bag?.gold || 1000;
            window.charBagData = data._charBag || {};
            window.treasureEquipData = data._treasures || {};
            window.treasureBagData = data._treasureBag || {};
        }
    
        // 确保 gameData 内存与存档数据一致
        if (data) {
            const defaults = gameData.getDefaultData();
            gameData.data = { ...defaults, ...data, team: { ...defaults.team, ...data.team }, bag: { ...defaults.bag, ...data.bag }, baseInfo: { ...defaults.baseInfo, ...data.baseInfo } };
        }
    
        // ========== 新增：同步宝物数据到 window ==========
        syncTreasureEquipData();
    
        console.log(`已读取槽位${slot}的存档`);
        return data || JSON.parse(compatData || 'null');
    },
    

    // 删除指定槽位存档
    deleteSlot(slot) {
        gameData.deleteSave(slot); // 索引0留给自动存档，手动存档从索引1开始
        localStorage.removeItem(`ybrpg_save_${slot}`);
        console.log(`已删除槽位${slot}的存档`);
    },

    // ====== 自动存档 ======
    AUTO_KEY: 'ybrpg_autosave',

    autoSave() {
        // 确保 gameData.data 完整
        if (!gameData.data || !gameData.data.team) {
            gameData.data = gameData.getDefaultData();
        }

        // 迁移旧数据：如果索引0存的是手动存档（旧逻辑），迁移到索引1
        const slot0Raw = localStorage.getItem(`${gameData.STORAGE_KEY}_0`);
        if (slot0Raw) {
            try {
                const oldData = JSON.parse(slot0Raw);
                if (oldData.baseInfo?.saveName && oldData.baseInfo.saveName !== '自动存档') {
                    // 旧的手动存档，迁移到索引1（如果索引1为空）
                    const slot1Raw = localStorage.getItem(`${gameData.STORAGE_KEY}_1`);
                    if (!slot1Raw) {
                        localStorage.setItem(`${gameData.STORAGE_KEY}_1`, slot0Raw);
                        console.log('[自动存档] 已将旧手动存档从索引0迁移到索引1');
                    }
                }
            } catch (e) { /* 忽略解析错误 */ }
        }

        // 同步 GameData 数据
        gameData.data.team.members = (window.currentTeam || []).filter(Boolean);
        gameData.data.bag.gold = window.gameGold || 1000;
        gameData.data._charBag = JSON.parse(JSON.stringify(window.charBagData || {}));
        gameData.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData || {}));
        gameData.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData || {}));
        gameData.data.baseInfo.saveName = '自动存档';
        gameData.data.baseInfo.saveTime = new Date().toISOString();

        // 保存到 GameData 的专用自动存档槽位（索引0）
        gameData.save(0);

        // 同时保存兼容格式
        const compatData = {
            playerProgress: window.playerProgress || {},
            currentTeam: window.currentTeam || [null, null, null, null, null, null],
            currentDifficulty: window.currentDifficulty || 'normal',
            shopMode: window.shopMode || 'normal',
            shopData: window.shopData || { items: [], refreshCost: 50 },
            gameGold: window.gameGold || 1000,
            charBagData: window.charBagData || {},
            treasureEquipData: window.treasureEquipData || {},
            treasureBagData: window.treasureBagData || {},
            autoBattle: window.autoBattle || false,
            saveTime: new Date().toLocaleString(),
            saveName: '自动存档'
        };
        localStorage.setItem(SaveManager.AUTO_KEY, JSON.stringify(compatData));

        console.log('[自动存档] 已保存');
    },

    loadAutoSave() {
        // 直接读取 localStorage，避免 gameData.load() 覆盖内存数据
        const key = `${gameData.STORAGE_KEY}_0`;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        let data;
        try { data = JSON.parse(raw); } catch { return null; }
    
        if (data && data.baseInfo?.saveName === '自动存档') {
            // ========== 新增：先迁移宝物数据（在恢复 window 之前） ==========
            gameData.data = data;  // 临时置入 data，方便迁移函数读取
            migrateTreasuresToInstanceId();
            data = gameData.data;  // 更新后的数据
    
            // 恢复 window 变量
            const compatKey = SaveManager.AUTO_KEY;
            const compatData = localStorage.getItem(compatKey);
            if (compatData) {
                const parsed = JSON.parse(compatData);
    
                // 迁移逻辑同 loadFromSlot
                let charBag = parsed.charBagData || {};
                if (charBag && typeof charBag === 'object') {
                    const needsMigration = Object.keys(charBag).some(key => !key.includes('_') || key.split('_').length < 3);
                    if (needsMigration) {
                        console.log('[自动存档加载] 检测到旧版角色数据，正在迁移...');
                        const newCharBag = {};
                        Object.entries(charBag).forEach(([key, val]) => {
                            if (val.charId || characterList[key]) {
                                const actualCharId = val.charId || key;
                                const newInstanceId = generateInstanceId(actualCharId);
                                newCharBag[newInstanceId] = { ...val, charId: actualCharId };
                            } else {
                                newCharBag[key] = val;
                            }
                        });
                        charBag = newCharBag;
                    }
                }
    
                window.playerProgress = parsed.playerProgress || {};
                window.currentTeam = parsed.currentTeam || [null, null, null, null, null, null];
    
                if (parsed.currentTeam) {
                    window.currentTeam = parsed.currentTeam.map(charId => {
                        if (!charId) return null;
                        const instId = Object.keys(charBag).find(k => charBag[k].charId === charId);
                        return instId || charId;
                    });
                }
    
                window.currentDifficulty = parsed.currentDifficulty || 'normal';
                window.shopMode = parsed.shopMode || 'normal';
                window.shopData = parsed.shopData || { items: [], refreshCost: 50 };
                window.gameGold = parsed.gameGold || 1000;
                window.charBagData = charBag;
                window.treasureEquipData = parsed.treasureEquipData || {};
                window.treasureBagData = parsed.treasureBagData || {};
                window.autoBattle = parsed.autoBattle || false;
            } else {
                window.currentTeam = [...(data.team?.members || []), ...Array(6).fill(null)].slice(0, 6);
                window.gameGold = data.bag?.gold || 1000;
                window.charBagData = data._charBag || {};
                window.treasureEquipData = data._treasures || {};
                window.treasureBagData = data._treasureBag || {};
                window.autoBattle = parsed.autoBattle || false;
            }
    
            // 同步到 gameData 内存（确保结构完整）
            const defaults = gameData.getDefaultData();
            gameData.data = { ...defaults, ...data, team: { ...defaults.team, ...data.team }, bag: { ...defaults.bag, ...data.bag }, baseInfo: { ...defaults.baseInfo, ...data.baseInfo } };
    
            // ========== 新增：同步宝物数据 ==========
            syncTreasureEquipData();
    
            console.log('[自动存档] 已读取');
            return data;
        }
        return null;
    },
    

    hasAutoSave() {
        // 直接读取 localStorage，避免 gameData.load() 的副作用
        const key = `${gameData.STORAGE_KEY}_0`;
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        try {
            const data = JSON.parse(raw);
            return data.baseInfo?.saveName === '自动存档';
        } catch { return false; }
    }
};
/**
 * 迁移旧版宝物数据（从 charId 键迁移到 instanceId 键）
 * 在加载旧存档后调用
 */
function migrateTreasuresToInstanceId() {
    const treasures = gameData.data._treasures;
    if (!treasures || typeof treasures !== 'object') return;

    // 判断是否需要迁移：如果所有键都不包含下划线（说明是 charId 格式），则迁移
    const keys = Object.keys(treasures);
    const isOldFormat = keys.length > 0 && keys.every(k => !k.includes('_'));
    if (!isOldFormat) return; // 已经是新格式，无需迁移

    console.log('[迁移] 检测到旧版宝物数据（键为charId），正在迁移...');
    const newTreasures = {};
    const charBag = window.charBagData || {};

    // 遍历旧键（charId）
    keys.forEach(charId => {
        const treasureArray = treasures[charId];
        // 找到 charBagData 中所有以该 charId 创建的实例 ID
        const instanceIds = Object.keys(charBag).filter(instId => {
            const inst = charBag[instId];
            return inst && inst.charId === charId;
        });

        if (instanceIds.length === 0) {
            // 没有对应的实例，则忽略该角色的宝物（或可丢弃）
            // 但如果该角色在队伍中且属于临时生成的实例，可能是在旧存档中实例不存在
            // 这里直接忽略（不会报错，但宝物会丢失）
            console.warn(`[迁移] 角色 ${charId} 在 charBagData 中无实例，宝物将被丢弃`);
            return;
        }

        // 为每个实例复制一份相同的宝物数据（注意深拷贝数组）
        instanceIds.forEach(instId => {
            newTreasures[instId] = [...treasureArray];
        });
    });

    // 替换 gameData 中的宝物数据
    gameData.data._treasures = newTreasures;
    console.log('[迁移] 宝物数据迁移完成，共迁移了 ' + Object.keys(newTreasures).length + ' 个实例的宝物');
}

// 渲染存档界面
function renderSaveView(container, fromGame = true) {
    // 清空容器
    container.innerHTML = '';

    // 创建返回按钮
    const backBtn = document.createElement('button');
    backBtn.className = 'ybrpg-btn';
    backBtn.style.width = 'auto';
    backBtn.style.padding = '5px 15px';
    backBtn.style.marginBottom = '20px';
    backBtn.textContent = fromGame ? '← 返回上一级' : '← 返回主界面';
    backBtn.onclick = () => {
        if (fromGame) {
            // 返回设置视图
            const settingsView = document.getElementById('settings-view');
            if (settingsView) {
                hideOtherViews('settings-view');
                settingsView.style.display = 'flex';
                renderSettingsView(settingsView);
            }
        } else {
            showMainView();
        }
    };
    container.appendChild(backBtn);

    // 创建存档槽位网格
    const gridDiv = document.createElement('div');
    gridDiv.className = 'save-slot-grid';

    // ====== 自动存档槽位 ======
    const autoSlot = document.createElement('div');
    autoSlot.className = 'save-slot';
    autoSlot.style.borderColor = '#4ecdc4';

    const hasAuto = SaveManager.hasAutoSave();
    if (hasAuto) {
        const autoData = (() => {
            try { return JSON.parse(localStorage.getItem(`${gameData.STORAGE_KEY}_0`)); } catch { return null; }
        })();
        const autoInfo = document.createElement('div');
        autoInfo.className = 'save-info';

        const autoName = document.createElement('div');
        autoName.className = 'save-name';
        autoName.textContent = '🔄 自动存档';
        autoName.style.color = '#4ecdc4';
        autoInfo.appendChild(autoName);

        const autoTime = document.createElement('div');
        autoTime.className = 'save-time';
        autoTime.textContent = autoData?.baseInfo?.saveTime
            ? new Date(autoData.baseInfo.saveTime).toLocaleString()
            : '未知时间';
        autoInfo.appendChild(autoTime);

        autoSlot.appendChild(autoInfo);

        // 读取按钮
        const autoLoadBtn = document.createElement('button');
        autoLoadBtn.className = 'save-action-btn';
        autoLoadBtn.style.borderColor = '#4ecdc4';
        autoLoadBtn.textContent = '读取';
        autoLoadBtn.onclick = () => {
            SaveManager.loadAutoSave();
            toast('已读取自动存档', 'success');
            const bottomBar = document.querySelector('.ybrpg-bottom-bar');
            if (bottomBar) bottomBar.style.display = 'flex';
            hideOtherViews('team-view');
            const teamView = document.getElementById('team-view');
            if (teamView) teamView.style.display = 'flex';
        };
        autoSlot.appendChild(autoLoadBtn);

        // 自动存档不提供删除按钮
    } else {
        autoSlot.classList.add('empty');
        const autoEmpty = document.createElement('div');
        autoEmpty.className = 'save-name';
        autoEmpty.textContent = '🔄 自动存档';
        autoEmpty.style.color = '#4ecdc4';
        autoSlot.appendChild(autoEmpty);

        const autoHint = document.createElement('div');
        autoHint.className = 'save-progress';
        autoHint.textContent = '暂无自动存档';
        autoSlot.appendChild(autoHint);
    }
    gridDiv.appendChild(autoSlot);

    // ====== 手动存档槽位 ======
    // 获取所有存档
    const saves = SaveManager.getAllSaves();

    // 创建手动存档槽位
    for (let i = 1; i <= SaveManager.SLOT_COUNT; i++) {
        const saveSlot = document.createElement('div');
        saveSlot.className = 'save-slot';

        const save = saves[i - 1];

        if (save.exists) {
            // 有存档的槽位
            const infoDiv = document.createElement('div');
            infoDiv.className = 'save-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'save-name';
            nameDiv.textContent = save.data.saveName || `存档${i}`;
            infoDiv.appendChild(nameDiv);

            const timeDiv = document.createElement('div');
            timeDiv.className = 'save-time';
            timeDiv.textContent = save.data.saveTime || '未知时间';
            infoDiv.appendChild(timeDiv);

            saveSlot.appendChild(infoDiv);

            // 读取按钮
            const loadBtn = document.createElement('button');
            loadBtn.className = 'save-action-btn';
            loadBtn.textContent = '读取';
            loadBtn.onclick = () => {
                SaveManager.loadFromSlot(i);
                toast(`已读取存档${i}`, 'success');
                const bottomBar = document.querySelector('.ybrpg-bottom-bar');
                if (bottomBar) bottomBar.style.display = 'flex';
                hideOtherViews('team-view');
                const teamView = document.getElementById('team-view');
                if (teamView) teamView.style.display = 'flex';
            };
            saveSlot.appendChild(loadBtn);

            // 保存按钮（覆盖已有存档，仅从游戏内进入时显示）
            if (fromGame) {
                const saveBtn = document.createElement('button');
                saveBtn.className = 'save-action-btn';
                saveBtn.textContent = '保存';
                saveBtn.onclick = () => {
                    if (!window.playerProgress || Object.keys(window.playerProgress).length === 0) {
                        toast('当前没有游戏进度，请先开始游戏', 'warning');
                        return;
                    }
                    SaveManager.saveToSlot(i);
                    toast(`已保存到存档${i}`, 'success');
                    renderSaveView(container, fromGame);
                };
                saveSlot.appendChild(saveBtn);
            }

            // 删除按钮（仅从主界面进入时显示）
            if (!fromGame) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'save-action-btn';
                deleteBtn.textContent = '删除';
                deleteBtn.onclick = () => {
                    confirmDialog(`确定要删除存档${i}吗？`, () => {
                        SaveManager.deleteSlot(i);
                        renderSaveView(container, fromGame);
                    });
                };
                saveSlot.appendChild(deleteBtn);
            }
        } else {
            // 空槽位
            saveSlot.classList.add('empty');

            const emptyText = document.createElement('div');
            emptyText.className = 'save-name';
            emptyText.textContent = `空存档${i}`;
            saveSlot.appendChild(emptyText);

            const emptyHint = document.createElement('div');
            emptyHint.className = 'save-progress';
            emptyHint.textContent = '暂无存档';
            saveSlot.appendChild(emptyHint);

            // 保存按钮（仅从游戏内进入时显示）
            if (fromGame) {
                const saveBtn = document.createElement('button');
                saveBtn.className = 'save-action-btn';
                saveBtn.textContent = '保存';
                saveBtn.onclick = () => {
                    if (!window.playerProgress || Object.keys(window.playerProgress).length === 0) {
                        toast('当前没有游戏进度，请先开始游戏', 'warning');
                        return;
                    }
                    SaveManager.saveToSlot(i);
                    toast(`已保存到存档${i}`, 'success');
                    renderSaveView(container, fromGame);
                };
                saveSlot.appendChild(saveBtn);
            }
        }

        gridDiv.appendChild(saveSlot);
    }

    container.appendChild(gridDiv);
}


/**
 * 查看背包武将详情（调用 showCharDetail）
 * @param {Object} charInfo - 包含 id, level, hp, atk, def, spe, name 等字段的对象
 */
function showBagCharDetail(charInfo) {
    if (!charInfo || !charInfo.id) return;
    // 合并完整数据（基础定义 + 实例数据）
    const base = characterList[charInfo.id];
    if (!base) {
        toast('角色数据丢失', 'error');
        return;
    }
    const fullData = { ...base, ...charInfo };
    // 使用已有的 showCharDetail 弹窗（第一个参数传 null 表示无父容器）
    showCharDetail(null, fullData);
}

/**
 * 背包武将详情弹窗（带升级功能）
 * @param {string} instanceId - 角色实例ID
 * @param {string} charId - 角色基础ID
 */
function showBagCharDetailPopup(instanceId, charId) {
    const char = characterList[charId];
    if (!char) return;
    const instData = window.charBagData && window.charBagData[instanceId];
    if (!instData) return;

    const saveData = instData;
    const RANK_LABELS = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
    const RANK_COLORS = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
    const TIP_LABELS = { damage: '偏攻', recover: '偏防', balance: '均衡' };

    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'gallery-detail-dialog';
    dialog.style.maxWidth = '380px';

    // 角色名
    const nameDiv = document.createElement('div');
    nameDiv.className = 'gallery-detail-name';
    nameDiv.textContent = char.name;
    dialog.appendChild(nameDiv);

    // 上半部分：图片 + 属性
    const topDiv = document.createElement('div');
    topDiv.className = 'gallery-detail-top';

    // 图片
    const imgDiv = document.createElement('div');
    imgDiv.className = 'gallery-detail-img-container';
    imgDiv.style.width = '120px';
    imgDiv.style.height = '150px';
    const img = document.createElement('img');
    img.className = 'gallery-detail-img';
    img.src = `./image/character/${charId}.jpg`;
    img.alt = char.name;
    img.onerror = function() {
        this.onerror = function() {
            this.style.display = 'none';
            const p = document.createElement('div');
            p.className = 'gallery-char-placeholder';
            p.style.width = '120px';
            p.style.height = '150px';
            p.style.fontSize = '36px';
            p.textContent = char.name.charAt(0);
            this.parentNode.appendChild(p);
        };
        this.src = `./image/character/${charId}.webp`;
    };
    imgDiv.onclick = () => showFullImage(charId, char.name);
    imgDiv.appendChild(img);
    topDiv.appendChild(imgDiv);

    // 属性区
    const attrDiv = document.createElement('div');
    attrDiv.className = 'gallery-detail-attr';

    const rankDiv = document.createElement('div');
    rankDiv.className = 'gallery-detail-rank';
    const rankText = RANK_LABELS[char.rank] || char.rank;
    const levelText = `Lv.${saveData.level}`;
    rankDiv.innerHTML = `<span style="color:${RANK_COLORS[char.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">${levelText}</span>`;
    attrDiv.appendChild(rankDiv);

    const tipDiv = document.createElement('div');
    tipDiv.style.fontSize = '12px';
    tipDiv.style.color = '#aaa';
    tipDiv.style.marginBottom = '4px';
    tipDiv.textContent = TIP_LABELS[char.tip] || char.tip || '';
    attrDiv.appendChild(tipDiv);

    const attrs = [
        { label: '生命', value: saveData.hp },
        { label: '攻击', value: saveData.atk },
        { label: '防御', value: saveData.def },
        { label: '速度', value: saveData.spe },
    ];
    attrs.forEach(a => {
        const row = document.createElement('div');
        row.className = 'gallery-detail-attr-row';
        row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${a.value}</span>`;
        attrDiv.appendChild(row);
    });

    topDiv.appendChild(attrDiv);
    dialog.appendChild(topDiv);

    // 技能信息
    const skillsDiv = document.createElement('div');
    skillsDiv.className = 'gallery-detail-skills';
    const skillIds = char.skills || [];
    if (skillIds[0] && contentList.pugong && contentList.pugong[skillIds[0]]) {
        const pg = contentList.pugong[skillIds[0]];
        const section = buildSkillSection('普攻', pg, '#5ba8ff');
        skillsDiv.appendChild(section);
    }
    if (skillIds[1] && contentList.skill && contentList.skill[skillIds[1]]) {
        const sk = contentList.skill[skillIds[1]];
        const section = buildSkillSection('技能', sk, '#ff8c00');
        skillsDiv.appendChild(section);
    }
    if (skillIds[2] && contentList.spskill && contentList.spskill[skillIds[2]]) {
        const sp = contentList.spskill[skillIds[2]];
        const section = buildSkillSection('必杀', sp, '#ffd700');
        skillsDiv.appendChild(section);
    }
    dialog.appendChild(skillsDiv);

    // 底部按钮：选择升级 + 关闭
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:10px;';

    const upgradeBtn = document.createElement('button');
    upgradeBtn.className = 'ybrpg-btn';
    upgradeBtn.style.cssText = 'width:auto;padding:6px 16px;font-size:13px;flex:1;';
    upgradeBtn.textContent = '选择升级';
    upgradeBtn.onclick = () => {
        // 不关闭详情弹窗，升级面板浮在之上
        showUpgradePanel(instanceId, charId, saveData.level, (newLevel, newHp, newAtk, newDef, newSpe) => {
            // 升级成功后刷新详情弹窗的内容
            // 更新等级显示
            const rankEl = dialog.querySelector('.gallery-detail-rank');
            if (rankEl) {
                const rankColors = { legend: '#ff4444', epic: '#ff8800', rare: '#44aaff', common: '#88cc88', junk: '#888888' };
                const rankLabels = { legend: '传说', epic: '史诗', rare: '精品', common: '普通', junk: '废材' };
                const rankText = rankLabels[char.rank] || char.rank;
                rankEl.innerHTML = `<span style="color:${rankColors[char.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">Lv.${newLevel}</span>`;
            }
            // 更新四维属性
            const attrRows = dialog.querySelectorAll('.gallery-detail-attr-row .attr-value');
            const newValues = [newHp, newAtk, newDef, newSpe];
            attrRows.forEach((el, i) => {
                if (i < newValues.length) el.textContent = newValues[i];
            });
            // 更新 saveData（全局数据已更新）
            saveData.level = newLevel;
            saveData.hp = newHp;
            saveData.atk = newAtk;
            saveData.def = newDef;
            saveData.spe = newSpe;
        });
    };
    btnRow.appendChild(upgradeBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ybrpg-btn';
    closeBtn.style.cssText = 'width:auto;padding:6px 16px;font-size:13px;flex:1;';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => overlay.remove();
    btnRow.appendChild(closeBtn);

    dialog.appendChild(btnRow);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

/** 辅助函数：构建技能片段 */
function buildSkillSection(label, sData, color) {
    const section = document.createElement('div');
    section.className = 'gallery-skill-section';
    const title = document.createElement('div');
    title.className = 'gallery-skill-title';
    title.textContent = label;
    title.style.color = color;
    section.appendChild(title);
    const nameEl = document.createElement('div');
    nameEl.className = 'gallery-skill-name';
    nameEl.textContent = sData.name;
    section.appendChild(nameEl);
    const intro = document.createElement('div');
    intro.className = 'gallery-skill-intro';
    intro.textContent = sData.intro;
    section.appendChild(intro);
    const aiIntro = document.createElement('div');
    aiIntro.className = 'gallery-skill-ai';
    aiIntro.textContent = 'AI倾向：' + sData.ai_intro;
    section.appendChild(aiIntro);
    return section;
}


/**
 * 升级选择面板（仅消耗同品质武将）
 * @param {string} targetInstId - 要升级的角色实例ID
 * @param {string} targetCharId - 要升级的角色基础ID
 * @param {number} currentLevel - 当前等级
 */
function showUpgradePanel(targetInstId, targetCharId, currentLevel, onUpgrade) {
    const requiredExp = currentLevel; // 所需经验值 = 当前等级

    // 获取目标角色的品质
    const targetRank = characterList[targetCharId]?.rank;
    if (!targetRank) {
        toast('目标角色品质异常', 'error');
        return;
    }

    // 获取所有可用消耗品（同品质角色，不能是自身）
    const allInstIds = Object.keys(window.charBagData || {});
    const consumables = allInstIds.filter(id => {
        if (id === targetInstId) return false;
        if (window.currentTeam && window.currentTeam.includes(id)) return false;
        const inst = window.charBagData[id];
        const charId = inst.charId || id;
        const baseChar = characterList[charId];
        return baseChar && baseChar.rank === targetRank;
    }).map(id => {
        const inst = window.charBagData[id];
        const charId = inst.charId || id;
        const baseChar = characterList[charId];
        return {
            instanceId: id,
            charId: charId,
            name: baseChar.name,
            level: inst.level || 1,
            selected: false
        };
    });

    const overlay = document.createElement('div');
    overlay.className = 'ybrpg-confirm-overlay';
    overlay.style.zIndex = '10001';


    const popup = document.createElement('div');
    popup.className = 'char-select-popup';
    popup.style.maxWidth = '380px';

    const title = document.createElement('div');
    title.className = 'char-select-title';
    title.textContent = `选择同品质材料（需要总等级 ${requiredExp}）`;
    popup.appendChild(title);

    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'char-select-scroll';
    scrollDiv.style.maxHeight = '40vh';

    const listContainer = document.createElement('div');
    listContainer.id = 'upgrade-consumable-list';
    scrollDiv.appendChild(listContainer);
    popup.appendChild(scrollDiv);

    // 底部信息栏
    const infoBar = document.createElement('div');
    infoBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;border-top:1px solid #444;';
    infoBar.id = 'upgrade-info-bar';
    const countLabel = document.createElement('div');
    countLabel.style.color = '#aaa';
    countLabel.id = 'upgrade-count-label';
    countLabel.textContent = '已选: 0 / 所需: ' + requiredExp;
    infoBar.appendChild(countLabel);

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'ybrpg-btn';
    confirmBtn.style.cssText = 'width:auto;padding:6px 16px;font-size:13px;';
    confirmBtn.textContent = '确认升级';
    confirmBtn.disabled = true;
    confirmBtn.id = 'upgrade-confirm-btn';
    confirmBtn.onclick = () => {
        const selected = consumables.filter(c => c.selected);
        const totalLevel = selected.reduce((s, c) => s + c.level, 0);
        if (totalLevel !== currentLevel) {
            toast('所选消耗品总等级不匹配，无法升级', 'warning');
            return;
        }

        // 消耗选中的角色
        selected.forEach(c => {
            delete window.charBagData[c.instanceId];
            if (window.currentTeam) {
                const idx = window.currentTeam.indexOf(c.instanceId);
                if (idx !== -1) {
                    window.currentTeam[idx] = null;
                    refreshTeamSlot(idx);
                }
            }
        });

        // 升级目标角色
        const targetData = window.charBagData[targetInstId];
        const newLevel = currentLevel + 1;
        targetData.level = newLevel;
        const ratio = (100 + 10 * (newLevel - 1)) / 100; // 提升比例

        const base = characterList[targetCharId];
        if (base) {
            targetData.hp = Math.round(base.hp * ratio);
            targetData.atk = Math.round(base.atk * ratio);
            targetData.def = Math.round(base.def * ratio);
            targetData.spe = Math.round(base.spe * ratio);
        }

        // overlay.remove();
        // toast(`${characterList[targetCharId]?.name} 已升至 ${newLevel} 级！`, 'success');

        // 刷新队伍视图（如果武将上阵）
        if (window.currentTeam && window.currentTeam.includes(targetInstId)) {
            const gridIdx = window.currentTeam.indexOf(targetInstId);
            refreshTeamSlot(gridIdx);
            // 如果当前选中的是该格子，刷新详情
            if (window._selectedSlotIndex === gridIdx) {
                showTeamCharInfo(gridIdx, targetInstId, targetCharId);
            }
        }
        // 刷新视图
        // const bagView = document.getElementById('bag-view');
        // if (bagView) renderBagView(bagView);
        // if (window.currentTeam && window.currentTeam.includes(targetInstId)) {
        //     const gridIdx = window.currentTeam.indexOf(targetInstId);
        //     refreshTeamSlot(gridIdx);
        //     if (window._selectedSlotIndex === gridIdx) {
        //         showTeamCharInfo(gridIdx, targetInstId, targetCharId);
        //     }
        // }
        // syncTreasureEquipData();
        const newHp = Math.round(base.hp * ratio);
        const newAtk = Math.round(base.atk * ratio);
        const newDef = Math.round(base.def * ratio);
        const newSpe = Math.round(base.spe * ratio);
        if (typeof onUpgrade === 'function') {
            onUpgrade(newLevel, newHp, newAtk, newDef, newSpe);
        }

        overlay.remove();
        toast(`${characterList[targetCharId]?.name} 已升至 ${newLevel} 级！`, 'success');

        // 刷新背包视图（如果有）
        const bagView = document.getElementById('bag-view');
        if (bagView) renderBagView(bagView);
        if (window.currentTeam && window.currentTeam.includes(targetInstId)) {
            const gridIdx = window.currentTeam.indexOf(targetInstId);
            refreshTeamSlot(gridIdx);
            if (window._selectedSlotIndex === gridIdx) {
                showTeamCharInfo(gridIdx, targetInstId, targetCharId);
            }
        }
        syncTreasureEquipData();
        SaveManager.autoSave();
    };
    infoBar.appendChild(confirmBtn);
    popup.appendChild(infoBar);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'char-select-close-btn';
    closeBtn.textContent = '取消';
    closeBtn.onclick = () => overlay.remove();
    popup.appendChild(closeBtn);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    function renderConsumableList() {
        listContainer.innerHTML = '';
        if (consumables.length === 0) {
            listContainer.innerHTML = '<div style="color:#666;padding:20px;text-align:center;">没有同品质的可消耗武将</div>';
            return;
        }
        consumables.forEach((c) => {
            const row = document.createElement('div');
            row.className = 'char-select-row' + (c.selected ? ' in-team' : '');
            row.style.cursor = 'pointer';

            const iconDiv = document.createElement('div');
            iconDiv.className = 'char-select-icon';
            iconDiv.style.width = '40px';
            iconDiv.style.height = '40px';
            const img = document.createElement('img');
            img.className = 'gallery-char-img';
            img.src = `./image/character/${c.charId}.jpg`;
            img.alt = c.name;
            img.onerror = function() {
                this.style.display = 'none';
                const p = document.createElement('div');
                p.className = 'gallery-char-placeholder';
                p.textContent = c.name.charAt(0);
                this.parentNode.appendChild(p);
            };
            iconDiv.appendChild(img);
            row.appendChild(iconDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'char-select-info';
            const nameEl = document.createElement('div');
            nameEl.className = 'char-select-name';
            nameEl.textContent = c.name;
            infoDiv.appendChild(nameEl);
            const detailEl = document.createElement('div');
            detailEl.className = 'char-select-detail';
            detailEl.textContent = `Lv.${c.level}  经验值: ${c.level}`;
            infoDiv.appendChild(detailEl);
            row.appendChild(infoDiv);

            const checkMark = document.createElement('div');
            checkMark.style.cssText = 'min-width:20px;text-align:center;font-size:16px;';
            checkMark.textContent = c.selected ? '✓' : '';
            row.appendChild(checkMark);

            row.onclick = () => {
                c.selected = !c.selected;
                renderConsumableList();
                updateInfoBar();
            };

            listContainer.appendChild(row);
        });
    }

    function updateInfoBar() {
        const selected = consumables.filter(c => c.selected);
        const totalLevel = selected.reduce((s, c) => s + c.level, 0);
        const countLabel = document.getElementById('upgrade-count-label');
        const confirmBtn = document.getElementById('upgrade-confirm-btn');
        if (countLabel) countLabel.textContent = `已选: ${totalLevel} / 所需: ${requiredExp}`;
        if (confirmBtn) {
            confirmBtn.disabled = totalLevel !== requiredExp;
            confirmBtn.style.opacity = totalLevel !== requiredExp ? '0.5' : '1';
        }
    }

    renderConsumableList();
    updateInfoBar();

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}


// 保留旧函数作为别名
function showBagCharDetail(charInfo) {
    if (!charInfo || !charInfo.id) return;
    // 查找对应的 instanceId（这里假设 charInfo 中有 instanceId 或使用第一个实例）
    const instanceId = charInfo.instanceId || Object.keys(window.charBagData || {}).find(id => {
        const inst = window.charBagData[id];
        return inst && (inst.charId === charInfo.id || id === charInfo.id);
    });
    if (instanceId) {
        showBagCharDetailPopup(instanceId, charInfo.id);
    } else {
        toast('无法找到该角色实例', 'error');
    }
}
