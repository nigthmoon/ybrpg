/**
 * 奇遇掉落接口（活动日历）
 * ------------------------------------------------------------
 * 在每次战斗/扫荡结算掉落时调用：
 *  - rollEncounterDrops(chapterKey, time)：按“关卡类型 + time(星期)”返回本次奇遇掉落。
 *  - applyEncounterDrops(drops)：把奇遇掉落实际发放到资源/背包（一般掉落之外的补充）。
 *
 * 掉落项结构：{ kind:'item'|'treasure'|'character'|'gold'|'diamond', id, name, count, icon? }
 *  - item      → Game.Data.addItem(id, count)
 *  - treasure  → Game.Data.addTreasure(id, count)
 *  - character → grantCharacter(id) × count
 *  - gold/diamond → 直接加 window.gameGold / window.diamond
 */
import { ITEM_DEFS } from './item';

// 奇遇日历（测试版：恒生效，仅主线关卡触发；按本地时间星期判断）
//  周一~周五：工作日福袋（同一奖池=5 天持平；期望≈18.6 钻 + 545 金/次）
//  周六/日 ：周末福袋（期望≈55.1 钻 + 1500 金/次，周末高光）
// 价值折算：钻石袋=钻×10000 金（兑换所）；商城汇率 1 钻=100 金；金币袋=面额，奢华宝箱=50 钻+10000 金

// 加权福袋奖池：[ [物品id, 权重], ... ]（钻石/金币交替排列，权重=掉率%不变）
const WORKDAY_POOL = [
	['dj_10001', 0.2], ['dj_10007', 0.5], ['dj_10002', 1], ['dj_10008', 2.5], ['dj_10003', 4.8], ['dj_10009', 6],
	['dj_10004', 10], ['dj_10010', 15], ['dj_10005', 18], ['dj_10011', 20], ['dj_10006', 22],
];
const WEEKEND_POOL = [
	['dj_10001', 2], ['dj_10002', 5], ['dj_10003', 10], ['dj_10004', 20],
	['dj_10005', 28], ['dj_10006', 20], ['item_box_deluxe', 15],
];
const rollFromPool = (pool) => {
	const total = pool.reduce((s, p) => s + p[1], 0);
	let r = Math.random() * total;
	for (const [id, w] of pool) { r -= w; if (r <= 0) return id; }
	return pool[pool.length - 1][0];
};

export function rollEncounterDrops(chapterKey, time = Date.now()) {
	if (!/^c/i.test(String(chapterKey || ''))) return []; // 仅主线关卡触发
	const wd = new Date(time).getDay(); // 0=周日 1=周一 ... 6=周六
	// 周一~周五用同一奖池（各天期望一致=持平）；周六/日用高倍奖池
	const id = (wd >= 1 && wd <= 5) ? rollFromPool(WORKDAY_POOL) : rollFromPool(WEEKEND_POOL);
	const def = ITEM_DEFS[id];
	return [{ kind: 'item', id, name: (def && def.name) || id, count: 1, icon: (def && def.icon) || null }];
}

export function applyEncounterDrops(drops) {
	if (!Array.isArray(drops) || !drops.length) return [];
	const granted = [];
	for (const d of drops) {
		if (!d || !d.kind || !(d.count > 0)) continue;
		try {
			if (d.kind === 'gold') { window.gameGold = (window.gameGold || 0) + d.count; granted.push(Object.assign({}, d, { name: d.name || '金币' })); }
			else if (d.kind === 'diamond') { window.diamond = (window.diamond || 0) + d.count; granted.push(Object.assign({}, d, { name: d.name || '钻石' })); }
			else if (d.kind === 'item' && window.Game && Game.Data && Game.Data.addItem) { Game.Data.addItem(d.id, d.count); granted.push(d); }
			else if (d.kind === 'treasure' && window.Game && Game.Data && Game.Data.addTreasure) { Game.Data.addTreasure(d.id, d.count); granted.push(d); }
			else if (d.kind === 'character' && window.grantCharacter) { for (let i = 0; i < d.count; i++) window.grantCharacter(d.id); granted.push(d); }
		} catch (e) { /* 单个发放失败不影响其他 */ }
	}
	return granted;
}
