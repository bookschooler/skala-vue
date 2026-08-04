<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found-page">
    <section class="not-found-card">
      <p class="code">404</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소가 잘못 입력되었거나 페이지가 이동되었을 수 있습니다.</p>
      <RouterLink class="home-link" to="/">날씨 메인으로 이동</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  width: min(680px, calc(100% - 32px));
  margin: 70px auto;
}
.not-found-card {
  padding: 54px 30px;
  color: #1f2f46;
  background: #fff;
  border: 1px solid #e3eaf3;
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(42, 62, 92, 0.13);
  text-align: center;
}
.code {
  margin: 0;
  color: #4f77d9;
  font-size: 64px;
  font-weight: 900;
}
h1 {
  margin: 4px 0 12px;
}
.not-found-card > p:not(.code) {
  margin-bottom: 28px;
  color: #68768a;
}
.home-link {
  display: inline-block;
  padding: 11px 16px;
  color: #fff;
  background: #4f77d9;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
}
.home-link:focus-visible {
  outline: 3px solid rgba(74, 119, 226, 0.35);
  outline-offset: 3px;
}
</style>
