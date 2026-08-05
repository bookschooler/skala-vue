<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

// 홈의 지도 레이아웃은 그대로 두되, 네비게이션은 고정 오버레이로 올려
// 세로 공간을 추가로 차지하지 않게 한다.
const isWeatherHome = computed(() => route.name === 'WeatherHome')
</script>

<template>
  <div class="app-shell">
    <nav class="utility-navigation" :class="{ 'utility-navigation--home': isWeatherHome }" aria-label="날씨요정 공통 메뉴">
      <RouterLink v-if="!isWeatherHome" class="utility-navigation__brand" to="/" aria-label="WEATHER FAIRY 홈">
        <span>WEATHER</span><strong>FAIRY</strong>
      </RouterLink>
      <div class="utility-navigation__links" aria-label="페이지 이동">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/community">Today’s Sky</RouterLink>
      </div>
      <div class="utility-navigation__auth" aria-label="계정 메뉴">
        <RouterLink to="/login">LOG IN</RouterLink>
        <span aria-hidden="true">|</span>
        <RouterLink to="/join">JOIN</RouterLink>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
html,
body,
#app {
  margin: 0;
  min-width: 0;
  min-height: 100vh;
  background: #02050d;
  font-family: Pretendard, 'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif;
}
button,
input {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
}

.utility-navigation {
  display: flex;
  align-items: center;
  position: fixed;
  z-index: 30;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 64px;
  padding: 0 clamp(16px, 3vw, 34px);
  color: #dbe8ff;
  pointer-events: none;
}

.utility-navigation__brand {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  color: #eaf4ff;
  font-family: 'Arial Narrow', 'Helvetica Neue', sans-serif;
  letter-spacing: 0.16em;
  text-decoration: none;
  white-space: nowrap;
  pointer-events: auto;
  text-shadow: 0 0 14px rgba(104, 213, 255, 0.34);
}

.utility-navigation__links {
  display: flex;
  position: absolute;
  left: 50%;
  align-items: center;
  gap: 4px;
  pointer-events: auto;
  transform: translateX(-50%);
}

.utility-navigation__links a {
  padding: 9px 11px;
  color: #9ab7c9;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.utility-navigation__links a:hover,
.utility-navigation__links a:focus-visible,
.utility-navigation__links a.router-link-exact-active {
  color: #e9f8ff;
  background: rgba(55, 152, 232, 0.14);
  border-color: rgba(87, 201, 255, 0.42);
  box-shadow: 0 0 14px rgba(34, 174, 255, 0.15);
  outline: none;
}

.utility-navigation__auth {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  color: #416276;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.07em;
  pointer-events: auto;
  white-space: nowrap;
}

.utility-navigation__auth a {
  color: #9ab7c9;
  text-decoration: none;
}

.utility-navigation__auth a:last-child,
.utility-navigation__auth a:hover,
.utility-navigation__auth a:focus-visible {
  color: #b9e8ff;
  outline: none;
}

/* 홈의 우측 온도·즐겨찾기 도구와 겹치지 않도록 로그인 영역만 앞쪽으로 옮긴다. */
.utility-navigation--home .utility-navigation__auth {
  margin-right: clamp(118px, 12vw, 178px);
}

.utility-navigation__brand span {
  color: #d2e2eb;
  font-size: clamp(18px, 1.55vw, 25px);
  font-weight: 400;
}

.utility-navigation__brand strong {
  color: #f0f8ff;
  font-size: clamp(30px, 2.55vw, 40px);
  font-weight: 700;
  letter-spacing: 0.08em;
}

@media (max-width: 720px) {
  .utility-navigation {
    min-height: 54px;
    padding: 0 12px;
  }

  .utility-navigation__links {
    position: static;
    margin-left: auto;
    transform: none;
  }

  .utility-navigation--home .utility-navigation__auth {
    margin-right: 96px;
  }

  .utility-navigation__links a {
    padding: 7px 8px;
    font-size: 11px;
  }
}

@media (max-width: 500px) {
  .utility-navigation__links a:first-child,
  .utility-navigation__auth span {
    display: none;
  }

  .utility-navigation__auth {
    gap: 4px;
    font-size: 10px;
  }
}
</style>
