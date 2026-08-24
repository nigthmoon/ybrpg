/**
 * 星河之契 - 主入口
 * mode.js 通过 import 级联加载所有子模块，无需逐个导入
 */
import './mode.js';

console.log('[星河之契] 所有模块加载完成');

// ====== 所有模块加载完成：隐藏加载遮罩，显示游戏主界面 ======
// 注：mode.js（依赖）先于本文件执行，其顶层已同步完成初始化
//（initEventListeners + showMainView），故此处直接移除遮罩即可，不会出现中间态。
(function revealGameUI() {
	const loadingEl = document.getElementById('ybrpg-loading');
	if (loadingEl) loadingEl.remove();
	const rootEl = document.getElementById('ybrpg-root');
	if (rootEl) rootEl.style.display = '';
})();
