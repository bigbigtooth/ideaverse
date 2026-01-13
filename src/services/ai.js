/**
 * AI Service - DeepSeek API Integration
 * 深度思界 AI 服务层
 */

import { getPrompt } from './prompts'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

/**
 * 深度思界思维模型库
 * 包含6大领域共40+个经典思维模型
 */
export const THINKING_MODELS = {
  // ==================== 逻辑思考能力领域 ====================
  'MECE': {
    id: 'MECE',
    name: 'MECE 分解法',
    icon: 'Target',
    category: '逻辑思考',
    description: '相互独立，完全穷尽。将复杂问题分解为不重叠、不遗漏的子问题。',
    advantage: '确保分析无遗漏、无重复，是战略咨询的黄金法则',
    bestFor: ['战略规划', '问题诊断', '市场分析']
  },
  'PyramidPrinciple': {
    id: 'PyramidPrinciple',
    name: '金字塔原理',
    icon: 'Triangle',
    category: '逻辑思考',
    description: '结论先行、以上统下、归类分组、逻辑递进的思考与表达框架。',
    advantage: '提升沟通效率与说服力，让观点清晰有力',
    bestFor: ['商务写作', '结构化表达', '演讲汇报']
  },
  'SixThinkingHats': {
    id: 'SixThinkingHats',
    name: '六顶思考帽',
    icon: 'Brain',
    category: '逻辑思考',
    description: '通过六种不同思考视角（白/红/黑/黄/绿/蓝帽）激活多元思维。',
    advantage: '避免单一偏见，实现平行思考，提升团队协作效率',
    bestFor: ['团队决策', '创新思维', '问题分析']
  },
  'PREP': {
    id: 'PREP',
    name: 'PREP 法',
    icon: 'FileText',
    category: '逻辑思考',
    description: '结论-理由-例证-结论的结构化表达方法。',
    advantage: '实现逻辑清晰的表达，快速抓住听众注意力',
    bestFor: ['即兴演讲', '面试回答', '工作汇报']
  },
  'InductiveDeductive': {
    id: 'InductiveDeductive',
    name: '归纳演绎法',
    icon: 'GitBranch',
    category: '逻辑思考',
    description: '归纳法从具体事例总结规律，演绎法从一般原理推导具体结论。',
    advantage: '双管齐下的推理方式，确保论证严密性',
    bestFor: ['逻辑推理', '科学分析', '论证构建']
  },

  // ==================== 创意与想象力领域 ====================
  'WrittenBrainstorming': {
    id: 'WrittenBrainstorming',
    name: '书面头脑风暴法',
    icon: 'Edit3',
    category: '创意思维',
    description: '通过书面形式（635法）收集创意，确保每个人观点被平等重视。',
    advantage: '避免口头讨论的偏见，让内向者也能充分参与',
    bestFor: ['团队创新', '创意收集', '问题解决']
  },
  'KJMethod': {
    id: 'KJMethod',
    name: 'KJ 法',
    icon: 'LayoutGrid',
    category: '创意思维',
    description: '通过卡片分类整合碎片化信息，形成系统性创意。',
    advantage: '将杂乱信息转化为有序知识结构',
    bestFor: ['信息整理', '创意整合', '问题分析']
  },
  'MandalaThinking': {
    id: 'MandalaThinking',
    name: '曼陀罗思考法',
    icon: 'Grid',
    category: '创意思维',
    description: '利用九宫格发散思维，从多角度探索问题解决方案。',
    advantage: '强制发散思考，探索8个不同维度的可能性',
    bestFor: ['创意发散', '目标拆解', '思维拓展']
  },
  'SCAMPER': {
    id: 'SCAMPER',
    name: 'SCAMPER 法',
    icon: 'Lightbulb',
    category: '创意思维',
    description: '通过替代、合并、改造、修改、改变用途、去除、反转7个维度激发创新。',
    advantage: '系统化创新思维工具，快速突破思维定式',
    bestFor: ['产品设计', '服务创新', '流程改进']
  },
  'ProsConsList': {
    id: 'ProsConsList',
    name: '利弊均衡表',
    icon: 'Scale',
    category: '创意思维',
    description: '直观对比决策选项的优势与风险，辅助理性判断。',
    advantage: '一目了然的优劣势对比，减少决策盲点',
    bestFor: ['方案对比', '快速决策', '风险评估']
  },

  // ==================== 问题解决领域 ====================
  '5W2H': {
    id: '5W2H',
    name: '5W2H 分析法',
    icon: 'Search',
    category: '问题解决',
    description: 'What/Why/Who/When/Where/How/How much，七个维度全面分析。',
    advantage: '快速建立问题的完整画像，避免遗漏关键信息',
    bestFor: ['项目规划', '问题定义', '流程优化']
  },
  'LogicTree': {
    id: 'LogicTree',
    name: '逻辑树',
    icon: 'Network',
    category: '问题解决',
    description: '将复杂问题逐层分解为可执行的子议题，形成树状结构。',
    advantage: '系统化拆解问题，确保解决方案的完整性',
    bestFor: ['问题分解', '战略规划', '项目管理']
  },
  'SkyRainUmbrella': {
    id: 'SkyRainUmbrella',
    name: '空雨伞模型',
    icon: 'Umbrella',
    category: '问题解决',
    description: '基于事实(空)→解读(雨)→行动(伞)的快速决策框架。',
    advantage: '从事实到行动的完整逻辑链，避免盲目决策',
    bestFor: ['快速决策', '问题分析', '行动规划']
  },
  'EisenhowerMatrix': {
    id: 'EisenhowerMatrix',
    name: '重要度/紧急度矩阵',
    icon: 'ListChecks',
    category: '问题解决',
    description: '将任务按重要性和紧急性分为四个象限，优化时间管理。',
    advantage: '聚焦高价值任务，避免被琐事牵着走',
    bestFor: ['时间管理', '优先级排序', '效能提升']
  },
  'HypothesisThinking': {
    id: 'HypothesisThinking',
    name: '假设思考',
    icon: 'Target',
    category: '问题解决',
    description: '以假设为导向快速聚焦关键问题，避免盲目分析。',
    advantage: '快速验证假设，提升分析效率',
    bestFor: ['问题诊断', '快速分析', '假设验证']
  },

  // ==================== 市场营销战略领域 ====================
  'SWOT': {
    id: 'SWOT',
    name: 'SWOT 分析',
    icon: 'LayoutDashboard',
    category: '市场营销',
    description: '优势、劣势、机会、威胁四象限分析框架。',
    advantage: '快速识别内外部因素，制定差异化策略',
    bestFor: ['竞争分析', '战略决策', '自我评估']
  },
  'PEST': {
    id: 'PEST',
    name: 'PEST 宏观分析',
    icon: 'Globe',
    category: '市场营销',
    description: '政治、经济、社会、技术四大宏观环境因素分析。',
    advantage: '把握外部大趋势，识别系统性风险和机遇',
    bestFor: ['行业研究', '投资决策', '战略规划']
  },
  'Model3C': {
    id: 'Model3C',
    name: '3C 分析',
    icon: 'Users',
    category: '市场营销',
    description: '从公司、顾客、竞争者三维度制定竞争战略。',
    advantage: '大前研一经典模型，全方位审视竞争态势',
    bestFor: ['战略规划', '竞争分析', '市场定位']
  },
  'STPAnalysis': {
    id: 'STPAnalysis',
    name: 'STP 分析',
    icon: 'Crosshair',
    category: '市场营销',
    description: '通过市场细分、目标选择和定位构建差异化优势。',
    advantage: '精准定位目标市场，提升营销效率',
    bestFor: ['市场定位', '营销策略', '品牌建设']
  },
  'FiveForces': {
    id: 'FiveForces',
    name: '波特五力分析',
    icon: 'Shield',
    category: '市场营销',
    description: '评估行业竞争强度，分析现有竞争者、潜在进入者、替代品、供应商和客户议价能力。',
    advantage: '迈克尔波特经典模型，全面评估行业竞争环境',
    bestFor: ['行业分析', '竞争战略', '市场进入']
  },
  '4Ps': {
    id: '4Ps',
    name: '市场营销组合 (4P)',
    icon: 'Package',
    category: '市场营销',
    description: '整合产品、价格、渠道、推广四个要素形成系统营销策略。',
    advantage: '营销决策的基础框架，确保营销策略的完整性',
    bestFor: ['营销策划', '产品上市', '品牌推广']
  },
  'AIDMA': {
    id: 'AIDMA',
    name: 'AIDMA 模型',
    icon: 'ShoppingCart',
    category: '市场营销',
    description: '描述消费者从注意到行动的心理转化过程：注意-兴趣-欲望-记忆-行动。',
    advantage: '理解消费者决策路径，优化营销触点',
    bestFor: ['营销策划', '广告优化', '转化率提升']
  },
  'ProductLifecycle': {
    id: 'ProductLifecycle',
    name: '产品生命周期',
    icon: 'TrendingUp',
    category: '市场营销',
    description: '根据导入、成长、成熟、衰退阶段制定动态策略。',
    advantage: '把握产品发展阶段，提前布局下一阶段',
    bestFor: ['产品管理', '战略规划', '市场预测']
  },
  'BCGMatrix': {
    id: 'BCGMatrix',
    name: '波士顿矩阵',
    icon: 'PieChart',
    category: '市场营销',
    description: '根据市场增长率与份额将业务分类，优化投资组合。',
    advantage: '波士顿咨询经典模型，指导资源分配',
    bestFor: ['产品组合', '投资决策', '业务战略']
  },

  // ==================== 组织与团队领域 ====================
  'PDCA': {
    id: 'PDCA',
    name: 'PDCA 循环',
    icon: 'RotateCw',
    category: '组织团队',
    description: '计划-执行-检查-处理的持续改进闭环管理方法。',
    advantage: '戴明环经典模型，实现螺旋式持续改进',
    bestFor: ['质量管理', '流程优化', '持续改进']
  },
  'SevenSModel': {
    id: 'SevenSModel',
    name: '7S 模型',
    icon: 'Layers',
    category: '组织团队',
    description: '从战略、结构、系统、人员、技能、风格、价值观七个维度实现组织协同。',
    advantage: '麦肯锡经典组织诊断框架，全方位审视组织',
    bestFor: ['组织变革', '管理诊断', '战略落地']
  },
  'MaslowHierarchy': {
    id: 'MaslowHierarchy',
    name: '马斯洛需求理论',
    icon: 'Signal',
    category: '组织团队',
    description: '基于生理、安全、社交、尊重、自我实现需求层次激励团队。',
    advantage: '理解人类需求层次，设计有效激励机制',
    bestFor: ['团队激励', '员工管理', '领导力提升']
  },
  'RootCause': {
    id: 'RootCause',
    name: '根因分析法',
    icon: 'Microscope',
    category: '问题解决',
    description: '通过连续追问"为什么"，深挖问题根本原因。',
    advantage: '穿透表象直达本质，避免治标不治本',
    bestFor: ['故障诊断', '质量改进', '流程优化']
  },
  'ParetoAnalysis': {
    id: 'ParetoAnalysis',
    name: '帕累托分析',
    icon: 'BarChart',
    category: '问题解决',
    description: '80/20 法则，找出影响 80% 结果的 20% 关键因素。',
    advantage: '聚焦关键少数，提升资源利用效率',
    bestFor: ['优先级排序', '资源分配', '绩效改进']
  },

  // ==================== 经营战略领域 ====================
  'AnsoffMatrix': {
    id: 'AnsoffMatrix',
    name: '安索夫矩阵',
    icon: 'Move',
    category: '经营战略',
    description: '基于现有/新市场与产品的组合制定增长战略。',
    advantage: '系统化思考增长路径，避免盲目扩张',
    bestFor: ['增长战略', '市场扩张', '产品线规划']
  },
  'PortersGenericStrategies': {
    id: 'PortersGenericStrategies',
    name: '波特三大战略',
    icon: 'Swords',
    category: '经营战略',
    description: '通过成本领先、差异化、集中化构建竞争优势。',
    advantage: '迈克尔波特经典竞争战略模型',
    bestFor: ['竞争战略', '战略定位', '优势构建']
  },
  'ValueChain': {
    id: 'ValueChain',
    name: '价值链分析',
    icon: 'Link',
    category: '经营战略',
    description: '拆解企业活动，识别价值创造和成本构成。',
    advantage: '发现竞争优势来源和成本优化空间',
    bestFor: ['竞争策略', '成本优化', '业务重组']
  },
  'ScenarioPlanning': {
    id: 'ScenarioPlanning',
    name: '情景规划法',
    icon: 'Drama',
    category: '经营战略',
    description: '构建多种未来情景，制定应对策略。',
    advantage: '应对不确定性，提高战略灵活性',
    bestFor: ['长期规划', '风险管理', '战略制定']
  },
  'DecisionMatrix': {
    id: 'DecisionMatrix',
    name: '决策矩阵',
    icon: 'Calculator',
    category: '问题解决',
    description: '多标准加权评分，量化比较不同选项。',
    advantage: '让决策过程透明可追溯，减少主观偏见',
    bestFor: ['方案选择', '供应商评估', '投资决策']
  },
  'StakeholderAnalysis': {
    id: 'StakeholderAnalysis',
    name: '利益相关者分析',
    icon: 'Users',
    category: '组织团队',
    description: '识别并分析所有相关方的利益诉求和影响力。',
    advantage: '预判阻力来源，设计针对性沟通策略',
    bestFor: ['变革管理', '项目推进', '谈判策略']
  }
}

/**
 * 获取存储的 API Key
 */
export function getApiKey() {
  return localStorage.getItem('ideaverse_api_key') || ''
}

/**
 * 设置 API Key
 */
export function setApiKey(key) {
  localStorage.setItem('ideaverse_api_key', key)
}

/**
 * 检查 API Key 是否已配置
 */
export function hasApiKey() {
  return !!getApiKey()
}

/**
 * 调用 DeepSeek API
 * 
 * 使用流式响应 (SSE) 处理长文本生成，以避免超时并提供实时反馈。
 * 
 * @param {Array} messages - 聊天记录上下文
 * @param {Object} options - API 配置选项 (model, temperature, maxTokens)
 * @param {Function} onProgress - 进度回调函数，接收当前已生成的字符数
 * @returns {Promise<string>} - 完整的响应内容
 */
async function callDeepSeek(messages, options = {}, onProgress = null) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('请先配置 DeepSeek API Key')
  }

  // 发起 POST 请求，开启 stream 模式
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model || 'deepseek-chat',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: true // 关键：开启流式传输
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
  }

  // 处理流式响应数据
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let fullContent = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      // 处理可能被分块截断的行
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个可能不完整的行

      for (const line of lines) {
        const trimmedLine = line.trim()
        // 过滤空行和结束标记
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
        
        // 解析 SSE 数据行 (格式: data: {...})
        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.slice(6))
            const content = data.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              // 触发进度回调
              if (onProgress) {
                onProgress(fullContent.length)
              }
            }
          } catch (e) {
            console.warn('解析 SSE 数据失败:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('读取流失败:', error)
    throw error
  } finally {
    reader.releaseLock()
  }

  return fullContent
}

/**
 * 清理 JSON 字符串中的问题
 */
function cleanJsonString(jsonStr) {
  // 移除 JSON 值中的 Markdown 格式标记（如 **粗体**、*斜体*）
  // 这需要小心处理，只处理字符串值内的内容
  let cleaned = jsonStr

  // 移除 trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')

  // 尝试修复 AI 常见的格式问题：值中包含 ** 标记
  // 匹配 "key": **"value"** 或 "key": "**value**" 等模式
  cleaned = cleaned.replace(/:\s*\*\*"([^"]*)"\*\*/g, ':"$1"')
  cleaned = cleaned.replace(/:\s*\*\*([^,}\]"]+)\*\*/g, ':"$1"')

  // 移除字符串值内的 ** 和 * 标记
  // 已禁用此清理，以支持 Markdown 格式
  // cleaned = cleaned.replace(/"([^"]*)\*\*([^"]*)\*\*([^"]*)"/g, '"$1$2$3"')
  // cleaned = cleaned.replace(/"([^"]*)\*([^*"]*)\*([^"]*)"/g, '"$1$2$3"')

  return cleaned
}

/**
 * 解析 JSON 响应
 * 
 * AI 返回的 JSON 往往包含 Markdown 格式（如 ```json ... ```）或格式错误。
 * 此函数采用多种策略尝试提取和解析有效的 JSON 数据。
 */
function parseJsonResponse(content) {
  // 策略 0: 基础解析尝试
  const tryParse = (str) => {
    try {
      return JSON.parse(str)
    } catch {
      return null
    }
  }

  // 策略集合：尝试从不同格式中提取 JSON
  const extractAndParse = (str) => {
    // 策略 1: 提取 ```json 代码块 (最标准的情况)
    const jsonBlockMatch = str.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonBlockMatch) {
      const cleaned = cleanJsonString(jsonBlockMatch[1].trim())
      const result = tryParse(cleaned)
      if (result) return result
    }

    // 策略 2: 提取任意 ``` 代码块 (AI 可能忘了写 json 标签)
    const codeBlockMatch = str.match(/```\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      const cleaned = cleanJsonString(codeBlockMatch[1].trim())
      const result = tryParse(cleaned)
      if (result) return result
    }

    // 策略 3: 寻找最外层的 {} (处理混杂在文本中的 JSON)
    const firstBrace = str.indexOf('{')
    const lastBrace = str.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const cleaned = cleanJsonString(str.substring(firstBrace, lastBrace + 1))
      const result = tryParse(cleaned)
      if (result) return result
    }

    // 策略 4: 假设整个内容就是 JSON (或只有少量空白)
    const cleaned = cleanJsonString(str.trim())
    const result = tryParse(cleaned)
    if (result) return result

    return null
  }

  const result = extractAndParse(content)
  if (result) return result

  // 兜底策略：当常规解析失败时，尝试激进清理（移除可能破坏 JSON 的 Markdown 符号）
  console.error('JSON 解析失败，尝试激进清理...')
  console.error('原始内容:', content.substring(0, 500))

  // 激进清理：移除所有 * 符号（markdown），但保留换行符
  // 注意：这可能会误伤 JSON 值中的 * 号，但在解析失败的情况下值得一试
  let aggressiveCleaned = content
    .replace(/\*\*/g, '') // 移除加粗标记
    .replace(/\*/g, '')   // 移除星号
    .replace(/`/g, '')    // 移除反引号
  
  const lastResult = extractAndParse(aggressiveCleaned)
  if (lastResult) return lastResult

  // 策略 5: 尝试修复截断的 JSON
  try {
    const repaired = tryFixTruncatedJson(content)
    const repairedResult = extractAndParse(repaired)
    if (repairedResult) {
      console.log('成功修复截断的 JSON')
      return repairedResult
    }
  } catch (e) {
    console.warn('尝试修复 JSON 失败:', e)
  }

  throw new Error('AI 返回内容格式错误，无法解析 JSON。请重试。')
}

/**
 * 尝试修复截断的 JSON 字符串
 * 简单的堆栈平衡算法
 */
function tryFixTruncatedJson(jsonStr) {
  let stack = []
  let inString = false
  let escaped = false
  
  // 找到真正的 JSON 开始位置 (忽略 Markdown 标记)
  let start = jsonStr.indexOf('{')
  const startArr = jsonStr.indexOf('[')
  if (start === -1 || (startArr !== -1 && startArr < start)) {
    start = startArr
  }
  
  if (start === -1) return jsonStr // 没找到开始，无法修复
  
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
  
  // 修复未闭合的字符串
  let fixed = content
  if (inString) {
    fixed += '"'
  }
  
  // 修复未闭合的结构
  while (stack.length > 0) {
    fixed += stack.pop()
  }
  
  return fixed
}

/**
 * 步骤一：生成采访问题
 * 
 * 基于用户的初始问题，生成一组（通常3-5个）采访问题，
 * 旨在厘清问题背景、目标和限制条件。
 * 
 * @param {string} problem - 用户输入的初始问题
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object>} - 包含问题列表的对象 { questions: [...] }
 */
export async function generateInterviewQuestions(problem, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('interview_system')
    },
    {
      role: 'user',
      content: `我需要深度思考的问题是：${problem}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤一：生成问题理解分析报告
 * 
 * 汇总用户的回答，生成对问题的深层次理解报告，
 * 作为后续深度分析的基础。
 * 
 * @param {string} problem - 初始问题
 * @param {Array} answers - 用户对采访问题的回答 [{question, answer}]
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object>} - 理解报告对象
 */
export async function generateUnderstandingReport(problem, answers, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('understanding_system')
    },
    {
      role: 'user',
      content: `深思问题：${problem}

用户的回答：
${answers.map((a, i) => `问题${i + 1}: ${a.question}\n回答: ${a.answer}`).join('\n\n')}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：使用思维模型进行深度分析
 * 
 * (已弃用/遗留) 一次性生成所有分析内容。
 * 现在的流程倾向于使用 analyzeWithSpecificModel 分步进行。
 */
export async function analyzeWithThinkingModels(problem, understandingReport, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('analyze_general_system')
    },
    {
      role: 'user',
      content: `深思问题：${problem}

问题理解报告：
${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 8000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：重新分析某个维度
 * 
 * 当用户对某个维度的分析不满意时，根据反馈重新生成该卡片的内容。
 */
export async function reanalyzeCard(problem, card, feedback, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('reanalyze_card_system', { cardId: card.id })
    },
    {
      role: 'user',
      content: `深思问题：${problem}

当前分析内容：
${JSON.stringify(card, null, 2)}

用户反馈：${feedback || '请提供更深入、更准确的分析'}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤三：生成解决方案
 * 
 * 基于深度分析报告，发散思维，生成具体的解决方案和行动建议。
 */
export async function generateSolutions(problem, analysisReport, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('solutions_system')
    },
    {
      role: 'user',
      content: `深思问题：${problem}

深度分析报告：
${JSON.stringify(analysisReport, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 8000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤三：重新生成某个方案
 * 
 * 根据用户反馈优化或重写特定方案。
 */
export async function regenerateSolution(problem, solution, feedback, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('regenerate_solution_system', { solutionId: solution.id })
    },
    {
      role: 'user',
      content: `深思问题：${problem}

当前方案：
${JSON.stringify(solution, null, 2)}

用户反馈：${feedback || '请提供更可行、更有效的方案'}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 4000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 生成完整思维导图 Markdown
 * 
 * 将整个思考过程（问题->理解->分析->方案）转化为 Mermaid 或 Markdown 格式的思维导图。
 */
export async function generateMindMap(problem, understandingReport, analysisReport, solutions, onProgress) {
  const messages = [
    {
      role: 'system',
      content: getPrompt('mindmap_system')
    },
    {
      role: 'user',
      content: `深思问题：${problem}

问题理解报告：
${JSON.stringify(understandingReport, null, 2)}

深度分析报告：
${JSON.stringify(analysisReport, null, 2)}

解决方案：
${JSON.stringify(solutions, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 8000 }, onProgress)
  return response
}

/**
 * 推荐适合问题的思维模型
 * 
 * 分析问题的性质，从模型库中挑选最适合的 3 个思维模型，并给出推荐理由。
 */
export async function recommendThinkingModels(problem, understandingReport, onProgress) {
  const modelList = Object.values(THINKING_MODELS).map(m =>
    `- ${m.id}: ${m.name} - ${m.description}`
  ).join('\n')

  const messages = [
    {
      role: 'system',
      content: getPrompt('recommend_models_system', { modelList })
    },
    {
      role: 'user',
      content: `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 3000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 使用指定思维模型进行分析
 * 
 * (已弃用/遗留) 直接使用指定模型生成完整分析。
 */
export async function analyzeWithSpecificModel(problem, understandingReport, modelId, onProgress) {
  const model = THINKING_MODELS[modelId]
  if (!model) throw new Error(`未知的思维模型: ${modelId}`)

  const messages = [
    {
      role: 'system',
      content: getPrompt('analyze_specific_model_system', {
        modelName: model.name,
        modelDesc: model.description,
        modelAdvantage: model.advantage,
        modelId: modelId
      })
    },
    {
      role: 'user',
      content: `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 8000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：使用指定思维模型进行分析 - 第一步：生成分析维度
 * 
 * 根据选定的思维模型（如 SWOT 的 4 个象限，或 5W2H 的 7 个维度），
 * 生成具体的分析维度列表。这是并行分析的基础。
 */
export async function generateAnalysisDimensions(problem, understandingReport, modelId, onProgress) {
  const model = THINKING_MODELS[modelId]
  if (!model) throw new Error(`未知的思维模型: ${modelId}`)

  const messages = [
    {
      role: 'system',
      content: getPrompt('analysis_dimensions_system', {
        modelName: model.name,
        modelDesc: model.description,
        modelId: modelId
      })
    },
    {
      role: 'user',
      content: `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 2000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 步骤二：使用指定思维模型进行分析 - 第二步：分析单个维度
 */
export async function analyzeDimension(problem, understandingReport, modelId, dimension, onProgress) {
  console.log('[AI Service] analyzeDimension called with modelId:', modelId)
  const model = THINKING_MODELS[modelId]
  
  if (!model) {
    console.error('[AI Service] Invalid modelId:', modelId)
    console.error('[AI Service] Available models:', Object.keys(THINKING_MODELS))
    throw new Error(`未知的思维模型 ID: ${modelId}`)
  }

  const messages = [
    {
      role: 'system',
      content: getPrompt('analysis_card_system', {
        modelName: model.name,
        dimensionName: dimension.dimension,
        dimensionId: dimension.id,
        dimensionIcon: dimension.icon
      })
    },
    {
      role: 'user',
      content: `深思问题：${problem}\n\n问题理解报告：${JSON.stringify(understandingReport, null, 2)}\n\n当前分析维度：${JSON.stringify(dimension)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 3000 }, onProgress)
  return parseJsonResponse(response)
}

/**
 * 压缩分析卡片内容，避免超出 Token 限制
 * 仅保留关键字段，并对过长文本进行截断
 */
function compressAnalysisCards(cards) {
  if (!Array.isArray(cards)) return []
  
  return cards.map(card => {
    // 简单的文本截断函数
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
 * 
 * 整合所有维度的分析结果，生成一份连贯的深度分析报告。
 */
export async function generateDeepAnalysisReport(problem, understandingReport, modelId, analysisCards, onProgress) {
  const model = THINKING_MODELS[modelId]
  
  // 压缩卡片内容
  const compressedCards = compressAnalysisCards(analysisCards)
  
  const messages = [
    {
      role: 'system',
      content: getPrompt('analysis_report_system', { modelName: model.name })
    },
    {
      role: 'user',
      content: `深思问题：${problem}\n\n分析卡片摘要内容：${JSON.stringify(compressedCards, null, 2)}`
    }
  ]

  const response = await callDeepSeek(messages, { maxTokens: 4000 }, onProgress)
  return response
}

export default {
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
