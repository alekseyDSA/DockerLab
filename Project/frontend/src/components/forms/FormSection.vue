<template>
  <div class="form-section">
    <h3 class="section-title">{{ section.title }}</h3>
    <p v-if="section.description" class="section-description">
      {{ section.description }}
    </p>

    <div class="form-row">
      <template v-for="field in section.fields" :key="field.name">
        <!-- Поле только для чтения -->
        <div
            v-if="field.readonly && !isExpanded"
            class="form-group"
            :class="{ 'form-group--hidden': !shouldShowField(field) }"
        >
          <label class="form-label">
            {{ field.label }}
            <span v-if="isFieldRequired(field)" class="required">*</span>
          </label>
          <div class="readonly-field">
            {{ getFieldDisplayValue(field) }}
          </div>
        </div>

        <!-- Редактируемые поля -->
        <div
            v-else
            class="form-group"
            :class="{ 'form-group--hidden': !shouldShowField(field) }"
        >
          <label :for="field.name" class="form-label">
            {{ field.label }}
            <span v-if="isFieldRequired(field)" class="required">*</span>
          </label>

          <!-- Текстовое поле -->
          <input
              v-if="field.type === 'text' || field.type === 'tel' || field.type === 'email'"
              :type="field.type"
              :id="field.name"
              v-model="formData[field.name]"
              class="form-input"
              :placeholder="field.placeholder"
              :required="isFieldRequired(field)"
          />

          <!-- Поле даты -->
          <input
              v-else-if="field.type === 'date'"
              type="date"
              :id="field.name"
              v-model="formData[field.name]"
              class="form-input"
              :min="getMinDate(field)"
              :required="isFieldRequired(field)"
          />

          <!-- Выпадающий список -->
          <select
              v-else-if="field.type === 'select'"
              :id="field.name"
              v-model="formData[field.name]"
              class="form-select"
              :required="isFieldRequired(field)"
              :disabled="isFieldDisabled(field)"
          >
            <option value="" disabled>{{ field.placeholder || 'Выберите значение' }}</option>
            <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- Чекбокс -->
          <div v-else-if="field.type === 'checkbox'" class="checkbox-wrapper">
            <input
                :type="field.type"
                :id="field.name"
                v-model="formData[field.name]"
                class="form-checkbox"
            />
            <label :for="field.name" class="checkbox-label">
              {{ field.label }}
            </label>
          </div>

          <!-- Кастомный Listbox с авто-выбором -->
          <CustomListbox
              v-else-if="field.type === 'listbox'"
              v-model="formData[field.name]"
              :options="fieldOptions[field.name] || field.options || []"
              :placeholder="field.placeholder"
              :searchable="field.searchable"
              :auto-select-single="field.autoSelectSingle !== undefined ? field.autoSelectSingle : true"
              :label-id="field.name + '-label'"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CustomListbox from '../ui/CustomListbox.vue'
import { useForm } from '../../composables/useForm'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  fieldOptions: {
    type: Object,
    default: () => ({})
  }
})

const { isFieldRequired, shouldShowField, getFieldDisplayValue } = useForm()

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const getMinDate = (field) => {
  if (field.min === 'today') {
    return today.value
  }
  return field.min
}

const isFieldDisabled = (field) => {
  if (field.dependsOn) {
    const dependsField = props.formData[field.dependsOn.field]
    return !field.dependsOn.condition(dependsField)
  }
  return false
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
  margin-bottom: 0;
  padding-bottom: 0;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group--hidden {
  display: none;
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

.readonly-field {
  padding: 10px 12px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #4b5563;
  min-height: 20px;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: rgb(40, 96, 144);
  box-shadow: 0 0 0 3px rgba(40, 96, 144, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: rgb(40, 96, 144);
}

.checkbox-label {
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  user-select: none;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>