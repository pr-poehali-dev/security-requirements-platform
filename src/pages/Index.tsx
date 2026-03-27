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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Section = "library" | "analytics";

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
  const [dbConnected, setDbConnected] = useState(false);
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: "localhost",
    port: "5432",
    name: "securearch",
    user: "postgres",
    password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("Все");
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  const filteredRequirements = requirements.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = selectedLevel === "Все" || r.level === selectedLevel;
    return matchSearch && matchLevel;
  });

  const handleDbSave = () => {
    setDbConnected(true);
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
              className={`nav-link text-sm font-medium pb-1 ${activeSection === "analytics" ? "active" : ""}`}
              onClick={() => setActiveSection("analytics")}
            >
              Аналитика
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDbDialogOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-blue-500/40"
              style={{
                background: "rgba(15,22,41,0.8)",
                borderColor: dbConnected ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
              }}
            >
              <div
                className="status-dot"
                style={{
                  color: dbConnected ? "#22c55e" : "#ef4444",
                  backgroundColor: dbConnected ? "#22c55e" : "#ef4444",
                }}
              />
              <span
                className="font-mono text-xs"
                style={{ color: dbConnected ? "#22c55e" : "#ef4444" }}
              >
                {dbConnected ? `PG: ${dbConfig.host}` : "Нет подключения"}
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
              Подключение к PostgreSQL
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label
                  className="text-xs"
                  style={{ color: "rgba(180,200,230,0.6)" }}
                >
                  Хост
                </Label>
                <Input
                  value={dbConfig.host}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, host: e.target.value })
                  }
                  placeholder="localhost"
                  className="font-mono text-sm"
                  style={{
                    background: "rgba(15,22,41,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  className="text-xs"
                  style={{ color: "rgba(180,200,230,0.6)" }}
                >
                  Порт
                </Label>
                <Input
                  value={dbConfig.port}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, port: e.target.value })
                  }
                  placeholder="5432"
                  className="font-mono text-sm"
                  style={{
                    background: "rgba(15,22,41,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-xs"
                style={{ color: "rgba(180,200,230,0.6)" }}
              >
                База данных
              </Label>
              <Input
                value={dbConfig.name}
                onChange={(e) =>
                  setDbConfig({ ...dbConfig, name: e.target.value })
                }
                placeholder="securearch"
                className="font-mono text-sm"
                style={{
                  background: "rgba(15,22,41,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  className="text-xs"
                  style={{ color: "rgba(180,200,230,0.6)" }}
                >
                  Пользователь
                </Label>
                <Input
                  value={dbConfig.user}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, user: e.target.value })
                  }
                  placeholder="postgres"
                  className="font-mono text-sm"
                  style={{
                    background: "rgba(15,22,41,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  className="text-xs"
                  style={{ color: "rgba(180,200,230,0.6)" }}
                >
                  Пароль
                </Label>
                <Input
                  type="password"
                  value={dbConfig.password}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="font-mono text-sm"
                  style={{
                    background: "rgba(15,22,41,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
              </div>
            </div>

            <div
              className="rounded-lg p-3 flex items-start gap-3"
              style={{
                background: "rgba(0,102,255,0.08)",
                border: "1px solid rgba(0,102,255,0.2)",
              }}
            >
              <Icon
                name="Info"
                size={14}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "#63b0ff" }}
              />
              <p className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>
                Строка подключения:{" "}
                <span className="font-mono" style={{ color: "#63b0ff" }}>
                  postgresql://{dbConfig.user}@{dbConfig.host}:{dbConfig.port}/
                  {dbConfig.name}
                </span>
              </p>
            </div>

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
                className="btn-primary flex-1 rounded-lg text-sm font-medium py-2"
                onClick={handleDbSave}
              >
                Подключить
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}