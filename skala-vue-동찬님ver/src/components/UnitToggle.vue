<script setup>
import { inject } from 'vue'

// 부모(WeatherParent)가 provide한 단위 상태를 inject로 받아 사용한다.
// props 단계를 거치지 않고 조상 → 후손으로 직접 전달되는 것이 포인트.
const { unit, unitSymbol, toggleUnit } = inject('weather-unit')
</script>

<template>
  <button class="unit-toggle" type="button" @click="toggleUnit">
    <strong>{{ unitSymbol }}</strong>
    <span class="next">{{ unit === 'celsius' ? '℉로 보기' : '℃로 보기' }}</span>
  </button>
</template>

<style scoped>
.unit-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #f0c869;
  border-radius: 20px;
  background-color: #fff7e0;
  color: #8a6d1d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.unit-toggle:hover {
  background-color: #ffedbf;
}

.next {
  font-size: 0.8rem;
}
</style>
