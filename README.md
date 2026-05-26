# Lumio ✦ AI Study Companion

> *Ask a question. Understand it deeply. Never just copy an answer.*

Lumio is a premium AI-powered homework tutor built with React + Vite. It takes any STEM question — typed, photographed, or drawn — and returns a structured breakdown: step-by-step solution, a 12-year-old-friendly analogy, flashcards, a quiz, and a personalised study plan.

LIVE LINK: https://lumio-study-tutor.vercel.app/
---

## Features

**Three ways to ask**
- **Type** — paste any question or problem in plain text
- **Draw** — sketch equations or diagrams on the built-in whiteboard
- **STEM Sketches** — one-click preloaded geometry, chemistry, and physics demos

**Five views per solution**
- **Solution** — expandable step-by-step accordion with a highlighted final answer
- **Analogy** — plain-English explanation pitched at a 12-year-old, plus common mistakes
- **Flashcards** — 3-D flip-card deck for active recall
- **Quiz** — MCQ with instant feedback + short-answer evaluator
- **Study Plan** — checklist of tips and traps tailored to the topic

**Quality-of-life**
- Multimodal: attach a photo of handwritten homework
- Sound feedback (toggleable)
- AI interaction logging to `ai-logs/session-YYYY-MM-DD.jsonl`
- Fully dark-themed, keyboard-friendly, responsive layout

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Custom CSS (CSS variables) + Tailwind utilities |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI | Google Gemini 2.0 Flash (multimodal) |
| Server | Express (thin API proxy) |
| Fonts | Cormorant Garamond · Syne · JetBrains Mono |

---

## Project Structure

```
ai-homework-study-tutor/
├── ai-logs/                        # Auto-generated JSONL interaction logs
│   └── session-YYYY-MM-DD.jsonl
│
├── src/
│   ├── App.tsx                     # Root layout + all page states
│   ├── index.css                   # Global styles, CSS variables, animations
│   ├── types.ts                    # SolutionResponse + shared types
│   │
│   ├── components/
│   │   ├── ScribblePad.tsx         # Canvas whiteboard (Draw tab)
│   │   └── InteractiveStudyTools.tsx  # FlashcardDeck, McqQuiz,
│   │                                  #   ShortAnswerEvaluator, TipsChecklist
│   │
│   └── utils/
│       ├── audio.ts                # playTransitionSound / playSuccessSound
│       ├── canvasPreloads.ts       # generateGeometrySketch / Chemistry / Physics
│       └── logger.ts               # logAIInteraction() — append to ai-logs/
│
├── server/
│   └── routes/
│       └── solve.ts                # POST /api/solve → Gemini → SolutionResponse
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Install

```bash
git clone https://github.com/your-username/ai-homework-study-tutor.git
cd ai-homework-study-tutor
npm install
```

### Configure

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### Run

```bash
# Development (frontend + backend concurrently)
npm run dev

# Build for production
npm run build
npm run preview
```

The app runs at `http://localhost:5173` with the Express API proxied from `/api`.

---

## AI Logging

Every solve call is appended to `ai-logs/session-YYYY-MM-DD.jsonl` as a structured JSON line. Example entry:

```json
{
  "timestamp": "2025-05-26T10:14:22.341Z",
  "sessionId": "a1b2c3d4-...",
  "prompt": "Solve x² − 5x + 6 = 0 step-by-step",
  "hasImage": false,
  "model": "gemini-2.0-flash",
  "inputTokens": 312,
  "outputTokens": 891,
  "latencyMs": 2847,
  "subject": "Mathematics",
  "difficulty": "Easy",
  "topic": "Quadratic Equations",
  "stepCount": 4,
  "flashcardCount": 5,
  "quizCount": 5
}
```

To read logs programmatically:

```ts
import { readTodayLogs, readLogsForDate } from "./src/utils/logger";

const today = readTodayLogs();
const lastWeek = readLogsForDate("2025-05-19");
```

---

## Customising the Theme

All colours, fonts, and radii live in CSS variables at the top of `src/index.css`:

```css
:root {
  --accent:        #c8973a;   /* gold — change this to rebrand */
  --bg-base:       #080c0a;   /* deepest background */
  --font-display:  'Cormorant Garamond', Georgia, serif;
  --font-sans:     'Syne', system-ui, sans-serif;
  /* … */
}
```

---

## API Contract

`POST /api/solve`

**Request body:**
```json
{ "prompt": "string", "image": "base64 data URL or null" }
```

**Response — `SolutionResponse`:**
```ts
{
  topic:            string
  subject:          string
  difficulty:       "Easy" | "Medium" | "Hard"
  problemSummary:   string
  steps:            { number: number; title: string; explanation: string }[]
  finalAnswer:      string
  simpleExplanation: string
  commonMistakes:   string[]
  flashcards:       { front: string; back: string }[]
  quiz: {
    mcqs:         { question: string; options: string[]; answer: string }[]
    shortAnswers: { question: string; modelAnswer: string }[]
  }
  studyTips:        string[]
}
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server + Express API |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint across `src/` |

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes with clear commit messages
3. Open a pull request — describe what you changed and why

Please keep the "explain, don't just answer" philosophy intact. Lumio should always help students understand, not shortcut their learning.

---

## License

MIT © 2025 Ipshita
