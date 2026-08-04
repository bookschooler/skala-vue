<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { findCityById } from '../data/cityCatalog.js'
import {
  fetchCurrentWeather,
  isWeatherRequestCanceled,
  WeatherConfigError,
} from '../services/openWeatherService.js'
import { useConfigStore } from '../stores/configStore.js'

const route = useRoute()
const configStore = useConfigStore()
const selectedWeather = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isNotFound = ref(false)
let activeController
let requestId = 0

const loadWeather = async (cityId = route.params.cityId) => {
  activeController?.abort()
  const currentRequestId = ++requestId
  selectedWeather.value = null
  errorMessage.value = ''
  const city = findCityById(cityId)
  isNotFound.value = !city
  if (!city) {
    isLoading.value = false
    return
  }

  activeController = new AbortController()
  isLoading.value = true
  try {
    const weather = await fetchCurrentWeather(city, { signal: activeController.signal })
    if (currentRequestId === requestId) selectedWeather.value = weather
  } catch (error) {
    if (currentRequestId !== requestId || isWeatherRequestCanceled(error)) return
    console.error('상세 날씨 정보를 불러오는 중 오류가 발생했습니다.', error.name)
    errorMessage.value =
      error instanceof WeatherConfigError
        ? 'API 키가 없습니다. .env.local 파일에 VITE_OPENWEATHER_API_KEY를 설정해 주세요.'
        : '날씨 정보를 불러오지 못했습니다.'
  } finally {
    if (currentRequestId === requestId) isLoading.value = false
  }
}
const displayTemp = computed(() => {
  if (!selectedWeather.value) return null

  const rawTemp = selectedWeather.value.temp
  return configStore.unit === 'fahrenheit' ? Math.round((rawTemp * 9) / 5 + 32) : rawTemp
})
watch(
  () => route.params.cityId,
  (cityId) => loadWeather(cityId),
  { immediate: true },
)
onBeforeUnmount(() => {
  requestId += 1
  activeController?.abort()
})
</script>

<template>
  <main class="detail-page">
    <section v-if="isLoading" class="detail-card empty" role="status">
      <p class="empty-icon">⏳</p>
      <h1>날씨 정보를 불러오는 중입니다</h1>
    </section>
    <section v-else-if="errorMessage" class="detail-card empty" role="alert">
      <p class="empty-icon">⚠️</p>
      <h1>날씨 정보를 불러오지 못했습니다</h1>
      <p>{{ errorMessage }}</p>
      <button type="button" class="retry-button" :disabled="isLoading" @click="loadWeather()">
        다시 시도
      </button>
      <RouterLink class="home-link secondary" to="/">메인 대시보드로 돌아가기</RouterLink>
    </section>
    <section v-else-if="selectedWeather" class="detail-card">
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
    <section v-else-if="isNotFound" class="detail-card empty" role="status">
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
.retry-button {
  margin-right: 8px;
  padding: 11px 16px;
  color: #fff;
  background: #c8434b;
  border: 0;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}
.home-link.secondary {
  color: #3c5474;
  background: #edf2f8;
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
