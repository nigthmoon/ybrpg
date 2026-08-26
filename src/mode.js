/**
 * 星河之契 - 通用保留区（入口/初始化）
 * 由 mode.js 拆分而来（原行号见下文分段注释）
 */

import { renderTeamView } from './team.js';
import { renderBagView } from './bag.js';
import { renderDungeonView } from './dungeon.js';
import { renderShopView } from './shop.js';
import { hideOtherViews, renderSettingsView, showMainView } from './other.js';

function initEventListeners() {
	const btnTeam = document.getElementById('btn-team');
	const btnBag = document.getElementById('btn-bag');
	const btnDungeon = document.getElementById('btn-dungeon');
	const btnShop = document.getElementById('btn-shop');
	const btnSettings = document.getElementById('btn-settings');

	// 添加一个全局的"返回主界面"逻辑
	// 当从游戏内任何地方想要返回主界面时，都应该调用showMainView()

	if (btnTeam) {
		btnTeam.addEventListener('click', () => {
			const teamView = document.getElementById('team-view');
			renderTeamView(teamView);
			hideOtherViews('team-view');
			if (teamView) teamView.style.display = 'flex';
		});
	}

	if (btnBag) {
		btnBag.addEventListener('click', () => {
			const bagView = document.getElementById('bag-view');
			renderBagView(bagView);
			hideOtherViews('bag-view');
			if (bagView) bagView.style.display = 'flex';
		});
	}
	if (btnDungeon) {
		btnDungeon.addEventListener('click', () => {
			const dungeonView = document.getElementById('dungeon-view');

			// 每次点击都重新渲染，以便更新解锁状态（如果有动态变化）
			// 或者只在第一次渲染，后续通过其他方式更新
			if (dungeonView) {
				renderDungeonView(dungeonView);
			}

			// 使用封装函数隐藏其他视图
			hideOtherViews('dungeon-view');

			// 显示当前视图
			if (dungeonView) dungeonView.style.display = 'flex';
		});
	}

	// 新增: 商店按钮事件
	if (btnShop) {
		btnShop.addEventListener('click', () => {
			const shopView = document.getElementById('shop-view');

			// 每次进入商店都重新渲染，确保金币等信息是最新的
			if (shopView) {
				renderShopView(shopView);
			}

			// 使用封装函数隐藏其他视图
			hideOtherViews('shop-view');

			// 显示当前视图
			if (shopView) shopView.style.display = 'flex';
		});
	}

	if (btnSettings) {
		btnSettings.addEventListener('click', () => {
			const settingsView = document.getElementById('settings-view');

			// 如果设置视图已经初始化过，直接显示即可
			if (settingsView && settingsView.children.length === 0) {
				renderSettingsView(settingsView);
			}

			// 使用封装函数隐藏其他视图
			hideOtherViews('settings-view');

			// 显示当前视图
			if (settingsView) settingsView.style.display = 'flex';
		});
	}

}

// // 当 DOM 加载完成后初始化事件
// if (document.readyState === 'loading') {
//	 document.addEventListener('DOMContentLoaded', initEventListeners);
// } else {
//	 initEventListeners();
// }
// 修改DOM加载后的初始化
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		initEventListeners();
		// 初始显示主界面（新游戏/读取存档）
		showMainView();
	});
} else {
	initEventListeners();
	showMainView();
}

// 顶层初始化（原 mode.js 10096-10105 行）