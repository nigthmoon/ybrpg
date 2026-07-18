/**
 * UI 工具函数模块
 * 提供 toast 提示、confirmDialog 弹窗、ID 生成等基础功能
 */

/**
 * 获取主角在当前队伍中的槽位索引 (0-5)
 * @returns {number} 主角的槽位索引，如果不在队伍中返回 -1
 */
function getMainCharacterSlotIndex() {
	if (!window.currentTeam || !window.charBagData) return -1;

	for (let i = 0; i < window.currentTeam.length; i++) {
		const instId = window.currentTeam[i];
		if (instId && window.charBagData[instId]) {
			if (window.charBagData[instId].charId === 'zhujue') {
				return i;
			}
		}
	}
	return -1;
}

/**
 * 飘字提示函数 - 替代原生 alert
 * @param {string} message 提示文本
 * @param {string} type 类型: 'info'(默认) | 'success' | 'error' | 'warning'
 * @param {number} duration 显示时长(ms)，默认 1500
 */
function toast(message, type = 'info', duration = 1500) {
	let container = document.querySelector('.ybrpg-toast-container');
	if (!container) {
		container = document.createElement('div');
		container.className = 'ybrpg-toast-container';
		container.style.zIndex = '20000';
		document.body.appendChild(container);
	}

	const toastEl = document.createElement('div');
	toastEl.className = `ybrpg-toast ${type}`;
	toastEl.textContent = message;
	container.appendChild(toastEl);

	setTimeout(() => {
		if (toastEl.parentNode) {
			toastEl.parentNode.removeChild(toastEl);
		}
	}, duration + 800);
}

/**
 * 确认对话框函数 - 替代原生 confirm
 * @param {string} message 确认文本
 * @param {Function} onConfirm 确认回调
 * @param {Function} onCancel 取消回调（可选）
 */
function confirmDialog(message, onConfirm, onCancel) {
	const overlay = document.createElement('div');
	overlay.className = 'ybrpg-confirm-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'ybrpg-confirm-dialog';

	dialog.innerHTML = `
		<div class="ybrpg-confirm-message">${message}</div>
		<div class="ybrpg-confirm-buttons">
			<button class="ybrpg-confirm-btn cancel">取消</button>
			<button class="ybrpg-confirm-btn confirm">确认</button>
		</div>
	`;

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	const close = () => {
		if (overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	};

	dialog.querySelector('.cancel').onclick = () => {
		close();
		if (onCancel) onCancel();
	};

	dialog.querySelector('.confirm').onclick = () => {
		close();
		if (onConfirm) onConfirm();
	};

	overlay.onclick = (e) => {
		if (e.target === overlay) {
			close();
			if (onCancel) onCancel();
		}
	};
}

/**
 * 生成唯一的角色实例ID
 * @param {string} charId 基础角色ID
 * @returns {string} 唯一实例ID
 */
function generateInstanceId(charId) {
	return `${charId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// 暴露到 window（供其他模块直接调用）
window.getMainCharacterSlotIndex = getMainCharacterSlotIndex;
window.toast = toast;
window.confirmDialog = confirmDialog;
window.generateInstanceId = generateInstanceId;

export {};
