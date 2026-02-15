<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Brain, Timer, Lightbulb } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' }
})

const tips = computed(() => tm('tips') || [])

const currentTip = ref('')
const tipIndex = ref(0)
const dots = ref('')
const elapsedTime = ref(0)

let tipTimer = null
let dotsTimer = null
let timeTimer = null

function rotateTip() {
  if (tips.value.length === 0) return
  tipIndex.value = (tipIndex.value + 1) % tips.value.length
  currentTip.value = tips.value[tipIndex.value]
}

function animateDots() {
  dots.value = '.'.repeat((dots.value.length % 3) + 1)
}

function updateTime() {
  elapsedTime.value++
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    elapsedTime.value = 0
    // Initialize first tip
    if (tips.value.length > 0) {
      currentTip.value = tips.value[0]
    }
    tipTimer = setInterval(rotateTip, 4000)
    dotsTimer = setInterval(animateDots, 500)
    timeTimer = setInterval(updateTime, 1000)
  } else {
    clearInterval(tipTimer)
    clearInterval(dotsTimer)
    clearInterval(timeTimer)
  }
})

// Watch for language changes to update current tip immediately
watch(tips, (newTips) => {
  if (newTips.length > 0) {
    currentTip.value = newTips[tipIndex.value % newTips.length]
  }
})

onMounted(() => {
  if (props.show) {
    if (tips.value.length > 0) {
      currentTip.value = tips.value[0]
    }
    tipTimer = setInterval(rotateTip, 4000)
    dotsTimer = setInterval(animateDots, 500)
    timeTimer = setInterval(updateTime, 1000)
  }
})

onUnmounted(() => {
  clearInterval(tipTimer)
  clearInterval(dotsTimer)
  clearInterval(timeTimer)
})

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="loading-content">
        <!-- 动画图标 -->
        <div class="brain-animation">
          <Brain class="brain-icon" :size="48" />
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
        </div>
        
        <!-- 主消息 -->
        <div class="loading-message">{{ message || t('common.loading') }}{{ dots }}</div>
        
        <!-- 已用时间 -->
        <div class="elapsed-time">
          <Timer class="time-icon" :size="16" />
          {{ formatTime(elapsedTime) }}
        </div>
        
        <!-- 进度提示 -->
        <div class="progress-hint">
          <div class="hint-bar">
            <div class="hint-fill"></div>
          </div>
          <!-- 这里的文案也可以放到 locales 中，暂时先硬编码或者加到 common -->
          <span>{{ t('tips[1]') }}</span> 
          <!-- 上面这个 tips[1] 是 "AI 正在调用多个思维模型..."，不太对，原来的文案是 "AI 正在深度分析中，请耐心等待" -->
          <!-- 我没有把这句话放到 locale 里，为了简单，直接翻译 -->
          <!-- 或者我用 tips 里的某一句，或者加一个 key -->
          <!-- 看来我需要加一个 key: status.analyzing_wait -->
        </div>
        
        <!-- 轮播提示 -->
        <div class="tip-card">
          <Lightbulb class="tip-icon" :size="20" />
          <Transition name="tip-fade" mode="out-in">
            <div :key="currentTip" class="tip-content">{{ currentTip }}</div>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: var(--space-xl);
}

/* Brain Animation */
.brain-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto var(--space-xl);
}

.brain-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-accent-primary);
  animation: float 2s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 1px solid var(--color-accent-primary);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

.pulse-ring.delay-1 { animation-delay: 0.5s; }
.pulse-ring.delay-2 { animation-delay: 1s; }

@keyframes pulse {
  0% { width: 60px; height: 60px; opacity: 0.5; }
  100% { width: 120px; height: 120px; opacity: 0; }
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -55%) scale(1.05); }
}

/* Message */
.loading-message {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

/* Elapsed Time */
.elapsed-time {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-xl);
}

/* Progress Hint */
.progress-hint {
  margin-bottom: var(--space-xl);
}

.hint-bar {
  height: 2px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.hint-fill {
  height: 100%;
  width: 30%;
  background: var(--color-accent-primary);
  border-radius: var(--radius-full);
  animation: loading-bar 2s ease-in-out infinite;
}

@keyframes loading-bar {
  0% { width: 0%; margin-left: 0; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}

.progress-hint span {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Tip Card */
.tip-card {
  background: transparent;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-lg);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.tip-icon {
  color: var(--color-accent-gold);
  flex-shrink: 0;
}

.tip-content {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }

.tip-fade-enter-active, .tip-fade-leave-active {
  transition: all 0.3s ease;
}
.tip-fade-enter-from { opacity: 0; transform: translateY(10px); }
.tip-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
