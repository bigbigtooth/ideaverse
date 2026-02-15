# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此代码库中工作的指导。

## 项目概述

**深度思界** 是一个基于 Vue 3 的单页应用，通过结构化的三步流程和经典麦肯锡思维模型（MECE、5W2H、SWOT 等）提供 AI 驱动的深度思考辅助。

**核心技术栈：**
- Vue 3 组合式 API 和 `<script setup>` 语法
- Pinia 状态管理
- Vue Router 路由
- Vite 构建工具
- DeepSeek API 提供 AI 能力
- Marked.js Markdown 渲染

## 开发命令

```bash
# 启动开发服务器（Vite 开发服务器，支持热重载）
npm run dev

# 生产构建
npm run build

# 本地预览生产构建
npm run preview

# 安装依赖
npm install
```

## 架构概览

### 核心三步思考流程

应用引导用户完成结构化的思考过程：

1. **步骤一：问题理解** - AI 生成采访问题，用户回答，AI 生成理解报告
2. **步骤二：深度分析** - AI 推荐思维模型，使用框架分析，支持重新分析的交互式卡片
3. **步骤三：方案评估** - AI 头脑风暴生成方案，结构化评估，生成思维导图

### 目录结构

```
src/
├── components/
│   ├── common/          # 通用组件（步骤进度、Markdown 查看器、加载遮罩）
│   ├── step1/          # 步骤一组件（采访问答）
│   ├── step2/          # 步骤二组件（深度分析）
│   └── step3/          # 步骤三组件（方案评估）
├── services/
│   ├── ai.js           # DeepSeek API 集成和思维模型定义
│   └── storage.js      # 基于 localStorage 的持久化
├── stores/
│   └── thinking.js     # 主 Pinia store，管理会话状态
├── views/              # 页面组件（首页、思考页、历史、设置）
├── router/index.js     # Vue Router 配置
└── main.js             # 应用入口
```

### 核心架构模式

**状态管理（Pinia）：**
- `stores/thinking.js` 是管理整个思考流程的主 store
- 使用组合式 API 风格（`defineStore` 配合 `ref` 和 `computed`）
- 处理所有 AI API 调用、加载状态和错误管理
- 通过 `services/storage.js` 将会话数据持久化到 localStorage

**数据流：**
1. 用户输入问题 → store 中调用 `createNewSession()`
2. 每一步调用 `services/ai.js` 中的 AI 函数
3. store 更新会话状态 → 持久化到 localStorage
4. 组件基于 store 状态响应式更新

**会话数据模型**（存储在 localStorage）：
```javascript
{
  id, problem, createdAt, updatedAt, currentStep, status,
  interviewQuestions, interviewAnswers, understandingReport,
  analysisCards, deepAnalysisReport, thinkingModel, thinkingModelId,
  solutions, recommendation, mindMap
}
```

### AI 服务层（`services/ai.js`）

AI 服务是应用的核心。重要细节：

- **API**：DeepSeek API (`https://api.deepseek.com/v1/chat/completions`)
- **模型**：`deepseek-chat`，temperature 0.7，max tokens 2000-4000
- **JSON 解析**：`parseJsonResponse()` 函数处理可能包含 markdown 格式或格式错误的 AI 响应
- **10 种思维模型**：在 `THINKING_MODELS` 常量中定义，包含元数据（id、name、icon、description、advantage、bestFor）

**核心 AI 函数：**
- `generateInterviewQuestions()` - 步骤一：生成采访问题
- `generateUnderstandingReport()` - 步骤一：分析回答生成理解报告
- `recommendThinkingModels()` - 步骤二：推荐适合的思维模型
- `analyzeWithSpecificModel()` - 步骤二：使用指定模型进行深度分析
- `reanalyzeCard()` - 步骤二：重新生成特定分析卡片
- `generateSolutions()` - 步骤三：生成带评分的解决方案
- `regenerateSolution()` - 步骤三：重新生成特定方案
- `generateMindMap()` - 步骤三：生成最终 Markdown 思维导图

### 存储服务（`services/storage.js`）

基于 localStorage 的持久化，使用以下键：
- `ideaverse_sessions` - 所有会话对象数组
- `ideaverse_current_session` - 当前活动会话的 ID
- `ideaverse_api_key` - DeepSeek API 密钥（用户配置）
- `ideaverse_settings` - 用户设置

会话在每一步都存储完整状态，支持随时恢复。

### 组件组织

组件按工作流步骤组织：
- `components/step1/` - 采访问题和答案收集
- `components/step2/` - 思维模型选择和分析卡片展示
- `components/step3/` - 方案展示和评估
- `components/common/` - 共享组件，如步骤进度指示器、Markdown 查看器

### 路由

四个主要路由：
- `/` - 首页（输入新问题）
- `/think/:id?` - 主思考流程（如有 ID 则加载已有会话）
- `/history` - 会话历史列表
- `/settings` - API 密钥配置

Think 视图是处理所有三个步骤的核心工作流页面。

## 重要实现细节

**API 密钥管理：**
- 用户必须在设置中配置自己的 DeepSeek API 密钥
- 存储在 localStorage 中，键为 `ideaverse_api_key`
- 进行任何 AI 调用前检查 `hasApiKey()`

**错误处理：**
- store 有 `loading`、`loadingMessage` 和 `error` 状态
- 所有异步 AI 函数使用 try-catch 配合 `setLoading()` 和 `setError()`
- 组件应该展示 store 中的加载状态和错误

**JSON 响应解析：**
- AI 响应经常在 JSON 值中包含 markdown 格式
- `cleanJsonString()` 移除 JSON 值中的 `**`、`*` markdown 标记
- `parseJsonResponse()` 在失败前尝试多种提取策略
- 常见问题：AI 返回 markdown 包装的 JSON 或在值中包含格式化

**UI 语言：**
- 所有面向用户的文本使用中文
- 变量名和注释使用英文
- 组件 props 和数据结构使用英文键名

## 开发注意事项

**无测试框架**：项目目前未配置测试。添加测试时，建议使用 Vitest（Vue 3 + Vite 项目的推荐选择）。

**无类型安全**：项目使用 JavaScript 而非 TypeScript。VSCode 扩展推荐（`vue.volar`）用于 Vue 语言支持。

**设计系统**：CSS 变量主题定义在 `src/styles/main.css`。应用默认使用深色主题。

**性能**：Think 视图使用了懒加载。其他视图也可以从懒加载中受益。

**API 速率限制**：DeepSeek API 有速率限制。应用未实现重试逻辑或指数退避——生产环境建议添加。
