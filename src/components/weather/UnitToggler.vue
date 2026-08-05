<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../../stores/configStore.js'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const configStore = useConfigStore()

const currentUnitName = computed(() => (configStore.unit === 'celsius' ? '섭씨' : '화씨'))
const nextUnitName = computed(() => (configStore.unit === 'celsius' ? '화씨' : '섭씨'))
</script>

<template>
  <div class="unit-toggler" :class="{ 'unit-toggler--compact': compact }">
    <span v-if="!compact" class="current-unit" aria-live="polite">
      현재: {{ currentUnitName }} {{ configStore.unitSymbol }}
    </span>
    <el-button
      class="unit-toggler__button"
      type="primary"
      :aria-label="`온도 단위를 ${nextUnitName}로 변경`"
      @click="configStore.toggleUnit()"
    >
      {{ compact ? configStore.unitSymbol : `${nextUnitName}로 보기` }}
    </el-button>
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

.unit-toggler--compact {
  display: grid;
  padding: 0;
  border: 0;
}

.unit-toggler--compact :deep(.unit-toggler__button) {
  width: 44px;
  min-height: 44px;
  padding: 0;
  color: #bdeaff;
  background: #061221;
  border-color: #285575;
  border-radius: 10px;
  box-shadow: none;
  font-size: 14px;
  font-weight: 800;
}

.unit-toggler--compact :deep(.unit-toggler__button:hover),
.unit-toggler--compact :deep(.unit-toggler__button:focus-visible) {
  color: #eaf7ff;
  background: #0a2037;
  border-color: #4b9fd3;
}

@media (max-width: 600px) {
  .unit-toggler {
    width: 100%;
    justify-content: space-between;
    padding: 10px 0 0;
    border-top: 1px solid #e4eaf2;
    border-left: 0;
  }

  .unit-toggler--compact {
    width: auto;
    padding: 0;
    border: 0;
  }
}
</style>
