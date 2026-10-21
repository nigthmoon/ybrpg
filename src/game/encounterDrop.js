/**
 * 奇遇掉落接口（预留，供以后节日活动扩展）
 * ------------------------------------------------------------
 * 在每次战斗/扫荡结算掉落时调用：
 *  - rollEncounterDrops(chapterKey, time)：按“关卡类型 + time(活动日历)”返回本次奇遇掉落。
 *      目前没有任何奇遇/节日掉落，恒返回空数组。
 *      以后示例：判断 time 是否在某节日期间、chapterKey 是否命中，返回对应节日道具/资源。
 *  - applyEncounterDrops(drops)：把奇遇掉落实际发放到资源/背包（一般掉落之外的补充）。
 *
 * 掉落项结构：{ kind:'item'|'treasure'|'character'|'gold'|'diamond', id, name, count, icon? }
 *  - item      → Game.Data.addItem(id, count)（道具）
 *  - treasure  → Game.Data.addTreasure(id, count)（宝物）
 *  - character → grantCharacter(id) × count（武将）
 *  - gold/diamond → 直接加 window.gameGold / window.diamond
 */
export function rollEncounterDrops(chapterKey, time = Date.now()) {
	// 预留：当前无任何奇遇/节日掉落，恒返回空数组。
	// 节日示例（以后启用）：
	//   const d = new Date(time);
	//   if (isSpringFestival(d) && /^c/i.test(String(chapterKey))) {
	//     return [{ kind: 'item', id: 'item_fu', name: '福字', count: 1 }];
	//   }
	void chapterKey; void time;
	return [];
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
