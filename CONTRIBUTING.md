# 贡献指南 / Contributing Guide

感谢您有兴趣为 IdeaVerse 做贡献！本文档将帮助您了解如何参与项目开发。

Thank you for your interest in contributing to IdeaVerse! This document will help you understand how to participate in the project development.

## 目录 / Table of Contents

- [行为准则](#行为准则--code-of-conduct)
- [如何贡献](#如何贡献--how-to-contribute)
- [开发环境设置](#开发环境设置--development-setup)
- [代码规范](#代码规范--coding-standards)
- [提交规范](#提交规范--commit-guidelines)
- [Pull Request 流程](#pull-request-流程)

## 行为准则 / Code of Conduct

本项目采用贡献者公约作为行为准则。参与此项目即表示您同意遵守其条款。请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解详情。

## 如何贡献 / How to Contribute

### 报告 Bug / Reporting Bugs

如果您发现了 bug，请通过 [GitHub Issues](https://github.com/BigTooth/ideaverse/issues) 提交报告。提交前请：

1. 搜索现有 issues，确认该问题尚未被报告
2. 使用 Bug 报告模板填写详细信息
3. 包含复现步骤、预期行为和实际行为

### 提出新功能 / Suggesting Features

欢迎提出新功能建议！请：

1. 通过 Issues 提交功能请求
2. 详细描述功能需求和使用场景
3. 说明该功能如何造福用户

### 提交代码 / Submitting Code

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 开发环境设置 / Development Setup

### 前置要求 / Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤 / Installation Steps

```bash
# 克隆仓库
git clone https://github.com/BigTooth/ideaverse.git
cd ideaverse

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 配置 API Key

1. 复制 `.env.example` 为 `.env`（如果存在）
2. 在应用设置页面配置您的 AI API Key
3. 支持 OpenAI API 和 DeepSeek API

## 代码规范 / Coding Standards

### JavaScript/Vue 规范

- 使用 Vue 3 组合式 API 和 `<script setup>` 语法
- 使用 ES6+ 语法特性
- 函数和变量使用 camelCase 命名
- 组件使用 PascalCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名

### 注释规范

- 使用 JSDoc 格式编写函数注释
- 复杂逻辑添加行内注释说明
- 组件顶部添加功能说明注释

```javascript
/**
 * 计算两个日期之间的天数差
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {number} 天数差
 */
function getDaysDifference(startDate, endDate) {
  // ...
}
```

### 文件结构

```
src/
├── components/     # 可复用组件
│   ├── common/     # 通用组件
│   ├── step1/      # 步骤一相关组件
│   ├── step2/      # 步骤二相关组件
│   └── step3/      # 步骤三相关组件
├── views/          # 页面视图
├── stores/         # Pinia 状态管理
├── services/       # 业务服务层
├── locales/        # 国际化语言包
├── i18n/           # i18n 配置
├── router/         # 路由配置
└── styles/         # 样式文件
```

## 提交规范 / Commit Guidelines

本项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `i18n`: 国际化相关

### 示例

```
feat(i18n): add Japanese language support

fix(ai): resolve streaming response timeout issue

docs: update installation instructions
```

## Pull Request 流程

1. **确保通过所有检查**
   - 代码能够正常构建
   - 没有引入新的 lint 错误

2. **PR 描述模板**
   - 说明更改内容
   - 关联相关 Issue
   - 说明测试方法

3. **代码审查**
   - 所有 PR 需要至少一位维护者审查
   - 根据审查意见进行修改

4. **合并要求**
   - 通过代码审查
   - 没有合并冲突
   - 符合代码规范

## 许可证 / License

通过贡献代码，您同意您的贡献将根据 [GPL-3.0 许可证](LICENSE) 进行授权。

---

再次感谢您的贡献！如有任何问题，欢迎在 Issues 中提出。
