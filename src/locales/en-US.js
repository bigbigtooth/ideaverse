export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    home: 'Home',
    settings: 'Settings',
    history: 'History',
    think: 'Think',
    back: 'Back',
    finish: 'Finish',
    next: 'Next',
    submit: 'Submit',
    retry: 'Retry',
    copy: 'Copy',
    copied: 'Copied',
    export: 'Export',
    unknown_error: 'Unknown Error',
    brand_name: 'IdeaVerse'
  },
  home: {
    slogan: 'Deep thought, clear bounds',
    start_thinking: 'Start Deep Thinking',
    placeholder: 'e.g., How to improve team efficiency? or Should I change my job?',
    features: {
      step1_title: 'Understand',
      step1_desc: 'Clarify context via AI interviews',
      step2_title: 'Analyze',
      step2_desc: 'Deconstruct with classic models',
      step3_title: 'Evaluate',
      step3_desc: 'Generate and score solutions'
    },
    footer: '© 2026 Ideaverse. All rights reserved.'
  },
  think: {
    problem_label: 'Problem:',
    step1: 'Understanding',
    step2: 'Analysis',
    step3: 'Evaluation',
    auto_save: 'Auto-saved',
    current_step: 'Progress'
  },
  history: {
    title: 'History',
    empty: 'No history yet',
    continue: 'Continue',
    delete_confirm: 'Are you sure you want to delete this session?',
    status: {
      in_progress: 'In Progress',
      completed: 'Completed'
    }
  },
  settings: {
    title: 'Settings',
    api_key_label: 'API Key',
    api_key_placeholder: 'Enter your API Key',
    api_config_desc: 'Your configuration is stored locally and used only for OpenAI-compatible API services.',
    base_url_label: 'Base URL',
    base_url_placeholder: 'e.g., https://api.deepseek.com/v1',
    model_label: 'Model',
    model_placeholder: 'e.g., deepseek-chat',
    theme_label: 'Theme',
    language_label: 'Language',
    save_success: 'Settings saved',
    api_key_missing: 'Please configure API Key first',
    api_configuration: 'API Configuration',
    get_api_key: 'Get API Key →',
    ai_prompts: 'AI Prompts',
    data_management: 'Data Management',
    danger_zone: 'Danger Zone',
    clear_data_desc: 'Clear all local data including history and settings.',
    clear_all_data: 'Delete All Data',
    about: 'About',
    version: 'Version',
    customize_prompts: 'Customize system prompts.',
    support_variables: 'Support {variable} placeholders.',
    reset: 'Reset',
    reset_all: 'Reset All'
  },
  step1: {
    title: 'Step 1: Understanding',
    desc: 'Answer these questions to help AI better understand your core needs.',
    custom_answer: 'Custom Answer',
    custom_placeholder: 'Enter your answer...',
    report_title: 'Understanding Report',
    summary: 'Summary',
    key_points: 'Key Points',
    focus_areas: 'Focus Areas',
    deeper_needs: 'Deeper Needs',
    scope: 'Scope'
  },
  step2: {
    title: 'Step 2: Analysis',
    desc: 'Select a thinking model to deconstruct your problem.',
    recommend_title: 'Recommended Models',
    recommend_desc: 'AI recommends these models based on your problem',
    recommended_badge: 'Recommended',
    select_model: 'Select Model',
    current_model: 'Current Model',
    analysis_report: 'Analysis Report',
    dimensions: 'Dimensions',
    reanalyze: 'Re-analyze',
    feedback_placeholder: 'Describe your request, e.g., Focus more on cost...',
    card: {
      phenomenon: 'Phenomenon',
      cause: 'Cause',
      impact: 'Impact',
      hidden_factors: 'Hidden Factors'
    }
  },
  step3: {
    title: 'Step 3: Evaluation',
    desc: 'Generate solutions and evaluate them across multiple dimensions.',
    solutions_title: 'Innovative Solutions',
    regenerate: 'Regenerate',
    evaluation: 'Evaluation',
    effectiveness: 'Effectiveness',
    feasibility: 'Feasibility',
    sustainability: 'Sustainability',
    weighted_score: 'Score',
    implementation: 'Steps',
    cost_benefit: 'Cost/Benefit',
    risk_control: 'Risk Control',
    worst_case: 'Worst Case',
    countermeasure: 'Countermeasure',
    export_mindmap: 'Export Mind Map',
    mindmap_filename: 'Ideaverse-MindMap.md',
    watermark_text: 'Ideaverse',
    mind_map: 'Mind Map',
    markdown: 'Markdown',
    click_to_fullscreen: 'Click to Fullscreen'
  },
  status: {
    generating_questions: 'Generating interview questions...',
    analyzing_answers: 'Generating understanding report...',
    recommending_models: 'Recommending thinking models...',
    generating_dimensions: 'Deconstructing analysis dimensions...',
    analyzing_dimension: 'Analyzing dimension: {dimension}...',
    generating_report: 'Generating deep analysis report...',
    reanalyzing: 'Re-analyzing dimension: {dimension}...',
    generating_solutions: 'Generating innovative solutions...',
    regenerating_solution: 'Regenerating solution...',
    generating_mindmap: 'Generating mind map...',
    idle: 'Idle',
    completed: 'Completed',
    requesting: 'Requesting AI...',
    receiving: 'AI is thinking... Received {count} chars'
  },
  tips: [
    'Deep thinking takes time; good analysis is worth the wait.',
    'AI is using multiple models to analyze your problem.',
    'Deconstructing your problem from multiple dimensions.',
    'Distinguishing "correlation" from "causation" is key.',
    'A good question is often more important than the answer.',
    'Problem = Phenomenon × Cause × Impact',
    'MECE Principle: Mutually Exclusive, Collectively Exhaustive.',
    '5W2H helps you understand the problem comprehensively.'
  ],
  thinking_models: {
    MECE: {
      name: 'MECE Principle',
      description: 'Mutually Exclusive, Collectively Exhaustive. Decompose complex problems into non-overlapping, non-omitted sub-problems.',
      advantage: 'Ensures analysis is complete and non-repetitive; a golden rule in strategic consulting.'
    },
    PyramidPrinciple: {
      name: 'Pyramid Principle',
      description: 'Structure ideas with conclusion first, grouping and summarizing supporting arguments.',
      advantage: 'Improves communication efficiency and persuasiveness.'
    },
    SixThinkingHats: {
      name: 'Six Thinking Hats',
      description: 'Activate diverse thinking using six different perspectives (White/Red/Black/Yellow/Green/Blue).',
      advantage: 'Avoids bias, enables parallel thinking, and improves team collaboration.'
    },
    PREP: {
      name: 'PREP Method',
      description: 'Point, Reason, Example, Point. A structured way to express ideas.',
      advantage: 'Achieves clear logical expression and grabs attention quickly.'
    },
    InductiveDeductive: {
      name: 'Inductive & Deductive',
      description: 'Inductive: generalize from specifics. Deductive: derive specifics from general principles.',
      advantage: 'Dual approach ensuring rigorous reasoning.'
    },
    WrittenBrainstorming: {
      name: 'Written Brainstorming',
      description: 'Collect ideas via writing (e.g., 6-3-5 method) to ensure equal participation.',
      advantage: 'Avoids verbal bias and allows introverts to participate fully.'
    },
    KJMethod: {
      name: 'KJ Method',
      description: 'Organize fragmented information into a systematic structure using cards.',
      advantage: 'Transforms chaotic information into structured knowledge.'
    },
    MandalaThinking: {
      name: 'Mandala Thinking',
      description: 'Use a 9-square grid to expand thinking from multiple angles.',
      advantage: 'Forces divergent thinking across 8 different dimensions.'
    },
    SCAMPER: {
      name: 'SCAMPER',
      description: 'Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse.',
      advantage: 'Systematic innovation tool to break mindsets.'
    },
    ProsConsList: {
      name: 'Pros & Cons List',
      description: 'Visually compare advantages and risks of options.',
      advantage: 'Clear comparison reducing decision blind spots.'
    },
    '5W2H': {
      name: '5W2H Analysis',
      description: 'What, Why, Who, When, Where, How, How much.',
      advantage: 'Quickly builds a complete picture of the problem.'
    },
    LogicTree: {
      name: 'Logic Tree',
      description: 'Decompose complex problems into actionable sub-issues hierarchically.',
      advantage: 'Systematically breaks down problems ensuring completeness.'
    },
    SkyRainUmbrella: {
      name: 'Sky-Rain-Umbrella',
      description: 'Fact (Sky) -> Interpretation (Rain) -> Action (Umbrella).',
      advantage: 'Complete logic chain from fact to action.'
    },
    EisenhowerMatrix: {
      name: 'Eisenhower Matrix',
      description: 'Prioritize tasks by urgency and importance.',
      advantage: 'Focuses on high-value tasks.'
    },
    HypothesisThinking: {
      name: 'Hypothesis Thinking',
      description: 'Focus on key issues using hypotheses to avoid blind analysis.',
      advantage: 'Validates hypotheses quickly, improving efficiency.'
    },
    SWOT: {
      name: 'SWOT Analysis',
      description: 'Strengths, Weaknesses, Opportunities, Threats.',
      advantage: 'Identifies internal and external factors for strategy.'
    },
    PEST: {
      name: 'PEST Analysis',
      description: 'Political, Economic, Social, Technological factors.',
      advantage: 'Grasps macro trends and systemic risks.'
    },
    Model3C: {
      name: '3C Model',
      description: 'Customer, Competitor, Company.',
      advantage: 'Comprehensive view of the strategic triangle.'
    },
    STPAnalysis: {
      name: 'STP Analysis',
      description: 'Segmentation, Targeting, Positioning.',
      advantage: 'Precise market targeting and efficient marketing.'
    },
    FiveForces: {
      name: 'Porter\'s Five Forces',
      description: 'Analyze industry competition intensity.',
      advantage: 'Comprehensive assessment of industry environment.'
    },
    '4Ps': {
      name: 'Marketing Mix (4Ps)',
      description: 'Product, Price, Place, Promotion.',
      advantage: 'Foundational framework for marketing strategy.'
    },
    AIDMA: {
      name: 'AIDMA Model',
      description: 'Attention, Interest, Desire, Memory, Action.',
      advantage: 'Understands consumer decision path.'
    },
    ProductLifecycle: {
      name: 'Product Lifecycle',
      description: 'Dynamic strategies for Introduction, Growth, Maturity, Decline.',
      advantage: 'Aligns strategy with product stage.'
    },
    BCGMatrix: {
      name: 'BCG Matrix',
      description: 'Classify business units by market share and growth.',
      advantage: 'Guides resource allocation.'
    },
    PDCA: {
      name: 'PDCA Cycle',
      description: 'Plan, Do, Check, Act.',
      advantage: 'Continuous improvement loop.'
    },
    SevenSModel: {
      name: '7S Framework',
      description: 'Strategy, Structure, Systems, Shared Values, Skills, Style, Staff.',
      advantage: 'Holistic organizational diagnosis.'
    },
    MaslowHierarchy: {
      name: 'Maslow\'s Hierarchy',
      description: 'Physiological, Safety, Social, Esteem, Self-actualization.',
      advantage: 'Understands human needs for motivation.'
    },
    RootCause: {
      name: 'Root Cause Analysis',
      description: 'Ask "Why" repeatedly to find the root cause.',
      advantage: 'Gets to the bottom of problems.'
    },
    ParetoAnalysis: {
      name: 'Pareto Analysis',
      description: '80/20 Rule. Find the 20% of causes leading to 80% of results.',
      advantage: 'Focuses on the vital few.'
    },
    AnsoffMatrix: {
      name: 'Ansoff Matrix',
      description: 'Growth strategies based on markets and products.',
      advantage: 'Systematic growth planning.'
    },
    PortersGenericStrategies: {
      name: 'Porter\'s Generic Strategies',
      description: 'Cost Leadership, Differentiation, Focus.',
      advantage: 'Builds competitive advantage.'
    },
    ValueChain: {
      name: 'Value Chain',
      description: 'Analyze value-creating activities.',
      advantage: 'Identifies cost advantages and differentiation.'
    },
    ScenarioPlanning: {
      name: 'Scenario Planning',
      description: 'Envision multiple futures to prepare strategies.',
      advantage: 'Manages uncertainty and flexibility.'
    },
    DecisionMatrix: {
      name: 'Decision Matrix',
      description: 'Weighted scoring to compare options.',
      advantage: 'Transparent and rational decision making.'
    },
    StakeholderAnalysis: {
      name: 'Stakeholder Analysis',
      description: 'Identify and analyze stakeholder interests.',
      advantage: 'Anticipates resistance and improves communication.'
    }
  }
}
