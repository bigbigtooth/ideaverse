<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThinkingStore } from '../../stores/thinking'
import { THINKING_MODELS } from '../../services/ai'
import MarkdownViewer from '../common/MarkdownViewer.vue'

const store = useThinkingStore()

const showReport = ref(false)
const editingReport = ref(false)
const reportContent = ref('')
const editingCardId = ref(null)
const editingCardContent = ref({})
const showModelSelector = ref(true)
const selectedDimension = ref(null)

const analysisCards = computed(() => store.currentSession?.analysisCards || [])
const thinkingModel = computed(() => store.currentSession?.thinkingModel || '')
const thinkingModelId = computed(() => store.currentSession?.thinkingModelId || '')
const recommendedModels = computed(() => store.currentSession?.recommendedModels || [])
const modelReasons = computed(() => store.currentSession?.modelReasons || {})
const deepAnalysisReport = computed(() => store.currentSession?.deepAnalysisReport || '')

const recommendedModelDetails = computed(() => {
  return recommendedModels.value.map(id => ({
    ...THINKING_MODELS[id],
    reason: modelReasons.value[id] || ''
  })).filter(m => m.id)
})

const currentModel = computed(() => THINKING_MODELS[thinkingModelId.value] || null)

onMounted(async () => {
  reportContent.value = deepAnalysisReport.value
  if (analysisCards.value.length > 0) {
    showModelSelector.value = false
  } else if (recommendedModels.value.length === 0) {
    await store.recommendModels()
  }
})

async function selectModel(modelId) {
  showModelSelector.value = false
  await store.analyzeWithModel(modelId)
  reportContent.value = store.currentSession?.deepAnalysisReport || ''
}

async function switchModel() {
  showModelSelector.value = true
  selectedDimension.value = null
  if (recommendedModels.value.length === 0) {
    await store.recommendModels()
  }
}

function selectDimension(card) {
  selectedDimension.value = selectedDimension.value === card.id ? null : card.id
}

function startEditCard(card) {
  editingCardId.value = card.id
  editingCardContent.value = { ...card }
}

function saveCardEdit() {
  store.updateAnalysisCard(editingCardId.value, editingCardContent.value)
  editingCardId.value = null
}

function cancelCardEdit() { editingCardId.value = null }

async function reanalyzeCard(cardId) {
  await store.reanalyzeCard(cardId, '')
}

function deleteCard(cardId) {
  if (confirm('确定删除这个分析维度？')) store.deleteAnalysisCard(cardId)
}

async function showAnalysisReport() {
  if (!deepAnalysisReport.value) {
    await store.generateFullReport()
  }
  reportContent.value = store.currentSession?.deepAnalysisReport || ''
  showReport.value = true
}

function editReport() { editingReport.value = true }

function saveReport() {
  store.updateCurrentSession({ deepAnalysisReport: reportContent.value })
  editingReport.value = false
}

function confirmAndNext() { store.confirmAnalysisReport() }
function goBack() { store.updateCurrentSession({ currentStep: 1 }) }
</script>

<template>
  <div class="step2">
    <div class="step-header">
      <h2 class="step-title"><span>🔍</span> 步骤二：深度分析</h2>
      <p class="step-desc">运用科学的思维模型，多维度深入剖析问题本质</p>
    </div>
    
    <!-- 思维模型选择器 -->
    <div v-if="showModelSelector" class="model-selector">
      <div class="selector-header">
        <div class="selector-icon">🧠</div>
        <div>
          <h3>选择思维模型</h3>
          <p>AI 根据你的问题智能推荐了以下思维模型</p>
        </div>
      </div>
      
      <div v-if="recommendedModelDetails.length === 0" class="loading-models">
        <div class="loading-spinner"></div>
        <span>正在分析最佳思维模型...</span>
      </div>
      
      <div v-else class="model-grid">
        <div v-for="model in recommendedModelDetails" :key="model.id" 
             class="model-card" @click="selectModel(model.id)">
          <div class="model-badge">推荐</div>
          <div class="model-icon-large">{{ model.icon }}</div>
          <h4 class="model-name">{{ model.name }}</h4>
          <p class="model-desc">{{ model.description }}</p>
          <div class="model-advantage">
            <span class="advantage-icon">✨</span>
            <span>{{ model.advantage }}</span>
          </div>
          <div v-if="model.reason" class="model-reason">
            <span class="reason-icon">💡</span>
            <span>{{ model.reason }}</span>
          </div>
          <div class="model-tags">
            <span v-for="tag in model.bestFor" :key="tag" class="model-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分析内容区 -->
    <div v-else-if="!showReport" class="analysis-section">
      <!-- 当前模型展示 -->
      <div class="current-model-banner">
        <div class="model-info-compact">
          <span class="model-icon-sm">{{ currentModel?.icon }}</span>
          <div class="model-text">
            <div class="model-label">当前思维模型</div>
            <div class="model-name-lg">{{ thinkingModel }}</div>
          </div>
        </div>
        <div class="model-meta">
          <span class="model-advantage-text">{{ currentModel?.advantage }}</span>
          <button class="btn-switch" @click="switchModel">
            <span>🔄</span>
            <span>切换模型</span>
          </button>
        </div>
      </div>
      
      <!-- 分析维度总览 -->
      <div class="dimensions-overview">
        <h3 class="overview-title">
          <span>📊</span>
          <span>多维度分析</span>
          <span class="count-badge">{{ analysisCards.length }} 个维度</span>
        </h3>
        
        <div class="dimensions-grid">
          <div v-for="card in analysisCards" :key="card.id" 
               class="dimension-card"
               :class="{ active: selectedDimension === card.id }"
               @click="selectDimension(card)">
            <div class="dimension-header">
              <div class="dimension-icon">{{ card.icon }}</div>
              <h4 class="dimension-title">{{ card.dimension }}</h4>
              <div class="dimension-actions">
                <button class="action-btn" @click.stop="startEditCard(card)" title="编辑">
                  <span>✏️</span>
                </button>
                <button class="action-btn" @click.stop="reanalyzeCard(card.id)" title="重新分析">
                  <span>🔄</span>
                </button>
                <button class="action-btn danger" @click.stop="deleteCard(card.id)" title="删除">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
            
            <!-- 编辑模式 -->
            <div v-if="editingCardId === card.id" class="dimension-edit" @click.stop>
              <div class="edit-section">
                <label>📌 现象描述</label>
                <textarea v-model="editingCardContent.phenomenon" class="edit-textarea" rows="2"></textarea>
              </div>
              <div class="edit-section">
                <label>🔗 原因分析</label>
                <textarea v-model="editingCardContent.cause" class="edit-textarea" rows="2"></textarea>
              </div>
              <div class="edit-section">
                <label>💥 影响评估</label>
                <textarea v-model="editingCardContent.impact" class="edit-textarea" rows="2"></textarea>
              </div>
              <div class="edit-section">
                <label>🔮 隐藏因素</label>
                <textarea v-model="editingCardContent.hiddenFactors" class="edit-textarea" rows="2"></textarea>
              </div>
              <div class="edit-actions">
                <button class="btn btn-ghost btn-sm" @click.stop="cancelCardEdit">取消</button>
                <button class="btn btn-primary btn-sm" @click.stop="saveCardEdit">保存</button>
              </div>
            </div>
            
            <!-- 查看模式 -->
            <div v-else class="dimension-content">
              <!-- 加载中状态 -->
              <div v-if="card.status === 'pending' || card.status === 'analyzing'" class="dimension-loading">
                <div class="loading-spinner"></div>
                <span>{{ card.status === 'analyzing' ? '正在分析...' : '等待分析...' }}</span>
                <p v-if="card.description" class="loading-desc">{{ card.description }}</p>
              </div>

              <!-- 完成状态 -->
              <template v-else>
                <div class="content-section">
                  <div class="section-label">📌 现象</div>
                  <MarkdownViewer :content="card.phenomenon" class="section-text" />
                </div>
                
                <div class="content-section">
                  <div class="section-label">🔗 原因</div>
                  <MarkdownViewer :content="card.cause" class="section-text" />
                </div>
                
                <Transition name="expand">
                  <div v-if="selectedDimension === card.id" class="expanded-content">
                    <div class="content-section">
                      <div class="section-label">💥 影响</div>
                      <MarkdownViewer :content="card.impact" class="section-text" />
                    </div>
                    
                    <div class="content-section">
                      <div class="section-label">🔮 隐藏因素</div>
                      <MarkdownViewer :content="card.hiddenFactors" class="section-text" />
                    </div>
                  </div>
                </Transition>
                
                <Transition name="fade">
                  <div v-if="selectedDimension !== card.id" class="expand-hint">点击查看更多详情</div>
                </Transition>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions-bar">
        <button class="btn btn-ghost" @click="goBack" :disabled="store.loading">
          <span>←</span>
          <span>返回上一步</span>
        </button>
        <button class="btn btn-primary btn-lg" @click="showAnalysisReport" :disabled="store.loading || analysisCards.some(c => c.status !== 'completed')">
          <span>{{ (store.loading || analysisCards.some(c => c.status !== 'completed')) ? '正在分析...' : '查看完整报告' }}</span>
          <span>→</span>
        </button>
      </div>
    </div>
    
    <!-- 报告展示 -->
    <div v-else class="report-section">
      <div class="report-card">
        <div class="report-header">
          <h3>📊 深度分析报告</h3>
          <div class="report-actions">
            <button class="btn btn-sm btn-ghost" @click="showReport = false">← 返回</button>
            <button v-if="!editingReport" class="btn btn-sm btn-ghost" @click="editReport">✏️ 编辑</button>
            <button v-else class="btn btn-sm btn-primary" @click="saveReport">💾 保存</button>
          </div>
        </div>
        <div class="report-content">
          <textarea v-if="editingReport" v-model="reportContent" class="report-editor" rows="20"></textarea>
          <MarkdownViewer v-else :content="reportContent" />
        </div>
        <div class="report-footer">
          <button class="btn btn-ghost" @click="goBack">← 返回上一步</button>
          <button class="btn btn-primary btn-lg" @click="confirmAndNext">生成解决方案 →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step2 { max-width: 1100px; margin: 0 auto; }
.step-header { text-align: center; margin-bottom: var(--space-2xl); }
.step-title { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); font-size: var(--text-2xl); margin-bottom: var(--space-sm); }
.step-desc { color: var(--color-text-secondary); font-size: var(--text-base); }

/* Loading State for Dimension Cards */
.dimension-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-2xl); gap: var(--space-md); color: var(--color-text-secondary); }
.loading-spinner { width: 32px; height: 32px; border: 3px solid var(--color-bg-tertiary); border-top-color: var(--color-accent-primary); border-radius: 50%; animation: spin 1s linear infinite; }
.loading-desc { font-size: var(--text-sm); color: var(--color-text-muted); text-align: center; max-width: 80%; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Model Selector */
.model-selector { }
.selector-header { display: flex; align-items: center; gap: var(--space-lg); padding: var(--space-xl); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); margin-bottom: var(--space-xl); }
.selector-icon { font-size: 48px; /* filter: grayscale(1); Removed */ }
.selector-header h3 { font-size: var(--text-2xl); margin-bottom: var(--space-xs); }
.selector-header p { color: var(--color-text-muted); margin: 0; }
.loading-models { display: flex; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-3xl); color: var(--color-text-muted); }

.model-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-lg); }
.model-card { position: relative; padding: var(--space-xl); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.model-card:hover { border-color: var(--color-border-hover); transform: translateY(-4px); box-shadow: var(--shadow-md); }
.model-badge { position: absolute; top: var(--space-md); right: var(--space-md); padding: 4px 12px; background: var(--color-text-primary); color: var(--color-bg-card); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 600; }
.model-icon-large { font-size: 56px; text-align: center; margin: var(--space-lg) 0; /* filter: grayscale(1); Removed */ }
.model-name { font-size: var(--text-xl); font-weight: 600; text-align: center; margin-bottom: var(--space-sm); color: var(--color-text-primary); }
.model-desc { font-size: var(--text-sm); color: var(--color-text-secondary); text-align: center; margin-bottom: var(--space-md); line-height: 1.6; }
.model-advantage { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: var(--color-bg-tertiary); border-radius: var(--radius-md); margin-bottom: var(--space-sm); }
.advantage-icon { font-size: 16px; flex-shrink: 0; /* filter: grayscale(1); Removed */ }
.model-advantage span:last-child { font-size: var(--text-sm); color: var(--color-text-primary); line-height: 1.5; font-weight: 500; }
.model-reason { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border: 1px dashed var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-md); }
.reason-icon { font-size: 16px; flex-shrink: 0; filter: grayscale(1); /* Keep greyscale for reason icon maybe? No, remove all per user request */ }
.model-reason span:last-child { font-size: var(--text-sm); color: var(--color-text-secondary); line-height: 1.5; }
.model-tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); justify-content: center; }
.model-tag { padding: 4px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: var(--text-xs); color: var(--color-text-secondary); background: transparent; }

/* Current Model Banner */
.current-model-banner { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); margin-bottom: var(--space-2xl); }
.model-info-compact { display: flex; align-items: center; gap: var(--space-md); }
.model-icon-sm { font-size: 36px; /* filter: grayscale(1); Removed */ }
.model-text { }
.model-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
.model-name-lg { font-size: var(--text-xl); font-weight: 700; color: var(--color-text-primary); }
.model-meta { display: flex; align-items: center; gap: var(--space-lg); }
.model-advantage-text { font-size: var(--text-sm); color: var(--color-text-secondary); max-width: 300px; }
.btn-switch { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); background: white; color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-switch:hover { background: var(--color-text-primary); color: white; border-color: var(--color-text-primary); transform: translateY(-2px); }

/* Dimensions Overview */
.dimensions-overview { }
.overview-title { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--text-xl); margin-bottom: var(--space-xl); }
.count-badge { padding: 4px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: var(--text-sm); color: var(--color-text-secondary); margin-left: auto; background: var(--color-bg-tertiary); }

.dimensions-grid { display: flex; flex-direction: column; gap: var(--space-lg); margin-bottom: var(--space-2xl); }
.dimension-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; transition: all 0.2s; cursor: pointer; }
.dimension-card:hover { border-color: var(--color-border-hover); transform: translateX(4px); }
.dimension-card.active { border-color: var(--color-border-active); box-shadow: var(--shadow-md); border-width: 2px; }

.dimension-header { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-lg); background: transparent; border-bottom: 1px solid var(--color-border); }
.dimension-icon { font-size: var(--text-2xl); /* filter: grayscale(1); Removed */ }
.dimension-title { flex: 1; font-size: var(--text-lg); font-weight: 600; margin: 0; color: var(--color-text-primary); }
.dimension-actions { display: flex; gap: var(--space-xs); }
.action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; color: var(--color-text-secondary); }
.action-btn:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); border-color: var(--color-border); }
.action-btn.danger:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

.dimension-edit { padding: var(--space-lg); background: var(--color-bg-tertiary); }
.edit-section { margin-bottom: var(--space-md); }
.edit-section label { display: block; font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary); margin-bottom: var(--space-xs); }
.edit-textarea { width: 100%; padding: var(--space-sm); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-sans); font-size: var(--text-sm); resize: vertical; }
.edit-textarea:focus { outline: none; border-color: var(--color-accent-primary); }
.edit-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); }

.dimension-content { padding: var(--space-lg); }
.content-section { margin-bottom: var(--space-md); padding: var(--space-md); background: var(--color-bg-tertiary); border-radius: var(--radius-md); border: 1px solid transparent; }
.content-section:last-child { margin-bottom: 0; }
.section-label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-xs); text-transform: uppercase; letter-spacing: 0.5px; }
.section-text { font-size: var(--text-base); color: var(--color-text-secondary); line-height: 1.7; margin: 0; }

.expanded-content { margin-top: var(--space-sm); padding-top: var(--space-md); border-top: 1px dashed var(--color-border); }
.expand-hint { text-align: center; padding: var(--space-sm); color: var(--color-text-muted); font-size: var(--text-sm); font-style: italic; }

/* Actions Bar */
.actions-bar { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-lg); }

/* Report */
.report-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
.report-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-lg) var(--space-xl); background: var(--color-bg-tertiary); border-bottom: 1px solid var(--color-border); }
.report-header h3 { margin: 0; font-size: var(--text-xl); }
.report-actions { display: flex; gap: var(--space-sm); }
.report-content { padding: var(--space-xl); max-height: 600px; overflow-y: auto; }
.report-editor { width: 100%; padding: var(--space-md); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-mono); font-size: var(--text-sm); resize: vertical; }
.report-editor:focus { outline: none; border-color: var(--color-accent-primary); }
.report-text { line-height: 1.9; color: var(--color-text-secondary); }
.report-footer { display: flex; justify-content: space-between; padding: var(--space-lg) var(--space-xl); border-top: 1px solid var(--color-border); background: var(--color-bg-tertiary); }

@media (max-width: 768px) {
  .model-grid { grid-template-columns: 1fr; }
  .current-model-banner { flex-direction: column; gap: var(--space-md); }
  .model-meta { flex-direction: column; align-items: flex-start; width: 100%; }
  .model-advantage-text { max-width: 100%; }
  
  .step-header { margin-bottom: var(--space-xl); }
  .step-title { font-size: var(--text-xl); }
  
  .selector-header { flex-direction: column; text-align: center; gap: var(--space-md); }
  .selector-icon { margin-bottom: var(--space-sm); }
  
  .actions-bar { flex-direction: column; gap: var(--space-md); }
  .actions-bar .btn { width: 100%; justify-content: center; }
  
  .report-header { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
  .report-actions { width: 100%; justify-content: flex-end; }
  
  .report-footer { flex-direction: column; gap: var(--space-md); }
  .report-footer .btn { width: 100%; justify-content: center; }
  
  .dimension-header { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
  .dimension-actions { width: 100%; justify-content: flex-end; margin-top: var(--space-sm); }
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active { transition: all 0.4s ease-in-out; overflow: hidden; max-height: 1000px; opacity: 1; }
.expand-enter-from,
.expand-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; margin-bottom: 0; border-top-width: 0; }

/* 提示淡入淡出 */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
