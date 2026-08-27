/**
 * 星河之契 - 其他系统（设置/兑换/每日/图鉴/资源/存档/主界面）
 * 由 mode.js 拆分而来（原行号见下文分段注释）
 */

import { shared } from './shared.js';
import { contentList } from './contentList.js';
import { characterList, characterTemplate } from './characterList.js';
import { BREAKTHROUGH_BUFF_LIBRARY, STANDARD_BREAKTHROUGH_TEMPLATE } from './charBreakthroughConfig.js';
import { TREASURE_DEFS } from './equip.js';
import { Game } from './core.js';
import { ITEM_DEFS } from './item.js';
import { buildSkillSection, compileCharacterStats, getRankLabel, mergeNoOverwrite, refreshAllTeamSlots, renderTeamView, showTeamCharInfo, syncTreasureEquipData } from './team.js';
import { DIFFICULTY_SCALE, buildRewardPlan, computeLevelGold, doSweep } from './dungeon.js';
import { formatPrice, getRankColor, normalizePrice, refreshShopItems } from './shop.js';

function renderSettingsView(container) {
	// 清空容器以防重复渲染
	container.innerHTML = '';

	// 恢复主设置视图的居中布局（子视图可能改为顶部对齐）
	container.style.justifyContent = 'center';

	// 创建按钮组容器
	const groupDiv = document.createElement('div');
	groupDiv.className = 'settings-btn-group';

	// 图鉴行：角色图鉴 + 宝物图鉴
	const galleryRow = document.createElement('div');
	galleryRow.style.cssText = 'display:flex;gap:20px;justify-content:center;flex-wrap:wrap;';

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

	// 每日任务按钮
	const taskBtn = document.createElement('button');
	taskBtn.className = 'ybrpg-settings-btn';
	taskBtn.id = 'btn-setting-daily-task';
	taskBtn.textContent = '每日任务';
	taskBtn.onclick = () => renderDailyTaskView(container);
	galleryRow.appendChild(taskBtn);

	// 每日签到按钮
	const signBtn = document.createElement('button');
	signBtn.className = 'ybrpg-settings-btn';
	signBtn.id = 'btn-setting-daily-sign';
	signBtn.textContent = '每日签到';
	signBtn.onclick = () => renderDailySignView(container);
	galleryRow.appendChild(signBtn);

	// 兑换码按钮
	const redeemBtn = document.createElement('button');
	redeemBtn.className = 'ybrpg-settings-btn';
	redeemBtn.id = 'btn-setting-redeem';
	redeemBtn.textContent = '兑换码';
	redeemBtn.onclick = () => renderRedeemView(container);
	galleryRow.appendChild(redeemBtn);

	// 设置按钮（AI托管 / 公式显示 等）
	const miscBtn = document.createElement('button');
	miscBtn.className = 'ybrpg-settings-btn';
	miscBtn.id = 'btn-setting-misc';
	miscBtn.textContent = '设置';
	miscBtn.onclick = () => renderMiscSettingsView(container);
	galleryRow.appendChild(miscBtn);

	groupDiv.appendChild(galleryRow);

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

// 渲染：设置（AI托管 / 公式显示 等偏好项）
function renderMiscSettingsView(container) {
	container.innerHTML = '';

	// 标题靠上，设置项在剩余区域竖向居中
	container.style.justifyContent = 'flex-start';

	const backBtn = document.createElement('button');
	backBtn.className = 'ybrpg-back-btn';
	backBtn.textContent = '← 返回';
	backBtn.onclick = () => renderSettingsView(container);
	container.appendChild(backBtn);

	const title = document.createElement('div');
	title.style.cssText = 'font-size:20px;font-weight:bold;text-align:center;margin:6px 0 24px;color:#ffd700;';
	title.textContent = '⚙ 设置';
	container.appendChild(title);

	const wrap = document.createElement('div');
	wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;width:100%;';
	container.appendChild(wrap);

	// 生成一行偏好设置：左侧描述 + 右侧开关按钮（小区块分割，两列对齐）
	function makeSettingRow(labelText, getValue, onToggle) {
		const row = document.createElement('div');
		row.className = 'ybrpg-misc-row';

		const label = document.createElement('span');
		label.className = 'ybrpg-misc-label';
		label.textContent = labelText;

		const toggle = document.createElement('button');
		toggle.className = 'ybrpg-settings-btn ybrpg-misc-toggle';
		toggle.textContent = getValue() ? '开启' : '关闭';
		toggle.onclick = () => {
			onToggle(toggle);
			toggle.textContent = getValue() ? '开启' : '关闭';
		};

		row.appendChild(label);
		row.appendChild(toggle);
		wrap.appendChild(row);
	}

	// AI托管设置
	makeSettingRow('AI战斗托管', () => window.autoBattle, () => {
		window.autoBattle = !window.autoBattle;
		Game.toast(`AI战斗托管已${window.autoBattle ? '开启' : '关闭'}`, 'info');
	});

	// 多抽按品质排序设置
	makeSettingRow('多抽按品质排序', () => window.multiSortByRank, () => {
		window.multiSortByRank = !window.multiSortByRank;
		Game.toast(`多抽按品质排序已${window.multiSortByRank ? '开启' : '关闭'}`, 'info');
	});

	// 公式显示设置
	makeSettingRow('面板显示属性公式', () => window.showFormulaDetail, () => {
		window.showFormulaDetail = !window.showFormulaDetail;
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
	});

}

// ===================== 存档导出 / 导入 =====================

// 收集当前游戏进度（与 saveToSlot 的 compatData 结构一致，但不写 localStorage）
function collectCurrentSaveData() {
	return {
		gameVersion: window.GAME_VERSION || 'v1.0',
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
		multiSortByRank: window.multiSortByRank || false,
		saveTime: new Date().toLocaleString(),
		saveName: '导出存档',
		_treasureInventory: JSON.parse(JSON.stringify(window.treasureInventory || {})),
		stamina: window.stamina,
		maxStamina: window.maxStamina,
		staminaTs: window.staminaTs,
		diamond: window.diamond,
		dailySign: window.dailySign || { lastSignDate: '', streak: 0 },
		dailyTasks: window.dailyTasks || null,
		redeemedCodes: window.redeemedCodes || [],
		recruitPity: window.recruitPity || 0,
		recruitUpCharId: window.recruitUpCharId || null,
		treasurePity: window.treasurePity || 0,
		shopPage: window.shopPage || 'home',
		playerPreferences: {
			bagTab: window.bagTab || 'char',
			showFormulaDetail: window.showFormulaDetail !== undefined ? window.showFormulaDetail : true,
			multiSortByRank: window.multiSortByRank !== undefined ? window.multiSortByRank : false
		},
		// 图鉴数据（handbook 是存档级数据，导出必须携带，否则导入后图鉴丢失）
		handbook: JSON.parse(JSON.stringify(
			(Game.Data.data && Game.Data.data.handbook)
			|| { ownedCharacters: [], viewedCharacters: [], collectionProgress: { total: 0, owned: 0 } }
		))
	};
}

// 仅导出当前存档信息为 JSON 文件下载
function exportCurrentSave() {
	// 【拦截未初始化导出】无游戏进度时拒绝导出（防止主界面/空档导出空数据）
	const prog = window.playerProgress;
	if (!prog || Object.keys(prog).length === 0) {
		Game.toast('当前没有可导出的游戏进度', 'error');
		console.warn('[存档导出] 未检测到游戏进度，已拦截导出');
		return;
	}
	const data = collectCurrentSaveData();
	const backup = {
		app: 'ybrpg',
		type: 'ybrpg-save-single',
		version: 1,
		gameVersion: window.GAME_VERSION || 'v1.0',
		exportedAt: new Date().toISOString(),
		data,
	};

	// 【优化】一行紧凑格式，避免美化缩进导致十几万行、体积膨胀
	const json = JSON.stringify(backup);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `ybrpg_save_${fmtSaveTimestamp()}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	Game.toast('已导出当前存档，请前往浏览器下载文件夹查看', 'success');
}

// localStorage 配额（Chrome/Edge 约 5MiB，按 UTF-16 code unit 计），留 5% 余量
const STORAGE_QUOTA = Math.floor(5 * 1024 * 1024 * 0.95);

// 当前 localStorage 已用字符数（UTF-16 code units）
function storageUsed() {
	let used = 0;
	for (let i = 0; i < localStorage.length; i++) {
		const k = localStorage.key(i);
		if (k) used += k.length + (localStorage.getItem(k) || '').length;
	}
	return used;
}

// 导入存档：选择文件后弹出槽位选择，写入所选栏位
function importSaveData() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json,application/json';
	input.style.display = 'none';
	input.onchange = () => {
		const file = input.files && input.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			let parsed;
			try {
				parsed = JSON.parse(reader.result);
			} catch (e) {
				console.error('[导入存档] 解析失败:', e);
				Game.toast('导入失败：文件不是有效的 JSON', 'error');
				return;
			}
			if (!parsed || typeof parsed !== 'object' || parsed.type !== 'ybrpg-save-single' || !parsed.data || typeof parsed.data !== 'object') {
				Game.toast('导入失败：不是本游戏导出的存档文件', 'error');
				return;
			}
			// 选择目标槽位（覆盖警告在弹窗内处理）
			showSaveSlotPicker('导入存档', `文件：${file.name}`, (slot) => {
				writeImportedSave(slot, parsed.data);
			});
		};
		reader.readAsText(file);
	};
	document.body.appendChild(input);
	input.click();
	document.body.removeChild(input);
}

// 槽位选择弹窗：列出自动存档 + 手动存档栏位，点击选择（已有存档的槽位会二次确认覆盖）
function showSaveSlotPicker(title, message, onPick) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog wide';
	dialog.style.cssText = 'padding:18px 20px;max-width:340px;';

	const titleEl = document.createElement('div');
	titleEl.style.cssText = 'font-size:15px;font-weight:bold;color:#ffd700;margin-bottom:6px;text-align:center;';
	titleEl.textContent = title;
	dialog.appendChild(titleEl);

	const msgEl = document.createElement('div');
	msgEl.style.cssText = 'font-size:12px;color:#aaa;margin-bottom:12px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
	msgEl.textContent = message;
	dialog.appendChild(msgEl);

	const hintEl = document.createElement('div');
	hintEl.style.cssText = 'font-size:11px;color:#e8a33d;margin-bottom:10px;text-align:center;';
	hintEl.textContent = '注意：导入会覆盖所选栏位的现有存档';
	dialog.appendChild(hintEl);

	for (let i = 0; i <= Game.Data.SLOT_COUNT; i++) {
		const raw = localStorage.getItem(`${Game.Data.STORAGE_KEY}_${i}`);
		let hasData = false;
		let info = '空栏位';
		if (raw) {
			hasData = true;
			try {
				const d = JSON.parse(raw);
				const t = d.saveTime || (d.baseInfo && d.baseInfo.saveTime) || '';
				info = t ? `已有存档（${t}）` : '已有存档';
			} catch (e) { info = '已有存档'; }
		}
		const btn = document.createElement('button');
		btn.className = 'ybrpg-confirm-btn';
		btn.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;margin:4px 0;padding:8px 12px;font-size:13px;'
			+ (hasData ? 'border-color:#e8a33d;' : '');
		const nameSpan = document.createElement('span');
		nameSpan.textContent = (hasData ? '⚠ ' : '') + (i === 0 ? '🔄 自动存档' : `存档 ${i}`);
		if (hasData) nameSpan.style.color = '#e8a33d';
		const infoSpan = document.createElement('span');
		infoSpan.style.cssText = (hasData ? 'color:#e8a33d;' : 'color:#888;') + 'font-size:12px;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
		infoSpan.textContent = info;
		btn.appendChild(nameSpan);
		btn.appendChild(infoSpan);
		btn.onclick = () => {
			const doPick = () => {
				document.body.removeChild(overlay);
				onPick(i);
			};
			if (hasData) {
				Game.confirmDialog(`槽位${i === 0 ? '（自动存档）' : ` ${i}`}已有存档，导入将覆盖它！是否继续？`, doPick, null, { title: '覆盖确认' });
			} else {
				doPick();
			}
		};
		dialog.appendChild(btn);
	}

	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'ybrpg-confirm-btn cancel';
	cancelBtn.textContent = '取消';
	cancelBtn.style.cssText = 'margin-top:10px;width:100%;';
	cancelBtn.onclick = () => document.body.removeChild(overlay);
	dialog.appendChild(cancelBtn);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

// 将导入的存档数据写入目标栏位（自动档走双通道并补 baseInfo，保证被自动存档系统识别）
function writeImportedSave(slot, data) {
	// 【修复图鉴丢失】导入文件缺失 handbook 时，用当前内存图鉴补上（避免导入后图鉴被清空）
	if (!data.handbook) {
		const curHandbook = Game.Data.data && Game.Data.data.handbook;
		if (curHandbook && ((curHandbook.ownedCharacters || []).length > 0 || (curHandbook.viewedCharacters || []).length > 0)) {
			data = Object.assign({}, data, { handbook: JSON.parse(JSON.stringify(curHandbook)) });
		}
	}
	let payloads;
	if (slot === 0) {
		// 自动存档：补 baseInfo.saveName='自动存档'，并同时写入 ybrpg_save_0 与 ybrpg_autosave
		const autoData = Object.assign({}, data, {
			baseInfo: Object.assign({}, data.baseInfo || {}, {
				saveName: '自动存档',
				saveTime: new Date().toISOString(),
			}),
		});
		const autoJson = JSON.stringify(autoData);
		payloads = [
			[`${Game.Data.STORAGE_KEY}_0`, autoJson],
			[SaveManager.AUTO_KEY, autoJson],
		];
	} else {
		payloads = [[`${Game.Data.STORAGE_KEY}_${slot}`, JSON.stringify(data)]];
	}
	// 空间预检：新写入的净增量 + 当前已用不得超过配额
	let net = 0;
	payloads.forEach(([k, v]) => {
		const existing = localStorage.getItem(k);
		net += v.length + k.length - (existing ? existing.length : 0);
	});
	if (storageUsed() + net > STORAGE_QUOTA) {
		Game.toast('存储空间不足，无法导入。可先在存档管理中删除部分存档释放空间', 'error');
		return;
	}
	try {
		payloads.forEach(([k, v]) => localStorage.setItem(k, v));
		Game.toast(slot === 0 ? '已导入存档到自动存档' : `已导入存档到存档${slot}`, 'success');
		// 刷新存档界面
		const sv = document.getElementById('save-view');
		if (sv) renderSaveView(sv, false);
		// 询问是否立即读取
		Game.confirmDialog(`已导入存档到${slot === 0 ? '自动存档' : `存档${slot}`}，是否立即读取该存档？`, () => {
			if (slot === 0) {
				SaveManager.loadAutoSave();
			} else {
				SaveManager.loadFromSlot(slot);
			}
			Game.toast(slot === 0 ? '已读取自动存档' : `已读取存档${slot}`, 'success');
			const bottomBar = document.querySelector('.ybrpg-bottom-bar');
			if (bottomBar) bottomBar.style.display = 'flex';
			hideOtherViews('team-view');
			const teamView = document.getElementById('team-view');
			if (teamView) teamView.style.display = 'flex';
		}, null, { title: '导入完成' });
	} catch (e) {
		console.error('[导入存档] 写入失败:', e);
		Game.toast('导入失败：本地存储空间不足，请删除部分存档后重试', 'error');
	}
}

// 导出文件名时间戳：YYYYMMDD_HHMMSS
function fmtSaveTimestamp() {
	const d = new Date();
	const p = n => String(n).padStart(2, '0');
	return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ===================== 兑换码系统 =====================

// 兑换码表：key 统一大写（输入不区分大小写、自动去空格）
// rewards.type 支持：gold 金币 / diamond 钻石 / stamina 体力 / item 道具 / treasure 宝物
// 维护者在此增删兑换码即可，界面自动生效
const REDEEM_CODES = {
	'YBRPG666': {
		desc: '新手见面礼',
		rewards: [
			{ type: 'gold', amount: 5000 },
			{ type: 'diamond', amount: 50 },
			{ type: 'item', id: 'item_stamina', count: 2 },
		],
	},
	'YBRPG888': {
		desc: '体力补给包',
		rewards: [
			{ type: 'stamina', amount: 100 },
			{ type: 'item', id: 'item_stamina', count: 3 },
		],
	},
	'YBWELCOME': {
		desc: '开荒助力包',
		rewards: [
			{ type: 'gold', amount: 10000 },
			{ type: 'treasure', id: 'bw_10501', count: 1 },
		],
	},
	'YBPRO': {
		desc: '开发者测试码',
		rewards: [
			{ type: 'diamond', amount: 2000000 },
			{ type: 'gold', amount: 200000000 },
		],
	},
};

// 发放兑换码奖励（支持：gold / diamond / stamina / item / treasure）
function applyRedeemRewards(rewards) {
	rewards.forEach(r => {
		switch (r.type) {
			case 'gold':
				window.gameGold = (window.gameGold || 0) + (r.amount || 0);
				break;
			case 'diamond':
				window.diamond = (window.diamond || 0) + (r.amount || 0);
				break;
			case 'stamina': {
				const max = window.maxStamina || STAMINA_MAX;
				window.stamina = Math.min((window.stamina || 0) + (r.amount || 0), max);
				break;
			}
			case 'item':
				if (Game.Data && typeof Game.Data.addItem === 'function') Game.Data.addItem(r.id, r.count || 1);
				break;
			case 'treasure':
				if (Game.Data && typeof Game.Data.addTreasure === 'function') Game.Data.addTreasure(r.id, r.count || 1);
				break;
		}
	});
	updateResourceHUD();
	if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) SaveManager.autoSave();
}

// 兑换码奖励文案（用于成功提示）
function redeemRewardNames(rewards) {
	return rewards.map(r => {
		switch (r.type) {
			case 'gold': return `💰 ${(r.amount || 0).toLocaleString()} 金币`;
			case 'diamond': return `💎 ${r.amount || 0} 钻石`;
			case 'stamina': return `⚡ ${r.amount || 0} 体力`;
			case 'item': {
				const d = Game.Bag && Game.Bag.defs && Game.Bag.defs()[r.id];
				return `${(d && d.name) || r.id}×${r.count || 1}`;
			}
			case 'treasure': {
				const d = Game.Bag && Game.Bag.defs && Game.Bag.defs()[r.id];
				return `【${(d && d.name) || r.id}】×${r.count || 1}`;
			}
			default: return r.type;
		}
	}).join('、');
}

// 渲染：已兑换记录
function renderRedeemHistory(listBox) {
	listBox.innerHTML = '';
	const codes = window.redeemedCodes || [];
	if (codes.length === 0) {
		const empty = document.createElement('div');
		empty.style.cssText = 'font-size:13px;color:#666;text-align:center;padding:16px;';
		empty.textContent = '暂无已兑换记录';
		listBox.appendChild(empty);
		return;
	}
	const hd = document.createElement('div');
	hd.style.cssText = 'font-size:13px;color:#ffd700;text-align:center;margin-bottom:4px;';
	hd.textContent = '已兑换记录';
	listBox.appendChild(hd);
	codes.forEach(code => {
		const def = REDEEM_CODES[code];
		const row = document.createElement('div');
		row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#222;border:1px solid #444;border-radius:5px;padding:6px 10px;font-size:13px;';
		row.innerHTML = `<span style="color:#ffd700;">${code}</span><span style="color:#aaa;">${(def && def.desc) || '已兑换'}</span>`;
		listBox.appendChild(row);
	});
}

// 执行兑换校验与发放
function doRedeem(input, statusEl, listBox) {
	const code = (input.value || '').trim().replace(/\s+/g, '').toUpperCase();
	if (!code) { statusEl.textContent = '请输入兑换码'; statusEl.style.color = '#ffaa44'; return; }
	const def = REDEEM_CODES[code];
	if (!def) { statusEl.textContent = '兑换码无效'; statusEl.style.color = '#ff6666'; return; }
	if (!window.redeemedCodes) window.redeemedCodes = [];
	if (window.redeemedCodes.includes(code)) { statusEl.textContent = '该兑换码已兑换过'; statusEl.style.color = '#ffaa44'; return; }

	window.redeemedCodes.push(code);
	applyRedeemRewards(def.rewards);
	statusEl.textContent = `兑换成功！获得：${redeemRewardNames(def.rewards)}`;
	statusEl.style.color = '#66ff66';
	input.value = '';
	renderRedeemHistory(listBox);
	Game.toast(`兑换码【${code}】兑换成功`, 'success');
}

// 渲染：兑换码
function renderRedeemView(container) {
	container.innerHTML = '';

	const backBtn = document.createElement('button');
	backBtn.className = 'ybrpg-back-btn';
	backBtn.textContent = '← 返回';
	backBtn.onclick = () => renderSettingsView(container);
	container.appendChild(backBtn);

	const title = document.createElement('div');
	title.style.cssText = 'font-size:20px;font-weight:bold;text-align:center;margin:15px 0;color:#ffd700;';
	title.textContent = '🎁 兑换码';
	container.appendChild(title);

	// 输入行
	const inputRow = document.createElement('div');
	inputRow.style.cssText = 'display:flex;gap:10px;justify-content:center;align-items:center;margin:10px auto;max-width:420px;';

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = '请输入兑换码';
	input.style.cssText = 'flex:1;padding:8px 12px;font-size:14px;background:#222;color:#fff;border:1px solid #555;border-radius:5px;outline:none;';
	input.onkeydown = (e) => { if (e.key === 'Enter') doRedeem(input, statusEl, listBox); };
	inputRow.appendChild(input);

	const redeemBtn = document.createElement('button');
	redeemBtn.className = 'ybrpg-settings-btn';
	redeemBtn.textContent = '兑换';
	redeemBtn.style.cssText = 'width:auto;height:auto;padding:8px 24px;font-size:14px;background:#d32f2f;color:#fff;border-radius:5px;';
	redeemBtn.onclick = () => doRedeem(input, statusEl, listBox);
	inputRow.appendChild(redeemBtn);

	container.appendChild(inputRow);

	// 状态行
	const statusEl = document.createElement('div');
	statusEl.style.cssText = 'font-size:13px;color:#888;text-align:center;min-height:18px;margin:4px 0;';
	container.appendChild(statusEl);

	// 已兑换记录
	const listBox = document.createElement('div');
	listBox.style.cssText = 'width:100%;max-width:420px;margin:10px auto;display:flex;flex-direction:column;gap:6px;';
	renderRedeemHistory(listBox);
	container.appendChild(listBox);

	// 说明
	const tip = document.createElement('div');
	tip.style.cssText = 'font-size:12px;color:#666;text-align:center;margin-top:12px;line-height:1.8;';
	tip.innerHTML = '兑换码不区分大小写，每个码仅可兑换一次。<br>维护者可查看代码内 REDEEM_CODES 常量增删兑换码。';
	container.appendChild(tip);
}

// ===================== 每日签到 & 每日任务 =====================

// 本地日期字符串 YYYY-MM-DD（用于每日刷新判断）
function getTodayStr() {
	const d = new Date();
	const p = (n) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// 每日任务定义（hook 用于游戏内行为累加进度）
const DAILY_TASK_DEFS = [
	{ id: 'login', name: '每日登录', target: 1, reward: 100, hook: 'login' },
	{ id: 'buy', name: '在商店购买 1 次', target: 1, reward: 150, hook: 'buy' },
	{ id: 'recruit', name: '招募 1 次（单抽/十连皆可）', target: 1, reward: 150, hook: 'recruit' },
	{ id: 'clear_normal_5', name: '主线普通打 5 次', target: 5, reward: 120, hook: 'clear_normal' },
	{ id: 'clear_normal_30', name: '主线普通打 30 次', target: 30, reward: 400, hook: 'clear_normal' },
	{ id: 'clear_nightmare_1', name: '主线噩梦打 1 次', target: 1, reward: 150, hook: 'clear_nightmare' },
	{ id: 'clear_nightmare_5', name: '主线噩梦打 5 次', target: 5, reward: 400, hook: 'clear_nightmare' },
	{ id: 'clear_nightmare_30', name: '主线噩梦打 30 次', target: 30, reward: 1200, hook: 'clear_nightmare' },
	{ id: 'clear_hell_1', name: '主线地狱打 1 次', target: 1, reward: 300, hook: 'clear_hell' },
	{ id: 'clear_hell_5', name: '主线地狱打 5 次', target: 5, reward: 800, hook: 'clear_hell' },
	{ id: 'clear_hell_30', name: '主线地狱打 30 次', target: 30, reward: 2400, hook: 'clear_hell' },
	{ id: 'clear_secret_1', name: '秘境打 1 次', target: 1, reward: 150, hook: 'clear_secret' },
	{ id: 'clear_secret_3', name: '秘境打 3 次', target: 3, reward: 400, hook: 'clear_secret' },
];

// 根据章节与难度，记录对应难度的主线/秘境通关进度
function recordDailyClear(chapterKey, diffKey) {
	// 秘境：chapterKey 以 sp 开头
	if (/^sp/i.test(chapterKey || '')) {
		addDailyTaskProgress('clear_secret', 1);
		return;
	}
	// 主线：按当前难度区分普通/噩梦/地狱
	const hookMap = { normal: 'clear_normal', nightmare: 'clear_nightmare', hell: 'clear_hell' };
	const hook = hookMap[diffKey] || 'clear_normal';
	addDailyTaskProgress(hook, 1);
}

// 7 天签到奖励表（第 7 天为大奖）
const DAILY_SIGN_REWARDS = [100, 100, 150, 150, 200, 200, 500];

// 确保每日数据已按"今天"初始化/刷新
function ensureDailyData() {
	const today = getTodayStr();
	if (!window.dailyTasks || window.dailyTasks.date !== today) {
		window.dailyTasks = {
			date: today,
			tasks: DAILY_TASK_DEFS.map(d => ({
				id: d.id, name: d.name, target: d.target, reward: d.reward,
				progress: 0, claimed: false,
			})),
		};
		// 登录任务直接进入即完成
		addDailyTaskProgress('login', 1);
	} else {
		// 同一天但任务定义有变动（如奖励×10、新增任务）：按 id 同步，保留进度与领取状态
		window.dailyTasks.tasks = DAILY_TASK_DEFS.map(d => {
			const old = window.dailyTasks.tasks.find(x => x.id === d.id);
			return {
				id: d.id, name: d.name, target: d.target, reward: d.reward,
				progress: old ? old.progress : 0,
				claimed: old ? old.claimed : false,
			};
		});
	}
	if (!window.dailySign) {
		window.dailySign = { lastSignDate: '', streak: 0 };
	}
}

// 任务进度累加（游戏行为钩子）
function addDailyTaskProgress(hook, n = 1) {
	ensureDailyData();
	const t = window.dailyTasks.tasks.find(x => {
		const def = DAILY_TASK_DEFS.find(d => d.id === x.id);
		return def && def.hook === hook;
	});
	if (t && !t.claimed) {
		t.progress = Math.min(t.target, t.progress + n);
	}
}

// 领取任务奖励
function claimDailyTask(taskId) {
	const t = window.dailyTasks.tasks.find(x => x.id === taskId);
	if (!t || t.claimed || t.progress < t.target) return false;
	const goldReward = t.reward * 10;
	window.diamond = (window.diamond || 0) + t.reward;
	window.gameGold = (window.gameGold || 0) + goldReward;
	t.claimed = true;
	updateResourceHUD();
	if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) SaveManager.autoSave();
	Game.toast(`任务完成！获得 ${t.reward} 💎 + ${goldReward} 💰`, 'success');
	return true;
}

// 执行签到
function doDailySign() {
	ensureDailyData();
	const today = getTodayStr();
	if (window.dailySign.lastSignDate === today) {
		Game.toast('今天已经签到过了', 'warning');
		return false;
	}
	// 连续签到判断：昨天签过则 +1，否则重新从 1 开始
	const yesterday = new Date(Date.now() - 86400000);
	const yp = (nn) => String(nn).padStart(2, '0');
	const yStr = `${yesterday.getFullYear()}-${yp(yesterday.getMonth() + 1)}-${yp(yesterday.getDate())}`;
	if (window.dailySign.lastSignDate !== yStr) {
		window.dailySign.streak = 0;
	}
	window.dailySign.streak = (window.dailySign.streak || 0) + 1;
	const idx = (window.dailySign.streak - 1) % DAILY_SIGN_REWARDS.length;
	const reward = DAILY_SIGN_REWARDS[idx];
	const goldReward = reward * 10;
	window.diamond = (window.diamond || 0) + reward;
	window.gameGold = (window.gameGold || 0) + goldReward;
	window.dailySign.lastSignDate = today;
	updateResourceHUD();
	if (typeof SaveManager !== 'undefined' && SaveManager.autoSave) SaveManager.autoSave();
	Game.toast(`签到成功！获得 ${reward} 💎 + ${goldReward} 💰`, 'success');
	return true;
}

// 渲染：每日签到
function renderDailySignView(container) {
	ensureDailyData();
	container.innerHTML = '';

	const backBtn = document.createElement('button');
	backBtn.className = 'ybrpg-back-btn';
	backBtn.textContent = '← 返回';
	backBtn.onclick = () => renderSettingsView(container);
	container.appendChild(backBtn);

	const title = document.createElement('div');
	title.style.cssText = 'font-size:20px;font-weight:bold;text-align:center;margin:15px 0;color:#ffd700;';
	title.textContent = '📅 每日签到';
	container.appendChild(title);

	const today = getTodayStr();
	const signed = window.dailySign.lastSignDate === today;

	const grid = document.createElement('div');
	grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px;';
	DAILY_SIGN_REWARDS.forEach((rw, i) => {
		const day = i + 1;
		const cell = document.createElement('div');
		cell.style.cssText = `
			border:1px solid #555;border-radius:8px;padding:12px 6px;text-align:center;
			background:${signed && ((window.dailySign.streak - 1) % DAILY_SIGN_REWARDS.length) === i ? 'rgba(255,215,0,0.2)' : '#222'};
		`;
		cell.innerHTML = `<div style="color:#aaa;font-size:12px;">第${day}天</div>
			<div style="font-size:18px;margin:6px 0;">💎</div>
			<div style="color:#ffd700;font-weight:bold;">${rw}</div>
			<div style="color:#ffcf66;font-size:12px;margin-top:2px;">+${rw * 10}💰</div>`;
		grid.appendChild(cell);
	});
	container.appendChild(grid);

	const signBtn = document.createElement('button');
	signBtn.className = 'ybrpg-settings-btn';
	signBtn.style.cssText = 'display:block;margin:20px auto 0;width:80%;';
	signBtn.textContent = signed ? '今日已签到 ✓' : '签到领钻';
	signBtn.disabled = signed;
	if (signed) { signBtn.style.opacity = '0.5'; signBtn.style.cursor = 'not-allowed'; }
	signBtn.onclick = () => {
		if (doDailySign()) renderDailySignView(container);
	};
	container.appendChild(signBtn);

	const tip = document.createElement('div');
	tip.style.cssText = 'color:#888;font-size:12px;text-align:center;margin-top:12px;';
	tip.textContent = `当前连续签到：${window.dailySign.streak || 0} 天`;
	container.appendChild(tip);
}

// 渲染：每日任务
function renderDailyTaskView(container) {
	ensureDailyData();
	container.innerHTML = '';

	// 使用内部包裹容器承载内容，避免污染共享的 #settings-view 布局（离开后仍居中）
	const wrap = document.createElement('div');
	wrap.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%;align-self:stretch;overflow:hidden;padding:10px 2px;box-sizing:border-box;';
	container.appendChild(wrap);

	const backBtn = document.createElement('button');
	backBtn.className = 'ybrpg-back-btn';
	backBtn.textContent = '← 返回';
	backBtn.onclick = () => renderSettingsView(container);
	wrap.appendChild(backBtn);

	const title = document.createElement('div');
	title.style.cssText = 'font-size:20px;font-weight:bold;text-align:center;margin:15px 0;color:#44aaff;';
	title.textContent = '📋 每日任务';
	wrap.appendChild(title);

	// 任务列表放入可滚动容器，避免任务过多把顶部顶飞
	const list = document.createElement('div');
	list.style.cssText = 'flex:1;min-height:0;overflow-y:auto;padding-right:4px;';
	wrap.appendChild(list);

	// 按状态优先级排序：待领取(0) > 未完成(1) > 已领取(2)，每次渲染都重排
	const statusRank = (t) => {
		if (t.claimed) return 2;
		if (t.progress >= t.target) return 0;
		return 1;
	};
	const sortedTasks = window.dailyTasks.tasks.slice().sort((a, b) => statusRank(a) - statusRank(b));

	sortedTasks.forEach(t => {
		const done = t.progress >= t.target;
		// 三种状态用明显不同的颜色区分
		let rowBg, rowBorder, btnBg, btnColor, btnText, btnDisabled = false, btnOpacity = '1', btnCursor = 'pointer';
		if (t.claimed) {
			// 已领取：暗淡灰绿，表示结束
			rowBg = '#1c2620'; rowBorder = '#3a5a48';
			btnBg = '#4a5a52'; btnColor = '#cfe9d8'; btnText = '已领取';
			btnDisabled = true; btnOpacity = '0.7';
		} else if (done) {
			// 已完成待领取：高亮绿色，醒目
			rowBg = '#14331f'; rowBorder = '#2ecc71';
			btnBg = '#2ecc71'; btnColor = '#06281a'; btnText = '领取';
		} else {
			// 未完成：中性灰蓝
			rowBg = '#222'; rowBorder = '#555';
			btnBg = '#3a3f47'; btnColor = '#9aa3ad'; btnText = '未完成';
			btnDisabled = true; btnOpacity = '0.85'; btnCursor = 'not-allowed';
		}

		const row = document.createElement('div');
		row.style.cssText = `display:flex;align-items:center;gap:10px;padding:12px;margin:8px 0;border:1px solid ${rowBorder};border-radius:8px;background:${rowBg};`;

		const info = document.createElement('div');
		info.style.cssText = 'flex:1;';
		info.innerHTML = `<div style="font-size:14px;color:#eee;">${t.name}</div>
			<div style="font-size:12px;color:#aaa;">进度 ${Math.min(t.progress, t.target)}/${t.target}　奖励 💎 ${t.reward} + 💰${t.reward * 10}</div>`;
		row.appendChild(info);

		const btn = document.createElement('button');
		btn.className = 'ybrpg-settings-btn';
		btn.style.cssText = `min-width:72px;background:${btnBg};color:${btnColor};opacity:${btnOpacity};cursor:${btnCursor};font-weight:bold;`;
		btn.textContent = btnText;
		btn.disabled = btnDisabled;
		if (!btnDisabled && btnText === '领取') {
			btn.onclick = () => {
				if (claimDailyTask(t.id)) renderDailyTaskView(container);
			};
		}
		row.appendChild(btn);
		list.appendChild(row);
	});
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
	const ownedChars = (Game.Data.data.handbook && Game.Data.data.handbook.ownedCharacters) || [];

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
	const p = normalizePrice(price);
	const goldVal = p.gold || (p.diamond || 0) * 1000;
	if (goldVal >= 350) return { label: '珍稀', color: '#ff8d8d' };
	if (goldVal >= 250) return { label: '上品', color: '#44aaff' };
	if (goldVal >= 180) return { label: '良品', color: '#88cc88' };
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
			const rankInfo = getTreasureRankInfo(t.price || { gold: 0 });
			const EQUIP_RANK_BORDER_COLORS = {
				1: '#88cc88', 2: '#44aaff', 3: '#a335ee',
				4: '#ff8800', 5: '#ff8d8d', 6: '#ffff00'
			};
			const galleryEquipRank = t.rank || 1;
			const galleryBorderColor = EQUIP_RANK_BORDER_COLORS[galleryEquipRank] || '#888';

			const card = document.createElement('div');
			card.className = 'gallery-char-card';
			card.style.cursor = 'pointer';

			// 宝物图标
			const iconDiv = document.createElement('div');
			iconDiv.className = 'gallery-char-icon';
			iconDiv.style.borderColor = isOwned ? galleryBorderColor : '#555';

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
			if (isOwned) nameDiv.style.color = galleryBorderColor;
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
		priceRow.innerHTML = `<span class="attr-label">售价</span><span class="attr-value" style="color:#ffcc00">${formatPrice(tDef.price || { gold: 0 })}</span>`;
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

// ===== 以下来自原 mode.js 9592-10006 行 =====

const STAMINA_MAX = 400;          // 体力上限
const STAMINA_REGEN_PER_MIN = 1;  // 每分钟恢复体力
const STAMINA_COST_DEFAULT = 5;   // 关卡默认体力消耗（可在 event.staminaCost 覆盖）
const DIAMOND_TO_GOLD = 10000;    // 钻石兑金币比例（单向，金币不可回兑）

// ---------- 体力 ----------

// 按时间戳自然恢复体力（每分钟 1 点，离线也累计）
// 注意：体力允许超出上限（如使用体力瓶），超出部分不参与自然恢复，仅保留存量；
// 仅当体力低于上限时才自然补充，且不超过上限。
function regenStamina() {
  if (!window.staminaTs) window.staminaTs = Date.now();
  const now = Date.now();
  const elapsedMin = Math.floor((now - window.staminaTs) / 60000);
  if (elapsedMin > 0) {
    const max = window.maxStamina || STAMINA_MAX;
    if ((window.stamina || 0) >= max) {
      // 已满或超出上限：不自然恢复，仅推进时间戳，保留超出存量
      window.staminaTs = now - ((now - window.staminaTs) % 60000);
    } else {
      window.stamina = Math.min(max, (window.stamina || 0) + elapsedMin);
      window.staminaTs = now - ((now - window.staminaTs) % 60000);
    }
  }
}

// 读取关卡体力消耗（写入关卡数据 event.staminaCost；缺省 5，特殊/未来关卡可单独设值）
function getStaminaCost(event) {
  return (event && event.staminaCost != null) ? Number(event.staminaCost) : STAMINA_COST_DEFAULT;
}

// [上云预留接口] 挑战前体力校验 + 扣减；成功返回 true，不足返回 false
function trySpendStamina(cost) {
  regenStamina();
  cost = Number(cost) || STAMINA_COST_DEFAULT;
  if ((window.stamina || 0) < cost) return false;
  window.stamina -= cost;
  updateResourceHUD();
  return true;
}

// ---------- 每日首通武将限制（按关卡·每天）----------

// ---------- 钻石 ----------

// [上云预留接口] 钻石单向兑换金币（1💎 = 10000💰，金币不可回兑）
function exchangeDiamondToGold(amount) {
  amount = Math.floor(Number(amount));
  if (!amount || amount <= 0) { Game.toast('请输入有效的钻石数量', 'error'); return; }
  if ((window.diamond || 0) < amount) { Game.toast('钻石不足！', 'error'); return; }
  window.diamond -= amount;
  const gain = amount * DIAMOND_TO_GOLD;
  window.gameGold = (window.gameGold || 0) + gain;
  Game.toast(`兑换成功：${amount} 💎 → ${gain.toLocaleString()} 💰`, 'success');
  updateResourceHUD();
  if (window.SaveManager) SaveManager.autoSave();
}

// ---------- 常驻资源条（金币 / 体力 / 钻石）----------
// 钻石仍常驻显示，但不提供"兑换"入口（兑换逻辑保留，后续可另置入口）。

// 是否已领取开发者测试码（YBPRO）
function isDeveloperRedeemed() {
	return Array.isArray(window.redeemedCodes) && window.redeemedCodes.includes('YBPRO');
}

function ensureResourceHUD() {
  if (document.getElementById('ybrpg-res-hud')) { updateResourceHUD(); return; }
  const bar = document.createElement('div');
  bar.id = 'ybrpg-res-hud';
  bar.className = 'ybrpg-res-hud';
  bar.innerHTML =
    (isDeveloperRedeemed() ? `<span class="res-item ybrpg-dev-badge">开发者</span>` : '') +
    `<span class="res-item">💰 <span id="ybrpg-res-gold">0</span> 金币</span>` +
    `<span class="res-item">⚡ <span id="ybrpg-res-stamina">0/0</span> 体力</span>` +
    `<span class="res-item">💎 <span id="ybrpg-res-diamond">0</span> 钻石</span>`;
  document.body.appendChild(bar);
  if (!window._staminaTimerStarted) {
    window._staminaTimerStarted = true;
    setInterval(() => { regenStamina(); updateResourceHUD(); }, 30000);
  }
  updateResourceHUD();
}

// 四位一组数字格式化（符合中文阅读习惯）：123456789 -> 1,2345,6789
function fmtGroup4(n) {
	return String(Math.floor(n)).replace(/\B(?=(\d{4})+(?!\d))/g, ',');
}

// 大数缩写：>= 10 亿显示 x.x亿；>= 10 万显示 x.x万；其余显示完整数值
function fmtBigNum(n) {
  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + '亿';
  }
  if (n >= 100000) {
    return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  }
  return n.toLocaleString();
}

function updateResourceHUD() {
  regenStamina();
  const hud = document.getElementById('ybrpg-res-hud');
  const goldEl = document.getElementById('ybrpg-res-gold');
  const stamEl = document.getElementById('ybrpg-res-stamina');
  const diaEl = document.getElementById('ybrpg-res-diamond');
  // 同步开发者徽标（兑换 YBPRO 后实时出现，未兑换则移除）
  if (hud) {
    let badge = document.getElementById('ybrpg-dev-badge');
    const isDev = isDeveloperRedeemed();
    if (isDev && !badge) {
      badge = document.createElement('span');
      badge.id = 'ybrpg-dev-badge';
      badge.className = 'res-item ybrpg-dev-badge';
      badge.textContent = '开发者';
      hud.insertBefore(badge, hud.firstChild);
    } else if (!isDev && badge) {
      badge.remove();
    }
  }
  if (goldEl) goldEl.textContent = fmtBigNum(window.gameGold || 0);
  if (stamEl) stamEl.textContent = `${window.stamina || 0}/${window.maxStamina || STAMINA_MAX}`;
  if (diaEl) diaEl.textContent = fmtBigNum(window.diamond || 0);
}

// 钻石兑换弹窗
function openDiamondExchange() {
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay';
  const panel = document.createElement('div');
  panel.className = 'preview-panel';
  panel.innerHTML =
    `<div class="reward-title">💎 钻石兑换金币</div>` +
    `<div class="reward-sub">1 💎 = ${DIAMOND_TO_GOLD.toLocaleString()} 💰（单向兑换，金币不可回兑）</div>` +
    `<div class="reward-sub">当前持有：${(window.diamond || 0).toLocaleString()} 💎</div>` +
    `<input id="ybrpg-diamond-input" class="ybrpg-input" type="number" min="1" placeholder="输入兑换钻石数量" />`;
  const row = document.createElement('div');
  row.className = 'preview-btn-row';
  const ok = document.createElement('button');
  ok.className = 'reward-ok-btn';
  ok.textContent = '确认兑换';
  ok.onclick = (e) => {
    e.stopPropagation();
    const v = document.getElementById('ybrpg-diamond-input').value;
    exchangeDiamondToGold(v);
    overlay.remove();
  };
  const cancel = document.createElement('button');
  cancel.className = 'reward-ok-btn';
  cancel.textContent = '取消';
  cancel.onclick = (e) => { e.stopPropagation(); overlay.remove(); };
  row.appendChild(ok);
  row.appendChild(cancel);
  panel.appendChild(row);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

/**
 * 展示关卡产出预览（复用奖励面板样式，仅预览不发放）
 * opts: { canChallenge, canSweep, onChallenge }
 */
function showOutputPreview(event, diffKey, index, eventId, chapterKey, opts) {
	opts = opts || {};
	if (!event) return;
	const isSP = /^sp/i.test(chapterKey || '');
	// 预览数据
	let plan = buildRewardPlan(event, diffKey, index) || { gold: 0, chars: [], treasures: [], items: [] };
	plan = Object.assign({}, plan, { gold: computeLevelGold(event, diffKey, chapterKey) });
	if (isSP) {
		// 秘境实际仅产出金币
		plan.chars = []; plan.treasures = []; plan.items = [];
	}

	const chip = (o) => {
		const cnt = o.count > 1 ? `<span class="reward-cnt"> ×${o.count}</span>` : '';
		const icon = o.icon ? `<img src="${o.icon}" class="reward-chip-icon" alt="">` : '';
		const style = o.rank ? ` style="border-color:${getRankColor(o.rank)}"` : '';
		return `<span class="reward-chip"${style}>${icon}${o.name}${cnt}</span>`;
	};
	const section = (title, list) => {
		let h = `<div class="reward-section-title">${title}（${list.length}）</div>`;
		if (list.length) {
			h += '<div class="reward-list">' + list.map(chip).join('') + '</div>';
		} else {
			h += '<div class="reward-empty">无（按品质随机掉落）</div>';
		}
		return h;
	};

	const diffName = DIFFICULTY_SCALE[diffKey]?.name || diffKey;

	const cost = getStaminaCost(event);
	const staminaOk = (window.stamina || 0) >= cost;

	// 秘境首通奖励文案（与战斗结算 onWin 逻辑保持一致）
	let secretText = '';
	if (isSP) {
		if (chapterKey === 'spEvent1') {
			const m = String(eventId).match(/sp1-(\d+)/);
			const lv = m ? parseInt(m[1]) : 1;
			secretText = `首次通过可令主角突破至 ${lv} 阶`;
		} else if (chapterKey === 'spEvent2') {
			const rankMap = {
				'sp2-1': 'common', 'sp2-2': 'rare', 'sp2-3': 'epicfake',
				'sp2-4': 'epic', 'sp2-5': 'legend', 'sp2-6': 'kami',
			};
			const r = rankMap[eventId];
			if (r) secretText = `首次通过可令主角提升至「${getRankLabel(r)}」品质`;
		}
	}

	const overlay = document.createElement('div');
	overlay.className = 'preview-overlay';
	const panel = document.createElement('div');
	panel.className = 'preview-panel';
	panel.innerHTML =
		`<div class="reward-title">📦 产出预览</div>` +
		`<div class="reward-sub">${diffName}难度 · ${event.name || eventId}</div>` +
		`<div class="reward-gold">💰 ${plan.gold || 0} <small>金币</small></div>` +
		`<div class="reward-stamina${staminaOk ? '' : ' insufficient'}">⚡ 消耗 ${cost} 体力（当前 ${window.stamina || 0}/${window.maxStamina || STAMINA_MAX}）</div>` +
		(isSP && secretText ? `<div class="preview-secret-note">★ ${secretText}</div>` : '') +
		section('获得武将', plan.chars) +
		section('获得宝物', plan.treasures) +
		section('获得道具', plan.items) +
		(isSP ? `<div class="reward-empty" style="margin-top:10px;">（秘境仅产出金币）</div>` : '');

	const close = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	overlay.onclick = (e) => { if (e.target === overlay) close(); };

	// 按钮区：挑战 / 扫荡
	const btnRow = document.createElement('div');
	btnRow.className = 'preview-btn-row';

	const challengeBtn = document.createElement('button');
	challengeBtn.className = 'reward-ok-btn preview-btn-challenge';
	challengeBtn.textContent = '挑战';
	if (!opts.canChallenge || !staminaOk) {
		challengeBtn.disabled = true;
		challengeBtn.style.opacity = '0.5';
		challengeBtn.style.cursor = 'not-allowed';
		challengeBtn.title = !opts.canChallenge ? '关卡未解锁' : '体力不足';
	} else {
		challengeBtn.onclick = (e) => {
			e.stopPropagation();
			close();
			if (typeof opts.onChallenge === 'function') opts.onChallenge();
		};
	}

	const sweepBtn = document.createElement('button');
	sweepBtn.className = 'reward-ok-btn preview-btn-sweep';
	sweepBtn.textContent = '扫荡';
	if (!opts.canSweep || !staminaOk) {
		sweepBtn.disabled = true;
		sweepBtn.style.opacity = '0.5';
		sweepBtn.style.cursor = 'not-allowed';
		sweepBtn.title = !opts.canSweep ? '仅已通关关卡可扫荡' : '体力不足';
	} else {
		sweepBtn.onclick = (e) => {
			e.stopPropagation();
			close();
			doSweep(event, diffKey, index, eventId, chapterKey, () => {
				showOutputPreview(event, diffKey, index, eventId, chapterKey, opts);
			});
		};
	}

	const sweep5Btn = document.createElement('button');
	sweep5Btn.className = 'reward-ok-btn preview-btn-sweep';
	sweep5Btn.textContent = '扫荡5次';
	if (!opts.canSweep || !staminaOk) {
		sweep5Btn.disabled = true;
		sweep5Btn.style.opacity = '0.5';
		sweep5Btn.style.cursor = 'not-allowed';
		sweep5Btn.title = !opts.canSweep ? '仅已通关关卡可扫荡' : '体力不足';
	} else {
		sweep5Btn.onclick = (e) => {
			e.stopPropagation();
			close();
			doSweep(event, diffKey, index, eventId, chapterKey, () => {
				showOutputPreview(event, diffKey, index, eventId, chapterKey, opts);
			}, 5);
		};
	}

	btnRow.appendChild(challengeBtn);
	btnRow.appendChild(sweepBtn);
	btnRow.appendChild(sweep5Btn);
	panel.appendChild(btnRow);
	overlay.appendChild(panel);
	document.body.appendChild(overlay);
}

/**
 * 通关奖励展示面板（新版，当前停用，保留备用）
 * @param {Object} opt
 * @param {string} opt.title   主标题
 * @param {string} opt.sub     副标题（如 难度·关卡名）
 * @param {number} opt.gold    获得的金币
 * @param {string[]} opt.chars     武将名称数组（可含重复，按难度倍率）
 * @param {string[]} opt.treasures 宝物基础ID数组
 * @param {string[]} opt.items     道具ID数组
 */
function showRewardPanel(opt) {
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
		const cnt = o.count > 1 ? `<span class="reward-cnt"> ×${o.count}</span>` : '';
		const icon = o.icon
			? `<img src="${o.icon}" class="reward-chip-icon" alt="" onerror="this.style.display='none'">`
			: '';
		const style = o.rank ? ` style="border-color:${getRankColor(o.rank)}"` : '';
		return `<span class="reward-chip"${style}>${icon}${o.name}${cnt}</span>`;
	};
	const section = (title, list) => {
		let h = `<div class="reward-section-title">${title}（${list.length}）</div>`;
		if (list.length) {
			h += '<div class="reward-list">' + list.map(chip).join('') + '</div>';
		} else {
			h += '<div class="reward-empty">无</div>';
		}
		return h;
	};

	const overlay = document.createElement('div');
	overlay.className = 'reward-overlay';
	const panel = document.createElement('div');
	panel.className = 'reward-panel';
	panel.innerHTML =
		`<div class="reward-title">🎉 ${opt.title || '通关成功'}</div>` +
		(opt.sub ? `<div class="reward-sub">${opt.sub}</div>` : '') +
		`<div class="reward-gold">💰 ${opt.gold || 0} <small>金币</small></div>` +
		section('获得武将', charList) +
		section('获得宝物', treaList) +
		section('获得道具', itemList);

	const okBtn = document.createElement('button');
	okBtn.className = 'reward-ok-btn';
	okBtn.textContent = '确定';
	const close = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	okBtn.onclick = close;
	overlay.onclick = (e) => { if (e.target === overlay) close(); };
	panel.appendChild(okBtn);
	overlay.appendChild(panel);
	document.body.appendChild(overlay);
}

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
	syncResourceHUDViewMode(currentViewId);
}

// 资源条视图模式：阵容界面（含总战力）只保留开发者徽标，隐藏金币/体力/钻石，避免遮挡
function syncResourceHUDViewMode(currentViewId) {
	const hud = document.getElementById('ybrpg-res-hud');
	if (!hud) return;
	const compact = currentViewId === 'team-view';
	hud.querySelectorAll('.res-item').forEach(el => {
		if (el.classList.contains('ybrpg-dev-badge')) return; // 开发者徽标始终显示
		el.style.display = compact ? 'none' : '';
	});
}


// 初始化事件监听

// ===== 以下来自原 mode.js 10107-11211 行 =====

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
	window.showFormulaDetail = false; // 属性面板显示公式，默认关闭
	window.multiSortByRank = false; // 多抽出货按品质降序排列，默认关闭

	// ===== 经济 / 限制系统初始状态 =====
	window.stamina = STAMINA_MAX;
	window.maxStamina = STAMINA_MAX;
	window.staminaTs = Date.now();
	window.diamond = 0;
	ensureResourceHUD();

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
	window.shopPage = 'home';
	window.recruitPity = 0;
	window.recruitUpCharId = null;
	window.treasurePity = 0;

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
						saveTime: data.baseInfo?.saveTime || data.saveTime || null,
						saveName: data.baseInfo?.saveName || data.saveName || `存档${i}`,
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
		Game.Data.data.baseInfo.version = window.GAME_VERSION || 'v1.0';
		Game.Data.data.playerPreferences.showFormulaDetail = window.showFormulaDetail !== undefined ? window.showFormulaDetail : true;
		Game.Data.data.playerPreferences.multiSortByRank = window.multiSortByRank !== undefined ? window.multiSortByRank : false;
		// 【修复存储超限】不再调用 Game.Data.save(slot) 写完整结构（会被下方 compatData 同 key 覆盖，
		// 纯浪费且完整结构体积大，是 QuotaExceededError 的主要来源），直接写 compatData

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
			multiSortByRank: window.multiSortByRank || false,
			saveTime: new Date().toLocaleString(),
		saveName: `存档${slot}`,
		_treasureInventory: JSON.parse(JSON.stringify(window.treasureInventory || {})),
		stamina: window.stamina,
		maxStamina: window.maxStamina,
		staminaTs: window.staminaTs,
		diamond: window.diamond,
		dailySign: window.dailySign || { lastSignDate: '', streak: 0 },
		dailyTasks: window.dailyTasks || null,
		redeemedCodes: window.redeemedCodes || [],
			recruitPity: window.recruitPity || 0,
			recruitUpCharId: window.recruitUpCharId || null,
			treasurePity: window.treasurePity || 0,
			shopPage: window.shopPage || 'home',
			playerPreferences: {  // 【新增】
				bagTab: window.bagTab || 'char',
				showFormulaDetail: window.showFormulaDetail !== undefined ? window.showFormulaDetail : true,
				multiSortByRank: window.multiSortByRank !== undefined ? window.multiSortByRank : false
			},
			// 【修复图鉴丢失】compatData 会覆盖 Game.Data.save() 写入的完整结构，必须带上 handbook
			handbook: JSON.parse(JSON.stringify(
				(Game.Data.data && Game.Data.data.handbook)
				|| { ownedCharacters: [], viewedCharacters: [], collectionProgress: { total: 0, owned: 0 } }
			))
			};
			// ===== 【修复存储超限】写入前空间预检，超限时友好提示而非 Uncaught 报错 =====
			const slotJson = JSON.stringify(compatData);
			const payloads = [[`ybrpg_save_${slot}`, slotJson]];
			let net = 0;
			payloads.forEach(([k, v]) => {
				const existing = localStorage.getItem(k);
				net += v.length + k.length - (existing ? existing.length : 0);
			});
			if (storageUsed() + net > STORAGE_QUOTA) {
				Game.toast('存储空间不足，无法保存！请先删除部分旧存档释放空间', 'error');
				console.warn(`[存档保存] 槽位${slot} 存储空间不足，已取消保存`);
				return null;
			}
			try {
				payloads.forEach(([k, v]) => localStorage.setItem(k, v));
				console.log(`已保存到槽位${slot}`);
			} catch (e) {
				console.error(`[存档保存] 槽位${slot} 写入失败:`, e);
				Game.toast('保存失败：本地存储空间不足，请删除部分旧存档后重试', 'error');
				return null;
			}
		return compatData;
	},

	// 从指定槽位读取（同步到 GameData 和 window）
	loadFromSlot(slot) {
		// 先缓存当前内存图鉴（用于抢救缺失 handbook 的旧存档）
		const prevHandbook = Game.Data.data && Game.Data.data.handbook;
		let restoredHandbook = null;
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
				window.multiSortByRank = parsed.playerPreferences.multiSortByRank !== undefined
					? parsed.playerPreferences.multiSortByRank : false;
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
			window.multiSortByRank = parsed.multiSortByRank || false;
			// window.charTreasureSlots = (data && data._charTreasureSlots) || parsed.charTreasureSlots || {};
			window.treasureEquipData = parsed.treasureEquipData || {};
			window.treasureBagData = parsed.treasureBagData || {};
			window.autoBattle = parsed.autoBattle || false;

			// ===== 经济 / 限制系统 =====
			window.stamina = parsed.stamina != null ? parsed.stamina : STAMINA_MAX;
			window.maxStamina = parsed.maxStamina != null ? parsed.maxStamina : STAMINA_MAX;
			window.staminaTs = parsed.staminaTs || Date.now();
			window.diamond = parsed.diamond || 0;
			window.dailySign = parsed.dailySign || { lastSignDate: '', streak: 0 };
			window.dailyTasks = parsed.dailyTasks || null;
			window.redeemedCodes = parsed.redeemedCodes || [];
			window.recruitPity = parsed.recruitPity || 0;
			window.recruitUpCharId = parsed.recruitUpCharId || null;
			window.treasurePity = parsed.treasurePity || 0;
			window.shopPage = parsed.shopPage || 'home';

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

			// ===== 【修复图鉴丢失】恢复图鉴数据 =====
			if (parsed.handbook) {
				restoredHandbook = parsed.handbook;
			} else if (prevHandbook && (prevHandbook.ownedCharacters || []).length > 0) {
				// 旧存档没有 handbook 字段：用当前内存图鉴抢救，并写回持久化修复
				restoredHandbook = JSON.parse(JSON.stringify(prevHandbook));
				try {
					const repaired = Object.assign({}, parsed, { handbook: JSON.parse(JSON.stringify(restoredHandbook)) });
					localStorage.setItem(compatKey, JSON.stringify(repaired));
					console.log('[存档加载] 已为旧存档补回图鉴数据');
				} catch (e) {
					console.warn('[存档加载] 补回图鉴写回失败:', e);
				}
			}
			// ==========================================
		} else if (data) {
			// 如果只有 GameData 格式，从 GameData 恢复 window 变量
			window.currentTeam = [...(data.team?.members || []), ...Array(6).fill(null)].slice(0, 6);
			window.gameGold = data.bag?.gold || 1000;
			window.charBagData = data._charBag || {};
			window.treasureEquipData = data._treasures || {};
			window.treasureBagData = data._treasureBag || {};
			// ===== 经济 / 限制系统 =====
			window.stamina = data.stamina != null ? data.stamina : STAMINA_MAX;
			window.maxStamina = data.maxStamina != null ? data.maxStamina : STAMINA_MAX;
			window.staminaTs = data.staminaTs || Date.now();
			window.diamond = data.diamond || 0;
			window.dailySign = data.dailySign || { lastSignDate: '', streak: 0 };
			window.dailyTasks = data.dailyTasks || null;
			// 【新增】恢复偏好设置
			const prefs = data.playerPreferences || data._playerPreferences || {};
			window.bagTab = prefs.bagTab || 'char';
			window.showFormulaDetail = prefs.showFormulaDetail !== undefined ? prefs.showFormulaDetail : true;
			window.multiSortByRank = prefs.multiSortByRank !== undefined ? prefs.multiSortByRank : false;
			}

		// 确保 Game.Data 内存与存档数据一致
		if (data) {
			const defaults = Game.Data.getDefaultData();
			// 【修复图鉴丢失】存档缺 handbook 时回退到默认空图鉴（restoredHandbook 已优先抢救）
			const handbook = restoredHandbook || data.handbook || defaults.handbook;
			Game.Data.data = { ...defaults, ...data, handbook, team: { ...defaults.team, ...data.team }, bag: { ...defaults.bag, ...data.bag }, baseInfo: { ...defaults.baseInfo, ...data.baseInfo } };
		}

		// ========== 新增：同步宝物数据到 window ==========
		syncTreasureEquipData();
		regenStamina();
		ensureResourceHUD();

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
		Game.Data.data.dailySign = JSON.parse(JSON.stringify(window.dailySign || { lastSignDate: '', streak: 0 }));
		Game.Data.data.dailyTasks = JSON.parse(JSON.stringify(window.dailyTasks || null));
		Game.Data.data.baseInfo.saveName = '自动存档';
		Game.Data.data.baseInfo.saveTime = new Date().toISOString();
		Game.Data.data.baseInfo.version = window.GAME_VERSION || 'v1.0';

		// ===== 【修复存储超限】ybrpg_save_0 只写精简结构 =====
		// loadAutoSave 仅依赖 baseInfo/team/bag/handbook/playerPreferences；
		// 其余大体积数据（_charBag/_treasureInventory 等）都在 ybrpg_autosave 的 compatData 中，
		// 不再让完整结构常驻 localStorage，从根源避免 QuotaExceededError
		const slot0Full = JSON.stringify({
			baseInfo: Game.Data.data.baseInfo,
			team: Game.Data.data.team,
			bag: Game.Data.data.bag,
			handbook: Game.Data.data.handbook,
			playerPreferences: Game.Data.data.playerPreferences
		});
		// =====================================================

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
			multiSortByRank: window.multiSortByRank || false,
			saveTime: new Date().toLocaleString(),
		saveName: '自动存档',
		_treasureInventory: JSON.parse(JSON.stringify(window.treasureInventory || {})),
		stamina: window.stamina,
		maxStamina: window.maxStamina,
		staminaTs: window.staminaTs,
		diamond: window.diamond,
			charTreasureSlots: window.charTreasureSlots || {},
			dailySign: window.dailySign || { lastSignDate: '', streak: 0 },
			dailyTasks: window.dailyTasks || null,
			redeemedCodes: window.redeemedCodes || [],
			recruitPity: window.recruitPity || 0,
			recruitUpCharId: window.recruitUpCharId || null,
			treasurePity: window.treasurePity || 0,
			shopPage: window.shopPage || 'home',
			playerPreferences: {
				bagTab: window.bagTab || 'char',
				showFormulaDetail: window.showFormulaDetail !== undefined ? window.showFormulaDetail : true,
				multiSortByRank: window.multiSortByRank !== undefined ? window.multiSortByRank : false
			},
			// 【修复图鉴丢失】自动档 compatData 同样带上 handbook，与 ybrpg_save_0 保持一致
			handbook: JSON.parse(JSON.stringify(
				(Game.Data.data && Game.Data.data.handbook)
				|| { ownedCharacters: [], viewedCharacters: [], collectionProgress: { total: 0, owned: 0 } }
			))
			};
			// ===== 【修复存储超限】写入前空间预检，超限时友好提示而非 Uncaught 报错 =====
			const autoCompatJson = JSON.stringify(compatData);
			const payloads = [
				[`${Game.Data.STORAGE_KEY}_0`, slot0Full],
				[SaveManager.AUTO_KEY, autoCompatJson]
			];
			let net = 0;
			payloads.forEach(([k, v]) => {
				const existing = localStorage.getItem(k);
				net += v.length + k.length - (existing ? existing.length : 0);
			});
			if (storageUsed() + net > STORAGE_QUOTA) {
				// 节流提示，避免频繁 Toast 刷屏
				const now = Date.now();
				if (!window._autoSaveQuotaWarnAt || now - window._autoSaveQuotaWarnAt > 30000) {
					window._autoSaveQuotaWarnAt = now;
					Game.toast('存储空间不足，自动存档失败！请在存档管理中删除部分手动存档后重试', 'error');
				}
				console.warn('[自动存档] 存储空间不足，跳过本次保存');
				return;
			}
			try {
				payloads.forEach(([k, v]) => localStorage.setItem(k, v));
				console.log('[自动存档] 已保存');
			} catch (e) {
				console.error('[自动存档] 保存失败:', e);
				const now = Date.now();
				if (!window._autoSaveQuotaWarnAt || now - window._autoSaveQuotaWarnAt > 30000) {
					window._autoSaveQuotaWarnAt = now;
					Game.toast('自动存档失败：本地存储空间不足，请删除部分手动存档', 'error');
				}
			}
	},

	loadAutoSave() {
		// 直接读取 localStorage，避免 Game.Data.load() 覆盖内存数据
		const key = `${Game.Data.STORAGE_KEY}_0`;
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		let data;
		try { data = JSON.parse(raw); } catch { return null; }

		if (data && data.baseInfo?.saveName === '自动存档') {
			// 先缓存当前内存图鉴（用于抢救缺失 handbook 的旧存档）
			const prevHandbook = Game.Data.data && Game.Data.data.handbook;
			let restoredHandbook = null;
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
					window.multiSortByRank = parsed.playerPreferences.multiSortByRank !== undefined
						? parsed.playerPreferences.multiSortByRank : false;
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
				window.multiSortByRank = parsed.multiSortByRank || false;
				window.currentDifficulty = parsed.currentDifficulty || 'normal';
				window.shopMode = parsed.shopMode || 'normal';
				window.shopData = parsed.shopData || { items: [], refreshCost: 50 };
				window.gameGold = parsed.gameGold || 1000;
				window.charBagData = charBag;
				window.treasureEquipData = parsed.treasureEquipData || {};
				window.treasureBagData = parsed.treasureBagData || {};
			window.autoBattle = parsed.autoBattle || false;
			// ===== 经济 / 限制系统 =====
			window.stamina = parsed.stamina != null ? parsed.stamina : STAMINA_MAX;
			window.maxStamina = parsed.maxStamina != null ? parsed.maxStamina : STAMINA_MAX;
			window.staminaTs = parsed.staminaTs || Date.now();
			window.diamond = parsed.diamond || 0;
			window.dailySign = parsed.dailySign || { lastSignDate: '', streak: 0 };
			window.dailyTasks = parsed.dailyTasks || null;
			window.redeemedCodes = parsed.redeemedCodes || [];
			window.recruitPity = parsed.recruitPity || 0;
			window.recruitUpCharId = parsed.recruitUpCharId || null;
			window.treasurePity = parsed.treasurePity || 0;
			window.shopPage = parsed.shopPage || 'home';
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

				// ===== 【修复图鉴丢失】恢复图鉴数据 =====
				if (parsed.handbook) {
					restoredHandbook = parsed.handbook;
				} else if (data.handbook) {
					restoredHandbook = data.handbook;
				} else if (prevHandbook && (prevHandbook.ownedCharacters || []).length > 0) {
					// 旧存档没有 handbook：用当前内存图鉴抢救，并写回持久化修复
					restoredHandbook = JSON.parse(JSON.stringify(prevHandbook));
					try {
						const repaired = Object.assign({}, parsed, { handbook: JSON.parse(JSON.stringify(restoredHandbook)) });
						localStorage.setItem(compatKey, JSON.stringify(repaired));
						const repairedFull = Object.assign({}, data, { handbook: JSON.parse(JSON.stringify(restoredHandbook)) });
						localStorage.setItem(key, JSON.stringify(repairedFull));
						console.log('[自动存档加载] 已为旧存档补回图鉴数据');
					} catch (e) {
						console.warn('[自动存档加载] 补回图鉴写回失败:', e);
					}
				}
				// ==========================================
			} else {
				window.currentTeam = [...(data.team?.members || []), ...Array(6).fill(null)].slice(0, 6);
				window.gameGold = data.bag?.gold || 1000;
				window.charBagData = data._charBag || {};
				window.treasureEquipData = data._treasures || {};
				window.treasureBagData = data._treasureBag || {};
				window.autoBattle = parsed.autoBattle || false;  // ✅ 使用 window.autoBattle 保持原值
				window.multiSortByRank = parsed.multiSortByRank || false;
			// ===== 经济 / 限制系统 =====
			window.stamina = parsed.stamina != null ? parsed.stamina : STAMINA_MAX;
			window.maxStamina = parsed.maxStamina != null ? parsed.maxStamina : STAMINA_MAX;
			window.staminaTs = parsed.staminaTs || Date.now();
			window.diamond = parsed.diamond || 0;
			window.dailySign = parsed.dailySign || { lastSignDate: '', streak: 0 };
			window.dailyTasks = parsed.dailyTasks || null;
			window.redeemedCodes = parsed.redeemedCodes || [];
			window.recruitPity = parsed.recruitPity || 0;
			window.recruitUpCharId = parsed.recruitUpCharId || null;
			window.treasurePity = parsed.treasurePity || 0;
			window.shopPage = parsed.shopPage || 'home';

				// 【新增】恢复偏好设置
				const prefs2 = data.playerPreferences || data._playerPreferences || {};
				window.bagTab = prefs2.bagTab || 'char';
				window.showFormulaDetail = prefs2.showFormulaDetail !== undefined ? prefs2.showFormulaDetail : true;
				window.multiSortByRank = prefs2.multiSortByRank !== undefined ? prefs2.multiSortByRank : false;
			}

			// 同步到 Game.Data 内存（确保结构完整）
			const defaults = Game.Data.getDefaultData();
			// 【修复图鉴丢失】存档缺 handbook 时回退到默认空图鉴（restoredHandbook 已优先抢救）
			const handbook = restoredHandbook || data.handbook || defaults.handbook;
			Game.Data.data = { ...defaults, ...data, handbook, team: { ...defaults.team, ...data.team }, bag: { ...defaults.bag, ...data.bag }, baseInfo: { ...defaults.baseInfo, ...data.baseInfo } };

			// ========== 新增：同步宝物数据 ==========
			syncTreasureEquipData();
			regenStamina();
			ensureResourceHUD();

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

	// 存档工具栏：导出当前存档 / 导入存档
	const actionBar = document.createElement('div');
	actionBar.style.cssText = 'display:flex;gap:10px;justify-content:flex-start;margin-bottom:14px;';

	// 【拦截主界面导出】主界面无游戏进度，导出只会得到未初始化的空数据，仅游戏内显示导出按钮
	if (fromGame) {
		const exportBtn = document.createElement('button');
		exportBtn.className = 'ybrpg-btn';
		exportBtn.textContent = '导出当前存档';
		exportBtn.style.cssText = 'width:auto;padding:6px 14px;font-size:13px;';
		exportBtn.onclick = exportCurrentSave;
		actionBar.appendChild(exportBtn);
	}

	const importBtn = document.createElement('button');
	importBtn.className = 'ybrpg-btn';
	importBtn.textContent = '导入存档';
	importBtn.style.cssText = 'width:auto;padding:6px 14px;font-size:13px;';
	importBtn.onclick = importSaveData;
	actionBar.appendChild(importBtn);

	container.appendChild(actionBar);

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
					const saveResult = SaveManager.saveToSlot(i);
					if (!saveResult) return;  // 失败时 saveToSlot 内部已 Toast 提示
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
					const saveResult = SaveManager.saveToSlot(i);
					if (!saveResult) return;  // 失败时 saveToSlot 内部已 Toast 提示
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

// 导出本模块定义的函数（供其他模块 import）
export { renderSettingsView, renderMiscSettingsView, REDEEM_CODES, applyRedeemRewards, redeemRewardNames, renderRedeemHistory, doRedeem, renderRedeemView, getTodayStr, DAILY_TASK_DEFS, recordDailyClear, DAILY_SIGN_REWARDS, ensureDailyData, addDailyTaskProgress, claimDailyTask, doDailySign, renderDailySignView, renderDailyTaskView, renderGalleryView, showCharDetail, showBreakthroughPreviewPopupForGallery, showFullImage, TREASURE_TYPE_LABELS, getTreasureRankInfo, renderTreasureGalleryView, showTreasureGalleryDetail, STAMINA_MAX, STAMINA_REGEN_PER_MIN, STAMINA_COST_DEFAULT, DIAMOND_TO_GOLD, regenStamina, getStaminaCost, trySpendStamina, exchangeDiamondToGold, isDeveloperRedeemed, ensureResourceHUD, fmtGroup4, fmtBigNum, updateResourceHUD, openDiamondExchange, showOutputPreview, showRewardPanel, hideOtherViews, syncResourceHUDViewMode, showMainView, initNewGame, showSaveView, SaveManager, migrateTreasuresToInstanceId, renderSaveView };

// 暴露给外部模块（shared 注册表 / window / Game）
shared.hideOtherViews = hideOtherViews;
shared.SaveManager = SaveManager;
window.ensureResourceHUD = ensureResourceHUD;
window.updateResourceHUD = updateResourceHUD;
Game.SaveManager = SaveManager;
