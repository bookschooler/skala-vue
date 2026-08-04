<script setup>
import { computed, inject } from 'vue'
import { statusEmoji } from '../utils/weather'

// 도시 객체는 props로 받고, 사용자 동작은 이벤트로 부모에 위임한다.
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'remove-card'])
const openDetail = () => { emit('select-card', props.cityItem); emit('click-detail', props.cityItem) }
const onKeydown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail() } }

// 부모(WeatherParent)가 provide한 단위 상태 주입
const { unitSymbol, convertTemp } = inject('weather-unit')

// 날씨 상태별 파스텔 배경 클래스
const statusClass = computed(() => {
  const map = { 맑음: 'card-sunny', 구름: 'card-cloudy', 흐림: 'card-overcast', 비: 'card-rainy' }
  return map[props.cityItem.status] ?? 'card-default'
})
</script>

<template>
  <div class="weather-card" :class="statusClass" role="button" tabindex="0" :aria-label="`${cityItem.name} 날씨 상세보기`" @click="openDetail" @keydown="onKeydown">
    <!-- .stop: 삭제/상세 버튼 클릭이 카드 select-card로 버블링되지 않도록 차단 -->
    <button
      class="remove-btn"
      type="button"
      title="목록에서 삭제"
      @click.stop="$emit('remove-card', cityItem)"
    >
      ✕
    </button>

    <p class="card-emoji">{{ statusEmoji(cityItem.status) }}</p>
    <h4>{{ cityItem.name }}</h4>
    <p class="temp-line">{{ convertTemp(cityItem.temp) }}{{ unitSymbol }} · {{ cityItem.status }}</p>

    <!-- 더움/선선함 판정은 원본 섭씨 기준 (단위 전환과 무관하게 동일해야 함) -->
    <p v-if="cityItem.temp >= 25" class="label hot">🔥 더움 (25도 이상)</p>
    <p v-else class="label cool">❄️ 선선함 (25도 미만)</p>

    <button class="detail-btn" type="button" @click.stop="$emit('click-detail', cityItem)">
      상세보기
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  position: relative;
  flex: 1 1 150px;
  max-width: 200px;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.weather-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(53, 73, 94, 0.15);
}

/* 파스텔 팔레트 — 날씨 상태별 배경 */
.card-sunny {
  background-color: #fff7e0;
  border-color: #f5dfa0;
}

.card-cloudy {
  background-color: #eef2f7;
  border-color: #d5deea;
}

.card-overcast {
  background-color: #e8ecf1;
  border-color: #ccd4de;
}

.card-rainy {
  background-color: #e3edf9;
  border-color: #b9d2ee;
}

.card-default {
  background-color: #f5f5f5;
  border-color: #ddd;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background-color: rgba(53, 73, 94, 0.12);
  color: #56687a;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.card-emoji {
  font-size: 1.8rem;
}

.weather-card h4 {
  margin: 4px 0;
  color: #35495e;
}

.temp-line {
  margin-bottom: 6px;
  color: #4a5b6c;
}

.label {
  font-size: 0.85rem;
  font-weight: bold;
}

.hot {
  color: #e74c3c;
}

.cool {
  color: #3498db;
}

.detail-btn {
  margin-top: 8px;
  padding: 4px 12px;
  border: none;
  border-radius: 8px;
  color: white;
  background-color: #42b883;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.detail-btn:hover {
  background-color: #369b6d;
}
</style>
