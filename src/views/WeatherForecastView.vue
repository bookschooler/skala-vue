<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, Sunny, Umbrella } from '@element-plus/icons-vue'
import { findCityById } from '../data/cityCatalog.js'
import { fetchLongRangeForecast, isMeteoRequestCanceled } from '../services/openMeteoService.js'
import { useConfigStore } from '../stores/configStore.js'
import { useFavoriteStore } from '../stores/favoriteStore.js'
import { getWeatherVisual } from '../utils/weatherVisual.js'

const route = useRoute()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
const forecastData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedDate = ref('')
let activeController
let requestId = 0

const queryCity = computed(() => {
  const lat = Number(route.query.lat)
  const lon = Number(route.query.lon)
  if (!route.query.name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return {
    id: route.query.cityId ?? route.query.name,
    name: route.query.name,
    country: route.query.country ?? '국가 정보 없음',
    countryCode: route.query.countryCode ?? '',
    lat,
    lon,
    timezone: route.query.timezone ?? 'auto',
    query: route.query.name,
  }
})

const selectedCity = computed(
  () => queryCity.value ?? favoriteStore.cities[0] ?? findCityById('city_01') ?? null,
)

const displayTemp = (temp) => {
  if (!Number.isFinite(Number(temp))) return '—'
  const value =
    configStore.unit === 'fahrenheit'
      ? Math.round((Number(temp) * 9) / 5 + 32)
      : Math.round(Number(temp))
  return `${value}${configStore.unitSymbol}`
}

const formatMonthDay = (date) =>
  new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(new Date(`${date}T12:00:00`))

const weekdayLabel = (date) =>
  new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(new Date(`${date}T12:00:00`))

const weatherVisual = (weatherCode) => getWeatherVisual(weatherCode)
const calendarSlots = computed(() => {
  const daily = forecastData.value?.daily ?? []
  if (!daily.length) return []
  const leadingEmptyDays = new Date(`${daily[0].date}T12:00:00`).getDay()
  return [...Array.from({ length: leadingEmptyDays }, () => null), ...daily]
})
const selectedDaily = computed(
  () => forecastData.value?.daily?.find((forecast) => forecast.date === selectedDate.value) ?? null,
)
const selectedHourly = computed(() => {
  if (!selectedDate.value) return []
  return (forecastData.value?.hourly ?? []).filter((hour) => {
    if (!hour.dateTime.startsWith(selectedDate.value)) return false
    const hourOfDay = Number(hour.dateTime.slice(11, 13))
    return hourOfDay % 3 === 0
  })
})

const formatHour = (dateTime) => `${dateTime.slice(11, 13)}:00`

const loadForecast = async () => {
  const city = selectedCity.value
  activeController?.abort()
  const currentRequestId = ++requestId
  forecastData.value = null
  errorMessage.value = ''
  if (!city) {
    isLoading.value = false
    return
  }

  activeController = new AbortController()
  isLoading.value = true
  try {
    const result = await fetchLongRangeForecast(city, { signal: activeController.signal })
    if (currentRequestId === requestId) {
      forecastData.value = result
      selectedDate.value = result.daily[0]?.date ?? ''
    }
  } catch (error) {
    if (currentRequestId !== requestId || isMeteoRequestCanceled(error)) return
    errorMessage.value = '예보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    if (currentRequestId === requestId) isLoading.value = false
  }
}

watch(
  () => [selectedCity.value?.id, selectedCity.value?.lat, selectedCity.value?.lon],
  loadForecast,
  { immediate: true },
)

onBeforeUnmount(() => {
  requestId += 1
  activeController?.abort()
})
</script>

<template>
  <main class="forecast-page">
    <RouterLink class="back-link" to="/"><el-icon><ArrowLeft /></el-icon> 홈으로</RouterLink>
    <header class="forecast-hero">
      <div>
        <p class="eyebrow">16 DAY FORECAST</p>
        <h1>{{ forecastData?.city?.name ?? selectedCity?.name ?? '여행지' }} 날씨 예보</h1>
        <p>날짜와 요일을 한눈에 보며 기온·강수 확률·자외선 지수를 비교하세요.</p>
      </div>
      <button
        class="unit-toggle"
        type="button"
        :aria-label="`온도 단위를 ${configStore.unit === 'celsius' ? '화씨' : '섭씨'}로 변경`"
        @click="configStore.toggleUnit()"
      >
        {{ configStore.unitSymbol }}
      </button>
    </header>

    <el-card v-if="isLoading" class="state-card" shadow="never" role="status">
      <el-skeleton :rows="7" animated />
    </el-card>
    <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false">
      <template #default><el-button type="primary" @click="loadForecast">다시 시도</el-button></template>
    </el-alert>
    <el-empty v-else-if="!selectedCity" description="예보를 확인할 도시가 없습니다.">
      <RouterLink to="/"><el-button type="primary">도시 찾으러 가기</el-button></RouterLink>
    </el-empty>
    <section v-else-if="forecastData?.daily?.length" class="forecast-calendar" :aria-label="`${forecastData.city.name} 장기 예보 캘린더`">
      <div class="forecast-calendar__scroll">
        <div class="calendar-weekdays" aria-hidden="true">
          <span v-for="weekday in ['일', '월', '화', '수', '목', '금', '토']" :key="weekday">{{ weekday }}</span>
        </div>
        <div class="calendar-grid">
          <template v-for="(forecast, index) in calendarSlots" :key="forecast?.date ?? `empty-${index}`">
            <div v-if="!forecast" class="calendar-empty" aria-hidden="true"></div>
            <button
              v-else
              class="calendar-card"
              :class="{
                'calendar-card--today': forecast.date === forecastData.daily[0]?.date,
                'calendar-card--selected': forecast.date === selectedDate,
              }"
              type="button"
              :aria-pressed="forecast.date === selectedDate"
              :aria-label="`${formatMonthDay(forecast.date)} ${weekdayLabel(forecast.date)} 날씨 시간대별 예보 보기`"
              @click="selectedDate = forecast.date"
            >
              <time :datetime="forecast.date">
                <span>{{ formatMonthDay(forecast.date) }}</span>
                <strong>{{ weekdayLabel(forecast.date) }}</strong>
              </time>
              <el-icon :class="['calendar-card__weather-icon', `calendar-card__weather-icon--${weatherVisual(forecast.weatherCode).tone}`]" :aria-label="forecast.status">
                <component :is="weatherVisual(forecast.weatherCode).icon" />
              </el-icon>
              <span class="calendar-card__temperature">{{ displayTemp(forecast.minTemp) }} <b>/</b> {{ displayTemp(forecast.maxTemp) }}</span>
              <div class="calendar-card__metrics">
                <small><el-icon><Umbrella /></el-icon> {{ forecast.precipitationProbability }}%</small>
                <small><el-icon><Sunny /></el-icon> UV {{ forecast.uvIndexMax }}</small>
              </div>
            </button>
          </template>
        </div>
      </div>
    </section>

    <section v-if="selectedDaily && selectedHourly.length" class="hourly-panel" :aria-label="`${formatMonthDay(selectedDaily.date)} 시간대별 예보`">
      <header class="hourly-panel__heading">
        <div>
          <p>HOURLY OUTLOOK</p>
          <h2>{{ formatMonthDay(selectedDaily.date) }} {{ weekdayLabel(selectedDaily.date) }} 시간대별 날씨</h2>
        </div>
        <span>3시간 간격</span>
      </header>
      <div class="hourly-grid">
        <article v-for="hour in selectedHourly" :key="hour.dateTime" class="hourly-card">
          <time :datetime="hour.dateTime">{{ formatHour(hour.dateTime) }}</time>
          <el-icon :class="['hourly-card__weather-icon', `hourly-card__weather-icon--${weatherVisual(hour.weatherCode).tone}`]" :aria-label="hour.status">
            <component :is="weatherVisual(hour.weatherCode).icon" />
          </el-icon>
          <strong>{{ displayTemp(hour.temp) }}</strong>
          <div>
            <small><el-icon><Umbrella /></el-icon> {{ hour.precipitationProbability }}%</small>
            <small><el-icon><Sunny /></el-icon> UV {{ hour.uvIndex }}</small>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.forecast-page { width: min(1180px, calc(100% - 32px)); min-height: 100vh; padding: 42px 0 70px; margin: 0 auto; color: #eaf7ff; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #a8d9f2; font-size: 14px; text-decoration: none; }
.forecast-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin: 27px 0 24px; }
.eyebrow { margin: 0; color: #7fd6ff; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; }
.forecast-hero h1 { margin: 5px 0 8px; font-size: clamp(30px, 5vw, 46px); }
.forecast-hero > div > p:last-child { margin: 0; color: #9eb7c7; }
.unit-toggle { display: grid; flex: 0 0 auto; width: 44px; height: 44px; place-items: center; color: #bdeaff; background: #061221; border: 1px solid #285575; border-radius: 10px; box-shadow: 0 0 14px rgba(48, 173, 255, 0.18); cursor: pointer; font: inherit; font-weight: 800; }
.unit-toggle:hover { color: #f0fbff; border-color: #65d7ff; box-shadow: 0 0 18px rgba(74, 201, 255, 0.34); }
.state-card { margin-bottom: 20px; color: #eaf7ff; background: #06101e; border: 1px solid #205273; }
.forecast-calendar { overflow: hidden; padding: 18px; background: #06101e; border: 1px solid #205273; border-radius: 16px; box-shadow: 0 0 32px rgba(0, 142, 230, 0.1); }
.forecast-calendar__scroll { overflow-x: auto; }
.calendar-weekdays,
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(132px, 1fr)); min-width: 924px; }
.calendar-weekdays { margin-bottom: 9px; }
.calendar-weekdays span { color: #8eb5ca; font-size: 12px; font-weight: 800; text-align: center; }
.calendar-weekdays span:first-child { color: #d59cb0; }
.calendar-weekdays span:last-child { color: #8abde5; }
.calendar-grid { gap: 9px; }
.calendar-empty { min-height: 174px; border: 1px dashed rgba(48, 89, 123, 0.24); border-radius: 10px; }
.calendar-card { display: grid; min-height: 174px; padding: 13px; color: inherit; background: #040b17; border: 1px solid #173b59; border-radius: 10px; cursor: pointer; text-align: left; }
.calendar-card--today { border-color: #8e60ff; box-shadow: 0 0 16px rgba(125, 82, 255, 0.24), inset 0 0 15px rgba(71, 96, 190, 0.06); }
.calendar-card--selected { border-color: #67d8ff; box-shadow: 0 0 5px rgba(89, 218, 255, 0.7), 0 0 19px rgba(46, 165, 255, 0.24), inset 0 0 15px rgba(41, 118, 177, 0.1); }
.calendar-card:hover { border-color: #86dfff; }
.calendar-card time { display: flex; align-items: baseline; justify-content: space-between; color: #b7cfdd; font-size: 12px; }
.calendar-card time strong { font-size: 13px; }
.calendar-card__weather-icon { justify-self: center; align-self: center; font-size: 38px; }
.calendar-card__weather-icon--sunny { color: #ffd56b; filter: drop-shadow(0 0 7px rgba(255, 198, 71, 0.35)); }
.calendar-card__weather-icon--partly-cloudy { color: #9ee6ff; }
.calendar-card__weather-icon--cloudy { color: #b8cce1; }
.calendar-card__weather-icon--rain { color: #72ceff; filter: drop-shadow(0 0 7px rgba(71, 184, 255, 0.3)); }
.calendar-card__weather-icon--snow { color: #def7ff; }
.calendar-card__weather-icon--storm { color: #caa3ff; filter: drop-shadow(0 0 7px rgba(174, 117, 255, 0.35)); }
.calendar-card__weather-icon--loading { color: #8ccce7; }
.calendar-card__temperature { color: #d9f5ff; font-size: 13px; font-weight: 800; text-align: center; }
.calendar-card__temperature b { color: #66899f; font-weight: 500; }
.calendar-card__metrics { display: grid; gap: 4px; align-self: end; }
.calendar-card__metrics small { display: inline-flex; align-items: center; gap: 4px; color: #96b5c6; font-size: 11px; }
.calendar-card__metrics :deep(.el-icon) { color: #8ed8f6; font-size: 13px; }
.hourly-panel { margin-top: 18px; padding: 19px; background: #06101e; border: 1px solid #205273; border-radius: 16px; box-shadow: 0 0 30px rgba(0, 142, 230, 0.08); }
.hourly-panel__heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 15px; }
.hourly-panel__heading p { margin: 0 0 4px; color: #7fd6ff; font-size: 10px; font-weight: 800; letter-spacing: 0.13em; }
.hourly-panel__heading h2 { margin: 0; color: #e8f8ff; font-size: 19px; }
.hourly-panel__heading > span { color: #8eafc0; font-size: 12px; }
.hourly-grid { display: grid; grid-template-columns: repeat(8, minmax(100px, 1fr)); gap: 9px; overflow-x: auto; }
.hourly-card { display: grid; justify-items: center; gap: 9px; min-width: 100px; padding: 12px 9px; background: #040b17; border: 1px solid #173b59; border-radius: 10px; }
.hourly-card time { color: #a9c2d0; font-size: 12px; font-weight: 700; }
.hourly-card__weather-icon { font-size: 30px; }
.hourly-card__weather-icon--sunny { color: #ffd56b; }
.hourly-card__weather-icon--partly-cloudy { color: #9ee6ff; }
.hourly-card__weather-icon--cloudy { color: #b8cce1; }
.hourly-card__weather-icon--rain { color: #72ceff; }
.hourly-card__weather-icon--snow { color: #def7ff; }
.hourly-card__weather-icon--storm { color: #caa3ff; }
.hourly-card__weather-icon--loading { color: #8ccce7; }
.hourly-card > strong { color: #e4f7ff; font-size: 17px; }
.hourly-card > div { display: grid; gap: 4px; }
.hourly-card small { display: inline-flex; align-items: center; gap: 4px; color: #96b5c6; font-size: 11px; }
.hourly-card :deep(.el-icon) { color: #8ed8f6; font-size: 13px; }
@media (max-width: 560px) { .forecast-page { width: calc(100% - 24px); padding-top: 24px; } .forecast-hero { gap: 12px; } .unit-toggle { width: 40px; height: 40px; } .forecast-calendar { padding: 12px; } }
</style>
