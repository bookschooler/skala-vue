<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

// 홈은 확정된 전체 지도 레이아웃을 그대로 사용하고,
// 공통 메뉴는 지도와 하늘 기록 두 목적지로만 단순화한다.
const showUtilityNavigation = computed(() => route.name !== 'WeatherHome')
</script>

<template>
  <div class="app-shell">
    <nav v-if="showUtilityNavigation" class="utility-navigation" aria-label="날씨요정 공통 메뉴">
      <RouterLink class="utility-navigation__brand" to="/">WEATHER FAIRY</RouterLink>

      <div class="utility-navigation__links" aria-label="페이지 이동">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/community">Today’s Sky</RouterLink>
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
  gap: 28px;
  width: min(1120px, calc(100% - 32px));
  min-height: 68px;
  margin: 0 auto;
  color: #dbe8ff;
}

.utility-navigation__brand {
  color: #eaf4ff;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-decoration: none;
  white-space: nowrap;
}

.utility-navigation__links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.utility-navigation__links a {
  padding: 8px 10px;
  color: #9cafc8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.utility-navigation__links a:hover,
.utility-navigation__links a:focus-visible,
.utility-navigation__links a.router-link-exact-active {
  color: #ecf7ff;
  background: rgba(102, 174, 255, 0.14);
  outline: none;
}

@media (max-width: 720px) {
  .utility-navigation {
    flex-wrap: wrap;
    gap: 10px 16px;
    width: calc(100% - 24px);
    padding: 14px 0;
  }

  .utility-navigation__links {
    order: 3;
    width: 100%;
  }
}
</style>
