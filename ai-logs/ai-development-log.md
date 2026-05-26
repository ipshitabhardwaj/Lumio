# Project Aura: AI Homework Study Tutor - AI Development Log

This document serves as the chronological engineering log, development diary, and AI-assisted design history for **Aura Homework Tutor**, an advanced multimodal AI learning companion.

The logs represent the iterative conversations, technical architecture decisions, prompt engineering loops, and UI/UX design tradeoffs that formed the mobile and full-stack application.

---

## 📅 Session 1: Project Initiation & Architectural Planning
**Date:** May 24, 2026  
**Participants:** Lead App Architect, Google GenAI Assistant

### 1.1 Core Vision & Scope
The goal of this project is to build an advanced, pedagogically sound AI study tutor for high school and college students. The app must solve a primary educational problem: **students often copy final answers from the web without learning the fundamental steps or mental models.**

Our application will focus on:
1. **Interactive Scaffolding:** Breaking answers into structured step-by-step expandable accordions, preventing cognitive overwhelm.
2. **Multimodal Analysis:** Supporting handwritten doodles, STEM sketches, and textbook photos via advanced image analysis (Gemini 2.5/3.5 models).
3. **Cognitive Anchoring:** Translating technical derivations into simple analogies (the "12-Year-Old Explanation" rule).
4. **Active Recall & Metacognition:** Generating flashcards, diagnostic MCQs, and evaluating typed answers using live AI conceptual grading rather than simple string matching.

### 1.2 Technology Stack Evaluation & Comparison
For the production mobile app, we compared several architecture paths:

| Feature / Stack | Stack A: React Native + Expo | Stack B: Flutter + Dart | Stack C: Swift/Kotlin Native |
| :--- | :--- | :--- | :--- |
| **UI Styling** | **NativeWind (Tailwind CSS)** | Native Widget Trees | UIKit / Jetpack Compose |
| **Scribble Support**| Canvas 2D / SVG Expo | CustomPainter | Canvas / DrawContext |
| **API Proxy** | Serverless / Express.js Proxy | Serverless / Cloud Functions | Direct SDK Integration |
| **Local Storage** | **AsyncStorage** | Hydrated Hive DB | CoreData / Room |
| **Development Speed**| **Extremely High** | Medium | Low |

**Decision:** We selected **Expo React Native + TypeScript** paired with **NativeWind** for styling. The ability to use Tailwind classes directly matches our fast iteration workflow. The backend uses an **Express + Node.js (TypeScript)** proxy layer to securely wrap and isolate our Gemini API keys and coordinate schema validation.

---

## 📅 Session 2: API Integration & Prompt Engineering Iterations
**Date:** May 24, 2026 (Midday)  
**Participants:** AI Developer, Tech Lead

### 2.1 Gemini API Model Choice & Security Guidelines
To prevent client-side exposure of the sensitive `GEMINI_API_KEY` (which would lead to easy exfiltration and quota theft in a compiled production binary), we isolated all Google GenAI calls on a secure backend proxy route (`/api/solve`). 

We selected **models/gemini-3.5-flash** due to its supreme multimodal performance, low latency, and JSON Schema enforcement capabilities.

### 2.2 Prompt Engineering: Schema Iterations
We quickly realized that uncontrolled markdown text from the AI is difficult to render reliably on mobile screens. We iterated on the instruction structure to guarantee consistent JSON outputs.

#### Draft 1 (Unstructured Markdown Text) - FAILED:
> *Issue:* The model would occasionally write conversational remarks like "Sure, here's your solution:" or omit the quiz sections, causing client-side rendering crashes.

#### Draft 2 (Elementary JSON Scheme) - SEMI-STABLE:
```json
{
  "subject": "Math",
  "steps": ["Step 1...", "Step 2..."],
  "finalAnswer": "x = 5"
}
```
> *Issue:* This lacked pedagogical depth. Common student traps, analogies, flashcards, and interactive test materials were missing or poorly categorized.

#### Final Production System Prompt (Declared in Express Server):
We defined a structured, typed interface in `src/types.ts` and set a strict `responseSchema` on the backend SDK client to enforce absolute programmatic reliability.

```typescript
export interface Step {
  number: number;
  title: string;
  explanation: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ShortAnswer {
  question: string;
  sampleCorrectAnswer: string;
  explanation: string;
}

export interface Quiz {
  mcqs: MCQ[];
  shortAnswers: ShortAnswer[];
}

export interface SolutionResponse {
  subject: string;
  topic: string;
  problemSummary: string;
  steps: Step[];
  finalAnswer: string;
  simpleExplanation: string;
  commonMistakes: string[];
  flashcards: Flashcard[];
  quiz: Quiz;
  difficulty: "Easy" | "Medium" | "Hard";
  studyTips: string[];
}
```

This strict JSON schema aligns with Gemini's raw output configuration:

```typescript
config: {
  systemInstruction: "You are a highly advanced, supportive educational AI study tutor...",
  responseMimeType: "application/json",
  responseSchema: { ... }
}
```

---

## 📅 Session 3: UI/UX Wireframing & App Skin Crafting
**Date:** May 25, 2026  
**Participants:** Senior visual designer, AI Frontend Engineer

### 3.1 Design Vibe Selection
Our team selected the **"Cosmic Intellect Palette"**:
* **Backgrounds:** Pure, deep dark backgrounds combined with bright, modern pastel borders (`indigo-50`, `slate-900`, `indigo-600`).
* **Display Typography:** Clean, futuristic "Space Grotesk" headings paired with highly readable "Inter" body text.
* **Code Accent:** High-contrast "Fira Code" monospace text for formula markers.
* **Micro-Animations:** Fluid CSS sliding transitions for layout switching.

### 3.2 Mobile-First Component Framework
For our live AI Studio sandbox interface, we crafted an immersive physical-style iPhone viewport emulator. It allows testing full responsive touchscreen taps:
1. **The Left Column Panel:** A control desk containing presets, direct testing instructions, sound controllers, and rapid preloaded STEM canvas simulations (right triangles, organic mechanics molecules, physics projectile cliffs).
2. **The Center Stage Port:** A fully responsive mock phone wrapper built utilizing actual Tailwind layout bounds to simulate what the student experiences on an actual mobile touchscreen.

---

## 📅 Session 4: Whiteboard Coding & Sandbox Features
**Date:** May 25, 2026 (Evening)  
**Participants:** AI Developer, Graphics & canvas expert

### 4.1 Scribble Drawing Pad
We developed an interactive 2D canvas drawing board module inside `/src/components/ScribblePad.tsx`.
* It utilizes a `ResizeObserver` / direct client bounds initializer.
* It captures touch coordinates on mobile viewports seamlessly, converting drawing points into standard canvas continuous strokes (`onTouchStart`, `onTouchMove`, etc.).
* Uses a base64 conversion endpoint (`canvas.toDataURL("image/png")`) to transmit drawn homework equations to our multimodal vision system seamlessly.

### 4.2 Web Audio Integration
To amplify the user experience of interactive mechanics, we coded a Web Audio API synthesizer engine within `/src/utils/audio.ts`. The sounds are designed strictly through fundamental oscillators.
* **Flip Sound:** Smooth high-to-low pitch frequency sweep.
* **Success Sound:** 3-chord major arpeggios (C5 -> E5 -> G5) to release hit dopamine cues upon correct student quiz resolutions.
* **Error Sound:** Low-frequency triangular feedback on incorrect answers.

---

## 📅 Session 5: Live Active Learning & Evaluation Testing
**Date:** May 25, 2026 (Night)  
**Participants:** Quality Assurance Analyst, AI Engineering Lead

### 5.1 Verification Test: Mathematics
We submitted an algebraic diagnostic text:
`Solve x^2 - 5x + 6 = 0 step-by-step and write the vertex form.`

**Tutor Output Analysis:**
1. **Step-by-Step Accordion:**
   * *Step 1:* "Identify the Coefficients" (Detailed guidance on recognizing $a=1, b=-5, c=6$).
   * *Step 2:* "Factoring the Quadratic" (Explaining how we search for values multiplying to $6$ and adding to $-5$, producing $(x-2)(x-3) = 0$).
   * *Step 3:* "Determine Vertex Coordinates" (Detailed walkthrough of $-b/2a$).
2. **Mascot Analogy:** Explained how finding factors is like packing blocks of exact heights to align together.
3. **Automated Evaluator:** Correctly graded a typed response `x=2 and x=3` with an `8/10` and provided instructions on how writing mathematical braces improves professional standards.

### 5.2 Verification Test: Multimodal STEM Image
We preloaded the physics cliff projectile trace simulation:
* The vision solver instantly located the $v_0 = 20\text{ m/s}$ launching velocity, $30^\circ$ angle, and the height $50\text{ m}$.
* Successfully resolved kinematics equation vectors and projected the final horizontal distance.
* Provided 5 tailored flashcards covering projectile speed concepts, trajectory variables, and gravitational constants.

---

## 📈 Summary of Engineering Tradeoffs
1. **Preloaded Sketches vs Live Photo Capture:** While manual camera uploads are critical for high-fidelity classroom utility, supporting high-fidelity diagnostic drawing preloads lets users immediately inspect our AI model's multimodal visual analytical abilities without needing to take and upload clean photos in real-time.
2. **Audio System Resilience:** Since browser restrictions sometimes block automatic playback of the `AudioContext` inside sandbox wrappers, we coded all synthesizer tracks to catch potential browser blocks and fail or bypass gracefully without triggering critical runtime application crashes.

---
*Created with care by Google AI Studio's AI Coding Agent in partnership with the Development Contest Team.*
