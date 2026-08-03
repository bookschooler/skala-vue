<script setup>
import { ref } from 'vue'
import { STATUS_OPTIONS } from '../utils/weather'

const emit = defineEmits(['add-city'])

const cityName = ref('')
const cityTemp = ref(25)
const cityStatus = ref('맑음')
const errorMsg = ref('')

// @submit.prevent — 폼 기본 제출(새로고침) 차단 이벤트 수식어 활용
const submitCity = () => {
  const trimmed = cityName.value.trim()
  if (!trimmed) {
    errorMsg.value = '도시 이름을 입력해 주세요.'
    return
  }
  if (typeof cityTemp.value !== 'number') {
    errorMsg.value = '기온은 숫자로 입력해 주세요.'
    return
  }
  errorMsg.value = ''
  emit('add-city', { name: trimmed, temp: cityTemp.value, status: cityStatus.value })
  cityName.value = ''
  cityTemp.value = 25
}
</script>

<template>
  <form class="city-form" @submit.prevent="submitCity">
    <input v-model.trim="cityName" class="name-input" placeholder="도시 이름 (예: 포항)" />
    <!-- .number: 입력값을 숫자로 자동 형변환하는 v-model 수식어 -->
    <input v-model.number="cityTemp" class="temp-input" type="number" min="-30" max="45" />
    <span class="temp-unit">℃</span>
    <select v-model="cityStatus" class="status-select">
      <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">{{ status }}</option>
    </select>
    <button class="submit-btn" type="submit">➕ 추가</button>
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
  </form>
</template>

<style scoped>
.city-form {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.city-form input,
.city-form select {
  padding: 6px 10px;
  border: 1px solid #ccd4de;
  border-radius: 8px;
  background-color: #fff;
}

.city-form input:focus,
.city-form select:focus {
  outline: none;
  border-color: #42b883;
}

.name-input {
  width: 180px;
}

.temp-input {
  width: 80px;
}

.temp-unit {
  color: #6b7a8c;
}

.submit-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  color: white;
  background-color: #42b883;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: #369b6d;
}

.error-msg {
  width: 100%;
  font-size: 0.85rem;
  color: #e74c3c;
}
</style>
