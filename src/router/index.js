import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Hash history는 서버의 SPA fallback 설정 없이도 직접 접속과 새로고침을 지원한다.
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: () => import('../views/WeatherHomeView.vue'),
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
