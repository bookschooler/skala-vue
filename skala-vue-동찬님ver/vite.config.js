import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 메인 프로젝트(skala-vue, 5173)와 동시에 띄울 수 있도록 5174 포트 사용
export default defineConfig({
  plugins: [vue()],
  build: {
    // 현재 실습 환경에서 lightningcss 네이티브 바이너리가 제공되지 않아 CSS 최소화만 비활성화한다.
    cssMinify: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
})
