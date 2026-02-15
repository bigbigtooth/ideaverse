<!--
  @fileoverview Step 1: Problem Interview component
  @module components/step1/Step1Interview
  @description The first step in the thinking workflow. Collects clarifying
  information about the problem through AI-generated interview questions.
  Generates an understanding report that guides subsequent analysis.
  
  Features:
  - AI-generated interview questions with multiple choice options
  - Custom answer input capability
  - Understanding report generation and editing
  - Progress tracking through questions
  
  @copyright 2026 BigTooth
  @license GPL-3.0
-->

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useThinkingStore } from '../../stores/thinking'
import { useI18n } from 'vue-i18n'
import { 
  Target, 
  CheckCircle, 
  RefreshCw, 
  FileText, 
  Edit3, 
  Save, 
  ArrowRight, 
  ArrowLeft,
  Pin,
  Search,
  Ruler,
  Lightbulb
} from 'lucide-vue-next'

const store = useThinkingStore()
const { t } = useI18n()

const currentQuestionIndex = ref(0)
const customAnswer = ref('')
const showReport = ref(false)
const editingReport = ref(false)
const editedSummary = ref('')
const editedKeyPoints = ref('')
const editedScope = ref('')

const questions = computed(() => store.currentSession?.interviewQuestions || [])
const answers = computed(() => store.currentSession?.interviewAnswers || [])
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const understandingReport = computed(() => store.currentSession?.understandingReport)
const allAnswered = computed(() => answers.value.length >= questions.value.length && questions.value.length > 0)

onMounted(async () => {
  if (questions.value.length === 0) {
    await store.generateQuestions()
  } else if (understandingReport.value) {
    showReport.value = true
    initReportEdit()
  }
})

function initReportEdit() {
  if (understandingReport.value) {
    editedSummary.value = understandingReport.value.summary || ''
    editedKeyPoints.value = (understandingReport.value.keyPoints || []).join('\n')
    editedScope.value = understandingReport.value.scope || ''
  }
}

watch(understandingReport, () => {
  if (understandingReport.value) {
    initReportEdit()
  }
})

function getCurrentAnswer() {
  const answer = answers.value.find(a => a.questionId === currentQuestion.value?.id)
  return answer?.answer || null
}

function selectOption(option) {
  if (!currentQuestion.value) return
  store.saveAnswer(currentQuestion.value.id, currentQuestion.value.question, option)
  customAnswer.value = ''
  setTimeout(() => goToNextQuestion(), 300)
}

function submitCustomAnswer() {
  if (!customAnswer.value.trim() || !currentQuestion.value) return
  store.saveAnswer(currentQuestion.value.id, currentQuestion.value.question, customAnswer.value.trim())
  customAnswer.value = ''
  setTimeout(() => goToNextQuestion(), 300)
}

function goToNextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

function goToPrevQuestion() {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--
}

async function generateReport() {
  await store.generateUnderstandingReport()
  showReport.value = true
  initReportEdit()
}

function saveReportEdit() {
  store.updateCurrentSession({
    understandingReport: {
      ...understandingReport.value,
      summary: editedSummary.value,
      keyPoints: editedKeyPoints.value.split('\n').filter(Boolean),
      scope: editedScope.value
    }
  })
  editingReport.value = false
}

function confirmAndNext() {
  store.updateCurrentSession({ currentStep: 2 })
}

function restartInterview() {
  store.updateCurrentSession({ interviewAnswers: [], understandingReport: null })
  currentQuestionIndex.value = 0
  showReport.value = false
}
</script>

<template>
  <div class="step1">
    <div class="step-header">
      <h2 class="step-title">
        <Target class="title-icon" :size="32" stroke-width="2.5" /> 
        {{ t('step1.title') }}
      </h2>
      <p class="step-desc">{{ t('step1.desc') }}</p>
    </div>
    
    <!-- 问答区域 -->
    <div v-if="store.loading && questions.length === 0" class="loading-section">
      <div class="loading-spinner"></div>
      <span>{{ t('status.generating_questions') }}</span>
    </div>
    <div v-else-if="!allAnswered && !showReport && questions.length > 0" class="interview-section">
      <div class="question-progress">
        <span>{{ t('common.loading').replace('...', '') }} {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
        <div class="progress-bar"><div class="progress-fill" :style="{ width: ((currentQuestionIndex + 1) / questions.length * 100) + '%' }"></div></div>
      </div>
      
      <div v-if="currentQuestion" class="question-card">
        <h3 class="question-text">{{ currentQuestion.question }}</h3>
        <div class="options-list">
          <div v-for="(option, index) in currentQuestion.options" :key="index"
               class="selection-card" :class="{ selected: getCurrentAnswer() === option }"
               @click="selectOption(option)">
            <div class="option-indicator">{{ ['A', 'B', 'C'][index] }}</div>
            <div class="option-text">{{ option }}</div>
          </div>
          <div class="custom-option">
            <div class="custom-label"><span>D</span> {{ t('step1.custom_answer') }}</div>
            <div class="custom-input-group">
              <textarea v-model="customAnswer" class="input textarea" :placeholder="t('step1.custom_placeholder')" rows="2"></textarea>
              <button class="btn btn-primary" :disabled="!customAnswer.trim()" @click="submitCustomAnswer">{{ t('common.confirm') }}</button>
            </div>
          </div>
        </div>
        <div class="question-nav">
          <button class="btn btn-ghost" :disabled="currentQuestionIndex === 0" @click="goToPrevQuestion">
            <ArrowLeft :size="16" /> {{ t('common.back') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 生成报告 -->
    <div v-else-if="allAnswered && !showReport" class="complete-section">
      <div class="complete-card">
        <CheckCircle class="complete-icon" :size="48" />
        <h3>{{ t('common.finish') }}</h3>
        <p>{{ t('step1.desc') }}</p>
        <div class="answers-preview">
          <div v-for="(a, i) in answers" :key="i" class="answer-item">
            <span class="q-num">Q{{ i + 1 }}</span>
            <span class="a-text">{{ a.answer }}</span>
          </div>
        </div>
        <div class="complete-actions">
          <button class="btn btn-ghost" @click="restartInterview">
            <RefreshCw :size="16" /> {{ t('common.retry') }}
          </button>
          <button class="btn btn-primary btn-lg" @click="generateReport">
            <FileText :size="16" /> {{ t('common.submit') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 报告展示 -->
    <div v-else-if="showReport && understandingReport" class="report-section">
      <div class="report-card">
        <div class="report-header">
          <h3>
            <FileText :size="20" class="header-icon" /> 
            {{ t('step1.report_title') }}
          </h3>
          <button v-if="!editingReport" class="btn btn-sm btn-ghost" @click="editingReport = true">
            <Edit3 :size="14" /> {{ t('common.edit') }}
          </button>
          <button v-else class="btn btn-sm btn-primary" @click="saveReportEdit">
            <Save :size="14" /> {{ t('common.save') }}
          </button>
        </div>
        
        <div class="report-content">
          <!-- 核心总结 -->
          <div class="report-block">
            <h4><Target :size="16" /> {{ t('step1.summary') }}</h4>
            <textarea v-if="editingReport" v-model="editedSummary" class="input textarea" rows="3"></textarea>
            <p v-else>{{ understandingReport.summary }}</p>
          </div>
          
          <!-- 关键要点 -->
          <div class="report-block">
            <h4><Pin :size="16" /> {{ t('step1.key_points') }}</h4>
            <textarea v-if="editingReport" v-model="editedKeyPoints" class="input textarea" placeholder="-" rows="4"></textarea>
            <ul v-else class="key-points">
              <li v-for="(point, i) in understandingReport.keyPoints" :key="i">{{ point }}</li>
            </ul>
          </div>
          
          <!-- 关注领域 -->
          <div v-if="understandingReport.focusAreas?.length" class="report-block">
            <h4><Search :size="16" /> {{ t('step1.focus_areas') }}</h4>
            <div class="focus-tags">
              <span v-for="(area, i) in understandingReport.focusAreas" :key="i" class="focus-tag">{{ area }}</span>
            </div>
          </div>
          
          <!-- 问题边界 -->
          <div class="report-block">
            <h4><Ruler :size="16" /> {{ t('step1.scope') }}</h4>
            <textarea v-if="editingReport" v-model="editedScope" class="input textarea" rows="2"></textarea>
            <p v-else>{{ understandingReport.scope }}</p>
          </div>
          
          <!-- 深层需求 -->
          <div v-if="understandingReport.deeperNeeds" class="report-block">
            <h4><Lightbulb :size="16" /> {{ t('step1.deeper_needs') }}</h4>
            <p>{{ understandingReport.deeperNeeds }}</p>
          </div>
        </div>
        
        <div class="report-footer">
          <button class="btn btn-ghost" @click="restartInterview">
            <RefreshCw :size="16" /> {{ t('common.retry') }}
          </button>
          <button class="btn btn-primary btn-lg" @click="confirmAndNext">
            {{ t('common.next') }} <ArrowRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step1 { max-width: 800px; margin: 0 auto; }
.step-header { text-align: center; margin-bottom: var(--space-2xl); }
.step-title { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); font-size: var(--text-2xl); }
.step-desc { color: var(--color-text-secondary); }
.question-progress { display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-xl); font-size: var(--text-sm); color: var(--color-text-muted); }
.progress-bar { flex: 1; height: 2px; background: var(--color-bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-text-primary); transition: width 0.3s; }
.question-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-xl); }
.question-text { font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-xl); line-height: 1.5; color: var(--color-text-primary); }
.options-list { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-xl); }
.selection-card { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-lg); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; }
.selection-card:hover { border-color: var(--color-text-primary); background: var(--color-bg-card-hover); }
.selection-card.selected { border-color: var(--color-text-primary); border-width: 2px; background: var(--color-bg-tertiary); }
.option-indicator { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); }
.selection-card.selected .option-indicator { background: var(--color-text-primary); color: white; border-color: var(--color-text-primary); }
.option-text { flex: 1; font-size: var(--text-base); color: var(--color-text-primary); }
.custom-option { padding: var(--space-lg); background: var(--color-bg-card); border: 1px dashed var(--color-border); border-radius: var(--radius-lg); }
.custom-label { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); font-size: var(--text-sm); color: var(--color-text-muted); }
.custom-label span { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); font-weight: 600; }
.custom-input-group { display: flex; gap: var(--space-md); }
.custom-input-group textarea { flex: 1; border: 1px solid var(--color-border); background: var(--color-bg-card); padding: var(--space-sm); border-radius: var(--radius-md); }
.custom-input-group textarea:focus { border-color: var(--color-text-primary); outline: none; }
.question-nav { display: flex; justify-content: flex-start; }
.complete-section { max-width: 600px; margin: 0 auto; }
.complete-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-2xl); text-align: center; }
.complete-icon { font-size: 48px; margin-bottom: var(--space-md); }
.complete-card h3 { font-size: var(--text-xl); margin-bottom: var(--space-sm); color: var(--color-text-primary); }
.complete-card > p { color: var(--color-text-secondary); margin-bottom: var(--space-lg); }
.answers-preview { text-align: left; background: var(--color-bg-tertiary); border-radius: var(--radius-lg); padding: var(--space-md); margin-bottom: var(--space-xl); max-height: 200px; overflow-y: auto; border: 1px solid var(--color-border); }
.answer-item { display: flex; gap: var(--space-md); padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); }
.answer-item:last-child { border-bottom: none; }
.q-num { font-size: var(--text-xs); padding: 2px 6px; background: var(--color-text-primary); color: white; border-radius: var(--radius-sm); }
.a-text { font-size: var(--text-sm); color: var(--color-text-secondary); flex: 1; }
.complete-actions { display: flex; justify-content: center; gap: var(--space-md); }
.report-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
.report-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg) var(--space-xl); background: var(--color-bg-tertiary); border-bottom: 1px solid var(--color-border); }
.report-header h3 { font-size: var(--text-lg); margin: 0; color: var(--color-text-primary); }
.report-content { padding: var(--space-xl); }
.report-block { margin-bottom: var(--space-xl); }
.report-block:last-child { margin-bottom: 0; }
.report-block h4 { font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-sm); color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.5px; }
.report-block p { color: var(--color-text-secondary); line-height: 1.7; margin: 0; }
.key-points { margin: 0; padding-left: var(--space-lg); }
.key-points li { color: var(--color-text-secondary); margin-bottom: var(--space-xs); line-height: 1.6; }
.focus-tags { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.focus-tag { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: var(--text-sm); color: var(--color-text-secondary); background: transparent; }
.report-footer { display: flex; justify-content: space-between; padding: var(--space-lg) var(--space-xl); border-top: 1px solid var(--color-border); background: var(--color-bg-tertiary); }

@media (max-width: 640px) {
  .step-header { margin-bottom: var(--space-xl); }
  .step-title { font-size: var(--text-xl); }
  
  .question-card { padding: var(--space-lg); }
  .question-text { font-size: var(--text-lg); margin-bottom: var(--space-lg); }
  
  .custom-input-group { flex-direction: column; }
  .custom-input-group .btn { width: 100%; }
  
  .complete-card { padding: var(--space-xl); }
  .complete-actions { flex-direction: column; }
  .complete-actions .btn { width: 100%; }
  
  .report-header { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
  .report-header .btn { align-self: flex-end; }
  
  .report-content { padding: var(--space-lg); }
  
  .report-footer { flex-direction: column; gap: var(--space-md); }
  .report-footer .btn { width: 100%; }
}
</style>
