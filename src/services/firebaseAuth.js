import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const firebaseApp = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null
const auth = firebaseApp ? getAuth(firebaseApp) : null

export const observeFirebaseAuth = (onUserChanged) => {
  if (!auth) {
    onUserChanged(null)
    return () => {}
  }
  return onAuthStateChanged(auth, onUserChanged)
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Google 로그인 설정이 아직 연결되지 않았어요.')

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(auth, provider)
}

export const signOutFromFirebase = async () => {
  if (!auth) return
  await signOut(auth)
}
