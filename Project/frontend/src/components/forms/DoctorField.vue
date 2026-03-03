<template>
  <div class="doctor-field">
    <label for="doctor-name" class="doctor-label">
      Направил: <span class="required">*</span>
    </label>
    <input
        type="text"
        id="doctor-name"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="doctor-input"
        placeholder="Введите ФИО врача"
        required
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.doctor-field {
  margin-top: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.doctor-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(30, 76, 114);
  white-space: nowrap;
}

.required {
  color: #dc3545;
  margin-left: 2px;
}

.doctor-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: white;
}

.doctor-input:focus {
  outline: none;
  border-color: rgb(40, 96, 144);
  box-shadow: 0 0 0 3px rgba(40, 96, 144, 0.1);
}

@media (max-width: 768px) {
  .doctor-field {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>