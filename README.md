# IdeaVerse

**AI-Powered Deep Thinking Assistant**

[中文](./README_CN.md) | English

---

<p align="center">
  Combining 36 scientific thinking models for multi-dimensional deep problem analysis with AI assistance
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Features

- **🧠 36 Thinking Models**: Covering 6 domains - logical thinking, creative thinking, problem solving, marketing, team organization, and business strategy
- **🌍 Multi-language Support**: Complete Chinese and English interface, AI responds in the corresponding language
- **📊 Mind Map Visualization**: Interactive mind maps generated with Markmap
- **🔄 Three-Step Analysis**: Problem Understanding → Deep Analysis → Solution Evaluation
- **🔐 Local Data Storage**: Privacy-focused, data stays on your device
- **⚙️ Customizable Prompts**: Users can customize all AI system prompts in settings

## Demo

Visit [GitHub Pages](https://bigtooth.github.io/ideaverse) for a live demo.

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/BigTooth/ideaverse.git
cd ideaverse

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. Configure your AI API Key in the settings page
2. Supports OpenAI API and DeepSeek API
3. Customizable API endpoint URL

### Build

```bash
# Build for production
npm run build

# Preview build result
npm run preview
```

## Project Structure

```
ideaverse/
├── src/
│   ├── components/       # Vue components
│   │   ├── common/       # Common components
│   │   ├── step1/        # Step 1 components
│   │   ├── step2/        # Step 2 components
│   │   └── step3/        # Step 3 components
│   ├── views/            # Page views
│   ├── stores/           # Pinia state management
│   ├── services/         # Business services
│   │   ├── ai.js         # AI API integration
│   │   ├── prompts.js    # AI prompt management
│   │   └── storage.js    # Local storage service
│   ├── locales/          # i18n language files
│   ├── i18n/             # i18n configuration
│   ├── router/           # Router configuration
│   └── styles/           # Style files
├── public/               # Static assets
├── package.json
├── vite.config.js
└── LICENSE
```

For detailed project structure, see [SITEMAP.md](./SITEMAP.md).

## Thinking Models

IdeaVerse integrates 36 classic thinking models across 6 domains. Each model has specific strengths for different problem types.

### Logical Thinking

| Model | Description | Best For |
|-------|-------------|----------|
| MECE Framework | Mutually Exclusive, Collectively Exhaustive | Strategic consulting, problem decomposition |
| Pyramid Principle | Lead with conclusion, logical progression | Communication, report writing |
| Six Thinking Hats | Six perspectives to activate diverse thinking | Team collaboration, creative discussions |
| PREP Method | Point-Reason-Example-Point structure | Structured expression |
| Inductive-Deductive | Combine induction and deduction | Argumentation and reasoning |

### Creative Thinking

| Model | Description | Best For |
|-------|-------------|----------|
| Written Brainstorming | Collect ideas in written form | Team creativity, equal participation |
| KJ Method | Card sorting to integrate information | Information organization, knowledge building |
| Mandala Thinking | 9-grid divergent thinking | Creative exploration, multi-dimensional analysis |
| SCAMPER | 7 dimensions to spark innovation | Product innovation, process optimization |
| Pros-Cons List | Compare advantages and disadvantages | Decision support |

### Problem Solving

| Model | Description | Best For |
|-------|-------------|----------|
| 5W2H Analysis | Seven-dimension comprehensive analysis | Problem definition, information gathering |
| Logic Tree | Layer-by-layer problem decomposition | Complex problem breakdown |
| Sky-Rain-Umbrella | Fact → Interpretation → Action | Quick decision making |
| Eisenhower Matrix | Importance/urgency classification | Time management, task prioritization |
| Hypothesis Thinking | Hypothesis-driven quick focus | Problem diagnosis |
| Root Cause Analysis | Continuously ask "why" | Problem tracing |
| Pareto Analysis | 80/20 principle | Resource optimization, key factor identification |
| Decision Matrix | Multi-criteria weighted scoring | Option comparison |

### Marketing Strategy

| Model | Description | Best For |
|-------|-------------|----------|
| SWOT Analysis | Strengths/Weaknesses/Opportunities/Threats | Strategic planning |
| PEST Analysis | Political/Economic/Social/Technological | Macro environment analysis |
| 3C Analysis | Company/Customer/Competitor | Competitive strategy |
| STP Analysis | Segmentation/Targeting/Positioning | Market positioning |
| Porter's Five Forces | Industry competition intensity assessment | Industry analysis |
| Marketing Mix 4P | Product/Price/Place/Promotion | Marketing strategy |
| AIDMA Model | Attention-Interest-Desire-Memory-Action | Consumer behavior analysis |
| Product Lifecycle | Introduction/Growth/Maturity/Decline | Product strategy |
| BCG Matrix | Market growth rate and share classification | Business portfolio management |

### Organization & Team

| Model | Description | Best For |
|-------|-------------|----------|
| PDCA Cycle | Plan-Do-Check-Act | Continuous improvement |
| 7S Model | Strategy/Structure/Systems/Staff/Skills/Style/Shared Values | Organization diagnosis |
| Maslow's Hierarchy | Needs hierarchy motivation | Team motivation |
| Stakeholder Analysis | Identify and analyze stakeholder interests | Project management, change management |

### Business Strategy

| Model | Description | Best For |
|-------|-------------|----------|
| Ansoff Matrix | Market/product portfolio growth strategy | Growth planning |
| Porter's Three Strategies | Cost leadership/Differentiation/Focus | Competitive strategy |
| Value Chain Analysis | Value creation activity analysis | Cost optimization, differentiation |
| Scenario Planning | Multiple future scenario responses | Strategic flexibility |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue | 3.5.x | Frontend Framework |
| Vite | 7.x | Build Tool |
| Pinia | 3.x | State Management |
| Vue Router | 4.x | Routing |
| Vue I18n | 11.x | Internationalization |
| OpenAI SDK | 6.x | AI API Integration |
| Markmap | 0.18.x | Mind Map |
| D3.js | 7.x | Data Visualization |
| Lucide | latest | Icons |
| Marked | 17.x | Markdown Parser |

## Contributing

We welcome all forms of contributions! Please read the [Contributing Guide](./CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

This project is open-sourced under the [GPL-3.0 License](./LICENSE).

This means you can freely use, modify, and distribute this software, but derivative works must be released under the same license.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/BigTooth">BigTooth</a>
</p>
