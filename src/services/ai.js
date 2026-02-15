/**
 * AI Service - OpenAI Universal API Integration
 * 深度思界 AI 服务层
 */

import { getPrompt } from './prompts'
import i18n from '../i18n'
import OpenAI from 'openai'

/**
 * 深度思界思维模型库
 * 仅包含元数据，文本内容已移至 locale 文件
 */
export const THINKING_MODELS = {
  // ==================== 逻辑思考能力领域 ====================
  'MECE': { id: 'MECE', icon: 'Target', category: '逻辑思考' },
  'PyramidPrinciple': { id: 'PyramidPrinciple', icon: 'Triangle', category: '逻辑思考' },
  'SixThinkingHats': { id: 'SixThinkingHats', icon: 'Brain', category: '逻辑思考' },
  'PREP': { id: 'PREP', icon: 'FileText', category: '逻辑思考' },
  'InductiveDeductive': { id: 'InductiveDeductive', icon: 'GitBranch', category: '逻辑思考' },

  // ==================== 创意与想象力领域 ====================
  'WrittenBrainstorming': { id: 'WrittenBrainstorming', icon: 'Edit3', category: '创意思维' },
  'KJMethod': { id: 'KJMethod', icon: 'LayoutGrid', category: '创意思维' },
  'MandalaThinking': { id: 'MandalaThinking', icon: 'Grid', category: '创意思维' },
  'SCAMPER': { id: 'SCAMPER', icon: 'Lightbulb', category: '创意思维' },
  'ProsConsList': { id: 'ProsConsList', icon: 'Scale', category: '创意思维' },

  // ==================== 问题解决领域 ====================
  '5W2H': { id: '5W2H', icon: 'Search', category: '问题解决' },
  'LogicTree': { id: 'LogicTree', icon: 'Network', category: '问题解决' },
  'SkyRainUmbrella': { id: 'SkyRainUmbrella', icon: 'Umbrella', category: '问题解决' },
  'EisenhowerMatrix': { id: 'EisenhowerMatrix', icon: 'ListChecks', category: '问题解决' },
  'HypothesisThinking': { id: 'HypothesisThinking', icon: 'Target', category: '问题解决' },

  // ==================== 市场营销战略领域 ====================
  'SWOT': { id: 'SWOT', icon: 'LayoutDashboard', category: '市场营销' },
  'PEST': { id: 'PEST', icon: 'Globe', category: '市场营销' },
  'Model3C': { id: 'Model3C', icon: 'Users', category: '市场营销' },
  'STPAnalysis': { id: 'STPAnalysis', icon: 'Crosshair', category: '市场营销' },
  'FiveForces': { id: 'FiveForces', icon: 'Shield', category: '市场营销' },
  '4Ps': { id: '4Ps', icon: 'Package', category: '市场营销' },
  'AIDMA': { id: 'AIDMA', icon: 'ShoppingCart', category: '市场营销' },
  'ProductLifecycle': { id: 'ProductLifecycle', icon: 'TrendingUp', category: '市场营销' },
  'BCGMatrix': { id: 'BCGMatrix', icon: 'PieChart', category: '市场营销' },

  // ==================== 组织与团队领域 ====================
  'PDCA': { id: 'PDCA', icon: 'RotateCw', category: '组织团队' },
  'SevenSModel': { id: 'SevenSModel', icon: 'Layers', category: '组织团队' },
  'MaslowHierarchy': { id: 'MaslowHierarchy', icon: 'Signal', category: '组织团队' },
  'RootCause': { id: 'RootCause', icon: 'Microscope', category: '问题解决' },
  'ParetoAnalysis': { id: 'ParetoAnalysis', icon: 'BarChart', category: '问题解决' },

  // ==================== 经营战略领域 ====================
  'AnsoffMatrix': { id: 'AnsoffMatrix', icon: 'Move', category: '经营战略' },
  'PortersGenericStrategies': { id: 'PortersGenericStrategies', icon: 'Swords', category: '经营战略' },
  'ValueChain': { id: 'ValueChain', icon: 'Link', category: '经营战略' },
  'ScenarioPlanning': { id: 'ScenarioPlanning', icon: 'Drama', category: '经营战略' },
  'DecisionMatrix': { id: 'DecisionMatrix', icon: 'Calculator', category: '问题解决' },
  'StakeholderAnalysis': { id: 'StakeholderAnalysis', icon: 'Users', category: '组织团队' }
}

/**
 * 默认配置
 */
const DEFAULT_BASE_URL = 'https://api.deepseek.com/v1'
const DEFAULT_MODEL = 'deepseek-chat'

/**
 * 获取存储的 AI 配置
 */
export function getAiConfig() {
  const config = localStorage.getItem('ideaverse_ai_config')
  if (config) {
    try {
      return JSON.parse(config)
    } catch {
      // 如果解析失败，返回默认值
    }
  }
  return {
    baseUrl: DEFAULT_BASE_URL,
    apiKey: '',
    model: DEFAULT_MODEL
  }
}

/**
 * 设置 AI 配置
 */
export function setAiConfig(config) {
  localStorage.setItem('ideaverse_ai_config', JSON.stringify({
    baseUrl: config.baseUrl || DEFAULT_BASE_URL,
    apiKey: config.apiKey || '',
    model: config.model || DEFAULT_MODEL
  }))
}

/**
 * 获取 API Key (兼容旧版本)
 */
export function getApiKey() {
  return getAiConfig().apiKey
}

/**
 * 设置 API Key (兼容旧版本)
 */
export function setApiKey(key) {
  const config = getAiConfig()
  config.apiKey = key
  setAiConfig(config)
}

/**
 * 检查 API Key 是否已配置
 */
export function hasApiKey() {
  return !!getApiKey()
}

/**
 * 调用 OpenAI 兼容 API
 */
async function callOpenAI(messages, options = {}, onProgress = null) {
  const config = getAiConfig()
  if (!config.apiKey) {
    throw new Error('请先配置 API Key')
  }

  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true
  })

  const stream = await openai.chat.completions.create({
    model: config.model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens || 2000,
    stream: true
  })

  let fullContent = ''
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      fullContent += content
      if (onProgress) {
        onProgress(fullContent.length)
      }
    }
  }

  return fullContent
}

/**
 * 清理 JSON 字符串中的问题
 */
function cleanJsonString(jsonStr) {
  let cleaned = jsonStr
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
  cleaned = cleaned.replace(/:\s*\*\*"([^"]*)"\*\*/g, ':"$1"')
  cleaned = cleaned.replace(/:\s*\*\*([^,}\]"]+)\*\*/g, ':"$1"')
  return cleaned
}

/**
 * 解析 JSON 响应
 */
function parseJsonResponse(content) {
  console.log('[parseJsonResponse] 原始内容:', content)
  
  const tryParse = (str) => {
    try {
      return JSON.parse(str)
    } catch (e) {
      console.log('[parseJsonResponse] 解析失败:', str, e)
      return null
    }
  }

  const extractAndParse = (str) => {
    const jsonBlockMatch = str.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonBlockMatch) {
      const cleaned = cleanJsonString(jsonBlockMatch[1].trim())
      const result = tryParse(cleaned)
      if (result) return result
    }

    const codeBlockMatch = str.match(/```\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      const cleaned = cleanJsonString(codeBlockMatch[1].trim())
      const result = tryParse(cleaned)
      if (result) return result
    }

    const firstBrace = str.indexOf('{')
    const lastBrace = str.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const cleaned = cleanJsonString(str.substring(firstBrace, lastBrace + 1))
      const result = tryParse(cleaned)
      if (result) return result
    }

    const cleaned = cleanJsonString(str.trim())
    const result = tryParse(cleaned)
    if (result) return result

    return null
  }

  const result = extractAndParse(content)
  if (result) return result

  console.error('JSON 解析失败，尝试激进清理...')
  let aggressiveCleaned = content
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
  
  const lastResult = extractAndParse(aggressiveCleaned)
  if (lastResult) return lastResult

  try {
    const repaired = tryFixTruncatedJson(content)
    const repairedResult = extractAndParse(repaired)
    if (repairedResult) {
      return repairedResult
    }
  } catch (e) {
    console.warn('尝试修复 JSON 失败:', e)
  }

  throw new Error('AI 返回内容格式错误，无法解析 JSON。请重试。')
}

/**
 * 尝试修复截断的 JSON 字符串
 */
function tryFixTruncatedJson(jsonStr) {
  let stack = []
  let inString = false
  let escaped = false
  
  let start = jsonStr.indexOf('{')
  const startArr = jsonStr.indexOf('[')
  if (start === -1 || (startArr !== -1 && startArr < start)) {
    start = startArr
  }
  
  if (start === -1) return jsonStr
  
  const content = jsonStr.substring(start)
  
  for (const char of content) {
    if (escaped) {
      escaped = false
      continue
    }
    
    if (char === '\\') {
      escaped = true
      continue
    }
    
    if (char === '"') {
      inString = !inString
      continue
    }
    
    if (!inString) {
      if (char === '{') {
        stack.push('}')
      } else if (char === '[') {
        stack.push(']')
      } else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop()
        }
      }
    }
  }
  
  let fixed = content
  if (inString) {
    fixed += '"'
  }
  
  while (stack.length > 0) {
    fixed += stack.pop()
  }
  
  return fixed
}

/**
 * 步骤一：生成采访问题
 */
export async function generateInterviewQuestions(problem, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('interview_system', {}, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US' 
        ? `The problem I need to think deeply about is: ${problem}`
        : `我需要深度思考的问题是：${problem}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤一：生成问题理解分析报告
 */
export async function generateUnderstandingReport(problem, answers, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('understanding_system', {}, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nUser Answers:\n${answers.map((a, i) => `Question ${i + 1}: ${a.question}\nAnswer: ${a.answer}`).join('\n\n')}`
        : `深思问题：${problem}\n\n用户的回答：\n${answers.map((a, i) => `问题${i + 1}: ${a.question}\n回答: ${a.answer}`).join('\n\n')}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：使用思维模型进行深度分析 (遗留)
 */
export async function analyzeWithThinkingModels(problem, understandingReport, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('analyze_general_system', {}, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nUnderstanding Report:\n${JSON.stringify(understandingReport, null, 2)}`
        : `深思问题：${problem}\n\n问题理解报告：\n${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 8000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：重新分析某个维度
 */
export async function reanalyzeCard(problem, card, feedback, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('reanalyze_card_system', { cardId: card.id }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nCurrent Analysis:\n${JSON.stringify(card, null, 2)}\n\nUser Feedback: ${feedback || 'Please provide deeper and more accurate analysis'}`
        : `深思问题：${problem}\n\n当前分析内容：\n${JSON.stringify(card, null, 2)}\n\n用户反馈：${feedback || '请提供更深入、更准确的分析'}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤三：生成解决方案
 */
export async function generateSolutions(problem, analysisReport, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('solutions_system', {}, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nDeep Analysis Report:\n${JSON.stringify(analysisReport, null, 2)}`
        : `深思问题：${problem}\n\n深度分析报告：\n${JSON.stringify(analysisReport, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 8000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤三：重新生成某个方案
 */
export async function regenerateSolution(problem, solution, feedback, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('regenerate_solution_system', { solutionId: solution.id }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nCurrent Solution:\n${JSON.stringify(solution, null, 2)}\n\nUser Feedback: ${feedback || 'Please provide a more feasible and effective solution'}`
        : `深思问题：${problem}\n\n当前方案：\n${JSON.stringify(solution, null, 2)}\n\n用户反馈：${feedback || '请提供更可行、更有效的方案'}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 生成完整思维导图 Markdown
 */
export async function generateMindMap(problem, analysisCards, solutions, onProgress, lang = 'zh-CN') {
  const messages = [
    {
      role: 'system',
      content: getPrompt('mindmap_system', {}, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nAnalysis Cards:\n${JSON.stringify(analysisCards, null, 2)}\n\nSolutions:\n${JSON.stringify(solutions, null, 2)}`
        : `深思问题：${problem}\n\n分析卡片：\n${JSON.stringify(analysisCards, null, 2)}\n\n解决方案：\n${JSON.stringify(solutions, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 8000 }, onProgress)
  return response
}

/**
 * 推荐适合问题的思维模型
 */
export async function recommendThinkingModels(problem, understandingReport, onProgress, lang = 'zh-CN') {
  // 动态生成模型列表
  const t = (key) => i18n.global.t(key, { locale: lang })
  
  const modelList = Object.values(THINKING_MODELS).map(m =>
    `- ${m.id}: ${t(`thinking_models.${m.id}.name`)} - ${t(`thinking_models.${m.id}.description`)}`
  ).join('\n')

  const messages = [
    {
      role: 'system',
      content: getPrompt('recommend_models_system', { modelList }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nUnderstanding Report: ${JSON.stringify(understandingReport, null, 2)}`
        : `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 3000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 使用指定思维模型进行分析
 */
export async function analyzeWithSpecificModel(problem, understandingReport, modelId, onProgress, lang = 'zh-CN') {
  const model = THINKING_MODELS[modelId]
  if (!model) throw new Error(`Unknown thinking model: ${modelId}`)

  const t = (key) => i18n.global.t(key, { locale: lang })
  
  const messages = [
    {
      role: 'system',
      content: getPrompt('analyze_specific_model_system', {
        modelName: t(`thinking_models.${modelId}.name`),
        modelDesc: t(`thinking_models.${modelId}.description`),
        modelAdvantage: t(`thinking_models.${modelId}.advantage`),
        modelId: modelId
      }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nUnderstanding Report: ${JSON.stringify(understandingReport, null, 2)}`
        : `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 8000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：使用指定思维模型进行分析 - 第一步：生成分析维度
 */
export async function generateAnalysisDimensions(problem, understandingReport, modelId, onProgress, lang = 'zh-CN') {
  const model = THINKING_MODELS[modelId]
  if (!model) throw new Error(`Unknown thinking model: ${modelId}`)

  const t = (key) => i18n.global.t(key, { locale: lang })

  const messages = [
    {
      role: 'system',
      content: getPrompt('analysis_dimensions_system', {
        modelName: t(`thinking_models.${modelId}.name`),
        modelDesc: t(`thinking_models.${modelId}.description`),
        modelId: modelId
      }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nUnderstanding Report: ${JSON.stringify(understandingReport, null, 2)}`
        : `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 2000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：使用指定思维模型进行分析 - 第二步：分析单个维度
 */
export async function analyzeDimension(problem, understandingReport, modelId, dimension, onProgress, lang = 'zh-CN') {
  const model = THINKING_MODELS[modelId]
  
  if (!model) {
    throw new Error(`Unknown thinking model ID: ${modelId}`)
  }

  const t = (key) => i18n.global.t(key, { locale: lang })

  const messages = [
    {
      role: 'system',
      content: getPrompt('analysis_card_system', {
        modelName: t(`thinking_models.${modelId}.name`),
        dimensionName: dimension.dimension,
        dimensionId: dimension.id,
        dimensionIcon: dimension.icon
      }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nUnderstanding Report: ${JSON.stringify(understandingReport, null, 2)}\n\nCurrent Dimension: ${JSON.stringify(dimension)}`
        : `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}\n\n当前分析维度：${JSON.stringify(dimension)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 3000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 压缩分析卡片内容
 */
function compressAnalysisCards(cards) {
  if (!Array.isArray(cards)) return []
  
  return cards.map(card => {
    const truncate = (str, len = 200) => {
      if (!str) return ''
      return str.length > len ? str.substring(0, len) + '...' : str
    }

    return {
      dimension: card.dimension,
      phenomenon: truncate(card.phenomenon),
      cause: truncate(card.cause),
      impact: truncate(card.impact),
      hiddenFactors: truncate(card.hiddenFactors)
    }
  })
}

/**
 * 步骤二：使用指定思维模型进行分析 - 第三步：生成汇总报告
 */
export async function generateDeepAnalysisReport(problem, understandingReport, modelId, analysisCards, onProgress, lang = 'zh-CN') {
  const model = THINKING_MODELS[modelId]
  const t = (key) => i18n.global.t(key, { locale: lang })
  
  const compressedCards = compressAnalysisCards(analysisCards)
  
  const messages = [
    {
      role: 'system',
      content: getPrompt('analysis_report_system', { 
        modelName: t(`thinking_models.${modelId}.name`) 
      }, lang)
    },
    {
      role: 'user',
      content: lang === 'en-US'
        ? `Problem: ${problem}\n\nAnalysis Cards Summary: ${JSON.stringify(compressedCards, null, 2)}`
        : `深思问题：${problem}\n\n分析卡片摘要内容：${JSON.stringify(compressedCards, null, 2)}`
    }
  ]

  const response = await callOpenAI(messages, { maxTokens: 4000 }, onProgress)
  return response
}

export default {
  getAiConfig,
  setAiConfig,
  getApiKey,
  setApiKey,
  hasApiKey,
  THINKING_MODELS,
  generateInterviewQuestions,
  generateUnderstandingReport,
  recommendThinkingModels,
  analyzeWithThinkingModels,
  analyzeWithSpecificModel,
  generateAnalysisDimensions,
  analyzeDimension,
  generateDeepAnalysisReport,
  reanalyzeCard,
  generateSolutions,
  regenerateSolution,
  generateMindMap
}
