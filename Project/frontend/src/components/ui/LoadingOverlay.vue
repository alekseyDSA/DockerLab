<template>
  <div class="loading-overlay">
    <div class="loading-spinner">{{ text }}</div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Загрузка...'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

.loading-spinner {
  background: white;
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  color: rgb(40, 96, 144);
  font-weight: 500;
}
</style>