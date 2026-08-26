/**
 * 星河之契 - 阵容系统
 * 由 mode.js 拆分而来（原行号见下文分段注释）
 */

import { shared } from './shared.js';
import { contentList } from './contentList.js';
import { characterList, characterTemplate } from './characterList.js';
import { BREAKTHROUGH_BUFF_LIBRARY, STANDARD_BREAKTHROUGH_TEMPLATE } from './charBreakthroughConfig.js';
import { TREASURE_DEFS } from './equip.js';
import { Game } from './core.js';
import { renderBagView, sortTreasuresByBagOrder, updateBagCharDetailBar } from './bag.js';
import { grantCharacter, renderDungeonView } from './dungeon.js';
import { renderShopView } from './shop.js';
import { SaveManager, ensureResourceHUD, hideOtherViews, showFullImage, updateResourceHUD } from './other.js';

function showteam() {
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

	// ===== 【新增】阵容总战力显示（固定在顶部） =====
	const totalPowerBar = document.createElement('div');
	totalPowerBar.id = 'team-total-power';
	totalPowerBar.style.cssText = `
		position: fixed;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		text-align: center;
		padding: 4px 16px;
		background: rgba(26, 26, 46, 0.85);
		border-radius: 12px;
		border: 1px solid #ffd70044;
		font-size: 13px;
		pointer-events: none;
		backdrop-filter: blur(4px);
	`;

	// 计算总战力
	let totalPower = 0;
	const teamBonuses = Game.Stat.teamBonuses();
	for (let i = 0; i < 6; i++) {
		const instId = window.currentTeam[i];
		if (instId && window.charBagData && window.charBagData[instId]) {
			const finalStats = Game.Stat.final(instId, teamBonuses);
			totalPower += Game.Stat.power(finalStats);
		}
	}

	totalPowerBar.innerHTML = `
		<span style="color:#aaa;">阵容总战力：</span>
		<span style="color:#ffd700;font-size:16px;font-weight:bold;">${totalPower}</span>
	`;
	container.appendChild(totalPowerBar);
	// ... 后续代码保持不变 ...
	// 在创建 gridDiv 之前，添加顶部占位，避免固定定位的总战力遮挡
	// const topSpacer = document.createElement('div');
	// topSpacer.style.cssText = 'height: 30px; width: 100%;';
	// container.appendChild(topSpacer);

	// ===== 【新增】创建可滚动的内容容器 =====
	const scrollableContent = document.createElement('div');
	scrollableContent.className = 'team-scrollable-content';
	container.appendChild(scrollableContent);

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

	// 将 gridDiv 和 infoDiv 放入 scrollableContent
	scrollableContent.appendChild(gridDiv);
	scrollableContent.appendChild(infoDiv);


	// 底部导航栏：更换 / 培养 / 其他（固定在容器底部，不在 scrollableContent 内）
	const navDiv = document.createElement('div');
	navDiv.className = 'team-footer';
	navDiv.id = 'team-nav';

	const navBtns = [
		{ id: 'btn-team-change', text: '更换', action: () => onTeamNavChange() },
		{ id: 'btn-team-train', text: '培养', action: () => onTeamNavTrain() },
		{
			id: 'btn-team-other',
			text: '详细属性',
			action: () => {
				showCharacterDetailPopup();
			}
		},
	];
	navBtns.forEach(cfg => {
		const btn = document.createElement('button');
		btn.className = 'ybrpg-team-btn';
		btn.id = cfg.id;
		btn.textContent = cfg.text;
		btn.onclick = cfg.action;
		navDiv.appendChild(btn);
	});

	// 将 navDiv 添加到 container（不在 scrollableContent 内）
	container.appendChild(navDiv);

	// 记录当前选中的方格索引
	window._selectedSlotIndex = null;

}
/**
 * 显示角色详细属性弹窗（阵容界面使用）
 * 展示：名字、等级、品质、攻防血速、六大特殊属性、增伤减伤等
 */
function showCharacterDetailPopup() {
	// 1. 获取当前选中的角色
	const selectedIdx = window._selectedSlotIndex;
	let instanceId = null;

	if (selectedIdx !== null && selectedIdx !== undefined && window.currentTeam[selectedIdx]) {
		instanceId = window.currentTeam[selectedIdx];
	} else if (window.currentTeam && window.currentTeam.length > 0) {
		instanceId = window.currentTeam.find(id => id);
	}

	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		Game.toast('请先在队伍中选择一个角色', 'warning');
		return;
	}

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList[charId];

	if (!baseChar) {
		Game.toast('角色数据异常', 'error');
		return;
	}

	// 2. 计算最终属性
	const teamBonuses = Game.Stat.teamBonuses();
	const finalStats = Game.Stat.final(instanceId, teamBonuses);

	// 3. 品质信息
	const RANK_LABELS = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const RANK_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	const TIP_LABELS = { damger: '偏攻', defense: '偏防', balanced: '均衡' };

	const level = instData.level || 1;
	const tupoText = instData.tupolevel > 0 ? `+${instData.tupolevel}` : '';
	const rankColor = RANK_COLORS[instData.rank] || '#888';
	const rankLabel = RANK_LABELS[instData.rank] || instData.rank;
	const tipLabel = TIP_LABELS[instData.template] || '';

	// 4. 创建遮罩层
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';

	// 5. 创建弹窗容器
	const popup = document.createElement('div');
	popup.style.cssText = `
		background: #1a1a1a;
		border: 2px solid #ffd700;
		border-radius: 12px;
		padding: 20px;
		max-width: 360px;
		width: 90%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		animation: dialogIn 0.2s ease;
	`;

	// ===== 标题：名字 + 突破等级 =====
	const title = document.createElement('div');
	title.style.cssText = `
		color: ${rankColor};
		font-size: 20px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 15px;
		padding-bottom: 10px;
		border-bottom: 1px solid #333;
	`;
	title.innerHTML = `${baseChar.name}${tupoText ? `<span style="color:#ffd700;"> ${tupoText}</span>` : ''}`;
	popup.appendChild(title);

	// ===== 角色基础信息（一行显示） =====
	const infoRow = document.createElement('div');
	infoRow.style.cssText = `
		display: flex;
		justify-content: space-around;
		align-items: center;
		margin-bottom: 12px;
		font-size: 13px;
		color: #ccc;
	`;
	infoRow.innerHTML = `
		<span>品质: <span style="color:${rankColor};font-weight:bold;">${rankLabel}</span></span>
		<span>等级: Lv.${level}</span>
		<span>类型: ${tipLabel}</span>
	`;
	popup.appendChild(infoRow);

	// ===== 四维属性（两列显示） =====
	const attrSection = document.createElement('div');
	attrSection.style.cssText = `
		background: #222;
		border-radius: 8px;
		padding: 10px;
		margin-bottom: 10px;
	`;

	const attrTitle = document.createElement('div');
	attrTitle.style.cssText = 'color:#ffd700;font-size:14px;font-weight:bold;margin-bottom:8px;';
	attrTitle.textContent = '基础属性';
	attrSection.appendChild(attrTitle);

	const attrGrid = document.createElement('div');
	attrGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;';

	const attrs = [
		{ label: '生命', value: finalStats.totalHp, color: '#44aaff' },
		{ label: '攻击', value: finalStats.totalAtk, color: '#ff4444' },
		{ label: '防御', value: finalStats.totalDef, color: '#88cc88' },
		{ label: '速度', value: finalStats.totalSpe, color: '#ffff44' },
	];

	attrs.forEach(attr => {
		const row = document.createElement('div');
		row.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;padding:3px 4px;';
		row.innerHTML = `
			<span style="color:#999;">${attr.label}</span>
			<span style="color:${attr.color};font-weight:bold;">${attr.value}</span>
		`;
		attrGrid.appendChild(row);
	});

	attrSection.appendChild(attrGrid);
	popup.appendChild(attrSection);

	// ===== 战斗属性（两列） =====
	const battleSection = document.createElement('div');
	battleSection.style.cssText = `
		background: #222;
		border-radius: 8px;
		padding: 10px;
		margin-bottom: 10px;
	`;

	const battleTitle = document.createElement('div');
	battleTitle.style.cssText = 'color:#ffd700;font-size:14px;font-weight:bold;margin-bottom:8px;';
	battleTitle.textContent = '战斗属性';
	battleSection.appendChild(battleTitle);

	const battleGrid = document.createElement('div');
	battleGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;';

	const battleAttrs = [
		{ label: '命中', value: finalStats.mingzhong ?? 10000, color: '#aaa' },
		{ label: '闪避', value: finalStats.shanbi ?? 0, color: '#44ff88' },
		{ label: '暴击', value: finalStats.baoji ?? 0, color: '#ffdd00' },
		{ label: '抗暴', value: finalStats.kangbao ?? 0, color: '#88aaff' },
		{ label: '暴伤', value: finalStats.baoshang ?? 0, color: '#ff66cc' },
		{ label: '守护', value: finalStats.shouhu ?? 0, color: '#66ccff' },
		{ label: '破击', value: finalStats.poji ?? 0, color: '#ff8844' },
		{ label: '格挡', value: finalStats.gedang ?? 0, color: '#4488ff' },
	];

	battleAttrs.forEach(attr => {
		const row = document.createElement('div');
		row.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;padding:3px 4px;';
		row.innerHTML = `
			<span style="color:#999;">${attr.label}</span>
			<span style="color:${attr.color};font-weight:bold;">${attr.value}</span>
		`;
		battleGrid.appendChild(row);
	});

	battleSection.appendChild(battleGrid);
	popup.appendChild(battleSection);

	// ===== 增伤减伤属性（两列） =====
	const dmgSection = document.createElement('div');
	dmgSection.style.cssText = `
		background: #222;
		border-radius: 8px;
		padding: 10px;
		margin-bottom: 10px;
	`;

	const dmgTitle = document.createElement('div');
	dmgTitle.style.cssText = 'color:#ffd700;font-size:14px;font-weight:bold;margin-bottom:8px;';
	dmgTitle.textContent = '增伤/减伤';
	dmgSection.appendChild(dmgTitle);

	const dmgGrid = document.createElement('div');
	dmgGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;';

	const dmgAttrs = [
		{ label: '固定增伤', value: finalStats.fixedDealUp ?? 0, color: '#ff6666' },
		{ label: '固定减伤', value: finalStats.fixedTakeDn ?? 0, color: '#66cc66' },
		{ label: '百分比增伤', value: ((finalStats.pctDealUp ?? 0) * 100).toFixed(1) + '%', color: '#ff8866' },
		{ label: '百分比减伤', value: ((finalStats.pctTakeDn ?? 0) * 100).toFixed(1) + '%', color: '#66cc88' },
		{ label: '固定治疗量', value: finalStats.fixedHeal ?? 0, color: '#66ff66' },
		{ label: '固定被治疗量', value: finalStats.fixedBeHeal ?? 0, color: '#88ff88' },
		{ label: '百分比治疗量', value: ((finalStats.pctHeal ?? 0) * 100).toFixed(1) + '%', color: '#44dd44' },
		{ label: '百分比被治疗量', value: ((finalStats.pctBeHeal ?? 0) * 100).toFixed(1) + '%', color: '#44ee44' },
	];

	dmgAttrs.forEach(attr => {
		const row = document.createElement('div');
		row.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;padding:3px 4px;';
		row.innerHTML = `
			<span style="color:#999;">${attr.label}</span>
			<span style="color:${attr.color};font-weight:bold;">${attr.value}</span>
		`;
		dmgGrid.appendChild(row);
	});

	dmgSection.appendChild(dmgGrid);
	popup.appendChild(dmgSection);

	// ===== 战斗力 =====
	const power = Game.Stat.power(finalStats);
	const powerSection = document.createElement('div');
	powerSection.style.cssText = `
		text-align: center;
		margin-bottom: 12px;
		padding: 8px;
		background: #1a1a2e;
		border-radius: 6px;
		border: 1px solid #ffd70044;
	`;
	powerSection.innerHTML = `
		<span style="color:#aaa;font-size:13px;">战斗力：</span>
		<span style="color:#ffd700;font-size:18px;font-weight:bold;">${power}</span>
	`;
	popup.appendChild(powerSection);

	// ===== 关闭按钮 =====
	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.textContent = '关闭';
	closeBtn.style.cssText = 'width:100%;padding:10px;font-size:14px;margin-top:5px;';
	closeBtn.onclick = () => {
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
	};
	popup.appendChild(closeBtn);

	overlay.appendChild(popup);
	document.body.appendChild(overlay);

	// 点击遮罩关闭
	overlay.onclick = (e) => {
		if (e.target === overlay) {
			if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		}
	};
}
/**
 * 显示突破预览弹窗
 * @param {string|null} targetInstanceId - 可选，指定要查看的角色实例ID
 */
function showBreakthroughPreviewPopup(targetInstanceId = null) {
	let instanceId = targetInstanceId;

	// 如果没有传入实例ID，则从阵容中获取
	if (!instanceId) {
		const selectedIdx = window._selectedSlotIndex;
		if (selectedIdx !== null && selectedIdx !== undefined && window.currentTeam[selectedIdx]) {
			instanceId = window.currentTeam[selectedIdx];
		} else if (window.currentTeam && window.currentTeam.length > 0) {
			instanceId = window.currentTeam.find(id => id);
		}
	}

	// 1. 获取当前选中的角色
	// const selectedIdx = window._selectedSlotIndex;
	// let instanceId = null;

	// if (selectedIdx !== null && selectedIdx !== undefined && window.currentTeam[selectedIdx]) {
	// 	instanceId = window.currentTeam[selectedIdx];
	// } else if (window.currentTeam && window.currentTeam.length > 0) {
	// 	instanceId = window.currentTeam.find(id => id);
	// }

	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		Game.toast('请先选择一个角色，不论是背包还是阵容里', 'warning');
		return;
	}

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList[charId];

	if (!baseChar) {
		Game.toast('角色数据异常', 'error');
		return;
	}

	// 2. 创建遮罩层
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.id = 'breakthrough-preview-overlay';

	// 3. 创建弹窗容器
	const popup = document.createElement('div');
	popup.style.cssText = `
		background: #1a1a1a;
		border: 2px solid #ffd700;
		border-radius: 12px;
		padding: 20px;
		max-width: 380px;
		width: 90%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		animation: dialogIn 0.2s ease;
	`;

	// 4. 标题
	const title = document.createElement('div');
	title.className = 'bp-popup-title';  // 添加这个
	title.style.cssText = 'color:#ffd700;font-size:18px;font-weight:bold;text-align:center;margin-bottom:15px;';
	const currentTupoLevel = instData.tupolevel || 0;
	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	title.innerHTML = `${baseChar.name} 突破预览`;
	popup.appendChild(title);

	// 5. 角色概览
	const header = document.createElement('div');
	header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #333;';

	const charImg = document.createElement('img');
	charImg.src = `/image/character/${charId}.jpg`;
	charImg.style.cssText = 'width:48px;height:48px;border-radius:6px;border:2px solid #ffd700;object-fit:cover;object-position: center top;';
	charImg.onerror = function () { this.src = '/image/character/default.jpg'; };
	header.appendChild(charImg);

	const charInfo = document.createElement('div');
	charInfo.style.cssText = 'flex:1;';

	const charName = document.createElement('div');
	charName.className = 'bp-char-name';
	charName.style.cssText = 'color:#fff;font-size:15px;font-weight:bold;';
	const tupoText = currentTupoLevel > 0 ? ` +${currentTupoLevel}` : '';
	charName.innerHTML = `<span style="color:${rankColors[instData.rank] || '#888'};font-size:14px;">${instData.name}${tupoText}</span>`;
	charInfo.appendChild(charName);

	const charLevel = document.createElement('div');
	charLevel.className = 'bp-char-level';  // 添加这个
	charLevel.style.cssText = 'color:#aaa;font-size:12px;margin-top:2px;';
	charLevel.textContent = `当前突破: ${currentTupoLevel} 阶 · 等级: Lv.${instData.level || 1}`;
	charInfo.appendChild(charLevel);

	header.appendChild(charInfo);
	popup.appendChild(header);

	// 6. 突破列表滚动区
	const listContainer = document.createElement('div');
	listContainer.className = 'bp-list-container';  // 添加这个
	listContainer.style.cssText = 'flex:1;overflow-y:auto;padding-right:4px;';
	listContainer.style.scrollbarWidth = 'thin';
	listContainer.style.scrollbarColor = '#555 #222';

	// 复用 renderBreakthroughList（已支持实例 tupoList / 已吸收宝物槽识别 / 空槽点击吸收）
	renderBreakthroughList(listContainer, baseChar, currentTupoLevel, instData, instanceId, popup);

	popup.appendChild(listContainer);
	// ===== 【新增】突破/升阶操作按钮 =====
	if (instanceId && instData) {
		const actionBtnRow = document.createElement('div');
		actionBtnRow.className = 'bp-action-row';  // 添加这个
		actionBtnRow.style.cssText = 'display:flex;gap:10px;margin-top:12px;';

		const currentTupoForAction = instData.tupolevel || 0;
		const charIdForAction = instData.charId || instanceId;
		const baseCharForAction = characterList[charIdForAction];

		if (baseCharForAction) {
			let breakInfo = getBreakthroughInfo(baseCharForAction, currentTupoForAction);
			let needPromotion = needUpgrade(instData);
			// 在 doBreakBtn 附近，先计算可用材料数量
			const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
				if (id === instanceId) return false;
				const inst = window.charBagData[id];
				return inst && (inst.charId === charIdForAction || id === charIdForAction);
			});
			const availableCount = availableFodderIds.length;
			// 突破按钮
			// 突破按钮
			if (!breakInfo.maxed && !needPromotion) {
				// ===== 【新增】突破等级门槛：突破到 currentTupoForAction+1 阶需先达到指定等级 =====
				const reqLevel = getBreakthroughRequiredLevel(currentTupoForAction + 1);
				const curLevel = instData.level || 1;
				const levelOk = curLevel >= reqLevel;

				// 用垂直包裹层，让警告（如有）显示在突破键上方，按钮保持原样
				const breakWrap = document.createElement('div');
				breakWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;';

				// ===== 【新增】等级不足时，在突破键上方用红字醒目提示 =====
				if (!levelOk) {
					const levelWarn = document.createElement('div');
					levelWarn.style.cssText = `
						width: 100%;
						padding: 6px 8px;
						text-align: center;
						color: #ff4d4f;
						font-size: 13px;
						font-weight: bold;
						background: rgba(255, 77, 79, 0.12);
						border: 1px solid #ff4d4f;
						border-radius: 6px;
						box-sizing: border-box;
					`;
					levelWarn.textContent = `⚠ 等级不足！突破到 ${currentTupoForAction + 1} 阶需先达到 Lv.${reqLevel}（当前 Lv.${curLevel}）`;
					breakWrap.appendChild(levelWarn);
				}

				const doBreakBtn = document.createElement('button');
				doBreakBtn.style.cssText = `
					flex: 1;
					padding: 8px;
					font-size: 13px;
					cursor: pointer;
					background: #44aaff;
					color: #fff;
					border: none;
					border-radius: 6px;
					transition: all 0.2s;
				`;
				// 按钮文字保持：突破（可用/需要），不受等级影响
				doBreakBtn.textContent = `突破（${availableCount}/${breakInfo.cost}）`;
				// 如果材料不足或等级不足，按钮置灰
				if (!levelOk) {
					doBreakBtn.style.background = '#555';
					doBreakBtn.style.cursor = 'not-allowed';
					doBreakBtn.style.opacity = '0.6';
					doBreakBtn.disabled = true;
				} else if (availableCount < breakInfo.cost) {
					doBreakBtn.style.background = '#555';
					doBreakBtn.style.cursor = 'not-allowed';
					doBreakBtn.style.opacity = '0.6';
				} else {
					doBreakBtn.onmouseover = () => { doBreakBtn.style.background = '#55bbff'; };
					doBreakBtn.onmouseout = () => { doBreakBtn.style.background = '#44aaff'; };
				}
				doBreakBtn.onclick = (e) => {
					e.stopPropagation();

					const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
						if (id === instanceId) return false;
						const inst = window.charBagData[id];
						return inst && (inst.charId === charIdForAction || id === charIdForAction);
					});
					const availableCount = availableFodderIds.length;

					if (availableCount < breakInfo.cost) {
						Game.toast(`突破材料不足！需要 ${breakInfo.cost} 个同名角色，当前可用: ${availableCount}`, 'error');
						return;
					}

					// 改为直接刷新弹窗内部数据：
					Game.confirmDialog(
						`确定要突破【${baseCharForAction.name}】吗？\n当前突破等级: ${currentTupoForAction}阶 → 目标: ${currentTupoForAction + 1}阶\n消耗: ${breakInfo.cost}个同名角色`,
						() => {
							const result = breakthroughCharacterInstance(instanceId);
							if (result.success) {
								Game.toast(result.message, 'success');
								// refreshTeamViewDisplay();
								// Game.UI.refresh({
								// 	instanceId: instanceId,
								// 	forceTeamRebuild: false
								// });

								// 优化方案：只刷新必要的部分
								// 1. 更新角色实例的 openSpskill
								const instData = window.charBagData && window.charBagData[instanceId];
								if (instData) {
									const updatedStats = updateCharacterSP(instData);
									if (updatedStats && updatedStats.openSpskill !== undefined) {
										instData.openSpskill = updatedStats.openSpskill;
									}
								}

								// 2. 只刷新阵容显示（不重新渲染整个视图）
								refreshTeamViewDisplay();

								// 3. 刷新当前弹窗
								refreshBreakthroughPopupContent(popup, instanceId);

								// 4. 自动保存
								if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
									SaveManager.autoSave();
								}
								// ===== 【改为】直接刷新弹窗内容，不关闭重建 =====
								// refreshBreakthroughPopupContent(popup, instanceId);
							} else {
								Game.toast(result.message, 'error');
							}
						}
					);
				};
				breakWrap.appendChild(doBreakBtn);
				actionBtnRow.appendChild(breakWrap);
			}

			// 升阶按钮
			if (needPromotion) {
				const promoteBtn = document.createElement('button');
				promoteBtn.style.cssText = `
					flex: 1;
					padding: 8px;
					font-size: 13px;
					cursor: pointer;
					background: #ffaa00;
					color: #000;
					border: none;
					border-radius: 6px;
					transition: all 0.2s;
				`;
				// ===== 【修改】显示当前可用/需要 =====
				const promotionCost = Math.floor(currentTupoForAction / 4) + 1;
				promoteBtn.textContent = `升阶（${availableCount}/${promotionCost}）`;
				if (availableCount < promotionCost) {
					promoteBtn.style.background = '#555';
					promoteBtn.style.cursor = 'not-allowed';
					promoteBtn.style.opacity = '0.6';
				} else {
					promoteBtn.onmouseover = () => { promoteBtn.style.background = '#ffbb22'; };
					promoteBtn.onmouseout = () => { promoteBtn.style.background = '#ffaa00'; };
				}
				promoteBtn.onclick = (e) => {
					e.stopPropagation();

					const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
						if (id === instanceId) return false;
						const inst = window.charBagData[id];
						return inst && (inst.charId === charIdForAction || id === charIdForAction);
					});
					const availableCount = availableFodderIds.length;

					if (availableCount < promotionCost) {
						Game.toast(`升阶材料不足！需要 ${promotionCost} 个同名角色，当前可用: ${availableCount}`, 'error');
						return;
					}

					Game.confirmDialog(
						`确定要将【${baseCharForAction.name}】升阶至【${getRankLabel(needPromotion)}】吗？`,
						() => {
							const result = promoteCharacterRank(instanceId);
							if (result.success) {
								Game.toast(result.message, 'success');
								// if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
								// showBreakthroughPreviewPopup();
								// Game.UI.refresh({
								// 	instanceId: instanceId,
								// 	forceTeamRebuild: false
								// });

								// 优化方案：只刷新必要的部分
								// 1. 更新角色实例的 openSpskill
								const instData = window.charBagData && window.charBagData[instanceId];
								if (instData) {
									const updatedStats = updateCharacterSP(instData);
									if (updatedStats && updatedStats.openSpskill !== undefined) {
										instData.openSpskill = updatedStats.openSpskill;
									}
								}

								// 2. 只刷新阵容显示（不重新渲染整个视图）
								refreshTeamViewDisplay();

								// 3. 刷新当前弹窗
								refreshBreakthroughPopupContent(popup, instanceId);

								// 4. 自动保存
								if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
									SaveManager.autoSave();
								}
								// refreshBreakthroughPopupContent(popup, instanceId);
							} else {
								Game.toast(result.message, 'error');
							}
						}
					);
				};
		actionBtnRow.appendChild(promoteBtn);
	}

		// 已满级提示
			if (breakInfo.maxed) {
				const maxedLabel = document.createElement('div');
				maxedLabel.style.cssText = 'flex:1;padding:8px;text-align:center;color:#ffd700;font-size:13px;';
				maxedLabel.textContent = '✨ 已突破至极限';
				actionBtnRow.appendChild(maxedLabel);
			}
		}

		popup.appendChild(actionBtnRow);
	}

	// 7. 关闭按钮
	// 7. 关闭按钮
	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.style.cssText = 'width:100%;margin-top:15px;padding:10px;font-size:14px;';
	closeBtn.textContent = '关闭';
	closeBtn.onclick = () => {
		// 清除标记
		window._pendingRefreshAfterBreakthrough = null;
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
	};
	popup.appendChild(closeBtn);

	overlay.appendChild(popup);
	document.body.appendChild(overlay);

	// 点击遮罩关闭
	overlay.onclick = (e) => {
		if (e.target === overlay) {
			// 清除标记
			window._pendingRefreshAfterBreakthrough = null;
			if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		}
	};
}
/**
 * 刷新突破详情弹窗的内容（不关闭弹窗，原地更新）
 * @param {HTMLElement} popup - 弹窗容器
 * @param {string} instanceId - 角色实例ID
 */
function refreshBreakthroughPopupContent(popup, instanceId) {
	// console.log('刷新突破详情弹窗的参数',popup,instanceId)
	if (!popup || !instanceId || !window.charBagData || !window.charBagData[instanceId]) return;

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList[charId];
	if (!baseChar) return;

	const currentTupoLevel = instData.tupolevel || 0;
	// 1. 更新标题中的突破等级
	// const title = popup.querySelector('.bp-popup-title');
	// if (title) {
	// 	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	// 	const tupoText = currentTupoLevel > 0 ? ` <span style="color:#ffd700;font-size:13px;">+${currentTupoLevel}</span>` : '';
	// 	title.innerHTML = `${baseChar.name}${tupoText} <span style="color:${rankColors[baseChar.rank] || '#888'};font-size:14px;">突破预览</span>`;
	// }
	// 2. 刷新角色名
	const name = popup.querySelector('.bp-char-name');
	if (name) {
		const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
		const tupoText = currentTupoLevel > 0 ? ` +${currentTupoLevel}` : '';
		name.innerHTML = `<span style="color:${rankColors[instData.rank] || '#888'};font-size:14px;">${instData.name}${tupoText}</span>`;
	}
	// 2. 更新概览中的突破等级
	const charLevelEl = popup.querySelector('.bp-char-level');
	if (charLevelEl) {
		charLevelEl.textContent = `当前突破: ${currentTupoLevel} 阶 · 等级: Lv.${instData.level || 1}`;
	}

	// 3. 重新渲染突破列表
	const listContainer = popup.querySelector('.bp-list-container');
	if (listContainer) {
		listContainer.innerHTML = '';
		renderBreakthroughList(listContainer, baseChar, currentTupoLevel, instData, instanceId, popup);
	}

	// 4. 更新操作按钮区域
	const actionBtnRow = popup.querySelector('.bp-action-row');
	if (actionBtnRow) {
		actionBtnRow.innerHTML = '';
		renderBreakthroughActions(actionBtnRow, instanceId, instData, baseChar, currentTupoLevel, popup);
	}
	// // ===== 【新增】刷新父弹窗和背包 =====
	// if (window._pendingRefreshAfterBreakthrough && window._pendingRefreshAfterBreakthrough.instanceId === instanceId) {
	// 	const pending = window._pendingRefreshAfterBreakthrough;
	// 	if (pending.parentDialog) {
	// 		refreshCharDetailPopupContent(instanceId, pending.parentDialog);
	// 	}
	// 	// 刷新阵容显示
	// 	refreshTeamViewDisplay();
	// 	// 刷新背包视图
	// 	try {
	// 		const bagView = document.getElementById('bag-view');
	// 		if (bagView && bagView.style.display !== 'none') {
	// 			renderBagView(bagView);
	// 		}
	// 	} catch (e) { }
	// }
	// Game.UI.refresh({
	// 	instanceId: instanceId,
	// 	dialog: window._pendingRefreshAfterBreakthrough?.parentDialog || null
	// });
	refreshTeamViewDisplay();
	SaveManager.autoSave();
}
/**
 * 判断某个突破项是否为「无效果 / 待配置」占位项
 *  - null / undefined
 *  - 字符串但库中查不到对应配置
 *  - 对象但没有 desc 也没有 type（如空 {} 或仅含 level 的占位）
 */
function isNoEffectBreakthrough(buff) {
	if (!buff) return true;
	if (typeof buff === 'string') {
		const lib = BREAKTHROUGH_BUFF_LIBRARY || {};
		const resolved = lib[buff];
		return !resolved || (!resolved.desc && !resolved.type);
	}
	if (typeof buff === 'object') {
		return !buff.desc && !buff.type;
	}
	return false;
}

// ======================================================================
// 【吸收宝物机制】宝物 → 突破条目 编译器 + 吸收 API + 选择弹窗
// 设计（按策划简化）：吸收的宝物直接编译成突破条目，写入角色实例的
// tupoList 空槽（替换 null），原型引用以 _absorbedTreasure 键值随槽位持久化；
// syncInstanceTupoList 重建列表时会保留带 _absorbedTreasure 标记的槽，不被模板覆盖。
// 当前 equip.js 的 TREASURE_DEFS 宝物为「属性型」（atk/baoji/def/... + desc(star) 函数），
// 故主路径走 self_stat_flat 属性吸收；若宝物额外定义 type+effect / effects / effectSkills，
// 也会一并编译成 skill_effect（与突破库同源，引擎已支持对应触发点）。
// 重要：吸收宝物槽与真实突破效果一致——只有达到该突破层数（i < tupolevel）才解锁，
// 未突破到该阶时其属性与技能一律不生效（结算端 system.js / battle_refactored.js 已按门槛过滤）。
// ======================================================================

// 宝物 type → 突破 trigger 映射（仅含引擎已触发/已补触发点的类型）
const TREASURE_TYPE_TRIGGER_MAP = {
	on_kill: 'onKill',
	on_hit: 'onHitSelf',
	on_pugong: 'pugongHit',
	on_skill: 'skillEnd',
	on_death: 'dieSelf',
	on_turn_start: 'onTurnStart',   // 已补触发点
	on_any_death: 'onAnyDeath',     // 已补触发点
	// passive / on_damage_dealt 暂不支持吸收（无对应引擎触发点）
};

// 构造兼容宝物 effect(ctx) 的上下文，桥接到 Battle 环境
function makeTreasureCtx(unit, extra) {
	const B = (window.Game && window.Game.Battle) || (typeof Battle !== 'undefined' ? Battle : null);
	return Object.assign({
		unit: unit,
		killer: unit,
		attacker: null,
		target: null,
		deadUnit: null,
		addLog: (msg) => { if (B && B.log) B.log(msg); else console.log(msg); },
		showDamageNumber: (u, v, isHeal) => { if (B && B.showDamageNumber) B.showDamageNumber(u, v, isHeal); },
		calcDamage: (src, defVal, coeff) => {
			if (B && B.calculateDamage) {
				try { return B.calculateDamage(src, { def: defVal }, coeff, 0, 'pugong').damage; } catch (e) { return 0; }
			}
			return 0;
		},
		triggerOnDeath: (victim, killer) => { if (B && B.triggerOnDeath) B.triggerOnDeath(victim, killer); },
		triggerOnEnemyDeath: (victim, killer) => { if (B && B.triggerOnEnemyDeath) B.triggerOnEnemyDeath(victim, killer); },
	}, extra || {});
}

/**
 * 把背包宝物编译成突破条目数组（供 buildUnit / UI 预览复用）
 * @param {string} baseId 宝物定义 id（TREASURE_DEFS）
 * @param {number} level 宝物强化等级
 * @returns {Array} 突破条目：{type:'skill_effect', trigger, filter, content, desc, sourceName} 或 {type:'self_stat_flat',...}
 */
function compileTreasureToBreakthroughEntries(baseId, level) {
	const defs = TREASURE_DEFS || {};
	const def = defs[baseId];
	if (!def) return [];
	const entries = [];
	const lvl = level || 1;
	// desc 可能是函数 desc(star)，兼容字符串
	const descText = (typeof def.desc === 'function') ? def.desc(lvl) : (def.desc || def.name || '');

	// 1) 属性类（self_stat_flat）：当前 equip.js 宝物主路径，按强化等级 star 缩放
	const flatKeys = ['atk', 'def', 'hp', 'spe', 'mingzhong', 'shanbi', 'baoji', 'kangbao', 'baoshang', 'shouhu', 'poji', 'gedang',
		'fixedDealUp', 'fixedTakeDn', 'fixedHeal', 'fixedBeHeal', 'pctDealUp', 'pctTakeDn', 'pctHeal', 'pctBeHeal'];
	const flat = {}; let hasFlat = false;
	flatKeys.forEach(k => { if (def[k] !== undefined) { flat[k] = Number(def[k]) * lvl; hasFlat = true; } });
	if (hasFlat) entries.push(Object.assign({ type: 'self_stat_flat', desc: descText, sourceName: def.name }, flat));

	// 2) 新式内联 effects：{trigger, filter, content}
	if (Array.isArray(def.effects)) {
		def.effects.forEach(eff => {
			if (eff && eff.trigger && typeof eff.content === 'function') {
				// 【修复】保留原 trigger（含 roundStart），与装备宝物（adaptTreasureEffects）行为一致：
				// roundStart 由 showBattleIntro 的 triggerGlobalEffect('roundStart', 1) 开局全局派发触发，
				// 派发会传入 round，故原 filter(round===1) 可正确判定首轮；
				// 若归一成 onTurnStart 会把开局特效拖到该角色进入回合才发动（如魑魅天鸟开局秒人变卡死）。
				entries.push({ type: 'skill_effect', trigger: eff.trigger, filter: eff.filter || null, content: eff.content, probMod: eff.probMod || null, desc: eff.desc || def.name, sourceName: def.name });
			}
		});
	}
	// 3) 旧式 effectSkills 引用 BREAKTHROUGH_BUFF_LIBRARY
	if (Array.isArray(def.effectSkills)) {
		def.effectSkills.forEach(id => {
			const buff = (typeof BREAKTHROUGH_BUFF_LIBRARY !== 'undefined' ? BREAKTHROUGH_BUFF_LIBRARY : {})[id];
			if (buff) entries.push(Object.assign({ type: 'skill_effect' }, buff, { sourceName: def.name }));
		});
	}
	// 4) type + effect(ctx) 风格（TREASURE_DEFS 背包宝物主流）
	if (def.type && typeof def.effect === 'function') {
		const trigger = TREASURE_TYPE_TRIGGER_MAP[def.type];
		if (trigger) {
			const effectFn = def.effect;
			const content = function (arg1, arg2) {
				const ctx = makeTreasureCtx(this, {});
				if (trigger === 'onHitSelf') ctx.attacker = arg1;
				else if (trigger === 'onKill') ctx.target = arg1;
				else if (trigger === 'pugongHit') ctx.target = arg1;
				else if (trigger === 'dieSelf') ctx.killer = arg1;
				else if (trigger === 'onAnyDeath') ctx.deadUnit = arg1;
				try { effectFn.call(def, ctx); }
				catch (e) { console.warn('[吸收宝物] effect 执行失败', baseId, e); }
			};
			entries.push({ type: 'skill_effect', trigger, filter: null, content, desc: def.desc || def.name, sourceName: def.name });
		} else {
			console.warn(`[吸收宝物] 宝物 ${baseId} 的特效类型 ${def.type} 暂不支持吸收`);
		}
	}
	return entries;
}
window.compileTreasureToBreakthroughEntries = compileTreasureToBreakthroughEntries;

// 判断某宝物是否可被吸收（含至少一个可编译能力）
function canAbsorbTreasure(baseId, level) {
	const entries = compileTreasureToBreakthroughEntries(baseId, level);
	return entries.length > 0;
}

/**
 * 执行吸收：把背包宝物实例吸收进指定突破空槽
 * @param {string} instanceId 角色实例ID
 * @param {number} slotIndex 突破槽索引（0-based）
 * @param {string} treasureInstanceId 背包宝物实例ID
 * @param {HTMLElement} popup 突破详情弹窗（用于刷新）
 */
function absorbTreasureIntoSlot(instanceId, slotIndex, treasureInstanceId, popup) {
	const instData = window.charBagData && window.charBagData[instanceId];
	const inv = window.treasureInventory && window.treasureInventory[treasureInstanceId];
	if (!instData || !inv) return;
	const baseId = inv.baseId;
	const level = inv.level || 1;
	if (!canAbsorbTreasure(baseId, level)) {
		Game.toast('该宝物暂无可吸收的能力', 'warning');
		return;
	}
	// 若宝物已装备，先卸下
	if (inv.equippedBy) {
		const ownerSlots = window.charTreasureSlots && window.charTreasureSlots[inv.equippedBy];
		if (ownerSlots) {
			const idx = ownerSlots.indexOf(treasureInstanceId);
			if (idx !== -1) ownerSlots[idx] = null;
		}
		inv.equippedBy = null;
	}
	// 直接把吸收数据写入突破列表对应空槽（替换 null）。
	// - 属性类（self_stat_flat）：把编译出的数值内联进槽位对象，computeStats 会按 self_stat_flat 同源结算；
	// - 特效类（skill_effect）：content 是函数无法 JSON 序列化，故只存原型 _absorbedTreasure，
	//   buildUnit 时再由 compileTreasureToBreakthroughEntries 重新解析成技能特效。
	const charId = instData.charId || instanceId;
	if (!Array.isArray(instData.tupoList)) {
		instData.tupoList = ((characterList[charId] && characterList[charId].tupoList) || []).slice();
	}
	const compiledEntries = compileTreasureToBreakthroughEntries(baseId, level);
	const flatKeys = ['atk', 'def', 'hp', 'spe', 'mingzhong', 'shanbi', 'baoji', 'kangbao', 'baoshang', 'shouhu', 'poji', 'gedang',
		'fixedDealUp', 'fixedTakeDn', 'fixedHeal', 'fixedBeHeal', 'pctDealUp', 'pctTakeDn', 'pctHeal', 'pctBeHeal'];
	const inlineFlat = {};
	compiledEntries.forEach(e => {
		if (e.type === 'self_stat_flat') {
			flatKeys.forEach(k => { if (e[k] !== undefined) inlineFlat[k] = (inlineFlat[k] || 0) + Number(e[k]); });
		}
	});
	const descText = (compiledEntries[0] && compiledEntries[0].desc) || (TREASURE_DEFS[baseId] || {}).name || baseId;
	// 写入突破槽（吸收核心逻辑）
	const doAbsorb = () => {
		// 兜底校验：只有达到该突破层数（slotIndex < tupolevel）才允许写入未吸收槽，
		// 防止绕过 UI 在未解锁槽消耗宝物（与结算端门槛一致）
		const _tl = (instData && typeof instData.tupolevel === 'number') ? instData.tupolevel : 0;
		const _existing = instData.tupoList && instData.tupoList[slotIndex];
		const _alreadyAbsorbed = !!(_existing && _existing._absorbedTreasure);
		if (!_alreadyAbsorbed && slotIndex >= _tl) {
			console.warn('[吸收宝物] 槽位未解锁，拒绝吸收', instanceId, slotIndex, _tl);
			return;
		}
			// 记录被吸收宝物的实例ID与完整属性快照（含 level），
			// 卸下时可原样返还背包、沿用原实例ID。
			const _absorbedInv = inv ? Object.assign({}, inv) : { baseId: baseId, level: level };
			instData.tupoList[slotIndex] = Object.assign({
				type: 'absorbed_treasure',
				_absorbedTreasure: {
					baseId, level,
					sourceName: (TREASURE_DEFS[baseId] || {}).name || baseId,
					treasureInstanceId: treasureInstanceId,
					inv: _absorbedInv
				},
				desc: descText
			}, inlineFlat);
			// 消耗（移出背包）；快照已存入 _absorbedTreasure，返还时可恢复
			delete window.treasureInventory[treasureInstanceId];
		// 持久化 + 刷新
		if (window.SaveManager) SaveManager.autoSave();
		refreshBreakthroughPopupContent(popup, instanceId);
		if (typeof renderBagView === 'function') {
			const bagView = document.getElementById('bag-view');
			if (bagView && bagView.style.display !== 'none') renderBagView(bagView);
		}
	};
	// 若目标槽已有「非吸收的突破效果」，吸收会覆盖它，先确认
	const existing = instData.tupoList && instData.tupoList[slotIndex];
	if (existing && !existing._absorbedTreasure && !isNoEffectBreakthrough(existing)) {
		const existDesc = existing.desc || (existing.type ? `效果类型: ${existing.type}` : '未知突破效果');
		Game.confirmDialog(`该突破槽已存在突破效果（${existDesc}），\n吸收宝物将覆盖它。确定继续？`, doAbsorb);
		return;
	}
	doAbsorb();
}

/**
 * 卸下突破槽已吸收的宝物：把槽位恢复为空白槽（可重新吸收）
 * @param {string} instanceId
 * @param {number} slotIndex
 * @param {HTMLElement} popup
 */
function removeAbsorbedTreasureFromSlot(instanceId, slotIndex, popup) {
	const instData = window.charBagData && window.charBagData[instanceId];
	if (!instData || !Array.isArray(instData.tupoList)) return;
	const slot = instData.tupoList[slotIndex];
	if (!slot || !slot._absorbedTreasure) return;
	const abs = slot._absorbedTreasure;
	// 返还宝物到背包：沿用原实例ID（若已被占用则新生成，绝不覆盖他人）；等级/属性按吸收前快照恢复
	const baseId = abs.baseId || (abs.inv && abs.inv.baseId);
	const restoreId = abs.treasureInstanceId || (baseId ? Game.Bag.newId(baseId) : null);
	if (restoreId && baseId) {
		const restored = Object.assign({}, abs.inv || { baseId: baseId, level: abs.level || 1 });
		restored.equippedBy = null; // 返还后处于未装备状态
		if (window.treasureInventory[restoreId]) {
			// 极小概率ID冲突：改用全新ID，避免覆盖已有实例
			window.treasureInventory[Game.Bag.newId(baseId)] = restored;
		} else {
			window.treasureInventory[restoreId] = restored;
		}
	}
	// 恢复为空白槽（无效果占位项，可重新被吸收）
	instData.tupoList[slotIndex] = {};
	if (window.SaveManager) SaveManager.autoSave();
	refreshBreakthroughPopupContent(popup, instanceId);
	if (typeof renderBagView === 'function') {
		const bagView = document.getElementById('bag-view');
		if (bagView && bagView.style.display !== 'none') renderBagView(bagView);
	}
}

/**
 * 二次选择弹窗：列出背包中可吸收的宝物，点击吸收
 */
function openTreasureAbsorbPicker(slotIndex, instanceId, popup) {
	// 判断当前槽是否已吸收宝物（用于显示「卸下」）
	const _inst = window.charBagData && window.charBagData[instanceId];
	const _curSlot = _inst && Array.isArray(_inst.tupoList) ? _inst.tupoList[slotIndex] : null;
	const slotAbsorbed = !!(_curSlot && _curSlot._absorbedTreasure);

	// 只有达到该突破层数（slotIndex < tupolevel）才允许吸收，避免玩家在未解锁槽消耗宝物
	const _tupolevel = (_inst && typeof _inst.tupolevel === 'number') ? _inst.tupolevel : 0;
	if (!slotAbsorbed && slotIndex >= _tupolevel) {
		Game.toast('该突破槽尚未解锁，需先突破到对应层数后才能吸收宝物。', 'warning');
		return;
	}

	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10002;';

	const box = document.createElement('div');
	box.style.cssText = 'background:#1a1a2e;border:1px solid #d000ff;border-radius:8px;padding:16px;width:600px;max-width:94vw;max-height:82vh;display:flex;flex-direction:column;color:#eee;';
	box.innerHTML = `
		<div style="font-size:16px;font-weight:bold;color:#ffd700;margin-bottom:2px;flex-shrink:0;">选择要吸收的宝物（突破槽 ${slotIndex + 1}）</div>
		<div style="font-size:12px;color:#888;margin-bottom:10px;flex-shrink:0;">点击宝物卡片可查看其技能并确认吸收</div>
	`;

	// 宝物网格：复用背包的 gallery-grid 布局（62px 卡片 + 10px 间距），与背包展示尺寸一致
	const grid = document.createElement('div');
	grid.className = 'gallery-grid';
	grid.style.cssText = 'flex:1;overflow-y:auto;min-height:0;align-content:start;padding:6px 10px;';
	box.appendChild(grid);

	// 宝物品质边框颜色（按宝物数值 rank 1~6 映射，与宝物背包一致）
	const EQUIP_RANK_BORDER_COLORS = {
		1: '#88cc88', 2: '#44aaff', 3: '#a335ee', 4: '#ff8800', 5: '#ff8d8d', 6: '#ffff00'
	};

	// 构建装备者查询表（与宝物背包一致）：被任意角色装备的宝物不可吸收
	const treasureOwnerMap = {};
	for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
		slots.forEach((tId) => {
			if (tId) treasureOwnerMap[tId] = { ownerId };
		});
	}

	// 过滤已装备宝物，得到可吸收候选
	const absorbable = Object.entries(window.treasureInventory || {})
		.filter(([tInstId]) => !treasureOwnerMap[tInstId])
		.map(([tInstId, inv]) => {
			const def = TREASURE_DEFS[inv.baseId] || {};
			return { instanceId: tInstId, baseId: inv.baseId, rank: def.rank || 0, level: inv.level || 1 };
		});
	// 与宝物背包共用排序规则（已装备已滤除，故按 等级降序 → 品质降序 → baseId 升序）
	sortTreasuresByBagOrder(absorbable, {});

	if (absorbable.length === 0) {
		const empty = document.createElement('div');
		empty.style.cssText = 'color:#888;padding:20px;text-align:center;width:100%;';
		empty.textContent = '背包中没有可吸收的宝物（已装备的宝物不可吸收）';
		grid.appendChild(empty);
	}

	absorbable.forEach((item) => {
		const inv = window.treasureInventory[item.instanceId];
		const tInstId = item.instanceId;
		const def = TREASURE_DEFS[inv.baseId] || {};
		const itemRank = def.rank || 1;
		const borderColor = EQUIP_RANK_BORDER_COLORS[itemRank] || '#888';
		const tdesc = (def.desc && typeof def.desc === 'function') ? def.desc(inv.level || 1) : (def.desc || '暂无描述');
		const instName = def.name || inv.baseId;
		const instLevel = inv.level || 1;

		const card = document.createElement('div');
		// 复用背包卡片类（gallery-char-card 定义 62px 卡片、equipbag-treasure-card 支持角标定位）
		// 不设外边框，仅保留图标品质色边框，避免边框干扰宝物名称浏览
		card.className = 'gallery-char-card equipbag-treasure-card';
		card.style.cssText = `background:#26263a;border-radius:8px;padding:5px 4px 4px;cursor:pointer;position:relative;box-sizing:border-box;`;
		card.title = `${instName} Lv.${instLevel}`;
		card.onmouseover = () => { card.style.background = '#2f2f45'; card.style.boxShadow = `0 0 8px ${borderColor}`; };
		card.onmouseout = () => { card.style.background = '#26263a'; card.style.boxShadow = 'none'; };

		// 图标（复用背包图标类：56x56、3px 品质边框、contain 裁切）
		const iconWrap = document.createElement('div');
		iconWrap.className = 'gallery-char-icon equipbag-icon';
		iconWrap.style.cssText = `border-color:${borderColor};position:relative;`;
		const makeFallback = () => {
			const fb = document.createElement('div');
			fb.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;color:#aaa;';
			fb.textContent = instName.charAt(0);
			return fb;
		};
		if (def.icon) {
			const img = document.createElement('img');
			img.className = 'gallery-char-img equipbag-icon-img';
			img.src = def.icon;
			img.alt = instName;
			img.onerror = function () {
				this.style.display = 'none';
				this.parentNode.appendChild(makeFallback());
			};
			iconWrap.appendChild(img);
		} else {
			iconWrap.appendChild(makeFallback());
		}

		// 等级角标（右下角，表示宝物培养等级）
		const levelBadge = document.createElement('div');
		levelBadge.style.cssText = 'position:absolute;bottom:1px;right:1px;background:rgba(0,0,0,0.8);color:#ffd700;font-size:9px;padding:0 3px;border-radius:2px;font-weight:bold;line-height:13px;pointer-events:none;';
		levelBadge.textContent = `Lv.${instLevel}`;
		iconWrap.appendChild(levelBadge);

		card.appendChild(iconWrap);

		// 名称
		const nameEl = document.createElement('div');
		nameEl.className = 'gallery-char-name';
		nameEl.style.cssText = 'font-size:11px;color:#ddd;white-space:normal;overflow:hidden;text-overflow:ellipsis;';
		nameEl.textContent = instName;
		card.appendChild(nameEl);

		// 点选 → 游戏确认弹窗：标题「是否吸收」+ 宝物技能 + 左侧确认右侧取消
		card.onclick = () => {
			const skillHtml = `
				<div style="background:#1e1e30;border:1px solid ${borderColor};border-left:4px solid ${borderColor};border-radius:6px;padding:10px 12px;margin:4px 0;">
					<div style="color:${borderColor};font-weight:bold;font-size:15px;margin-bottom:4px;">${instName} <span style="color:#ffd700;font-size:12px;">Lv.${instLevel}</span></div>
					<div style="color:#ccc;font-size:13px;line-height:1.6;white-space:pre-wrap;">${tdesc}</div>
				</div>
				<div style="color:#aaa;font-size:12px;margin-top:6px;">吸收后宝物将从背包移除，并镶嵌至该突破槽。</div>`;
			Game.confirmDialog(skillHtml, () => {
				absorbTreasureIntoSlot(instanceId, slotIndex, tInstId, popup);
				document.body.removeChild(overlay);
			}, null, { title: '是否吸收该宝物？', html: true, reverseButtons: true });
		};

		grid.appendChild(card);
	});

	// 底部固定操作栏（不随列表滚动）
	const footer = document.createElement('div');
	footer.style.cssText = 'flex-shrink:0;margin-top:12px;padding-top:12px;border-top:1px solid #333;display:flex;flex-direction:column;gap:8px;';

	if (slotAbsorbed) {
		const unequipBtn = document.createElement('button');
		unequipBtn.className = 'ybrpg-btn';
		unequipBtn.style.cssText = 'width:100%;padding:8px;background:#3a2a2a;border:1px solid #ff5555;color:#ff8888;';
		unequipBtn.textContent = '🗑️ 卸下当前宝物';
		unequipBtn.onclick = () => {
			removeAbsorbedTreasureFromSlot(instanceId, slotIndex, popup);
			document.body.removeChild(overlay);
		};
		footer.appendChild(unequipBtn);
	}

	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.style.cssText = 'width:100%;padding:8px;background:#333;border-color:#666;color:#ccc;';
	closeBtn.textContent = '返回';
	closeBtn.onclick = () => document.body.removeChild(overlay);
	footer.appendChild(closeBtn);

	box.appendChild(footer);

	overlay.appendChild(box);
	document.body.appendChild(overlay);
}

/**
 * 渲染突破列表到指定容器

 * @param {HTMLElement} container - 列表容器
 * @param {Object} baseChar - 角色基础数据
 * @param {number} currentTupoLevel - 当前突破等级
 */
function renderBreakthroughList(container, baseChar, currentTupoLevel, instData, instanceId, popup) {
	// 优先用实例自身的突破列表（含已吸收的宝物槽），回退到角色库模板
	const tupoList = (instData && Array.isArray(instData.tupoList) && instData.tupoList.length)
		? instData.tupoList
		: (baseChar.tupoList || STANDARD_BREAKTHROUGH_TEMPLATE || []);

	if (tupoList.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;text-align:center;padding:30px;font-size:14px;';
		emptyTip.textContent = '该角色暂无突破数据';
		container.appendChild(emptyTip);
		return;
	}

	tupoList.forEach((buff, index) => {
		const isUnlocked = (index + 1) <= currentTupoLevel;

		// 无效果占位项检测
		const isNoEffect = isNoEffectBreakthrough(buff);
		// 突破1阶（index 0）按设计「首次突破不带任何技能」，无效果时直接隐藏
		if (isNoEffect && index === 0) return;
		// 已吸收槽的宝物描述（用于另起一行展示）
		let detailDiv = null;

		const item = document.createElement('div');
		item.style.cssText = `
			background: ${isUnlocked ? '#2a2a3a' : '#1a1a1a'};
			border: 1px solid ${isUnlocked ? '#d000ff' : '#333'};
			border-left: 4px solid ${isUnlocked ? '#ffd700' : '#555'};
			border-radius: 4px;
			padding: 10px;
			margin-bottom: 8px;
			opacity: ${isUnlocked ? 1 : 0.6};
			transition: all 0.2s;
			cursor: ${isUnlocked ? 'pointer' : 'default'};
		`;

		// 标题行
		const headerRow = document.createElement('div');
		headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';

		const levelTitle = document.createElement('span');
		levelTitle.style.cssText = `font-weight:bold;font-size:14px;color:${isUnlocked ? '#ffd700' : '#888'};`;
		levelTitle.textContent = `突破 ${index + 1} 阶`;

		const rightGroup = document.createElement('div');
		rightGroup.style.cssText = 'display:flex;align-items:center;gap:8px;';

		const statusIcon = document.createElement('span');
		statusIcon.style.cssText = 'font-size:12px;';
		statusIcon.textContent = isUnlocked ? '✅ 已解锁' : '🔒 未解锁';
		statusIcon.style.color = isUnlocked ? '#44ff88' : '#c9a86a';

		rightGroup.appendChild(statusIcon);
		headerRow.appendChild(levelTitle);
		headerRow.appendChild(rightGroup);
		item.appendChild(headerRow);

		// 描述内容
		const descDiv = document.createElement('div');

		const absorbedRec = (buff && buff._absorbedTreasure) ? buff._absorbedTreasure : null;
		if (absorbedRec) {
			// 已吸收：显示来源宝物（非突破1阶且已解锁时，点击可重新吸收替换同一槽）
			const _effHint = isUnlocked ? '' : '（🔒 该突破槽未解锁，宝物能力暂未生效，需突破到该阶）';
			descDiv.style.cssText = `font-size:13px;line-height:1.4;color:${isUnlocked ? '#7CFC00' : '#c9a86a'};border-top:1px dashed #3a3a3a;padding-top:5px;margin-top:3px;`;
			descDiv.textContent = `🧪 已吸收：${absorbedRec.sourceName}（Lv.${absorbedRec.level}）${_effHint}`;
			item.style.border = '1px solid #44ff88';
			// 另起一行显示宝物描述
			const tDef = TREASURE_DEFS[absorbedRec.baseId] || {};
			const tdesc = (tDef.desc && typeof tDef.desc === 'function') ? tDef.desc(absorbedRec.level || 1) : (tDef.desc || '');
			if (tdesc) {
				detailDiv = document.createElement('div');
				detailDiv.style.cssText = `font-size:12px;line-height:1.5;color:#9adf9a;padding-top:4px;margin-top:4px;`;
				detailDiv.textContent = tdesc;
			}
			if (isUnlocked && index !== 0) {
				item.style.cursor = 'pointer';
				// 已吸收宝物的槽位再次点击：提示先卸下，不再直接进入吸收替换
				item.onclick = () => { Game.toast('请先卸下当前宝物，再吸收其他宝物', 'warning'); };
				item.onmouseover = () => { item.style.background = '#33334a'; };
				item.onmouseout = () => { item.style.background = '#1a1a1a'; };
			}
			// 卸下按钮（非突破1阶且已解锁）：把已吸收宝物从槽位卸下，恢复为空白槽
			if (index !== 0 && isUnlocked) {
				const unequipBtn = document.createElement('button');
				unequipBtn.textContent = '🗑️ 卸下';
				unequipBtn.style.cssText = 'padding:2px 8px;font-size:11px;background:#3a2a2a;border:1px solid #ff5555;color:#ff8888;border-radius:4px;cursor:pointer;';
				unequipBtn.onclick = (e) => {
					e.stopPropagation();
					Game.confirmDialog('确定卸下该突破槽已吸收的宝物？', () => {
						removeAbsorbedTreasureFromSlot(instanceId, index, popup);
					});
				};
				rightGroup.appendChild(unequipBtn);
			}
		} else if (isNoEffect) {
			// 空突破槽（突破1阶除外）：点击吸收宝物（锁定槽吸收后需突破到该阶才生效）
			descDiv.style.cssText = `font-size:13px;line-height:1.4;color:#ffd700;border-top:1px dashed #3a3a3a;padding-top:5px;margin-top:3px;cursor:pointer;`;
			descDiv.textContent = isUnlocked ? '➕ 空突破槽 · 点击吸收宝物' : '➕ 空突破槽 · 点击吸收宝物（需突破到该阶生效）';
			item.style.cursor = 'pointer';
			item.onclick = () => { if (index === 0) return; openTreasureAbsorbPicker(index, instanceId, popup); };
			item.onmouseover = () => { item.style.background = '#33334a'; };
			item.onmouseout = () => { item.style.background = '#1a1a1a'; };
		} else {
			// 普通突破槽：显示自身效果，不作吸收提示、不可点击吸收
			descDiv.style.cssText = `font-size:13px;line-height:1.4;color:${isUnlocked ? '#ddd' : '#c9a86a'};`;
			let resolvedBuff = buff;
			if (typeof buff === 'string') {
				const lib = BREAKTHROUGH_BUFF_LIBRARY || {};
				resolvedBuff = lib[buff];
				if (!resolvedBuff) resolvedBuff = { desc: '暂无详细描述' };
			} else if (typeof buff === 'object') {
				// 已经是对象，保持不变
			} else {
				resolvedBuff = { desc: '暂无详细描述' };
			}

			if (resolvedBuff.desc) {
				descDiv.textContent = resolvedBuff.desc;
			} else if (resolvedBuff.type) {
				let typeDesc = '';
				if (resolvedBuff.type === 'self_stat_flat') {
					const val = Array.isArray(resolvedBuff.value) ? resolvedBuff.value.join('/') : resolvedBuff.value;
					const stat = Array.isArray(resolvedBuff.stat) ? resolvedBuff.stat.join('/') : resolvedBuff.stat;
					typeDesc = `永久增加 ${stat}: ${val}`;
				} else if (resolvedBuff.type === 'passive_effect') {
					typeDesc = `获得被动效果: ${resolvedBuff.effectId || '未知'}`;
				} else if (resolvedBuff.type === 'skill_effect') {
					typeDesc = `技能效果增强: ${resolvedBuff.desc || '未知效果'}`;
				} else {
					typeDesc = `效果类型: ${resolvedBuff.type}`;
				}
				descDiv.textContent = typeDesc;
			} else {
				descDiv.textContent = '暂无详细描述';
			}
		}

		item.appendChild(descDiv);
		if (detailDiv) item.appendChild(detailDiv);

		// 已解锁项的悬停效果
		if (isUnlocked) {
			item.onmouseover = () => { item.style.background = '#33334a'; };
			item.onmouseout = () => { item.style.background = '#2a2a3a'; };
		}

		container.appendChild(item);
	});
}
/**
 * 渲染突破/升阶操作按钮到指定容器
 * @param {HTMLElement} container - 按钮容器
 * @param {string} instanceId - 角色实例ID
 * @param {Object} instData - 角色实例数据
 * @param {Object} baseChar - 角色基础数据
 * @param {number} currentTupoLevel - 当前突破等级
 * @param {HTMLElement} popup - 弹窗容器（用于刷新）
 */
function renderBreakthroughActions(container, instanceId, instData, baseChar, currentTupoLevel, popup) {
	if (!instanceId || !instData) return;

	const charIdForAction = instData.charId || instanceId;

	let breakInfo = getBreakthroughInfo(baseChar, currentTupoLevel);
	let needPromotion = needUpgrade(instData);

	// 计算可用材料数量
	const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
		if (id === instanceId) return false;
		const inst = window.charBagData[id];
		return inst && (inst.charId === charIdForAction || id === charIdForAction);
	});
	const availableCount = availableFodderIds.length;

	// 突破按钮
	if (!breakInfo.maxed && !needPromotion) {
		// 突破等级门槛：突破到 currentTupoLevel+1 阶需先达到指定等级
		const reqLevel = getBreakthroughRequiredLevel(currentTupoLevel + 1);
		const curLevel = instData.level || 1;
		const levelOk = curLevel >= reqLevel;

		// 用垂直包裹层，让警告（如有）显示在突破键上方，按钮保持原样
		const breakWrap = document.createElement('div');
		breakWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;';

		// ===== 【新增】等级不足时，在突破键上方用红字醒目提示 =====
		if (!levelOk) {
			const levelWarn = document.createElement('div');
			levelWarn.style.cssText = `
				width: 100%;
				padding: 6px 8px;
				text-align: center;
				color: #ff4d4f;
				font-size: 13px;
				font-weight: bold;
				background: rgba(255, 77, 79, 0.12);
				border: 1px solid #ff4d4f;
				border-radius: 6px;
				box-sizing: border-box;
			`;
			levelWarn.textContent = `⚠ 等级不足！突破到 ${currentTupoLevel + 1} 阶需先达到 Lv.${reqLevel}（当前 Lv.${curLevel}）`;
			breakWrap.appendChild(levelWarn);
		}

		const doBreakBtn = document.createElement('button');
		doBreakBtn.style.cssText = `
			flex: 1;
			padding: 8px;
			font-size: 13px;
			cursor: pointer;
			background: #44aaff;
			color: #fff;
			border: none;
			border-radius: 6px;
			transition: all 0.2s;
		`;
		// 按钮文字保持：突破（可用/需要），不受等级影响
		doBreakBtn.textContent = `突破（${availableCount}/${breakInfo.cost}）`;

		if (!levelOk) {
			// 等级不足：直接锁定按钮（不可点击）
			doBreakBtn.style.background = '#555';
			doBreakBtn.style.cursor = 'not-allowed';
			doBreakBtn.style.opacity = '0.6';
			doBreakBtn.disabled = true;
		} else if (availableCount < breakInfo.cost) {
			doBreakBtn.style.background = '#555';
			doBreakBtn.style.cursor = 'not-allowed';
			doBreakBtn.style.opacity = '0.6';
		} else {
			doBreakBtn.onmouseover = () => { doBreakBtn.style.background = '#55bbff'; };
			doBreakBtn.onmouseout = () => { doBreakBtn.style.background = '#44aaff'; };
			doBreakBtn.onclick = (e) => {
				e.stopPropagation();
				Game.confirmDialog(
					`确定要突破【${baseChar.name}】吗？\n当前突破等级: ${currentTupoLevel}阶 → 目标: ${currentTupoLevel + 1}阶\n消耗: ${breakInfo.cost}个同名角色`,
					() => {
						console.log('突破走这里了')
						const result = breakthroughCharacterInstance(instanceId);
						if (result.success) {
							Game.toast(result.message, 'success');
							// 原地刷新弹窗内容
							// Game.UI.refresh({
							// 	instanceId: instanceId,
							// 	forceTeamRebuild: false
							// });

							// 优化方案：只刷新必要的部分
							// 1. 更新角色实例的 openSpskill
							const instData = window.charBagData && window.charBagData[instanceId];
							if (instData) {
								const updatedStats = updateCharacterSP(instData);
								if (updatedStats && updatedStats.openSpskill !== undefined) {
									instData.openSpskill = updatedStats.openSpskill;
								}
							}

							// 2. 只刷新阵容显示（不重新渲染整个视图）
							refreshTeamViewDisplay();

							// 3. 刷新当前弹窗
							refreshBreakthroughPopupContent(popup, instanceId);

							// 4. 自动保存
							if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
								SaveManager.autoSave();
							}
							// refreshBreakthroughPopupContent(popup, instanceId);
						} else {
							Game.toast(result.message, 'error');
						}
					}
				);
			};
		}
		breakWrap.appendChild(doBreakBtn);
		container.appendChild(breakWrap);
	}

	// 升阶按钮
	if (needPromotion) {
		const promotionCost = Math.floor(currentTupoLevel / 4) + 1;
		const promoteBtn = document.createElement('button');
		promoteBtn.style.cssText = `
			flex: 1;
			padding: 8px;
			font-size: 13px;
			cursor: pointer;
			background: #ffaa00;
			color: #000;
			border: none;
			border-radius: 6px;
			transition: all 0.2s;
		`;
		promoteBtn.textContent = `升阶（${availableCount}/${promotionCost}）`;

		if (availableCount < promotionCost) {
			promoteBtn.style.background = '#555';
			promoteBtn.style.cursor = 'not-allowed';
			promoteBtn.style.opacity = '0.6';
		} else {
			promoteBtn.onmouseover = () => { promoteBtn.style.background = '#ffbb22'; };
			promoteBtn.onmouseout = () => { promoteBtn.style.background = '#ffaa00'; };
			promoteBtn.onclick = (e) => {
				e.stopPropagation();
				Game.confirmDialog(
					`确定要将【${baseChar.name}】升阶至【${getRankLabel(needPromotion)}】吗？`,
					() => {
						const result = promoteCharacterRank(instanceId);
						if (result.success) {
							Game.toast(result.message, 'success');
							// Game.UI.refresh({
							// 	instanceId: instanceId,
							// 	forceTeamRebuild: false
							// });

							// 优化方案：只刷新必要的部分
							// 1. 更新角色实例的 openSpskill
							const instData = window.charBagData && window.charBagData[instanceId];
							if (instData) {
								const updatedStats = updateCharacterSP(instData);
								if (updatedStats && updatedStats.openSpskill !== undefined) {
									instData.openSpskill = updatedStats.openSpskill;
								}
							}

							// 2. 只刷新阵容显示（不重新渲染整个视图）
							refreshTeamViewDisplay();

							// 3. 刷新当前弹窗
							refreshBreakthroughPopupContent(popup, instanceId);

							// 4. 自动保存
							if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
								SaveManager.autoSave();
							}
							// refreshBreakthroughPopupContent(popup, instanceId);
						} else {
							Game.toast(result.message, 'error');
						}
					}
				);
			};
		}
		container.appendChild(promoteBtn);
	}

	// 已满级提示
	if (breakInfo.maxed) {
		const maxedLabel = document.createElement('div');
		maxedLabel.style.cssText = 'flex:1;padding:8px;text-align:center;color:#ffd700;font-size:13px;';
		maxedLabel.textContent = '✨ 已突破至极限';
		container.appendChild(maxedLabel);
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

/**
 * 显示指定角色的突破预览弹窗（通过角色ID）
 * @param {string} charId - 角色ID
 */
function showBreakthroughPreviewPopupByCharId(charId) {
	// 尝试找到该角色的实例
	let instanceId = null;
	if (window.charBagData) {
		instanceId = Object.keys(window.charBagData).find(id =>
			window.charBagData[id].charId === charId
		);
	}

	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		Game.toast('角色数据异常', 'error');
		return;
	}

	const instData = window.charBagData[instanceId];
	const baseChar = characterList[charId];

	if (!baseChar) {
		Game.toast('角色数据异常', 'error');
		return;
	}

	// 2. 创建遮罩层
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.id = 'breakthrough-preview-overlay';

	// 3. 创建弹窗容器（复用 showBreakthroughPreviewPopup 的弹窗样式）
	const popup = document.createElement('div');
	popup.style.cssText = `
		background: #1a1a1a;
		border: 2px solid #ffd700;
		border-radius: 12px;
		padding: 20px;
		max-width: 380px;
		width: 90%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		animation: dialogIn 0.2s ease;
	`;

	// 4. 标题
	const title = document.createElement('div');
	title.style.cssText = 'color:#ffd700;font-size:18px;font-weight:bold;text-align:center;margin-bottom:15px;';
	const currentTupoLevel = instData.tupolevel || 0;
	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	title.innerHTML = `${baseChar.name} <span style="color:${rankColors[baseChar.rank] || '#888'};font-size:14px;">突破预览</span>`;
	popup.appendChild(title);

	// 5. 角色概览（与原 showBreakthroughPreviewPopup 相同）
	const header = document.createElement('div');
	header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #333;';

	const charImg = document.createElement('img');
	charImg.src = `/image/character/${charId}.jpg`;
	charImg.style.cssText = 'width:48px;height:48px;border-radius:6px;border:2px solid #ffd700;object-fit:cover;';
	charImg.onerror = function () { this.src = '/image/character/default.jpg'; };
	header.appendChild(charImg);

	const charInfo = document.createElement('div');
	charInfo.style.cssText = 'flex:1;';

	const charName = document.createElement('div');
	charName.style.cssText = 'color:#fff;font-size:15px;font-weight:bold;';
	const tupoText = currentTupoLevel > 0 ? ` <span style="color:#ffd700;font-size:13px;">+${currentTupoLevel}</span>` : '';
	charName.innerHTML = baseChar.name + tupoText;
	charInfo.appendChild(charName);

	const charLevel = document.createElement('div');
	charLevel.style.cssText = 'color:#aaa;font-size:12px;margin-top:2px;';
	charLevel.textContent = `当前突破: ${currentTupoLevel} 阶 · 等级: Lv.${instData.level || 1}`;
	charInfo.appendChild(charLevel);

	header.appendChild(charInfo);
	popup.appendChild(header);

	// 6. 突破列表滚动区（与原 showBreakthroughPreviewPopup 相同）
	const listContainer = document.createElement('div');
	listContainer.style.cssText = 'flex:1;overflow-y:auto;padding-right:4px;';
	listContainer.style.scrollbarWidth = 'thin';
	listContainer.style.scrollbarColor = '#555 #222';

	const tupoList = baseChar.tupoList || STANDARD_BREAKTHROUGH_TEMPLATE || [];

	if (tupoList.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;text-align:center;padding:30px;font-size:14px;';
		emptyTip.textContent = '该角色暂无突破数据';
		listContainer.appendChild(emptyTip);
	} else {
		tupoList.forEach((buff, index) => {
			const isUnlocked = (index + 1) <= currentTupoLevel;

			// 无效果占位项检测
			const isNoEffect = isNoEffectBreakthrough(buff);
			// 突破1阶（index 0）按设计「首次突破不带任何技能」，无效果时直接隐藏
			if (isNoEffect && index === 0) return;

			const item = document.createElement('div');
			item.style.cssText = `
				background: ${isUnlocked ? '#2a2a3a' : '#1a1a1a'};
				border: 1px solid ${isUnlocked ? '#d000ff' : '#333'};
				border-left: 4px solid ${isUnlocked ? '#ffd700' : '#555'};
				border-radius: 4px;
				padding: 10px;
				margin-bottom: 8px;
				opacity: ${isUnlocked ? 1 : 0.6};
				transition: all 0.2s;
				cursor: ${isUnlocked ? 'pointer' : 'default'};
			`;

			const headerRow = document.createElement('div');
			headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';

			const levelTitle = document.createElement('span');
			levelTitle.style.cssText = `font-weight:bold;font-size:14px;color:${isUnlocked ? '#ffd700' : '#888'};`;
			levelTitle.textContent = `突破 ${index + 1} 阶`;

			const statusIcon = document.createElement('span');
			statusIcon.style.cssText = 'font-size:12px;';
			statusIcon.textContent = isUnlocked ? '✅ 已解锁' : '🔒 未解锁';
			statusIcon.style.color = isUnlocked ? '#44ff88' : '#c9a86a';

			headerRow.appendChild(levelTitle);
			headerRow.appendChild(statusIcon);
			item.appendChild(headerRow);

			const descDiv = document.createElement('div');
			descDiv.style.cssText = `font-size:13px;line-height:1.4;color:${isUnlocked ? '#ddd' : '#c9a86a'};`;

			if (!buff) {
				descDiv.textContent = '暂无详细描述';
			}
			else {
				if (typeof buff == 'string') {
					if (BREAKTHROUGH_BUFF_LIBRARY[buff]) buff = BREAKTHROUGH_BUFF_LIBRARY[buff];
				} else if (typeof buff !== 'object') {
					// 仅当既非字符串也非对象（如数字/布尔等异常类型）时才用占位对象
					buff = {
						desc: '暂无详细描述'
					}
				}
				// 对象型能力（self_stat_flat / skill_effect / passive_effect 等）保持原样，直接读取其 desc
				if (buff.desc) {
					descDiv.textContent = buff.desc;
				} else if (buff.type) {
					let typeDesc = '';
					if (buff.type === 'self_stat_flat') {
						const val = Array.isArray(buff.value) ? buff.value.join('/') : buff.value;
						const stat = Array.isArray(buff.stat) ? buff.stat.join('/') : buff.stat;
						typeDesc = `永久增加 ${stat}: ${val}`;
					} else if (buff.type === 'passive_effect') {
						typeDesc = `获得被动效果: ${buff.effectId || '未知'}`;
					} else if (buff.type === 'skill_effect') {
						typeDesc = `技能效果增强: ${buff.desc || '未知效果'}`;
					} else {
						typeDesc = `效果类型: ${buff.type}`;
					}
					descDiv.textContent = typeDesc;
				} else {
					descDiv.textContent = '暂无详细描述';
				}
			}

			item.appendChild(descDiv);

			if (isUnlocked) {
				item.onmouseover = () => { item.style.background = '#33334a'; };
				item.onmouseout = () => { item.style.background = '#2a2a3a'; };
			}

			listContainer.appendChild(item);
		});
	}

	popup.appendChild(listContainer);

	// 7. 关闭按钮
	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.style.cssText = 'width:100%;margin-top:15px;padding:10px;font-size:14px;';
	closeBtn.textContent = '关闭';
	closeBtn.onclick = () => {
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
	};
	popup.appendChild(closeBtn);

	overlay.appendChild(popup);
	document.body.appendChild(overlay);

	overlay.onclick = (e) => {
		if (e.target === overlay) {
			if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		}
	};
}

/**
 * 显示突破预览视图 (主入口 - 优化版)
 */
function showBreakthroughPreviewView() {
	// 1. 隐藏底部导航栏
	const bottomBar = document.querySelector('.ybrpg-bottom-bar');
	if (bottomBar) {
		bottomBar.style.display = 'none';
	}
	// 1. 隐藏其他视图
	hideOtherViews('breakthrough-preview-view');

	// 2. 查找或创建容器
	let view = document.getElementById('breakthrough-preview-view');

	// 如果不存在，则动态创建整个视图结构
	if (!view) {
		view = createBreakthroughPreviewDOM();
		document.getElementById('ybrpg-root').appendChild(view);
	}

	// 3. 显示视图
	view.style.display = 'flex';

	// 4. 渲染数据
	renderBreakthroughContent();
}

/**
 * 动态创建突破预览界面的 DOM 结构 (优化版 - 无滑块，列表式)
 * @returns {HTMLElement} 创建的视图容器
 */
function createBreakthroughPreviewDOM() {
	const view = document.createElement('div');
	view.id = 'breakthrough-preview-view';
	// 基础布局样式
	view.style.cssText = 'display:none; width:100%; height:100%; flex-direction:column; align-items:center; padding-top:20px; overflow:hidden; background:#1a1a1a;';

	// --- 标题 ---
	const title = document.createElement('h2');
	title.textContent = '突破能力图鉴';
	title.style.cssText = 'color:#ffd700; margin-bottom:15px; text-shadow:0 0 10px rgba(255,215,0,0.5); font-size:20px;';
	view.appendChild(title);

	// --- 主体内容区 (仿 team-info-area 风格，但用于展示突破列表) ---
	const contentArea = document.createElement('div');
	contentArea.id = 'breakthrough-content-area';
	contentArea.style.cssText = 'width:95%; max-width:400px; flex:1; display:flex; flex-direction:column; background:#222; border-radius:8px; border:1px solid #444; overflow:hidden; margin-bottom:15px;';

	// 1. 顶部角色概览栏 (固定不滚动)
	const headerBar = document.createElement('div');
	headerBar.id = 'breakthrough-header';
	headerBar.style.cssText = 'display:flex; align-items:center; padding:10px; background:#2a2a2a; border-bottom:1px solid #444; flex-shrink:0;';

	const charImg = document.createElement('img');
	charImg.id = 'bp-char-img';
	charImg.style.cssText = 'width:50px; height:50px; border-radius:4px; border:1px solid #ffd700; object-fit:cover; margin-right:10px;';
	charImg.src = '/image/character/default.jpg';

	const charInfo = document.createElement('div');
	charInfo.style.cssText = 'flex:1;';

	const charName = document.createElement('div');
	charName.id = 'bp-char-name';
	charName.style.cssText = 'color:#fff; font-weight:bold; font-size:16px;';
	charName.textContent = '未选择角色';

	const charLevel = document.createElement('div');
	charLevel.id = 'bp-char-level';
	charLevel.style.cssText = 'color:#aaa; font-size:12px; margin-top:2px;';
	charLevel.textContent = '突破等级: 0';

	charInfo.appendChild(charName);
	charInfo.appendChild(charLevel);
	headerBar.appendChild(charImg);
	headerBar.appendChild(charInfo);
	contentArea.appendChild(headerBar);

	// 2. 突破列表滚动区
	const listContainer = document.createElement('div');
	listContainer.id = 'bp-list-container';
	listContainer.style.cssText = 'flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:10px;';

	// 自定义滚动条样式 (可选，通过JS注入style标签或inline)
	listContainer.style.scrollbarWidth = 'thin';
	listContainer.style.scrollbarColor = '#555 #222';

	contentArea.appendChild(listContainer);
	view.appendChild(contentArea);
	// --- 返回按钮 ---
	const backBtn = document.createElement('button');
	backBtn.className = 'ybrpg-back-btn';
	backBtn.textContent = '返回队伍';
	backBtn.onclick = () => {
		// 1. 隐藏当前突破预览视图
		view.style.display = 'none';

		// 2. 恢复底部导航栏
		const bottomBar = document.querySelector('.ybrpg-bottom-bar');
		if (bottomBar) {
			bottomBar.style.display = 'flex';
		}

		// 3. 切换回队伍视图
		const teamView = document.getElementById('team-view');
		if (teamView) {
			hideOtherViews('team-view');
			teamView.style.display = 'flex';
		}
	};
	view.appendChild(backBtn);
	return view;
}

/**
 * 渲染突破预览内容 (根据当前选中的角色)
 */
function renderBreakthroughContent() {
	// 1. 获取当前选中的角色实例 ID
	let instanceId = null;
	const selectedIdx = window._selectedSlotIndex;

	if (selectedIdx !== null && selectedIdx !== undefined && window.currentTeam[selectedIdx]) {
		instanceId = window.currentTeam[selectedIdx];
	} else if (window.currentTeam && window.currentTeam.length > 0) {
		instanceId = window.currentTeam.find(id => id);
	}

	const listContainer = document.getElementById('bp-list-container');
	const charImg = document.getElementById('bp-char-img');
	const charName = document.getElementById('bp-char-name');
	const charLevel = document.getElementById('bp-char-level');

	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		if (charName) charName.textContent = '无可用角色';
		if (listContainer) listContainer.innerHTML = '<div style="color:#666;text-align:center;margin-top:20px;">请先在队伍中选择一个角色</div>';
		return;
	}

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList[charId];

	if (!baseChar) return;

	// 2. 更新顶部概览
	charImg.src = `/image/character/${charId}.jpg`;
	charImg.onerror = function () { this.src = '/image/character/default.jpg'; };
	charName.textContent = baseChar.name;

	const currentTupoLevel = instData.tupolevel || 0;
	charLevel.textContent = `当前突破: ${currentTupoLevel} 阶`;

	// 3. 获取突破配置并渲染列表
	// 优先使用角色自带的 tupoList，否则使用全局模板
	const tupoList = baseChar.tupoList || STANDARD_BREAKTHROUGH_TEMPLATE || [];

	listContainer.innerHTML = ''; // 清空旧数据

	if (!tupoList || tupoList.length === 0) {
		listContainer.innerHTML = '<div style="color:#666;text-align:center;margin-top:20px;">该角色暂无突破数据</div>';
		return;
	}

	// 遍历突破列表
	tupoList.forEach((buff, index) => {
		const isUnlocked = index + 1 <= currentTupoLevel;

		const item = document.createElement('div');
		// 样式：已解锁亮色背景，未解锁暗色背景
		item.style.cssText = `
			background: ${isUnlocked ? '#2a2a3a' : '#1a1a1a'}; 
			border: 1px solid ${isUnlocked ? '#d000ff' : '#333'}; 
			border-left: 4px solid ${isUnlocked ? '#ffd700' : '#555'};
			border-radius: 4px; 
			padding: 10px; 
			opacity: ${isUnlocked ? 1 : 0.6};
			transition: all 0.2s;
		`;

		// 标题行：突破等级 + 状态图标
		const headerRow = document.createElement('div');
		headerRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;';

		const levelTitle = document.createElement('span');
		levelTitle.style.cssText = `font-weight:bold; font-size:14px; color:${isUnlocked ? '#ffd700' : '#888'};`;
		// 索引0对应人类理解的"第一阶"或"突破 I"
		levelTitle.textContent = `突破 ${index + 1} 阶`;

		const statusIcon = document.createElement('span');
		statusIcon.style.cssText = 'font-size:12px;';
		statusIcon.textContent = isUnlocked ? '✅ 已解锁' : '🔒 未解锁';
		statusIcon.style.color = isUnlocked ? '#44ff88' : '#c9a86a';

		headerRow.appendChild(levelTitle);
		headerRow.appendChild(statusIcon);
		item.appendChild(headerRow);

		// 描述内容
		const descDiv = document.createElement('div');
		descDiv.style.cssText = `font-size:13px; line-height:1.4; color:${isUnlocked ? '#ddd' : '#c9a86a'};`;


		if (!buff) {
			descDiv.textContent = '暂无详细描述';
		}
		else {
			if (typeof buff == 'string') {
				if (BREAKTHROUGH_BUFF_LIBRARY[buff]) buff = BREAKTHROUGH_BUFF_LIBRARY[buff];
			} else if (typeof buff !== 'object') {
				// 仅当既非字符串也非对象（如数字/布尔等异常类型）时才用占位对象
				buff = {
					desc: '暂无详细描述'
				}
			}
			// 对象型能力（self_stat_flat / skill_effect / passive_effect 等）保持原样，直接读取其 desc
			if (buff.desc) {
				descDiv.textContent = buff.desc;
			} else if (buff.type) {
				let typeDesc = '';
				if (buff.type === 'self_stat_flat') {
					const val = Array.isArray(buff.value) ? buff.value.join('/') : buff.value;
					const stat = Array.isArray(buff.stat) ? buff.stat.join('/') : buff.stat;
					typeDesc = `永久增加 ${stat}: ${val}`;
				} else if (buff.type === 'passive_effect') {
					typeDesc = `获得被动效果: ${buff.effectId || '未知'}`;
				} else if (buff.type === 'skill_effect') {
					typeDesc = `技能效果增强: ${buff.desc || '未知效果'}`;
				} else {
					typeDesc = `效果类型: ${buff.type}`;
				}
				descDiv.textContent = typeDesc;
			} else {
				descDiv.textContent = '暂无详细描述';
			}
			// 已解锁的普通突破槽也可点击吸收宝物（替换该槽内容），避免「空突破槽不可点」的情况
			if (isUnlocked) {
				descDiv.textContent += '　🧪 点击可将宝物吸收进此槽';
				item.style.cursor = 'pointer';
				item.onclick = () => { openTreasureAbsorbPicker(index, instanceId, popup); };
			}
		}
		item.appendChild(descDiv);

		// 如果是已解锁，可以加一点 hover 效果
		if (isUnlocked) {
			item.onmouseover = () => { item.style.background = '#33334a'; };
			item.onmouseout = () => { item.style.background = '#2a2a3a'; };
		}

		listContainer.appendChild(item);
	});
}
/**
 * 渲染单个布阵方格的内容
 * @param {HTMLElement} slotEl - 需要渲染内容的DOM元素节点
 * @param {number} index - 当前方格在队伍数组中的索引位置
 */
function renderTeamSlot(slotEl, index) {
	slotEl.innerHTML = '';

	// 【修改】动态判断当前渲染的格子是否是主角
	const mainCharIndex = Game.mainSlot();
	const isMainCharacterSlot = (index === mainCharIndex);

	// 修改：currentTeam 现在存储的是 instanceId
	const instanceId = window.currentTeam[index];

	if (instanceId && window.charBagData && window.charBagData[instanceId]) {
		const instanceData = window.charBagData[instanceId];
		const charId = instanceData.charId || instanceId; // 兼容旧数据
		// const char = characterList[charId];
		const char = instanceData;

		if (!char) {
			slotEl.style.borderColor = '#f00';
			slotEl.textContent = 'Err';
			return;
		}
		var rank = window.charBagData[instanceId].rank || char.rank;
		const RANK_BORDER_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
		const borderColor = RANK_BORDER_COLORS[rank] || '#888';

		const img = document.createElement('img');
		img.src = `/image/character/${charId}.jpg`;
		img.alt = char.name;
		img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px;pointer-events:none;';

		img.onerror = function () {
			this.onerror = function () {
				this.style.display = 'none';
				const p = document.createElement('div');
				p.style.cssText = 'color:#aaa;font-size:14px;display:flex;justify-content:center;align-items:center;width:100%;height:100%;';
				p.textContent = char.name;
				this.parentNode.appendChild(p);
			};
			this.src = `/image/character/${charId}.webp`;
		};

		slotEl.style.borderColor = borderColor;
		slotEl.style.overflow = 'hidden';
		slotEl.appendChild(img);

		// 名字标签
		const nameTag = document.createElement('div');
		nameTag.className = 'team-slot-name';
		const tupoText = char.tupolevel ? `+${char.tupolevel}` : '';
		const levelText = char.level ? `Lv.${char.level}` : '';
		nameTag.textContent = char.name + tupoText;
		slotEl.appendChild(nameTag);

		// // 【新增】如果是主角，添加"主"字标记
		// if (isMainCharacterSlot) {
		//	 const mainTag = document.createElement('div');
		//	 mainTag.style.cssText = 'position:absolute;top:2px;left:2px;background:rgba(255,215,0,0.8);color:#000;font-size:10px;padding:1px 4px;border-radius:2px;font-weight:bold;z-index:2;';
		//	 mainTag.textContent = '主';
		//	 slotEl.appendChild(mainTag);

		//	 // 【关键】主角不可拖拽
		//	 slotEl.draggable = false;
		//	 slotEl.style.cursor = 'default';
		// } else {
		//	 slotEl.draggable = true;
		// }

	} else {
		// 渲染空位状态
		slotEl.style.borderColor = '#444';

		// // 【新增】如果主角位为空（理论上不应发生，但做防御处理），显示固定提示
		// if (isMainCharacterSlot) {
		//	  const emptyText = document.createElement('span');
		//	  emptyText.style.cssText = 'color:#ffd700;font-size:12px;pointer-events:none;';
		//	  emptyText.textContent = '主角';
		//	  slotEl.appendChild(emptyText);
		//	  slotEl.draggable = false;
		// } else {
		const emptyText = document.createElement('span');
		emptyText.style.cssText = 'color:#555;font-size:12px;pointer-events:none;';
		emptyText.textContent = '空位';
		slotEl.appendChild(emptyText);
		//	 slotEl.draggable = true;
		// }
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

// 刷新单个方格
function refreshTeamSlot(index) {
	const gridDiv = document.getElementById('team-grid');
	if (!gridDiv) return;
	const slotEl = gridDiv.children[index];
	if (slotEl) renderTeamSlot(slotEl, index);
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamSlot = refreshTeamSlot;

// 刷新所有方格
function refreshAllTeamSlots() {
	const gridDiv = document.getElementById('team-grid');
	if (!gridDiv) return;
	for (let i = 0; i < 6; i++) {
		const slotEl = gridDiv.children[i];
		if (slotEl) renderTeamSlot(slotEl, i);
	}
	SaveManager.autoSave();
}
/**
 * 刷新角色详情弹窗的内容
 * @param {string} instanceId - 角色实例ID
 * @param {HTMLElement} dialog - 角色详情弹窗的DOM元素（可选）
 */
function refreshCharDetailPopupContent(instanceId, dialog) {
	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) return;

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList[charId];
	if (!baseChar) return;

	// 计算最新属性
	const teamBonuses = Game.Stat.teamBonuses();
	const finalStats = Game.Stat.final(instanceId, teamBonuses);

	// 如果传入了dialog，直接更新该dialog的内容
	if (dialog) {
		// 更新等级显示
		const rankEl = dialog.querySelector('.gallery-detail-rank');
		if (rankEl) {
			const RANK_LABELS = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
			const RANK_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
			const rankText = RANK_LABELS[instData.rank] || instData.rank;
			rankEl.innerHTML = `<span style="color:${RANK_COLORS[instData.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">Lv.${instData.level || 1}</span>`;
		}

		// 更新角色名称（含突破等级）
		const nameEl = dialog.querySelector('.gallery-detail-name');
		if (nameEl) {
			console.log('instData.tupolevel', instData.tupolevel)
			const tupoText = (instData.tupolevel || 0) > 0 ? `+${instData.tupolevel}` : '';
			nameEl.textContent = (baseChar.name || instData.name) + tupoText;
		}

		// 更新四维属性
		const attrRows = dialog.querySelectorAll('.gallery-detail-attr-row .attr-value');
		if (attrRows.length >= 4) {
			attrRows[0].textContent = finalStats.totalHp;
			attrRows[1].textContent = finalStats.totalAtk;
			attrRows[2].textContent = finalStats.totalDef;
			attrRows[3].textContent = finalStats.totalSpe;
		}
	}

	// 刷新阵容界面
	refreshTeamViewDisplay();
}

/**
 * 刷新阵容界面的显示（包括总战力、格子和详情区）
 */
function refreshTeamViewDisplay() {
	const teamView = document.getElementById('team-view');
	if (!teamView || teamView.style.display === 'none') return;

	// 刷新总战力
	const totalPowerBar = document.getElementById('team-total-power');
	if (totalPowerBar) {
		let totalPower = 0;
		const teamBonuses = Game.Stat.teamBonuses();
		for (let i = 0; i < 6; i++) {
			const instId = window.currentTeam[i];
			if (instId && window.charBagData && window.charBagData[instId]) {
				const finalStats = Game.Stat.final(instId, teamBonuses);
				totalPower += Game.Stat.power(finalStats);
			}
		}
		totalPowerBar.innerHTML = `
			<span style="color:#aaa;">阵容总战力：</span>
			<span style="color:#ffd700;font-size:16px;font-weight:bold;">${totalPower}</span>
		`;
	}

	// 刷新所有格子
	refreshAllTeamSlots();

	// 刷新详情区
	const selectedIdx = window._selectedSlotIndex;
	if (selectedIdx !== null && selectedIdx !== undefined) {
		const instanceId = window.currentTeam[selectedIdx];
		if (instanceId && window.charBagData && window.charBagData[instanceId]) {
			const instData = window.charBagData[instanceId];
			const charId = instData.charId || instanceId;
			showTeamCharInfo(selectedIdx, instanceId, charId);
		}
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;


// ========== 布阵交互逻辑 ==========

// 点击方格
function onTeamSlotClick(index) {
	// // 【新增】如果点击的是主角槽位，直接提示，不执行后续逻辑
	// if (index === 0) {
	//	 Game.toast('主角位置固定，敬请期待更多互动功能', 'info');
	//	 // 依然可以显示详情，但不允许更换
	//	 window._selectedSlotIndex = index;
	//	 const instanceId = window.currentTeam[index];
	//	 if (instanceId && window.charBagData && window.charBagData[instanceId]) {
	//		 const instanceData = window.charBagData[instanceId];
	//		 const charId = instanceData.charId || instanceId;
	//		 showTeamCharInfo(index, instanceId, charId);
	//	 }
	//	 return;
	// }

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

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

// 底部导航-更换
function onTeamNavChange() {
	const idx = window._selectedSlotIndex;
	if (idx === null || idx === undefined) {
		Game.toast('请先选择一个方格', 'warning');
		return;
	}
	// 【修改】动态获取主角位置，禁止更换主角
	const mainCharIndex = Game.mainSlot();
	if (idx === mainCharIndex) {
		Game.toast('主角无法更换，敬请期待', 'warning');
		return;
	}
	showCharSelectPopup(idx);
}

// 底部导航-培养
function onTeamNavTrain() {
	const idx = window._selectedSlotIndex;
	if (idx === null || idx === undefined) {
		Game.toast('请先选择一个方格', 'warning');
		return;
	}
	const instanceId = window.currentTeam[idx];
	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		Game.toast('当前方格为空', 'warning');
		return;
	}
	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const char = characterList[charId];
	if (!char) {
		Game.toast('角色数据异常', 'error');
		return;
	}
	// 调用背包中的角色详情弹窗（带升级功能）
	showBagCharDetailPopup(instanceId, charId);
}


/**
// 在team-info-area中展示选中武将的详情
// 修改参数：增加 instanceId

 * 显示队伍中指定角色的详细信息
 * @param {number} slotIndex - 角色在队伍中的槽位索引
 * @param {string|number} instanceId - 实例ID，用于标识具体的游戏实例或会话
 * @param {string|number} charId - 角色ID，用于标识具体的角色
 * @returns {void}
 */
function showTeamCharInfo(slotIndex, instanceId, charId) {
	const infoArea = document.getElementById('team-info-area');
	if (!infoArea) return;
	infoArea.innerHTML = '';

	// 修改：从 instanceData 获取存档数据
	const instanceData = window.charBagData[instanceId];
	// const char = characterList[charId];
	const char = instanceData;

	if (!char || !instanceData) return;

	const saveData = instanceData; // 直接使用实例数据
	const RANK_LABELS = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const RANK_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	const TIP_LABELS = { damger: '偏攻', recover: '治疗', balanced: '均衡', defense: '偏防' };
	// const TIP_LABELS = { damage: '偏攻', recover: '治疗', balance: '均衡' };

	// ===== 左侧：武将图片 + 宝物格阵（固定不滚动） =====
	const leftDiv = document.createElement('div');
	leftDiv.className = 'team-info-left';

	// ... 左侧原有的图片和宝物代码保持不变 ...
	const imgDiv = document.createElement('div');
	imgDiv.className = 'team-info-img-container';
	const img = document.createElement('img');
	img.className = 'team-info-img';
	img.src = `/image/character/${charId}.jpg`;
	img.alt = char.name;
	img.onerror = function () {
		this.onerror = function () {
			this.style.display = 'none';
			const p = document.createElement('div');
			p.className = 'gallery-char-placeholder';
			p.style.width = '120px';
			p.style.height = '150px';
			p.style.fontSize = '36px';
			p.textContent = char.name.charAt(0);
			this.parentNode.appendChild(p);
		};
		this.src = `/image/character/${charId}.webp`;
	};
	imgDiv.appendChild(img);
	imgDiv.onclick = () => showFullImage(charId, char.name);
	leftDiv.appendChild(imgDiv);

	// 宝物格阵（3×2，2列×3行）- 原有代码保持不变
	const treasureLabel = document.createElement('div');
	treasureLabel.className = 'treasure-grid-label';
	treasureLabel.textContent = '宝物';
	leftDiv.appendChild(treasureLabel);

	const treasureGrid = document.createElement('div');
	treasureGrid.className = 'treasure-grid';
	// const treasureDefs = Game.Data.getTreasureList();
	// 修改：传入 instanceId 或 charId? 
	// 如果 Game.Data 不支持 instanceId，这里传 charId 会导致所有同名角色共享宝物。
	// 理想情况：Game.Bag.equip(instanceId, ...)
	// 临时方案：假设 Game.Data 已更新支持 instanceId，或者我们只传 charId 接受共享限制。
	// 此处代码保持原样调用，但需意识到如果 Game.Data 内部 key 是 charId，则多实例共享宝物。
	// const charTreasures = Game.Data.getCharTreasures(charId); 
	// 使用新系统的 getCharEquippedTreasures
	const defs = Game.Bag.defs();
	// 改为（确保返回完整有序数组）：
	const equippedIds = [];
	Game.Bag.ensureSlots();
	const slots = window.charTreasureSlots[instanceId];
	for (let i = 0; i < 6; i++) {
		equippedIds[i] = slots ? slots[i] : null;
	}

	for (let i = 0; i < 6; i++) {
		const tSlot = document.createElement('div');
		tSlot.className = 'treasure-slot';
		tSlot.dataset.slotIndex = i;

		const tId = equippedIds[i];
		if (tId && window.treasureInventory && window.treasureInventory[tId]) {
			const invData = window.treasureInventory[tId];
			const tDef = defs[invData.baseId];
			if (tDef) {
				tSlot.title = `${tDef.name}: ${tDef.desc || ''}`;
				tSlot.style.position = 'relative';

				if (tDef.icon) {
					const tImg = document.createElement('img');
					tImg.src = tDef.icon;
					tImg.className = 'treasure-slot-icon';
					tImg.onerror = function () { this.style.display = 'none'; };
					tSlot.appendChild(tImg);
				} else {
					tSlot.textContent = tDef.name.charAt(0);
				}

				// 等级标签（右下角）
				const treasureLevel = window.treasureInventory[tId]?.level || 1;
				if (treasureLevel > 1) {
					const levelBadge = document.createElement('div');
					levelBadge.style.cssText = `
						position: absolute;
						bottom: 1px;
						right: 1px;
						background: rgba(0, 0, 0, 0.8);
						color: #ffd700;
						font-size: 8px;
						padding: 0 2px;
						border-radius: 2px;
						font-weight: bold;
						z-index: 2;
						line-height: 12px;
						pointer-events: none;
					`;
					levelBadge.textContent = `Lv.${treasureLevel}`;
					tSlot.appendChild(levelBadge);
				}
			} else {
				tSlot.textContent = '+';
				tSlot.classList.add('empty');
			}
		} else {
			tSlot.textContent = '+';
			tSlot.classList.add('empty');
		}


		tSlot.onclick = () => {
			const tId = equippedIds[i];
			if (tId) {
				// 该槽位有宝物 -> 弹出升级浮窗（内置替换功能）
				Game.Bag.showUpgrade(tId, instanceId, i);
			} else {
				// 空槽位 -> 弹出选择浮窗
				showTreasureSelectPopup(instanceId, i);
			}
		};

		treasureGrid.appendChild(tSlot);
	}
	leftDiv.appendChild(treasureGrid);

	// ===== 右侧：可滚动信息区域 =====
	const rightScroll = document.createElement('div');
	rightScroll.className = 'team-info-right-scroll';

	// 将原来直接放在 attrDiv 中的内容，改为放在 rightScroll 中
	const attrDiv = document.createElement('div');
	attrDiv.className = 'team-info-attr';

	// 名称
	const tupoText = saveData && saveData.tupolevel ? `+${saveData.tupolevel}  ` : '';
	const nameEl = document.createElement('div');
	nameEl.className = 'team-info-name';
	nameEl.textContent = char.name + tupoText;
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
	tipEl.textContent = TIP_LABELS[char.template] || '';
	attrDiv.appendChild(tipEl);

	// ===== 计算最终属性 =====
	const teamBonuses = Game.Stat.teamBonuses();
	const finalStats = Game.Stat.final(instanceId, teamBonuses);

	const attrs = [
		{ label: '生命', value: finalStats.totalHp, base: finalStats.baseHp, icon: '❤' },
		{ label: '攻击', value: finalStats.totalAtk, base: finalStats.baseAtk, icon: '⚔' },
		{ label: '防御', value: finalStats.totalDef, base: finalStats.baseDef, icon: '🛡' },
		{ label: '速度', value: finalStats.totalSpe, base: finalStats.baseSpe, icon: '💨' },
	];

	const ATTR_MAP = { '生命': 'hp', '攻击': 'atk', '防御': 'def', '速度': 'spe' };

	attrs.forEach(a => {
		const row = document.createElement('div');
		row.className = 'team-info-attr-row';
		let displayText = `${a.value}`;
		if (window.showFormulaDetail) {
			const attrKey = ATTR_MAP[a.label];
			if (attrKey && finalStats.flatBonus) {
				const flatBonus = finalStats.flatBonus[attrKey] || 0;
				const percentBonus = finalStats.percentBonus[attrKey] || 0;
				if (flatBonus > 0 || percentBonus > 0) {
					let text = `(${a.base}`;
					if (flatBonus > 0) text += `+${flatBonus}`;
					text += `)`;
					if (percentBonus > 0) text += `×${(1 + percentBonus).toFixed(2)}`;
					displayText += ` <span style="color:#44ff88;font-size:11px;">${text}</span>`;
				}
			}
		}
		row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${displayText}</span>`;
		attrDiv.appendChild(row);
	});

	// 战斗力显示
	const teamBonusesForPower = Game.Stat.teamBonuses();
	const finalStatsForPower = Game.Stat.final(instanceId, teamBonusesForPower);
	const charPower = Game.Stat.power(finalStatsForPower);

	const powerRow = document.createElement('div');
	powerRow.style.cssText = `
		text-align: center;
		padding: 6px 0;
		margin: 4px 0 6px 0;
		background: #1a1a2e;
		border-radius: 6px;
		border: 1px solid #ffd70033;
	`;
	powerRow.innerHTML = `
		<span style="color:#aaa;font-size:12px;">战斗力：</span>
		<span style="color:#ffd700;font-size:16px;font-weight:bold;">${charPower}</span>
	`;
	attrDiv.appendChild(powerRow);

	// ===== 技能部分 =====
	const skillIds = char.skills || [];

	// 普攻
	const pugongId = skillIds[0];
	const pgData = pugongId && contentList.pugong && contentList.pugong[pugongId];
	if (pgData) {
		const sectionDiv = document.createElement('div');
		sectionDiv.className = 'team-info-skill-section';
		const headerRow = document.createElement('div');
		const emoji = ` ` + pgData.emoji || '';
		headerRow.className = 'team-info-skill-row';
		headerRow.innerHTML = `<span class="skill-label" style="color:#5ba8ff">普攻</span><span class="skill-name">${pgData.name}${emoji}</span>`;
		sectionDiv.appendChild(headerRow);
		if (pgData.intro) {
			const introEl = document.createElement('div');
			introEl.className = 'team-info-skill-desc';
			introEl.textContent = pgData.intro;
			sectionDiv.appendChild(introEl);
		}
		if (pgData.ai_intro) {
			const aiEl = document.createElement('div');
			aiEl.className = 'team-info-skill-ai';
			aiEl.textContent = 'AI倾向：' + pgData.ai_intro;
			sectionDiv.appendChild(aiEl);
		}
		attrDiv.appendChild(sectionDiv);
	}

	// 必杀/技能判断
	const spSkillId = skillIds[2];
	const spData = spSkillId && contentList.spskill && contentList.spskill[spSkillId];
	const hasSpskill = !!spData;
	const isSpskillUnlocked = char.openSpskill === true && hasSpskill;

	if (hasSpskill) {
		if (isSpskillUnlocked) {
			// 已解锁必杀
			const sectionDiv = document.createElement('div');
			sectionDiv.className = 'team-info-skill-section';
			const headerRow = document.createElement('div');
			const emoji = ` ` + spData.emoji || '';
			headerRow.className = 'team-info-skill-row';
			headerRow.innerHTML = `<span class="skill-label" style="color:#ffd700">必杀</span><span class="skill-name">${spData.name}${emoji}</span>`;
			sectionDiv.appendChild(headerRow);
			if (spData.intro) {
				const introEl = document.createElement('div');
				introEl.className = 'team-info-skill-desc';
				introEl.textContent = spData.intro;
				sectionDiv.appendChild(introEl);
			}
			if (spData.ai_intro) {
				const aiEl = document.createElement('div');
				aiEl.className = 'team-info-skill-ai';
				aiEl.textContent = 'AI倾向：' + spData.ai_intro;
				sectionDiv.appendChild(aiEl);
			}
			const unlockTag = document.createElement('div');
			unlockTag.style.cssText = 'font-size:10px;color:#44ff88;margin-top:2px;';
			unlockTag.textContent = `✅ 必杀已解锁`;
			sectionDiv.appendChild(unlockTag);
			attrDiv.appendChild(sectionDiv);
		} else {
			// 未解锁必杀：显示技能
			const skillId = skillIds[1];
			const skData = skillId && contentList.skill && contentList.skill[skillId];
			if (skData) {
				const sectionDiv = document.createElement('div');
				sectionDiv.className = 'team-info-skill-section';
				const headerRow = document.createElement('div');
				headerRow.className = 'team-info-skill-row';
				const emoji = ` ` + skData.emoji || '';
				headerRow.innerHTML = `<span class="skill-label" style="color:#ff8c00">技能</span><span class="skill-name">${skData.name}${emoji}</span>`;
				sectionDiv.appendChild(headerRow);
				if (skData.intro) {
					const introEl = document.createElement('div');
					introEl.className = 'team-info-skill-desc';
					introEl.textContent = skData.intro;
					sectionDiv.appendChild(introEl);
				}
				if (skData.ai_intro) {
					const aiEl = document.createElement('div');
					aiEl.className = 'team-info-skill-ai';
					aiEl.textContent = 'AI倾向：' + skData.ai_intro;
					sectionDiv.appendChild(aiEl);
				}
				attrDiv.appendChild(sectionDiv);
			}
			// 显示未解锁的必杀
			const sectionDiv = document.createElement('div');
			sectionDiv.className = 'team-info-skill-section';
			sectionDiv.style.opacity = '0.6';
			const headerRow = document.createElement('div');
			const emoji = ` ` + spData.emoji || '';
			headerRow.className = 'team-info-skill-row';
			headerRow.innerHTML = `<span class="skill-label" style="color:#888">必杀（未解锁）</span><span class="skill-name" style="color:#888">${spData.name}${emoji}</span>`;
			sectionDiv.appendChild(headerRow);
			const unlockInfo = document.createElement('div');
			unlockInfo.className = 'team-info-skill-desc';
			unlockInfo.style.color = '#ffd700';
			unlockInfo.textContent = `🔒 突破19阶解锁必杀`;
			sectionDiv.appendChild(unlockInfo);
			attrDiv.appendChild(sectionDiv);
		}
	} else {
		// 没有必杀
		const skillId = skillIds[1];
		const skData = skillId && contentList.skill && contentList.skill[skillId];
		if (skData) {
			const sectionDiv = document.createElement('div');
			sectionDiv.className = 'team-info-skill-section';
			const headerRow = document.createElement('div');
			const emoji = ` ` + skData.emoji || '';
			headerRow.className = 'team-info-skill-row';
			headerRow.innerHTML = `<span class="skill-label" style="color:#ff8c00">技能</span><span class="skill-name">${skData.name}${emoji}</span>`;
			sectionDiv.appendChild(headerRow);
			if (skData.intro) {
				const introEl = document.createElement('div');
				introEl.className = 'team-info-skill-desc';
				introEl.textContent = skData.intro;
				sectionDiv.appendChild(introEl);
			}
			if (skData.ai_intro) {
				const aiEl = document.createElement('div');
				aiEl.className = 'team-info-skill-ai';
				aiEl.textContent = 'AI倾向：' + skData.ai_intro;
				sectionDiv.appendChild(aiEl);
			}
			attrDiv.appendChild(sectionDiv);
		}
	}

	// 将 attrDiv 放入 rightScroll
	rightScroll.appendChild(attrDiv);

	// 将 leftDiv 和 rightScroll 放入 infoArea
	infoArea.appendChild(leftDiv);
	infoArea.appendChild(rightScroll);

	// 高亮选中方格
	highlightTeamSlot(slotIndex);
	return infoArea;
}

// 暴露给 system.js 调用（避免循环import）
shared.showTeamCharInfo = showTeamCharInfo;


/**
 * 宝物选择弹窗（适配宝物实例化系统 - 阵容格子存储版）
 * 支持显示：已装备（自己）、已装备（其他角色）
 * @param {string} charInstanceId - 角色实例ID
 * @param {number} slotIndex - 宝物槽位 (0-5)
 */
function showTreasureSelectPopup(charInstanceId, slotIndex) {
	const existing = document.getElementById('treasure-select-popup');
	if (existing) existing.remove();

	const instData = window.charBagData && window.charBagData[charInstanceId];
	const charId = instData ? instData.charId : charInstanceId;
	const char = characterList[charId];
	if (!char) {
		Game.toast('角色数据异常', 'error');
		return;
	}

	const defs = Game.Bag.defs();
	const allInstances = Game.Bag.list(); // 从 treasureInventory 获取所有宝物实例
	Game.Bag.ensureSlots();

	// 获取当前角色槽位中的宝物
	const currentSlots = window.charTreasureSlots[charInstanceId] || [null, null, null, null, null, null];
	const currentTreasureId = currentSlots[slotIndex] || null;
	const currentDef = currentTreasureId ? defs[window.treasureInventory[currentTreasureId]?.baseId] : null;

	// --- 构建快速查询表：宝物实例ID → { 装备者角色ID, 装备槽位索引 } ---
	const treasureOwnerMap = {};
	for (const [ownerId, slots] of Object.entries(window.charTreasureSlots)) {
		slots.forEach((tId, sIdx) => {
			if (tId) {
				treasureOwnerMap[tId] = { ownerId, slotIndex: sIdx };
			}
		});
	}

	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.id = 'treasure-select-popup';

	const popup = document.createElement('div');
	popup.className = 'treasure-select-popup';

	// 标题
	const title = document.createElement('div');
	title.className = 'treasure-select-title';
	title.textContent = `选择宝物 - ${char.name}`;
	popup.appendChild(title);

	// 当前槽位信息
	const slotInfo = document.createElement('div');
	slotInfo.className = 'treasure-slot-info';
	slotInfo.textContent = currentDef ? `当前: ${currentDef.name}` : '当前: 空';
	popup.appendChild(slotInfo);

	// 卸下按钮
	if (currentTreasureId) {
		const unequipBtn = document.createElement('button');
		unequipBtn.className = 'treasure-select-btn unequip';
		unequipBtn.textContent = '卸下宝物';
		unequipBtn.onclick = () => {
			Game.Bag.equip(charInstanceId, slotIndex, null);
			overlay.remove();
			refreshTreasureUI(charInstanceId);
			SaveManager.autoSave();
			Game.toast('已卸下宝物', 'success');
		};
		popup.appendChild(unequipBtn);
	}

	// 宝物列表
	const scrollDiv = document.createElement('div');
	scrollDiv.className = 'treasure-select-scroll';

	// 构建显示列表
	const displayList = allInstances.map(item => {
		const ownerInfo = treasureOwnerMap[item.instanceId];
		let status = 'free'; // 空闲
		let ownerName = null;
		let ownerSlotIndex = -1;

		if (ownerInfo) {
			if (ownerInfo.ownerId === charInstanceId) {
				status = 'self'; // 装备在自己身上
				ownerSlotIndex = ownerInfo.slotIndex;
			} else {
				status = 'other'; // 装备在其他角色身上
				// 获取装备者名字
				const ownerInst = window.charBagData && window.charBagData[ownerInfo.ownerId];
				const ownerCharId = ownerInst ? ownerInst.charId : ownerInfo.ownerId;
				const ownerChar = characterList[ownerCharId];
				ownerName = ownerChar ? ownerChar.name : ownerInfo.ownerId;
				ownerSlotIndex = ownerInfo.slotIndex;
			}
		}

		return {
			...item,
			status,
			ownerName,
			ownerSlotIndex,
			isSelfEquipped: (item.instanceId === currentTreasureId), // 当前槽位
		};
	});

	// 排序：与「宝物背包」保持一致（已装备 → 等级 → 品质 → baseId）
	sortTreasuresByBagOrder(displayList, treasureOwnerMap);

	if (displayList.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
		emptyTip.textContent = '背包中暂无宝物';
		scrollDiv.appendChild(emptyTip);
	}

	displayList.forEach(item => {
		const row = document.createElement('div');
		row.className = 'treasure-select-row';

		const nameEl = document.createElement('div');
		nameEl.className = 'treasure-select-name';
		const itemLevel = window.treasureInventory[item.instanceId]?.level || 1;
		nameEl.innerHTML = `${item.name} <span style="color:#ffd700;font-size:11px;">Lv.${itemLevel}</span>`;


		// 根据不同状态添加类名
		if (item.isSelfEquipped) {
			row.classList.add('current');
		} else if (item.status === 'other') {
			row.classList.add('unavailable');
		}

		// 图标
		const iconDiv = document.createElement('div');
		iconDiv.className = 'treasure-select-icon';
		if (item.icon) {
			const img = document.createElement('img');
			img.src = item.icon;
			img.className = 'treasure-icon-img';
			img.onerror = function () {
				this.style.display = 'none';
				iconDiv.textContent = item.name.charAt(0);
			};
			iconDiv.appendChild(img);
		} else {
			iconDiv.textContent = item.name.charAt(0);
		}
		row.appendChild(iconDiv);

		// 信息
		const infoDiv = document.createElement('div');
		infoDiv.className = 'treasure-select-info';


		// ==== 需求1 & 2：显示装备状态标签 ====
		if (item.isSelfEquipped) {
			// 当前槽位的宝物 - 金色高亮
			nameEl.innerHTML += ` <span style="color:#ffd700;font-size:11px;">【已装备 - 当前槽位】</span>`;
		} else if (item.status === 'self') {
			// 装备在自己其他槽位的宝物 - 灰色提示
			nameEl.innerHTML += ` <span style="color:#aaa;font-size:11px;">已装备（槽位${item.ownerSlotIndex + 1}）</span>`;
		} else if (item.status === 'other') {
			// 被其他角色装备的宝物 - 红色提示，显示装备者名字
			nameEl.innerHTML += ` <span style="color:#ff6666;font-size:11px;">已装备（${item.ownerName}）</span>`;
		}

		infoDiv.appendChild(nameEl);

		const descEl = document.createElement('div');
		descEl.className = 'treasure-select-desc';
		descEl.textContent = item.desc(itemLevel||1) || '暂无描述';
		infoDiv.appendChild(descEl);

		// 被其他角色装备时，显示详细装备者信息
		if (item.status === 'other' && item.ownerName) {
			const eqInfo = document.createElement('div');
			eqInfo.className = 'treasure-equipped-by';
			eqInfo.textContent = `· 装备者: ${item.ownerName}（槽位${item.ownerSlotIndex + 1}）`;
			infoDiv.appendChild(eqInfo);
		}

		row.appendChild(infoDiv);

		// 按钮
		const btn = document.createElement('button');
		btn.className = 'treasure-select-btn';

		if (item.isSelfEquipped) {
			btn.textContent = '已装备';
			btn.disabled = true;
		} else if (item.status === 'other') {
			btn.textContent = '不可用';
			btn.disabled = true;
		} else if (item.status === 'self') {
			// 装备在自己其他槽位，允许更换
			btn.textContent = '更换到此槽位';
			btn.onclick = () => {
				Game.Bag.equip(charInstanceId, slotIndex, item.instanceId);
				overlay.remove();
				refreshTreasureUI(charInstanceId);
				SaveManager.autoSave();
				Game.toast(`已将【${item.name}】更换到槽位${slotIndex + 1}`, 'success');
			};
		} else {
			btn.textContent = '装备';
			btn.onclick = () => {
				Game.Bag.equip(charInstanceId, slotIndex, item.instanceId);
				overlay.remove();
				refreshTreasureUI(charInstanceId);
				SaveManager.autoSave();
				Game.toast(`已装备【${item.name}】`, 'success');
			};
		}
		row.appendChild(btn);

		scrollDiv.appendChild(row);
	});

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

// 暴露给 system.js 调用（避免循环import）
shared.showTreasureSelectPopup = showTreasureSelectPopup;

/**
 * 刷新宝物UI（包括队伍视图中的宝物显示）
 * @param {string} charInstanceId - 角色实例ID
 */
function refreshTreasureUI(charInstanceId) {
	// 如果队伍视图正在显示，刷新之
	const teamView = document.getElementById('team-view');
	if (teamView && teamView.style.display !== 'none') {
		const idx = window._selectedSlotIndex;
		if (idx !== null && idx !== undefined) {
			const instId = window.currentTeam[idx];
			if (instId) {
				const instData = window.charBagData && window.charBagData[instId];
				const charId = instData ? instData.charId : instId;

				// ===== 【修改】强制重新计算并显示 =====
				showTeamCharInfo(idx, instId, charId);
				// =====================================
			}
		}
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

// 暴露给 system.js 调用（避免循环import）
shared.refreshTreasureUI = refreshTreasureUI;



/**
 * 同步宝物数据（适配新系统）
 * 主要用于从旧数据格式迁移到宝物实例化系统
 */
function syncTreasureEquipData() {
	// 如果已经安装了新系统，且已有宝物实例数据，则不需要做额外同步
	if (window.treasureInventory && Object.keys(window.treasureInventory).length > 0) {
		return;
	}

	// 初始化新系统
	Game.Bag.ensureInv();

	// ====== 1. 从旧格式 window.treasureBagData 迁移 ======
	if (window.treasureBagData && Object.keys(window.treasureBagData).length > 0) {
		console.log('[宝物迁移] 检测到旧格式 window.treasureBagData，正在迁移...');

		// 旧格式: { treasureBaseId: { count: number, equippedBy: [charInstanceId, ...] } }
		Object.entries(window.treasureBagData).forEach(([baseId, data]) => {
			if (!data || !data.count) return;

			// 创建指定数量的实例
			for (let i = 0; i < data.count; i++) {
				const instanceId = Game.Bag.newId(baseId);
				const equippedBy = (data.equippedBy && data.equippedBy.length > i)
					? data.equippedBy[i]
					: null;

				window.treasureInventory[instanceId] = {
					baseId: baseId,
					equippedBy: equippedBy
				};
			}
		});

		// 清除旧数据，避免重复迁移
		window.treasureBagData = {};
		console.log('[宝物迁移] 从 window.treasureBagData 迁移完成');
	}

	// ====== 2. 从 Game.Data.data._treasureBag 迁移 ======
	if (Game.Data && Game.Data.data && Game.Data.data._treasureBag) {
		const oldBag = Game.Data.data._treasureBag;
		if (Object.keys(oldBag).length > 0) {
			console.log('[宝物迁移] 检测到 Game.Data.data._treasureBag，正在迁移...');

			// 旧格式: { treasureBaseId: { count: number, equippedBy: [charInstanceId, ...] } }
			Object.entries(oldBag).forEach(([baseId, data]) => {
				if (!data || !data.count) return;

				// 创建指定数量的实例
				for (let i = 0; i < data.count; i++) {
					const instanceId = Game.Bag.newId(baseId);
					const equippedBy = (data.equippedBy && data.equippedBy.length > i)
						? data.equippedBy[i]
						: null;

					// 如果 window.treasureInventory 中已有该实例，跳过
					if (window.treasureInventory[instanceId]) continue;

					window.treasureInventory[instanceId] = {
						baseId: baseId,
						equippedBy: equippedBy
					};
				}
			});

			// 清除旧数据，避免重复迁移
			delete Game.Data.data._treasureBag;
			console.log('[宝物迁移] 从 Game.Data.data._treasureBag 迁移完成');
		}
	}

	// ====== 3. 从 Game.Data.data._treasures（旧装备槽位数据）迁移 ======
	if (Game.Data && Game.Data.data && Game.Data.data._treasures) {
		const oldTreasures = Game.Data.data._treasures;
		if (Object.keys(oldTreasures).length > 0) {
			console.log('[宝物迁移] 检测到旧装备槽位数据 Game.Data.data._treasures，正在迁移...');

			// 旧格式: { charInstanceId: [treasureBaseId, null, ...] }  // 6个槽位
			Object.entries(oldTreasures).forEach(([charInstId, slotArray]) => {
				if (!Array.isArray(slotArray)) return;

				slotArray.forEach((treasureBaseId, slotIndex) => {
					if (!treasureBaseId) return;

					// 查找是否有未装备的同名宝物实例
					const available = Object.entries(window.treasureInventory || {}).find(
						([, inv]) => inv.baseId === treasureBaseId && !inv.equippedBy
					);

					if (available) {
						// 直接为角色装备该实例
						window.treasureInventory[available[0]].equippedBy = charInstId;
					} else {
						// 如果没有可用实例，创建一个新实例并装备
						const instanceId = Game.Bag.newId(treasureBaseId);
						window.treasureInventory[instanceId] = {
							baseId: treasureBaseId,
							equippedBy: charInstId
						};
					}
				});
			});

			// 清除旧数据
			delete Game.Data.data._treasures;
			console.log('[宝物迁移] 从旧装备槽位数据迁移完成');
		}
	}

	// ====== 4. 从 window.treasureEquipData（旧装备槽位数据）迁移 ======
	if (window.treasureEquipData && Object.keys(window.treasureEquipData).length > 0) {
		console.log('[宝物迁移] 检测到旧格式 window.treasureEquipData，正在迁移...');

		// 旧格式: { charInstanceId: [treasureBaseId, null, ...] }
		Object.entries(window.treasureEquipData).forEach(([charInstId, slotArray]) => {
			if (!Array.isArray(slotArray)) return;

			slotArray.forEach((treasureBaseId, slotIndex) => {
				if (!treasureBaseId) return;

				// 查找是否有未装备的同名宝物实例
				const available = Object.entries(window.treasureInventory || {}).find(
					([, inv]) => inv.baseId === treasureBaseId && !inv.equippedBy
				);

				if (available) {
					window.treasureInventory[available[0]].equippedBy = charInstId;
				} else {
					// 创建新实例并装备
					const instanceId = Game.Bag.newId(treasureBaseId);
					window.treasureInventory[instanceId] = {
						baseId: treasureBaseId,
						equippedBy: charInstId
					};
				}
			});
		});

		// 清除旧数据
		window.treasureEquipData = {};
		console.log('[宝物迁移] 从 window.treasureEquipData 迁移完成');
	}

	// ====== 5. 如果完全没有旧数据，确保有空的宝物背包 ======
	if (!window.treasureInventory || Object.keys(window.treasureInventory).length === 0) {
		window.treasureInventory = {};
		console.log('[宝物迁移] 未检测到旧数据，初始化空宝物背包');
	}
}



// 高亮选中的方格
function highlightTeamSlot(index) {
	const gridDiv = document.getElementById('team-grid');
	if (!gridDiv) return;
	for (let i = 0; i < gridDiv.children.length; i++) {
		gridDiv.children[i].classList.toggle('team-slot-selected', i === index);
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

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

	Game.toast('已交换位置', 'success');
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
let _touchDragEl = null;	 // 跟随手指的克隆元素
let _touchSourceSlot = null;  // 触摸的原始方格DOM
let _touchSourceIndex = null; // 触摸的原始方格索引
let _touchStartX = 0;		// 触摸起始X坐标
let _touchStartY = 0;		// 触摸起始Y坐标
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
 * @param {string} charId - 角色基础ID (如 'ybsl_017xiaohong')
 */
function showCharDetailPopup(charId) {
	// 1. 获取基础数据
	const baseChar = characterList[charId];
	if (!baseChar) {
		Game.toast('角色数据不存在', 'error');
		return;
	}
	// 【修复】尝试从存档中获取最新的 rank，防止基础数据缺失或不同步
	let displayRank = baseChar.rank;
	if (window.charBagData) {
		// 查找该 charId 对应的任意一个实例的 rank
		const instId = Object.keys(window.charBagData).find(id => window.charBagData[id].charId === charId);
		if (instId && window.charBagData[instId].rank) {
			displayRank = window.charBagData[instId].rank;
		}
	}
	// 2. 【核心】编译属性数值
	// 使用 compileCharacterStats 根据 template 和 rank 获取正确的 hp/at/def/spe
	const stats = compileCharacterStats(baseChar);

	// 获取实例数据（如果有），用于显示等级
	// 注意：这里尝试查找该 charId 的第一个实例，如果是图鉴模式可能没有实例
	let instanceId = null;
	let level = 1;
	if (window.charBagData) {
		// 查找第一个匹配 charId 的实例
		instanceId = Object.keys(window.charBagData).find(id => window.charBagData[id].charId === charId);
		if (instanceId) {
			level = window.charBagData[instanceId].level || 1;
		}
	}

	// 3. 创建遮罩层
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.id = 'char-detail-popup-overlay';

	// 4. 创建对话框
	const dialog = document.createElement('div');
	dialog.className = 'gallery-detail-dialog';
	dialog.style.maxHeight = '80vh'; // 限制最大高度
	dialog.style.overflowY = 'auto'; // 允许滚动

	// --- 标题 ---
	const tupoText = baseChar.tupolevel ? `+${baseChar.tupolevel}` : ''
	const nameDiv = document.createElement('div');
	nameDiv.className = 'gallery-detail-name';
	nameDiv.textContent = baseChar.name + tupoText;
	// 根据品质设置颜色
	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', rare: '#a335ee', common: '#44aaff', junk: '#88cc88', epicfake: '#ffaa44' };
	nameDiv.style.color = rankColors[baseChar.rank] || '#fff';
	dialog.appendChild(nameDiv);

	// --- 上半区：头像 + 基础属性 ---
	const topDiv = document.createElement('div');
	topDiv.className = 'gallery-detail-top';
	topDiv.style.display = 'flex';
	topDiv.style.gap = '15px';
	topDiv.style.alignItems = 'center';
	topDiv.style.marginBottom = '10px';

	// 左侧：头像
	const imgDiv = document.createElement('div');
	imgDiv.style.width = '80px';
	imgDiv.style.height = '80px';
	imgDiv.style.borderRadius = '8px';
	imgDiv.style.overflow = 'hidden';
	imgDiv.style.border = '2px solid #444';
	imgDiv.style.flexShrink = '0';

	const img = document.createElement('img');
	img.src = `/image/character/${charId}.webp`;
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.objectFit = 'cover';
	img.onerror = function () {
		this.style.display = 'none';
		const placeholder = document.createElement('div');
		placeholder.style.width = '100%';
		placeholder.style.height = '100%';
		placeholder.style.background = '#333';
		placeholder.style.display = 'flex';
		placeholder.style.alignItems = 'center';
		placeholder.style.justifyContent = 'center';
		placeholder.style.color = '#888';
		placeholder.style.fontSize = '24px';
		placeholder.textContent = baseChar.name.charAt(0);
		this.parentNode.appendChild(placeholder);
	};
	imgDiv.appendChild(img);
	topDiv.appendChild(imgDiv);

	// 右侧：属性列表
	const attrContainer = document.createElement('div');
	attrContainer.style.flex = '1';
	attrContainer.style.display = 'flex';
	attrContainer.style.flexDirection = 'column';
	attrContainer.style.gap = '4px';
	attrContainer.style.fontSize = '14px';
	attrContainer.style.color = '#ddd';

	const RANK_LABELS = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const TIP_LABELS = { damage: '伤害系', recover: '治疗系' };
	const TEMPLATE_LABELS = { damger: '偏攻', defense: '偏防', balanced: '均衡' };

	const createAttrRow = (label, value, color = '#fff') => {
		const row = document.createElement('div');
		row.innerHTML = `<span style="color:#888;">${label}:</span> <span style="color:${color}; font-weight:bold;">${value}</span>`;
		return row;
	};

	attrContainer.appendChild(createAttrRow('品质', RANK_LABELS[baseChar.rank] || baseChar.rank, rankColors[baseChar.rank]));
	attrContainer.appendChild(createAttrRow('定位', TEMPLATE_LABELS[baseChar.template] || baseChar.template));
	if (baseChar.tip) {
		attrContainer.appendChild(createAttrRow('类型', TIP_LABELS[baseChar.tip] || baseChar.tip));
	}
	attrContainer.appendChild(createAttrRow('等级', level));

	// 分隔线
	const divider = document.createElement('div');
	divider.style.height = '1px';
	divider.style.background = '#444';
	divider.style.margin = '4px 0';
	attrContainer.appendChild(divider);

	attrContainer.appendChild(createAttrRow('血量', stats.hp, '#44aaff'));
	attrContainer.appendChild(createAttrRow('攻击', stats.atk, '#ff4444'));
	attrContainer.appendChild(createAttrRow('防御', stats.def, '#88cc88'));
	attrContainer.appendChild(createAttrRow('速度', stats.spe, '#ffff44'));

	topDiv.appendChild(attrContainer);
	dialog.appendChild(topDiv);

	// --- 下半区：技能详情 ---
	const skillsDiv = document.createElement('div');
	skillsDiv.style.marginTop = '10px';
	skillsDiv.style.borderTop = '1px solid #444';
	skillsDiv.style.paddingTop = '10px';

	const skillTitle = document.createElement('div');
	skillTitle.textContent = '技能配置';
	skillTitle.style.color = '#aaa';
	skillTitle.style.fontSize = '12px';
	skillTitle.style.marginBottom = '5px';
	skillsDiv.appendChild(skillTitle);

	if (baseChar.skills && Array.isArray(baseChar.skills)) {
		baseChar.skills.forEach((skillId, index) => {
			const skillData = getSkillData(skillId);
			const section = document.createElement('div');
			section.style.marginBottom = '8px';
			section.style.padding = '8px';
			section.style.background = 'rgba(255,255,255,0.05)';
			section.style.borderRadius = '4px';

			const skillName = skillData ? skillData.name : skillId;
			const skillIntro = skillData ? skillData.intro : '暂无描述';
			const skillAi = skillData ? skillData.ai_intro : '';

			// 技能类型标签
			let typeTag = '';
			if (index === 0) typeTag = '<span style="color:#88cc88; font-size:10px; border:1px solid #88cc88; padding:1px 3px; border-radius:2px; margin-right:5px;">普攻</span>';
			else if (index === 1) typeTag = '<span style="color:#ffaa44; font-size:10px; border:1px solid #ffaa44; padding:1px 3px; border-radius:2px; margin-right:5px;">主动</span>';
			else typeTag = '<span style="color:#ff4444; font-size:10px; border:1px solid #ff4444; padding:1px 3px; border-radius:2px; margin-right:5px;">必杀</span>';

			section.innerHTML = `
				<div style="font-weight:bold; color:#fff; margin-bottom:2px;">${typeTag}${skillName}</div>
				<div style="font-size:12px; color:#ccc;">${skillIntro}</div>
				${skillAi ? `<div style="font-size:11px; color:#888; margin-top:2px;">AI: ${skillAi}</div>` : ''}
			`;
			skillsDiv.appendChild(section);
		});
	} else {
		skillsDiv.innerHTML += '<div style="color:#666; font-size:12px;">无技能数据</div>';
	}
	dialog.appendChild(skillsDiv);

	// --- 底部按钮 ---
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex; gap:10px; justify-content:center; margin-top:15px;';

	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.textContent = '关闭';
	closeBtn.onclick = () => overlay.remove();
	btnRow.appendChild(closeBtn);

	// 如果是在背包/队伍中查看，且有实例ID，显示"升级"按钮
	// 如果是在背包/队伍中查看，且有实例ID，显示"升级"按钮
	if (instanceId) {
		const upgradeBtn = document.createElement('button');
		upgradeBtn.className = 'ybrpg-btn';
		upgradeBtn.style.background = '#44aaff';
		upgradeBtn.textContent = '培养/升级';
		upgradeBtn.onclick = () => {
			// 调用现有的升级面板逻辑
			if (typeof showUpgradePanel === 'function') {
				// 获取当前最新的等级，防止传入旧数据
				const currentInstData = window.charBagData[instanceId];
				const currentLevel = currentInstData ? currentInstData.level : level;

				showUpgradePanel(instanceId, charId, currentLevel, (newLevel, newHp, newAtk, newDef, newSpe) => {
					// 1. 升级成功回调

					// 【关键修复】确保存档中的数据已更新（通常 showUpgradePanel 内部会更新，但为了保险起见）
					// 如果 showUpgradePanel 内部没有自动保存或更新 window.charBagData，这里需要手动更新
					// 假设 showUpgradePanel 已经更新了 window.charBagData[instanceId]

					// 2. 关闭当前弹窗
					overlay.remove();

					// 3. 重新打开详情弹窗
					// 注意：showCharDetailPopup 内部会重新从 characterList 和 charBagData 获取数据
					showCharDetailPopup(charId);
					// updateCharacterSP(saveData)
					const updatedStats = updateCharacterSP(saveData);
					if (updatedStats && updatedStats.openSpskill !== undefined) {
						saveData.openSpskill = updatedStats.openSpskill;
					}
					Game.toast('升级成功！', 'success');
				});
			} else {
				Game.toast('升级功能暂未实装', 'warning');
			}
		};
		btnRow.appendChild(upgradeBtn);
	}

	dialog.appendChild(btnRow);
	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	// 点击遮罩关闭
	overlay.onclick = (e) => {
		if (e.target === overlay) overlay.remove();
	};
}

function showCharSelectPopup(slotIndex) {
	// 移除已有浮窗
	const existing = document.getElementById('char-select-popup');
	if (existing) existing.remove();

	const RANK_ORDER = { kami: 1, legend: 2, epic: 3, epicfake: 4, rare: 5, common: 6, junk: 7 };
	const RANK_BORDER_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	const RANK_LABELS = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const TIP_LABELS = { damger: '偏攻', defense: '偏防', balanced: '均衡' };

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
			...instData,
			level: instData.level,
			hp: instData.hp,
			atk: instData.atk,
			def: instData.def,
			spe: instData.spe
		};
	}).filter(Boolean);

	// 排序：先按品质，再按等级
	ownedInstances.sort((a, b) => {
		const isInTeamA = window.currentTeam && window.currentTeam.includes(a.instanceId);
		const isInTeamB = window.currentTeam && window.currentTeam.includes(b.instanceId);

		// 如果一个在队一个不在，在队的排前面
		if (isInTeamA && !isInTeamB) return -1;
		if (!isInTeamA && isInTeamB) return 1;

		// 都在队或都不在队，按原逻辑（品质+等级）
		//先突破阶级
		const breakthroughDiff = (b.tupolevel || 0) - (a.tupolevel || 0);
		if (breakthroughDiff !== 0) return breakthroughDiff;
		//先等级
		const levelDiff = ((b.level || 1) - (a.level || 1))
		if (levelDiff !== 0) return levelDiff;
		//再品质
		const rankDiff = (RANK_ORDER[a.rank] || 99) - (RANK_ORDER[b.rank] || 99);
		if (rankDiff !== 0) return rankDiff;
		return a.name.localeCompare(b.name);
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
		img.src = `/image/character/${charInst.charId}.jpg`;
		img.alt = charInst.name;
		img.className = 'gallery-char-img';
		img.onerror = function () {
			this.onerror = function () {
				this.style.display = 'none';
				const p = document.createElement('div');
				p.className = 'gallery-char-placeholder';
				p.textContent = charInst.name.charAt(0);
				this.parentNode.appendChild(p);
			};
			this.src = `/image/character/${charInst.charId}.webp`;
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

		const tupoText = `${charInst.tupolevel ? '+' + charInst.tupolevel + '  ' : ''}`;

		nameEl.textContent = charInst.name + tupoText;
		if (RANK_BORDER_COLORS[charInst.rank]) nameEl.style.color = RANK_BORDER_COLORS[charInst.rank];
		// if (charInst.rank === 'legend') nameEl.style.color = '#ff6666';
		// else if (charInst.rank === 'epic') nameEl.style.color = '#ffaa44';
		infoDiv.appendChild(nameEl);

		const detailEl = document.createElement('div');
		detailEl.className = 'char-select-detail';
		const lvText = `Lv.${charInst.level || 1}`;
		const tipText = TIP_LABELS[charInst.template] || '';
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

			// 1. 处理宝物继承逻辑（使用新的 charTreasureSlots 系统）
			if (oldInstanceId) {
				// 确保宝物槽位数据已初始化
				if (typeof ensureCharTreasureSlots === 'function') {
					Game.Bag.ensureSlots();
				}

				// 获取旧角色的宝物槽位
				const oldSlots = window.charTreasureSlots[oldInstanceId] || [null, null, null, null, null, null];

				// 如果新角色还没有宝物槽位，初始化
				if (!window.charTreasureSlots[charInst.instanceId]) {
					window.charTreasureSlots[charInst.instanceId] = [null, null, null, null, null, null];
				}

				// 将旧角色的宝物转移到新角色
				window.charTreasureSlots[charInst.instanceId] = [...oldSlots];

				// 清空旧角色的宝物槽位
				window.charTreasureSlots[oldInstanceId] = [null, null, null, null, null, null];
			}

			// 2. 处理队伍数据交换
			if (existIdx !== -1) {
				window.currentTeam[existIdx] = oldInstanceId;
			}

			// 3. 设置新角色
			window.currentTeam[slotIndex] = charInst.instanceId;

			// 4. 更新选中状态
			window._selectedSlotIndex = slotIndex;

			// 5. 延迟刷新
			setTimeout(() => {
				// A. 刷新网格中的单个槽位（显示头像、名字等）
				refreshTeamSlot(slotIndex);

				// B. 如果存在被交换出去的旧槽位，也刷新它
				if (existIdx !== -1 && existIdx !== slotIndex) {
					refreshTeamSlot(existIdx);
				}

				// C. 刷新详情区域
				const newInstanceId = window.currentTeam[slotIndex];
				if (newInstanceId && window.charBagData && window.charBagData[newInstanceId]) {
					const newInstanceData = window.charBagData[newInstanceId];
					const newCharId = newInstanceData.charId || newInstanceId;

					// 强制调用详情刷新
					showTeamCharInfo(slotIndex, newInstanceId, newCharId);
				}

				// D. 自动保存
				SaveManager.autoSave();
			}, 0);

			// 6. 提示与关闭弹窗
			Game.toast(`${charInst.name} (Lv.${charInst.level}) 已上阵`, 'success');
			overlay.remove();
		};

		// var num = window._selectedSlotIndex;
		//	 const instanceId = window.currentTeam[num];
		//	 const instanceData = window.charBagData[instanceId];
		//	 const charId = instanceData.charId || instanceId;
		//	 showTeamCharInfo(num, instanceId, charId);

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

// 背包整体重建（renderBagView）时是否重置滚动位置（tab 切换/首次打开回到顶部）

// ===== 以下来自原 mode.js 11212-13246 行 =====

function showBagCharDetailPopup(instanceId, charId) {
	const instData = window.charBagData && window.charBagData[instanceId];
	if (!instData) return;
	const char = characterList[charId];
	if (!char) return;
	const charT = instData;
	// 遮罩层
	// const overlay = document.createElement('div');
	// overlay.className = 'ybrpg-confirm-overlay'; // 保持原有类名
	// overlay.id = 'bag-char-detail-overlay';	  // <--- 新增：添加ID以便刷新时移除
	const saveData = instData;
	const RANK_LABELS = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const RANK_COLORS = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	const TIP_LABELS = { damger: '偏攻', defense: '偏防', balanced: '均衡' };

	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	// overlay.id = 'bag-char-detail-overlay';	  // <--- 新增：添加ID以便刷新时移除

	const dialog = document.createElement('div');
	dialog.className = 'gallery-detail-dialog';
	dialog.style.maxWidth = '300px';

	// 角色名
	const tupoText = charT.tupolevel ? `+${charT.tupolevel}` : ''
	const nameDiv = document.createElement('div');
	nameDiv.className = 'gallery-detail-name';
	nameDiv.textContent = charT.name + tupoText;
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
	img.src = `/image/character/${charId}.jpg`;
	img.alt = charT.name;
	img.onerror = function () {
		this.onerror = function () {
			this.style.display = 'none';
			const p = document.createElement('div');
			p.className = 'gallery-char-placeholder';
			p.style.width = '120px';
			p.style.height = '150px';
			p.style.fontSize = '36px';
			p.textContent = charT.name.charAt(0);
			this.parentNode.appendChild(p);
		};
		this.src = `/image/character/${charId}.webp`;
	};
	imgDiv.onclick = () => showFullImage(charId, char.name);
	imgDiv.appendChild(img);
	topDiv.appendChild(imgDiv);

	// 属性区
	const attrDiv = document.createElement('div');
	attrDiv.className = 'gallery-detail-attr';

	const rankDiv = document.createElement('div');
	rankDiv.className = 'gallery-detail-rank';
	const rankText = RANK_LABELS[charT.rank] || charT.rank;
	const levelText = `Lv.${saveData.level}`;
	rankDiv.innerHTML = `<span style="color:${RANK_COLORS[charT.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">${levelText}</span>`;
	attrDiv.appendChild(rankDiv);

	const tipDiv = document.createElement('div');
	tipDiv.style.fontSize = '12px';
	tipDiv.style.color = '#aaa';
	tipDiv.style.marginBottom = '4px';
	tipDiv.textContent = TIP_LABELS[charT.template] || '';
	attrDiv.appendChild(tipDiv);

	// 修改位置：showBagCharDetailPopup 函数内，属性显示部分

	// 原有的 attrs 数组
	// const attrs = [
	//	 { label: '生命', value: saveData.hp },
	//	 { label: '攻击', value: saveData.atk },
	//	 { label: '防御', value: saveData.def },
	//	 { label: '速度', value: saveData.spe },
	// ];

	// ======== 替换为如下代码 ========
	// 在 showBagCharDetailPopup 函数中，找到 attrs 数组定义处

	// ===== 【新增】计算全队突破加成 =====
	const teamBonuses = Game.Stat.teamBonuses();

	// ===== 传入全队加成 =====
	const finalStats = Game.Stat.final(instanceId, teamBonuses);

	const attrs = [
		{
			label: '生命',
			value: finalStats.totalHp,
			base: finalStats.baseHp,
			breakBonus: finalStats.breakthroughBonus.hp,
			tresBonus: finalStats.treasureBonus.hp
		},
		{
			label: '攻击',
			value: finalStats.totalAtk,
			base: finalStats.baseAtk,
			breakBonus: finalStats.breakthroughBonus.atk,
			tresBonus: finalStats.treasureBonus.atk
		},
		{
			label: '防御',
			value: finalStats.totalDef,
			base: finalStats.baseDef,
			breakBonus: finalStats.breakthroughBonus.def,
			tresBonus: finalStats.treasureBonus.def
		},
		{
			label: '速度',
			value: finalStats.totalSpe,
			base: finalStats.baseSpe,
			breakBonus: finalStats.breakthroughBonus.spe,
			tresBonus: finalStats.treasureBonus.spe
		},
	];

	// attrs.forEach(a => {
	// 	const row = document.createElement('div');
	// 	row.className = 'gallery-detail-attr-row';

	// 	// 构建显示文本
	// 	let displayText = `${a.value}`;
	// 	// if (a.breakBonus > 0 && a.tresBonus > 0) {
	// 	// 	displayText += ` <span style="color:#44ff88;font-size:11px;">(基础${a.base}+突破${a.breakBonus}+宝物${a.tresBonus})</span>`;
	// 	// } else if (a.breakBonus > 0) {
	// 	// 	displayText += ` <span style="color:#44ff88;font-size:11px;">(基础${a.base}+突破${a.breakBonus})</span>`;
	// 	// } else if (a.tresBonus > 0) {
	// 	// 	displayText += ` <span style="color:#44ff88;font-size:11px;">(基础${a.base}+宝物${a.tresBonus})</span>`;
	// 	// }
	// 	// 获取固定加成和百分比加成
	// 	const flatBonus = finalStats.flatBonus ? finalStats.flatBonus[a.label === '生命' ? 'hp' : a.label === '攻击' ? 'atk' : a.label === '防御' ? 'def' : 'spe'] : 0;
	// 	const percentBonus = finalStats.percentBonus ? finalStats.percentBonus[a.label === '生命' ? 'hp' : a.label === '攻击' ? 'atk' : a.label === '防御' ? 'def' : 'spe'] : 0;

	// 	if (flatBonus > 0 || percentBonus > 0) {
	// 		let text = `(${a.base}`;
	// 		if (flatBonus > 0) text += `+${flatBonus}`;
	// 		text += `)`;
	// 		if (percentBonus > 0) text += `×${(1 + percentBonus).toFixed(2)}`;
	// 		displayText += ` <span style="color:#44ff88;font-size:11px;">${text}</span>`;
	// 	}


	// 	row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${displayText}</span>`;
	// 	attrDiv.appendChild(row);
	// });

	// 定义属性名称映射
	const ATTR_MAP = { '生命': 'hp', '攻击': 'atk', '防御': 'def', '速度': 'spe' };

	// 在显示循环中
	attrs.forEach(a => {
		const row = document.createElement('div');
		row.className = 'team-info-attr-row';

		let displayText = `${a.value}`;

		// 使用映射获取对应的 key

		// ===== 根据设置决定是否显示公式 =====
		if (window.showFormulaDetail) {
			const attrKey = ATTR_MAP[a.label];
			if (attrKey && finalStats.flatBonus) {
				const flatBonus = finalStats.flatBonus[attrKey] || 0;
				const percentBonus = finalStats.percentBonus[attrKey] || 0;

				if (flatBonus > 0 || percentBonus > 0) {
					let text = `(${a.base}`;
					if (flatBonus > 0) text += `+${flatBonus}`;
					text += `)`;
					if (percentBonus > 0) text += `×${(1 + percentBonus).toFixed(2)}`;
					displayText += ` <span style="color:#44ff88;font-size:11px;">${text}</span>`;
				}
			}
		}

		row.innerHTML = `<span class="attr-label">${a.label}</span><span class="attr-value">${displayText}</span>`;
		attrDiv.appendChild(row);
	});



	topDiv.appendChild(attrDiv);
	dialog.appendChild(topDiv);

	// 技能信息
	const skillsDiv = document.createElement('div');
	skillsDiv.className = 'gallery-detail-skills';

	// 获取角色基础定义（用于获取完整的 skillIds）
	const baseCharForSkill = characterList[charId];
	const skillIds = baseCharForSkill?.skills || char.skills || [];

	// ===== 普攻 =====
	const pugongId = skillIds[0];
	if (pugongId && contentList.pugong && contentList.pugong[pugongId]) {
		const pg = contentList.pugong[pugongId];
		const section = buildSkillSection('普攻', pg, '#5ba8ff');
		skillsDiv.appendChild(section);
	}

	// ===== 判断是否有必杀 (skills[2]) =====
	const spSkillId = skillIds[2];
	const spData = spSkillId && contentList.spskill && contentList.spskill[spSkillId];
	const isSpskillUnlocked = charT.openSpskill === true;

	if (spData) {
		if (isSpskillUnlocked) {
			// === 必杀已解锁：显示必杀，不显示普通技能 ===
			const section = document.createElement('div');
			section.className = 'gallery-skill-section';

			const title = document.createElement('div');
			title.className = 'gallery-skill-title spskill';
			title.textContent = '必杀';
			title.style.color = '#ffd700';
			title.style.background = 'rgba(255,215,0,0.1)';
			section.appendChild(title);

			const nameEl = document.createElement('div');
			nameEl.className = 'gallery-skill-name';
			const emoji = spData.emoji ? ` ${spData.emoji}` : '';
			nameEl.textContent = spData.name + emoji;
			section.appendChild(nameEl);

			const intro = document.createElement('div');
			intro.className = 'gallery-skill-intro';
			intro.textContent = spData.intro;
			section.appendChild(intro);

			// 已解锁标记
			const unlockTag = document.createElement('div');
			unlockTag.className = 'gallery-skill-ai';
			unlockTag.style.color = '#44ff88';
			unlockTag.textContent = '✅ 必杀已解锁';
			section.appendChild(unlockTag);

			skillsDiv.appendChild(section);
		} else {
			// === 必杀未解锁：显示普通技能 + 必杀未解锁提示 ===
			// 先显示普通技能
			const skillId = skillIds[1];
			if (skillId && contentList.skill && contentList.skill[skillId]) {
				const sk = contentList.skill[skillId];
				const section = buildSkillSection('技能', sk, '#ff8c00');
				skillsDiv.appendChild(section);
			}

			// 再显示未解锁的必杀
			const section = document.createElement('div');
			section.className = 'gallery-skill-section';
			section.style.opacity = '0.6';
			section.style.filter = 'grayscale(0.8)';

			const title = document.createElement('div');
			title.className = 'gallery-skill-title spskill';
			title.textContent = '必杀（未解锁）';
			title.style.color = '#888';
			title.style.background = 'rgba(128,128,128,0.1)';
			section.appendChild(title);

			const nameEl = document.createElement('div');
			nameEl.className = 'gallery-skill-name';
			const emoji = spData.emoji ? ` ${spData.emoji}` : '';
			nameEl.textContent = spData.name + emoji;
			nameEl.style.color = '#888';
			section.appendChild(nameEl);

			const intro = document.createElement('div');
			intro.className = 'gallery-skill-intro';
			intro.textContent = spData.intro;
			intro.style.color = '#666';
			section.appendChild(intro);

			// 解锁条件
			const unlockInfo = document.createElement('div');
			unlockInfo.className = 'gallery-skill-ai';
			unlockInfo.style.color = '#ffd700';
			unlockInfo.style.fontSize = '11px';
			unlockInfo.textContent = '🔒 突破19阶解锁必杀';
			section.appendChild(unlockInfo);

			skillsDiv.appendChild(section);
		}
	} else {
		// ---- 没有必杀配置：只显示普通技能 ----
		const skillId = skillIds[1];
		if (skillId && contentList.skill && contentList.skill[skillId]) {
			const sk = contentList.skill[skillId];
			const section = buildSkillSection('技能', sk, '#ff8c00');
			skillsDiv.appendChild(section);
		}
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
				const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
				const rankLabels = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
				const rankText = rankLabels[saveData.rank] || saveData.rank;
				rankEl.innerHTML = `<span style="color:${rankColors[saveData.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">Lv.${newLevel}</span>`;
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
			// updateCharacterSP(saveData)
		});
	};
	btnRow.appendChild(upgradeBtn);

	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.style.cssText = 'width:auto;padding:6px 16px;font-size:13px;flex:1;';
	closeBtn.textContent = '关闭';
	closeBtn.onclick = () => overlay.remove();
	btnRow.appendChild(closeBtn);
	// --- 👇 突破/升阶按钮逻辑 (解耦版) 👇 ---
	// if (instanceId) {
	// 	const currentTupo = instData.tupolevel || 0;
	// 	const currentRank = instData.rank || char.rank || 'common';

	// 	// 获取突破信息和升阶信息
	// 	let breakInfo = getBreakthroughInfo(char, currentTupo);
	// 	let needPromotion = needUpgrade(saveData);

	// 	const promotionInfo = getPromotionInfo(currentTupo, currentRank);

	// 	// 创建突破/升阶按钮
	// 	const breakthroughBtn = document.createElement('button');
	// 	breakthroughBtn.className = 'ybrpg-btn';
	// 	breakthroughBtn.id = 'breakthrough-btn';
	// 	breakthroughBtn.style.cssText = 'width:auto;padding:6px 16px;font-size:13px;flex:1;';

	// 	// 更新按钮状态的函数
	// 	function updateBtnState() {
	// 		if (breakInfo.maxed) {
	// 			breakthroughBtn.textContent = '已突破至极限';
	// 			breakthroughBtn.disabled = true;
	// 			breakthroughBtn.style.opacity = '0.6';
	// 			breakthroughBtn.style.background = '#555';
	// 		} else if (needPromotion) {
	// 			breakthroughBtn.textContent = `升阶`;//至【${getRankLabel(needPromotion)}】
	// 			breakthroughBtn.style.background = '#ffaa00';
	// 			breakthroughBtn.style.color = '#000';
	// 			breakthroughBtn.disabled = false;
	// 		} else {
	// 			breakthroughBtn.textContent = `突破 `;//(消耗${breakInfo.cost}个同名)
	// 			breakthroughBtn.style.background = '#44aaff';
	// 			breakthroughBtn.style.color = '#fff';
	// 			breakthroughBtn.disabled = false;
	// 		}
	// 	}

	// 	// 获取消耗文本（分离升阶和突破的说明）
	// 	function getConfirmText() {
	// 		if (needPromotion) {
	// 			const targetRankLabel = getRankLabel(needPromotion);
	// 			const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
	// 				if (id === instanceId) return false;
	// 				const inst = window.charBagData[id];
	// 				return inst && (inst.charId === charId || id === charId);
	// 			});
	// 			const availableCount = availableFodderIds.length;
	// 			return `确定要将【${char.name}】升阶至【${targetRankLabel}】吗？\n` +
	// 				`当前突破等级: ${currentTupo}阶\n` +
	// 				`可用同名材料: ${availableCount}个`;
	// 		} else {
	// 			const cost = breakInfo.cost;
	// 			const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
	// 				if (id === instanceId) return false;
	// 				const inst = window.charBagData[id];
	// 				return inst && (inst.charId === charId || id === charId);
	// 			});
	// 			const availableCount = availableFodderIds.length;
	// 			return `确定要突破【${char.name}】吗？\n` +
	// 				`当前突破等级: ${currentTupo}阶 → 目标: ${currentTupo + 1}阶\n` +
	// 				`消耗: ${cost}个同名角色 (可用: ${availableCount}个)`;
	// 		}
	// 	}

	// 	// 初始化按钮状态
	// 	updateBtnState();

	// 	// 按钮点击事件
	// 	breakthroughBtn.onclick = () => {
	// 		// 检查材料是否足够
	// 		const availableFodderIds = Object.keys(window.charBagData || {}).filter(id => {
	// 			if (id === instanceId) return false;
	// 			const inst = window.charBagData[id];
	// 			return inst && (inst.charId === charId || id === charId);
	// 		});
	// 		const availableCount = availableFodderIds.length;

	// 		if (needPromotion) {
	// 			// 升阶逻辑
	// 			const promotionCost = Math.floor(currentTupo / 4) + 1;
	// 			if (availableCount < promotionCost) {
	// 				Game.toast(`升阶材料不足！需要 ${promotionCost} 个同名角色，当前可用: ${availableCount}`, 'error');
	// 				return;
	// 			}

	// 			Game.confirmDialog(getConfirmText(), () => {
	// 				// 先执行突破（升阶前需要先消耗材料）
	// 				const beforeTupo = instData.tupolevel || 0;

	// 				// 执行升阶
	// 				const result = promoteCharacterRank(instanceId);
	// 				if (result.success) {
	// 					Game.toast(result.message, 'success');
	// 					// 刷新弹窗
	// 					refreshDetailPopup();
	// 				} else {
	// 					Game.toast(result.message, 'error');
	// 				}
	// 			});
	// 		} else {
	// 			// 突破逻辑
	// 			const cost = breakInfo.cost;
	// 			if (availableCount < cost) {
	// 				Game.toast(`突破材料不足！需要 ${cost} 个同名角色，当前可用: ${availableCount}`, 'error');
	// 				return;
	// 			}
	// 			if (breakInfo.maxed) {
	// 				Game.toast('已达到最大突破等级', 'warning');
	// 				return;
	// 			}

	// 			Game.confirmDialog(getConfirmText(), () => {
	// 				const result = breakthroughCharacterInstance(instanceId);
	// 				if (result.success) {
	// 					Game.toast(result.message, 'success');
	// 					// 刷新弹窗
	// 					refreshDetailPopup();
	// 				} else {
	// 					Game.toast(result.message, 'error');
	// 				}
	// 			});
	// 		}
	// 	};
	// 	// 刷新弹窗内容的函数
	// 	function refreshDetailPopup() {
	// 		// 重新获取最新的实例数据
	// 		const latestInstData = window.charBagData && window.charBagData[instanceId];
	// 		if (!latestInstData) return;

	// 		// 更新 saveData 引用
	// 		saveData.tupolevel = latestInstData.tupolevel || 0;
	// 		saveData.rank = latestInstData.rank || char.rank || 'common';
	// 		saveData.level = latestInstData.level || 1;
	// 		saveData.hp = latestInstData.hp;
	// 		saveData.atk = latestInstData.atk;
	// 		saveData.def = latestInstData.def;
	// 		saveData.spe = latestInstData.spe;

	// 		// 更新等级显示
	// 		const rankEl = dialog.querySelector('.gallery-detail-rank');
	// 		if (rankEl) {
	// 			const rankText = RANK_LABELS[saveData.rank] || saveData.rank;
	// 			rankEl.innerHTML = `<span style="color:${RANK_COLORS[saveData.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">Lv.${saveData.level}</span>`;
	// 		}
	// 		// 更新角色名
	// 		const nameEl = dialog.querySelector('.gallery-detail-name');
	// 		if (nameEl) {
	// 			const tupoTextx = saveData.tupolevel ? `+${saveData.tupolevel}` : '';
	// 			nameEl.textContent = saveData.name + tupoTextx;
	// 		}
	// 		// 更新四维属性
	// 		const attrRows = dialog.querySelectorAll('.gallery-detail-attr-row .attr-value');
	// 		const newValues = [saveData.hp, saveData.atk, saveData.def, saveData.spe];
	// 		attrRows.forEach((el, i) => {
	// 			if (i < newValues.length) el.textContent = newValues[i];
	// 		});

	// 		// 重新获取突破信息和升阶信息
	// 		const newCurrentTupo = saveData.tupolevel || 0;
	// 		const newCurrentRank = saveData.rank || char.rank || 'common';
	// 		breakInfo = getBreakthroughInfo(char, newCurrentTupo);
	// 		needPromotion = needUpgrade(saveData);

	// 		// 更新按钮状态
	// 		updateBtnState();

	// 		// 刷新背包视图
	// 		if (typeof renderBagView === 'function') {
	// 			const bagView = document.getElementById('bag-view');
	// 			if (bagView) renderBagView(bagView);
	// 		}
	// 	}


	// 	// 将按钮添加到按钮行
	// 	if (btnRow) {
	// 		btnRow.appendChild(breakthroughBtn);
	// 	}
	// }
	// ===== 【新增】突破详情按钮 =====
	const detailBreakBtn = document.createElement('button');
	detailBreakBtn.className = 'ybrpg-btn';
	detailBreakBtn.style.cssText = 'width:auto;padding:6px 16px;font-size:13px;flex:1;background:#2a1a3a;border-color:#d000ff;color:#d000ff;';
	detailBreakBtn.textContent = '🔮 突破详情';
	detailBreakBtn.onclick = () => {
		// 调用突破预览弹窗（不关闭当前弹窗，浮在其上）
		// showBreakthroughPreviewPopup();
		showBreakthroughPreviewPopupWithCallback(instanceId, dialog);
	};
	btnRow.appendChild(detailBreakBtn);
	// --- 👆 结束 ---
	// --- 👆 突破/升阶按钮逻辑结束 👆 ---
	// --- 👆 插入结束 👆 ---
	dialog.appendChild(btnRow);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	overlay.onclick = (e) => {
		if (e.target === overlay) overlay.remove();
	};
}
/**
 * 检查角色是否需要升阶
 * @param {Object} character - 角色实例数据
 * @returns {string|false} 如果需要升阶，返回目标品质；否则返回 false
 */
function needUpgrade(character) {
	const rankList = ['junk', 'common', 'rare', 'epicfake', 'epic', 'legend', 'kami'];
	const tupolevel = character.tupolevel || 0;
	const currentRank = character.rank || 'common';

	const promotionInfo = getPromotionInfo(tupolevel, currentRank);
	if (!promotionInfo) return false;

	return promotionInfo.targetRank;
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
	const emoji = sData.emoji ? ` ${sData.emoji}` : '';
	nameEl.textContent = sData.name + emoji;
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
 * 显示突破预览弹窗（支持回调，突破成功后刷新父弹窗和阵容界面）
 * @param {string} instanceId - 角色实例ID
 * @param {HTMLElement} parentDialog - 父弹窗（角色详情弹窗）的DOM元素，可选
 */
function showBreakthroughPreviewPopupWithCallback(instanceId, parentDialog) {
	// 先保存当前选中的角色索引和instanceId
	const savedSlotIndex = window._selectedSlotIndex;

	// 调用原有的 showBreakthroughPreviewPopup
	// 但我们需要修改它的内部逻辑——在突破成功时执行回调

	// 由于 showBreakthroughPreviewPopup 内部逻辑较复杂，
	// 我们可以采用"重写"的方式，创建一个基于 showBreakthroughPreviewPopup 但增加了回调的版本
	// 或者更简单：复用 showBreakthroughPreviewPopup，但在它突破成功时，我们主动从外部监听

	// === 方案：直接调用 showBreakthroughPreviewPopup，然后通过修改全局钩子来刷新 ===
	// 在执行突破前，设置一个全局刷新标记
	window._pendingRefreshAfterBreakthrough = {
		instanceId: instanceId,
		parentDialog: parentDialog,
		slotIndex: savedSlotIndex
	};

	// 调用原有突破弹窗
	showBreakthroughPreviewPopup(instanceId);
}

// function updateCharacterSP(current,target){
//	 var rank = current.rank;
//	 var temp = current.template;
//	 var level = current.level;
//	 var tupolevel = current.tupolevel;
//	 var id = current.id||current;
//	 // var base ={};
//	 if(characterTemplate[temp]?.[rank]){
//		 const info = {
//			 hp: characterTemplate[temp][rank].hp,
//			 atk: characterTemplate[temp][rank].atk,
//			 def: characterTemplate[temp][rank].def,
//			 spe: characterTemplate[temp][rank].spe,
//		 }
//		 // target.tupoList=characterList[id].tupoList.slice(0,tupolevel);
//		 var mag = (100 + 10 * (level - 1)) / 100
//		 target.hp = info.hp*mag;
//		 target.atk = info.atk*mag;
//		 target.def = info.def*mag;
//		 target.spe = info.spe*mag;
//	 }
//	 // return base;
// }
/**
 * 更新角色实例属性（基于模板和等级）
 * @param {Object} current - 角色实例对象 (必须包含 charId, rank, template, level)
 */
function updateCharacterSP(current) {
	if (!current) return;

	const rank = current.rank || 'common';
	const temp = current.template || 'balanced';
	const level = Number(current.level) || 1;
	const tupolevel = current.tupolevel || 0;

	// 2. 查找模板数据
	// 确保 characterTemplate 已定义，且路径存在
	const templateData = characterTemplate || characterTemplate;
	const rankData = templateData?.[temp]?.[rank];

	if (!rankData) {
		console.warn(`[属性更新] 未找到模板数据: template=${temp}, rank=${rank}`);
		// 可选：设置一个保底的基础数值，防止 NaN
		// current.hp = 500; current.atk = 50; ...
		return;
	}
	// console.log('rankData',rankData)

	// 3. 提取基础属性，使用 || 0 防止模板中缺少某项属性导致 NaN
	const baseHp = Number(rankData.hp) || 0;
	const baseAtk = Number(rankData.atk) || 0;
	const baseDef = Number(rankData.def) || 0;
	const baseSpe = Number(rankData.spe) || 0;

	// 4. 计算成长系数
	// 公式: (100 + 10 * (等级 - 1)) / 100
	// Lv1 -> 1.0, Lv2 -> 1.1, Lv10 -> 1.9
	const mag = (100 + 10 * (level - 1)) / 100;

	var newcurrent = { ...current };
	newcurrent.hp = Math.floor(baseHp * mag);
	newcurrent.atk = Math.floor(baseAtk * mag);
	newcurrent.def = Math.floor(baseDef * mag);
	newcurrent.spe = Math.floor(baseSpe * mag);
	// console.log('newcurrent',newcurrent)

	// 6. 如果有突破等级逻辑，可以在这里处理
	if (tupolevel > 0 && current.tupoList) {
		newcurrent.tupoList = current.tupoList.slice(0, tupolevel);
	}

	// ===== 【新增】战斗属性不随等级成长，保持初始值 =====
	newcurrent.mingzhong = current.mingzhong ?? rankData.mingzhong ?? 10000;
	newcurrent.shanbi = current.shanbi ?? rankData.shanbi ?? 0;
	newcurrent.baoji = current.baoji ?? rankData.baoji ?? 0;
	newcurrent.kangbao = current.kangbao ?? rankData.kangbao ?? 0;
	newcurrent.poji = current.poji ?? rankData.poji ?? 0;
	newcurrent.gedang = current.gedang ?? rankData.gedang ?? 0;

	newcurrent.fixedDealUp = current.fixedDealUp ?? rankData.fixedDealUp ?? 0;
	newcurrent.fixedTakeDn = current.fixedTakeDn ?? rankData.fixedTakeDn ?? 0;
	newcurrent.pctDealUp = current.pctDealUp ?? rankData.pctDealUp ?? 0;
	newcurrent.pctTakeDn = current.pctTakeDn ?? rankData.pctTakeDn ?? 0;

	newcurrent.fixedHeal = current.fixedHeal ?? rankData.fixedHeal ?? 0;
	newcurrent.fixedBeHeal = current.fixedBeHeal ?? rankData.fixedBeHeal ?? 0;
	newcurrent.pctHeal = current.pctHeal ?? rankData.pctHeal ?? 0;
	newcurrent.pctBeHeal = current.pctBeHeal ?? rankData.pctBeHeal ?? 0;

	// ===== 【修复】检查突破等级是否解锁必杀技 =====
	newcurrent.openSpskill = false;

	// 从角色基础定义中获取完整的 tupoList
	const charId = current.charId || current.id;
	const baseChar = characterList && characterList[charId];
	const fullTupoList = current.tupoList || (baseChar && baseChar.tupoList) || [];

	// 遍历已解锁的突破等级，检查是否有 openSpskill 标记
	for (let i = 0; i < tupolevel; i++) {
		const buff = fullTupoList[i];
		if (!buff) continue;

		let resolvedBuff = buff;
		if (typeof buff === 'string') {
			const lib = BREAKTHROUGH_BUFF_LIBRARY || BREAKTHROUGH_BUFF_LIBRARY || {};
			resolvedBuff = lib[buff];
		}

		if (resolvedBuff && resolvedBuff.openSpskill) {
			newcurrent.openSpskill = true;
			break; // 找到一个就够了
		}
	}

	// ===== 同时检查宝物是否解锁必杀技 =====
	if (!newcurrent.openSpskill && current.instanceId) {
		const instanceId = current.instanceId;
		if (window.charTreasureSlots && window.charTreasureSlots[instanceId]) {
			const slots = window.charTreasureSlots[instanceId];
			slots.forEach(treasureId => {
				if (!treasureId) return;
				const treasureData = window.treasureInventory && window.treasureInventory[treasureId];
				if (treasureData) {
					const defs = Game.Bag.defs();
					const tDef = defs[treasureData.baseId];
					if (tDef && tDef.openSpskill) {
						newcurrent.openSpskill = true;
					}
				}
			});
		}
	}
	return newcurrent;
}

// 暴露给 system.js 调用（避免循环import）
shared.updateCharacterSP = updateCharacterSP;

/**
 * 升级选择面板（仅消耗同品质武将）
 * @param {string} targetInstId - 要升级的角色实例ID
 * @param {string} targetCharId - 要升级的角色基础ID
 * @param {number} currentLevel - 当前等级
 */
function showUpgradePanel(targetInstId, targetCharId, currentLevel, onUpgrade) {
	// const requiredExp = currentLevel; // 所需经验值 = 当前等级

	// 获取目标角色的品质
	const targetRank = characterList[targetCharId]?.rank;
	if (!targetRank) {
		Game.toast('目标角色品质异常', 'error');
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
	popup.style.maxWidth = '300px';

	const title = document.createElement('div');
	title.className = 'char-select-title';
	title.textContent = `选择同品质材料`;
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
	countLabel.textContent = '已选: 0 将升至' + currentLevel + '级';
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
		let newLevel = currentLevel + totalLevel;

		// 非主角角色：等级不得超过主角
		if (targetCharId !== 'zhujue') {
			const mainInst = getMainCharacterInstance();
			const mainLevel = mainInst ? (mainInst.level || 1) : 1;
			if (newLevel > mainLevel) {
				newLevel = mainLevel;
				Game.toast(`非主角角色等级不能超过主角（Lv.${mainLevel}），已限制为 Lv.${mainLevel}`, 'warning');
			}
		}

		// 点击时判断金币：升级到每一级都需支付该级费用（前期低、后期高）
		const totalGoldCost = calcUpgradeGoldCost(currentLevel, newLevel);
		if ((window.gameGold || 0) < totalGoldCost) {
			Game.toast(`金币不足！升至 Lv.${newLevel} 需 ${totalGoldCost} 金币（当前 ${window.gameGold || 0}）`, 'error');
			return;
		}

		// 消耗选中的角色
		selected.forEach(c => {
			delete window.charBagData[c.instanceId];
			if (window.currentTeam) {
				const idx = window.currentTeam.indexOf(c.instanceId);
				if (idx !== -1) {
					window.currentTeam[idx] = null;
				}
			}
		});

		// 扣除金币
		window.gameGold = (window.gameGold || 0) - totalGoldCost;
		updateResourceHUD();

		// 升级目标角色
		const targetData = window.charBagData[targetInstId];
		targetData.level = newLevel;
		var newcurrent = updateCharacterSP(targetData);
		if (newcurrent && newcurrent.openSpskill !== undefined) {
			targetData.openSpskill = newcurrent.openSpskill;
		}
		const newHp = newcurrent.hp;
		const newAtk = newcurrent.atk;
		const newDef = newcurrent.def;
		const newSpe = newcurrent.spe;

		if (typeof onUpgrade === 'function') {
			onUpgrade(newLevel, newHp, newAtk, newDef, newSpe);
		}

		overlay.remove();
		Game.toast(`${characterList[targetCharId]?.name} 已升至 ${newLevel} 级！（消耗 ${totalGoldCost} 金币）`, 'success');

		// 【修改】统一使用 refreshAllViews
		Game.UI.refresh({
			instanceId: targetInstId,
			forceTeamRebuild: false
		});
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
			img.src = `/image/character/${c.charId}.jpg`;
			img.alt = c.name;
			img.onerror = function () {
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
			const tupoText = c.tupolevel ? `+${c.tupolevel}` : ''
			nameEl.textContent = c.name + tupoText;
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
				// 非主角角色：拦截会导致超过主角等级的素材选择
				if (!c.selected && targetCharId !== 'zhujue') {
					const _mainInst = getMainCharacterInstance();
					const _mainLevel = _mainInst ? (_mainInst.level || 1) : 1;
					const _curTotal = consumables.filter(x => x.selected).reduce((s, x) => s + x.level, 0);
					if (currentLevel + _curTotal + c.level > _mainLevel) {
						Game.toast(`该素材会使等级超过主角（Lv.${_mainLevel}），无法选择`, 'warning');
						return;
					}
				}
				c.selected = !c.selected;
				renderConsumableList();
				updateInfoBar();
			};

			listContainer.appendChild(row);
		});
	}

	// 计算从 currentLevel 升到 newLevel 所需的总金币
	function calcUpgradeGoldCost(fromLevel, toLevel) {
		let cost = 0;
		for (let lv = fromLevel + 1; lv <= toLevel; lv++) {
			cost += getLevelUpGoldCost(lv);
		}
		return cost;
	}

	function updateInfoBar() {
		const selected = consumables.filter(c => c.selected);
		const totalLevel = selected.reduce((s, c) => s + c.level, 0);
		const countLabel = document.getElementById('upgrade-count-label');
		const confirmBtn = document.getElementById('upgrade-confirm-btn');
		const newLevel = currentLevel + totalLevel;
		// 非主角角色：提示不得超过主角等级
		let overHint = '';
		let overColor = '';
		if (targetCharId !== 'zhujue') {
			const _mainInst = getMainCharacterInstance();
			const _mainLevel = _mainInst ? (_mainInst.level || 1) : 1;
			if (newLevel > _mainLevel) {
				overHint = `（不可超过主角 Lv.${_mainLevel}，将限至 Lv.${_mainLevel}）`;
				overColor = '#ff6b6b';
			}
		}
		if (countLabel) {
			if (totalLevel > 0) {
				const goldCost = calcUpgradeGoldCost(currentLevel, newLevel);
				const enough = (window.gameGold || 0) >= goldCost;
				countLabel.textContent = `已选: ${totalLevel} 将升至 ${newLevel}级 · 金币: ${goldCost}` +
					(enough ? '' : `（不足，差 ${goldCost - (window.gameGold || 0)}）`) + overHint;
				countLabel.style.color = overColor || (enough ? '' : '#ff6b6b');
			} else {
				countLabel.textContent = '已选: 0 将升至' + currentLevel + '级' + overHint;
				countLabel.style.color = overColor;
			}
		}
		if (confirmBtn) {
			confirmBtn.disabled = !totalLevel;
			confirmBtn.style.opacity = !totalLevel ? '0.5' : '1';
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
		Game.toast('无法找到该角色实例', 'error');
	}
}


/**
 * 获取角色当前品质的标签
 * @param {string} rank - 内部品质标识
 */
function getRankLabel(rank) {
	// const map = {
	//	 'junk': '平凡',
	//	 'common': '普通',
	//	 'rare': '稀有(紫)',
	//	 'epicfake': '伪史诗(橙)',
	//	 'epic': '真史诗(橙)', // 注意：您描述中橙色分伪史诗和真史诗，这里需区分颜色或名称
	//	 'legend': '传说(红)',
	//	 'kami': '神品(金)'
	// };
	const map = {
		'junk': '平凡',
		'common': '精品',
		'rare': '稀有',
		'epicfake': '伪史诗',
		'epic': '真史诗', // 注意：您描述中橙色分伪史诗和真史诗，这里需区分颜色或名称
		'legend': '传说',
		'kami': '神品'
	};
	return map[rank] || rank;
}

/**
 * 获取突破消耗信息（不再涉及升阶判断）
 * @param {Object} character - 角色对象
 * @param {number} currentBreakthrough - 当前突破等级
 * @returns {Object} { cost: number, maxed: boolean }
 */
function getBreakthroughInfo(character, currentBreakthrough) {
	const tupoxxxx = character.tupolevel || currentBreakthrough || 0;

	// 如果已满级
	if (tupoxxxx >= 20) {
		return { cost: 0, maxed: true };
	}

	// 突破消耗：每4阶增加1个材料
	const cost = Math.floor(tupoxxxx / 4) + 1;

	return {
		cost: character.charId === 'zhujue' ? 0 : cost,
		maxed: false
	};
}

/**
 * 突破等级门槛：突破到目标阶数（1..20）必须先达到的等级
 * 索引即目标突破阶（1-based）：突破到 1 阶需 0 级，2 阶需 10 级……20 阶需 100 级
 */
const BREAKTHROUGH_LEVEL_REQ = [
	0,   // 1 阶
	10,  // 2 阶
	20,  // 3 阶
	30,  // 4 阶
	35,  // 5 阶
	40,  // 6 阶
	45,  // 7 阶
	50,  // 8 阶
	55,  // 9 阶
	60,  // 10 阶
	65,  // 11 阶
	69,  // 12 阶
	73,  // 13 阶
	77,  // 14 阶
	81,  // 15 阶
	84,  // 16 阶
	87,  // 17 阶
	90,  // 18 阶
	95,  // 19 阶
	100  // 20 阶
];

// 获取"突破到目标阶"所需的最低等级（目标阶从 1 开始）
function getBreakthroughRequiredLevel(targetTupoLevel) {
	const idx = targetTupoLevel - 1;
	if (idx < 0 || idx >= BREAKTHROUGH_LEVEL_REQ.length) return 100;
	return BREAKTHROUGH_LEVEL_REQ[idx];
}

/**
 * 升级金币消耗（升级到 level 这一级所需的金币）
 * 设计：前期低、后期高。以二次曲线为主，叠加线性项，保证单调递增。
 *   花费 = floor(10 * level + 0.6 * level^2)
 *   Lv.1→ 约 11，Lv.10 → 160，Lv.50 → 2050，Lv.100 → 6100（单级）
 */
function getLevelUpGoldCost(level) {
	const lv = Math.max(1, Math.floor(level));
	return Math.floor(10 * lv + 0.6 * lv * lv);
}


/**
 * 获取角色当前四维属性
 * 根据：初始品质 + 突破阶数带来的成长 + 当前品质系数
 */
function getCharacterStats(character, breakthroughLevel) {
	// 1. 确定当前有效品质 (Effective Rank)
	let effectiveRank = character.initialRank;
	if (breakthroughLevel >= 17) effectiveRank = 'kami';
	else if (breakthroughLevel >= 13) effectiveRank = 'legend';
	else if (breakthroughLevel >= 9) effectiveRank = 'epic'; // 真史诗
	else if (breakthroughLevel >= 5) effectiveRank = 'epicfake'; // 伪史诗
	// 否则保持 initialRank (如果是 rare 或更低)

	// 2. 获取基础模板
	const baseStats = characterTemplate[character.template][effectiveRank];

	if (!baseStats) {
		console.error(`Missing template for ${character.template} - ${effectiveRank}`);
		return { hp: 100, atk: 10, def: 10, spe: 10 };
	}

	// 3. 计算成长 (简单线性成长示例，可根据公式调整)
	// 每突破一阶，属性提升一定百分比，或者固定值
	const growthFactor = 1 + (breakthroughLevel * 0.05); // 每阶提升5%

	return {
		hp: Math.floor(baseStats.hp * growthFactor),
		atk: Math.floor(baseStats.atk * growthFactor),
		def: Math.floor(baseStats.def * growthFactor),
		spe: Math.floor(baseStats.spe * growthFactor) // 速度通常成长较低或固定
	};
}

/**
 * 【核心编译函数】根据模板和品质初始化角色属性
 * @param {Object} charObj - characterList 中的角色原始数据对象
 * @returns {Object} 包含 hp, atk, def, spe 的对象
 */
function compileCharacterStats(charObj) {
	if (!charObj) return { hp: 100, atk: 10, def: 10, spe: 10 };

	// 1. 确定模板类型 (damger, defense, balanced)，默认为 balanced
	const templateType = charObj.template || 'balanced';

	// 2. 确定品质 (legend, epic, epicfake, rare...)，默认为 common
	const rank = charObj.rank || 'common';

	// 3. 从 characterTemplate 中查找数值
	// 注意：确保 characterTemplate 在当前作用域可见，如果是在另一个文件，可能需要 characterTemplate
	const templateData = characterTemplate || characterTemplate;

	let base = { hp: 500, atk: 50, def: 50, spe: 50 };

	if (templateData && templateData[templateType] && templateData[templateType][rank]) {
		base = { ...templateData[templateType][rank] };
	}

	// ===== 【新增】战斗属性 =====
	return {
		...base,
		// 战斗概率属性
		mingzhong: 10000,		// 命中
		shanbi: 0,		  // 闪避
		baoji: 0,		   // 暴击
		kangbao: 0,	 // 抗暴
		baoshang: 0,	// 暴伤
		shouhu: 0,	  // 守护
		poji: 0,		 // 破击
		gedang: 0,		  // 格挡

		// 增伤/减伤
		fixedDealUp: 0,	 // 固定增伤
		fixedTakeDn: 0,   // 固定减伤
		pctDealUp: 0,	   // 百分比增伤
		pctTakeDn: 0,	 // 百分比减伤

		// 治疗相关
		fixedHeal: 0,	  // 固定治疗量
		fixedBeHeal: 0,	// 固定被治疗量
		pctHeal: 0,		// 百分比治疗量
		pctBeHeal: 0,	  // 百分比被治疗量
	};
}

/**
 * 【辅助函数】获取技能详细数据
 * @param {string} skillId - 技能ID (如 'attack1', 'recover_skill2')
 * @returns {Object|null} 技能数据对象
 */
function getSkillData(skillId) {
	if (!skillId) return null;

	// 依次在 pugong, skill, spskill 中查找
	const content = contentList || contentList;
	if (!content) return null;

	if (content.pugong[skillId]) return { ...content.pugong[skillId], type: 'pugong' };
	if (content.skill[skillId]) return { ...content.skill[skillId], type: 'skill' };
	if (content.spskill[skillId]) return { ...content.spskill[skillId], type: 'spskill' };

	console.warn(`[技能编译] 未找到技能ID: ${skillId}`);
	return null;
}

function mergeNoOverwrite(a, b) {
	for (const key of Object.keys(b)) {
		if (!(key in a)) {	// 仅在 a 中没有此键时添加
			a[key] = b[key];
		}
	}
	return a;
}


/**
 * 提升主角等级（每通过一个主线章节调用一次）
 */
function levelUpMainCharacter() {
	const mainChar = getMainCharacterInstance();
	if (!mainChar) {
		Game.toast('未找到主角', 'error');
		return;
	}

	const instData = mainChar;
	const baseChar = characterList['zhujue'];

	if (!baseChar || !instData) return;

	// 2. 提升等级
	// 主角（zhujue）通过首通副本等方式升级属于奖励性质，不消耗金币；
	// 其余角色走培养（showUpgradePanel 等）才消耗金币。
	const oldLevel = instData.level || 1;
	const newLevel = oldLevel + 1;
	const isMainChar = (instData.charId || 'zhujue') === 'zhujue';
	if (!isMainChar) {
		const goldCost = getLevelUpGoldCost(newLevel);
		if ((window.gameGold || 0) < goldCost) {
			Game.toast(`升级到 Lv.${newLevel} 需要 ${goldCost} 金币（当前 ${window.gameGold || 0}）`, 'error');
			return;
		}
		window.gameGold -= goldCost;
		updateResourceHUD();
	}
	instData.level = newLevel;

	// 3. 重新计算属性
	// 优先使用 updateCharacterSP (如果它存在且能处理 level)
	if (typeof updateCharacterSP === 'function') {
		// 确保基础字段存在
		instData.rank = instData.rank || baseChar.rank;
		instData.template = instData.template || baseChar.template;

		const updatedStats = updateCharacterSP(instData);
		if (updatedStats) {
			instData.hp = updatedStats.hp;
			instData.atk = updatedStats.atk;
			instData.def = updatedStats.def;
			instData.spe = updatedStats.spe;
			instData.maxHp = updatedStats.hp;
			instData.currentHp = updatedStats.hp; // 升级回满血
			if (updatedStats.openSpskill !== undefined) {
				instData.openSpskill = updatedStats.openSpskill;
			}
		}
	} else {
		// 备用方案：简单线性成长
		const growthRate = 0.1;
		instData.hp = Math.floor((instData.hp || baseChar.hp) * (1 + growthRate));
		instData.atk = Math.floor((instData.atk || baseChar.atk) * (1 + growthRate));
		instData.def = Math.floor((instData.def || baseChar.def) * (1 + growthRate));
		instData.spe = Math.floor((instData.spe || baseChar.spe) * (1 + growthRate));
		instData.maxHp = instData.hp;
		instData.currentHp = instData.hp;
	}

	console.log(`主角升级！当前等级: ${instData.level}`);
	Game.toast(`主角升至 Lv.${instData.level}！`, 'success');

	// 4. 刷新界面
	refreshAllTeamSlots();

	// 5. 自动保存
	// SaveManager.autoSave();
}

/**
 * 提升指定角色实例的等级并更新属性
 * @param {string} instanceId - 角色实例ID (window.charBagData 的键)
 * @param {number} levelsToAdd - 要提升的等级数量，默认为 1
 * @returns {boolean} - 是否升级成功
 */
function upgradeCharacterInstance(instanceId, levelsToAdd = 1) {
	// 1. 基础校验
	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		console.warn(`[升级失败] 无效的实例ID: ${instanceId}`);
		return false;
	}

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList[charId];

	if (!baseChar) {
		console.warn(`[升级失败] 未找到基础角色数据: ${charId}`);
		return false;
	}

	// 2. 提升等级（逐级消耗金币，升级到每一级都需支付该级费用）
	const oldLevel = instData.level || 1;
	const MAX_LEVEL = 100;
	let actualNewLevel = oldLevel;
	let totalGoldCost = 0;
	for (let i = 1; i <= levelsToAdd; i++) {
		const targetLv = oldLevel + i;
		if (targetLv > MAX_LEVEL) {
			Game.toast(`角色已达到最高等级 ${MAX_LEVEL}`, 'warning');
			break;
		}
		const stepCost = getLevelUpGoldCost(targetLv);
		if ((window.gameGold || 0) < totalGoldCost + stepCost) {
			Game.toast(`金币不足，无法升至 Lv.${targetLv}（需 ${stepCost} 金币/级）`, 'error');
			break;
		}
		totalGoldCost += stepCost;
		actualNewLevel = targetLv;
	}
	if (actualNewLevel === oldLevel) {
		// 一级都没升（金币不足或已满级）
		return false;
	}
	window.gameGold = (window.gameGold || 0) - totalGoldCost;
	updateResourceHUD();
	instData.level = actualNewLevel;

	// 3. 重新计算属性
	// updateCharacterSP 会根据 instData 中的 level, rank, template 等字段重新计算 hp, atk, def, spe
	if (typeof updateCharacterSP === 'function') {
		updateCharacterSP(instData);
		const updatedStats = updateCharacterSP(instData);
		if (updatedStats && updatedStats.openSpskill !== undefined) {
			instData.openSpskill = updatedStats.openSpskill;
		}
	} else {
		console.error('[升级警告] updateCharacterSP 函数未定义，属性未更新');
		// 如果 updateCharacterSP 不存在，可能需要手动计算或报错
		return false;
	}

	// 4. 处理当前血量 (可选策略)
	// 策略 A: 升级后回满血
	// instData.currentHp = instData.hp;

	// 策略 B: 保持血量百分比 (推荐)
	if (instData.maxHp && instData.maxHp > 0 && instData.hp > 0) {
		// 注意：updateCharacterSP 通常会更新 instData.hp 作为 maxHp
		// 假设 updateCharacterSP 更新的是 instData.hp (即最大血量)
		// 我们需要根据旧的最大血量比例来设置新的当前血量
		// 但由于 updateCharacterSP 直接修改了 instData.hp，我们需要在调用前保存旧的最大血量，或者假设 currentHp 不应超过新的 maxHp

		// 简单处理：如果当前血量超过了新的最大血量，则修正为最大血量
		// 如果希望保持比例，需要在调用 updateCharacterSP 之前记录 oldMaxHp
		if (instData.currentHp > instData.hp) {
			instData.currentHp = instData.hp;
		}
	} else {
		// 如果没有 currentHp 字段，初始化它
		if (instData.currentHp === undefined) {
			instData.currentHp = instData.hp;
		}
	}

	// 5. 同步 maxHp 字段 (如果游戏逻辑依赖 maxHp)
	instData.maxHp = instData.hp;

	console.log(`[升级成功] 实例 ${instanceId} (${baseChar.name}) 等级: ${oldLevel} -> ${newLevel}`);
	return true;
}

/**
 * 角色实例突破函数（只提升突破等级，不处理升阶）
 * @param {string} targetInstId - 要突破的目标角色实例ID
 * @returns {Object} { success: boolean, message: string }
 */
function breakthroughCharacterInstance(targetInstId) {
	// 1. 基础校验
	if (!targetInstId || !window.charBagData || !window.charBagData[targetInstId]) {
		return { success: false, message: '无效的目标实例' };
	}

	const targetInst = window.charBagData[targetInstId];
	const charId = targetInst.charId || targetInstId;
	const baseChar = characterList[charId];

	if (!baseChar) {
		return { success: false, message: '未找到角色基础数据' };
	}

	// 获取当前突破阶数，默认为 0
	const currentTupoLevel = targetInst.tupolevel || 0;

	// 检查是否已满级
	if (currentTupoLevel >= 20) {
		return { success: false, message: '角色已达到最大突破阶数（20阶）' };
	}

	// 突破等级门槛：突破到 currentTupoLevel+1 阶需先达到指定等级
	// 主角（zhujue）通过副本首通获得突破属于奖励性质，豁免等级限制
	const isMainChar = charId === 'zhujue';
	const reqLevel = getBreakthroughRequiredLevel(currentTupoLevel + 1);
	const curLevel = targetInst.level || 1;
	if (!isMainChar && curLevel < reqLevel) {
		return {
			success: false,
			message: `突破到 ${currentTupoLevel + 1} 阶需要角色先达到 Lv.${reqLevel}（当前 Lv.${curLevel}）`
		};
	}

	// 计算突破消耗（只消耗同名角色，不涉及升阶）
	const cost = targetInst.charId === 'zhujue' ? 0 : (Math.floor(currentTupoLevel / 4) + 1);

	// 资源校验
	const allInstIds = Object.keys(window.charBagData);
	const fodderCandidates = allInstIds.filter(id => {
		if (id === targetInstId) return false;
		const inst = window.charBagData[id];
		return inst && (inst.charId === charId || id === charId);
	});

	if (fodderCandidates.length < cost) {
		return {
			success: false,
			message: `突破需要 ${cost} 个同名角色作为材料，当前可用: ${fodderCandidates.length}`
		};
	}

	// 执行消耗：移除作为材料的实例
	for (let i = 0; i < cost; i++) {
		const fodderId = fodderCandidates[i];
		if (window.currentTeam && window.currentTeam.includes(fodderId)) {
			window.currentTeam = window.currentTeam.filter(id => id !== fodderId);
		}
		delete window.charBagData[fodderId];
		if (window.treasureEquipData && window.treasureEquipData[fodderId]) {
			delete window.treasureEquipData[fodderId];
		}
	}

	// 提升突破阶数
	targetInst.tupolevel = currentTupoLevel + 1;

	// 重新计算属性
	if (typeof updateCharacterSP === 'function') {
		updateCharacterSP(targetInst);
		const updatedStats = updateCharacterSP(targetInst);
		if (updatedStats && updatedStats.openSpskill !== undefined) {
			targetInst.openSpskill = updatedStats.openSpskill;
		}
	}

	SaveManager.autoSave();
	// 如果有待刷新的标记，执行刷新
	// if (window._pendingRefreshAfterBreakthrough) {
	// 	const pending = window._pendingRefreshAfterBreakthrough;

	// 	// 刷新角色详情弹窗
	// 	if (pending.parentDialog) {
	// 		refreshCharDetailPopupContent(pending.instanceId, pending.parentDialog);
	// 	}

	// 	// 刷新阵容显示
	// 	refreshTeamViewDisplay();

	// 	// 刷新背包视图（如果打开）
	// 	const bagView = document.getElementById('bag-view');
	// 	if (bagView && bagView.style.display !== 'none') {
	// 		renderBagView(bagView);
	// 	}

	// }
	// // 在 breakthroughCharacterInstance 函数的 return 之前，添加：
	// // 强制刷新所有打开的界面
	// if (typeof refreshTeamViewDisplay === 'function') {
	// 	refreshTeamViewDisplay();
	// }

	// // 尝试刷新背包视图
	// try {
	// 	const bagView = document.getElementById('bag-view');
	// 	if (bagView && bagView.style.display !== 'none') {
	// 		renderBagView(bagView);
	// 	}
	// } catch (e) { }
	// Game.UI.refresh({
	// 	instanceId: targetInstId,
	// 	dialog: window._pendingRefreshAfterBreakthrough?.parentDialog || null
	// });
	return {
		success: true,
		message: `突破成功！当前阶数: ${targetInst.tupolevel}`,
		newTupoLevel: targetInst.tupolevel
	};
}


/**
 * 检查角色在当前突破等级下是否需要升阶
 * @param {number} tupolevel - 当前突破等级
 * @param {string} currentRank - 当前品质
 * @returns {Object|null} 如果需要升阶，返回目标品质和升阶消耗；否则返回 null
 */
function getPromotionInfo(tupolevel, currentRank) {
	const rankList = ['junk', 'common', 'rare', 'epicfake', 'epic', 'legend', 'kami'];
	const currentRankIndex = rankList.indexOf(currentRank);

	// 定义各阶数对应的目标品质
	const promotionMap = {
		2: 'rare',
		4: 'epicfake',
		8: 'epic',
		12: 'legend',
		16: 'kami'
	};

	const targetRank = promotionMap[tupolevel];
	if (!targetRank) return null;

	const targetRankIndex = rankList.indexOf(targetRank);
	if (currentRankIndex >= targetRankIndex) return null; // 品质已经足够，不需要升阶

	return {
		targetRank: targetRank,
		cost: Math.floor(tupolevel / 4) + 1, // 升阶消耗：根据阶数递增
		stoneCost: 1 // 突破石消耗（可按需调整）
	};
}

/**
 * 角色升阶函数（只改变品质，不改变突破等级）
 * @param {string} targetInstId - 目标角色实例ID
 * @returns {Object} { success: boolean, message: string }
 */
function promoteCharacterRank(targetInstId) {
	if (!targetInstId || !window.charBagData || !window.charBagData[targetInstId]) {
		return { success: false, message: '无效的目标实例' };
	}

	const targetInst = window.charBagData[targetInstId];
	const charId = targetInst.charId || targetInstId;
	const baseChar = characterList[charId];

	if (!baseChar) {
		return { success: false, message: '未找到角色基础数据' };
	}

	const currentTupoLevel = targetInst.tupolevel || 0;
	const currentRank = targetInst.rank || baseChar.rank || 'common';

	// 获取升阶信息
	const promotionInfo = getPromotionInfo(currentTupoLevel, currentRank);
	if (!promotionInfo) {
		return { success: false, message: '当前突破等级无需升阶或已达到最高品质' };
	}

	// 校验资源：突破石
	const hasStone = (window.gameItems && window.gameItems['breakthrough_stone'])
		? window.gameItems['breakthrough_stone'] >= (promotionInfo.stoneCost || 0)
		: true; // 如果没有道具系统，默认true

	if (!hasStone) {
		return { success: false, message: `升阶需要 ${promotionInfo.stoneCost} 个【突破石】，材料不足！` };
	}

	// 扣除突破石
	if (window.gameItems && window.gameItems['breakthrough_stone']) {
		window.gameItems['breakthrough_stone'] -= promotionInfo.stoneCost || 0;
	}

	// 改变品质
	targetInst.rank = promotionInfo.targetRank;

	// 重新计算属性
	if (typeof updateCharacterSP === 'function') {
		updateCharacterSP(targetInst);
		const updatedStats = updateCharacterSP(targetInst);
		if (updatedStats && updatedStats.openSpskill !== undefined) {
			targetInst.openSpskill = updatedStats.openSpskill;
		}
	}

	SaveManager.autoSave();
	// 原有的 SaveManager.autoSave(); 之后添加：
	Game.UI.refresh({
		instanceId: targetInstId,
		dialog: window._pendingRefreshAfterBreakthrough?.parentDialog || null
	});

	return {
		success: true,
		message: `升阶成功！品质提升至【${getRankLabel(promotionInfo.targetRank)}】`,
		targetRank: promotionInfo.targetRank
	};

}

/**
 * 主角突破函数（提升突破等级到指定阶数）
 * @param {number} targetTupoLevel - 目标突破等级，如果低于当前等级则不执行
 */
function breakthroughMainCharacter(targetTupoLevel) {
	const mainCharId = 'zhujue';
	if (!window.charBagData) return false;

	// 1. 找到主角的 Instance ID
	const mainInstId = Object.keys(window.charBagData).find(id =>
		window.charBagData[id].charId === mainCharId
	);

	if (!mainInstId) {
		console.warn('未找到主角实例，无法突破');
		return false;
	}

	const instData = window.charBagData[mainInstId];
	const currentTupoLevel = instData.tupolevel || 0;

	// 2. 参数校验：如果目标等级低于或等于当前等级，则不执行
	if (targetTupoLevel !== undefined && targetTupoLevel !== null) {
		if (targetTupoLevel <= currentTupoLevel) {
			console.log(`主角当前突破等级(${currentTupoLevel})已达到或超过目标(${targetTupoLevel})，无需突破`);
			return true; // 返回 true 表示无需操作但未出错
		}
		if (targetTupoLevel > 20) {
			console.warn('目标突破等级不能超过20');
			Game.toast('目标突破等级不能超过20', 'warning');
			return false;
		}
	}

	// 3. 计算需要突破的次数
	let breakCount = 0;
	if (targetTupoLevel !== undefined && targetTupoLevel !== null) {
		breakCount = targetTupoLevel - currentTupoLevel;
	} else {
		breakCount = 1; // 默认突破1次
	}

	// 4. 执行多次突破
	for (let i = 0; i < breakCount; i++) {
		const result = breakthroughCharacterInstance(mainInstId);
		if (!result.success) {
			console.warn(`主角第${i + 1}次突破失败:`, result.message);
			return false;
		}
	}

	// 5. 更新属性
	const baseChar = characterList[mainCharId];
	if (!baseChar || !instData) return false;

	if (typeof updateCharacterSP === 'function') {
		instData.rank = instData.rank || baseChar.rank;
		instData.template = instData.template || baseChar.template;

		const updatedStats = updateCharacterSP(instData);
		if (updatedStats) {
			instData.hp = updatedStats.hp;
			instData.atk = updatedStats.atk;
			instData.def = updatedStats.def;
			instData.spe = updatedStats.spe;
			instData.maxHp = updatedStats.hp;
			instData.currentHp = updatedStats.hp;
			if (updatedStats.openSpskill !== undefined) {
				instData.openSpskill = updatedStats.openSpskill;
			}
		}
	} else {
		// 备用方案
		const growthRate = 0.1;
		instData.hp = Math.floor((instData.hp || baseChar.hp) * (1 + growthRate * breakCount));
		instData.atk = Math.floor((instData.atk || baseChar.atk) * (1 + growthRate * breakCount));
		instData.def = Math.floor((instData.def || baseChar.def) * (1 + growthRate * breakCount));
		instData.spe = Math.floor((instData.spe || baseChar.spe) * (1 + growthRate * breakCount));
		instData.maxHp = instData.hp;
		instData.currentHp = instData.hp;
	}

	// 6. 刷新界面
	refreshAllTeamSlots();

	// 7. 自动保存
	// SaveManager.autoSave();

	console.log(`主角突破成功！从 ${currentTupoLevel} 阶突破至 ${instData.tupolevel || currentTupoLevel + breakCount} 阶`);
	return true;
}


/**
 * 主角升阶函数（提升品质到指定品质）
 * @param {string} targetRank - 目标品质，如果当前品质已达到或超过则不执行
 *							可选值: 'common', 'rare', 'epicfake', 'epic', 'legend', 'kami'
 */
function promoteMainCharacter(targetRank) {
	const mainCharId = 'zhujue';
	if (!window.charBagData) return false;

	// 1. 找到主角的 Instance ID
	const mainInstId = Object.keys(window.charBagData).find(id =>
		window.charBagData[id].charId === mainCharId
	);

	if (!mainInstId) {
		console.warn('未找到主角实例，无法升阶');
		return false;
	}

	const instData = window.charBagData[mainInstId];
	const currentRank = instData.rank || 'common';

	// 2. 品质排序表
	const rankOrder = ['junk', 'common', 'rare', 'epicfake', 'epic', 'legend', 'kami'];
	const currentRankIndex = rankOrder.indexOf(currentRank);

	// 3. 参数校验
	if (targetRank) {
		const targetRankIndex = rankOrder.indexOf(targetRank);
		if (targetRankIndex === -1) {
			console.warn(`无效的目标品质: ${targetRank}`);
			Game.toast(`无效的目标品质: ${targetRank}`, 'error');
			return false;
		}

		// 如果目标品质低于或等于当前品质，则不执行
		if (targetRankIndex <= currentRankIndex) {
			console.log(`主角当前品质(${getRankLabel(currentRank)})已达到或超过目标(${getRankLabel(targetRank)})，无需升阶`);
			return true; // 返回 true 表示无需操作但未出错
		}
	}

	// 4. 获取当前突破等级，检查升阶条件
	const currentTupoLevel = instData.tupolevel || 0;

	// 5. 如果指定了目标品质，可能需要多次升阶
	// 从当前品质开始，逐级提升到目标品质
	let currentEffectiveRank = currentRank;
	let promoted = false;

	while (true) {
		// 检查当前是否可以升阶
		const promotionInfo = getPromotionInfo(currentTupoLevel, currentEffectiveRank);
		if (!promotionInfo) {
			// 无法继续升阶（可能突破等级不够）
			break;
		}

		// 如果指定了目标品质，检查是否已达到或超过
		if (targetRank) {
			const effectiveRankIndex = rankOrder.indexOf(promotionInfo.targetRank);
			const targetRankIndex = rankOrder.indexOf(targetRank);
			if (effectiveRankIndex > targetRankIndex) {
				// 已经达到或超过目标品质
				break;
			}
		}

		// 执行升阶
		const result = promoteCharacterRank(mainInstId);
		if (!result.success) {
			console.warn('主角升阶失败:', result.message);
			break;
		}

		currentEffectiveRank = result.targetRank || currentEffectiveRank;
		promoted = true;
	}

	if (!promoted) {
		console.log('主角无需升阶或升阶条件不满足');
		return false;
	}

	// 6. 更新属性
	const baseChar = characterList[mainCharId];
	if (!baseChar || !instData) return true;

	if (typeof updateCharacterSP === 'function') {
		instData.rank = instData.rank || baseChar.rank;
		instData.template = instData.template || baseChar.template;

		const updatedStats = updateCharacterSP(instData);
		if (updatedStats) {
			instData.hp = updatedStats.hp;
			instData.atk = updatedStats.atk;
			instData.def = updatedStats.def;
			instData.spe = updatedStats.spe;
			instData.maxHp = updatedStats.hp;
			instData.currentHp = updatedStats.hp;
		}
	} else {
		const growthRate = 0.1;
		instData.hp = Math.floor((instData.hp || baseChar.hp) * (1 + growthRate));
		instData.atk = Math.floor((instData.atk || baseChar.atk) * (1 + growthRate));
		instData.def = Math.floor((instData.def || baseChar.def) * (1 + growthRate));
		instData.spe = Math.floor((instData.spe || baseChar.spe) * (1 + growthRate));
		instData.maxHp = instData.hp;
		instData.currentHp = instData.hp;
	}

	// 7. 刷新界面
	refreshAllTeamSlots();

	// 8. 自动保存
	// SaveManager.autoSave();

	console.log(`主角升阶成功！当前品质: ${getRankLabel(instData.rank)}`);
	return true;
}


/**
 * 获取主角的完整实例对象
 * @returns {Object|null} 主角的实例数据对象，如果未找到则返回 null
 */
function getMainCharacterInstance() {
	if (!window.charBagData) return null;

	// 方法1: 如果主角一定在队伍中，可以通过 getMainCharacterSlotIndex 快速定位
	// 但为了健壮性（防止主角不在队伍中但仍存在于背包），建议直接遍历 charBagData

	const mainCharId = 'zhujue'; // 确保与 initNewGame 中的定义一致

	// 查找 charId 为 'zhujue' 的实例 ID
	const mainInstId = Object.keys(window.charBagData).find(instId => {
		const inst = window.charBagData[instId];
		return inst && inst.charId === mainCharId;
	});

	if (mainInstId && window.charBagData[mainInstId]) {
		return window.charBagData[mainInstId];
	}

	return null;
}

/**
 * 【便捷函数】获取主角的基础定义数据 (characterList 中的静态数据)
 * @returns {Object|null} 主角的基础配置对象
 */
function getMainCharacterBaseData() {
	const mainCharId = 'zhujue';
	if (characterList && characterList[mainCharId]) {
		return characterList[mainCharId];
	}
	return null;
}

/**
 * 【便捷函数】获取主角当前的综合数据 (合并基础定义和实例存档)
 * @returns {Object|null} 合并后的主角数据
 */
function getMainCharacterFullData() {
	const instData = getMainCharacterInstance();
	const baseData = getMainCharacterBaseData();

	if (!instData || !baseData) return null;

	// 合并数据，实例数据优先（因为包含等级、突破等动态变化）
	return {
		...baseData,
		...instData,
		instanceId: Object.keys(window.charBagData).find(id => window.charBagData[id] === instData) // 附加 instanceId
	};
}

/**
 * 同步指定角色实例的突破列表数据
 * @param {string} instanceId - 角色实例ID
 * @returns {boolean} - 是否成功同步
 */
function syncInstanceTupoList(instanceId) {
	// 1. 校验输入和全局数据
	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		console.warn(`[同步突破] 实例 ${instanceId} 不存在`);
		return false;
	}

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;

	// 2. 从角色库获取最新定义
	const baseChar = characterList[charId];
	if (!baseChar) {
		console.warn(`[同步突破] 角色库中找不到基础角色 ${charId}`);
		return false;
	}

	// 3. 获取最新的突破列表
	// 假设突破列表存储在 baseChar.tupoList 中
	// 如果角色库中没有定义 tupoList，则使用空数组或默认模板
	const newTupoList = baseChar.tupoList || [];

	// 4. 判断是否需要更新
	// 如果实例中完全没有 tupoList，或者我们强制每次进入战斗前都刷新（防止角色库修改后存档没变）
	// 这里建议：只要角色库有定义，就覆盖存档中的旧定义，确保逻辑一致
	if (newTupoList.length > 0) {
		// 【关键】浅拷贝数组即可。注意：内联突破对象含 content/filter 函数，
		// JSON 深拷贝会丢失函数导致 skill_effect 类突破失效，故用 slice 保留元素引用（函数不丢）
		// 重建突破列表，但保留实例已吸收的宝物槽（以 _absorbedTreasure 标记），
		// 避免被角色库模板覆盖，从而让吸收数据随实例持久化
		// 重建突破列表，但保留实例已吸收的宝物槽（含超出模板长度、以「追加」方式吸收的槽），
		// 避免被角色库模板覆盖，从而让吸收数据随实例持久化
		const oldTupoList = instData.tupoList || [];
		const rebuilt = newTupoList.slice();
		oldTupoList.forEach((old, i) => {
			if (old && old._absorbedTreasure) rebuilt[i] = old; // 覆盖模板槽，或扩展到追加槽
		});
		instData.tupoList = rebuilt;

		// 如果实例中没有记录当前突破等级，初始化为 0
		if (instData.tupolevel === undefined || instData.tupolevel === null) {
			instData.tupolevel = 0;
		}

		// 确保突破等级不超过列表长度-1
		if (instData.tupolevel >= newTupoList.length + 1) {
			instData.tupolevel = newTupoList.length;
		}

		console.log(`[同步突破] 角色 ${baseChar.name} (${instanceId}) 已同步最新突破列表，共 ${newTupoList.length} 阶`);
		return true;
	} else {
		// 如果新定义也没有突破列表，清空旧的，避免报错
		instData.tupoList = [];
		return true;
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

/**
 * 批量同步当前队伍中所有角色的突破列表
 * 建议在进入战斗前、打开角色详情时调用
 */
function syncTeamTupoLists() {
	if (!window.currentTeam) return;

	let syncedCount = 0;
	window.currentTeam.forEach(instId => {
		if (instId && window.charBagData[instId]) {
			if (syncInstanceTupoList(instId)) {
				syncedCount++;
			}
		}
	});

	if (syncedCount > 0) {
		console.log(`[同步突破] 共同步了 ${syncedCount} 个队伍角色的突破数据`);
		// 可选：自动保存
		// SaveManager.autoSave(); 
	}
}








// 暴露给 battle_refactored.js 等外部模块（通过 shared 避免循环import）
shared.hideOtherViews = hideOtherViews;
shared.renderDungeonView = renderDungeonView;

// system.js 需要调用的 mode.js 函数
shared.SaveManager = SaveManager;
shared.renderTeamView = renderTeamView;
shared.renderBagView = renderBagView;
shared.renderShopView = renderShopView;
shared.updateBagCharDetailBar = updateBagCharDetailBar;
shared.refreshCharDetailPopupContent = refreshCharDetailPopupContent;
shared.refreshBreakthroughPopupContent = refreshBreakthroughPopupContent;

// 暴露给 item.js 等模块使用的全局函数
window.grantCharacter = grantCharacter;
window.renderBagView = renderBagView;
window.ensureResourceHUD = ensureResourceHUD;
window.updateResourceHUD = updateResourceHUD;
Game.SaveManager = SaveManager;

// 导出本模块定义的函数（供其他模块 import）
export { showteam, renderTeamView, showCharacterDetailPopup, showBreakthroughPreviewPopup, refreshBreakthroughPopupContent, isNoEffectBreakthrough, TREASURE_TYPE_TRIGGER_MAP, makeTreasureCtx, compileTreasureToBreakthroughEntries, canAbsorbTreasure, absorbTreasureIntoSlot, removeAbsorbedTreasureFromSlot, openTreasureAbsorbPicker, renderBreakthroughList, renderBreakthroughActions, showBreakthroughPreviewPopupByCharId, showBreakthroughPreviewView, createBreakthroughPreviewDOM, renderBreakthroughContent, renderTeamSlot, refreshTeamSlot, refreshAllTeamSlots, refreshCharDetailPopupContent, refreshTeamViewDisplay, onTeamSlotClick, onTeamNavChange, onTeamNavTrain, showTeamCharInfo, showTreasureSelectPopup, refreshTreasureUI, syncTreasureEquipData, highlightTeamSlot, _dragSourceIndex, swapTeamSlots, _clearDragStyles, onSlotDragStart, onSlotDragOver, onSlotDragEnter, onSlotDragLeave, onSlotDrop, onSlotDragEnd, _touchDragEl, _touchSourceSlot, _touchSourceIndex, _touchStartX, _touchStartY, _touchDragging, _touchCurrentTarget, _TOUCH_DRAG_THRESHOLD, _createTouchGhost, onSlotTouchStart, onSlotTouchMove, onSlotTouchEnd, showCharDetailPopup, showCharSelectPopup, showBagCharDetailPopup, needUpgrade, buildSkillSection, showBreakthroughPreviewPopupWithCallback, updateCharacterSP, showUpgradePanel, showBagCharDetail, getRankLabel, getBreakthroughInfo, BREAKTHROUGH_LEVEL_REQ, getBreakthroughRequiredLevel, getLevelUpGoldCost, getCharacterStats, compileCharacterStats, getSkillData, mergeNoOverwrite, levelUpMainCharacter, upgradeCharacterInstance, breakthroughCharacterInstance, getPromotionInfo, promoteCharacterRank, breakthroughMainCharacter, promoteMainCharacter, getMainCharacterInstance, getMainCharacterBaseData, getMainCharacterFullData, syncInstanceTupoList, syncTeamTupoLists };

// 暴露给外部模块（shared 注册表）
shared.renderTeamView = renderTeamView;
shared.refreshCharDetailPopupContent = refreshCharDetailPopupContent;
shared.refreshBreakthroughPopupContent = refreshBreakthroughPopupContent;
