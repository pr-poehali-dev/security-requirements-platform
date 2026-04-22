import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewProps {
  children: string;
  className?: string;
  color?: string;
}

export default function MarkdownView({ children, className = "", color = "rgba(210,225,245,0.8)" }: MarkdownViewProps) {
  if (!children?.trim()) return null;

  return (
    <div className={className} style={{ color }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: c }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0" style={{ color: "#e2e8f0" }}>{c}</h1>,
          h2: ({ children: c }) => <h2 className="text-sm font-semibold mb-1.5 mt-2.5 first:mt-0" style={{ color: "#e2e8f0" }}>{c}</h2>,
          h3: ({ children: c }) => <h3 className="text-sm font-medium mb-1 mt-2 first:mt-0" style={{ color: "#cbd5e1" }}>{c}</h3>,
          p: ({ children: c }) => <p className="text-sm mb-2 leading-relaxed last:mb-0" style={{ color }}>{c}</p>,
          ul: ({ children: c }) => <ul className="mb-2 pl-4 list-disc space-y-0.5" style={{ color }}>{c}</ul>,
          ol: ({ children: c }) => <ol className="mb-2 pl-4 list-decimal space-y-0.5" style={{ color }}>{c}</ol>,
          li: ({ children: c }) => <li className="text-sm">{c}</li>,
          code({ className: cls, children: c, ...props }) {
            const isBlock = Boolean(cls?.includes("language-"));
            return isBlock ? (
              <code className="block px-3 py-2 rounded text-xs font-mono my-2 whitespace-pre-wrap" style={{ background: "rgba(0,0,0,0.35)", color: "#86efac" }} {...props}>{c}</code>
            ) : (
              <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(99,176,255,0.1)", color: "#63b0ff" }} {...props}>{c}</code>
            );
          },
          pre: ({ children: c }) => <pre className="my-2 rounded overflow-x-auto" style={{ background: "rgba(0,0,0,0.3)" }}>{c}</pre>,
          blockquote: ({ children: c }) => <blockquote className="border-l-2 pl-3 my-2 italic" style={{ borderColor: "#22d3ee", color: "rgba(180,200,230,0.65)" }}>{c}</blockquote>,
          strong: ({ children: c }) => <strong className="font-semibold" style={{ color: "#e2e8f0" }}>{c}</strong>,
          em: ({ children: c }) => <em style={{ color: "rgba(210,225,245,0.7)" }}>{c}</em>,
          a: ({ href, children: c }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#63b0ff", textDecoration: "underline" }}>{c}</a>,
          hr: () => <hr className="my-3" style={{ borderColor: "rgba(255,255,255,0.08)" }} />,
          table: ({ children: c }) => <div className="overflow-x-auto my-2"><table className="w-full text-xs border-collapse">{c}</table></div>,
          th: ({ children: c }) => <th className="px-2 py-1 text-left font-medium" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0" }}>{c}</th>,
          td: ({ children: c }) => <td className="px-2 py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color }}>{c}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
