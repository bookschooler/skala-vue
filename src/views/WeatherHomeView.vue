<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Location, Search, Star, StarFilled } from '@element-plus/icons-vue'
import FavoriteMap from '../components/weather/FavoriteMap.vue'
import UnitToggler from '../components/practices/store_day3_2/UnitToggler.vue'
import { getWeatherVisual } from '../utils/weatherVisual.js'
import bangkokLandmarkUrl from '../../img/city-landmarks/bangkok.png'
import londonLandmarkUrl from '../../img/city-landmarks/london.png'
import newYorkLandmarkUrl from '../../img/city-landmarks/new-york.png'
import parisLandmarkUrl from '../../img/city-landmarks/paris.png'
import romeLandmarkUrl from '../../img/city-landmarks/rome.png'
import seoulLandmarkUrl from '../../img/city-landmarks/seoul.png'
import sydneyLandmarkUrl from '../../img/city-landmarks/sydney.png'
import tokyoLandmarkUrl from '../../img/city-landmarks/tokyo.png'
import {
  fetchCurrentWeather,
  isWeatherRequestCanceled,
  searchCities,
  searchKnownCities,
} from '../services/openWeatherService.js'
import { useConfigStore } from '../stores/configStore.js'
import { useFavoriteStore } from '../stores/favoriteStore.js'

const router = useRouter()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

// 처음 홈에 들어왔을 때는 검색 또는 즐겨찾기 선택 전까지 큰 날씨 카드를 보이지 않는다.
const selectedCity = ref(null)
const hoveredCity = ref(null)
const showFavoritePins = ref(false)
const searchScope = ref('domestic')
const searchQuery = ref('')
const searchResults = ref([])
const searchState = ref('idle')
const searchMessage = ref('')
const isSearchComposing = ref(false)
const weatherByCityId = ref({})
const weatherError = ref('')
const isRefreshingFavorites = ref(false)
const isMapFocused = ref(false)

let searchTimer
let searchController
let selectedWeatherController
let favoriteWeatherController
let favoriteWeatherTimer
let searchRequestId = 0
let selectedWeatherRequestId = 0
let favoriteWeatherRequestId = 0

const toggleCopy = computed(() =>
  showFavoritePins.value ? '즐겨찾기 핀 숨기기' : '즐겨찾기 핀 보기',
)
const starterCityLandmarkById = new Map([
  ['city_01', seoulLandmarkUrl],
  ['meteo-1850147', tokyoLandmarkUrl],
  ['meteo-2988507', parisLandmarkUrl],
  ['meteo-5128581', newYorkLandmarkUrl],
  ['meteo-2643743', londonLandmarkUrl],
  ['meteo-1609350', bangkokLandmarkUrl],
  ['meteo-2147714', sydneyLandmarkUrl],
  ['meteo-3169070', romeLandmarkUrl],
])
const favorites = computed(() => favoriteStore.cities)
const favoriteWeatherCities = computed(() =>
  favorites.value.map((city) => {
    const weather = weatherByCityId.value[city.id]
    return {
      ...city,
      temp: weather?.temp ?? null,
      condition: weather?.status ?? '날씨 불러오는 중',
      weatherCode: weather?.weatherCode ?? null,
    }
  }),
)
const withCurrentWeather = (city) => {
  if (!city) return null
  const weather = weatherByCityId.value[city.id]
  return {
    ...city,
    temp: weather?.temp ?? null,
    condition: weather?.status ?? '날씨 불러오는 중',
    weatherCode: weather?.weatherCode ?? null,
  }
}
const favoriteCardLayoutStyle = computed(() => {
  const cardCount = Math.max(favoriteWeatherCities.value.length, 1)
  return {
    gridTemplateColumns: `repeat(${cardCount}, minmax(100px, 136px))`,
  }
})
const mapSelectedCity = computed(() => withCurrentWeather(selectedCity.value))
const mapCardCity = computed(() => withCurrentWeather(hoveredCity.value ?? selectedCity.value))
const searchHint = computed(() =>
  searchScope.value === 'domestic' ? '국내 도시를 검색하세요' : '해외 도시 또는 국가를 검색하세요',
)

const displayTemperature = (temperature) => {
  if (
    temperature === null ||
    temperature === undefined ||
    temperature === '' ||
    !Number.isFinite(Number(temperature))
  ) {
    return '—'
  }
  const celsius = Math.round(Number(temperature))
  const value = configStore.unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : celsius
  return `${value}${configStore.unitSymbol}`
}

const cityLandmarkSrc = (city) => starterCityLandmarkById.get(city?.id) ?? null
const weatherVisual = (weatherCode) => getWeatherVisual(weatherCode)

const setWeather = (weather) => {
  weatherByCityId.value = { ...weatherByCityId.value, [weather.id]: weather }
}

const loadSelectedWeather = async (city) => {
  if (!city) return
  selectedWeatherController?.abort()
  const currentRequestId = ++selectedWeatherRequestId
  selectedWeatherController = new AbortController()
  weatherError.value = ''

  try {
    const weather = await fetchCurrentWeather(city, { signal: selectedWeatherController.signal })
    if (currentRequestId === selectedWeatherRequestId) setWeather(weather)
  } catch (error) {
    if (currentRequestId !== selectedWeatherRequestId || isWeatherRequestCanceled(error)) return
    weatherError.value =
      '선택한 도시의 현재 날씨를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  }
}

const refreshFavoriteWeather = async ({ excludeCityId = null } = {}) => {
  favoriteWeatherController?.abort()
  const currentRequestId = ++favoriteWeatherRequestId
  const cities = favorites.value.filter((city) => city.id !== excludeCityId)
  if (!cities.length) {
    isRefreshingFavorites.value = false
    return
  }

  favoriteWeatherController = new AbortController()
  isRefreshingFavorites.value = true
  const results = await Promise.allSettled(
    cities.map((city) => fetchCurrentWeather(city, { signal: favoriteWeatherController.signal })),
  )
  if (currentRequestId !== favoriteWeatherRequestId) return

  const fetchedWeather = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
  if (fetchedWeather.length) {
    weatherByCityId.value = {
      ...weatherByCityId.value,
      ...Object.fromEntries(fetchedWeather.map((weather) => [weather.id, weather])),
    }
  }
  if (!fetchedWeather.length && !results.every((result) => result.status === 'rejected')) return
  if (!fetchedWeather.length) {
    weatherError.value =
      '즐겨찾기 도시의 현재 날씨를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.'
  }
  isRefreshingFavorites.value = false
}

const selectCity = (city) => {
  if (!city) return
  hoveredCity.value = null
  selectedCity.value = city
  isMapFocused.value = true
  searchMessage.value = `${city.name} 위치와 현재 날씨를 확인하고 있어요.`
  searchResults.value = []
  searchState.value = 'idle'
  loadSelectedWeather(city)
}

const previewCity = (city) => {
  if (!showFavoritePins.value || !city) return
  hoveredCity.value = city
}

const clearPreviewCity = (city) => {
  if (hoveredCity.value?.id === city?.id) hoveredCity.value = null
}

const performSearch = async ({
  query = searchQuery.value.trim(),
  scope = searchScope.value,
  requestId = searchRequestId,
} = {}) => {
  if (query.length < 2) {
    searchResults.value = []
    searchState.value = 'idle'
    searchMessage.value = query ? '두 글자 이상 입력하면 도시를 찾을 수 있어요.' : ''
    return []
  }

  searchController?.abort()
  searchController = new AbortController()
  if (!searchResults.value.length) {
    searchState.value = 'loading'
    searchMessage.value = '도시를 찾고 있어요.'
  }
  try {
    const results = await searchCities(query, {
      scope,
      signal: searchController.signal,
    })
    if (requestId !== searchRequestId) return []
    searchResults.value = results
    searchState.value = results.length ? 'success' : 'empty'
    searchMessage.value = results.length ? '' : '일치하는 도시를 찾지 못했습니다.'
    return results
  } catch (error) {
    if (isWeatherRequestCanceled(error)) return []
    if (requestId !== searchRequestId) return []
    if (searchResults.value.length) {
      searchState.value = 'success'
      return searchResults.value
    }
    searchResults.value = []
    searchState.value = 'error'
    searchMessage.value = '도시 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    return []
  }
}

const submitSearch = async () => {
  const results = searchResults.value.length ? searchResults.value : await performSearch()
  if (results[0]) selectCity(results[0])
}

const selectSearchResult = (city) => {
  selectCity(city)
}

const toggleCityFavorite = (city) => {
  if (!city) return
  const result = favoriteStore.toggleFavorite(city)
  if (!result.ok && result.reason === 'limit') {
    searchMessage.value = `즐겨찾기는 최대 ${favoriteStore.maxFavorites}개까지 저장할 수 있어요.`
    return
  }
  searchMessage.value =
    result.reason === 'added'
      ? `${city.name}을(를) 즐겨찾기에 저장했어요.`
      : `${city.name}을(를) 즐겨찾기에서 제거했어요.`
  if (result.reason === 'added') refreshFavoriteWeather()
}

const openDetail = (city = selectedCity.value) => {
  if (!city) return
  router.push({
    name: 'WeatherDetail',
    params: { cityId: city.id },
    query: {
      name: city.name,
      country: city.country,
      countryCode: city.countryCode,
      lat: String(city.lat),
      lon: String(city.lon),
      timezone: city.timezone,
    },
  })
}

const scheduleSearch = () => {
  window.clearTimeout(searchTimer)
  searchController?.abort()
  const requestId = ++searchRequestId
  const query = searchQuery.value.trim()
  const scope = searchScope.value

  if (!query) {
    searchResults.value = []
    searchState.value = 'idle'
    searchMessage.value = ''
    return
  }

  // API 응답을 기다리지 않고, 수업에서 다룬 시작 도시 목록은 입력 즉시 보여 준다.
  const knownResults = searchKnownCities(query, { scope }).slice(0, 5)
  searchResults.value = knownResults
  searchState.value = knownResults.length ? 'success' : 'loading'
  searchMessage.value = knownResults.length ? '' : '도시를 찾고 있어요.'

  if (knownResults.length) return
  if (query.length < 2) {
    searchState.value = 'idle'
    searchMessage.value = '두 글자 이상 입력하면 더 많은 도시를 찾을 수 있어요.'
    return
  }
  searchTimer = window.setTimeout(() => {
    void performSearch({ query, scope, requestId })
  }, 140)
}

const finishSearchComposition = async () => {
  isSearchComposing.value = false
  // 한글 조합 완료 시점에는 v-model 값 반영이 한 틱 뒤에 끝날 수 있다.
  // 다음 틱에 다시 검색해 '대전' 같은 완성 단어를 즉시 최상단에 반영한다.
  await nextTick()
  scheduleSearch()
}

watch([searchQuery, searchScope], () => {
  if (!isSearchComposing.value) scheduleSearch()
})

watch(
  () => favorites.value.map((city) => city.id).join('|'),
  () => {
    refreshFavoriteWeather({ excludeCityId: selectedCity.value?.id })
  },
)

watch(showFavoritePins, (isVisible) => {
  if (!isVisible) hoveredCity.value = null
})

onMounted(() => {
  // 홈 초기 화면은 하단 즐겨찾기 미니 카드만 표시하고, 날씨는 배경에서 채운다.
  favoriteWeatherTimer = window.setTimeout(() => {
    refreshFavoriteWeather({ excludeCityId: selectedCity.value?.id })
  }, 700)
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
  window.clearTimeout(favoriteWeatherTimer)
  searchController?.abort()
  selectedWeatherController?.abort()
  favoriteWeatherController?.abort()
  selectedWeatherRequestId += 1
  favoriteWeatherRequestId += 1
})
</script>

<template>
  <main class="weather-fairy-home">
    <header class="home-header">
      <RouterLink class="brand" to="/" aria-label="WEATHER FAIRY 홈">
        <span>WEATHER</span><strong>FAIRY</strong>
      </RouterLink>
      <div class="header-actions">
        <UnitToggler compact />
        <button
          class="favorite-toggle"
          type="button"
          :aria-pressed="showFavoritePins"
          :aria-label="toggleCopy"
          @click="showFavoritePins = !showFavoritePins"
        >
          <el-icon><component :is="showFavoritePins ? StarFilled : Star" /></el-icon>
        </button>
      </div>
    </header>

    <section class="search-panel" aria-label="도시 검색">
      <div class="search-scope" role="group" aria-label="검색 범위">
        <button
          type="button"
          :class="{ active: searchScope === 'domestic' }"
          aria-label="검색 범위: 국내"
          @click="searchScope = 'domestic'"
        >
          국내
        </button>
        <button
          type="button"
          :class="{ active: searchScope === 'global' }"
          aria-label="검색 범위: 해외"
          @click="searchScope = 'global'"
        >
          해외
        </button>
      </div>
      <form class="city-search" role="search" @submit.prevent="submitSearch">
        <label class="sr-only" for="city-search">도시 또는 지역 검색</label>
        <el-icon><Search /></el-icon>
        <input
          id="city-search"
          v-model="searchQuery"
          type="search"
          :placeholder="searchHint"
          autocomplete="off"
          @compositionstart="isSearchComposing = true"
          @compositionend="finishSearchComposition"
        />
      </form>
      <div
        v-if="searchQuery.trim() || searchState !== 'idle' || searchMessage"
        class="search-feedback"
      >
        <p v-if="searchQuery.trim()" class="search-query" aria-live="polite">
          검색 중인 도시: <strong>{{ searchQuery.trim() }}</strong>
        </p>
        <p v-if="searchState === 'loading'" class="search-message">도시를 찾고 있어요.</p>
        <p v-else-if="searchMessage" class="search-message" aria-live="polite">
          {{ searchMessage }}
        </p>
        <ul v-if="searchResults.length" class="search-results" aria-label="도시 검색 결과">
          <li v-for="city in searchResults" :key="city.id">
            <button type="button" @click="selectSearchResult(city)">
              <span
                ><strong>{{ city.name }}</strong
                ><small>{{ city.country }}</small></span
              >
              <el-icon><ArrowRight /></el-icon>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <section class="map-stage" aria-label="도시 지도 미리보기">
      <FavoriteMap
          :favorites="favoriteWeatherCities"
          :selected-city="mapSelectedCity"
          :card-city="mapCardCity"
          :show-favorite-pins="showFavoritePins"
          :is-focused="isMapFocused"
          @select-city="selectCity"
          @preview-city="previewCity"
          @clear-preview="clearPreviewCity"
        >
        <template #selected-card="{ city, position, cardSide }">
          <section
            v-if="city"
            class="weather-summary"
            :class="{ 'weather-summary--left': cardSide === 'left' }"
            :style="{ '--selected-city-left': position.left, '--selected-city-top': position.top }"
            :aria-label="`${city.name}의 현재 날씨`"
          >
            <header class="weather-summary__header">
              <div class="weather-summary__title">
                <p>LIVE WEATHER</p>
                <h1>{{ city.name }}</h1>
                <span>{{ city.country }}</span>
              </div>
              <button
                class="summary-favorite"
                type="button"
                :aria-label="favoriteStore.isFavorite(city.id) ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'"
                @click="toggleCityFavorite(city)"
              >
                <el-icon
                  ><component :is="favoriteStore.isFavorite(city.id) ? StarFilled : Star" />
                </el-icon>
              </button>
            </header>
            <div class="weather-summary__condition">
              <el-icon
                :class="[
                  'weather-icon',
                  `weather-icon--${weatherVisual(city.weatherCode).tone}`,
                ]"
              >
                <component :is="weatherVisual(city.weatherCode).icon" />
              </el-icon>
              <div>
                <strong>{{ displayTemperature(city.temp) }}</strong>
                <small>{{ city.condition }}</small>
              </div>
            </div>
            <p v-if="weatherError" class="weather-summary__error" role="alert">
              {{ weatherError }}
            </p>
            <button
              class="summary-action summary-action--primary"
              type="button"
              @click="openDetail(city)"
            >
              상세 보기 <el-icon><ArrowRight /></el-icon>
            </button>
          </section>
        </template>
      </FavoriteMap>
    </section>

    <section class="favorite-strip" aria-label="즐겨찾기 도시 미리보기">
      <button class="strip-control" type="button" aria-label="이전 도시">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <div
        v-if="favoriteWeatherCities.length"
        class="city-cards"
        :style="favoriteCardLayoutStyle"
        :aria-busy="isRefreshingFavorites"
      >
        <button
          v-for="city in favoriteWeatherCities"
          :key="city.id"
          class="city-card"
          :class="{ selected: selectedCity?.id === city.id }"
          type="button"
          @click="selectCity(city)"
        >
          <span class="city-card__landmark" aria-hidden="true">
            <img v-if="cityLandmarkSrc(city)" :src="cityLandmarkSrc(city)" alt="" />
            <el-icon v-else><Location /></el-icon>
          </span>
          <span class="city-card__copy">
            <strong>{{ city.name }}</strong
            ><small>{{ displayTemperature(city.temp) }}</small>
          </span>
          <span class="city-card__weather" :aria-label="`현재 날씨: ${city.condition}`">
            <el-icon
              :class="['weather-icon', `weather-icon--${weatherVisual(city.weatherCode).tone}`]"
            >
              <component :is="weatherVisual(city.weatherCode).icon" />
            </el-icon>
          </span>
        </button>
      </div>
      <p v-else class="favorite-empty">즐겨찾기 도시를 검색해서 저장해 보세요.</p>
      <button class="strip-control" type="button" aria-label="다음 도시">
        <el-icon><ArrowRight /></el-icon>
      </button>
    </section>

    <p class="preview-note">
      현재 날씨·도시 검색 데이터:
      <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeather</a>
    </p>
  </main>
</template>

<style scoped>
.weather-fairy-home {
  --page-gutter: clamp(18px, 4vw, 64px);
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 18px var(--page-gutter);
  color: #eaf7ff;
  background: #020a16;
}

.home-header,
.header-actions,
.favorite-strip,
.weather-summary__header,
.search-results button,
.city-card {
  display: flex;
  align-items: center;
}

.home-header {
  position: relative;
  z-index: 1;
  justify-content: space-between;
  min-height: 40px;
}

.header-actions {
  gap: 9px;
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  color: #eaf7ff;
  font-family: 'Arial Narrow', 'Helvetica Neue', sans-serif;
  letter-spacing: 0.12em;
  text-decoration: none;
}

.brand span {
  color: #d2e2eb;
  font-size: clamp(18px, 1.55vw, 25px);
  font-weight: 400;
}

.brand strong {
  color: #f0f8ff;
  font-size: clamp(30px, 2.55vw, 40px);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.favorite-toggle,
.search-scope button,
.strip-control,
.city-card,
.search-results button,
.summary-action {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.favorite-toggle {
  display: grid;
  width: 44px;
  min-height: 44px;
  padding: 0;
  place-items: center;
  color: #e7dfff;
  background: #100b25;
  border: 1px solid #8c5bff;
  border-radius: 10px;
  box-shadow:
    0 0 17px rgba(143, 85, 255, 0.52),
    inset 0 0 13px rgba(141, 86, 255, 0.12);
  font-size: 14px;
  font-weight: 700;
}

.favorite-toggle[aria-pressed='false'] {
  color: #b7cad8;
  background: #07101d;
  border-color: #32526b;
  box-shadow: none;
}

.favorite-toggle :deep(svg) {
  width: 21px;
  height: 21px;
  fill: currentColor;
}

.search-panel {
  position: relative;
  z-index: 5;
  width: min(560px, 100%);
  margin: 12px auto 14px;
}

.search-scope {
  display: flex;
  width: 196px;
  margin: 0 auto 10px;
  padding: 2px;
  background: #06101f;
  border: 1px solid rgba(50, 127, 192, 0.36);
  border-radius: 9px;
}

.search-scope button {
  flex: 1;
  min-height: 32px;
  color: #869daf;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
}

.search-scope button.active {
  color: #e4f8ff;
  background: #062140;
  border: 1px solid #0fa6ff;
  box-shadow: 0 0 15px rgba(0, 144, 255, 0.44);
}

.city-search {
  display: flex;
  position: relative;
  isolation: isolate;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  background: #040c19;
  border: 1px solid #6cd6ff;
  border-radius: 10px;
  box-shadow:
    0 0 6px rgba(214, 247, 255, 0.9),
    0 0 18px rgba(0, 188, 255, 0.72),
    0 0 42px rgba(21, 115, 255, 0.46),
    inset 0 0 20px rgba(0, 151, 255, 0.14);
}

.city-search::before {
  position: absolute;
  inset: -3px;
  z-index: -1;
  padding: 1px;
  pointer-events: none;
  content: '';
  background: conic-gradient(
    from 90deg,
    transparent,
    #35caff 18%,
    #e2fbff 25%,
    #4a9dff 39%,
    transparent 52%,
    #2db8ff 74%,
    #e2fbff 83%,
    transparent
  );
  border-radius: 12px;
  filter: blur(3px);
  opacity: 0.86;
  animation: search-border-pulse 3.4s ease-in-out infinite;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.city-search::after {
  position: absolute;
  top: -2px;
  left: 18%;
  width: 64%;
  height: 2px;
  pointer-events: none;
  content: '';
  background: linear-gradient(90deg, transparent, #e8fdff 50%, transparent);
  box-shadow:
    0 0 6px #e8fdff,
    0 0 16px #2fbfff,
    0 0 32px rgba(35, 145, 255, 0.9);
  animation: search-beam-pulse 2.8s ease-in-out infinite;
}

.city-search > * {
  position: relative;
  z-index: 1;
}

.city-search :deep(svg) {
  color: #dcefff;
  font-size: 21px;
}

.city-search input {
  flex: 1;
  min-width: 0;
  color: #e6f6ff;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 14px;
}

.city-search input::placeholder {
  color: #7f94a7;
}

@keyframes search-border-pulse {
  0%,
  100% {
    filter: blur(2px);
    opacity: 0.64;
  }
  50% {
    filter: blur(4px);
    opacity: 1;
  }
}

@keyframes search-beam-pulse {
  0%,
  100% {
    opacity: 0.48;
    transform: scaleX(0.72);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

.search-feedback {
  position: absolute;
  right: 0;
  left: 0;
  padding-top: 8px;
}

.search-message {
  margin: 0 2px 7px;
  color: #9fb6c6;
  font-size: 12px;
}

.search-query {
  margin: 0 2px 7px;
  color: #aebfcd;
  font-size: 12px;
}

.search-query strong {
  color: #e7f8ff;
  font-weight: 800;
}

.search-results {
  max-height: 280px;
  padding: 5px;
  margin: 0;
  overflow-y: auto;
  list-style: none;
  background: #071221;
  border: 1px solid #245981;
  border-radius: 10px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
}

.search-results li + li {
  border-top: 1px solid rgba(54, 101, 139, 0.38);
}

.search-results button {
  justify-content: space-between;
  width: 100%;
  padding: 11px 10px;
  color: #e6f6ff;
  background: transparent;
  text-align: left;
}

.search-results button span {
  display: grid;
  gap: 3px;
}

.search-results button small {
  color: #8fa8b8;
}

.map-stage {
  position: absolute;
  z-index: 0;
  /* 공통 네비게이션과 홈 배너 영역은 단색으로 남기고, 그 아래에서만 지도를 시작한다. */
  inset: 80px 0 0;
  --favorite-map-height: 100%;
}

.favorite-strip {
  position: relative;
  z-index: 1;
  justify-content: center;
  gap: 10px;
  width: min(1400px, 100%);
  margin: auto auto 0;
}

.city-cards {
  display: grid;
  flex: 0 1 auto;
  gap: 7px;
  min-width: 0;
  max-width: calc(100% - 100px);
}

.city-card {
  gap: 5px;
  min-height: 50px;
  padding: 7px 9px;
  color: #dceaf2;
  background: #050b19;
  border: 1px solid #1b385d;
  border-radius: 9px;
  text-align: left;
}

.city-card__landmark {
  display: grid;
  flex: 0 0 auto;
  width: 28px;
  height: 32px;
  place-items: center;
  color: #cceeff;
}

.city-card__landmark img {
  display: block;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
  object-fit: contain;
}

.city-card__landmark :deep(svg) {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 7px rgba(103, 202, 255, 0.65));
}

.city-card.selected {
  color: #eee7ff;
  border-color: #9d64ff;
  box-shadow: 0 0 16px rgba(142, 79, 255, 0.34);
}

.city-card__copy {
  display: grid;
  flex: 1;
  gap: 3px;
  min-width: 0;
}

.city-card__copy strong {
  overflow: hidden;
  font-size: 12px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-card__copy small {
  color: #aabecb;
  font-size: 11px;
  line-height: 1.2;
}

.city-card__weather {
  display: grid;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  place-items: center;
}

.city-card__weather :deep(svg) {
  width: 18px;
  height: 18px;
}

.strip-control {
  display: grid;
  width: 26px;
  height: 36px;
  place-items: center;
  color: #d2e8f5;
  background: transparent;
  font-size: 19px;
}

.favorite-empty {
  flex: 1;
  margin: 0;
  color: #9eb5c4;
  font-size: 14px;
  text-align: center;
}

.weather-summary {
  position: absolute;
  z-index: 4;
  top: clamp(10px, calc(var(--selected-city-top) - 48px), calc(100% - 164px));
  /* 중앙 핀의 아이콘 폭과 안전 여백을 모두 비워, 카드가 핀을 관통하지 않게 한다. */
  left: clamp(10px, calc(var(--selected-city-left) + 58px), calc(100% - 206px));
  width: clamp(164px, 13vw, 196px);
  padding: 10px;
  margin: 0;
  color: #eaf7ff;
  background: rgba(5, 13, 32, 0.82);
  border: 1px solid rgba(166, 108, 255, 0.82);
  border-radius: 12px;
  box-shadow:
    0 0 5px rgba(196, 137, 255, 0.8),
    0 0 20px rgba(145, 81, 255, 0.36),
    inset 0 0 20px rgba(87, 72, 200, 0.08);
  backdrop-filter: blur(7px);
}

.weather-summary--left {
  /* 지도 오른쪽의 도시(예: 캔버라)는 카드가 핀 왼쪽에 붙어 서로 겹치지 않는다. */
  left: clamp(10px, calc(var(--selected-city-left) - 222px), calc(100% - 206px));
}

.weather-summary__header {
  justify-content: space-between;
  gap: 8px;
}

.weather-summary__title p,
.weather-summary__title h1,
.weather-summary__title span,
.weather-summary__title small {
  margin: 0;
}

.weather-summary__title p {
  color: #8fcbff;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.weather-summary__title h1 {
  margin-top: 3px;
  color: #f1f7ff;
  font-size: 16px;
  line-height: 1.15;
}

.weather-summary__title > span {
  display: block;
  margin-top: 2px;
  color: #93aabe;
  font-size: 10px;
}

.summary-favorite {
  display: grid;
  flex: 0 0 auto;
  width: 27px;
  height: 27px;
  padding: 0;
  place-items: center;
  color: #c7a9ff;
  background: rgba(98, 61, 181, 0.14);
  border: 1px solid rgba(164, 121, 255, 0.64);
  border-radius: 8px;
  cursor: pointer;
}

.summary-favorite :deep(svg) {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.weather-summary__condition {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 0 8px;
}

.weather-summary__condition > div {
  display: grid;
  gap: 2px;
}

.weather-icon {
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 34px;
}

.weather-summary__condition strong {
  color: #d7f7ff;
  font-size: 28px;
  letter-spacing: -0.04em;
}

.weather-summary__condition small {
  display: block;
  color: #aabed0;
  font-size: 11px;
}

.weather-icon--sunny {
  color: #ffd36a;
  filter: drop-shadow(0 0 7px rgba(255, 196, 74, 0.48));
}

.weather-icon--partly-cloudy {
  color: #b7e7ff;
  filter: drop-shadow(0 0 7px rgba(132, 210, 255, 0.4));
}

.weather-icon--cloudy {
  color: #b8c7d5;
}

.weather-icon--rain {
  color: #6acbff;
  filter: drop-shadow(0 0 7px rgba(56, 172, 255, 0.42));
}

.weather-icon--snow {
  color: #e9fbff;
  filter: drop-shadow(0 0 7px rgba(202, 241, 255, 0.5));
}

.weather-icon--storm {
  color: #caa3ff;
  filter: drop-shadow(0 0 7px rgba(165, 93, 255, 0.55));
}

.weather-icon--loading {
  color: #7b9aae;
}

.weather-summary__error {
  margin: -2px 0 7px;
  color: #ffb7b7;
  font-size: 10px;
}

.summary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 30px;
  padding: 0 8px;
  color: #c8eaff;
  background: rgba(16, 67, 116, 0.4);
  border: 1px solid #238ed0;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
}

.summary-action--primary {
  color: #e9fbff;
  background: rgba(15, 79, 134, 0.48);
  border-color: #38b5ff;
  box-shadow: 0 0 13px rgba(26, 172, 255, 0.16);
}

.preview-note {
  position: relative;
  z-index: 1;
  margin: 8px 0 0;
  color: #617b91;
  font-size: 11px;
  text-align: center;
}

.preview-note a {
  color: #8fc9e8;
}

button:hover {
  filter: brightness(1.15);
}

button:focus-visible,
.city-search:focus-within {
  outline: 2px solid #d6f5ff;
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .city-cards {
    flex: 1;
    grid-template-columns: repeat(4, minmax(120px, 1fr)) !important;
  }
}

@media (max-width: 767px) {
  .weather-fairy-home {
    --page-gutter: 14px;
    padding: 16px var(--page-gutter) 22px;
  }
  .home-header {
    align-items: flex-start;
  }
  .favorite-toggle {
    width: 40px;
    min-height: 40px;
  }
  .search-panel {
    margin: 12px auto 14px;
  }
  .favorite-strip {
    gap: 4px;
  }
  .city-cards {
    display: flex;
    gap: 7px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .city-card {
    flex: 0 0 116px;
    scroll-snap-align: start;
  }
  .strip-control {
    display: none;
  }
  .weather-summary {
    top: clamp(8px, calc(var(--selected-city-top) - 46px), calc(100% - 156px));
    right: auto;
    bottom: auto;
    left: clamp(8px, calc(var(--selected-city-left) + 52px), calc(100% - 188px));
    width: min(180px, 52vw);
    padding: 10px;
  }
}

@media (max-width: 430px) {
  .brand span {
    display: none;
  }
  .header-actions {
    gap: 5px;
  }
}
</style>
