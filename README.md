# 🧠 AutoMind

**AutoMind** is an intelligent, interactive, and visual learning platform designed to simplify the understanding of Theory of Automata and Formal Languages (TAFL) through simulation, visualization, AI-assisted learning, and gamified education.

By bridging the gap between theoretical computer science concepts and practical understanding, AutoMind enables students to visually create, simulate, analyze, and learn automata systems interactively.

---

## ✨ Core Features

AutoMind replaces static whiteboard theory with a fully interactive digital lab environment.

### 1. ◉ Automata Simulator (DFA / NFA)
A node-based visual workspace to build and simulate finite automata.
- **Visual Editor:** Drag-and-drop canvas for drawing states and transitions.
- **Interactive Execution:** Step-by-step string simulation with active state highlighting.
- **Automated Validation:** Instantly identifies if strings are accepted or rejected based on your graph.

### 2. ⚡ Regex Converter Pipeline
Convert any Regular Expression into minimized Deterministic Finite Automata visually.
- **Step 1 (AST):** Parses the regular expression into an Abstract Syntax Tree.
- **Step 2 (NFA):** Applies **Thompson's Construction** to generate an NFA with ε-transitions.
- **Step 3 (DFA):** Uses **Subset Construction** to convert the NFA into a DFA.
- **Step 4 (Minimization):** Uses **Hopcroft's Algorithm** to minimize the DFA.
- **Direct Integration:** Seamlessly export the final minimized DFA directly into the interactive simulator.

### 3. 🧠 Question Solver (Q-Solver)
A specialized module for academic practice and verification.
- **Problem Input:** Enter language definitions or automata constraints.
- **Automated Solutions:** Generates the required state machine automatically.
- **Verification:** Marks problems as "Verified" or "Partial" based on rigorous test cases.
- **Export:** Open generated solutions directly in the Simulator for further manual tweaking.

### 4. ✧ AI Tutor
A built-in context-aware artificial intelligence assistant.
- **Doubt Resolution:** Ask questions like *"Why is this string rejected?"* or *"Explain DFA minimization"*.
- **Persistent Drawer:** The AI Tutor sidebar is globally available across the workspace.
- **Mathematical Rendering:** Fully supports Markdown, LaTeX, and formula rendering for academic answers.

### 5. ✦ Quizzes & Gamification (Coming Soon)
- Topic-wise Multiple Choice Questions.
- Interactive simulation prediction tests.
- XP, Badges, and Streaks to reward consistent learning.

---

## 🛠️ Technology Stack

AutoMind is built using a modern, scalable web stack:

**Frontend Ecosystem:**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Glassmorphism UI
- **Graph Engine:** React Flow / ELKjs (for automatic layouting)
- **State Management:** Zustand
- **Icons & UI:** Lucide React, Radix UI

**Backend & AI:**
- **Runtime:** Node.js / React Server Components
- **AI Integration:** OpenAI API (for the AI Tutor)
- **Data Parsing:** Custom Regex and Automata parsing engines

---

## 🚀 Getting Started

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
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure your AI provider (e.g., OpenAI):
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
apps/web/src/
 ├── app/                     # Next.js App Router (Dashboard, Workspace, Marketing)
 │    ├── (dashboard)/        # Global app layout with Sidebar
 │    └── (workspace)/        # Fullscreen canvas layouts
 ├── components/
 │    ├── ai-tutor/           # AI Chat drawer and logic
 │    ├── question-solver/    # QSolver inputs, test cases, and solution diagrams
 │    ├── regex-converter/    # AST, Thompson's, Subset, and Hopcroft's algorithms UI
 │    ├── simulator/          # React Flow canvas, StateNodes, TransitionEdges
 │    └── shared/             # Global Sidebar and Layout Wrappers
 ├── lib/                     # ELK layouting, graph converters, math utilities
 ├── store/                   # Zustand stores (useSimulatorStore, useRegexStore)
 └── ...
packages/engine/              # Core Automata theory and conversion algorithms
```

---

## 🗺️ Roadmap

- **Phase 1 (Current):** DFA/NFA Simulator, Regex Converter, Basic AI Tutor, QSolver.
- **Phase 2:** Context-Free Grammar (CFG) Parser, Leftmost/Rightmost derivations.
- **Phase 3:** Pushdown Automata (PDA) and Turing Machine Simulators.
- **Phase 4:** Full Gamification (XP, Leaderboards, Social Challenges).

---

## 🤝 Contributing

Contributions are welcome! If you're passionate about computer science education, feel free to fork the repository and submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
