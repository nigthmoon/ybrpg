import { reactive } from 'vue';

// 全局确认弹窗状态（单例）
const state = reactive({
  visible: false,
  title: '确认',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  danger: false,
  _resolve: null,
});

/**
 * 命令式确认弹窗，返回 Promise<boolean>
 * 用法：const ok = await confirmDialog({ message: '确定吗？', danger: true, confirmText: '注销' });
 */
export function confirmDialog(options) {
  const o = typeof options === 'string' ? { message: options } : (options || {});
  state.title = o.title || '确认';
  state.message = o.message || '';
  state.confirmText = o.confirmText || '确认';
  state.cancelText = o.cancelText || '取消';
  state.danger = !!o.danger;
  state.visible = true;
  return new Promise((resolve) => { state._resolve = resolve; });
}

/** 关闭并回传结果（由 ConfirmHost 的按钮/遮罩调用） */
export function resolveConfirm(value) {
  state.visible = false;
  const r = state._resolve;
  state._resolve = null;
  if (r) r(value);
}

export const confirmState = state;
