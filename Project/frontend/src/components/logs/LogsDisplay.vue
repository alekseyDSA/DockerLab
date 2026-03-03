<!-- components/logs/LogsDisplay.vue -->
<template>
  <div class="logs-panel">
    <div class="logs-header" @click="toggleExpanded">
      <h3 class="logs-title">
        История регистраций
        <span class="logs-count" v-if="logs.length > 0">({{ logs.length }})</span>
      </h3>
      <div class="logs-controls">
        <button
            v-if="logs.length > 0"
            class="clear-logs-btn"
            @click.stop="handleClear"
            title="Очистить историю"
        >
          🗑️
        </button>
        <button class="expand-btn" :class="{ 'expanded': isExpanded }">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
          >
            <polyline :points="isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <Transition
        enter-active-class="logs-enter-active"
        leave-active-class="logs-leave-active"
    >
      <div v-if="isExpanded" class="logs-content">
        <div v-if="logs.length === 0" class="logs-empty">
          История регистраций пуста
        </div>
        <div v-else class="logs-list">
          <div
              v-for="log in sortedLogs"
              :key="log.id"
              class="log-item"
              :class="{ 'log-item--new': isNewLog(log) }"
          >
            <div class="log-item-header" @click="toggleLogDetails(log.id)">
              <div class="log-main-info">
                <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                <span class="log-service">{{ log.serviceLabel }}</span>
              </div>
              <div class="log-badge" v-if="log.clientCode">
                Код: {{ log.clientCode }}
              </div>
              <button class="log-expand-btn">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="{ 'rotate-180': expandedLogs.includes(log.id) }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <Transition
                enter-active-class="details-enter-active"
                leave-active-class="details-leave-active"
            >
              <div v-if="expandedLogs.includes(log.id)" class="log-details">
                <div class="log-details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Врач:</span>
                    <span class="detail-value">{{ log.doctorName || 'Не указан' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Регистратор:</span>
                    <span class="detail-value">{{ log.registratorLabel }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Услуга:</span>
                    <span class="detail-value">{{ log.serviceLabel }}</span>
                  </div>
                  <div class="detail-item" v-if="log.date">
                    <span class="detail-label">Дата приёма:</span>
                    <span class="detail-value">{{ log.date }} {{ log.time }}</span>
                  </div>
                  <div class="detail-item" v-if="log.clientCode">
                    <span class="detail-label">Короткий код для получения талона по предварительной записи:</span>
                    <span class="detail-value client-code">{{ log.clientCode }}</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatLogTime, formatDateTime } from '../../utils/formatters'

const props = defineProps({
  logs: {
    type: Array,
    required: true
  },
  isNewLog: {
    type: Function,
    default: () => false
  }
})

const emit = defineEmits(['clear'])

const isExpanded = ref(true) // Панель логов развёрнута по умолчанию
const expandedLogs = ref([]) // Какие конкретные логи развёрнуты

// Сортируем логи по времени (новые сверху)
const sortedLogs = computed(() => {
  return [...props.logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const toggleLogDetails = (logId) => {
  if (expandedLogs.value.includes(logId)) {
    expandedLogs.value = expandedLogs.value.filter(id => id !== logId)
  } else {
    expandedLogs.value = [...expandedLogs.value, logId]
  }
}

const handleClear = () => {
  emit('clear')
}

const formatFullDateTime = (timestamp) => {
  return formatDateTime(timestamp)
}
</script>

<style scoped>
.logs-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-width: calc(100vw - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  border: 1px solid rgba(40, 96, 144, 0.2);
}

.logs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: rgb(40, 96, 144);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logs-header:hover {
  background: rgb(30, 76, 114);
}

.logs-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logs-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.logs-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-logs-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.clear-logs-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.expand-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.expand-btn svg {
  transition: transform 0.3s ease;
}

.expand-btn.expanded svg {
  transform: rotate(180deg);
}

/* Анимации для панели */
.logs-enter-active,
.logs-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.logs-enter-from,
.logs-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.logs-enter-to,
.logs-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.logs-content {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
}

.logs-empty {
  padding: 30px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.logs-list {
  padding: 10px;
}

.log-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.2s ease;
}

.log-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.log-item--new {
  border-left: 4px solid #28a745;
  background: #f0fff4;
}

.log-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.log-item-header:hover {
  background-color: #f8f9fa;
}

.log-main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.log-time {
  font-size: 0.8rem;
  color: #6c757d;
  min-width: 70px;
}

.log-service {
  font-weight: 500;
  color: #212529;
  font-size: 0.95rem;
}

.log-badge {
  background: rgb(40, 96, 144);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0 8px;
}

.log-expand-btn {
  background: none;
  border: none;
  color: #6c757d;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.log-expand-btn:hover {
  background: #e9ecef;
  color: rgb(40, 96, 144);
}

.log-expand-btn svg {
  transition: transform 0.3s ease;
}

.log-expand-btn svg.rotate-180 {
  transform: rotate(180deg);
}

/* Анимации для деталей лога */
.details-enter-active,
.details-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.details-enter-from,
.details-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.details-enter-to,
.details-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 300px;
}

.log-details {
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.log-details-grid {
  display: grid;
  gap: 10px;
}

.detail-item {
  display: flex;
  font-size: 0.9rem;
}

.detail-label {
  width: 100px;
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #212529;
}

.detail-value.client-code {
  font-weight: bold;
  color: rgb(40, 96, 144);
  font-size: 2rem;
}

@media (max-width: 768px) {
  .logs-panel {
    bottom: 10px;
    right: 10px;
    width: calc(100vw - 20px);
  }

  .log-main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .log-badge {
    margin-left: 0;
  }

  .detail-item {
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    width: auto;
  }
}
</style>