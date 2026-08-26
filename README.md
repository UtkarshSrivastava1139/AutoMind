<div align="center">
  
# 🧠 AutoMind: The Ultimate Platform for Automata & Formal Languages

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Powered by AI](https://img.shields.io/badge/Powered_by-AI-purple?logo=openai)](https://openai.com)

**Say goodbye to staring at static whiteboard diagrams.** 

AutoMind is a breakthrough, interactive learning platform designed to make the Theory of Automata and Formal Languages (TAFL) intuitive, visual, and brilliantly engaging. Built with a mathematically rigorous deterministic engine and paired with a sleek visual workspace, AutoMind turns theoretical computer science into an interactive sandbox.

[Explore Features](#-core-features) • [Tech Stack](#-technology-stack) • [Getting Started](#-getting-started) • [Roadmap](#-roadmap)

</div>

---

## ✨ Why AutoMind?

AutoMind doesn’t just show you how automata work—it lets you **build**, **simulate**, **test**, and **break** them in real-time. Whether you are a student preparing for finals, an educator demonstrating Hopcroft's Algorithm, or a compiler enthusiast parsing regular expressions, AutoMind is your digital lab.

### 🎯 Core Features Built for You

#### 1. 🕹️ The Visual Automata Simulator
Step inside a beautiful, node-based workspace to construct finite automata visually.
- **Drag-and-Drop Canvas:** Seamlessly draw states, connect transitions, and define acceptance.
- **Real-Time Simulation:** Watch strings flow through your machine step-by-step with glowing active states.
- **Instant Validation:** Test edge-cases on the fly. Know exactly when and why a string is rejected or accepted.

#### 2. ⚡ The Intelligent Regex Converter Pipeline
Ever wondered what a regular expression looks like under the hood? AutoMind visualizes the entire compilation pipeline!
- **AST Generation:** Parse regex into an elegant Abstract Syntax Tree.
- **Thompson's Construction:** Instantly generate an NFA with ε-transitions.
- **Subset Construction:** Convert your NFA into a deterministic machine (DFA) automatically.
- **Hopcroft’s Minimization:** Optimize the DFA to its mathematical minimum.
- **Export to Simulator:** Take the final minimized DFA and tweak it in the visual editor.

#### 3. 🧠 The Q-Solver (Question Solver)
Struggling with homework? The Q-Solver is your rigorous academic companion.
- **Natural Language Input:** Type constraints like *"Starts with 'ab' and has an even number of 0s"*.
- **Bulletproof Deterministic Engine:** AutoMind doesn't guess. It uses a mathematically sound product-engine architecture, cross-product BFS equivalence proofs, and exhaustive bounded checking to guarantee 100% correct DFAs.
- **Instant Verdicts:** See exactly why a solution works through robust test case verification.

#### 4. ✧ Your Personal AI Tutor
Never get stuck again.
- **Context-Aware Assistance:** Ask the AI *"Why did this string fail in state q3?"* or *"Explain how to convert this NFA."*
- **Persistent Global Drawer:** Your AI tutor follows you everywhere across the platform.
- **Rich Mathematical Rendering:** LaTeX and Markdown support means complex formulas always look beautiful and legible.

---

## 🛠️ State-of-the-Art Technology Stack

AutoMind isn't just powerful on the surface; it's engineered with the modern web in mind.

**Frontend Ecosystem:**
- **Framework:** Next.js (App Router) for blazing-fast performance.
- **Styling:** Tailwind CSS + Glassmorphism UI for a stunning, premium aesthetic.
- **Graph Engine:** React Flow + ELKjs for auto-layouting massive state machines perfectly.
- **State Management:** Zustand for ultra-lightweight, reactive state.

**Backend, Engine & AI:**
- **Automata Engine:** A custom-built, zero-dependency TypeScript deterministic engine for mathematically pure DFA/NFA evaluation and generation.
- **AI Integration:** OpenAI API orchestrates the Q-Solver intent parsing and powers the interactive AI Tutor.
- **Runtime:** Node.js + React Server Components.

---

## 🚀 Getting Started in Minutes

Ready to dive in? Getting AutoMind running locally is a breeze.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` or `pnpm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/automind.git
   cd automind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure your AI provider (Google Gemini or OpenRouter):
   ```env
   # Google Gemini API (Recommended: fast, high token limits, native JSON mode)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash

   # Or OpenRouter
   # OPENROUTER_API_KEY=your_openrouter_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Experience AutoMind:**
   Navigate to [http://localhost:3000](http://localhost:3000) and start building!

---

## 🗺️ What's Next? (Roadmap)

We are constantly pushing the boundaries of what a digital learning platform can be.

- 🟢 **Phase 1 (Live):** DFA/NFA Simulator, Regex Pipeline, AI Tutor, Q-Solver.
- 🟡 **Phase 2 (Coming Soon):** Context-Free Grammar (CFG) Parser & Leftmost/Rightmost Derivation Trees.
- 🔵 **Phase 3:** Pushdown Automata (PDA) & Turing Machine Simulation.
- 🟣 **Phase 4:** Gamification (XP, Leaderboards, Badges, and Social Challenges).

---

## 🤝 Join the Movement

We believe computer science education should be accessible and visually engaging for everyone. Contributions are welcome and highly encouraged! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ for Computer Science students everywhere.</p>
  <p>Licensed under the MIT License.</p>
</div>
