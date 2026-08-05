<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  mode: {
    type: String,
    default: 'login',
  },
})

const form = reactive({ name: '', email: '', password: '', passwordConfirm: '' })
const message = ref('')
const isJoin = computed(() => props.mode === 'join')
const title = computed(() => (isJoin.value ? 'WEATHER FAIRY에 함께하기' : '다시 만나서 반가워요'))
const description = computed(() => (
  isJoin.value
    ? '나만의 하늘 기록을 저장하고, 다른 사람의 오늘을 만나 보세요.'
    : '저장해 둔 도시와 하늘 기록을 이어서 확인해 보세요.'
))

function submitForm() {
  message.value = ''
  if (!form.email || !form.password || (isJoin.value && !form.name)) {
    message.value = '필수 항목을 모두 입력해 주세요.'
    return
  }
  if (isJoin.value && form.password !== form.passwordConfirm) {
    message.value = '비밀번호 확인이 일치하지 않아요.'
    return
  }

  message.value = isJoin.value
    ? '가입 정보를 확인했어요. 실제 계정 저장은 인증 API를 연결하면 바로 이어갈 수 있어요.'
    : '로그인 정보를 확인했어요. 실제 인증 API 연결 전의 화면입니다.'
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" :aria-labelledby="`${mode}-title`">
      <RouterLink class="auth-brand" to="/" aria-label="WEATHER FAIRY 홈">WEATHER <strong>FAIRY</strong></RouterLink>
      <p class="eyebrow">{{ isJoin ? 'JOIN WEATHER FAIRY' : 'WELCOME BACK' }}</p>
      <h1 :id="`${mode}-title`">{{ title }}</h1>
      <p class="auth-description">{{ description }}</p>

      <form class="auth-form" @submit.prevent="submitForm">
        <label v-if="isJoin">
          이름
          <input v-model.trim="form.name" type="text" autocomplete="name" placeholder="이름을 입력해 주세요" required />
        </label>
        <label>
          이메일
          <input v-model.trim="form.email" type="email" autocomplete="email" placeholder="name@example.com" required />
        </label>
        <label>
          비밀번호
          <input v-model="form.password" type="password" :autocomplete="isJoin ? 'new-password' : 'current-password'" placeholder="8자 이상 입력해 주세요" minlength="8" required />
        </label>
        <label v-if="isJoin">
          비밀번호 확인
          <input v-model="form.passwordConfirm" type="password" autocomplete="new-password" placeholder="비밀번호를 다시 입력해 주세요" minlength="8" required />
        </label>
        <p v-if="message" class="form-message" role="status">{{ message }}</p>
        <button type="submit">{{ isJoin ? '가입하기' : '로그인' }}</button>
      </form>

      <p class="auth-switch">
        {{ isJoin ? '이미 계정이 있으신가요?' : 'WEATHER FAIRY가 처음이신가요?' }}
        <RouterLink :to="isJoin ? '/login' : '/join'">{{ isJoin ? 'LOG IN' : 'JOIN' }}</RouterLink>
      </p>
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
.auth-form { display: grid; gap: 15px; }
.auth-form label { display: grid; gap: 7px; color: #b9d2df; font-size: 12px; font-weight: 800; }
.auth-form input { width: 100%; min-height: 47px; padding: 0 13px; color: #e8f8ff; background: #030d18; border: 1px solid #28546e; border-radius: 9px; outline: none; font: inherit; font-size: 14px; }
.auth-form input:focus { border-color: #5bd4ff; box-shadow: 0 0 0 3px rgba(53, 186, 255, .13); }
.auth-form button { min-height: 49px; margin-top: 6px; color: #effbff; background: linear-gradient(110deg, #126b9f, #1d9dd0); border: 1px solid #62d6ff; border-radius: 9px; box-shadow: 0 0 18px rgba(34, 177, 244, .2); cursor: pointer; font: inherit; font-size: 14px; font-weight: 900; }
.auth-form button:hover { filter: brightness(1.12); }
.form-message { margin: -2px 0 0; color: #aee7fa; font-size: 12px; line-height: 1.5; }
.auth-switch { margin: 24px 0 0; color: #89a5b6; font-size: 12px; text-align: center; }
.auth-switch a { margin-left: 7px; color: #8adfff; font-weight: 900; text-decoration: none; }
.auth-switch a:hover, .auth-switch a:focus-visible { color: #effbff; outline: none; text-decoration: underline; }
@media (max-width: 560px) { .auth-page { min-height: calc(100vh - 116px); padding: 20px 12px 36px; } .auth-card { padding: 30px 22px; } .eyebrow { margin-top: 30px; } }
</style>
