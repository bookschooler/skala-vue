<template>
  <section class="base-dashboard-card"><slot></slot></section>
</template>

<style scoped>
.base-dashboard-card {
  margin-top: 20px;
  padding: 22px;
  background: #f7f9fc;
  border: 1px solid #e5eaf1;
  border-radius: 16px;
}
@media (max-width: 520px) {
  .base-dashboard-card {
    padding: 15px;
  }
}
</style>
