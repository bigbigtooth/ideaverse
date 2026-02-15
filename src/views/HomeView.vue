<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThinkingStore } from '../stores/thinking'
import { hasApiKey } from '../services/ai'
import logoImage from '../assets/logo.png'
import '../styles/HomeView.css'

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
  
  const session = store.createNewSession(problemInput.value.trim())
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
          <img :src="logoImage" alt="深度思界 Logo" class="logo-icon">
          <span class="logo-text">深度思界</span>
        </div>
        <nav class="nav">
          <button class="btn btn-ghost" @click="goToHistory">
            📚 历史记录
          </button>
          <button class="btn btn-ghost" @click="goToSettings">
            ⚙️ 设置
          </button>
        </nav>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="main">
      <div class="container">
        <!-- Hero 区域 -->
        <section class="hero">
          <div class="hero-badge">🧠 AI 驱动的深度思考助手</div>
          <h1 class="hero-title">
            在思维的旷野，为你画出路径
          </h1>
          <p class="hero-description">
            运用科学的思维模型，全方位的思考角度，帮助你从问题中发现本质，从迷雾中找到方向
          </p>
          
          <!-- API Key 警告 -->
          <div v-if="showApiKeyWarning" class="api-warning">
            <span class="warning-icon">⚠️</span>
            <span>请先配置 DeepSeek API Key 以启用 AI 功能</span>
            <button class="btn btn-sm btn-primary" @click="goToSettings">
              去配置
            </button>
          </div>
        </section>
        
        <!-- 输入区域 -->
        <section class="input-section">
          <div class="input-card">
            <div class="input-header">
              <span class="input-icon">✨</span>
              <span>请输入你需要深度思考的问题</span>
            </div>
            <textarea 
              v-model="problemInput"
              class="problem-input"
              placeholder="例如：如何提高团队的工作效率？为什么用户流失率突然上升？我应该如何做出职业选择？"
              rows="4"
            ></textarea>
            <div class="input-footer">
              <div class="char-count">{{ problemInput.length }} 字</div>
              <button 
                class="btn btn-primary btn-lg start-btn"
                :disabled="!problemInput.trim()"
                @click="startThinking"
              >
                🚀 开始深度思考
              </button>
            </div>
          </div>
        </section>
        
        <!-- 功能介绍 -->
        <section class="features">
          <h2 class="features-title">三步助你深度思考</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-number">01</div>
              <div class="feature-icon">🎯</div>
              <h3 class="feature-title">问题理解</h3>
              <p class="feature-desc">
                通过智能采访问答，多角度理解问题本质，生成问题理解分析报告
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-number">02</div>
              <div class="feature-icon">🔍</div>
              <h3 class="feature-title">深度分析</h3>
              <p class="feature-desc">
                运用 5W2H、MECE 等思维模型，拆解问题，识别隐藏因素
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-number">03</div>
              <div class="feature-icon">💡</div>
              <h3 class="feature-title">方案评估</h3>
              <p class="feature-desc">
                头脑风暴生成方案，结构化评估有效性、可行性与可持续性
              </p>
            </div>
          </div>
        </section>
        
        <!-- 思维模型展示 -->
        <section class="models">
          <h2 class="models-title">科学思维模型加持</h2>
          <div class="models-list">
            <div class="model-tag">5W2H 分析法</div>
            <div class="model-tag">MECE 分解法</div>
            <div class="model-tag">根因分析法</div>
            <div class="model-tag">成本收益分析</div>
            <div class="model-tag">压力测试</div>
            <div class="model-tag">多角度验证</div>
          </div>
        </section>
      </div>
    </main>
    
    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>深度思界 IdeaVerse © 2026 · 让思考更有深度</p>
        <p class="beian">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">粤ICP备2022060654号-1</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<!-- Styles are imported from ../styles/HomeView.css -->
