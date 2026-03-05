<template>
  <div class="form-actions">
    <button
        type="submit"
        class="submit-button"
        :disabled="disabled"
    >
      <span v-if="loading">{{ loadingText || 'Отправка...' }}</span>
      <span v-else>{{ label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  disabled: Boolean,
  loading: Boolean,
  label: {
    type: String,
    default: 'Отправить'
  },
  loadingText: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: rgb(40, 96, 144);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(40, 96, 144, 0.2);
}

.submit-button:hover:not(:disabled) {
  background-color: rgb(30, 76, 114);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 96, 144, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .form-actions {
    justify-content: stretch;
  }

  .submit-button {
    width: 100%;
  }
}
</style>