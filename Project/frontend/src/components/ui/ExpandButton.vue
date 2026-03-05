<template>
  <div class="expand-section">
    <button
        type="button"
        class="expand-button"
        @click="$emit('update:modelValue', !modelValue)"
    >
      <span>{{ modelValue ? labels.expandedLabel : labels.collapsedLabel }}</span>
      <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :class="{ 'rotate-180': modelValue }"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  labels: {
    type: Object,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.expand-section {
  margin: 30px 0;
  display: flex;
  justify-content: center;
}

.expand-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid rgb(40, 96, 144);
  color: rgb(40, 96, 144);
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-button:hover {
  background-color: rgba(40, 96, 144, 0.05);
  transform: translateY(-1px);
}

.expand-button svg {
  transition: transform 0.3s ease;
}

.expand-button svg.rotate-180 {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .expand-button {
    width: 100%;
    justify-content: center;
  }
}
</style>