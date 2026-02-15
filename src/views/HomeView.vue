<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThinkingStore } from '../stores/thinking'
import { hasApiKey } from '../services/ai'
import { useI18n } from 'vue-i18n'
import { 
  History, 
  Settings, 
  AlertTriangle, 
  Sparkles, 
  Rocket, 
  Target, 
  Search, 
  Lightbulb 
} from 'lucide-vue-next'
import logoImage from '../assets/logo.png'
import '../styles/HomeView.css'
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const store = useThinkingStore()

const problemInput = ref('')
const showApiKeyWarning = ref(false)

onMounted(() => {
  showApiKeyWarning.value = !hasApiKey()
})

function startThinking() {
  if (!problemInput.value.trim()) return
  
  if (!hasApiKey()) {
    router.push('/settings')
    return
  }
  
  const session = store.createSession(problemInput.value.trim())
  router.push(`/think/${session.id}`)
}

function goToSettings() {
  router.push('/settings')
}

function goToHistory() {
  router.push('/history')
}
</script>

<template>
  <div class="home">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container header-content">
        <div class="logo">
          <img :src="logoImage" alt="Logo" class="logo-icon">
          <span class="logo-text">{{ t('common.brand_name') }}</span>
        </div>
        <nav class="nav">
          <LanguageSwitcher />
          <button class="btn btn-ghost" @click="goToHistory">
            <History class="nav-icon" :size="20" />
            <span class="nav-text">{{ t('common.history') }}</span>
          </button>
          <button class="btn btn-ghost" @click="goToSettings">
            <Settings class="nav-icon" :size="20" />
            <span class="nav-text">{{ t('common.settings') }}</span>
          </button>
        </nav>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="main">
      <div class="container">
        <!-- Hero 区域 -->
        <section class="hero">
          <h1 class="hero-title">
            {{ t('home.slogan') }}
          </h1>
          <p class="hero-description">
            {{ t('home.start_thinking') }}
          </p>
          
          <!-- API Key 警告 -->
          <div v-if="showApiKeyWarning" class="api-warning">
            <AlertTriangle class="warning-icon" :size="16" />
            <span>{{ t('settings.api_key_missing') }}</span>
            <button class="btn btn-sm btn-primary" @click="goToSettings">
              {{ t('common.settings') }}
            </button>
          </div>
        </section>
        
        <!-- 输入区域 -->
        <section class="input-section">
          <div class="input-card">
            <div class="input-header">
              <Sparkles class="input-icon" :size="20" />
              <span>{{ t('home.start_thinking') }}</span>
            </div>
            <textarea 
              v-model="problemInput"
              class="problem-input"
              :placeholder="t('home.placeholder')"
              rows="4"
            ></textarea>
            <div class="input-footer">
              <div class="char-count">{{ problemInput.length }}</div>
              <button 
                class="btn btn-primary btn-lg start-btn"
                :disabled="!problemInput.trim()"
                @click="startThinking"
              >
                <Rocket class="btn-icon" :size="20" />
                <span>{{ t('home.start_thinking') }}</span>
              </button>
            </div>
          </div>
        </section>
        
        <!-- 功能介绍 -->
        <section class="features">
          <h2 class="features-title">{{ t('common.brand_name') }}</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-number">01</div>
              <Target class="feature-icon" :size="48" stroke-width="1.5" />
              <h3 class="feature-title">{{ t('home.features.step1_title') }}</h3>
              <p class="feature-desc">
                {{ t('home.features.step1_desc') }}
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-number">02</div>
              <Search class="feature-icon" :size="48" stroke-width="1.5" />
              <h3 class="feature-title">{{ t('home.features.step2_title') }}</h3>
              <p class="feature-desc">
                {{ t('home.features.step2_desc') }}
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-number">03</div>
              <Lightbulb class="feature-icon" :size="48" stroke-width="1.5" />
              <h3 class="feature-title">{{ t('home.features.step3_title') }}</h3>
              <p class="feature-desc">
                {{ t('home.features.step3_desc') }}
              </p>
            </div>
          </div>
        </section>
        
        <!-- 思维模型展示 (Optional: could also be translated if needed, but these are mostly proper nouns or handled by generic list) -->
        <section class="models">
          <h2 class="models-title">{{ t('step2.recommend_title') }}</h2>
          <div class="models-list">
            <div class="model-tag">{{ t('thinking_models.MECE.name') }}</div>
            <div class="model-tag">{{ t('thinking_models.5W2H.name') }}</div>
            <div class="model-tag">{{ t('thinking_models.RootCause.name') }}</div>
            <div class="model-tag">{{ t('thinking_models.SWOT.name') }}</div>
            <div class="model-tag">{{ t('thinking_models.SixThinkingHats.name') }}</div>
          </div>
        </section>
      </div>
    </main>
    
    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>{{ t('home.footer') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 样式微调，配合 Lucide 图标 */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.hero-icon {
  color: var(--color-accent-primary);
}
</style>
