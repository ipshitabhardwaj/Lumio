import { useState } from "react";
import { Flashcard, MCQ, ShortAnswer, GradingResponse } from "../types";
import {
  ArrowLeft, ArrowRight, HelpCircle, RefreshCw, CheckCircle, XCircle,
  Award, Loader2, Sparkles, BookOpen, AlertCircle, Bookmark, CheckSquare,
  RotateCcw
} from "lucide-react";
import {
  playFlipSound, playSuccessSound, playErrorSound, playTransitionSound
} from "../utils/audio";

/* ════════════════════════════════════════════════════════
   1. FLASHCARD DECK
════════════════════════════════════════════════════════ */
interface FlashcardDeckProps { flashcards: Flashcard[]; }

export function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped]       = useState(false);

  if (!flashcards?.length) return null;

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const go = (dir: "prev" | "next") => {
    playTransitionSound();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(p => dir === "next" ? p + 1 : p - 1);
    }, 160);
  };

  const flip = () => {
    playFlipSound();
    setIsFlipped(f => !f);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          <Bookmark size={11} />
          Flashcard deck
        </span>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 3,
          background: "var(--bg-raised)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--accent), var(--indigo))",
            borderRadius: 3,
            transition: "width 0.35s ease",
          }}
        />
      </div>

      {/* 3-D Card */}
      <div
        onClick={flip}
        className="perspective-1000 cursor-pointer select-none"
        style={{ width: "100%", height: 230 }}
      >
        <div
          className={`preserve-3d relative w-full h-full transition-transform duration-500 ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT */}
          <div
            className="backface-hidden absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--indigo)" }}
              >
                Question
              </span>
              <HelpCircle size={14} style={{ color: "var(--text-muted)" }} />
            </div>

            <p
              className="font-display text-center text-base font-medium leading-relaxed my-auto"
              style={{ color: "var(--text-primary)" }}
            >
              {card.question}
            </p>

            <div
              className="flex items-center justify-center gap-1.5 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              <RotateCcw size={11} />
              Tap to reveal answer
            </div>
          </div>

          {/* BACK */}
          <div
            className="backface-hidden rotate-y-180 absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid rgba(212,168,83,0.25)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--accent)" }}
              >
                Answer
              </span>
              <BookOpen size={14} style={{ color: "var(--accent)" }} />
            </div>

            <div
              className="overflow-y-auto my-auto max-h-[130px]"
              style={{ scrollbarWidth: "thin" }}
            >
              <p
                className="text-center text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.answer}
              </p>
            </div>

            <div
              className="flex items-center justify-center gap-1.5 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              <RotateCcw size={11} />
              Tap to see question
            </div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3">
        <button
          className="btn-ghost flex-1"
          onClick={() => go("prev")}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={13} />
          Previous
        </button>
        <button
          className="btn-primary flex-1"
          onClick={() => go("next")}
          disabled={currentIndex === flashcards.length - 1}
          style={{ padding: "9px 16px" }}
        >
          Next
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   2. MCQ QUIZ
════════════════════════════════════════════════════════ */
interface McqQuizProps { mcqs: MCQ[]; }

export function McqQuiz({ mcqs }: McqQuizProps) {
  const [selected, setSelected] = useState<(number | null)[]>(
    () => new Array(mcqs.length).fill(null)
  );

  const pick = (mIdx: number, oIdx: number) => {
    if (selected[mIdx] !== null) return;
    const next = [...selected];
    next[mIdx] = oIdx;
    setSelected(next);
    oIdx === mcqs[mIdx].correctOptionIndex ? playSuccessSound() : playErrorSound();
  };

  const reset = () => {
    setSelected(new Array(mcqs.length).fill(null));
    playTransitionSound();
  };

  const answered = selected.filter(v => v !== null).length;
  const correct  = selected.reduce(
    (acc, v, i) => acc + (v === mcqs[i].correctOptionIndex ? 1 : 0), 0
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Score pill */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-dim)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {mcqs.length} questions
        </span>
        <span
          className="font-mono text-xs font-semibold"
          style={{ color: answered ? "var(--accent)" : "var(--text-muted)" }}
        >
          {correct} / {answered} correct
        </span>
      </div>

      {mcqs.map((mcq, mIdx) => {
        const choice     = selected[mIdx];
        const isAnswered = choice !== null;

        return (
          <div
            key={mIdx}
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
          >
            {/* Question */}
            <div className="p-4 flex gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                style={{
                  background: "var(--indigo-dim)",
                  color: "var(--indigo)",
                  border: "1px solid rgba(98,114,234,0.3)",
                }}
              >
                {mIdx + 1}
              </span>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {mcq.question}
              </p>
            </div>

            {/* Options */}
            <div className="px-4 pb-4 flex flex-col gap-2">
              {mcq.options.map((opt, oIdx) => {
                const isCorrect  = mcq.correctOptionIndex === oIdx;
                const isSelected = choice === oIdx;
                let cls = "mcq-option";
                if (isAnswered) {
                  if (isCorrect) cls += " correct";
                  else if (isSelected) cls += " wrong";
                  else cls += " dim";
                }

                return (
                  <button
                    key={oIdx}
                    className={cls}
                    disabled={isAnswered}
                    onClick={() => pick(mIdx, oIdx)}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle size={14} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle size={14} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div
                className="mx-4 mb-4 p-3 rounded-xl text-[12px] leading-relaxed animate-fade-in"
                style={{
                  background: "var(--bg-panel)",
                  borderLeft: "3px solid var(--indigo)",
                  color: "var(--text-secondary)",
                }}
              >
                <span className="font-semibold block mb-1" style={{ color: "var(--indigo)" }}>
                  Explanation
                </span>
                {mcq.explanation}
              </div>
            )}
          </div>
        );
      })}

      {answered > 0 && (
        <button className="btn-ghost w-full" onClick={reset}>
          <RefreshCw size={13} />
          Reset & try again
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3. SHORT ANSWER EVALUATOR
════════════════════════════════════════════════════════ */
interface ShortAnswerEvaluatorProps { shortAnswers: ShortAnswer[]; }

interface GradingState {
  score: number | null;
  feedback: string;
  strengths: string;
  suggestions: string;
  loading: boolean;
}

export function ShortAnswerEvaluator({ shortAnswers }: ShortAnswerEvaluatorProps) {
  const [answers, setAnswers]   = useState<string[]>(() => shortAnswers.map(() => ""));
  const [gradings, setGradings] = useState<GradingState[]>(() =>
    shortAnswers.map(() => ({ score: null, feedback: "", strengths: "", suggestions: "", loading: false }))
  );

  const change = (i: number, val: string) => {
    setAnswers(a => { const n = [...a]; n[i] = val; return n; });
  };

  const evaluate = async (idx: number) => {
    const ans = answers[idx].trim();
    if (!ans) return;

    setGradings(g => {
      const n = [...g]; n[idx] = { ...n[idx], loading: true }; return n;
    });
    playTransitionSound();

    try {
      const res = await fetch("/api/grade-short-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:            shortAnswers[idx].question,
          sampleCorrectAnswer: shortAnswers[idx].sampleCorrectAnswer,
          studentAnswer:       ans,
        }),
      });
      if (!res.ok) throw new Error();
      const data: GradingResponse = await res.json();
      setGradings(g => {
        const n = [...g];
        n[idx] = { score: data.score, feedback: data.feedback, strengths: data.strengths, suggestions: data.suggestions, loading: false };
        return n;
      });
      data.score >= 8 ? playSuccessSound() : playFlipSound();
    } catch {
      setGradings(g => {
        const n = [...g];
        n[idx] = {
          score: 5,
          feedback: "Could not grade automatically. Compare your answer with the sample below.",
          strengths: "Self-review available below.",
          suggestions: `Sample answer: "${shortAnswers[idx].sampleCorrectAnswer}"`,
          loading: false,
        };
        return n;
      });
      playErrorSound();
    }
  };

  const retry = (idx: number) => {
    setGradings(g => {
      const n = [...g];
      n[idx] = { score: null, feedback: "", strengths: "", suggestions: "", loading: false };
      return n;
    });
    setAnswers(a => { const n = [...a]; n[idx] = ""; return n; });
    playTransitionSound();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl p-3 text-[12px] leading-relaxed"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-dim)",
          color: "var(--text-muted)",
        }}
      >
        Write your answer below. The AI tutor will analyze your key ideas and give structured feedback.
      </div>

      {shortAnswers.map((item, idx) => {
        const grade = gradings[idx];
        const isGraded = grade.score !== null;

        const scoreColor =
          grade.score === null ? "var(--text-muted)"
          : grade.score >= 8   ? "var(--emerald)"
          : grade.score >= 5   ? "var(--accent)"
          : "var(--indigo)";

        return (
          <div
            key={idx}
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
          >
            {/* Question */}
            <div className="p-4 flex gap-2.5">
              <span
                className="text-xs font-semibold shrink-0 mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Q{idx + 1}
              </span>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {item.question}
              </p>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-3">
              <textarea
                className="field"
                rows={3}
                value={answers[idx]}
                onChange={e => change(idx, e.target.value)}
                disabled={grade.loading || isGraded}
                placeholder="Formulate your response here…"
              />

              {!isGraded ? (
                <button
                  className="btn-primary w-full"
                  disabled={!answers[idx].trim() || grade.loading}
                  onClick={() => evaluate(idx)}
                  style={{ padding: "9px 16px" }}
                >
                  {grade.loading ? (
                    <><Loader2 size={14} className="animate-spin" /> Reviewing…</>
                  ) : (
                    <><Sparkles size={14} /> Submit for AI grading</>
                  )}
                </button>
              ) : (
                <div className="flex flex-col gap-3 animate-fade-in">
                  {/* Score badge */}
                  <div
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-dim)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{
                        background: "var(--bg-raised)",
                        border: `1.5px solid ${scoreColor}`,
                      }}
                    >
                      <span className="text-[9px] font-semibold" style={{ color: scoreColor }}>
                        Grade
                      </span>
                      <span
                        className="font-display text-lg font-bold leading-none"
                        style={{ color: scoreColor }}
                      >
                        {grade.score}
                      </span>
                      <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>/10</span>
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-widest block mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Feedback
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {grade.feedback}
                      </p>
                    </div>
                  </div>

                  {/* Strengths + suggestions */}
                  <div
                    className="grid grid-cols-2 gap-3 rounded-xl p-3"
                    style={{
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-dim)",
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-semibold mb-1"
                        style={{ color: "var(--emerald)" }}
                      >
                        Strengths
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {grade.strengths}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] font-semibold mb-1"
                        style={{ color: "var(--indigo)" }}
                      >
                        To improve
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {grade.suggestions}
                      </p>
                    </div>
                  </div>

                  {/* Sample answer collapsible */}
                  <details>
                    <summary
                      className="cursor-pointer text-[11px] font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      View model answer
                    </summary>
                    <div
                      className="mt-2 p-3 rounded-xl text-[12px] leading-relaxed"
                      style={{
                        background: "var(--bg-panel)",
                        borderLeft: "3px solid var(--border-med)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                        Sample answer
                      </p>
                      <p className="italic mb-2">"{item.sampleCorrectAnswer}"</p>
                      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                        Marking context
                      </p>
                      <p>{item.explanation}</p>
                    </div>
                  </details>

                  <button
                    className="btn-ghost w-full"
                    style={{ fontSize: 11 }}
                    onClick={() => retry(idx)}
                  >
                    <RefreshCw size={12} />
                    Retry question
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   4. TIPS CHECKLIST
════════════════════════════════════════════════════════ */
interface TipsChecklistProps { tips: string[]; mistakes: string[]; }

export function TipsChecklist({ tips, mistakes }: TipsChecklistProps) {
  const [done, setDone] = useState<boolean[]>(() => tips.map(() => false));

  const toggle = (i: number) => {
    setDone(d => {
      const n = [...d]; n[i] = !n[i];
      n[i] ? playSuccessSound() : playFlipSound();
      return n;
    });
  };

  const allDone = done.every(Boolean);

  return (
    <div className="flex flex-col gap-6">

      {/* Mistakes */}
      {mistakes?.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-dim)",
            borderLeft: "3px solid var(--rose)",
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 mb-3"
            style={{ color: "var(--rose)" }}
          >
            <AlertCircle size={12} />
            Common myths & mistakes
          </p>
          <ul className="flex flex-col gap-2">
            {mistakes.map((m, i) => (
              <li key={i} className="flex gap-2 text-[12px] leading-relaxed">
                <span style={{ color: "var(--rose)", flexShrink: 0 }}>×</span>
                <span style={{ color: "var(--text-secondary)" }}>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips checklist */}
      {tips?.length > 0 && (
        <div className="flex flex-col gap-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <CheckSquare size={12} />
            Personalised study checklist
          </p>

          {tips.map((tip, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer select-none transition-all animate-fade-up stagger-${Math.min(i + 1, 5)}`}
              style={{
                background: done[i] ? "var(--bg-panel)" : "var(--bg-surface)",
                border: `1px solid ${done[i] ? "var(--border-dim)" : "var(--border-soft)"}`,
                opacity: done[i] ? 0.55 : 1,
              }}
            >
              {/* Custom checkbox */}
              <div
                className="tip-checkbox mt-0.5"
                style={done[i] ? { background: "var(--accent)", borderColor: "var(--accent)" } : {}}
              >
                {done[i] && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="#0e0f14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p
                className="text-[12px] leading-snug"
                style={{
                  color: done[i] ? "var(--text-muted)" : "var(--text-secondary)",
                  textDecoration: done[i] ? "line-through" : "none",
                }}
              >
                {tip}
              </p>
            </div>
          ))}

          {allDone && (
            <div
              className="rounded-xl p-4 flex items-center gap-2.5 animate-fade-up"
              style={{
                background: "var(--emerald-dim)",
                border: "1px solid rgba(74,222,138,0.25)",
              }}
            >
              <Sparkles size={15} style={{ color: "var(--emerald)", flexShrink: 0 }} />
              <p className="text-[12px] font-semibold" style={{ color: "var(--emerald)" }}>
                All tasks complete — great study session!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}