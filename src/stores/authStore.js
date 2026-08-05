import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  isFirebaseConfigured,
  observeFirebaseAuth,
  signInWithGoogle,
  signOutFromFirebase,
} from '../services/firebaseAuth.js'

const getAuthErrorMessage = (error) => {
  if (error?.code === 'auth/popup-closed-by-user') return '로그인 창을 닫았어요. 다시 시도해 주세요.'
  if (error?.code === 'auth/popup-blocked') return '팝업이 차단되었어요. 브라우저에서 팝업을 허용해 주세요.'
  if (error?.code === 'auth/unauthorized-domain') {
    return '이 주소가 Firebase 승인 도메인에 등록되지 않았어요.'
  }
  return error?.message || 'Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitializing = ref(false)
  const isSigningIn = ref(false)
  const errorMessage = ref('')
  let unsubscribe

  const isConfigured = computed(() => isFirebaseConfigured)
  const displayName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || '날씨요정')

  function initialize() {
    if (unsubscribe) return
    isInitializing.value = true
    unsubscribe = observeFirebaseAuth((nextUser) => {
      user.value = nextUser
      isInitializing.value = false
    })
  }

  async function signIn() {
    errorMessage.value = ''
    isSigningIn.value = true
    try {
      const result = await signInWithGoogle()
      user.value = result.user
      return result.user
    } catch (error) {
      errorMessage.value = getAuthErrorMessage(error)
      throw error
    } finally {
      isSigningIn.value = false
    }
  }

  async function signOut() {
    errorMessage.value = ''
    try {
      await signOutFromFirebase()
      user.value = null
    } catch (error) {
      errorMessage.value = getAuthErrorMessage(error)
      throw error
    }
  }

  return {
    user,
    isInitializing,
    isSigningIn,
    errorMessage,
    isConfigured,
    displayName,
    initialize,
    signIn,
    signOut,
  }
})
