<script setup>
defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <article
    class="weather-card"
    :class="{ selected: isSelected }"
    @click="emit('select-card', cityItem)"
  >
    <div class="weather-information">
      <h3>{{ cityItem.name }} ({{ cityItem.status }})</h3>
      <p>현재 기온: {{ cityItem.temp }}°C</p>

      <span v-if="cityItem.temp >= 25" class="temperature-label hot"> 🔥 더움 (25도 이상) </span>
      <span v-else class="temperature-label cool">❄️ 선선함 (25도 미만)</span>
    </div>

    <button
      type="button"
      class="detail-button"
      @click.stop="emit('click-detail', cityItem.name, cityItem.status)"
    >
      상세보기
    </button>
  </article>
</template>

<style scoped>
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

@media (max-width: 520px) {
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
