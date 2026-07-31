<script setup>
  import { ref } from 'vue'

  // 일반 변수
  let normalCount = 0

  // Vue 반응형 변수
  const vueCount = ref(0)
  </script>

  <template>
    <div class="practice-section">
      <h2>반응성 데이터 실습</h2>

      <h3>일반 변수: {{ normalCount }}</h3>
      <button @click="normalCount++">일반 변수 증가</button>

      <h3>Vue 반응형 변수: {{ vueCount }}</h3>
      <button @click="vueCount++">Vue 변수 증가</button>
    </div>
  </template>

  <style scoped>
  .practice-section {
    padding: 24px;
  }

  button {
    padding: 8px 14px;
    margin-bottom: 12px;
  }
  </style>