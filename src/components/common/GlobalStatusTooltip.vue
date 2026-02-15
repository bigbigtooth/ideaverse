<script setup>
import { computed } from 'vue'
import { useThinkingStore } from '../../stores/thinking'

const store = useThinkingStore()

const isVisible = computed(() => {
  return ['requesting', 'receiving'].includes(store.aiStatus)
})

const statusText = computed(() => {
  if (store.aiStatus === 'requesting') {
    return '正在请求 AI...'
  } else if (store.aiStatus === 'receiving') {
    return `AI 思考中... 已接收 ${store.aiResponseCount} 字符`
  }
  return ''
})
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="isVisible" class="global-tooltip">
      <div class="tooltip-content">
        <div class="spinner"></div>
        <div class="text-content">
          <div class="message">{{ store.aiStatusMessage }}</div>
          <div class="status-detail">{{ statusText }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.global-tooltip {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: var(--color-text-primary);
  min-width: 280px;
  max-width: 400px;
  transition: all 0.3s ease;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-bg-tertiary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

.text-content {
  flex: 1;
}

.message {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text-primary);
}

.status-detail {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>
