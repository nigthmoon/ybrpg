// 构建版本检测：定时比对线上 version.json，发现新构建则强制玩家重启
export function startVersionCheck() {
  // __BUILD_TIME__ 由 Vite define 注入；未注入（如某些环境）时不检测
  const RUNNING = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null;
  if (RUNNING == null) return;

  let prompted = false;

  const check = async () => {
    try {
      const base = (import.meta.env && import.meta.env.BASE_URL) || './';
      const res = await fetch(base + 'version.json?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (
        data &&
        typeof data.buildTime === 'number' &&
        data.buildTime !== RUNNING &&
        !prompted
      ) {
        prompted = true;
        showUpdateModal();
      }
    } catch (e) {
      // 网络/部署差异（如 dev 模式无 version.json）静默忽略，不影响游戏
    }
  };

  // 启动后稍候检查一次，之后每 30 秒轮询
  setTimeout(check, 5000);
  setInterval(check, 30000);
}

function showUpdateModal() {
  if (document.getElementById('app-update-modal')) return;
  const overlay = document.createElement('div');
  overlay.id = 'app-update-modal';
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:2147483647;display:flex;align-items:center;justify-content:center;';
  const box = document.createElement('div');
  box.style.cssText =
    'background:#1a1a1a;border:1px solid #ffd700;border-radius:10px;padding:24px 30px;max-width:90vw;text-align:center;box-shadow:0 6px 30px rgba(0,0,0,.5);';
  const title = document.createElement('div');
  title.style.cssText = 'font-size:18px;color:#ffd700;font-weight:bold;margin-bottom:10px;';
  title.textContent = '游戏已发生更新，请重启';
  const tip = document.createElement('div');
  tip.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:18px;line-height:1.5;';
  tip.textContent = '为保证数据一致，请重启游戏以加载最新版本。';
  const btn = document.createElement('button');
  btn.textContent = '立即重启';
  btn.style.cssText =
    'background:#ffd700;color:#000;border:none;border-radius:6px;padding:10px 24px;font-size:14px;font-weight:bold;cursor:pointer;';
  btn.onclick = () => {
    try {
      location.reload(true);
    } catch (e) {
      location.reload();
    }
  };
  box.appendChild(title);
  box.appendChild(tip);
  box.appendChild(btn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
