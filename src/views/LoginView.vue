<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>登录账号</h2>
      <p class="sub">登录后可云端保存角色与进度</p>
      <input v-model.trim="username" placeholder="用户名" maxlength="20" />
      <input v-model="password" type="password" placeholder="密码" @keyup.enter="submit" />
      <div v-if="error" class="error">{{ error }}</div>
      <button :disabled="loading" @click="submit">{{ loading ? '登录中…' : '登 录' }}</button>
      <label class="remember-row"><input type="checkbox" v-model="remember" /> 记住我的账号密码</label>
      <div v-if="savedLogins.length" class="quick-box">
        <button class="quick-btn" :disabled="loading" @click="quickLogin(savedLogins[0].u)">{{ loading ? '登录中…' : '⚡ 快捷登录（' + savedLogins[0].u + '）' }}</button>
        <button type="button" class="quick-toggle" @click="showList = !showList">{{ showList ? '收起账号列表 ▲' : '更多账号 ▾' }}</button>
        <div v-if="showList" class="quick-list">
          <div v-for="acc in savedLogins" :key="acc.u" class="quick-item">
            <span class="qi-name" @click="quickLogin(acc.u)">{{ acc.u }}</span>
            <span class="qi-del" title="移除该账号" @click="removeAcc(acc.u)">✕</span>
          </div>
        </div>
      </div>
      <div class="links">
        <router-link to="/register">没有账号？去注册</router-link>
        <router-link to="/" class="guest">返回</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const savedLogins = computed(() => auth.savedLogins);
const remember = ref(true); // 记住我的账号密码
const showList = ref(false); // 展开已保存账号列表

async function quickLogin(u) {
  error.value = '';
  if (!u) return;
  loading.value = true;
  try {
    await auth.quickLogin(u);
    router.push('/');
  } catch (e) {
    error.value = e.message || '快捷登录失败';
  } finally {
    loading.value = false;
  }
}

function removeAcc(u) {
  auth.removeSavedLogin(u);
}

async function submit() {
  error.value = '';
  if (!username.value || !password.value) { error.value = '请输入用户名和密码'; return; }
  loading.value = true;
  try {
    await auth.login(username.value, password.value, remember.value);
    router.push('/');
  } catch (e) {
    error.value = e.message || '登录失败';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.auth-card { width: 90%; max-width: 360px; background: rgba(20,24,38,.92); border: 1px solid rgba(255,255,255,.12); border-radius: 14px; padding: 26px 22px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 10px 40px rgba(0,0,0,.5); }
.auth-card h2 { margin: 0; text-align: center; color: #e8ecf6; letter-spacing: 2px; }
.sub { margin: 0 0 6px; text-align: center; color: #9aa4bd; font-size: 13px; }
.auth-card input { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 8px; padding: 11px 12px; color: #e8ecf6; font-size: 15px; outline: none; }
.auth-card input:focus { border-color: #5b8cff; }
.auth-card button { margin-top: 4px; background: linear-gradient(180deg,#5b8cff,#3f6fe0); border: none; border-radius: 8px; padding: 12px; color: #fff; font-size: 16px; letter-spacing: 4px; cursor: pointer; }
.auth-card button:disabled { opacity: .6; cursor: default; }
.auth-card .quick-btn { background: linear-gradient(180deg,#3fae7a,#2e8c60); letter-spacing: 1px; font-size: 15px; }
.quick-box { display: flex; flex-direction: column; gap: 6px; }
.quick-toggle { background: transparent; border: none; color: #8fb0ff; font-size: 12px; cursor: pointer; padding: 2px; letter-spacing: 0; }
.quick-list { border: 1px solid rgba(255,255,255,.12); border-radius: 8px; max-height: 180px; overflow-y: auto; }
.quick-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; cursor: pointer; }
.quick-item + .quick-item { border-top: 1px solid rgba(255,255,255,.08); }
.quick-item:hover { background: rgba(91,140,255,.12); }
.qi-name { color: #e8ecf6; font-size: 14px; }
.qi-del { color: #9aa4bd; font-size: 13px; padding: 0 4px; cursor: pointer; }
.qi-del:hover { color: #ff7b7b; }
.error { color: #ff7b7b; font-size: 13px; text-align: center; }
.remember-row { display: flex; align-items: center; gap: 6px; color: #9aa4bd; font-size: 13px; cursor: pointer; margin-top: 2px; }
.remember-row input { width: 15px; height: 15px; accent-color: #3f6fe0; cursor: pointer; }
.links { display: flex; justify-content: space-between; font-size: 13px; margin-top: 4px; }
.links a { color: #8fb0ff; text-decoration: none; }
.links .guest { color: #9aa4bd; cursor: pointer; }
</style>
