<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/practices/store_day3_2/UnitToggler.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/">🌤️ SKALA Weather</RouterLink>
      <div class="header-actions">
        <nav aria-label="주요 메뉴">
          <RouterLink to="/">날씨 대시보드</RouterLink>
          <RouterLink to="/about">서비스 소개</RouterLink>
        </nav>
        <UnitToggler />
      </div>
    </header>
    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  min-width: 0;
  min-height: 100vh;
  background: #eef3f9;
  font-family: Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
}
button,
input {
  font: inherit;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 68px;
  padding: 12px max(24px, calc((100% - 1080px) / 2));
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #dde5ef;
}
.brand {
  color: #27405f;
  font-size: 18px;
  font-weight: 900;
  text-decoration: none;
}
.header-actions,
.app-header nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.app-header nav a {
  padding: 9px 12px;
  color: #65748a;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}
.app-header nav a:hover,
.app-header nav a.router-link-exact-active {
  color: #315fc5;
  background: #edf3ff;
}
.app-header a:focus-visible {
  outline: 3px solid rgba(74, 119, 226, 0.35);
  outline-offset: 2px;
}
@media (max-width: 600px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
  }
  .app-header nav {
    width: 100%;
  }
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .app-header nav a {
    flex: 1;
    text-align: center;
  }
}
</style>
