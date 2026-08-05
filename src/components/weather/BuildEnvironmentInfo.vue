<script setup>
const myRegion = 'Suwon'
const mode = import.meta.env.MODE
const apiUrl = import.meta.env.VITE_API_URL ?? '설정되지 않음'
</script>

<template>
  <el-card class="environment-card" shadow="never">
    <template #header><strong>빌드 환경</strong></template>
    <dl>
      <div>
        <dt>실습 지역</dt>
        <dd>{{ myRegion }}</dd>
      </div>
      <div>
        <dt>Vite mode</dt>
        <dd>{{ mode }}</dd>
      </div>
      <div>
        <dt>VITE_API_URL</dt>
        <dd>{{ apiUrl }}</dd>
      </div>
    </dl>
  </el-card>
</template>

<style scoped>
.environment-card {
  margin-top: 28px;
}

dl {
  margin: 0;
}

dl div {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  margin-top: 10px;
}

dt {
  color: #68768a;
}

dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 700;
}
</style>
