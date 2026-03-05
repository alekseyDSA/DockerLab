<template>
  <div class="appointment-page">
    <PageHeader title="Предварительная запись пациента">
      <DoctorField v-model="formData.doctorName" />
    </PageHeader>

    <div class="main-content">
      <!-- Основная форма -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="appointment-form">
          <!-- Блок ошибки конфига -->
          <div v-if="configError" class="error-message">
            <span>⚠️ Ошибка загрузки конфигурации серверов: {{ configError }}</span>
            <button @click="reloadConfig" class="retry-button">
              Повторить
            </button>
          </div>

          <!-- Блок ошибки загрузки данных -->
          <ErrorAlert
              v-else-if="error"
              :error="error"
              @retry="retryLoad"
          />

          <!-- LoadingOverlay -->
          <LoadingOverlay
              v-if="configLoading || loading || isLoading"
              :text="configLoading ? 'Загрузка серверов...' : 'Загрузка услуг...'"
          />

          <!-- Основные секции -->
          <FormSection
              v-for="section in mainSections"
              :key="section.id"
              :section="section"
              :form-data="formData"
              :field-options="fieldOptions"
          />

          <!-- Expand button -->
          <ExpandButton
              v-if="hasExpandedSections"
              v-model="isExpanded"
              :labels="buttons.expand"
          />

          <!-- Expanded sections -->
          <Transition name="expand">
            <div v-if="isExpanded" class="expanded-content">
              <FormSection
                  v-for="section in expandedSections"
                  :key="section.id"
                  :section="section"
                  :form-data="formData"
                  :is-expanded="true"
                  :field-options="fieldOptions"
              />
            </div>
          </Transition>

          <!-- Submit button -->
          <SubmitButton
              :disabled="!isFormValid || isLoading || configLoading"
              :loading="isLoading"
              :label="buttons.submit.label"
          />
        </form>

        <!-- Модалка результата -->
        <PreRegistrationResult
            :show="showSuccessModal"
            @update:show="showSuccessModal = $event"
            :result="registrationResult"
            :title="modal.title"
        />
      </div>

      <!-- История регистраций (сворачиваемое окно справа) -->
      <LogsDisplay
          :logs="userLogs"
          @clear="clearLogs"
          :is-new-log="isNewLog"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useForm } from '../composables/useForm'
import { useLogs } from '../composables/useLogs'
import { useCompanyStore } from '../stores/company'
import { useRegistration } from '../composables/useRegistration'
import { useConfig } from '../composables/useConfig'
import { formConfig } from '../config/form.config'
import { storeToRefs } from 'pinia'

// Компоненты
import PageHeader from '../components/layout/PageHeader.vue'
import DoctorField from '../components/forms/DoctorField.vue'
import ErrorAlert from '../components/ui/ErrorAlert.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import ExpandButton from '../components/ui/ExpandButton.vue'
import SubmitButton from '../components/ui/SubmitButton.vue'
import FormSection from '../components/forms/FormSection.vue'
import PreRegistrationResult from '../components/registration/PreRegistrationResult.vue'
import LogsDisplay from '../components/logs/LogsDisplay.vue'

// Загружаем конфигурацию серверов
const {
  getRegistratorOptions,
  loading: configLoading,
  error: configError,
  loadConfig: reloadConfig
} = useConfig('pre')

// Опции для списка серверов
const registratorOptions = computed(() => {
  const options = getRegistratorOptions()
  return options || []
})

const { formData, isExpanded, isFormValid } = useForm()
const { userLogs, addLog, clearLogs, isNewLog } = useLogs()
const companyStore = useCompanyStore()
const { loading, error, serviceOptions } = storeToRefs(companyStore)

const {
  register,
  isLoading,
  result: registrationResult
} = useRegistration()

const showSuccessModal = ref(false)

// Добавляем кнопки и модалку из конфига
const buttons = formConfig.buttons
const modal = formConfig.modal

// Опции для полей
const fieldOptions = computed(() => ({
  Registrator: registratorOptions.value,
  service: serviceOptions.value
}))

// Секции
const mainSections = formConfig.sections
const expandedSections = formConfig.expandedSections
const hasExpandedSections = computed(() => expandedSections.length > 0)

// Следим за изменением регистратора и загружаем услуги
watch(() => formData.value.Registrator, async (newRegistrator, oldRegistrator) => {
  if (newRegistrator?.ip) {
    // Если сервер изменился, сбрасываем выбранную услугу
    if (!oldRegistrator || oldRegistrator.ip !== newRegistrator.ip) {
      console.log('🔄 Выбран новый сервер, загружаем услуги')
      formData.value.service = null
      await companyStore.loadForRegistrator(newRegistrator)
    }
  }
}, { deep: true })

// Обработчики
const handleSubmit = async () => {
  if (!isFormValid.value) return

  const result = await register(formData.value)

  if (result?.success) {
    addLog({
      doctorName: formData.value.doctorName,
      serviceLabel: formData.value.service?.name,
      registratorLabel: formData.value.Registrator?.name,
      date: result.data.date,
      time: result.data.time,
      clientCode: result.data.clientCode
    })

    showSuccessModal.value = true
  }
}

const retryLoad = () => {
  if (formData.value.Registrator) {
    companyStore.loadForRegistrator(formData.value.Registrator)
  }
}
</script>

<style scoped>
.appointment-page {
  min-height: 100vh;
  background-color: rgb(245, 245, 245);
  padding: 20px;
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-container {
  flex: 1;
  min-width: 0; /* Предотвращает переполнение */
}

.appointment-form {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.expanded-content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px dashed rgba(40, 96, 144, 0.3);
}

/* Анимации для расширения */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1000px;
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .form-container {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .appointment-page {
    padding: 10px;
  }

  .appointment-form {
    padding: 20px;
  }
}
</style>