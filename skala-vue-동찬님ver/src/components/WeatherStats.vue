<script setup>
import { computed, inject } from 'vue'

// 통계는 원본 데이터(부모 소유)에서 파생만 한다 — 상태를 복제하지 않는 것이 원칙.
const props = defineProps({
  cityList: {
    type: Array,
    required: true,
  },
})

const { unitSymbol, convertTemp } = inject('weather-unit')

const stats = computed(() => {
  const list = props.cityList
  if (list.length === 0) return null
  const temps = list.map((item) => item.temp)
  const avg = temps.reduce((sum, t) => sum + t, 0) / list.length
  const hottest = list.reduce((a, b) => (b.temp > a.temp ? b : a))
  const coldest = list.reduce((a, b) => (b.temp < a.temp ? b : a))
  const hotCount = list.filter((item) => item.temp >= 25).length
  return { count: list.length, avg, hottest, coldest, hotCount }
})
</script>

<template>
  <div v-if="stats" class="stats-grid">
    <div class="stat-tile tile-city">
      <p class="stat-label">🏙️ 도시 수</p>
      <p class="stat-value">{{ stats.count }}곳</p>
    </div>
    <div class="stat-tile tile-avg">
      <p class="stat-label">🌡️ 평균 기온</p>
      <p class="stat-value">{{ convertTemp(stats.avg) }}{{ unitSymbol }}</p>
    </div>
    <div class="stat-tile tile-hot">
      <p class="stat-label">🔥 최고</p>
      <p class="stat-value">
        {{ stats.hottest.name }} {{ convertTemp(stats.hottest.temp) }}{{ unitSymbol }}
      </p>
    </div>
    <div class="stat-tile tile-cold">
      <p class="stat-label">❄️ 최저</p>
      <p class="stat-value">
        {{ stats.coldest.name }} {{ convertTemp(stats.coldest.temp) }}{{ unitSymbol }}
      </p>
    </div>
    <div class="stat-tile tile-count">
      <p class="stat-label">🥵 더운 도시 (25℃↑)</p>
      <p class="stat-value">{{ stats.hotCount }}곳</p>
    </div>
  </div>
  <p v-else class="stats-empty">표시할 도시가 없습니다.</p>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.stat-tile {
  padding: 12px 14px;
  border-radius: 12px;
  text-align: center;
}

.tile-city {
  background-color: #eef2f7;
}

.tile-avg {
  background-color: #fff7e0;
}

.tile-hot {
  background-color: #fdeaea;
}

.tile-cold {
  background-color: #e3edf9;
}

.tile-count {
  background-color: #f4e8fb;
}

.stat-label {
  font-size: 0.82rem;
  color: #6b7a8c;
}

.stat-value {
  margin-top: 4px;
  font-weight: bold;
  color: #35495e;
}

.stats-empty {
  color: #888;
}
</style>
