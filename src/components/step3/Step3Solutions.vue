<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThinkingStore } from '../../stores/thinking'
import MarkdownViewer from '../common/MarkdownViewer.vue'
import {
  Lightbulb,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  RefreshCw,
  Clock,
  Package,
  AlertTriangle,
  Shield,
  Clipboard,
  Edit3,
  ArrowLeft,
  Network,
  Copy,
  Download,
  PartyPopper
} from 'lucide-vue-next'

const store = useThinkingStore()

const showMindMap = ref(false)
const mindMapContent = ref('')
const editingSolutionId = ref(null)
const editingContent = ref({})
const expandedCardId = ref(null)

const solutions = computed(() => store.currentSession?.solutions || [])
const recommendation = computed(() => store.currentSession?.recommendation)

onMounted(async () => {
  if (solutions.value.length === 0) {
    await store.generateSolutions()
  }
})

function getScoreClass(score) {
  if (score >= 7) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

function getProgressWidth(score) {
  return `${score * 10}%`
}

function toggleExpand(id) {
  expandedCardId.value = expandedCardId.value === id ? null : id
}

function startEditSolution(solution) {
  editingSolutionId.value = solution.id
  editingContent.value = { ...solution }
}

function saveEdit() {
  store.updateSolution(editingSolutionId.value, editingContent.value)
  editingSolutionId.value = null
}

function cancelEdit() {
  editingSolutionId.value = null
}

async function regenerate(id) {
  await store.regenerateSolution(id, '')
}

async function generateMindMapAndShow() {
  await store.generateMindMap()
  mindMapContent.value = store.currentSession?.mindMap || ''
  showMindMap.value = true
}

function copyMindMap() {
  navigator.clipboard.writeText(mindMapContent.value)
  alert('已复制到剪贴板')
}

function downloadMindMap() {
  const blob = new Blob([mindMapContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '深度思考-思维导图.md'
  a.click()
  URL.revokeObjectURL(url)
}

function goBack() {
  store.updateCurrentSession({ currentStep: 2 })
}
</script>

<template>
  <div class="step3">
    <div class="step-header">
      <h2 class="step-title">
        <Lightbulb class="title-icon" :size="32" stroke-width="2.5" /> 
        步骤三：方案评估
      </h2>
      <p class="step-desc">头脑风暴生成方案，结构化评估找到最优解</p>
    </div>
    
    <div v-if="!showMindMap">
      <!-- 加载中 -->
      <div v-if="solutions.length === 0 && store.loading" class="loading-section">
        <div class="loading-spinner"></div>
        <span>正在生成创新解决方案...</span>
      </div>

      <!-- 推荐方案横幅 -->
      <div v-else-if="recommendation" class="recommendation-banner">
        <div class="rec-badge"><Trophy :size="16" /> 推荐方案</div>
        <div class="rec-info">
          <h3 class="rec-name">{{ solutions.find(s => s.id === recommendation.bestSolution)?.name }}</h3>
          <p class="rec-reason">{{ recommendation.reason }}</p>
        </div>
      </div>
      
      <!-- 方案卡片列表（单列布局） -->
      <div class="solutions-list">
        <div v-for="(solution, index) in solutions" :key="solution.id" 
             class="solution-card" 
             :class="{ recommended: solution.id === recommendation?.bestSolution, expanded: expandedCardId === solution.id }">
          
          <!-- 卡片头部 -->
          <div class="card-header" @click="toggleExpand(solution.id)">
            <div class="header-left">
              <span class="solution-index">方案 {{ index + 1 }}</span>
              <h3 class="solution-name">{{ solution.name }}</h3>
              <span v-if="solution.id === recommendation?.bestSolution" class="best-tag"><Sparkles :size="12" /> 最佳</span>
            </div>
            <div class="header-right">
              <div class="total-score" :class="getScoreClass(solution.weightedScore)">
                <span class="score-value">{{ solution.weightedScore?.toFixed(1) }}</span>
                <span class="score-label">综合评分</span>
              </div>
              <span class="expand-icon">
                <ChevronDown v-if="expandedCardId === solution.id" :size="20" />
                <ChevronRight v-else :size="20" />
              </span>
            </div>
          </div>
          
          <!-- 方案描述 -->
          <div class="card-description">
            <p class="description-text">{{ solution.description }}</p>
          </div>
          
          <!-- 评分指标 -->
          <div class="metrics-section">
            <div class="metric-bar">
              <div class="metric-header">
                <span class="metric-name"><Target :size="14" /> 有效性</span>
                <span class="metric-score" :class="getScoreClass(solution.effectiveness)">{{ solution.effectiveness }}/10</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill effectiveness" :style="{ width: getProgressWidth(solution.effectiveness) }"></div>
              </div>
            </div>
            <div class="metric-bar">
              <div class="metric-header">
                <span class="metric-name"><Zap :size="14" /> 可行性</span>
                <span class="metric-score" :class="getScoreClass(solution.feasibility)">{{ solution.feasibility }}/10</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill feasibility" :style="{ width: getProgressWidth(solution.feasibility) }"></div>
              </div>
            </div>
            <div class="metric-bar">
              <div class="metric-header">
                <span class="metric-name"><RefreshCw :size="14" /> 可持续性</span>
                <span class="metric-score" :class="getScoreClass(solution.sustainability)">{{ solution.sustainability }}/10</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill sustainability" :style="{ width: getProgressWidth(solution.sustainability) }"></div>
              </div>
            </div>
          </div>

          <!-- 展开提示按钮 -->
          <div v-if="expandedCardId !== solution.id && editingSolutionId !== solution.id" 
               class="expand-hint" 
               @click.stop="toggleExpand(solution.id)">
            <span>查看完整方案详情</span>
            <ChevronDown class="icon" :size="16" />
          </div>
          
          <!-- 编辑模式 -->
          <div v-if="editingSolutionId === solution.id" class="edit-section">
            <div class="edit-field">
              <label>方案描述</label>
              <textarea v-model="editingContent.description" class="edit-textarea" rows="4"></textarea>
            </div>
            <div class="edit-field">
              <label>实施步骤</label>
              <textarea v-model="editingContent.implementation" class="edit-textarea" rows="4"></textarea>
            </div>
            <div class="edit-actions">
              <button class="btn btn-ghost" @click="cancelEdit">取消</button>
              <button class="btn btn-primary" @click="saveEdit">保存修改</button>
            </div>
          </div>
          
          <!-- 展开的详细信息 -->
          <Transition name="expand">
            <div v-if="expandedCardId === solution.id" class="expanded-details">
              <div class="details-grid">
                <div class="detail-card">
                  <Clock class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>实施周期</h4>
                    <p>{{ solution.timeframe }}</p>
                  </div>
                </div>
                <div class="detail-card">
                  <Package class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>所需资源</h4>
                    <p>{{ solution.resources }}</p>
                  </div>
                </div>
                <div class="detail-card warning">
                  <AlertTriangle class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>最坏情况</h4>
                    <p>{{ solution.worstCase }}</p>
                  </div>
                </div>
                <div class="detail-card success">
                  <Shield class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>应对策略</h4>
                    <p>{{ solution.countermeasure }}</p>
                  </div>
                </div>
              </div>
              
              <div v-if="solution.implementation" class="implementation-section">
                <h4><Clipboard :size="16" /> 实施步骤</h4>
                <div class="implementation-content">
                  <MarkdownViewer :content="solution.implementation" />
                </div>
              </div>
            </div>
          </Transition>
          
          <!-- 卡片操作按钮 -->
          <div class="card-actions">
            <button class="action-btn" @click.stop="startEditSolution(solution)">
              <Edit3 :size="14" />
              <span>编辑方案</span>
            </button>
            <button class="action-btn" @click.stop="regenerate(solution.id)">
              <RefreshCw :size="14" />
              <span>重新生成</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bottom-actions">
        <button class="btn btn-ghost btn-lg" @click="goBack">
          <ArrowLeft :size="16" />
          <span>返回上一步</span>
        </button>
        <button class="btn btn-primary btn-lg" @click="generateMindMapAndShow">
          <Network :size="16" />
          <span>生成思维导图</span>
        </button>
      </div>
    </div>
    
    <!-- 思维导图展示 -->
    <div v-else class="mindmap-section">
      <div class="mindmap-card">
        <div class="mindmap-header">
          <div class="mindmap-title">
            <Network class="mindmap-icon" :size="24" />
            <h3>深度思考思维导图</h3>
          </div>
          <div class="mindmap-actions">
            <button class="btn btn-ghost" @click="showMindMap = false">
              <ArrowLeft :size="14" /> 返回
            </button>
            <button class="btn btn-secondary" @click="copyMindMap">
              <Copy :size="14" /> 复制
            </button>
            <button class="btn btn-primary" @click="downloadMindMap">
              <Download :size="14" /> 下载
            </button>
          </div>
        </div>
        <div class="mindmap-content">
          <MarkdownViewer :content="mindMapContent" />
        </div>
        <div class="mindmap-footer">
          <PartyPopper class="complete-badge-icon" :size="48" />
          <h3>恭喜！你已完成本次深度思考</h3>
          <p>思维导图已生成，可以复制或下载保存</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step3 { max-width: 900px; margin: 0 auto; }

.step-header { text-align: center; margin-bottom: var(--space-2xl); }
.step-title { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); font-size: var(--text-2xl); margin-bottom: var(--space-sm); }
.step-desc { color: var(--color-text-secondary); font-size: var(--text-lg); }

/* 推荐方案横幅 */
.recommendation-banner { display: flex; align-items: center; gap: var(--space-xl); padding: var(--space-xl); background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border: 2px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-xl); margin-bottom: var(--space-2xl); }
.rec-badge { padding: var(--space-sm) var(--space-lg); background: var(--color-accent-emerald); color: white; border-radius: var(--radius-full); font-weight: 600; font-size: var(--text-sm); white-space: nowrap; }
.rec-info { flex: 1; }
.rec-name { font-size: var(--text-xl); font-weight: 700; margin: 0 0 var(--space-xs); color: var(--color-text-primary); }
.rec-reason { font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; line-height: 1.6; }

/* 方案卡片列表 */
.solutions-list { display: flex; flex-direction: column; gap: var(--space-xl); margin-bottom: var(--space-2xl); }

.solution-card { background: var(--color-bg-card); border: 2px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; transition: all 0.3s; }
.solution-card:hover { border-color: var(--color-border-hover); }
.solution-card.recommended { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 0 30px rgba(16, 185, 129, 0.15); }
.solution-card.expanded { box-shadow: var(--shadow-lg); }

/* 卡片头部 */
.card-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-xl); background: rgba(99, 102, 241, 0.05); cursor: pointer; transition: background 0.2s; }
.card-header:hover { background: rgba(99, 102, 241, 0.1); }
.header-left { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
.solution-index { font-size: var(--text-sm); color: var(--color-text-muted); padding: var(--space-xs) var(--space-md); background: var(--color-bg-tertiary); border-radius: var(--radius-full); }
.solution-name { font-size: var(--text-xl); font-weight: 700; margin: 0; color: var(--color-text-primary); }
.best-tag { font-size: var(--text-sm); color: var(--color-accent-emerald); font-weight: 500; }
.header-right { display: flex; align-items: center; gap: var(--space-lg); }
.total-score { text-align: center; padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-lg); }
.total-score.high { background: rgba(16, 185, 129, 0.15); }
.total-score.medium { background: rgba(245, 158, 11, 0.15); }
.total-score.low { background: rgba(244, 63, 94, 0.15); }
.score-value { display: block; font-size: var(--text-2xl); font-weight: 700; }
.total-score.high .score-value { color: var(--color-accent-emerald); }
.total-score.medium .score-value { color: var(--color-accent-gold); }
.total-score.low .score-value { color: var(--color-accent-rose); }
.score-label { font-size: var(--text-xs); color: var(--color-text-muted); }
.expand-icon { font-size: var(--text-sm); color: var(--color-text-muted); transition: transform 0.2s; }

/* 方案描述 */
.card-description { padding: var(--space-lg) var(--space-xl); border-bottom: 1px solid var(--color-border); }
.description-text { font-size: var(--text-lg); line-height: 1.8; color: var(--color-text-secondary); margin: 0; }

/* 评分指标 */
.metrics-section { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-lg); }
.metric-bar { }
.metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); }
.metric-name { font-size: var(--text-base); color: var(--color-text-secondary); }
.metric-score { font-size: var(--text-base); font-weight: 600; }
.metric-score.high { color: var(--color-accent-emerald); }
.metric-score.medium { color: var(--color-accent-gold); }
.metric-score.low { color: var(--color-accent-rose); }
.progress-bar { height: 10px; background: var(--color-bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
.progress-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.5s ease-out; }
.progress-fill.effectiveness { background: linear-gradient(90deg, #10b981, #34d399); }
.progress-fill.feasibility { background: linear-gradient(90deg, #6366f1, #818cf8); }
.progress-fill.sustainability { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

/* 编辑区域 */
.edit-section { padding: var(--space-xl); background: var(--color-bg-tertiary); }
.edit-field { margin-bottom: var(--space-lg); }
.edit-field label { display: block; font-size: var(--text-base); font-weight: 600; color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
.edit-textarea { width: 100%; padding: var(--space-md); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-sans); font-size: var(--text-base); line-height: 1.6; resize: vertical; }
.edit-textarea:focus { outline: none; border-color: var(--color-accent-primary); }
.edit-actions { display: flex; justify-content: flex-end; gap: var(--space-md); }

/* 展开的详细信息 */
.expanded-details { padding: var(--space-xl); background: rgba(99, 102, 241, 0.03); border-top: 1px solid var(--color-border); }
.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); margin-bottom: var(--space-xl); }
.detail-card { display: flex; gap: var(--space-md); padding: var(--space-lg); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.detail-card.warning { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
.detail-card.success { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); }
.detail-icon { font-size: var(--text-2xl); }
.detail-content h4 { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0 0 var(--space-xs); font-weight: 500; }
.detail-content p { font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.implementation-section { padding: var(--space-lg); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.implementation-section h4 { font-size: var(--text-lg); margin: 0 0 var(--space-md); color: var(--color-text-primary); }
.implementation-content { font-size: var(--text-base); }

/* 卡片操作 */
.card-actions { display: flex; gap: var(--space-md); padding: var(--space-lg) var(--space-xl); border-top: 1px solid var(--color-border); }
.action-btn { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-secondary); font-size: var(--text-base); cursor: pointer; transition: all 0.2s; }
.action-btn:hover { background: var(--color-bg-tertiary); border-color: var(--color-accent-primary); color: var(--color-text-primary); }

/* 底部操作 */
.bottom-actions { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-lg); }
.btn-lg { padding: var(--space-md) var(--space-xl); font-size: var(--text-lg); }

/* 思维导图 */
.mindmap-section { }
.mindmap-card { background: var(--color-bg-card); border: 2px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
.mindmap-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-xl); background: rgba(99, 102, 241, 0.1); border-bottom: 1px solid var(--color-border); }
.mindmap-title { display: flex; align-items: center; gap: var(--space-md); }
.mindmap-icon { font-size: var(--text-2xl); }
.mindmap-title h3 { font-size: var(--text-xl); margin: 0; }
.mindmap-actions { display: flex; gap: var(--space-md); }
.mindmap-content { padding: var(--space-2xl); min-height: 400px; max-height: 600px; overflow-y: auto; }
.mindmap-footer { padding: var(--space-2xl); border-top: 1px solid var(--color-border); text-align: center; background: rgba(16, 185, 129, 0.05); }
.complete-badge { font-size: 48px; margin-bottom: var(--space-md); }
.mindmap-footer h3 { font-size: var(--text-xl); color: var(--color-accent-emerald); margin: 0 0 var(--space-sm); }
.mindmap-footer p { color: var(--color-text-secondary); margin: 0; }

/* 推荐方案横幅 */
.recommendation-banner { display: flex; align-items: center; gap: var(--space-xl); padding: var(--space-xl); background: var(--color-bg-card); border: 2px solid var(--color-border); border-radius: var(--radius-xl); margin-bottom: var(--space-2xl); }
.rec-badge { padding: var(--space-sm) var(--space-lg); background: var(--color-text-primary); color: var(--color-bg-card); border-radius: var(--radius-full); font-weight: 600; font-size: var(--text-sm); white-space: nowrap; }
.rec-info { flex: 1; }
.rec-name { font-size: var(--text-xl); font-weight: 700; margin: 0 0 var(--space-xs); color: var(--color-text-primary); }
.rec-reason { font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; line-height: 1.6; }

/* 方案卡片列表 */
.solutions-list { display: flex; flex-direction: column; gap: var(--space-xl); margin-bottom: var(--space-2xl); }

.solution-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; transition: all 0.3s; }
.solution-card:hover { border-color: var(--color-border-hover); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.solution-card.recommended { border: 2px solid var(--color-text-primary); }
.solution-card.expanded { box-shadow: var(--shadow-md); }

/* 卡片头部 */
.card-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) var(--space-xl); background: transparent; cursor: pointer; transition: background 0.2s; min-height: 72px; }
.card-header:hover { background: var(--color-bg-tertiary); }
.header-left { display: flex; align-items: center; gap: var(--space-md); flex: 1; min-width: 0; }
.solution-index { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); white-space: nowrap; }
.solution-name { font-size: var(--text-lg); font-weight: 700; margin: 0; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.best-tag { font-size: var(--text-xs); color: var(--color-text-primary); font-weight: 600; border: 1px solid var(--color-text-primary); padding: 1px 6px; border-radius: var(--radius-sm); white-space: nowrap; }
.header-right { display: flex; align-items: center; gap: var(--space-lg); margin-left: var(--space-lg); flex-shrink: 0; }
.total-score { text-align: center; padding: 4px 12px; border-radius: var(--radius-md); border: 1px solid transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; background: rgba(0,0,0,0.03); }
.score-value { display: block; font-size: var(--text-xl); font-weight: 700; color: var(--color-text-primary); line-height: 1.2; }
.score-label { font-size: 10px; color: var(--color-text-muted); line-height: 1.2; }
.expand-icon { font-size: var(--text-sm); color: var(--color-text-muted); transition: transform 0.2s; padding: 4px; }

/* 方案描述 */
.card-description { padding: var(--space-lg) var(--space-xl); border-bottom: 1px solid var(--color-border); border-top: 1px solid var(--color-border); }
.description-text { font-size: var(--text-lg); line-height: 1.8; color: var(--color-text-secondary); margin: 0; }

/* 评分指标 */
.metrics-section { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-lg); }
.metric-bar { }
.metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); }
.metric-name { font-size: var(--text-base); color: var(--color-text-secondary); }
.metric-score { font-size: var(--text-base); font-weight: 600; color: var(--color-text-primary); }
.progress-bar { height: 6px; background: var(--color-bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
/* 保持低饱和度的进度条颜色以区分维度，或者统一用黑色 */
.progress-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.5s ease-out; }
.progress-fill.effectiveness { background: #555; }
.progress-fill.feasibility { background: #777; }
.progress-fill.sustainability { background: #999; }

/* 编辑区域 */
.edit-section { padding: var(--space-xl); background: var(--color-bg-tertiary); }
.edit-field { margin-bottom: var(--space-lg); }
.edit-field label { display: block; font-size: var(--text-base); font-weight: 600; color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
.edit-textarea { width: 100%; padding: var(--space-md); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-sans); font-size: var(--text-base); line-height: 1.6; resize: vertical; }
.edit-textarea:focus { outline: none; border-color: var(--color-accent-primary); }
.edit-actions { display: flex; justify-content: flex-end; gap: var(--space-md); }

/* 展开的详细信息 */
.expanded-details { padding: var(--space-xl); background: var(--color-bg-tertiary); border-top: 1px solid var(--color-border); }
.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); margin-bottom: var(--space-xl); }
.detail-card { display: flex; gap: var(--space-md); padding: var(--space-lg); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.detail-card.warning { border-color: var(--color-border); background: var(--color-bg-card); }
.detail-card.success { border-color: var(--color-border); background: var(--color-bg-card); }
.detail-icon { font-size: var(--text-2xl); filter: grayscale(1); }
.detail-content h4 { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0 0 var(--space-xs); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-content p { font-size: var(--text-base); color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.implementation-section { padding: var(--space-lg); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.implementation-section h4 { font-size: var(--text-lg); margin: 0 0 var(--space-md); color: var(--color-text-primary); }
.implementation-content { font-size: var(--text-base); }

/* 卡片操作 */
.card-actions { display: flex; gap: var(--space-md); padding: var(--space-lg) var(--space-xl); border-top: 1px solid var(--color-border); }
.action-btn { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-secondary); font-size: var(--text-base); cursor: pointer; transition: all 0.2s; }
.action-btn:hover { background: var(--color-bg-tertiary); border-color: var(--color-accent-primary); color: var(--color-text-primary); }

/* 底部操作 */
.bottom-actions { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-lg); }
.btn-lg { padding: var(--space-md) var(--space-xl); font-size: var(--text-lg); }

/* 思维导图 */
.mindmap-section { }
.mindmap-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
.mindmap-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-xl); background: var(--color-bg-tertiary); border-bottom: 1px solid var(--color-border); }
.mindmap-title { display: flex; align-items: center; gap: var(--space-md); }
.mindmap-icon { font-size: var(--text-2xl); filter: grayscale(1); }
.mindmap-title h3 { font-size: var(--text-xl); margin: 0; color: var(--color-text-primary); }
.mindmap-actions { display: flex; gap: var(--space-md); }
.mindmap-content { padding: var(--space-2xl); min-height: 400px; max-height: 600px; overflow-y: auto; background: var(--color-bg-card); }
.mindmap-footer { padding: var(--space-2xl); border-top: 1px solid var(--color-border); text-align: center; background: var(--color-bg-tertiary); }
.complete-badge { font-size: 48px; margin-bottom: var(--space-md); filter: grayscale(1); }
.mindmap-footer h3 { font-size: var(--text-xl); color: var(--color-text-primary); margin: 0 0 var(--space-sm); }
.mindmap-footer p { color: var(--color-text-secondary); margin: 0; }

/* 展开控制样式 */
.expand-toggle { display: flex; align-items: center; gap: var(--space-xs); color: var(--color-text-secondary); font-size: var(--text-sm); transition: color 0.2s; }
.card-header:hover .expand-toggle { color: var(--color-accent-primary); }

.expand-hint { display: flex; justify-content: center; align-items: center; gap: var(--space-sm); padding: var(--space-md); margin: 0 var(--space-xl) var(--space-lg); background: var(--color-bg-tertiary); border: 1px dashed var(--color-border); border-radius: var(--radius-lg); color: var(--color-text-secondary); font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; }
.expand-hint:hover { background: rgba(99, 102, 241, 0.05); border-color: var(--color-accent-primary); color: var(--color-accent-primary); }
.expand-hint .icon { font-size: var(--text-xs); transition: transform 0.2s; }
.expand-hint:hover .icon { transform: translateY(2px); }

/* 展开动画 */
.expand-enter-active,
.expand-leave-active { transition: all 0.4s ease-in-out; overflow: hidden; max-height: 2000px; opacity: 1; }
.expand-enter-from,
.expand-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; margin-bottom: 0; }

@media (max-width: 768px) {
  .recommendation-banner { flex-direction: column; align-items: flex-start; }
  .details-grid { grid-template-columns: 1fr; }
  .card-header { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
  .header-right { width: 100%; justify-content: space-between; margin-left: 0; }
  
  .step-header { margin-bottom: var(--space-xl); }
  .step-title { font-size: var(--text-xl); }
  
  .bottom-actions { flex-direction: column; gap: var(--space-md); }
  .bottom-actions .btn { width: 100%; justify-content: center; }
  
  .mindmap-header { flex-direction: column; align-items: stretch; gap: var(--space-md); }
  .mindmap-title { justify-content: center; }
  .mindmap-actions { width: 100%; display: flex; justify-content: space-between; gap: 8px; }
  .mindmap-actions .btn { flex: 1; padding: 8px 0; justify-content: center; font-size: 13px; white-space: nowrap; min-width: 0; }
  
  .card-actions { flex-direction: column; }
  .action-btn { justify-content: center; }
  
  .metric-header { flex-direction: column; align-items: flex-start; gap: var(--space-xs); }
  .metric-score { align-self: flex-end; }
}
</style>
