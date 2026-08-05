<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

// 홈은 확정된 전체 지도 레이아웃을 그대로 사용하고,
// 과제에서 요구한 공통 메뉴는 상세·예보·소개 화면에 제공한다.
const showUtilityNavigation = computed(() => route.name !== 'WeatherHome')
</script>

<template>
  <div class="app-shell">
    <nav v-if="showUtilityNavigation" class="utility-navigation" aria-label="날씨요정 공통 메뉴">
      <RouterLink class="utility-navigation__brand" to="/">WEATHER FAIRY</RouterLink>
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
  gap: 16px;
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 64px;
  padding: 0 clamp(16px, 3vw, 34px);
  color: #dbe8ff;
  pointer-events: none;
}

.utility-navigation__brand {
  color: #eaf4ff;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-decoration: none;
  white-space: nowrap;
  pointer-events: auto;
  text-shadow: 0 0 14px rgba(104, 213, 255, 0.34);
}

@media (max-width: 720px) {
  .utility-navigation {
    min-height: 56px;
    padding: 0 12px;
  }
}
</style>
