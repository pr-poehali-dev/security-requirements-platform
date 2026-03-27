import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Section = "library" | "analytics" | "domains";
type DbMode = "cloud" | "local";
type DomainStatus = "Активен" | "Не активен" | "В разработке" | "Архив";

interface OrgDomain {
  id: string;
  name: string;
  version: string;
  owner: string;
  status: DomainStatus;
  description: string;
  tags: string[];
  createdAt: string;
  updated_at?: string;
  created_at?: string;
}

const DOMAIN_STATUS_META: Record<DomainStatus, { color: string; bg: string; icon: string }> = {
  "Активен":       { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":    { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке":  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":         { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
};

const DOMAIN_STATUSES: DomainStatus[] = ["Активен", "Не активен", "В разработке", "Архив"];

const initialDomains: OrgDomain[] = [
  {
    id: "org.dom.001",
    name: "Управление идентификацией",
    version: "1.2.0",
    owner: "Отдел ИБ",
    status: "Активен",
    description: "Домен охватывает процессы управления учётными записями, ролями и привилегиями пользователей в информационных системах организации.",
    createdAt: "2024-03-15",
  },
  {
    id: "org.dom.002",
    name: "Сетевая безопасность",
    version: "2.0.1",
    owner: "Сетевой отдел",
    status: "Активен",
    description: "Домен включает требования к сегментации сети, межсетевым экранам, VPN и мониторингу сетевого трафика.",
    createdAt: "2024-01-10",
  },
  {
    id: "org.dom.003",
    name: "Управление инцидентами",
    version: "1.0.0",
    owner: "SOC",
    status: "В разработке",
    description: "Процессы обнаружения, регистрации, расследования и устранения инцидентов информационной безопасности.",
    createdAt: "2024-06-01",
  },
  {
    id: "org.dom.004",
    name: "Криптографическая защита",
    version: "1.1.3",
    owner: "Отдел ИБ",
    status: "Активен",
    description: "Требования к применению криптографических алгоритмов, управлению ключами и PKI-инфраструктуре.",
    createdAt: "2023-11-20",
  },
  {
    id: "org.dom.005",
    name: "Физическая безопасность",
    version: "0.9.0",
    owner: "АХО",
    status: "Архив",
    description: "Устаревший домен требований к физической защите серверных помещений. Заменён стандартом ISO 27001 A.11.",
    createdAt: "2022-05-05",
  },
];

interface DbConfig {
  host: string;
  port: string;
  name: string;
  user: string;
  password: string;
}

interface Requirement {
  id: string;
  code: string;
  title: string;
  category: string;
  level: "Критический" | "Высокий" | "Средний" | "Низкий";
  standard: string;
  description: string;
}

interface AnalyticItem {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
}

const requirements: Requirement[] = [
  {
    id: "1",
    code: "ИБ-001",
    title: "Управление доступом и идентификация",
    category: "Аутентификация",
    level: "Критический",
    standard: "ГОСТ Р 57580",
    description: "Требования к многофакторной аутентификации для привилегированных пользователей и критических систем.",
  },
  {
    id: "2",
    code: "ИБ-002",
    title: "Шифрование данных при хранении",
    category: "Криптография",
    level: "Высокий",
    standard: "ГОСТ Р 34.12",
    description: "Применение алгоритмов шифрования ГОСТ при хранении персональных данных и конфиденциальной информации.",
  },
  {
    id: "3",
    code: "ИБ-003",
    title: "Мониторинг и журналирование событий",
    category: "Мониторинг",
    level: "Высокий",
    standard: "PCI DSS 4.0",
    description: "Ведение журналов аудита всех событий безопасности с централизованным хранением не менее 12 месяцев.",
  },
  {
    id: "4",
    code: "ИБ-004",
    title: "Сегментация сети",
    category: "Сетевая безопасность",
    level: "Высокий",
    standard: "ISO 27001",
    description: "Разделение информационных систем на сетевые сегменты с контролем межсегментного трафика.",
  },
  {
    id: "5",
    code: "ИБ-005",
    title: "Управление уязвимостями",
    category: "Патч-менеджмент",
    level: "Средний",
    standard: "NIST CSF",
    description: "Регулярное сканирование на уязвимости и устранение критических уязвимостей в течение 30 дней.",
  },
  {
    id: "6",
    code: "ИБ-006",
    title: "Резервное копирование данных",
    category: "Непрерывность",
    level: "Средний",
    standard: "ГОСТ Р 57580",
    description: "Создание резервных копий критически важных данных с проверкой возможности восстановления.",
  },
];

const analytics: AnalyticItem[] = [
  { label: "Всего требований", value: "247", delta: "+12 за месяц", positive: true, icon: "FileCheck" },
  { label: "Выполнено", value: "183", delta: "74.1%", positive: true, icon: "CheckCircle2" },
  { label: "В работе", value: "41", delta: "-3 за неделю", positive: true, icon: "Clock" },
  { label: "Критических нарушений", value: "8", delta: "+2 за неделю", positive: false, icon: "AlertTriangle" },
];

const categoryColors: Record<string, string> = {
  "Аутентификация": "rgba(0, 102, 255, 0.15)",
  "Криптография": "rgba(0, 212, 255, 0.12)",
  "Мониторинг": "rgba(124, 58, 237, 0.15)",
  "Сетевая безопасность": "rgba(16, 185, 129, 0.12)",
  "Патч-менеджмент": "rgba(245, 158, 11, 0.12)",
  "Непрерывность": "rgba(239, 68, 68, 0.12)",
};

const levelColors: Record<string, string> = {
  "Критический": "#ef4444",
  "Высокий": "#f97316",
  "Средний": "#eab308",
  "Низкий": "#22c55e",
};

const complianceData = [
  { name: "ГОСТ Р 57580", progress: 78, color: "#0066ff" },
  { name: "ISO 27001", progress: 91, color: "#00d4ff" },
  { name: "PCI DSS 4.0", progress: 65, color: "#7c3aed" },
  { name: "NIST CSF", progress: 55, color: "#10b981" },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("library");
  const [dbDialogOpen, setDbDialogOpen] = useState(false);
  // cloud = сервисная БД (Локальная для платформы), local = внешняя PostgreSQL
  const [dbMode, setDbMode] = useState<DbMode>("cloud");
  const [dbExternalConnected, setDbExternalConnected] = useState(false);
  const [dbExternalVersion, setDbExternalVersion] = useState("");
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: "localhost",
    port: "5432",
    name: "securearch",
    user: "postgres",
    password: "",
  });
  const [pendingMode, setPendingMode] = useState<DbMode>("cloud");
  const [skipCheck, setSkipCheck] = useState(false);
  const [checkState, setCheckState] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [checkError, setCheckError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("Все");
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  // Domains state
  const DOMAINS_API = "https://functions.poehali.dev/4c8bda83-18c3-4fd9-bc7f-0764a3511177";
  const [domains, setDomains] = useState<OrgDomain[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [sectionDesc, setSectionDesc] = useState("Реестр организационных доменов безопасности — создание, редактирование и управление статусами");
  const [sectionDescEditing, setSectionDescEditing] = useState(false);
  const [sectionDescDraft, setSectionDescDraft] = useState(sectionDesc);
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [domainSaving, setDomainSaving] = useState(false);
  const [deleteDomainId, setDeleteDomainId] = useState<string | null>(null);
  const [editingDomain, setEditingDomain] = useState<OrgDomain | null>(null);
  const [viewDomain, setViewDomain] = useState<OrgDomain | null>(null);
  const [domainSearch, setDomainSearch] = useState("");

  const makeEmptyForm = (count: number): OrgDomain => ({
    id: `org.dom.${String(count + 1).padStart(3, "0")}`,
    name: "",
    version: "1.0.0",
    owner: "",
    status: "В разработке",
    description: "",
    tags: [],
    createdAt: new Date().toISOString().split("T")[0],
  });
  const [domainForm, setDomainForm] = useState<OrgDomain>(makeEmptyForm(0));
  const [tagInput, setTagInput] = useState("");
  const [nameError, setNameError] = useState("");

  const validateName = (val: string) => {
    if (!val.trim()) return "Название обязательно";
    if (val.trim().length < 3) return "Минимум 3 символа";
    if (val.trim().length > 100) return "Максимум 100 символов";
    return "";
  };

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || domainForm.tags.includes(tag) || domainForm.tags.length >= 10) return;
    setDomainForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setDomainForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const loadDomains = async () => {
    setDomainsLoading(true);
    try {
      const res = await fetch(DOMAINS_API);
      const data = await res.json();
      const normalized = (data.domains || []).map((d: OrgDomain & { created_at?: string }) => ({
        ...d,
        createdAt: d.createdAt || d.created_at || new Date().toISOString(),
      }));
      setDomains(normalized);
      if (data.section_description) setSectionDesc(data.section_description);
    } finally {
      setDomainsLoading(false);
    }
  };

  const openCreateDomain = () => {
    setEditingDomain(null);
    setDomainForm(makeEmptyForm(domains.length));
    setTagInput("");
    setNameError("");
    setDomainDialogOpen(true);
  };

  const openEditDomain = (d: OrgDomain) => {
    setEditingDomain(d);
    setDomainForm({ ...d, tags: d.tags || [] });
    setTagInput("");
    setNameError("");
    setDomainDialogOpen(true);
  };

  const handleSaveDomain = async () => {
    if (!domainForm.name.trim() || !domainForm.id.trim()) return;
    setDomainSaving(true);
    try {
      const method = editingDomain ? "PUT" : "POST";
      const res = await fetch(DOMAINS_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(domainForm),
      });
      const saved = await res.json();
      if (editingDomain) {
        setDomains((prev) => prev.map((d) => (d.id === editingDomain.id ? { ...domainForm, ...saved } : d)));
      } else {
        setDomains((prev) => [...prev, { ...domainForm, ...saved }]);
      }
      setDomainDialogOpen(false);
    } finally {
      setDomainSaving(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    await fetch(DOMAINS_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDomains((prev) => prev.filter((d) => d.id !== id));
    setDeleteDomainId(null);
  };

  const handleSaveSectionDesc = async () => {
    setSectionDesc(sectionDescDraft);
    setSectionDescEditing(false);
    await fetch(`${DOMAINS_API}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: sectionDescDraft }),
    });
  };

  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(domainSearch.toLowerCase()) ||
    d.id.toLowerCase().includes(domainSearch.toLowerCase()) ||
    d.owner.toLowerCase().includes(domainSearch.toLowerCase())
  );

  const isConnected = dbMode === "cloud" || (dbMode === "local" && dbExternalConnected);

  const filteredRequirements = requirements.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = selectedLevel === "Все" || r.level === selectedLevel;
    return matchSearch && matchLevel;
  });

  const handleOpenDialog = () => {
    setPendingMode(dbMode);
    setCheckState("idle");
    setCheckError("");
    setSkipCheck(false);
    setDbDialogOpen(true);
  };

  const handleCheckConnection = async () => {
    setCheckState("checking");
    setCheckError("");
    try {
      const res = await fetch("https://functions.poehali.dev/5622928b-26f7-4ee8-b41f-03e43463dcc9", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbConfig),
      });
      const data = await res.json();
      if (data.connected) {
        setCheckState("ok");
        setDbExternalVersion(data.version || "");
      } else {
        setCheckState("error");
        setCheckError(data.error || "Не удалось подключиться");
      }
    } catch {
      setCheckState("error");
      setCheckError("Ошибка сети — функция недоступна");
    }
  };

  const handleDbSave = () => {
    if (pendingMode === "local" && !skipCheck && checkState !== "ok") return;
    setDbMode(pendingMode);
    if (pendingMode === "cloud") {
      setDbExternalConnected(false);
      setDbExternalVersion("");
    } else {
      setDbExternalConnected(true);
    }
    setDbDialogOpen(false);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "#07101f" }}>
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, rgba(0,102,255,0.4) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse, rgba(0,212,255,0.5) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,102,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,102,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 glass-card border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0066ff, #00d4ff)" }}
            >
              <Icon name="Shield" size={18} className="text-white" />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white text-lg tracking-tight">
                SecureArch
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-2 py-0.5 border-amber-500/40 text-amber-400 bg-amber-500/10"
              >
                MVP
              </Badge>
            </div>
          </div>

          <nav className="flex items-center gap-8">
            <button
              className={`nav-link text-sm font-medium pb-1 ${activeSection === "library" ? "active" : ""}`}
              onClick={() => setActiveSection("library")}
            >
              Библиотека потребителя
            </button>
            <button
              className={`nav-link text-sm font-medium pb-1 ${activeSection === "domains" ? "active" : ""}`}
              onClick={() => setActiveSection("domains")}
            >
              Орг. домены
            </button>
            <button
              className={`nav-link text-sm font-medium pb-1 ${activeSection === "analytics" ? "active" : ""}`}
              onClick={() => setActiveSection("analytics")}
            >
              Аналитика
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenDialog}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-blue-500/40"
              style={{
                background: "rgba(15,22,41,0.8)",
                borderColor: isConnected ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
              }}
            >
              <div
                className="status-dot"
                style={{
                  backgroundColor: isConnected ? "#22c55e" : "#ef4444",
                  color: isConnected ? "#22c55e" : "#ef4444",
                }}
              />
              <span
                className="font-mono text-xs"
                style={{ color: isConnected ? "#22c55e" : "#ef4444" }}
              >
                {dbMode === "cloud"
                  ? "Сервисная БД"
                  : dbExternalConnected
                  ? `Внешняя: ${dbConfig.host}`
                  : "Нет подключения"}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: dbMode === "cloud" ? "rgba(0,212,255,0.12)" : "rgba(124,58,237,0.15)",
                  color: dbMode === "cloud" ? "#00d4ff" : "#a78bfa",
                }}
              >
                {dbMode === "cloud" ? "Локальная" : "Внешняя"}
              </span>
              <Icon name="Settings2" size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* === LIBRARY SECTION === */}
        {activeSection === "library" && (
          <div className="section-enter">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ background: "linear-gradient(180deg, #0066ff, #00d4ff)" }}
                />
                <h1 className="text-2xl font-semibold text-white">
                  Библиотека потребителя
                </h1>
              </div>
              <p className="text-sm ml-4" style={{ color: "rgba(180,200,230,0.6)" }}>
                Реестр требований информационной безопасности и нормативных документов
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-64 max-w-md">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(180,200,230,0.4)" }}
                />
                <input
                  type="text"
                  placeholder="Поиск по коду, названию, категории..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all font-sans"
                  style={{
                    background: "rgba(15,22,41,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(210,225,245,0.9)",
                  }}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(0,102,255,0.5)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Все", "Критический", "Высокий", "Средний", "Низкий"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: selectedLevel === level ? "rgba(0,102,255,0.2)" : "rgba(15,22,41,0.8)",
                      border: `1px solid ${selectedLevel === level ? "rgba(0,102,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                      color: selectedLevel === level ? "#63b0ff" : "rgba(180,200,230,0.6)",
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ml-auto">
                <Icon name="Plus" size={15} />
                Добавить
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Всего требований", value: requirements.length, icon: "BookOpen", color: "#0066ff" },
                { label: "Критических", value: requirements.filter((r) => r.level === "Критический").length, icon: "AlertOctagon", color: "#ef4444" },
                { label: "Высокий приоритет", value: requirements.filter((r) => r.level === "Высокий").length, icon: "AlertTriangle", color: "#f97316" },
                { label: "Стандартов", value: new Set(requirements.map((r) => r.standard)).size, icon: "Award", color: "#00d4ff" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}
                  >
                    <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(180,200,230,0.5)" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div
                className="grid text-xs font-medium px-5 py-3 border-b"
                style={{
                  gridTemplateColumns: "90px 1fr 180px 120px 140px",
                  color: "rgba(180,200,230,0.4)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <span>Код</span>
                <span>Название</span>
                <span>Категория</span>
                <span>Уровень</span>
                <span>Стандарт</span>
              </div>
              <div>
                {filteredRequirements.map((req, i) => (
                  <div
                    key={req.id}
                    className="grid items-start px-5 py-4 cursor-pointer transition-all"
                    style={{
                      gridTemplateColumns: "90px 1fr 180px 120px 140px",
                      borderBottom:
                        i < filteredRequirements.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                      background:
                        selectedReq?.id === req.id
                          ? "rgba(0,102,255,0.07)"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedReq?.id !== req.id) {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.03)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedReq?.id !== req.id) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                    onClick={() =>
                      setSelectedReq(selectedReq?.id === req.id ? null : req)
                    }
                  >
                    <span
                      className="font-mono text-xs font-medium pt-0.5"
                      style={{ color: "#63b0ff" }}
                    >
                      {req.code}
                    </span>
                    <div>
                      <div className="text-sm text-white font-medium">{req.title}</div>
                      {selectedReq?.id === req.id && (
                        <div
                          className="text-xs mt-2 leading-relaxed"
                          style={{ color: "rgba(180,200,230,0.6)" }}
                        >
                          {req.description}
                        </div>
                      )}
                    </div>
                    <div className="pt-0.5">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background:
                            categoryColors[req.category] || "rgba(255,255,255,0.08)",
                          color: "rgba(210,225,245,0.85)",
                        }}
                      >
                        {req.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: levelColors[req.level] }}
                      />
                      <span className="text-xs" style={{ color: levelColors[req.level] }}>
                        {req.level}
                      </span>
                    </div>
                    <span
                      className="font-mono text-xs pt-1"
                      style={{ color: "rgba(180,200,230,0.5)" }}
                    >
                      {req.standard}
                    </span>
                  </div>
                ))}
                {filteredRequirements.length === 0 && (
                  <div
                    className="py-16 text-center"
                    style={{ color: "rgba(180,200,230,0.3)" }}
                  >
                    <Icon
                      name="SearchX"
                      size={32}
                      className="mx-auto mb-3 opacity-40"
                    />
                    <p className="text-sm">Требования не найдены</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === DOMAINS SECTION === */}
        {activeSection === "domains" && (() => {
          if (domains.length === 0 && !domainsLoading) loadDomains();
          return (
          <div className="section-enter">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #10b981, #0066ff)" }} />
                <h1 className="text-2xl font-semibold text-white">Организационные домены</h1>
              </div>
              {/* Editable section description */}
              <div className="ml-4 mt-1 group flex items-start gap-2">
                {sectionDescEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      value={sectionDescDraft}
                      onChange={(e) => setSectionDescDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveSectionDesc(); if (e.key === "Escape") setSectionDescEditing(false); }}
                      className="flex-1 text-sm px-3 py-1.5 rounded-lg outline-none font-sans"
                      style={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(0,102,255,0.4)", color: "rgba(210,225,245,0.9)" }}
                    />
                    <button onClick={handleSaveSectionDesc} className="p-1.5 rounded-lg" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                      <Icon name="Check" size={14} />
                    </button>
                    <button onClick={() => setSectionDescEditing(false)} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(180,200,230,0.4)" }}>
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{sectionDesc}</p>
                    <button
                      onClick={() => { setSectionDescDraft(sectionDesc); setSectionDescEditing(true); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0"
                      title="Редактировать описание"
                    >
                      <Icon name="Pencil" size={12} style={{ color: "rgba(180,200,230,0.35)" }} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.4)" }} />
                <input
                  type="text"
                  placeholder="Поиск по ID, названию, владельцу..."
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all font-sans"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(210,225,245,0.9)" }}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(0,102,255,0.5)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              {/* Stats badges */}
              <div className="flex items-center gap-2 ml-auto">
                {DOMAIN_STATUSES.map((s) => {
                  const meta = DOMAIN_STATUS_META[s];
                  const cnt = domains.filter((d) => d.status === s).length;
                  return (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: meta.bg, color: meta.color }}>
                      {s}: {cnt}
                    </span>
                  );
                })}
              </div>
              <button onClick={openCreateDomain} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium">
                <Icon name="Plus" size={15} />
                Создать домен
              </button>
            </div>

            {/* Domain cards grid */}
            {domainsLoading ? (
              <div className="glass-card rounded-xl py-20 text-center" style={{ color: "rgba(180,200,230,0.3)" }}>
                <Icon name="Loader" size={28} className="mx-auto mb-3 animate-spin opacity-50" />
                <p className="text-sm">Загрузка доменов...</p>
              </div>
            ) : filteredDomains.length === 0 ? (
              <div className="glass-card rounded-xl py-20 text-center" style={{ color: "rgba(180,200,230,0.3)" }}>
                <Icon name="SearchX" size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Домены не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredDomains.map((domain) => {
                  const meta = DOMAIN_STATUS_META[domain.status];
                  return (
                    <div
                      key={domain.id}
                      className="glass-card rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all"
                      style={{ borderColor: viewDomain?.id === domain.id ? "rgba(0,102,255,0.4)" : undefined }}
                      onClick={() => setViewDomain(domain)}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(15,22,41,0.85)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,102,255,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.borderColor = viewDomain?.id === domain.id ? "rgba(0,102,255,0.4)" : ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      {/* Card top */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(0,102,255,0.15)", color: "#63b0ff" }}>
                              {domain.id}
                            </span>
                            <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>
                              v{domain.version}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-white leading-snug">{domain.name}</h3>
                        </div>
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium" style={{ background: meta.bg, color: meta.color }}>
                          <Icon name={meta.icon} size={11} />
                          {domain.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(180,200,230,0.55)" }}>
                        {domain.description || "Описание не указано"}
                      </p>

                      {/* Tags */}
                      {domain.tags && domain.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {domain.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium font-mono"
                              style={{ background: "rgba(0,212,255,0.08)", color: "rgba(0,212,255,0.7)", border: "1px solid rgba(0,212,255,0.15)" }}>
                              #{tag}
                            </span>
                          ))}
                          {domain.tags.length > 4 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "rgba(180,200,230,0.35)" }}>
                              +{domain.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center gap-1.5">
                          <Icon name="User" size={12} style={{ color: "rgba(180,200,230,0.35)" }} />
                          <span className="text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>{domain.owner}</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setViewDomain(domain)}
                            className="p-1.5 rounded-lg transition-all hover:bg-blue-500/10"
                            title="Подробнее"
                          >
                            <Icon name="Expand" size={13} style={{ color: "rgba(0,212,255,0.6)" }} />
                          </button>
                          <button
                            onClick={() => openEditDomain(domain)}
                            className="p-1.5 rounded-lg transition-all hover:bg-blue-500/10"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={13} style={{ color: "rgba(99,176,255,0.6)" }} />
                          </button>
                          <button
                            onClick={() => setDeleteDomainId(domain.id)}
                            className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                            title="Удалить"
                          >
                            <Icon name="Trash2" size={13} style={{ color: "rgba(239,68,68,0.5)" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })()}

        {/* === ANALYTICS SECTION === */}
        {activeSection === "analytics" && (
          <div className="section-enter">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ background: "linear-gradient(180deg, #7c3aed, #00d4ff)" }}
                />
                <h1 className="text-2xl font-semibold text-white">Аналитика</h1>
              </div>
              <p className="text-sm ml-4" style={{ color: "rgba(180,200,230,0.6)" }}>
                Дашборд соответствия требованиям и состояния безопасности
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {analytics.map((item) => (
                <div key={item.label} className="glass-card glass-card-hover rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: item.positive
                          ? "rgba(0,102,255,0.15)"
                          : "rgba(239,68,68,0.15)",
                        border: `1px solid ${item.positive ? "rgba(0,102,255,0.25)" : "rgba(239,68,68,0.25)"}`,
                      }}
                    >
                      <Icon
                        name={item.icon}
                        size={18}
                        style={{ color: item.positive ? "#63b0ff" : "#ef4444" }}
                      />
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: item.positive
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,68,68,0.12)",
                        color: item.positive ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {item.delta}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                  <div className="text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="col-span-3 glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-white">
                    Соответствие стандартам
                  </h3>
                  <span
                    className="text-xs font-mono"
                    style={{ color: "rgba(180,200,230,0.4)" }}
                  >
                    Обновлено: сегодня
                  </span>
                </div>
                <div className="space-y-5">
                  {complianceData.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "rgba(210,225,245,0.85)" }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="font-mono text-sm font-semibold"
                          style={{ color: item.color }}
                        >
                          {item.progress}%
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${item.progress}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                            boxShadow: `0 0 8px ${item.color}60`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">
                  Распределение рисков
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Критические", count: 8, total: 247, color: "#ef4444" },
                    { label: "Высокие", count: 31, total: 247, color: "#f97316" },
                    { label: "Средние", count: 89, total: 247, color: "#eab308" },
                    { label: "Низкие", count: 119, total: 247, color: "#22c55e" },
                  ].map((risk) => (
                    <div key={risk.label} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: risk.color,
                          boxShadow: `0 0 6px ${risk.color}80`,
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className="text-xs"
                            style={{ color: "rgba(180,200,230,0.7)" }}
                          >
                            {risk.label}
                          </span>
                          <span
                            className="font-mono text-xs font-medium"
                            style={{ color: risk.color }}
                          >
                            {risk.count}
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(risk.count / risk.total) * 100}%`,
                              backgroundColor: risk.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-6 pt-5 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold gradient-text mb-1">74%</div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(180,200,230,0.4)" }}
                    >
                      Общий уровень соответствия
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-5">Последние события</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "CheckCircle2",
                    color: "#22c55e",
                    text: "Требование ИБ-003 выполнено",
                    sub: "Настроен SIEM, журналы за 13 месяцев",
                    time: "2 ч. назад",
                  },
                  {
                    icon: "AlertTriangle",
                    color: "#f97316",
                    text: "Выявлено нарушение ИБ-001",
                    sub: "Обнаружены учётные записи без MFA",
                    time: "5 ч. назад",
                  },
                  {
                    icon: "FileCheck",
                    color: "#0066ff",
                    text: "Добавлено новое требование ИБ-007",
                    sub: "Категория: Управление инцидентами",
                    time: "1 д. назад",
                  },
                  {
                    icon: "RefreshCw",
                    color: "#00d4ff",
                    text: "Обновлён статус по ГОСТ Р 57580",
                    sub: "Прогресс повышен до 78%",
                    time: "2 д. назад",
                  },
                ].map((event, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 py-3 px-4 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${event.color}18` }}
                    >
                      <Icon
                        name={event.icon}
                        size={14}
                        style={{ color: event.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium">{event.text}</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "rgba(180,200,230,0.5)" }}
                      >
                        {event.sub}
                      </div>
                    </div>
                    <span
                      className="text-xs flex-shrink-0 mt-0.5"
                      style={{ color: "rgba(180,200,230,0.3)" }}
                    >
                      {event.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Domain Detail Sheet */}
      <Sheet open={!!viewDomain} onOpenChange={(o) => { if (!o) setViewDomain(null); }}>
        <SheetContent
          side="right"
          className="w-[520px] sm:w-[520px] p-0 border-l overflow-y-auto"
          style={{ background: "#0a1120", borderColor: "rgba(255,255,255,0.07)" }}
        >
          {viewDomain && (() => {
            const meta = DOMAIN_STATUS_META[viewDomain.status];
            return (
              <>
                {/* Sheet header with gradient */}
                <div className="relative px-8 pt-8 pb-6" style={{ background: "linear-gradient(180deg, rgba(0,102,255,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Close hint */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,102,255,0.15)", color: "#63b0ff" }}>
                        {viewDomain.id}
                      </span>
                      <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>
                        v{viewDomain.version}
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}>
                      <Icon name={meta.icon} size={12} />
                      {viewDomain.status}
                    </span>
                  </div>
                  <SheetHeader>
                    <SheetTitle className="text-xl font-semibold text-white text-left leading-snug">
                      {viewDomain.name}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name="User" size={13} style={{ color: "rgba(180,200,230,0.35)" }} />
                      <span className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{viewDomain.owner || "—"}</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                    <div className="flex items-center gap-1.5">
                      <Icon name="Calendar" size={13} style={{ color: "rgba(180,200,230,0.35)" }} />
                      <span className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>
                        {new Date(viewDomain.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-6">

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Описание</p>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.8)" }}>
                      {viewDomain.description || "Описание не указано"}
                    </p>
                  </div>

                  {/* Tags */}
                  {viewDomain.tags && viewDomain.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Теги</p>
                      <div className="flex flex-wrap gap-2">
                        {viewDomain.tags.map((tag) => (
                          <span key={tag} className="text-xs px-3 py-1 rounded-full font-mono font-medium"
                            style={{ background: "rgba(0,212,255,0.08)", color: "rgba(0,212,255,0.8)", border: "1px solid rgba(0,212,255,0.2)" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attributes grid */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Атрибуты</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "ID домена", value: viewDomain.id, icon: "Hash", mono: true },
                        { label: "Версия", value: viewDomain.version, icon: "Tag", mono: true },
                        { label: "Владелец", value: viewDomain.owner || "—", icon: "User", mono: false },
                        { label: "Статус", value: viewDomain.status, icon: meta.icon, mono: false, color: meta.color },
                      ].map((attr) => (
                        <div key={attr.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon name={attr.icon} size={12} style={{ color: "rgba(180,200,230,0.3)" }} />
                            <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>{attr.label}</span>
                          </div>
                          <span
                            className={`text-sm font-medium ${attr.mono ? "font-mono" : ""}`}
                            style={{ color: attr.color || "rgba(210,225,245,0.9)" }}
                          >
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>История</p>
                    <div className="space-y-2">
                      {[
                        { label: "Создан", value: viewDomain.createdAt, icon: "PlusCircle" },
                        { label: "Обновлён", value: viewDomain.updated_at || viewDomain.createdAt, icon: "RefreshCw" },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex items-center gap-2">
                            <Icon name={t.icon} size={13} style={{ color: "rgba(180,200,230,0.3)" }} />
                            <span className="text-xs" style={{ color: "rgba(180,200,230,0.45)" }}>{t.label}</span>
                          </div>
                          <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.55)" }}>
                            {new Date(t.value).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-8 pb-8 pt-2 flex gap-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <button
                    onClick={() => { openEditDomain(viewDomain); setViewDomain(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(0,102,255,0.12)", border: "1px solid rgba(0,102,255,0.25)", color: "#63b0ff" }}
                  >
                    <Icon name="Pencil" size={14} />
                    Редактировать
                  </button>
                  <button
                    onClick={() => { setDeleteDomainId(viewDomain.id); setViewDomain(null); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Domain Create/Edit Dialog */}
      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent
          className="sm:max-w-lg"
          style={{ background: "#0d1528", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <Icon name={editingDomain ? "Pencil" : "Plus"} size={15} style={{ color: "#10b981" }} />
              </div>
              {editingDomain ? "Редактировать домен" : "Создать организационный домен"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* ID + Version row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID домена</Label>
                <Input
                  value={domainForm.id}
                  onChange={(e) => setDomainForm({ ...domainForm, id: e.target.value })}
                  placeholder="org.dom.001"
                  className="font-mono text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input
                  value={domainForm.version}
                  onChange={(e) => setDomainForm({ ...domainForm, version: e.target.value })}
                  placeholder="1.0.0"
                  className="font-mono text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название организационного домена</Label>
                {nameError && (
                  <span className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                    <Icon name="AlertCircle" size={11} />
                    {nameError}
                  </span>
                )}
              </div>
              <Input
                value={domainForm.name}
                onChange={(e) => {
                  setDomainForm({ ...domainForm, name: e.target.value });
                  setNameError(validateName(e.target.value));
                }}
                onBlur={(e) => setNameError(validateName(e.target.value))}
                placeholder="Введите название домена"
                className="text-sm"
                style={{
                  background: "rgba(15,22,41,0.8)",
                  border: `1px solid ${nameError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                  color: "white",
                }}
              />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Минимум 3 символа</span>
                <span className="text-xs font-mono" style={{ color: domainForm.name.length > 90 ? "#f59e0b" : "rgba(180,200,230,0.3)" }}>
                  {domainForm.name.length}/100
                </span>
              </div>
            </div>

            {/* Owner + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Владелец</Label>
                <Input
                  value={domainForm.owner}
                  onChange={(e) => setDomainForm({ ...domainForm, owner: e.target.value })}
                  placeholder="Отдел / ФИО"
                  className="text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <div className="relative">
                  <select
                    value={domainForm.status}
                    onChange={(e) => setDomainForm({ ...domainForm, status: e.target.value as DomainStatus })}
                    className="w-full px-3 py-2 rounded-lg text-sm appearance-none outline-none"
                    style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: DOMAIN_STATUS_META[domainForm.status].color }}
                  >
                    {DOMAIN_STATUSES.map((s) => (
                      <option key={s} value={s} style={{ background: "#0d1528", color: DOMAIN_STATUS_META[s].color }}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Icon name="ChevronDown" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(180,200,230,0.4)" }} />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги</Label>
                <span className="text-xs font-mono" style={{ color: "rgba(180,200,230,0.3)" }}>
                  {domainForm.tags.length}/10
                </span>
              </div>
              {/* Tag input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Icon name="Hash" size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,212,255,0.4)" }} />
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value.replace(/[^a-zA-Zа-яёА-ЯЁ0-9\-_]/g, ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "," || e.key === " ") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="Введите тег и нажмите Enter"
                    maxLength={30}
                    disabled={domainForm.tags.length >= 10}
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none font-mono"
                    style={{
                      background: "rgba(15,22,41,0.8)",
                      border: "1px solid rgba(0,212,255,0.15)",
                      color: "rgba(210,225,245,0.9)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.15)")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || domainForm.tags.length >= 10}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: tagInput.trim() ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${tagInput.trim() ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                    color: tagInput.trim() ? "rgba(0,212,255,0.8)" : "rgba(180,200,230,0.2)",
                    cursor: !tagInput.trim() || domainForm.tags.length >= 10 ? "not-allowed" : "pointer",
                  }}
                >
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              {/* Tag chips */}
              {domainForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {domainForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{ background: "rgba(0,212,255,0.1)", color: "rgba(0,212,255,0.85)", border: "1px solid rgba(0,212,255,0.2)" }}>
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 rounded-full transition-all hover:text-white"
                        style={{ color: "rgba(0,212,255,0.5)", lineHeight: 1 }}
                      >
                        <Icon name="X" size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>
                Нажмите Enter, пробел или запятую для добавления тега
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание</Label>
              <textarea
                value={domainForm.description}
                onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
                placeholder="Опишите назначение и область применения домена..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none font-sans"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(210,225,245,0.9)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,102,255,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Status preview */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${DOMAIN_STATUS_META[domainForm.status].bg}` }}>
              <Icon name={DOMAIN_STATUS_META[domainForm.status].icon} size={13} style={{ color: DOMAIN_STATUS_META[domainForm.status].color }} />
              <span className="text-xs font-medium" style={{ color: DOMAIN_STATUS_META[domainForm.status].color }}>
                Статус домена: {domainForm.status}
              </span>
              <span className="font-mono text-xs ml-auto" style={{ color: "rgba(180,200,230,0.35)" }}>
                {domainForm.id}
              </span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}
                onClick={() => setDomainDialogOpen(false)}
              >
                Отмена
              </Button>
              <button
                className="flex-1 rounded-lg text-sm font-medium py-2 transition-all flex items-center justify-center gap-2"
                onClick={handleSaveDomain}
                disabled={!domainForm.name.trim() || !!nameError || !domainForm.id.trim() || domainSaving}
                style={{
                  background: !domainForm.name.trim() || !!nameError || !domainForm.id.trim() || domainSaving
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #10b981 0%, #0066ff 100%)",
                  color: !domainForm.name.trim() || !!nameError || !domainForm.id.trim() || domainSaving ? "rgba(180,200,230,0.3)" : "white",
                  cursor: !domainForm.name.trim() || !!nameError || !domainForm.id.trim() || domainSaving ? "not-allowed" : "pointer",
                }}
              >
                {domainSaving && <Icon name="Loader" size={14} className="animate-spin" />}
                {domainSaving ? "Сохранение..." : editingDomain ? "Сохранить изменения" : "Создать домен"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Domain Delete Confirm Dialog */}
      <Dialog open={!!deleteDomainId} onOpenChange={() => setDeleteDomainId(null)}>
        <DialogContent
          className="sm:max-w-sm"
          style={{ background: "#0d1528", border: "1px solid rgba(239,68,68,0.2)", color: "white" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <Icon name="Trash2" size={15} style={{ color: "#ef4444" }} />
              </div>
              Удалить домен
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 space-y-4">
            <p className="text-sm" style={{ color: "rgba(180,200,230,0.7)" }}>
              Домен{" "}
              <span className="font-mono font-medium" style={{ color: "#ef4444" }}>
                {deleteDomainId}
              </span>{" "}
              будет удалён без возможности восстановления.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}
                onClick={() => setDeleteDomainId(null)}
              >
                Отмена
              </Button>
              <button
                className="flex-1 rounded-lg text-sm font-medium py-2"
                onClick={() => deleteDomainId && handleDeleteDomain(deleteDomainId)}
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
              >
                Удалить
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DB Config Dialog */}
      <Dialog open={dbDialogOpen} onOpenChange={setDbDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: "#0d1528",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "white",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(0,102,255,0.2)",
                  border: "1px solid rgba(0,102,255,0.3)",
                }}
              >
                <Icon name="Database" size={16} style={{ color: "#63b0ff" }} />
              </div>
              Настройка базы данных
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Mode switcher */}
            <div
              className="grid grid-cols-2 gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {(["cloud", "local"] as DbMode[]).map((mode) => {
                const isActive = pendingMode === mode;
                // cloud = Локальная (сервисная), local = Внешняя (PostgreSQL)
                const label = mode === "cloud" ? "Сервисная (Локальная)" : "PostgreSQL (Внешняя)";
                const activeColor = mode === "cloud" ? "#00d4ff" : "#a78bfa";
                const activeBg = mode === "cloud" ? "rgba(0,212,255,0.15)" : "rgba(124,58,237,0.2)";
                const activeBorder = mode === "cloud" ? "rgba(0,212,255,0.35)" : "rgba(124,58,237,0.4)";
                return (
                  <button
                    key={mode}
                    onClick={() => { setPendingMode(mode); setCheckState("idle"); setCheckError(""); }}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: isActive ? activeBg : "transparent",
                      border: isActive ? `1px solid ${activeBorder}` : "1px solid transparent",
                      color: isActive ? activeColor : "rgba(180,200,230,0.45)",
                    }}
                  >
                    <Icon name={mode === "cloud" ? "Database" : "Server"} size={14} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Сервисная (Локальная) БД */}
            {pendingMode === "cloud" && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="status-dot" style={{ backgroundColor: "#22c55e", color: "#22c55e" }} />
                  <span className="text-sm font-medium" style={{ color: "#00d4ff" }}>
                    Сервисная база данных активна
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(180,200,230,0.6)" }}>
                  Используется встроенная сервисная PostgreSQL платформы. Подключение настроено автоматически — данные доступны без дополнительной конфигурации.
                </p>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                >
                  <Icon name="Lock" size={12} style={{ color: "rgba(180,200,230,0.4)" }} />
                  <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>
                    Управляется платформой · SSL · Автобэкап
                  </span>
                </div>
              </div>
            )}

            {/* Внешняя PostgreSQL */}
            {pendingMode === "local" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Хост</Label>
                    <Input
                      value={dbConfig.host}
                      onChange={(e) => { setDbConfig({ ...dbConfig, host: e.target.value }); setCheckState("idle"); }}
                      placeholder="localhost"
                      className="font-mono text-sm"
                      style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Порт</Label>
                    <Input
                      value={dbConfig.port}
                      onChange={(e) => { setDbConfig({ ...dbConfig, port: e.target.value }); setCheckState("idle"); }}
                      placeholder="5432"
                      className="font-mono text-sm"
                      style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>База данных</Label>
                  <Input
                    value={dbConfig.name}
                    onChange={(e) => { setDbConfig({ ...dbConfig, name: e.target.value }); setCheckState("idle"); }}
                    placeholder="securearch"
                    className="font-mono text-sm"
                    style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Пользователь</Label>
                    <Input
                      value={dbConfig.user}
                      onChange={(e) => { setDbConfig({ ...dbConfig, user: e.target.value }); setCheckState("idle"); }}
                      placeholder="postgres"
                      className="font-mono text-sm"
                      style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Пароль</Label>
                    <Input
                      type="password"
                      value={dbConfig.password}
                      onChange={(e) => { setDbConfig({ ...dbConfig, password: e.target.value }); setCheckState("idle"); }}
                      placeholder="••••••••"
                      className="font-mono text-sm"
                      style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    />
                  </div>
                </div>

                {/* Connection string */}
                <div
                  className="rounded-lg p-3 flex items-start gap-3"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                  <p className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>
                    <span className="font-mono" style={{ color: "#a78bfa" }}>
                      postgresql://{dbConfig.user}@{dbConfig.host}:{dbConfig.port}/{dbConfig.name}
                    </span>
                  </p>
                </div>

                {/* Skip check toggle */}
                <button
                  onClick={() => { setSkipCheck((v) => !v); setCheckState("idle"); setCheckError(""); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: skipCheck ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${skipCheck ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name={skipCheck ? "ShieldOff" : "ShieldCheck"}
                      size={14}
                      style={{ color: skipCheck ? "#f59e0b" : "rgba(180,200,230,0.4)" }}
                    />
                    <span className="text-xs" style={{ color: skipCheck ? "#f59e0b" : "rgba(180,200,230,0.5)" }}>
                      Пропустить проверку доступности
                    </span>
                  </div>
                  {/* Toggle pill */}
                  <div
                    className="w-9 h-5 rounded-full relative transition-all flex-shrink-0"
                    style={{ background: skipCheck ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{
                        background: skipCheck ? "#f59e0b" : "rgba(180,200,230,0.4)",
                        left: skipCheck ? "calc(100% - 18px)" : "2px",
                      }}
                    />
                  </div>
                </button>

                {/* Check result */}
                {!skipCheck && checkState === "ok" && (
                  <div
                    className="rounded-lg p-3 flex items-start gap-2"
                    style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
                  >
                    <Icon name="CheckCircle2" size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#22c55e" }}>Подключение успешно</p>
                      {dbExternalVersion && (
                        <p className="text-xs mt-0.5 font-mono" style={{ color: "rgba(180,200,230,0.45)" }}>
                          {dbExternalVersion.split(" ").slice(0, 3).join(" ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {!skipCheck && checkState === "error" && (
                  <div
                    className="rounded-lg p-3 flex items-start gap-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <Icon name="XCircle" size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#ef4444" }} />
                    <p className="text-xs" style={{ color: "#ef4444" }}>{checkError}</p>
                  </div>
                )}

                {/* Check button — скрыт когда skipCheck включён */}
                {!skipCheck && (
                  <button
                    onClick={handleCheckConnection}
                    disabled={checkState === "checking"}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      color: checkState === "checking" ? "rgba(167,139,250,0.5)" : "#a78bfa",
                      cursor: checkState === "checking" ? "not-allowed" : "pointer",
                    }}
                  >
                    <Icon
                      name={checkState === "checking" ? "Loader" : "Plug"}
                      size={14}
                      className={checkState === "checking" ? "animate-spin" : ""}
                    />
                    {checkState === "checking" ? "Проверяю подключение..." : "Проверить подключение"}
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(180,200,230,0.7)",
                }}
                onClick={() => setDbDialogOpen(false)}
              >
                Отмена
              </Button>
              <button
                className="flex-1 rounded-lg text-sm font-medium py-2 transition-all"
                onClick={handleDbSave}
                disabled={pendingMode === "local" && !skipCheck && checkState !== "ok"}
                style={{
                  background: pendingMode === "local" && !skipCheck && checkState !== "ok"
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #0066ff 0%, #0047d6 100%)",
                  color: pendingMode === "local" && !skipCheck && checkState !== "ok"
                    ? "rgba(180,200,230,0.3)"
                    : "white",
                  cursor: pendingMode === "local" && !skipCheck && checkState !== "ok" ? "not-allowed" : "pointer",
                  border: "1px solid rgba(0,102,255,0.3)",
                }}
              >
                {pendingMode === "cloud" ? "Использовать сервисную БД" : "Подключить внешнюю БД"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}