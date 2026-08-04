import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const storedUnit = typeof localStorage === 'undefined' ? null : localStorage.getItem('weather-fairy.unit')
  const unit = ref(storedUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius')

  const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  watch(unit, (nextUnit) => {
    try {
      localStorage.setItem('weather-fairy.unit', nextUnit)
    } catch {
      // 저장이 제한된 브라우저에서는 현재 세션의 단위 상태만 유지한다.
    }
  })

  return { unit, unitSymbol, toggleUnit }
})
