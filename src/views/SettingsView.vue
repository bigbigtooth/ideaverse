<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApiKey, setApiKey } from '../services/ai'
import { getPrompts, savePrompts, resetPrompts, resetPrompt } from '../services/prompts'
import * as storage from '../services/storage'
import '../styles/SettingsView.css'
import { 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  Lightbulb, 
  BarChart, 
  Bot, 
  ChevronUp, 
  ChevronDown, 
  Package, 
  AlertTriangle, 
  Trash2, 
  Info, 
  Settings,
  Key
} from 'lucide-vue-next'

const router = useRouter()

const apiKey = ref('')
const showKey = ref(false)
const saved = ref(false)

// 提示词相关
const prompts = ref({})
const expandedPrompt = ref(null) // 当前展开编辑的 prompt ID
const promptSaved = ref(false)

onMounted(() => {
  apiKey.value = getApiKey()
  loadPrompts()
})

function loadPrompts() {
  prompts.value = getPrompts()
}

function savePromptSettings() {
  savePrompts(prompts.value)
  promptSaved.value = true
  setTimeout(() => {
    promptSaved.value = false
  }, 2000)
}

function handleResetPrompt(key) {
  if (confirm('确定要重置此提示词为默认值吗？')) {
    prompts.value = resetPrompt(key)
  }
}

function handleResetAllPrompts() {
  if (confirm('确定要重置所有提示词为默认值吗？此操作不可恢复。')) {
    prompts.value = resetPrompts()
  }
}

function toggleExpand(key) {
  if (expandedPrompt.value === key) {
    expandedPrompt.value = null
  } else {
    expandedPrompt.value = key
  }
}

function saveApiKey() {
  setApiKey(apiKey.value.trim())
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

function clearAllData() {
  if (confirm('确定要清除所有数据吗？这将删除所有历史记录和设置，此操作不可恢复！')) {
    storage.clearAllData()
    apiKey.value = ''
    alert('所有数据已清除')
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="settings-view">
    <!-- 头部 -->
    <header class="header">
      <div class="container header-content">
        <button class="btn btn-ghost" @click="goHome">
          ← 返回首页
        </button>
        <h1 class="page-title">
          <Settings class="title-icon" :size="32" /> 设置
        </h1>
        <div style="width: 100px;"></div>
      </div>
    </header>
    
    <!-- 主内容 -->
    <main class="main">
      <div class="container">
        <div class="settings-content">
          <!-- API Key 设置 -->
          <section class="settings-section">
            <h2 class="section-title"><Key class="section-icon" :size="24" /> API 配置</h2>
            <p class="section-desc">
              配置 DeepSeek API Key 以启用 AI 功能。
              <a href="https://platform.deepseek.com/" target="_blank" rel="noopener">
                获取 API Key →
              </a>
            </p>
            
            <div class="input-group">
              <label class="input-label">DeepSeek API Key</label>
              <div class="input-with-toggle">
                <input 
                  v-model="apiKey"
                  :type="showKey ? 'text' : 'password'"
                  class="input"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <button 
                  class="toggle-btn"
                  @click="showKey = !showKey"
                >
                  <component :is="showKey ? EyeOff : Eye" :size="16" />
                  {{ showKey ? '隐藏' : '显示' }}
                </button>
              </div>
              
              <div class="input-actions">
                <button 
                  class="btn btn-primary"
                  @click="saveApiKey"
                  :disabled="!apiKey.trim()"
                >
                  <Save :size="16" /> 保存
                </button>
                <span v-if="saved" class="save-success"><Check :size="16" /> 已保存</span>
              </div>
            </div>
            
            <div class="api-info">
              <div class="info-item">
                <Lightbulb class="info-icon" :size="16" />
                <span>API Key 仅保存在本地浏览器中，不会上传到任何服务器</span>
              </div>
              <div class="info-item">
                <BarChart class="info-icon" :size="16" />
                <span>使用 DeepSeek Chat 模型，按 API 调用次数计费</span>
              </div>
            </div>
          </section>

          <!-- AI 提示词设置 -->
          <section class="settings-section">
            <div class="section-header">
              <h2 class="section-title"><Bot class="section-icon" :size="24" /> AI 提示词配置</h2>
              <button class="btn btn-sm btn-ghost" @click="handleResetAllPrompts">重置所有</button>
            </div>
            <p class="section-desc">
              自定义 AI 的系统提示词（System Prompt），调整 AI 的角色设定和输出格式。
              <br>
              <small>支持使用 {variable} 形式的变量占位符，请谨慎修改。</small>
            </p>
            
            <div class="prompts-list">
              <div v-for="(prompt, key) in prompts" :key="key" class="prompt-item">
                <div class="prompt-header" @click="toggleExpand(key)">
                  <div class="prompt-info">
                    <div class="prompt-name">{{ prompt.name }}</div>
                    <div class="prompt-desc">{{ prompt.description }}</div>
                  </div>
                  <div class="prompt-actions">
                    <button class="btn-icon">
                      <component :is="expandedPrompt === key ? ChevronUp : ChevronDown" :size="16" />
                    </button>
                  </div>
                </div>
                
                <div v-if="expandedPrompt === key" class="prompt-editor">
                  <textarea 
                    v-model="prompt.content" 
                    class="prompt-textarea"
                    rows="10"
                  ></textarea>
                  <div class="editor-actions">
                    <button class="btn btn-sm btn-ghost" @click="handleResetPrompt(key)">重置此项</button>
                    <button class="btn btn-sm btn-primary" @click="savePromptSettings">
                      <Save :size="14" /> 保存修改
                    </button>
                    <span v-if="promptSaved" class="save-success">
                      <Check :size="14" /> 已保存
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 数据管理 -->
          <section class="settings-section">
            <h2 class="section-title">
              <Package class="section-icon" :size="24" /> 数据管理
            </h2>
            <p class="section-desc">
              所有数据保存在浏览器本地存储中。清除浏览器数据会导致数据丢失。
            </p>
            
            <div class="danger-zone">
              <h3 class="danger-title">
                <AlertTriangle class="danger-icon" :size="20" /> 危险操作
              </h3>
              <p class="danger-desc">清除所有本地数据，包括历史记录和设置</p>
              <button 
                class="btn btn-danger"
                @click="clearAllData"
              >
                <Trash2 :size="16" /> 清除所有数据
              </button>
            </div>
          </section>
          
          <!-- 关于 -->
          <section class="settings-section">
            <h2 class="section-title">
              <Info class="section-icon" :size="24" /> 关于
            </h2>
            <div class="about-content">
              <div class="about-item">
                <span class="about-label">版本</span>
                <span class="about-value">1.0.0</span>
              </div>
              <div class="about-item">
                <span class="about-label">技术栈</span>
                <span class="about-value">Vue 3 + Vite + DeepSeek API</span>
              </div>
              <div class="about-item">
                <span class="about-label">存储方式</span>
                <span class="about-value">浏览器 LocalStorage</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<!-- Styles are imported from ../styles/SettingsView.css -->
