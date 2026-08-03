<script setup>
import SlotNamedChild from './SlotNamedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Named Slot 주입 실습</h2>

    <SlotNamedChild>
      <template v-slot:header>
        <h3>Child 주입 제목</h3>
      </template>
      <template v-slot:maintest>
        <p>메인테스트로 바뀌어야 되는 부분이에요~~~</p>
      </template>

      <template v-slot:maintest2>
        <p>메인테스트로 바뀌어야 되는 부분이에요~~~</p>
      </template>
    </SlotNamedChild>

    <SlotNamedChild> </SlotNamedChild>
  </div>
</template>
