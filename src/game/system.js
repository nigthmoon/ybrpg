/**
 * 游戏系统模块 - 宝物实例化/升级/统计计算
 * 包含：宝物实例化(Bag)、升级、战力计算(Stat)、视图刷新/工具(UI)等核心系统
 */

import { shared } from '../shared.js';
import { TREASURE_DEFS } from '../equip.js';
import { BREAKTHROUGH_BUFF_LIBRARY } from '../charBreakthroughConfig.js';
import { characterTemplate, characterList } from '../characterList.js';
import { toast, confirmDialog, generateInstanceId, getMainCharacterSlotIndex } from '../ui/utils.js';

// ====== Bag - 宝物/背包/装备系统 ======

class Bag {
	/** 获取宝物定义列表 */
	static defs() {
		return TREASURE_DEFS || {};
	}

	/** 生成宝物实例ID */
	static newId(baseId) {
		return `${baseId}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
	}

	/** 初始化宝物背包（如果不存在） */
	static ensureInv() {
		if (!window.treasureInventory) {
			window.treasureInventory = {};
		}
	}

	/** 获取所有宝物实例列表 */
	static list() {
		Bag.ensureInv();
		const defs = Bag.defs();
		return Object.entries(window.treasureInventory).map(([instanceId, data]) => {
			const def = defs[data.baseId];
			return def ? { instanceId, baseId: data.baseId, ...def, equippedBy: data.equippedBy } : null;
		}).filter(Boolean);
	}

	/** 获取指定角色的已装备宝物列表（有序，按槽位索引） */
	static equipped(instanceId) {
		Bag.ensureSlots();
		const slots = window.charTreasureSlots[instanceId];
		if (slots) {
			return [...slots];
		}
		return [null, null, null, null, null, null];
	}

	/** 确保 charTreasureSlots 数据结构存在 */
	static ensureSlots() {
		if (!window.charTreasureSlots) {
			window.charTreasureSlots = {};
		}
		if (window.charBagData) {
			Object.keys(window.charBagData).forEach(instId => {
				if (!window.charTreasureSlots[instId]) {
					window.charTreasureSlots[instId] = [null, null, null, null, null, null];
				}
			});
		}
	}

	/** 为角色的指定阵容格子装备/卸下宝物 */
	static equip(charInstanceId, slotIndex, treasureInstanceId) {
		Bag.ensureInv();
		Bag.ensureSlots();

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

		if (treasureInstanceId) {
			const newTreasureData = window.treasureInventory[treasureInstanceId];
			if (!newTreasureData) {
				console.warn(`宝物实例 ${treasureInstanceId} 不存在`);
				toast('宝物数据异常', 'error');
				return;
			}

			for (const [ownerId, ownerSlots] of Object.entries(window.charTreasureSlots)) {
				const existingSlotIndex = ownerSlots.indexOf(treasureInstanceId);
				if (existingSlotIndex !== -1) {
					if (ownerId === charInstanceId) {
						ownerSlots[existingSlotIndex] = null;
					} else {
						toast('该宝物已被其他角色装备', 'warning');
						return;
					}
				}
			}
		}

		currentSlots[slotIndex] = treasureInstanceId;

		if (typeof shared.SaveManager !== 'undefined' && shared.SaveManager.autoSave) {
			shared.SaveManager.autoSave();
		}
	}

	/** 添加宝物到背包（创建实例） */
	static add(baseId, count = 1) {
		Bag.ensureInv();
		const defs = Bag.defs();
		if (!defs[baseId]) {
			console.warn(`宝物 ${baseId} 定义不存在`);
			return [];
		}

		const createdIds = [];
		for (let i = 0; i < count; i++) {
			const instanceId = Bag.newId(baseId);
			window.treasureInventory[instanceId] = {
				baseId: baseId,
				level: 1
			};
			createdIds.push(instanceId);
		}
		return createdIds;
	}

	/** 移除宝物实例 */
	static remove(instanceId) {
		Bag.ensureInv();
		if (window.treasureInventory[instanceId]) {
			delete window.treasureInventory[instanceId];
			return true;
		}
		return false;
	}

	/** 获取宝物的属性加成（用于战斗时合并） */
	static stats(instanceId) {
		Bag.ensureInv();
		const data = window.treasureInventory[instanceId];
		if (!data) return { atk: 0, def: 0, hp: 0 };

		const defs = Bag.defs();
		const def = defs[data.baseId];
		if (!def) return { atk: 0, def: 0, hp: 0 };

		const level = data.level || 1;
		const multiplier = level;

		const result = {
			atk: (def.atk || 0) * multiplier,
			def: (def.def || 0) * multiplier,
			hp: (def.hp || 0) * multiplier,
		};

		const metaKeys = new Set(['id', 'name', 'desc', 'icon', 'price', 'atk', 'def', 'hp']);
		for (const key of Object.keys(def)) {
			if (metaKeys.has(key)) continue;
			result[key] = def[key];
		}

		return result;
	}

	/** 合并宝物属性到角色属性（战斗前调用） */
	static applyTo(unit) {
		if (!unit || !unit.instanceId) return;

		const equippedTreasureIds = Bag.equipped(unit.instanceId);
		let totalAtk = 0, totalDef = 0, totalHp = 0, totalSpe = 0;

		equippedTreasureIds.forEach(tid => {
			if (!tid) return;
			const s = Bag.stats(tid);
			totalAtk += s.atk;
			totalDef += s.def;
			totalHp += s.hp;
			totalSpe += s.spe;
		});

		unit.atk = (unit.atk || 0) + totalAtk;
		unit.def = (unit.def || 0) + totalDef;
		unit.hp = (unit.hp || 0) + totalHp;
		unit.spe = (unit.spe || 0) + totalSpe;
		unit.maxHp = unit.hp;

		return unit;
	}

	// ====== 宝物升级系统 ======

	/** 获取宝物实例的当前数值（考虑等级加成） */
	static statsLv(instanceId) {
		const data = window.treasureInventory[instanceId];
		if (!data) return { atk: 0, def: 0, hp: 0, spe: 0, desc: '' };

		const defs = Bag.defs();
		const def = defs[data.baseId];
		if (!def) return { atk: 0, def: 0, hp: 0, spe: 0, desc: '' };

		const level = data.level || 1;
		const multiplier = level;

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
	 * 获取可作为「吸收材料」的宝物实例列表（升级 / 吸收共用）
	 * ---------------------------------------------------------------
	 * 当前规则（与原逻辑一致）：仅允许 同名(baseId 相同)、未装备、等级为 1 的宝物。
	 *
	 * 【预留接口】未来「吸收宝物」方案：
	 *  - 在宝物定义中配置 absorb: { enabled, crossBase, expYield } 即可扩展：
	 *      · crossBase=true 时允许吸收不同 baseId 的宝物；
	 *      · expYield 作为被吸收时提供的经验/价值（当前未参与计算，预留）。
	 *  - 只需在此函数内根据 def.absorb 调整筛选与排序，调用方无需改动。
	 */
	static getAbsorbFodderList(treasureInstanceId) {
		const target = window.treasureInventory[treasureInstanceId];
		if (!target) return [];
		const targetBaseId = target.baseId;
		const targetDef = (Bag.defs() || {})[targetBaseId] || {};
		const allowCrossBase = !!(targetDef.absorb && targetDef.absorb.crossBase);

		return Object.keys(window.treasureInventory).filter(id => {
			if (id === treasureInstanceId) return false;
			const inv = window.treasureInventory[id];
			if (!inv) return false;

			// 同名限制（除非该宝物开启跨 id 吸收）
			if (!allowCrossBase && inv.baseId !== targetBaseId) return false;

			// 已装备的宝物不可作为材料
			if (window.charTreasureSlots) {
				for (const slots of Object.values(window.charTreasureSlots)) {
					if (slots && slots.includes(id)) return false;
				}
			}

			// 当前规则：等级 > 1 的宝物不可作为材料（未来可按 absorb.expYield 放宽）
			if (inv.level && inv.level > 1) return false;

			return true;
		});
	}

	/** 显示宝物升级浮窗 */
	static showUpgrade(treasureInstanceId, charInstanceId = null, slotIndex = null) {
		const treasureData = window.treasureInventory[treasureInstanceId];
		if (!treasureData) {
			toast('宝物数据异常', 'error');
			return;
		}

		const stats = Bag.statsLv(treasureInstanceId);
		var currentLevel = stats.level;
		const baseId = stats.baseId;
		const defs = Bag.defs();
		const def = defs[baseId];

		if (!def) {
			toast('宝物定义缺失', 'error');
			return;
		}

		const fodderInstanceIds = Bag.getAbsorbFodderList(treasureInstanceId);

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

		const title = document.createElement('div');
		title.style.cssText = 'color:#ffd700;font-size:18px;font-weight:bold;text-align:center;margin-bottom:15px;';
		title.textContent = `宝物升级 - ${def.name}`;
		popup.appendChild(title);

		const infoSection = document.createElement('div');
		infoSection.style.cssText = 'background:#2a2a2a;border-radius:8px;padding:12px;margin-bottom:12px;';

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

		if (charInstanceId) {
			const bonusInfo = document.createElement('div');
			bonusInfo.setAttribute('data-char-treasure-bonus', 'true');
			bonusInfo.style.cssText = 'font-size:11px;color:#aaa;margin-top:8px;padding-top:6px;border-top:1px solid #444;';
			bonusInfo.innerHTML = `当前宝物加成: ${def.desc(currentLevel)}`;
			infoSection.appendChild(bonusInfo);
		}

		popup.appendChild(infoSection);

		const materialSection = document.createElement('div');
		materialSection.style.cssText = 'background:#2a2a2a;border-radius:8px;padding:12px;margin-bottom:12px;';

		const materialTitle = document.createElement('div');
		materialTitle.style.cssText = 'font-size:14px;color:#aaa;margin-bottom:6px;';
		materialTitle.textContent = '升级材料（同名宝物）';
		materialSection.appendChild(materialTitle);

		const materialCount = document.createElement('div');
		materialCount.setAttribute('data-material-count', 'true');
		const needCount = currentLevel;
		materialCount.style.cssText = 'font-size:13px;color:#ddd;';
		materialCount.innerHTML = `需要: <span style="color:#ffd700;">${needCount}</span> 个 · 可用: <span style="color:${fodderCount >= needCount ? '#44ff88' : '#ff4444'};">${fodderCount}</span> 个`;
		materialSection.appendChild(materialCount);

		if (fodderCount < needCount) {
			const shortageTip = document.createElement('div');
			shortageTip.style.cssText = 'font-size:11px;color:#ff6666;margin-top:4px;';
			shortageTip.textContent = `材料不足，还需 ${needCount - fodderCount} 个同名宝物`;
			materialSection.appendChild(shortageTip);
		}

		popup.appendChild(materialSection);

		if (currentLevel < 10) {
			const previewSection = document.createElement('div');
			previewSection.style.cssText = 'background:#2a2a3a;border-radius:8px;padding:12px;margin-bottom:12px;border:1px solid #ffd700;';
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

		const btnRow = document.createElement('div');
		btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;';

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

		upgradeBtn.onclick = () => {
			const latestTreasureData = window.treasureInventory[treasureInstanceId];
			if (!latestTreasureData) {
				toast('宝物数据异常', 'error');
				return;
			}

			const latestLevel = latestTreasureData.level || 1;

			if (latestLevel >= 10) {
				toast('宝物已达到最高等级', 'warning');
				upgradeBtn.textContent = '已满级';
				upgradeBtn.disabled = true;
				upgradeBtn.style.opacity = '0.5';
				return;
			}

			const freshFodderIds = Bag.getAbsorbFodderList(treasureInstanceId);

			const freshFodderCount = freshFodderIds.length;
			const requiredCount = latestLevel;

			if (freshFodderCount < requiredCount) {
				toast(`材料不足！需要 ${requiredCount} 个同名宝物，当前可用: ${freshFodderCount}`, 'error');
				return;
			}

			confirmDialog(
				`确定消耗 ${requiredCount} 个【${def.name}】升级宝物至 Lv.${latestLevel + 1} 吗？\n可用材料: ${freshFodderCount} 个`,
				() => {
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

					const confirmFodderIds = Bag.getAbsorbFodderList(treasureInstanceId);

					const confirmFodderCount = confirmFodderIds.length;
					const confirmRequiredCount = confirmLevel;

					if (confirmFodderCount < confirmRequiredCount) {
						toast(`材料不足！需要 ${confirmRequiredCount} 个同名宝物，当前可用: ${confirmFodderCount}`, 'error');
						return;
					}

					for (let i = 0; i < confirmRequiredCount; i++) {
						const fodderId = confirmFodderIds[i];

						for (const [ownerId, slots] of Object.entries(window.charTreasureSlots || {})) {
							const slotIdx = slots.indexOf(fodderId);
							if (slotIdx !== -1) {
								slots[slotIdx] = null;
								break;
							}
						}

						delete window.treasureInventory[fodderId];
					}

					const newLevel = confirmLevel + 1;
					window.treasureInventory[treasureInstanceId].level = newLevel;

					Bag.refreshUpgradeUI(popup, def, baseId, treasureInstanceId, newLevel, upgradeBtn, charInstanceId);
					const refreshInstanceId = charInstanceId || null;

					if (charInstanceId) {
						shared.refreshTreasureUI(charInstanceId);
						const teamIndex = window.currentTeam ? window.currentTeam.indexOf(charInstanceId) : -1;
						if (teamIndex !== -1) {
							if (window._selectedSlotIndex !== undefined && window._selectedSlotIndex === teamIndex) {
								const instData = window.charBagData && window.charBagData[charInstanceId];
								if (instData) {
									const charId = instData.charId || charInstanceId;
									shared.showTeamCharInfo(teamIndex, charInstanceId, charId);
								}
							}
							shared.refreshTeamSlot(teamIndex);
						}
					}
					UI.refresh({
						instanceId: refreshInstanceId
					});
					currentLevel = newLevel;

					toast(`【${def.name}】升级成功！当前 Lv.${newLevel}`, 'success');
					shared.SaveManager.autoSave();
				}
			);
		};

		btnRow.appendChild(upgradeBtn);

		if (charInstanceId && slotIndex !== null) {
			const replaceBtn = document.createElement('button');
			replaceBtn.className = 'ybrpg-btn';
			replaceBtn.style.cssText = 'width:auto;padding:8px 20px;font-size:14px;flex:1;min-width:80px;background:#44aaff;';
			replaceBtn.textContent = '替换宝物';
			replaceBtn.onclick = () => {
				overlay.remove();
				shared.showTreasureSelectPopup(charInstanceId, slotIndex);
			};
			btnRow.appendChild(replaceBtn);
		}

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

	/** 刷新宝物升级弹窗的UI */
	static refreshUpgradeUI(popup, def, baseId, treasureInstanceId, currentLevel, upgradeBtn, charInstanceId) {
		if (!popup) return;

		const levelDisplay = popup.querySelector('[data-level-display]');
		if (levelDisplay) {
			levelDisplay.textContent = `Lv.${currentLevel}/10`;
		}

		const attrRow = popup.querySelector('[data-attr-display]');
		if (attrRow) {
			const baseAtk = def.atk || 0;
			const baseDef = def.def || 0;
			const baseHp = def.hp || 0;
			const baseSpe = def.spe || 0;

			let attrsHTML = '';
			if (baseAtk > 0) attrsHTML += `<div style="color:#ff4444;">攻击: ${baseAtk * currentLevel}</div>`;
			if (baseDef > 0) attrsHTML += `<div style="color:#88cc88;">防御: ${baseDef * currentLevel}</div>`;
			if (baseHp > 0) attrsHTML += `<div style="color:#44aaff;">生命: ${baseHp * currentLevel}</div>`;
			if (baseSpe > 0) attrsHTML += `<div style="color:#ffff44;">速度: ${baseSpe * currentLevel}</div>`;
			attrRow.innerHTML = attrsHTML;
		}

		const materialCount = popup.querySelector('[data-material-count]');
		if (materialCount) {
			const newFodderCount = Bag.getAbsorbFodderList(treasureInstanceId).length;

			const nextNeedCount = currentLevel;
			const isSufficient = newFodderCount >= nextNeedCount;
			materialCount.innerHTML = `需要: <span style="color:#ffd700;">${nextNeedCount}</span> 个 · 可用: <span style="color:${isSufficient ? '#44ff88' : '#ff4444'};">${newFodderCount}</span> 个`;

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

				const previewTitle = previewSection.parentElement?.querySelector('[data-preview-title]');
				if (previewTitle) {
					previewTitle.textContent = `升级至 Lv.${currentLevel + 1} 预览`;
				}
			} else {
				previewSection.parentElement?.remove();
			}
		}

		if (upgradeBtn) {
			if (currentLevel >= 10) {
				upgradeBtn.textContent = '已满级';
				upgradeBtn.disabled = true;
				upgradeBtn.style.opacity = '0.5';
			} else {
			const newFodderCount = Bag.getAbsorbFodderList(treasureInstanceId).length;

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

		if (charInstanceId) {
			const bonusInfo = popup.querySelector('[data-char-treasure-bonus]');
			if (bonusInfo) {
				bonusInfo.innerHTML = `当前宝物加成: ${def.desc(currentLevel)}`;
			}
		}
	}
}


// ====== Stat - 属性/战力/队伍计算 ======

class Stat {
	/**
	 * 计算角色实例的最终总属性（基础 + 突破加成 + 宝物加成）
	 */
	static final(instanceId, externalTeamBonuses = null) {
		if (!instanceId || !window.charBagData || !window.charBagData[instanceId]) {
			return {
				baseHp: 0, baseAtk: 0, baseDef: 0, baseSpe: 0,
				totalHp: 0, totalAtk: 0, totalDef: 0, totalSpe: 0,
				breakthroughBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
				treasureBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
				mingzhong: 10000, shanbi: 0, baoji: 0, kangbao: 0, poji: 0, gedang: 0,
				fixedDealUp: 0, fixedTakeDn: 0, pctDealUp: 0, pctTakeDn: 0,
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
				mingzhong: 10000, shanbi: 0, baoji: 0, kangbao: 0, poji: 0, gedang: 0,
				fixedDealUp: 0, fixedTakeDn: 0, pctDealUp: 0, pctTakeDn: 0,
				fixedHeal: 0, fixedBeHeal: 0, pctHeal: 0, pctBeHeal: 0,
				flatBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
				percentBonus: { hp: 0, atk: 0, def: 0, spe: 0 },
				growthFactor: 1
			};
		}

		const currentLevel = instData.level || 1;
		const currentRank = instData.rank || baseChar.rank || 'common';
		const currentTemplate = instData.template || baseChar.template || 'balanced';

		const templateData = characterTemplate || characterTemplate;
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

		const growthFactor = (100 + 10 * (currentLevel - 1)) / 100;

		const baseHp = Math.floor(baseStats.hp * growthFactor);
		const baseAtk = Math.floor(baseStats.atk * growthFactor);
		const baseDef = Math.floor(baseStats.def * growthFactor);
		const baseSpe = Math.floor(baseStats.spe * growthFactor);

		const tupolevel = instData.tupolevel || 0;
		const tupoBaseHp = Math.floor(baseStats.hp * 0.5 * tupolevel);
		const tupoBaseAtk = Math.floor(baseStats.atk * 0.5 * tupolevel);
		const tupoBaseDef = Math.floor(baseStats.def * 0.5 * tupolevel);
		const tupoBaseSpe = Math.floor(baseStats.spe * 0.5 * tupolevel);

		let selfFlat = { hp: tupoBaseHp, atk: tupoBaseAtk, def: tupoBaseDef, spe: tupoBaseSpe };
		let teamFlat = { hp: 0, atk: 0, def: 0, spe: 0 };
		let selfPercent = { hp: 0, atk: 0, def: 0, spe: 0 };
		let teamPercent = { hp: 0, atk: 0, def: 0, spe: 0 };

		let breakHit = 0, breakDodge = 0, breakCrit = 0, breakCritResist = 0, breakPierce = 0, breakBlock = 0, breakBaoShang = 0, breakShouhu = 0;
		let breakFixedDealUp = 0, breakFixedTakeDn = 0, breakPctDealUp = 0, breakPctTakeDn = 0;
		let breakFixedHeal = 0, breakFixedBeHeal = 0, breakPctHeal = 0, breakPctBeHeal = 0;

		let teamFlatHit = 0, teamFlatDodge = 0, teamFlatCrit = 0, teamFlatCritResist = 0, teamFlatPierce = 0, teamFlatBlock = 0, teamFlatBaoShang = 0, teamFlatShouhu = 0;
		let teamFlatFixedDealUp = 0, teamFlatFixedTakeDn = 0, teamFlatFixedHeal = 0, teamFlatFixedBeHeal = 0;
		let teamPercentPctDealUp = 0, teamPercentPctTakeDn = 0, teamPercentPctHeal = 0, teamPercentPctBeHeal = 0;

		if (externalTeamBonuses) {
			teamFlat.hp = externalTeamBonuses.teamFlat.hp || 0;
			teamFlat.atk = externalTeamBonuses.teamFlat.atk || 0;
			teamFlat.def = externalTeamBonuses.teamFlat.def || 0;
			teamFlat.spe = externalTeamBonuses.teamFlat.spe || 0;

			teamPercent.hp = externalTeamBonuses.teamPercent.hp || 0;
			teamPercent.atk = externalTeamBonuses.teamPercent.atk || 0;
			teamPercent.def = externalTeamBonuses.teamPercent.def || 0;
			teamPercent.spe = externalTeamBonuses.teamPercent.spe || 0;

			teamFlatHit = externalTeamBonuses.teamFlat.mingzhong || 0;
			teamFlatDodge = externalTeamBonuses.teamFlat.shanbi || 0;
		teamFlatCrit = externalTeamBonuses.teamFlat.baoji || 0;
		teamFlatCritResist = externalTeamBonuses.teamFlat.kangbao || 0;
		teamFlatBaoShang = externalTeamBonuses.teamFlat.baoshang || 0;
		teamFlatShouhu = externalTeamBonuses.teamFlat.shouhu || 0;
			teamFlatPierce = externalTeamBonuses.teamFlat.poji || 0;
			teamFlatBlock = externalTeamBonuses.teamFlat.gedang || 0;
			teamFlatFixedDealUp = externalTeamBonuses.teamFlat.fixedDealUp || 0;
			teamFlatFixedTakeDn = externalTeamBonuses.teamFlat.fixedTakeDn || 0;
			teamFlatFixedHeal = externalTeamBonuses.teamFlat.fixedHeal || 0;
			teamFlatFixedBeHeal = externalTeamBonuses.teamFlat.fixedBeHeal || 0;
			teamPercentPctDealUp = externalTeamBonuses.teamPercent.pctDealUp || 0;
			teamPercentPctTakeDn = externalTeamBonuses.teamPercent.pctTakeDn || 0;
			teamPercentPctHeal = externalTeamBonuses.teamPercent.pctHeal || 0;
			teamPercentPctBeHeal = externalTeamBonuses.teamPercent.pctBeHeal || 0;
		}

		const tupoList = instData.tupoList || baseChar.tupoList || [];

		for (let i = 0; i < tupolevel; i++) {
			const buff = tupoList[i];
			if (!buff) continue;

			let resolvedBuff = buff;
			if (typeof buff === 'string') {
				const lib = BREAKTHROUGH_BUFF_LIBRARY || {};
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
					if (resolvedBuff.mingzhong !== undefined) breakHit += Number(resolvedBuff.mingzhong);
					if (resolvedBuff.shanbi !== undefined) breakDodge += Number(resolvedBuff.shanbi);
					if (resolvedBuff.baoji !== undefined) breakCrit += Number(resolvedBuff.baoji);
				if (resolvedBuff.baoshang !== undefined) breakBaoShang += Number(resolvedBuff.baoshang);
					if (resolvedBuff.kangbao !== undefined) breakCritResist += Number(resolvedBuff.kangbao);
				if (resolvedBuff.shouhu !== undefined) breakShouhu += Number(resolvedBuff.shouhu);
					if (resolvedBuff.poji !== undefined) breakPierce += Number(resolvedBuff.poji);
					if (resolvedBuff.gedang !== undefined) breakBlock += Number(resolvedBuff.gedang);
					if (resolvedBuff.fixedDealUp !== undefined) breakFixedDealUp += Number(resolvedBuff.fixedDealUp);
					if (resolvedBuff.fixedTakeDn !== undefined) breakFixedTakeDn += Number(resolvedBuff.fixedTakeDn);
					if (resolvedBuff.fixedHeal !== undefined) breakFixedHeal += Number(resolvedBuff.fixedHeal);
					if (resolvedBuff.fixedBeHeal !== undefined) breakFixedBeHeal += Number(resolvedBuff.fixedBeHeal);
					break;

				case 'self_stat_percent':
					if (resolvedBuff.atk !== undefined) selfPercent.atk += Number(resolvedBuff.atk);
					if (resolvedBuff.def !== undefined) selfPercent.def += Number(resolvedBuff.def);
					if (resolvedBuff.hp !== undefined) selfPercent.hp += Number(resolvedBuff.hp);
					if (resolvedBuff.spe !== undefined) selfPercent.spe += Number(resolvedBuff.spe);
					if (resolvedBuff.baoji !== undefined) breakCrit += Number(resolvedBuff.baoji);
				if (resolvedBuff.baoshang !== undefined) breakBaoShang += Number(resolvedBuff.baoshang);
					if (resolvedBuff.kangbao !== undefined) breakCritResist += Number(resolvedBuff.kangbao);
				if (resolvedBuff.shouhu !== undefined) breakShouhu += Number(resolvedBuff.shouhu);
					if (resolvedBuff.shanbi !== undefined) breakDodge += Number(resolvedBuff.shanbi);
					if (resolvedBuff.poji !== undefined) breakPierce += Number(resolvedBuff.poji);
					if (resolvedBuff.gedang !== undefined) breakBlock += Number(resolvedBuff.gedang);
					if (resolvedBuff.pctDealUp !== undefined) breakPctDealUp += Number(resolvedBuff.pctDealUp);
					if (resolvedBuff.pctTakeDn !== undefined) breakPctTakeDn += Number(resolvedBuff.pctTakeDn);
					if (resolvedBuff.pctHeal !== undefined) breakPctHeal += Number(resolvedBuff.pctHeal);
					if (resolvedBuff.pctBeHeal !== undefined) breakPctBeHeal += Number(resolvedBuff.pctBeHeal);
					break;

				case 'team_stat_flat':
					if (!externalTeamBonuses) {
						if (resolvedBuff.atk !== undefined) teamFlat.atk += Number(resolvedBuff.atk);
						if (resolvedBuff.def !== undefined) teamFlat.def += Number(resolvedBuff.def);
						if (resolvedBuff.hp !== undefined) teamFlat.hp += Number(resolvedBuff.hp);
						if (resolvedBuff.spe !== undefined) teamFlat.spe += Number(resolvedBuff.spe);
						if (resolvedBuff.mingzhong !== undefined) teamFlatHit += Number(resolvedBuff.mingzhong);
						if (resolvedBuff.shanbi !== undefined) teamFlatDodge += Number(resolvedBuff.shanbi);
						if (resolvedBuff.baoji !== undefined) teamFlatCrit += Number(resolvedBuff.baoji);
						if (resolvedBuff.kangbao !== undefined) teamFlatCritResist += Number(resolvedBuff.kangbao);
						if (resolvedBuff.poji !== undefined) teamFlatPierce += Number(resolvedBuff.poji);
						if (resolvedBuff.gedang !== undefined) teamFlatBlock += Number(resolvedBuff.gedang);
						if (resolvedBuff.fixedDealUp !== undefined) teamFlatFixedDealUp += Number(resolvedBuff.fixedDealUp);
						if (resolvedBuff.fixedTakeDn !== undefined) teamFlatFixedTakeDn += Number(resolvedBuff.fixedTakeDn);
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
						if (resolvedBuff.pctDealUp !== undefined) teamPercentPctDealUp += Number(resolvedBuff.pctDealUp);
						if (resolvedBuff.pctTakeDn !== undefined) teamPercentPctTakeDn += Number(resolvedBuff.pctTakeDn);
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

		let tresHp = 0, tresAtk = 0, tresDef = 0, tresSpe = 0;
		let tresHit = 0, tresDodge = 0, tresCrit = 0, tresCritResist = 0, tresPierce = 0, tresBlock = 0, tresBaoShang = 0, tresShouhu = 0;

		if (window.charTreasureSlots && window.charTreasureSlots[instanceId]) {
			const slots = window.charTreasureSlots[instanceId];
			slots.forEach(treasureId => {
				if (!treasureId) return;
				const s = Bag.stats(treasureId);
				tresHp += s.hp || 0;
				tresAtk += s.atk || 0;
				tresDef += s.def || 0;
				tresSpe += s.spe || 0;
				tresHit += s.mingzhong || 0;
				tresDodge += s.shanbi || 0;
			tresCrit += s.baoji || 0;
			tresCritResist += s.kangbao || 0;
			tresBaoShang += s.baoshang || 0;
			tresShouhu += s.shouhu || 0;
				tresPierce += s.poji || 0;
				tresBlock += s.gedang || 0;
			});
		}


		const calcTotal = (base, selfF, teamF, tres, selfP, teamP) => {
			const flatTotal = base + selfF + teamF + tres;
			const percentTotal = 1 + selfP + teamP;
			return Math.floor(flatTotal * percentTotal);
		};

		const totalHp = calcTotal(baseHp, selfFlat.hp, teamFlat.hp, tresHp, selfPercent.hp, teamPercent.hp);
		const totalAtk = calcTotal(baseAtk, selfFlat.atk, teamFlat.atk, tresAtk, selfPercent.atk, teamPercent.atk);
		const totalDef = calcTotal(baseDef, selfFlat.def, teamFlat.def, tresDef, selfPercent.def, teamPercent.def);
		const totalSpe = calcTotal(baseSpe, selfFlat.spe, teamFlat.spe, tresSpe, selfPercent.spe, teamPercent.spe);

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

			mingzhong: 10000 + breakHit + teamFlatHit + tresHit,
			shanbi: 0 + breakDodge + teamFlatDodge + tresDodge,
		baoji: 0 + breakCrit + teamFlatCrit + tresCrit,
		kangbao: 0 + breakCritResist + teamFlatCritResist + tresCritResist,
		baoshang: 0 + breakBaoShang + teamFlatBaoShang + tresBaoShang,
		shouhu: 0 + breakShouhu + teamFlatShouhu + tresShouhu,
			poji: 0 + breakPierce + teamFlatPierce + tresPierce,
			gedang: 0 + breakBlock + teamFlatBlock + tresBlock,

			fixedDealUp: 0 + breakFixedDealUp + teamFlatFixedDealUp,
			fixedTakeDn: 0 + breakFixedTakeDn + teamFlatFixedTakeDn,
			pctDealUp: 0 + breakPctDealUp + teamPercentPctDealUp,
			pctTakeDn: 0 + breakPctTakeDn + teamPercentPctTakeDn,

			fixedHeal: 0 + breakFixedHeal + teamFlatFixedHeal,
			fixedBeHeal: 0 + breakFixedBeHeal + teamFlatFixedBeHeal,
			pctHeal: 0 + breakPctHeal + teamPercentPctHeal,
			pctBeHeal: 0 + breakPctBeHeal + teamPercentPctBeHeal,
		};

		instData._compiledStats = result;

		instData.hp = result.totalHp;
		instData.atk = result.totalAtk;
		instData.def = result.totalDef;
		instData.spe = result.totalSpe;
		instData.maxHp = result.totalHp;

		return result;
	}

	/** 计算全队突破增益汇总 */
	static teamBonuses() {
		const teamFlat = { hp: 0, atk: 0, def: 0, spe: 0 };
		const teamPercent = { hp: 0, atk: 0, def: 0, spe: 0 };

		teamFlat.mingzhong = 0; teamFlat.shanbi = 0; teamFlat.baoji = 0; teamFlat.kangbao = 0; teamFlat.poji = 0; teamFlat.gedang = 0;
		teamFlat.fixedDealUp = 0; teamFlat.fixedTakeDn = 0; teamFlat.fixedHeal = 0; teamFlat.fixedBeHeal = 0;
		teamPercent.pctDealUp = 0; teamPercent.pctTakeDn = 0; teamPercent.pctHeal = 0; teamPercent.pctBeHeal = 0;

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
					const lib = BREAKTHROUGH_BUFF_LIBRARY || {};
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
						if (resolvedBuff.mingzhong !== undefined) teamFlat.mingzhong += Number(resolvedBuff.mingzhong);
						if (resolvedBuff.shanbi !== undefined) teamFlat.shanbi += Number(resolvedBuff.shanbi);
						if (resolvedBuff.baoji !== undefined) teamFlat.baoji += Number(resolvedBuff.baoji);
						if (resolvedBuff.kangbao !== undefined) teamFlat.kangbao += Number(resolvedBuff.kangbao);
						if (resolvedBuff.poji !== undefined) teamFlat.poji += Number(resolvedBuff.poji);
						if (resolvedBuff.gedang !== undefined) teamFlat.gedang += Number(resolvedBuff.gedang);
						if (resolvedBuff.fixedDealUp !== undefined) teamFlat.fixedDealUp += Number(resolvedBuff.fixedDealUp);
						if (resolvedBuff.fixedTakeDn !== undefined) teamFlat.fixedTakeDn += Number(resolvedBuff.fixedTakeDn);
						if (resolvedBuff.fixedHeal !== undefined) teamFlat.fixedHeal += Number(resolvedBuff.fixedHeal);
						if (resolvedBuff.fixedBeHeal !== undefined) teamFlat.fixedBeHeal += Number(resolvedBuff.fixedBeHeal);
						break;

					case 'team_stat_percent':
						if (resolvedBuff.atk !== undefined) teamPercent.atk += Number(resolvedBuff.atk);
						if (resolvedBuff.def !== undefined) teamPercent.def += Number(resolvedBuff.def);
						if (resolvedBuff.hp !== undefined) teamPercent.hp += Number(resolvedBuff.hp);
						if (resolvedBuff.spe !== undefined) teamPercent.spe += Number(resolvedBuff.spe);
						if (resolvedBuff.pctDealUp !== undefined) teamPercent.pctDealUp += Number(resolvedBuff.pctDealUp);
						if (resolvedBuff.pctTakeDn !== undefined) teamPercent.pctTakeDn += Number(resolvedBuff.pctTakeDn);
						if (resolvedBuff.pctHeal !== undefined) teamPercent.pctHeal += Number(resolvedBuff.pctHeal);
						if (resolvedBuff.pctBeHeal !== undefined) teamPercent.pctBeHeal += Number(resolvedBuff.pctBeHeal);
						break;
				}
			}
		});

		return { teamFlat, teamPercent };
	}

	/** 生成角色的战斗力 */
	static power(finalStats) {
		const atk = finalStats.totalAtk || 0;
		const def = finalStats.totalDef || 0;
		const hp = finalStats.totalHp || 0;

		const baoji = finalStats.baoji || 0;
		const mingzhong = (finalStats.mingzhong || 10000) - 10000;
		const poji = finalStats.poji || 0;

		const kangbao = finalStats.kangbao || 0;
		const shanbi = finalStats.shanbi || 0;
		const gedang = finalStats.gedang || 0;

		const pctDealUp = finalStats.pctDealUp || 0;
		const pctTakeDn = finalStats.pctTakeDn || 0;

		const pctHeal = finalStats.pctHeal || 0;
		const pctBeHeal = finalStats.pctBeHeal || 0;

		const fixedDealUp = finalStats.fixedDealUp || 0;
		const fixedTakeDn = finalStats.fixedTakeDn || 0;

		const fixedHeal = finalStats.fixedHeal || 0;
		const fixedBeHeal = finalStats.fixedBeHeal || 0;

		const atkWeight = 10 + (baoji + mingzhong + poji) * 2 / 10000;
		const defWeight = 10;
		const hpWeight = 1 + (kangbao + shanbi + gedang) * 2 / 100000;

		let atkPower = atk * atkWeight;
		let defPower = def * defWeight;
		let hpPower = hp * hpWeight;

		atkPower = atkPower * (1 + pctDealUp) * (1 + pctHeal);
		hpPower = hpPower * (1 + pctTakeDn) * (1 + pctBeHeal);

		let totalPower = atkPower + defPower + hpPower;

		totalPower += fixedDealUp * 1;
		totalPower += fixedTakeDn * 1;

		totalPower += fixedHeal * 1;
		totalPower += fixedBeHeal * 1;

		return Math.floor(totalPower);
	}

	/** 构建用于战斗的玩家队伍数据（应用宝物属性加成） */
	static buildTeam() {
		const team = (function () {
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

		team.forEach(unit => {
			if (unit && unit.instanceId) {
				Bag.applyTo(unit);
			}
		});

		return team;
	}
}


// ====== UI - 视图刷新/工具函数 ======

class UI {
	/**
	 * 统一刷新所有视图
	 */
	static refresh(options = {}) {
		const { instanceId, dialog, forceTeamRebuild = false } = options;

		if (window._isRefreshing) {
			console.log('[刷新] 正在刷新中，跳过');
			return;
		}

		window._isRefreshing = true;

		try {
			if (window.currentTeam) {
				const teamInstanceIds = new Set(window.currentTeam.filter(Boolean));

				teamInstanceIds.forEach(instId => {
					const instData = window.charBagData && window.charBagData[instId];
					if (instData) {
						const updatedStats = shared.updateCharacterSP(instData);
						if (updatedStats && updatedStats.openSpskill !== undefined) {
							instData.openSpskill = updatedStats.openSpskill;
						}
					}
				});

				if (instanceId && !teamInstanceIds.has(instanceId)) {
					const instData = window.charBagData && window.charBagData[instanceId];
					if (instData) {
						const updatedStats = shared.updateCharacterSP(instData);
						if (updatedStats && updatedStats.openSpskill !== undefined) {
							instData.openSpskill = updatedStats.openSpskill;
						}
					}
				}
			}

			const teamView = document.getElementById('team-view');
			if (teamView && teamView.style.display !== 'none') {
				if (forceTeamRebuild) {
					shared.renderTeamView(teamView);
				} else {
					shared.refreshTeamViewDisplay();
				}
			}

			try {
				const bagView = document.getElementById('bag-view');
				if (bagView && bagView.style.display !== 'none') {
					const selectedCharCard = bagView.querySelector('.charbag-char-card.selected');
					const selectedEquipCard = bagView.querySelector('.equipbag-treasure-card.selected');

					const selectedCharInstanceId = selectedCharCard ? selectedCharCard.dataset.instanceId : null;
					const selectedCharId = selectedCharCard ? selectedCharCard.dataset.charId : null;
					const selectedTreasureInstanceId = selectedEquipCard ? selectedEquipCard.dataset.treasureInstanceId : null;

					shared.renderBagView(bagView);

					setTimeout(() => {
						if (selectedCharInstanceId) {
							const newCharCard = bagView.querySelector(`.charbag-char-card[data-instance-id="${selectedCharInstanceId}"]`);
							if (newCharCard) {
								newCharCard.classList.add('selected');
								const instData = window.charBagData && window.charBagData[selectedCharInstanceId];
								if (instData) {
									shared.updateBagCharDetailBar({
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
								newEquipCard.click();
							}
						}
					}, 50);
				}
			} catch (e) {
				console.warn('[刷新] 背包刷新异常:', e);
			}

			if (instanceId && dialog) {
				shared.refreshCharDetailPopupContent(instanceId, dialog);
			}

			try {
				const openDialogs = document.querySelectorAll('.gallery-detail-dialog');
				openDialogs.forEach(dlg => {
					const nameEl = dlg.querySelector('.gallery-detail-name');
					if (nameEl && instanceId) {
						const instData = window.charBagData && window.charBagData[instanceId];
						if (instData) {
							shared.refreshCharDetailPopupContent(instanceId, dlg);
						}
					}
				});
			} catch (e) { }

			try {
				const breakthroughOverlay = document.getElementById('breakthrough-preview-overlay');
				if (breakthroughOverlay && breakthroughOverlay.style.display !== 'none') {
					const breakthroughPopup = breakthroughOverlay.querySelector('[class*="bp-popup"]') ||
						breakthroughOverlay.querySelector('.bp-list-container')?.closest('div[style*="flex"]');
					if (breakthroughPopup && instanceId) {
						shared.refreshBreakthroughPopupContent(breakthroughPopup, instanceId);
					}
				}
			} catch (e) { }

			try {
				const shopView = document.getElementById('shop-view');
				if (shopView && shopView.style.display !== 'none') {
					shared.renderShopView(shopView);
				}
			} catch (e) { }
		} finally {
			window._isRefreshing = false;
		}
	}

	/** 格式化属性显示文本 */
	static formatAttr(totalValue, baseValue, bonusValue) {
		let text = `${totalValue}`;
		if (bonusValue > 0) {
			text += ` <span style="color:#44ff88;font-size:11px;">(+${bonusValue})</span>`;
		}
		return text;
	}

	/** 比较两个版本号 */
	static compareVer(v1, v2) {
		if (!v1 || !v2) return 0;

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

	/** 检查存档版本是否与当前版本兼容 */
	static checkSave(saveVersion) {
		const currentVersion = window.GAME_VERSION || 'v1.0';

		if (!saveVersion) {
			return {
				compatible: true,
				message: '旧版存档，建议重新保存以更新版本信息'
			};
		}

		const result = UI.compareVer(saveVersion, currentVersion);

		if (result > 0) {
			return {
				compatible: false,
				message: `存档版本(${saveVersion})高于当前版本(${currentVersion})，可能不兼容`
			};
		} else if (result < 0) {
			return {
				compatible: true,
				message: `旧版存档(${saveVersion})，将升级至当前版本(${currentVersion})`
			};
		} else {
			return {
				compatible: true,
				message: ''
			};
		}
	}
	// ====== UI 工具（来自 ui/utils，统一收纳到 UI 类） ======

	/** 飘字提示 */
	static toast(message, type = 'info', duration = 1500) {
		return toast(message, type, duration);
	}

	/** 确认对话框 */
	static confirmDialog(message, onConfirm, onCancel) {
		return confirmDialog(message, onConfirm, onCancel);
	}

	/** 生成唯一角色实例ID */
	static generateInstanceId(charId) {
		return generateInstanceId(charId);
	}

	/** 获取主角在队伍中的槽位索引 */
	static getMainCharacterSlotIndex() {
		return getMainCharacterSlotIndex();
	}
}

export { Bag, Stat, UI };
