<script setup>
import WeatherParent from './components/WeatherParent.vue'
</script>

<template>
  <div class="app-container">
    <h1>🌤️ 날씨 대시보드 </h1>
    <WeatherParent />
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 20px;
  color: #35495e;
}

h1 small {
  font-size: 0.9rem;
  font-weight: normal;
  color: #7f8c9a;
}
</style>
