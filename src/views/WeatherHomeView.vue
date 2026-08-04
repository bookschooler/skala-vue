<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/practices/router_day3/BaseDashboardCard.vue'
import SearchBar from '../components/practices/router_day3/SearchBar.vue'
import WeatherCard from '../components/practices/router_day3/WeatherCard.vue'
import { cityCatalog } from '../data/cityCatalog.js'
import {
  fetchCurrentWeather,
  isWeatherRequestCanceled,
  WeatherConfigError,
} from '../services/openWeatherService.js'

const router = useRouter()
const weatherList = ref([])
const failedCityIds = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedCityId = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  return query
    ? weatherList.value.filter((weather) => weather.name.includes(query))
    : weatherList.value
})
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}
const showDetail = (cityId) => router.push(`/weather/${cityId}`)
let activeController
let batchId = 0

const sortByCatalog = (list) =>
  [...list].sort(
    (first, second) =>
      cityCatalog.findIndex((city) => city.id === first.id) -
      cityCatalog.findIndex((city) => city.id === second.id),
  )

const loadWeather = async (cities = cityCatalog) => {
  activeController?.abort()
  activeController = new AbortController()
  const currentBatchId = ++batchId
  isLoading.value = true
  errorMessage.value = ''

  try {
    const results = await Promise.allSettled(
      cities.map((city) => fetchCurrentWeather(city, { signal: activeController.signal })),
    )
    if (currentBatchId !== batchId) return

    const succeeded = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
    const failed = results
      .map((result, index) => ({ result, city: cities[index] }))
      .filter(
        ({ result }) => result.status === 'rejected' && !isWeatherRequestCanceled(result.reason),
      )

    const succeededIds = new Set(succeeded.map((weather) => weather.id))
    weatherList.value = sortByCatalog([
      ...weatherList.value.filter((weather) => !succeededIds.has(weather.id)),
      ...succeeded,
    ])
    failedCityIds.value = failed.map(({ city }) => city.id)

    if (failed.length > 0) {
      const hasConfigError = failed.some(
        ({ result }) => result.reason instanceof WeatherConfigError,
      )
      errorMessage.value = hasConfigError
        ? 'API 키가 없습니다. .env.local 파일에 VITE_OPENWEATHER_API_KEY를 설정해 주세요.'
        : `${failed.map(({ city }) => city.name).join(', ')} 날씨 정보를 불러오지 못했습니다.`
    }

    if (failedCityIds.value.includes(selectedCityId.value)) {
      selectedCityId.value = ''
      selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
    }
  } catch (error) {
    if (currentBatchId === batchId && !isWeatherRequestCanceled(error)) {
      console.error('날씨 정보를 불러오는 중 오류가 발생했습니다.', error.name)
      errorMessage.value = '날씨 정보를 불러오지 못했습니다.'
    }
  } finally {
    if (currentBatchId === batchId) isLoading.value = false
  }
}

const retryFailed = () => {
  const retryCities = cityCatalog.filter((city) => failedCityIds.value.includes(city.id))
  return loadWeather(retryCities.length > 0 ? retryCities : cityCatalog)
}

onMounted(() => loadWeather())
onBeforeUnmount(() => {
  batchId += 1
  activeController?.abort()
})
</script>

<template>
  <main class="weather-dashboard">
    <header class="page-header">
      <div>
        <p class="eyebrow">SKALA WEATHER</p>
        <h1>🌤️ 지역별 날씨 대시보드</h1>
        <p class="header-description">오늘의 지역별 날씨를 한눈에 확인해 보세요.</p>
      </div>
      <span class="today-badge">TODAY</span>
    </header>
    <BaseDashboardCard
      ><SearchBar :current-query="searchQuery" @update-query="searchQuery = $event"
    /></BaseDashboardCard>
    <BaseDashboardCard>
      <h2 class="weather-title">🏙️ 지역별 날씨 현황</h2>
      <div class="request-status" aria-live="polite">
        <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>
        <div v-else-if="errorMessage" class="error-message" role="alert">
          <p>{{ errorMessage }}</p>
          <button type="button" :disabled="isLoading" @click="retryFailed">
            {{ isLoading ? '다시 불러오는 중...' : '다시 시도' }}
          </button>
        </div>
      </div>
      <div v-if="!isLoading || weatherList.length > 0" class="weather-list">
        <WeatherCard
          v-for="weather in filteredWeatherList"
          :key="weather.id"
          :city-item="weather"
          :is-selected="selectedCityId === weather.id"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
        <p
          v-if="!errorMessage && filteredWeatherList.length === 0"
          class="empty-message"
          role="status"
        >
          검색 결과와 일치하는 도시가 없습니다.
        </p>
      </div>
    </BaseDashboardCard>
    <footer class="status-bar" aria-live="polite">{{ selectedCityInfo }}</footer>
  </main>
</template>

<style scoped>
.weather-dashboard {
  width: min(720px, calc(100% - 32px));
  margin: 40px auto;
  padding: 32px;
  color: #1f2f46;
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(42, 62, 92, 0.13);
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 4px 4px 24px;
  border-bottom: 1px solid #e5eaf0;
}
.page-header h1 {
  margin: 3px 0 7px;
  font-size: 26px;
  line-height: 1.35;
}
.eyebrow {
  margin: 0;
  color: #4b78e6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
}
.header-description {
  margin: 0;
  color: #7a8798;
  font-size: 14px;
}
.today-badge {
  padding: 8px 11px;
  color: #426bd1;
  background: #edf3ff;
  border: 1px solid #dbe6ff;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
}
.weather-title {
  margin: 0 0 13px;
  font-size: 17px;
}
.weather-list {
  display: grid;
  gap: 13px;
}
.request-status p {
  margin: 0 0 13px;
}
.error-message {
  margin-bottom: 13px;
  padding: 14px;
  color: #9b343b;
  background: #fff5f5;
  border: 1px solid #f3d4d6;
  border-radius: 12px;
}
.error-message button {
  padding: 8px 12px;
  color: #fff;
  background: #c8434b;
  border: 0;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.error-message button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.empty-message {
  margin: 0;
  padding: 24px 16px;
  color: #c8434b;
  background: #fff5f5;
  border: 1px solid #f3d4d6;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
.status-bar {
  margin-top: 20px;
  padding: 15px 18px;
  color: #247447;
  background: #eaf7ef;
  border: 1px solid #d6eddf;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
@media (max-width: 520px) {
  .weather-dashboard {
    width: calc(100% - 20px);
    margin: 18px auto;
    padding: 18px;
    border-radius: 18px;
  }
  .page-header {
    gap: 12px;
  }
  .page-header h1 {
    font-size: 22px;
  }
  .header-description {
    font-size: 13px;
  }
}
</style>
