<script setup>
// 검색어는 props로 내려받고, 입력이 생기면 update-query 이벤트로 부모에 올려보낸다.
// 한글 IME 조합 이슈 때문에 v-model 대신 :value + @input 사용.
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (e) => {
  emit('update-query', e.target.value)
}
</script>

<template>
  <div class="search-bar">
    <label for="city-search">도시 검색: </label>
    <input
      id="city-search"
      :value="searchQuery"
      placeholder="도시 이름을 한글로 입력하세요"
      @input="handleInput"
    />
    <p>
      입력한 도시명: <strong>{{ searchQuery }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-bar input {
  padding: 6px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
}

.search-bar input:focus {
  outline: none;
  border-color: #42b883;
}

.search-bar p {
  margin-top: 8px;
}
</style>
