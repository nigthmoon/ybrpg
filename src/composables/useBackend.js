import { reactive } from 'vue';

// 后端在线状态（单例）：offline=true 时全局显示“后端未启动”提示
const state = reactive({ offline: false });

export function markOffline() { state.offline = true; }
export function markOnline() { state.offline = false; }

export const backendState = state;
