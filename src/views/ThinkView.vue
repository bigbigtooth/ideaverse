<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThinkingStore } from '../stores/thinking'
import logoImage from '../assets/logo.png'
import '../styles/ThinkView.css'
import { AlertCircle, X } from 'lucide-vue-next'

// 子组件
import StepProgress from '../components/common/StepProgress.vue'
import Step1Interview from '../components/step1/Step1Interview.vue'
import Step2Analysis from '../components/step2/Step2Analysis.vue'
import Step3Solutions from '../components/step3/Step3Solutions.vue'
import GlobalStatusTooltip from '../components/common/GlobalStatusTooltip.vue'

const route = useRoute()
const router = useRouter()
const store = useThinkingStore()

const initialized = ref(false)

onMounted(async () => {
  const sessionId = route.params.id
  
  if (sessionId) {
    // 场景 A: URL 带有 Session ID (如 /think/abc-123)
    // 尝试从本地存储加载指定会话
    const session = store.loadSession(sessionId)
    if (!session) {
      // 如果会话不存在（可能是无效 ID 或数据已清除），返回首页
      router.push('/')
      return
    }
  } else {
    // 场景 B: URL 无 Session ID (如 /think)
    // 检查 Store 中是否已有活跃会话（通常是从首页刚创建跳转过来的）
    const session = store.loadCurrentSession()
    if (!session) {
      // 如果没有任何活跃会话，返回首页
      router.push('/')
      return
    }
    // 将 URL 规范化，补充 Session ID，方便分享或刷新
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
          ← 首页
        </button>
        <div class="logo">
          <img :src="logoImage" alt="深度思界 Logo" class="logo-icon">
          <span class="logo-text">深度思界</span>
        </div>
        <div class="header-right">
          <!-- 可以添加保存按钮等 -->
        </div>
      </div>
    </header>
    
    <!-- 问题显示 -->
    <div class="problem-bar">
      <div class="container">
        <div class="problem-content">
          <span class="problem-label">深思问题：</span>
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
