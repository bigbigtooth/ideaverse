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
