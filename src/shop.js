/**
 * 星河之契 - 商店系统（含招募）
 * 由 mode.js 拆分而来（原行号见下文分段注释）
 */

import { shared } from './shared.js';
import { characterList } from './characterList.js';
import { Game } from './core.js';
import { ITEM_DEFS } from './item.js';
import { compileCharacterStats, getRankLabel, mergeNoOverwrite, refreshTeamViewDisplay } from './team.js';
import { grantCharacter, hasRealBreakthrough } from './dungeon.js';
import { SaveManager, addDailyTaskProgress, fmtGroup4, showCharDetail, updateResourceHUD } from './other.js';

const CURRENCY_SYMBOL = { gold: '💰', diamond: '💎' };

// 货币元数据：对应全局余额变量名、不足提示
const CURRENCY_META = {
	gold: { varKey: 'gameGold', label: '金币', insufficient: '金币不足！' },
	diamond: { varKey: 'diamond', label: '钻石', insufficient: '钻石不足！' },
};

/**
 * 从商品支持的价格中，按商店支持的货币列表随机选取一个作为购买货币。
 * 若商品无任何受支持的货币，则退回到商品本身支持的货币中随机。
 * @param {object} priceObj 归一化后的价格对象
 * @param {string[]} supportedCurrencies 商店支持的货币列表
 * @returns {string} 货币类型，如 'gold' / 'diamond'
 */
function pickPurchaseCurrency(priceObj, supportedCurrencies) {
	const p = normalizePrice(priceObj);
	const supported = (supportedCurrencies && supportedCurrencies.length)
		? supportedCurrencies.filter(c => typeof p[c] === 'number')
		: [];
	const pool = supported.length ? supported : Object.keys(p).filter(c => typeof p[c] === 'number');
	if (pool.length === 0) return 'gold';
	return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 将任意价格定义归一化为 {gold, diamond?} 形式。
 * 兼容旧的纯数字写法（视为 gold）。
 * 若 gold > 1000 且未显式给出 diamond，则自动补 diamond = ceil(gold/1000)。
 * @param {number|{gold?:number,diamond?:number,[k:string]:number}} p
 * @returns {{gold:number, diamond?:number}}
 */
function normalizePrice(p) {
	if (typeof p === 'number') {
		return p > 1000 ? { gold: p, diamond: Math.ceil(p / 1000) } : { gold: p };
	}
	if (p && typeof p === 'object') {
		const gold = p.gold || 0;
		const out = { gold };
		if (typeof p.diamond === 'number') out.diamond = p.diamond;
		else if (gold > 1000) out.diamond = Math.ceil(gold / 1000);
		// 未来可在此扩展其他货币
		return out;
	}
	return { gold: 0 };
}

/**
 * 返回价格的主购买货币：>1000 金币用 diamond，否则用 gold。
 * @returns {'gold'|'diamond'}
 */
function getPrimaryCurrency(priceObj) {
	const p = normalizePrice(priceObj);
	// 只要价格中定义了钻石（含金币>1000 自动折算的钻石），就优先以钻石为主货币；
	// 否则回退到金币。修复纯钻石商品（如体力瓶、rank3 宝物箱）误判为金币且价格为 0 的问题。
	return (typeof p.diamond === 'number') ? 'diamond' : 'gold';
}

/**
 * 获取价格在某货币下的数值。
 */
function getPriceAmount(priceObj, currency) {
	return normalizePrice(priceObj)[currency] || 0;
}

/**
 * 格式化价格为可读字符串，如 "💰 500" 或 "💎 2（💰 2000）"。
 * 金币≤1000 只显示金币；>1000 显示钻石为主，金币作参考。
 */
function formatPrice(priceObj) {
	const p = normalizePrice(priceObj);
	if (p.gold > 1000 && p.diamond) {
		return `${CURRENCY_SYMBOL.diamond} ${p.diamond}（${CURRENCY_SYMBOL.gold} ${p.gold}）`;
	}
	return `${CURRENCY_SYMBOL.gold} ${p.gold}`;
}

/**
 * 获取商品的出售价格（金币）。购买价与出售价分离：
 * 1. 定义中显式配置 sellPrice 字段时直接采用（数字视为金币，也支持 {gold}/{diamond} 对象）；
 * 2. 未配置 sellPrice 时返回 null，表示该商品不可出售。
 * @param {{sellPrice?:number|object, price?:number|object}} def 商品定义
 * @returns {number|null} 出售所得金币；null 表示不可出售
 */
function getSellPrice(def) {
	if (!def || def.sellPrice == null) return null;
	if (typeof def.sellPrice === 'number') return Math.floor(def.sellPrice);
	const sp = normalizePrice(def.sellPrice);
	return Math.floor((sp.gold || 0) + (sp.diamond || 0) * 1000);
}

/**
 * 获取角色品质对应价格（对象结构）
 */
function getCharPrice(rank) {
	return { legend: { gold: 500 }, epic: { gold: 300 } }[rank] || { gold: 200 };
}

/**
 * 按倍率缩放价格（用于 sp 商店）。对每种货币数值乘以倍率，再归一化补 diamond。
 * @param {number|object} p
 * @param {number} beilv
 */
function scalePrice(p, beilv) {
	const base = normalizePrice(p);
	const scaled = {};
	for (const cur of Object.keys(base)) {
		scaled[cur] = base[cur] * beilv;
	}
	return normalizePrice(scaled);
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

// 宝物招募品质配色/名称（与角色品质体系解耦）
function getTreasureTierColor(tier) {
	return { purple: '#a335ee', orange: '#ff8800', red: '#ff4444', gold: '#ffff00' }[tier] || '#888';
}
function getTreasureTierName(tier) {
	return { purple: '紫', orange: '橙', red: '红', gold: '金' }[tier] || '宝物';
}

/**
 * 刷新商店物品
 */
function refreshShopItems(type = 'normal', supportedCurrencies = ['gold', 'diamond']) {
	if (!window.shopData) window.shopData = { items: [], spitems: [], refreshCost: 50 };
	window.shopData.supportedCurrencies = supportedCurrencies;
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
				const price = scalePrice(getCharPrice(cData.rank), beilv);
				const payCurrency = pickPurchaseCurrency(price, supportedCurrencies);
				target.push({
					type: 'character',
					id: id,
					name: cData.name,
					desc: `${getRankName(cData.rank)} | HP:${cData.hp} ATK:${cData.atk} DEF:${cData.def}`,
					price: price,
					payCurrency: payCurrency,
					payAmount: price[payCurrency],
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
				const price = scalePrice(def.price || { gold: 200 }, beilv);
				const payCurrency = pickPurchaseCurrency(price, supportedCurrencies);
				target.push({
					type: 'item',
					id: id,
					name: def.name,
					desc: def.desc,
					price: price,
					payCurrency: payCurrency,
					payAmount: price[payCurrency],
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
				const price = scalePrice(tData.price || { gold: 200 }, beilv);
				const payCurrency = pickPurchaseCurrency(price, supportedCurrencies);
				target.push({
					type: 'treasure',
					id: id,
					name: tData.name,
					desc: tData.desc,
					price: price,
					payCurrency: payCurrency,
					payAmount: price[payCurrency],
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
	window.shopPage = window.shopPage || 'home';
	if (window.shopPage === 'legacy') { renderShopLegacyView(container); return; }
	if (window.shopPage === 'treasure') { renderTreasureShopView(container); return; }
	if (window.shopPage === 'recruit') { renderRecruitView(container); return; }
	if (window.shopPage === 'treasurerecruit') { renderTreasureRecruitView(container); return; }
	renderShopHomeView(container);
}

function renderShopLegacyView(container) {
	// 清空容器以防重复渲染
	container.innerHTML = '';

	// 资源显示（钻石为商店消费货币）
	const goldBar = document.createElement('div');
	goldBar.className = 'shop-gold-bar';
	goldBar.innerHTML =
		`<span class="shop-gold-icon">💰</span> <span id="shop-gold-display">${fmtGroup4(window.gameGold || 0)}</span> 金币` +
		`&nbsp;&nbsp;<span class="shop-diamond-icon" id="shop-diamond-display">💎 ${fmtGroup4(window.diamond || 0)} 钻石</span>`;
	container.appendChild(goldBar);

	// 返回商城首页按钮
	const backBtn = document.createElement('button');
	backBtn.className = 'ybrpg-back-btn';
	backBtn.textContent = '← 返回商城';
	backBtn.onclick = () => {
		window.shopPage = 'home';
		renderShopView(container);
	};
	container.appendChild(backBtn);

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
		renderShopLegacyView(container);
	};

	const btnAdvanced = document.createElement('button');
	btnAdvanced.className = 'shop-sub-btn' + (window.shopMode === 'advanced' ? ' active' : '');
	btnAdvanced.textContent = '高级商店';
	btnAdvanced.onclick = () => {
		window.shopMode = 'advanced';
		renderShopLegacyView(container);
	};

	tabsContainer.appendChild(btnNormal);
	tabsContainer.appendChild(btnAdvanced);
	container.appendChild(tabsContainer);

	// 确保商店数据存在
	// if (!window.shopData || !window.shopData.items || window.shopData.items.length === 0) {
	//	 refreshShopItems(window.shopMode);
	// }
	if ((!window.shopData || (window.shopMode === 'normal' && !window.shopData.items) || (window.shopMode === 'advanced' && !window.shopData.items))) {
		refreshShopItems(window.shopMode, ['gold', 'diamond']);
	}

	// 普通商店显示宝物，高级商店显示角色
	const items = window.shopData[window.shopMode == 'normal' ? 'items' : 'spitems']
	console.log('items', items)

	// 兼容旧存档：补全购买货币
	const supportedCur = window.shopData.supportedCurrencies || ['gold', 'diamond'];
	items.forEach(it => {
		if (it && it.price && !it.payCurrency) {
			it.payCurrency = pickPurchaseCurrency(it.price, supportedCur);
			it.payAmount = it.price[it.payCurrency];
		}
	});

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

		// 购买按钮逻辑（自建 div 按键，避免原生 button 长数字换行）
		const buyBtn = document.createElement('div');
		buyBtn.className = 'shop-item-buy-btn';
		buyBtn.textContent = item ? (CURRENCY_SYMBOL[item.payCurrency] + ' ' + item.payAmount) : '—';
		buyBtn.style.whiteSpace = 'nowrap';

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

			// 2. 检查所选购买货币余额
			const payCur = item.payCurrency || 'diamond';
			const payMeta = CURRENCY_META[payCur] || CURRENCY_META.diamond;
			const balance = window[payMeta.varKey] || 0;
			if (balance < item.payAmount) {
				Game.toast(payMeta.insufficient, 'error');
				return;
			}

			// 3. 执行购买逻辑
			buyevent(item)
			// 6. 【关键】立即刷新商店界面和金币显示
			// 先更新金币数字

			// 重新渲染整个商店视图，以反映 "sold" 状态
			// 注意：这里直接调用 renderShopView，传入当前容器
			// 假设 container 是 renderShopView 的参数
			renderShopLegacyView(container);

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

	// 3. 按货币分别汇总应付金额
	const needByCurrency = {};
	availableItems.forEach(item => {
		const cur = item.payCurrency || 'diamond';
		needByCurrency[cur] = (needByCurrency[cur] || 0) + (item.payAmount || 0);
	});
	const needParts = Object.keys(needByCurrency)
		.filter(c => needByCurrency[c] > 0)
		.map(c => `${CURRENCY_SYMBOL[c]} ${needByCurrency[c]}`);
	const needText = needParts.length ? needParts.join(' ') : '免费';

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
		allBuyBtn.textContent = `一键购买\n（${needText}）`;
		allBuyBtn.disabled = false;
		allBuyBtn.style.opacity = '1';
		allBuyBtn.style.cursor = 'pointer';

		// 5. 绑定点击事件
		allBuyBtn.onclick = () => {
			// 检查每种购买货币的余额
			for (const cur of Object.keys(needByCurrency)) {
				const meta = CURRENCY_META[cur] || CURRENCY_META.diamond;
				if ((window[meta.varKey] || 0) < needByCurrency[cur]) {
					Game.toast(meta.insufficient + '，无法购买！', 'error');
					return;
				}
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
			renderShopLegacyView(container);

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
	refreshBtn.textContent = `刷新商品\n（${cost}💰）`;
	refreshBtn.style.whiteSpace = 'pre-wrap';
	refreshBtn.onclick = () => {
		if ((window.gameGold || 0) < cost) {
			Game.toast('金币不足，无法刷新！', 'error');
			return;
		}
		window.gameGold = (window.gameGold || 0) - cost;
		const goldDisplay = document.getElementById('shop-gold-display');
		if (goldDisplay) goldDisplay.textContent = fmtGroup4(window.gameGold || 0);
		updateResourceHUD(); // 同步刷新顶部常驻资源条（金币数字）
		refreshShopItems(window.shopMode);
		renderShopLegacyView(container);
		Game.toast('商店已刷新', 'info');
		SaveManager.autoSave();
	};
	downBtns.appendChild(refreshBtn);

	container.appendChild(downBtns);
}

// ==================== 新商店：主页 ====================
function renderShopHomeView(container) {
	container.innerHTML = '';
	window.shopPage = 'home';

	// 资源条
	const goldBar = document.createElement('div');
	goldBar.className = 'shop-gold-bar';
	goldBar.innerHTML =
		`<span class="shop-gold-icon">💰</span> <span id="shop-gold-display">${fmtGroup4(window.gameGold || 0)}</span> 金币` +
		`&nbsp;&nbsp;<span class="shop-diamond-icon" id="shop-diamond-display">💎 ${fmtGroup4(window.diamond || 0)} 钻石</span>`;
	container.appendChild(goldBar);

	const title = document.createElement('div');
	title.style.cssText = 'text-align:center;font-size:18px;font-weight:bold;color:#ffd700;margin:14px 0;';
	title.textContent = '商 城';
	container.appendChild(title);

	// 入口卡片（横向排列）
	const grid = document.createElement('div');
	grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:780px;margin:18px auto 0;padding:0 12px;';

	const entries = [
		{ key: 'treasure', name: '珍宝商城', icon: '🛍️', desc: '定向购买体力瓶等物资' },
		{ key: 'recruit', name: '武将招募', icon: '🎯', desc: '抽取武将（十连必出橙，百抽必出红，1% 神品）' },
		{ key: 'treasurerecruit', name: '宝物招募', icon: '💎', desc: '抽取宝物（十连必出≥稀有，幸运值满必出传说）' },
		{ key: 'legacy', name: '旧杂货铺', icon: '🏪', desc: '（旧版随机商店，保留备用）' },
	];
	entries.forEach(e => {
		const card = document.createElement('div');
		card.className = 'gallery-char-card';
		card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 10px;cursor:pointer;background:#1a1a2a;border:1px solid #333;border-radius:12px;text-align:center;transition:transform .12s,border-color .12s;';
		card.onmouseenter = () => { card.style.borderColor = '#ffd700'; card.style.transform = 'translateY(-3px)'; };
		card.onmouseleave = () => { card.style.borderColor = '#333'; card.style.transform = 'translateY(0)'; };
		card.onclick = () => {
			window.shopPage = e.key;
			renderShopView(container);
		};
		const ic = document.createElement('div');
		ic.style.cssText = 'font-size:40px;';
		ic.textContent = e.icon;
		const txt = document.createElement('div');
		txt.innerHTML = `<div style="font-size:15px;font-weight:bold;color:#fff;">${e.name}</div><div style="font-size:12px;color:#aaa;margin-top:4px;line-height:1.4;">${e.desc}</div>`;
		card.appendChild(ic); card.appendChild(txt);
		grid.appendChild(card);
	});
	container.appendChild(grid);
}

// ==================== 新商店：珍宝商城 ====================
// 上架清单：体力瓶与小型体力瓶（宝物箱/武将包已移出，后续通过宝物招募等其他方式提供，物品定义不删）
const TREASURE_SHOP_ITEMS = [
	'item_stamina',       // 体力瓶
	'item_stamina_small', // 小体力瓶
];

// 珍宝商城购买弹窗：可选数量一次购买多个
function openTreasureShopBuyDialog(def, payCur, unitPrice, refreshCb) {
	const meta = CURRENCY_META[payCur] || CURRENCY_META.diamond;
	const balance = window[meta.varKey] || 0;
	// 按余额计算最大可购数量
	const maxQty = unitPrice > 0 ? Math.floor(balance / unitPrice) : 99;
	let qty = 1;

	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';
	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';
	dialog.style.cssText = 'width:240px;text-align:center;';

	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#ffd700;margin-bottom:6px;';
	title.textContent = `购买「${def.name}」`;
	dialog.appendChild(title);

	const unit = document.createElement('div');
	unit.style.cssText = 'font-size:12px;color:#aaa;margin-bottom:10px;';
	unit.textContent = `单价：${CURRENCY_SYMBOL[payCur]} ${fmtGroup4(unitPrice)}`;
	dialog.appendChild(unit);

	// 数量步进器
	const stepper = document.createElement('div');
	stepper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:3px;margin-bottom:10px;flex-wrap:nowrap;';
	const mkBtn = (txt, step, css) => {
		const b = document.createElement('button');
		b.className = 'ybrpg-confirm-btn';
		b.textContent = txt;
		b.style.cssText = `padding:0 6px;height:26px;font-size:13px;border:1px solid #555;white-space:nowrap;${css || ''}`;
		b.onclick = () => syncQty(qty + step);
		return b;
	};
	const minus10 = mkBtn('−10', -10);
	const minus = mkBtn('−1', -1);
	const qtyEl = document.createElement('div');
	qtyEl.style.cssText = 'font-size:20px;font-weight:bold;color:#fff;min-width:30px;text-align:center;';
	qtyEl.textContent = '1';
	const plus = mkBtn('+1', 1);
	const plus10 = mkBtn('+10', 10);
	const syncQty = (v) => {
		qty = Math.max(1, Math.min(maxQty, v));
		qtyEl.textContent = String(qty);
		totalEl.textContent = `合计：${CURRENCY_SYMBOL[payCur]} ${fmtGroup4(unitPrice * qty)}`;
	};
	stepper.appendChild(minus10); stepper.appendChild(minus); stepper.appendChild(qtyEl); stepper.appendChild(plus); stepper.appendChild(plus10);
	dialog.appendChild(stepper);

	const totalEl = document.createElement('div');
	totalEl.style.cssText = 'font-size:13px;color:#ffd700;margin-bottom:12px;';
	totalEl.textContent = `合计：${CURRENCY_SYMBOL[payCur]} ${fmtGroup4(unitPrice)}`;
	dialog.appendChild(totalEl);

	const btns = document.createElement('div');
	btns.style.cssText = 'display:flex;gap:10px;justify-content:center;';
	const confirm = document.createElement('button');
	confirm.className = 'ybrpg-confirm-btn';
	confirm.textContent = '确认购买';
	confirm.style.cssText = 'background:#d32f2f;';
	confirm.onclick = () => {
		const curBalance = window[meta.varKey] || 0;
		const need = unitPrice * qty;
		if (curBalance < need) { Game.toast(meta.insufficient, 'error'); return; }
		window[meta.varKey] = curBalance - need;
		if (Game.Data && typeof Game.Data.addItem === 'function') {
			Game.Data.addItem(def.id, qty);
			Game.toast(`购买了【${def.name}】×${qty}`, 'success');
		}
		addDailyTaskProgress('buy', 1);
		updateResourceHUD();
		refreshShopCurrencyBar();
		SaveManager.autoSave();
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		if (typeof refreshCb === 'function') refreshCb();
	};
	const cancel = document.createElement('button');
	cancel.className = 'ybrpg-confirm-btn';
	cancel.textContent = '取消';
	cancel.onclick = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	btns.appendChild(confirm); btns.appendChild(cancel);
	dialog.appendChild(btns);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

function renderTreasureShopView(container) {
	container.innerHTML = '';
	window.shopPage = 'treasure';

	const goldBar = document.createElement('div');
	goldBar.className = 'shop-gold-bar';
	goldBar.innerHTML =
		`<span class="shop-gold-icon">💰</span> <span id="shop-gold-display">${fmtGroup4(window.gameGold || 0)}</span> 金币` +
		`&nbsp;&nbsp;<span class="shop-diamond-icon" id="shop-diamond-display">💎 ${fmtGroup4(window.diamond || 0)} 钻石</span>`;
	container.appendChild(goldBar);

	// 返回 + 标题
	const head = document.createElement('div');
	head.style.cssText = 'display:flex;align-items:center;gap:12px;margin:10px 0;';
	const back = document.createElement('button');
	back.className = 'shop-refresh-btn';
	back.textContent = '← 返回';
	back.style.cssText = 'font-size:13px;';
	back.onclick = () => { window.shopPage = 'home'; renderShopView(container); };
	const htitle = document.createElement('div');
	htitle.style.cssText = 'font-size:17px;font-weight:bold;color:#ffd700;';
	htitle.textContent = '珍宝商城';
	head.appendChild(back); head.appendChild(htitle);
	container.appendChild(head);

	const grid = document.createElement('div');
	grid.className = 'shop-grid';
	grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:10px;';

	TREASURE_SHOP_ITEMS.forEach(id => {
		const def = ITEM_DEFS[id] || null;
		if (!def) return;
		const p = normalizePrice(def.price || {});
		const payCur = getPrimaryCurrency(p) || 'gold';
		const payAmt = p[payCur] || 0;

		const card = document.createElement('div');
		card.className = 'shop-item';
		card.style.cssText = 'display:flex;gap:10px;align-items:center;background:#1a1a2a;border:1px solid #333;border-radius:8px;padding:8px;';

		const icon = document.createElement('div');
		icon.style.cssText = 'width:54px;height:54px;display:flex;align-items:center;justify-content:center;font-size:30px;background:#111;flex-shrink:0;cursor:pointer;';
		if (def.icon) {
			const img = document.createElement('img');
			img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
			img.src = def.icon;
			img.alt = def.name;
			img.onerror = () => { icon.textContent = def.emoji || '📦'; };
			icon.appendChild(img);
		} else {
			icon.textContent = def.emoji || '📦';
		}
		// 点击图标弹出商品详情（含描述）
		icon.onclick = () => {
			if (typeof showItemDetail === 'function') {
				showItemDetail({ id: def.id, name: def.name, desc: def.desc, emoji: def.emoji, icon: def.icon, price: def.price });
			}
		};
		card.appendChild(icon);

		const info = document.createElement('div');
		info.style.cssText = 'flex:1;min-width:0;overflow:hidden;';
		const nm = document.createElement('div');
		nm.style.cssText = 'font-size:14px;color:#fff;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
		nm.textContent = def.name;
		info.appendChild(nm);

		const buy = document.createElement('button');
		buy.className = 'shop-item-buy-btn';
		buy.style.cssText = 'padding:4px 10px;font-size:13px;white-space:nowrap;';
		buy.textContent = CURRENCY_SYMBOL[payCur] + ' ' + payAmt;
		buy.onclick = (e) => {
			e.stopPropagation();
			openTreasureShopBuyDialog(def, payCur, payAmt, () => renderTreasureShopView(container));
		};
		info.appendChild(buy);
		card.appendChild(info);
		grid.appendChild(card);
	});
	container.appendChild(grid);
}

// ==================== 新商店：招募 ====================
// 出货率基础值：稀有(rare)80% / 伪史诗(epicfake)10% / 真史诗(epic)8% / 传说(legend)2%
// 神品(kami)不参与出货判定：每次抽取后以独立 1% 概率将所得武将拔升为神品
const RECRUIT_BASE_RATES = {
	rare: 0.80,
	epicfake: 0.10,
	epic: 0.08,
	legend: 0.0002,   // 0 幸运值时传说概率：0.02%（万分之二）
};
const RECRUIT_LUCK_MAX = 100;       // 幸运值上限：满值必出传说
const RECRUIT_LUCK_STEP1 = 40;      // 幸运值40 → 2%
const RECRUIT_LUCK_STEP1_RATE = 0.02;
const RECRUIT_LUCK_STEP2 = 60;      // 幸运值60 → 5%
const RECRUIT_LUCK_STEP2_RATE = 0.05;
const RECRUIT_LUCK_STEP3 = 80;      // 幸运值80 → 10%
const RECRUIT_LUCK_STEP3_RATE = 0.10;
const RECRUIT_LUCK_STEP4 = 90;      // 幸运值90 → 50%
const RECRUIT_LUCK_STEP4_RATE = 0.50;
const RECRUIT_KAMI_UPGRADE_RATE = 0.01; // 每次抽取独立拔升为神品的概率
const RECRUIT_SINGLE_COST = { gold: 500 };
const RECRUIT_TEN_COST = { gold: 4500 };
const RECRUIT_HUNDRED_COST = { gold: 45000 }; // 百连=十连×10（保持9折档）
const DROP_EXCLUDE_IDS_RECRUIT = {};

// 武将招募池（硬编码）：各品质档位的可招募武将 id 清单（58 人）。
// 注意：新设计的武将不会自动进入招募池，必须在此清单中显式添加对应 id，
// 便于日后按主题/限定等需求分割出货池。黑名单（DROP_EXCLUDE_IDS_RECRUIT）为预留结构，当前为空。
const RECRUIT_POOLS = {
	// rare（稀有，11 人）
	rare: [
		'ybsl_019shengyan',
		'ybsl_045gaocong',
		'ybsl_024yuetong',
		'ybsl_053qiuer',
		'ybsl_054yueer',
		'ybsl_055zhengyan',
		'ybsl_012zhengjiayi',
		'ybsl_037diamondqueen',
		'ybsl_121tujing',
		'ybsl_122wangbingyu',
		'ybsl_123xuelang',
	],
	// epicfake（伪史诗，17 人）
	epicfake: [
		'ybsl_025shiqingyu',
		'ybsl_020jiayutong',
		'ybsl_025wanghe',
		'ybsl_042pingzi',
		'ybsl_046jiangxuewu',
		'ybsl_059starsFall2',
		'ybsl_060liutianhang',
		'ybsl_079xiaoxin',
		'ybsl_003yanshuang',
		'ybsl_004zhangyujie',
		'ybsl_005wangruobing',
		'ybsl_007wugege',
		'ybsl_011gaoyuhang',
		'ybsl_047zhangmi',
		'ybsl_026can',
		'ybsl_027rain',
		'ybsl_029dawn',
	],
	// epic（史诗，20 人）
	epic: [
		'ybsl_015wanghairu',
		'ybsl_016manchengqi',
		'ybsl_018zhangqing',
		'ybsl_059starsFall3',
		'ybsl_059starsFall4',
		'ybsl_068qingyue',
		'ybsl_070lvyanqiu',
		'ybsl_033xiaohui',
		'ybsl_038bianqiuwen',
		'db_ybsl_067snake',
		'ybsl_069xiangzi',
		'ybsl_001sunlisong',
		'ybsl_006wanghanzhen',
		'ybsl_009liyushan',
		'ybsl_010zhouyue',
		'ybsl_013yinji',
		'ybsl_018huanqing',
		'ybsl_036bright',
		'ybsl_092handan',
		'ybsl_083xiaozhu',
	],
	// legend（传说，10 人）
	legend: [
		'ybsl_017xiaohong',
		'ybsl_059starsFall1',
		'ybsl_047shan',
		'ybsl_041mmuqin',
		'ybsl_049waner',
		'ybsl_048wushuang',
		'ybsl_076zhujun',
		'ybsl_107tushanshuili',
		'ybsl_008wuyuxin',
		'ybsl_002chenailin',
	],
};

// 当前幸运值下的传说概率（五段分段函数）：
//   0~40：从 0.02% 线性增长至 2%
//   40~60：从 2% 线性增长至 5%
//   60~80：从 5% 线性增长至 10%
//   80~90：从 10% 线性增长至 50%
//   90~100：从 50% 线性增长至 100%（满值必出）
function getRecruitLegendRate(luck) {
	luck = luck || 0;
	if (luck < RECRUIT_LUCK_STEP1) {
		return RECRUIT_BASE_RATES.legend + (RECRUIT_LUCK_STEP1_RATE - RECRUIT_BASE_RATES.legend) * (luck / RECRUIT_LUCK_STEP1);
	}
	if (luck < RECRUIT_LUCK_STEP2) {
		return RECRUIT_LUCK_STEP1_RATE + (RECRUIT_LUCK_STEP2_RATE - RECRUIT_LUCK_STEP1_RATE) * ((luck - RECRUIT_LUCK_STEP1) / (RECRUIT_LUCK_STEP2 - RECRUIT_LUCK_STEP1));
	}
	if (luck < RECRUIT_LUCK_STEP3) {
		return RECRUIT_LUCK_STEP2_RATE + (RECRUIT_LUCK_STEP3_RATE - RECRUIT_LUCK_STEP2_RATE) * ((luck - RECRUIT_LUCK_STEP2) / (RECRUIT_LUCK_STEP3 - RECRUIT_LUCK_STEP2));
	}
	if (luck < RECRUIT_LUCK_STEP4) {
		return RECRUIT_LUCK_STEP3_RATE + (RECRUIT_LUCK_STEP4_RATE - RECRUIT_LUCK_STEP3_RATE) * ((luck - RECRUIT_LUCK_STEP3) / (RECRUIT_LUCK_STEP4 - RECRUIT_LUCK_STEP3));
	}
	return RECRUIT_LUCK_STEP4_RATE + (1 - RECRUIT_LUCK_STEP4_RATE) * ((luck - RECRUIT_LUCK_STEP4) / (RECRUIT_LUCK_MAX - RECRUIT_LUCK_STEP4));
}

// [维护者调试用] 概率百分比格式化：低于 1% 显示两位小数，其余显示一位（如 0.02%、2.0%、50.0%）
// UI 已隐藏实时概率，维护者可在控制台调用 getRecruitLegendRate(luck) / fmtRecruitRatePct() 查看曲线
function fmtRecruitRatePct(rate) {
	return (rate * 100 < 1 ? (rate * 100).toFixed(2) : (rate * 100).toFixed(1)) + '%';
}

// 根据幸运值计算各档实时出货率：其余档位按基础比例分摊剩余概率
function getRecruitRates(luck) {
	const legend = getRecruitLegendRate(luck);
	const otherSum = 1 - legend;
	const otherBase = RECRUIT_BASE_RATES.rare + RECRUIT_BASE_RATES.epicfake + RECRUIT_BASE_RATES.epic;
	return [
		{ rank: 'rare', rate: otherSum * (RECRUIT_BASE_RATES.rare / otherBase) },
		{ rank: 'epicfake', rate: otherSum * (RECRUIT_BASE_RATES.epicfake / otherBase) },
		{ rank: 'epic', rate: otherSum * (RECRUIT_BASE_RATES.epic / otherBase) },
		{ rank: 'legend', rate: legend },
	];
}

// 从指定 rank 池中随机取一个武将 id（基于硬编码 RECRUIT_POOLS，含防御性过滤，池空回退 legend）
function pickCharFromPool(rank) {
	// 防御性过滤：硬编码清单中的 id 若已被移除/改名/改动，则跳过（不报错）
	const inPool = (id, needRank) => {
		const c = characterList[id];
		return c && !c.isFixed && !DROP_EXCLUDE_IDS_RECRUIT[id] && c.rank === needRank && hasRealBreakthrough(c.tupoList);
	};
	let pool = (RECRUIT_POOLS[rank] || []).filter(id => inPool(id, rank));
	// 若池为空（异常兜底），回退到 legend 池
	if (pool.length === 0) {
		pool = (RECRUIT_POOLS.legend || []).filter(id => inPool(id, 'legend'));
	}
	return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// 招募结果：{ charId, rank, isKami }，isKami 由调用方按独立 1% 概率判定
function recruitRollOne(forceRank) {
	let rank = forceRank;
	if (!rank) {
		const r = Math.random();
		let acc = 0;
		for (const item of getRecruitRates(window.recruitPity)) {
			acc += item.rate;
			if (r < acc) { rank = item.rank; break; }
		}
		if (!rank) rank = 'rare';
	}
	return { charId: pickCharFromPool(rank), rank, isKami: false };
}

// 发放单个招募武将（支持独立概率拔升为神品）
function grantRecruitCharacter(charId, isKami) {
	if (!charId) return null;
	const instId = grantCharacter(charId);
	if (!instId) return null;
	if (isKami) {
		const inst = window.charBagData[instId];
		if (inst) {
			inst.rank = 'kami';        // 拔升为神品（金色）
			inst.zunpin = true;        // 免升品/突破瓶颈标记
			// 重新以 kami 模板编译属性
			const baseChar = characterList[charId];
			const stats = compileCharacterStats(Object.assign({}, baseChar, { rank: 'kami' }));
			inst.hp = stats.hp; inst.atk = stats.atk; inst.def = stats.def; inst.spe = stats.spe;
			inst.maxHp = stats.hp; inst.currentHp = stats.hp;
		}
	}
	return instId;
}

function renderRecruitView(container) {
	container.innerHTML = '';
	window.shopPage = 'recruit';

	// 幸运值/UP 状态（带存档）
	if (window.recruitPity === undefined) window.recruitPity = 0;       // 幸运值：距离上次出传说的抽取计数
	if (window.recruitUpCharId === undefined) window.recruitUpCharId = null;

	const goldBar = document.createElement('div');
	goldBar.className = 'shop-gold-bar';
	goldBar.innerHTML =
		`<span class="shop-gold-icon">💰</span> <span id="shop-gold-display">${fmtGroup4(window.gameGold || 0)}</span> 金币` +
		`&nbsp;&nbsp;<span class="shop-diamond-icon" id="shop-diamond-display">💎 ${fmtGroup4(window.diamond || 0)} 钻石</span>`;
	container.appendChild(goldBar);

	const head = document.createElement('div');
	head.style.cssText = 'display:flex;align-items:center;gap:12px;margin:10px 0;';
	const back = document.createElement('button');
	back.className = 'shop-refresh-btn';
	back.textContent = '← 返回';
	back.style.cssText = 'font-size:13px;';
	back.onclick = () => { window.shopPage = 'home'; renderShopView(container); };
	const htitle = document.createElement('div');
	htitle.style.cssText = 'font-size:17px;font-weight:bold;color:#ffd700;';
	htitle.textContent = '招募';
	head.appendChild(back); head.appendChild(htitle);
	container.appendChild(head);

	const tip = document.createElement('div');
	tip.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-bottom:6px;line-height:1.6;';
	tip.innerHTML = '概率：稀有80% / 伪史诗10% / 真史诗8% / 传说0.02%起（幸运值越高概率越高）<br>十连/百连每十抽必出≥橙；每次抽取有1%概率将所得武将拔升为神品（金色，免升品瓶颈）';
	container.appendChild(tip);

	// 幸运值横向进度条
	const pityWrap = document.createElement('div');
	pityWrap.className = 'recruit-pity-wrap';
	const pityTrack = document.createElement('div');
	pityTrack.className = 'recruit-pity-track';
	const pityFill = document.createElement('div');
	pityFill.className = 'recruit-pity-fill';
	pityFill.id = 'recruit-pity-fill';
	const pityText = document.createElement('span');
	pityText.className = 'recruit-pity-text';
	pityText.id = 'recruit-pity-line';
	pityTrack.appendChild(pityFill); pityTrack.appendChild(pityText);
	pityWrap.appendChild(pityTrack);
	container.appendChild(pityWrap);
	updateRecruitPityBar();

	// UP 将选择
	const upWrap = document.createElement('div');
	upWrap.style.cssText = 'margin:8px auto;max-width:420px;';
	const upLabel = document.createElement('div');
	upLabel.style.cssText = 'font-size:12px;color:#eee;margin-bottom:4px;';
	upLabel.textContent = '自选 UP 红将（命中红时优先出该将，留空则随机红）：';
	upWrap.appendChild(upLabel);
	const upSel = document.createElement('select');
	upSel.style.cssText = 'width:100%;padding:4px;background:#222;color:#fff;border:1px solid #444;border-radius:4px;';
	const optNull = document.createElement('option'); optNull.value = ''; optNull.textContent = '（随机红将）'; upSel.appendChild(optNull);
	Object.keys(characterList || {}).filter(id => {
		const c = characterList[id];
		return c && !c.isFixed && c.rank === 'legend' && hasRealBreakthrough(c.tupoList);
	}).forEach(id => {
		const o = document.createElement('option'); o.value = id; o.textContent = characterList[id].name; upSel.appendChild(o);
	});
	upSel.value = window.recruitUpCharId || '';
	upSel.onchange = () => { window.recruitUpCharId = upSel.value || null; SaveManager.autoSave(); };
	upWrap.appendChild(upSel);
	container.appendChild(upWrap);

	// 抽卡按钮
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;margin:14px 0;';
	const single = document.createElement('button');
	single.className = 'shop-refresh-btn';
	single.textContent = `单抽\n（💰 ${RECRUIT_SINGLE_COST.gold}）`;
	single.style.cssText = 'padding:10px 18px;font-size:14px;white-space:pre-wrap;';
	single.onclick = () => doRecruit(1, container);
	const ten = document.createElement('button');
	ten.className = 'shop-refresh-btn';
	ten.textContent = `十连抽\n（💰 ${RECRUIT_TEN_COST.gold}）`;
	ten.style.cssText = 'padding:10px 18px;font-size:14px;white-space:pre-wrap;background:#c0392b;';
	ten.onclick = () => doRecruit(10, container);
	const hundred = document.createElement('button');
	hundred.className = 'shop-refresh-btn';
	hundred.textContent = `百连抽\n（💰 ${RECRUIT_HUNDRED_COST.gold}）`;
	hundred.style.cssText = 'padding:10px 18px;font-size:14px;white-space:pre-wrap;background:#b8860b;';
	hundred.onclick = () => doRecruit(100, container);
	btnRow.appendChild(single); btnRow.appendChild(ten); btnRow.appendChild(hundred);
	container.appendChild(btnRow);
}

// 刷新幸运值进度条（填充宽度 + 文本 + 满值高亮）
function updateRecruitPityBar() {
	const pity = Math.min(window.recruitPity || 0, RECRUIT_LUCK_MAX);
	const fill = document.getElementById('recruit-pity-fill');
	if (fill) {
		fill.style.width = `${(pity / RECRUIT_LUCK_MAX) * 100}%`;
		fill.classList.toggle('full', pity >= RECRUIT_LUCK_MAX);
	}
	const text = document.getElementById('recruit-pity-line');
	if (text) text.textContent = `幸运值：${pity} / ${RECRUIT_LUCK_MAX}${pity >= RECRUIT_LUCK_MAX ? '（必出传说！）' : ''}`;
}

// 执行招募：固定以金币结算（与按钮展示的 💰 价格一致，不走 >1000 金币自动折算钻石的主货币逻辑）
function doRecruit(count, container) {
	const cost = count === 10 ? RECRUIT_TEN_COST : count === 100 ? RECRUIT_HUNDRED_COST : RECRUIT_SINGLE_COST;
	const meta = CURRENCY_META.gold;
	const payAmt = cost.gold || 0;
	const balance = window[meta.varKey] || 0;
	if (balance < payAmt) { Game.toast(meta.insufficient + '，无法招募！', 'error'); return; }
	window[meta.varKey] = balance - payAmt;
	updateResourceHUD();
	refreshShopCurrencyBar(); // 同步刷新商城内的金币/钻石展示
	// 每日任务：招募 1 次（单抽或十连都触发，target=1 完成即止）
	addDailyTaskProgress('recruit', 1);

	const results = [];
	for (let i = 0; i < count; i++) {
		window.recruitPity = (window.recruitPity || 0) + 1;
		let forceRank = null;
		// 幸运值满80必出传说
		if (window.recruitPity >= RECRUIT_LUCK_MAX) forceRank = 'legend';

		let res = recruitRollOne(forceRank);

		// 十连/百连每第10抽保底≥橙：若自然结果低于橙（稀有），提升为伪史诗（不覆盖更高概率命中）
		if (count >= 10 && i % 10 === 9 && !forceRank && res.rank === 'rare') {
			res = { charId: pickCharFromPool('epicfake'), rank: 'epicfake', isKami: false };
		}

		// 命中红且设置了 UP 将：优先替换为 UP 将
		if (res.rank === 'legend' && window.recruitUpCharId && characterList[window.recruitUpCharId]) {
			res = { charId: window.recruitUpCharId, rank: 'legend', isKami: false };
		}
		// 独立概率：在抽取判定后才单独判定 1% 拔升为神品（不占出货率、不影响保底）
		if (!res.isKami && Math.random() < RECRUIT_KAMI_UPGRADE_RATE) {
			res = { charId: res.charId, rank: res.rank, isKami: true };
		}
		// 出传说后幸运值清零
		if (res.rank === 'legend' || forceRank === 'legend') window.recruitPity = 0;

		grantRecruitCharacter(res.charId, res.isKami);
		const c = res.charId ? characterList[res.charId] : null;
		results.push({ charId: res.charId, name: c ? c.name : '？', rank: res.isKami ? 'kami' : res.rank, isKami: res.isKami });
	}

	SaveManager.autoSave();
	// 抽取结束后立即刷新幸运值显示
	updateRecruitPityBar();
	showRecruitResult(results);
}

// 招募结果弹窗
function showRecruitResult(results) {
	// 多抽按品质排序：开启设置且为多连抽时，按背包角色排序规则（品质降序 → 名称升序）展示
	if (window.multiSortByRank && results.length > 1) {
		// 与背包 RANK_ORDER 一致：数值越小品质越高（刚抽到的角色不在队/无突破/同等级，前几键恒等）
		const RANK_ORDER = { kami: 1, legend: 2, epic: 3, epicfake: 4, rare: 5, common: 6, junk: 7 };
		results = [...results].sort((a, b) => {
			const rankDiff = (RANK_ORDER[a.rank] || 99) - (RANK_ORDER[b.rank] || 99);
			if (rankDiff !== 0) return rankDiff;
			return (a.name || '').localeCompare(b.name || '');
		});
	}
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';
	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';
	dialog.style.cssText = 'width:380px;max-height:82vh;display:flex;flex-direction:column;';

	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#ffd700;text-align:center;margin-bottom:8px;';
	title.textContent = '招募结果';
	dialog.appendChild(title);

	const grid = document.createElement('div');
	grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;';
	results.forEach(r => {
		const cell = document.createElement('div');
		cell.style.cssText = `padding:6px 2px;text-align:center;border-radius:6px;background:#111;border:1px solid ${getRankColor(r.rank)};`;
		// 武将卡图
		const imgWrap = document.createElement('div');
		imgWrap.style.cssText = 'width:100%;aspect-ratio:3/4;overflow:hidden;border-radius:4px;background:#000;';
		const img = document.createElement('img');
		img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;display:block;';
		img.alt = r.name;
		if (r.charId) {
			img.src = `/image/character/${r.charId}.jpg`;
			img.onerror = function () {
				this.onerror = null;
				this.src = `/image/character/${r.charId}.webp`;
				this.onerror = function () { this.style.display = 'none'; };
			};
		} else {
			img.style.display = 'none';
		}
		imgWrap.appendChild(img);
		cell.appendChild(imgWrap);
		// 品质 + 名字
		const label = document.createElement('div');
		label.style.cssText = `font-size:10px;color:${getRankColor(r.rank)};font-weight:bold;margin-top:3px;`;
		label.textContent = r.isKami ? '神品' : getRankLabel(r.rank);
		cell.appendChild(label);
		// 红/金出货光晕：红色=传说，金色=神品
		if (r.rank === 'legend' || r.rank === 'kami') {
			const kami = r.rank === 'kami';
			cell.classList.add(kami ? 'recruit-kami-glow' : 'recruit-legend-glow');
			label.style.textShadow = kami
				? '0 0 6px rgba(255,215,0,0.95), 0 0 12px rgba(255,215,0,0.6)'
				: '0 0 6px rgba(255,68,68,0.95), 0 0 12px rgba(255,68,68,0.6)';
		}
		const nm = document.createElement('div');
		nm.style.cssText = 'font-size:10px;color:#fff;margin-top:1px;line-height:1.2;word-break:break-all;';
		nm.textContent = r.name;
		cell.appendChild(nm);
		grid.appendChild(cell);
	});
	// 结果网格放入可滚动区，确定按钮固定在弹窗底部
	const scrollWrap = document.createElement('div');
	scrollWrap.style.cssText = 'flex:1;overflow-y:auto;min-height:0;';
	scrollWrap.appendChild(grid);
	dialog.appendChild(scrollWrap);

	const ok = document.createElement('button');
	ok.className = 'ybrpg-confirm-btn';
	ok.textContent = '确定';
	ok.style.cssText = 'background:#d32f2f;margin-top:12px;';
	ok.onclick = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	dialog.appendChild(ok);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

// ==================== 宝物招募（抽取宝物，仿武将招募） ====================
// 品质档位说明（颜色/标签由 getRankColor/getRankName 提供）：
//   purple（紫，rank3 宝物）   orange（橙，rank4 宝物）
//   red（红，直接发 传说宝物箱 box_r5_pick）  gold（金，直接发 尊品宝物箱 box_r6_pick）
// 红/金共用一个幸运值档位：抽到该档位时，二选一随机发放红箱或金箱
const TREASURE_BOX_RED = 'box_r5_pick';   // 传说宝物箱（红）
const TREASURE_BOX_GOLD = 'box_r6_pick';  // 尊品宝物箱（金）

const TREASURE_RECRUIT_BASE_RATES = {
	purple: 0.80,   // 紫：80%
	orange: 0.1992, // 橙：19.92%
	redgold: 0.0008, // 红+金共用：0.08%（0 幸运值）
};
const TREASURE_RECRUIT_LUCK_MAX = 100;
const TR_LUCK_STEP1 = 40, TR_LUCK_STEP1_RATE = 0.02;
const TR_LUCK_STEP2 = 60, TR_LUCK_STEP2_RATE = 0.05;
const TR_LUCK_STEP3 = 80, TR_LUCK_STEP3_RATE = 0.10;
const TR_LUCK_STEP4 = 90, TR_LUCK_STEP4_RATE = 0.50;
const TREASURE_RECRUIT_SINGLE_COST = { gold: 3000 };
const TREASURE_RECRUIT_TEN_COST = { gold: 27000 };
const TREASURE_RECRUIT_HUNDRED_COST = { gold: 270000 }; // 百连=十连×10（保持9折档）

// 宝物招募硬编码池（与 equip.js TREASURE_DEFS 的 rank 一一对应）
// rank 对应：3紫 / 4橙 / 5红(箱子) / 6金(箱子)
const TREASURE_RECRUIT_POOLS = {
	// purple（紫，rank3 宝物，14 件）
	purple: [
		'bw_10803',   // 经验银书
		'bw_11012',   // 真空波动拳
		'bw_11013',   // 逆天神功
		'bw_11014',   // 南冥神功
		'bw_11109',   // 荆棘神功
		'bw_11110',   // 吸蜂神功
		'bw_11111',   // 天降春雨
		'bw_20803',   // 经验银兽
		'bw_21012',   // 天灵鸟
		'bw_21013',   // 鬼虎
		'bw_21014',   // 黑背棍猿
		'bw_21109',   // 五煞之龙
		'bw_21110',   // 风雷紫电兽
		'bw_21111',   // 九尾穿云豹
	],
	// orange（橙，rank4 宝物，22 件）
	orange: [
		'bw_11304',   // 经验金书
		'bw_11615',   // 女娲补天诀
		'bw_11616',   // 山海之印
		'bw_11617',   // 先蚕驱凤诀
		'bw_11618',   // 狂雷葬世
		'bw_11619',   // 狂火千爆
		'bw_11620',   // 造化战诀
		'bw_11621',   // 轩辕御龙诀
		'bw_11622',   // 灵枢通天诀
		'bw_11623',   // 天道战意诀
		'bw_11624',   // 凤舞天音诀
		'bw_21304',   // 经验金兽
		'bw_21615',   // 玄武
		'bw_21616',   // 闪电雕
		'bw_21617',   // 朱雀
		'bw_21618',   // 五毒蛟龙
		'bw_21619',   // 鬼眼雕王
		'bw_21620',   // 白虎
		'bw_21621',   // 青龙
		'bw_21622',   // 碧眼玉麟
		'bw_21623',   // 血棘异兽
		'bw_21624',   // 青鸾
	],
	// redgold（红/金箱子，来自 ITEM_DEFS：红=传说宝物箱，金=尊品宝物箱，各 1 件）
	redgold: [
		'box_r5_pick', // 传说宝物箱（红）
		'box_r6_pick', // 尊品宝物箱（金）
	],
};
// 红+金共用档位概率：沿用武将招募的五段保底曲线，满值必出
function getTreasureRecruitRedGoldRate(luck) {
	luck = luck || 0;
	if (luck < TR_LUCK_STEP1) return TREASURE_RECRUIT_BASE_RATES.redgold + (TR_LUCK_STEP1_RATE - TREASURE_RECRUIT_BASE_RATES.redgold) * (luck / TR_LUCK_STEP1);
	if (luck < TR_LUCK_STEP2) return TR_LUCK_STEP1_RATE + (TR_LUCK_STEP2_RATE - TR_LUCK_STEP1_RATE) * ((luck - TR_LUCK_STEP1) / (TR_LUCK_STEP2 - TR_LUCK_STEP1));
	if (luck < TR_LUCK_STEP3) return TR_LUCK_STEP2_RATE + (TR_LUCK_STEP3_RATE - TR_LUCK_STEP2_RATE) * ((luck - TR_LUCK_STEP2) / (TR_LUCK_STEP3 - TR_LUCK_STEP2));
	if (luck < TR_LUCK_STEP4) return TR_LUCK_STEP3_RATE + (TR_LUCK_STEP4_RATE - TR_LUCK_STEP3_RATE) * ((luck - TR_LUCK_STEP3) / (TR_LUCK_STEP4 - TR_LUCK_STEP3));
	return TR_LUCK_STEP4_RATE + (1 - TR_LUCK_STEP4_RATE) * ((luck - TR_LUCK_STEP4) / (TREASURE_RECRUIT_LUCK_MAX - TR_LUCK_STEP4));
}
function getTreasureRecruitRates(luck) {
	const redgold = getTreasureRecruitRedGoldRate(luck);
	const otherSum = 1 - redgold;
	const otherBase = TREASURE_RECRUIT_BASE_RATES.purple + TREASURE_RECRUIT_BASE_RATES.orange;
	return [
		{ tier: 'purple', rate: otherSum * (TREASURE_RECRUIT_BASE_RATES.purple / otherBase) },
		{ tier: 'orange', rate: otherSum * (TREASURE_RECRUIT_BASE_RATES.orange / otherBase) },
		{ tier: 'redgold', rate: redgold },
	];
}
// 按 tier 取一个宝物 id（基于硬编码 TREASURE_RECRUIT_POOLS，含防御性过滤，池空回退动态过滤）
function pickTreasureFromTier(tier) {
	const rank = tier === 'orange' ? 4 : 3;
	const tList = Game.Data.getTreasureList() || {};
	// 防御性过滤：硬编码清单中的 id 若已被移除/改名/改动，则跳过（不报错）
	const inPool = (id, needRank) => tList[id] && tList[id].rank === needRank;
	let pool = (TREASURE_RECRUIT_POOLS[tier] || []).filter(id => inPool(id, rank));
	// 若池为空（异常兜底），回退到原动态过滤
	if (pool.length === 0) pool = Object.keys(tList).filter(id => inPool(id, rank));
	if (pool.length === 0) pool = Object.keys(tList).filter(id => tList[id] && tList[id].rank);
	return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
// 抽到红/金档位时：二选一随机发放红箱或金箱，返回物品 id（基于硬编码 TREASURE_RECRUIT_POOLS.redgold）
function pickTreasureBox() {
	// 防御性过滤：硬编码清单中的 id 若已在 ITEM_DEFS 中被移除/改名，则跳过（不报错）
	let pool = (TREASURE_RECRUIT_POOLS.redgold || []).filter(id => ITEM_DEFS[id]);
	// 若池为空（异常兜底），回退到默认红/金箱
	if (pool.length === 0) pool = [TREASURE_BOX_RED, TREASURE_BOX_GOLD].filter(id => ITEM_DEFS[id]);
	return pool.length ? pool[Math.floor(Math.random() * pool.length)] : TREASURE_BOX_RED;
}
// 宝物抽取单发：返回 { tid, tier }
function treasureRecruitRollOne(forceTier) {
	let tier = forceTier;
	if (!tier) {
		const r = Math.random();
		let acc = 0;
		for (const item of getTreasureRecruitRates(window.treasurePity)) {
			acc += item.rate;
			if (r < acc) { tier = item.tier; break; }
		}
		if (!tier) tier = 'purple';
	}
	if (tier === 'redgold') {
		const boxId = pickTreasureBox();
		return { tid: boxId, tier: boxId === TREASURE_BOX_GOLD ? 'gold' : 'red' };
	}
	return { tid: pickTreasureFromTier(tier), tier };
}
// 发放结果：宝物走 addTreasure，箱子走 addItem
function grantTreasureRecruit(tid, tier) {
	if (!tid) return null;
	if (tier === 'red' || tier === 'gold') {
		if (Game.Data && typeof Game.Data.addItem === 'function') Game.Data.addItem(tid, 1);
	} else {
		if (Game.Data && typeof Game.Data.addTreasure === 'function') Game.Data.addTreasure(tid, 1);
	}
	return tid;
}

function renderTreasureRecruitView(container) {
	container.innerHTML = '';
	window.shopPage = 'treasurerecruit';

	if (window.treasurePity === undefined) window.treasurePity = 0;

	const goldBar = document.createElement('div');
	goldBar.className = 'shop-gold-bar';
	goldBar.innerHTML =
		`<span class="shop-gold-icon">💰</span> <span id="shop-gold-display">${fmtGroup4(window.gameGold || 0)}</span> 金币` +
		`&nbsp;&nbsp;<span class="shop-diamond-icon" id="shop-diamond-display">💎 ${fmtGroup4(window.diamond || 0)} 钻石</span>`;
	container.appendChild(goldBar);

	const head = document.createElement('div');
	head.style.cssText = 'display:flex;align-items:center;gap:12px;margin:10px 0;';
	const back = document.createElement('button');
	back.className = 'shop-refresh-btn';
	back.textContent = '← 返回';
	back.style.cssText = 'font-size:13px;';
	back.onclick = () => { window.shopPage = 'home'; renderShopView(container); };
	const htitle = document.createElement('div');
	htitle.style.cssText = 'font-size:17px;font-weight:bold;color:#ffd700;';
	htitle.textContent = '宝物招募';
	head.appendChild(back); head.appendChild(htitle);
	container.appendChild(head);

	const tip = document.createElement('div');
	tip.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-bottom:6px;line-height:1.6;';
	tip.innerHTML = '概率：紫(史诗宝物) 80% / 橙(传说宝物) 19.92% / 红+金(宝物箱) 0.08%起<br>幸运值越高红金概率越高，满值必出红或金箱；十连/百连每十抽必出≥橙';
	container.appendChild(tip);

	// 幸运值横向进度条
	const pityWrap = document.createElement('div');
	pityWrap.className = 'recruit-pity-wrap';
	const pityTrack = document.createElement('div');
	pityTrack.className = 'recruit-pity-track';
	const pityFill = document.createElement('div');
	pityFill.className = 'recruit-pity-fill';
	pityFill.id = 'treasure-recruit-pity-fill';
	const pityText = document.createElement('span');
	pityText.className = 'recruit-pity-text';
	pityText.id = 'treasure-recruit-pity-line';
	pityTrack.appendChild(pityFill); pityTrack.appendChild(pityText);
	pityWrap.appendChild(pityTrack);
	container.appendChild(pityWrap);
	updateTreasureRecruitPityBar();

	// 抽卡按钮
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;margin:14px 0;';
	const single = document.createElement('button');
	single.className = 'shop-refresh-btn';
	single.textContent = `单抽\n（💰 ${TREASURE_RECRUIT_SINGLE_COST.gold}）`;
	single.style.cssText = 'padding:10px 18px;font-size:14px;white-space:pre-wrap;';
	single.onclick = () => doTreasureRecruit(1, container);
	const ten = document.createElement('button');
	ten.className = 'shop-refresh-btn';
	ten.textContent = `十连抽\n（💰 ${TREASURE_RECRUIT_TEN_COST.gold}）`;
	ten.style.cssText = 'padding:10px 18px;font-size:14px;white-space:pre-wrap;background:#c0392b;';
	ten.onclick = () => doTreasureRecruit(10, container);
	const hundred = document.createElement('button');
	hundred.className = 'shop-refresh-btn';
	hundred.textContent = `百连抽\n（💰 ${TREASURE_RECRUIT_HUNDRED_COST.gold}）`;
	hundred.style.cssText = 'padding:10px 18px;font-size:14px;white-space:pre-wrap;background:#b8860b;';
	hundred.onclick = () => doTreasureRecruit(100, container);
	btnRow.appendChild(single); btnRow.appendChild(ten); btnRow.appendChild(hundred);
	container.appendChild(btnRow);
}

function updateTreasureRecruitPityBar() {
	const pity = Math.min(window.treasurePity || 0, TREASURE_RECRUIT_LUCK_MAX);
	const fill = document.getElementById('treasure-recruit-pity-fill');
	if (fill) {
		fill.style.width = `${(pity / TREASURE_RECRUIT_LUCK_MAX) * 100}%`;
		fill.classList.toggle('full', pity >= TREASURE_RECRUIT_LUCK_MAX);
	}
	const text = document.getElementById('treasure-recruit-pity-line');
	if (text) text.textContent = `幸运值：${pity} / ${TREASURE_RECRUIT_LUCK_MAX}${pity >= TREASURE_RECRUIT_LUCK_MAX ? '（必出红/金箱！）' : ''}`;
}

function doTreasureRecruit(count, container) {
	const cost = count === 10 ? TREASURE_RECRUIT_TEN_COST : count === 100 ? TREASURE_RECRUIT_HUNDRED_COST : TREASURE_RECRUIT_SINGLE_COST;
	const meta = CURRENCY_META.gold;
	const payAmt = cost.gold || 0;
	const balance = window[meta.varKey] || 0;
	if (balance < payAmt) { Game.toast(meta.insufficient + '，无法招募！', 'error'); return; }
	window[meta.varKey] = balance - payAmt;
	updateResourceHUD();
	refreshShopCurrencyBar();
	addDailyTaskProgress('recruit', 1);

	const results = [];
	for (let i = 0; i < count; i++) {
		window.treasurePity = (window.treasurePity || 0) + 1;
		let forceTier = null;
		if (window.treasurePity >= TREASURE_RECRUIT_LUCK_MAX) forceTier = 'redgold';

		let res = treasureRecruitRollOne(forceTier);

		// 十连/百连每第10抽保底≥橙：若自然结果为紫（低于橙），提升为橙
		if (count >= 10 && i % 10 === 9 && !forceTier && res.tier === 'purple') {
			res = { tid: pickTreasureFromTier('orange'), tier: 'orange' };
		}

		// 出红/金（含保底强制）后幸运值清零，与武将招募出传说清零规则一致
		if (res.tier === 'red' || res.tier === 'gold') window.treasurePity = 0;

		grantTreasureRecruit(res.tid, res.tier);

		let emoji, name;
		if (res.tier === 'red' || res.tier === 'gold') {
			const iDef = ITEM_DEFS[res.tid];
			// 优先使用宝箱专属图标（红箱 dj_20023 / 金箱 dj_20024），无图标时回退 emoji
			emoji = (iDef && (iDef.icon || iDef.emoji)) || '📦';
			name = (iDef && iDef.name) || res.tid;
		} else {
			const tDef = res.tid ? Game.Data.getTreasureList()[res.tid] : null;
			emoji = tDef ? (tDef.icon || '💎') : '💎';
			name = tDef ? tDef.name : '？';
		}
		results.push({ tid: res.tid, name, emoji, tier: res.tier });
	}

	SaveManager.autoSave();
	updateTreasureRecruitPityBar();
	showTreasureRecruitResult(results);
}

// 宝物抽取结果弹窗
function showTreasureRecruitResult(results) {
	// 多抽按品质排序：开启设置且为多连抽时，按背包宝物排序规则（品质降序 → baseId 升序）展示
	if (window.multiSortByRank && results.length > 1) {
		// 与背包 sortTreasuresByBagOrder 一致：品质降序后按 tid（即宝物 baseId）升序；新抽宝物未装备/同等级，前几键恒等
		const TIER_ORDER = ['purple', 'orange', 'red', 'gold'];
		results = [...results].sort((a, b) => {
			const tierDiff = TIER_ORDER.indexOf(b.tier) - TIER_ORDER.indexOf(a.tier);
			if (tierDiff !== 0) return tierDiff;
			return (a.tid || '').localeCompare(b.tid || '');
		});
	}
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.style.zIndex = '30000';
	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';
	dialog.style.cssText = 'width:380px;max-height:82vh;display:flex;flex-direction:column;';

	const title = document.createElement('div');
	title.style.cssText = 'font-size:16px;font-weight:bold;color:#ffd700;text-align:center;margin-bottom:8px;';
	title.textContent = '宝物招募结果';
	dialog.appendChild(title);

	const grid = document.createElement('div');
	grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;';
	results.forEach(r => {
		const color = getTreasureTierColor(r.tier);
		const cell = document.createElement('div');
		cell.style.cssText = `padding:6px 2px;text-align:center;border-radius:6px;background:#111;border:1px solid ${color};`;
		const iconWrap = document.createElement('div');
		iconWrap.style.cssText = 'width:100%;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#000;border-radius:4px;overflow:hidden;';
		if (/^https?:\/\//.test(r.emoji) || r.emoji.indexOf('/image/') === 0) {
			const img = document.createElement('img');
			img.src = r.emoji;
			img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
			iconWrap.appendChild(img);
		} else {
			iconWrap.textContent = r.emoji;
			iconWrap.style.fontSize = '28px';
		}
		cell.appendChild(iconWrap);
		const label = document.createElement('div');
		label.style.cssText = `font-size:10px;color:${color};font-weight:bold;margin-top:3px;`;
		label.textContent = getTreasureTierName(r.tier);
		cell.appendChild(label);
		// 红/金出货光晕：红色=红箱（传说），金色=金箱（尊品）
		if (r.tier === 'red' || r.tier === 'gold') {
			const gold = r.tier === 'gold';
			cell.classList.add(gold ? 'recruit-kami-glow' : 'recruit-legend-glow');
			label.style.textShadow = gold
				? '0 0 6px rgba(255,215,0,0.95), 0 0 12px rgba(255,215,0,0.6)'
				: '0 0 6px rgba(255,68,68,0.95), 0 0 12px rgba(255,68,68,0.6)';
		}
		const nm = document.createElement('div');
		nm.style.cssText = 'font-size:10px;color:#fff;margin-top:1px;line-height:1.2;word-break:break-all;';
		nm.textContent = r.name;
		cell.appendChild(nm);
		grid.appendChild(cell);
	});
	// 结果网格放入可滚动区，确定按钮固定在弹窗底部
	const scrollWrap = document.createElement('div');
	scrollWrap.style.cssText = 'flex:1;overflow-y:auto;min-height:0;';
	scrollWrap.appendChild(grid);
	dialog.appendChild(scrollWrap);

	const ok = document.createElement('button');
	ok.className = 'ybrpg-confirm-btn';
	ok.textContent = '确定';
	ok.style.cssText = 'background:#d32f2f;margin-top:12px;';
	ok.onclick = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	dialog.appendChild(ok);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
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

	// 4. 按所选购买货币扣费 (只扣一次)
	const payCur = item.payCurrency || 'diamond';
	const payMeta = CURRENCY_META[payCur] || CURRENCY_META.diamond;
	window[payMeta.varKey] = (window[payMeta.varKey] || 0) - (item.payAmount || 0);
	addDailyTaskProgress('buy', 1);

	// 5. 标记为已售出
	item.sold = true;

	// 同步刷新商城货币展示 + 顶部常驻资源条
	refreshShopCurrencyBar();
	updateResourceHUD();
}

// 刷新商城内的金币/钻石展示（各商城页面共用 shop-gold-display / shop-diamond-display）
function refreshShopCurrencyBar() {
	const goldDisplay = document.getElementById('shop-gold-display');
	if (goldDisplay) goldDisplay.textContent = fmtGroup4(window.gameGold || 0);
	const diaDisplay = document.getElementById('shop-diamond-display');
	if (diaDisplay) diaDisplay.textContent = `💎 ${fmtGroup4(window.diamond || 0)} 钻石`;
}

/**
 * 授予玩家一名武将（创建背包实例并加入图鉴）
 * @param {string} charId 基础角色ID
 * @returns {string|false} 新创建的实例ID，失败返回 false
 */

// 导出本模块定义的函数（供其他模块 import）
export { CURRENCY_SYMBOL, CURRENCY_META, pickPurchaseCurrency, normalizePrice, getPrimaryCurrency, getPriceAmount, formatPrice, getSellPrice, getCharPrice, scalePrice, getRankColor, getRankName, getTreasureTierColor, getTreasureTierName, refreshShopItems, showItemDetail, getRankText, renderShopView, renderShopLegacyView, renderShopHomeView, TREASURE_SHOP_ITEMS, openTreasureShopBuyDialog, renderTreasureShopView, RECRUIT_BASE_RATES, RECRUIT_LUCK_MAX, RECRUIT_LUCK_STEP1, RECRUIT_LUCK_STEP1_RATE, RECRUIT_LUCK_STEP2, RECRUIT_LUCK_STEP2_RATE, RECRUIT_LUCK_STEP3, RECRUIT_LUCK_STEP3_RATE, RECRUIT_LUCK_STEP4, RECRUIT_LUCK_STEP4_RATE, RECRUIT_KAMI_UPGRADE_RATE, RECRUIT_SINGLE_COST, RECRUIT_TEN_COST, RECRUIT_HUNDRED_COST, DROP_EXCLUDE_IDS_RECRUIT, RECRUIT_POOLS, getRecruitLegendRate, fmtRecruitRatePct, getRecruitRates, pickCharFromPool, recruitRollOne, grantRecruitCharacter, renderRecruitView, updateRecruitPityBar, doRecruit, showRecruitResult, TREASURE_BOX_RED, TREASURE_BOX_GOLD, TREASURE_RECRUIT_BASE_RATES, TREASURE_RECRUIT_LUCK_MAX, TR_LUCK_STEP1, TR_LUCK_STEP2, TR_LUCK_STEP3, TR_LUCK_STEP4, TREASURE_RECRUIT_SINGLE_COST, TREASURE_RECRUIT_TEN_COST, TREASURE_RECRUIT_HUNDRED_COST, TREASURE_RECRUIT_POOLS, getTreasureRecruitRedGoldRate, getTreasureRecruitRates, pickTreasureFromTier, pickTreasureBox, treasureRecruitRollOne, grantTreasureRecruit, renderTreasureRecruitView, updateTreasureRecruitPityBar, doTreasureRecruit, showTreasureRecruitResult, canBuy, buyevent, refreshShopCurrencyBar };

// 暴露给外部模块（shared 注册表）
shared.renderShopView = renderShopView;
