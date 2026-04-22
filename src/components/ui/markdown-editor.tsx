import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 3 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const minHeight = `${rows * 1.75 + 1}rem`;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
      {/* Tabs */}
      <div className="flex items-center gap-0" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={() => setTab("edit")}
          className="px-3 py-1.5 text-xs transition-all"
          style={{
            color: tab === "edit" ? "#22d3ee" : "rgba(180,200,230,0.4)",
            borderBottom: tab === "edit" ? "1px solid #22d3ee" : "1px solid transparent",
            background: "transparent",
          }}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className="px-3 py-1.5 text-xs transition-all"
          style={{
            color: tab === "preview" ? "#22d3ee" : "rgba(180,200,230,0.4)",
            borderBottom: tab === "preview" ? "1px solid #22d3ee" : "1px solid transparent",
            background: "transparent",
          }}
        >
          Предпросмотр
        </button>
        <span className="ml-auto pr-2 text-[9px]" style={{ color: "rgba(180,200,230,0.2)" }}>Markdown</span>
      </div>

      {/* Edit */}
      {tab === "edit" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm outline-none resize-y"
          style={{
            background: "rgba(15,22,41,0.8)",
            color: "white",
            minHeight,
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.8rem",
          }}
        />
      )}

      {/* Preview */}
      {tab === "preview" && (
        <div
          className="px-3 py-2 text-sm prose prose-invert max-w-none overflow-auto"
          style={{ background: "rgba(15,22,41,0.8)", color: "rgba(210,225,245,0.9)", minHeight }}
        >
          {value?.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <span style={{ color: "rgba(180,200,230,0.25)", fontStyle: "italic" }}>Нет содержимого для предпросмотра</span>
          )}
        </div>
      )}
    </div>
  );
}
