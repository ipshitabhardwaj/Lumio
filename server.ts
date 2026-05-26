import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// ── Debug: log every incoming API request ──────────────────────
app.use("/api", (req, _res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[AUTH] GEMINI_API_KEY present:", !!apiKey);
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Configure it in the Secrets / .env panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

// ── /api/solve ─────────────────────────────────────────────────
app.post("/api/solve", async (req, res) => {
  try {
    const { prompt, image } = req.body;
    console.log("[solve] prompt length:", prompt?.length ?? 0, "| image:", !!image);

    const ai = getAiClient();

    // Build contents payload
    let contents: any;
    if (image) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-.+]+);base64,(.+)$/);
      if (matches?.length === 3) {
        contents = {
          parts: [
            { inlineData: { mimeType: matches[1], data: matches[2] } },
            { text: prompt || "Analyze this homework problem image." },
          ],
        };
      } else {
        contents = {
          parts: [
            { inlineData: { mimeType: "image/png", data: image.includes(",") ? image.split(",")[1] : image } },
            { text: prompt || "Analyze this homework problem image." },
          ],
        };
      }
    } else {
      contents = prompt || "Solve this general tutoring problem.";
    }

    const systemInstruction = `You are a highly advanced, supportive educational AI study tutor.
Your primary mission is to help the student truly LEARN the logical concepts behind their question, rather than just copying answers.

You must analyze the incoming question or image, identify the exact subject and specific topic list, and output a highly structured JSON response matching the required schema.

Schema requirements and fields:
- subject: e.g., Math, Physics, Chemistry, Biology, History, English Literature, Computer Science, Economics.
- topic: specific scientific/historical concept (e.g., "Quadratic Equations", "Photoelectric Effect", "Stoichiometry", "Cell Division").
- problemSummary: simple, rewritten version of the input problem so the student knows you understood.
- steps: detailed breakdown of the solution. Every step must have a numeric 'number', a 'title' representing what is happening, and a supportive 'explanation' of the mechanics. Break down math algebra, physics derivations, or essay outlines very clearly.
- finalAnswer: clearly highlighted, single-paragraph final solution or result.
- simpleExplanation: explain the core concept like the student is 12 years old, using an easy real-world analogy. Keep it incredibly friendly and easy.
- commonMistakes: an array of 2-3 specific mistakes or misconceptions students make when tackling this exact topic.
- flashcards: an array of exactly 5 flashcards for reinforcing the study material. Each must have a 'question' and an 'answer'.
- quiz: an interactive quiz object containing:
  - mcqs: exactly 3 multiple choice questions, each containing 'question', 'options' (array of 4 options), 'correctOptionIndex' (0 to 3), and 'explanation'.
  - shortAnswers: exactly 2 short-answer questions containing 'question', 'sampleCorrectAnswer', and 'explanation'.
- difficulty: choice of 'Easy', 'Medium', or 'Hard'.
- studyTips: array of 3 practical, short tips for memorizing, practicing, or reviewing this exact topic.`;

    console.log("[solve] calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject:          { type: Type.STRING },
            topic:            { type: Type.STRING },
            problemSummary:   { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number:      { type: Type.INTEGER },
                  title:       { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["number", "title", "explanation"],
              },
            },
            finalAnswer:       { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            commonMistakes:   { type: Type.ARRAY, items: { type: Type.STRING } },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer:   { type: Type.STRING },
                },
                required: ["question", "answer"],
              },
            },
            quiz: {
              type: Type.OBJECT,
              properties: {
                mcqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question:           { type: Type.STRING },
                      options:            { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctOptionIndex: { type: Type.INTEGER },
                      explanation:        { type: Type.STRING },
                    },
                    required: ["question", "options", "correctOptionIndex", "explanation"],
                  },
                },
                shortAnswers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question:            { type: Type.STRING },
                      sampleCorrectAnswer: { type: Type.STRING },
                      explanation:         { type: Type.STRING },
                    },
                    required: ["question", "sampleCorrectAnswer", "explanation"],
                  },
                },
              },
              required: ["mcqs", "shortAnswers"],
            },
            difficulty: {
              type: Type.STRING,
              description: "Must be exactly 'Easy', 'Medium', or 'Hard'",
            },
            studyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "subject","topic","problemSummary","steps","finalAnswer",
            "simpleExplanation","commonMistakes","flashcards","quiz",
            "difficulty","studyTips",
          ],
        },
      },
    });

    console.log("[solve] Gemini responded OK");
    const text = response.text ?? "{}";
    const parsedResult = JSON.parse(text);
    res.json(parsedResult);

  } catch (error: any) {
    // Log the FULL error so we can see exactly what Gemini returned
    console.error("[solve] ERROR name    :", error?.name);
    console.error("[solve] ERROR message :", error?.message);
    console.error("[solve] ERROR status  :", error?.status ?? error?.statusCode);
    console.error("[solve] ERROR details :", JSON.stringify(error?.errorDetails ?? error?.details ?? null));
    console.error("[solve] STACK         :", error?.stack);
    res.status(500).json({ error: error.message || "Unexpected error." });
  }
});

// ── /api/grade-short-answer ────────────────────────────────────
app.post("/api/grade-short-answer", async (req, res) => {
  try {
    const { question, sampleCorrectAnswer, studentAnswer } = req.body;
    console.log("[grade] question:", question?.slice(0, 60));
    const ai = getAiClient();

    const prompt = `Grade the student's answer to the following question.
Question: "${question}"
Expected / Sample Answer context: "${sampleCorrectAnswer}"
Student's Typed Answer: "${studentAnswer}"

Evaluate their understanding on a scale of 0 to 10.
Provide helpful, encouraging, and specific pedagogical feedback.
Output only valid JSON matching the schema.`;

    console.log("[grade] calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score:       { type: Type.INTEGER, description: "0–10" },
            feedback:    { type: Type.STRING },
            strengths:   { type: Type.STRING },
            suggestions: { type: Type.STRING },
          },
          required: ["score", "feedback", "strengths", "suggestions"],
        },
      },
    });

    console.log("[grade] Gemini responded OK");
    const parsedGrade = JSON.parse(response.text ?? "{}");
    res.json(parsedGrade);

  } catch (error: any) {
    console.error("[grade] ERROR name    :", error?.name);
    console.error("[grade] ERROR message :", error?.message);
    console.error("[grade] ERROR status  :", error?.status ?? error?.statusCode);
    console.error("[grade] ERROR details :", JSON.stringify(error?.errorDetails ?? error?.details ?? null));
    console.error("[grade] STACK         :", error?.stack);
    res.status(500).json({ error: error.message || "Could not grade response." });
  }
});

// ── Vite / static serving ──────────────────────────────────────
async function setupViteServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[server] DEV mode — attaching Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[server] PROD mode — serving /dist");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] Running at http://localhost:${PORT}`);
    console.log(`[server] GEMINI_API_KEY set: ${!!process.env.GEMINI_API_KEY}`);
  });
}

setupViteServer().catch(err => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});