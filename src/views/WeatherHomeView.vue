<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/practices/router_day3/BaseDashboardCard.vue'
import SearchBar from '../components/practices/router_day3/SearchBar.vue'
import WeatherCard from '../components/practices/router_day3/WeatherCard.vue'

const router = useRouter()
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '성남', temp: 27, status: '구름' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '천안', temp: 24, status: '비' },
])
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
      <div class="weather-list">
        <WeatherCard
          v-for="weather in filteredWeatherList"
          :key="weather.id"
          :city-item="weather"
          :is-selected="selectedCityId === weather.id"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
        <p v-if="filteredWeatherList.length === 0" class="empty-message" role="status">
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
