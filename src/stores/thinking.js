import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storage from '../services/storage'
import ai from '../services/ai'

// 生成简单的哈希值 (DJB2 算法)
function generateHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0 // 确保是无符号整数
}

export const useThinkingStore = defineStore('thinking', () => {
  // State
  const currentSession = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const aiStatus = ref('idle') // idle, requesting, receiving, completed
  const aiStatusMessage = ref('')
  const aiResponseCount = ref(0)

  // Getters
  const currentStep = computed(() => currentSession.value?.currentStep || 1)
  const problem = computed(() => currentSession.value?.problem || '')

  // Actions
  function setLoading(status, message = '') {
    loading.value = status
    if (status) {
      error.value = null
    }
  }

  function setAiStatus(status, message = '') {
    aiStatus.value = status
    if (message) {
      aiStatusMessage.value = message
    }
    if (status === 'requesting') {
      aiResponseCount.value = 0
    }
  }

  function handleAiProgress(partialText) {
    aiStatus.value = 'receiving'
    aiResponseCount.value = partialText.length
  }

  function handleError(err) {
    console.error('Thinking Store Error:', err)
    error.value = err.message || '发生未知错误'
    loading.value = false
    aiStatus.value = 'idle'
  }

  // Session Management
  function loadSession(id) {
    const session = storage.getSession(id)
    if (session) {
      currentSession.value = session
      storage.setCurrentSessionId(id)
    }
    return session
  }

  function loadCurrentSession() {
    const session = storage.getCurrentSession()
    if (session) {
      currentSession.value = session
    }
    return session
  }

  function createSession(problemText) {
    const session = storage.createSession(problemText)
    currentSession.value = session
    return session
  }

  function updateCurrentSession(updates) {
    if (!currentSession.value) return
    
    const updatedSession = storage.updateSession(currentSession.value.id, updates)
    currentSession.value = updatedSession
  }

  function resetSession() {
    currentSession.value = null
    loading.value = false
    error.value = null
    aiStatus.value = 'idle'
  }

  // Step 1: Interview
  async function generateQuestions() {
    if (!currentSession.value) return
    
    try {
      setLoading(true)
      setAiStatus('requesting', '正在生成采访问题...')
      
      const questions = await ai.generateInterviewQuestions(
        currentSession.value.problem,
        handleAiProgress
      )
      
      updateCurrentSession({ 
        interviewQuestions: questions,
        updatedAt: new Date().toISOString()
      })
      
      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  async function generateUnderstandingReport() {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在生成问题理解报告...')

      const report = await ai.generateUnderstandingReport(
        currentSession.value.problem,
        currentSession.value.interviewQuestions,
        currentSession.value.interviewAnswers,
        handleAiProgress
      )

      updateCurrentSession({
        understandingReport: report,
        currentStep: 2, // 自动进入下一步
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Analysis
  async function recommendThinkingModels() {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在推荐思维模型...')

      const result = await ai.recommendThinkingModels(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        handleAiProgress
      )
      
      // 这里可能不需要存储推荐结果，直接返回给组件使用
      // 或者存入 session (如果是为了持久化推荐历史)
      return result
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      setLoading(false)
      setAiStatus('idle')
    }
  }

  async function generateAnalysisDimensions(modelId) {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在拆解分析维度...')

      const result = await ai.generateAnalysisDimensions(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        modelId,
        handleAiProgress
      )

      // 初始化分析卡片
      const cards = result.dimensions.map(dim => ({
        ...dim,
        status: 'pending', // pending, analyzing, completed
        content: null
      }))

      updateCurrentSession({
        thinkingModel: result.thinkingModel,
        thinkingModelId: result.thinkingModelId,
        analysisCards: cards,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeDimension(cardId) {
    if (!currentSession.value) return

    const cards = [...currentSession.value.analysisCards]
    const cardIndex = cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    try {
      // 更新卡片状态
      cards[cardIndex].status = 'analyzing'
      updateCurrentSession({ analysisCards: cards })

      setLoading(true)
      setAiStatus('requesting', `正在分析维度：${cards[cardIndex].dimension}...`)

      const result = await ai.analyzeDimension(
        currentSession.value.problem,
        currentSession.value.thinkingModel,
        cards[cardIndex],
        handleAiProgress
      )

      // 更新卡片内容
      cards[cardIndex] = {
        ...cards[cardIndex],
        ...result,
        status: 'completed'
      }
      
      updateCurrentSession({ 
        analysisCards: cards,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
      // 恢复卡片状态
      cards[cardIndex].status = 'pending'
      updateCurrentSession({ analysisCards: cards })
    } finally {
      setLoading(false)
    }
  }

  async function generateDeepAnalysisReport() {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在生成深度分析汇总报告...')

      const report = await ai.generateDeepAnalysisReport(
        currentSession.value.problem,
        currentSession.value.thinkingModel,
        currentSession.value.analysisCards,
        handleAiProgress
      )

      updateCurrentSession({
        deepAnalysisReport: report,
        currentStep: 3, // 自动进入下一步
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Solutions
  async function generateSolutions() {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在生成创新解决方案...')

      const result = await ai.generateSolutions(
        currentSession.value.problem,
        currentSession.value.deepAnalysisReport,
        handleAiProgress
      )

      updateCurrentSession({
        solutions: result.solutions,
        recommendation: result.recommendation,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  async function updateSolution(id, content) {
    if (!currentSession.value) return
    
    const solutions = [...currentSession.value.solutions]
    const index = solutions.findIndex(s => s.id === id)
    if (index !== -1) {
      solutions[index] = { ...solutions[index], ...content }
      updateCurrentSession({ solutions })
    }
  }

  async function regenerateSolution(id, feedback) {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在重新优化方案...')

      const solutions = [...currentSession.value.solutions]
      const index = solutions.findIndex(s => s.id === id)
      if (index === -1) return

      const oldSolution = solutions[index]
      const newSolution = await ai.regenerateSolution(
        currentSession.value.problem,
        oldSolution,
        feedback,
        handleAiProgress
      )

      solutions[index] = { ...newSolution, id: oldSolution.id } // 保持 ID 不变
      
      updateCurrentSession({ 
        solutions,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  async function generateMindMap() {
    if (!currentSession.value) return

    // 检查缓存
    const currentHash = generateHash(JSON.stringify({
      problem: currentSession.value.problem,
      cards: currentSession.value.analysisCards,
      solutions: currentSession.value.solutions
    }))

    if (currentSession.value.mindMap && currentSession.value.mindMapHash === currentHash) {
      return // 使用缓存
    }

    try {
      setLoading(true)
      setAiStatus('requesting', '正在生成思维导图...')

      const mindMap = await ai.generateMindMap(
        currentSession.value.problem,
        currentSession.value.analysisCards,
        currentSession.value.solutions,
        handleAiProgress
      )

      updateCurrentSession({
        mindMap,
        mindMapHash: currentHash,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    currentSession,
    loading,
    error,
    aiStatus,
    aiStatusMessage,
    aiResponseCount,
    
    // Getters
    currentStep,
    problem,
    
    // Actions
    loadSession,
    loadCurrentSession,
    createSession,
    updateCurrentSession,
    resetSession,
    generateQuestions,
    generateUnderstandingReport,
    recommendThinkingModels,
    generateAnalysisDimensions,
    analyzeDimension,
    generateDeepAnalysisReport,
    generateSolutions,
    updateSolution,
    regenerateSolution,
    generateMindMap
  }
})
