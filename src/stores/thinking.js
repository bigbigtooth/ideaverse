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

  function handleAiProgress(currentLength) {
    aiStatus.value = 'receiving'
    aiResponseCount.value = currentLength
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
      
      const result = await ai.generateInterviewQuestions(
        currentSession.value.problem,
        handleAiProgress
      )
      
      // 兼容处理：AI 可能返回 { questions: [...] } 或直接返回 [...]
      let questions = []
      if (result) {
        if (Array.isArray(result)) {
          questions = result
        } else if (Array.isArray(result.questions)) {
          questions = result.questions
        }
      }
      
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

  function saveAnswer(questionId, question, answer) {
    if (!currentSession.value) return

    const answers = [...(currentSession.value.interviewAnswers || [])]
    const existingIndex = answers.findIndex(a => a.questionId === questionId)

    if (existingIndex !== -1) {
      answers[existingIndex] = { questionId, question, answer }
    } else {
      answers.push({ questionId, question, answer })
    }

    updateCurrentSession({ 
      interviewAnswers: answers,
      updatedAt: new Date().toISOString()
    })
  }

  async function generateUnderstandingReport() {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在生成问题理解报告...')

      const report = await ai.generateUnderstandingReport(
        currentSession.value.problem,
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
  async function recommendModels() {
    if (!currentSession.value) return

    try {
      setLoading(true)
      setAiStatus('requesting', '正在推荐思维模型...')

      const result = await ai.recommendThinkingModels(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        handleAiProgress
      )
      
      updateCurrentSession({
        recommendedModels: result.recommendedModels || [],
        modelReasons: result.reasons || {},
        updatedAt: new Date().toISOString()
      })
      
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

      // 确保使用传入的 modelId，防止 AI 返回错误的 ID
      const model = ai.THINKING_MODELS[modelId]

      updateCurrentSession({
        thinkingModel: model ? model.name : result.thinkingModel,
        thinkingModelId: modelId,
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

      console.log('[Thinking Store] Calling analyzeDimension with modelId:', currentSession.value.thinkingModelId)

      const result = await ai.analyzeDimension(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        currentSession.value.thinkingModelId,
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
        currentSession.value.understandingReport,
        currentSession.value.thinkingModelId,
        currentSession.value.analysisCards,
        handleAiProgress
      )

      updateCurrentSession({
        deepAnalysisReport: report,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  async function reanalyzeCard(cardId, feedback) {
    if (!currentSession.value) return

    const cards = [...currentSession.value.analysisCards]
    const cardIndex = cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    try {
      cards[cardIndex].status = 'analyzing'
      updateCurrentSession({ analysisCards: cards })

      setLoading(true)
      setAiStatus('requesting', `正在重新分析维度：${cards[cardIndex].dimension}...`)

      const result = await ai.reanalyzeCard(
        currentSession.value.problem,
        cards[cardIndex],
        feedback,
        handleAiProgress
      )

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
      cards[cardIndex].status = 'completed' // Restore status on error
      updateCurrentSession({ analysisCards: cards })
    } finally {
      setLoading(false)
    }
  }

  function updateAnalysisCard(cardId, content) {
    if (!currentSession.value) return
    
    const cards = [...currentSession.value.analysisCards]
    const index = cards.findIndex(c => c.id === cardId)
    if (index !== -1) {
      cards[index] = { ...cards[index], ...content }
      updateCurrentSession({ analysisCards: cards })
    }
  }

  function deleteAnalysisCard(cardId) {
    if (!currentSession.value) return

    const cards = currentSession.value.analysisCards.filter(c => c.id !== cardId)
    updateCurrentSession({ analysisCards: cards })
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
    saveAnswer,
    generateUnderstandingReport,
    recommendModels,
    generateAnalysisDimensions,
    analyzeDimension,
    generateDeepAnalysisReport,
    reanalyzeCard,
    updateAnalysisCard,
    deleteAnalysisCard,
    generateSolutions,
    updateSolution,
    regenerateSolution,
    generateMindMap
  }
})
