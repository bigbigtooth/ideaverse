import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storage from '../services/storage'
import ai from '../services/ai'
import i18n from '../i18n'

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
  
  // Helper to get current locale
  const currentLocale = computed(() => i18n.global.locale.value)
  const t = (key, params) => i18n.global.t(key, params)

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
    error.value = err.message || t('common.unknown_error')
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
      setAiStatus('requesting', t('status.generating_questions'))
      
      const result = await ai.generateInterviewQuestions(
        currentSession.value.problem,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.analyzing_answers'))

      const report = await ai.generateUnderstandingReport(
        currentSession.value.problem,
        currentSession.value.interviewAnswers,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.recommending_models'))

      const result = await ai.recommendThinkingModels(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.generating_dimensions'))

      const result = await ai.generateAnalysisDimensions(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        modelId,
        handleAiProgress,
        currentLocale.value
      )

      // 初始化分析卡片
      const cards = result.dimensions.map(dim => ({
        ...dim,
        status: 'pending', // pending, analyzing, completed
        content: null
      }))

      // 确保使用传入的 modelId，防止 AI 返回错误的 ID
      // 现在的 THINKING_MODELS 已经没有 name 了，所以我们需要从 i18n 获取 name，或者只存 ID
      // 之前代码: const model = ai.THINKING_MODELS[modelId]
      // updateCurrentSession({ thinkingModel: model ? model.name : result.thinkingModel ... })
      // 现在的 model 对象只有 id, icon 等。
      // 我们存 ID 即可，显示时再翻译。如果需要存 name 以备后用（比如历史记录），可以用 t() 获取。
      // 但为了历史记录的语言一致性，最好还是存 ID。
      // 不过旧代码存了 thinkingModel (string name)。
      // 如果我们改存 ID，需要 UI 适配。
      // 让我们存 translated name 吧，简单点。或者最好存 ID。
      // 为了兼容旧数据，我们保留 thinkingModel 字段，存 translated name。
      // 同时也存 thinkingModelId。
      
      const modelName = t(`thinking_models.${modelId}.name`)

      updateCurrentSession({
        thinkingModel: modelName || result.thinkingModel,
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
      setAiStatus('requesting', t('status.analyzing_dimension', { dimension: cards[cardIndex].dimension }))

      console.log('[Thinking Store] Calling analyzeDimension with modelId:', currentSession.value.thinkingModelId)

      const result = await ai.analyzeDimension(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        currentSession.value.thinkingModelId,
        cards[cardIndex],
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.generating_report'))

      const report = await ai.generateDeepAnalysisReport(
        currentSession.value.problem,
        currentSession.value.understandingReport,
        currentSession.value.thinkingModelId,
        currentSession.value.analysisCards,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.reanalyzing', { dimension: cards[cardIndex].dimension }))

      const result = await ai.reanalyzeCard(
        currentSession.value.problem,
        cards[cardIndex],
        feedback,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.generating_solutions'))

      const result = await ai.generateSolutions(
        currentSession.value.problem,
        currentSession.value.deepAnalysisReport,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.regenerating_solution'))

      const solutions = [...currentSession.value.solutions]
      const index = solutions.findIndex(s => s.id === id)
      if (index === -1) return

      const oldSolution = solutions[index]
      const newSolution = await ai.regenerateSolution(
        currentSession.value.problem,
        oldSolution,
        feedback,
        handleAiProgress,
        currentLocale.value
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
      setAiStatus('requesting', t('status.generating_mindmap'))

      const mindMap = await ai.generateMindMap(
        currentSession.value.problem,
        currentSession.value.analysisCards,
        currentSession.value.solutions,
        handleAiProgress,
        currentLocale.value
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
