/**
 * 根命名空间（core.js）
 * ------------------------------------------------------------
 * 所有核心功能统一收纳于单一类名 Game，其他模块只需记住 Game 即可，
 * 避免类名散落各处、彼此依赖 window.* 全局变量。
 *
 *   Game.Bag    宝物 / 背包 / 装备系统
 *   Game.Stat   属性 / 战力 / 队伍计算
 *   Game.UI     视图刷新 + UI 工具（toast / confirmDialog / genId / mainSlot）
 *   Game.Data   游戏数据管理实例（存档 / 背包 / 副本 / 商店 / 图鉴）
 *   Game.Battle 战斗（事件 + 流程函数）
 *
 * 全局根对象为 window.Game，既可作为 ES Module 导入，也能在控制台调试。
 *
 * 依赖关系（无循环）：
 *   core.js ──▶ system.js / gameData.js / battle_refactored.js / ui/utils.js
 * 被 core 引入的文件需要某个类时，直接从定义文件引入（如 gameData.js 引 system.js 的 Bag），
 * 切勿反向 import './core.js'，否则会形成循环依赖。
 */

import { Bag, Stat, UI } from './game/system.js';
import { GameData, gameData } from './gameData.js';
import { Battle, BattleEvents } from './battle/battle_refactored.js';
import { toast, confirmDialog, generateInstanceId, getMainCharacterSlotIndex } from './ui/utils.js';

// ====== 单一根命名空间：所有核心功能收纳于此 ======
class Game {
	// 系统类
	static Bag = Bag;
	static Stat = Stat;
	static UI = UI;

	// 数据管理实例
	static Data = gameData;

	// 战斗（事件 + 全部战斗方法聚合于 Battle 类）
	static Battle = Battle;

	// UI 工具（同时挂到 UI 与 Game 根，方便调用）
	static toast = UI.toast;
	static confirmDialog = UI.confirmDialog;
	static genId = UI.generateInstanceId;
	static mainSlot = UI.getMainCharacterSlotIndex;
}

// 全局透出（兼容旧代码与控制台调试）
if (typeof window !== 'undefined') {
	window.Game = Game;
}

export {
	Game,
	Bag, Stat, UI,
	GameData, gameData,
	Battle, BattleEvents,
	toast, confirmDialog, generateInstanceId, getMainCharacterSlotIndex,
};
