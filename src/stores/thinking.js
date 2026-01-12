import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as storage from '../services/storage'
import * as ai from '../services/ai'

export const useThinkingStore = defineStore('thinking', () => {
    // === 核心状态 ===
    
    // 当前会话对象，包含所有业务数据
    const currentSession = ref(null)

    // === UI 状态 ===

    // 全局加载状态 (用于全屏 Loading 遮罩)
    const loading = ref(false)
    const loadingMessage = ref('')

    // AI 交互状态 (用于细粒度的 UI 反馈)
    // idle: 空闲
    // requesting: 请求已发送，等待响应
    // receiving: 正在接收流式数据
    // completed: 请求完成
    const aiStatus = ref('idle') 
    const aiResponseCount = ref(0) // 接收到的字符数，用于展示"思考中..."的动态效果
    const aiStatusMessage = ref('') // 当前正在进行的 AI 任务描述

    // 错误状态
    const error = ref(null)

    // === 计算属性 ===
    const currentStep = computed(() => currentSession.value?.currentStep || 1)
    const problem = computed(() => currentSession.value?.problem || '')
    const isCompleted = computed(() => currentSession.value?.status === 'completed')

    // 加载当前会话
    function loadCurrentSession() {
        const session = storage.getCurrentSession()
        if (session) {
            currentSession.value = session
        }
        return session
    }

    // 加载指定会话
    function loadSession(id) {
        const session = storage.getSession(id)
        if (session) {
            currentSession.value = session
            storage.setCurrentSessionId(id)
        }
        return session
    }

    // 创建新会话
    function createNewSession(problemText) {
        const session = storage.createSession(problemText)
        currentSession.value = session
        return session
    }

    // 更新当前会话
    function updateCurrentSession(updates) {
        if (!currentSession.value) return null

        const updated = storage.updateSession(currentSession.value.id, updates)
        if (updated) {
            currentSession.value = updated
        }
        return updated
    }

    // 设置加载状态
    function setLoading(isLoading, message = '') {
        loading.value = isLoading
        loadingMessage.value = message
        if (!isLoading) {
            error.value = null
        }
    }

    // 设置 AI 状态
    function setAiStatus(status, message = '') {
        aiStatus.value = status
        if (message) aiStatusMessage.value = message
        if (status === 'requesting') {
            aiResponseCount.value = 0
            loading.value = true // 同步更新 loading 状态以兼容现有逻辑
        } else if (status === 'idle' || status === 'completed') {
            loading.value = false
        }
    }

    // 更新 AI 响应计数
    function updateAiCount(count) {
        if (aiStatus.value !== 'receiving') {
            aiStatus.value = 'receiving'
        }
        aiResponseCount.value = count
    }

    // 重置 AI 状态
    function resetAiStatus() {
        aiStatus.value = 'idle'
        aiResponseCount.value = 0
        aiStatusMessage.value = ''
        loading.value = false
    }

    // 设置错误
    function setError(err) {
        error.value = err
        loading.value = false
    }

    // 清除错误
    function clearError() {
        error.value = null
    }

    // === 步骤一：采访问答 ===

    // 生成采访问题
    async function generateQuestions() {
        if (!currentSession.value) return

        setAiStatus('requesting', '正在生成采访问题...')
        try {
            const result = await ai.generateInterviewQuestions(
                currentSession.value.problem,
                (count) => updateAiCount(count)
            )
            updateCurrentSession({
                interviewQuestions: result.questions
            })
            return result.questions
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 保存采访答案
    function saveAnswer(questionId, question, answer) {
        if (!currentSession.value) return

        const answers = [...(currentSession.value.interviewAnswers || [])]
        const existingIndex = answers.findIndex(a => a.questionId === questionId)

        if (existingIndex !== -1) {
            answers[existingIndex] = { questionId, question, answer }
        } else {
            answers.push({ questionId, question, answer })
        }

        updateCurrentSession({ interviewAnswers: answers })
    }

    // 生成理解报告
    async function generateUnderstandingReport() {
        if (!currentSession.value) return

        setAiStatus('requesting', '正在生成问题理解报告...')
        try {
            const result = await ai.generateUnderstandingReport(
                currentSession.value.problem,
                currentSession.value.interviewAnswers,
                (count) => updateAiCount(count)
            )
            updateCurrentSession({
                understandingReport: result,
                currentStep: 2
            })
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // === 步骤二：深度分析 ===

    // 推荐思维模型
    async function recommendModels() {
        if (!currentSession.value) return

        setAiStatus('requesting', '正在分析最适合的思维模型...')
        try {
            const result = await ai.recommendThinkingModels(
                currentSession.value.problem,
                currentSession.value.understandingReport,
                (count) => updateAiCount(count)
            )
            updateCurrentSession({
                recommendedModels: result.recommendedModels,
                modelReasons: result.reasons
            })
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 使用指定思维模型分析
    async function analyzeWithModel(modelId) {
        if (!currentSession.value) return

        const modelName = ai.THINKING_MODELS[modelId]?.name || modelId
        setAiStatus('requesting', `正在准备使用「${modelName}」进行深度分析...`)
        
        try {
            // 1. 第一步：生成分析维度
            const dimensionsResult = await ai.generateAnalysisDimensions(
                currentSession.value.problem,
                currentSession.value.understandingReport,
                modelId,
                (count) => updateAiCount(count)
            )
            
            // 初始化分析卡片（占位符状态）
            const initialCards = dimensionsResult.dimensions.map(d => ({
                id: d.id,
                dimension: d.dimension,
                icon: d.icon,
                description: d.description,
                status: 'pending' // pending, analyzing, completed
            }))
            
            updateCurrentSession({
                thinkingModel: dimensionsResult.thinkingModel,
                thinkingModelId: modelId,
                analysisCards: initialCards,
                deepAnalysisReport: null // 清空旧报告
            })
            
            // 维度生成完毕，进入卡片渐进式分析模式
            // 注意：这里不调用 resetAiStatus，而是继续保持活跃状态或更新状态
            
            // 2. 第二步：并发分析所有维度
            setAiStatus('requesting', `正在并行分析 ${dimensionsResult.dimensions.length} 个维度...`)
            
            // 更新所有卡片状态为分析中
            dimensionsResult.dimensions.forEach(dim => {
                updateAnalysisCard(dim.id, { status: 'analyzing' })
            })

            const completedCards = []
            
            // 创建所有分析任务
            const analysisTasks = dimensionsResult.dimensions.map(async (dim) => {
                try {
                    const cardResult = await ai.analyzeDimension(
                        currentSession.value.problem,
                        currentSession.value.understandingReport,
                        modelId,
                        dim,
                        (count) => {
                            // 简单的累计计数可能不太准确，但在并发下也能提供一种活跃的反馈
                            // 也可以选择不传递 count，或者只显示"分析中..."
                            updateAiCount(aiResponseCount.value + 10) 
                        }
                    )
                    
                    const completedCard = {
                        ...cardResult,
                        status: 'completed'
                    }
                    updateAnalysisCard(dim.id, completedCard)
                    completedCards.push(completedCard)
                    return completedCard
                } catch (e) {
                    console.error(`维度 ${dim.dimension} 分析失败:`, e)
                    updateAnalysisCard(dim.id, { status: 'pending', description: '分析失败，请重试' })
                    return null
                }
            })

            // 等待所有任务完成
            await Promise.all(analysisTasks)
            
            // 过滤掉失败的卡片
            const validCards = completedCards.filter(c => c !== null)
            
            return {
                thinkingModel: dimensionsResult.thinkingModel,
                thinkingModelId: modelId,
                analysisCards: validCards,
                fullReport: null
            }
            
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 生成完整分析报告
    async function generateFullReport() {
        if (!currentSession.value) return

        const { problem, understandingReport, thinkingModelId, analysisCards } = currentSession.value
        if (!thinkingModelId || !analysisCards || analysisCards.length === 0) return

        setAiStatus('requesting', '正在生成深度分析汇总报告...')
        try {
            const fullReport = await ai.generateDeepAnalysisReport(
                problem,
                understandingReport,
                thinkingModelId,
                analysisCards,
                (count) => updateAiCount(count)
            )
            
            updateCurrentSession({
                deepAnalysisReport: fullReport
            })
            
            return fullReport
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 生成分析卡片
    async function generateAnalysis() {
        if (!currentSession.value) return

        setAiStatus('requesting', '正在运用思维模型进行深度分析...')
        try {
            const result = await ai.analyzeWithThinkingModels(
                currentSession.value.problem,
                currentSession.value.understandingReport,
                (count) => updateAiCount(count)
            )
            updateCurrentSession({
                analysisCards: result.analysisCards,
                thinkingModel: result.thinkingModel,
                deepAnalysisReport: result.fullReport
            })
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 更新分析卡片
    function updateAnalysisCard(cardId, updates) {
        if (!currentSession.value) return

        const cards = [...(currentSession.value.analysisCards || [])]
        const index = cards.findIndex(c => c.id === cardId)

        if (index !== -1) {
            cards[index] = { ...cards[index], ...updates }
            updateCurrentSession({ analysisCards: cards })
        }
    }

    // 删除分析卡片
    function deleteAnalysisCard(cardId) {
        if (!currentSession.value) return

        const cards = (currentSession.value.analysisCards || []).filter(c => c.id !== cardId)
        updateCurrentSession({ analysisCards: cards })
    }

    // 重新分析卡片
    async function reanalyzeCard(cardId, feedback) {
        if (!currentSession.value) return

        const card = currentSession.value.analysisCards?.find(c => c.id === cardId)
        if (!card) return

        // 显式设置为分析中状态，确保 UI 显示 Loading
        updateAnalysisCard(cardId, { status: 'analyzing' })
        setAiStatus('requesting', '正在重新分析...')
        
        try {
            const result = await ai.reanalyzeCard(
                currentSession.value.problem,
                card,
                feedback,
                (count) => updateAiCount(count)
            )
            // 更新卡片内容并显式设置为完成状态
            updateAnalysisCard(cardId, { ...result, status: 'completed' })
            return result
        } catch (err) {
            setError(err.message)
            // 如果出错，可能需要重置卡片状态或保持现状？
            // 暂时保持 analyzing 或 pending 可能更好，或者回退
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 确认分析报告并进入下一步
    function confirmAnalysisReport() {
        updateCurrentSession({ currentStep: 3 })
    }

    // === 步骤三：方案生成与评估 ===

    // 生成解决方案
    async function generateSolutions() {
        if (!currentSession.value) return

        setAiStatus('requesting', '正在进行头脑风暴，生成解决方案...')
        try {
            const result = await ai.generateSolutions(
                currentSession.value.problem,
                {
                    understandingReport: currentSession.value.understandingReport,
                    analysisCards: currentSession.value.analysisCards,
                    deepAnalysisReport: currentSession.value.deepAnalysisReport
                },
                (count) => updateAiCount(count)
            )
            updateCurrentSession({
                solutions: result.solutions,
                recommendation: result.recommendation
            })
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 更新解决方案
    function updateSolution(solutionId, updates) {
        if (!currentSession.value) return

        const solutions = [...(currentSession.value.solutions || [])]
        const index = solutions.findIndex(s => s.id === solutionId)

        if (index !== -1) {
            solutions[index] = { ...solutions[index], ...updates }
            updateCurrentSession({ solutions })
        }
    }

    // 重新生成解决方案
    async function regenerateSolution(solutionId, feedback) {
        if (!currentSession.value) return

        const solution = currentSession.value.solutions?.find(s => s.id === solutionId)
        if (!solution) return

        setAiStatus('requesting', '正在重新生成方案...')
        try {
            const result = await ai.regenerateSolution(
                currentSession.value.problem,
                solution,
                feedback,
                (count) => updateAiCount(count)
            )
            updateSolution(solutionId, result)
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 生成思维导图
    async function generateMindMap() {
        if (!currentSession.value) return

        // 1. 构建当前上下文对象，包含所有影响思维导图生成的输入数据
        const context = {
            problem: currentSession.value.problem,
            understandingReport: currentSession.value.understandingReport,
            thinkingModel: currentSession.value.thinkingModel,
            analysisCards: currentSession.value.analysisCards,
            solutions: currentSession.value.solutions,
            recommendation: currentSession.value.recommendation
        }

        // 2. 计算当前上下文的哈希值
        const currentHash = generateHash(JSON.stringify(context))

        // 3. 检查缓存：如果思维导图已存在且哈希值匹配，直接返回缓存
        if (currentSession.value.mindMap && currentSession.value.mindMapHash === currentHash) {
            console.log('Using cached Mind Map')
            return currentSession.value.mindMap
        }

        setAiStatus('requesting', '正在生成思维导图...')
        try {
            const mindMap = await ai.generateMindMap(
                currentSession.value.problem,
                currentSession.value.understandingReport,
                {
                    thinkingModel: currentSession.value.thinkingModel,
                    analysisCards: currentSession.value.analysisCards
                },
                {
                    solutions: currentSession.value.solutions,
                    recommendation: currentSession.value.recommendation
                },
                (count) => updateAiCount(count)
            )
            updateCurrentSession({
                mindMap,
                mindMapHash: currentHash, // 保存哈希值
                status: 'completed'
            })
            return mindMap
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            resetAiStatus()
        }
    }

    // 重置会话
    function resetSession() {
        currentSession.value = null
        storage.setCurrentSessionId(null)
    }

    return {
        // 状态
        currentSession,
        loading,
        loadingMessage,
        aiStatus,
        aiResponseCount,
        aiStatusMessage,
        error,

        // 计算属性
        currentStep,
        problem,
        isCompleted,

        // 方法
        loadCurrentSession,
        loadSession,
        createNewSession,
        updateCurrentSession,
        setLoading,
        setError,
        clearError,
        resetSession,

        // 步骤一
        generateQuestions,
        saveAnswer,
        generateUnderstandingReport,

        // 步骤二
        recommendModels,
        analyzeWithModel,
        generateFullReport,
        generateAnalysis,
        updateAnalysisCard,
        deleteAnalysisCard,
        reanalyzeCard,
        confirmAnalysisReport,

        // 步骤三
        generateSolutions,
        updateSolution,
        regenerateSolution,
        generateMindMap
    }
})
