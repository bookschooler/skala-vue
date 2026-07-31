
  <script setup>
  const welcomeMessage = 'Welcome to Skala-Vue'
  </script>

  <template>
    <div class="practice-section">
      <h2>{{ welcomeMessage }}</h2>

      <p>대문자: {{ welcomeMessage.toUpperCase() }}</p>

      <p>
        Random number:
        {{ Math.ceil(Math.random() * 100) }}
      </p>

      <p>문자열 길이: {{ welcomeMessage.length }}</p>
    </div>
  </template>

  <style scoped>
  .practice-section {
    padding: 24px;
  }
  </style>