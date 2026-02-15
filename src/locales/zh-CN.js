export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    home: '首页',
    settings: '设置',
    history: '历史',
    think: '思考',
    back: '返回',
    finish: '完成',
    next: '下一步',
    submit: '提交',
    retry: '重试',
    copy: '复制',
    copied: '已复制',
    export: '导出',
    unknown_error: '发生未知错误',
    brand_name: '深度思界'
  },
  home: {
    slogan: '让思考有迹可循',
    start_thinking: '开始深度思考',
    placeholder: '例如：如何提高团队的工作效率？或者：我应该换工作吗？',
    features: {
      step1_title: '问题理解',
      step1_desc: '通过AI采访理清问题背景',
      step2_title: '深度分析',
      step2_desc: '运用经典思维模型拆解问题',
      step3_title: '方案评估',
      step3_desc: '生成并评估可行性解决方案'
    },
    footer: '© 2026 深度思界. All rights reserved.'
  },
  think: {
    problem_label: '深思问题：',
    step1: '问题理解',
    step2: '深度分析',
    step3: '方案评估',
    auto_save: '内容自动保存',
    current_step: '进度'
  },
  history: {
    title: '思考历史',
    empty: '暂无思考记录',
    continue: '继续思考',
    delete_confirm: '确定要删除这条记录吗？',
    status: {
      in_progress: '进行中',
      completed: '已完成'
    }
  },
  settings: {
    title: '设置',
    api_key_label: 'API Key',
    api_key_placeholder: '请输入您的 API Key',
    api_config_desc: '您的配置仅存储在本地浏览器中，用于调用 OpenAI 兼容的 API 服务。',
    base_url_label: 'Base URL',
    base_url_placeholder: '例如：https://api.deepseek.com/v1',
    model_label: 'Model',
    model_placeholder: '例如：deepseek-chat',
    theme_label: '主题设置',
    language_label: '语言设置',
    save_success: '设置已保存',
    api_key_missing: '请先配置 API Key',
    api_configuration: 'API 配置',
    get_api_key: '获取 API Key →',
    ai_prompts: 'AI 提示词',
    data_management: '数据管理',
    danger_zone: '危险区域',
    clear_data_desc: '清除所有本地数据，包括历史记录和设置。',
    clear_all_data: '删除所有数据',
    about: '关于',
    version: '版本',
    customize_prompts: '自定义系统提示词。',
    support_variables: '支持 {variable} 占位符。',
    reset: '重置',
    reset_all: '重置全部'
  },
  step1: {
    title: '第一步：问题理解',
    desc: '请回答以下问题，帮助 AI 更准确地理解您的核心诉求。',
    custom_answer: '自定义回答',
    custom_placeholder: '请输入您的回答...',
    report_title: '问题理解报告',
    summary: '核心总结',
    key_points: '关键要点',
    focus_areas: '关注领域',
    deeper_needs: '深层需求',
    scope: '问题边界'
  },
  step2: {
    title: '第二步：深度分析',
    desc: '选择合适的思维模型，对问题进行多维度拆解。',
    recommend_title: '推荐思维模型',
    recommend_desc: 'AI 根据问题性质推荐以下模型',
    recommended_badge: '推荐',
    select_model: '选择此模型',
    current_model: '当前模型',
    analysis_report: '深度分析报告',
    dimensions: '分析维度',
    reanalyze: '重新分析',
    feedback_placeholder: '请具体描述您的要求，例如：请侧重分析成本因素...',
    card: {
      phenomenon: '现象',
      cause: '原因',
      impact: '影响',
      hidden_factors: '隐藏因素'
    }
  },
  step3: {
    title: '第三步：方案评估',
    desc: '基于分析结果生成解决方案，并进行多维度评估。',
    solutions_title: '创新解决方案',
    regenerate: '重新生成',
    evaluation: '方案评估',
    effectiveness: '有效性',
    feasibility: '可行性',
    sustainability: '可持续性',
    weighted_score: '加权得分',
    implementation: '实施步骤',
    cost_benefit: '成本收益',
    risk_control: '风险控制',
    worst_case: '最坏情况',
    countermeasure: '应对措施',
    export_mindmap: '导出思维导图',
    mindmap_filename: '深度思考-思维导图.md',
    watermark_text: '深度思界',
    mind_map: '思维导图',
    markdown: 'Markdown',
    click_to_fullscreen: '点击全屏'
  },
  status: {
    generating_questions: '正在生成采访问题...',
    analyzing_answers: '正在生成问题理解报告...',
    recommending_models: '正在推荐思维模型...',
    generating_dimensions: '正在拆解分析维度...',
    analyzing_dimension: '正在分析维度：{dimension}...',
    generating_report: '正在生成深度分析汇总报告...',
    reanalyzing: '正在重新分析维度：{dimension}...',
    generating_solutions: '正在生成创新解决方案...',
    regenerating_solution: '正在重新优化方案...',
    generating_mindmap: '正在生成思维导图...',
    idle: '空闲',
    completed: '完成',
    requesting: '正在请求 AI...',
    receiving: 'AI 思考中... 已接收 {count} 字符'
  },
  tips: [
    '深度思考需要时间，好的分析值得等待',
    'AI 正在调用多个思维模型帮你分析',
    '正在从多个维度拆解你的问题',
    '区分"相关性"和"因果性"是深度思考的关键',
    '好问题往往比答案更重要',
    '问题=现象×原因×影响',
    '麦肯锡 MECE 原则：相互独立，完全穷尽',
    '5W2H 帮你全方位理解问题'
  ],
  thinking_models: {
    MECE: {
      name: 'MECE 分解法',
      description: '相互独立，完全穷尽。将复杂问题分解为不重叠、不遗漏的子问题。',
      advantage: '确保分析无遗漏、无重复，是战略咨询的黄金法则'
    },
    PyramidPrinciple: {
      name: '金字塔原理',
      description: '结论先行、以上统下、归类分组、逻辑递进的思考与表达框架。',
      advantage: '提升沟通效率与说服力，让观点清晰有力'
    },
    SixThinkingHats: {
      name: '六顶思考帽',
      description: '通过六种不同思考视角（白/红/黑/黄/绿/蓝帽）激活多元思维。',
      advantage: '避免单一偏见，实现平行思考，提升团队协作效率'
    },
    PREP: {
      name: 'PREP 法',
      description: '结论-理由-例证-结论的结构化表达方法。',
      advantage: '实现逻辑清晰的表达，快速抓住听众注意力'
    },
    InductiveDeductive: {
      name: '归纳演绎法',
      description: '归纳法从具体事例总结规律，演绎法从一般原理推导具体结论。',
      advantage: '双管齐下的推理方式，确保论证严密性'
    },
    WrittenBrainstorming: {
      name: '书面头脑风暴法',
      description: '通过书面形式（635法）收集创意，确保每个人观点被平等重视。',
      advantage: '避免口头讨论的偏见，让内向者也能充分参与'
    },
    KJMethod: {
      name: 'KJ 法',
      description: '通过卡片分类整合碎片化信息，形成系统性创意。',
      advantage: '将杂乱信息转化为有序知识结构'
    },
    MandalaThinking: {
      name: '曼陀罗思考法',
      description: '利用九宫格发散思维，从多角度探索问题解决方案。',
      advantage: '强制发散思考，探索8个不同维度的可能性'
    },
    SCAMPER: {
      name: 'SCAMPER 法',
      description: '通过替代、合并、改造、修改、改变用途、去除、反转7个维度激发创新。',
      advantage: '系统化创新思维工具，快速突破思维定式'
    },
    ProsConsList: {
      name: '利弊均衡表',
      description: '直观对比决策选项的优势与风险，辅助理性判断。',
      advantage: '一目了然的优劣势对比，减少决策盲点'
    },
    '5W2H': {
      name: '5W2H 分析法',
      description: 'What/Why/Who/When/Where/How/How much，七个维度全面分析。',
      advantage: '快速建立问题的完整画像，避免遗漏关键信息'
    },
    LogicTree: {
      name: '逻辑树',
      description: '将复杂问题逐层分解为可执行的子议题，形成树状结构。',
      advantage: '系统化拆解问题，确保解决方案的完整性'
    },
    SkyRainUmbrella: {
      name: '空雨伞模型',
      description: '基于事实(空)→解读(雨)→行动(伞)的快速决策框架。',
      advantage: '从事实到行动的完整逻辑链，避免盲目决策'
    },
    EisenhowerMatrix: {
      name: '重要度/紧急度矩阵',
      description: '将任务按重要性和紧急性分为四个象限，优化时间管理。',
      advantage: '聚焦高价值任务，避免被琐事牵着走'
    },
    HypothesisThinking: {
      name: '假设思考',
      description: '以假设为导向快速聚焦关键问题，避免盲目分析。',
      advantage: '快速验证假设，提升分析效率'
    },
    SWOT: {
      name: 'SWOT 分析',
      description: '优势、劣势、机会、威胁四象限分析框架。',
      advantage: '快速识别内外部因素，制定差异化策略'
    },
    PEST: {
      name: 'PEST 宏观分析',
      description: '政治、经济、社会、技术四大宏观环境因素分析。',
      advantage: '把握外部大趋势，识别系统性风险和机遇'
    },
    Model3C: {
      name: '3C 分析',
      description: '从公司、顾客、竞争者三维度制定竞争战略。',
      advantage: '大前研一经典模型，全方位审视竞争态势'
    },
    STPAnalysis: {
      name: 'STP 分析',
      description: '通过市场细分、目标选择和定位构建差异化优势。',
      advantage: '精准定位目标市场，提升营销效率'
    },
    FiveForces: {
      name: '波特五力分析',
      description: '评估行业竞争强度，分析现有竞争者、潜在进入者、替代品、供应商和客户议价能力。',
      advantage: '迈克尔波特经典模型，全面评估行业竞争环境'
    },
    '4Ps': {
      name: '市场营销组合 (4P)',
      description: '整合产品、价格、渠道、推广四个要素形成系统营销策略。',
      advantage: '营销决策的基础框架，确保营销策略的完整性'
    },
    AIDMA: {
      name: 'AIDMA 模型',
      description: '描述消费者从注意到行动的心理转化过程：注意-兴趣-欲望-记忆-行动。',
      advantage: '理解消费者决策路径，优化营销触点'
    },
    ProductLifecycle: {
      name: '产品生命周期',
      description: '根据导入、成长、成熟、衰退阶段制定动态策略。',
      advantage: '把握产品发展阶段，提前布局下一阶段'
    },
    BCGMatrix: {
      name: '波士顿矩阵',
      description: '根据市场增长率与份额将业务分类，优化投资组合。',
      advantage: '波士顿咨询经典模型，指导资源分配'
    },
    PDCA: {
      name: 'PDCA 循环',
      description: '计划-执行-检查-处理的持续改进闭环管理方法。',
      advantage: '戴明环经典模型，实现螺旋式持续改进'
    },
    SevenSModel: {
      name: '7S 模型',
      description: '从战略、结构、系统、人员、技能、风格、价值观七个维度实现组织协同。',
      advantage: '麦肯锡经典组织诊断框架，全方位审视组织'
    },
    MaslowHierarchy: {
      name: '马斯洛需求理论',
      description: '基于生理、安全、社交、尊重、自我实现需求层次激励团队。',
      advantage: '理解人类需求层次，设计有效激励机制'
    },
    RootCause: {
      name: '根因分析法',
      description: '通过连续追问"为什么"，深挖问题根本原因。',
      advantage: '穿透表象直达本质，避免治标不治本'
    },
    ParetoAnalysis: {
      name: '帕累托分析',
      description: '80/20 法则，找出影响 80% 结果的 20% 关键因素。',
      advantage: '聚焦关键少数，提升资源利用效率'
    },
    AnsoffMatrix: {
      name: '安索夫矩阵',
      description: '基于现有/新市场与产品的组合制定增长战略。',
      advantage: '系统化思考增长路径，避免盲目扩张'
    },
    PortersGenericStrategies: {
      name: '波特三大战略',
      description: '通过成本领先、差异化、集中化构建竞争优势。',
      advantage: '迈克尔波特经典竞争战略模型'
    },
    ValueChain: {
      name: '价值链分析',
      description: '拆解企业活动，识别价值创造和成本构成。',
      advantage: '发现竞争优势来源和成本优化空间'
    },
    ScenarioPlanning: {
      name: '情景规划法',
      description: '构建多种未来情景，制定应对策略。',
      advantage: '应对不确定性，提高战略灵活性'
    },
    DecisionMatrix: {
      name: '决策矩阵',
      description: '多标准加权评分，量化比较不同选项。',
      advantage: '让决策过程透明可追溯，减少主观偏见'
    },
    StakeholderAnalysis: {
      name: '利益相关者分析',
      description: '识别并分析所有相关方的利益诉求和影响力。',
      advantage: '预判阻力来源，设计针对性沟通策略'
    }
  }
}
