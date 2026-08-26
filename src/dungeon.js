/**
 * 星河之契 - 副本系统
 * 由 mode.js 拆分而来（原行号见下文分段注释）
 */

import { shared } from './shared.js';
import { characterList } from './characterList.js';
import { TREASURE_DEFS } from './equip.js';
import { eventList, SPeventList } from './eventList.js';
import { Game } from './core.js';
import { ITEM_DEFS } from './item.js';
import { breakthroughMainCharacter, compileCharacterStats, getRankLabel, levelUpMainCharacter, mergeNoOverwrite, promoteMainCharacter, syncTreasureEquipData } from './team.js';
import { renderBagView } from './bag.js';
import { getRankColor } from './shop.js';
import { SaveManager, getStaminaCost, hideOtherViews, recordDailyClear, showOutputPreview, trySpendStamina } from './other.js';

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
	normal: { hp: 1.0, atk: 1.0, def: 1.0, gold: 1.0, name: '普通', buffs: [], treasures: [], addTupo: 0, addStat: 0 },
	nightmare: { hp: 1.5, atk: 1.3, def: 1.3, gold: 1.5, name: '噩梦', buffs: [], treasures: [], addTupo: 8, addStat: 3000 },
	hell: { hp: 2.0, atk: 1.6, def: 1.6, gold: 2.0, name: '地狱', buffs: [], treasures: [], addTupo: 16, addStat: 6000 }
};

// 难度掉落倍率：每次胜利发放的武将数量倍率（普通1 / 噩梦2 / 地狱3）
const DROP_MULT = { normal: 1, nightmare: 2, hell: 3, secret: 1 };

// 关卡默认金币（凸曲线：全局进度 p = 章节 + (小节-1)/10，gold = 150·p^1.6）
// 幂次 1.6 使后期增幅明显大于前期；可在 eventList 每关用 reward.gold / event.gold 覆盖
function defaultLevelGold(eventId) {
	const m = /c(\d+)-(\d+)/.exec(eventId || '');
	if (!m) return 150;
	const ch = parseInt(m[1], 10) || 1;
	const lv = parseInt(m[2], 10) || 1;
	const p = ch + (lv - 1) / 10;
	const raw = 150 * Math.pow(p, 1.6);
	return Math.round(raw / 10) * 10; // 取整到 10
}
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
		// 突破定义优先用 characterList 原对象（含 content/filter 函数，防反序列化丢函数）；
		// 但「已吸收的宝物槽」只存在于实例 instData.tupoList，必须按槽位合并回来，否则进战斗后吸收特效不生效。
		// 同时兼容超出模板长度的「追加吸收槽」（syncInstanceTupoList 已写入实例）。
		tupoList: (function () {
			const _baseTupo = base ? (base.tupoList || []) : [];
			const _instTupo = instData.tupoList || [];
			const _len = Math.max(_baseTupo.length, _instTupo.length);
			const _merged = [];
			for (let _i = 0; _i < _len; _i++) {
				const _instSlot = _instTupo[_i];
				if (_instSlot && typeof _instSlot === 'object' && _instSlot._absorbedTreasure) {
					_merged[_i] = _instSlot; // 吸收槽用实例数据（含 _absorbedTreasure）
				} else {
					_merged[_i] = (_i < _baseTupo.length) ? _baseTupo[_i] : _instTupo[_i];
				}
			}
			return _merged;
		})(),

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
		levelBtn.style.position = 'relative';
		levelBtn.style.paddingRight = '48px';
		levelBtn.style.textAlign = 'center';

			// 关卡名（仅展示）
			const nameSpan = document.createElement('span');
			if (isLocked) {
				levelBtn.style.opacity = '0.6';
				levelBtn.style.cursor = 'not-allowed';
				nameSpan.textContent = `🔒 ${eventData.name} (${lockReason})`;
			} else {
				nameSpan.textContent = `▶ ${eventData.name}`;
				if (isNew) {
					const tag = document.createElement('span');
					tag.style.cssText = 'color:#ff4444;font-weight:bold;font-size:12px;';
					tag.textContent = ' (新)';
					nameSpan.appendChild(tag);
				}
				// 如果是Boss关或特殊关，加高亮
				if (eventData.type === 'boss') {
					levelBtn.style.borderColor = '#ff4444';
					nameSpan.style.color = '#ff4444';
				}
			}
			levelBtn.appendChild(nameSpan);

			// 右侧「查看」热区：点击仅弹产出预览，不进入关卡
			const viewZone = document.createElement('span');
			viewZone.className = 'lv-view-zone';
			viewZone.textContent = '查看';
			viewZone.onclick = (e) => {
				e.stopPropagation();
				showOutputPreview(eventData, currentDifficulty, index, eventId, chapterKey, {
					canChallenge: !isLocked,
					canSweep: passed.includes(eventId),
					onChallenge: () => levelBtn.click(),
				});
			};
			levelBtn.appendChild(viewZone);

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
				// 体力预扣（上云接口）
				if (!trySpendStamina(getStaminaCost(event))) {
					Game.toast('体力不足，无法挑战', 'error');
					return;
				}
				Game.Battle.start(playerTeam, enemyTeam, {
					difficulty: currentDifficulty,
					eventId: checkEventId,
					eventType: event.type || 'battle',
					chapterKey: chapterKey,
					// 【新增】传递事件配置的金币奖励
					goldReward: event.gold || 0,
					goldScale: DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0,
					// 预生成奖励计划，供旧版战斗结算面板展示（仅固定配置事件）
					rewardPlan: event.reward ? buildRewardPlan(event, currentDifficulty, index) : null,
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
								const ok = breakthroughMainCharacter(targetTupoLevel);
								if (ok) {
									Game.toast(`主角突破至 ${targetTupoLevel} 阶！`, 'success');
								} else {
									Game.toast(`主角突破至 ${targetTupoLevel} 阶失败（已达最大突破阶数或目标超限）`, 'warning');
								}
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
						recordDailyClear(chapterKey, currentDifficulty);
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

			// 小BOSS：boss关且非章节末关；大BOSS：章节末关（cN-10）
			const isBigBoss = (index === eventIds.length - 1);
			const isSmallBoss = (event.type === 'boss' && !isBigBoss);

			const levelBtn = document.createElement('button');
			levelBtn.className = 'ybrpg-btn';
			if (isSmallBoss) levelBtn.classList.add('boss-small');
			if (isBigBoss) levelBtn.classList.add('boss-big');
		levelBtn.style.width = '90%';
		levelBtn.style.fontSize = '14px';
		levelBtn.style.padding = '8px 48px 8px 10px';
		levelBtn.style.position = 'relative';
		levelBtn.style.textAlign = 'center';

			// 关卡名（仅展示，含小/大BOSS配色）
			const nameSpan = document.createElement('span');
			nameSpan.textContent = event.name;
			if (isSmallBoss) nameSpan.className = 'lv-boss-small';
			else if (isBigBoss) nameSpan.className = 'lv-boss-big';
			levelBtn.appendChild(nameSpan);

			// 右侧「查看」热区：点击仅弹产出预览，不进入关卡
			const viewZone = document.createElement('span');
			viewZone.className = 'lv-view-zone';
			viewZone.textContent = '查看';
			viewZone.onclick = (e) => {
				e.stopPropagation();
				showOutputPreview(event, currentDifficulty, index, checkEventId, chapterKey, {
					canChallenge: isUnlocked,
					canSweep: currentEventCompleted,
					onChallenge: () => enterLevel(),
				});
			};
			levelBtn.appendChild(viewZone);

			if (!isUnlocked) {
				levelBtn.style.opacity = '0.5';
				levelBtn.style.cursor = 'not-allowed';
				levelBtn.appendChild(document.createTextNode(' [未解锁]'));
			}

			const enterLevel = () => {
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
						// ===== 【噩梦/地狱】突破 +N（主属性随之提升）+ 全特种属性 +N =====
						const addTupo = scale.addTupo || 0;
						const addStat = scale.addStat || 0;
						const flatStat = addStat > 0 ? {
							mingzhong: addStat, shanbi: addStat, baoji: addStat, kangbao: addStat,
							baoshang: addStat, shouhu: addStat, poji: addStat, gedang: addStat
						} : null;
						return {
							id: e.id,
							name: e.name || base.name || e.id,
							level: e.level || 1,
							template: e.template || base.template || 'balanced',
							skills: e.skills || base.skills || [],
							buff: e.buff || [],
							treasures: e.treasures || [],
							rank: e.rank || base.rank || 'common',
							tupolevel: (e.tupolevel || 0) + addTupo,
							tupoList: e.tupoList || base.tupoList || [],
							flatStat: flatStat,
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
					// 体力预扣（上云接口）
					if (!trySpendStamina(getStaminaCost(event))) {
						Game.toast('体力不足，无法挑战', 'error');
						return;
					}
					Game.Battle.start(playerTeam, enemyTeam, {
						difficulty: currentDifficulty,
						eventId: checkEventId,
						eventType: event.type || 'battle',
						chapterKey: chapterKey,
						// 【新增】传递事件配置的金币奖励
						goldReward: event.gold || 0,
						goldScale: DIFFICULTY_SCALE[currentDifficulty]?.gold || 1.0,
						// 预生成奖励计划，供旧版战斗结算面板展示（仅固定配置事件）
						rewardPlan: event.reward ? buildRewardPlan(event, currentDifficulty, index) : null,
						onWin: () => {
							if (!window.playerProgress) window.playerProgress = {};
							if (!window.playerProgress[checkEventId]) {
								window.playerProgress[checkEventId] = true;
								levelUpMainCharacter();
							}
							// ===== 战斗胜利奖励：金币 + 掉落物（每次胜利都发放）=====
							const diffKey = currentDifficulty;
							const dropMult = DROP_MULT[diffKey] || 1;
						const goldScale = DIFFICULTY_SCALE[diffKey]?.gold || 1.0;
						const rewardCfg = event.reward || null;
						// 金币：reward.gold > event.gold > 章节公式
						const baseGold = (rewardCfg && rewardCfg.gold != null) ? rewardCfg.gold
							: (event.gold != null) ? event.gold
							: defaultLevelGold(event.id);
						const goldReward = Math.floor(baseGold * goldScale);
						window.gameGold = (window.gameGold || 0) + goldReward;
						recordDailyClear(chapterKey, currentDifficulty);
					// 掉落物：优先用事件固定配置 event.reward；未配置则按档位自动规则兜底
					const dropStat = { chars: [], treasures: [], items: [] };
					if (rewardCfg) {
						grantFixedReward(rewardCfg, dropMult, dropStat);
					} else {
						const isMiniBoss = (event.type === 'boss' && index !== 9); // 小boss：boss关且非末关
						const isBigBoss = (index === 9);                           // 大boss：末关
						grantCharactersByRank('rare', dropMult, dropStat.chars);
						if (isMiniBoss) {
							grantCharactersByRank('epicfake', dropMult, dropStat.chars);
							grantCharactersByRank('epic', dropMult, dropStat.chars);
						}
						if (isBigBoss) {
							grantCharactersByRank('legend', dropMult, dropStat.chars);
						}
					}
							// 刷新背包视图（若处于开启状态）
							if (window.renderBagView) {
								const bagView = document.getElementById('bag-view');
								if (bagView) window.renderBagView(bagView);
							}
							// 事件完成后自动存档
							SaveManager.autoSave();
						// 【已停用】新版奖励面板暂不调用，函数保留备用
						// 奖励展示改由旧版战斗结算面板（showBattleResult）呈现，数据来自 battleState.rewardPlan
						// showRewardPanel({
						// 	title: '通关成功',
						// 	sub: `${DIFFICULTY_SCALE[diffKey]?.name || '普通'}难度 · ${event.name}`,
						// 	gold: goldReward,
						// 	chars: dropStat.chars,
						// 	treasures: dropStat.treasures,
						// 	items: dropStat.items,
						// });
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

			levelBtn.onclick = () => {
				if (!isUnlocked) {
					Game.toast('该关卡尚未解锁', 'warning');
					return;
				}
				enterLevel();
			};
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

// ===== 货币体系：price 统一为对象结构，如 {gold:500} 或 {gold:2000, diamond:2} =====
// 货币类型 -> 显示符号

// ===== 以下来自原 mode.js 9237-9591 行 =====

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

// 掉落黑名单（预留结构，当前为空）
const DROP_EXCLUDE_IDS = {};

// 判断突破列表是否含「有效」突破项（排除 null 与空对象 {} 占位）
function hasRealBreakthrough(tupoList) {
	if (!Array.isArray(tupoList)) return false;
	return tupoList.some(x => {
		if (!x) return false;
		if (typeof x === 'string') return true;
		if (typeof x === 'object') return Object.keys(x).length > 0;
		return false;
	});
}

/**
 * 按品质从角色库随机抽取武将并发放（每次胜利调用，可重复）
 * - 排除固定角色（主角等 isFixed）
 * - 排除突破列表无效的占位角色（避免发放残缺武将）
 * @param {string} rank 品质：rare / epicfake / epic / legend ...
 * @param {number} count 发放数量（已含难度倍率）
 * @param {string[]} droppedNames 收集发放到的武将名（用于提示）
 */
function grantCharactersByRank(rank, count, droppedNames) {
	if (!count || count <= 0) return;
	if (!window.charBagData) window.charBagData = {};
	const pool = Object.keys(characterList || {}).filter(id => {
		const c = characterList[id];
		if (!c || c.isFixed) return false;
		if (DROP_EXCLUDE_IDS[id]) return false;
		if (c.rank !== rank) return false;
		// 跳过突破列表无效/为空的占位角色（发放后无突破能力）
		if (!hasRealBreakthrough(c.tupoList)) return false;
		return true;
	});
	if (pool.length === 0) return;
	for (let i = 0; i < count; i++) {
		const pick = pool[Math.floor(Math.random() * pool.length)];
		const instId = grantCharacter(pick);
		if (instId && droppedNames && characterList[pick]) {
			droppedNames.push(characterList[pick].name);
		}
	}
}
// 占位函数，防止报错

/**
 * 按事件固定配置发放掉落（event.reward）
 * reward 形如 { gold, characters:[charId], treasures:[treasureId], items:[itemId] }
 * 每个配置项按难度倍率 mult 重复发放（普通1 / 噩梦2 / 地狱3）
 */
function grantFixedReward(reward, mult, stat) {
	if (!reward || typeof reward !== 'object') return;
	// 武将：直接发放指定角色（作者已手动挑选，跳过黑名单占位角色）
	(reward.characters || []).forEach(id => {
		for (let i = 0; i < mult; i++) {
			if (DROP_EXCLUDE_IDS[id]) { console.warn('[掉落] 黑名单角色，跳过:', id); continue; }
			const inst = grantCharacter(id);
			if (inst && characterList[id]) stat.chars.push(characterList[id].name);
		}
	});
	// 宝物
	(reward.treasures || []).forEach(id => {
		for (let i = 0; i < mult; i++) {
			if (Game.Data && typeof Game.Data.addTreasure === 'function') Game.Data.addTreasure(id, 1);
			stat.treasures.push(id);
		}
	});
	// 道具（武将包等）
	(reward.items || []).forEach(id => {
		for (let i = 0; i < mult; i++) {
			if (Game.Data && typeof Game.Data.addItem === 'function') Game.Data.addItem(id, 1);
			stat.items.push(id);
		}
	});
}

/**
 * 开战时预生成「奖励计划」，供旧版战斗结算面板展示。
 * 主线 100 关均为 event.reward 固定配置（确定性，可提前算准）；
 * 无配置事件走随机兜底路径，仅展示数量/品质，不展示具体名字。
 * @returns {{gold:number, chars:Array<{name:string,count:number}>, treasures:Array, items:Array}|null}
 */
function buildRewardPlan(event, diffKey, index) {
	if (!event) return null;
	const dropMult = DROP_MULT[diffKey] || 1;
	const goldScale = DIFFICULTY_SCALE[diffKey]?.gold || 1.0;
	const rewardCfg = event.reward || null;
	const baseGold = (rewardCfg && rewardCfg.gold != null) ? rewardCfg.gold
		: (event.gold != null) ? event.gold
		: defaultLevelGold(event.id);
	const gold = Math.floor(baseGold * goldScale);

	// 按 id 聚合（保留 icon / rank 等元信息），同名/同 id 计数
	const groupById = (arr) => {
		const m = {};
		arr.forEach(o => {
			if (!o || !o.id) return;
			if (!m[o.id]) m[o.id] = Object.assign({}, o, { count: 0 });
			m[o.id].count++;
		});
		return Object.keys(m).map(k => m[k]);
	};

	let chars = [], treasures = [], items = [];
	if (rewardCfg) {
		// 固定配置：确定性，解析名字 + 图标（角色另有 rank 用于边框配色）
		chars = groupById((rewardCfg.characters || [])
			.filter(id => !DROP_EXCLUDE_IDS[id] && characterList[id])
			.map(id => ({
				id,
				name: characterList[id].name,
				rank: characterList[id].rank,
				icon: `/image/character/${id}.jpg`,
			}))
			.flatMap(o => Array(dropMult).fill(o)));
		treasures = groupById((rewardCfg.treasures || [])
			.map(id => {
				const d = TREASURE_DEFS[id];
				return { id, name: (d && d.name) || id, icon: (d && d.icon) || null };
			})
			.flatMap(o => Array(dropMult).fill(o)));
		items = groupById((rewardCfg.items || [])
			.map(id => {
				const d = ITEM_DEFS[id];
				return { id, name: (d && d.name) || id, icon: (d && d.icon) || null };
			})
			.flatMap(o => Array(dropMult).fill(o)));
	} else {
		// 随机兜底：仅展示数量与品质（主线不会走到这里）
		const rankCounts = { '随机稀有武将': dropMult };
		const isMiniBoss = (event.type === 'boss' && index !== 9);
		const isBigBoss = (index === 9);
		if (isMiniBoss) {
			rankCounts['随机伪史诗武将'] = (rankCounts['随机伪史诗武将'] || 0) + dropMult;
			rankCounts['随机史诗武将'] = (rankCounts['随机史诗武将'] || 0) + dropMult;
		}
		if (isBigBoss) {
			rankCounts['随机传说武将'] = (rankCounts['随机传说武将'] || 0) + dropMult;
		}
		chars = Object.keys(rankCounts).map(name => ({ name, count: rankCounts[name], icon: null }));
	}
	return { gold, chars, treasures, items };
}

/**
 * 计算关卡金币产出（与真实战斗胜利一致）
 * 主线：reward.gold > event.gold > 章节公式，再乘难度金币倍率
 * 秘境：仅按自身 event.gold（无难度缩放）
 */
function computeLevelGold(event, diffKey, chapterKey) {
	if (/^sp/i.test(chapterKey || '')) {
		return event.gold || 300;
	}
	const rewardCfg = event.reward || null;
	const goldScale = DIFFICULTY_SCALE[diffKey]?.gold || 1.0;
	const baseGold = (rewardCfg && rewardCfg.gold != null) ? rewardCfg.gold
		: (event.gold != null) ? event.gold
		: defaultLevelGold(event.id);
	return Math.floor(baseGold * goldScale);
}

/**
 * 扫荡：直接按通关规则发放产出，并用新版结算框展示
 * 仅对已完成关卡调用
 */
function doSweep(event, diffKey, index, eventId, chapterKey, onClose, count) {
	if (!event) return;
	count = (typeof count === 'number' && count > 1) ? count : 1;
	const isSP = /^sp/i.test(chapterKey || '');
	const diffName = DIFFICULTY_SCALE[diffKey]?.name || diffKey;

	let totalGold = 0;
	const totalDrop = { chars: [], treasures: [], items: [] };
	let done = 0;
	let interrupted = false;

	const finalize = () => {
		showSweepResultPanel({
			title: count > 1 ? `扫荡成功（${count}次${interrupted ? '，体力不足中断' : ''}）` : '扫荡成功',
			sub: `${diffName}难度 · ${event.name || eventId}`,
			gold: totalGold,
			chars: totalDrop.chars,
			treasures: totalDrop.treasures,
			items: totalDrop.items,
			onClose: (typeof onClose === 'function') ? onClose : null,
		});
	};

	const runOnce = () => {
		if (done >= count) { finalize(); return; }
		// 体力预扣（上云接口）
		if (!trySpendStamina(getStaminaCost(event))) {
			Game.toast('体力不足，扫荡中断', 'error');
			interrupted = true;
			finalize();
			return;
		}
		const goldReward = computeLevelGold(event, diffKey, chapterKey);
		window.gameGold = (window.gameGold || 0) + goldReward;
		totalGold += goldReward;

		if (!isSP) {
			const dropMult = DROP_MULT[diffKey] || 1;
			const rewardCfg = event.reward || null;
			if (rewardCfg) {
				grantFixedReward(rewardCfg, dropMult, totalDrop);
			} else {
				const isMiniBoss = (event.type === 'boss' && index !== 9);
				const isBigBoss = (index === 9);
				grantCharactersByRank('rare', dropMult, totalDrop.chars);
				if (isMiniBoss) {
					grantCharactersByRank('epicfake', dropMult, totalDrop.chars);
					grantCharactersByRank('epic', dropMult, totalDrop.chars);
				}
				if (isBigBoss) {
					grantCharactersByRank('legend', dropMult, totalDrop.chars);
				}
			}
		}

		// 刷新背包视图（若处于开启状态）
		if (window.renderBagView) {
			const bagView = document.getElementById('bag-view');
			if (bagView) window.renderBagView(bagView);
		}
		SaveManager.autoSave();

		done++;
		runOnce();
	};

	runOnce();
}

/**
 * 扫荡结算框（独立于新版结算框 showRewardPanel，使用 sweep-* 专属选择器）
 * 仅关闭自身，不做任何视图切换
 */
function showSweepResultPanel(opt) {
	opt = opt || {};
	// 武将名称 -> id 反查（用于头像 / 品质边框配色）
	const charNameToId = {};
	Object.keys(characterList || {}).forEach(id => {
		const n = characterList[id] && characterList[id].name;
		if (n) charNameToId[n] = id;
	});

	// 聚合武将（按名称），附带头像与品质
	const aggChars = (arr) => {
		const m = {};
		(arr || []).forEach(name => {
			if (!name) return;
			if (!m[name]) {
				const cid = charNameToId[name];
				const c = cid ? characterList[cid] : null;
				m[name] = { name, count: 0, icon: cid ? `/image/character/${cid}.jpg` : null, rank: c ? c.rank : null };
			}
			m[name].count++;
		});
		return Object.keys(m).map(k => m[k]);
	};
	// 聚合宝物 / 道具（按 id），附带图标
	const aggDefs = (arr, defs) => {
		const m = {};
		(arr || []).forEach(id => {
			if (!id) return;
			if (!m[id]) {
				const d = defs[id];
				m[id] = { name: (d && d.name) || id, count: 0, icon: (d && d.icon) || null, rank: null };
			}
			m[id].count++;
		});
		return Object.keys(m).map(k => m[k]);
	};

	const charList = aggChars(opt.chars);
	const treaList = aggDefs(opt.treasures, TREASURE_DEFS);
	const itemList = aggDefs(opt.items, ITEM_DEFS);

	const chip = (o) => {
		const cnt = o.count > 1 ? `<span class="sweep-cnt"> ×${o.count}</span>` : '';
		const icon = o.icon
			? `<img src="${o.icon}" class="sweep-chip-icon" alt="" onerror="this.style.display='none'">`
			: '';
		const style = o.rank ? ` style="border-color:${getRankColor(o.rank)}"` : '';
		return `<span class="sweep-chip"${style}>${icon}${o.name}${cnt}</span>`;
	};
	const section = (title, list) => {
		let h = `<div class="sweep-section-title">${title}（${list.length}）</div>`;
		if (list.length) {
			h += '<div class="sweep-list">' + list.map(chip).join('') + '</div>';
		} else {
			h += '<div class="sweep-empty">无</div>';
		}
		return h;
	};

	const overlay = document.createElement('div');
	overlay.className = 'sweep-overlay';
	const panel = document.createElement('div');
	panel.className = 'sweep-panel';
	panel.innerHTML =
		`<div class="sweep-title">⚡ ${opt.title || '扫荡成功'}</div>` +
		(opt.sub ? `<div class="sweep-sub">${opt.sub}</div>` : '') +
		`<div class="sweep-gold">💰 ${opt.gold || 0} <small>金币</small></div>` +
		section('获得武将', charList) +
		section('获得宝物', treaList) +
		section('获得道具', itemList);

	const okBtn = document.createElement('button');
	okBtn.className = 'sweep-ok-btn';
	okBtn.textContent = '确定';
	const close = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	okBtn.onclick = (e) => { e.stopPropagation(); close(); if (typeof opt.onClose === 'function') opt.onClose(); };
	overlay.onclick = (e) => { e.stopPropagation(); if (e.target === overlay) close(); };
	panel.appendChild(okBtn);
	overlay.appendChild(panel);
	document.body.appendChild(overlay);
}

// ============================================================
// 经济 / 限制系统（可上云预留接口）
// 当前均为本地实现；未来迁移到服务器时，将带 [上云预留接口] 注释的
// 函数体替换为对云端的异步校验 / 记账调用即可，调用方无需改动。
// ============================================================

// 导出本模块定义的函数（供其他模块 import）
export { getCharSaveData, renderDungeonView, DIFFICULTY_SCALE, DROP_MULT, defaultLevelGold, getEventForDifficulty, buildPlayerTeamForBattle, renderChapterEventList, getEventName, grantCharacter, DROP_EXCLUDE_IDS, hasRealBreakthrough, grantCharactersByRank, grantFixedReward, buildRewardPlan, computeLevelGold, doSweep, showSweepResultPanel };

// 暴露给外部模块（shared 注册表 / window）
shared.renderDungeonView = renderDungeonView;
window.grantCharacter = grantCharacter;
