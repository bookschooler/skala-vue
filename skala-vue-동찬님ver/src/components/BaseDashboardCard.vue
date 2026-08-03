<script setup>
// 대시보드 섹션들의 공통 디자인 껍데기.
// 콘텐츠는 Default Slot, 제목 오른쪽 영역은 Named Slot(#extra)으로 주입받는다.
defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="dashboard-card">
    <div v-if="title || $slots.extra" class="dashboard-card-header">
      <h3 v-if="title" class="dashboard-card-title">{{ title }}</h3>
      <div v-if="$slots.extra" class="dashboard-card-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <slot></slot>
  </section>
</template>

<style scoped>
.dashboard-card {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e3e8f0;
  border-radius: 14px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(53, 73, 94, 0.06);
}

.dashboard-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.dashboard-card-title {
  color: #35495e;
}
</style>
