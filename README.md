# Roastify 🔥 — Roast as a Service (RaaS)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://roast-as-a-serivice.vercel.app/)
[![Build Status](https://img.shields.io/badge/Vite-Build--Success-green?style=flat&logo=vite)](https://github.com/barath0508/Roast-as-a-Serivice)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/Styling-Vanilla_CSS3-1572B6?logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**Roastify** is a premium, unhinged, and highly interactive AI-powered entertainment platform that serves savage, witty, and customized roasts for developers, job hunters, and startup founders. RaaS combines modern glassmorphic web design, gamified progression systems, retro Web Audio soundscapes, and Google Gemini LLM integrations into a complete, release-ready web application.

🚀 **Live Demo:** [https://roast-as-a-serivice.vercel.app/](https://roast-as-a-serivice.vercel.app/)

---

## 📖 Table of Contents
* [Core Features](#-core-features)
* [Design & Aesthetics](#-design--aesthetics)
* [Tech Stack](#-tech-stack)
* [Getting Started](#-getting-started)
* [Hosting & Deployment (Vercel)](#-hosting--deployment-vercel)
* [High-Impact SEO Strategy](#-high-impact-seo-strategy)
* [Project Directory Structure](#-project-directory-structure)
* [License](#-license)

---

## ⚡ Core Features

### 1. 🔥 The Grill (Input Modes)
* **GitHub Profile Roaster**: Dissects public repository counts, commit history cadence, bio text, and programming language distributions to evaluate developer credentials.
* **Resume & CV Analyzer**: Highlights years of unpaid internships, generic corporate buzzwords, and structural patterns to deliver career-critiquing burns.
* **Startup Pitch Teardown**: Critiques business ideas, unit economics, market size, moats, and CAC targets.
* **Spaghetti Code Blaster**: Scans code blocks for nested loops, complex naming conventions, and technical debt.
* **Custom Targets**: Accepts custom contextual clues to roast roommates, crypto bros, or friends.
* **Roast Battle Mode (Comparative Dueling)**: Pitches two GitHub usernames or custom targets head-to-head. The engine spits out individual roasts, compares metrics, writes a final verdict, and crowns the winner.

### 2. 📺 The Burn Ward (Terminal & Scoreboards)
* **Typewriter Output Screen**: Prints roasts character-by-character inside a retro CRT-styled terminal window complete with crackling static chimes.
* **Circular Roast Score Meter**: Animates a circular progress chart evaluating overall "Roastability" alongside horizontal gauges for *Cringe Factor*, *Buzzword Density*, and *Red Flags*.
* **Battle Dueling Scorecard**: Displays side-by-side metrics comparing battle contestants, complete with a floating winner crown badge.

### 3. 🏆 Gamification & Viral Hooks
* **Achievement Vault**: Tracks browser accomplishments (e.g. Gladiator, Pyromaniac, Nuclear Waste) in a local dashboard. Unlocks award custom developer titles and dispatches synthetic chiptune arpeggios.
* **Hall of Shame**: A local storage-based leaderboard displaying top-scoring roasts and historical targets.
* **Anonymous Request Links**: Generates a shareable query link (`?anon=true&target=Name`) that clipboard-copies to let users prompt friends to get roasted anonymously.
* **Canvas Card Export**: Draws custom, theme-styled social cards on HTML5 Canvas using pure mathematical coordinate wrapping, triggering PNG downloads for social sharing.

---

## 🎨 Design & Aesthetics

Roastify follows premium, modern web design standards:
* **Glassmorphism**: Translucent panels with blur filter backdrops (`backdrop-filter: blur(20px)`), glowing borders, and drop-shadow depth layers.
* **Severity Themes**: Adjusting the burns slider changes the entire application layout:
  * **Mild (38°C)**: Gold/orange typography theme (`theme-mild`).
  * **Spicy (85°C)**: Fiery orange-red theme (`theme-spicy`).
  * **Nuclear (240°C)**: Radioactive pink-purple theme with neon toxic green details (`theme-nuclear`).
* **GPU-Optimized Animations**: Implements flickering logo flames and background glowing orbs. Float animations automatically scale down or pause on mobile viewports (`max-width: 768px`) to optimize framerate rendering.
* **Fluid Layouts**: Full responsiveness utilizing viewport-driven flexboxes and stacking grids for flawless displays from 320px phone sizes up to ultra-wide desktop monitors.

---

## 🛠️ Tech Stack

* **Frontend Structure**: Semantic HTML5 & Vanilla ES6 Javascript (Modular Imports).
* **Styling**: Modern CSS3 utilizing CSS variables and transition layouts.
* **Framework Bindings**: React (`v18.2.0`) & React-DOM.
* **Build System**: Vite (`v5.0.0`).
* **Serverless Proxy**: Vercel Node.js function (`/api/roast.js`).
* **AI Model Integrations**: Google Gemini API (rotates models: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-flash-latest`) utilizing structured JSON guidelines.
* **Audio Synthesis**: Pure Web Audio API retro oscillator sound synthesizer (no heavy asset downloads).
* **Web Analytics**: `@vercel/analytics` real-time visitor event monitoring.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [npm](https://www.npmjs.com/) (v8+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/barath0508/Roast-as-a-Serivice.git
   cd Roast-as-a-Serivice
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
To support AI Generation without sharing custom browser keys:
1. Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Alternatively, users can input their own Gemini API key directly into the application browser UI, which remains saved only in browser memory).*

### Commands
* **Run Local Dev Server**:
  ```bash
  npm run dev
  ```
* **Compile Production Build**:
  ```bash
  npm run build
  ```
* **Preview Production Bundle**:
  ```bash
  npm run preview
  ```

---

## ☁️ Hosting & Deployment (Vercel)

This repository is pre-configured for seamless Vercel hosting:
* **Vite Executable Fix (Exit Code 126)**: In Vercel's build console, direct execution of the local Vite symlink (`node_modules/.bin/vite`) might trigger a permissions blockade. To bypass this, the build script in [package.json](package.json) directly runs the Node compiler target:
  ```json
  "build": "node node_modules/vite/bin/vite.js build"
  ```
* **Serverless Routes**: `/api/roast` receives requests and acts as a CORS-configured proxy to execute Google Gemini instructions securely without exposing API keys to the browser client.

---

## 📈 High-Impact SEO Strategy

Roastify is optimized to rank at the top of organic search lists:
* **Exhaustive Meta Keywords**: Contains over 80+ granular search terms mapping developer niches, career help, and AI entertainment keywords.
* **Sitemap & Robots Configurations**: Contains pre-configured [sitemap.xml](public/sitemap.xml) and [robots.txt](public/robots.txt) files pointing directly to the live domain. Vite copies these files to the root of the output `dist/` folder on compile.
* **Google Site Verification**: Dedicated Google search console verification tag embedded in the HTML head and served as [google4867b014d6b90931.html](public/google4867b014d6b90931.html).
* **Dual JSON-LD Schema Structure**:
  1. `WebApplication` Schema: Catalogues features, browser requirements, pricing ($0), and application classification.
  2. `FAQPage` Schema: Maps standard question/answer accordions, enabling search crawlers to render interactive collapsible answers directly inside search results.

---

## 📂 Project Directory Structure

```
Roast-as-a-Serivice/
├── api/
│   └── roast.js            # Serverless Node API (Google Gemini Proxy)
├── public/
│   ├── google4867b014d6b90931.html # Search Console verification
│   ├── robots.txt          # Crawler directives
│   └── sitemap.xml         # Site structure index
├── src/
│   ├── js/
│   │   ├── achievements.js # local storage progress & notification dispatch
│   │   ├── analytics.js    # Vercel Web Analytics initialization
│   │   ├── app.js          # Core tab, submit, scoreboard, & UI controller
│   │   ├── roastEngine.js  # Heuristic fallback & client API engine
│   │   └── soundManager.js # Synthesized Web Audio click & static sounds
│   └── styles/
│       └── style.css       # Layouts, animations, orbs, and severity themes
├── index.html              # Main viewport & SEO headers
├── package.json            # Scripts & dependencies
├── vercel.json             # Vercel serverless configurations
└── README.md               # Repository documentation
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) or the header badges for details.
