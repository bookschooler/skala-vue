<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const authStore = useAuthStore()

onMounted(() => authStore.initialize())

async function signIn() {
  try {
    await authStore.signIn()
  } catch {
    // 실패 원인은 store의 errorMessage로 사용자에게 표시한다.
  }
}

async function signOut() {
  try {
    await authStore.signOut()
  } catch {
    // 실패 원인은 store의 errorMessage로 사용자에게 표시한다.
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" aria-labelledby="login-title">
      <RouterLink class="auth-brand" to="/" aria-label="WEATHER FAIRY 홈">WEATHER <strong>FAIRY</strong></RouterLink>

      <template v-if="authStore.user">
        <p class="eyebrow">SIGNED IN</p>
        <h1 id="login-title">{{ authStore.displayName }}님, 반가워요</h1>
        <div class="signed-in-profile">
          <img v-if="authStore.user.photoURL" :src="authStore.user.photoURL" alt="Google 프로필 사진" />
          <span v-else aria-hidden="true">{{ authStore.displayName.slice(0, 1) }}</span>
          <div><b>{{ authStore.displayName }}</b><small>{{ authStore.user.email }}</small></div>
        </div>
        <p class="auth-description">Google 계정으로 로그인되어 있어요. 이제 별도 회원가입 없이 하늘 기록을 이어갈 수 있습니다.</p>
        <div class="auth-actions">
          <RouterLink class="home-button" to="/">홈으로 가기</RouterLink>
          <button class="logout-button" type="button" @click="signOut">로그아웃</button>
        </div>
      </template>

      <template v-else>
        <p class="eyebrow">WELCOME TO WEATHER FAIRY</p>
        <h1 id="login-title">Google 계정으로 시작하세요</h1>
        <p class="auth-description">별도 회원가입 없이 Google 계정으로 로그인하고, 나만의 하늘 기록을 저장해 보세요.</p>
        <button class="google-button" type="button" :disabled="authStore.isSigningIn || authStore.isInitializing" @click="signIn">
          <span class="google-button__mark" aria-hidden="true">G</span>
          {{ authStore.isSigningIn ? 'Google 로그인 중…' : 'Google 계정으로 로그인' }}
        </button>
        <p v-if="authStore.errorMessage" class="form-message" role="alert">{{ authStore.errorMessage }}</p>
        <p v-if="!authStore.isConfigured" class="auth-setup-note">
          Google 로그인 설정을 준비하고 있어요. Firebase 환경변수를 등록하면 이 버튼으로 바로 로그인할 수 있습니다.
        </p>
      </template>
    </section>
  </main>
</template>

<style scoped>
.auth-page { display: grid; min-height: calc(100vh - 68px); padding: 42px 20px 64px; background: radial-gradient(circle at 72% 12%, rgba(31, 134, 203, .2), transparent 27%), #020a16; place-items: center; }
.auth-card { width: min(470px, 100%); padding: 42px; color: #eaf7ff; background: rgba(5, 18, 32, .88); border: 1px solid rgba(81, 174, 225, .48); border-radius: 18px; box-shadow: 0 26px 70px rgba(0, 0, 0, .36), inset 0 1px 0 rgba(183, 232, 255, .08); }
.auth-brand { display: inline-block; color: #d8edf7; font-family: 'Arial Narrow', 'Helvetica Neue', sans-serif; font-size: 15px; font-weight: 400; letter-spacing: .13em; text-decoration: none; }
.auth-brand strong { color: #effbff; font-size: 22px; letter-spacing: .08em; }
.eyebrow { margin: 36px 0 7px; color: #6dd4ff; font-size: 11px; font-weight: 900; letter-spacing: .14em; }
h1 { margin: 0; font-size: clamp(27px, 4vw, 34px); letter-spacing: -.04em; }
.auth-description { margin: 12px 0 27px; color: #9bb4c3; font-size: 14px; line-height: 1.65; }
.google-button { display: flex; align-items: center; justify-content: center; gap: 11px; width: 100%; min-height: 50px; color: #23384b; background: #fff; border: 1px solid #c6d7e0; border-radius: 9px; box-shadow: 0 0 18px rgba(34, 177, 244, .16); cursor: pointer; font: inherit; font-size: 14px; font-weight: 900; }
.google-button:hover:not(:disabled) { background: #f6fbff; border-color: #62d6ff; transform: translateY(-1px); }
.google-button:disabled { opacity: .65; cursor: wait; }
.google-button__mark { display: grid; width: 23px; height: 23px; color: #4285f4; background: #fff; border: 1px solid #d7e2e8; border-radius: 50%; font-family: Arial, sans-serif; font-size: 15px; font-weight: 900; place-items: center; }
.form-message { margin: 13px 0 0; color: #ffb1bd; font-size: 12px; line-height: 1.5; }
.auth-setup-note { margin: 17px 0 0; padding: 11px 12px; color: #8eb9cd; background: rgba(9, 40, 61, .7); border: 1px solid #245675; border-radius: 8px; font-size: 11px; line-height: 1.6; }
.signed-in-profile { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding: 14px; background: rgba(7, 29, 47, .82); border: 1px solid #285e7c; border-radius: 11px; }
.signed-in-profile img, .signed-in-profile > span { display: grid; width: 44px; height: 44px; flex: 0 0 auto; color: #e9faff; background: #15557c; border: 1px solid #67d5fb; border-radius: 50%; object-fit: cover; place-items: center; }
.signed-in-profile div { display: grid; min-width: 0; gap: 3px; }
.signed-in-profile b, .signed-in-profile small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.signed-in-profile b { color: #effbff; font-size: 14px; }
.signed-in-profile small { color: #91b6c9; font-size: 11px; }
.auth-actions { display: flex; gap: 10px; margin-top: 25px; }
.home-button, .logout-button { display: inline-grid; min-height: 44px; flex: 1; padding: 0 12px; color: #effbff; border-radius: 9px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 900; place-items: center; text-decoration: none; }
.home-button { background: linear-gradient(110deg, #126b9f, #1d9dd0); border: 1px solid #62d6ff; }
.logout-button { color: #a8cadb; background: transparent; border: 1px solid #2c5d75; }
.home-button:hover, .logout-button:hover { filter: brightness(1.12); }
@media (max-width: 560px) { .auth-page { min-height: calc(100vh - 116px); padding: 20px 12px 36px; } .auth-card { padding: 30px 22px; } .eyebrow { margin-top: 30px; } }
</style>
