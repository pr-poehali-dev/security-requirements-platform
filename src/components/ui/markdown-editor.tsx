import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className="flex items-center" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={() => setTab("edit")}
          className="px-3 py-1.5 text-xs transition-all"
          style={{
            color: tab === "edit" ? "#22d3ee" : "rgba(180,200,230,0.4)",
            borderBottom: tab === "edit" ? "2px solid #22d3ee" : "2px solid transparent",
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
            borderBottom: tab === "preview" ? "2px solid #22d3ee" : "2px solid transparent",
            background: "transparent",
          }}
        >
          Предпросмотр
        </button>
        <span className="ml-auto pr-2 text-[9px]" style={{ color: "rgba(180,200,230,0.2)" }}>Markdown</span>
      </div>

      {tab === "edit" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 outline-none resize-y"
          style={{
            background: "rgba(15,22,41,0.8)",
            color: "white",
            minHeight,
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.8rem",
            border: "none",
          }}
        />
      )}

      {tab === "preview" && (
        <div
          className="px-4 py-3 overflow-auto"
          style={{ background: "rgba(15,22,41,0.8)", minHeight }}
        >
          {value?.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <div className="text-base font-bold mb-2 mt-1 pb-1" style={{ color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{children}</div>
                ),
                h2: ({ children }) => (
                  <div className="text-sm font-semibold mb-1.5 mt-3 first:mt-0" style={{ color: "#cbd5e1" }}>{children}</div>
                ),
                h3: ({ children }) => (
                  <div className="text-sm font-medium mb-1 mt-2" style={{ color: "#94a3b8" }}>{children}</div>
                ),
                p: ({ children }) => (
                  <p className="text-sm mb-2 last:mb-0 leading-relaxed" style={{ color: "rgba(210,225,245,0.85)" }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 pl-4 space-y-0.5" style={{ color: "rgba(210,225,245,0.85)", listStyleType: "disc" }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 pl-4 space-y-0.5" style={{ color: "rgba(210,225,245,0.85)", listStyleType: "decimal" }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed">{children}</li>
                ),
                code: ({ className, children, ...props }) => {
                  const isBlock = Boolean(className?.includes("language-"));
                  return isBlock ? (
                    <pre className="my-2 rounded px-3 py-2 text-xs overflow-x-auto" style={{ background: "rgba(0,0,0,0.35)", color: "#86efac", fontFamily: "ui-monospace, monospace" }}>
                      <code>{children}</code>
                    </pre>
                  ) : (
                    <code className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(99,176,255,0.12)", color: "#63b0ff", fontFamily: "ui-monospace, monospace" }} {...props}>{children}</code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 pl-3 my-2 italic text-sm" style={{ borderColor: "#22d3ee", color: "rgba(180,200,230,0.65)" }}>{children}</blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold" style={{ color: "#e2e8f0" }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={{ color: "rgba(210,225,245,0.75)" }}>{children}</em>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#63b0ff", textDecoration: "underline" }}>{children}</a>
                ),
                hr: () => (
                  <hr className="my-3" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full text-xs border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-2 py-1 text-left text-xs font-medium" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0" }}>{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-2 py-1 text-xs" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(210,225,245,0.8)" }}>{children}</td>
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <span className="text-xs italic" style={{ color: "rgba(180,200,230,0.25)" }}>Нет содержимого для предпросмотра</span>
          )}
        </div>
      )}
    </div>
  );
}
