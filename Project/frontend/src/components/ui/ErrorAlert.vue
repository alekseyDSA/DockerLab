<template>
  <div class="error-message">
    <span>⚠️ {{ error }}</span>
    <button
        v-if="showRetry"
        @click="$emit('retry')"
        class="retry-button"
    >
      Повторить
    </button>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

defineEmits(['retry'])
</script>

<style scoped>
.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-button {
  background: white;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-button:hover {
  background: #dc2626;
  color: white;
}
</style>