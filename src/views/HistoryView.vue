<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThinkingStore } from '../stores/thinking'
import * as storage from '../services/storage'
import '../styles/HistoryView.css'
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

const sessions = ref([])

onMounted(() => {
  loadSessions()
})

function loadSessions() {
  sessions.value = storage.getSessions()
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStepLabel(step) {
  const labels = {
    1: '问题理解',
    2: '深度分析',
    3: '方案评估'
  }
  return labels[step] || '未开始'
}

function getStatusClass(status) {
  return status === 'completed' ? 'status-completed' : 'status-progress'
}

function continueSession(session) {
  store.loadSession(session.id)
  router.push(`/think/${session.id}`)
}

function deleteSessionConfirm(session) {
  if (confirm(`确定要删除这个会话吗？\n"${session.problem}"`)) {
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
    a.download = `思维导图-${session.problem.slice(0, 20)}.md`
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
          <ArrowLeft :size="16" /> 返回首页
        </button>
        <h1 class="page-title">
          <History :size="24" /> 历史记录
        </h1>
        <div style="width: 100px;"></div>
      </div>
    </header>
    
    <!-- 主内容 -->
    <main class="main">
      <div class="container">
        <!-- 空状态 -->
        <div v-if="sessions.length === 0" class="empty-state">
          <FileText class="empty-icon" :size="48" />
          <h2>暂无记录</h2>
          <p>开始你的第一次深度思考吧</p>
          <button class="btn btn-primary" @click="goHome">
            <Play :size="16" /> 开始思考
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
                {{ session.status === 'completed' ? '已完成' : '进行中' }}
              </div>
              <div class="session-date">{{ formatDate(session.updatedAt) }}</div>
            </div>
            
            <h3 class="session-problem">{{ session.problem }}</h3>
            
            <div class="session-progress">
              <div class="progress-label">当前进度：{{ getStepLabel(session.currentStep) }}</div>
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
                {{ session.status === 'completed' ? '查看详情' : '继续思考' }}
              </button>
              <button 
                v-if="session.mindMap"
                class="btn btn-secondary"
                @click="exportMindMap(session)"
              >
                <Download :size="14" /> 导出思维导图
              </button>
              <button 
                class="btn btn-ghost"
                @click="exportSession(session)"
              >
                <Save :size="14" /> 导出数据
              </button>
              <button 
                class="btn btn-ghost delete-btn"
                @click="deleteSessionConfirm(session)"
              >
                <Trash2 :size="14" /> 删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<!-- Styles are imported from ../styles/HistoryView.css -->
