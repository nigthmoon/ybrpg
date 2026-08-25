/**
 * 道具定义列表 (item.js)
 * 承载所有可用道具（消耗品 / 礼包等）。
 *
 * 道具字段说明：
 *   id:		   道具唯一ID（与背包 bag.items 的 key 对应）
 *   name:	   道具名称
 *   emoji:	  道具图标（emoji 占位，无图片时使用）
 *   icon:	   图标路径（可选，留空则用 emoji）
 *   desc:	   描述
 *   rank:	   限定品质（legend/epic/epicfake/rare）；null 表示不限（全武将自选）
 *   selectable: 是否自选武将（true 时从候选中手动选择要获得的武将）
 */

import { characterList } from './characterList.js';
import { Game } from './core.js';

// 品质边框/文字颜色（与背包武将卡片保持一致）
const RANK_COLORS = {
	kami: '#ffff00',
	legend: '#ff4444',
	epic: '#ff8d8d',
	epicfake: '#ff8800',
	rare: '#a335ee',
	common: '#44aaff',
	junk: '#88cc88',
};

// ==================== 道具定义 ====================
export const ITEM_DEFS = {
	pack_legend: {
		id: 'pack_legend',
		name: '传说武将包',
		emoji: '🌟',
		desc: '开启后，可从【传说】品质武将中任选一名获得。拥有多个时可选择开启数量。',
		rank: 'legend',
		selectable: true,
		icon: '/image/header/dj_60404.png',
		price: { gold: 500 },
	},
	pack_epic: {
		id: 'pack_epic',
		name: '史诗武将包',
		emoji: '💜',
		desc: '开启后，可从【史诗】品质武将中任选一名获得。拥有多个时可选择开启数量。',
		rank: 'epic',
		selectable: true,
		icon: '/image/header/dj_60403.png',
		price: { gold: 300 },
	},
	pack_epicfake: {
		id: 'pack_epicfake',
		name: '伪史诗武将包',
		emoji: '🧡',
		desc: '开启后，可从【伪史诗】品质武将中任选一名获得。拥有多个时可选择开启数量。',
		rank: 'epicfake',
		selectable: true,
		icon: '/image/header/dj_60402.png',
		price: { gold: 250 },
	},
	pack_rare: {
		id: 'pack_rare',
		name: '稀有武将包',
		emoji: '💎',
		desc: '开启后，可从【稀有】品质武将中任选一名获得。拥有多个时可选择开启数量。',
		rank: 'rare',
		selectable: true,
		icon: '/image/header/dj_60401.png',
		price: { gold: 200 },
	},
	pack_all: {
		id: 'pack_all',
		name: '全武将自选包',
		emoji: '🎁',
		desc: '开启后，可从全部已收录武将中任选一名获得。拥有多个时可选择开启数量。',
		rank: null,
		selectable: true,
		icon: '/image/header/dj_60306.png',
		price: { gold: 600 },
	},

	// ===================== 体力瓶 =====================
	item_stamina: {
		id: 'item_stamina',
		name: '体力瓶',
		price: { diamond: 25 },
		emoji: '🧪',
		icon: '/image/header/dj_30006.png',
		kind: 'stamina',
		selectable: false,
		desc: '使用后恢复 25 点体力（可一次使用多个）',
	},

	// ===================== 宝物箱（按品质分类，硬编码可选宝物） =====================
	// rank1
	box_r1_random: {
		id: 'box_r1_random',
		name: '平凡宝物箱(随机)',
		price: { gold: 200 },
		emoji: '📦',
		icon: '/image/header/dj_20030.png',
		kind: 'treasurebox',
		mode: 'random',
		rank: 1,
		selectable: false,
		contents: ['bw_10501', 'bw_10502', 'bw_20501', 'bw_20502'],
		desc: '随机开出 1 件 rank1 宝物',
	},
	box_r1_pick: {
		id: 'box_r1_pick',
		name: '平凡宝物箱(定向)',
		price: { gold: 240 },
		emoji: '📦',
		icon: '/image/header/dj_20019.png',
		kind: 'treasurebox',
		mode: 'pick',
		rank: 1,
		selectable: false,
		contents: ['bw_10501', 'bw_10502', 'bw_20501', 'bw_20502'],
		desc: '自选 1 件 rank1 宝物（×1.2 价）',
	},
	// rank2
	box_r2_random: {
		id: 'box_r2_random',
		name: '精品宝物箱(随机)',
		price: { gold: 800 },
		emoji: '📦',
		icon: '/image/header/dj_20031.png',
		kind: 'treasurebox',
		mode: 'random',
		rank: 2,
		selectable: false,
		contents: ['bw_10606', 'bw_10607', 'bw_10608', 'bw_20605', 'bw_20606', 'bw_20607'],
		desc: '随机开出 1 件 rank2 宝物',
	},
	box_r2_pick: {
		id: 'box_r2_pick',
		name: '精品宝物箱(定向)',
		price: { gold: 960 },
		emoji: '📦',
		icon: '/image/header/dj_20020.png',
		kind: 'treasurebox',
		mode: 'pick',
		rank: 2,
		selectable: false,
		contents: ['bw_10606', 'bw_10607', 'bw_10608', 'bw_20605', 'bw_20606', 'bw_20607'],
		desc: '自选 1 件 rank2 宝物（×1.2 价）',
	},
	// rank3
	box_r3_random: {
		id: 'box_r3_random',
		name: '稀有宝物箱(随机)',
		price: { diamond: 5 },
		emoji: '📦',
		icon: '/image/header/dj_20032.png',
		kind: 'treasurebox',
		mode: 'random',
		rank: 3,
		selectable: false,
		contents: [
			'bw_11012', 'bw_11013', 'bw_11014', 'bw_11109', 'bw_11110', 'bw_11111',
			'bw_21012', 'bw_21013', 'bw_21014', 'bw_21109', 'bw_21110', 'bw_21111'
		],
		desc: '随机开出 1 件 rank3 宝物',
	},
	box_r3_pick: {
		id: 'box_r3_pick',
		name: '稀有宝物箱(定向)',
		price: { diamond: 6 },
		emoji: '📦',
		icon: '/image/header/dj_20021.png',
		kind: 'treasurebox',
		mode: 'pick',
		rank: 3,
		selectable: false,
		contents: [
			'bw_11012', 'bw_11013', 'bw_11014', 'bw_11109', 'bw_11110', 'bw_11111',
			'bw_21012', 'bw_21013', 'bw_21014', 'bw_21109', 'bw_21110', 'bw_21111'
		],
		desc: '自选 1 件 rank3 宝物（×1.2 价）',
	},
	// rank4
	box_r4_random: {
		id: 'box_r4_random',
		name: '史诗宝物箱(随机)',
		price: { diamond: 40 },
		emoji: '📦',
		icon: '/image/header/dj_20033.png',
		kind: 'treasurebox',
		mode: 'random',
		rank: 4,
		selectable: false,
		contents: [
			'bw_11615', 'bw_11616', 'bw_11617', 'bw_11618', 'bw_11619', 'bw_11620',
			'bw_11621', 'bw_11622', 'bw_11623', 'bw_11624',
			'bw_21615', 'bw_21616', 'bw_21617', 'bw_21618', 'bw_21619', 'bw_21620',
			'bw_21621', 'bw_21622', 'bw_21623', 'bw_21624'
		],
		desc: '随机开出 1 件 rank4 宝物',
	},
	box_r4_pick: {
		id: 'box_r4_pick',
		name: '史诗宝物箱(定向)',
		price: { diamond: 48 },
		emoji: '📦',
		icon: '/image/header/dj_20022.png',
		kind: 'treasurebox',
		mode: 'pick',
		rank: 4,
		selectable: false,
		contents: [
			'bw_11615', 'bw_11616', 'bw_11617', 'bw_11618', 'bw_11619', 'bw_11620',
			'bw_11621', 'bw_11622', 'bw_11623', 'bw_11624',
			'bw_21615', 'bw_21616', 'bw_21617', 'bw_21618', 'bw_21619', 'bw_21620',
			'bw_21621', 'bw_21622', 'bw_21623', 'bw_21624'
		],
		desc: '自选 1 件 rank4 宝物（×1.2 价）',
	},
	// rank5（仅定向）
	box_r5_pick: {
		id: 'box_r5_pick',
		name: '传说宝物箱(定向)',
		price: { diamond: 100 },
		emoji: '📦',
		icon: '/image/header/dj_20023.png',
		kind: 'treasurebox',
		mode: 'pick',
		rank: 5,
		selectable: false,
		contents: ['bw_12025', 'bw_12026', 'bw_12027', 'bw_22025', 'bw_22026', 'bw_22027'],
		desc: '自选 1 件 rank5 宝物',
	},
	// rank6（仅定向）
	box_r6_pick: {
		id: 'box_r6_pick',
		name: '尊品宝物箱(定向)',
		price: { diamond: 200 },
		emoji: '📦',
		icon: '/image/header/dj_20024.png',
		kind: 'treasurebox',
		mode: 'pick',
		rank: 6,
		selectable: false,
		contents: ['bw_13028', 'bw_13029', 'bw_13030', 'bw_23028', 'bw_23029', 'bw_23030'],
		desc: '自选 1 件 rank6 宝物',
	},
};

export function getItemDef(itemId) {
	return ITEM_DEFS[itemId] || null;
}

// 渲染道具图标：优先使用图片 icon，否则回退 emoji
function renderItemIcon(iconDiv, def) {
	if (!iconDiv) return;
	iconDiv.innerHTML = '';
	if (def && def.icon) {
		const img = document.createElement('img');
		img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
		img.src = def.icon;
		img.alt = def.name || '';
		img.onerror = () => { iconDiv.textContent = def.emoji || '📦'; };
		iconDiv.appendChild(img);
	} else {
		iconDiv.textContent = (def && def.emoji) || '📦';
	}
}

/**
 * 根据道具定义，筛选可获得的候选武将ID列表
 * - 排除 isFixed（主角等固定角色）
 * - rank 有值时按品质筛选，为 null 时返回全部
 */
function getCandidateChars(itemDef) {
	return Object.keys(characterList).filter(charId => {
		const c = characterList[charId];
		if (!c || c.isFixed) return false;
		if (itemDef.rank) {
			return c.rank === itemDef.rank;
		}
		return true;
	});
}

// ==================== 背包「道具」标签内容渲染 ====================
export function renderBagItemContent(container) {
	window._lastBagContainer = container;
	container.innerHTML = ''; // 先清空，避免刷新时把新列表追加到旧列表之后造成视觉残留
	const inventory = (Game.Data && Game.Data.getInventory()) || {};
	const itemIds = Object.keys(inventory).filter(id => inventory[id] > 0 && ITEM_DEFS[id]);

	const scrollDiv = document.createElement('div');
	scrollDiv.className = 'bag-char-scroll';

	const grid = document.createElement('div');
	grid.className = 'gallery-grid';

	if (itemIds.length === 0) {
		const emptyTip = document.createElement('div');
		emptyTip.style.cssText = 'color:#666;font-size:13px;text-align:center;padding:20px;';
		emptyTip.textContent = '暂无道具';
		grid.appendChild(emptyTip);
	} else {
		itemIds.forEach(itemId => {
			const def = ITEM_DEFS[itemId];
			const count = inventory[itemId];

			const card = document.createElement('div');
			card.className = 'gallery-char-card';
			card.dataset.itemId = itemId;
			card.style.cursor = 'pointer';

			const iconDiv = document.createElement('div');
			iconDiv.className = 'gallery-char-icon';
			renderItemIcon(iconDiv, def);
			card.appendChild(iconDiv);

			// 数量角标
			const countBadge = document.createElement('div');
			countBadge.className = 'charbag-level-badge';
			countBadge.style.cssText = 'position:absolute;top:2px;right:2px;bottom:auto;left:auto;background:rgba(0,0,0,0.7);color:#fff;border-radius:8px;padding:0 5px;font-size:11px;';
			countBadge.textContent = '×' + count;
			iconDiv.appendChild(countBadge);

			const nameDiv = document.createElement('div');
			nameDiv.className = 'gallery-char-name';
			nameDiv.textContent = def.name;
			card.appendChild(nameDiv);

			card.onclick = () => {
				updateBagItemDetailBar(def, count);
				document.querySelectorAll('.gallery-char-card.selected').forEach(c => c.classList.remove('selected'));
				card.classList.add('selected');
			};

			grid.appendChild(card);
		});
	}

	scrollDiv.appendChild(grid);
	container.appendChild(scrollDiv);
}

// 更新底部道具详情横框
export function updateBagItemDetailBar(itemDef, count) {
	const detailBar = document.getElementById('bag-detail-bar');
	if (!detailBar) return;
	detailBar.dataset.itemId = itemDef.id;
	detailBar.dataset.charId = '';
	detailBar.dataset.instanceId = '';

	const iconDiv = detailBar.querySelector('.bag-detail-icon');
	if (iconDiv) {
		renderItemIcon(iconDiv, itemDef);
	}
	const nameEl = detailBar.querySelector('.bag-detail-name');
	if (nameEl) {
		nameEl.innerHTML = '';
		const nameSpan = document.createElement('span');
		nameSpan.style.color = '#ffd700'; // 名称：金色
		nameSpan.textContent = itemDef.name;
		nameEl.appendChild(nameSpan);
		const countSpan = document.createElement('span');
		countSpan.style.color = '#fff'; // 数量：白色，不与名称同色
		countSpan.textContent = ` ×${count}`;
		nameEl.appendChild(countSpan);
	}
	const descEl = detailBar.querySelector('.bag-detail-desc');
	if (descEl) {
		descEl.textContent = itemDef.desc;
	}
}

// 使用道具后刷新底部预览栏：数量为 0 则清空，否则重新渲染
export function refreshBagItemDetailAfterUse(itemId) {
	const detailBar = document.getElementById('bag-detail-bar');
	if (!detailBar) return;
	if (detailBar.dataset.itemId !== itemId) return; // 预览的不是该道具，不处理
	const remain = (Game.Data && Game.Data.getItemCount) ? Game.Data.getItemCount(itemId) : 0;
	if (remain <= 0) {
		clearBagItemDetailBar();
	} else {
		const def = ITEM_DEFS[itemId];
		if (def) updateBagItemDetailBar(def, remain);
	}
}

// 清空底部道具预览栏（数量清零后调用）
export function clearBagItemDetailBar() {
	const detailBar = document.getElementById('bag-detail-bar');
	if (!detailBar) return;
	detailBar.dataset.itemId = '';
	detailBar.dataset.charId = '';
	detailBar.dataset.instanceId = '';
	const iconDiv = detailBar.querySelector('.bag-detail-icon');
	if (iconDiv) iconDiv.textContent = '?';
	const nameEl = detailBar.querySelector('.bag-detail-name');
	if (nameEl) { nameEl.textContent = '空空如也'; nameEl.style.color = ''; }
	const descEl = detailBar.querySelector('.bag-detail-desc');
	if (descEl) descEl.textContent = '';
}

// ==================== 使用道具（开启礼包） ====================
export function useItem(itemId) {
	if (!itemId) {
		Game.toast('请先选择道具', 'warning');
		return;
	}
	const def = ITEM_DEFS[itemId];
	if (!def) {
		Game.toast('道具数据异常', 'error');
		return;
	}
	const owned = (Game.Data && Game.Data.getItemCount(itemId)) || 0;
	if (owned <= 0) {
		Game.toast('没有该道具', 'warning');
		return;
	}

	// 按道具类型分派开启逻辑
	if (def.kind === 'stamina') {
		buildStaminaDialog(def, owned);
		return;
	}
	if (def.kind === 'treasurebox') {
		if (def.mode === 'random') {
			buildRandomBoxDialog(def, owned);
		} else if (def.mode === 'pick') {
			buildPickBoxDialog(def, owned);
		} else {
			Game.toast('宝物箱类型异常', 'error');
		}
		return;
	}

	// 默认：武将包（原逻辑）
	const candidates = getCandidateChars(def);
	if (candidates.length === 0) {
		Game.toast('暂无可获得的武将', 'warning');
		return;
	}

	buildOpenDialog(def, owned, candidates);
}

// ===================== 体力瓶：数量选择后恢复体力 =====================
function buildStaminaDialog(def, owned) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';
	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';

	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#7fffd4;margin-bottom:8px;text-align:center;';
	title.textContent = `使用【${def.name}】`;
	dialog.appendChild(title);

	let quantity = 1;
	const stepper = document.createElement('div');
	stepper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:3px;margin:8px 0;flex-wrap:nowrap;';
	const mkBtn = (txt, step, css) => {
		const b = document.createElement('button');
		b.className = 'ybrpg-confirm-btn';
		b.textContent = txt;
		b.style.cssText = `padding:0 6px;height:26px;font-size:13px;border:1px solid #555;white-space:nowrap;${css || ''}`;
		b.onclick = () => syncQty((txt === '全选') ? owned : quantity + step);
		return b;
	};
	const minus10 = mkBtn('−10', -10);
	const minus = mkBtn('−1', -1);
	const qtyEl = document.createElement('div');
	qtyEl.style.cssText = 'font-size:20px;font-weight:bold;color:#fff;min-width:30px;text-align:center;';
	qtyEl.textContent = '1';
	const plus = mkBtn('+1', 1);
	const plus10 = mkBtn('+10', 10);
	const allBtn = mkBtn('全选', 0);
	const syncQty = (v) => {
		quantity = Math.max(1, Math.min(owned, v));
		qtyEl.textContent = String(quantity);
		tip.textContent = `每个恢复 25 点体力（本次 +${quantity * 25}）`;
	};
	stepper.appendChild(minus10); stepper.appendChild(minus); stepper.appendChild(qtyEl); stepper.appendChild(plus); stepper.appendChild(plus10); stepper.appendChild(allBtn);
	dialog.appendChild(stepper);

	const tip = document.createElement('div');
	tip.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-bottom:6px;';
	tip.textContent = `每个恢复 25 点体力（本次 +${quantity * 25}）`;
	dialog.appendChild(tip);

	const confirmBtn = document.createElement('button');
	confirmBtn.className = 'ybrpg-confirm-btn';
	confirmBtn.textContent = '确定';
	confirmBtn.style.cssText = 'background:#d32f2f;';
	confirmBtn.onclick = () => {
		if (quantity > owned) { Game.toast('数量超过拥有数', 'warning'); return; }
		// 允许超出体力上限（超出部分不自然恢复，regenStamina 会保留存量）
		window.stamina = (window.stamina || 0) + quantity * 25;
		// 重置体力恢复时间轴，避免与本次手动补充叠加导致显示异常
		window.staminaTs = Date.now();
		if (Game.Data && Game.Data.removeItem) Game.Data.removeItem(def.id, quantity);
		if (typeof ensureResourceHUD === 'function') ensureResourceHUD();
		if (typeof updateResourceHUD === 'function') updateResourceHUD();
		if (Game.SaveManager && Game.SaveManager.autoSave) Game.SaveManager.autoSave();
		Game.toast(`使用 ${quantity} 个体力瓶，恢复 ${quantity * 25} 点体力`, 'success');
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		// 刷新背包页
		if (typeof renderBagItemContent === 'function' && window._lastBagContainer) {
			renderBagItemContent(window._lastBagContainer);
		}
		// 刷新底部预览栏（数量为 0 则清空）
		if (typeof refreshBagItemDetailAfterUse === 'function') refreshBagItemDetailAfterUse(def.id);
	};
	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'ybrpg-confirm-btn';
	cancelBtn.textContent = '取消';
	cancelBtn.onclick = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:10px;';
	btnRow.appendChild(confirmBtn); btnRow.appendChild(cancelBtn);
	dialog.appendChild(btnRow);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

// ===================== 宝物箱（随机）：数量选择后多次随机 =====================
function buildRandomBoxDialog(def, owned) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';
	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';

	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#ffd700;margin-bottom:8px;text-align:center;';
	title.textContent = `开启【${def.name}】`;
	dialog.appendChild(title);

	let quantity = 1;
	const stepper = document.createElement('div');
	stepper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:3px;margin:8px 0;flex-wrap:nowrap;';
	const mkBtn = (txt, step, css) => {
		const b = document.createElement('button');
		b.className = 'ybrpg-confirm-btn';
		b.textContent = txt;
		b.style.cssText = `padding:0 6px;height:26px;font-size:13px;border:1px solid #555;white-space:nowrap;${css || ''}`;
		b.onclick = () => syncQty((txt === '全选') ? owned : quantity + step);
		return b;
	};
	const minus10 = mkBtn('−10', -10);
	const minus = mkBtn('−1', -1);
	const qtyEl = document.createElement('div');
	qtyEl.style.cssText = 'font-size:20px;font-weight:bold;color:#fff;min-width:30px;text-align:center;';
	qtyEl.textContent = '1';
	const plus = mkBtn('+1', 1);
	const plus10 = mkBtn('+10', 10);
	const allBtn = mkBtn('全选', 0);
	const syncQty = (v) => {
		quantity = Math.max(1, Math.min(owned, v));
		qtyEl.textContent = String(quantity);
	};
	stepper.appendChild(minus10); stepper.appendChild(minus); stepper.appendChild(qtyEl); stepper.appendChild(plus); stepper.appendChild(plus10); stepper.appendChild(allBtn);
	dialog.appendChild(stepper);

	const tip = document.createElement('div');
	tip.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-bottom:6px;';
	tip.textContent = '随机开出，每个箱子随机获得 1 件宝物';
	dialog.appendChild(tip);

	const confirmBtn = document.createElement('button');
	confirmBtn.className = 'ybrpg-confirm-btn';
	confirmBtn.textContent = '确定';
	confirmBtn.style.cssText = 'background:#d32f2f;';
	confirmBtn.onclick = () => {
		if (quantity > owned) { Game.toast('数量超过拥有数', 'warning'); return; }
		const got = [];
		for (let i = 0; i < quantity; i++) {
			const id = def.contents[Math.floor(Math.random() * def.contents.length)];
			if (id && Game.Data && typeof Game.Data.addTreasure === 'function') Game.Data.addTreasure(id, 1);
			got.push(id);
		}
		if (Game.Data && Game.Data.removeItem) Game.Data.removeItem(def.id, quantity);
		if (Game.SaveManager && Game.SaveManager.autoSave) Game.SaveManager.autoSave();
		const names = got.map(id => (Game.Bag.defs()[id] && Game.Bag.defs()[id].name) || id).join('、');
		Game.toast(`开启 ${quantity} 个，获得：${names}`, 'success');
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		if (typeof renderBagItemContent === 'function' && window._lastBagContainer) {
			renderBagItemContent(window._lastBagContainer);
		}
		if (typeof refreshBagItemDetailAfterUse === 'function') refreshBagItemDetailAfterUse(def.id);
	};
	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'ybrpg-confirm-btn';
	cancelBtn.textContent = '取消';
	cancelBtn.onclick = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:10px;';
	btnRow.appendChild(confirmBtn); btnRow.appendChild(cancelBtn);
	dialog.appendChild(btnRow);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

// ===================== 宝物箱（定向）：选宝物 + 选数量，直接开出该宝物 =====================
function buildPickBoxDialog(def, owned, candidates) {
	const cand = candidates || (def.contents || []);
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';
	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';
	dialog.style.cssText = 'width:360px;max-height:82vh;display:flex;flex-direction:column;overflow:hidden;';

	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#ffd700;margin-bottom:8px;text-align:center;';
	title.textContent = `开启【${def.name}】`;
	dialog.appendChild(title);

	// 数量选择
	let quantity = 1;
	const stepper = document.createElement('div');
	stepper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:3px;margin:8px 0;flex-wrap:nowrap;';
	const mkBtn = (txt, step, css) => {
		const b = document.createElement('button');
		b.className = 'ybrpg-confirm-btn';
		b.textContent = txt;
		b.style.cssText = `padding:0 6px;height:26px;font-size:13px;border:1px solid #555;white-space:nowrap;${css || ''}`;
		b.onclick = () => syncQty((txt === '全选') ? owned : quantity + step);
		return b;
	};
	const minus10 = mkBtn('−10', -10);
	const minus = mkBtn('−1', -1);
	const qtyEl = document.createElement('div');
	qtyEl.style.cssText = 'font-size:20px;font-weight:bold;color:#fff;min-width:30px;text-align:center;';
	qtyEl.textContent = '1';
	const plus = mkBtn('+1', 1);
	const plus10 = mkBtn('+10', 10);
	const allBtn = mkBtn('全选', 0);
	const syncQty = (v) => {
		quantity = Math.max(1, Math.min(owned, v));
		qtyEl.textContent = String(quantity);
	};
	stepper.appendChild(minus10); stepper.appendChild(minus); stepper.appendChild(qtyEl); stepper.appendChild(plus); stepper.appendChild(plus10); stepper.appendChild(allBtn);
	dialog.appendChild(stepper);

	const selTip = document.createElement('div');
	selTip.style.cssText = 'font-size:13px;color:#ddd;margin:6px 0 4px;';
	selTip.textContent = '请选择要获得的宝物：';
	dialog.appendChild(selTip);

	const selectedInfo = document.createElement('div');
	selectedInfo.style.cssText = 'font-size:13px;color:#ffd700;font-weight:bold;text-align:center;margin-bottom:6px;min-height:18px;';
	dialog.appendChild(selectedInfo);

	const grid = document.createElement('div');
	grid.className = 'gallery-grid';
	grid.style.cssText = 'grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;flex:1;min-height:0;overflow-y:auto;padding-right:4px;';
	const defs = Game.Bag.defs();
	let selectedTreasureId = cand[0];
	function updateSelectedInfo() {
		const t = defs[selectedTreasureId];
		selectedInfo.textContent = t ? t.name : selectedTreasureId;
	}
	cand.forEach(id => {
		const t = defs[id];
		const card = document.createElement('div');
		card.className = 'gallery-char-card';
		card.style.cursor = 'pointer';
		card.style.cssText = 'position:relative;';

		const iconDiv = document.createElement('div');
		iconDiv.className = 'gallery-char-icon';
		if (t && t.icon) {
			const img = document.createElement('img');
			img.className = 'gallery-char-img';
			img.src = t.icon;
			img.alt = t ? t.name : id;
			img.onerror = function () {
				this.style.display = 'none';
				const ph = document.createElement('div');
				ph.className = 'gallery-char-placeholder';
				ph.textContent = (t && t.name) ? t.name.charAt(0) : id;
				this.parentNode.appendChild(ph);
			};
			iconDiv.appendChild(img);
		} else {
			iconDiv.textContent = (t && t.name) ? t.name.charAt(0) : id;
		}
		if (t && RANK_COLORS && RANK_COLORS[t.rank]) iconDiv.style.borderColor = RANK_COLORS[t.rank];
		card.appendChild(iconDiv);

		const nameDiv = document.createElement('div');
		nameDiv.className = 'gallery-char-name';
		nameDiv.textContent = (t && t.name) || id;
		if (t && RANK_COLORS && RANK_COLORS[t.rank]) nameDiv.style.color = RANK_COLORS[t.rank];
		card.appendChild(nameDiv);

		// 选中角标 ✓
		const check = document.createElement('div');
		check.className = 'gallery-char-check';
		check.textContent = '✓';
		card.appendChild(check);

		card.onclick = () => {
			selectedTreasureId = id;
			updateSelectedInfo();
			document.querySelectorAll('.gallery-char-card.selected').forEach(c => c.classList.remove('selected'));
			card.classList.add('selected');
		};
		grid.appendChild(card);
	});
	dialog.appendChild(grid);
	updateSelectedInfo();

	const confirmBtn = document.createElement('button');
	confirmBtn.className = 'ybrpg-confirm-btn';
	confirmBtn.textContent = '确定';
	confirmBtn.style.cssText = 'background:#d32f2f;';
	confirmBtn.onclick = () => {
		if (quantity > owned) { Game.toast('数量超过拥有数', 'warning'); return; }
		if (selectedTreasureId && Game.Data && typeof Game.Data.addTreasure === 'function') {
			Game.Data.addTreasure(selectedTreasureId, quantity);
		}
		if (Game.Data && Game.Data.removeItem) Game.Data.removeItem(def.id, quantity);
		if (Game.SaveManager && Game.SaveManager.autoSave) Game.SaveManager.autoSave();
		const t = defs[selectedTreasureId];
		Game.toast(`开启 ${quantity} 个，获得【${(t && t.name) || selectedTreasureId}】×${quantity}`, 'success');
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		if (typeof renderBagItemContent === 'function' && window._lastBagContainer) {
			renderBagItemContent(window._lastBagContainer);
		}
		if (typeof refreshBagItemDetailAfterUse === 'function') refreshBagItemDetailAfterUse(def.id);
	};
	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'ybrpg-confirm-btn';
	cancelBtn.textContent = '取消';
	cancelBtn.onclick = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:10px;';
	btnRow.appendChild(confirmBtn); btnRow.appendChild(cancelBtn);
	dialog.appendChild(btnRow);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

// 构建开启弹窗（数量选择 + 武将选择）
function buildOpenDialog(def, owned, candidates) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';

	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';
	dialog.style.cssText = 'width:360px;max-height:82vh;display:flex;flex-direction:column;overflow:hidden;';

	// 标题
	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#ffd700;margin-bottom:8px;text-align:center;';
	title.textContent = `开启【${def.name}】`;
	dialog.appendChild(title);

	// 数量选择
	let quantity = 1;
	const stepper = document.createElement('div');
	stepper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:3px;margin:8px 0;flex-wrap:nowrap;';
	const mkBtn = (txt, step, css) => {
		const b = document.createElement('button');
		b.className = 'ybrpg-confirm-btn';
		b.textContent = txt;
		b.style.cssText = `padding:0 6px;height:26px;font-size:13px;border:1px solid #555;white-space:nowrap;${css || ''}`;
		b.onclick = () => syncQty((txt === '全选') ? owned : quantity + step);
		return b;
	};
	const minus10 = mkBtn('−10', -10);
	const minus = mkBtn('−1', -1);
	const qtyEl = document.createElement('div');
	qtyEl.style.cssText = 'font-size:20px;font-weight:bold;color:#fff;min-width:30px;text-align:center;';
	qtyEl.textContent = '1';
	const plus = mkBtn('+1', 1);
	const plus10 = mkBtn('+10', 10);
	const allBtn = mkBtn('全选', 0);
	const syncQty = (v) => {
		quantity = Math.max(1, Math.min(owned, v));
		qtyEl.textContent = String(quantity);
	};
	stepper.appendChild(minus10); stepper.appendChild(minus); stepper.appendChild(qtyEl); stepper.appendChild(plus); stepper.appendChild(plus10); stepper.appendChild(allBtn);
	dialog.appendChild(stepper);

	if (owned > 1) {
		const tip = document.createElement('div');
		tip.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-bottom:6px;';
		tip.textContent = `（最多开启 ${owned} 个）`;
		dialog.appendChild(tip);
	}

	// 武将选择提示
	const selTip = document.createElement('div');
	selTip.style.cssText = 'font-size:13px;color:#ddd;margin:6px 0 4px;';
	selTip.textContent = '请选择要获得的武将：';
	dialog.appendChild(selTip);

	// 当前已选武将（实时显示，最直观）
	const selectedInfo = document.createElement('div');
	selectedInfo.style.cssText = 'font-size:13px;color:#ffd700;font-weight:bold;text-align:center;margin-bottom:6px;min-height:18px;';
	dialog.appendChild(selectedInfo);

	// 武将网格（唯一可滚动区域）
	let selectedCharId = candidates[0];
	const grid = document.createElement('div');
	grid.className = 'gallery-grid';
	grid.style.cssText = 'grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;flex:1;min-height:0;overflow-y:auto;padding-right:4px;';

	// 统一设置选中状态（高亮 + 角标 + 顶部文字）
	function setSelected(charId) {
		selectedCharId = charId;
		grid.querySelectorAll('.gallery-char-card').forEach(card => {
			const isSel = card.dataset.charId === charId;
			card.classList.toggle('selected', isSel);
			const chk = card.querySelector('.gallery-char-check');
			if (chk) chk.style.display = isSel ? 'flex' : 'none';
		});
		const c = characterList[charId];
		if (c) selectedInfo.textContent = `已选择：${c.name}`;
	}

	candidates.forEach(charId => {
		const c = characterList[charId];
		const card = document.createElement('div');
		card.className = 'gallery-char-card';
		card.dataset.charId = charId;
		card.style.cssText = 'cursor:pointer;position:relative;';

		const iconDiv = document.createElement('div');
		iconDiv.className = 'gallery-char-icon';
		iconDiv.style.borderColor = RANK_COLORS[c.rank] || '#888';
		const img = document.createElement('img');
		img.className = 'gallery-char-img';
		img.src = `/image/character/${charId}.jpg`;
		img.alt = c.name;
		img.onerror = function () {
			this.onerror = function () {
				this.style.display = 'none';
				const ph = document.createElement('div');
				ph.className = 'gallery-char-placeholder';
				ph.textContent = c.name.charAt(0);
				this.parentNode.appendChild(ph);
			};
			this.src = `/image/character/${charId}.webp`;
		};
		iconDiv.appendChild(img);
		card.appendChild(iconDiv);

		const nameDiv = document.createElement('div');
		nameDiv.className = 'gallery-char-name';
		nameDiv.textContent = c.name;
		nameDiv.style.color = RANK_COLORS[c.rank] || '#eee';
		card.appendChild(nameDiv);

		// 选中角标 ✓
		const check = document.createElement('div');
		check.className = 'gallery-char-check';
		check.textContent = '✓';
		card.appendChild(check);

		card.onclick = () => setSelected(charId);
		grid.appendChild(card);
	});
	dialog.appendChild(grid);

	// 初始化默认选中
	setSelected(selectedCharId);

	// 按钮
	const btnRow = document.createElement('div');
	btnRow.className = 'ybrpg-confirm-buttons';
	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'ybrpg-confirm-btn cancel';
	cancelBtn.textContent = '取消';
	cancelBtn.onclick = () => overlay.remove();
	const confirmBtn = document.createElement('button');
	confirmBtn.className = 'ybrpg-confirm-btn confirm';
	confirmBtn.textContent = '确认开启';
	confirmBtn.onclick = () => {
		doOpen(def, quantity, selectedCharId);
		overlay.remove();
	};
	btnRow.appendChild(confirmBtn);
	btnRow.appendChild(cancelBtn);
	dialog.appendChild(btnRow);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

// 执行开启：授予武将 + 扣除道具 + 存档 + 刷新
function doOpen(def, quantity, charId) {
	if (!window.grantCharacter) {
		Game.toast('授予函数未就绪', 'error');
		return;
	}
	if (!charId || !characterList[charId]) {
		Game.toast('请先选择武将', 'warning');
		return;
	}
	const baseName = characterList[charId].name;
	for (let i = 0; i < quantity; i++) {
		window.grantCharacter(charId);
	}
	if (Game.Data && Game.Data.removeItem) {
		Game.Data.removeItem(def.id, quantity);
	}
	if (Game.SaveManager && Game.SaveManager.autoSave) {
		Game.SaveManager.autoSave();
	}
	Game.toast(`开启成功！获得【${baseName}】×${quantity}`, 'success');

	// 刷新背包视图
	const bagView = document.getElementById('bag-view');
	if (bagView && window.renderBagView) {
		window.renderBagView(bagView);
	}
	// 同步底部预览栏（数量为 0 自动清空）
	if (typeof refreshBagItemDetailAfterUse === 'function') refreshBagItemDetailAfterUse(def.id);
}

export { ITEM_DEFS as default };
