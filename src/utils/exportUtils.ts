// ── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = Array.isArray(value) ? value.join("; ") : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function objectsToCsv(items: Record<string, unknown>[]): string {
  if (!items.length) return "";
  const headers = Object.keys(items[0]);
  const rows = items.map((item) =>
    headers.map((h) => {
      const val = item[h];
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return escapeCsvCell(JSON.stringify(val));
      }
      return escapeCsvCell(val);
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

// ── Download helpers ──────────────────────────────────────────────────────────

function downloadBlob(content: string, filename: string, mime: string) {
  const bom = mime.includes("csv") ? "\uFEFF" : "";
  const blob = new Blob([bom + content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export ────────────────────────────────────────────────────────────────────

export function exportJson(data: unknown, filename: string) {
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
}

export function exportCsv(items: Record<string, unknown>[], filename: string) {
  downloadBlob(objectsToCsv(items), filename, "text/csv");
}

export interface ExportEntity {
  key: string;
  label: string;
  data: Record<string, unknown>[];
}

export function exportAllJson(entities: ExportEntity[], filename: string) {
  const bundle: Record<string, unknown[]> = {};
  entities.forEach((e) => { bundle[e.key] = e.data; });
  bundle["_meta"] = [{ exported_at: new Date().toISOString(), version: "1.0" }];
  downloadBlob(JSON.stringify(bundle, null, 2), filename, "application/json");
}

// ── Import ────────────────────────────────────────────────────────────────────

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

export function parseJsonBundle(text: string): Record<string, unknown[]> | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
