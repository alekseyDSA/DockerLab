<!-- components/ui/CustomListbox.vue -->
<template>
  <div class="custom-listbox" ref="listboxRef">
    <!-- Заголовок/кнопка открытия -->
    <button
        type="button"
        class="listbox-button"
        :class="{ 'listbox-button--open': isOpen }"
        @click="toggleListbox"
        @keydown.down.prevent="handleKeyDown"
        @keydown.up.prevent="handleKeyDown"
        @keydown.enter.prevent="toggleListbox"
        @keydown.space.prevent="toggleListbox"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-labelledby="labelId"
    >
      <span class="listbox-label">
        {{ displayText }}
      </span>
      <span class="listbox-icon" aria-hidden="true">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ 'rotate-180': isOpen }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </button>

    <!-- Выпадающий список -->
    <Transition
        enter-active-class="listbox-transition-enter"
        leave-active-class="listbox-transition-leave"
    >
      <div v-if="isOpen" class="listbox-dropdown" ref="dropdownRef">
        <!-- Поиск/фильтрация (опционально) -->
        <div v-if="searchable" class="listbox-search">
          <input
              ref="searchInputRef"
              type="text"
              class="listbox-search-input"
              placeholder="Поиск..."
              v-model="searchQuery"
              @keydown.down.prevent="focusNextOption"
              @keydown.up.prevent="focusPreviousOption"
              @keydown.enter.prevent="selectHighlighted"
          />
        </div>

        <!-- Список опций -->
        <ul class="listbox-options" role="listbox" :aria-labelledby="labelId">
          <li
              v-for="(option, index) in filteredOptions"
              :key="getOptionKey(option)"
              class="listbox-option"
              :class="{
              'listbox-option--selected': isSelected(option),
              'listbox-option--highlighted': highlightedIndex === index,
            }"
              role="option"
              :aria-selected="isSelected(option)"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
              @mouseleave="highlightedIndex = -1"
              ref="optionRefs"
          >
            <span class="option-label">{{ option.label }}</span>
            <span v-if="isSelected(option)" class="option-checkmark" aria-hidden="true">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </li>

          <!-- Сообщение, если нет результатов -->
          <li v-if="filteredOptions.length === 0" class="listbox-option listbox-option--empty">
            Нет доступных опций
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

// Пропсы компонента
const props = defineProps({
  // Массив опций для отображения
  options: {
    type: Array,
    required: true,
    validator: (value) => value.every(item => 'value' in item && 'label' in item)
  },
  // Значение по умолчанию (value выбранной опции)
  modelValue: {
    type: [String, Number, Object, null],
    default: null
  },
  // Плейсхолдер, когда ничего не выбрано
  placeholder: {
    type: String,
    default: 'Выберите опцию...'
  },
  // Включить поиск/фильтрацию
  searchable: {
    type: Boolean,
    default: false
  },
  // Автоматически выбирать единственный вариант
  autoSelectSingle: {
    type: Boolean,
    default: true
  },
  // Уникальный ID для accessibility
  labelId: {
    type: String,
    default: 'listbox-label'
  }
})

// События
const emit = defineEmits(['update:modelValue', 'change'])

// Состояния
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const listboxRef = ref(null)
const dropdownRef = ref(null)
const optionRefs = ref([])
const searchInputRef = ref(null)

// Функция для получения уникального ключа опции
const getOptionKey = (option) => {
  if (option.value && typeof option.value === 'object') {
    return option.value.id || JSON.stringify(option.value)
  }
  return option.value
}

// Функция для сравнения значений (глубокое сравнение для объектов)
const isValueEqual = (value1, value2) => {
  if (value1 === value2) return true

  if (value1 && value2 && typeof value1 === 'object' && typeof value2 === 'object') {
    // Сравниваем по id, если есть
    if (value1.id !== undefined && value2.id !== undefined) {
      return value1.id === value2.id
    }
    // Иначе сравниваем по JSON
    return JSON.stringify(value1) === JSON.stringify(value2)
  }

  return false
}

// Вычисляем выбранную опцию
const selectedOption = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return null
  }

  // Ищем опцию, у которой значение равно modelValue
  return props.options.find(option => isValueEqual(option.value, props.modelValue)) || null
})

// Текст для отображения на кнопке
const displayText = computed(() => {
  return selectedOption.value?.label || props.placeholder
})

// Фильтруем опции по поисковому запросу
const filteredOptions = computed(() => {
  if (!searchQuery.value || !props.searchable) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
      option.label.toLowerCase().includes(query)
  )
})

// Проверка, выбрана ли опция
const isSelected = (option) => {
  return isValueEqual(option.value, props.modelValue)
}

// Переключение списка
const toggleListbox = () => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    nextTick(() => {
      if (props.searchable && searchInputRef.value) {
        searchInputRef.value.focus()
      }

      // Устанавливаем подсветку на выбранный элемент или первый
      if (selectedOption.value) {
        const index = filteredOptions.value.findIndex(
            opt => isValueEqual(opt.value, selectedOption.value.value)
        )
        highlightedIndex.value = index !== -1 ? index : 0
      } else if (filteredOptions.value.length > 0) {
        highlightedIndex.value = 0
      }
    })
  } else {
    searchQuery.value = ''
    highlightedIndex.value = -1
  }
}

// Закрытие списка
const closeListbox = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
}

// Выбор опции
const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option)
  closeListbox()
}

// Выбор подсвеченной опции
const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

// Фокус на следующую опцию (клавиша вниз)
const focusNextOption = () => {
  if (filteredOptions.value.length === 0) return

  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
  } else {
    highlightedIndex.value = 0 // Циклический переход
  }

  scrollToHighlighted()
}

// Фокус на предыдущую опцию (клавиша вверх)
const focusPreviousOption = () => {
  if (filteredOptions.value.length === 0) return

  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  } else {
    highlightedIndex.value = filteredOptions.value.length - 1 // Циклический переход
  }

  scrollToHighlighted()
}

// Прокрутка к подсвеченному элементу
const scrollToHighlighted = () => {
  nextTick(() => {
    if (highlightedIndex.value >= 0 && optionRefs.value[highlightedIndex.value]) {
      optionRefs.value[highlightedIndex.value].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  })
}

// Обработка клавиш для доступности
const handleKeyDown = (event) => {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      toggleListbox()
    }
    return
  }

  switch (event.key) {
    case 'Escape':
      closeListbox()
      break
    case 'Tab':
      closeListbox()
      break
    case 'Home':
      if (filteredOptions.value.length > 0) {
        highlightedIndex.value = 0
        scrollToHighlighted()
      }
      break
    case 'End':
      if (filteredOptions.value.length > 0) {
        highlightedIndex.value = filteredOptions.value.length - 1
        scrollToHighlighted()
      }
      break
  }
}

// Закрытие при клике вне компонента
const handleClickOutside = (event) => {
  if (listboxRef.value && !listboxRef.value.contains(event.target)) {
    closeListbox()
  }
}


// Отслеживаем изменения опций
watch(() => props.options, (newOptions) => {
  // Обновляем подсветку, если список открыт
  if (newOptions.length > 0 && isOpen.value) {
    if (selectedOption.value) {
      const index = newOptions.findIndex(opt => isValueEqual(opt.value, selectedOption.value.value))
      highlightedIndex.value = index !== -1 ? index : 0
    } else {
      highlightedIndex.value = 0
    }
  } else {
    highlightedIndex.value = -1
  }

  // АВТОВЫБОР БЕЗ ТАЙМАУТА - всегда, независимо от isOpen
  if (props.autoSelectSingle &&
      newOptions.length === 1 &&
      (props.modelValue === null || props.modelValue === undefined)) {

    console.log('🤖 Автоматически выбран единственный вариант:', newOptions[0].label);

    // Используем nextTick, чтобы не мешать текущему циклу обновления
    nextTick(() => {
      selectOption(newOptions[0]);
    });
  }
}, { deep: true, immediate: true }) // ВАЖНО: добавил immediate: true

// При монтировании проверяем, не нужно ли автоматически выбрать
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
/* Стили остаются без изменений */
.custom-listbox {
  position: relative;
  width: 100%;
  max-width: 300px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.listbox-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.listbox-button:hover {
  border-color: #9ca3af;
}

.listbox-button:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.listbox-button--open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.listbox-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.listbox-icon {
  margin-left: 8px;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.listbox-icon svg {
  display: block;
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Dropdown */
.listbox-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Поиск */
.listbox-search {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  width: 85%;
}

.listbox-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.listbox-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Список опций */
.listbox-options {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  max-height: 240px;
}

.listbox-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  transition: background-color 0.15s ease;
  user-select: none;
}

.listbox-option:hover {
  background-color: #f3f4f6;
}

.listbox-option--highlighted {
  background-color: #e5e7eb;
}

.listbox-option--selected {
  color: #3b82f6;
  font-weight: 500;
}

.listbox-option--selected .option-checkmark {
  color: #3b82f6;
}

.listbox-option--empty {
  color: #9ca3af;
  cursor: default;
  justify-content: center;
}

.listbox-option--empty:hover {
  background-color: transparent;
}

.option-checkmark {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

/* Анимации */
.listbox-transition-enter-active,
.listbox-transition-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.listbox-transition-enter-from,
.listbox-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>