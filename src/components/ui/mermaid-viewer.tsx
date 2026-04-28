import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let idCounter = 0;
let mermaidInitialized = false;

const THEMES: Record<string, { theme: string; themeVariables?: Record<string, string>; bg: string }> = {
  dark: {
    theme: "dark",
    themeVariables: {
      background: "#0a1120",
      primaryColor: "#1e3a5f",
      primaryTextColor: "#e2e8f0",
      primaryBorderColor: "#34d399",
      lineColor: "#63b0ff",
      secondaryColor: "#1a2d4a",
      tertiaryColor: "#162035",
      edgeLabelBackground: "#0a1120",
      clusterBkg: "#111c30",
      titleColor: "#e2e8f0",
      fontFamily: "ui-monospace, monospace",
    },
    bg: "rgba(10,17,32,0.6)",
  },
  default: {
    theme: "default",
    bg: "#ffffff",
  },
  forest: {
    theme: "forest",
    bg: "#f4f9f4",
  },
  neutral: {
    theme: "neutral",
    bg: "#f5f5f5",
  },
  base: {
    theme: "base",
    bg: "#faf9f8",
  },
};

interface MermaidViewerProps {
  content: string;
  className?: string;
  theme?: string;
}

export default function MermaidViewer({ content, className, theme = "dark" }: MermaidViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>("");
  const renderIdRef = useRef<string>("");

  useEffect(() => {
    if (!content?.trim()) return;
    setError(null);
    setSvg("");

    const cfg = THEMES[theme] || THEMES.dark;

    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: cfg.theme as Parameters<typeof mermaid.initialize>[0]["theme"],
        themeVariables: cfg.themeVariables,
        securityLevel: "loose",
      });
      mermaidInitialized = true;
    }

    // Чистим старый артефакт из DOM если он остался
    if (renderIdRef.current) {
      const old = document.getElementById(renderIdRef.current);
      if (old) old.remove();
    }

    const renderId = `mermaid-${++idCounter}`;
    renderIdRef.current = renderId;

    let cancelled = false;

    mermaid.render(renderId, content.trim()).then(({ svg: renderedSvg }) => {
      if (!cancelled) setSvg(renderedSvg);
    }).catch((err) => {
      if (!cancelled) setError(err?.message || "Ошибка рендеринга диаграммы");
      // Чистим артефакт после ошибки
      const el = document.getElementById(renderId);
      if (el) el.remove();
    });

    return () => {
      cancelled = true;
      // Чистим артефакт при размонтировании
      const el = document.getElementById(renderId);
      if (el) el.remove();
    };
  }, [content, theme]);

  if (error) {
    return (
      <div className={`rounded-xl p-4 ${className}`} style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <p className="text-xs font-mono" style={{ color: "#ef4444" }}>Ошибка: {error}</p>
        <pre className="mt-2 text-xs font-mono whitespace-pre-wrap" style={{ color: "rgba(180,200,230,0.5)" }}>{content}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`rounded-xl flex items-center justify-center py-10 ${className}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(167,139,250,0.4)", borderTopColor: "transparent" }} />
          <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>Рендеринг диаграммы...</span>
        </div>
      </div>
    );
  }

  const bgColor = (THEMES[theme] || THEMES.dark).bg;

  return (
    <div
      className={`mermaid-output rounded-xl overflow-auto ${className}`}
      style={{ background: bgColor, border: "1px solid rgba(255,255,255,0.06)", padding: "16px" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
