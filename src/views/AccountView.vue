<template>
  <div class="account-page">
    <div class="page-header">
      <button class="back-btn" @click="back">‹ 返回</button>
      <h2 class="page-title">用户中心</h2>
      <span class="header-spacer"></span>
    </div>

    <!-- 游客态 -->
    <div v-if="!auth.isLoggedIn" class="card guest-card">
      <p>当前为 <b>游客模式</b>，进度仅保存在本机。</p>
      <p>登录账号即可云端保存角色与进度。</p>
      <div class="row">
        <button class="btn primary" @click="router.push('/login')">登录</button>
        <button class="btn" @click="router.push('/register')">注册</button>
      </div>
    </div>

    <!-- 登录态 -->
    <template v-else>
      <!-- 当前头像 / 昵称 -->
      <div class="card profile-card">
        <img class="profile-avatar" :src="avatarIcon(currentAvatar)" :style="{ objectPosition: avatarPos(currentAvatar) }" @error="onAvatarError" />
        <div class="profile-meta">
          <div class="profile-nick">{{ displayNick }}</div>
          <div class="profile-user">@{{ auth.user?.username }}</div>
        </div>
      </div>

      <!-- 选择头像 -->
      <div class="card">
        <h3>选择头像</h3>
        <p class="hint">从游戏内的武将或宝物中选择一个作为头像。</p>
        <div class="avatar-picker">
          <button type="button" class="picker-toggle" @click="toggleAvatarOpen">
            <img class="toggle-avatar" :src="avatarIcon(currentAvatar)" :style="{ objectPosition: avatarPos(currentAvatar) }" @error="onAvatarError" />
            <span :class="{ placeholder: !currentAvatar }">{{ currentAvatar?.name || '请选择头像' }}</span>
            <span class="caret" :class="{ up: avatarOpen }">▾</span>
          </button>

          <div v-if="avatarOpen" class="picker-mask" @click="avatarOpen = false"></div>
          <div v-if="avatarOpen" class="picker-panel">
            <input ref="avatarSearchEl" v-model="avatarFilter" class="picker-search" placeholder="搜索武将 / 宝物" />
            <div class="picker-list">
              <div v-if="filteredCharOptions.length" class="picker-group-title">武将</div>
              <button
                v-for="o in filteredCharOptions"
                :key="'c' + o.id"
                class="picker-item avatar-item"
                :class="{ active: isActive(o) }"
                @click="chooseAvatar(o)"
              >
                <img :src="o.icon" :style="{ objectPosition: avatarPos(o) }" @error="onAvatarError" /><span>{{ o.name }}</span>
              </button>
              <div v-if="filteredTreasureOptions.length" class="picker-group-title">宝物</div>
              <button
                v-for="o in filteredTreasureOptions"
                :key="'t' + o.id"
                class="picker-item avatar-item"
                :class="{ active: isActive(o) }"
                @click="chooseAvatar(o)"
              >
                <img :src="o.icon" :style="{ objectPosition: avatarPos(o) }" @error="onAvatarError" /><span>{{ o.name }}</span>
              </button>
              <div v-if="!filteredCharOptions.length && !filteredTreasureOptions.length" class="picker-empty">无匹配</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 昵称（自由填写） -->
      <div class="card">
        <h3>昵称</h3>
        <p class="hint">任意填写，1-20 个字符。</p>
        <input v-model="nick" class="txt" maxlength="20" placeholder="输入昵称" @keyup.enter="saveNickname" />
        <button class="btn primary" :disabled="!canSaveNick" @click="saveNickname">保存昵称</button>
      </div>

      <!-- 修改密码 -->
      <div class="card">
        <h3>修改密码</h3>
        <input v-model="oldPw" type="password" class="txt" placeholder="原密码" />
        <input v-model="newPw" type="password" class="txt" placeholder="新密码（至少6位）" />
        <input v-model="newPw2" type="password" class="txt" placeholder="确认新密码" />
        <button class="btn" @click="submitChangePw">修改密码</button>
      </div>

      <!-- 账号操作 -->
      <div class="card">
        <h3>账号</h3>
        <div class="row">
          <button class="btn" @click="doLogout">退出登录</button>
        </div>
        <div class="danger">
          <h3 class="danger-title">注销账号</h3>
          <p class="hint">注销后账号与所有云端存档将被永久删除，不可恢复。</p>
          <input v-model="delPw" type="password" class="txt" placeholder="输入密码以确认注销" />
          <button class="btn danger-btn" @click="doDelete">注销账号</button>
        </div>
      </div>
    </template>

    <div v-if="msg" class="toast" :class="{ err: isErr }">{{ msg }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useGameStore } from '../stores/game';
import { confirmDialog } from '../composables/useConfirm';

const router = useRouter();
const auth = useAuthStore();
const gstore = useGameStore();

// 返回：来自游戏内则恢复游戏，否则回主界面
function back() { gstore.backFromAccount(); }

const charOptions = ref([]);
const treasureOptions = ref([]);
const avatarFilter = ref('');
const avatarOpen = ref(false);
const avatarSearchEl = ref(null);
const nick = ref('');

const oldPw = ref('');
const newPw = ref('');
const newPw2 = ref('');
const delPw = ref('');
const msg = ref('');
const isErr = ref(false);

const currentAvatar = computed(() => auth.user?.avatar || null);
const displayNick = computed(() => auth.user?.nickname || '未设置');
const canSaveNick = computed(() => {
  const v = nick.value.trim();
  return !!v && v !== (auth.user?.nickname || '');
});

const filteredCharOptions = computed(() => {
  const f = avatarFilter.value.trim();
  return charOptions.value.filter(o => !f || o.name.includes(f));
});
const filteredTreasureOptions = computed(() => {
  const f = avatarFilter.value.trim();
  return treasureOptions.value.filter(o => !f || o.name.includes(f));
});

function avatarIcon(a) {
  if (!a) return '/image/character/default.jpg';
  return a.icon || `/image/character/${a.id}.jpg`;
}
// 武将为整幅立绘：头像区域聚焦上半身；宝物为方形图标，居中即可
function avatarPos(a) {
  return a && a.type === 'treasure' ? 'center' : 'center top';
}
function isActive(o) {
  const a = currentAvatar.value;
  return !!a && a.type === o.type && a.id === o.id;
}
function onAvatarError(e) {
  const img = e.target;
  if (img.dataset.fallback) return; // 防止死循环
  img.dataset.fallback = '1';
  img.src = '/image/character/default.jpg';
}

function toast(text, err = false) {
  msg.value = text;
  isErr.value = err;
  setTimeout(() => { if (msg.value === text) msg.value = ''; }, 2500);
}

onMounted(async () => {
  if (auth.isLoggedIn) nick.value = auth.user?.nickname || '';
  try {
    const [cl, eq] = await Promise.all([
      import('../game/data/characterList'),
      import('../game/data/equip'),
    ]);
    charOptions.value = Object.entries(cl.characterList).map(([id, c]) => ({
      type: 'char', id, name: c.name, icon: `/image/character/${id}.jpg`,
    }));
    treasureOptions.value = Object.entries(eq.TREASURE_DEFS).map(([id, t]) => ({
      type: 'treasure', id: t.id || id, name: t.name, icon: t.icon || `/image/skill/${id}.png`,
    }));
  } catch (e) {
    console.warn('加载头像候选失败', e);
  }
});

function toggleAvatarOpen() {
  avatarOpen.value = !avatarOpen.value;
  if (avatarOpen.value) nextTick(() => { if (avatarSearchEl.value) avatarSearchEl.value.focus(); });
}

async function chooseAvatar(item) {
  try {
    await auth.setAvatar(item);
    avatarOpen.value = false;
    toast('头像已更新');
  } catch (e) {
    toast(e.message || '设置失败', true);
  }
}

async function saveNickname() {
  const v = nick.value.trim();
  if (!v) return toast('昵称不能为空', true);
  if (v.length > 20) return toast('昵称不超过 20 字', true);
  try {
    await auth.setNickname(v);
    toast('昵称已更新');
  } catch (e) {
    toast(e.message || '保存失败', true);
  }
}

async function submitChangePw() {
  if (newPw.value !== newPw2.value) return toast('两次新密码不一致', true);
  if (newPw.value.length < 6) return toast('新密码至少 6 位', true);
  try {
    await auth.changePassword(oldPw.value, newPw.value);
    toast('密码已修改');
    oldPw.value = newPw.value = newPw2.value = '';
  } catch (e) {
    toast(e.message || '修改失败', true);
  }
}

async function doLogout() {
  const ok = await confirmDialog({ message: '确定退出登录吗？' });
  if (!ok) return;
  await auth.logout();
  router.push('/');
}

async function doDelete() {
  if (!delPw.value) return toast('请输入密码', true);
  const ok = await confirmDialog({ message: '确定注销账号吗？\n账号与所有云端存档将永久删除，不可恢复！', danger: true, confirmText: '注销' });
  if (!ok) return;
  try {
    await auth.deleteAccount(delPw.value);
    toast('账号已注销');
    setTimeout(() => router.push('/'), 800);
  } catch (e) {
    toast(e.message || '注销失败', true);
  }
}
</script>

<style scoped>
.account-page { min-height: 100vh; max-width: 560px; margin: 0 auto; padding: 16px; color: #e8ecf6; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.back-btn { padding: 6px 12px; font-size: 13px; cursor: pointer; background: rgba(0,0,0,.35); color: #e8ecf6; border: 1px solid #455a64; border-radius: 6px; }
.back-btn:hover { background: rgba(255,255,255,.12); }
.page-title { flex: 1; text-align: center; font-size: 18px; margin: 0; color: #e8ecf6; }
.header-spacer { width: 64px; }
.card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 16px; margin-bottom: 14px; }
.card h3 { margin: 0 0 10px; font-size: 15px; color: #ffd700; }
.hint { color: #9aa4bd; font-size: 12px; margin: 0 0 10px; }
.txt { width: 100%; box-sizing: border-box; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 8px; padding: 10px; color: #e8ecf6; font-size: 14px; margin-bottom: 10px; outline: none; }
.txt:focus { border-color: #5b8cff; }
.btn { padding: 9px 16px; font-size: 14px; cursor: pointer; background: rgba(255,255,255,.1); color: #e8ecf6; border: 1px solid rgba(255,255,255,.2); border-radius: 8px; }
.btn.primary { background: linear-gradient(180deg,#5b8cff,#3f6fe0); border-color: #5b8cff; color: #fff; }
.btn:disabled { opacity: .5; cursor: default; }
.btn.danger-btn { background: #b71c1c; border-color: #e53935; color: #fff; }
.row { display: flex; gap: 10px; }

/* 当前头像 / 昵称 */
.profile-card { display: flex; align-items: center; gap: 14px; }
.profile-avatar { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(255,215,0,.7); background: rgba(0,0,0,.3); flex-shrink: 0; }
.profile-meta { min-width: 0; }
.profile-nick { font-size: 18px; font-weight: bold; color: #fff; }
.profile-user { font-size: 13px; color: #9aa4bd; margin-top: 4px; }

/* 头像下拉选择器 */
.avatar-picker { position: relative; margin-bottom: 4px; }
.picker-toggle { width: 100%; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 8px; padding: 8px 12px; color: #e8ecf6; font-size: 15px; cursor: pointer; }
.picker-toggle .placeholder { color: #7c869e; }
.picker-toggle .caret { margin-left: auto; color: #9aa4bd; transition: transform .15s; }
.picker-toggle .caret.up { transform: rotate(180deg); }
.toggle-avatar { width: 34px; height: 34px; border-radius: 6px; object-fit: cover; background: rgba(0,0,0,.3); flex-shrink: 0; }
.picker-mask { position: fixed; inset: 0; z-index: 998; }
.picker-panel { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 999; background: rgba(22,26,40,.98); border: 1px solid rgba(255,255,255,.16); border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,.5); overflow: hidden; }
.picker-search { width: 100%; box-sizing: border-box; background: rgba(255,255,255,.06); border: none; border-bottom: 1px solid rgba(255,255,255,.12); padding: 10px 12px; color: #e8ecf6; font-size: 14px; outline: none; }
.picker-list { max-height: 260px; overflow-y: auto; padding: 6px; }
.picker-group-title { font-size: 12px; color: #9aa4bd; padding: 6px 8px 2px; }
.picker-item { display: flex; width: 100%; align-items: center; gap: 10px; text-align: left; background: transparent; border: none; color: #cfd6e6; font-size: 14px; padding: 7px 10px; border-radius: 6px; cursor: pointer; }
.picker-item:hover { background: rgba(255,255,255,.08); }
.picker-item.active { background: #3f6fe0; color: #fff; }
.avatar-item img { width: 30px; height: 30px; border-radius: 5px; object-fit: cover; background: rgba(0,0,0,.3); flex-shrink: 0; }
.picker-empty { color: #546e7a; font-size: 13px; padding: 12px; text-align: center; }

.danger { margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,.14); }
.danger-title { color: #ff7b7b !important; }
.toast { position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%); background: rgba(20,24,38,.95); border: 1px solid rgba(255,255,255,.2); padding: 10px 18px; border-radius: 8px; font-size: 14px; z-index: 9999; }
.toast.err { border-color: #e53935; color: #ff9b9b; }
.guest-card p { margin: 0 0 10px; color: #cbd3e6; }
</style>
