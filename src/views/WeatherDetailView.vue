<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useConfigStore } from '../stores/configStore.js'

const route = useRoute()
const configStore = useConfigStore()
const selectedWeather = ref(null)
const weatherDetails = [
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    humidity: 58,
    wind: 2.4,
    description: '햇살이 강하고 활동하기 좋은 날씨입니다.',
  },
  {
    id: 'city_02',
    name: '성남',
    temp: 27,
    status: '구름',
    humidity: 64,
    wind: 1.8,
    description: '구름이 많지만 비 소식은 없습니다.',
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    humidity: 72,
    wind: 4.1,
    description: '해안 바람과 함께 구름이 지나가고 있습니다.',
  },
  {
    id: 'city_04',
    name: '천안',
    temp: 24,
    status: '비',
    humidity: 81,
    wind: 3.2,
    description: '비가 내리고 있으니 우산을 챙겨 주세요.',
  },
]
const selectWeather = (cityId) => {
  selectedWeather.value = weatherDetails.find((weather) => weather.id === cityId) ?? null
}
const displayTemp = computed(() => {
  if (!selectedWeather.value) return null

  const rawTemp = selectedWeather.value.temp
  return configStore.unit === 'fahrenheit' ? Math.round((rawTemp * 9) / 5 + 32) : rawTemp
})
onMounted(() => selectWeather(route.params.cityId))
watch(
  () => route.params.cityId,
  (cityId) => selectWeather(cityId),
)
</script>

<template>
  <main class="detail-page">
    <section v-if="selectedWeather" class="detail-card">
      <p class="eyebrow">WEATHER DETAIL</p>
      <h1>{{ selectedWeather.name }} 상세 날씨</h1>
      <p class="summary">{{ selectedWeather.description }}</p>
      <dl class="weather-grid">
        <div>
          <dt>현재 기온</dt>
          <dd>{{ displayTemp }}{{ configStore.unitSymbol }}</dd>
        </div>
        <div>
          <dt>기상 상태</dt>
          <dd>{{ selectedWeather.status }}</dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd>{{ selectedWeather.humidity }}%</dd>
        </div>
        <div>
          <dt>풍속</dt>
          <dd>{{ selectedWeather.wind }} m/s</dd>
        </div>
      </dl>
      <RouterLink class="home-link" to="/">← 메인 대시보드로</RouterLink>
    </section>
    <section v-else class="detail-card empty" role="status">
      <p class="empty-icon">🌫️</p>
      <h1>도시 정보를 찾을 수 없습니다</h1>
      <p>요청한 도시 ID({{ route.params.cityId }})에 해당하는 날씨 데이터가 없습니다.</p>
      <RouterLink class="home-link" to="/">메인 대시보드로 돌아가기</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.detail-page {
  width: min(760px, calc(100% - 32px));
  margin: 52px auto;
}
.detail-card {
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
  margin: 8px 0 10px;
  font-size: 30px;
}
.summary {
  margin: 0 0 28px;
  color: #68768a;
}
.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin: 0 0 30px;
}
.weather-grid div {
  padding: 20px;
  background: #f5f8fc;
  border: 1px solid #e4eaf2;
  border-radius: 14px;
}
dt {
  margin-bottom: 8px;
  color: #748197;
  font-size: 13px;
}
dd {
  margin: 0;
  color: #27405f;
  font-size: 22px;
  font-weight: 800;
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
.empty {
  text-align: center;
}
.empty-icon {
  margin: 0;
  font-size: 48px;
}
.empty p:not(.empty-icon) {
  color: #68768a;
}
@media (max-width: 560px) {
  .detail-page {
    width: calc(100% - 20px);
    margin: 20px auto;
  }
  .detail-card {
    padding: 24px 18px;
  }
  .weather-grid {
    grid-template-columns: 1fr;
  }
  h1 {
    font-size: 25px;
  }
}
</style>
