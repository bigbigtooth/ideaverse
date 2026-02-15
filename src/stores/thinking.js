/**
 * @fileoverview Pinia store for managing the thinking analysis workflow
 * @module stores/thinking
 * @description This store manages the entire three-step thinking analysis process:
 * Step 1: Problem Interview - Generate and collect answers to clarifying questions
 * Step 2: Deep Analysis - Apply thinking models and analyze dimensions
 * Step 3: Solution Generation - Generate and evaluate solutions
 * 
 * @copyright 2026 BigTooth
 * @license GPL-3.0
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storage from '../services/storage'
import ai from '../services/ai'
import i18n from '../i18n'

/**
 * Generates a simple hash value using the DJB2 algorithm
 * Used for caching mind map data to avoid redundant AI calls
 * @param {string} str - The input string to hash
 * @returns {number} An unsigned 32-bit integer hash value
 */
function generateHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}

/**
 * Pinia store for managing the thinking analysis workflow
 * @typedef {Object} ThinkingStore
 * @property {Object|null} currentSession - The current analysis session
 * @property {boolean} loading - Global loading state
 * @property {string|null} error - Current error message if any
 * @property {string} aiStatus - Current AI operation status ('idle'|'requesting'|'receiving'|'completed')
 * @property {string} aiStatusMessage - Human-readable status message
 * @property {number} aiResponseCount - Character count of streaming response
 */

/**
 * Session data structure
 * @typedef {Object} Session
 * @property {string} id - Unique session identifier
 * @property {string} problem - The problem being analyzed
 * @property {number} currentStep - Current step in the workflow (1-3)
 * @property {Array<Object>} interviewQuestions - Generated interview questions
 * @property {Array<Object>} interviewAnswers - User's answers to interview questions
 * @property {string} understandingReport - AI-generated understanding report
 * @property {Array<Object>} recommendedModels - Recommended thinking models
 * @property {Object} modelReasons - Reasons for model recommendations
 * @property {string} thinkingModel - Name of selected thinking model
 * @property {string} thinkingModelId - ID of selected thinking model
 * @property {Array<Object>} analysisCards - Analysis dimension cards
 * @property {string} deepAnalysisReport - Comprehensive analysis report
 * @property {Array<Object>} solutions - Generated solutions
 * @property {string} recommendation - Final recommendation
 * @property {Object} mindMap - Mind map data structure
 * @property {number} mindMapHash - Hash for cache validation
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 */

export const useThinkingStore = defineStore('thinking', () => {
  // ============================================
  // State
  // ============================================
  
  /** @type {import('vue').Ref<Session|null>} Current analysis session */
  const currentSession = ref(null)
  
  /** @type {import('vue').Ref<boolean>} Global loading indicator */
  const loading = ref(false)
  
  /** @type {import('vue').Ref<string|null>} Current error message */
  const error = ref(null)
  
  /** @type {import('vue').Ref<string>} AI operation status */
  const aiStatus = ref('idle')
  
  /** @type {import('vue').Ref<string>} Human-readable AI status message */
  const aiStatusMessage = ref('')
  
  /** @type {import('vue').Ref<number>} Character count for streaming progress */
  const aiResponseCount = ref(0)

  // ============================================
  // Getters
  // ============================================
  
  /** @returns {number} Current step in the workflow */
  const currentStep = computed(() => currentSession.value?.currentStep || 1)
  
  /** @returns {string} The problem being analyzed */
  const problem = computed(() => currentSession.value?.problem || '')
  
  /** @returns {string} Current locale for i18n */
  const currentLocale = computed(() => i18n.global.locale.value)
  
  /**
   * Translation helper function
   * @param {string} key - Translation key
   * @param {Object} [params] - Optional parameters for interpolation
   * @returns {string} Translated string
   */
  const t = (key, params) => i18n.global.t(key, params)

  // ============================================
  // Helper Actions
  // ============================================
  
  /**
   * Sets the loading state and clears any previous error
   * @param {boolean} status - New loading state
   * @param {string} [message=''] - Optional status message
   */
  function setLoading(status, message = '') {
    loading.value = status
    if (status) {
      error.value = null
    }
  }

  /**
   * Updates the AI operation status
   * @param {string} status - New status ('idle'|'requesting'|'receiving'|'completed')
   * @param {string} [message=''] - Optional status message
   */
  function setAiStatus(status, message = '') {
    aiStatus.value = status
    if (message) {
      aiStatusMessage.value = message
    }
    if (status === 'requesting') {
      aiResponseCount.value = 0
    }
  }

  /**
   * Handles streaming progress updates
   * @param {number} currentLength - Current character count of the response
   */
  function handleAiProgress(currentLength) {
    aiStatus.value = 'receiving'
    aiResponseCount.value = currentLength
  }

  /**
   * Handles errors by logging and updating state
   * @param {Error} err - The error that occurred
   */
  function handleError(err) {
    console.error('Thinking Store Error:', err)
    error.value = err.message || t('common.unknown_error')
    loading.value = false
    aiStatus.value = 'idle'
  }

  // ============================================
  // Session Management
  // ============================================
  
  /**
   * Loads a session by ID
   * @param {string} id - Session ID to load
   * @returns {Session|null} The loaded session or null if not found
   */
  function loadSession(id) {
    const session = storage.getSession(id)
    if (session) {
      currentSession.value = session
      storage.setCurrentSessionId(id)
    }
    return session
  }

  /**
   * Loads the current session from storage
   * @returns {Session|null} The current session or null if not found
   */
  function loadCurrentSession() {
    const session = storage.getCurrentSession()
    if (session) {
      currentSession.value = session
    }
    return session
  }

  /**
   * Creates a new analysis session
   * @param {string} problemText - The problem to analyze
   * @returns {Session} The newly created session
   */
  function createSession(problemText) {
    const session = storage.createSession(problemText)
    currentSession.value = session
    return session
  }

  /**
   * Updates the current session with new data
   * @param {Partial<Session>} updates - Fields to update
   */
  function updateCurrentSession(updates) {
    if (!currentSession.value) return
    
    const updatedSession = storage.updateSession(currentSession.value.id, updates)
    currentSession.value = updatedSession
  }

  /**
   * Resets the store state and clears the current session
   */
  function resetSession() {
    currentSession.value = null
    loading.value = false
    error.value = null
    aiStatus.value = 'idle'
  }

  // ============================================
  // Step 1: Interview Actions
  // ============================================
  
  /**
   * Generates interview questions for the problem
   * Uses AI to create clarifying questions
   * @async
   * @returns {Promise<void>}
   */
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

  /**
   * Saves an answer to an interview question
   * @param {string} questionId - The question ID
   * @param {string} question - The question text
   * @param {string} answer - The user's answer
   */
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

  /**
   * Generates the understanding report based on interview answers
   * @async
   * @returns {Promise<void>}
   */
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
        currentStep: 2,
        updatedAt: new Date().toISOString()
      })

      setAiStatus('completed')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Step 2: Analysis Actions
  // ============================================
  
  /**
   * Recommends thinking models based on the problem
   * @async
   * @returns {Promise<Object>} The recommendation result
   * @throws {Error} If the AI call fails
   */
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

  /**
   * Generates analysis dimensions for a selected thinking model
   * @async
   * @param {string} modelId - The thinking model ID to use
   * @returns {Promise<void>}
   */
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

      const cards = result.dimensions.map(dim => ({
        ...dim,
        status: 'pending',
        content: null
      }))

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

  /**
   * Analyzes a single dimension
   * @async
   * @param {string} cardId - The analysis card ID to analyze
   * @returns {Promise<void>}
   */
  async function analyzeDimension(cardId) {
    if (!currentSession.value) return

    const cards = [...currentSession.value.analysisCards]
    const cardIndex = cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    try {
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
      cards[cardIndex].status = 'pending'
      updateCurrentSession({ analysisCards: cards })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Generates the comprehensive deep analysis report
   * @async
   * @returns {Promise<void>}
   */
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

  /**
   * Re-analyzes a card with user feedback
   * @async
   * @param {string} cardId - The card ID to re-analyze
   * @param {string} feedback - User's feedback for improvement
   * @returns {Promise<void>}
   */
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
      cards[cardIndex].status = 'completed'
      updateCurrentSession({ analysisCards: cards })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Updates an analysis card's content
   * @param {string} cardId - The card ID to update
   * @param {Object} content - New content to merge
   */
  function updateAnalysisCard(cardId, content) {
    if (!currentSession.value) return
    
    const cards = [...currentSession.value.analysisCards]
    const index = cards.findIndex(c => c.id === cardId)
    if (index !== -1) {
      cards[index] = { ...cards[index], ...content }
      updateCurrentSession({ analysisCards: cards })
    }
  }

  /**
   * Deletes an analysis card
   * @param {string} cardId - The card ID to delete
   */
  function deleteAnalysisCard(cardId) {
    if (!currentSession.value) return

    const cards = currentSession.value.analysisCards.filter(c => c.id !== cardId)
    updateCurrentSession({ analysisCards: cards })
  }

  // ============================================
  // Step 3: Solutions Actions
  // ============================================
  
  /**
   * Generates solutions based on the deep analysis
   * @async
   * @returns {Promise<void>}
   */
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

  /**
   * Updates a solution's content
   * @async
   * @param {string} id - The solution ID
   * @param {Object} content - New content to merge
   * @returns {Promise<void>}
   */
  async function updateSolution(id, content) {
    if (!currentSession.value) return
    
    const solutions = [...currentSession.value.solutions]
    const index = solutions.findIndex(s => s.id === id)
    if (index !== -1) {
      solutions[index] = { ...solutions[index], ...content }
      updateCurrentSession({ solutions })
    }
  }

  /**
   * Regenerates a solution with user feedback
   * @async
   * @param {string} id - The solution ID to regenerate
   * @param {string} feedback - User's feedback for improvement
   * @returns {Promise<void>}
   */
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

      solutions[index] = { ...newSolution, id: oldSolution.id }
      
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

  /**
   * Generates a mind map visualization
   * Uses caching to avoid redundant AI calls
   * @async
   * @returns {Promise<void>}
   */
  async function generateMindMap() {
    if (!currentSession.value) return

    const currentHash = generateHash(JSON.stringify({
      problem: currentSession.value.problem,
      cards: currentSession.value.analysisCards,
      solutions: currentSession.value.solutions
    }))

    if (currentSession.value.mindMap && currentSession.value.mindMapHash === currentHash) {
      return
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
    currentSession,
    loading,
    error,
    aiStatus,
    aiStatusMessage,
    aiResponseCount,
    currentStep,
    problem,
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
