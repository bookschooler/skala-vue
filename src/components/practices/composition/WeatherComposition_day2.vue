<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '성남', temp: 27, status: '구름' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '천안', temp: 24, status: '비' },
])

const searchQuery = ref('')
const selectedCity = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((weather) => weather.name.includes(query))
})

watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] 상태바 문구 변경: "${oldInfo}" -> "${newInfo}"`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 도시 검색어: "${searchQuery.value}"`)
})

const selectCity = (cityName) => {
  selectedCity.value = cityName
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <main class="weather-mockup">
    <header class="page-header">
      <div>
        <p class="eyebrow">SKALA WEATHER</p>
        <h1>🌤️ 과제 2: 날씨 (Composition)</h1>
        <p class="header-description">오늘의 지역별 날씨를 한눈에 확인해 보세요.</p>
      </div>
      <span class="today-badge">TODAY</span>
    </header>

    <section class="panel search-panel">
      <h2>🔍 도시 검색</h2>
      <label for="city-search" class="sr-only">검색할 도시 이름</label>
      <input
        id="city-search"
        type="text"
        v-model="searchQuery"
        placeholder="검색할 도시 이름 입력"
      />
      <p>
        검색 중인 도시:
        <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <section class="panel weather-panel">
      <h2>🏙️ 지역별 날씨 현황</h2>

      <div class="weather-list">
        <article
          v-for="weather in filteredWeatherList"
          :key="weather.id"
          class="weather-card"
          :class="{ selected: selectedCity === weather.name }"
          @click="selectCity(weather.name)"
        >
          <div class="weather-information">
            <h3>{{ weather.name }} ({{ weather.status }})</h3>
            <p>현재 기온: {{ weather.temp }}°C</p>

            <span v-if="weather.temp >= 25" class="temperature-label hot">
              🔥 더움 (25도 이상)
            </span>
            <span v-else class="temperature-label cool"> ❄️ 선선함 (25도 미만) </span>
          </div>

          <button
            type="button"
            class="detail-button"
            @click.stop="showDetail(weather.name, weather.status)"
          >
            상세보기
          </button>
        </article>

        <p v-if="filteredWeatherList.length === 0" class="empty-message" role="status">
          검색 결과와 일치하는 도시가 없습니다.
        </p>
      </div>
    </section>

    <footer class="status-bar" aria-live="polite">
      {{ selectedCityInfo }}
    </footer>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.weather-mockup {
  width: min(720px, calc(100% - 32px));
  margin: 48px auto;
  padding: 32px;
  color: #1f2f46;
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(42, 62, 92, 0.13);
  font-family: Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
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
  letter-spacing: -0.6px;
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
  letter-spacing: 1px;
}

.panel {
  margin-top: 20px;
  padding: 22px;
  background: #f7f9fc;
  border: 1px solid #e5eaf1;
  border-radius: 16px;
}

.panel h2 {
  margin: 0 0 13px;
  font-size: 17px;
  line-height: 1.4;
  letter-spacing: -0.2px;
}

.search-panel input {
  width: 100%;
  padding: 13px 15px;
  color: #24344a;
  background: #ffffff;
  border: 1px solid #d1d9e5;
  border-radius: 10px;
  font-size: 15px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.search-panel input:focus {
  border-color: #6289e8;
  outline: none;
  box-shadow: 0 0 0 4px rgba(98, 137, 232, 0.14);
}

.search-panel p {
  min-height: 21px;
  margin: 11px 2px 0;
  color: #68768a;
  font-size: 14px;
}

.search-panel strong {
  color: #426bd1;
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

.weather-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 118px;
  padding: 18px 18px 18px 21px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 13px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.weather-card:hover {
  border-color: #afc1e8;
  box-shadow: 0 10px 24px rgba(58, 79, 111, 0.11);
  transform: translateY(-2px);
}

.weather-card::before {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
  width: 4px;
  background: #d5deea;
  border-radius: 0 4px 4px 0;
  content: '';
}

.weather-card.selected {
  border-color: #88a7ee;
  background: #f9fbff;
  box-shadow: 0 8px 22px rgba(66, 107, 209, 0.12);
}

.weather-card.selected::before {
  background: #527ae0;
}

.weather-information h3,
.weather-information p {
  margin: 0 0 7px;
}

.weather-information h3 {
  color: #1f2f46;
  font-size: 17px;
}

.weather-information p {
  color: #667489;
  font-size: 14px;
}

.temperature-label {
  display: inline-block;
  padding: 6px 11px;
  color: #ffffff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.temperature-label.hot {
  background: #f16068;
}

.temperature-label.cool {
  background: #559ce5;
}

.detail-button {
  flex: 0 0 auto;
  padding: 9px 14px;
  color: #3c5474;
  background: #ffffff;
  border: 1px solid #ccd6e2;
  border-radius: 9px;
  font-weight: 700;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.detail-button:hover {
  color: #ffffff;
  background: #4f77d9;
  border-color: #4f77d9;
}

.detail-button:focus-visible {
  outline: 3px solid rgba(74, 144, 226, 0.25);
  outline-offset: 2px;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 520px) {
  .weather-mockup {
    width: min(100% - 20px, 720px);
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

  .panel {
    padding: 15px;
  }

  .weather-card {
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
  }

  .detail-button {
    padding: 8px 10px;
  }
}
</style>
