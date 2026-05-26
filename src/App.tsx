import { useState, useEffect, ChangeEvent } from "react";
import {
  Sparkles, BookOpen, RefreshCw,
  Volume2, VolumeX, Atom,
  Calculator, GraduationCap, Flame, CheckCircle2,
  ChevronRight, ChevronDown, Award, ArrowLeft,
  AlertCircle, Pencil, Layers, FlaskConical, Zap,
  X, Upload, Moon, Star
} from "lucide-react";
import { SolutionResponse } from "./types";
import ScribblePad from "./components/ScribblePad";
import {
  FlashcardDeck, McqQuiz, ShortAnswerEvaluator, TipsChecklist
} from "./components/InteractiveStudyTools";
import { playTransitionSound, playSuccessSound } from "./utils/audio";
import {
  generateGeometrySketch, generateChemicalFormula, generatePhysicsSketch
} from "./utils/canvasPreloads";

export default function App() {
  const [activeTab, setActiveTab]       = useState<"text" | "draw" | "sketches">("text");
  const [inputText, setInputText]       = useState("");
  const [imageFile, setImageFile]       = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [loadingStep, setLoadingStep]   = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [result, setResult]             = useState<SolutionResponse | null>(null);
  const [resultsSection, setResultsSection] =
    useState<"sol" | "learn" | "cards" | "quiz" | "tips">("sol");
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true });

  const loadingPhrases = [
    "Reading between the lines…",
    "Connecting the concepts…",
    "Building your solution…",
    "Finding the perfect analogy…",
    "Crafting your flashcards…",
    "Writing quiz questions…",
    "Almost ready for you…",
  ];

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (isLoading) {
      iv = setInterval(() =>
        setLoadingStep(p => (p + 1) % loadingPhrases.length), 2600
      );
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(iv);
  }, [isLoading]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
      playTransitionSound();
    };
    reader.readAsDataURL(file);
  };

  const handleLoadPreload = (type: "geometry" | "chemistry" | "physics") => {
    const map = {
      geometry: {
        img: generateGeometrySketch(),
        txt: "Analyze the right triangle diagram. Find angle x step-by-step."
      },
      chemistry: {
        img: generateChemicalFormula(),
        txt: "Calculate IUPAC name, molecular weight, functional group, and explain step-by-step."
      },
      physics: {
        img: generatePhysicsSketch(),
        txt: "Determine horizontal range d from the initial launch velocity and cliff height."
      },
    };
    setImageFile(map[type].img);
    setInputText(map[type].txt);
    playTransitionSound();
  };

  const handleSolve = async (promptOverride?: string, imgOverride?: string) => {
    const prompt = promptOverride ?? inputText;
    const image  = imgOverride  ?? imageFile;
    if (!prompt.trim() && !image) return;

    setIsLoading(true);
    setResult(null);
    playTransitionSound();

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image }),
      });
      if (!res.ok) throw new Error("Backend error.");
      const data: SolutionResponse = await res.json();
      setResult(data);
      setResultsSection("sol");
      setExpandedSteps({ 1: true });
      playSuccessSound();
    } catch (err: any) {
      alert(err.message || "Failed. Check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = (val: string) => {
    setInputText(val);
    setImageFile(null);
    handleSolve(val, undefined);
  };

  const toggleStep = (n: number) => {
    setExpandedSteps(p => ({ ...p, [n]: !p[n] }));
    playTransitionSound();
  };

  const handleStartOver = () => {
    setResult(null);
    setInputText("");
    setImageFile(null);
    playTransitionSound();
  };

  return (
    <div
      className="app-shell"
      style={{ minHeight: "100vh" }}
    >
      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside className="sidebar">

        {/* ── Brand ── */}
        <div style={{ padding: "22px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
            <div className="brand-icon">
              <GraduationCap size={16} style={{ color: "var(--accent)", position: "relative", zIndex: 1 }} />
            </div>
            <div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
              }}>
                Lumio
              </p>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8.5,
                letterSpacing: "0.12em",
                color: "var(--text-hint)",
                textTransform: "uppercase",
              }}>
                STUDY COMPANION
              </p>
            </div>
          </div>

          {/* Gold rule */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--border-accent), transparent)" }} />
            <Star size={7} style={{ color: "var(--accent)", opacity: 0.6 }} />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg, var(--border-accent), transparent)" }} />
          </div>
        </div>

        {/* ── How it works ── */}
        <div style={{ padding: "0 20px 16px" }}>
          <p className="sidebar-section-label" style={{ marginBottom: 10 }}>How it works</p>
          <ol style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none" }}>
            {[
              "Ask any question or upload a photo.",
              "Browse STEM sketches for instant demos.",
              "Draw equations on the whiteboard.",
              "Explore solutions, flashcards & quizzes.",
            ].map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: 1,
                  background: "var(--accent-dim)",
                  border: "1px solid var(--border-accent)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="divider" />

        {/* ── Quick starts ── */}
        <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="sidebar-section-label" style={{ marginBottom: 2 }}>Quick starts</p>
          {[
            {
              label: "Quadratic Formula",
              sub: "Algebra · STEM",
              val: "Solve x² − 5x + 6 = 0 step-by-step and write the vertex form.",
            },
            {
              label: "Photosynthesis",
              sub: "Biology · Science",
              val: "Explain cellular photosynthesis reaction, outlining key steps simply.",
            },
            {
              label: "Ideal Gas Law",
              sub: "Chemistry · STEM",
              val: "Gas at 2.0 L, 300 K, 1.5 atm. Find new volume at 400 K and 2.0 atm.",
            },
          ].map((s, i) => (
            <button
              key={i}
              className="prompt-card"
              disabled={isLoading}
              onClick={() => handleSampleClick(s.val)}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", paddingRight: 16 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, marginTop: 2, color: "var(--text-muted)" }}>
                {s.sub}
              </p>
            </button>
          ))}
        </div>

        <div className="divider" />

        {/* ── Footer ── */}
        <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setSoundEnabled(v => !v)}
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", fontSize: 11 }}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={12} style={{ color: "var(--emerald)" }} />
                <span style={{ color: "var(--text-secondary)" }}>Sound feedback on</span>
              </>
            ) : (
              <>
                <VolumeX size={12} />
                <span>Sound feedback off</span>
              </>
            )}
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, paddingTop: 4 }}>
            <Moon size={8} style={{ color: "var(--text-hint)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-hint)", letterSpacing: "0.08em" }}>
              LUMIO v1.0
            </span>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="main-content">

        {/* ─── LOADING ─── */}
        {isLoading && (
          <div className="animate-fade-in" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 36,
            padding: 48,
            position: "relative",
            overflow: "hidden",
          }}>
            <div className="hero-glow-1" />
            <div className="hero-glow-2" />

            <div style={{ position: "relative" }}>
              <div className="animate-pulse-glow animate-float" style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                background: "var(--bg-raised)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <GraduationCap size={30} style={{ color: "var(--accent)" }} />
              </div>
              <div className="animate-spin-slow" style={{
                position: "absolute",
                top: -5,
                right: -5,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--indigo-dim)",
                border: "1px solid rgba(124,142,240,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Sparkles size={10} style={{ color: "var(--indigo)" }} />
              </div>
            </div>

            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}>
                Thinking deeply…
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Your tutor is preparing a thoughtful response
              </p>
            </div>

            <div style={{ width: 240, position: "relative", zIndex: 1 }}>
              <div className="loading-bar-track">
                <div className="loading-bar-fill" />
              </div>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textAlign: "center",
                marginTop: 12,
                color: "var(--text-secondary)",
                transition: "all 0.3s",
              }}>
                {loadingPhrases[loadingStep]}
              </p>
            </div>
          </div>
        )}

        {/* ─── INPUT / LANDING ─── */}
        {!isLoading && !result && (
          <div
            className="animate-fade-up"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxWidth: 680,
              width: "100%",
              margin: "0 auto",
              padding: "40px 36px 48px",
              gap: 32,
              position: "relative",
            }}
          >
            <div className="hero-glow-1" style={{ opacity: 0.65 }} />
            <div className="hero-glow-2" style={{ opacity: 0.55 }} />

            {/* Header */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span className="badge badge-accent">
                  <Flame size={8} />
                  Active Session
                </span>
                <span className="ornament">✦ ✦ ✦</span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.12,
                marginBottom: 12,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}>
                What are you<br />
                <span style={{ color: "var(--accent)" }}>learning today?</span>
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.65 }}>
                Ask a question, draw an equation, or pick a STEM sketch to get started.
              </p>
            </div>

            {/* Tab selector */}
            <div className="nav-pills" style={{ position: "relative", zIndex: 1 }}>
              {[
                { id: "text",     label: "Type a question", icon: <Pencil size={10} /> },
                { id: "draw",     label: "Draw / Scribble", icon: <Layers size={10} /> },
                { id: "sketches", label: "STEM sketches",   icon: <FlaskConical size={10} /> },
              ].map(t => (
                <button
                  key={t.id}
                  className={`nav-pill ${activeTab === t.id ? "active-accent" : ""}`}
                  onClick={() => { setActiveTab(t.id as any); playTransitionSound(); }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {t.icon}
                    {t.label}
                  </span>
                </button>
              ))}
            </div>

            {/* TAB: TEXT */}
            {activeTab === "text" && (
              <div
                className="animate-fade-up"
                style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1 }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="sidebar-section-label" style={{ paddingLeft: 2 }}>
                    Your question
                  </label>
                  <textarea
                    className="field"
                    rows={5}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="e.g. Solve x² − 5x + 6 = 0, or explain how mitosis works…"
                  />
                </div>

                {/* Image upload */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="sidebar-section-label" style={{ paddingLeft: 2 }}>
                    Attach a photo{" "}
                    <span style={{ color: "var(--text-hint)", fontWeight: 400, textTransform: "none", fontSize: 10.5, letterSpacing: 0 }}>
                      (optional)
                    </span>
                  </label>

                  {!imageFile ? (
                    <label className="upload-zone">
                      <Upload size={17} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Click to upload image or homework photo
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 13px",
                      borderRadius: "var(--r-md)",
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-soft)",
                    }}>
                      <img src={imageFile} alt="attached" style={{
                        width: 42,
                        height: 42,
                        borderRadius: 7,
                        objectFit: "cover",
                        border: "1px solid var(--border-soft)",
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                          Photo attached
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                          Ready for multimodal analysis
                        </p>
                      </div>
                      <button onClick={() => setImageFile(null)} className="btn-ghost" style={{ padding: "5px 7px" }}>
                        <X size={11} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="btn-primary"
                  style={{ width: "100%", padding: "13px 20px", fontSize: 13 }}
                  disabled={isLoading || (!inputText.trim() && !imageFile)}
                  onClick={() => handleSolve()}
                >
                  <Sparkles size={14} />
                  Solve with Lumio
                </button>
              </div>
            )}

            {/* TAB: DRAW */}
            {activeTab === "draw" && (
              <div className="animate-fade-up" style={{ position: "relative", zIndex: 1 }}>
                <ScribblePad
                  onAnalyze={base64 => {
                    setImageFile(base64);
                    handleSolve(
                      "Analyze and explain the mathematical/scientific diagram or equation sketched in this image step-by-step.",
                      base64
                    );
                  }}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* TAB: SKETCHES */}
            {activeTab === "sketches" && (
              <div
                className="animate-fade-up"
                style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}
              >
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65 }}>
                  Select a pre-drawn diagnostic sketch — it will be sent directly to the vision engine.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    {
                      type: "geometry" as const,
                      label: "Geometry Sketch",
                      sub: "Solve angle x in a right triangle",
                      icon: <Calculator size={16} style={{ color: "#f472b6" }} />,
                      iconBg: "rgba(244,114,182,0.10)",
                    },
                    {
                      type: "chemistry" as const,
                      label: "Chemical Structure",
                      sub: "Skeletal formula IUPAC analysis",
                      icon: <FlaskConical size={16} style={{ color: "var(--emerald)" }} />,
                      iconBg: "var(--emerald-dim)",
                    },
                    {
                      type: "physics" as const,
                      label: "Physics Projectile",
                      sub: "Trajectory launch coordinates",
                      icon: <Zap size={16} style={{ color: "var(--accent)" }} />,
                      iconBg: "var(--accent-dim)",
                    },
                  ].map((s, i) => (
                    <button
                      key={i}
                      className={`sketch-card animate-fade-up stagger-${i + 1}`}
                      onClick={() => handleLoadPreload(s.type)}
                    >
                      <div className="sketch-card-icon" style={{ background: s.iconBg }}>
                        {s.icon}
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {s.label}
                        </p>
                        <p style={{ fontSize: 10.5, marginTop: 2, color: "var(--text-muted)" }}>
                          {s.sub}
                        </p>
                      </div>
                      <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── RESULT SCREEN ─── */}
        {!isLoading && result && (
          <div className="animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Result header bar */}
            <div
              className="result-header-bg"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                padding: "12px 32px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderBottom: "1px solid var(--border-dim)",
              }}
            >
              <button className="btn-ghost" style={{ padding: "6px 10px" }} onClick={handleStartOver}>
                <ArrowLeft size={11} />
                Back
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className={`badge ${
                  result.difficulty === "Easy" ? "badge-emerald"
                  : result.difficulty === "Medium" ? "badge-accent"
                  : "badge-rose"
                }`}>
                  {result.difficulty}
                </span>
                <span className="badge badge-indigo">{result.subject}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="truncate" style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}>
                  {result.topic}
                </p>
              </div>
            </div>

            {/* Problem summary */}
            <div style={{ padding: "18px 32px", borderBottom: "1px solid var(--border-dim)" }}>
              <p className="sidebar-section-label" style={{ marginBottom: 8 }}>Problem summary</p>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: 15,
                fontStyle: "italic",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}>
                "{result.problemSummary}"
              </p>
            </div>

            {/* Section nav */}
            <div style={{
              position: "sticky",
              top: 57,
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-dim)",
              padding: "10px 32px",
              zIndex: 10,
              overflowX: "auto",
            }}>
              <div className="nav-pills" style={{ minWidth: "max-content" }}>
                {[
                  { id: "sol",   label: "Solution" },
                  { id: "learn", label: "Analogy" },
                  { id: "cards", label: "Flashcards" },
                  { id: "quiz",  label: "Quiz" },
                  { id: "tips",  label: "Study Plan" },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`nav-pill ${resultsSection === t.id ? "active" : ""}`}
                    onClick={() => { setResultsSection(t.id as any); playTransitionSound(); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section content */}
            <div style={{
              flex: 1,
              padding: "28px 32px",
              maxWidth: 680,
              width: "100%",
              margin: "0 auto",
            }}>

              {/* SOL */}
              {resultsSection === "sol" && (
                <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <h3 style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--text-hint)",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "var(--font-mono)",
                  }}>
                    <BookOpen size={11} style={{ color: "var(--accent)" }} />
                    Step-by-step solution
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.steps.map((step, idx) => {
                      const open = !!expandedSteps[step.number];
                      return (
                        <div
                          key={step.number}
                          className={`animate-fade-up stagger-${Math.min(idx + 1, 5)}`}
                          style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "var(--bg-surface)",
                            border: `1px solid ${open ? "var(--border-soft)" : "var(--border-dim)"}`,
                            transition: "border-color 0.2s",
                          }}
                        >
                          <button className="step-header" onClick={() => toggleStep(step.number)}>
                            <span className="step-number">{step.number}</span>
                            <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                              {step.title}
                            </span>
                            {open
                              ? <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
                              : <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />
                            }
                          </button>
                          {open && (
                            <div className="step-content-prose animate-fade-in">
                              {step.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="final-answer-box" style={{ marginTop: 6 }}>
                    <p style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.10em",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 10,
                      fontFamily: "var(--font-mono)",
                    }}>
                      <CheckCircle2 size={11} />
                      Final answer
                    </p>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 16,
                      fontWeight: 600,
                      lineHeight: 1.6,
                      color: "var(--text-primary)",
                    }}>
                      {result.finalAnswer}
                    </p>
                  </div>
                </div>
              )}

              {/* LEARN */}
              {resultsSection === "learn" && (
                <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <p className="sidebar-section-label" style={{ marginBottom: 10 }}>
                      Tutor analogy — explained for a 12-year-old
                    </p>
                    <div className="analogy-bubble">"{result.simpleExplanation}"</div>
                  </div>

                  <div>
                    <p style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.10em",
                      color: "var(--rose)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 10,
                      fontFamily: "var(--font-mono)",
                    }}>
                      <AlertCircle size={11} />
                      Common mistakes to avoid
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.commonMistakes.map((m, i) => {
                        const [title, ...rest] = m.split(":");
                        return (
                          <div key={i} className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`} style={{
                            padding: "13px 15px",
                            borderRadius: 10,
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-dim)",
                            borderLeft: "2px solid var(--rose)",
                          }}>
                            <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--rose)" }}>
                              {m.includes(":") ? title : `Trap #${i + 1}`}
                            </p>
                            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--text-secondary)" }}>
                              {m.includes(":") ? rest.join(":") : m}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CARDS */}
              {resultsSection === "cards" && (
                <div className="animate-fade-up">
                  <FlashcardDeck flashcards={result.flashcards} />
                </div>
              )}

              {/* QUIZ */}
              {resultsSection === "quiz" && (
                <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <div>
                    <p style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.10em",
                      color: "var(--text-hint)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 14,
                      fontFamily: "var(--font-mono)",
                    }}>
                      <Award size={11} style={{ color: "var(--accent)" }} />
                      Multiple-choice
                    </p>
                    <McqQuiz mcqs={result.quiz.mcqs} />
                  </div>
                  <div className="divider" />
                  <div>
                    <p style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.10em",
                      color: "var(--emerald)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 14,
                      fontFamily: "var(--font-mono)",
                    }}>
                      <Award size={11} />
                      Short answer
                    </p>
                    <ShortAnswerEvaluator shortAnswers={result.quiz.shortAnswers} />
                  </div>
                </div>
              )}

              {/* TIPS */}
              {resultsSection === "tips" && (
                <div className="animate-fade-up">
                  <TipsChecklist tips={result.studyTips} mistakes={result.commonMistakes} />
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div style={{
              position: "sticky",
              bottom: 0,
              padding: "12px 32px",
              borderTop: "1px solid var(--border-dim)",
              background: "var(--bg-surface)",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <button className="btn-ghost" onClick={handleStartOver}>
                <RefreshCw size={11} />
                Solve another problem
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}