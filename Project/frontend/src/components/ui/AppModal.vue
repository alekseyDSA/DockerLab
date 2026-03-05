<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ title }}</h3>
        <div class="modal-body">
          <slot></slot>
        </div>
        <button class="modal-close" @click="close">
          {{ closeButtonText }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  closeButtonText: {
    type: String,
    default: 'Закрыть'
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.modal-title {
  color: rgb(40, 96, 144);
  margin: 0 0 20px 0;
  font-size: 1.3rem;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-close {
  background-color: rgb(40, 96, 144);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.modal-close:hover {
  background-color: rgb(30, 76, 114);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>