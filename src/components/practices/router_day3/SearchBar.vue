<script setup>
defineProps({ currentQuery: { type: String, default: '' } })
const emit = defineEmits(['update-query'])
</script>

<template>
  <div class="search-bar">
    <h2>🔍 도시 검색</h2>
    <label for="city-search" class="sr-only">검색할 도시 이름</label>
    <input
      id="city-search"
      type="search"
      :value="currentQuery"
      placeholder="검색할 도시 이름 입력"
      autocomplete="off"
      @input="emit('update-query', $event.target.value)"
    />
    <p>
      검색 중인 도시: <strong>{{ currentQuery || '전체' }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-bar h2 {
  margin: 0 0 13px;
  font-size: 17px;
}
.search-bar input {
  width: 100%;
  padding: 13px 15px;
  color: #24344a;
  background: #fff;
  border: 1px solid #d1d9e5;
  border-radius: 10px;
  font-size: 15px;
}
.search-bar input:focus {
  border-color: #6289e8;
  outline: none;
  box-shadow: 0 0 0 4px rgba(98, 137, 232, 0.14);
}
.search-bar p {
  min-height: 21px;
  margin: 11px 2px 0;
  color: #68768a;
  font-size: 14px;
}
.search-bar strong {
  color: #426bd1;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
