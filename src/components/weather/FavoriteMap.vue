<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { LocationFilled } from '@element-plus/icons-vue'
import cyberWorldMapUrl from '../../../img/weather-fairy-cyber-world-map-seamless.png'
import { useConfigStore } from '../../stores/configStore.js'
import { toMapPosition, toMapViewportPosition } from '../../utils/mapPosition.js'

const props = defineProps({
  favorites: {
    type: Array,
    default: () => [],
  },
  selectedCity: {
    type: Object,
    default: null,
  },
  showFavoritePins: Boolean,
  isFocused: Boolean,
})

const emit = defineEmits(['select-city'])
const configStore = useConfigStore()
const mapWorld = ref(null)
const mapViewport = ref({ width: 0, height: 0 })

let mapResizeObserver

const updateMapViewport = () => {
  const bounds = mapWorld.value?.getBoundingClientRect()
  if (!bounds?.width || !bounds?.height) return
  mapViewport.value = { width: bounds.width, height: bounds.height }
}

onMounted(() => {
  updateMapViewport()
  mapResizeObserver = new ResizeObserver(updateMapViewport)
  if (mapWorld.value) mapResizeObserver.observe(mapWorld.value)
})

onBeforeUnmount(() => {
  mapResizeObserver?.disconnect()
})

const isSameCity = (first, second) => first?.id && first.id === second?.id
const mapPositionFor = (city) => toMapViewportPosition(toMapPosition(city), mapViewport.value)

const visiblePins = computed(() => {
  // 지도 위 핀은 '즐겨찾기 핀 보기'가 켜진 즐겨찾기 도시에만 한정한다.
  // 선택 도시는 날씨 카드로는 계속 확인할 수 있지만, 별표를 해제한 순간
  // 즐겨찾기 목록에서 빠지므로 핀도 같은 렌더 사이클에 사라진다.
  if (!props.showFavoritePins) return []
  return props.favorites
})

const focusedMapStyle = computed(() => {
  if (!props.isFocused || !props.selectedCity) return {}

  const { left, top } = mapPositionFor(props.selectedCity)
  const zoom = 1.22
  const leftValue = Number.parseFloat(left)
  const topValue = Number.parseFloat(top)
  // 선택 카드가 항상 핀의 오른쪽에 놓일 자리를 남긴다.
  const pinFocusX = 36
  const pinFocusY = 50

  return {
    transform: `translate(${(pinFocusX - leftValue) * zoom}%, ${(pinFocusY - topValue) * zoom}%) scale(${zoom})`,
  }
})

const displayPinTemperature = (city) => {
  if (
    city.temp === null ||
    city.temp === undefined ||
    city.temp === '' ||
    !Number.isFinite(Number(city.temp))
  ) {
    return '날씨 확인 중'
  }

  const celsius = Number(city.temp)
  const temperature = configStore.unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
  return `${Math.round(temperature)}${configStore.unitSymbol}`
}

const pinLabel = (city) => `${city.name} ${city.condition} ${displayPinTemperature(city)}`
</script>

<template>
  <section class="favorite-map" aria-label="즐겨찾기 도시 지도">
    <div class="favorite-map__viewport">
      <div
        ref="mapWorld"
        class="favorite-map__world"
        :class="{ 'favorite-map__world--focused': isFocused }"
        :style="focusedMapStyle"
      >
        <img
          class="favorite-map__image"
          :src="cyberWorldMapUrl"
          alt="청록 네온 국가 윤곽의 세계 지도"
        />
        <button
          v-for="city in visiblePins"
          :key="city.id"
          class="map-pin"
          :class="{ 'map-pin--selected': isSameCity(city, selectedCity) }"
          :style="mapPositionFor(city)"
          type="button"
          :aria-label="pinLabel(city)"
          @click="emit('select-city', city)"
        >
          <el-icon><LocationFilled /></el-icon>
        </button>
        <slot
          v-if="selectedCity"
          name="selected-card"
          :city="selectedCity"
          :position="mapPositionFor(selectedCity)"
        />
      </div>
    </div>
    <p class="favorite-map__status" aria-live="polite">
      {{ showFavoritePins ? '즐겨찾기 핀을 표시하고 있어요.' : '즐겨찾기 핀을 숨겼어요.' }}
    </p>
  </section>
</template>

<style scoped>
.favorite-map {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  /* 하단 도시 카드까지 첫 화면에 보이도록 지도 높이를 뷰포트 기준으로 제한한다. */
  height: var(--favorite-map-height, clamp(280px, calc(100vh - 380px), 430px));
  min-height: 0;
  background: #020611;
}

.favorite-map__viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #020611;
}

.favorite-map__world {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: center;
  transition: transform 740ms cubic-bezier(0.22, 0.78, 0.26, 1);
  will-change: transform;
}

.favorite-map__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(1.22) contrast(1.06) saturate(1.12);
  mix-blend-mode: screen;
  user-select: none;
}

.map-pin {
  position: absolute;
  z-index: 2;
  display: grid;
  width: 38px;
  height: 46px;
  padding: 0;
  place-items: center;
  color: #a66cff;
  background: transparent;
  border: 0;
  cursor: pointer;
  transform: translate(-50%, -92%);
  filter: drop-shadow(0 0 7px rgba(175, 98, 255, 0.9));
  transition:
    color 180ms ease,
    filter 180ms ease,
    scale 180ms ease;
}

.map-pin :deep(svg) {
  width: 35px;
  height: 35px;
}

.map-pin--selected {
  z-index: 3;
  color: #66d9ff;
  filter: drop-shadow(0 0 10px rgba(64, 213, 255, 0.98));
}

.map-pin:hover,
.map-pin:focus-visible {
  color: #d3b8ff;
  filter: drop-shadow(0 0 12px rgba(194, 132, 255, 1));
  scale: 1.16;
  outline: 0;
}

.map-pin--selected:hover,
.map-pin--selected:focus-visible {
  color: #d7f6ff;
  filter: drop-shadow(0 0 14px rgba(81, 220, 255, 1));
}

.favorite-map__status {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 700px) {
  .favorite-map {
    width: 100%;
    height: var(--favorite-map-height, auto);
    min-height: 320px;
    aspect-ratio: 1.4 / 1;
  }

  .favorite-map__image {
    object-fit: cover;
  }
}
</style>
