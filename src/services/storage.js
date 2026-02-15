/**
 * Storage Service - 本地存储服务
 * 深度思界 数据持久化层
 */

const STORAGE_KEYS = {
    SESSIONS: 'ideaverse_sessions',
    CURRENT_SESSION: 'ideaverse_current_session',
    API_KEY: 'ideaverse_api_key',
    SETTINGS: 'ideaverse_settings'
}

/**
 * 生成唯一 ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 获取所有会话列表
 */
export function getSessions() {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    return data ? JSON.parse(data) : []
}

/**
 * 获取单个会话
 */
export function getSession(id) {
    const sessions = getSessions()
    return sessions.find(s => s.id === id) || null
}

/**
 * 创建新会话
 * 
 * 初始化一个新的分析会话，包含完整的状态结构。
 * 
 * 会话结构说明:
 * - id: 唯一标识符
 * - problem: 用户输入的初始问题
 * - currentStep: 当前所处步骤 (1: 采访, 2: 分析, 3: 方案)
 * - status: 会话状态 (in_progress, completed)
 * - interviewQuestions: 步骤一生成的采访问题
 * - interviewAnswers: 用户对采访问题的回答
 * - understandingReport: 步骤一生成的问题理解报告
 * - analysisCards: 步骤二生成的各个维度分析卡片
 * - deepAnalysisReport: 步骤二生成的深度分析汇总报告
 * - solutions: 步骤三生成的解决方案列表
 * - mindMap: 最终生成的思维导图
 * 
 * @param {string} problem - 用户的初始问题
 * @returns {Object} - 新创建的会话对象
 */
export function createSession(problem) {
    const session = {
        id: generateId(),
        problem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentStep: 1,
        status: 'in_progress', // in_progress, completed

        // 步骤一数据
        interviewQuestions: null,
        interviewAnswers: [],
        understandingReport: null,

        // 步骤二数据
        analysisCards: [],
        deepAnalysisReport: null,

        // 步骤三数据
        solutions: [],
        recommendation: null,
        mindMap: null
    }

    const sessions = getSessions()
    sessions.unshift(session) // 新会话放在最前面
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    setCurrentSessionId(session.id)

    return session
}

/**
 * 更新会话
 */
export function updateSession(id, updates) {
    const sessions = getSessions()
    const index = sessions.findIndex(s => s.id === id)

    if (index !== -1) {
        sessions[index] = {
            ...sessions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        }
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
        return sessions[index]
    }

    return null
}

/**
 * 删除会话
 */
export function deleteSession(id) {
    const sessions = getSessions()
    const filtered = sessions.filter(s => s.id !== id)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered))

    // 如果删除的是当前会话，清除当前会话 ID
    if (getCurrentSessionId() === id) {
        setCurrentSessionId(null)
    }
}

/**
 * 获取当前会话 ID
 */
export function getCurrentSessionId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
}

/**
 * 设置当前会话 ID
 */
export function setCurrentSessionId(id) {
    if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, id)
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
    }
}

/**
 * 获取当前会话
 */
export function getCurrentSession() {
    const id = getCurrentSessionId()
    return id ? getSession(id) : null
}

/**
 * 获取设置
 */
export function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? JSON.parse(data) : {
        theme: 'dark',
        autoSave: true
    }
}

/**
 * 更新设置
 */
export function updateSettings(updates) {
    const settings = getSettings()
    const newSettings = { ...settings, ...updates }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings))
    return newSettings
}

/**
 * 导出会话数据
 */
export function exportSession(id) {
    const session = getSession(id)
    if (!session) return null

    return JSON.stringify(session, null, 2)
}

/**
 * 导出思维导图
 */
export function exportMindMap(id) {
    const session = getSession(id)
    if (!session || !session.mindMap) return null

    return session.mindMap
}

/**
 * 清除所有数据
 */
export function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
    })
}

export default {
    getSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    getCurrentSessionId,
    setCurrentSessionId,
    getCurrentSession,
    getSettings,
    updateSettings,
    exportSession,
    exportMindMap,
    clearAllData
}
