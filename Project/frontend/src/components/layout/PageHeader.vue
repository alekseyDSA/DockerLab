<template>
  <div class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.page-header {
  max-width: 1200px;
  margin: 0 auto 30px;
}

.page-title {
  color: rgb(40, 96, 144);
  font-size: 2rem;
  margin: 0;
  padding: 20px 0;
  border-bottom: 2px solid rgba(40, 96, 144, 0.2);
}
</style>