/**
 * 共享函数注册表
 * 解决 mode.js ↔ system.js / battle_refactored.js ↔ charBreakthroughConfig.js 的循环依赖
 * 使用方式：被调用方将函数注册到 shared 对象上，调用方 import shared 后通过 shared.xxx() 调用
 */
const shared = {};

/**
 * 全局复用的图片懒加载观察器：
 * builder 创建的 <img> 只需设 img.dataset.src（而非 img.src），
 * 进入视口时才真正发起请求并 decode，避免一次性渲染上千张图导致主线程冻结。
 */
let _lazyObserver = null;
function _getLazyObserver() {
	if (_lazyObserver) return _lazyObserver;
	if (typeof IntersectionObserver === 'undefined') return null;
	_lazyObserver = new IntersectionObserver((entries, obs) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			const img = entry.target;
			const src = img.dataset.src;
			if (src) {
				// 先把 src 存到真正的属性；移除标记避免重复处理
				img.removeAttribute('data-src');
				img.src = src;
			}
			obs.unobserve(img);
		}
	}, { root: null, rootMargin: '300px 0px' });
	return _lazyObserver;
}

/**
 * 为图片设置懒加载来源。传入真实 src，但延迟到进入视口才加载。
 * @param {HTMLImageElement} img
 * @param {string} src
 */
function lazyImageSrc(img, src) {
	if (!src) return;
	if (typeof IntersectionObserver === 'undefined') {
		img.src = src; // 退化：直接加载
		return;
	}
	img.dataset.src = src;
	const obs = _getLazyObserver();
	if (obs) obs.observe(img);
}

/**
 * 分片异步渲染长列表，避免一次性创建上千个 DOM 节点冻结主线程。
 * @param {Array} items 数据数组
 * @param {HTMLElement} container 列表容器（节点将 append 进去）
 * @param {Function} builder (item, index) => HTMLElement 创建单个列表项
 * @param {number} [chunkSize] 每帧渲染的条目数，默认 48
 * @param {HTMLElement} [scrollRoot] 滚动容器，用于懒加载观察；不传则用视口
 */
function chunkAppend(items, container, builder, chunkSize, scrollRoot) {
	chunkSize = chunkSize || 48;
	let i = 0;
	const obs = (typeof IntersectionObserver !== 'undefined') ? _getLazyObserver() : null;
	function step() {
		const end = Math.min(i + chunkSize, items.length);
		// 用 fragment 批量挂载，减少重排次数
		const frag = document.createDocumentFragment();
		const lazyImgs = [];
		for (; i < end; i++) {
			const el = builder(items[i], i);
			if (el) {
				frag.appendChild(el);
				// 收集本批懒加载图片
				if (obs) {
					el.querySelectorAll('img[data-src]').forEach(im => lazyImgs.push(im));
				}
			}
		}
		container.appendChild(frag);
		if (obs) lazyImgs.forEach(im => obs.observe(im));
		if (i < items.length) {
			// 让出主线程，下一帧继续
			(requestAnimationFrame || setTimeout)(step, 0);
		}
	}
	step();
}

shared.chunkAppend = chunkAppend;
shared.lazyImageSrc = lazyImageSrc;

export { shared, chunkAppend, lazyImageSrc };
