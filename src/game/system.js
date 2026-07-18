
/**
 * 游戏系统模块 - 宝物实例化/升级/统计计算
 * 包含：宝物实例化、升级、战力计算、突破加成等核心系统
 */

// ====== 宝物实例化系统（重写） ======

/**
 * 获取宝物定义列表（从 TREASURE_DEFS）
 */
window.getTreasureDefs = function () {
	return window.TREASURE_DEFS || TREASURE_DEFS || {};
};

/**
 * 生成宝物实例ID
 * @param {string} baseId - 宝物基础ID
 */
window.generateTreasureInstanceId = function (baseId) {
	return `${baseId}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
};

/**
 * 初始化宝物背包（如果不存在）
 * 如果已有旧数据（包含 equippedBy），可以在这里做迁移清理
 */
window.ensureTreasureInventory = function () {
	if (!window.treasureInventory) {
		window.treasureInventory = {};
	}

	// 可选：清理旧数据中的 equippedBy 字段
	// 如果确认所有旧存档都已迁移，可以启用以下代码
	/*
	Object.values(window.treasureInventory).forEach(data => {
		if ('equippedBy' in data) {
			delete data.equippedBy;
		}
	});
	*/
};


/**
 * 获取所有宝物实例列表
 * @returns {Array} 宝物实例数组 [{ instanceId, baseId, ...defProps }]
 */
window.getTreasureInstanceList = function () {
	ensureTreasureInventory();
	const defs = getTreasureDefs();
	return Object.entries(window.treasureInventory).map(([instanceId, data]) => {
		const def = defs[data.baseId];
		return def ? { instanceId, baseId: data.baseId, ...def, equippedBy: data.equippedBy } : null;
	}).filter(Boolean);
};

/**
 * 获取指定角色的已装备宝物列表（有序，按槽位索引）
 * 从 charTreasureSlots 读取
 * @param {string} instanceId - 角色实例ID
 * @returns {Array} 宝物实例ID数组，长度固定为6
 */
window.getCharEquippedTreasures = function (instanceId) {
	window.ensureCharTreasureSlots();
	const slots = window.charTreasureSlots[instanceId];
	if (slots) {
		return [...slots]; // 返回副本，避免外部修改原数据
	}
	return [null, null, null, null, null, null];
};


/**
 * 确保 charTreasureSlots 数据结构存在
 */
window.ensureCharTreasureSlots = function () {
	if (!window.charTreasureSlots) {
		window.charTreasureSlots = {};
	}
	// 为每个有实例的角色初始化6个空槽位
	if (window.charBagData) {
		Object.keys(window.charBagData).forEach(instId => {
			if (!window.charTreasureSlots[instId]) {
				window.charTreasureSlots[instId] = [null, null, null, null, null, null];
			}
		});
	}
};

/**
 * 为角色的指定阵容格子装备/卸下宝物
 * 宝物装备信息完全存储在 charTreasureSlots 中，宝物实例本身不记录装备者
 * @param {string} charInstanceId - 角色实例ID
 * @param {number} slotIndex - 宝物槽位 (0-5)
 * @param {string|null} treasureInstanceId - 宝物实例ID，传 null 为卸下
 */
window.equipTreasure = function (charInstanceId, slotIndex, treasureInstanceId) {
	window.ensureTreasureInventory();
	window.ensureCharTreasureSlots();

	// 1. 校验参数
	if (slotIndex < 0 || slotIndex > 5) {
		console.warn(`无效的宝物槽位索引: ${slotIndex}`);
		toast('无效的宝物槽位', 'error');
		return;
	}

	const currentSlots = window.charTreasureSlots[charInstanceId];
	if (!currentSlots) {
		console.warn(`角色实例 ${charInstanceId} 没有初始化宝物槽位`);
		return;
	}

	// 2. 如果该槽位已有宝物，只清除槽位记录
	const oldTreasureId = currentSlots[slotIndex];

	// 3. 如果要装备新的宝物
	if (treasureInstanceId) {
		const newTreasureData = window.treasureInventory[treasureInstanceId];
		if (!newTreasureData) {
			console.warn(`宝物实例 ${treasureInstanceId} 不存在`);
			toast('宝物数据异常', 'error');
			return;
		}

		// 3a. 检查这个宝物实例是否已经被装备在其他角色的任何槽位上
		for (const [ownerId, ownerSlots] of Object.entries(window.charTreasureSlots)) {
			const existingSlotIndex = ownerSlots.indexOf(treasureInstanceId);
			if (existingSlotIndex !== -1) {
				// 如果被装备在自己的其他槽位，清除旧槽位
				if (ownerId === charInstanceId) {
					ownerSlots[existingSlotIndex] = null;
				} else {
					// 被其他角色装备，阻止装备
					toast('该宝物已被其他角色装备', 'warning');
					return;
				}
			}
		}
	}

	// 4. 更新槽位
	currentSlots[slotIndex] = treasureInstanceId;

	// 5. 自动保存
	if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
		SaveManager.autoSave();
	}
};

/**
 * 添加宝物到背包（创建实例）- 不再设置 equippedBy
 * @param {string} baseId - 宝物基础ID
 * @param {number} count - 数量，默认1
 * @returns {string[]} 创建的实例ID数组
 */
window.addTreasureInstance = function (baseId, count = 1) {
	ensureTreasureInventory();
	const defs = getTreasureDefs();
	if (!defs[baseId]) {
		console.warn(`宝物 ${baseId} 定义不存在`);
		return [];
	}

	const createdIds = [];
	for (let i = 0; i < count; i++) {
		const instanceId = generateTreasureInstanceId(baseId);
		window.treasureInventory[instanceId] = {
			baseId: baseId,
			level: 1 // 新增：初始等级为1
		};
		createdIds.push(instanceId);
	}
	return createdIds;
};



/**
 * 移除宝物实例
 * @param {string} instanceId - 宝物实例ID
 */
window.removeTreasureInstance = function (instanceId) {
	ensureTreasureInventory();
	if (window.treasureInventory[instanceId]) {
		delete window.treasureInventory[instanceId];
		return true;
	}
	return false;
};

/**
 * 获取宝物的属性加成（用于战斗时合并）
 * @param {string} instanceId - 宝物实例ID
 * @returns {Object} { atk: 0, def: 0, hp: 0, spe: 0, mingzhong: 0, shanbi: 0, baoji: 0, kangbao: 0, poji: 0, gedang: 0}
 */
window.getTreasureStats = function (instanceId) {
	ensureTreasureInventory();
	const data = window.treasureInventory[instanceId];
	if (!data) return { atk: 0, def: 0, hp: 0, };

	const defs = getTreasureDefs();
	const def = defs[data.baseId];
	if (!def) return { atk: 0, def: 0, hp: 0, };

	const level = data.level || 1;
	const multiplier = level; // 等级倍数

	// 攻防血按等级倍数计算
	const result = {
		atk: (def.atk || 0) * multiplier,
		def: (def.def || 0) * multiplier,
		hp: (def.hp || 0) * multiplier,
	};

	// 其他属性条目原封不动传下去（不乘等级倍数）
	const metaKeys = new Set(['id', 'name', 'desc', 'icon', 'price', 'atk', 'def', 'hp']);
	for (const key of Object.keys(def)) {
		if (metaKeys.has(key)) continue;
		result[key] = def[key];
	}

	return result;
};


/**
 * 合并宝物属性到角色属性（战斗前调用）
 * 从 charTreasureSlots 获取装备的宝物
 * @param {Object} unit - 角色对象（包含 instanceId）
 */
window.applyTreasureStatsToUnit = function (unit) {
	if (!unit || !unit.instanceId) return;

	// 从角色槽位获取装备的宝物ID
	const equippedTreasureIds = getCharEquippedTreasures(unit.instanceId);
	let totalAtk = 0, totalDef = 0, totalHp = 0, totalSpe = 0;

	equippedTreasureIds.forEach(tid => {
		if (!tid) return;
		const stats = window.getTreasureStats(tid);
		totalAtk += stats.atk;
		totalDef += stats.def;
		totalHp += stats.hp;
		totalSpe += stats.spe;
	});

	// 应用加成
	unit.atk = (unit.atk || 0) + totalAtk;
	unit.def = (unit.def || 0) + totalDef;
	unit.hp = (unit.hp || 0) + totalHp;
	unit.spe = (unit.spe || 0) + totalSpe;

	// 确保最大血量同步
	unit.maxHp = unit.hp;

	return unit;
};



/**
 * 更新 buildPlayerTeamForBattle 以应用宝物属性
 */
window.originalBuildPlayerTeamForBattle = window.buildPlayerTeamForBattle;
window.buildPlayerTeamForBattle = function () {
	const team = (window.originalBuildPlayerTeamForBattle || function () {
		return (window.currentTeam || []).map(instanceId => {
			const instData = window.charBagData && window.charBagData[instanceId];
			if (!instData) return { id: null, name: '', hp: 0, atk: 0, def: 0, spe: 0, skills: [], buff: [] };
			const charId = instData.charId || instanceId;
			const base = characterList[charId];
			return {
				id: charId,
				instanceId: instanceId,
				name: base ? base.name : charId,
				hp: instData.hp || (base ? base.hp : 0),
				atk: instData.atk || (base ? base.atk : 0),
				def: instData.def || (base ? base.def : 0),
				spe: instData.spe || (base ? base.spe : 0),
				skills: instData.skills || (base ? base.skills : []),
				buff: instData.buff || [],
				rank: instData.rank || (base ? base.rank : 'common'),
				tupolevel: instData.tupolevel || 0,
				tupoList: instData.tupoList || (base ? base.tupoList : []),
			};
		});
	})();

	// 应用宝物属性加成
	team.forEach(unit => {
		if (unit && unit.instanceId) {
			applyTreasureStatsToUnit(unit);
		}
	});

	return team;
};

// ====== 宝物升级系统 ======

/**
 * 获取宝物实例的当前数值（考虑等级加成）
 * @param {string} instanceId - 宝物实例ID
 * @returns {Object} { atk, def, hp, spe, desc }
 */
function getTreasureStatsWithLevel(instanceId) {
	const data = window.treasureInventory[instanceId];
	if (!data) return { atk: 0, def: 0, hp: 0, spe: 0, desc: '' };

	const defs = getTreasureDefs();
	const def = defs[data.baseId];
	if (!def) return { atk: 0, def: 0, hp: 0, spe: 0, desc: '' };

	const level = data.level || 1;
	const multiplier = level; // 1级=1倍, 2级=2倍, ... 10级=10倍

	return {
		atk: (def.atk || 0) * multiplier,
		def: (def.def || 0) * multiplier,
		hp: (def.hp || 0) * multiplier,
		spe: (def.spe || 0) * multiplier,
		desc: def.desc || '',
		name: def.name || '',
		icon: def.icon || '',
		baseId: data.baseId,
		level: level,
		maxLevel: 10
	};
}

/**
 * 显示宝物升级浮窗
 * @param {string} treasureInstanceId - 要升级的宝物实例ID
 * @param {string} charInstanceId - 所属角色实例ID（可选，阵容中调用时传入）
 */
function showTreasureUpgradePopup(treasureInstanceId, charInstanceId = null, slotIndex = null) {

	// 检查宝物是否存在
	const treasureData = window.treasureInventory[treasureInstanceId];
	if (!treasureData) {
		toast('宝物数据异常', 'error');
		return;
	}

	const stats = getTreasureStatsWithLevel(treasureInstanceId);
	var currentLevel = stats.level;
	const baseId = stats.baseId;
	const defs = getTreasureDefs();
	const def = defs[baseId];

	if (!def) {
		toast('宝物定义缺失', 'error');
		return;
	}

	// 检查是否已达到最大等级
	// if (currentLevel >= 10) {
	//	 toast('该宝物已达到最高等级', 'warning');
	//	 return;
	// }

	// 查找同名宝物实例（作为升级材料）
	// 查找同名宝物实例（作为升级材料）
	// 规则：排除自身、排除已被装备的、排除已升级过的（等级>1）
	const fodderInstanceIds = Object.keys(window.treasureInventory).filter(id => {
		if (id === treasureInstanceId) return false; // 排除自身
		const inv = window.treasureInventory[id];
		if (!inv || inv.baseId !== baseId) return false; // 必须是同名宝物

		// 排除已被装备的宝物
		if (window.charTreasureSlots) {
			for (const [ownerId, slots] of Object.entries(window.charTreasureSlots)) {
				if (slots && slots.includes(id)) {
					return false; // 已被其他角色装备
				}
			}
		}

		// 排除已升级过的宝物（等级>1）
		if (inv.level && inv.level > 1) {
			return false; // 已升级过的宝物不能作为材料
		}

		return true;
	});

	// 计算可用材料数量
	const fodderCount = fodderInstanceIds.length;



	// 创建遮罩层
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';
	overlay.id = 'treasure-upgrade-overlay';

	// 创建弹窗
	const popup = document.createElement('div');
	popup.style.cssText = `
		background: #1a1a1a;
		border: 2px solid #ffd700;
		border-radius: 12px;
		padding: 20px;
		max-width: 360px;
		width: 90%;
		display: flex;
		flex-direction: column;
		animation: dialogIn 0.2s ease;
		color: #fff;
	`;

	// 标题
	const title = document.createElement('div');
	title.style.cssText = 'color:#ffd700;font-size:18px;font-weight:bold;text-align:center;margin-bottom:15px;';
	title.textContent = `宝物升级 - ${def.name}`;
	popup.appendChild(title);

	// 当前宝物信息
	const infoSection = document.createElement('div');
	infoSection.style.cssText = 'background:#2a2a2a;border-radius:8px;padding:12px;margin-bottom:12px;';

	// 宝物图标和名称
	const headerRow = document.createElement('div');
	headerRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;';

	if (def.icon) {
		const icon = document.createElement('img');
		icon.src = def.icon;
		icon.style.cssText = 'width:40px;height:40px;object-fit:contain;border-radius:4px;';
		icon.onerror = function () { this.style.display = 'none'; };
		headerRow.appendChild(icon);
	}

	const nameLevel = document.createElement('div');
	nameLevel.style.cssText = 'flex:1;';
	nameLevel.innerHTML = `
		<div style="font-size:16px;font-weight:bold;color:#fff;">${def.name}</div>
		<div style="font-size:13px;color:#ffd700;" data-level-display>Lv.${currentLevel}/10</div>
	`;
	headerRow.appendChild(nameLevel);
	infoSection.appendChild(headerRow);

	// 属性展示
	const attrRow = document.createElement('div');
	attrRow.setAttribute('data-attr-display', 'true');
	attrRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;';

	const baseAtk = def.atk || 0;
	const baseDef = def.def || 0;
	const baseHp = def.hp || 0;
	const baseSpe = def.spe || 0;

	if (baseAtk > 0) {
		attrRow.innerHTML += `<div style="color:#ff4444;">攻击: ${baseAtk * currentLevel} </div>`;
	}
	if (baseDef > 0) {
		attrRow.innerHTML += `<div style="color:#88cc88;">防御: ${baseDef * currentLevel}</div>`;
	}
	if (baseHp > 0) {
		attrRow.innerHTML += `<div style="color:#44aaff;">生命: ${baseHp * currentLevel}</div>`;
	}
	if (baseSpe > 0) {
		attrRow.innerHTML += `<div style="color:#ffff44;">速度: ${baseSpe * currentLevel}</div>`;
	}

	infoSection.appendChild(attrRow);
	// ==============================
	// 【添加位置】在这里插入宝物对角色总加成的显示
	// ==============================
	if (charInstanceId) {
		const bonusInfo = document.createElement('div');
		bonusInfo.setAttribute('data-char-treasure-bonus', 'true');
		bonusInfo.style.cssText = 'font-size:11px;color:#aaa;margin-top:8px;padding-top:6px;border-top:1px solid #444;';

		// 直接使用当前宝物的属性
		const baseAtk = def.atk || 0;
		const baseDef = def.def || 0;
		const baseHp = def.hp || 0;
		const baseSpe = def.spe || 0;
		const level = currentLevel; // 注意：这里的 currentLevel 需要从外部获取

		// let bonusParts = [];
		// if (baseAtk > 0) bonusParts.push(`攻击+${baseAtk * level}`);
		// if (baseDef > 0) bonusParts.push(`防御+${baseDef * level}`);
		// if (baseHp > 0) bonusParts.push(`生命+${baseHp * level}`);
		// if (baseSpe > 0) bonusParts.push(`速度+${baseSpe * level}`);

		// if (bonusParts.length > 0) {
		// 	bonusInfo.innerHTML = `当前宝物加成: ${def.desc(level)}`;
		// } else {
		// 	bonusInfo.innerHTML = `当前宝物无属性加成`;
		// }
		bonusInfo.innerHTML = `当前宝物加成: ${def.desc(level)}`;

		infoSection.appendChild(bonusInfo);
	}

	// ==============================
	popup.appendChild(infoSection);

	// 材料信息
	const materialSection = document.createElement('div');
	materialSection.style.cssText = 'background:#2a2a2a;border-radius:8px;padding:12px;margin-bottom:12px;';

	const materialTitle = document.createElement('div');
	materialTitle.style.cssText = 'font-size:14px;color:#aaa;margin-bottom:6px;';
	materialTitle.textContent = '升级材料（同名宝物）';
	materialSection.appendChild(materialTitle);

	const materialCount = document.createElement('div');
	materialCount.setAttribute('data-material-count', 'true');
	const needCount = currentLevel; // 升到下一级需要当前等级数量的同名宝物
	materialCount.style.cssText = 'font-size:13px;color:#ddd;';
	materialCount.innerHTML = `需要: <span style="color:#ffd700;">${needCount}</span> 个 · 可用: <span style="color:${fodderCount >= needCount ? '#44ff88' : '#ff4444'};">${fodderCount}</span> 个`;
	materialSection.appendChild(materialCount);

	// 如果可用材料不足，显示提示
	if (fodderCount < needCount) {
		const shortageTip = document.createElement('div');
		shortageTip.style.cssText = 'font-size:11px;color:#ff6666;margin-top:4px;';
		shortageTip.textContent = `材料不足，还需 ${needCount - fodderCount} 个同名宝物`;
		materialSection.appendChild(shortageTip);
	}

	popup.appendChild(materialSection);

	// 下一级预览
	if (currentLevel < 10) {
		const previewSection = document.createElement('div');
		previewSection.style.cssText = 'background:#2a2a3a;border-radius:8px;padding:12px;margin-bottom:12px;border:1px solid #ffd700;';
		// 在创建 previewTitle 时：
		const previewTitle = document.createElement('div');
		previewTitle.setAttribute('data-preview-title', 'true');
		previewTitle.style.cssText = 'font-size:14px;color:#ffd700;margin-bottom:6px;';
		previewTitle.textContent = `升级至 Lv.${currentLevel + 1} 预览`;
		previewSection.appendChild(previewTitle);

		const multiplier = currentLevel + 1;
		const previewContent = document.createElement('div');
		previewContent.setAttribute('data-preview-section', 'true');
		previewContent.style.cssText = 'font-size:12px;color:#ccc;line-height:1.6;';

		let previewText = '';
		if (baseAtk > 0) previewText += `攻击: ${baseAtk * currentLevel} → ${baseAtk * multiplier}\n`;
		if (baseDef > 0) previewText += `防御: ${baseDef * currentLevel} → ${baseDef * multiplier}\n`;
		if (baseHp > 0) previewText += `生命: ${baseHp * currentLevel} → ${baseHp * multiplier}\n`;
		if (baseSpe > 0) previewText += `速度: ${baseSpe * currentLevel} → ${baseSpe * multiplier}\n`;

		previewContent.textContent = previewText;
		previewSection.appendChild(previewContent);
		popup.appendChild(previewSection);
	}

	// 按钮区域
	const btnRow = document.createElement('div');
	btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;';

	// 升级按钮
	const upgradeBtn = document.createElement('button');
	upgradeBtn.className = 'ybrpg-btn';
	upgradeBtn.style.cssText = 'width:auto;padding:8px 20px;font-size:14px;flex:1;min-width:80px;';
	upgradeBtn.textContent = '升级';

	if (fodderCount < needCount || currentLevel >= 10) {
		upgradeBtn.disabled = true;
		upgradeBtn.style.opacity = '0.5';
		upgradeBtn.style.cursor = 'not-allowed';
		if (currentLevel >= 10) {
			upgradeBtn.textContent = '已满级';
		} else {
			upgradeBtn.textContent = `材料不足(${fodderCount}/${needCount})`;
		}
	}

	// 升级按钮点击事件（替换原来的全部 onclick 逻辑）
	upgradeBtn.onclick = () => {
		// ===== 每次点击时重新读取最新数据 =====
		const latestTreasureData = window.treasureInventory[treasureInstanceId];
		if (!latestTreasureData) {
			toast('宝物数据异常', 'error');
			return;
		}

		const latestLevel = latestTreasureData.level || 1;

		if (latestLevel >= 10) {
			toast('宝物已达到最高等级', 'warning');
			// 更新按钮状态
			upgradeBtn.textContent = '已满级';
			upgradeBtn.disabled = true;
			upgradeBtn.style.opacity = '0.5';
			return;
		}

		// ===== 重新计算可用材料 =====
		const freshFodderIds = Object.keys(window.treasureInventory).filter(id => {
			if (id === treasureInstanceId) return false;
			const inv = window.treasureInventory[id];
			if (!inv || inv.baseId !== baseId) return false;

			// 排除已被装备的
			for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
				if (slots && slots.includes(id)) {
					return false;
				}
			}

			// 排除已升级过的
			if (inv.level && inv.level > 1) {
				return false;
			}

			return true;
		});

		const freshFodderCount = freshFodderIds.length;
		const requiredCount = latestLevel; // 升到下一级需要当前等级数量的同名宝物

		if (freshFodderCount < requiredCount) {
			toast(`材料不足！需要 ${requiredCount} 个同名宝物，当前可用: ${freshFodderCount}`, 'error');
			return;
		}

		// ===== 确认弹窗 =====
		confirmDialog(
			`确定消耗 ${requiredCount} 个【${def.name}】升级宝物至 Lv.${latestLevel + 1} 吗？\n可用材料: ${freshFodderCount} 个`,
			() => {
				// 确认后再次检查（防止在确认过程中数据变化）
				const confirmTreasureData = window.treasureInventory[treasureInstanceId];
				if (!confirmTreasureData) {
					toast('宝物数据异常', 'error');
					return;
				}

				const confirmLevel = confirmTreasureData.level || 1;
				if (confirmLevel >= 10) {
					toast('宝物已达到最高等级', 'warning');
					return;
				}

				// 重新计算可用材料
				const confirmFodderIds = Object.keys(window.treasureInventory).filter(id => {
					if (id === treasureInstanceId) return false;
					const inv = window.treasureInventory[id];
					if (!inv || inv.baseId !== baseId) return false;

					for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
						if (slots && slots.includes(id)) {
							return false;
						}
					}

					if (inv.level && inv.level > 1) {
						return false;
					}

					return true;
				});

				const confirmFodderCount = confirmFodderIds.length;
				const confirmRequiredCount = confirmLevel;

				if (confirmFodderCount < confirmRequiredCount) {
					toast(`材料不足！需要 ${confirmRequiredCount} 个同名宝物，当前可用: ${confirmFodderCount}`, 'error');
					return;
				}

				// ===== 消耗材料 =====
				for (let i = 0; i < confirmRequiredCount; i++) {
					const fodderId = confirmFodderIds[i];

					// 如果材料宝物被装备在其他角色身上，需要先卸下
					for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
						const slotIdx = slots.indexOf(fodderId);
						if (slotIdx !== -1) {
							slots[slotIdx] = null;
							break;
						}
					}

					delete window.treasureInventory[fodderId];
				}

				// ===== 提升等级 =====
				const newLevel = confirmLevel + 1;
				window.treasureInventory[treasureInstanceId].level = newLevel;

				// ===== 刷新弹窗内容 =====
				refreshUpgradePopupUI(popup, def, baseId, treasureInstanceId, newLevel, upgradeBtn, charInstanceId);
				const refreshInstanceId = charInstanceId || null;

				// 找到 toast 调用前，添加：
				if (charInstanceId) {
					refreshTreasureUI(charInstanceId);
					// ===== 【新增】强制刷新阵容详情面板 =====
					const teamIndex = window.currentTeam ? window.currentTeam.indexOf(charInstanceId) : -1;
					if (teamIndex !== -1) {
						// 如果在阵容中，刷新详情
						if (window._selectedSlotIndex !== undefined && window._selectedSlotIndex === teamIndex) {
							const instData = window.charBagData && window.charBagData[charInstanceId];
							if (instData) {
								const charId = instData.charId || charInstanceId;
								showTeamCharInfo(teamIndex, charInstanceId, charId);
							}
						}
						// 刷新格子图标
						refreshTeamSlot(teamIndex);
					}
					// ======================================
					// 刷新阵容详情
					// if (window._selectedSlotIndex !== undefined && window.currentTeam) {
					// 	const currentInstId = window.currentTeam[window._selectedSlotIndex];
					// 	if (currentInstId && currentInstId === charInstanceId) {
					// 		const instData = window.charBagData && window.charBagData[charInstanceId];
					// 		if (instData) {
					// 			const charId = instData.charId || charInstanceId;
					// 			showTeamCharInfo(window._selectedSlotIndex, charInstanceId, charId);
					// 		}
					// 	}
					// }

					// 刷新队伍格子
					// const teamIndex = window.currentTeam ? window.currentTeam.indexOf(charInstanceId) : -1;
					// if (teamIndex !== -1) {
					// 	refreshTeamSlot(teamIndex);
					// }
				}
				refreshAllViews({
					instanceId: refreshInstanceId
				});
				// ===== 更新局部变量（用于下次点击时的初始校验） =====
				currentLevel = newLevel;

				toast(`【${def.name}】升级成功！当前 Lv.${newLevel}`, 'success');
				SaveManager.autoSave();
			}
		);
	};

	btnRow.appendChild(upgradeBtn);

	// 替换宝物按钮（仅阵容界面调用时显示）
	if (charInstanceId && slotIndex !== null) {
		const replaceBtn = document.createElement('button');
		replaceBtn.className = 'ybrpg-btn';
		replaceBtn.style.cssText = 'width:auto;padding:8px 20px;font-size:14px;flex:1;min-width:80px;background:#44aaff;';
		replaceBtn.textContent = '替换宝物';
		replaceBtn.onclick = () => {
			overlay.remove();
			showTreasureSelectPopup(charInstanceId, slotIndex);
		};
		btnRow.appendChild(replaceBtn);
	}

	// 关闭按钮
	const closeBtn = document.createElement('button');
	closeBtn.className = 'ybrpg-btn';
	closeBtn.style.cssText = 'width:auto;padding:8px 20px;font-size:14px;flex:1;min-width:80px;';
	closeBtn.textContent = '关闭';
	closeBtn.onclick = () => {
		const upgradeOverlay = document.getElementById('treasure-upgrade-overlay');
		if (upgradeOverlay && upgradeOverlay.parentNode) {
			upgradeOverlay.parentNode.removeChild(upgradeOverlay);
		}
	};
	btnRow.appendChild(closeBtn);

	popup.appendChild(btnRow);
	overlay.appendChild(popup);
	document.body.appendChild(overlay);

	overlay.onclick = (e) => {
		if (e.target === overlay) {
			const upgradeOverlay = document.getElementById('treasure-upgrade-overlay');
			if (upgradeOverlay && upgradeOverlay.parentNode) {
				upgradeOverlay.parentNode.removeChild(upgradeOverlay);
			}
		}
	};

}


/**
 * 刷新宝物升级弹窗的UI
 */
function refreshUpgradePopupUI(popup, def, baseId, treasureInstanceId, currentLevel, upgradeBtn, charInstanceId) {
	if (!popup) return;

	// 1. 更新等级显示
	const levelDisplay = popup.querySelector('[data-level-display]');
	if (levelDisplay) {
		levelDisplay.textContent = `Lv.${currentLevel}/10`;
	}

	// 2. 更新属性预览（当前属性 → 下一级属性）
	const attrRow = popup.querySelector('[data-attr-display]');
	if (attrRow) {
		const baseAtk = def.atk || 0;
		const baseDef = def.def || 0;
		const baseHp = def.hp || 0;
		const baseSpe = def.spe || 0;

		let attrsHTML = '';
		const nextMultiplier = currentLevel + 1;
		if (baseAtk > 0) attrsHTML += `<div style="color:#ff4444;">攻击: ${baseAtk * currentLevel}</div>`;
		if (baseDef > 0) attrsHTML += `<div style="color:#88cc88;">防御: ${baseDef * currentLevel}</div>`;
		if (baseHp > 0) attrsHTML += `<div style="color:#44aaff;">生命: ${baseHp * currentLevel}</div>`;
		if (baseSpe > 0) attrsHTML += `<div style="color:#ffff44;">速度: ${baseSpe * currentLevel}</div>`;
		attrRow.innerHTML = attrsHTML;
	}

	// 3. 更新材料信息
	const materialCount = popup.querySelector('[data-material-count]');
	if (materialCount) {
		const newFodderCount = Object.keys(window.treasureInventory).filter(id => {
			if (id === treasureInstanceId) return false;
			const inv = window.treasureInventory[id];
			if (!inv || inv.baseId !== baseId) return false;

			for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
				if (slots && slots.includes(id)) {
					return false;
				}
			}

			if (inv.level && inv.level > 1) {
				return false;
			}

			return true;
		}).length;

		const nextNeedCount = currentLevel; // 升到下一级需要当前等级数量
		const isSufficient = newFodderCount >= nextNeedCount;
		materialCount.innerHTML = `需要: <span style="color:#ffd700;">${nextNeedCount}</span> 个 · 可用: <span style="color:${isSufficient ? '#44ff88' : '#ff4444'};">${newFodderCount}</span> 个`;

		// 更新或添加材料不足提示
		let shortageTip = popup.querySelector('[data-shortage-tip]');
		if (!isSufficient) {
			if (!shortageTip) {
				shortageTip = document.createElement('div');
				shortageTip.setAttribute('data-shortage-tip', 'true');
				shortageTip.style.cssText = 'font-size:11px;color:#ff6666;margin-top:4px;';
				materialCount.parentElement.appendChild(shortageTip);
			}
			shortageTip.textContent = `材料不足，还需 ${nextNeedCount - newFodderCount} 个同名宝物`;
		} else {
			if (shortageTip) {
				shortageTip.remove();
			}
		}
	}

	// 4. 更新预览区
	const previewSection = popup.querySelector('[data-preview-section]');
	if (previewSection) {
		if (currentLevel < 10) {
			const multiplier = currentLevel + 1;
			let previewText = '';
			if (def.atk > 0) previewText += `攻击: ${def.atk * currentLevel} → ${def.atk * multiplier}\n`;
			if (def.def > 0) previewText += `防御: ${def.def * currentLevel} → ${def.def * multiplier}\n`;
			if (def.hp > 0) previewText += `生命: ${def.hp * currentLevel} → ${def.hp * multiplier}\n`;
			if (def.spe > 0) previewText += `速度: ${def.spe * currentLevel} → ${def.spe * multiplier}\n`;
			previewSection.textContent = previewText;

			// 更新预览标题
			const previewTitle = previewSection.parentElement?.querySelector('[data-preview-title]');
			if (previewTitle) {
				previewTitle.textContent = `升级至 Lv.${currentLevel + 1} 预览`;
			}
		} else {
			// 满级时隐藏预览区
			previewSection.parentElement?.remove();
		}
	}

	// 5. 更新升级按钮
	if (upgradeBtn) {
		if (currentLevel >= 10) {
			upgradeBtn.textContent = '已满级';
			upgradeBtn.disabled = true;
			upgradeBtn.style.opacity = '0.5';
		} else {
			const newFodderCount = Object.keys(window.treasureInventory).filter(id => {
				if (id === treasureInstanceId) return false;
				const inv = window.treasureInventory[id];
				if (!inv || inv.baseId !== baseId) return false;

				for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
					if (slots && slots.includes(id)) {
						return false;
					}
				}

				if (inv.level && inv.level > 1) {
					return false;
				}

				return true;
			}).length;

			const nextNeedCount = currentLevel;
			if (newFodderCount < nextNeedCount) {
				upgradeBtn.textContent = `升级材料不足`;
				upgradeBtn.disabled = true;
				upgradeBtn.style.opacity = '0.5';
			} else {
				upgradeBtn.textContent = `升级`;
				upgradeBtn.disabled = false;
				upgradeBtn.style.opacity = '1';
				upgradeBtn.style.cursor = 'pointer';
			}
		}
	}
	// ===== 【修改】只显示当前宝物的属性增幅 =====
	if (charInstanceId) {
		const bonusInfo = popup.querySelector('[data-char-treasure-bonus]');
		if (bonusInfo) {
			// 直接使用当前宝物的属性（def 是当前宝物定义，由外部传入）
			const baseAtk = def.atk || 0;
			const baseDef = def.def || 0;
			const baseHp = def.hp || 0;
			const baseSpe = def.spe || 0;
			const level = currentLevel; // 当前宝物等级

			// let bonusParts = [];
			// if (baseAtk > 0) bonusParts.push(`攻击+${baseAtk * level}`);
			// if (baseDef > 0) bonusParts.push(`防御+${baseDef * level}`);
			// if (baseHp > 0) bonusParts.push(`生命+${baseHp * level}`);
			// if (baseSpe > 0) bonusParts.push(`速度+${baseSpe * level}`);

			// if (bonusParts.length > 0) {
			// 	bonusInfo.innerHTML = `当前宝物加成: ${bonusParts.join(' · ')}`;
			// } else {
			// 	bonusInfo.innerHTML = `当前宝物无属性加成`;
			// }
			bonusInfo.innerHTML = `当前宝物加成: ${def.desc(level)}`;
		}
	}

}



/**
 * 计算角色实例的最终总属性（基础 + 突破加成 + 宝物加成）
 * @param {string} instanceId - 角色实例ID
 * @returns {Object} { baseHp, baseAtk, baseDef, baseSpe, totalHp, totalAtk, totalDef, totalSpe, breakthroughBonus, treasureBonus }
 */
function calculateInstanceFinalStats(instanceId, externalTeamBonuses = null) {
	if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
		return {
			baseHp: 0, baseAtk: 0, baseDef: 0, baseSpe: 0,
			totalHp: 0, totalAtk: 0, totalDef: 0, totalSpe: 0,
			breakthroughBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			treasureBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			// ===== 【新增】新属性默认值 =====
			mingzhong: 10000, shanbi: 0, baoji: 0, kangbao: 0, poji: 0, gedang: 0,
			fixedDmgUp: 0, fixedDmgDown: 0, pctDmgUp: 0, pctDmgDown: 0,
			fixedHeal: 0, fixedBeHeal: 0, pctHeal: 0, pctBeHeal: 0,
			flatBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			percentBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			growthFactor: 1
		};
	}

	const instData = window.charBagData[instanceId];
	const charId = instData.charId || instanceId;
	const baseChar = characterList && characterList[charId];

	if (!baseChar) {
		return {
			baseHp: instData.hp || 0, baseAtk: instData.atk || 0, baseDef: instData.def || 0, baseSpe: instData.spe || 0,
			totalHp: instData.hp || 0, totalAtk: instData.atk || 0, totalDef: instData.def || 0, totalSpe: instData.spe || 0,
			breakthroughBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			treasureBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			// ===== 【新增】新属性默认值 =====
			mingzhong: 10000, shanbi: 0, baoji: 0, kangbao: 0, poji: 0, gedang: 0,
			fixedDmgUp: 0, fixedDmgDown: 0, pctDmgUp: 0, pctDmgDown: 0,
			fixedHeal: 0, fixedBeHeal: 0, pctHeal: 0, pctBeHeal: 0,
			flatBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			percentBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
			growthFactor: 1
		};
	}

	const currentLevel = instData.level || 1;
	const currentRank = instData.rank || baseChar.rank || 'common';
	const currentTemplate = instData.template || baseChar.template || 'balanced';

	// 1. 从 characterTemplate 获取基础属性
	const templateData = window.characterTemplate || characterTemplate;
	let baseStats;

	if (templateData && templateData[currentTemplate] && templateData[currentTemplate][currentRank]) {
		baseStats = { ...templateData[currentTemplate][currentRank] };
	} else {
		baseStats = {
			hp: instData.hp || baseChar.hp || 100,
			atk: instData.atk || baseChar.atk || 10,
			def: instData.def || baseChar.def || 0,
			spe: instData.spe || baseChar.spe || 0
		};
	}

	// 2. 计算等级成长因子
	const growthFactor = (100 + 10 * (currentLevel - 1)) / 100;

	const baseHp = Math.floor(baseStats.hp * growthFactor);
	const baseAtk = Math.floor(baseStats.atk * growthFactor);
	const baseDef = Math.floor(baseStats.def * growthFactor);
	const baseSpe = Math.floor(baseStats.spe * growthFactor);

	// ===== 【新增】突破基础收益：每次突破增加模板基础值的一半 =====
	const tupolevel = instData.tupolevel || 0;
	const tupoBaseHp = Math.floor(baseStats.hp * 0.5 * tupolevel);
	const tupoBaseAtk = Math.floor(baseStats.atk * 0.5 * tupolevel);
	const tupoBaseDef = Math.floor(baseStats.def * 0.5 * tupolevel);
	const tupoBaseSpe = Math.floor(baseStats.spe * 0.5 * tupolevel);

	// 3. 初始化各类加成
	let selfFlat = { hp: tupoBaseHp, atk: tupoBaseAtk, def: tupoBaseDef, spe: tupoBaseSpe };
	let teamFlat = { hp: 0, atk: 0, def: 0, spe: 0 };
	let selfPercent = { hp: 0, atk: 0, def: 0, spe: 0 };
	let teamPercent = { hp: 0, atk: 0, def: 0, spe: 0 };

	// ===== 【新增】新属性的突破加成 =====
	let breakHit = 0, breakDodge = 0, breakCrit = 0, breakCritResist = 0, breakPierce = 0, breakBlock = 0;
	let breakFixedDmgUp = 0, breakFixedDmgDown = 0, breakPctDmgUp = 0, breakPctDmgDown = 0;
	let breakFixedHeal = 0, breakFixedBeHeal = 0, breakPctHeal = 0, breakPctBeHeal = 0;

	// 全队新属性加成
	let teamFlatHit = 0, teamFlatDodge = 0, teamFlatCrit = 0, teamFlatCritResist = 0, teamFlatPierce = 0, teamFlatBlock = 0;
	let teamFlatFixedDmgUp = 0, teamFlatFixedDmgDown = 0, teamFlatFixedHeal = 0, teamFlatFixedBeHeal = 0;
	let teamPercentPctDmgUp = 0, teamPercentPctDmgDown = 0, teamPercentPctHeal = 0, teamPercentPctBeHeal = 0;

	// ===== 如果传入了外部全队加成，直接使用 =====
	if (externalTeamBonuses) {
		teamFlat.hp = externalTeamBonuses.teamFlat.hp || 0;
		teamFlat.atk = externalTeamBonuses.teamFlat.atk || 0;
		teamFlat.def = externalTeamBonuses.teamFlat.def || 0;
		teamFlat.spe = externalTeamBonuses.teamFlat.spe || 0;

		teamPercent.hp = externalTeamBonuses.teamPercent.hp || 0;
		teamPercent.atk = externalTeamBonuses.teamPercent.atk || 0;
		teamPercent.def = externalTeamBonuses.teamPercent.def || 0;
		teamPercent.spe = externalTeamBonuses.teamPercent.spe || 0;

		// ===== 【新增】全队新属性加成 =====
		teamFlatHit = externalTeamBonuses.teamFlat.mingzhong || 0;// 命中
		teamFlatDodge = externalTeamBonuses.teamFlat.shanbi || 0;// 闪避
		teamFlatCrit = externalTeamBonuses.teamFlat.baoji || 0;// 暴击
		teamFlatCritResist = externalTeamBonuses.teamFlat.kangbao || 0;// 抗暴
		teamFlatPierce = externalTeamBonuses.teamFlat.poji || 0;// 破击
		teamFlatBlock = externalTeamBonuses.teamFlat.gedang || 0;// 格挡
		teamFlatFixedDmgUp = externalTeamBonuses.teamFlat.fixedDmgUp || 0;
		teamFlatFixedDmgDown = externalTeamBonuses.teamFlat.fixedDmgDown || 0;
		teamFlatFixedHeal = externalTeamBonuses.teamFlat.fixedHeal || 0;
		teamFlatFixedBeHeal = externalTeamBonuses.teamFlat.fixedBeHeal || 0;
		teamPercentPctDmgUp = externalTeamBonuses.teamPercent.pctDmgUp || 0;
		teamPercentPctDmgDown = externalTeamBonuses.teamPercent.pctDmgDown || 0;
		teamPercentPctHeal = externalTeamBonuses.teamPercent.pctHeal || 0;
		teamPercentPctBeHeal = externalTeamBonuses.teamPercent.pctBeHeal || 0;
	}

	// const tupolevel = instData.tupolevel || 0;
	const tupoList = instData.tupoList || baseChar.tupoList || [];

	// 4. 遍历突破等级，计算加成
	for (let i = 0; i < tupolevel; i++) {
		const buff = tupoList[i];
		if (!buff) continue;

		let resolvedBuff = buff;
		if (typeof buff === 'string') {
			const lib = window.BREAKTHROUGH_BUFF_LIBRARY || BREAKTHROUGH_BUFF_LIBRARY || {};
			resolvedBuff = lib[buff];
		}
		if (!resolvedBuff) continue;

		const type = resolvedBuff.type;

		switch (type) {
			case 'self_stat_flat':
				if (resolvedBuff.atk !== undefined) selfFlat.atk += Number(resolvedBuff.atk);
				if (resolvedBuff.def !== undefined) selfFlat.def += Number(resolvedBuff.def);
				if (resolvedBuff.hp !== undefined) selfFlat.hp += Number(resolvedBuff.hp);
				if (resolvedBuff.spe !== undefined) selfFlat.spe += Number(resolvedBuff.spe);
				// ===== 【新增】新属性固定加成 =====
				if (resolvedBuff.mingzhong !== undefined) breakHit += Number(resolvedBuff.mingzhong);
				if (resolvedBuff.shanbi !== undefined) breakDodge += Number(resolvedBuff.shanbi);
				if (resolvedBuff.baoji !== undefined) breakCrit += Number(resolvedBuff.baoji);
				if (resolvedBuff.kangbao !== undefined) breakCritResist += Number(resolvedBuff.kangbao);
				if (resolvedBuff.poji !== undefined) breakPierce += Number(resolvedBuff.poji);
				if (resolvedBuff.gedang !== undefined) breakBlock += Number(resolvedBuff.gedang);
				if (resolvedBuff.fixedDmgUp !== undefined) breakFixedDmgUp += Number(resolvedBuff.fixedDmgUp);
				if (resolvedBuff.fixedDmgDown !== undefined) breakFixedDmgDown += Number(resolvedBuff.fixedDmgDown);
				if (resolvedBuff.fixedHeal !== undefined) breakFixedHeal += Number(resolvedBuff.fixedHeal);
				if (resolvedBuff.fixedBeHeal !== undefined) breakFixedBeHeal += Number(resolvedBuff.fixedBeHeal);
				break;

			case 'self_stat_percent':
				if (resolvedBuff.atk !== undefined) selfPercent.atk += Number(resolvedBuff.atk);
				if (resolvedBuff.def !== undefined) selfPercent.def += Number(resolvedBuff.def);
				if (resolvedBuff.hp !== undefined) selfPercent.hp += Number(resolvedBuff.hp);
				if (resolvedBuff.spe !== undefined) selfPercent.spe += Number(resolvedBuff.spe);
				// ===== 【新增】新属性百分比加成（概率类按固定值加，百分比类按百分比加） =====
				if (resolvedBuff.baoji !== undefined) breakCrit += Number(resolvedBuff.baoji);
				if (resolvedBuff.kangbao !== undefined) breakCritResist += Number(resolvedBuff.kangbao);
				if (resolvedBuff.shanbi !== undefined) breakDodge += Number(resolvedBuff.shanbi);
				if (resolvedBuff.poji !== undefined) breakPierce += Number(resolvedBuff.poji);
				if (resolvedBuff.gedang !== undefined) breakBlock += Number(resolvedBuff.gedang);
				if (resolvedBuff.pctDmgUp !== undefined) breakPctDmgUp += Number(resolvedBuff.pctDmgUp);
				if (resolvedBuff.pctDmgDown !== undefined) breakPctDmgDown += Number(resolvedBuff.pctDmgDown);
				if (resolvedBuff.pctHeal !== undefined) breakPctHeal += Number(resolvedBuff.pctHeal);
				if (resolvedBuff.pctBeHeal !== undefined) breakPctBeHeal += Number(resolvedBuff.pctBeHeal);
				break;

			case 'team_stat_flat':
				if (!externalTeamBonuses) {
					if (resolvedBuff.atk !== undefined) teamFlat.atk += Number(resolvedBuff.atk);
					if (resolvedBuff.def !== undefined) teamFlat.def += Number(resolvedBuff.def);
					if (resolvedBuff.hp !== undefined) teamFlat.hp += Number(resolvedBuff.hp);
					if (resolvedBuff.spe !== undefined) teamFlat.spe += Number(resolvedBuff.spe);
					// ===== 【新增】全队固定新属性 =====
					if (resolvedBuff.mingzhong !== undefined) teamFlatHit += Number(resolvedBuff.mingzhong);
					if (resolvedBuff.shanbi !== undefined) teamFlatDodge += Number(resolvedBuff.shanbi);
					if (resolvedBuff.baoji !== undefined) teamFlatCrit += Number(resolvedBuff.baoji);
					if (resolvedBuff.kangbao !== undefined) teamFlatCritResist += Number(resolvedBuff.kangbao);
					if (resolvedBuff.poji !== undefined) teamFlatPierce += Number(resolvedBuff.poji);
					if (resolvedBuff.gedang !== undefined) teamFlatBlock += Number(resolvedBuff.gedang);
					if (resolvedBuff.fixedDmgUp !== undefined) teamFlatFixedDmgUp += Number(resolvedBuff.fixedDmgUp);
					if (resolvedBuff.fixedDmgDown !== undefined) teamFlatFixedDmgDown += Number(resolvedBuff.fixedDmgDown);
					if (resolvedBuff.fixedHeal !== undefined) teamFlatFixedHeal += Number(resolvedBuff.fixedHeal);
					if (resolvedBuff.fixedBeHeal !== undefined) teamFlatFixedBeHeal += Number(resolvedBuff.fixedBeHeal);
				}
				break;

			case 'team_stat_percent':
				if (!externalTeamBonuses) {
					if (resolvedBuff.atk !== undefined) teamPercent.atk += Number(resolvedBuff.atk);
					if (resolvedBuff.def !== undefined) teamPercent.def += Number(resolvedBuff.def);
					if (resolvedBuff.hp !== undefined) teamPercent.hp += Number(resolvedBuff.hp);
					if (resolvedBuff.spe !== undefined) teamPercent.spe += Number(resolvedBuff.spe);
					// ===== 【新增】全队百分比新属性 =====
					if (resolvedBuff.pctDmgUp !== undefined) teamPercentPctDmgUp += Number(resolvedBuff.pctDmgUp);
					if (resolvedBuff.pctDmgDown !== undefined) teamPercentPctDmgDown += Number(resolvedBuff.pctDmgDown);
					if (resolvedBuff.pctHeal !== undefined) teamPercentPctHeal += Number(resolvedBuff.pctHeal);
					if (resolvedBuff.pctBeHeal !== undefined) teamPercentPctBeHeal += Number(resolvedBuff.pctBeHeal);
				}
				break;

			case 'self_energy':
				break;

			default:
				break;
		}
	}

	// 5. 计算宝物加成
	let tresHp = 0, tresAtk = 0, tresDef = 0, tresSpe = 0;
	// ===== 【新增】宝物特殊属性加成 =====
	let tresHit = 0, tresDodge = 0, tresCrit = 0, tresCritResist = 0, tresPierce = 0, tresBlock = 0;

	if (window.charTreasureSlots && window.charTreasureSlots[instanceId]) {
		const slots = window.charTreasureSlots[instanceId];
		slots.forEach(treasureId => {
			if (!treasureId) return;
			const stats = window.getTreasureStats(treasureId);
			tresHp += stats.hp || 0;
			tresAtk += stats.atk || 0;
			tresDef += stats.def || 0;
			tresSpe += stats.spe || 0;
			// ===== 【新增】累加宝物特殊属性 =====
			tresHit += stats.mingzhong || 0;
			tresDodge += stats.shanbi || 0;
			tresCrit += stats.baoji || 0;
			tresCritResist += stats.kangbao || 0;
			tresPierce += stats.poji || 0;
			tresBlock += stats.gedang || 0;
		});
	}


	// 6. 计算最终属性
	const calcTotal = (base, selfF, teamF, tres, selfP, teamP) => {
		const flatTotal = base + selfF + teamF + tres;
		const percentTotal = 1 + selfP + teamP;
		return Math.floor(flatTotal * percentTotal);
	};

	const totalHp = calcTotal(baseHp, selfFlat.hp, teamFlat.hp, tresHp, selfPercent.hp, teamPercent.hp);
	const totalAtk = calcTotal(baseAtk, selfFlat.atk, teamFlat.atk, tresAtk, selfPercent.atk, teamPercent.atk);
	const totalDef = calcTotal(baseDef, selfFlat.def, teamFlat.def, tresDef, selfPercent.def, teamPercent.def);
	const totalSpe = calcTotal(baseSpe, selfFlat.spe, teamFlat.spe, tresSpe, selfPercent.spe, teamPercent.spe);

	// 汇总
	const totalFlatHp = selfFlat.hp + teamFlat.hp + tresHp;
	const totalFlatAtk = selfFlat.atk + teamFlat.atk + tresAtk;
	const totalFlatDef = selfFlat.def + teamFlat.def + tresDef;
	const totalFlatSpe = selfFlat.spe + teamFlat.spe + tresSpe;

	const totalPercentHp = selfPercent.hp + teamPercent.hp;
	const totalPercentAtk = selfPercent.atk + teamPercent.atk;
	const totalPercentDef = selfPercent.def + teamPercent.def;
	const totalPercentSpe = selfPercent.spe + teamPercent.spe;

	const result = {
		baseHp, baseAtk, baseDef, baseSpe,
		totalHp, totalAtk, totalDef, totalSpe,
		flatBonus: {
			hp: totalFlatHp,
			atk: totalFlatAtk,
			def: totalFlatDef,
			spe: totalFlatSpe
		},
		percentBonus: {
			hp: totalPercentHp,
			atk: totalPercentAtk,
			def: totalPercentDef,
			spe: totalPercentSpe
		},
		breakthroughBonus: {
			hp: Math.floor((baseHp + totalFlatHp) * (1 + totalPercentHp)) - baseHp,
			atk: Math.floor((baseAtk + totalFlatAtk) * (1 + totalPercentAtk)) - baseAtk,
			def: Math.floor((baseDef + totalFlatDef) * (1 + totalPercentDef)) - baseDef,
			spe: Math.floor((baseSpe + totalFlatSpe) * (1 + totalPercentSpe)) - baseSpe
		},
		treasureBonus: {
			hp: 0,
			atk: 0,
			def: 0,
			spe: 0
		},
		growthFactor,

		// ===== 【修改】六大特殊属性 =====
		mingzhong: 10000 + breakHit + teamFlatHit + tresHit,
		shanbi: 0 + breakDodge + teamFlatDodge + tresDodge,
		baoji: 0 + breakCrit + teamFlatCrit + tresCrit,
		kangbao: 0 + breakCritResist + teamFlatCritResist + tresCritResist,
		poji: 0 + breakPierce + teamFlatPierce + tresPierce,
		gedang: 0 + breakBlock + teamFlatBlock + tresBlock,

		fixedDmgUp: 0 + breakFixedDmgUp + teamFlatFixedDmgUp,
		fixedDmgDown: 0 + breakFixedDmgDown + teamFlatFixedDmgDown,
		pctDmgUp: 0 + breakPctDmgUp + teamPercentPctDmgUp,
		pctDmgDown: 0 + breakPctDmgDown + teamPercentPctDmgDown,

		fixedHeal: 0 + breakFixedHeal + teamFlatFixedHeal,
		fixedBeHeal: 0 + breakFixedBeHeal + teamFlatFixedBeHeal,
		pctHeal: 0 + breakPctHeal + teamPercentPctHeal,
		pctBeHeal: 0 + breakPctBeHeal + teamPercentPctBeHeal,
	};

	// 写回 charBagData
	instData._compiledStats = result;

	instData.hp = result.totalHp;
	instData.atk = result.totalAtk;
	instData.def = result.totalDef;
	instData.spe = result.totalSpe;
	instData.maxHp = result.totalHp;

	return result;
}



/**
 * 格式化属性显示文本（基础值 + 总加成）
 * @param {number} totalValue - 总属性值
 * @param {number} baseValue - 基础属性值
 * @param {number} bonusValue - 加成值
 * @returns {string} 格式化后的HTML文本
 */
function formatAttributeDisplay(totalValue, baseValue, bonusValue) {
	let text = `${totalValue}`;
	if (bonusValue > 0) {
		text += ` <span style="color:#44ff88;font-size:11px;">(+${bonusValue})</span>`;
	}
	return text;
}

/**
 * 比较两个版本号
 * @param {string} v1 - 版本号1，如 "v2.3.1"
 * @param {string} v2 - 版本号2，如 "v2.3.1"
 * @returns {number} -1: v1 < v2, 0: v1 === v2, 1: v1 > v2
 */
function compareVersions(v1, v2) {
	if (!v1 || !v2) return 0;

	// 移除 'v' 前缀
	const cleanV1 = v1.replace(/^v/, '');
	const cleanV2 = v2.replace(/^v/, '');

	const parts1 = cleanV1.split('.').map(Number);
	const parts2 = cleanV2.split('.').map(Number);

	const maxLen = Math.max(parts1.length, parts2.length);

	for (let i = 0; i < maxLen; i++) {
		const p1 = parts1[i] || 0;
		const p2 = parts2[i] || 0;

		if (p1 < p2) return -1;
		if (p1 > p2) return 1;
	}

	return 0;
}

/**
 * 检查存档版本是否与当前版本兼容
 * @param {string} saveVersion - 存档中的版本号
 * @param {Object} [options] - 选项
 * @param {boolean} [options.warnOnNewer=false] - 存档版本比当前版本新时是否警告
 * @returns {Object} { compatible: boolean, message: string }
 */
function checkSaveCompatibility(saveVersion) {
	const currentVersion = window.GAME_VERSION || 'v1.0';

	if (!saveVersion) {
		return {
			compatible: true, // 旧存档没有版本号，视为兼容
			message: '旧版存档，建议重新保存以更新版本信息'
		};
	}

	const result = compareVersions(saveVersion, currentVersion);

	if (result > 0) {
		// 存档版本比当前版本新（理论上不应该发生）
		return {
			compatible: false,
			message: `存档版本(${saveVersion})高于当前版本(${currentVersion})，可能不兼容`
		};
	} else if (result < 0) {
		// 存档版本比当前版本旧
		return {
			compatible: true,
			message: `旧版存档(${saveVersion})，将升级至当前版本(${currentVersion})`
		};
	} else {
		// 版本相同
		return {
			compatible: true,
			message: ''
		};
	}
}
/**
 * 计算全队突破增益汇总（team_stat_flat + team_stat_percent）
 * @returns {Object} { teamFlat: {hp, atk, def, spe}, teamPercent: {hp, atk, def, spe} }
 */
function calculateTeamBreakthroughBonuses() {
	const teamFlat = { hp: 0, atk: 0, def: 0, spe: 0 };
	const teamPercent = { hp: 0, atk: 0, def: 0, spe: 0 };

	// ===== 【新增】全队新属性 =====
	teamFlat.mingzhong = 0; teamFlat.shanbi = 0; teamFlat.baoji = 0; teamFlat.kangbao = 0; teamFlat.poji = 0; teamFlat.gedang = 0;
	teamFlat.fixedDmgUp = 0; teamFlat.fixedDmgDown = 0; teamFlat.fixedHeal = 0; teamFlat.fixedBeHeal = 0;
	teamPercent.pctDmgUp = 0; teamPercent.pctDmgDown = 0; teamPercent.pctHeal = 0; teamPercent.pctBeHeal = 0;

	if (!window.currentTeam) return { teamFlat, teamPercent };

	window.currentTeam.forEach(instId => {
		if (!instId) return;
		const instData = window.charBagData && window.charBagData[instId];
		if (!instData) return;
		const charId = instData.charId || instId;
		const baseChar = characterList && characterList[charId];
		if (!baseChar) return;

		const tupoList = instData.tupoList || baseChar.tupoList || [];
		const tupolevel = instData.tupolevel || 0;

		for (let i = 0; i < tupolevel; i++) {
			const buff = tupoList[i];
			if (!buff) continue;

			let resolvedBuff = buff;
			if (typeof buff === 'string') {
				const lib = window.BREAKTHROUGH_BUFF_LIBRARY || BREAKTHROUGH_BUFF_LIBRARY || {};
				resolvedBuff = lib[buff];
			}
			if (!resolvedBuff) continue;

			const type = resolvedBuff.type;

			switch (type) {
				case 'team_stat_flat':
					if (resolvedBuff.atk !== undefined) teamFlat.atk += Number(resolvedBuff.atk);
					if (resolvedBuff.def !== undefined) teamFlat.def += Number(resolvedBuff.def);
					if (resolvedBuff.hp !== undefined) teamFlat.hp += Number(resolvedBuff.hp);
					if (resolvedBuff.spe !== undefined) teamFlat.spe += Number(resolvedBuff.spe);
					// ===== 【新增】全队固定新属性 =====
					if (resolvedBuff.mingzhong !== undefined) teamFlat.mingzhong += Number(resolvedBuff.mingzhong);
					if (resolvedBuff.shanbi !== undefined) teamFlat.shanbi += Number(resolvedBuff.shanbi);
					if (resolvedBuff.baoji !== undefined) teamFlat.baoji += Number(resolvedBuff.baoji);
					if (resolvedBuff.kangbao !== undefined) teamFlat.kangbao += Number(resolvedBuff.kangbao);
					if (resolvedBuff.poji !== undefined) teamFlat.poji += Number(resolvedBuff.poji);
					if (resolvedBuff.gedang !== undefined) teamFlat.gedang += Number(resolvedBuff.gedang);
					if (resolvedBuff.fixedDmgUp !== undefined) teamFlat.fixedDmgUp += Number(resolvedBuff.fixedDmgUp);
					if (resolvedBuff.fixedDmgDown !== undefined) teamFlat.fixedDmgDown += Number(resolvedBuff.fixedDmgDown);
					if (resolvedBuff.fixedHeal !== undefined) teamFlat.fixedHeal += Number(resolvedBuff.fixedHeal);
					if (resolvedBuff.fixedBeHeal !== undefined) teamFlat.fixedBeHeal += Number(resolvedBuff.fixedBeHeal);
					break;

				case 'team_stat_percent':
					if (resolvedBuff.atk !== undefined) teamPercent.atk += Number(resolvedBuff.atk);
					if (resolvedBuff.def !== undefined) teamPercent.def += Number(resolvedBuff.def);
					if (resolvedBuff.hp !== undefined) teamPercent.hp += Number(resolvedBuff.hp);
					if (resolvedBuff.spe !== undefined) teamPercent.spe += Number(resolvedBuff.spe);
					// ===== 【新增】全队百分比新属性 =====
					if (resolvedBuff.pctDmgUp !== undefined) teamPercent.pctDmgUp += Number(resolvedBuff.pctDmgUp);
					if (resolvedBuff.pctDmgDown !== undefined) teamPercent.pctDmgDown += Number(resolvedBuff.pctDmgDown);
					if (resolvedBuff.pctHeal !== undefined) teamPercent.pctHeal += Number(resolvedBuff.pctHeal);
					if (resolvedBuff.pctBeHeal !== undefined) teamPercent.pctBeHeal += Number(resolvedBuff.pctBeHeal);
					break;
			}
		}
	});

	return { teamFlat, teamPercent };
}

/**
 * 生成角色的战斗力
 * @param {Object} finalStats - 角色的最终属性
 * @returns {number} 计算后的战斗力值
 */
function calculatePower(finalStats) {
	// 提取基础属性
	const atk = finalStats.totalAtk || 0;
	const def = finalStats.totalDef || 0;
	const hp = finalStats.totalHp || 0;

	// 提取暴击、命中、破击（命中需要减去初始值10000）
	const baoji = finalStats.baoji || 0;
	const mingzhong = (finalStats.mingzhong || 10000) - 10000;
	const poji = finalStats.poji || 0;

	// 提取抗暴、闪避、格挡
	const kangbao = finalStats.kangbao || 0;
	const shanbi = finalStats.shanbi || 0;
	const gedang = finalStats.gedang || 0;

	// 提取百分比增伤/减伤
	const pctDmgUp = finalStats.pctDmgUp || 0;
	const pctDmgDown = finalStats.pctDmgDown || 0;

	// 提取百分比治疗量/被治疗量
	const pctHeal = finalStats.pctHeal || 0;
	const pctBeHeal = finalStats.pctBeHeal || 0;

	// 提取固定增伤/减伤
	const fixedDmgUp = finalStats.fixedDmgUp || 0;
	const fixedDmgDown = finalStats.fixedDmgDown || 0;

	// 提取固定治疗量/被治疗量
	const fixedHeal = finalStats.fixedHeal || 0;
	const fixedBeHeal = finalStats.fixedBeHeal || 0;

	// 判断是否是治疗角色（通过 template 判断，或者根据是否有治疗技能）
	// 这里沿用你的 TIP_LABELS 中的 'recover' 判断
	// 注意：finalStats 中可能没有 template 字段，需要从实例数据中获取
	// 如果无法判断，默认视为非治疗角色，固定治疗量不计入战力

	// ===== 计算权重 =====

	// 攻击权重 = 10 + (暴击 + 命中（已减10000）+ 破击) * 2 / 10000
	const atkWeight = 10 + (baoji + mingzhong + poji) * 2 / 10000;

	// 防御权重 = 10（固定）
	const defWeight = 10;

	// 血量权重 = 1 + (抗暴 + 闪避 + 格挡) * 2 / 100000
	const hpWeight = 1 + (kangbao + shanbi + gedang) * 2 / 100000;

	// ===== 计算权重后的基础战力 =====

	// 权重后的攻击力战力 = atk * atkWeight
	let atkPower = atk * atkWeight;

	// 防御力战力 = def * defWeight
	let defPower = def * defWeight;

	// 权重后的血量战力 = hp * hpWeight
	let hpPower = hp * hpWeight;

	// ===== 应用百分比加成 =====

	// 最终攻击力战力 = atkPower * (1 + pctDmgUp) * (1 + pctHeal)
	// pctHeal 只有治疗角色才适用，这里谨慎处理
	// 如果无法判断是否是治疗角色，可以暂时乘以 (1 + pctHeal)
	// 或者将 pctHeal 的权重设小一些
	atkPower = atkPower * (1 + pctDmgUp) * (1 + pctHeal); // 治疗量对攻击力战力的影响减半

	// 最终血量战力 = hpPower * (1 + pctDmgDown) * (1 + pctBeHeal)
	hpPower = hpPower * (1 + pctDmgDown) * (1 + pctBeHeal);

	// ===== 汇总 =====

	// 基础战力 = 攻击力战力 + 防御力战力 + 血量战力
	let totalPower = atkPower + defPower + hpPower;

	// 加上固定增伤和固定减伤（各占一定权重）
	// 固定增伤和减伤可以适当放大影响，因为它们是直接数值
	totalPower += fixedDmgUp * 1;   // 固定增伤权重5
	totalPower += fixedDmgDown * 1; // 固定减伤权重5

	// 固定治疗量/被治疗量（非治疗角色可忽略或权重降低）
	// 暂时统一加权重3
	totalPower += fixedHeal * 1;
	totalPower += fixedBeHeal * 1;

	return Math.floor(totalPower);
}

// /**
//  * 统一刷新所有视图
//  * @param {Object} [options] - 可选参数
//  * @param {string} [options.instanceId] - 需要刷新的角色实例ID（用于刷新详情弹窗）
//  * @param {HTMLElement} [options.dialog] - 需要刷新的详情弹窗DOM元素
//  */
// function refreshAllViews(options = {}) {
//	 const { instanceId, dialog } = options;

//	 // 1. 刷新阵容视图（包括总战力、格子、详情区）
//	 refreshTeamViewDisplay();

//	 // 2. 刷新角色详情弹窗（如果有传入）
//	 if (instanceId && dialog) {
//		 refreshCharDetailPopupContent(instanceId, dialog);
//	 }

//	 // 3. 刷新背包视图（如果当前显示的是背包）
//	 try {
//		 const bagView = document.getElementById('bag-view');
//		 if (bagView && bagView.style.display !== 'none') {
//			 renderBagView(bagView);
//		 }
//	 } catch(e) {}

//	 // 4. 自动保存
//	 if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
//		 SaveManager.autoSave();
//	 }
// }
/**
 * 统一刷新所有视图
 * @param {Object} [options] - 可选参数
 * @param {string} [options.instanceId] - 需要刷新的角色实例ID（用于刷新详情弹窗）
 * @param {HTMLElement} [options.dialog] - 需要刷新的详情弹窗DOM元素
 * @param {boolean} [options.forceTeamRebuild] - 是否强制重建队伍视图（默认false）
 */
function refreshAllViews(options = {}) {
	const { instanceId, dialog, forceTeamRebuild = false } = options;

	// 防递归锁
	if (window._isRefreshing) {
		console.log('[刷新] 正在刷新中，跳过');
		return;
	}

	window._isRefreshing = true;

	try {
		// 更高效的写法
		if (window.currentTeam) {
			const teamInstanceIds = new Set(window.currentTeam.filter(Boolean));

			// 刷新队伍中的角色
			teamInstanceIds.forEach(instId => {
				const instData = window.charBagData && window.charBagData[instId];
				if (instData) {
					const updatedStats = updateCharacterSP(instData);
					if (updatedStats && updatedStats.openSpskill !== undefined) {
						instData.openSpskill = updatedStats.openSpskill;
					}
				}
			});

			// 如果有传入的 instanceId 且不在队伍中（如背包中的角色），也刷新
			if (instanceId && !teamInstanceIds.has(instanceId)) {
				const instData = window.charBagData && window.charBagData[instanceId];
				if (instData) {
					const updatedStats = updateCharacterSP(instData);
					if (updatedStats && updatedStats.openSpskill !== undefined) {
						instData.openSpskill = updatedStats.openSpskill;
					}
				}
			}
		}
		// 1. 刷新阵容视图
		const teamView = document.getElementById('team-view');
		if (teamView && teamView.style.display !== 'none') {
			if (forceTeamRebuild) {
				renderTeamView(teamView);
			} else {
				refreshTeamViewDisplay();
			}
		}

		// 2. 刷新背包视图（保留武将和宝物选中状态）
		// 2. 刷新背包视图（保留武将和宝物选中状态）
		try {
			const bagView = document.getElementById('bag-view');
			if (bagView && bagView.style.display !== 'none') {
				// 保存当前选中的卡片信息
				const selectedCharCard = bagView.querySelector('.charbag-char-card.selected');
				const selectedEquipCard = bagView.querySelector('.equipbag-treasure-card.selected');

				const selectedCharInstanceId = selectedCharCard ? selectedCharCard.dataset.instanceId : null;
				const selectedCharId = selectedCharCard ? selectedCharCard.dataset.charId : null;
				const selectedTreasureInstanceId = selectedEquipCard ? selectedEquipCard.dataset.treasureInstanceId : null;

				// 重新渲染背包
				renderBagView(bagView);

				// 恢复选中状态（延迟执行，等待渲染完成）
				setTimeout(() => {
					if (selectedCharInstanceId) {
						const newCharCard = bagView.querySelector(`.charbag-char-card[data-instance-id="${selectedCharInstanceId}"]`);
						if (newCharCard) {
							newCharCard.classList.add('selected');
							// 同时更新详情横框
							const instData = window.charBagData && window.charBagData[selectedCharInstanceId];
							if (instData) {
								updateBagCharDetailBar({
									instanceId: selectedCharInstanceId,
									charId: selectedCharId || instData.charId,
									...instData
								});
							}
						}
					}

					if (selectedTreasureInstanceId) {
						const newEquipCard = bagView.querySelector(`.equipbag-treasure-card[data-treasure-instance-id="${selectedTreasureInstanceId}"]`);
						if (newEquipCard) {
							newEquipCard.classList.add('selected');
							// 触发点击事件更新详情横框
							newEquipCard.click();
						}
					}
				}, 50);
			}
		} catch (e) {
			console.warn('[刷新] 背包刷新异常:', e);
		}

		// 3. 刷新角色详情弹窗
		if (instanceId && dialog) {
			refreshCharDetailPopupContent(instanceId, dialog);
		}

		// 4. 刷新所有弹窗中的角色数据
		try {
			const openDialogs = document.querySelectorAll('.gallery-detail-dialog');
			openDialogs.forEach(dlg => {
				const nameEl = dlg.querySelector('.gallery-detail-name');
				if (nameEl && instanceId) {
					const instData = window.charBagData && window.charBagData[instanceId];
					if (instData) {
						refreshCharDetailPopupContent(instanceId, dlg);
					}
				}
			});
		} catch (e) { }

		// 5. 突破弹窗已经由 refreshBreakthroughPopupContent 自己管理，这里不再重复刷新

		// 5. 刷新突破弹窗
		try {
			const breakthroughOverlay = document.getElementById('breakthrough-preview-overlay');
			if (breakthroughOverlay && breakthroughOverlay.style.display !== 'none') {
				const breakthroughPopup = breakthroughOverlay.querySelector('[class*="bp-popup"]') ||
					breakthroughOverlay.querySelector('.bp-list-container')?.closest('div[style*="flex"]');
				if (breakthroughPopup && instanceId) {
					refreshBreakthroughPopupContent(breakthroughPopup, instanceId);
				}
			}
		} catch (e) { }

		// 6. 刷新商店视图
		try {
			const shopView = document.getElementById('shop-view');
			if (shopView && shopView.style.display !== 'none') {
				renderShopView(shopView);
			}
		} catch (e) { }

		// 7. 自动保存
		// if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) {
		// 	SaveManager.autoSave();
		// }
	} finally {
		window._isRefreshing = false;
	}
}

// 暴露到 window（供其他模块调用）
window.calculateInstanceFinalStats = calculateInstanceFinalStats;
window.calculatePower = calculatePower;
window.calculateTeamBreakthroughBonuses = calculateTeamBreakthroughBonuses;
window.refreshAllViews = refreshAllViews;
window.compareVersions = compareVersions;
window.checkSaveCompatibility = checkSaveCompatibility;
window.formatAttributeDisplay = formatAttributeDisplay;
window.getTreasureStatsWithLevel = getTreasureStatsWithLevel;
window.showTreasureUpgradePopup = showTreasureUpgradePopup;
window.refreshUpgradePopupUI = refreshUpgradePopupUI;

export {};
