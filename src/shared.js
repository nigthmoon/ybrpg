/**
 * 共享函数注册表
 * 解决 mode.js ↔ system.js / battle_refactored.js ↔ charBreakthroughConfig.js 的循环依赖
 * 使用方式：被调用方将函数注册到 shared 对象上，调用方 import shared 后通过 shared.xxx() 调用
 */
const shared = {};

export { shared };
