<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Cloudy,
  Filter,
  Odometer,
  Star,
  StarFilled,
  Sunny,
  Umbrella,
  WindPower,
} from '@element-plus/icons-vue'
import { findCityById } from '../data/cityCatalog.js'
import {
  fetchDetailHourlyForecast,
  getUpcomingHourly,
  isMeteoRequestCanceled,
} from '../services/openMeteoService.js'
import { fetchWeatherBundle, isWeatherRequestCanceled } from '../services/openWeatherService.js'
import { useConfigStore } from '../stores/configStore.js'
import { useFavoriteStore } from '../stores/favoriteStore.js'
import {
  getHumidityComfortLevel,
  getPm10Level,
  getUvIndexLevel,
} from '../utils/weatherIndexLevel.js'
import { getWeatherVisual } from '../utils/weatherVisual.js'

const route = useRoute()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
const weatherBundle = ref(null)
const hourlyForecast = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isNotFound = ref(false)
let activeController
let requestId = 0

const queryCity = computed(() => {
  const lat = Number(route.query.lat)
  const lon = Number(route.query.lon)
  if (!route.query.name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return {
    id: route.params.cityId,
    name: route.query.name,
    country: route.query.country ?? '국가 정보 없음',
    countryCode: route.query.countryCode ?? '',
    lat,
    lon,
    timezone: route.query.timezone ?? 'auto',
    query: route.query.name,
  }
})

const resolvedCity = computed(
  () =>
    queryCity.value ??
    favoriteStore.findFavorite(route.params.cityId) ??
    findCityById(route.params.cityId),
)
const currentWeather = computed(() => weatherBundle.value?.current ?? null)
const isFavorite = computed(() => favoriteStore.isFavorite(resolvedCity.value?.id))
const weatherVisual = (weatherCode) => getWeatherVisual(weatherCode)

const getCityTimeParts = (timeZone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date())
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
    return { date: `${value.year}-${value.month}-${value.day}`, hour: Number(value.hour) }
  } catch {
    return getCityTimeParts('UTC')
  }
}

const upcomingHourly = computed(() => {
  const forecast = hourlyForecast.value
  const { date, hour } = getCityTimeParts(forecast?.city?.timezone)
  const startDateTime = `${date}T${String(hour).padStart(2, '0')}:00`
  return getUpcomingHourly(forecast?.hourly, startDateTime)
})
const hourlyIntervalLabel = computed(() =>
  upcomingHourly.value.length ? `1시간 간격 · ${upcomingHourly.value.length}시간` : '',
)
const currentUvIndex = computed(() => {
  const forecast = hourlyForecast.value
  if (!forecast) return null
  const { date, hour } = getCityTimeParts(forecast.city.timezone)
  const currentDateTime = `${date}T${String(hour).padStart(2, '0')}:00`
  return forecast.hourly.find((item) => item.dateTime === currentDateTime)?.uvIndex ?? null
})
const detailDailyForecast = computed(() => {
  const uvByDate = new Map((hourlyForecast.value?.daily ?? []).map((item) => [item.date, item.uvIndexMax]))
  return (weatherBundle.value?.daily ?? []).map((item) => ({
    ...item,
    uvIndexMax: uvByDate.get(item.date) ?? null,
  }))
})

const displayTemp = (temp) => {
  if (!Number.isFinite(Number(temp))) return '—'
  const value =
    configStore.unit === 'fahrenheit'
      ? Math.round((Number(temp) * 9) / 5 + 32)
      : Math.round(Number(temp))
  return `${value}${configStore.unitSymbol}`
}

const displayParticulate = (value) =>
  value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? `${Math.round(Number(value))} μg/m³`
    : '—'

const displayUv = (value) =>
  value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? Number(value).toFixed(1).replace(/\.0$/, '')
    : '—'

const displayUvWithLevel = (value) => {
  const level = getUvIndexLevel(value)
  return level ? `${displayUv(value)} (${level})` : displayUv(value)
}

const displayParticulateWithLevel = (value) => {
  const level = getPm10Level(value)
  return level ? `${displayParticulate(value)} (${level})` : displayParticulate(value)
}

const displayHumidityWithLevel = (value) => {
  const level = getHumidityComfortLevel(value)
  return level ? `${value}% (${level})` : '—'
}

const forecastRoute = computed(() => {
  const city = weatherBundle.value?.city ?? resolvedCity.value
  if (!city) return { name: 'WeatherForecast' }
  return {
    name: 'WeatherForecast',
    query: {
      cityId: city.id,
      name: city.name,
      country: city.country,
      countryCode: city.countryCode,
      lat: String(city.lat),
      lon: String(city.lon),
      timezone: city.timezone,
    },
  }
})

const formatDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(
    new Date(`${date}T12:00:00`),
  )

const formatHour = (dateTime) => `${dateTime.slice(11, 13)}:00`

const loadWeather = async () => {
  activeController?.abort()
  const currentRequestId = ++requestId
  weatherBundle.value = null
  hourlyForecast.value = null
  errorMessage.value = ''
  const city = resolvedCity.value
  isNotFound.value = !city
  if (!city) {
    isLoading.value = false
    return
  }

  activeController = new AbortController()
  isLoading.value = true
  try {
    const [weatherResult, hourlyResult] = await Promise.all([
      fetchWeatherBundle(city, { signal: activeController.signal }),
      fetchDetailHourlyForecast(city, { signal: activeController.signal }),
    ])
    if (currentRequestId === requestId) {
      weatherBundle.value = weatherResult
      hourlyForecast.value = hourlyResult
    }
  } catch (error) {
    if (currentRequestId !== requestId || isWeatherRequestCanceled(error) || isMeteoRequestCanceled(error)) return
    errorMessage.value =
      '날씨 정보를 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
  } finally {
    if (currentRequestId === requestId) isLoading.value = false
  }
}

const toggleFavorite = () => {
  const result = favoriteStore.toggleFavorite(resolvedCity.value)
  if (!result.ok && result.reason === 'limit') {
    errorMessage.value = `즐겨찾기는 최대 ${favoriteStore.maxFavorites}개까지 저장할 수 있어요.`
  }
}

watch(
  () => [route.params.cityId, route.query.lat, route.query.lon, route.query.name],
  loadWeather,
  { immediate: true },
)

onBeforeUnmount(() => {
  requestId += 1
  activeController?.abort()
})
</script>

<template>
  <main class="detail-page">
    <RouterLink class="back-link" to="/"
      ><el-icon><ArrowLeft /></el-icon> 홈으로</RouterLink
    >

    <el-card v-if="isLoading" class="detail-card empty" shadow="never" role="status">
      <el-skeleton :rows="7" animated />
    </el-card>

    <el-card v-else-if="errorMessage" class="detail-card empty" shadow="never" role="alert">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false" />
      <el-button type="primary" :disabled="isLoading" @click="loadWeather">다시 시도</el-button>
    </el-card>

    <el-card v-else-if="currentWeather" class="detail-card" shadow="never">
      <header class="detail-header">
        <div>
          <p class="eyebrow">WEATHER DETAIL</p>
          <h1>
            {{ weatherBundle.city.name }} <small>{{ weatherBundle.city.country }}</small>
          </h1>
          <p class="summary">{{ currentWeather.observedAt }} 기준 · {{ currentWeather.status }}</p>
        </div>
        <div class="detail-actions">
          <button
            class="unit-button"
            type="button"
            :aria-label="`온도 단위를 ${configStore.unit === 'celsius' ? '화씨' : '섭씨'}로 변경`"
            @click="configStore.toggleUnit"
          >
            °{{ configStore.unit === 'celsius' ? 'C' : 'F' }}
          </button>
          <button class="favorite-button" type="button" @click="toggleFavorite">
            <el-icon><component :is="isFavorite ? StarFilled : Star" /></el-icon>
            {{ isFavorite ? '저장됨' : '즐겨찾기' }}
          </button>
        </div>
      </header>

      <section class="current-weather" aria-label="현재 날씨">
        <div class="current-weather__hero">
          <el-icon
            :class="[
              'current-weather__icon',
              `current-weather__icon--${weatherVisual(currentWeather.weatherCode).tone}`,
            ]"
          >
            <component :is="weatherVisual(currentWeather.weatherCode).icon" />
          </el-icon>
          <div>
            <strong>{{ displayTemp(currentWeather.temp) }}</strong>
            <p>{{ currentWeather.status }}</p>
          </div>
        </div>
        <dl class="weather-grid">
          <div>
            <dt>
              <el-icon><Odometer /></el-icon> 체감온도
            </dt>
            <dd>{{ displayTemp(currentWeather.feelsLike) }}</dd>
          </div>
          <div>
            <dt>
              <el-icon><Cloudy /></el-icon> 습도
              <small class="metric-agency">환경부 적정 40~60%</small>
            </dt>
            <dd>{{ displayHumidityWithLevel(currentWeather.humidity) }}</dd>
          </div>
          <div>
            <dt>
              <el-icon><WindPower /></el-icon> 풍속
            </dt>
            <dd>{{ currentWeather.wind }} km/h</dd>
          </div>
          <div>
            <dt>
              <el-icon><Umbrella /></el-icon> 강수량
            </dt>
            <dd>{{ currentWeather.precipitation }} mm</dd>
          </div>
          <div>
            <dt>
              <el-icon><Filter /></el-icon> 미세먼지(PM10)
              <small class="metric-agency">환경부 기준</small>
            </dt>
            <dd>{{ displayParticulateWithLevel(currentWeather.airQuality?.pm10) }}</dd>
          </div>
          <div>
            <dt>
              <el-icon><Sunny /></el-icon> 자외선 지수
              <small class="metric-agency">기상청 기준</small>
            </dt>
            <dd>{{ displayUvWithLevel(currentUvIndex) }}</dd>
          </div>
        </dl>
      </section>

      <section
        v-if="upcomingHourly.length"
        class="hourly-forecast"
        :aria-label="`앞으로 ${hourlyIntervalLabel} 예보`"
      >
        <div class="section-heading">
          <div>
            <p class="section-eyebrow">HOURLY OUTLOOK</p>
            <h2>앞으로 24시간 날씨</h2>
          </div>
          <span class="section-meta">{{ hourlyIntervalLabel }}</span>
        </div>
        <div
          class="hourly-grid"
          tabindex="0"
          aria-label="앞으로 24시간 날씨 목록. 좌우로 스크롤해 다음 시간대를 볼 수 있습니다."
        >
          <article v-for="(hour, index) in upcomingHourly" :key="hour.dateTime" class="hourly-card">
            <span v-if="index === 0" class="hourly-card__now">지금</span>
            <time :datetime="hour.dateTime">{{ formatHour(hour.dateTime) }}</time>
            <el-icon
              :class="[
                'hourly-card__weather-icon',
                `hourly-card__weather-icon--${weatherVisual(hour.weatherCode).tone}`,
              ]"
              :aria-label="hour.status"
            >
              <component :is="weatherVisual(hour.weatherCode).icon" />
            </el-icon>
            <strong>{{ displayTemp(hour.temp) }}</strong>
            <small>{{ hour.status }}</small>
            <div class="hourly-card__metrics">
              <span
                ><el-icon><Umbrella /></el-icon> {{ hour.precipitationProbability }}%</span
              >
              <span
                ><el-icon><WindPower /></el-icon> {{ hour.wind }} km/h</span
              >
            </div>
          </article>
        </div>
      </section>

      <section class="daily-forecast" aria-label="5일 예보">
        <div class="section-heading">
          <h2>5일 예보</h2>
          <RouterLink class="full-forecast-link" :to="forecastRoute">
            <span>16일 전체 예보 보기</span>
          </RouterLink>
        </div>
        <div class="daily-grid">
          <article v-for="forecast in detailDailyForecast.slice(0, 5)" :key="forecast.date">
            <p>{{ formatDate(forecast.date) }}</p>
            <div class="daily-card__condition">
              <el-icon
                :class="[
                  'daily-card__weather-icon',
                  `daily-card__weather-icon--${weatherVisual(forecast.weatherCode).tone}`,
                ]"
              >
                <component :is="weatherVisual(forecast.weatherCode).icon" />
              </el-icon>
              <strong>{{ forecast.status }}</strong>
            </div>
            <span>{{ displayTemp(forecast.minTemp) }} / {{ displayTemp(forecast.maxTemp) }}</span>
            <div class="daily-card__metrics">
              <small
                ><el-icon><Umbrella /></el-icon> {{ forecast.precipitationProbability }}%</small
              >
              <small
                ><el-icon><Sunny /></el-icon> UV {{ displayUvWithLevel(forecast.uvIndexMax) }}</small
              >
            </div>
          </article>
        </div>
      </section>
    </el-card>

    <el-card v-else-if="isNotFound" class="detail-card empty" shadow="never" role="status">
      <el-empty description="도시 정보를 찾을 수 없습니다.">
        <RouterLink to="/"><el-button type="primary">홈으로 돌아가기</el-button></RouterLink>
      </el-empty>
    </el-card>
  </main>
</template>

<style scoped>
.detail-page {
  width: min(1020px, calc(100% - 32px));
  min-height: 100vh;
  padding: 98px 0 70px;
  margin: 0 auto;
  color: #e8f6ff;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  color: #a8d9f2;
  font-size: 14px;
  text-decoration: none;
}
.detail-card {
  padding: 36px;
  color: #e8f6ff;
  background: #06101e;
  border: 1px solid #205273;
  border-radius: 18px;
  box-shadow: 0 0 32px rgba(0, 142, 230, 0.12);
}
.detail-card :deep(.el-card__body) {
  padding: 0;
}
.detail-card.empty {
  text-align: center;
}
.empty :deep(.el-button) {
  margin-top: 18px;
}
.detail-header,
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.detail-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.unit-button {
  min-width: 40px;
  min-height: 40px;
  padding: 0 10px;
  color: #9eeaff;
  background: #061a2b;
  border: 1px solid #3fb6e5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}
.eyebrow {
  margin: 0;
  color: #7fd6ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
h1 {
  margin: 7px 0;
  font-size: clamp(28px, 4vw, 42px);
}
h1 small {
  color: #9fb6c6;
  font-size: 15px;
  font-weight: 500;
}
.summary {
  margin: 0;
  color: #8faabc;
  font-size: 13px;
}
.favorite-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 13px;
  color: #dfcaff;
  background: #120d28;
  border: 1px solid #8c5bff;
  border-radius: 8px;
  cursor: pointer;
}
.favorite-button :deep(svg) {
  fill: currentColor;
}
.current-weather {
  margin: 34px 0;
}
.current-weather__hero {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}
.current-weather__icon {
  flex: 0 0 auto;
  font-size: clamp(56px, 7vw, 78px);
}
.current-weather__icon--sunny {
  color: #ffd56b;
  filter: drop-shadow(0 0 9px rgba(255, 198, 71, 0.42));
}
.current-weather__icon--partly-cloudy {
  color: #96e6ff;
  filter: drop-shadow(0 0 9px rgba(99, 211, 255, 0.38));
}
.current-weather__icon--cloudy {
  color: #b3c9de;
}
.current-weather__icon--rain {
  color: #72ceff;
  filter: drop-shadow(0 0 8px rgba(71, 184, 255, 0.36));
}
.current-weather__icon--snow {
  color: #d7f6ff;
}
.current-weather__icon--storm {
  color: #caa3ff;
  filter: drop-shadow(0 0 9px rgba(174, 117, 255, 0.45));
}
.current-weather__icon--loading {
  color: #8ccce7;
}
.current-weather__hero strong {
  display: block;
  color: #e8fbff;
  font-size: clamp(50px, 8vw, 82px);
  letter-spacing: -0.06em;
}
.current-weather__hero p {
  margin: 4px 0 0;
  color: #b3d9ea;
}
.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 0;
}
.weather-grid div,
.daily-grid article {
  padding: 15px;
  background: #040b17;
  border: 1px solid #173b59;
  border-radius: 10px;
}
dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9bbaca;
  font-size: 13px;
}
dt :deep(.el-icon) {
  flex: 0 0 auto;
  color: #7fdcff;
  font-size: 24px;
  filter: drop-shadow(0 0 5px rgba(93, 215, 255, 0.3));
}
.metric-agency {
  color: #6e96aa;
  font-size: 10px;
  font-weight: 600;
}
dd {
  margin: 6px 0 0;
  font-size: 18px;
  font-weight: 800;
}
.hourly-forecast {
  margin: 34px 0;
}
.section-heading {
  align-items: center;
  margin-bottom: 13px;
}
.section-heading h2 {
  margin: 0;
  font-size: 18px;
}
.section-heading a {
  color: #89d8ff;
  font-size: 13px;
}
.full-forecast-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 15px;
  color: #e1f8ff;
  background:
    linear-gradient(135deg, rgba(35, 177, 255, 0.2), rgba(83, 75, 255, 0.2)),
    rgba(5, 22, 49, 0.88);
  border: 1px solid rgba(91, 203, 255, 0.96);
  border-radius: 11px;
  box-shadow:
    0 0 0 1px rgba(170, 235, 255, 0.23) inset,
    0 0 12px rgba(42, 177, 255, 0.52),
    0 0 28px rgba(80, 91, 255, 0.28);
  font-weight: 800;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}
.full-forecast-link::after {
  margin-left: 8px;
  color: #9de7ff;
  content: '→';
  font-size: 15px;
  line-height: 1;
  text-shadow: 0 0 8px currentColor;
}
.full-forecast-link:hover,
.full-forecast-link:focus-visible {
  color: #f0fbff;
  border-color: #a4ecff;
  box-shadow:
    0 0 0 1px rgba(157, 232, 255, 0.32) inset,
    0 0 19px rgba(60, 199, 255, 0.68),
    0 0 34px rgba(93, 94, 255, 0.32);
  outline: 0;
  transform: translateY(-1px);
}
.section-eyebrow {
  margin: 0 0 4px;
  color: #7fd6ff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
}
.section-meta {
  color: #8eafc0;
  font-size: 12px;
}
.hourly-grid {
  display: flex;
  gap: 9px;
  overflow-x: scroll;
  padding: 2px 2px 12px;
  scroll-snap-type: x mandatory;
  scrollbar-gutter: stable;
  scrollbar-color: #3b9bd0 #07101d;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}
.hourly-grid::-webkit-scrollbar {
  height: 8px;
}
.hourly-grid::-webkit-scrollbar-track {
  background: #07101d;
  border-radius: 999px;
}
.hourly-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #287fae, #57c8ff);
  border: 1px solid #9de7ff;
  border-radius: 999px;
}
.hourly-card {
  display: grid;
  position: relative;
  flex: 0 0 112px;
  justify-items: center;
  gap: 8px;
  padding: 30px 9px 13px;
  background: #040b17;
  border: 1px solid #173b59;
  border-radius: 10px;
  scroll-snap-align: start;
  text-align: center;
}
.hourly-card__now {
  position: absolute;
  top: 7px;
  padding: 3px 7px;
  color: #dff8ff;
  background: #0e75a9;
  border: 1px solid #69d9ff;
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(48, 194, 255, 0.55);
  font-size: 10px;
  font-weight: 800;
}
.hourly-card time {
  color: #a9c2d0;
  font-size: 12px;
  font-weight: 700;
}
.hourly-card__weather-icon {
  font-size: 30px;
}
.hourly-card__weather-icon--sunny {
  color: #ffd56b;
}
.hourly-card__weather-icon--partly-cloudy {
  color: #9ee6ff;
}
.hourly-card__weather-icon--cloudy {
  color: #b8cce1;
}
.hourly-card__weather-icon--rain {
  color: #72ceff;
}
.hourly-card__weather-icon--snow {
  color: #def7ff;
}
.hourly-card__weather-icon--storm {
  color: #caa3ff;
}
.hourly-card__weather-icon--loading {
  color: #8ccce7;
}
.hourly-card > strong {
  color: #e4f7ff;
  font-size: 18px;
}
.hourly-card > small {
  min-height: 32px;
  color: #9cb8c8;
  font-size: 11px;
  line-height: 1.45;
}
.hourly-card__metrics {
  display: grid;
  justify-items: center;
  gap: 4px;
}
.hourly-card__metrics span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #91aebe;
  font-size: 11px;
  white-space: nowrap;
}
.hourly-card__metrics :deep(.el-icon) {
  color: #8fd9f7;
  font-size: 13px;
}
.daily-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 9px;
}
.daily-grid article {
  min-width: 0;
}
.daily-grid p {
  margin: 0 0 12px;
  color: #9db8c8;
  font-size: 12px;
}
.daily-card__condition {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 23px;
}
.daily-card__weather-icon {
  flex: 0 0 auto;
  color: #a5e9ff;
  font-size: 20px;
}
.daily-card__weather-icon--sunny {
  color: #ffd56b;
}
.daily-card__weather-icon--partly-cloudy {
  color: #9ee6ff;
}
.daily-card__weather-icon--cloudy {
  color: #b9cce1;
}
.daily-card__weather-icon--rain {
  color: #72ceff;
}
.daily-card__weather-icon--snow {
  color: #def7ff;
}
.daily-card__weather-icon--storm {
  color: #caa3ff;
}
.daily-card__weather-icon--loading {
  color: #8ccce7;
}
.daily-grid strong,
.daily-grid span,
.daily-grid small {
  display: block;
}
.daily-grid strong {
  color: #e5f7ff;
  font-size: 14px;
}
.daily-grid span {
  margin: 10px 0;
  color: #b2e9ff;
  font-size: 13px;
}
.daily-card__metrics {
  display: grid;
  gap: 5px;
}
.daily-grid small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #91aebe;
  font-size: 11px;
  line-height: 1.5;
}
.daily-grid small :deep(.el-icon) {
  color: #8fd9f7;
  font-size: 13px;
}
@media (max-width: 720px) {
  .detail-page {
    width: calc(100% - 24px);
    padding-top: 82px;
  }
  .detail-card {
    padding: 22px 16px;
  }
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .weather-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hourly-grid {
    padding-bottom: 10px;
  }
  .daily-grid {
    grid-template-columns: repeat(5, minmax(112px, 1fr));
    overflow-x: auto;
  }
}
</style>
