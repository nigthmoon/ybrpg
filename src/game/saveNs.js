/**
 * 存档命名空间（身份隔离）
 * ------------------------------------------------------------
 * 让 localStorage 存档 key 带身份前缀，从而实现：
 *  - 登录用户：`u<userId>:` 前缀，各自独立（云端 saves 表另按 user_id 隔离）
 *  - 游客：`guest:` 前缀，独立本地档，不碰云端
 * 默认 guest；身份变化时由 auth store 调用 setSaveNamespace 切换，
 * 之后所有存档 key 自动切换到对应命名空间。
 */
let NS = 'guest';

export function setSaveNamespace(ns) {
  NS = (typeof ns === 'string' && ns) ? ns : 'guest';
}

export function getSaveNamespace() {
  return NS;
}

/** 给一个基础 key 加当前命名空间前缀 */
export function nsKey(base) {
  return NS + ':' + base;
}
