<template>
  <AppModal
      :model-value="show"
      @update:model-value="$emit('update:show', $event)"
      :title="title"
  >
    <div v-if="result" class="success-modal">
      <div class="success-icon">✅</div>
      <p class="success-message">Пациент успешно зарегистрирован!</p>

      <div class="registration-details">
        <div class="detail-row highlight">
          <span class="detail-label">Код для талона:</span>
          <span class="detail-value client-code">{{ result.data.clientCode }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Услуга:</span>
          <span class="detail-value">{{ result.data.serviceName }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Дата и время:</span>
          <span class="detail-value">{{ result.data.date }} {{ result.data.time }}</span>
        </div>

        <div v-if="result.data.preregistrationId" class="detail-row">
          <span class="detail-label">ID записи:</span>
          <span class="detail-value id-value">{{ result.data.preregistrationId }}</span>
        </div>
      </div>

      <p class="registration-note">
        Клиент может подойти к терминалу и получить талон по коду
        <strong>{{ result.data.clientCode }}</strong>
      </p>
    </div>
  </AppModal>
</template>

<script setup>
import AppModal from '../ui/AppModal.vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  result: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: '✅ Пациент предварительно записан'
  }
})

defineEmits(['update:show'])
</script>

<style scoped>
.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message {
  font-size: 1.2rem;
  color: rgb(40, 96, 144);
  margin-bottom: 24px;
  font-weight: 500;
}

.registration-details {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
  border: 1px solid #e9ecef;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlight {
  background-color: #e7f3ff;
  margin: -20px -20px 0 -20px;
  padding: 20px;
  border-radius: 12px 12px 0 0;
  border-bottom: 2px solid rgb(40, 96, 144);
}

.detail-label {
  flex: 0 0 140px;
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  flex: 1;
  color: #212529;
}

.client-code {
  font-size: 2rem;
  font-weight: bold;
  color: rgb(40, 96, 144);
}

.id-value {
  font-family: monospace;
  font-size: 0.85rem;
  word-break: break-all;
}

.registration-note {
  background-color: #e7f3ff;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
  color: rgb(40, 96, 144);
  border-left: 4px solid rgb(40, 96, 144);
}

.registration-note strong {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    margin-bottom: 4px;
  }
}
</style>