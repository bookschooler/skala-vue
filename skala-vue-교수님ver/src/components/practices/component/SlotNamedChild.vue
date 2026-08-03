<template>
  <div class="base-card">
    <header>
      <slot name="header">아무말</slot>
    </header>
    <main>
      <slot name="maintest">대잔치</slot>
    </main>
    <main>
      <slot name="maintest2">대잔치와신난다</slot>
    </main>
  </div>
</template>

<style scoped>
.base-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
