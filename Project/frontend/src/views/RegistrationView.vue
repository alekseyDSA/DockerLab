<template>
  <div class="appointment-page">
    <div class="page-header">
      <h1 class="page-title">Добавление пациента в электронную очередь</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="appointment-form">
        <!-- Блок ошибки -->
        <div v-if="error || store.error" class="error-message">
          <span>⚠️ {{ error || store.error }}</span>
          <button
              v-if="formData.Registrator"
              @click="retryLoadServices"
              class="retry-button"
          >
            Повторить
          </button>
        </div>

        <!-- Оверлей загрузки -->
        <div v-if="loading || store.loading" class="loading-overlay">
          <div class="loading-spinner">Загрузка данных...</div>
        </div>

        <!-- Секции формы из конфига -->
        <div v-for="section in formConfig.sections" :key="section.id" class="form-section">
          <h3 class="section-title">{{ section.title }}</h3>
          <p v-if="section.description" class="section-description">
            {{ section.description }}
          </p>

          <div class="form-row">
            <!-- Регистратор -->
            <div v-if="hasField(section.fields, 'Registrator')" class="form-group">
              <label class="form-label">
                {{ getField('Registrator').label }}
                <span v-if="getField('Registrator').required" class="required">*</span>
              </label>
              <CustomListbox
                  v-model="formData.Registrator"
                  :options="registratorOptions"
                  :placeholder="getField('Registrator').placeholder"
                  :auto-select-single="getField('Registrator').autoSelectSingle"
              />
            </div>

            <!-- Услуга -->
            <div v-if="hasField(section.fields, 'service')" class="form-group">
              <label class="form-label">
                {{ getField('service').label }}
                <span v-if="getField('service').required" class="required">*</span>
              </label>
              <CustomListbox
                  v-model="formData.service"
                  :options="serviceOptions"
                  :placeholder="getField('service').placeholder"
                  :searchable="getField('service').searchable"
                  :auto-select-single="getField('service').autoSelectSingle"
                  :disabled="!formData.Registrator"
              />
            </div>

            <!-- Приоритет -->
            <div v-if="hasField(section.fields, 'priority')" class="form-group">
              <label class="form-label">
                {{ getField('priority').label }}
                <span v-if="getField('priority').required" class="required">*</span>
                <span class="hint">(можно изменить)</span>
              </label>
              <CustomListbox
                  v-model="formData.priority"
                  :options="priorityOptions"
                  :placeholder="getField('priority').placeholder"
                  :auto-select-single="getField('priority').autoSelectSingle"
                  :disabled="!formData.Registrator"
              />
              <div v-if="selectedServicePriority" class="priority-hint">
                ⚡ Приоритет услуги по умолчанию: {{ selectedServicePriority }}
              </div>
            </div>

            <!-- Оператор -->
            <div v-if="hasField(section.fields, 'operator')" class="form-group">
              <label class="form-label">
                {{ getField('operator').label }}
                <span v-if="getField('operator').required" class="required">*</span>
              </label>
              <CustomListbox
                  v-model="formData.operator"
                  :options="operatorOptions"
                  :placeholder="getField('operator').placeholder"
                  :searchable="getField('operator').searchable"
                  :auto-select-single="getField('operator').autoSelectSingle"
                  :disabled="!formData.Registrator"
              />
            </div>
          </div>
        </div>

        <!-- Кнопка отправки -->
        <div class="form-actions">
          <button
              type="submit"
              class="submit-button"
              :disabled="!isFormValid || isLoading || store.loading"
          >
            <span v-if="isLoading">Регистрация...</span>
            <span v-else>{{ formConfig.buttons.submit.label }}</span>
          </button>
        </div>
      </form>

      <!-- Модальное окно с результатом -->
      <AppModal v-model="showSuccessModal" :title="formConfig.modal.title">
        <div v-if="registrationResult" class="success-modal">
          <div class="success-icon">✅</div>
          <p class="success-message">Пациент успешно зарегистрирован!</p>

          <div class="registration-details">
            <div class="detail-row highlight">
              <span class="detail-label">Номер талона:</span>
              <span class="detail-value ticket-number">{{ ticketNumber }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Услуга:</span>
              <span class="detail-value">{{ registrationResult.serviceName }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Приоритет:</span>
              <span class="detail-value">{{ registrationResult.priorityName }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Оператор:</span>
              <span class="detail-value">
                {{ registrationResult.operatorName }}
                <span v-if="registrationResult.operatorRoom" class="operator-location">
                  (каб. {{ registrationResult.operatorRoom }}
                  <span v-if="registrationResult.operatorFloor">, эт. {{ registrationResult.operatorFloor }}</span>)
                </span>
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Время регистрации:</span>
              <span class="detail-value">{{ formatTime(registrationResult.registrationTime) }}</span>

            </div>

            <div class="detail-row">
              <span class="detail-label">Статус:</span>
              <span class="detail-value status-badge">{{ registrationResult.status }}</span>
            </div>
          </div>

          <p class="registration-note">
            Клиент может пройти к оператору <strong>{{ registrationResult.operatorName }}</strong>
            с номером <strong>{{ ticketNumber }}</strong>
          </p>
        </div>
      </AppModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useForm } from '../composables/useForm'
import { useRegularRegistrationStore } from '../stores/regularRegistration.store'
import { storeToRefs } from 'pinia'
import CustomListbox from '../components/ui/CustomListbox.vue'
import AppModal from '../components/ui/AppModal.vue'
import { regularFormConfig, getRegularFieldByName } from '../config/regularForm.config'
import { useConfig } from '../composables/useConfig'

const { getRegistratorOptions } = useConfig('regular')
const registratorOptions = computed(() => getRegistratorOptions())
const { formData, isFormValid } = useForm()
const store = useRegularRegistrationStore()
const {
  loading,
  error,
  serviceOptions,
  priorityOptions,
  operatorOptions
} = storeToRefs(store)

const showSuccessModal = ref(false)
const registrationResult = ref(null)
const isLoading = ref(false)
const ticketNumber = ref('')

const formConfig = regularFormConfig

// Получение поля из конфига
const getField = (name) => {
  const field = getRegularFieldByName(name)
  return field || { label: name, required: false, options: [], placeholder: '' }
}

// Проверка наличия поля в секции
const hasField = (fields, fieldName) => {
  return fields.some(f => f.name === fieldName)
}

// При выборе услуги автоматически подставляем её приоритет
watch(() => formData.value.service, (newService) => {
  if (newService?.value?.priority?.id) {
    const matchingPriority = priorityOptions.value.find(
        p => p.value === newService.value.priority.id
    )
    if (matchingPriority) {
      formData.value.priority = matchingPriority
    }
  }
}, { immediate: true })

// Информация о приоритете услуги
const selectedServicePriority = computed(() => {
  const service = formData.value.service?.value
  if (service?.priority?.name) {
    return `${service.priority.name} (${service.priority.priority})`
  }
  return null
})

// Форматирование времени
const formatTime = (timestamp) => {
  if (!timestamp) return '—'

  try {
    let date

    if (typeof timestamp === 'string') {
      const normalizedDate = timestamp.replace(' ', 'T').replace(' ', '')
      date = new Date(normalizedDate)
    } else {
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) {
      return timestamp
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    // Сравниваем даты без времени
    if (date >= today) {
      return `сегодня в ${timeStr}`
    } else if (date >= yesterday) {
      return `вчера в ${timeStr}`
    } else {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      return `${day}.${month} в ${timeStr}`
    }
  } catch (e) {
    console.error('Ошибка форматирования даты:', e)
    return timestamp || '—'
  }
}

// Следим за изменением регистратора
watch(() => formData.value.Registrator, async (newRegistrator, oldRegistrator) => {
  if (newRegistrator?.ip) {
    if (!oldRegistrator || oldRegistrator.ip !== newRegistrator.ip) {
      console.log('🔄 Выбран новый сервер, загружаем данные')

      formData.value.service = null
      formData.value.priority = null
      formData.value.operator = null

      await store.loadServices(newRegistrator)
    }
  }
}, { deep: true })

const retryLoadServices = () => {
  if (formData.value.Registrator) {
    store.loadServices(formData.value.Registrator)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true

  try {
    const result = await store.registerTicket(formData.value)

    if (result.success) {
      ticketNumber.value = result.ticketNumber
      registrationResult.value = result
      showSuccessModal.value = true

      // Сбрасываем форму, но оставляем сервер
      formData.value.service = null
      formData.value.priority = null
      formData.value.operator = null
    } else {
      alert(`Ошибка: ${result.message}`)
    }
  } catch (error) {
    alert(`Ошибка: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(40, 96, 144, 0.1);
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  color: rgb(40, 96, 144);
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.section-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 20px 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
  margin-left: 4px;
}

.hint {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: normal;
  margin-left: 8px;
}

.priority-hint {
  font-size: 0.85rem;
  color: rgb(40, 96, 144);
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #e7f3ff;
  border-radius: 4px;
}

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

.ticket-number {
  font-size: 2rem;
  font-weight: bold;
  color: rgb(40, 96, 144);
}

.operator-location {
  font-size: 0.9rem;
  color: #6c757d;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #28a745;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
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
  .form-row {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    margin-bottom: 4px;
  }
}
</style>