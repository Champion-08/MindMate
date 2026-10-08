<div align="center">

<img src="https://img.shields.io/badge/MindMate-Adaptive%20Learning%20Twin-6366f1?style=for-the-badge&logo=brain&logoColor=white" alt="MindMate" />

# MindMate

### *An AI that learns how you learn.*

**MindMate is a personalized, on-device learning companion that understands your knowledge, strengths, weaknesses, learning pace, and preferences — then adapts every explanation, quiz, and study plan to fit you.**

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

![MindMate Preview](https://placehold.co/900x500/6366f1/ffffff?text=MindMate+Preview&font=inter)

</div>

---

## ✨ What is MindMate?

Most learning apps teach everyone the same way. **MindMate doesn't.**

MindMate builds a **Learning Twin** — a living model of how *you* think and learn. It tracks your knowledge, spots your patterns, predicts your gaps, and adapts everything in real time.

The core learning loop:

```
LEARN  →  MEASURE  →  UNDERSTAND  →  ADAPT  →  IMPROVE
```

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🧠 **Learning Twin** | A persistent model of your knowledge, strengths, weaknesses, learning style, and behavior |
| 🤖 **Adaptive AI Tutor** | Ask anything — MindMate explains in the style that works best for *you* |
| 🎯 **Next Best Action** | Every session starts with one clear recommendation — what to do right now |
| 📊 **Mastery Tracking** | Topic-by-topic mastery progress, not just completion percentages |
| 📅 **Smart Study Planner** | AI-generated weekly plan that adapts after every session |
| 📁 **Smart Materials** | Upload PDFs and notes → get summaries, flashcards, quizzes, and visual explanations |
| 💡 **Proactive Insights** | MindMate notices patterns before you ask — repeated mistakes, session fatigue, mastery milestones |
| 🧩 **Adaptive Quiz** | Functional quiz engine with per-question feedback and personalized explanations |
| 👥 **Friends & Adaptive Battle** | Learn together — each learner gets questions matched to their own level |
| 🌐 **Offline Mode** | Core learning features work without internet; syncs when back online |
| 🔒 **Privacy First** | Learning data processed locally where possible |

---

## 📸 Pages

| Page | Route | Purpose |
|---|---|---|
| Landing | `/` | Product overview & marketing |
| Login | `/login` | Authentication |
| Register | `/register` | Account creation |
| Home | `/home` | Next best action dashboard |
| Learn | `/learn` | AI tutor conversation |
| Practice | `/practice` | Practice & assessment hub |
| Quiz | `/practice/quiz` | Adaptive quiz engine |
| Learning Twin | `/learning-twin` | Your personalized learner model |
| Progress | `/progress` | Mastery & analytics |
| Planner | `/planner` | AI-generated study plan |
| Materials | `/materials` | Upload & transform study materials |
| Insights | `/insights` | Proactive AI observations |
| Friends | `/friends` | Social learning & challenges |
| Settings | `/settings` | Preferences & personalization |

---

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router DOM 6
- **Icons:** Lucide React
- **Charts:** Recharts
- **State:** React Context + localStorage
- **Auth:** Mock auth with localStorage persistence

---

## 🏃 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Champion-08/MindMate.git

# 2. Navigate into the project
cd MindMate

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Type check
npx tsc --noEmit
```

---

## 📁 Project Structure

```
mindmate/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── App.tsx                  # Routes & auth guards
    ├── main.tsx
    ├── index.css
    ├── utils.ts                 # cn() utility
    ├── types/
    │   └── index.ts             # TypeScript types
    ├── data/
    │   └── mockData.ts          # All mock data (learner, topics, quiz, friends…)
    ├── context/
    │   └── AppContext.tsx       # Global state (auth, online status, toasts, modals)
    ├── hooks/
    │   ├── useLocalStorage.ts
    │   ├── useOnlineStatus.ts
    │   └── useToast.ts
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx     # Sidebar + Header wrapper
    │   │   ├── Sidebar.tsx      # Fixed 240px navigation
    │   │   └── Header.tsx       # Page header with search, notifications, profile
    │   ├── ui/                  # Reusable primitives
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Toast.tsx
    │   │   ├── Tabs.tsx
    │   │   ├── Search.tsx
    │   │   ├── StatusIndicator.tsx
    │   │   └── EmptyState.tsx
    │   └── shared/              # Domain components
    │       ├── StatCard.tsx
    │       ├── InsightCard.tsx
    │       ├── ChartCard.tsx
    │       ├── LearningTwinCard.tsx
    │       ├── PracticeCard.tsx
    │       ├── TaskCard.tsx
    │       ├── PlannerDay.tsx
    │       ├── MaterialCard.tsx
    │       ├── QuizQuestion.tsx
    │       └── QuizResult.tsx
    └── pages/
        ├── Landing.tsx
        ├── Login.tsx
        ├── Register.tsx
        ├── Home.tsx
        ├── Learn.tsx
        ├── Practice.tsx
        ├── Quiz.tsx
        ├── LearningTwin.tsx
        ├── Progress.tsx
        ├── Planner.tsx
        ├── Materials.tsx
        ├── Insights.tsx
        ├── Friends.tsx
        └── Settings.tsx
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#6366f1` (Indigo) |
| Accent | `#7c3aed` (Violet) |
| Background | `#f8f7ff` (Light lavender) |
| Surface | `#ffffff` |
| Text dark | `#0f172a` (Navy) |
| Text muted | `#64748b` (Slate) |
| Border | `#e2e0f0` |
| Success | `#22c55e` |
| Warning | `#f59e0b` |
| Danger | `#ef4444` |
| Border radius (card) | `12px` |
| Border radius (button) | `10px` |

---

## 🔐 Auth & Demo

MindMate uses **mock authentication** stored in `localStorage`.

- On the **Login page**, click **"Continue as Demo User (Alex)"** for instant access — no credentials needed.
- Auth state persists across page refreshes.
- Sign out from the profile dropdown in the header.

---

## 🗺️ Roadmap

- [ ] Real backend integration (Node.js / FastAPI)
- [ ] Actual AI/LLM integration (Gemini / OpenAI)
- [ ] Real PDF parsing & material processing
- [ ] Spaced repetition algorithm for flashcards
- [ ] Mobile app (React Native)
- [ ] Real-time multiplayer Adaptive Battle
- [ ] Teacher / coach dashboard

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by [Champion-08](https://github.com/Champion-08)

*"An AI that learns how you learn."*

</div>
