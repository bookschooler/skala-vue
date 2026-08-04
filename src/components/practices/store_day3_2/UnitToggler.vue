<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../../../stores/configStore.js'

const configStore = useConfigStore()

const currentUnitName = computed(() => (configStore.unit === 'celsius' ? '섭씨' : '화씨'))
const nextUnitName = computed(() => (configStore.unit === 'celsius' ? '화씨' : '섭씨'))
</script>

<template>
  <div class="unit-toggler">
    <span class="current-unit" aria-live="polite">
      현재: {{ currentUnitName }} {{ configStore.unitSymbol }}
    </span>
    <button
      type="button"
      :aria-label="`온도 단위를 ${nextUnitName}로 변경`"
      @click="configStore.toggleUnit()"
    >
      {{ nextUnitName }}로 보기
    </button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid #dce4ef;
}

.current-unit {
  color: #65748a;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

button {
  padding: 9px 12px;
  color: #ffffff;
  background: #4f77d9;
  border: 1px solid #4f77d9;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

button:hover {
  background: #3d65c8;
}

button:focus-visible {
  outline: 3px solid rgba(74, 119, 226, 0.35);
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .unit-toggler {
    width: 100%;
    justify-content: space-between;
    padding: 10px 0 0;
    border-top: 1px solid #e4eaf2;
    border-left: 0;
  }
}
</style>
