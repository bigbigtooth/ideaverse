# IdeaVerse 项目结构地图 (SITEMAP)

本文档详细描述了项目的目录结构和关键文件的作用，帮助开发者快速理解项目架构。

## 目录结构树

```
src/
├── assets/             # 静态资源文件
│   ├── logo.png        # 应用 Logo
│   └── vue.svg         # Vue 标志
├── components/         # Vue 组件库
│   ├── common/         # 通用基础组件
│   ├── step1/          # 步骤一：问题采访相关组件
│   ├── step2/          # 步骤二：深度分析相关组件
│   └── step3/          # 步骤三：解决方案相关组件
├── i18n/               # 国际化配置
├── locales/            # 语言资源文件
│   ├── zh-CN.js        # 中文语言包
│   └── en-US.js        # 英文语言包
├── router/             # 路由配置
├── services/           # 业务逻辑服务层
├── stores/             # Pinia 状态管理
├── styles/             # CSS 样式文件
├── views/              # 页面级视图组件
├── App.vue             # 应用根组件
├── main.js             # 应用入口文件
```

## 详细文件说明

### 1. Internationalization (国际化)
- **`src/i18n/index.js`**: i18n 实例初始化配置。
- **`src/locales/*.js`**: 存储各语言的翻译键值对，包括 UI 文本、思维模型描述和系统提示词模板。

### 2. Services (业务服务层)
核心业务逻辑主要集中在此目录，独立于 UI 组件。

- **`src/services/ai.js`**
  - **作用**: 封装 DeepSeek API 的交互逻辑。
  - **核心功能**:
    - `callDeepSeek`: 处理流式 API 请求。
    - `parseJsonResponse`: 智能解析 AI 返回的 JSON 数据。
    - 提供各业务步骤的专用 AI 调用函数（如 `generateInterviewQuestions`, `analyzeWithThinkingModels` 等）。

- **`src/services/prompts.js`**
  - **作用**: 管理发送给 AI 的 Prompt 模板。
  - **核心功能**:
    - 根据当前语言环境 (`zh-CN`/`en-US`) 动态返回对应的 System Prompt。

- **`src/services/storage.js`**
  - **作用**: 封装 LocalStorage 数据持久化逻辑。
  - **核心功能**:
    - 会话 (Session) 的 CRUD 操作。
    - 设置 (Settings) 的存取。

### 2. Stores (状态管理)
使用 Pinia 进行全局状态管理。

- **`src/stores/thinking.js`**
  - **作用**: 管理思考过程的所有状态。
  - **核心状态**:
    - `currentSession`: 当前活跃的思考会话数据。
    - `aiStatus`: AI 交互的实时状态（idle, requesting, receiving）。
    - `loading`: 全局加载状态。
  - **核心 Action**:
    - `analyzeWithModel`: 协调 AI 服务，执行分步、并发的深度分析流程。

### 3. Views (页面视图)
主要页面组件，对应路由配置。

- **`src/views/HomeView.vue`**: 首页，提供输入初始问题的入口。
- **`src/views/ThinkView.vue`**: 核心思考页面，包含步骤进度条和三个主要步骤组件。
- **`src/views/HistoryView.vue`**: 历史记录页面，查看过往的分析会话。
- **`src/views/SettingsView.vue`**: 设置页面，配置 API Key 等。

### 4. Components (组件)

#### Common (通用)
- `GlobalStatusTooltip.vue`: 全局状态提示条（如显示"AI 正在思考..."）。
- `LoadingOverlay.vue`: 全屏加载遮罩。
- `MarkdownViewer.vue`: 封装 Marked 库，用于渲染 Markdown 内容。
- `StepProgress.vue`: 顶部的步骤进度指示器。

#### Step 1 (采访)
- `Step1Interview.vue`: 处理 AI 提问和用户回答的交互流程。

#### Step 2 (分析)
- `Step2Analysis.vue`: 展示思维模型推荐、分析卡片流和深度报告。

#### Step 3 (方案)
- `Step3Solutions.vue`: 展示生成的解决方案、行动建议和思维导图。

### 5. Styles (样式)
- `main.css`: 全局样式重置和基础变量。
- `ThinkView.css`: 思考页面的专用样式，包含卡片布局、动画等。
