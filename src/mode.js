import { shared } from './shared.js';
import { contentList } from './contentList.js';
import { characterList, characterTemplate } from './characterList.js';
import { BREAKTHROUGH_BUFF_LIBRARY, STANDARD_BREAKTHROUGH_TEMPLATE } from './charBreakthroughConfig.js';
import { TREASURE_DEFS } from './equip.js';
import { eventList, SPeventList } from './eventList.js';
// 核心功能统一收纳于根命名空间 Game
import { Game } from './core.js';
// 道具（礼包）定义与使用逻辑
import { ITEM_DEFS, useItem, renderBagItemContent } from './item.js';

// ====== mode.js 自身可变状态（保留 window 透出，后续迁移到 store.js） ======

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

	// 获取突破配置
	const tupoList = baseChar.tupoList || STANDARD_BREAKTHROUGH_TEMPLATE || [];

	if (tupoList.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;text-align:center;padding:30px;font-size:14px;';
		emptyTip.textContent = '该角色暂无突破数据';
		listContainer.appendChild(emptyTip);
	} else {
		// 遍历突破列表
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

			// 标题行
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

			// 描述内容
			const descDiv = document.createElement('div');

			if (isNoEffect) {
				// 无效果占位：用明显不同的样式，便于一眼区分「有/无效果」
				descDiv.style.cssText = `font-size:13px;line-height:1.4;color:#8a8a8a;font-style:italic;opacity:0.85;border-top:1px dashed #3a3a3a;padding-top:5px;margin-top:3px;`;
				descDiv.textContent = '（暂无效果 · 待配置）';
			}
			else {
				descDiv.style.cssText = `font-size:13px;line-height:1.4;color:${isUnlocked ? '#ddd' : '#c9a86a'};`;
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

			// 已解锁项的悬停效果
			if (isUnlocked) {
				item.onmouseover = () => { item.style.background = '#33334a'; };
				item.onmouseout = () => { item.style.background = '#2a2a3a'; };
			}

			listContainer.appendChild(item);
		});
	}

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
				// ===== 【修改】显示当前可用/需要 =====
				doBreakBtn.textContent = `突破（${availableCount}/${breakInfo.cost}）`;
				// 如果材料不足，按钮置灰
				if (availableCount < breakInfo.cost) {
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
				actionBtnRow.appendChild(doBreakBtn);
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
		renderBreakthroughList(listContainer, baseChar, currentTupoLevel);
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

/**
 * 渲染突破列表到指定容器
 * @param {HTMLElement} container - 列表容器
 * @param {Object} baseChar - 角色基础数据
 * @param {number} currentTupoLevel - 当前突破等级
 */
function renderBreakthroughList(container, baseChar, currentTupoLevel) {
	const tupoList = baseChar.tupoList || STANDARD_BREAKTHROUGH_TEMPLATE || [];

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

		const statusIcon = document.createElement('span');
		statusIcon.style.cssText = 'font-size:12px;';
		statusIcon.textContent = isUnlocked ? '✅ 已解锁' : '🔒 未解锁';
		statusIcon.style.color = isUnlocked ? '#44ff88' : '#c9a86a';

		headerRow.appendChild(levelTitle);
		headerRow.appendChild(statusIcon);
		item.appendChild(headerRow);

		// 描述内容
		const descDiv = document.createElement('div');

		if (isNoEffect) {
			// 无效果占位：用明显不同的样式，便于一眼区分「有/无效果」
			descDiv.style.cssText = `font-size:13px;line-height:1.4;color:#8a8a8a;font-style:italic;opacity:0.85;border-top:1px dashed #3a3a3a;padding-top:5px;margin-top:3px;`;
			descDiv.textContent = '（暂无效果 · 待配置）';
		} else {
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
		doBreakBtn.textContent = `突破（${availableCount}/${breakInfo.cost}）`;

		if (availableCount < breakInfo.cost) {
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
		container.appendChild(doBreakBtn);
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

function renderBagView(container) {
	container.innerHTML = '';
	// 【修改】优先从存档中获取，如果存档有值，则使用存档值，否则默认为 'char'
	const savedTab = window.playerProgress?.bagTab || window.bagTab || 'char';
	if (!window.bagTab) {
		window.bagTab = savedTab;
	} else {
		// 如果已存在，但为了保险，与存档同步
		window.bagTab = savedTab;
	}


	// 在 renderBagView 函数开头添加
	const defs = Game.Bag.defs();
	Game.Bag.ensureSlots();
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
		renderBagItemContent(bodyDiv);
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
			const instanceId = detailBar.dataset.treasureInstanceId;
			if (tid && Game.Data.getTreasureList()[tid]) {
				showBagTreasureDetail(tid, instanceId);
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

		// 右侧：按钮组
		const btnsDiv = document.createElement('div');
		btnsDiv.className = 'bag-detail-btns';
		btnsDiv.style.display = 'flex'; // 确保是flex布局
		btnsDiv.style.gap = '5px';

		// 【新增】培养按钮
		const trainBtn = document.createElement('button');
		trainBtn.className = 'bag-detail-action-btn';
		trainBtn.textContent = '培养';
		trainBtn.onclick = () => {
			const treasureInstanceId = detailBar.dataset.treasureInstanceId;
			if (!treasureInstanceId) {
				Game.toast('请先选择要培养的宝物', 'warning');
				return;
			}
			const defs = Game.Bag.defs();
			const baseId = detailBar.dataset.baseId || detailBar.dataset.treasureId;
			const tDef = defs[baseId];
			if (!tDef) {
				Game.toast('宝物数据异常', 'error');
				return;
			}
			// 调用培养（升级）弹窗，不传角色ID，表示在背包界面操作
			Game.Bag.showUpgrade(treasureInstanceId, null, null);
		};
		btnsDiv.appendChild(trainBtn);

		// 右侧：出售按钮（适配独立实例）
		const sellBtn = document.createElement('button');
		sellBtn.className = 'bag-detail-action-btn';
		sellBtn.textContent = '出售';
		sellBtn.onclick = () => {
			const treasureInstanceId = detailBar.dataset.treasureInstanceId;
			const baseId = detailBar.dataset.baseId || detailBar.dataset.treasureId;

			if (!treasureInstanceId || !baseId) {
				Game.toast('请先选择要出售的宝物', 'warning');
				return;
			}

			// 检查是否被装备
			const ownerInfo = null;
			for (const [ownerId, slots] of Object.entries(window.charTreasureSlots)) {
				if (slots.includes(treasureInstanceId)) {
					Game.toast('该宝物已被装备，请先卸下再出售', 'warning');
					return;
				}
			}

			// 获取宝物定义
			const tDef = defs[baseId] || Game.Data.getTreasureList()[baseId];
			if (!tDef) {
				Game.toast('宝物数据异常', 'error');
				return;
			}

			// 计算出售价格
			const sellPrice = Math.floor((tDef.price || 100) * 0.5);

			// 确认对话框
			Game.confirmDialog(`确定要出售【${tDef.name}】吗？\n获得 ${sellPrice} 金币`, () => {
				// 执行出售：移除宝物实例
				Game.Bag.remove(treasureInstanceId);

				// 增加金币
				window.gameGold = (window.gameGold || 0) + sellPrice;

				Game.toast(`出售【${tDef.name}】，获得 ${sellPrice} 金币`, 'success');

				// 刷新背包视图
				const bagContainer = document.querySelector('.bag-view') || container;
				renderBagView(bagContainer);

				SaveManager.autoSave();
			});
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

		// 右侧：使用按钮（道具礼包）
		const btnsDiv = document.createElement('div');
		btnsDiv.className = 'bag-detail-btns';
		const useBtn = document.createElement('button');
		useBtn.className = 'bag-detail-action-btn';
		useBtn.textContent = '使用';
		useBtn.onclick = () => {
			const itemId = detailBar.dataset.itemId;
			if (!itemId) {
				Game.toast('请先选择道具', 'warning');
				return;
			}
			useItem(itemId);
		};
		btnsDiv.appendChild(useBtn);
		detailBar.appendChild(btnsDiv);
	}

	container.appendChild(detailBar);
}

/**
 * 渲染装备背包内容（宝物浏览 - 独立实例版）
 * 每个宝物实例独立显示，不再按 baseId 堆叠
 */
/**
 * 宝物排序（背包与「更换宝物」弹窗共用，保证排序一致）
 * 规则：已装备(任意角色) → 等级降序 → 品质降序(rank) → baseId 升序
 * @param {Array} list 宝物实例数组（需含 instanceId / rank / baseId）
 * @param {Object} ownerMap 宝物实例ID → { ownerId, slotIndex } 的查询表
 */
function sortTreasuresByBagOrder(list, ownerMap) {
	list.sort((a, b) => {
		const aIsEquipped = !!(ownerMap && ownerMap[a.instanceId]);
		const bIsEquipped = !!(ownerMap && ownerMap[b.instanceId]);
		// 1. 是否上阵：已装备的排最前面
		if (aIsEquipped !== bIsEquipped) return aIsEquipped ? -1 : 1;
		// 2. 培养进度：等级降序（高等级优先）
		const aLevel = window.treasureInventory[a.instanceId]?.level || 1;
		const bLevel = window.treasureInventory[b.instanceId]?.level || 1;
		if (bLevel !== aLevel) return bLevel - aLevel;
		// 3. 品质从高到低（rank 越大品质越高，无 rank 视为 0 排在最后）
		const aRank = a.rank || 0;
		const bRank = b.rank || 0;
		if (bRank !== aRank) return bRank - aRank;
		// 4. 宝物对应的原始 id 排序
		return (a.baseId || '').localeCompare(b.baseId || '');
	});
	return list;
}

function renderBagEquipContent(container) {
	const defs = Game.Bag.defs();
	const allInstances = Game.Bag.list(); // 获取所有宝物实例（独立）
	Game.Bag.ensureSlots();

	// 构建装备者查询表
	const treasureOwnerMap = {};
	for (const [ownerId, slots] of Object.entries(window.charTreasureSlots)) {
		slots.forEach((tId, sIdx) => {
			if (tId) {
				treasureOwnerMap[tId] = { ownerId, slotIndex: sIdx };
			}
		});
	}

	const scrollDiv = document.createElement('div');
	scrollDiv.className = 'bag-char-scroll';

	const grid = document.createElement('div');
	grid.className = 'gallery-grid';

	// 如果没有宝物
	if (allInstances.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
		emptyTip.textContent = '暂无宝物';
		grid.appendChild(emptyTip);
	}
	// 与「更换宝物」弹窗共用同一套排序（已装备 → 等级 → 品质 → baseId）
	sortTreasuresByBagOrder(allInstances, treasureOwnerMap);

	// 遍历所有宝物实例，每个独立展示
	allInstances.forEach(item => {
		const ownerInfo = treasureOwnerMap[item.instanceId];
		const isEquipped = !!ownerInfo;

		// 获取装备者信息
		let ownerName = null;
		if (isEquipped) {
			const ownerInst = window.charBagData && window.charBagData[ownerInfo.ownerId];
			const ownerCharId = ownerInst ? ownerInst.charId : ownerInfo.ownerId;
			const ownerChar = characterList[ownerCharId];
			ownerName = ownerChar ? ownerChar.name : ownerInfo.ownerId;
		}

		const card = document.createElement('div');
		card.className = 'gallery-char-card equipbag-treasure-card';
		card.dataset.treasureInstanceId = item.instanceId;
		card.dataset.baseId = item.baseId;
		card.dataset.equipped = isEquipped ? 'true' : 'false';
		card.dataset.ownerName = ownerName || '';

		// 图标
		// 图标
		const iconDiv = document.createElement('div');
		iconDiv.className = 'gallery-char-icon equipbag-icon';
		iconDiv.style.position = 'relative'; // 用于绝对定位标签

		if (item.icon) {
			const img = document.createElement('img');
			img.className = 'gallery-char-img equipbag-icon-img';
			img.src = item.icon;
			img.alt = item.name;
			img.onerror = function () {
				this.style.display = 'none';
				const fallback = document.createElement('div');
				fallback.className = 'gallery-char-placeholder';
				fallback.textContent = item.emoji || item.name.charAt(0);
				this.parentNode.appendChild(fallback);
			};
			iconDiv.appendChild(img);
		} else {
			const placeholder = document.createElement('div');
			placeholder.className = 'gallery-char-placeholder';
			placeholder.textContent = item.emoji || item.name.charAt(0);
			iconDiv.appendChild(placeholder);
		}

		// 已装备标记 - "装"字（右上角）
		if (isEquipped) {
			const eqBadge = document.createElement('div');
			eqBadge.className = 'equipbag-equipped-badge';
			eqBadge.textContent = '装';
			eqBadge.style.cssText = `
				position: absolute;
				top: 2px;
				right: 2px;
				background: #ffd700;
				color: #000;
				font-size: 10px;
				padding: 1px 4px;
				border-radius: 3px;
				font-weight: bold;
				z-index: 2;
			`;
			iconDiv.appendChild(eqBadge);
		}

		// 装备者信息（左下角）
		if (isEquipped && ownerName) {
			// 获取装备者的实例数据，以获取品质和突破等级
			const ownerInstanceData = window.charBagData && window.charBagData[ownerInfo.ownerId];
			const ownerCharId = ownerInstanceData ? ownerInstanceData.charId : ownerInfo.ownerId;
			const ownerCharData = characterList[ownerCharId];

			// 获取品质颜色
			const rankColors = {
				kami: '#ffff00',
				legend: '#ff4444',
				epic: '#ff8d8d',
				epicfake: '#ff8800',
				rare: '#a335ee',
				common: '#44aaff',
				junk: '#88cc88'
			};
			const ownerRank = ownerInstanceData ? ownerInstanceData.rank : (ownerCharData ? ownerCharData.rank : 'common');
			const ownerColor = rankColors[ownerRank] || '#aaa';

			// 获取突破等级
			const ownerTupoLevel = ownerInstanceData ? (ownerInstanceData.tupolevel || 0) : 0;
			const tupoSuffix = ownerTupoLevel > 0 ? ` +${ownerTupoLevel}` : '';

			const ownerBadge = document.createElement('div');
			ownerBadge.style.cssText = `
				position: absolute;
				bottom: 2px;
				left: 2px;
				background: rgba(0, 0, 0, 0.7);
				color: ${ownerColor};
				font-size: 10px;
				padding: 1px 4px;
				border-radius: 3px;
				font-weight: bold;
				z-index: 2;
				white-space: nowrap;
				max-width: calc(100% - 4px);
				overflow: hidden;
				text-overflow: ellipsis;
			`;
			ownerBadge.textContent = `${ownerName}${tupoSuffix}`;
			iconDiv.appendChild(ownerBadge);
		}

		card.appendChild(iconDiv);

		// 名称（不再显示等级）
		const nameDiv = document.createElement('div');
		nameDiv.className = 'gallery-char-name';
		nameDiv.textContent = item.name;
		card.appendChild(nameDiv);

		// 等级标签：写在图标下方区域（覆盖在图标底部）
		const treasureLevel = window.treasureInventory[item.instanceId]?.level || 1;
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
		iconDiv.appendChild(levelBadge);



		// 数量不再需要（每个实例独立）
		// 移除 countBadge 相关代码

		// 点击选中宝物，显示到底部详情横框
		// 修改位置：renderBagEquipContent 函数中，card.onclick 事件

		card.onclick = () => {
			// 关键：这里将 item.instanceId 存到 detailBar.dataset 中
			const detailBarEl = document.getElementById('bag-detail-bar');
			if (detailBarEl) {
				detailBarEl.dataset.treasureInstanceId = item.instanceId; // 存储实例ID
			}

			const bagItem = {
				count: 1,
				equippedBy: isEquipped ? [ownerInfo.ownerId] : []
			};
			// 传参时，确保 tDef 是当前的 item
			updateBagEquipDetailBar(item.baseId, item, bagItem);

			// 高亮
			document.querySelectorAll('.equipbag-treasure-card.selected').forEach(c => c.classList.remove('selected'));
			card.classList.add('selected');
		};


		// 双击宝物卡片显示升级浮窗
		// card.ondblclick = () => {
		// 	Game.Bag.showUpgrade(item.instanceId, isEquipped ? ownerInfo.ownerId : null);
		// };


		grid.appendChild(card);
	});

	scrollDiv.appendChild(grid);
	container.appendChild(scrollDiv);
}


/**
 * 更新底部宝物详情横框（适配独立实例版）
 */
function updateBagEquipDetailBar(baseId, tDef, bagItem) {
	const detailBar = document.getElementById('bag-detail-bar');
	if (!detailBar) return;

	// 注意：bagItem 是从 renderBagEquipContent 传入的兼容对象
	// 实际出售时需要使用 detailBar.dataset.treasureInstanceId 作为实例ID
	const treasureInstanceId = detailBar.dataset.treasureInstanceId;

	detailBar.dataset.treasureId = baseId;
	detailBar.dataset.baseId = baseId;
	detailBar.classList.add('equip-selected');

	// 【修改】从宝物实例中获取等级
	let treasureLevel = 1;
	if (treasureInstanceId && window.treasureInventory) {
		const invData = window.treasureInventory[treasureInstanceId];
		if (invData && invData.level) {
			treasureLevel = invData.level;
		}
	}
	// 更新图标
	const iconDiv = document.getElementById('bag-detail-equip-icon');
	if (iconDiv) {
		iconDiv.textContent = '';
		const detailIcon = tDef.icon || tDef.iconbig;
		if (detailIcon) {
			const img = document.createElement('img');
			img.src = detailIcon;
			img.alt = tDef.name;
			img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:4px;';
			img.onerror = function () {
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

	// 更新名称（不再显示等级）
	const nameEl = document.getElementById('bag-detail-equip-name');
	if (nameEl) {
		nameEl.textContent = tDef.name;
		nameEl.style.color = '#ffd700';
	}

	// 等级写在预览图标下方（覆盖在图标底部）
	const detailIconDiv = document.getElementById('bag-detail-equip-icon');
	if (detailIconDiv) {
		detailIconDiv.style.position = 'relative';
		let lvEl = document.getElementById('bag-detail-equip-level');
		if (!lvEl) {
			lvEl = document.createElement('div');
			lvEl.id = 'bag-detail-equip-level';
			lvEl.style.cssText = `
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
			detailIconDiv.appendChild(lvEl);
		}
		lvEl.textContent = `Lv.${treasureLevel}`;
	}

	// 更新描述
	const descEl = document.getElementById('bag-detail-equip-desc');
	if (descEl) {
		let descText = tDef.desc(treasureLevel) || '';
		// 【修改】这里不再单独显示等级，因为名称里已经显示了
		// descText += ` | 持有: 1`;


		if (bagItem.equippedBy && bagItem.equippedBy.length > 0) {
			const equipperNames = bagItem.equippedBy.map(instId => {
				// 从 charTreasureSlots 反查角色名
				let ownerName = null;
				for (const [ownerId, slots] of Object.entries(window.charTreasureSlots)) {
					if (slots.includes(treasureInstanceId)) {
						const ownerInst = window.charBagData && window.charBagData[ownerId];
						const ownerCharId = ownerInst ? ownerInst.charId : ownerId;
						const ownerChar = characterList[ownerCharId];
						ownerName = ownerChar ? ownerChar.name : ownerId;
						break;
					}
				}
				return ownerName || '未知角色';
			});
			descText += ` | 装备者:${equipperNames.join(', ')}`;
		}
		descEl.textContent = descText;
	}
}


// 渲染武将背包内容
function renderBagCharContent(container) {
	const RANK_ORDER = { kami: 1, legend: 2, epic: 3, epicfake: 4, rare: 5, common: 6, junk: 7 };
	const RANK_BORDER_COLORS = {
		kami: '#ffff00',
		legend: '#ff4444',
		epic: '#ff8d8d',
		epicfake: '#ff8800',
		rare: '#a335ee',
		common: '#44aaff',
		junk: '#88cc88'
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
		var info = {
			instanceId: instId,
			charId: charId,
			...instData,
			level: instData.level
		};
		return info
	}).filter(Boolean);
	// console.log('ownedInstances', ownedInstances);
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

	// ... 在 renderBagCharContent 函数内部 ...

	for (const charInst of ownedInstances) {
		const borderColor = RANK_BORDER_COLORS[charInst.rank] || '#888';
		const isInTeam = window.currentTeam && window.currentTeam.includes(charInst.instanceId);

		// 获取实例详细数据以获取等级和突破信息
		const instData = window.charBagData[charInst.instanceId];
		const level = instData ? (instData.level || 1) : 1;
		// 假设突破字段为 breakthrough，如果没有则默认为 0 或 '+'
		const breakthrough = instData ? (instData.tupolevel || 0) : 0;

		const card = document.createElement('div');
		card.className = 'gallery-char-card charbag-char-card';
		card.dataset.charId = charInst.charId;
		card.dataset.instanceId = charInst.instanceId;

		const iconDiv = document.createElement('div');
		iconDiv.className = 'gallery-char-icon';
		iconDiv.style.borderColor = borderColor;
		// 确保 iconDiv 相对定位，以便绝对定位的子元素徽章能正确显示
		iconDiv.style.position = 'relative';

		const img = document.createElement('img');
		img.className = 'gallery-char-img';
		img.src = `/image/character/${charInst.charId}.jpg`;
		img.alt = charInst.name;
		img.onerror = function () {
			this.onerror = function () {
				this.style.display = 'none';
				const placeholder = document.createElement('div');
				placeholder.className = 'gallery-char-placeholder';
				placeholder.textContent = charInst.name.charAt(0);
				this.parentNode.appendChild(placeholder);
			};
			this.src = `/image/character/${charInst.charId}.webp`;
		};
		iconDiv.appendChild(img);

		// 【新增】等级徽章 (左下角)
		const levelBadge = document.createElement('div');
		levelBadge.className = 'charbag-level-badge';
		levelBadge.textContent = `Lv.${level}`;
		iconDiv.appendChild(levelBadge);

		// 【新增】突破阶级徽章 (右下角或左上角，视布局而定，这里放右下角)
		if (breakthrough > 0) {
			const breakBadge = document.createElement('div');
			breakBadge.className = 'charbag-breakthrough-badge';
			// 显示为 +1, +2 等，或者使用星星符号 ★
			breakBadge.textContent = `+${breakthrough}`;
			iconDiv.appendChild(breakBadge);
		}

		card.appendChild(iconDiv);

		const nameDiv = document.createElement('div');
		nameDiv.className = 'gallery-char-name';
		nameDiv.textContent = charInst.name;
		// if (charInst.rank === 'legend') nameDiv.style.color = '#ff6666';
		// else if (charInst.rank === 'epic') nameDiv.style.color = '#ffaa44';
		nameDiv.style.color = getRankColor(charInst.rank);
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
	// ...

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
	// console.log('updateBagCharDetailBar', charInst);

	// charInst 现在包含 instanceId, charId, level 等
	const saveData = window.charBagData[charInst.instanceId];
	const rankLabels = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const tipLabels = { damger: '偏攻', defense: '偏防', balanced: '均衡' };
	const level = saveData ? saveData.level : 1;
	const rankText = rankLabels[charInst.rank] || charInst.rank;
	const tipText = tipLabels[charInst.template] || '';

	// 保存当前选中的武将 InstanceID
	detailBar.dataset.instanceId = charInst.instanceId;
	detailBar.dataset.charId = charInst.charId; // 兼容
	detailBar.classList.add('char-selected');

	// 更新头像
	const iconDiv = document.getElementById('bag-detail-char-icon');
	if (iconDiv) {
		iconDiv.textContent = '';
		const img = document.createElement('img');
		img.src = `/image/character/${charInst.charId}.jpg`;
		img.alt = charInst.name;
		img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:4px;object-position: center top;display: block;';
		//	 width: 100%;
		// height: 100%;
		// object-fit: cover;
		// object-position: center top;
		// display: block;
		img.onerror = function () {
			this.onerror = function () {
				this.style.display = 'none';
				iconDiv.textContent = charInst.name.charAt(0);
				iconDiv.style.fontSize = '18px';
				iconDiv.style.color = '#eee';

			};
			this.src = `/image/character/${charInst.charId}.webp`;
		};
		iconDiv.appendChild(img);
	}

	// 更新名称
	const nameEl = document.getElementById('bag-detail-char-name');
	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	if (nameEl) {
		const tupoText = charInst.tupolevel ? `+${charInst.tupolevel}` : '';
		nameEl.textContent = charInst.name + tupoText;
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
	SaveManager.autoSave();
}

// 背包中查看宝物详情弹窗
function showBagTreasureDetail(tid, instanceId) {
	const tDef = Game.Data.getTreasureList()[tid];
	if (!tDef) return;
	const bagItem = Game.Data.getTreasureInventory()[tid] || { count: 0, equippedBy: [] };
	const remaining = bagItem.count - (bagItem.equippedBy ? bagItem.equippedBy.length : 0);

	// 从宝物实例获取等级
	let treasureLevel = 1;
	if (instanceId && window.treasureInventory) {
		const invData = window.treasureInventory[instanceId];
		if (invData && invData.level) {
			treasureLevel = invData.level;
		}
	}

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

	// 名称（含等级）
	const nameDiv = document.createElement('div');
	nameDiv.className = 'gallery-detail-name';
	nameDiv.textContent = `${tDef.name} Lv.${treasureLevel}`;
	dialog.appendChild(nameDiv);

	// 上半区：图标 + 属性
	const topDiv = document.createElement('div');
	topDiv.className = 'gallery-detail-top';

	// 图标
	const imgDiv = document.createElement('div');
	imgDiv.className = 'gallery-detail-img-container';
	const detailIcon = tDef.iconbig || tDef.icon;
	if (detailIcon) {
		const img = document.createElement('img');
		img.className = 'gallery-detail-img';
		img.src = detailIcon;
		img.alt = tDef.name;
		// img.style.objectFit = 'contain';
		img.onerror = function () {
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
		// { label: '持有', value: bagItem.count },
		// { label: '可用', value: remaining },
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
		const equipperNames = bagItem.equippedBy.map(instId => {
			// 1. 从 charBagData 中通过实例ID获取实例数据
			const instData = window.charBagData && window.charBagData[instId];
			// 2. 获取基础角色ID
			const charId = instData ? instData.charId : instId;
			// 3. 从 characterList 中获取角色定义以显示名字
			const cData = characterList[charId];
			return cData ? cData.name : charId;
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
	let descText;
	if (typeof tDef.desc === 'function') {
		descText = tDef.desc(treasureLevel) || '无描述';
	} else {
		descText = tDef.desc || '无描述';
	}
	descContent.textContent = descText;
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
		Game.toast(`AI战斗托管已${window.autoBattle ? '开启' : '关闭'}`, 'info');
	};
	autoSettingRow.appendChild(autoLabel);
	autoSettingRow.appendChild(autoToggle);
	groupDiv.appendChild(autoSettingRow);



	// ===== 【新增】公式显示设置 =====
	const formulaSettingRow = document.createElement('div');
	formulaSettingRow.style.cssText = 'display:flex;gap:15px;justify-content:center;align-items:center;width:100%;margin-top:10px;';

	const formulaLabel = document.createElement('span');
	formulaLabel.style.color = '#ccc';
	formulaLabel.style.fontSize = '14px';
	formulaLabel.textContent = '面板显示属性公式: ';

	const formulaToggle = document.createElement('button');
	formulaToggle.className = 'ybrpg-settings-btn';
	formulaToggle.style.cssText = 'width:70px;height:40px;font-size:14px;';
	formulaToggle.textContent = window.showFormulaDetail ? '开启' : '关闭';
	formulaToggle.onclick = () => {
		window.showFormulaDetail = !window.showFormulaDetail;
		formulaToggle.textContent = window.showFormulaDetail ? '开启' : '关闭';
		Game.toast(`属性公式显示已${window.showFormulaDetail ? '开启' : '关闭'}`, 'info');

		// 如果当前在队伍视图，刷新显示
		const teamView = document.getElementById('team-view');
		if (teamView && teamView.style.display !== 'none' && window._selectedSlotIndex !== null) {
			const idx = window._selectedSlotIndex;
			const instanceId = window.currentTeam[idx];
			if (instanceId) {
				const instData = window.charBagData && window.charBagData[instanceId];
				const charId = instData ? instData.charId : instanceId;
				showTeamCharInfo(idx, instanceId, charId);
			}
		}
	};
	formulaSettingRow.appendChild(formulaLabel);
	formulaSettingRow.appendChild(formulaToggle);
	groupDiv.appendChild(formulaSettingRow);
	// ... 存档管理按钮 ...


	// 存档管理按钮
	const saveBtn = document.createElement('button');
	saveBtn.className = 'ybrpg-settings-btn';
	saveBtn.id = 'btn-setting-save';
	saveBtn.textContent = '存档管理';
	saveBtn.onclick = () => showSaveView();
	groupDiv.appendChild(saveBtn);

	container.appendChild(groupDiv);


	const versionInfo = document.createElement('div');
	versionInfo.style.cssText = 'color:#888;font-size:12px;margin-top:20px;text-align:center;';
	versionInfo.textContent = `版本: ${window.GAME_VERSION || 'v1.0'}`;
	container.appendChild(versionInfo);
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

	// 按品质排序：传说 → 史诗（后续扩展：稀有 → 精品 → 平凡）
	const RANK_ORDER = ['kami', 'legend', 'epic', 'epicfake', 'rare', 'common', 'junk'];
	const RANK_LABELS = {
		kami: '神品',
		legend: '传说',
		epic: '史诗',
		epicfake: '伪史诗',
		rare: '稀有',
		common: '精品',
		junk: '平凡'
	};
	const RANK_BORDER_COLORS = {
		kami: '#ffff00',
		legend: '#ff4444',
		epic: '#ff8d8d',
		epicfake: '#ff8800',
		rare: '#a335ee',
		common: '#44aaff',
		junk: '#88cc88'
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
	const ownedChars = Game.Data.data.handbook.ownedCharacters

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
				img.src = `/image/character/${char.id}.jpg`;
				img.alt = char.name;
				img.onerror = function () {
					// 图片加载失败，尝试 .webp
					this.onerror = function () {
						// .webp也失败，显示占位
						this.style.display = 'none';
						const placeholder = document.createElement('div');
						placeholder.className = 'gallery-char-placeholder';
						placeholder.textContent = char.name.charAt(0);
						this.parentNode.appendChild(placeholder);
					};
					this.src = `/image/character/${char.id}.webp`;
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
			// if (isOwned && rank === 'legend') {
			//	 nameDiv.style.color = '#ff6666';
			// } else if (isOwned && rank === 'epic') {
			//	 nameDiv.style.color = '#ffaa44';
			// }
			nameDiv.style.color = getRankColor(rank);
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

/**
 * 显示角色详情弹窗
 * 
 * @param {HTMLElement} _parentContainer - 父容器元素（当前未在函数体内直接使用，可能为预留参数）
 * @param {Object} charData - 角色数据对象
 * @param {string} charData.name - 角色名称
 * @param {string|number} charData.id - 角色ID，用于构建图片路径
 * @param {string} charData.rank - 角色品质等级标识 (kami, legend, epic, epicfake, rare, common, junk)
 * @param {string} charData.template - 角色模板标识，用于查找基础属性配置
 * @param {number} [charData.hp] - 角色生命值（ fallback 用）
 * @param {number} [charData.atk] - 角色攻击力（ fallback 用）
 * @param {number} [charData.def] - 角色防御力（ fallback 用）
 * @param {number} [charData.spe] - 角色速度（ fallback 用）
 * @param {Array} [charData.skills] - 技能ID数组 [普攻ID, 技能ID, 必杀ID]
 * @returns {void}
 */
function showCharDetail(_parentContainer, charData) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'gallery-detail-dialog';

	// 角色名
	// 找到这行：
	// const tupoText = charData.tupolevel ? `+${charData.tupolevel}` : '';

	// 改为：
	const tupoText = ''; // 图鉴中不显示突破等级

	const nameDiv = document.createElement('div');
	nameDiv.className = 'gallery-detail-name';
	nameDiv.textContent = charData.name + tupoText;
	dialog.appendChild(nameDiv);

	// 上半部分：图片 + 属性 横向排列
	const topDiv = document.createElement('div');
	topDiv.className = 'gallery-detail-top';

	// 角色大图（168x207，偏左上）
	const imgDiv = document.createElement('div');
	imgDiv.className = 'gallery-detail-img-container';
	const img = document.createElement('img');
	img.className = 'gallery-detail-img';
	img.src = `/image/character/${charData.id}.jpg`;
	img.alt = charData.name;

	// 图片加载失败处理：尝试加载webp格式，若仍失败则显示首字母占位符
	img.onerror = function () {
		this.onerror = function () {
			this.style.display = 'none';
			const p = document.createElement('div');
			p.className = 'gallery-char-placeholder';
			p.style.width = '168px';
			p.style.height = '207px';
			p.style.fontSize = '50px';
			p.textContent = charData.name.charAt(0);
			this.parentNode.appendChild(p);
		};
		this.src = `/image/character/${charData.id}.webp`;
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

	const rankLabels = { kami: '神品', legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' };
	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	const tipLabels = { damger: '偏攻', defense: '偏防', balanced: '均衡' };

	// 品质 + 等级（图鉴中显示基础等级 Lv.1）
	const rankDiv = document.createElement('div');
	rankDiv.className = 'gallery-detail-rank';
	const rankText = rankLabels[charData.rank] || charData.rank;
	// 找到 rankDiv.innerHTML 那行：
	// rankDiv.innerHTML = `<span style="color:${rankColors[charData.rank] || '#888'}">${rankText}</span><span style="color:#ddd;font-size:13px;margin-left:8px">Lv.1</span>`;

	// 改为：
	rankDiv.innerHTML = `<span style="color:${rankColors[charData.rank] || '#888'}">${rankText}</span>`; // 图鉴不显示等级

	attrDiv.appendChild(rankDiv);

	// 属性标签
	const tipDiv = document.createElement('div');
	tipDiv.style.fontSize = '12px';
	tipDiv.style.color = '#aaa';
	tipDiv.style.marginBottom = '4px';
	tipDiv.textContent = tipLabels[charData.template] || '';
	attrDiv.appendChild(tipDiv);
	//  null;

	// 尝试从 characterTemplate获取数值
	let info = characterTemplate[charData.template][charData.rank]

	// 如果没找到 template 数据， fallback 到 charData 自身的基础数值（防止显示 undefined）
	const finalHp = info ? info.hp : (charData.hp || 0);
	const finalAtk = info ? info.atk : (charData.atk || 0);
	const finalDef = info ? info.def : (charData.def || 0);
	const finalSpe = info ? info.spe : (charData.spe || 0);

	// 四维属性（图鉴显示基础值）
	const attrs = [
		{ label: '生命', value: finalHp },
		{ label: '攻击', value: finalAtk },
		{ label: '防御', value: finalDef },
		{ label: '速度', value: finalSpe },
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

	// 获取角色的 skills 数组：[普攻id, 技能id, 必杀id]
	const skillIds = charData.skills || [];

	// ===== 普攻 =====
	if (skillIds[0] && contentList.pugong && contentList.pugong[skillIds[0]]) {
		const pg = contentList.pugong[skillIds[0]];
		const section = buildSkillSection('普攻', pg, '#5ba8ff');
		skillsDiv.appendChild(section);
	}

	// ===== 普通技能（始终显示） =====
	if (skillIds[1] && contentList.skill && contentList.skill[skillIds[1]]) {
		const sk = contentList.skill[skillIds[1]];
		const section = buildSkillSection('技能', sk, '#ff8c00');
		skillsDiv.appendChild(section);
	}

	// ===== 必杀预览（始终显示，无论是否解锁） =====
	const spSkillId = skillIds[2];
	const spData = spSkillId && contentList.spskill && contentList.spskill[spSkillId];

	if (spData) {
		// 始终显示必杀为未解锁状态（图鉴中不涉及实例数据）
		const section = document.createElement('div');
		section.className = 'gallery-skill-section';
		section.style.opacity = '0.6';
		section.style.filter = 'grayscale(0.8)';

		const title = document.createElement('div');
		title.className = 'gallery-skill-title spskill';
		title.textContent = '必杀（需突破解锁）';
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

		const unlockInfo = document.createElement('div');
		unlockInfo.className = 'gallery-skill-ai';
		unlockInfo.style.color = '#ffd700';
		unlockInfo.style.fontSize = '11px';
		unlockInfo.textContent = '🔒 突破19阶解锁必杀';
		section.appendChild(unlockInfo);

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
	};	// 在 dialog.appendChild(closeBtn); 之前添加

	// ===== 【新增】突破详情按钮 =====
	const detailBreakBtn = document.createElement('button');
	detailBreakBtn.className = 'ybrpg-btn';
	detailBreakBtn.style.cssText = 'width:80px;padding:6px;font-size:13px;margin-right:8px;background:#2a1a3a;border-color:#d000ff;color:#d000ff;';
	detailBreakBtn.textContent = '🔮 突破';
	detailBreakBtn.onclick = () => {
		// 关闭当前图鉴详情，调用突破预览
		// if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		// showBreakthroughPreviewPopupByCharId(charData.id);
		showBreakthroughPreviewPopupForGallery(charData);
	};

	// 把关闭按钮和突破按钮放在同一行
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:10px;';
	btnRow.appendChild(detailBreakBtn);
	btnRow.appendChild(closeBtn);
	// 原来的 dialog.appendChild(closeBtn); 改为 dialog.appendChild(btnRow);

	// dialog.appendChild(closeBtn);  // 注释掉或删除这行
	dialog.appendChild(btnRow);


	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	// 点击遮罩关闭
	overlay.onclick = (e) => {
		if (e.target === overlay) {
			if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		}
	};
}
/**
 * 图鉴专用的突破预览弹窗 - 不涉及任何实例数据
 * @param {Object} charData - 角色静态数据
 */
function showBreakthroughPreviewPopupForGallery(charData) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.id = 'breakthrough-preview-overlay';

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

	// 标题 - 不显示突破等级
	const title = document.createElement('div');
	title.style.cssText = 'color:#ffd700;font-size:18px;font-weight:bold;text-align:center;margin-bottom:15px;';
	const rankColors = { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' };
	title.innerHTML = `${charData.name} <span style="color:${rankColors[charData.rank] || '#888'};font-size:14px;">突破预览（静态）</span>`;
	popup.appendChild(title);

	// 角色头像
	const header = document.createElement('div');
	header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #333;';

	const charImg = document.createElement('img');
	charImg.src = `/image/character/${charData.id}.jpg`;
	charImg.style.cssText = 'width:48px;height:48px;border-radius:6px;border:2px solid #ffd700;object-fit:cover;';
	charImg.onerror = function () { this.src = '/image/character/default.jpg'; };
	header.appendChild(charImg);

	const charInfo = document.createElement('div');
	charInfo.style.cssText = 'flex:1;';
	const charName = document.createElement('div');
	charName.style.cssText = 'color:#fff;font-size:15px;font-weight:bold;';
	charName.innerHTML = `<span style="color:${rankColors[charData.rank] || '#888'};font-size:14px;">${charData.name}</span>`;
	charInfo.appendChild(charName);

	const charLevel = document.createElement('div');
	charLevel.style.cssText = 'color:#aaa;font-size:12px;margin-top:2px;';
	charLevel.textContent = '基础突破预览（不含实例数据）';
	charInfo.appendChild(charLevel);

	header.appendChild(charInfo);
	popup.appendChild(header);

	// 突破列表
	const listContainer = document.createElement('div');
	listContainer.style.cssText = 'flex:1;overflow-y:auto;padding-right:4px;';
	listContainer.style.scrollbarWidth = 'thin';
	listContainer.style.scrollbarColor = '#555 #222';

	const tupoList = charData.tupoList || STANDARD_BREAKTHROUGH_TEMPLATE || [];

	if (tupoList.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;text-align:center;padding:30px;font-size:14px;';
		emptyTip.textContent = '该角色暂无突破数据';
		listContainer.appendChild(emptyTip);
	} else {
		tupoList.forEach((buff, index) => {
			// 图鉴中所有突破项都显示为未解锁状态
			const isUnlocked = false;

			const item = document.createElement('div');
			item.style.cssText = `
				background: #1a1a1a;
				border: 1px solid #333;
				border-left: 4px solid #555;
				border-radius: 4px;
				padding: 10px;
				margin-bottom: 8px;
				opacity: 0.6;
			`;

			const headerRow = document.createElement('div');
			headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';

			const levelTitle = document.createElement('span');
			levelTitle.style.cssText = `font-weight:bold;font-size:14px;color:#888;`;
			levelTitle.textContent = `突破 ${index + 1} 阶`;

		const statusIcon = document.createElement('span');
		statusIcon.style.cssText = 'font-size:12px;color:#d9bd7a;';
		statusIcon.textContent = '🔒 未解锁';

			headerRow.appendChild(levelTitle);
			headerRow.appendChild(statusIcon);
			item.appendChild(headerRow);

		const descDiv = document.createElement('div');
		descDiv.style.cssText = 'font-size:13px;line-height:1.4;color:#d9bd7a;';

			if (!buff) {
				descDiv.textContent = '暂无详细描述';
			} else {
				let resolvedBuff = buff;
				if (typeof buff === 'string') {
					const lib = BREAKTHROUGH_BUFF_LIBRARY || {};
					resolvedBuff = lib[buff] || { desc: '暂无详细描述' };
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
			listContainer.appendChild(item);
		});
	}

	popup.appendChild(listContainer);

	// 关闭按钮 - 没有操作按钮，只有关闭
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

// 显示高清原图弹窗
function showFullImage(charId, charName) {
	const overlay = document.createElement('div');
	overlay.className = 'gallery-fullimg-overlay';

	const img = document.createElement('img');
	img.src = `/image/character/${charId}.jpg`;
	img.alt = charName;
	img.onerror = function () {
		this.onerror = function () {
			this.style.display = 'none';
			const p = document.createElement('div');
			p.style.color = '#666';
			p.style.fontSize = '24px';
			p.textContent = '图片不可用';
			this.parentNode.appendChild(p);
		};
		this.src = `/image/character/${charId}.webp`;
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
	if (price >= 350) return { label: '珍稀', color: '#ff8d8d' };
	if (price >= 250) return { label: '上品', color: '#44aaff' };
	if (price >= 180) return { label: '良品', color: '#88cc88' };
	return { label: '精品', color: '#888' };
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

	const treasureDefs = Game.Data.getTreasureList();
	const treasureIds = Object.keys(treasureDefs);

	// 从实例化系统中获取拥有的宝物
	const ownedTreasureBaseIds = new Set();
	if (window.treasureInventory) {
		Object.values(window.treasureInventory).forEach(inv => {
			if (inv && inv.baseId) {
				ownedTreasureBaseIds.add(inv.baseId);
			}
		});
	}
	// 兼容旧格式
	if (window.treasureBagData) {
		Object.keys(window.treasureBagData).forEach(baseId => {
			if (window.treasureBagData[baseId] && window.treasureBagData[baseId].count > 0) {
				ownedTreasureBaseIds.add(baseId);
			}
		});
	}
	const ownedCount = ownedTreasureBaseIds.size;

	const statDiv = document.createElement('div');
	statDiv.style.cssText = 'text-align:center;color:#aaa;font-size:12px;margin-bottom:10px;';
	statDiv.textContent = `已收集 ${ownedCount} / ${treasureIds.length}`;
	container.appendChild(statDiv);

	// 按品质(rank)分类：1=普通 2=稀有 3=精品 4=伪史诗 5=史诗 6=传说
	const RANK_ORDER = [1, 2, 3, 4, 5, 6];
	const RANK_LABELS = { 1: '普通', 2: '稀有', 3: '精品', 4: '伪史诗', 5: '史诗', 6: '传说' };
	const grouped = {};
	for (const tid of treasureIds) {
		const tDef = treasureDefs[tid];
		// 未配置 rank 的宝物归入 0（未分级）
		let rank = tDef.rank;
		if (rank == null || !RANK_ORDER.includes(rank)) rank = 0;
		if (!grouped[rank]) grouped[rank] = [];
		grouped[rank].push({ id: tid, ...tDef });
	}

	// 滚动容器
	const scrollDiv = document.createElement('div');
	scrollDiv.className = 'gallery-scroll';

	for (const rankKey of [6, 5, 4, 3, 2, 1, 0]) {
		if (!grouped[rankKey] || grouped[rankKey].length === 0) continue;

		const sectionTitle = document.createElement('div');
		sectionTitle.className = 'gallery-section-title';
		const rankLabel = rankKey === 0 ? '未分级' : (RANK_LABELS[rankKey] || ('rank' + rankKey));
		sectionTitle.textContent = rankLabel;
		sectionTitle.style.borderLeftColor = '#c0a060';
		scrollDiv.appendChild(sectionTitle);

		// 宝物网格
		const grid = document.createElement('div');
		grid.className = 'gallery-grid';

		for (const t of grouped[rankKey]) {
			const isOwned = ownedTreasureBaseIds.has(t.id);
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
				// img.style.objectFit = 'contain';
				img.onerror = function () {
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

	if (isOwned && (tDef.icon || tDef.iconbig)) {
		const img = document.createElement('img');
		img.src = tDef.iconbig || tDef.icon;
		img.alt = tDef.name;
		img.style.cssText = 'max-width:120px;max-height:120px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,215,0,0.4));';
		img.onerror = function () {
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

		// // 触发时点
		// const typeRow = document.createElement('div');
		// typeRow.className = 'gallery-detail-attr-row';
		// typeRow.innerHTML = `<span class="attr-label">触发时点</span><span class="attr-value" style="color:#ffd700">${TREASURE_TYPE_LABELS[tDef.type] || tDef.type}</span>`;
		// attrDiv.appendChild(typeRow);

		// 价格
		const priceRow = document.createElement('div');
		priceRow.className = 'gallery-detail-attr-row';
		priceRow.innerHTML = `<span class="attr-label">售价</span><span class="attr-value" style="color:#ffcc00">${tDef.price || 0} 金</span>`;
		attrDiv.appendChild(priceRow);

		// 持有数量 - 从实例化系统获取
		let count = 0;
		if (window.treasureInventory) {
			count = Object.values(window.treasureInventory).filter(inv => inv && inv.baseId === tDef.id).length;
		}
		// 兼容旧格式
		if (window.treasureBagData && window.treasureBagData[tDef.id]) {
			count += window.treasureBagData[tDef.id].count || 0;
		}

		// const countRow = document.createElement('div');
		// countRow.className = 'gallery-detail-attr-row';
		// countRow.innerHTML = `<span class="attr-label">持有</span><span class="attr-value">${count}</span>`;
		// attrDiv.appendChild(countRow);


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
	descText.textContent = isOwned ? (tDef.desc(1) || '暂无描述') : '???';
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
	if (selectedChapterKey && SPeventList[selectedChapterKey]) {
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
		{ name: '地狱', key: 'hell' },
		{ name: '秘境', key: 'secret' }
	];

	// 获取当前选中的难度，默认为普通
	let currentDifficulty = window.currentDifficulty || 'normal';

	// 获取所有章节key并排序（提前声明，供难度解锁检查和章节列表共用）
	const chapterKeys = Object.keys(eventList).sort((a, b) => {
		const numA = parseInt(a.replace(/\D/g, '')) || 0;
		const numB = parseInt(b.replace(/\D/g, '')) || 0;
		return numA - numB;
	});

	// 获取所有章节key并排序（提前声明，供难度解锁检查和章节列表共用）
	const SPchapterKeys = Object.keys(SPeventList).sort((a, b) => {
		const numA = parseInt(a.replace(/\D/g, '')) || 0;
		const numB = parseInt(b.replace(/\D/g, '')) || 0;
		return numA - numB;
	});
	// 检查难度解锁状态 - 只要存在任意一章该难度可玩，即视为解锁
	const isDifficultyUnlocked = (diffKey) => {
		if (diffKey === 'normal') return true;
		if (diffKey === 'secret') return true;

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
		btn.style.width = '70px';
		btn.style.minWidth = '50px';
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
			// console.log(`切换难度: ${diff.name}`);
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
	if (currentDifficulty === 'secret') {
		for (const chapterKey of SPchapterKeys) {
			const chapterData = SPeventList[chapterKey];

			// 调试日志保留
			console.log('SPchapterKeys', SPeventList);
			console.log('chapterKey', chapterKey);
			console.log('chapterData', chapterData);

			// 章节标题按钮
			const chapterBtn = document.createElement('button');
			chapterBtn.className = 'ybrpg-btn';
			chapterBtn.style.width = '95%';
			chapterBtn.style.marginBottom = '5px';

			// 将 chapter1 转换为更友好的显示名称，如 "章节 1"
			// 如果是秘境，可能需要在名字前加标识
			let displayName = chapterData.name || chapterKey.replace(/chapter/i, '章节 ').replace(/(\d+)/, '$1');
			if (chapterData.type === 'secret' || chapterKey.includes('secret')) {
				displayName = `【秘境】${displayName}`;
				chapterBtn.style.borderColor = '#ff4444'; // 可选：给秘境按钮加个红色边框区分
				chapterBtn.style.color = '#ff4444';
			}
			chapterBtn.textContent = `▶ ${displayName}`;

			// 章节按钮点击事件：进入该章节的子页面
			chapterBtn.onclick = () => {
				// 保存当前选中的章节，用于难度解锁判断
				window.selectedChapter = chapterKey;
				renderDungeonView(container, chapterKey);
				// 【修改】判断是否为秘境副本，进行兼容处理
				const isSecretDungeon = (chapterData.type === 'secret') || (chapterKey.includes('secret'));

				if (isSecretDungeon) {
					// 1. 如果有专门的秘境渲染函数，请取消下面这行的注释并替换函数名
					// renderSecretDungeonView(container, chapterKey); 

					// 2. 如果暂时复用普通地下城视图，但需要传递秘境标识
					// 假设 renderDungeonView 能处理 chapterData 中的 type 字段
					renderDungeonView(container, chapterKey);

					// 3. 如果秘境功能确实尚未实装，保留提示
					// Game.toast('秘境副本暂未完全开放，正在开发中...', 'warning');
				} else {
					// 普通章节逻辑
					renderDungeonView(container, chapterKey);
				}
			};

			listContainer.appendChild(chapterBtn);
		}
	}
	else {
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

	}



	container.appendChild(listContainer);
}

// 新增: 难度缩放配置
const DIFFICULTY_SCALE = {
	normal: { hp: 1.0, atk: 1.0, def: 1.0, gold: 1.0, name: '普通', buffs: [], treasures: [], },
	nightmare: { hp: 1.5, atk: 1.3, def: 1.3, gold: 1.5, name: '噩梦', buffs: [], treasures: [], },
	hell: { hp: 2.0, atk: 1.6, def: 1.6, gold: 2.0, name: '地狱', buffs: [], treasures: [], }
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
 * 构建我方队伍数据（已适配 instanceId 宝物系统）
 * 返回包含 treasures 字段的单位数组
 */
function buildPlayerTeamForBattle() {
	// // ===== 【修复】战斗前强制刷新所有上阵角色的编译属性，确保宝物/突破数据最新 =====
	// (window.currentTeam || []).forEach(instanceId => {
	// 	if (instanceId && window.charBagData && window.charBagData[instanceId]) {
	// 		Game.Stat.final(instanceId);
	// 	}
	// });

	return (window.currentTeam || []).map(instanceId => {
		const instData = window.charBagData && window.charBagData[instanceId];
		if (!instData) return { id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [], treasures: [] };

		const charId = instData.charId || instanceId;
		const base = characterList[charId];

		// ===== 【关键修改】优先使用编译后的属性 =====
		let hp, atk, def, spe;
		const compiled = instData._compiledStats;

		if (compiled) {
			// 已经有编译结果，直接使用
			hp = compiled.totalHp;
			atk = compiled.totalAtk;
			def = compiled.totalDef;
			spe = compiled.totalSpe;
		} else {
			// 没有编译结果，从原始数据读取
			hp = instData.hp || (base ? base.hp : 0);
			atk = instData.atk || (base ? base.atk : 0);
			def = instData.def || (base ? base.def : 0);
			spe = instData.spe || (base ? base.spe : 0);
		}

		return {
			id: charId,
			instanceId: instanceId,
			name: base ? base.name : charId,
			hp: hp,
			atk: atk,
			def: def,
			spe: spe,
			maxHp: hp,
			skills: instData.skills || (base ? base.skills : []),
			buff: instData.buff || [],
			treasures: (function () {
				var equippedDefs = [];
				Game.Bag.ensureSlots();
				var slots = window.charTreasureSlots && window.charTreasureSlots[instanceId];
				if (slots && Array.isArray(slots)) {
					slots.forEach(function (tInstId) {
						if (!tInstId) return;
						var inv = window.treasureInventory && window.treasureInventory[tInstId];
						var baseId = inv && inv.baseId;
						var def = baseId && (TREASURE_DEFS || {})[baseId];
						if (def) equippedDefs.push(def);
					});
				}
				return equippedDefs;
			})(),
			rank: instData.rank || (base ? base.rank : 'common'),
			tupolevel: instData.tupolevel || 0,
			// 突破定义以 characterList 原对象为准（含 content/filter 函数），避免实例存档反序列化后函数丢失
			tupoList: base ? base.tupoList : (instData.tupoList || []),

			// ===== 【新增】传递 openSpskill =====
			openSpskill: instData.openSpskill === true,

			// ===== 【新增】标记属性已预编译 =====
			statsPreCompiled: !!compiled,

			// ===== 【新增】从编译结果读取战斗属性（带容错） =====
			mingzhong: compiled?.mingzhong ?? 10000,
			shanbi: compiled?.shanbi ?? 0,
			baoji: compiled?.baoji ?? 0,
			kangbao: compiled?.kangbao ?? 0,
			baoshang: compiled?.baoshang ?? 0,
			shouhu: compiled?.shouhu ?? 0,
			poji: compiled?.poji ?? 0,
			gedang: compiled?.gedang ?? 0,

			fixedDealUp: compiled?.fixedDealUp ?? 0,
			fixedTakeDn: compiled?.fixedTakeDn ?? 0,
			pctDealUp: compiled?.pctDealUp ?? 0,
			pctTakeDn: compiled?.pctTakeDn ?? 0,

			fixedHeal: compiled?.fixedHeal ?? 0,
			fixedBeHeal: compiled?.fixedBeHeal ?? 0,
			pctHeal: compiled?.pctHeal ?? 0,
			pctBeHeal: compiled?.pctBeHeal ?? 0,
		};
	});
}


// 新增: 渲染特定章节的事件列表（子页面）
function renderChapterEventList(container, chapterKey) {
	// 修复: 清空容器以防重复渲染
	container.innerHTML = '';

	const SPchapterData = SPeventList[chapterKey];
	const chapterData = eventList[chapterKey];
	if (!chapterData && !SPchapterData) return;

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
	const headerTitle = document.createElement('div');
	if (SPchapterData) {
		var chapterName = SPchapterData.name || '神秘副本';
		var difficultyName = '秘境';
	}
	else {
		var chapterName = chapterData.name || chapterKey.replace(/chapter/i, '章节 ').replace(/(\d+)/, '$1');
		var difficultyName = DIFFICULTY_SCALE[currentDifficulty]?.name || '普通';
	}
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

	if (SPchapterData) {
		// SPchapterData 即为当前的秘境系列数据 (如 spEvent1 或 spEvent2)
		const procedure = SPchapterData.procedure || [];
		const eventPack = SPchapterData.eventPack || {};

		// 如果 procedure 为空，则尝试从 eventPack 获取所有 key 并排序（假设 key 有规律）
		let eventIds = procedure;
		if (eventIds.length === 0 && Object.keys(eventPack).length > 0) {
			eventIds = Object.keys(eventPack).sort();
		}

		// 遍历该秘境系列下的所有关卡
		eventIds.forEach((eventId, index) => {
			const eventData = eventPack[eventId];
			if (!eventData) return;

			// 1. 判断解锁状态
			let isLocked = false;
			let lockReason = '';
			let isNew = false; // 【新增】标记是否为最新可挑战关卡

			// 获取已通关列表
			var passed = Object.keys(window.playerProgress || {});

			if (eventData.prev) {
				// 有显式前置关卡
				const prevPassed = passed && passed.includes(eventData.prev);

				if (!prevPassed) {
					isLocked = true;
					lockReason = `需先通过【${getEventName(eventData.prev)}】`;
				} else {
					// 前置已通过，检查自己是否已通过
					if (!passed.includes(eventId)) {
						isNew = true; // 前置过了，自己没过，标记为新
					}
				}
			} else if (index > 0) {
				// 没有显式 prev，隐含前置是上一关
				const prevId = eventIds[index - 1];
				const prevPassed = passed && passed.includes(prevId);

				if (!prevPassed) {
					isLocked = true;
					lockReason = `需先通过上一关`;
				} else {
					// 前置（上一关）已过，检查自己是否已通过
					if (!passed.includes(eventId)) {
						isNew = true; // 前置过了，自己没过，标记为新
					}
				}
			} else {
				// 第一关 (index === 0) 且无 prev
				if (!passed.includes(eventId)) {
					isNew = true; // 第一关且未通过，标记为新
				}
			}

			// 2. 创建按钮
			const levelBtn = document.createElement('button');
			levelBtn.className = 'ybrpg-btn';
			levelBtn.style.width = '95%';
			levelBtn.style.marginBottom = '5px';

			// 构建显示文本
			let btnText = `▶ ${eventData.name}`;
			if (isNew) {
				btnText += ' <span style="color:#ff4444;font-weight:bold;font-size:12px;">(新)</span>';
			}

			// 样式区分：锁定状态
			if (isLocked) {
				levelBtn.style.opacity = '0.6';
				levelBtn.style.cursor = 'not-allowed';
				// 锁定状态下不显示"新"，或者你可以选择显示"🔒 ... (需前置)"
				levelBtn.innerHTML = `🔒 ${eventData.name} <span style="font-size:12px;color:#aaa;">(${lockReason})</span>`;
			} else {
				levelBtn.innerHTML = btnText; // 使用 innerHTML 以支持标签样式
				// 可选：如果是Boss关或特殊关，加高亮
				if (eventData.type === 'boss') {
					levelBtn.style.borderColor = '#ff4444';
					levelBtn.style.color = '#ff4444';
				}
			}

			// 3. 点击事件
			levelBtn.onclick = () => {
				if (isLocked) {
					Game.toast(lockReason, 'warning');
					return;
				}
				let event = SPchapterData.eventPack[eventId];
				let checkEventId = eventId;
				console.log(`进入副本: ${event.name}, ID: ${checkEventId}, 难度: ${currentDifficulty}`);
				// 保存当前选择的秘境关卡ID
				window.selectedSecretLevel = eventId;
				window.currentSecretEvent = eventData; // 缓存当前事件数据

				syncTreasureEquipData();

				const playerTeam = buildPlayerTeamForBattle();
				console.log(playerTeam)
				while (playerTeam.length < 6) {
					playerTeam.push({ id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [] });
				}
			const enemyTeam = (event.enemy || []).map(function (e) {
				if (!e || !e.id) return { id: null, name: '', skills: [], buff: [], treasures: [], tupolevel: 0, tupoList: [] };
				var base = characterList[e.id] || {};
				return {
					id: e.id,
					name: e.name || base.name || e.id,
					level: e.level || 1,
					template: e.template || base.template || 'balanced',
					skills: e.skills || base.skills || [],
					buff: e.buff || [],
					treasures: e.treasures || [],
					tupoList: e.tupoList || base.tupoList || [],
					tupolevel: e.tupolevel || 0,
					rank: e.rank || base.rank || 'common',
				};
			});
			console.log(enemyTeam)
			while (enemyTeam.length < 6) {
				enemyTeam.push({ id: null, name: '', skills: [], buff: [], tupolevel: 0, tupoList: [] });
				}

				for (var i in enemyTeam) {
					// if (DIFFICULTY_SCALE[currentDifficulty]?.treasures?.length > 0) {
					//	 for (var j in DIFFICULTY_SCALE[currentDifficulty].treasures) {
					//		 enemyTeam[i].treasures.push(DIFFICULTY_SCALE[currentDifficulty].treasures[j]);
					//	 }
					// }
					//////敌人的公式化加强
				}
				Game.Battle.start(playerTeam, enemyTeam, {
					difficulty: currentDifficulty,
					eventId: checkEventId,
					eventType: event.type || 'battle',
					chapterKey: chapterKey,
					// 【新增】传递事件配置的金币奖励
					goldReward: event.gold || 0,
					goldScale: DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0,
					onWin: function () {
						if (!window.playerProgress) window.playerProgress = {};
						if (!window.playerProgress[checkEventId]) {
							window.playerProgress[checkEventId] = true;

							// 判断是主角突破秘境还是升阶秘境
							if (chapterKey === 'spEvent1') {
								// 主角升阶秘境 - 根据关卡ID提取突破等级
								// sp1-1 到 sp1-20，提取数字部分作为目标突破等级
								const match = eventId.match(/sp1-(\d+)/);
								if (match) {
									const targetTupoLevel = parseInt(match[1]);
									breakthroughMainCharacter(targetTupoLevel);
									Game.toast(`主角突破至 ${targetTupoLevel} 阶！`, 'success');
								} else {
									// 默认突破1次
									breakthroughMainCharacter();
								}
							} else if (chapterKey === 'spEvent2') {
								// 主角蜕变秘境 - 根据关卡ID确定目标品质
								const rankMap = {
									'sp2-1': 'common',	 // 平凡试炼 -> 精品
									'sp2-2': 'rare',	   // 精英试炼 -> 稀有
									'sp2-3': 'epicfake',   // 史诗试炼 -> 伪史诗
									'sp2-4': 'epic',	   // 真史诗试炼 -> 真史诗
									'sp2-5': 'legend',	 // 传说试炼 -> 传说
									'sp2-6': 'kami'		// 真神秘境 -> 神品
								};

								const targetRank = rankMap[eventId];
								if (targetRank) {
									promoteMainCharacter(targetRank);
									Game.toast(`主角品质提升至【${getRankLabel(targetRank)}】！`, 'success');
								} else {
									// 默认执行升阶检查
									promoteMainCharacter();
								}
							}
						}

						// 战斗胜利金币奖励
						// const enemyCount = (event.enemy || []).filter(e => e && e.id).length;
						const isBoss = event.type === 'boss';
						const baseGold = event.gold || 300;
						const goldScale = baseGold;
						const goldReward = Math.floor(goldScale);
						window.gameGold = (window.gameGold || 0) + goldReward;
						// 事件完成后自动存档
						SaveManager.autoSave();
						Game.toast(`恭喜通关 ${DIFFICULTY_SCALE[currentDifficulty]?.name || ''}: ${event.name}！获得 ${goldReward} 金币`, 'success');
						// 重新渲染副本视图
						const dungeonView = document.getElementById('dungeon-view');
						if (dungeonView) {
							hideOtherViews('dungeon-view');
							dungeonView.style.display = 'flex';
							renderDungeonView(dungeonView, chapterKey);
						}
					},
					onLose: () => {
						Game.toast(`挑战失败: ${event.name}`, 'warning');
						const dungeonView = document.getElementById('dungeon-view');
						if (dungeonView) {
							hideOtherViews('dungeon-view');
							dungeonView.style.display = 'flex';
							renderDungeonView(dungeonView, chapterKey);
						}
					}
				});
			};

			listContainer.appendChild(levelBtn);
		});
		container.appendChild(listContainer);
	}
	else {
		// 生成该章节下的所有子剧本按钮
		const procedure = chapterData.procedure || [];
		// 如果 procedure 为空，则遍历 eventPack 的所有 key
		const eventIds = procedure.length > 0 ? procedure : Object.keys(chapterData.eventPack);

		// 获取难度缩放配置
		const scale = DIFFICULTY_SCALE[currentDifficulty] || DIFFICULTY_SCALE.normal;

		// 解锁条件检查
		const chapterNum = parseInt(chapterKey.replace(/\D/g, '')) || 1;
		console.log('chapterNum:', chapterNum);
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
					console.log(playerTeam)
					// 补齐6个位置
					while (playerTeam.length < 6) {
						playerTeam.push({ id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [] });
					}

					const enemyTeam = (event.enemy || []).map(function (e) {
						if (!e || !e.id) return { id: null, name: '', skills: [], buff: [], treasures: [], tupolevel: 0, tupoList: [] };
						var base = characterList[e.id] || {};
						return {
							id: e.id,
							name: e.name || base.name || e.id,
							level: e.level || 1,
							template: e.template || base.template || 'balanced',
							skills: e.skills || base.skills || [],
							buff: e.buff || [],
							treasures: e.treasures || [],
							rank: e.rank || base.rank || 'common',
							tupolevel: e.tupolevel || 0,
							tupoList: e.tupoList || base.tupoList || [],
						};
					});
					// for(k of cards.filter(c=>!upe.includes(c))){
					//	 if(cardTrue(k).num==num-1){}
					// }
					// 补齐6个位置
					while (enemyTeam.length < 6) {
						enemyTeam.push({ id: null, name: '', skills: [], buff: [], tupolevel: 0, tupoList: [], });
					}
					for (var i in enemyTeam) {
						if (DIFFICULTY_SCALE[currentDifficulty]?.treasures?.length > 0) {
							for (var j in DIFFICULTY_SCALE[currentDifficulty].treasures) {
								enemyTeam[i].treasures.push(DIFFICULTY_SCALE[currentDifficulty].treasures[j]);
							}
						}
					}

					// 启动战斗
					Game.Battle.start(playerTeam, enemyTeam, {
						difficulty: currentDifficulty,
						eventId: checkEventId,
						eventType: event.type || 'battle',
						chapterKey: chapterKey,
						// 【新增】传递事件配置的金币奖励
						goldReward: event.gold || 0,
						goldScale: DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0,
						onWin: () => {
							if (!window.playerProgress) window.playerProgress = {};
							if (!window.playerProgress[checkEventId]) {
								window.playerProgress[checkEventId] = true;
								levelUpMainCharacter();
							}
							// 战斗胜利金币奖励
							const enemyCount = (event.enemy || []).filter(e => e && e.id).length;
							const isBoss = event.type === 'boss';
							const baseGold = event.gold || 50 + enemyCount * 30;
							const goldScale = DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0;
							const goldReward = Math.floor((isBoss ? baseGold * 2 : baseGold) * goldScale);
							window.gameGold = (window.gameGold || 0) + goldReward;
							// 事件完成后自动存档
							SaveManager.autoSave();
							Game.toast(`恭喜通关 ${DIFFICULTY_SCALE[currentDifficulty]?.name || ''}: ${event.name}！获得 ${goldReward} 金币`, 'success');
							// 重新渲染副本视图
							const dungeonView = document.getElementById('dungeon-view');
							if (dungeonView) {
								hideOtherViews('dungeon-view');
								dungeonView.style.display = 'flex';
								renderDungeonView(dungeonView, chapterKey);
							}
						},
						onLose: () => {
							Game.toast(`挑战失败: ${event.name}`, 'warning');
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
}
// 辅助函数：根据ID获取关卡名称（用于提示）
function getEventName(id) {
	// 在 SPeventList 中查找
	for (const key in SPeventList) {
		const pack = SPeventList[key].eventPack;
		if (pack && pack[id]) {
			return pack[id].name;
		}
	}
	// 如果在主线的 eventList 中查找（如果 prev 跨了主线）
	if (eventList) {
		for (const key in eventList) {
			const pack = eventList[key].eventPack;
			if (pack && pack[id]) {
				return pack[id].name;
			}
		}
	}
	return id;
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
	return { kami: '#ffff00', legend: '#ff4444', epic: '#ff8d8d', epicfake: '#ff8800', rare: '#a335ee', common: '#44aaff', junk: '#88cc88' }[rank] || '#888';
}

/**
 * 获取角色品质中文名
 */
function getRankName(rank) {
	return { legend: '传说', epic: '史诗', epicfake: '伪史诗', rare: '稀有', common: '精品', junk: '平凡' }[rank] || '精品';
}

/**
 * 刷新商店物品
 */
function refreshShopItems(type = 'normal') {
	if (!window.shopData) window.shopData = { items: [], spitems: [], refreshCost: 50 };
	const items = [];
	const spitems = [];
	// 3宝物（只售卖有 rank 的宝物）
	const allTreasureList = Game.Data.getTreasureList();
	const allTreasureIds = Object.keys(allTreasureList).filter(id => allTreasureList[id].rank);
	const selectedTreasures = allTreasureIds.sort(() => 0.5 - Math.random()).slice(0, 3);
	// 3武将
	const allCharIds = Object.keys(characterList || {}).filter(cid => characterList[cid].group != 'zhujue');
	const selectedChars = allCharIds.sort(() => 0.5 - Math.random()).slice(0, 3);
	// 2武将包（可重复）
	const allPackIds = Object.keys(ITEM_DEFS);
	const selectedPacks = [];
	for (let i = 0; i < 2 && allPackIds.length > 0; i++) {
		selectedPacks.push(allPackIds[Math.floor(Math.random() * allPackIds.length)]);
	}
	// 混合并打乱
	const allIteams = selectedTreasures.concat(selectedChars).concat(selectedPacks);
	const allProducts = [...allIteams].sort(() => Math.random() - 0.5);

	const isSp = type != 'normal';
	const target = isSp ? spitems : items;
	for (let i = 0; i < allProducts.length; i++) {
		const id = allProducts[i];
		const beilv = isSp ? (Math.floor(Math.random() * 4) + 2) : 1;
		if (id in characterList) {
			const cData = characterList[id];
			if (cData) {
				target.push({
					type: 'character',
					id: id,
					name: cData.name,
					desc: `${getRankName(cData.rank)} | HP:${cData.hp} ATK:${cData.atk} DEF:${cData.def}`,
					price: getCharPrice(cData.rank) * beilv,
					sold: false,
					number: beilv,
					rank: cData.rank,
					icon: `/image/character/${id}.jpg`,
				});
			}
		}
		else if (id in ITEM_DEFS) {
			const def = ITEM_DEFS[id];
			if (def) {
				target.push({
					type: 'item',
					id: id,
					name: def.name,
					desc: def.desc,
					price: (def.price || 200) * beilv,
					sold: false,
					number: beilv,
					emoji: def.emoji || '📦',
					icon: def.icon || '',
				});
			}
		}
		else if (id in Game.Data.getTreasureList()) {
			const tData = Game.Data.getTreasureList()[id];
			if (tData) {
				target.push({
					type: 'treasure',
					id: id,
					name: tData.name,
					desc: tData.desc,
					price: (tData.price || 200) * beilv,
					sold: false,
					number: beilv,
					icon: tData.icon || `/image/skill/${id}.png`,
				})
			}
		}
	}
	if (isSp) {
		window.shopData.spitems = spitems;
		window.shopData.refreshCost = 50;
		return spitems;
	} else {
		window.shopData.items = items;
		window.shopData.refreshCost = 50;
		return items;
	}
}

// 暴露给 system.js 调用（避免循环import）
shared.refreshTeamViewDisplay = refreshTeamViewDisplay;

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
		var str = '';
		// 宝物详情
		if(item.desc){
			if(typeof item.desc === 'function'){
				str=item.desc(item.level || 1);
			}
			else str=item.desc;
		}
		else{
			str='暂无描述';
		}
		const fallbackIcon = item.emoji || '?';
		content = `
			<div style="text-align:center;margin-bottom:15px;">
				<div style="width:80px;height:80px;margin:0 auto;border:3px solid #888;border-radius:8px;overflow:hidden;background:#444;">
					${item.icon ? `<img src="${item.icon}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='${fallbackIcon}'">` : `<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:40px;">${fallbackIcon}</span>`}
				</div>
				<h3 style="margin:10px 0 5px;color:#fff;">${item.name}</h3>
			</div>
			${str ? `<div style="padding:8px;background:#333;border-radius:6px;font-size:14px;color:#ccc;line-height:1.6;">${str}</div>` : '<div style="color:#888;text-align:center;">暂无描述</div>'}
		`;
		// 宝物详情
		// content = `
		// 	<div style="text-align:center;margin-bottom:15px;">
		// 		<div style="width:80px;height:80px;margin:0 auto;border:3px solid #888;border-radius:8px;overflow:hidden;background:#444;">
		// 			${item.icon ? `<img src="${item.icon}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='?'">` : '<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:30px;">?</span>'}
		// 		</div>
		// 		<h3 style="margin:10px 0 5px;color:#fff;">${item.name}</h3>
		// 	</div>
		// 	${item.desc ? `<div style="padding:8px;background:#333;border-radius:6px;font-size:14px;color:#ccc;line-height:1.6;">${item.desc}</div>` : '<div style="color:#888;text-align:center;">暂无描述</div>'}
		// `;
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
// function getRankColor(rank) {
//	 const colors = {
//		 'legend': '#ff4444',
//		 'epic': '#ff8d8d',
//		 'epicfake':'#ff8800',
//		 'rare': '#a335ee',
//		 'common': '#44aaff',
//		 'junk': '#88cc88'
//	 };
//	 return colors[rank] || '#fff';
// }

// 获取品质文本
function getRankText(rank) {
	const texts = {
		'junk': '废柴',
		'common': '精品',
		'rare': '稀有',
		'epicfake': '伪史诗',
		'epic': '史诗',
		'legend': '传说',
		'kami': '神品',
	};
	return texts[rank] || rank || '精品';
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
	// if (!window.shopData || !window.shopData.items || window.shopData.items.length === 0) {
	//	 refreshShopItems(window.shopMode);
	// }
	if ((!window.shopData || (window.shopMode === 'normal' && !window.shopData.items) || (window.shopMode === 'advanced' && !window.shopData.items))) {
		refreshShopItems(window.shopMode);
	}

	// 普通商店显示宝物，高级商店显示角色
	const items = window.shopData[window.shopMode == 'normal' ? 'items' : 'spitems']
	console.log('items', items)

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
		// 占位文本：宝物→宝，道具→emoji，武将→将
		const placeholderText = (it) => {
			if (!it) return '';
			if (it.type === 'treasure') return '宝';
			if (it.type === 'item') return it.emoji || '📦';
			return '将';
		};
		if (item && !item.sold && item.icon) {
			const img = document.createElement('img');
			img.src = item.icon;
			img.onerror = function () {
				this.style.display = 'none';
				imgPlaceholder.textContent = placeholderText(item);
				imgPlaceholder.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:20px;color:#888;';
			};
			imgPlaceholder.appendChild(img);
		} else if (item && !item.sold && item.type === 'item') {
			// 武将包无图片，直接用 emoji
			imgPlaceholder.textContent = item.emoji || '📦';
			imgPlaceholder.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:36px;';
		} else {
			imgPlaceholder.textContent = item ? (item.sold ? '—' : placeholderText(item)) : '';
		}
		// 点击商品图标弹出详情
		if (item && !item.sold) {
			imgPlaceholder.style.cursor = 'pointer';
			imgPlaceholder.onclick = () => {
				if (item.type === 'character') {
					const cData = characterList[item.id];
					if (cData) {
						// 【关键修改】不要直接传 cData，而是构建一个包含编译后属性的对象
						const stats = compileCharacterStats(cData);
						const displayData = {
							id: item.id,
							name: cData.name,
							rank: cData.rank,
							template: cData.template,
							tip: cData.tip,
							skills: cData.skills,
							group: cData.group,
							...cData,
							hp: stats.hp,
							atk: stats.atk,
							def: stats.def,
							spe: stats.spe,
							level: 1 // 商店购买的通常是1级
						};
						showCharDetail(null, displayData);
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

		var number = item ? item.number : 1;
		const countDiv = document.createElement('div');
		countDiv.className = 'shop-item-count';
		countDiv.textContent = number ? `数量:${number}` : '';
		headerDiv.appendChild(countDiv);

		infoDiv.appendChild(headerDiv);

		// 购买按钮逻辑
		const buyBtn = document.createElement('button');
		buyBtn.className = 'shop-item-buy-btn';
		buyBtn.textContent = item ? (item.price + '金') : '—';

		// 【关键修复】防止重复点击或逻辑混乱
		buyBtn.onclick = (e) => {
			e.stopPropagation(); // 阻止事件冒泡

			// 0. 空位保护
			if (!item) return;

			// 1. 检查是否已售出
			if (item.sold) {
				Game.toast('该商品已售出', 'warning');
				return;
			}

			// 2. 检查金币
			if ((window.gameGold || 0) < item.price) {
				Game.toast('金币不足！', 'error');
				return;
			}

			// 3. 执行购买逻辑
			buyevent(item)
			// 6. 【关键】立即刷新商店界面和金币显示
			// 先更新金币数字

			// 重新渲染整个商店视图，以反映 "sold" 状态
			// 注意：这里直接调用 renderShopView，传入当前容器
			// 假设 container 是 renderShopView 的参数
			renderShopView(container);

			// 7. 自动存档
			if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
				SaveManager.autoSave();
			}
		};

		infoDiv.appendChild(buyBtn);
		itemDiv.appendChild(infoDiv);

		gridDiv.appendChild(itemDiv);
	}

	container.appendChild(gridDiv);

	// 刷新按钮
	const downBtns = document.createElement('div');
	downBtns.className = 'shop-downBtns';
	// downBtns.cssText =`
	//	 display: flex; 
	//	 gap: 10px; 
	//	 justify-content: center; 
	//	 margin-top: 10px;
	//	 min-width: 90%;
	// `

	const allBuyBtn = document.createElement('button');
	allBuyBtn.className = 'shop-refresh-btn';

	// 1. 获取当前商店模式的物品列表
	const currentItems = window.shopData[window.shopMode === 'normal' ? 'items' : 'spitems'];

	// 2. 筛选出未售罄的商品
	const availableItems = currentItems.filter(item => !item.sold);

	// 3. 计算总价
	let num = 0;
	availableItems.forEach(item => {
		num += (item.price || 0);
	});

	// 4. 设置按钮文本和状态
	allBuyBtn.style.whiteSpace = 'pre-wrap';

	if (availableItems.length === 0) {
		// 如果没有可购买的商品
		allBuyBtn.textContent = '已售罄';
		allBuyBtn.disabled = true;
		allBuyBtn.style.opacity = '0.5';
		allBuyBtn.style.cursor = 'not-allowed';
	} else {
		// 有可购买的商品
		allBuyBtn.textContent = `一键购买\n（${num}金）`;
		allBuyBtn.disabled = false;
		allBuyBtn.style.opacity = '1';
		allBuyBtn.style.cursor = 'pointer';

		// 5. 绑定点击事件
		allBuyBtn.onclick = () => {
			// 再次检查金币（防止并发或数据变动）
			if ((window.gameGold || 0) < num) {
				Game.toast('金币不足，无法购买！', 'error');
				return;
			}

			// 6. 执行购买逻辑 (只购买未售罄的)
			let successCount = 0;
			availableItems.forEach(item => {
				// 确保调用购买函数
				if (typeof buyevent === 'function') {
					buyevent(item);
					successCount++;
				}
			});

			if (successCount > 0) {
				Game.toast(`成功购买 ${successCount} 件商品`, 'success');
			}

			// 7. 刷新界面
			renderShopView(container);

			// 8. 自动存档
			if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
				SaveManager.autoSave();
			}
		};
	}
	downBtns.appendChild(allBuyBtn);

	const refreshBtn = document.createElement('button');
	refreshBtn.className = 'shop-refresh-btn';
	var beilv = (window.shopMode === 'advanced') ? 4 : 1;
	const cost = (window.shopData.refreshCost || 50) * beilv;
	refreshBtn.textContent = `刷新商品\n（${cost}金）`;
	refreshBtn.style.whiteSpace = 'pre-wrap';
	refreshBtn.onclick = () => {
		if ((window.gameGold || 0) < cost) {
			Game.toast('金币不足，无法刷新！', 'error');
			return;
		}
		window.gameGold = (window.gameGold || 0) - cost;
		refreshShopItems(window.shopMode);
		renderShopView(container);
		Game.toast('商店已刷新', 'info');
		SaveManager.autoSave();
	};
	downBtns.appendChild(refreshBtn);

	container.appendChild(downBtns);
}

function canBuy(item) {

}
function buyevent(item) {
	if (item.type === 'character') {
		for (var i = 0; i < (item.number || 1); i++) {
			const baseChar = characterList[item.id];
			if (!baseChar) {
				Game.toast('角色数据错误', 'error');
				return;
			}

			// A. 生成唯一实例ID
			const instanceId = Game.genId(item.id);

			// B. 【核心】编译属性并创建背包数据
			const stats = compileCharacterStats(baseChar);

			window.charBagData[instanceId] = {
				charId: item.id,
				level: 1,
				// rank: baseChar.rank,
				// template: baseChar.template,
				// tip: baseChar.tip,
				// tip: baseChar.tip,
				// ties: baseChar.ties,
				// tupoList: baseChar.tupoList,

				hp: stats.hp,
				atk: stats.atk,
				def: stats.def,
				spe: stats.spe,
				currentHp: stats.hp,
				maxHp: stats.hp,
				openSpskill: false,
			};
			mergeNoOverwrite(window.charBagData[instanceId], baseChar)

			// C. 添加到图鉴 (如果 Game.Data 支持)
			if (typeof Game.Data.addToHandbook === 'function') {
				Game.Data.addToHandbook(item.id);
			}

			Game.toast(`成功招募【${baseChar.name}】！`, 'success');

		}
	}

	else if (item.type === 'treasure') {
		// 新逻辑：创建宝物实例
		const ids = Game.Bag.add(item.id, item.number || 1);
		if (ids.length > 0) {
			Game.toast(`购买了宝物【${item.name}】×${ids.length}`, 'success');
		} else {
			Game.toast('宝物系统异常', 'error');
		}
	}

	else if (item.type === 'item') {
		// 武将包等道具：加入背包
		if (Game.Data && typeof Game.Data.addItem === 'function') {
			Game.Data.addItem(item.id, item.number || 1);
			Game.toast(`购买了【${item.name}】×${item.number || 1}`, 'success');
		} else {
			Game.toast('道具系统异常', 'error');
		}
	}

	// 4. 扣除金币 (只扣一次)
	window.gameGold -= item.price;

	// 5. 标记为已售出
	item.sold = true;

	const goldDisplay = document.getElementById('shop-gold-display');
	if (goldDisplay) {
		goldDisplay.textContent = window.gameGold;
	}
}

/**
 * 授予玩家一名武将（创建背包实例并加入图鉴）
 * @param {string} charId 基础角色ID
 * @returns {string|false} 新创建的实例ID，失败返回 false
 */
function grantCharacter(charId) {
	const baseChar = characterList[charId];
	if (!baseChar) {
		Game.toast('角色数据错误', 'error');
		return false;
	}
	// A. 生成唯一实例ID
	const instanceId = Game.genId(charId);
	// B. 编译属性并创建背包数据
	const stats = compileCharacterStats(baseChar);
	window.charBagData[instanceId] = {
		charId: charId,
		level: 1,
		hp: stats.hp,
		atk: stats.atk,
		def: stats.def,
		spe: stats.spe,
		currentHp: stats.hp,
		maxHp: stats.hp,
		openSpskill: false,
	};
	mergeNoOverwrite(window.charBagData[instanceId], baseChar);
	// C. 添加到图鉴
	if (typeof Game.Data.addToHandbook === 'function') {
		Game.Data.addToHandbook(charId);
	}
	return instanceId;
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
//	 document.addEventListener('DOMContentLoaded', initEventListeners);
// } else {
//	 initEventListeners();
// }
// 修改DOM加载后的初始化
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		initEventListeners();
		// 初始显示主界面（新游戏/读取存档）
		showMainView();
	});
} else {
	initEventListeners();
	showMainView();
}

// const viewList = [
//	 'main','team','bag','dungeon','shop','settings'
// ]
//-------------------------存档
// // 修改showMainView函数
// function showMainView() {
//	 const mainView = document.getElementById('main-view');
//	 const bottomBar = document.querySelector('.ybrpg-bottom-bar');
//	 const saveView = document.getElementById('save-view');

//	 // 隐藏底部导航栏
//	 if (bottomBar) bottomBar.style.display = 'none';

//	 // 清空存档界面，防止下次进入时重复渲染
//	 if (saveView) {
//		 saveView.innerHTML = '';
//		 saveView.style.display = 'none';
//	 }

//	 // 显示主界面
//	 if (mainView) {
//		 mainView.style.display = 'flex';
//		 mainView.style.flexDirection = 'column';
//		 mainView.style.alignItems = 'center';
//		 mainView.style.justifyContent = 'center';

//		 // 清空主界面内容
//		 mainView.innerHTML = '';

//		 // 创建新游戏按钮
//		 const newGameBtn = document.createElement('button');
//		 newGameBtn.className = 'main-start-btn';
//		 newGameBtn.textContent = '新游戏';
//		 newGameBtn.onclick = () => {
//			 // 初始化新游戏
//			 initNewGame();
//			 // 显示底部导航栏，进入游戏
//			 if (bottomBar) bottomBar.style.display = 'flex';
//			 // 切换到队伍视图或其他默认视图
//			 const teamView = document.getElementById('team-view');
//			 hideOtherViews('team-view');
//			 if (teamView) teamView.style.display = 'flex';
//		 };
//		 mainView.appendChild(newGameBtn);

//		 // 创建读取存档按钮
//		 const loadGameBtn = document.createElement('button');
//		 loadGameBtn.className = 'main-start-btn';
//		 loadGameBtn.textContent = '读取存档';
//		 loadGameBtn.onclick = () => {
//			 // 显示存档界面
//			 showSaveView();
//		 };
//		 mainView.appendChild(loadGameBtn);
//	 }
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
		titleDiv.textContent = '星河之契';
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
		versionDiv.textContent = `版本号 ${window.GAME_VERSION || 'v1.0'}`;
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
	window.showFormulaDetail = true; // 属性面板显示公式，默认开启

	// 初始化宝物背包
	Game.Bag.ensureInv();
	// 在 initNewGame 函数中，初始化队伍数据后：
	window.initCharTreasureSlots = function () {
		window.charTreasureSlots = window.charTreasureSlots || {};
		// 为每个有实例的角色初始化6个空槽位
		if (window.charBagData) {
			Object.keys(window.charBagData).forEach(instId => {
				if (!window.charTreasureSlots[instId]) {
					window.charTreasureSlots[instId] = [null, null, null, null, null, null];
				}
			});
		}
	};
	// 开局福利：随机获得1名武将
	const allCharIds = Object.keys(characterList);
	const shuffledAll = [...allCharIds].sort(() => Math.random() - 0.5);
	// const pickedAll = shuffledAll.slice(0, 1);
	const pickedAll = ['zhujue'];
	pickedAll.forEach(id => {
		const base = characterList[id];
		// 修改：生成 instanceId
		const instanceId = Game.genId(id);
		// 1. 先编译基础属性
		const stats = compileCharacterStats(base);

		window.charBagData[instanceId] = {
			charId: id,
			level: 1,
			// 2. 使用编译后的属性
			// rank: base.rank || 'common',	  
			// template: base.template || 'balanced',
			// rank: base.rank||'rare',
			// template: base.template||'balanced',
			// tip: base.tip,
			// tip: baseChar.tip,
			// ties: baseChar.ties,
			// tupoList: baseChar.tupoList,

			hp: stats.hp,
			atk: stats.atk,
			def: stats.def,
			spe: stats.spe,
			// 其他字段...
			currentHp: stats.hp, // 记得初始化当前血量
			maxHp: stats.hp
		};
		mergeNoOverwrite(window.charBagData[instanceId], base)
	});
	syncTreasureEquipData();

	// 初始化商店数据
	window.shopData = { items: [], spitems: [], refreshCost: 50 };

	// 初始化队伍视图
	const teamView = document.getElementById('team-view');
	if (teamView && teamView.children.length === 0) {
		renderTeamView(teamView);
	}

	console.log('新游戏已初始化，初始角色:', pickedAll);
	// 假设主角的 charId 是 'ybsl_zhujue' (请替换为你实际的主角ID)
	const mainCharId = 'zhujue';
	// 如果背包里没有主角，先创建一个
	if (!window.charBagData || !Object.values(window.charBagData).some(inst => inst.charId === mainCharId)) {
		const mainInstId = Game.genId(mainCharId);
		const baseChar = characterList[mainCharId];
		if (baseChar) {
			// 编译属性
			const stats = compileCharacterStats(baseChar);
			window.charBagData[mainInstId] = {
				charId: mainCharId,
				level: 1,
				rank: baseChar.rank,
				template: baseChar.template,
				hp: stats.hp,
				atk: stats.atk,
				def: stats.def,
				spe: stats.spe,
				currentHp: stats.hp,
				maxHp: stats.hp,
				openSpskill: false,
			};
			mergeNoOverwrite(window.charBagData[mainInstId], baseChar)
			// 【关键】将主角强制放在队伍第一位
			window.currentTeam[0] = mainInstId;
		}
	} else {
		// 如果已有主角实例，找到它并放在第一位
		const mainInst = Object.values(window.charBagData).find(inst => inst.charId === mainCharId || inst === 'zhujue');
		if (mainInst) {
			// 从队伍其他位置移除（如果存在）
			var tmain = Object.keys(window.charBagData).filter(id => window.charBagData[id].charId === mainCharId)[0];
			window.currentTeam[0] = tmain;
		}
		refreshAllTeamSlots();
		refreshShopItems('normal');
		refreshShopItems('advanced');

	}
	// ... 保存存档等后续操作 ...
	// SaveManager.autoSave();
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
	SLOT_COUNT: Game.Data.SLOT_COUNT,

	// 获取所有手动存档（跳过索引0的自动存档）
	getAllSaves() {
		// 手动存档使用索引1-4，自动存档使用索引0
		const manualSlots = [];
		for (let i = 1; i <= this.SLOT_COUNT; i++) {
			const key = `${Game.Data.STORAGE_KEY}_${i}`;
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
		// 确保 Game.Data.data 完整
		if (!Game.Data.data || !Game.Data.data.team) {
			Game.Data.data = Game.Data.getDefaultData();
		}
		// 同步 GameData 数据
		Game.Data.data.team.members = (window.currentTeam || []).filter(Boolean);
		Game.Data.data.bag.gold = window.gameGold || 1000;
		// ========== 修复这一行 ==========
		Game.Data.data._treasureInventory = JSON.parse(JSON.stringify(window.treasureInventory || {}));
		// =================================
		Game.Data.data._charBag = JSON.parse(JSON.stringify(window.charBagData || {}));
		Game.Data.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData || {}));
		Game.Data.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData || {}));
		// 确保 charTreasureSlots 已初始化
		if (typeof ensureCharTreasureSlots === 'function') {
			Game.Bag.ensureSlots();
		}

		// ===== 【新增】保存宝物槽位数据和背包Tab =====
		Game.Data.data._charTreasureSlots = JSON.parse(JSON.stringify(window.charTreasureSlots || {}));
		if (!Game.Data.data.playerPreferences) {
			Game.Data.data.playerPreferences = {};
		}
		Game.Data.data.playerPreferences.bagTab = window.bagTab || 'char';
		// ============================================
		// 同步到 GameData
		Game.Data.data.baseInfo.saveName = `存档${slot}`;
		Game.Data.data.baseInfo.saveTime = new Date().toISOString();

		// 保存到 localStorage
		Game.Data.save(slot);

		// 兼容格式也加上
		const compatData = {
			gameVersion: window.GAME_VERSION || 'v1.0',  // 【新增】
			playerProgress: window.playerProgress || {},
			currentTeam: window.currentTeam || [null, null, null, null, null, null],
			currentDifficulty: window.currentDifficulty || 'normal',
			shopMode: window.shopMode || 'normal',
			shopData: window.shopData || { items: [], refreshCost: 50 },
			gameGold: window.gameGold || 1000,
			charTreasureSlots: window.charTreasureSlots || {},
			charBagData: window.charBagData || {},
			showFormulaDetail: window.showFormulaDetail || false,
			treasureEquipData: window.treasureEquipData || {},
			treasureBagData: window.treasureBagData || {},
			autoBattle: window.autoBattle || false,
			saveTime: new Date().toLocaleString(),
			saveName: `存档${slot}`,
			_treasureInventory: JSON.parse(JSON.stringify(window.treasureInventory || {})),
			playerPreferences: {  // 【新增】
				bagTab: window.bagTab || 'char',
				showFormulaDetail: window.showFormulaDetail !== undefined ? window.showFormulaDetail : true
			}
		};
		localStorage.setItem(`ybrpg_save_${slot}`, JSON.stringify(compatData));
		console.log(`已保存到槽位${slot}`);
		return compatData;
	},

	// 从指定槽位读取（同步到 GameData 和 window）
	loadFromSlot(slot) {
		// 使用 GameData 加载（索引0留给自动存档，手动存档从索引1开始）
		const data = Game.Data.load(slot);

		// ========== 新增：迁移旧版宝物数据 ==========
		migrateTreasuresToInstanceId();  // 在 window 变量恢复前迁移

		const compatKey = `ybrpg_save_${slot}`;
		const compatData = localStorage.getItem(compatKey);

		if (compatData) {
			const parsed = JSON.parse(compatData);
			// ===== 【新增】版本兼容性检查 =====
			const saveVersion = parsed.gameVersion;
			const compatibility = Game.UI.checkSave(saveVersion);

			if (!compatibility.compatible) {
				console.warn(`[存档加载] ${compatibility.message}`);
				// 可以在这里处理不兼容情况，比如显示警告
				if (compatibility.message) {
					setTimeout(() => {
						Game.toast(compatibility.message, 'warning');
					}, 500);
				}
			} else if (compatibility.message) {
				console.log(`[存档加载] ${compatibility.message}`);
			}

			// 【新增】恢复偏好设置
			if (parsed.playerPreferences) {
				window.bagTab = parsed.playerPreferences.bagTab || 'char';
				window.showFormulaDetail = parsed.playerPreferences.showFormulaDetail !== undefined
					? parsed.playerPreferences.showFormulaDetail : true;
			} else {
				window.bagTab = 'char';
			}
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
							const newInstanceId = Game.genId(actualCharId);
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
			window.showFormulaDetail = parsed.showFormulaDetail !== undefined ? parsed.showFormulaDetail : true;
			// window.charTreasureSlots = (data && data._charTreasureSlots) || parsed.charTreasureSlots || {};
			window.treasureEquipData = parsed.treasureEquipData || {};
			window.treasureBagData = parsed.treasureBagData || {};
			window.autoBattle = parsed.autoBattle || false;

			// 同步 window 变量回 Game.Data 内存
			Game.Data.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData));
			Game.Data.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData));
			Game.Data.data._charBag = JSON.parse(JSON.stringify(window.charBagData));

			// ========== 在解析完所有数据后，添加这一段 ==========
			// 恢复宝物实例化数据
			if (parsed._treasureInventory) {
				window.treasureInventory = JSON.parse(JSON.stringify(parsed._treasureInventory));
			} else {
				// 如果没有新格式数据，尝试从旧格式迁移
				Game.Bag.ensureInv();
				// 如果有旧格式数据，执行迁移
				if (parsed.treasureBagData && Object.keys(parsed.treasureBagData).length > 0) {
					Object.entries(parsed.treasureBagData).forEach(([baseId, data]) => {
						if (!data || !data.count) return;
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
				}
			}
			// 关键修复：恢复宝物槽位数据
			window.charTreasureSlots = parsed.charTreasureSlots || {};
			if (parsed._charTreasureSlots) {
				window.charTreasureSlots = JSON.parse(JSON.stringify(parsed._charTreasureSlots));
			}
		} else if (data) {
			// 如果只有 GameData 格式，从 GameData 恢复 window 变量
			window.currentTeam = [...(data.team?.members || []), ...Array(6).fill(null)].slice(0, 6);
			window.gameGold = data.bag?.gold || 1000;
			window.charBagData = data._charBag || {};
			window.treasureEquipData = data._treasures || {};
			window.treasureBagData = data._treasureBag || {};
			// 【新增】恢复偏好设置
			const prefs = data.playerPreferences || data._playerPreferences || {};
			window.bagTab = prefs.bagTab || 'char';
			window.showFormulaDetail = prefs.showFormulaDetail !== undefined ? prefs.showFormulaDetail : true;
		}

		// 确保 Game.Data 内存与存档数据一致
		if (data) {
			const defaults = Game.Data.getDefaultData();
			Game.Data.data = { ...defaults, ...data, team: { ...defaults.team, ...data.team }, bag: { ...defaults.bag, ...data.bag }, baseInfo: { ...defaults.baseInfo, ...data.baseInfo } };
		}

		// ========== 新增：同步宝物数据到 window ==========
		syncTreasureEquipData();

		console.log(`已读取槽位${slot}的存档`);
		return data || JSON.parse(compatData || 'null');
	},


	// 删除指定槽位存档
	deleteSlot(slot) {
		Game.Data.deleteSave(slot); // 索引0留给自动存档，手动存档从索引1开始
		localStorage.removeItem(`ybrpg_save_${slot}`);
		console.log(`已删除槽位${slot}的存档`);
	},

	// ====== 自动存档 ======
	AUTO_KEY: 'ybrpg_autosave',

	autoSave() {
		// 确保 Game.Data.data 完整
		if (!Game.Data.data || !Game.Data.data.team) {
			Game.Data.data = Game.Data.getDefaultData();
		}
	// 【新增】保存当前的背包Tab状态
	if (!Game.Data.data.playerPreferences) {
		Game.Data.data.playerPreferences = {};
	}
	Game.Data.data.playerPreferences.bagTab = window.bagTab || 'char';

		// 迁移旧数据：如果索引0存的是手动存档（旧逻辑），迁移到索引1
		const slot0Raw = localStorage.getItem(`${Game.Data.STORAGE_KEY}_0`);
		if (slot0Raw) {
			try {
				const oldData = JSON.parse(slot0Raw);
				if (oldData.baseInfo?.saveName && oldData.baseInfo.saveName !== '自动存档') {
					// 旧的手动存档，迁移到索引1（如果索引1为空）
					const slot1Raw = localStorage.getItem(`${Game.Data.STORAGE_KEY}_1`);
					if (!slot1Raw) {
						localStorage.setItem(`${Game.Data.STORAGE_KEY}_1`, slot0Raw);
						console.log('[自动存档] 已将旧手动存档从索引0迁移到索引1');
					}
				}
			} catch (e) { /* 忽略解析错误 */ }
		}
		// 确保数据最新
		if (typeof ensureCharTreasureSlots === 'function') {
			Game.Bag.ensureSlots();
		}

		// 同步 GameData 数据
		Game.Data.data.team.members = (window.currentTeam || []).filter(Boolean);
		Game.Data.data.bag.gold = window.gameGold || 1000;
		Game.Data.data._treasureInventory = JSON.parse(JSON.stringify(window.treasureInventory || {}));  // 【新增】
		Game.Data.data._charBag = JSON.parse(JSON.stringify(window.charBagData || {}));
		Game.Data.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData || {}));
		Game.Data.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData || {}));
		Game.Data.data._charTreasureSlots = JSON.parse(JSON.stringify(window.charTreasureSlots || {}));  // 【新增】
		Game.Data.data.baseInfo.saveName = '自动存档';
		Game.Data.data.baseInfo.saveTime = new Date().toISOString();

		Game.Data.save(0);


		// 兼容格式
		const compatData = {
			gameVersion: window.GAME_VERSION || 'v1.0',  // 【新增】
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
			showFormulaDetail: window.showFormulaDetail || false,
			saveTime: new Date().toLocaleString(),
			saveName: '自动存档',
			_treasureInventory: JSON.parse(JSON.stringify(window.treasureInventory || {})),
			charTreasureSlots: window.charTreasureSlots || {},
			playerPreferences: {
				bagTab: window.bagTab || 'char',
				showFormulaDetail: window.showFormulaDetail !== undefined ? window.showFormulaDetail : true
			}
		};
		localStorage.setItem(SaveManager.AUTO_KEY, JSON.stringify(compatData));

		console.log('[自动存档] 已保存');
	},

	loadAutoSave() {
		// 直接读取 localStorage，避免 Game.Data.load() 覆盖内存数据
		const key = `${Game.Data.STORAGE_KEY}_0`;
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		let data;
		try { data = JSON.parse(raw); } catch { return null; }

		if (data && data.baseInfo?.saveName === '自动存档') {
			// ========== 新增：先迁移宝物数据（在恢复 window 之前） ==========
			Game.Data.data = data;  // 临时置入 data，方便迁移函数读取
			migrateTreasuresToInstanceId();
			data = Game.Data.data;  // 更新后的数据

			// 恢复 window 变量
			const compatKey = SaveManager.AUTO_KEY;
			const compatData = localStorage.getItem(compatKey);
			if (compatData) {
				const parsed = JSON.parse(compatData);

				// ===== 【新增】版本兼容性检查 =====
				const saveVersion = parsed.gameVersion;
				const compatibility = Game.UI.checkSave(saveVersion);

				if (!compatibility.compatible) {
					console.warn(`[存档加载] ${compatibility.message}`);
					// 可以在这里处理不兼容情况，比如显示警告
					if (compatibility.message) {
						setTimeout(() => {
							Game.toast(compatibility.message, 'warning');
						}, 500);
					}
				} else if (compatibility.message) {
					console.log(`[存档加载] ${compatibility.message}`);
				}
				// 【新增】恢复偏好设置
				if (parsed.playerPreferences) {
					window.bagTab = parsed.playerPreferences.bagTab || 'char';
					window.showFormulaDetail = parsed.playerPreferences.showFormulaDetail !== undefined
						? parsed.playerPreferences.showFormulaDetail : true;
				} else {
					window.bagTab = 'char';
				}

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
								const newInstanceId = Game.genId(actualCharId);
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
				window.showFormulaDetail = parsed.showFormulaDetail !== undefined ? parsed.showFormulaDetail : true;
				window.currentDifficulty = parsed.currentDifficulty || 'normal';
				window.shopMode = parsed.shopMode || 'normal';
				window.shopData = parsed.shopData || { items: [], refreshCost: 50 };
				window.gameGold = parsed.gameGold || 1000;
				window.charBagData = charBag;
				window.treasureEquipData = parsed.treasureEquipData || {};
				window.treasureBagData = parsed.treasureBagData || {};
				window.autoBattle = parsed.autoBattle || false;
				// ========== 在解析完所有数据后，添加这一段 ==========
				// 恢复宝物实例化数据
				if (parsed._treasureInventory) {
					window.treasureInventory = JSON.parse(JSON.stringify(parsed._treasureInventory));
				} else {
					Game.Bag.ensureInv();
					// 如果有旧格式数据，执行迁移
					if (parsed.treasureBagData && Object.keys(parsed.treasureBagData).length > 0) {
						Object.entries(parsed.treasureBagData).forEach(([baseId, data]) => {
							if (!data || !data.count) return;
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
					}
				}
				// ... 您现有的恢复代码（恢复 playerProgress, currentTeam 等）...

				// ========== 新增：恢复宝物槽位数据 ==========
				window.charTreasureSlots = parsed.charTreasureSlots || {};

				// 如果 Game.Data 中也有，也同步一下
				if (Game.Data.data && Game.Data.data._charTreasureSlots) {
					window.charTreasureSlots = JSON.parse(JSON.stringify(Game.Data.data._charTreasureSlots));
				}

				// 确保数据结构完整
				if (typeof ensureCharTreasureSlots === 'function') {
					Game.Bag.ensureSlots();
				}
				// ==========================================
			} else {
				window.currentTeam = [...(data.team?.members || []), ...Array(6).fill(null)].slice(0, 6);
				window.gameGold = data.bag?.gold || 1000;
				window.charBagData = data._charBag || {};
				window.treasureEquipData = data._treasures || {};
				window.treasureBagData = data._treasureBag || {};
				window.autoBattle = parsed.autoBattle || false;  // ✅ 使用 window.autoBattle 保持原值

				// 【新增】恢复偏好设置
				const prefs2 = data.playerPreferences || data._playerPreferences || {};
				window.bagTab = prefs2.bagTab || 'char';
				window.showFormulaDetail = prefs2.showFormulaDetail !== undefined ? prefs2.showFormulaDetail : true;
			}

			// 同步到 Game.Data 内存（确保结构完整）
			const defaults = Game.Data.getDefaultData();
			Game.Data.data = { ...defaults, ...data, team: { ...defaults.team, ...data.team }, bag: { ...defaults.bag, ...data.bag }, baseInfo: { ...defaults.baseInfo, ...data.baseInfo } };

			// ========== 新增：同步宝物数据 ==========
			syncTreasureEquipData();

			console.log('[自动存档] 已读取');
			return data;
		}
		return null;
	},


	hasAutoSave() {
		// 直接读取 localStorage，避免 Game.Data.load() 的副作用
		const key = `${Game.Data.STORAGE_KEY}_0`;
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
	const treasures = Game.Data.data._treasures;
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

	// 替换 Game.Data 中的宝物数据
	Game.Data.data._treasures = newTreasures;
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
			try { return JSON.parse(localStorage.getItem(`${Game.Data.STORAGE_KEY}_0`)); } catch { return null; }
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
			Game.toast('已读取自动存档', 'success');
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

			// ===== 【新增】版本号显示 =====
			const versionEl = document.createElement('div');
			versionEl.className = 'save-version';
			versionEl.style.cssText = 'font-size:10px;color:#666;margin-top:2px;';
			versionEl.textContent = `版本: ${save.data.gameVersion || '旧版'}`;
			infoDiv.appendChild(versionEl);
			// =============================
			saveSlot.appendChild(infoDiv);

			// 读取按钮
			const loadBtn = document.createElement('button');
			loadBtn.className = 'save-action-btn';
			loadBtn.textContent = '读取';
			loadBtn.onclick = () => {
				SaveManager.loadFromSlot(i);
				Game.toast(`已读取存档${i}`, 'success');
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
						Game.toast('当前没有游戏进度，请先开始游戏', 'warning');
						return;
					}
					SaveManager.saveToSlot(i);
					Game.toast(`已保存到存档${i}`, 'success');
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
					Game.confirmDialog(`确定要删除存档${i}吗？`, () => {
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
						Game.toast('当前没有游戏进度，请先开始游戏', 'warning');
						return;
					}
					SaveManager.saveToSlot(i);
					Game.toast(`已保存到存档${i}`, 'success');
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
 * 背包武将详情弹窗（带升级功能）
 * @param {string} instanceId - 角色实例ID
 * @param {string} charId - 角色基础ID
 */
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
		const newLevel = currentLevel + totalLevel;

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
		Game.toast(`${characterList[targetCharId]?.name} 已升至 ${newLevel} 级！`, 'success');

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
		const newLevel = currentLevel + totalLevel;
		if (countLabel) countLabel.textContent = `已选: ${totalLevel} 将升至 ${newLevel}级`;
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
	const oldLevel = instData.level || 1;
	instData.level = oldLevel + 1;

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

	// 2. 提升等级
	const oldLevel = instData.level || 1;
	const newLevel = oldLevel + levelsToAdd;

	// 可选：设置等级上限，例如 100 级
	const MAX_LEVEL = 100;
	if (newLevel > MAX_LEVEL) {
		Game.toast(`角色已达到最高等级 ${MAX_LEVEL}`, 'warning');
		return false;
	}

	instData.level = newLevel;

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
		instData.tupoList = newTupoList.slice();

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
Game.SaveManager = SaveManager;
