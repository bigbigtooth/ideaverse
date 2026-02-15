<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThinkingStore } from '../stores/thinking'
import * as storage from '../services/storage'
import '../styles/HistoryView.css'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue'
import { 
  History, 
  FileText, 
  CheckCircle, 
  Loader, 
  Download, 
  Save, 
  Trash2,
  ArrowLeft,
  Play
} from 'lucide-vue-next'

const router = useRouter()
const store = useThinkingStore()
const { t, locale } = useI18n()

const sessions = ref([])

onMounted(() => {
  loadSessions()
})

function loadSessions() {
  sessions.value = storage.getSessions()
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStepLabel(step) {
  const labels = {
    1: t('think.step1'),
    2: t('think.step2'),
    3: t('think.step3')
  }
  return labels[step] || t('common.unknown_error')
}

function getStatusClass(status) {
  return status === 'completed' ? 'status-completed' : 'status-progress'
}

function continueSession(session) {
  store.loadSession(session.id)
  router.push(`/think/${session.id}`)
}

function deleteSessionConfirm(session) {
  if (confirm(t('history.delete_confirm'))) {
    storage.deleteSession(session.id)
    loadSessions()
  }
}

function exportSession(session) {
  const data = storage.exportSession(session.id)
  if (data) {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ideaverse-${session.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

function exportMindMap(session) {
  const data = storage.exportMindMap(session.id)
  if (data) {
    const blob = new Blob([data], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${t('step3.mindmap_filename')}`
    a.click()
    URL.revokeObjectURL(url)
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="history-view">
    <!-- 头部 -->
    <header class="header">
      <div class="container header-content">
        <button class="btn btn-ghost" @click="goHome">
          <ArrowLeft :size="16" /> {{ t('common.home') }}
        </button>
        <h1 class="page-title">
          <History :size="24" /> {{ t('history.title') }}
        </h1>
        <LanguageSwitcher />
      </div>
    </header>
    
    <!-- 主内容 -->
    <main class="main">
      <div class="container">
        <!-- 空状态 -->
        <div v-if="sessions.length === 0" class="empty-state">
          <FileText class="empty-icon" :size="48" />
          <h2>{{ t('history.empty') }}</h2>
          <button class="btn btn-primary" @click="goHome">
            <Play :size="16" /> {{ t('home.start_thinking') }}
          </button>
        </div>
        
        <!-- 会话列表 -->
        <div v-else class="sessions-list">
          <div 
            v-for="session in sessions" 
            :key="session.id"
            class="session-card"
          >
            <div class="session-header">
              <div class="session-status" :class="getStatusClass(session.status)">
                <component :is="session.status === 'completed' ? CheckCircle : Loader" :size="14" />
                {{ session.status === 'completed' ? t('history.status.completed') : t('history.status.in_progress') }}
              </div>
              <div class="session-date">{{ formatDate(session.updatedAt) }}</div>
            </div>
            
            <h3 class="session-problem">{{ session.problem }}</h3>
            
            <div class="session-progress">
              <div class="progress-label">{{ t('think.current_step', 'Progress') }}: {{ getStepLabel(session.currentStep) }}</div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: (session.currentStep / 3 * 100) + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="session-actions">
              <button 
                class="btn btn-primary"
                @click="continueSession(session)"
              >
                <Play :size="14" />
                {{ session.status === 'completed' ? t('history.continue') : t('history.continue') }}
              </button>
              <button 
                v-if="session.mindMap"
                class="btn btn-secondary"
                @click="exportMindMap(session)"
              >
                <Download :size="14" /> {{ t('step3.export_mindmap') }}
              </button>
              <button 
                class="btn btn-ghost"
                @click="exportSession(session)"
              >
                <Save :size="14" /> {{ t('common.export') }}
              </button>
              <button 
                class="btn btn-ghost delete-btn"
                @click="deleteSessionConfirm(session)"
              >
                <Trash2 :size="14" /> {{ t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<!-- Styles are imported from ../styles/HistoryView.css -->
