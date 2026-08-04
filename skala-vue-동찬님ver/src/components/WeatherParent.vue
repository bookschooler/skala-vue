<script setup>
import { ref, computed, watch, watchEffect, provide, onMounted, onUnmounted } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherStats from './WeatherStats.vue'
import CityForm from './CityForm.vue'
import UnitToggle from './UnitToggle.vue'
import WeatherDetailPanel from './WeatherDetailPanel.vue'
import { STATUS_OPTIONS, statusEmoji } from '../utils/weather'
import { getAllCityCurrentWeather, getWeatherDetail } from '../services/weatherService'

// ── 모든 반응형 데이터는 부모(WeatherParent)가 단일 소유한다 ──
const searchQuery = ref('')
const selectedCityInfo = ref('지역별 날씨 카드를 클릭해 보세요.')
const detail = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const detailOpen = ref(false)
const detailCity = ref(null)
let detailRequestId = 0
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '인천', temp: 23, status: '흐림' },
  { id: 'city_05', name: '대전', temp: 27, status: '맑음' },
  { id: 'city_06', name: '대구', temp: 31, status: '맑음' },
  { id: 'city_07', name: '광주', temp: 22, status: '흐림' },
  { id: 'city_08', name: '울산', temp: 29, status: '구름' },
  { id: 'city_09', name: '제주', temp: 20, status: '비' },
  { id: 'city_10', name: '강릉', temp: 25, status: '맑음' },
  { id: 'city_11', name: '전주', temp: 24, status: '비' },
  { id: 'city_12', name: '춘천', temp: 30, status: '맑음' },
  { id: 'city_13', name: '청주', temp: 26, status: '흐림' },
  { id: 'city_14', name: '창원', temp: 28, status: '구름' },
  { id: 'city_15', name: '포항', temp: 32, status: '맑음' },
  { id: 'city_16', name: '여수', temp: 25, status: '구름' },
  { id: 'city_17', name: '목포', temp: 21, status: '비' },
  { id: 'city_18', name: '속초', temp: 22, status: '흐림' },
])

let liveRefreshTimer
const refreshAllCities = async ({ announce = false } = {}) => {
  if (announce) selectedCityInfo.value = '전국 실시간 날씨를 불러오고 있어요.'
  try {
    const liveWeather = await getAllCityCurrentWeather()
    weatherList.value = weatherList.value.map((item) => ({ ...item, ...liveWeather[item.name] }))
    if (announce) selectedCityInfo.value = '전국 실시간 날씨가 업데이트됐어요.'
  } catch (error) {
    if (announce) selectedCityInfo.value = `${error.message} 기존 데이터를 표시합니다.`
  }
}

onMounted(async () => {
  await refreshAllCities({ announce: true })
  liveRefreshTimer = window.setInterval(refreshAllCities, 10 * 60 * 1000)
})
onUnmounted(() => window.clearInterval(liveRefreshTimer))

// ── 단위 상태: provide/inject로 후손(WeatherCard, WeatherStats, UnitToggle)에 전파 ──
const unit = ref('celsius')
const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))
const toggleUnit = () => {
  unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
}
const convertTemp = (temp) =>
  unit.value === 'fahrenheit' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)

provide('weather-unit', { unit, unitSymbol, convertTemp, toggleUnit })

// ── 정렬 / 상태 필터 ──────────────────────────────────────────
const sortKey = ref('default')
const statusFilter = ref('전체')

// 검색어 + 상태 칩 + 정렬을 모두 반영한 최종 목록 (computed 파생)
const visibleWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  let list = weatherList.value.filter((item) => item.name.includes(keyword))
  if (statusFilter.value !== '전체') {
    list = list.filter((item) => item.status === statusFilter.value)
  }
  const sorted = [...list]
  if (sortKey.value === 'temp-desc') sorted.sort((a, b) => b.temp - a.temp)
  else if (sortKey.value === 'temp-asc') sorted.sort((a, b) => a.temp - b.temp)
  else if (sortKey.value === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  return sorted
})

// ── 감시자 ─────────────────────────────────────────────────────
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch] 상태바 변경 감지: "${oldValue}" -> "${newValue}"`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})

// ── 자식 이벤트 핸들러 ─────────────────────────────────────────
const updateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

const selectCity = (cityItem) => {
  selectedCityInfo.value = `${cityItem.name}이 선택되었습니다.`
}

const showDetail = async (cityItem) => {
  const requestId = ++detailRequestId
  detailCity.value = cityItem
  detailOpen.value = true
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    const result = await getWeatherDetail(cityItem)
    if (requestId === detailRequestId) detail.value = result
  } catch (error) {
    if (requestId === detailRequestId) detailError.value = error.message
  } finally {
    if (requestId === detailRequestId) detailLoading.value = false
  }
}
const closeDetail = () => { detailRequestId += 1; detailOpen.value = false }

const addCity = (payload) => {
  if (weatherList.value.some((item) => item.name === payload.name)) {
    selectedCityInfo.value = `⚠️ ${payload.name}은(는) 이미 목록에 있습니다.`
    return
  }
  weatherList.value.push({ id: `city_${Date.now()}`, ...payload })
  selectedCityInfo.value = `➕ ${payload.name}이 목록에 추가되었습니다.`
}

const removeCity = (cityItem) => {
  weatherList.value = weatherList.value.filter((item) => item.id !== cityItem.id)
  selectedCityInfo.value = `🗑️ ${cityItem.name}이 목록에서 삭제되었습니다.`
}
</script>

<template>
  <div class="weather-parent">
    <WeatherDetailPanel v-if="detailOpen" :city="detailCity?.name" :detail="detail" :loading="detailLoading" :error="detailError" @close="closeDetail" @retry="showDetail(detailCity)" />
    <!-- Named Slot(#extra)으로 단위 토글을 제목 오른쪽에 배치 -->
    <BaseDashboardCard title="📊 오늘의 요약">
      <template #extra>
        <UnitToggle />
      </template>
      <WeatherStats :city-list="weatherList" />
    </BaseDashboardCard>

    <BaseDashboardCard title="🔍 도시 검색 · 추가">
      <SearchBar :search-query="searchQuery" @update-query="updateQuery" />
      <hr class="divider" />
      <CityForm @add-city="addCity" />
    </BaseDashboardCard>

    <BaseDashboardCard title="🌤️ 지역별 날씨 현황">
      <!-- Named Slot(#extra)으로 필터 칩 + 정렬 셀렉트 배치 -->
      <template #extra>
        <div class="list-controls">
          <div class="filter-chips">
            <button
              v-for="status in ['전체', ...STATUS_OPTIONS]"
              :key="status"
              type="button"
              class="chip"
              :class="{ active: statusFilter === status }"
              @click="statusFilter = status"
            >
              {{ status === '전체' ? '🌈 전체' : `${statusEmoji(status)} ${status}` }}
            </button>
          </div>
          <select v-model="sortKey" class="sort-select">
            <option value="default">기본 순서</option>
            <option value="temp-desc">온도 높은 순</option>
            <option value="temp-asc">온도 낮은 순</option>
            <option value="name">이름 순</option>
          </select>
        </div>
      </template>

      <!-- 검색어가 비면 원본 전체, 일치 데이터가 있으면 해당 데이터 출력 -->
      <div v-if="visibleWeatherList.length > 0" class="card-list">
        <WeatherCard
          v-for="item in visibleWeatherList"
          :key="item.id"
          :city-item="item"
          @select-card="selectCity"
          @click-detail="showDetail"
          @remove-card="removeCity"
        />
      </div>

      <!-- 일치하는 데이터가 없을 때 안내 -->
      <div v-else class="empty-result">
        🔍 조건과 일치하는 도시가 없습니다.
        <span v-if="searchQuery">(검색어: "{{ searchQuery }}")</span>
        <span v-if="statusFilter !== '전체'">(필터: {{ statusFilter }})</span>
      </div>

      <div class="status-bar">{{ selectedCityInfo }}</div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.divider {
  margin: 14px 0;
  border: none;
  border-top: 1px dashed #dde3ea;
}

.list-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 4px 12px;
  border: 1px solid #dde3ea;
  border-radius: 16px;
  background-color: #f8fafc;
  color: #56687a;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: #42b883;
}

.chip.active {
  border-color: #42b883;
  background-color: #42b883;
  color: white;
}

.sort-select {
  padding: 5px 8px;
  border: 1px solid #dde3ea;
  border-radius: 8px;
  background-color: #fff;
  color: #56687a;
}

.card-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.empty-result {
  padding: 24px;
  border: 1px dashed #ccd4de;
  border-radius: 12px;
  text-align: center;
  color: #8494a5;
}

.status-bar {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  color: white;
  background-color: #35495e;
}
</style>
