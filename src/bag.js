/**
 * 星河之契 - 背包系统
 * 由 mode.js 拆分而来（原行号见下文分段注释）
 */

import { shared } from './shared.js';
import { characterList } from './characterList.js';
import { TREASURE_DEFS } from './equip.js';
import { Game } from './core.js';
import { useItem, renderBagItemContent } from './item.js';
import { showBagCharDetail, showBagCharDetailPopup } from './team.js';
import { formatPrice, getRankColor, getSellPrice } from './shop.js';
import { SaveManager } from './other.js';

let _bagResetScroll = true;

function renderBagView(container) {
	// 只有显式标记重置（tab 切换）时回顶部；
	// 其他刷新（出售/吸收/升级等）保持当前滚动位置，直接读取旧 DOM 的 scrollTop
	const _bagBody = container.querySelector('.bag-body');
	const _restoreTop = _bagResetScroll ? -1 : (_bagBody ? _bagBody.scrollTop : 0);
	_bagResetScroll = false;
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
			_bagResetScroll = true; // 切换子标签：从顶部开始展示
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

			// 计算出售价格（未配置 sellPrice 的宝物不可出售）
			const sellPrice = getSellPrice(tDef);
			if (sellPrice == null) {
				Game.toast('该宝物不可出售', 'warning');
				return;
			}

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
		// 道具详情横框（保留使用入口）
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
		nameEl.textContent = '请选择物品';
		infoDiv.appendChild(nameEl);
		const descEl = document.createElement('div');
		descEl.className = 'bag-detail-desc';
		descEl.textContent = '空空如也';
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

	// 恢复滚动位置（同步 + 下一帧校正，适配图片异步加载后的高度变化）
	if (_restoreTop > 0) {
		const _scrollBody = container.querySelector('.bag-body');
		if (_scrollBody) {
			_scrollBody.scrollTop = _restoreTop;
			requestAnimationFrame(() => { _scrollBody.scrollTop = _restoreTop; });
		}
	}
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

		// 装备边框颜色：与角色品质色系一致（按宝物数值 rank 1~6 映射）
		const EQUIP_RANK_BORDER_COLORS = {
			1: '#88cc88', // 平凡/绿
			2: '#44aaff', // 精品/蓝
			3: '#a335ee', // 稀有/紫
			4: '#ff8800', // 伪史诗/橙
			5: '#ff8d8d', // 史诗/红粉
			6: '#ffff00'  // 传说/金
		};
		const equipRank = item.rank || (TREASURE_DEFS[item.baseId] && TREASURE_DEFS[item.baseId].rank) || 1;
		iconDiv.style.borderColor = EQUIP_RANK_BORDER_COLORS[equipRank] || '#888';

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
		{ label: '价值', value: formatPrice(tDef.price || { gold: 0 }) },
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

// 导出本模块定义的函数（供其他模块 import）
export { _bagResetScroll, renderBagView, sortTreasuresByBagOrder, renderBagEquipContent, updateBagEquipDetailBar, renderBagCharContent, updateBagCharDetailBar, showBagTreasureDetail };

// 暴露给外部模块（shared 注册表 / window）
shared.renderBagView = renderBagView;
shared.updateBagCharDetailBar = updateBagCharDetailBar;
window.renderBagView = renderBagView;
