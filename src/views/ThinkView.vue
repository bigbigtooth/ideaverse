<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThinkingStore } from '../stores/thinking'
import logoImage from '../assets/logo.png'
import '../styles/ThinkView.css'
import { AlertCircle, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue'

// 子组件
import StepProgress from '../components/common/StepProgress.vue'
import Step1Interview from '../components/step1/Step1Interview.vue'
import Step2Analysis from '../components/step2/Step2Analysis.vue'
import Step3Solutions from '../components/step3/Step3Solutions.vue'
import GlobalStatusTooltip from '../components/common/GlobalStatusTooltip.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useThinkingStore()

const initialized = ref(false)

onMounted(async () => {
  const sessionId = route.params.id
  
  if (sessionId) {
    const session = store.loadSession(sessionId)
    if (!session) {
      router.push('/')
      return
    }
  } else {
    const session = store.loadCurrentSession()
    if (!session) {
      router.push('/')
      return
    }
    router.replace(`/think/${session.id}`)
  }
  
  initialized.value = true
})

const currentStep = computed(() => store.currentStep)

function goHome() {
  store.resetSession()
  router.push('/')
}
</script>

<template>
  <div class="think-view" v-if="initialized">
    <!-- 全局状态提示 -->
    <GlobalStatusTooltip />
    
    <!-- 头部 -->
    <header class="header">
      <div class="container header-content">
        <button class="btn btn-ghost back-btn" @click="goHome">
          ← {{ t('common.home') }}
        </button>
        <div class="logo">
          <img :src="logoImage" alt="Logo" class="logo-icon">
          <span class="logo-text">{{ t('common.brand_name') }}</span>
        </div>
        <div class="header-right">
          <LanguageSwitcher />
          <span class="auto-save-hint">{{ t('think.auto_save') }}</span>
        </div>
      </div>
    </header>
    
    <!-- 问题显示 -->
    <div class="problem-bar">
      <div class="container">
        <div class="problem-content">
          <span class="problem-label">{{ t('think.problem_label') }}</span>
          <span class="problem-text">{{ store.problem }}</span>
        </div>
      </div>
    </div>
    
    <!-- 步骤进度 -->
    <StepProgress :current-step="currentStep" />
    
    <!-- 主内容区 -->
    <main class="main">
      <div class="container">
        <!-- 错误提示 -->
        <div v-if="store.error" class="error-banner">
          <AlertCircle class="error-icon" :size="20" />
          <span>{{ store.error }}</span>
          <button class="btn btn-sm btn-ghost" @click="store.clearError">
            <X :size="16" />
          </button>
        </div>
        
        <!-- 步骤内容 -->
        <transition name="fade" mode="out-in">
          <Step1Interview v-if="currentStep === 1" key="step1" />
          <Step2Analysis v-else-if="currentStep === 2" key="step2" />
          <Step3Solutions v-else-if="currentStep === 3" key="step3" />
        </transition>
      </div>
    </main>
  </div>
</template>

<!-- Styles are imported from ../styles/ThinkView.css -->
