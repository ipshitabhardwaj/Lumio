import { useRef, useState, useEffect } from "react";
import { Eraser, Trash2, Pencil, Sparkles } from "lucide-react";

interface ScribblePadProps {
  onAnalyze: (base64: string) => void;
  isLoading: boolean;
}

const COLORS = [
  { hex: "#f0ead8", label: "Cream"   },
  { hex: "#6272ea", label: "Indigo"  },
  { hex: "#4ade8a", label: "Emerald" },
  { hex: "#f06a6a", label: "Rose"    },
  { hex: "#d4a853", label: "Amber"   },
];

export default function ScribblePad({ onAnalyze, isLoading }: ScribblePadProps) {
  const canvasRef   = useRef<HTMLCanvasElement | null>(null);
  const contextRef  = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool]       = useState<"pen" | "eraser">("pen");
  const [color, setColor]     = useState(COLORS[0].hex);
  const [lineW, setLineW]     = useState(3);
  const [hasStrokes, setHasStrokes] = useState(false);

  /* initialise canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width  = parent?.clientWidth  ?? 480;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#14161e"; // dark bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap  = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineW;
    contextRef.current = ctx;
  }, []);

  /* sync tool/color/width */
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.strokeStyle = tool === "eraser" ? "#14161e" : color;
    ctx.lineWidth   = tool === "eraser" ? 22 : lineW;
  }, [tool, color, lineW]);

  const coords = (e: any) => {
    const r = canvasRef.current!.getBoundingClientRect();
    if (e.touches?.length) {
      return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    }
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const startDraw = (e: any) => {
    e.preventDefault();
    const { x, y } = coords(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e: any) => {
    if (!drawing || !contextRef.current) return;
    e.preventDefault();
    const { x, y } = coords(e);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    setHasStrokes(true);
  };

  const stopDraw = () => {
    contextRef.current?.closePath();
    setDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx    = contextRef.current;
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#14161e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const analyze = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onAnalyze(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Pen / Eraser */}
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-dim)" }}
        >
          <button
            title="Pen"
            onClick={() => setTool("pen")}
            style={{
              padding: "6px 9px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              background: tool === "pen" ? "var(--bg-raised)" : "transparent",
              color: tool === "pen" ? "var(--accent)" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            title="Eraser"
            onClick={() => setTool("eraser")}
            style={{
              padding: "6px 9px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              background: tool === "eraser" ? "var(--bg-raised)" : "transparent",
              color: tool === "eraser" ? "var(--text-primary)" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            <Eraser size={14} />
          </button>
        </div>

        {/* Color dots (only when pen active) */}
        {tool === "pen" && (
          <div className="flex gap-2 items-center">
            {COLORS.map(c => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => setColor(c.hex)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: c.hex,
                  border: color === c.hex
                    ? "2px solid var(--text-primary)"
                    : "2px solid transparent",
                  outline: color === c.hex ? "2px solid rgba(255,255,255,0.2)" : "none",
                  outlineOffset: 2,
                  cursor: "pointer",
                  transition: "transform 0.12s",
                  transform: color === c.hex ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        )}

        {/* Line width (only when pen active) */}
        {tool === "pen" && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Size</span>
            <input
              type="range"
              min={1}
              max={10}
              value={lineW}
              onChange={e => setLineW(Number(e.target.value))}
              style={{ width: 64, accentColor: "var(--accent)" }}
            />
          </div>
        )}

        {/* Clear */}
        <button
          title="Clear canvas"
          onClick={clear}
          className="btn-ghost"
          style={{ padding: "6px 10px", marginLeft: tool === "pen" ? 0 : "auto" }}
        >
          <Trash2 size={13} style={{ color: "var(--rose)" }} />
        </button>
      </div>

      {/* Canvas */}
      <div className="canvas-wrapper" style={{ lineHeight: 0 }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="block w-full touch-none"
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair", height: 220 }}
        />
        {/* hint overlay when empty */}
        {!hasStrokes && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-xs text-center leading-relaxed">
              Draw your equation or diagram here
            </p>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        className="btn-primary w-full"
        style={{ padding: "11px 16px" }}
        onClick={analyze}
        disabled={isLoading || !hasStrokes}
      >
        <Sparkles size={15} />
        {isLoading ? "Analysing…" : "Analyse drawing"}
      </button>
    </div>
  );
}