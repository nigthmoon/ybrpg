<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>登录账号</h2>
      <p class="sub">登录后可云端保存角色与进度</p>
      <input v-model.trim="username" placeholder="用户名" maxlength="20" />
      <input v-model="password" type="password" placeholder="密码" @keyup.enter="submit" />
      <div v-if="error" class="error">{{ error }}</div>
      <button :disabled="loading" @click="submit">{{ loading ? '登录中…' : '登 录' }}</button>
      <div class="links">
        <router-link to="/register">没有账号？去注册</router-link>
        <router-link to="/" class="guest">返回</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (!username.value || !password.value) { error.value = '请输入用户名和密码'; return; }
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
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
.error { color: #ff7b7b; font-size: 13px; text-align: center; }
.links { display: flex; justify-content: space-between; font-size: 13px; margin-top: 4px; }
.links a { color: #8fb0ff; text-decoration: none; }
.links .guest { color: #9aa4bd; cursor: pointer; }
</style>
