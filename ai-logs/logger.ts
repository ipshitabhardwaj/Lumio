// ─── ai-logs/logger.ts ───────────────────────────────────────────
// Drop this in your project's src/utils/ folder.
// Import logAIInteraction() from anywhere and every solve call
// will be appended to ai-logs/session-<date>.jsonl

import fs from "fs";
import path from "path";

export interface AILogEntry {
  timestamp:    string;
  sessionId:    string;
  prompt:       string;
  hasImage:     boolean;
  model:        string;
  inputTokens:  number;
  outputTokens: number;
  latencyMs:    number;
  subject:      string;
  difficulty:   string;
  topic:        string;
  stepCount:    number;
  flashcardCount: number;
  quizCount:    number;
  error?:       string;
}

const LOG_DIR = path.resolve(process.cwd(), "ai-logs");

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function todayFileName(): string {
  const d = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `session-${d}.jsonl`);
}

/** Append one structured log line (JSON-lines format). */
export function logAIInteraction(entry: AILogEntry): void {
  try {
    ensureLogDir();
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(todayFileName(), line, "utf-8");
  } catch (err) {
    // Never let logging crash the server
    console.error("[ai-logs] Failed to write log:", err);
  }
}

/** Read all entries from today's log file. */
export function readTodayLogs(): AILogEntry[] {
  try {
    const raw = fs.readFileSync(todayFileName(), "utf-8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line) as AILogEntry);
  } catch {
    return [];
  }
}

/** Read all entries from a specific date (YYYY-MM-DD). */
export function readLogsForDate(date: string): AILogEntry[] {
  try {
    const file = path.join(LOG_DIR, `session-${date}.jsonl`);
    const raw  = fs.readFileSync(file, "utf-8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line) as AILogEntry);
  } catch {
    return [];
  }
}