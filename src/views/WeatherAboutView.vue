<script setup>
import { RouterLink } from 'vue-router'
import BuildEnvironmentInfo from '../components/weather/BuildEnvironmentInfo.vue'
</script>

<template>
  <main class="info-page">
    <section class="info-card">
      <p class="eyebrow">ABOUT SKALA WEATHER</p>
      <h1>지역 날씨를 쉽고 빠르게 확인하세요</h1>
      <p>
        SKALA Weather는 도시별 현재 날씨를 검색하고 상세 관측 정보를 확인하는 Vue 실습 서비스입니다.
      </p>
      <ul>
        <li>Vue 3 Composition API 기반 반응형 검색과 선택</li>
        <li>Vue Router를 활용한 홈·소개·상세 화면 전환</li>
        <li>키보드로도 사용할 수 있는 접근 가능한 날씨 카드</li>
        <li>정적 호스팅 새로고침을 지원하는 Hash 라우팅</li>
      </ul>
      <RouterLink class="home-link" to="/">날씨 대시보드 보기</RouterLink>
      <BuildEnvironmentInfo />
    </section>
  </main>
</template>

<style scoped>
.info-page {
  width: min(760px, calc(100% - 32px));
  margin: 52px auto;
}
.info-card {
  padding: 42px;
  color: #1f2f46;
  background: #fff;
  border: 1px solid #e3eaf3;
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(42, 62, 92, 0.13);
}
.eyebrow {
  margin: 0;
  color: #4b78e6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
}
h1 {
  margin: 8px 0 14px;
  font-size: 30px;
}
p,
li {
  color: #68768a;
  line-height: 1.7;
}
ul {
  margin: 24px 0 30px;
  padding-left: 22px;
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
@media (max-width: 560px) {
  .info-page {
    width: calc(100% - 20px);
    margin: 20px auto;
  }
  .info-card {
    padding: 24px 18px;
  }
  h1 {
    font-size: 25px;
  }
}
</style>
