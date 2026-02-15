<!--
  @fileoverview Settings view component
  @module views/SettingsView
  @description Application settings page for configuring:
  - AI API configuration (base URL, API key, model)
  - Language preference
  - Custom AI prompts for each analysis step
  - Data management (clear all data)
  
  @copyright 2026 BigTooth
  @license GPL-3.0
-->

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAiConfig, setAiConfig } from '../services/ai'
import { getPrompts, savePrompts, resetPrompts, resetPrompt } from '../services/prompts'
import * as storage from '../services/storage'
import '../styles/SettingsView.css'
import { useI18n } from 'vue-i18n'
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
  Key,
  Globe,
  Server
} from 'lucide-vue-next'

const router = useRouter()
const { t, locale } = useI18n()

const aiConfig = ref({
  baseUrl: '',
  apiKey: '',
  model: ''
})
const showKey = ref(false)
const saved = ref(false)
const currentLanguage = ref(locale.value)

const prompts = ref({})
const expandedPrompt = ref(null)
const promptSaved = ref(false)

onMounted(() => {
  aiConfig.value = getAiConfig()
  currentLanguage.value = locale.value
  loadPrompts()
})

function loadPrompts() {
  prompts.value = getPrompts(currentLanguage.value)
}

function handleLanguageChange() {
  locale.value = currentLanguage.value
  localStorage.setItem('ideaverse_language', currentLanguage.value)
  loadPrompts()
}

function savePromptSettings() {
  savePrompts(prompts.value, currentLanguage.value)
  promptSaved.value = true
  setTimeout(() => {
    promptSaved.value = false
  }, 2000)
}

function handleResetPrompt(key) {
  if (confirm(t('common.confirm'))) {
    prompts.value = resetPrompt(key, currentLanguage.value)
  }
}

function handleResetAllPrompts() {
  if (confirm(t('common.confirm'))) {
    prompts.value = resetPrompts(currentLanguage.value)
  }
}

function toggleExpand(key) {
  if (expandedPrompt.value === key) {
    expandedPrompt.value = null
  } else {
    expandedPrompt.value = key
  }
}

function saveAiConfig() {
  setAiConfig({
    baseUrl: aiConfig.value.baseUrl.trim(),
    apiKey: aiConfig.value.apiKey.trim(),
    model: aiConfig.value.model.trim()
  })
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

function clearAllData() {
  if (confirm(t('common.delete') + '?')) {
    storage.clearAllData()
    aiConfig.value = getAiConfig()
    alert(t('common.success'))
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="settings-view">
    <header class="header">
      <div class="container header-content">
        <button class="btn btn-ghost" @click="goHome">
          ← {{ t('common.home') }}
        </button>
        <h1 class="page-title">
          <Settings class="title-icon" :size="32" /> {{ t('settings.title') }}
        </h1>
        <div style="width: 100px;"></div>
      </div>
    </header>
    
    <main class="main">
      <div class="container">
        <div class="settings-content">
          <section class="settings-section">
            <h2 class="section-title"><Key class="section-icon" :size="24" /> {{ t('settings.api_configuration') }}</h2>
            <p class="section-desc">
              {{ t('settings.api_config_desc') }}
              <a href="https://platform.deepseek.com/" target="_blank" rel="noopener">
                {{ t('settings.get_api_key') }}
              </a>
            </p>
            
            <div class="input-group">
              <label class="input-label">{{ t('settings.base_url_label') }}</label>
              <input 
                v-model="aiConfig.baseUrl"
                type="text"
                class="input"
                :placeholder="t('settings.base_url_placeholder')"
              />
            </div>
            
            <div class="input-group">
              <label class="input-label">{{ t('settings.api_key_label') }}</label>
              <div class="input-with-toggle">
                <input 
                  v-model="aiConfig.apiKey"
                  :type="showKey ? 'text' : 'password'"
                  class="input"
                  :placeholder="t('settings.api_key_placeholder')"
                />
                <button 
                  class="toggle-btn"
                  @click="showKey = !showKey"
                >
                  <component :is="showKey ? EyeOff : Eye" :size="16" />
                </button>
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">{{ t('settings.model_label') }}</label>
              <input 
                v-model="aiConfig.model"
                type="text"
                class="input"
                :placeholder="t('settings.model_placeholder')"
              />
            </div>
            
            <div class="input-actions">
              <button 
                class="btn btn-primary"
                @click="saveAiConfig"
              >
                <Save :size="16" /> {{ t('common.save') }}
              </button>
              <span v-if="saved" class="save-success"><Check :size="16" /> {{ t('settings.save_success') }}</span>
            </div>
          </section>

          <section class="settings-section">
             <h2 class="section-title"><Globe class="section-icon" :size="24" /> {{ t('settings.language_label') }}</h2>
             <div class="input-group">
               <select v-model="currentLanguage" @change="handleLanguageChange" class="input">
                 <option value="zh-CN">简体中文</option>
                 <option value="en-US">English</option>
               </select>
             </div>
          </section>

          <section class="settings-section">
            <div class="section-header">
              <h2 class="section-title"><Bot class="section-icon" :size="24" /> {{ t('settings.ai_prompts') }}</h2>
              <button class="btn btn-sm btn-ghost" @click="handleResetAllPrompts">{{ t('settings.reset_all') }}</button>
            </div>
            <p class="section-desc">
              {{ t('settings.customize_prompts') }}
              <br>
              <small>{{ t('settings.support_variables') }}</small>
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
                    <button class="btn btn-sm btn-ghost" @click="handleResetPrompt(key)">Reset</button>
                    <button class="btn btn-sm btn-primary" @click="savePromptSettings">
                      <Save :size="14" /> {{ t('common.save') }}
                    </button>
                    <span v-if="promptSaved" class="save-success">
                      <Check :size="14" /> {{ t('settings.save_success') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section class="settings-section">
            <h2 class="section-title">
              <Package class="section-icon" :size="24" /> {{ t('settings.data_management') }}
            </h2>
            
            <div class="danger-zone">
              <h3 class="danger-title">
                <AlertTriangle class="danger-icon" :size="20" /> {{ t('settings.danger_zone') }}
              </h3>
              <p class="danger-desc">{{ t('settings.clear_data_desc') }}</p>
              <button 
                class="btn btn-danger"
                @click="clearAllData"
              >
                <Trash2 :size="16" /> {{ t('settings.clear_all_data') }}
              </button>
            </div>
          </section>
          
          <section class="settings-section">
            <h2 class="section-title">
              <Info class="section-icon" :size="24" /> {{ t('settings.about') }}
            </h2>
            <div class="about-content">
              <div class="about-item">
                <span class="about-label">{{ t('settings.version') }}</span>
                <span class="about-value">1.0.0</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
