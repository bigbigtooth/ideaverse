<!--
  @fileoverview Step 3: Solutions component
  @module components/step3/Step3Solutions
  @description The final step in the thinking workflow. Generates and
  evaluates solution options based on the deep analysis.
  
  Features:
  - AI-generated solution options with scoring
  - Solution editing and regeneration
  - Interactive mind map visualization using Markmap
  - Export to PNG, SVG, and Markdown formats
  - Full-screen mind map viewing
  
  @copyright 2026 BigTooth
  @license GPL-3.0
-->

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useThinkingStore } from '../../stores/thinking'
import { useI18n } from 'vue-i18n'
import MarkdownViewer from '../common/MarkdownViewer.vue'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { Toolbar } from 'markmap-toolbar'
import * as d3 from 'd3'
import { toPng, toSvg } from 'html-to-image'
import logoSrc from '../../assets/logo.png'
import 'markmap-toolbar/dist/style.css'
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
  PartyPopper,
  Image as ImageIcon,
  FileText,
  X,
  Maximize2
} from 'lucide-vue-next'

const store = useThinkingStore()
const { t, locale } = useI18n()

const showMindMap = ref(false)
const mindMapContent = ref('')
const editingSolutionId = ref(null)
const editingContent = ref({})
const expandedCardId = ref(null)
const activeTab = ref('mindmap') // 'mindmap' | 'markdown'
const svgRef = ref(null)
const wrapperRef = ref(null)
const fullscreenSvgRef = ref(null)
const fullscreenWrapperRef = ref(null)
const showFullscreen = ref(false)

let markmapInstance = null
let fullscreenMarkmapInstance = null

const solutions = computed(() => store.currentSession?.solutions || [])
const recommendation = computed(() => store.currentSession?.recommendation)

watch(showMindMap, (val) => {
  if (val && activeTab.value === 'mindmap') {
    nextTick(() => {
      initMarkmap()
    })
  }
})

watch(activeTab, (val) => {
  if (val === 'mindmap' && showMindMap.value) {
    nextTick(() => {
      initMarkmap()
    })
  }
})

watch(showFullscreen, (val) => {
  if (val) {
    nextTick(() => {
      initFullscreenMarkmap()
    })
  } else {
    // Cleanup fullscreen instance when closing
    if (fullscreenMarkmapInstance) {
        fullscreenMarkmapInstance.destroy()
        fullscreenMarkmapInstance = null
    }
  }
})

const colorFn = d3.scaleOrdinal([
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#14b8a6', // Teal
])

// 辅助函数：将 Hex 颜色转换为 RGBA
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function normalizeInlineStyle(styleText) {
  return styleText
    .replace(/\r?\n/g, ' ')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function processMarkmapData(node, depth = 0, index = 0, parentColor = null) {
  let currentColor = parentColor
  
  if (depth === 0) {
    // 根节点样式 - 内联化
    // 渐变背景：Indigo (4f46e5) -> Violet (7c3aed)
    const style = `
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff;
      padding: 12px 32px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 24px;
      line-height: 1.4;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.2);
      border: 2px solid rgba(255,255,255,0.2);
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    `
    node.content = `<div style="${normalizeInlineStyle(style)}">${node.content}</div>`
  } else if (depth === 1) {
    // 二级节点样式 - 分配颜色
    const colorList = colorFn.range()
    currentColor = colorList[index % colorList.length]
    
    // 存储颜色到 payload 供 Markmap 线条使用
    node.payload = { ...node.payload, color: currentColor }
    
    // 生成动态样式
    const bgColor = hexToRgba(currentColor, 0.05) // 极淡的背景
    const borderColor = currentColor
    const shadowColor = hexToRgba(currentColor, 0.15)
    const textColor = currentColor
    
    // 内联样式确保导出时保留
    const style = `
      display: inline-block;
      background-color: ${bgColor};
      border: 2px solid ${borderColor};
      color: ${textColor};
      box-shadow: 0 4px 12px ${shadowColor};
      padding: 10px 24px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 18px;
      line-height: 1.4;
      font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    `
    
    node.content = `<div style="${normalizeInlineStyle(style)}">${node.content}</div>`
  } else {
    // 其他节点 - 继承颜色用于线条
    if (currentColor) {
      node.payload = { ...node.payload, color: currentColor }
    }
  }
  
  if (node.children && node.children.length > 0) {
    node.children.forEach((child, idx) => processMarkmapData(child, depth + 1, idx, currentColor))
  }
  return node
}

function initMarkmap() {
  if (!svgRef.value || !mindMapContent.value) return
  
  if (markmapInstance) {
    svgRef.value.innerHTML = ''
    markmapInstance = null
  }
  
  const transformer = new Transformer()
  const { root } = transformer.transform(mindMapContent.value)
  
  // 应用自定义节点样式
  processMarkmapData(root)
  
  markmapInstance = Markmap.create(svgRef.value, {
    autoFit: true,
    zoom: true,
    pan: true,
    scrollForPan: true, // 明确启用滚轮平移，可能解决部分事件警告
    color: (node) => node.payload?.color || colorFn(node.content),
    spacingHorizontal: 100,
    spacingVertical: 20,
    paddingX: 30,
    maxWidth: 400,
    duration: 500,
    html: true, // 确保开启 HTML 支持
  }, root)

  // Toolbar
  if (wrapperRef.value && !wrapperRef.value.querySelector('.mm-toolbar')) {
    const toolbar = Toolbar.create(markmapInstance)
    toolbar.setBrand(false)
    toolbar.el.style.position = 'absolute'
    toolbar.el.style.bottom = '1rem'
    toolbar.el.style.right = '1rem'
    toolbar.el.style.zIndex = '10' // Ensure it's clickable
    wrapperRef.value.appendChild(toolbar.el)
  }
}

function initFullscreenMarkmap() {
  if (!fullscreenSvgRef.value || !mindMapContent.value) return
  
  if (fullscreenMarkmapInstance) {
    fullscreenSvgRef.value.innerHTML = ''
    fullscreenMarkmapInstance = null
  }
  
  const transformer = new Transformer()
  const { root } = transformer.transform(mindMapContent.value)
  
  // 应用自定义节点样式
  processMarkmapData(root)
  
  fullscreenMarkmapInstance = Markmap.create(fullscreenSvgRef.value, {
    autoFit: true,
    zoom: true,
    pan: true,
    color: (node) => node.payload?.color || colorFn(node.content),
    spacingHorizontal: 120, // 全屏模式更宽一点
    spacingVertical: 25,
    paddingX: 40,
    maxWidth: 600,
    duration: 500,
    html: true, // 确保开启 HTML 支持
  }, root)

  // Toolbar for Fullscreen
  if (fullscreenWrapperRef.value && !fullscreenWrapperRef.value.querySelector('.mm-toolbar')) {
    const toolbar = Toolbar.create(fullscreenMarkmapInstance)
    toolbar.setBrand(false)
    toolbar.el.style.position = 'absolute'
    toolbar.el.style.bottom = '2rem'
    toolbar.el.style.right = '2rem'
    toolbar.el.style.zIndex = '1010' // Ensure it's above modal overlay
    fullscreenWrapperRef.value.appendChild(toolbar.el)
  }
}

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
  alert(t('common.copied'))
}

function downloadMindMap() {
  const blob = new Blob([mindMapContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = t('step3.mindmap_filename')
  a.click()
  URL.revokeObjectURL(url)
}

async function processWatermark(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        // 绘制原图
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        // 加载 Logo
        const logo = new Image()
        logo.onload = () => {
          // 设置水印全局透明度
          ctx.globalAlpha = 0.5
          
          // 配置水印参数
          const text = t('step3.watermark_text')
          const fontSize = Math.max(24, Math.floor(img.width / 40))
          
          // 根据语言选择字体
          const fontParams = locale.value === 'zh-CN' 
            ? '"KaiTi", "STKaiti", "楷体", serif'
            : 'serif'
            
          ctx.font = `500 ${fontSize}px ${fontParams}`
          ctx.fillStyle = '#000000'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          
          const padding = Math.floor(fontSize)
          const textX = canvas.width - padding
          const textY = canvas.height - padding
          
          // 绘制文字
          ctx.fillText(text, textX, textY)
          
          // 绘制 Logo (在文字左侧)
          const logoHeight = fontSize * 1.2
          const logoWidth = logoHeight * (logo.width / logo.height)
          const logoMargin = fontSize * 0.4
          const logoX = textX - ctx.measureText(text).width - logoWidth - logoMargin
          const logoY = textY - logoHeight + (fontSize * 0.15) // 微调垂直对齐
          
          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
          
          // 触发下载
          const link = document.createElement('a')
          const timestamp = new Date().getTime()
          const filename = locale.value === 'zh-CN'
            ? `深度思考-思维导图-${timestamp}.png`
            : `Ideaverse-MindMap-${timestamp}.png`
            
          link.download = filename
          link.href = canvas.toDataURL('image/png')
          link.click()
          
          resolve()
        }
        
        logo.onerror = () => {
          // Logo 加载失败则仅绘制文字
          console.warn('Watermark logo failed to load')
          // 设置水印全局透明度
          ctx.globalAlpha = 0.5
          
          const text = t('step3.watermark_text')
          const fontSize = Math.max(24, Math.floor(img.width / 40))
          
          const fontParams = locale.value === 'zh-CN' 
            ? '"KaiTi", "STKaiti", "楷体", serif'
            : 'serif'
            
          ctx.font = `500 ${fontSize}px ${fontParams}`
          ctx.fillStyle = '#000000'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          
          const padding = Math.floor(fontSize)
          ctx.fillText(text, canvas.width - padding, canvas.height - padding)
          
          const link = document.createElement('a')
          const timestamp = new Date().getTime()
          const filename = locale.value === 'zh-CN'
            ? `深度思考-思维导图-${timestamp}.png`
            : `Ideaverse-MindMap-${timestamp}.png`
            
          link.download = filename
          link.href = canvas.toDataURL('image/png')
          link.click()
          resolve()
        }
        
        logo.src = logoSrc
        
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = (e) => reject(new Error('Image load failed'))
    img.src = dataUrl
  })
}

async function downloadImage() {
  if (!svgRef.value || !markmapInstance) return
  
  // 1. 锁定交互并静默
  markmapInstance.setOptions({ duration: 0, zoom: false, pan: false })

  // 2. 保存现场 (Styles)
  const svgElement = svgRef.value
  const originalStyle = {
    width: svgElement.style.width,
    height: svgElement.style.height,
    position: svgElement.style.position,
    left: svgElement.style.left,
    top: svgElement.style.top,
    zIndex: svgElement.style.zIndex,
    backgroundColor: svgElement.style.backgroundColor,
  }

  // 3. 准备导出数据 (Resize)
  let width = 0
  let height = 0
  
  try {
    // 获取真实内容尺寸
    // 此时我们不需要手动去掉 transform，因为我们将使用 markmapInstance.fit() 来自动适配
    const contentGroup = svgElement.querySelector('g')
    const bbox = contentGroup ? contentGroup.getBBox() : svgElement.getBoundingClientRect()
    // 增加更多内边距以容纳阴影
    const padding = 100
    
    width = Math.ceil(bbox.width) + padding * 2
    height = Math.ceil(bbox.height) + padding * 2
    
    // 关键：将 SVG 容器放大到能容纳所有内容的尺寸，并全屏置顶
    svgElement.style.width = `${width}px`
    svgElement.style.height = `${height}px`
    svgElement.style.backgroundColor = 'white'
    svgElement.style.position = 'absolute'
    svgElement.style.top = '0'
    svgElement.style.left = '0'
    svgElement.style.zIndex = '9999' // 确保在最上层
    
    // 4. 引擎适配 (Fit)
    // 通知 Markmap 容器大小变了，请重新计算布局以填满容器
    // 增加 padding 以防止自定义样式的阴影或负边距元素被裁剪
    markmapInstance.setOptions({ 
        paddingX: 100, 
        paddingY: 100 
    })
    await markmapInstance.fit()
    
    // 等待 D3 过渡完成（虽然 duration=0，但留点 buffer 更稳）
    await new Promise(resolve => setTimeout(resolve, 100))

    // 内部函数：尝试以指定倍率生成 PNG
    const tryGeneratePng = async (ratio) => {
      console.log(`尝试导出图片: ratio=${ratio}, size=${width}x${height}`)
      return await toPng(svgElement, {
        backgroundColor: 'white',
        width: width,
        height: height,
        pixelRatio: ratio,
        skipFonts: true,
        cacheBust: true,
        filter: () => true, // 强制捕获所有节点
      })
    }
    
    // 5. 执行导出流程
    let dataUrl = null
    try {
      dataUrl = await tryGeneratePng(4)
    } catch (e) {
      console.warn('4倍高清导出失败，尝试2倍...', e)
      try {
        dataUrl = await tryGeneratePng(2)
      } catch (e2) {
        console.warn('2倍高清导出失败，尝试1倍...', e2)
        try {
           dataUrl = await tryGeneratePng(1)
        } catch (e3) {
           console.error('图片导出完全失败', e3)
           // 降级导出 SVG (直接导出当前状态)
           const svgDataUrl = await toSvg(svgElement, {
             backgroundColor: 'white',
             width,
             height,
             cacheBust: true,
           })
           const a = document.createElement('a')
           a.href = svgDataUrl
           a.download = locale.value === 'zh-CN' ? '深度思考-思维导图.svg' : 'Ideaverse-MindMap.svg'
           a.click()
           alert(t('common.error') + ': SVG exported')
           return
        }
      }
    }
    
    if (dataUrl) {
      await processWatermark(dataUrl)
    }

  } catch (err) {
    console.error('导出流程异常:', err)
    alert(t('common.error'))
  } finally {
    // 6. 恢复现场 (Restore)
    // 恢复样式
    svgElement.style.width = originalStyle.width
    svgElement.style.height = originalStyle.height
    svgElement.style.position = originalStyle.position
    svgElement.style.left = originalStyle.left
    svgElement.style.top = originalStyle.top
    svgElement.style.zIndex = originalStyle.zIndex
    svgElement.style.backgroundColor = originalStyle.backgroundColor
    
    // 恢复交互
    if (markmapInstance) {
      markmapInstance.setOptions({ 
        duration: 500, 
        zoom: true, 
        pan: true,
        paddingX: 30, // 恢复默认值
        paddingY: 0   // 恢复默认值(undefined)
      })
      // 重新适配回原容器大小
      await markmapInstance.fit() 
    }
  }
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
        {{ t('step3.title') }}
      </h2>
      <p class="step-desc">{{ t('step3.desc') }}</p>
    </div>
    
    <div v-if="!showMindMap">
      <!-- 加载中 -->
      <div v-if="solutions.length === 0 && store.loading" class="loading-section">
        <div class="loading-spinner"></div>
        <span>{{ t('status.generating_solutions') }}</span>
      </div>

      <!-- 推荐方案横幅 -->
      <div v-else-if="recommendation" class="recommendation-banner">
        <div class="rec-badge"><Trophy :size="16" /> {{ t('step2.recommend_title') }}</div>
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
              <span class="solution-index">{{ t('step3.solutions_title') }} {{ index + 1 }}</span>
              <h3 class="solution-name">{{ solution.name }}</h3>
              <span v-if="solution.id === recommendation?.bestSolution" class="best-tag"><Sparkles :size="12" /> {{ t('step2.recommend_title') }}</span>
            </div>
            <div class="header-right">
              <div class="total-score" :class="getScoreClass(solution.weightedScore)">
                <span class="score-value">{{ solution.weightedScore?.toFixed(1) }}</span>
                <span class="score-label">{{ t('step3.weighted_score') }}</span>
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
                <span class="metric-name"><Target :size="14" /> {{ t('step3.effectiveness') }}</span>
                <span class="metric-score" :class="getScoreClass(solution.effectiveness)">{{ solution.effectiveness }}/10</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill effectiveness" :style="{ width: getProgressWidth(solution.effectiveness) }"></div>
              </div>
            </div>
            <div class="metric-bar">
              <div class="metric-header">
                <span class="metric-name"><Zap :size="14" /> {{ t('step3.feasibility') }}</span>
                <span class="metric-score" :class="getScoreClass(solution.feasibility)">{{ solution.feasibility }}/10</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill feasibility" :style="{ width: getProgressWidth(solution.feasibility) }"></div>
              </div>
            </div>
            <div class="metric-bar">
              <div class="metric-header">
                <span class="metric-name"><RefreshCw :size="14" /> {{ t('step3.sustainability') }}</span>
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
            <span>{{ t('common.next') }}</span>
            <ChevronDown class="icon" :size="16" />
          </div>
          
          <!-- 编辑模式 -->
          <div v-if="editingSolutionId === solution.id" class="edit-section">
            <div class="edit-field">
              <label>{{ t('common.edit') }}</label>
              <textarea v-model="editingContent.description" class="edit-textarea" rows="4"></textarea>
            </div>
            <div class="edit-field">
              <label>{{ t('step3.implementation') }}</label>
              <textarea v-model="editingContent.implementation" class="edit-textarea" rows="4"></textarea>
            </div>
            <div class="edit-actions">
              <button class="btn btn-ghost" @click="cancelEdit">{{ t('common.cancel') }}</button>
              <button class="btn btn-primary" @click="saveEdit">{{ t('common.save') }}</button>
            </div>
          </div>
          
          <!-- 展开的详细信息 -->
          <Transition name="expand">
            <div v-if="expandedCardId === solution.id" class="expanded-details">
              <div class="details-grid">
                <div class="detail-card">
                  <Clock class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>{{ t('step3.implementation') }}</h4>
                    <p>{{ solution.timeframe }}</p>
                  </div>
                </div>
                <div class="detail-card">
                  <Package class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>{{ t('step3.cost_benefit') }}</h4>
                    <p>{{ solution.resources }}</p>
                  </div>
                </div>
                <div class="detail-card warning">
                  <AlertTriangle class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>{{ t('step3.worst_case') }}</h4>
                    <p>{{ solution.worstCase }}</p>
                  </div>
                </div>
                <div class="detail-card success">
                  <Shield class="detail-icon" :size="24" />
                  <div class="detail-content">
                    <h4>{{ t('step3.countermeasure') }}</h4>
                    <p>{{ solution.countermeasure }}</p>
                  </div>
                </div>
              </div>
              
              <div v-if="solution.implementation" class="implementation-section">
                <h4><Clipboard :size="16" /> {{ t('step3.implementation') }}</h4>
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
              <span>{{ t('common.edit') }}</span>
            </button>
            <button class="action-btn" @click.stop="regenerate(solution.id)">
              <RefreshCw :size="14" />
              <span>{{ t('step3.regenerate') }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bottom-actions">
        <button class="btn btn-ghost btn-lg" @click="goBack">
          <ArrowLeft :size="16" />
          <span>{{ t('common.back') }}</span>
        </button>
        <button class="btn btn-primary btn-lg" @click="generateMindMapAndShow">
          <Network :size="16" />
          <span>{{ t('step3.export_mindmap') }}</span>
        </button>
      </div>
    </div>
    
    <!-- 思维导图展示 -->
    <div v-else class="mindmap-section">
      <div class="mindmap-card">
        <div class="mindmap-header">
          <div class="mindmap-title">
            <button class="btn-icon-back" @click="showMindMap = false">
              <ArrowLeft :size="20" />
            </button>
            <h3>{{ t('step3.export_mindmap') }}</h3>
          </div>
          <div class="mindmap-actions">
            <button class="btn btn-secondary" @click="downloadImage" v-if="activeTab === 'mindmap'">
              <ImageIcon :size="14" /> {{ t('common.export') }} PNG
            </button>
            <button class="btn btn-secondary" @click="downloadMindMap">
              <Download :size="14" /> {{ t('common.export') }} MD
            </button>
            <button class="btn btn-secondary" @click="copyMindMap">
              <Copy :size="14" /> {{ t('common.copy') }}
            </button>
          </div>
        </div>
        
        <div class="mindmap-tabs">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'mindmap' }"
              @click="activeTab = 'mindmap'"
            >
              <Network :size="16" />
              {{ t('step3.mind_map') }}
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'markdown' }"
              @click="activeTab = 'markdown'"
            >
              <FileText :size="16" />
              {{ t('step3.markdown') }}
            </div>
        </div>

        <div class="mindmap-content" ref="wrapperRef">
          <div v-show="activeTab === 'mindmap'" class="mindmap-view" @click="showFullscreen = true">
             <div class="mindmap-overlay-hint">
               <Maximize2 :size="24" />
               <span>{{ t('step3.click_to_fullscreen') }}</span>
             </div>
             <svg ref="svgRef" class="markmap-svg"></svg>
          </div>
          <div v-show="activeTab === 'markdown'" class="markdown-view">
             <MarkdownViewer :content="mindMapContent" />
          </div>
        </div>
        <div class="mindmap-footer">
          <PartyPopper class="complete-badge-icon" :size="48" />
          <h3>{{ t('common.success') }}!</h3>
          <p>{{ t('common.finish') }}</p>
        </div>
      </div>
    </div>
    
    <!-- 全屏思维导图 Modal -->
    <Transition name="fade">
      <div v-if="showFullscreen" class="fullscreen-modal" @click.self="showFullscreen = false">
        <div class="fullscreen-content" ref="fullscreenWrapperRef">
          <button class="close-btn" @click="showFullscreen = false">
            <X :size="24" />
          </button>
          <svg ref="fullscreenSvgRef" class="fullscreen-svg"></svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Fullscreen Modal */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.fullscreen-content {
  width: 95vw;
  height: 90vh;
  background: white;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.fullscreen-svg {
  width: 100%;
  height: 100%;
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1020;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  color: var(--color-text-secondary);
}

.close-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transform: rotate(90deg);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mindmap-view {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer; /* Indicate clickable */
}

/* Overlay Hint */
.mindmap-overlay-hint {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 5;
  pointer-events: none; /* Let clicks pass through to container */
}

.mindmap-view:hover .mindmap-overlay-hint {
  opacity: 1;
  background: rgba(0,0,0,0.05);
}

.mindmap-overlay-hint span {
  background: rgba(255,255,255,0.9);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

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
.mindmap-title { display: flex; align-items: center; gap: var(--space-sm); }
.mindmap-icon { font-size: var(--text-2xl); filter: grayscale(1); }
.mindmap-title h3 { font-size: var(--text-xl); margin: 0; color: var(--color-text-primary); }
.mindmap-actions { display: flex; gap: var(--space-md); }

.btn-icon-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: white;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  margin-right: var(--space-xs);
}

.btn-icon-back:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-accent-primary);
}
.mindmap-content { 
  min-height: 400px; 
  height: 600px;
  background: var(--color-bg-card); 
  display: flex;
  flex-direction: column;
  position: relative;
}

.mindmap-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-tertiary);
  padding: 0 var(--space-xl);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: -1px;
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.tab-item:hover {
  color: var(--color-text-primary);
  background: rgba(0,0,0,0.02);
}

.tab-item.active {
  color: var(--color-accent-primary);
  border-bottom-color: var(--color-bg-card);
  border-top: 2px solid var(--color-accent-primary); /* Visual trick */
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-card);
  margin-top: -1px; /* Align top border */
}

.mindmap-view {
  width: 100%;
  height: 100%;
  position: relative;
}

.markmap-svg {
  width: 100%;
  height: 100%;
}

.markdown-view {
  padding: var(--space-2xl);
  overflow-y: auto;
  height: 100%;
}
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

/* Markmap 样式增强 */
:deep(.markmap-node-text) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 16px; /* 基础字体增大 */
}

:deep(.markmap-link) {
  stroke-width: 3px;
  opacity: 0.6;
}

:deep(.markmap-node-circle) {
  r: 6;
  stroke-width: 3px;
}

@media (max-width: 768px) {
  .recommendation-banner { flex-direction: column; align-items: flex-start; }
  .details-grid { grid-template-columns: 1fr; }
  .card-header { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
  .header-right { width: 100%; justify-content: space-between; margin-left: 0; }
  
  .step-header { margin-bottom: var(--space-xl); }
  .step-title { font-size: var(--text-xl); }
  
  .bottom-actions { flex-direction: column; gap: var(--space-md); }
  .bottom-actions .btn { width: 100%; justify-content: center; }
  
  .mindmap-header { flex-direction: column; align-items: stretch; gap: var(--space-md); padding: var(--space-lg); }
  .mindmap-title { justify-content: center; position: relative; }
  .btn-icon-back { position: absolute; left: 0; margin-right: 0; }
  .mindmap-actions { width: 100%; display: flex; justify-content: space-between; gap: 8px; }
  .mindmap-actions .btn { flex: 1; padding: 6px 4px; justify-content: center; font-size: 12px; white-space: nowrap; min-width: 0; gap: 4px; }
  
  .card-actions { flex-direction: column; }
  .action-btn { justify-content: center; }
  
  .metric-header { flex-direction: column; align-items: flex-start; gap: var(--space-xs); }
  .metric-score { align-self: flex-end; }
}
</style>
