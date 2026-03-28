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
import MermaidViewer from "@/components/ui/mermaid-viewer";
import {
  exportJson, exportCsv, exportAllJson,
  readFileAsText, parseCsv, parseJsonBundle,
  type ExportEntity,
} from "@/utils/exportUtils";

type Section = "library" | "analytics" | "domains" | "tech-domains" | "technologies" | "requirements" | "tech-solutions" | "hardening" | "arch-templates" | "data-io" | "products";
type DbMode = "cloud" | "local";
type DomainStatus = "Активен" | "Не активен" | "В разработке" | "Архив";

interface TechDomain {
  id: string;
  name: string;
  version: string;
  owner: string;
  status: DomainStatus;
  tags: string[];
  description: string;
  org_domain_ids: string[];
  created_at?: string;
  updated_at?: string;
}

interface OrgDomainRef {
  id: string;
  name: string;
  status: DomainStatus;
}

type TechStatus = "Активен" | "Не активен" | "В разработке" | "Архив" | "Устарел";

interface TechDomainRef {
  id: string;
  name: string;
}

type AttachmentType = "file" | "mermaid" | "link";

interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  content: string;
}

interface Technology {
  id: string;
  name: string;
  status: TechStatus;
  description: string;
  versions: string[];
  tech_domain_ids: string[];
  tags: string[];
  attachments: Attachment[];
  created_at?: string;
  updated_at?: string;
}

type ReqType = "Организационное" | "Функциональное" | "Безопасность" | "Техническое";
type ReqCriticality = "Критический" | "Высокий" | "Средний" | "Низкий";
type ReqStatus = "Активен" | "Не активен" | "В разработке" | "Архив" | "Устарел";
type ReqEnv = "Prod" | "ProdLike" | "Stage" | "Test" | "Dev";
type ReqStage = "Стадия дизайн" | "Стадия деплоя" | "Стадия рантайм";
type ReqInteraction = "Обязательный" | "Рекомендуемый" | "Не требуется" | "Запрещено";

interface Req {
  id: string;
  name: string;
  technology_id: string;
  tech_domain_id: string;
  description: string;
  req_type: ReqType;
  criticality: ReqCriticality;
  control_metric: string;
  control_description: string;
  tags: string[];
  version: string;
  status: ReqStatus;
  norm_doc_link: string;
  environments: ReqEnv[];
  stages: ReqStage[];
  procurement: string;
  ext_with_iod: ReqInteraction;
  ext_without_iod: ReqInteraction;
  int_with_iod: ReqInteraction;
  int_without_iod: ReqInteraction;
  score_value: number;
  score_weight: number;
  created_at?: string;
  updated_at?: string;
}

const REQ_TYPES: ReqType[] = ["Организационное", "Функциональное", "Безопасность", "Техническое"];
const REQ_TYPE_META: Record<ReqType, { color: string; bg: string; icon: string }> = {
  "Организационное": { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: "Building2" },
  "Функциональное":  { color: "#63b0ff", bg: "rgba(99,176,255,0.12)",  icon: "Cpu" },
  "Безопасность":    { color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: "ShieldCheck" },
  "Техническое":     { color: "#34d399", bg: "rgba(52,211,153,0.12)",  icon: "Wrench" },
};

const REQ_CRITICALITY_META: Record<ReqCriticality, { color: string; bg: string; icon: string }> = {
  "Критический": { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: "AlertOctagon" },
  "Высокий":     { color: "#f97316", bg: "rgba(249,115,22,0.12)",  icon: "AlertTriangle" },
  "Средний":     { color: "#eab308", bg: "rgba(234,179,8,0.12)",   icon: "Minus" },
  "Низкий":      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: "ChevronDown" },
};

const REQ_STATUS_META: Record<ReqStatus, { color: string; bg: string; icon: string }> = {
  "Активен":      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":   { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
  "Устарел":      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: "AlertTriangle" },
};

const REQ_ENVS: ReqEnv[] = ["Prod", "ProdLike", "Stage", "Test", "Dev"];
const REQ_STAGES: ReqStage[] = ["Стадия дизайн", "Стадия деплоя", "Стадия рантайм"];
const REQ_INTERACTIONS: ReqInteraction[] = ["Обязательный", "Рекомендуемый", "Не требуется", "Запрещено"];
const REQ_INTERACTION_META: Record<ReqInteraction, { color: string }> = {
  "Обязательный":  { color: "#ef4444" },
  "Рекомендуемый": { color: "#f59e0b" },
  "Не требуется":  { color: "#6b7280" },
  "Запрещено":     { color: "#a78bfa" },
};
const REQ_CRITICALITIES: ReqCriticality[] = ["Критический", "Высокий", "Средний", "Низкий"];
const REQ_STATUSES: ReqStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];

// ── Tech Solutions ───────────────────────────────────────────────
type TechSolutionStatus = "Активен" | "Не активен" | "В разработке" | "Архив" | "Устарел";
const TECH_SOLUTION_STATUSES: TechSolutionStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];
const TECH_SOLUTION_STATUS_META: Record<TechSolutionStatus, { color: string; bg: string; icon: string }> = {
  "Активен":      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":   { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
  "Устарел":      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: "AlertTriangle" },
};

interface TechSolution {
  id: string;
  name: string;
  description: string;
  status: TechSolutionStatus;
  author: string;
  version: string;
  tags: string[];
  technology_ids: string[];
  tech_domain?: string;
  approved_ib: boolean;
  approved_it: boolean;
  related_solution_ids: string[];
  attachments: Attachment[];
  created_at?: string;
  updated_at?: string;
}

type HardeningStatus = "Активен" | "Не активен" | "В разработке" | "Архив" | "Устарел";

interface Hardening {
  id: string;
  name: string;
  tech_solution_id: string;
  deploy_hardening: string;
  functional_hardening: string;
  status: HardeningStatus;
  author: string;
  version: string;
  tags: string[];
  approved_ib: boolean;
  approved_it: boolean;
  created_at?: string;
  updated_at?: string;
}

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

type ArchTemplateStatus = "Активен" | "Не активен" | "В разработке" | "Архив" | "Устарел";

interface MermaidDiagram {
  id: string;
  name: string;
  content: string;
}

type ProductStatus = "Активен" | "Не активен" | "В разработке" | "Архив" | "Устарел";

interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  author: string;
  version: string;
  cmdb_mnemonic: string;
  tags: string[];
  arch_template_ids: string[];
  approved_ib: boolean;
  approved_it: boolean;
  image_url: string;
  diagrams: MermaidDiagram[];
  created_at?: string;
  updated_at?: string;
}

const PRODUCT_STATUSES: ProductStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];

const PRODUCT_STATUS_META: Record<ProductStatus, { color: string; bg: string; icon: string }> = {
  "Активен":      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":   { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
  "Устарел":      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: "AlertTriangle" },
};

interface ArchTemplate {
  id: string;
  name: string;
  description: string;
  status: ArchTemplateStatus;
  author: string;
  version: string;
  tags: string[];
  tech_solution_ids: string[];
  approved_ib: boolean;
  approved_it: boolean;
  diagrams: MermaidDiagram[];
  created_at?: string;
  updated_at?: string;
}

const ARCH_TEMPLATE_STATUSES: ArchTemplateStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];

const ARCH_TEMPLATE_STATUS_META: Record<ArchTemplateStatus, { color: string; bg: string; icon: string }> = {
  "Активен":      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":   { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
  "Устарел":      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: "AlertTriangle" },
};

const HARDENING_STATUS_META: Record<HardeningStatus, { color: string; bg: string; icon: string }> = {
  "Активен":       { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":    { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке":  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":         { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
  "Устарел":       { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: "AlertTriangle" },
};

const HARDENING_STATUSES: HardeningStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];

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
    id: `org-dom-${String(count + 1).padStart(3, "0")}`,
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
    await fetch(`${DOMAINS_API}?mode=settings`, {
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

  // ── Tech Domains state ──────────────────────────────────────────
  const TECH_DOMAINS_API = "https://functions.poehali.dev/e3873998-84e0-4b31-af68-5128ea37c246";
  const [techDomains, setTechDomains] = useState<TechDomain[]>([]);
  const [techOrgRefs, setTechOrgRefs] = useState<OrgDomainRef[]>([]);
  const [techLoading, setTechLoading] = useState(false);
  const [techSectionDesc, setTechSectionDesc] = useState("Реестр технических доменов безопасности — создание, редактирование и управление архитектурными компонентами");
  const [techSectionDescEditing, setTechSectionDescEditing] = useState(false);
  const [techSectionDescDraft, setTechSectionDescDraft] = useState(techSectionDesc);
  const [techDialogOpen, setTechDialogOpen] = useState(false);
  const [techSaving, setTechSaving] = useState(false);
  const [techSaveError, setTechSaveError] = useState("");
  const [deleteTechId, setDeleteTechId] = useState<string | null>(null);
  const [editingTech, setEditingTech] = useState<TechDomain | null>(null);
  const [viewTech, setViewTech] = useState<TechDomain | null>(null);
  const [techSearch, setTechSearch] = useState("");
  const [techTagInput, setTechTagInput] = useState("");
  const [techNameError, setTechNameError] = useState("");

  const makeEmptyTechForm = (count: number): TechDomain => ({
    id: `tech-dom-${String(count + 1).padStart(3, "0")}`,
    name: "",
    version: "1.0.0",
    owner: "",
    status: "В разработке",
    tags: [],
    description: "",
    org_domain_ids: [],
  });
  const [techForm, setTechForm] = useState<TechDomain>(makeEmptyTechForm(0));

  const loadTechDomains = async () => {
    setTechLoading(true);
    try {
      const res = await fetch(TECH_DOMAINS_API);
      const data = await res.json();
      setTechDomains(data.tech_domains || []);
      setTechOrgRefs(data.org_domains || []);
      if (data.section_description) setTechSectionDesc(data.section_description);
    } finally {
      setTechLoading(false);
    }
  };

  const openCreateTech = () => {
    setEditingTech(null);
    setTechForm(makeEmptyTechForm(techDomains.length));
    setTechTagInput("");
    setTechNameError("");
    setTechSaveError("");
    setTechDialogOpen(true);
  };

  const openEditTech = (d: TechDomain) => {
    setEditingTech(d);
    setTechForm({ ...d, tags: d.tags || [], org_domain_ids: d.org_domain_ids || [] });
    setTechTagInput("");
    setTechNameError("");
    setTechSaveError("");
    setTechDialogOpen(true);
  };

  const validateTechName = (val: string) => {
    if (!val.trim()) return "Название обязательно";
    if (val.trim().length < 3) return "Минимум 3 символа";
    if (val.trim().length > 100) return "Максимум 100 символов";
    return "";
  };

  const addTechTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || techForm.tags.includes(tag) || techForm.tags.length >= 10) return;
    setTechForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTechTagInput("");
  };

  const removeTechTag = (tag: string) => {
    setTechForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const toggleOrgDomain = (id: string) => {
    setTechForm((f) => ({
      ...f,
      org_domain_ids: f.org_domain_ids.includes(id)
        ? f.org_domain_ids.filter((x) => x !== id)
        : [...f.org_domain_ids, id],
    }));
  };

  const handleSaveTech = async () => {
    const nameErr = validateTechName(techForm.name);
    if (nameErr || !techForm.id.trim()) { setTechNameError(nameErr); return; }
    setTechSaving(true);
    setTechSaveError("");
    try {
      const method = editingTech ? "PUT" : "POST";
      const res = await fetch(TECH_DOMAINS_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techForm),
      });
      const data = await res.json();
      if (data.error) { setTechSaveError(data.error); return; }
      if (editingTech) {
        setTechDomains((prev) => prev.map((d) => (d.id === editingTech.id ? data : d)));
      } else {
        setTechDomains((prev) => [...prev, data]);
      }
      setTechDialogOpen(false);
    } finally {
      setTechSaving(false);
    }
  };

  const handleDeleteTech = async (id: string) => {
    await fetch(TECH_DOMAINS_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTechDomains((prev) => prev.filter((d) => d.id !== id));
    setDeleteTechId(null);
    if (viewTech?.id === id) setViewTech(null);
  };

  const handleSaveTechSectionDesc = async () => {
    setTechSectionDesc(techSectionDescDraft);
    setTechSectionDescEditing(false);
    await fetch(`${TECH_DOMAINS_API}?mode=settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: techSectionDescDraft }),
    });
  };

  const filteredTechDomains = techDomains.filter((d) =>
    d.name.toLowerCase().includes(techSearch.toLowerCase()) ||
    d.id.toLowerCase().includes(techSearch.toLowerCase()) ||
    d.owner.toLowerCase().includes(techSearch.toLowerCase())
  );

  // ── Technologies state ──────────────────────────────────────────
  const TECH_STATUS_META: Record<TechStatus, { color: string; bg: string; icon: string }> = {
    "Активен":      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
    "Не активен":   { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
    "В разработке": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
    "Архив":        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
    "Устарел":      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: "AlertTriangle" },
  };
  const TECH_STATUSES: TechStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];

  const TECHNOLOGIES_API = "https://functions.poehali.dev/e6d8d44f-ba31-4ab3-a776-b40bafbcf7e8";
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [techDomainRefs, setTechDomainRefs] = useState<TechDomainRef[]>([]);
  const [techSectionDesc2, setTechSectionDesc2] = useState("Реестр технологий ИБ — JWT, OAuth 2.0, шифрование, контейнеризация и другие технические решения");
  const [techSectionDesc2Editing, setTechSectionDesc2Editing] = useState(false);
  const [techSectionDesc2Draft, setTechSectionDesc2Draft] = useState(techSectionDesc2);
  const [techsLoading, setTechsLoading] = useState(false);
  const [techDialogOpen2, setTechDialogOpen2] = useState(false);
  const [techSaving2, setTechSaving2] = useState(false);
  const [techSaveError2, setTechSaveError2] = useState("");
  const [deleteTechId2, setDeleteTechId2] = useState<string | null>(null);
  const [editingTech2, setEditingTech2] = useState<Technology | null>(null);
  const [viewTech2, setViewTech2] = useState<Technology | null>(null);
  const [techSearch2, setTechSearch2] = useState("");
  const [techTagInput2, setTechTagInput2] = useState("");
  const [techNameError2, setTechNameError2] = useState("");
  const [techVersionInput, setTechVersionInput] = useState("");
  const [existingTechNames, setExistingTechNames] = useState<{id:string;name:string}[]>([]);
  const [techLibraryOpen, setTechLibraryOpen] = useState(false);
  const [techLibrarySearch, setTechLibrarySearch] = useState("");
  const [attachmentTab, setAttachmentTab] = useState<AttachmentType>("link");
  const [attachDraft, setAttachDraft] = useState<Omit<Attachment,"id">>({ type:"link", name:"", content:"" });
  const [viewAttachment, setViewAttachment] = useState<Attachment | null>(null);
  const [techReqFilter, setTechReqFilter] = useState<string>("Все");
  const [viewTechFull, setViewTechFull] = useState<Technology | null>(null);
  const [techFullSearch, setTechFullSearch] = useState("");
  const [techFullSortField, setTechFullSortField] = useState<string>("id");
  const [techFullSortDir, setTechFullSortDir] = useState<"asc" | "desc">("asc");
  const [techFullFilterType, setTechFullFilterType] = useState<ReqType[]>([]);
  const [techFullFilterCrit, setTechFullFilterCrit] = useState<ReqCriticality[]>([]);
  const [techFullFilterStatus, setTechFullFilterStatus] = useState<ReqStatus[]>([]);
  const [techFullFilterEnv, setTechFullFilterEnv] = useState<ReqEnv[]>([]);
  const [techFullFilterStage, setTechFullFilterStage] = useState<ReqStage[]>([]);
  const [techFormLinkedReqIds, setTechFormLinkedReqIds] = useState<Set<string>>(new Set());
  const [techReqSearch, setTechReqSearch] = useState("");
  const [techReqStatusFilter, setTechReqStatusFilter] = useState<ReqStatus | "Все">("Все");

  const makeEmptyTechForm2 = (count: number): Technology => ({
    id: `tech-${String(count + 1).padStart(3, "0")}`,
    name: "",
    status: "В разработке",
    description: "",
    versions: [],
    tech_domain_ids: [],
    tags: [],
    attachments: [],
  });
  const [techForm2, setTechForm2] = useState<Technology>(makeEmptyTechForm2(0));

  const loadTechnologies = async () => {
    setTechsLoading(true);
    try {
      const res = await fetch(TECHNOLOGIES_API);
      const data = await res.json();
      setTechnologies(data.items || []);
      setTechDomainRefs(data.tech_domains || []);
      if (data.section_description) setTechSectionDesc2(data.section_description);
    } finally {
      setTechsLoading(false);
    }
  };

  const loadExistingTechNames = async () => {
    const res = await fetch(`${TECHNOLOGIES_API}?mode=names`);
    const data = await res.json();
    setExistingTechNames(data.names || []);
  };

  const openCreateTech2 = () => {
    setEditingTech2(null);
    setTechForm2(makeEmptyTechForm2(technologies.length));
    setTechTagInput2(""); setTechNameError2(""); setTechSaveError2("");
    setTechVersionInput(""); setAttachDraft({ type:"link", name:"", content:"" });
    setAttachmentTab("link");
    setTechFormLinkedReqIds(new Set());
    setTechReqSearch(""); setTechReqStatusFilter("Все");
    loadExistingTechNames();
    setTechDialogOpen2(true);
  };

  const openEditTech2 = (t: Technology) => {
    setEditingTech2(t);
    setTechForm2({ ...t, tags: t.tags || [], versions: t.versions || [], tech_domain_ids: t.tech_domain_ids || [], attachments: t.attachments || [] });
    setTechTagInput2(""); setTechNameError2(""); setTechSaveError2("");
    setTechVersionInput(""); setAttachDraft({ type:"link", name:"", content:"" });
    setAttachmentTab("link");
    setTechFormLinkedReqIds(new Set(reqs.filter((r) => r.technology_id === t.id).map((r) => r.id)));
    setTechReqSearch(""); setTechReqStatusFilter("Все");
    loadExistingTechNames();
    setTechDialogOpen2(true);
  };

  const validateTechName2 = (val: string) => {
    if (!val.trim()) return "Название обязательно";
    if (val.trim().length < 2) return "Минимум 2 символа";
    if (val.trim().length > 100) return "Максимум 100 символов";
    const dup = existingTechNames.find(
      (n) => n.name.toLowerCase() === val.trim().toLowerCase() && n.id !== (editingTech2?.id || "")
    );
    if (dup) return `Технология «${dup.name}» уже существует`;
    return "";
  };

  const addTechTag2 = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || techForm2.tags.includes(tag) || techForm2.tags.length >= 10) return;
    setTechForm2((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTechTagInput2("");
  };

  const addVersion = (raw: string) => {
    const v = raw.trim();
    if (!v || techForm2.versions.includes(v)) return;
    setTechForm2((f) => ({ ...f, versions: [...f.versions, v] }));
    setTechVersionInput("");
  };

  const toggleTechDomainRef = (id: string) => {
    setTechForm2((f) => ({
      ...f,
      tech_domain_ids: f.tech_domain_ids.includes(id)
        ? f.tech_domain_ids.filter((x) => x !== id)
        : [...f.tech_domain_ids, id],
    }));
  };

  const addAttachment = () => {
    if (!attachDraft.name.trim() || !attachDraft.content.trim()) return;
    const att: Attachment = { id: Date.now().toString(), ...attachDraft };
    setTechForm2((f) => ({ ...f, attachments: [...f.attachments, att] }));
    setAttachDraft({ type: attachmentTab, name: "", content: "" });
  };

  const removeAttachment = (id: string) => {
    setTechForm2((f) => ({ ...f, attachments: f.attachments.filter((a) => a.id !== id) }));
  };

  const handleSaveTech2 = async () => {
    const nameErr = validateTechName2(techForm2.name);
    if (nameErr || !techForm2.id.trim()) { setTechNameError2(nameErr); return; }
    setTechSaving2(true); setTechSaveError2("");
    try {
      const method = editingTech2 ? "PUT" : "POST";
      const res = await fetch(TECHNOLOGIES_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techForm2),
      });
      const data = await res.json();
      if (data.error) { setTechSaveError2(data.error); return; }
      if (editingTech2) {
        setTechnologies((prev) => prev.map((t) => (t.id === editingTech2.id ? data : t)));
      } else {
        setTechnologies((prev) => [...prev, data]);
      }

      // Sync requirement links: find added/removed compared to original
      const techId = techForm2.id;
      const originalIds = new Set(reqs.filter((r) => r.technology_id === (editingTech2?.id ?? techId)).map((r) => r.id));
      const toAdd = [...techFormLinkedReqIds].filter((id) => !originalIds.has(id));
      const toRemove = [...originalIds].filter((id) => !techFormLinkedReqIds.has(id));
      const reqPatches = [
        ...toAdd.map((id) => ({ id, technology_id: techId })),
        ...toRemove.map((id) => ({ id, technology_id: "" })),
      ];
      if (reqPatches.length > 0) {
        await Promise.all(
          reqPatches.map((patch) =>
            fetch(REQUIREMENTS_API, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...reqs.find((r) => r.id === patch.id)!, technology_id: patch.technology_id }),
            })
          )
        );
        setReqs((prev) =>
          prev.map((r) => {
            const patch = reqPatches.find((p) => p.id === r.id);
            return patch ? { ...r, technology_id: patch.technology_id } : r;
          })
        );
      }

      setTechDialogOpen2(false);
    } finally {
      setTechSaving2(false);
    }
  };

  const handleDeleteTech2 = async (id: string) => {
    await fetch(TECHNOLOGIES_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTechnologies((prev) => prev.filter((t) => t.id !== id));
    setDeleteTechId2(null);
    if (viewTech2?.id === id) setViewTech2(null);
  };

  const handleSaveTechSectionDesc2 = async () => {
    setTechSectionDesc2(techSectionDesc2Draft);
    setTechSectionDesc2Editing(false);
    await fetch(`${TECHNOLOGIES_API}?mode=settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: techSectionDesc2Draft }),
    });
  };

  const filteredTechnologies = technologies.filter((t) =>
    t.name.toLowerCase().includes(techSearch2.toLowerCase()) ||
    t.id.toLowerCase().includes(techSearch2.toLowerCase()) ||
    (t.tags || []).some((tag) => tag.toLowerCase().includes(techSearch2.toLowerCase()))
  );

  // ── Requirements state ──────────────────────────────────────────
  const REQUIREMENTS_API = "https://functions.poehali.dev/f955567c-3548-4631-a5b8-e590ad2c5177";
  const [reqs, setReqs] = useState<Req[]>([]);
  const [reqTechRefs, setReqTechRefs] = useState<{ id: string; name: string }[]>([]);
  const [reqTechDomainRefs, setReqTechDomainRefs] = useState<{ id: string; name: string }[]>([]);
  const [reqsLoading, setReqsLoading] = useState(false);
  const [reqSectionDesc, setReqSectionDesc] = useState("Реестр требований безопасности — организационные, функциональные и технические требования");
  const [reqSectionDescEditing, setReqSectionDescEditing] = useState(false);
  const [reqSectionDescDraft, setReqSectionDescDraft] = useState(reqSectionDesc);
  const [reqDialogOpen, setReqDialogOpen] = useState(false);
  const [reqSaving, setReqSaving] = useState(false);
  const [reqSaveError, setReqSaveError] = useState("");
  const [deleteReqId, setDeleteReqId] = useState<string | null>(null);
  const [editingReq, setEditingReq] = useState<Req | null>(null);
  const [viewReq, setViewReq] = useState<Req | null>(null);
  const [reqSearch, setReqSearch] = useState("");
  const [reqFilterType, setReqFilterType] = useState<string>("Все");
  const [reqFilterCrit, setReqFilterCrit] = useState<string>("Все");
  const [reqFilterStatus, setReqFilterStatus] = useState<string>("Все");
  const [reqTagInput, setReqTagInput] = useState("");

  const makeEmptyReqForm = (count: number): Req => ({
    id: `req-${String(count + 1).padStart(3, "0")}`,
    name: "",
    technology_id: "",
    tech_domain_id: "",
    description: "",
    req_type: "Техническое",
    criticality: "Средний",
    control_metric: "",
    control_description: "",
    tags: [],
    version: "1.0.0",
    status: "В разработке",
    norm_doc_link: "",
    environments: [],
    stages: [],
    procurement: "",
    ext_with_iod: "Не требуется",
    ext_without_iod: "Не требуется",
    int_with_iod: "Не требуется",
    int_without_iod: "Не требуется",
    score_value: 1,
    score_weight: 1,
  });
  const [reqForm, setReqForm] = useState<Req>(makeEmptyReqForm(0));

  const loadReqs = async () => {
    setReqsLoading(true);
    try {
      const res = await fetch(REQUIREMENTS_API);
      const data = await res.json();
      setReqs(data.items || []);
      setReqTechRefs(data.technologies || []);
      setReqTechDomainRefs(data.tech_domains || []);
      if (data.section_description) setReqSectionDesc(data.section_description);
    } finally {
      setReqsLoading(false);
    }
  };

  const openCreateReq = () => {
    setEditingReq(null);
    setReqForm(makeEmptyReqForm(reqs.length));
    setReqTagInput(""); setReqSaveError("");
    setReqDialogOpen(true);
  };

  const openEditReq = (r: Req) => {
    setEditingReq(r);
    setReqForm({ ...r, tags: r.tags || [], environments: r.environments || [], stages: r.stages || [] });
    setReqTagInput(""); setReqSaveError("");
    setReqDialogOpen(true);
  };

  const addReqTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || reqForm.tags.includes(tag) || reqForm.tags.length >= 10) return;
    setReqForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setReqTagInput("");
  };

  const toggleReqEnv = (env: ReqEnv) => {
    setReqForm((f) => ({
      ...f,
      environments: f.environments.includes(env)
        ? f.environments.filter((e) => e !== env)
        : [...f.environments, env],
    }));
  };

  const toggleReqStage = (s: ReqStage) => {
    setReqForm((f) => ({
      ...f,
      stages: f.stages.includes(s) ? f.stages.filter((x) => x !== s) : [...f.stages, s],
    }));
  };

  const handleSaveReq = async () => {
    if (!reqForm.name.trim() || !reqForm.id.trim()) { setReqSaveError("Название и ID обязательны"); return; }
    setReqSaving(true); setReqSaveError("");
    try {
      const method = editingReq ? "PUT" : "POST";
      const res = await fetch(REQUIREMENTS_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqForm),
      });
      const data = await res.json();
      if (data.error) { setReqSaveError(data.error); return; }
      if (editingReq) {
        setReqs((prev) => prev.map((r) => (r.id === editingReq.id ? data : r)));
      } else {
        setReqs((prev) => [...prev, data]);
      }
      setReqDialogOpen(false);
    } finally {
      setReqSaving(false);
    }
  };

  const handleDeleteReq = async (id: string) => {
    await fetch(REQUIREMENTS_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setReqs((prev) => prev.filter((r) => r.id !== id));
    setDeleteReqId(null);
    if (viewReq?.id === id) setViewReq(null);
  };

  const handleSaveReqSectionDesc = async () => {
    setReqSectionDesc(reqSectionDescDraft);
    setReqSectionDescEditing(false);
    await fetch(`${REQUIREMENTS_API}?mode=settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: reqSectionDescDraft }),
    });
  };

  const filteredReqs = reqs.filter((r) => {
    const q = reqSearch.toLowerCase();
    const matchSearch = !q ||
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.control_metric.toLowerCase().includes(q) ||
      (r.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      (r.norm_doc_link || "").toLowerCase().includes(q);
    const matchType = reqFilterType === "Все" || r.req_type === reqFilterType;
    const matchCrit = reqFilterCrit === "Все" || r.criticality === reqFilterCrit;
    const matchStatus = reqFilterStatus === "Все" || r.status === reqFilterStatus;
    return matchSearch && matchType && matchCrit && matchStatus;
  });

  // ── Tech Solutions state ─────────────────────────────────────────
  const TECH_SOLUTIONS_API = "https://functions.poehali.dev/99caeca9-833c-478d-b201-139ec6d861a2";
  const [techSolutions, setTechSolutions] = useState<TechSolution[]>([]);
  const [tsolLoading, setTsolLoading] = useState(false);
  const [tsolSectionDesc, setTsolSectionDesc] = useState("Реестр технических решений — архитектурные и проектные решения, согласованные с ИБ и ИТ");
  const [tsolSectionDescEditing, setTsolSectionDescEditing] = useState(false);
  const [tsolSectionDescDraft, setTsolSectionDescDraft] = useState(tsolSectionDesc);
  const [tsolDialogOpen, setTsolDialogOpen] = useState(false);
  const [tsolSaving, setTsolSaving] = useState(false);
  const [tsolSaveError, setTsolSaveError] = useState("");
  const [deleteTsolId, setDeleteTsolId] = useState<string | null>(null);
  const [editingTsol, setEditingTsol] = useState<TechSolution | null>(null);
  const [viewTsol, setViewTsol] = useState<TechSolution | null>(null);
  const [tsolSearch, setTsolSearch] = useState("");
  const [tsolFilterStatus, setTsolFilterStatus] = useState<string>("Все");
  const [tsolFilterTag, setTsolFilterTag] = useState<string>("");
  const [tsolTagInput, setTsolTagInput] = useState("");
  const [tsolAttachTab, setTsolAttachTab] = useState<AttachmentType>("link");
  const [tsolAttachDraft, setTsolAttachDraft] = useState<Omit<Attachment,"id">>({ type:"link", name:"", content:"" });
  const [tsolViewAttachment, setTsolViewAttachment] = useState<Attachment | null>(null);
  const [tsolRelSearch, setTsolRelSearch] = useState("");
  const [tsolTechSearch, setTsolTechSearch] = useState("");

  const makeEmptyTsolForm = (count: number): TechSolution => ({
    id: `tsol-${String(count + 1).padStart(3, "0")}`,
    name: "",
    description: "",
    status: "В разработке",
    author: "",
    version: "1.0.0",
    tags: [],
    technology_ids: [],
    tech_domain: "",
    approved_ib: false,
    approved_it: false,
    related_solution_ids: [],
    attachments: [],
  });
  const [tsolForm, setTsolForm] = useState<TechSolution>(makeEmptyTsolForm(0));

  const loadTechSolutions = async () => {
    setTsolLoading(true);
    try {
      const [res, techRes] = await Promise.all([
        fetch(TECH_SOLUTIONS_API),
        technologies.length === 0 ? fetch(TECHNOLOGIES_API) : Promise.resolve(null),
      ]);
      const data = await res.json();
      setTechSolutions(data.items || []);
      if (data.section_description) setTsolSectionDesc(data.section_description);
      if (techRes) {
        const techData = await techRes.json();
        setTechnologies(techData.items || []);
      }
    } finally {
      setTsolLoading(false);
    }
  };

  const openCreateTsol = () => {
    setEditingTsol(null);
    setTsolForm(makeEmptyTsolForm(techSolutions.length));
    setTsolTagInput(""); setTsolSaveError("");
    setTsolAttachTab("link"); setTsolAttachDraft({ type:"link", name:"", content:"" });
    setTsolRelSearch(""); setTsolTechSearch("");
    if (technologies.length === 0) loadTechnologies();
    setTsolDialogOpen(true);
  };

  const openEditTsol = (s: TechSolution) => {
    setEditingTsol(s);
    setTsolForm({ ...s, tags: s.tags || [], technology_ids: s.technology_ids || [], related_solution_ids: s.related_solution_ids || [], attachments: s.attachments || [] });
    setTsolTagInput(""); setTsolSaveError("");
    setTsolAttachTab("link"); setTsolAttachDraft({ type:"link", name:"", content:"" });
    setTsolRelSearch(""); setTsolTechSearch("");
    if (technologies.length === 0) loadTechnologies();
    setTsolDialogOpen(true);
  };

  const addTsolTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || tsolForm.tags.includes(tag) || tsolForm.tags.length >= 10) return;
    setTsolForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTsolTagInput("");
  };

  const addTsolAttachment = () => {
    if (!tsolAttachDraft.name.trim() || !tsolAttachDraft.content.trim()) return;
    const att: Attachment = { id: `att-${Date.now()}`, ...tsolAttachDraft };
    setTsolForm((f) => ({ ...f, attachments: [...f.attachments, att] }));
    setTsolAttachDraft({ type: tsolAttachTab, name: "", content: "" });
  };

  const handleSaveTsol = async () => {
    if (!tsolForm.name.trim() || !tsolForm.id.trim()) { setTsolSaveError("Название и ID обязательны"); return; }
    setTsolSaving(true); setTsolSaveError("");
    try {
      const method = editingTsol ? "PUT" : "POST";
      const res = await fetch(TECH_SOLUTIONS_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tsolForm),
      });
      const data = await res.json();
      if (data.error) { setTsolSaveError(data.error); return; }
      if (editingTsol) {
        setTechSolutions((prev) => prev.map((s) => s.id === editingTsol.id ? data : s));
        if (viewTsol?.id === editingTsol.id) setViewTsol(data);
      } else {
        setTechSolutions((prev) => [...prev, data]);
      }
      setTsolDialogOpen(false);
    } finally {
      setTsolSaving(false);
    }
  };

  const handleDeleteTsol = async (id: string) => {
    await fetch(TECH_SOLUTIONS_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTechSolutions((prev) => prev.filter((s) => s.id !== id));
    setDeleteTsolId(null);
    if (viewTsol?.id === id) setViewTsol(null);
  };

  const handleSaveTsolSectionDesc = async () => {
    setTsolSectionDesc(tsolSectionDescDraft);
    setTsolSectionDescEditing(false);
    await fetch(`${TECH_SOLUTIONS_API}?mode=settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: tsolSectionDescDraft }),
    });
  };

  const filteredTsols = techSolutions.filter((s) => {
    const q = tsolSearch.toLowerCase();
    const matchQ = !q || (s.name||"").toLowerCase().includes(q) || (s.id||"").toLowerCase().includes(q) || (s.description||"").toLowerCase().includes(q) || (s.author||"").toLowerCase().includes(q) || (s.tags||[]).some((t) => t.toLowerCase().includes(q));
    const matchStatus = tsolFilterStatus === "Все" || s.status === tsolFilterStatus;
    const matchTag = !tsolFilterTag || (s.tags||[]).some((t) => t.toLowerCase().includes(tsolFilterTag.toLowerCase()));
    return matchQ && matchStatus && matchTag;
  });
  // ─────────────────────────────────────────────────────────────────

  // ── Hardening state ──────────────────────────────────────────────
  const HARDENING_API = "https://functions.poehali.dev/5c18ac6b-dfc4-444c-a0bf-7f9f6d9656cf";
  const [hardenings, setHardenings] = useState<Hardening[]>([]);
  const [hardLoading, setHardLoading] = useState(false);
  const [hardSectionDesc, setHardSectionDesc] = useState("Реестр харденингов технических решений — настройки безопасности развёртывания и функционала");
  const [hardSectionDescEditing, setHardSectionDescEditing] = useState(false);
  const [hardSectionDescDraft, setHardSectionDescDraft] = useState(hardSectionDesc);
  const [hardDialogOpen, setHardDialogOpen] = useState(false);
  const [hardSaving, setHardSaving] = useState(false);
  const [hardSaveError, setHardSaveError] = useState("");
  const [deleteHardId, setDeleteHardId] = useState<string | null>(null);
  const [editingHard, setEditingHard] = useState<Hardening | null>(null);
  const [viewHard, setViewHard] = useState<Hardening | null>(null);
  const [hardSearch, setHardSearch] = useState("");
  const [hardFilterStatus, setHardFilterStatus] = useState<string>("Все");
  const [hardFilterTag, setHardFilterTag] = useState<string>("");
  const [hardFilterTsol, setHardFilterTsol] = useState<string>("");
  const [hardTagInput, setHardTagInput] = useState("");
  const [hardTsolSearch, setHardTsolSearch] = useState("");

  const makeEmptyHardForm = (count: number): Hardening => ({
    id: `hard-${String(count + 1).padStart(3, "0")}`,
    name: "",
    tech_solution_id: "",
    deploy_hardening: "",
    functional_hardening: "",
    status: "В разработке",
    author: "",
    version: "1.0.0",
    tags: [],
    approved_ib: false,
    approved_it: false,
  });
  const [hardForm, setHardForm] = useState<Hardening>(makeEmptyHardForm(0));

  const loadHardenings = async () => {
    setHardLoading(true);
    try {
      const [res, tsolRes] = await Promise.all([
        fetch(HARDENING_API),
        techSolutions.length === 0 ? fetch(TECH_SOLUTIONS_API) : Promise.resolve(null),
      ]);
      const data = await res.json();
      setHardenings(data.items || []);
      if (data.section_description) setHardSectionDesc(data.section_description);
      if (tsolRes) {
        const td = await tsolRes.json();
        setTechSolutions(td.items || []);
      }
    } finally {
      setHardLoading(false);
    }
  };

  const openCreateHard = () => {
    setEditingHard(null);
    setHardForm(makeEmptyHardForm(hardenings.length));
    setHardTagInput(""); setHardSaveError(""); setHardTsolSearch("");
    if (techSolutions.length === 0) loadTechSolutions();
    setHardDialogOpen(true);
  };

  const openEditHard = (h: Hardening) => {
    setEditingHard(h);
    setHardForm({ ...h, tags: h.tags || [] });
    setHardTagInput(""); setHardSaveError(""); setHardTsolSearch("");
    if (techSolutions.length === 0) loadTechSolutions();
    setHardDialogOpen(true);
  };

  const addHardTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || hardForm.tags.includes(tag) || hardForm.tags.length >= 10) return;
    setHardForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setHardTagInput("");
  };

  const handleSaveHard = async () => {
    if (!hardForm.name.trim() || !hardForm.id.trim()) { setHardSaveError("Название и ID обязательны"); return; }
    setHardSaving(true); setHardSaveError("");
    try {
      const method = editingHard ? "PUT" : "POST";
      const res = await fetch(HARDENING_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hardForm),
      });
      const data = await res.json();
      if (data.error) { setHardSaveError(data.error); return; }
      if (editingHard) {
        setHardenings((prev) => prev.map((h) => h.id === editingHard.id ? data : h));
        if (viewHard?.id === editingHard.id) setViewHard(data);
      } else {
        setHardenings((prev) => [...prev, data]);
      }
      setHardDialogOpen(false);
    } finally {
      setHardSaving(false);
    }
  };

  const handleDeleteHard = async (id: string) => {
    await fetch(HARDENING_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHardenings((prev) => prev.filter((h) => h.id !== id));
    setDeleteHardId(null);
    if (viewHard?.id === id) setViewHard(null);
  };

  const handleSaveHardSectionDesc = async () => {
    setHardSectionDesc(hardSectionDescDraft);
    setHardSectionDescEditing(false);
    await fetch(`${HARDENING_API}?mode=settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: hardSectionDescDraft }),
    });
  };

  const filteredHardenings = hardenings.filter((h) => {
    const q = hardSearch.toLowerCase();
    const matchQ = !q || (h.id||"").toLowerCase().includes(q) || (h.name||"").toLowerCase().includes(q) || (h.author||"").toLowerCase().includes(q) || (h.tech_solution_id||"").toLowerCase().includes(q) || (h.deploy_hardening||"").toLowerCase().includes(q) || (h.functional_hardening||"").toLowerCase().includes(q) || (h.tags||[]).some((t) => t.toLowerCase().includes(q));
    const matchStatus = hardFilterStatus === "Все" || h.status === hardFilterStatus;
    const matchTag = !hardFilterTag || (h.tags||[]).some((t) => t.toLowerCase().includes(hardFilterTag.toLowerCase()));
    const matchTsol = !hardFilterTsol || (h.tech_solution_id||"") === hardFilterTsol;
    return matchQ && matchStatus && matchTag && matchTsol;
  });
  // ── ArchTemplates state ───────────────────────────────────────────
  const ARCH_TEMPLATES_API = "https://functions.poehali.dev/642afaea-b869-4493-9e87-b7d0e8d368fa";
  const [archTemplates, setArchTemplates] = useState<ArchTemplate[]>([]);
  const [archLoading, setArchLoading] = useState(false);
  const [archSectionDesc, setArchSectionDesc] = useState("Реестр типовых архитектур безопасности — шаблоны для проектирования защищённых систем");
  const [archSectionDescEditing, setArchSectionDescEditing] = useState(false);
  const [archSectionDescDraft, setArchSectionDescDraft] = useState(archSectionDesc);
  const [archDialogOpen, setArchDialogOpen] = useState(false);
  const [archSaving, setArchSaving] = useState(false);
  const [archSaveError, setArchSaveError] = useState("");
  const [deleteArchId, setDeleteArchId] = useState<string | null>(null);
  const [editingArch, setEditingArch] = useState<ArchTemplate | null>(null);
  const [viewArch, setViewArch] = useState<ArchTemplate | null>(null);
  const [archSearch, setArchSearch] = useState("");
  const [archFilterStatus, setArchFilterStatus] = useState<string>("Все");
  const [archFilterTag, setArchFilterTag] = useState<string>("");
  const [archFilterTsol, setArchFilterTsol] = useState<string>("");
  const [archFilterIb, setArchFilterIb] = useState<string>("Все");
  const [archFilterIt, setArchFilterIt] = useState<string>("Все");
  const [archTagInput, setArchTagInput] = useState("");
  const [archTsolSearch, setArchTsolSearch] = useState("");
  const [archActiveDiagramTab, setArchActiveDiagramTab] = useState(0);
  const [viewArchReqSearch, setViewArchReqSearch] = useState("");
  const [viewArchReqFilterLevel, setViewArchReqFilterLevel] = useState("Все");
  const [viewArchReqFilterCat, setViewArchReqFilterCat] = useState("Все");

  const makeEmptyArchForm = (count: number): ArchTemplate => ({
    id: `ArchSec-${String(count + 1).padStart(3, "0")}`,
    name: "",
    description: "",
    status: "В разработке",
    author: "",
    version: "1.0.0",
    tags: [],
    tech_solution_ids: [],
    approved_ib: false,
    approved_it: false,
    diagrams: [],
  });

  const [archForm, setArchForm] = useState<ArchTemplate>(makeEmptyArchForm(0));

  const loadArchTemplates = async () => {
    setArchLoading(true);
    try {
      const [res, tsolRes] = await Promise.all([
        fetch(ARCH_TEMPLATES_API),
        techSolutions.length === 0 ? fetch(TECH_SOLUTIONS_API) : Promise.resolve(null),
      ]);
      const data = await res.json();
      setArchTemplates(data.items || []);
      if (data.section_description) setArchSectionDesc(data.section_description);
      if (tsolRes) {
        const td = await tsolRes.json();
        setTechSolutions(td.items || []);
      }
    } finally {
      setArchLoading(false);
    }
  };

  const handleSaveArchSectionDesc = async () => {
    setArchSectionDesc(archSectionDescDraft);
    setArchSectionDescEditing(false);
    await fetch(`${ARCH_TEMPLATES_API}?mode=settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: archSectionDescDraft }),
    });
  };

  const openNewArch = () => {
    setEditingArch(null);
    setArchForm(makeEmptyArchForm(archTemplates.length));
    setArchTagInput(""); setArchSaveError(""); setArchTsolSearch("");
    if (techSolutions.length === 0) loadTechSolutions();
    setArchDialogOpen(true);
  };

  const openEditArch = (a: ArchTemplate) => {
    setEditingArch(a);
    setArchForm({ ...a, tags: a.tags || [], tech_solution_ids: a.tech_solution_ids || [], diagrams: a.diagrams || [] });
    setArchTagInput(""); setArchSaveError(""); setArchTsolSearch("");
    if (techSolutions.length === 0) loadTechSolutions();
    setArchDialogOpen(true);
  };

  const handleSaveArch = async () => {
    if (!archForm.name.trim() || !archForm.id.trim()) { setArchSaveError("Название и ID обязательны"); return; }
    setArchSaving(true); setArchSaveError("");
    try {
      const method = editingArch ? "PUT" : "POST";
      const res = await fetch(ARCH_TEMPLATES_API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(archForm),
      });
      const data = await res.json();
      if (data.error) { setArchSaveError(data.error); return; }
      if (editingArch) {
        setArchTemplates((prev) => prev.map((a) => a.id === editingArch.id ? data : a));
        if (viewArch?.id === editingArch.id) setViewArch(data);
      } else {
        setArchTemplates((prev) => [...prev, data]);
      }
      setArchDialogOpen(false);
    } finally {
      setArchSaving(false);
    }
  };

  const handleDeleteArch = async (id: string) => {
    await fetch(`${ARCH_TEMPLATES_API}?id=${id}`, { method: "DELETE" });
    setArchTemplates((prev) => prev.filter((a) => a.id !== id));
    setDeleteArchId(null);
  };

  const filteredArchTemplates = archTemplates.filter((a) => {
    const q = archSearch.toLowerCase();
    const matchQ = !q ||
      (a.id||"").toLowerCase().includes(q) ||
      (a.name||"").toLowerCase().includes(q) ||
      (a.description||"").toLowerCase().includes(q) ||
      (a.author||"").toLowerCase().includes(q) ||
      (a.tags||[]).some((t) => t.toLowerCase().includes(q)) ||
      (a.tech_solution_ids||[]).some((id) => id.toLowerCase().includes(q));
    const matchStatus = archFilterStatus === "Все" || a.status === archFilterStatus;
    const matchTag = !archFilterTag || (a.tags||[]).some((t) => t.toLowerCase().includes(archFilterTag.toLowerCase()));
    const matchTsol = !archFilterTsol || (a.tech_solution_ids||[]).includes(archFilterTsol);
    const matchIb = archFilterIb === "Все" || (archFilterIb === "Да" ? a.approved_ib : !a.approved_ib);
    const matchIt = archFilterIt === "Все" || (archFilterIt === "Да" ? a.approved_it : !a.approved_it);
    return matchQ && matchStatus && matchTag && matchTsol && matchIb && matchIt;
  });
  // ── Data IO state ─────────────────────────────────────────────────
  const [importResult, setImportResult] = useState<{ ok: string[]; errors: string[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [csvImportEntity, setCsvImportEntity] = useState<string>("tech_solutions");
  const [exportLoading, setExportLoading] = useState(false);

  const loadAllForExport = async () => {
    setExportLoading(true);
    try {
      await Promise.all([
        domains.length === 0 ? loadDomains() : Promise.resolve(),
        techDomains.length === 0 ? loadTechDomains() : Promise.resolve(),
        technologies.length === 0 ? loadTechnologies() : Promise.resolve(),
        reqs.length === 0 ? loadReqs() : Promise.resolve(),
        techSolutions.length === 0 ? loadTechSolutions() : Promise.resolve(),
        hardenings.length === 0 ? loadHardenings() : Promise.resolve(),
        archTemplates.length === 0 ? loadArchTemplates() : Promise.resolve(),
      ]);
    } finally {
      setExportLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────

  // ── Products state ────────────────────────────────────────────────
  const PRODUCTS_API = "https://functions.poehali.dev/83496f55-f31c-499a-8d22-618295a6da0f";
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodSectionDesc, setProdSectionDesc] = useState("Реестр бизнес-продуктов — привязка к типовым архитектурам безопасности и требованиям");
  const [prodSectionDescEditing, setProdSectionDescEditing] = useState(false);
  const [prodSectionDescDraft, setProdSectionDescDraft] = useState("");
  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [prodSaving, setProdSaving] = useState(false);
  const [prodSaveError, setProdSaveError] = useState("");
  const [deleteProdId, setDeleteProdId] = useState<string | null>(null);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [viewProd, setViewProd] = useState<Product | null>(null);
  const [prodSearch, setProdSearch] = useState("");
  const [prodFilterStatus, setProdFilterStatus] = useState<string>("Все");
  const [prodFilterTag, setProdFilterTag] = useState<string>("");
  const [prodFilterArch, setProdFilterArch] = useState<string>("");
  const [prodFilterIb, setProdFilterIb] = useState<string>("Все");
  const [prodFilterIt, setProdFilterIt] = useState<string>("Все");
  const [prodTagInput, setProdTagInput] = useState("");
  const [prodArchSearch, setProdArchSearch] = useState("");
  const [prodActiveDiagramTab, setProdActiveDiagramTab] = useState(0);
  const [viewProdReqSearch, setViewProdReqSearch] = useState("");
  const [viewProdReqFilterLevel, setViewProdReqFilterLevel] = useState("Все");
  const [viewProdReqFilterCat, setViewProdReqFilterCat] = useState("Все");
  const [prodImagePreview, setProdImagePreview] = useState<string>("");

  const makeEmptyProdForm = (count: number): Product => ({
    id: `BizProd-${String(count + 1).padStart(3, "0")}`,
    name: "", description: "", status: "В разработке",
    author: "", version: "1.0.0", cmdb_mnemonic: "",
    tags: [], arch_template_ids: [],
    approved_ib: false, approved_it: false,
    image_url: "", diagrams: [],
  });
  const [prodForm, setProdForm] = useState<Product>(makeEmptyProdForm(0));

  const loadProducts = async () => {
    setProdLoading(true);
    try {
      const [res, archRes] = await Promise.all([
        fetch(PRODUCTS_API),
        archTemplates.length === 0 ? fetch(ARCH_TEMPLATES_API) : Promise.resolve(null),
      ]);
      const data = await res.json();
      setProducts(data.items || []);
      if (data.section_description) setProdSectionDesc(data.section_description);
      if (archRes) { const d = await archRes.json(); setArchTemplates(d.items || []); }
    } finally { setProdLoading(false); }
  };

  const handleSaveProdSectionDesc = async () => {
    setProdSectionDesc(prodSectionDescDraft);
    setProdSectionDescEditing(false);
    await fetch(`${PRODUCTS_API}?mode=settings`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_description: prodSectionDescDraft }),
    });
  };

  const openNewProd = () => {
    setEditingProd(null);
    setProdForm(makeEmptyProdForm(products.length));
    setProdTagInput(""); setProdSaveError(""); setProdArchSearch(""); setProdImagePreview("");
    if (archTemplates.length === 0) loadArchTemplates();
    setProdDialogOpen(true);
  };

  const openEditProd = (p: Product) => {
    setEditingProd(p);
    setProdForm({ ...p, tags: p.tags||[], arch_template_ids: p.arch_template_ids||[], diagrams: p.diagrams||[] });
    setProdTagInput(""); setProdSaveError(""); setProdArchSearch(""); setProdImagePreview(p.image_url||"");
    if (archTemplates.length === 0) loadArchTemplates();
    setProdDialogOpen(true);
  };

  const handleSaveProd = async () => {
    if (!prodForm.name.trim() || !prodForm.id.trim()) { setProdSaveError("Название и ID обязательны"); return; }
    setProdSaving(true); setProdSaveError("");
    try {
      const method = editingProd ? "PUT" : "POST";
      const res = await fetch(PRODUCTS_API, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prodForm, image_url: prodImagePreview }),
      });
      const data = await res.json();
      if (data.error) { setProdSaveError(data.error); return; }
      if (editingProd) {
        setProducts((prev) => prev.map((p) => p.id === editingProd.id ? data : p));
        if (viewProd?.id === editingProd.id) setViewProd(data);
      } else {
        setProducts((prev) => [...prev, data]);
      }
      setProdDialogOpen(false);
    } finally { setProdSaving(false); }
  };

  const handleDeleteProd = async (id: string) => {
    await fetch(`${PRODUCTS_API}?id=${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteProdId(null);
  };

  const filteredProducts = products.filter((p) => {
    const q = prodSearch.toLowerCase();
    const matchQ = !q ||
      (p.id||"").toLowerCase().includes(q) ||
      (p.name||"").toLowerCase().includes(q) ||
      (p.description||"").toLowerCase().includes(q) ||
      (p.author||"").toLowerCase().includes(q) ||
      (p.cmdb_mnemonic||"").toLowerCase().includes(q) ||
      (p.tags||[]).some((t) => t.toLowerCase().includes(q)) ||
      (p.arch_template_ids||[]).some((id) => id.toLowerCase().includes(q));
    const matchStatus = prodFilterStatus === "Все" || p.status === prodFilterStatus;
    const matchTag = !prodFilterTag || (p.tags||[]).some((t) => t.toLowerCase().includes(prodFilterTag.toLowerCase()));
    const matchArch = !prodFilterArch || (p.arch_template_ids||[]).includes(prodFilterArch);
    const matchIb = prodFilterIb === "Все" || (prodFilterIb === "Да" ? p.approved_ib : !p.approved_ib);
    const matchIt = prodFilterIt === "Все" || (prodFilterIt === "Да" ? p.approved_it : !p.approved_it);
    return matchQ && matchStatus && matchTag && matchArch && matchIb && matchIt;
  });
  // ─────────────────────────────────────────────────────────────────

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
        {/* Top row: logo + db control */}
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveSection("data-io"); loadAllForExport(); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
              style={{
                background: activeSection === "data-io" ? "rgba(99,102,241,0.15)" : "rgba(15,22,41,0.8)",
                border: `1px solid ${activeSection === "data-io" ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: activeSection === "data-io" ? "#818cf8" : "rgba(180,200,230,0.6)",
              }}
            >
              <Icon name="ArrowLeftRight" size={13} />
              Экспорт / Импорт
            </button>
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

        {/* Bottom row: navigation */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center gap-1 overflow-x-auto">
              {[
                { key: "library",        label: "Библиотека потребителя", onClick: () => setActiveSection("library") },
                { key: "domains",        label: "Орг. домены",            onClick: () => setActiveSection("domains") },
                { key: "tech-domains",   label: "Тех. домены",            onClick: () => setActiveSection("tech-domains") },
                { key: "technologies",   label: "Технологии",             onClick: () => setActiveSection("technologies") },
                { key: "requirements",   label: "Требования",             onClick: () => { setActiveSection("requirements"); loadReqs(); } },
                { key: "tech-solutions", label: "Тех. решения",           onClick: () => { setActiveSection("tech-solutions"); loadTechSolutions(); } },
                { key: "hardening",      label: "Харденинг",              onClick: () => { setActiveSection("hardening"); loadHardenings(); } },
                { key: "arch-templates", label: "Типовые архитектуры",    onClick: () => { setActiveSection("arch-templates"); loadArchTemplates(); } },
                { key: "products",       label: "Продукты",               onClick: () => { setActiveSection("products"); loadProducts(); } },
                { key: "analytics",      label: "Аналитика",              onClick: () => setActiveSection("analytics") },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className="relative px-3 py-3 text-xs font-medium whitespace-nowrap transition-all shrink-0"
                  style={{
                    color: activeSection === item.key ? "white" : "rgba(180,200,230,0.5)",
                    borderBottom: activeSection === item.key ? "2px solid #3b82f6" : "2px solid transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
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

        {/* === TECH DOMAINS SECTION === */}
        {activeSection === "tech-domains" && (() => {
          if (techDomains.length === 0 && !techLoading) loadTechDomains();
          return (
          <div className="section-enter">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #8b5cf6, #0066ff)" }} />
                <h1 className="text-2xl font-semibold text-white">Технические домены</h1>
              </div>
              <div className="ml-4 mt-1 group flex items-start gap-2">
                {techSectionDescEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input autoFocus value={techSectionDescDraft}
                      onChange={(e) => setTechSectionDescDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveTechSectionDesc(); if (e.key === "Escape") setTechSectionDescEditing(false); }}
                      className="flex-1 text-sm px-3 py-1.5 rounded-lg outline-none font-sans"
                      style={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(139,92,246,0.4)", color: "rgba(210,225,245,0.9)" }}
                    />
                    <button onClick={handleSaveTechSectionDesc} className="p-1.5 rounded-lg" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}><Icon name="Check" size={14} /></button>
                    <button onClick={() => setTechSectionDescEditing(false)} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(180,200,230,0.4)" }}><Icon name="X" size={14} /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{techSectionDesc}</p>
                    <button onClick={() => { setTechSectionDescDraft(techSectionDesc); setTechSectionDescEditing(true); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0">
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
                <input type="text" placeholder="Поиск по ID, названию, владельцу..."
                  value={techSearch} onChange={(e) => setTechSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all font-sans"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(210,225,245,0.9)" }}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.5)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {DOMAIN_STATUSES.map((s) => {
                  const meta = DOMAIN_STATUS_META[s];
                  const cnt = techDomains.filter((d) => d.status === s).length;
                  return (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: meta.bg, color: meta.color }}>
                      {s}: {cnt}
                    </span>
                  );
                })}
              </div>
              <button onClick={openCreateTech} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #0066ff)", color: "white", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 16px rgba(139,92,246,0.2)" }}>
                <Icon name="Plus" size={15} />
                Создать домен
              </button>
            </div>

            {/* Cards */}
            {techLoading ? (
              <div className="glass-card rounded-xl py-20 text-center" style={{ color: "rgba(180,200,230,0.3)" }}>
                <Icon name="Loader" size={28} className="mx-auto mb-3 animate-spin opacity-50" />
                <p className="text-sm">Загрузка доменов...</p>
              </div>
            ) : filteredTechDomains.length === 0 ? (
              <div className="glass-card rounded-xl py-20 text-center" style={{ color: "rgba(180,200,230,0.3)" }}>
                <Icon name="SearchX" size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Технические домены не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredTechDomains.map((td) => {
                  const meta = DOMAIN_STATUS_META[td.status];
                  const linkedOrgs = techOrgRefs.filter((o) => td.org_domain_ids.includes(o.id));
                  return (
                    <div key={td.id}
                      className="glass-card rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all"
                      style={{ borderColor: viewTech?.id === td.id ? "rgba(139,92,246,0.45)" : undefined }}
                      onClick={() => setViewTech(td)}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(15,22,41,0.85)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.borderColor = viewTech?.id === td.id ? "rgba(139,92,246,0.45)" : ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      {/* Top */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                              {td.id}
                            </span>
                            <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>v{td.version}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white leading-snug">{td.name}</h3>
                        </div>
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium" style={{ background: meta.bg, color: meta.color }}>
                          <Icon name={meta.icon} size={11} />{td.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(180,200,230,0.55)" }}>
                        {td.description || "Описание не указано"}
                      </p>

                      {/* Org domains links */}
                      {linkedOrgs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {linkedOrgs.slice(0, 2).map((o) => (
                            <span key={o.id} className="text-[10px] px-2 py-0.5 rounded font-medium"
                              style={{ background: "rgba(0,102,255,0.1)", color: "#63b0ff", border: "1px solid rgba(0,102,255,0.15)" }}>
                              {o.name}
                            </span>
                          ))}
                          {linkedOrgs.length > 2 && (
                            <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: "rgba(180,200,230,0.35)" }}>
                              +{linkedOrgs.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {td.tags && td.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {td.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                              style={{ background: "rgba(139,92,246,0.1)", color: "rgba(167,139,250,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
                              #{tag}
                            </span>
                          ))}
                          {td.tags.length > 3 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>+{td.tags.length - 3}</span>}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center gap-1.5">
                          <Icon name="User" size={12} style={{ color: "rgba(180,200,230,0.35)" }} />
                          <span className="text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>{td.owner || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setViewTech(td)} className="p-1.5 rounded-lg transition-all hover:bg-purple-500/10" title="Подробнее">
                            <Icon name="Expand" size={13} style={{ color: "rgba(167,139,250,0.6)" }} />
                          </button>
                          <button onClick={() => openEditTech(td)} className="p-1.5 rounded-lg transition-all hover:bg-blue-500/10" title="Редактировать">
                            <Icon name="Pencil" size={13} style={{ color: "rgba(99,176,255,0.6)" }} />
                          </button>
                          <button onClick={() => setDeleteTechId(td.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10" title="Удалить">
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

        {/* === TECHNOLOGIES SECTION === */}
        {activeSection === "technologies" && (() => {
          if (technologies.length === 0 && !techsLoading) loadTechnologies();
          if (reqs.length === 0 && !reqsLoading) loadReqs();
          return (
          <div className="section-enter">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #10b981, #00d4ff)" }} />
                  <h1 className="text-2xl font-semibold text-white">Технологии</h1>
                </div>
                <button
                  onClick={openCreateTech2}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)", color: "white" }}
                >
                  <Icon name="Plus" size={16} />
                  Добавить технологию
                </button>
              </div>
              {techSectionDesc2Editing ? (
                <div className="flex items-center gap-2 ml-4">
                  <input
                    value={techSectionDesc2Draft}
                    onChange={(e) => setTechSectionDesc2Draft(e.target.value)}
                    className="flex-1 text-sm px-3 py-1.5 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(180,200,230,0.8)" }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveTechSectionDesc2(); if (e.key === "Escape") setTechSectionDesc2Editing(false); }}
                    autoFocus
                  />
                  <button onClick={handleSaveTechSectionDesc2} className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400"><Icon name="Check" size={14} /></button>
                  <button onClick={() => setTechSectionDesc2Editing(false)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Icon name="X" size={14} /></button>
                </div>
              ) : (
                <button className="flex items-center gap-1.5 ml-4 group" onClick={() => { setTechSectionDesc2Draft(techSectionDesc2); setTechSectionDesc2Editing(true); }}>
                  <p className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{techSectionDesc2}</p>
                  <Icon name="Pencil" size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "rgba(180,200,230,0.6)" }} />
                </button>
              )}
            </div>

            {/* Search + counter */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.4)" }} />
                <Input
                  value={techSearch2}
                  onChange={(e) => setTechSearch2(e.target.value)}
                  placeholder="Поиск по названию, ID, тегу..."
                  className="pl-9 text-sm"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                />
              </div>
              <span className="text-sm font-mono px-3 py-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#34d399" }}>
                {filteredTechnologies.length} / {technologies.length}
              </span>
            </div>

            {/* Loading */}
            {techsLoading && (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#10b981" }} />
              </div>
            )}

            {/* Empty */}
            {!techsLoading && technologies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <Icon name="Cpu" size={28} style={{ color: "#10b981" }} />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Технологии не добавлены</p>
                  <p className="text-sm" style={{ color: "rgba(180,200,230,0.5)" }}>Нажмите «Добавить технологию» чтобы начать</p>
                </div>
              </div>
            )}

            {/* Cards grid */}
            {!techsLoading && filteredTechnologies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTechnologies.map((tech) => {
                  const sm = TECH_STATUS_META[tech.status] || TECH_STATUS_META["В разработке"];
                  return (
                    <div
                      key={tech.id}
                      className="group glass-card rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-emerald-500/30 transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.06)" }}
                      onClick={() => setViewTech2(tech)}
                    >
                      {/* Card top */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                              {tech.id}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold text-sm truncate">{tech.name}</h3>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: sm.bg, color: sm.color }}>
                            <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={11} />
                            {tech.status}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {tech.description && (
                        <p className="text-xs line-clamp-2" style={{ color: "rgba(180,200,230,0.6)" }}>{tech.description}</p>
                      )}

                      {/* Versions */}
                      {tech.versions && tech.versions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tech.versions.slice(0,3).map((v) => (
                            <span key={v} className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.15)" }}>v{v}</span>
                          ))}
                          {tech.versions.length > 3 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>+{tech.versions.length - 3}</span>}
                        </div>
                      )}

                      {/* Tags */}
                      {tech.tags && tech.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tech.tags.slice(0,4).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>
                              {tag}
                            </span>
                          ))}
                          {tech.tags.length > 4 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>+{tech.tags.length - 4}</span>}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center gap-2">
                          {tech.tech_domain_ids && tech.tech_domain_ids.length > 0 && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                              <Icon name="Link2" size={10} />
                              {tech.tech_domain_ids.length} домен{tech.tech_domain_ids.length === 1 ? "" : tech.tech_domain_ids.length < 5 ? "а" : "ов"}
                            </span>
                          )}
                          {tech.attachments && tech.attachments.length > 0 && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                              <Icon name="Paperclip" size={10} />
                              {tech.attachments.length}
                            </span>
                          )}
                          {(() => {
                            const cnt = reqs.filter((r) => r.technology_id === tech.id).length;
                            return cnt > 0 ? (
                              <span className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                                <Icon name="FileCheck" size={10} />
                                {cnt} треб.
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditTech2(tech); }}
                            className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                            style={{ color: "rgba(180,200,230,0.5)" }}
                            title="Редактировать"
                          ><Icon name="Pencil" size={13} /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTechId2(tech.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                            style={{ color: "rgba(239,68,68,0.6)" }}
                            title="Удалить"
                          ><Icon name="Trash2" size={13} /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewTechFull(tech); setTechFullSearch(""); setTechFullSortField("id"); setTechFullSortDir("asc"); }}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-all"
                            style={{ color: "#34d399" }}
                            title="Полный просмотр"
                          ><Icon name="Maximize2" size={13} /></button>
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

        {/* === REQUIREMENTS SECTION === */}
        {activeSection === "requirements" && (
          <div className="section-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #f59e0b, #ef4444)" }} />
                  <h1 className="text-2xl font-semibold text-white">Требования безопасности</h1>
                </div>
                {reqSectionDescEditing ? (
                  <div className="flex items-center gap-2 ml-4">
                    <Input value={reqSectionDescDraft} onChange={(e) => setReqSectionDescDraft(e.target.value)} className="text-sm w-96" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <button onClick={handleSaveReqSectionDesc} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>Сохранить</button>
                    <button onClick={() => setReqSectionDescEditing(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Отмена</button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 ml-4 group" onClick={() => { setReqSectionDescDraft(reqSectionDesc); setReqSectionDescEditing(true); }}>
                    <p className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{reqSectionDesc}</p>
                    <Icon name="Pencil" size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "rgba(180,200,230,0.6)" }} />
                  </button>
                )}
              </div>
              <button onClick={openCreateReq} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", color: "white" }}>
                <Icon name="Plus" size={15} />
                Добавить требование
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Всего требований", value: reqs.length, icon: "FileCheck", color: "#f59e0b" },
                { label: "Критических", value: reqs.filter((r) => r.criticality === "Критический").length, icon: "AlertOctagon", color: "#ef4444" },
                { label: "Активных", value: reqs.filter((r) => r.status === "Активен").length, icon: "CheckCircle2", color: "#22c55e" },
                { label: "В разработке", value: reqs.filter((r) => r.status === "В разработке").length, icon: "Wrench", color: "#a78bfa" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}>
                    <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(180,200,230,0.5)" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-60 max-w-sm">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.4)" }} />
                <input type="text" placeholder="Поиск по ID, названию, тегам..." value={reqSearch} onChange={(e) => setReqSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(210,225,245,0.9)" }} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>Тип:</span>
                {["Все", ...REQ_TYPES].map((t) => (
                  <button key={t} onClick={() => setReqFilterType(t)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{ background: reqFilterType === t ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${reqFilterType === t ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, color: reqFilterType === t ? "#f59e0b" : "rgba(180,200,230,0.5)" }}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>Критичность:</span>
                {["Все", ...REQ_CRITICALITIES].map((c) => {
                  const meta = c !== "Все" ? REQ_CRITICALITY_META[c as ReqCriticality] : null;
                  return (
                    <button key={c} onClick={() => setReqFilterCrit(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: reqFilterCrit === c ? (meta ? meta.bg : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.03)", border: `1px solid ${reqFilterCrit === c ? (meta ? meta.color + "50" : "rgba(255,255,255,0.2)") : "rgba(255,255,255,0.08)"}`, color: reqFilterCrit === c ? (meta ? meta.color : "white") : "rgba(180,200,230,0.5)" }}>
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>Статус:</span>
                {["Все", ...REQ_STATUSES].map((s) => {
                  const meta = s !== "Все" ? REQ_STATUS_META[s as ReqStatus] : null;
                  return (
                    <button key={s} onClick={() => setReqFilterStatus(s)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: reqFilterStatus === s ? (meta ? meta.bg : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.03)", border: `1px solid ${reqFilterStatus === s ? (meta ? meta.color + "50" : "rgba(255,255,255,0.2)") : "rgba(255,255,255,0.08)"}`, color: reqFilterStatus === s ? (meta ? meta.color : "white") : "rgba(180,200,230,0.5)" }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loading */}
            {reqsLoading && (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#f59e0b" }} />
              </div>
            )}

            {/* Empty */}
            {!reqsLoading && filteredReqs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <Icon name="FileCheck" size={28} style={{ color: "rgba(245,158,11,0.5)" }} />
                </div>
                <p className="text-sm" style={{ color: "rgba(180,200,230,0.4)" }}>
                  {reqs.length === 0 ? "Нет требований. Нажмите «Добавить требование»" : "Ничего не найдено"}
                </p>
              </div>
            )}

            {/* Cards grid */}
            {!reqsLoading && filteredReqs.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredReqs.map((r) => {
                  const tm = REQ_TYPE_META[r.req_type] || REQ_TYPE_META["Техническое"];
                  const cm = REQ_CRITICALITY_META[r.criticality] || REQ_CRITICALITY_META["Средний"];
                  const sm = REQ_STATUS_META[r.status] || REQ_STATUS_META["В разработке"];
                  const tech = reqTechRefs.find((t) => t.id === r.technology_id);
                  const dom = reqTechDomainRefs.find((d) => d.id === r.tech_domain_id);
                  return (
                    <div key={r.id} onClick={() => setViewReq(r)}
                      className="glass-card rounded-xl p-5 cursor-pointer hover:border-amber-500/20 transition-all group"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded shrink-0" style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.15)" }}>{r.id}</span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium shrink-0" style={{ background: sm.bg, color: sm.color }}>
                            <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{r.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); openEditReq(r); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-all" style={{ color: "rgba(180,200,230,0.5)" }}><Icon name="Pencil" size={13} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteReqId(r.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all" style={{ color: "rgba(239,68,68,0.5)" }}><Icon name="Trash2" size={13} /></button>
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-semibold text-white mb-2 leading-snug line-clamp-2">{r.name}</h3>

                      {/* Type + Criticality */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium" style={{ background: tm.bg, color: tm.color }}>
                          <Icon name={tm.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{r.req_type}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium" style={{ background: cm.bg, color: cm.color }}>
                          <Icon name={cm.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{r.criticality}
                        </div>
                      </div>

                      {/* Description */}
                      {r.description && (
                        <p className="text-xs line-clamp-2 mb-3" style={{ color: "rgba(180,200,230,0.6)" }}>{r.description}</p>
                      )}

                      {/* Meta */}
                      <div className="space-y-1 mb-3">
                        {tech && (
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>
                            <Icon name="Cpu" size={11} style={{ color: "#34d399", flexShrink: 0 }} />
                            <span className="truncate">{tech.name}</span>
                          </div>
                        )}
                        {dom && (
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>
                            <Icon name="Layers" size={11} style={{ color: "#63b0ff", flexShrink: 0 }} />
                            <span className="truncate">{dom.name}</span>
                          </div>
                        )}
                        {r.norm_doc_link && (
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>
                            <Icon name="Link" size={11} style={{ color: "#a78bfa", flexShrink: 0 }} />
                            <span className="truncate">{r.norm_doc_link}</span>
                          </div>
                        )}
                      </div>

                      {/* Score + Version */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>Балл: <span className="text-white font-semibold">{r.score_value}</span></span>
                          <span className="text-[11px] font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>Вес: <span className="text-white font-semibold">{r.score_weight}</span></span>
                          <span className="text-[11px] font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>v{r.version}</span>
                        </div>
                        {r.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap justify-end">
                            {r.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>{tag}</span>
                            ))}
                            {r.tags.length > 2 && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "rgba(180,200,230,0.4)" }}>+{r.tags.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === TECH SOLUTIONS SECTION === */}
        {activeSection === "tech-solutions" && (
          <div className="section-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #a78bfa, #63b0ff)" }} />
                  <h1 className="text-2xl font-semibold text-white">Технические решения</h1>
                </div>
                {tsolSectionDescEditing ? (
                  <div className="flex items-center gap-2 ml-4">
                    <Input value={tsolSectionDescDraft} onChange={(e) => setTsolSectionDescDraft(e.target.value)} className="text-sm w-96" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <button onClick={handleSaveTsolSectionDesc} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>Сохранить</button>
                    <button onClick={() => setTsolSectionDescEditing(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Отмена</button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 ml-4 group" onClick={() => { setTsolSectionDescDraft(tsolSectionDesc); setTsolSectionDescEditing(true); }}>
                    <p className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{tsolSectionDesc}</p>
                    <Icon name="Pencil" size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "rgba(180,200,230,0.6)" }} />
                  </button>
                )}
              </div>
              <button onClick={openCreateTsol} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #a78bfa 0%, #63b0ff 100%)", color: "white" }}>
                <Icon name="Plus" size={15} />
                Добавить решение
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Всего решений", value: techSolutions.length, icon: "Lightbulb", color: "#a78bfa" },
                { label: "Активных", value: techSolutions.filter((s) => s.status === "Активен").length, icon: "CheckCircle2", color: "#22c55e" },
                { label: "В разработке", value: techSolutions.filter((s) => s.status === "В разработке").length, icon: "Wrench", color: "#f59e0b" },
                { label: "Согласовано ИБ+ИТ", value: techSolutions.filter((s) => s.approved_ib && s.approved_it).length, icon: "ShieldCheck", color: "#63b0ff" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}>
                    <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(180,200,230,0.5)" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-56">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={tsolSearch} onChange={(e) => setTsolSearch(e.target.value)} placeholder="Поиск по ID, названию, автору, тегам..." className="pl-9 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              </div>
              <select value={tsolFilterStatus} onChange={(e) => setTsolFilterStatus(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: tsolFilterStatus === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">Все статусы</option>
                {TECH_SOLUTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Input value={tsolFilterTag} onChange={(e) => setTsolFilterTag(e.target.value)} placeholder="Фильтр по тегу..." className="text-xs w-40 h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              {(tsolSearch || tsolFilterStatus !== "Все" || tsolFilterTag) && (
                <button onClick={() => { setTsolSearch(""); setTsolFilterStatus("Все"); setTsolFilterTag(""); }} className="text-xs px-3 py-2 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  Сбросить
                </button>
              )}
              <span className="text-xs ml-auto" style={{ color: "rgba(180,200,230,0.35)" }}>{filteredTsols.length} / {techSolutions.length}</span>
            </div>

            {/* Loading */}
            {tsolLoading && (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#a78bfa" }} />
              </div>
            )}

            {/* Empty */}
            {!tsolLoading && filteredTsols.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                  <Icon name="Lightbulb" size={28} style={{ color: "rgba(167,139,250,0.5)" }} />
                </div>
                <p className="text-sm" style={{ color: "rgba(180,200,230,0.4)" }}>
                  {techSolutions.length === 0 ? "Нет технических решений. Нажмите «Добавить решение»" : "Ничего не найдено"}
                </p>
              </div>
            )}

            {/* Cards */}
            {!tsolLoading && filteredTsols.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTsols.map((s) => {
                  const sm = TECH_SOLUTION_STATUS_META[s.status] ?? TECH_SOLUTION_STATUS_META["В разработке"];
                  return (
                    <div
                      key={s.id}
                      className="glass-card rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all"
                      onClick={() => setViewTsol(s)}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(15,22,41,0.85)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{s.id}</span>
                            <span className="font-mono text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>v{s.version}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white leading-snug">{s.name}</h3>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full shrink-0" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                          <Icon name={sm.icon} size={10} />
                          {s.status}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-xs line-clamp-2" style={{ color: "rgba(180,200,230,0.6)" }}>{s.description}</p>
                      )}
                      {s.tags && s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {s.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.7)", border: "1px solid rgba(99,176,255,0.15)" }}>#{tag}</span>
                          ))}
                          {s.tags.length > 4 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>+{s.tags.length - 4}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {s.approved_ib && (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                            <Icon name="ShieldCheck" size={9} /> ИБ
                          </span>
                        )}
                        {s.approved_it && (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                            <Icon name="Server" size={9} /> ИТ
                          </span>
                        )}
                        {s.technology_ids && s.technology_ids.length > 0 && (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                            <Icon name="Cpu" size={9} /> {s.technology_ids.length} тех.
                          </span>
                        )}
                        {s.related_solution_ids && s.related_solution_ids.length > 0 && (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                            <Icon name="Link2" size={9} /> {s.related_solution_ids.length} связ.
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <span className="text-xs truncate" style={{ color: "rgba(180,200,230,0.45)" }}>{s.author || "—"}</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setActiveSection("hardening"); setHardFilterTsol(s.id); loadHardenings(); }}
                            className="p-1.5 rounded-lg transition-all hover:bg-purple-500/10"
                            title="Харденинг этого решения"
                          >
                            <Icon name="ShieldHalf" size={13} style={{ color: "rgba(167,139,250,0.6)" }} />
                          </button>
                          <button
                            onClick={() => { setActiveSection("arch-templates"); setArchFilterTsol(s.id); loadArchTemplates(); }}
                            className="p-1.5 rounded-lg transition-all hover:bg-cyan-500/10"
                            title="Типовые архитектуры этого решения"
                          >
                            <Icon name="LayoutTemplate" size={13} style={{ color: "rgba(6,182,212,0.6)" }} />
                          </button>
                          <button onClick={() => setViewTsol(s)} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Просмотр">
                            <Icon name="Eye" size={13} style={{ color: "rgba(180,200,230,0.5)" }} />
                          </button>
                          <button onClick={() => openEditTsol(s)} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Редактировать">
                            <Icon name="Pencil" size={13} style={{ color: "rgba(180,200,230,0.5)" }} />
                          </button>
                          <button onClick={() => setDeleteTsolId(s.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10" title="Удалить">
                            <Icon name="Trash2" size={13} style={{ color: "rgba(248,113,113,0.5)" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === HARDENING SECTION === */}
        {activeSection === "hardening" && (
          <div className="section-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #ef4444, #f97316)" }} />
                  <h1 className="text-2xl font-semibold text-white">Харденинг технических решений</h1>
                </div>
                {hardSectionDescEditing ? (
                  <div className="flex items-center gap-2 ml-4">
                    <Input value={hardSectionDescDraft} onChange={(e) => setHardSectionDescDraft(e.target.value)} className="text-sm w-96" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <button onClick={handleSaveHardSectionDesc} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>Сохранить</button>
                    <button onClick={() => setHardSectionDescEditing(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Отмена</button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 ml-4 group" onClick={() => { setHardSectionDescDraft(hardSectionDesc); setHardSectionDescEditing(true); }}>
                    <span className="text-sm" style={{ color: "rgba(180,200,230,0.5)" }}>{hardSectionDesc}</span>
                    <Icon name="Pencil" size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "rgba(180,200,230,0.5)" }} />
                  </button>
                )}
              </div>
              <button onClick={openCreateHard} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}>
                <Icon name="Plus" size={15} /> Добавить харденинг
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Всего харденингов", value: hardenings.length, icon: "Shield", color: "#ef4444" },
                { label: "Активных", value: hardenings.filter((h) => h.status === "Активен").length, icon: "CheckCircle2", color: "#22c55e" },
                { label: "В разработке", value: hardenings.filter((h) => h.status === "В разработке").length, icon: "Wrench", color: "#f59e0b" },
                { label: "Согласовано ИБ+ИТ", value: hardenings.filter((h) => h.approved_ib && h.approved_it).length, icon: "ShieldCheck", color: "#63b0ff" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}>
                    <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(180,200,230,0.5)" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-56">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={hardSearch} onChange={(e) => setHardSearch(e.target.value)} placeholder="Поиск по ID, названию, автору, тегам, харденингу..." className="pl-9 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              </div>
              <select value={hardFilterStatus} onChange={(e) => setHardFilterStatus(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: hardFilterStatus === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">Все статусы</option>
                {HARDENING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Input value={hardFilterTag} onChange={(e) => setHardFilterTag(e.target.value)} placeholder="Фильтр по тегу..." className="text-xs w-40 h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              {hardFilterTsol && (
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}>
                  <Icon name="ShieldHalf" size={11} />
                  {hardFilterTsol}
                  <button onClick={() => setHardFilterTsol("")} className="ml-1 hover:opacity-70">
                    <Icon name="X" size={10} />
                  </button>
                </span>
              )}
              {(hardSearch || hardFilterStatus !== "Все" || hardFilterTag || hardFilterTsol) && (
                <button onClick={() => { setHardSearch(""); setHardFilterStatus("Все"); setHardFilterTag(""); setHardFilterTsol(""); }} className="text-xs px-3 py-2 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  Сбросить
                </button>
              )}
              <span className="text-xs ml-auto" style={{ color: "rgba(180,200,230,0.35)" }}>{filteredHardenings.length} / {hardenings.length}</span>
            </div>

            {/* Loading */}
            {hardLoading && (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#ef4444" }} />
              </div>
            )}

            {/* Empty */}
            {!hardLoading && filteredHardenings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <Icon name="ShieldOff" size={28} style={{ color: "rgba(239,68,68,0.4)" }} />
                </div>
                <p className="text-sm" style={{ color: "rgba(180,200,230,0.4)" }}>
                  {hardenings.length === 0 ? "Харденинги ещё не добавлены" : "Ничего не найдено по фильтрам"}
                </p>
                {hardenings.length === 0 && (
                  <button onClick={openCreateHard} className="text-xs px-4 py-2 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                    Добавить первый харденинг
                  </button>
                )}
              </div>
            )}

            {/* Cards */}
            {!hardLoading && filteredHardenings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredHardenings.map((h) => {
                  const sm = HARDENING_STATUS_META[h.status];
                  const linkedTsol = techSolutions.find((s) => s.id === h.tech_solution_id);
                  return (
                    <div key={h.id} className="glass-card rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-red-500/20 cursor-pointer group" style={{ borderColor: "rgba(255,255,255,0.06)" }} onClick={() => setViewHard(h)}>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>{h.id}</span>
                          <span className="text-xs font-mono" style={{ color: "rgba(180,200,230,0.35)" }}>v{h.version}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                          <Icon name={sm.icon} size={10} />
                          {h.status}
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1">{h.name || <span style={{ color: "rgba(180,200,230,0.3)" }}>Без названия</span>}</h3>
                        {linkedTsol && (
                          <p className="text-xs mt-0.5" style={{ color: "rgba(99,176,255,0.7)" }}>
                            <Icon name="Link2" size={10} className="inline mr-1" />{linkedTsol.name}
                          </p>
                        )}
                      </div>

                      {/* Hardening previews */}
                      <div className="space-y-1.5">
                        {h.deploy_hardening && (
                          <div className="px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.15)" }}>
                            <span style={{ color: "#fb923c" }}>Deploy: </span>
                            <span className="font-mono line-clamp-1" style={{ color: "rgba(210,225,245,0.6)" }}>{h.deploy_hardening.slice(0, 80)}</span>
                          </div>
                        )}
                        {h.functional_hardening && (
                          <div className="px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
                            <span style={{ color: "#f87171" }}>Func: </span>
                            <span className="font-mono line-clamp-1" style={{ color: "rgba(210,225,245,0.6)" }}>{h.functional_hardening.slice(0, 80)}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {h.tags && h.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {h.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>{tag}</span>
                          ))}
                          {h.tags.length > 4 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.3)" }}>+{h.tags.length - 4}</span>}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center gap-2">
                          {h.approved_ib && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>ИБ</span>}
                          {h.approved_it && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>ИТ</span>}
                          {h.author && <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>{h.author}</span>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => { e.stopPropagation(); openEditHard(h); }} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Редактировать">
                            <Icon name="Pencil" size={13} style={{ color: "rgba(180,200,230,0.5)" }} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteHardId(h.id); }} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10" title="Удалить">
                            <Icon name="Trash2" size={13} style={{ color: "#f87171" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === ARCH TEMPLATES SECTION === */}
        {activeSection === "arch-templates" && (
          <div className="section-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #06b6d4, #3b82f6)" }} />
                  <h1 className="text-2xl font-semibold text-white">Типовые архитектуры безопасности</h1>
                </div>
                {archSectionDescEditing ? (
                  <div className="flex items-center gap-2 ml-4">
                    <Input value={archSectionDescDraft} onChange={(e) => setArchSectionDescDraft(e.target.value)} className="text-sm w-96" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <button onClick={handleSaveArchSectionDesc} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>Сохранить</button>
                    <button onClick={() => setArchSectionDescEditing(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Отмена</button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 ml-4 group" onClick={() => { setArchSectionDescDraft(archSectionDesc); setArchSectionDescEditing(true); }}>
                    <span className="text-sm" style={{ color: "rgba(180,200,230,0.5)" }}>{archSectionDesc}</span>
                    <Icon name="Pencil" size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "rgba(180,200,230,0.5)" }} />
                  </button>
                )}
              </div>
              <button
                onClick={openNewArch}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee" }}
              >
                <Icon name="Plus" size={15} />
                Добавить шаблон
              </button>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-56">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={archSearch} onChange={(e) => setArchSearch(e.target.value)} placeholder="Поиск по ID, названию, автору, тегам, описанию..." className="pl-9 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              </div>
              <select value={archFilterStatus} onChange={(e) => setArchFilterStatus(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: archFilterStatus === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">Все статусы</option>
                {ARCH_TEMPLATE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Input value={archFilterTag} onChange={(e) => setArchFilterTag(e.target.value)} placeholder="Фильтр по тегу..." className="text-xs w-36 h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              <select value={archFilterIb} onChange={(e) => setArchFilterIb(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: archFilterIb === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">ИБ: все</option>
                <option value="Да">ИБ: согласован</option>
                <option value="Нет">ИБ: не согласован</option>
              </select>
              <select value={archFilterIt} onChange={(e) => setArchFilterIt(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: archFilterIt === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">ИТ: все</option>
                <option value="Да">ИТ: согласован</option>
                <option value="Нет">ИТ: не согласован</option>
              </select>
              {archFilterTsol && (
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#22d3ee" }}>
                  <Icon name="Link2" size={11} />
                  {archFilterTsol}
                  <button onClick={() => setArchFilterTsol("")} className="ml-1 hover:opacity-70"><Icon name="X" size={10} /></button>
                </span>
              )}
              {(archSearch || archFilterStatus !== "Все" || archFilterTag || archFilterTsol || archFilterIb !== "Все" || archFilterIt !== "Все") && (
                <button onClick={() => { setArchSearch(""); setArchFilterStatus("Все"); setArchFilterTag(""); setArchFilterTsol(""); setArchFilterIb("Все"); setArchFilterIt("Все"); }} className="text-xs px-3 py-2 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  Сбросить
                </button>
              )}
              <span className="text-xs ml-auto" style={{ color: "rgba(180,200,230,0.35)" }}>{filteredArchTemplates.length} / {archTemplates.length}</span>
            </div>

            {/* Loading */}
            {archLoading && (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#06b6d4" }} />
              </div>
            )}

            {/* Empty */}
            {!archLoading && filteredArchTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <Icon name="LayoutTemplate" size={28} style={{ color: "rgba(6,182,212,0.4)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "rgba(180,200,230,0.6)" }}>Шаблонов не найдено</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(180,200,230,0.3)" }}>Создайте первый шаблон типовой архитектуры безопасности</p>
                </div>
                <button onClick={openNewArch} className="text-xs px-4 py-2 rounded-lg" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#22d3ee" }}>
                  + Добавить шаблон
                </button>
              </div>
            )}

            {/* Cards grid */}
            {!archLoading && filteredArchTemplates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredArchTemplates.map((a) => {
                  const sm = ARCH_TEMPLATE_STATUS_META[a.status] ?? ARCH_TEMPLATE_STATUS_META["В разработке"];
                  const linkedTsols = techSolutions.filter((ts) => (a.tech_solution_ids||[]).includes(ts.id));
                  return (
                    <div
                      key={a.id}
                      className="glass-card rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all"
                      onClick={() => { setViewArch(a); setArchActiveDiagramTab(0); setViewArchReqSearch(""); setViewArchReqFilterLevel("Все"); setViewArchReqFilterCat("Все"); }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(15,22,41,0.85)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      {/* Top row: ID + status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}>{a.id}</span>
                            <span className="font-mono text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>v{a.version}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white leading-snug">{a.name}</h3>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full shrink-0" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                          <Icon name={sm.icon} size={10} />
                          {a.status}
                        </span>
                      </div>

                      {/* Description */}
                      {a.description && (
                        <p className="text-xs line-clamp-2" style={{ color: "rgba(180,200,230,0.6)" }}>{a.description}</p>
                      )}

                      {/* Linked tech solutions */}
                      {linkedTsols.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {linkedTsols.slice(0, 3).map((ts) => (
                            <span key={ts.id} className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ background: "rgba(167,139,250,0.08)", color: "rgba(167,139,250,0.7)", border: "1px solid rgba(167,139,250,0.15)" }}>
                              <Icon name="Link2" size={8} className="inline mr-1" />{ts.id}
                            </span>
                          ))}
                          {linkedTsols.length > 3 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>+{linkedTsols.length - 3}</span>}
                        </div>
                      )}

                      {/* Tags */}
                      {a.tags && a.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {a.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.7)", border: "1px solid rgba(99,176,255,0.15)" }}>#{tag}</span>
                          ))}
                          {a.tags.length > 4 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>+{a.tags.length - 4}</span>}
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.approved_ib && (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                            <Icon name="ShieldCheck" size={9} /> ИБ
                          </span>
                        )}
                        {a.approved_it && (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                            <Icon name="Server" size={9} /> ИТ
                          </span>
                        )}
                        {a.diagrams && a.diagrams.length > 0 && (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                            <Icon name="GitBranch" size={9} /> {a.diagrams.length} диагр.
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <span className="text-xs truncate" style={{ color: "rgba(180,200,230,0.45)" }}>{a.author || "—"}</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setActiveSection("products"); setProdFilterArch(a.id); loadProducts(); }}
                            className="p-1.5 rounded-lg transition-all hover:bg-amber-500/10"
                            title="Продукты этой архитектуры"
                          >
                            <Icon name="Package" size={13} style={{ color: "rgba(245,158,11,0.6)" }} />
                          </button>
                          <button onClick={() => { setViewArch(a); setArchActiveDiagramTab(0); }} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Просмотр">
                            <Icon name="Eye" size={13} style={{ color: "rgba(180,200,230,0.5)" }} />
                          </button>
                          <button onClick={() => openEditArch(a)} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Редактировать">
                            <Icon name="Pencil" size={13} style={{ color: "rgba(180,200,230,0.5)" }} />
                          </button>
                          <button onClick={() => setDeleteArchId(a.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10" title="Удалить">
                            <Icon name="Trash2" size={13} style={{ color: "rgba(248,113,113,0.5)" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === DATA IO SECTION === */}
        {activeSection === "data-io" && (() => {
          const entities: ExportEntity[] = [
            { key: "org_domains",     label: "Орг. домены",            data: domains as unknown as Record<string, unknown>[] },
            { key: "tech_domains",    label: "Тех. домены",            data: techDomains as unknown as Record<string, unknown>[] },
            { key: "technologies",    label: "Технологии",             data: technologies as unknown as Record<string, unknown>[] },
            { key: "requirements",    label: "Требования",             data: reqs as unknown as Record<string, unknown>[] },
            { key: "tech_solutions",  label: "Тех. решения",           data: techSolutions as unknown as Record<string, unknown>[] },
            { key: "hardenings",      label: "Харденинг",              data: hardenings as unknown as Record<string, unknown>[] },
            { key: "arch_templates",  label: "Типовые архитектуры",    data: archTemplates as unknown as Record<string, unknown>[] },
          ];

          const apiMap: Record<string, string> = {
            org_domains:    "https://functions.poehali.dev/4c8bda83-18c3-4fd9-bc7f-0764a3511177",
            tech_domains:   "https://functions.poehali.dev/e3873998-84e0-4b31-af68-5128ea37c246",
            technologies:   "https://functions.poehali.dev/e6d8d44f-ba31-4ab3-a776-b40bafbcf7e8",
            requirements:   "https://functions.poehali.dev/f955567c-3548-4631-a5b8-e590ad2c5177",
            tech_solutions: "https://functions.poehali.dev/99caeca9-833c-478d-b201-139ec6d861a2",
            hardenings:     "https://functions.poehali.dev/5c18ac6b-dfc4-444c-a0bf-7f9f6d9656cf",
            arch_templates: "https://functions.poehali.dev/642afaea-b869-4493-9e87-b7d0e8d368fa",
          };

          const importRows = async (entityKey: string, rows: Record<string, unknown>[], label: string, ok: string[], errors: string[]) => {
            const url = apiMap[entityKey];
            if (!url) { errors.push(`${label}: неизвестный тип`); return; }
            let imported = 0; let skipped = 0;
            for (const row of rows) {
              try {
                const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) });
                const data = await res.json();
                if (!data.error) imported++; else skipped++;
              } catch { skipped++; }
            }
            ok.push(`${label}: импортировано ${imported}${skipped > 0 ? `, пропущено ${skipped}` : ""} из ${rows.length}`);
          };

          const handleImportFile = async (file: File) => {
            setImportLoading(true);
            setImportResult(null);
            const ok: string[] = [];
            const errors: string[] = [];
            try {
              const text = await readFileAsText(file);
              const isJson = file.name.toLowerCase().endsWith(".json");
              if (isJson) {
                const bundle = parseJsonBundle(text);
                if (!bundle) { errors.push("Не удалось разобрать JSON файл"); }
                else {
                  for (const entity of entities) {
                    const rows = bundle[entity.key];
                    if (!rows || !Array.isArray(rows) || rows.length === 0) continue;
                    await importRows(entity.key, rows as Record<string, unknown>[], entity.label, ok, errors);
                  }
                  if (ok.length === 0 && errors.length === 0) errors.push("В файле не найдено ни одной известной сущности");
                }
              } else {
                // CSV — импорт в выбранную сущность
                const rows = parseCsv(text);
                if (rows.length === 0) { errors.push("CSV файл пуст или имеет неверный формат"); }
                else {
                  const entity = entities.find((e) => e.key === csvImportEntity);
                  if (!entity) { errors.push("Выберите тип данных для CSV-импорта"); }
                  else await importRows(entity.key, rows as Record<string, unknown>[], entity.label, ok, errors);
                }
              }
            } catch {
              errors.push("Ошибка чтения файла");
            } finally {
              setImportLoading(false);
              setImportResult({ ok, errors });
            }
          };

          const ts = new Date().toISOString().slice(0, 10);

          return (
            <div className="section-enter">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />
                    <h1 className="text-2xl font-semibold text-white">Экспорт и импорт данных</h1>
                  </div>
                  <p className="ml-4 text-sm" style={{ color: "rgba(180,200,230,0.5)" }}>Выгрузка и загрузка данных портала в форматах CSV и JSON</p>
                </div>
                <button
                  onClick={loadAllForExport}
                  disabled={exportLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
                >
                  {exportLoading
                    ? <><Icon name="Loader" size={13} className="animate-spin" /> Загрузка данных...</>
                    : <><Icon name="RefreshCw" size={13} /> Обновить данные</>}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── EXPORT ── */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
                      <Icon name="Download" size={17} style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Экспорт данных</h2>
                      <p className="text-xs" style={{ color: "rgba(180,200,230,0.45)" }}>Скачать данные раздела или весь портал</p>
                    </div>
                  </div>

                  {/* Full export */}
                  <div className="mb-5 p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <p className="text-xs font-medium text-white mb-3">Полный экспорт (все разделы)</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportAllJson(entities, `securearch-full-${ts}.json`)}
                        disabled={exportLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", color: "#818cf8" }}
                      >
                        {exportLoading
                          ? <><Icon name="Loader" size={14} className="animate-spin" /> Загрузка...</>
                          : <><Icon name="FileJson" size={14} /> JSON — всё</>}
                      </button>
                    </div>
                  </div>

                  {/* Per-entity export */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium mb-3" style={{ color: "rgba(180,200,230,0.5)" }}>Экспорт по разделам</p>
                    {entities.map((entity) => (
                      <div key={entity.key} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-2.5">
                          <Icon name="Database" size={13} style={{ color: "rgba(180,200,230,0.4)" }} />
                          <span className="text-xs text-white">{entity.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.06)", color: exportLoading ? "rgba(180,200,230,0.25)" : entity.data.length > 0 ? "rgba(52,211,153,0.7)" : "rgba(180,200,230,0.4)" }}>
                            {exportLoading ? "…" : `${entity.data.length} записей`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => exportJson(entity.data, `${entity.key}-${ts}.json`)}
                            disabled={entity.data.length === 0 || exportLoading}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30"
                            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
                          >
                            <Icon name="FileJson" size={11} /> JSON
                          </button>
                          <button
                            onClick={() => exportCsv(entity.data, `${entity.key}-${ts}.csv`)}
                            disabled={entity.data.length === 0 || exportLoading}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30"
                            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
                          >
                            <Icon name="FileSpreadsheet" size={11} /> CSV
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── IMPORT ── */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                      <Icon name="Upload" size={17} style={{ color: "#34d399" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Импорт данных</h2>
                      <p className="text-xs" style={{ color: "rgba(180,200,230,0.45)" }}>Загрузить JSON-бандл для восстановления или переноса данных</p>
                    </div>
                  </div>

                  {/* CSV entity selector */}
                  <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[11px] font-medium mb-2" style={{ color: "rgba(180,200,230,0.5)" }}>Тип данных для CSV-импорта</p>
                    <select
                      value={csvImportEntity}
                      onChange={(e) => setCsvImportEntity(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                      style={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    >
                      {entities.map((e) => (
                        <option key={e.key} value={e.key}>{e.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] mt-1.5" style={{ color: "rgba(180,200,230,0.3)" }}>
                      Выбор применяется только при загрузке .csv файла. JSON-бандл определяет тип автоматически.
                    </p>
                  </div>

                  {/* Drop zone */}
                  <label
                    className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-all"
                    style={{ border: "2px dashed rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.04)", minHeight: 140, padding: "24px" }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImportFile(f); }}
                  >
                    <input type="file" accept=".json,.csv" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }} />
                    {importLoading ? (
                      <>
                        <Icon name="Loader" size={28} className="animate-spin" style={{ color: "#34d399" }} />
                        <p className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>Импортирование...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <Icon name="FolderUp" size={22} style={{ color: "#34d399" }} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">Перетащите файл или нажмите для выбора</p>
                          <p className="text-xs mt-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                            <span className="font-mono" style={{ color: "#818cf8" }}>.json</span> — полный бандл &nbsp;·&nbsp; <span className="font-mono" style={{ color: "#34d399" }}>.csv</span> — выбранный раздел
                          </p>
                        </div>
                      </>
                    )}
                  </label>

                  {/* Import result */}
                  {importResult && (
                    <div className="mt-4 space-y-2">
                      {importResult.ok.map((msg, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                          <Icon name="CheckCircle2" size={13} /> {msg}
                        </div>
                      ))}
                      {importResult.errors.map((msg, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                          <Icon name="AlertTriangle" size={13} /> {msg}
                        </div>
                      ))}
                      <button onClick={() => setImportResult(null)} className="text-xs mt-1" style={{ color: "rgba(180,200,230,0.4)" }}>Очистить</button>
                    </div>
                  )}

                  {/* Info */}
                  <div className="mt-4 p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon name="Info" size={12} style={{ color: "rgba(180,200,230,0.4)" }} />
                      <p className="text-[11px] font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Правила импорта</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>.json</span>
                      <p className="text-[11px]" style={{ color: "rgba(180,200,230,0.35)" }}>Полный бандл с ключами: <span className="font-mono" style={{ color: "rgba(180,200,230,0.5)" }}>org_domains, tech_domains, technologies, requirements, tech_solutions, hardenings, arch_templates</span>. Тип определяется автоматически.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }}>.csv</span>
                      <p className="text-[11px]" style={{ color: "rgba(180,200,230,0.35)" }}>Первая строка — заголовки (совпадают с полями сущности). Тип данных выбирается в селекторе выше. Вложенные объекты (diagrams, attachments) в CSV не поддерживаются.</p>
                    </div>
                    <p className="text-[11px] pt-1 border-t" style={{ color: "rgba(180,200,230,0.3)", borderColor: "rgba(255,255,255,0.05)" }}>Записи с уже существующим ID пропускаются без перезаписи.</p>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* === PRODUCTS SECTION === */}
        {activeSection === "products" && (
          <div className="section-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #f59e0b, #ef4444)" }} />
                  <h1 className="text-2xl font-semibold text-white">Продукты</h1>
                </div>
                {prodSectionDescEditing ? (
                  <div className="flex items-center gap-2 ml-4">
                    <Input value={prodSectionDescDraft} onChange={(e) => setProdSectionDescDraft(e.target.value)} className="text-sm w-96" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <button onClick={handleSaveProdSectionDesc} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>Сохранить</button>
                    <button onClick={() => setProdSectionDescEditing(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Отмена</button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 ml-4 group" onClick={() => { setProdSectionDescDraft(prodSectionDesc); setProdSectionDescEditing(true); }}>
                    <span className="text-sm" style={{ color: "rgba(180,200,230,0.5)" }}>{prodSectionDesc}</span>
                    <Icon name="Pencil" size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "rgba(180,200,230,0.5)" }} />
                  </button>
                )}
              </div>
              <button onClick={openNewProd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                <Icon name="Plus" size={15} /> Добавить продукт
              </button>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-56">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="Поиск по ID, названию, автору, CMDB, тегам..." className="pl-9 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              </div>
              <select value={prodFilterStatus} onChange={(e) => setProdFilterStatus(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: prodFilterStatus === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">Все статусы</option>
                {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Input value={prodFilterTag} onChange={(e) => setProdFilterTag(e.target.value)} placeholder="Фильтр по тегу..." className="text-xs w-36 h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              <select value={prodFilterIb} onChange={(e) => setProdFilterIb(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: prodFilterIb === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">ИБ: все</option>
                <option value="Да">ИБ: согласован</option>
                <option value="Нет">ИБ: не согласован</option>
              </select>
              <select value={prodFilterIt} onChange={(e) => setProdFilterIt(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none h-10" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: prodFilterIt === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                <option value="Все">ИТ: все</option>
                <option value="Да">ИТ: согласован</option>
                <option value="Нет">ИТ: не согласован</option>
              </select>
              {prodFilterArch && (
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
                  <Icon name="LayoutTemplate" size={11} />{prodFilterArch}
                  <button onClick={() => setProdFilterArch("")} className="ml-1 hover:opacity-70"><Icon name="X" size={10} /></button>
                </span>
              )}
              {(prodSearch || prodFilterStatus !== "Все" || prodFilterTag || prodFilterArch || prodFilterIb !== "Все" || prodFilterIt !== "Все") && (
                <button onClick={() => { setProdSearch(""); setProdFilterStatus("Все"); setProdFilterTag(""); setProdFilterArch(""); setProdFilterIb("Все"); setProdFilterIt("Все"); }} className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>Сбросить</button>
              )}
              <span className="text-xs ml-auto" style={{ color: "rgba(180,200,230,0.35)" }}>{filteredProducts.length} / {products.length}</span>
            </div>

            {/* Loading */}
            {prodLoading && (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#f59e0b" }} />
              </div>
            )}

            {/* Empty */}
            {!prodLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Icon name="Package" size={28} style={{ color: "rgba(245,158,11,0.4)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "rgba(180,200,230,0.6)" }}>Продуктов не найдено</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(180,200,230,0.3)" }}>Создайте первый бизнес-продукт</p>
                </div>
                <button onClick={openNewProd} className="text-xs px-4 py-2 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>+ Добавить продукт</button>
              </div>
            )}

            {/* Cards grid */}
            {!prodLoading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const sm = PRODUCT_STATUS_META[p.status] ?? PRODUCT_STATUS_META["В разработке"];
                  const linkedArchs = archTemplates.filter((a) => (p.arch_template_ids||[]).includes(a.id));
                  return (
                    <div
                      key={p.id}
                      className="glass-card rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all"
                      onClick={() => { setViewProd(p); setProdActiveDiagramTab(0); setViewProdReqSearch(""); setViewProdReqFilterLevel("Все"); setViewProdReqFilterCat("Все"); }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      {/* Image */}
                      {p.image_url ? (
                        <div className="h-32 overflow-hidden shrink-0">
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 shrink-0 flex items-center justify-center" style={{ background: "rgba(245,158,11,0.05)", borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
                          <Icon name="Package" size={28} style={{ color: "rgba(245,158,11,0.2)" }} />
                        </div>
                      )}

                      <div className="p-5 flex flex-col gap-3 flex-1">
                        {/* ID + status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>{p.id}</span>
                              <span className="font-mono text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>v{p.version}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-white leading-snug">{p.name}</h3>
                            {p.cmdb_mnemonic && <p className="text-[10px] mt-0.5 font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>CMDB: {p.cmdb_mnemonic}</p>}
                          </div>
                          <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full shrink-0" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                            <Icon name={sm.icon} size={10} />{p.status}
                          </span>
                        </div>

                        {/* Description */}
                        {p.description && <p className="text-xs line-clamp-2" style={{ color: "rgba(180,200,230,0.6)" }}>{p.description}</p>}

                        {/* Linked archs */}
                        {linkedArchs.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {linkedArchs.slice(0, 2).map((a) => (
                              <span key={a.id} className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ background: "rgba(6,182,212,0.08)", color: "rgba(6,182,212,0.7)", border: "1px solid rgba(6,182,212,0.15)" }}>
                                <Icon name="LayoutTemplate" size={8} className="inline mr-1" />{a.id}
                              </span>
                            ))}
                            {linkedArchs.length > 2 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>+{linkedArchs.length - 2}</span>}
                          </div>
                        )}

                        {/* Tags */}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.7)", border: "1px solid rgba(99,176,255,0.15)" }}>#{tag}</span>
                            ))}
                            {p.tags.length > 3 && <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>+{p.tags.length - 3}</span>}
                          </div>
                        )}

                        {/* Approvals + diagrams */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.approved_ib && <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}><Icon name="ShieldCheck" size={9} /> ИБ</span>}
                          {p.approved_it && <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}><Icon name="Server" size={9} /> ИТ</span>}
                          {p.diagrams && p.diagrams.length > 0 && <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}><Icon name="GitBranch" size={9} /> {p.diagrams.length} диагр.</span>}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <span className="text-xs truncate" style={{ color: "rgba(180,200,230,0.45)" }}>{p.author || "—"}</span>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setViewProd(p); setProdActiveDiagramTab(0); }} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Просмотр"><Icon name="Eye" size={13} style={{ color: "rgba(180,200,230,0.5)" }} /></button>
                            <button onClick={() => openEditProd(p)} className="p-1.5 rounded-lg transition-all hover:bg-white/5" title="Редактировать"><Icon name="Pencil" size={13} style={{ color: "rgba(180,200,230,0.5)" }} /></button>
                            <button onClick={() => setDeleteProdId(p.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10" title="Удалить"><Icon name="Trash2" size={13} style={{ color: "rgba(248,113,113,0.5)" }} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Tech Solution Create/Edit Dialog ── */}
      <Dialog open={tsolDialogOpen} onOpenChange={(o) => { if (!o) setTsolDialogOpen(false); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 z-10" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
                <Icon name="Lightbulb" size={15} style={{ color: "#a78bfa" }} />
              </div>
              {editingTsol ? "Редактировать решение" : "Новое техническое решение"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            {/* ID + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID решения *</Label>
                <Input value={tsolForm.id} onChange={(e) => setTsolForm((f) => ({ ...f, id: e.target.value }))} className="font-mono text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input value={tsolForm.version} onChange={(e) => setTsolForm((f) => ({ ...f, version: e.target.value }))} className="font-mono text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название *</Label>
              <Input value={tsolForm.name} onChange={(e) => setTsolForm((f) => ({ ...f, name: e.target.value }))} placeholder="Название технического решения" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание</Label>
              <textarea
                value={tsolForm.description}
                onChange={(e) => setTsolForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                placeholder="Описание технического решения..."
              />
            </div>
            {/* Status + Author */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <select value={tsolForm.status} onChange={(e) => setTsolForm((f) => ({ ...f, status: e.target.value as TechSolutionStatus }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                  {TECH_SOLUTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Автор</Label>
                <Input value={tsolForm.author} onChange={(e) => setTsolForm((f) => ({ ...f, author: e.target.value }))} placeholder="Имя автора" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>
            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги</Label>
              <div className="flex gap-2">
                <Input value={tsolTagInput} onChange={(e) => setTsolTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTsolTag(tsolTagInput); } }} placeholder="Введите тег и нажмите Enter" className="text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                <button type="button" onClick={() => addTsolTag(tsolTagInput)} className="px-3 rounded-lg text-sm" style={{ background: "rgba(99,176,255,0.1)", border: "1px solid rgba(99,176,255,0.2)", color: "#63b0ff" }}>+</button>
              </div>
              {tsolForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tsolForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.8)", border: "1px solid rgba(99,176,255,0.15)" }}>
                      #{tag}
                      <button type="button" onClick={() => setTsolForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} style={{ color: "rgba(99,176,255,0.5)" }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Technologies */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>
                Технологии
                {tsolForm.technology_ids.length > 0 && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(99,176,255,0.12)", color: "#63b0ff" }}>{tsolForm.technology_ids.length}</span>}
              </Label>
              <div className="relative">
                <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={tsolTechSearch} onChange={(e) => setTsolTechSearch(e.target.value)} placeholder="Поиск технологий..." className="pl-7 text-xs" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              </div>
              <div className="rounded-lg overflow-hidden max-h-40 overflow-y-auto space-y-px" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {technologies.filter((t) => !tsolTechSearch || t.name.toLowerCase().includes(tsolTechSearch.toLowerCase()) || t.id.toLowerCase().includes(tsolTechSearch.toLowerCase())).map((t) => {
                  const linked = tsolForm.technology_ids.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => setTsolForm((f) => ({ ...f, technology_ids: linked ? f.technology_ids.filter((x) => x !== t.id) : [...f.technology_ids, t.id] }))} className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-white/5" style={{ background: linked ? "rgba(99,176,255,0.06)" : "transparent" }}>
                      <div className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0" style={{ background: linked ? "rgba(99,176,255,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${linked ? "rgba(99,176,255,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                        {linked && <Icon name="Check" size={9} style={{ color: "#63b0ff" }} />}
                      </div>
                      <span className="text-xs flex-1 truncate" style={{ color: linked ? "rgba(210,225,245,0.95)" : "rgba(210,225,245,0.7)" }}>{t.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: "rgba(180,200,230,0.35)" }}>{t.id}</span>
                    </button>
                  );
                })}
                {technologies.length === 0 && <div className="px-3 py-3 text-center text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>Нет технологий</div>}
              </div>
            </div>
            {/* Related solutions */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>
                Связанные решения
                {tsolForm.related_solution_ids.length > 0 && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>{tsolForm.related_solution_ids.length}</span>}
              </Label>
              <div className="relative">
                <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={tsolRelSearch} onChange={(e) => setTsolRelSearch(e.target.value)} placeholder="Поиск решений..." className="pl-7 text-xs" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
              </div>
              <div className="rounded-lg overflow-hidden max-h-40 overflow-y-auto space-y-px" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {techSolutions.filter((s) => s.id !== tsolForm.id && (!tsolRelSearch || s.name.toLowerCase().includes(tsolRelSearch.toLowerCase()) || s.id.toLowerCase().includes(tsolRelSearch.toLowerCase()))).map((s) => {
                  const linked = tsolForm.related_solution_ids.includes(s.id);
                  const sm = TECH_SOLUTION_STATUS_META[s.status] ?? TECH_SOLUTION_STATUS_META["В разработке"];
                  return (
                    <button key={s.id} type="button" onClick={() => setTsolForm((f) => ({ ...f, related_solution_ids: linked ? f.related_solution_ids.filter((x) => x !== s.id) : [...f.related_solution_ids, s.id] }))} className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-white/5" style={{ background: linked ? "rgba(167,139,250,0.06)" : "transparent" }}>
                      <div className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0" style={{ background: linked ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${linked ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                        {linked && <Icon name="Check" size={9} style={{ color: "#a78bfa" }} />}
                      </div>
                      <span className="text-xs flex-1 truncate" style={{ color: linked ? "rgba(210,225,245,0.95)" : "rgba(210,225,245,0.7)" }}>{s.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: sm.bg, color: sm.color }}>{s.status}</span>
                    </button>
                  );
                })}
                {techSolutions.filter((s) => s.id !== tsolForm.id).length === 0 && <div className="px-3 py-3 text-center text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>Нет других решений</div>}
              </div>
            </div>
            {tsolSaveError && <p className="text-xs" style={{ color: "#f87171" }}>{tsolSaveError}</p>}
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setTsolDialogOpen(false)} style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}>Отмена</Button>
            <Button className="flex-1 font-medium" onClick={handleSaveTsol} disabled={tsolSaving} style={{ background: "linear-gradient(135deg, #a78bfa 0%, #63b0ff 100%)", color: "white" }}>
              {tsolSaving ? <><Icon name="Loader" size={14} className="animate-spin mr-2" />Сохранение...</> : editingTsol ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Tech Solution Delete Confirm ── */}
      <Dialog open={!!deleteTsolId} onOpenChange={(o) => { if (!o) setDeleteTsolId(null); }}>
        <DialogContent className="sm:max-w-sm border" style={{ background: "#0d1528", borderColor: "rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} style={{ color: "#f87171" }} />
              Удалить решение?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm px-6 pb-2" style={{ color: "rgba(180,200,230,0.6)" }}>
            Это действие необратимо. Решение <span className="font-mono text-white">{deleteTsolId}</span> будет удалено.
          </p>
          <div className="flex gap-3 px-6 pb-6">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTsolId(null)} style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}>Отмена</Button>
            <Button className="flex-1" onClick={() => deleteTsolId && handleDeleteTsol(deleteTsolId)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Tech Solution Full View Sheet ── */}
      <Sheet open={!!viewTsol} onOpenChange={(o) => { if (!o) setViewTsol(null); }}>
        <SheetContent side="right" className="p-0 border-l flex flex-col" style={{ background: "#080f1e", borderColor: "rgba(255,255,255,0.08)", width: "min(860px, 95vw)", maxWidth: "none" }}>
          {viewTsol && (() => {
            const sm = TECH_SOLUTION_STATUS_META[viewTsol.status];
            const linkedTechs = technologies.filter((t) => (viewTsol.technology_ids || []).includes(t.id));
            const relatedSolutions = techSolutions.filter((s) => (viewTsol.related_solution_ids || []).includes(s.id));
            const linkedTechIds = linkedTechs.map((t) => t.id);
            const linkedReqs = reqs.filter((r) => linkedTechIds.includes(r.technology_id));
            return (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{viewTsol.id}</span>
                        <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>v{viewTsol.version}</span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                          <Icon name={sm.icon} size={11} />{viewTsol.status}
                        </span>
                      </div>
                      <SheetTitle className="text-xl font-semibold text-white leading-snug">{viewTsol.name}</SheetTitle>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setViewTsol(null); openEditTsol(viewTsol); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}>
                        <Icon name="Pencil" size={12} /> Редактировать
                      </button>
                      <button onClick={() => { setDeleteTsolId(viewTsol.id); setViewTsol(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                        <Icon name="Trash2" size={12} /> Удалить
                      </button>
                    </div>
                  </div>
                </SheetHeader>
                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      { label: "Автор", value: viewTsol.author || "—" },
                      { label: "Технический домен", value: viewTsol.tech_domain || "—" },
                      { label: "Дата создания", value: viewTsol.created_at ? new Date(viewTsol.created_at).toLocaleDateString("ru-RU") : "—" },
                      { label: "Дата редактирования", value: viewTsol.updated_at ? new Date(viewTsol.updated_at).toLocaleDateString("ru-RU") : "—" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>{item.label}</div>
                        <div className="text-sm" style={{ color: "rgba(210,225,245,0.85)" }}>{item.value}</div>
                      </div>
                    ))}
                    {/* Согласование */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Согласован с ИБ</div>
                      <span className={`flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded ${viewTsol.approved_ib ? "" : ""}`} style={{ background: viewTsol.approved_ib ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)", color: viewTsol.approved_ib ? "#22c55e" : "#6b7280", border: `1px solid ${viewTsol.approved_ib ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.2)"}` }}>
                        <Icon name={viewTsol.approved_ib ? "ShieldCheck" : "ShieldOff"} size={11} />
                        {viewTsol.approved_ib ? "Согласован" : "Не согласован"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Согласован с ИТ</div>
                      <span className="flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded" style={{ background: viewTsol.approved_it ? "rgba(99,176,255,0.1)" : "rgba(107,114,128,0.1)", color: viewTsol.approved_it ? "#63b0ff" : "#6b7280", border: `1px solid ${viewTsol.approved_it ? "rgba(99,176,255,0.25)" : "rgba(107,114,128,0.2)"}` }}>
                        <Icon name={viewTsol.approved_it ? "Server" : "ServerOff"} size={11} />
                        {viewTsol.approved_it ? "Согласован" : "Не согласован"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {viewTsol.description && (
                    <div>
                      <div className="text-xs font-medium mb-2" style={{ color: "rgba(180,200,230,0.5)" }}>Описание</div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.75)" }}>{viewTsol.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {viewTsol.tags && viewTsol.tags.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-2" style={{ color: "rgba(180,200,230,0.5)" }}>Теги</div>
                      <div className="flex flex-wrap gap-1.5">
                        {viewTsol.tags.map((tag) => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.7)", border: "1px solid rgba(99,176,255,0.15)" }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments / Mermaid */}
                  {viewTsol.attachments && viewTsol.attachments.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-3" style={{ color: "rgba(180,200,230,0.5)" }}>Приложения и схемы</div>
                      <div className="space-y-2">
                        {viewTsol.attachments.map((att) => (
                          <div key={att.id}>
                            {att.type === "mermaid" ? (
                              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                  <span className="text-xs font-medium text-white">{att.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(99,176,255,0.1)", color: "#63b0ff" }}>mermaid</span>
                                </div>
                                <div className="p-4">
                                  <MermaidViewer content={att.content} />
                                </div>
                              </div>
                            ) : att.type === "link" ? (
                              <a href={att.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                <Icon name="Link" size={14} style={{ color: "#63b0ff" }} />
                                <span className="text-sm text-white">{att.name}</span>
                                <span className="text-xs ml-auto truncate max-w-xs" style={{ color: "rgba(99,176,255,0.6)" }}>{att.content}</span>
                              </a>
                            ) : (
                              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                <Icon name="Paperclip" size={14} style={{ color: "rgba(180,200,230,0.5)" }} />
                                <span className="text-sm text-white">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add attachments in view */}
                  <div>
                    <div className="text-xs font-medium mb-3" style={{ color: "rgba(180,200,230,0.5)" }}>Добавить схему / ссылку</div>
                    <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex gap-2">
                        {(["link", "mermaid", "file"] as AttachmentType[]).map((tab) => (
                          <button key={tab} type="button" onClick={() => { setTsolAttachTab(tab); setTsolAttachDraft({ type: tab, name: "", content: "" }); }} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ background: tsolAttachTab === tab ? "rgba(99,176,255,0.12)" : "rgba(255,255,255,0.04)", color: tsolAttachTab === tab ? "#63b0ff" : "rgba(180,200,230,0.5)", border: `1px solid ${tsolAttachTab === tab ? "rgba(99,176,255,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                            {tab === "link" ? "Ссылка" : tab === "mermaid" ? "Mermaid" : "Файл"}
                          </button>
                        ))}
                      </div>
                      <Input value={tsolAttachDraft.name} onChange={(e) => setTsolAttachDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Название" className="text-xs" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
                      {tsolAttachTab === "mermaid" ? (
                        <textarea value={tsolAttachDraft.content} onChange={(e) => setTsolAttachDraft((d) => ({ ...d, content: e.target.value }))} rows={4} className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none font-mono" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} placeholder="graph TD&#10;  A --> B" />
                      ) : (
                        <Input value={tsolAttachDraft.content} onChange={(e) => setTsolAttachDraft((d) => ({ ...d, content: e.target.value }))} placeholder={tsolAttachTab === "link" ? "https://..." : "Содержимое"} className="text-xs" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
                      )}
                      <button type="button" onClick={() => { addTsolAttachment(); setViewTsol((prev) => prev ? { ...prev, attachments: [...(prev.attachments||[]), { id: `att-${Date.now()}`, ...tsolAttachDraft }] } : prev); }} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(99,176,255,0.1)", border: "1px solid rgba(99,176,255,0.2)", color: "#63b0ff" }}>
                        Добавить
                      </button>
                    </div>
                  </div>

                  {/* Linked Technologies */}
                  <div>
                    <div className="text-xs font-medium mb-3" style={{ color: "rgba(180,200,230,0.5)" }}>Связанные технологии ({linkedTechs.length})</div>
                    {linkedTechs.length === 0 ? (
                      <p className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Технологии не привязаны</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {linkedTechs.map((t) => {
                          const tsm = TECH_SOLUTION_STATUS_META[t.status as TechSolutionStatus] ?? TECH_SOLUTION_STATUS_META["В разработке"];
                          return (
                            <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <Icon name="Cpu" size={12} style={{ color: "#63b0ff" }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-white truncate">{t.name}</div>
                                <div className="text-[10px] font-mono" style={{ color: "rgba(180,200,230,0.35)" }}>{t.id}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Related Solutions */}
                  {relatedSolutions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-3" style={{ color: "rgba(180,200,230,0.5)" }}>Связанные решения ({relatedSolutions.length})</div>
                      <div className="space-y-2">
                        {relatedSolutions.map((rs) => {
                          const rsm = TECH_SOLUTION_STATUS_META[rs.status] ?? TECH_SOLUTION_STATUS_META["В разработке"];
                          return (
                            <button key={rs.id} type="button" onClick={() => setViewTsol(rs)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white/5" style={{ background: "rgba(167,139,250,0.03)", border: "1px solid rgba(167,139,250,0.12)" }}>
                              <Icon name="Lightbulb" size={13} style={{ color: "#a78bfa" }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-white truncate">{rs.name}</div>
                                <div className="text-[10px] font-mono" style={{ color: "rgba(180,200,230,0.35)" }}>{rs.id}</div>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: rsm.bg, color: rsm.color }}>{rs.status}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Requirements from linked technologies */}
                  <div>
                    <div className="text-xs font-medium mb-3" style={{ color: "rgba(180,200,230,0.5)" }}>Требования из связанных технологий ({linkedReqs.length})</div>
                    {linkedReqs.length === 0 ? (
                      <p className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Требования не найдены</p>
                    ) : (
                      <div className="space-y-2">
                        {linkedReqs.map((r) => {
                          const rsm = REQ_STATUS_META[r.status] || REQ_STATUS_META["В разработке"];
                          const rcm = REQ_CRITICALITY_META[r.criticality] || REQ_CRITICALITY_META["Средний"];
                          return (
                            <div key={r.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <Icon name="FileCheck" size={12} className="mt-0.5 shrink-0" style={{ color: "rgba(245,158,11,0.6)" }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-white truncate">{r.name}</div>
                                <div className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(180,200,230,0.35)" }}>{r.id}</div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: rsm.bg, color: rsm.color }}>{r.status}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: rcm.bg, color: rcm.color }}>{r.criticality}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Requirement Create/Edit Dialog ── */}
      <Dialog open={reqDialogOpen} onOpenChange={(o) => { if (!o) setReqDialogOpen(false); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 z-10" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Icon name="FileCheck" size={15} style={{ color: "#f59e0b" }} />
              </div>
              {editingReq ? "Редактировать требование" : "Добавить требование"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5">
            {/* ID */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID требования</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#f59e0b" }}>
                <Icon name="Hash" size={13} style={{ color: "rgba(245,158,11,0.4)" }} />
                {reqForm.id}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название требования *</Label>
              <Input value={reqForm.name} onChange={(e) => setReqForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Например: Многофакторная аутентификация для привилегированных пользователей"
                className="text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            </div>

            {/* Technology + Tech Domain */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Технология</Label>
                <select value={reqForm.technology_id} onChange={(e) => setReqForm((f) => ({ ...f, technology_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: reqForm.technology_id ? "white" : "rgba(180,200,230,0.4)" }}>
                  <option value="">— не выбрано —</option>
                  {reqTechRefs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Технический домен</Label>
                <select value={reqForm.tech_domain_id} onChange={(e) => setReqForm((f) => ({ ...f, tech_domain_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: reqForm.tech_domain_id ? "white" : "rgba(180,200,230,0.4)" }}>
                  <option value="">— не выбрано —</option>
                  {reqTechDomainRefs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание требования</Label>
              <textarea value={reqForm.description} onChange={(e) => setReqForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Подробное описание требования, его цель и область применения..."
                className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            </div>

            {/* Type + Criticality + Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Тип требования</Label>
                <div className="flex flex-col gap-1.5">
                  {REQ_TYPES.map((t) => {
                    const m = REQ_TYPE_META[t]; const active = reqForm.req_type === t;
                    return <button key={t} onClick={() => setReqForm((f) => ({ ...f, req_type: t }))} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{t}
                    </button>;
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Критичность</Label>
                <div className="flex flex-col gap-1.5">
                  {REQ_CRITICALITIES.map((c) => {
                    const m = REQ_CRITICALITY_META[c]; const active = reqForm.criticality === c;
                    return <button key={c} onClick={() => setReqForm((f) => ({ ...f, criticality: c }))} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{c}
                    </button>;
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <div className="flex flex-col gap-1.5">
                  {REQ_STATUSES.map((s) => {
                    const m = REQ_STATUS_META[s]; const active = reqForm.status === s;
                    return <button key={s} onClick={() => setReqForm((f) => ({ ...f, status: s }))} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{s}
                    </button>;
                  })}
                </div>
              </div>
            </div>

            {/* Control metric + description */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Метрика контроля</Label>
                <Input value={reqForm.control_metric} onChange={(e) => setReqForm((f) => ({ ...f, control_metric: e.target.value }))}
                  placeholder="Например: % систем с MFA" className="text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание способа контроля</Label>
                <Input value={reqForm.control_description} onChange={(e) => setReqForm((f) => ({ ...f, control_description: e.target.value }))}
                  placeholder="Как проверяется выполнение..." className="text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Version + Norm doc link */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input value={reqForm.version} onChange={(e) => setReqForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="1.0.0" className="text-sm font-mono"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Ссылка на нормативный документ</Label>
                <Input value={reqForm.norm_doc_link} onChange={(e) => setReqForm((f) => ({ ...f, norm_doc_link: e.target.value }))}
                  placeholder="ГОСТ Р 57580, ISO 27001..." className="text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Environments */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Среда применения</Label>
              <div className="flex gap-2 flex-wrap">
                {REQ_ENVS.map((env) => {
                  const active = reqForm.environments.includes(env);
                  return <button key={env} onClick={() => toggleReqEnv(env)} className="px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all" style={{ background: active ? "rgba(99,176,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(99,176,255,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#63b0ff" : "rgba(180,200,230,0.5)" }}>
                    {active && <Icon name="Check" size={11} className="inline mr-1" />}{env}
                  </button>;
                })}
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Стадия применения</Label>
              <div className="flex gap-2 flex-wrap">
                {REQ_STAGES.map((s) => {
                  const active = reqForm.stages.includes(s);
                  return <button key={s} onClick={() => toggleReqStage(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#a78bfa" : "rgba(180,200,230,0.5)" }}>
                    {active && <Icon name="Check" size={11} className="inline mr-1" />}{s}
                  </button>;
                })}
              </div>
            </div>

            {/* Procurement */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Закупки</Label>
              <textarea value={reqForm.procurement} onChange={(e) => setReqForm((f) => ({ ...f, procurement: e.target.value }))}
                rows={2} placeholder="Требования к закупаемым компонентам, сертификаты, стандарты..."
                className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            </div>

            {/* Interactions */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Взаимодействие</Label>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {([
                  { key: "ext_with_iod" as const, label: "Внешнее с ИОД" },
                  { key: "ext_without_iod" as const, label: "Внешнее без ИОД" },
                  { key: "int_with_iod" as const, label: "Внутреннее с ИОД" },
                  { key: "int_without_iod" as const, label: "Внутреннее без ИОД" },
                ] as { key: "ext_with_iod" | "ext_without_iod" | "int_with_iod" | "int_without_iod"; label: string }[]).map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <span className="text-[11px]" style={{ color: "rgba(180,200,230,0.5)" }}>{label}</span>
                    <div className="flex gap-1 flex-wrap">
                      {REQ_INTERACTIONS.map((v) => {
                        const m = REQ_INTERACTION_META[v]; const active = reqForm[key] === v;
                        return <button key={v} onClick={() => setReqForm((f) => ({ ...f, [key]: v }))} className="px-2 py-1 rounded-md text-[11px] font-medium transition-all" style={{ background: active ? `${m.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "40" : "rgba(255,255,255,0.06)"}`, color: active ? m.color : "rgba(180,200,230,0.4)" }}>{v}</button>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Скор.Балл (1–4)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((v) => (
                    <button key={v} onClick={() => setReqForm((f) => ({ ...f, score_value: v }))}
                      className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                      style={{ background: reqForm.score_value === v ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${reqForm.score_value === v ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, color: reqForm.score_value === v ? "#f59e0b" : "rgba(180,200,230,0.4)" }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Скор.Вес (1–10)</Label>
                <div className="flex gap-1 flex-wrap">
                  {[1,2,3,4,5,6,7,8,9,10].map((v) => (
                    <button key={v} onClick={() => setReqForm((f) => ({ ...f, score_weight: v }))}
                      className="flex-1 min-w-[2rem] py-2 rounded-lg text-sm font-bold transition-all"
                      style={{ background: reqForm.score_weight === v ? "rgba(99,176,255,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${reqForm.score_weight === v ? "rgba(99,176,255,0.4)" : "rgba(255,255,255,0.08)"}`, color: reqForm.score_weight === v ? "#63b0ff" : "rgba(180,200,230,0.4)" }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги</Label>
              <div className="flex gap-2">
                <Input value={reqTagInput} onChange={(e) => setReqTagInput(e.target.value)}
                  placeholder="mfa, authn, gost..." className="text-sm flex-1"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addReqTag(reqTagInput); } }} />
                <button onClick={() => addReqTag(reqTagInput)} className="px-3 rounded-lg text-xs font-medium" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }}>
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              {reqForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {reqForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>
                      {tag}
                      <button onClick={() => setReqForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} className="hover:text-red-400 transition-colors"><Icon name="X" size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {reqSaveError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Icon name="AlertTriangle" size={14} style={{ color: "#ef4444" }} />
                <span className="text-xs" style={{ color: "#ef4444" }}>{reqSaveError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 text-sm" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }} onClick={() => setReqDialogOpen(false)}>
                Отмена
              </Button>
              <button onClick={handleSaveReq} disabled={reqSaving || !reqForm.name.trim()}
                className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all"
                style={{ background: reqSaving || !reqForm.name.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", color: reqSaving || !reqForm.name.trim() ? "rgba(180,200,230,0.3)" : "white", cursor: reqSaving || !reqForm.name.trim() ? "not-allowed" : "pointer" }}>
                {reqSaving && <Icon name="Loader" size={14} className="animate-spin" />}
                {editingReq ? "Сохранить изменения" : "Добавить требование"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Requirement Detail Sheet ── */}
      <Sheet open={!!viewReq} onOpenChange={(o) => { if (!o) setViewReq(null); }}>
        <SheetContent side="right" className="w-[580px] sm:w-[580px] p-0 border-l overflow-y-auto" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)" }}>
          {viewReq && (() => {
            const tm = REQ_TYPE_META[viewReq.req_type] || REQ_TYPE_META["Техническое"];
            const cm = REQ_CRITICALITY_META[viewReq.criticality] || REQ_CRITICALITY_META["Средний"];
            const sm = REQ_STATUS_META[viewReq.status] || REQ_STATUS_META["В разработке"];
            const tech = reqTechRefs.find((t) => t.id === viewReq.technology_id);
            const dom = reqTechDomainRefs.find((d) => d.id === viewReq.tech_domain_id);
            return (
              <>
                <SheetHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded mb-2" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <Icon name="Hash" size={11} />{viewReq.id}
                      </span>
                      <SheetTitle className="text-white text-lg font-semibold leading-snug">{viewReq.name}</SheetTitle>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: sm.bg, color: sm.color }}>
                        <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{viewReq.status}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: cm.bg, color: cm.color }}>
                        <Icon name={cm.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{viewReq.criticality}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: tm.bg, color: tm.color }}>
                      <Icon name={tm.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{viewReq.req_type}
                    </div>
                    <span className="text-xs font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>v{viewReq.version}</span>
                  </div>
                </SheetHeader>

                <div className="px-6 py-5 space-y-5">
                  {viewReq.description && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Описание</p>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.8)" }}>{viewReq.description}</p>
                    </div>
                  )}

                  {(tech || dom) && (
                    <div className="grid grid-cols-2 gap-3">
                      {tech && (
                        <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
                          <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#34d399" }}>Технология</p>
                          <p className="text-sm text-white">{tech.name}</p>
                        </div>
                      )}
                      {dom && (
                        <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(99,176,255,0.05)", border: "1px solid rgba(99,176,255,0.15)" }}>
                          <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#63b0ff" }}>Тех. домен</p>
                          <p className="text-sm text-white">{dom.name}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {(viewReq.control_metric || viewReq.control_description) && (
                    <div className="p-3 rounded-lg space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Контроль</p>
                      {viewReq.control_metric && <div><span className="text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Метрика: </span><span className="text-sm text-white">{viewReq.control_metric}</span></div>}
                      {viewReq.control_description && <div><span className="text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>Способ: </span><span className="text-sm" style={{ color: "rgba(210,225,245,0.8)" }}>{viewReq.control_description}</span></div>}
                    </div>
                  )}

                  {viewReq.norm_doc_link && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Нормативный документ</p>
                      <span className="text-sm px-3 py-1.5 rounded-lg inline-block" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{viewReq.norm_doc_link}</span>
                    </div>
                  )}

                  {viewReq.environments.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Среда применения</p>
                      <div className="flex flex-wrap gap-2">
                        {viewReq.environments.map((e) => <span key={e} className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>{e}</span>)}
                      </div>
                    </div>
                  )}

                  {viewReq.stages.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Стадия применения</p>
                      <div className="flex flex-wrap gap-2">
                        {viewReq.stages.map((s) => <span key={s} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{s}</span>)}
                      </div>
                    </div>
                  )}

                  {viewReq.procurement && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Закупки</p>
                      <p className="text-sm" style={{ color: "rgba(210,225,245,0.8)" }}>{viewReq.procurement}</p>
                    </div>
                  )}

                  {/* Interactions table */}
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Взаимодействие</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: "ext_with_iod" as const, label: "Внешнее с ИОД" },
                        { key: "ext_without_iod" as const, label: "Внешнее без ИОД" },
                        { key: "int_with_iod" as const, label: "Внутреннее с ИОД" },
                        { key: "int_without_iod" as const, label: "Внутреннее без ИОД" },
                      ] as { key: "ext_with_iod" | "ext_without_iod" | "int_with_iod" | "int_without_iod"; label: string }[]).map(({ key, label }) => {
                        const val = viewReq[key];
                        const m = REQ_INTERACTION_META[val];
                        return (
                          <div key={key} className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <p className="text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>{label}</p>
                            <p className="text-sm font-medium mt-0.5" style={{ color: m.color }}>{val}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex gap-4">
                    <div className="flex-1 px-4 py-3 rounded-xl text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#f59e0b" }}>Скор.Балл</p>
                      <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{viewReq.score_value}</p>
                    </div>
                    <div className="flex-1 px-4 py-3 rounded-xl text-center" style={{ background: "rgba(99,176,255,0.08)", border: "1px solid rgba(99,176,255,0.2)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#63b0ff" }}>Скор.Вес</p>
                      <p className="text-2xl font-bold" style={{ color: "#63b0ff" }}>{viewReq.score_weight}</p>
                    </div>
                    <div className="flex-1 px-4 py-3 rounded-xl text-center" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#a78bfa" }}>Итог</p>
                      <p className="text-2xl font-bold" style={{ color: "#a78bfa" }}>{viewReq.score_value * viewReq.score_weight}</p>
                    </div>
                  </div>

                  {viewReq.tags.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Теги</p>
                      <div className="flex flex-wrap gap-2">
                        {viewReq.tags.map((tag) => <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{tag}</span>)}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button onClick={() => { setViewReq(null); openEditReq(viewReq); }} className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
                      <Icon name="Pencil" size={14} /> Редактировать
                    </button>
                    <button onClick={() => { setViewReq(null); setDeleteReqId(viewReq.id); }} className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Requirement Delete Confirm ── */}
      <Dialog open={!!deleteReqId} onOpenChange={(o) => { if (!o) setDeleteReqId(null); }}>
        <DialogContent className="max-w-sm border" style={{ background: "#0b1628", borderColor: "rgba(239,68,68,0.2)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} style={{ color: "#ef4444" }} />
              Удалить требование?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "rgba(180,200,230,0.7)" }}>
            Требование <span className="font-mono text-white">{deleteReqId}</span> будет удалено без возможности восстановления.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }} onClick={() => setDeleteReqId(null)}>Отмена</Button>
            <button onClick={() => handleDeleteReq(deleteReqId!)} className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
              <Icon name="Trash2" size={14} /> Удалить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Technology Create/Edit Dialog ── */}
      <Dialog open={techDialogOpen2} onOpenChange={(o) => { if (!o) setTechDialogOpen2(false); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <Icon name="Cpu" size={15} style={{ color: "#10b981" }} />
              </div>
              {editingTech2 ? "Редактировать технологию" : "Добавить технологию"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5">
            {/* ID */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID технологии</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#34d399" }}>
                <Icon name="Hash" size={13} style={{ color: "rgba(52,211,153,0.4)" }} />
                {techForm2.id}
              </div>
            </div>

            {/* Name + Library */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название *</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={techForm2.name}
                    onChange={(e) => { setTechForm2((f) => ({ ...f, name: e.target.value })); setTechNameError2(validateTechName2(e.target.value)); }}
                    placeholder="Например: JWT, OAuth 2.0, RBAC..."
                    className="text-sm"
                    style={{ background: "rgba(15,22,41,0.8)", border: `1px solid ${techNameError2 ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, color: "white" }}
                  />
                  {techNameError2 && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{techNameError2}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => { setTechLibrarySearch(""); setTechLibraryOpen(true); }}
                  title="Библиотека технологий"
                  className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all hover:opacity-80"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
                >
                  <Icon name="BookOpen" size={14} />
                  Библиотека
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
              <div className="flex flex-wrap gap-2">
                {TECH_STATUSES.map((s) => {
                  const sm = TECH_STATUS_META[s];
                  const active = techForm2.status === s;
                  return (
                    <button key={s} onClick={() => setTechForm2((f) => ({ ...f, status: s }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: active ? sm.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? sm.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? sm.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание</Label>
              <textarea
                value={techForm2.description}
                onChange={(e) => setTechForm2((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Краткое описание технологии и её роли в архитектуре ИБ..."
                className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>

            {/* Versions */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версии</Label>
              <div className="flex gap-2">
                <Input
                  value={techVersionInput}
                  onChange={(e) => setTechVersionInput(e.target.value)}
                  placeholder="2.0.0"
                  className="text-sm font-mono"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVersion(techVersionInput); } }}
                />
                <button onClick={() => addVersion(techVersionInput)} className="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80" style={{ background: "rgba(99,176,255,0.1)", border: "1px solid rgba(99,176,255,0.2)", color: "#63b0ff" }}>
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              {techForm2.versions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {techForm2.versions.map((v) => (
                    <span key={v} className="flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.15)" }}>
                      v{v}
                      <button onClick={() => setTechForm2((f) => ({ ...f, versions: f.versions.filter((x) => x !== v) }))} className="hover:text-red-400 transition-colors"><Icon name="X" size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tech Domain binding */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Технические домены</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg max-h-32 overflow-y-auto" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {techDomainRefs.length === 0 && <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>Нет доменов</span>}
                {techDomainRefs.map((d) => {
                  const sel = techForm2.tech_domain_ids.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => toggleTechDomainRef(d.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: sel ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`, color: sel ? "#34d399" : "rgba(180,200,230,0.5)" }}>
                      {sel && <Icon name="Check" size={11} />}
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги</Label>
              <div className="flex gap-2">
                <Input
                  value={techTagInput2}
                  onChange={(e) => setTechTagInput2(e.target.value)}
                  placeholder="authn, encryption, token..."
                  className="text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTechTag2(techTagInput2); } if (e.key === ",") { e.preventDefault(); addTechTag2(techTagInput2); } }}
                />
                <button onClick={() => addTechTag2(techTagInput2)} className="px-3 rounded-lg text-xs font-medium" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }}>
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              {techForm2.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {techForm2.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>
                      {tag}
                      <button onClick={() => setTechForm2((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} className="hover:text-red-400 transition-colors"><Icon name="X" size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Requirements */}
            {(() => {
              const q = techReqSearch.toLowerCase();
              const filtered = reqs
                .filter((r) => {
                  const matchQ = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
                  const matchStatus = techReqStatusFilter === "Все" || r.status === techReqStatusFilter;
                  return matchQ && matchStatus;
                })
                .sort((a, b) => {
                  const aLinked = techFormLinkedReqIds.has(a.id) ? 0 : 1;
                  const bLinked = techFormLinkedReqIds.has(b.id) ? 0 : 1;
                  return aLinked - bLinked || a.name.localeCompare(b.name);
                });
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>
                      Связанные требования
                      {techFormLinkedReqIds.size > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(99,176,255,0.12)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                          {techFormLinkedReqIds.size}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                      <Input
                        value={techReqSearch}
                        onChange={(e) => setTechReqSearch(e.target.value)}
                        placeholder="Поиск по требованиям..."
                        className="pl-7 text-xs"
                        style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                      />
                    </div>
                    <select
                      value={techReqStatusFilter}
                      onChange={(e) => setTechReqStatusFilter(e.target.value as ReqStatus | "Все")}
                      className="text-xs rounded-lg px-2 outline-none"
                      style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: techReqStatusFilter === "Все" ? "rgba(180,200,230,0.5)" : REQ_STATUS_META[techReqStatusFilter as ReqStatus]?.color || "white" }}
                    >
                      <option value="Все">Все статусы</option>
                      {REQ_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg overflow-hidden max-h-52 overflow-y-auto space-y-px" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    {filtered.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>
                        {reqs.length === 0 ? "Нет доступных требований" : "Ничего не найдено"}
                      </div>
                    )}
                    {filtered.map((r) => {
                      const linked = techFormLinkedReqIds.has(r.id);
                      const otherTech = !linked && r.technology_id && r.technology_id !== techForm2.id;
                      const sm = REQ_STATUS_META[r.status] || REQ_STATUS_META["В разработке"];
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setTechFormLinkedReqIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(r.id)) next.delete(r.id);
                              else next.add(r.id);
                              return next;
                            });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-white/5"
                          style={{ background: linked ? "rgba(99,176,255,0.06)" : "transparent" }}
                        >
                          <div className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-all" style={{ background: linked ? "rgba(99,176,255,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${linked ? "rgba(99,176,255,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                            {linked && <Icon name="Check" size={9} style={{ color: "#63b0ff" }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs block truncate" style={{ color: linked ? "rgba(210,225,245,0.95)" : "rgba(210,225,245,0.7)" }}>{r.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono" style={{ color: "rgba(180,200,230,0.35)" }}>{r.id}</span>
                              {otherTech && (
                                <span className="text-[10px]" style={{ color: "rgba(245,158,11,0.6)" }}>• другая технология</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>{r.status}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(180,200,230,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>{r.criticality}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Вложения</Label>
              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {(["link","mermaid","file"] as AttachmentType[]).map((t) => (
                  <button key={t} onClick={() => { setAttachmentTab(t); setAttachDraft({ type:t, name:"", content:"" }); }}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                    style={{ background: attachmentTab === t ? "rgba(255,255,255,0.08)" : "transparent", color: attachmentTab === t ? "white" : "rgba(180,200,230,0.4)" }}>
                    {t === "link" ? "Ссылка" : t === "mermaid" ? "Mermaid" : "Файл"}
                  </button>
                ))}
              </div>
              <div className="space-y-2 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Input
                  value={attachDraft.name}
                  onChange={(e) => setAttachDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder={attachmentTab === "link" ? "Название ссылки" : attachmentTab === "mermaid" ? "Название схемы" : "Имя файла"}
                  className="text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
                {attachmentTab === "mermaid" ? (
                  <textarea
                    value={attachDraft.content}
                    onChange={(e) => setAttachDraft((d) => ({ ...d, content: e.target.value }))}
                    rows={4}
                    placeholder={"graph TD\n  A[Client] --> B[Auth Server]\n  B --> C[Resource]"}
                    className="w-full px-3 py-2 rounded-lg text-sm font-mono resize-none outline-none"
                    style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#a5f3fc" }}
                  />
                ) : (
                  <Input
                    value={attachDraft.content}
                    onChange={(e) => setAttachDraft((d) => ({ ...d, content: e.target.value }))}
                    placeholder={attachmentTab === "link" ? "https://..." : "base64 или путь к файлу"}
                    className="text-sm"
                    style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                )}
                <button
                  onClick={addAttachment}
                  disabled={!attachDraft.name.trim() || !attachDraft.content.trim()}
                  className="w-full py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: attachDraft.name.trim() && attachDraft.content.trim() ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(16,185,129,0.2)", color: attachDraft.name.trim() && attachDraft.content.trim() ? "#34d399" : "rgba(180,200,230,0.2)" }}>
                  Добавить вложение
                </button>
              </div>

              {/* Existing attachments */}
              {techForm2.attachments.length > 0 && (
                <div className="space-y-1.5">
                  {techForm2.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name={att.type === "link" ? "ExternalLink" : att.type === "mermaid" ? "GitBranch" : "FileText"} size={13} style={{ color: att.type === "link" ? "#63b0ff" : att.type === "mermaid" ? "#a78bfa" : "#f59e0b", flexShrink: 0 }} />
                        <span className="text-xs truncate" style={{ color: "rgba(210,225,245,0.8)" }}>{att.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(180,200,230,0.4)" }}>{att.type}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setViewAttachment(att)} className="p-1 rounded hover:bg-white/5 transition-all" style={{ color: "rgba(180,200,230,0.5)" }}><Icon name="Eye" size={12} /></button>
                        <button onClick={() => removeAttachment(att.id)} className="p-1 rounded hover:bg-red-500/10 transition-all" style={{ color: "rgba(239,68,68,0.5)" }}><Icon name="Trash2" size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {techSaveError2 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Icon name="AlertTriangle" size={14} style={{ color: "#ef4444" }} />
                <span className="text-xs" style={{ color: "#ef4444" }}>{techSaveError2}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 text-sm" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }} onClick={() => setTechDialogOpen2(false)}>
                Отмена
              </Button>
              <button
                onClick={handleSaveTech2}
                disabled={techSaving2 || !!techNameError2}
                className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all"
                style={{ background: techSaving2 || techNameError2 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10b981 0%, #0d9488 100%)", color: techSaving2 || techNameError2 ? "rgba(180,200,230,0.3)" : "white", border: "1px solid rgba(16,185,129,0.3)", cursor: techSaving2 || techNameError2 ? "not-allowed" : "pointer" }}
              >
                {techSaving2 && <Icon name="Loader" size={14} className="animate-spin" />}
                {editingTech2 ? "Сохранить изменения" : "Добавить технологию"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Technology Library Popover ── */}
      <Dialog open={techLibraryOpen} onOpenChange={setTechLibraryOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)" }}>
          <DialogHeader className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white text-sm flex items-center gap-2">
              <Icon name="BookOpen" size={15} style={{ color: "#10b981" }} />
              Библиотека технологий
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3 space-y-3">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.4)" }} />
              <Input value={techLibrarySearch} onChange={(e) => setTechLibrarySearch(e.target.value)} placeholder="Поиск..." className="pl-8 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {existingTechNames.filter((n) => n.name.toLowerCase().includes(techLibrarySearch.toLowerCase())).length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: "rgba(180,200,230,0.4)" }}>Ничего не найдено</p>
              )}
              {existingTechNames.filter((n) => n.name.toLowerCase().includes(techLibrarySearch.toLowerCase())).map((n) => (
                <button key={n.id} onClick={() => { setTechForm2((f) => ({ ...f, name: n.name })); setTechNameError2(""); setTechLibraryOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
                  style={{ color: "rgba(210,225,245,0.85)" }}>
                  <span>{n.name}</span>
                  <span className="text-xs font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>{n.id}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Technology Detail Sheet ── */}
      <Sheet open={!!viewTech2} onOpenChange={(o) => { if (!o) { setViewTech2(null); setTechReqFilter("Все"); } }}>
        <SheetContent side="right" className="w-[580px] sm:w-[580px] p-0 border-l overflow-y-auto" style={{ background: "#0a1120", borderColor: "rgba(255,255,255,0.07)" }}>
          {viewTech2 && (() => {
            const sm = TECH_STATUS_META[viewTech2.status] || TECH_STATUS_META["В разработке"];
            const linkedReqs = reqs.filter((r) => r.technology_id === viewTech2.id);
            const critOptions = ["Все", ...Array.from(new Set(linkedReqs.map((r) => r.criticality)))];
            const filteredReqs = techReqFilter === "Все" ? linkedReqs : linkedReqs.filter((r) => r.criticality === techReqFilter);
            return (
              <>
                {/* ── Gradient Header ── */}
                <div className="relative px-8 pt-8 pb-6" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.07) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <Icon name="Hash" size={11} />{viewTech2.id}
                      </span>
                      {viewTech2.versions && viewTech2.versions.length > 0 && (
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(99,176,255,0.1)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                          v{viewTech2.versions[viewTech2.versions.length - 1]}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                      <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={12} />
                      {viewTech2.status}
                    </span>
                  </div>
                  <SheetHeader>
                    <SheetTitle className="text-xl font-semibold text-white text-left leading-snug">{viewTech2.name}</SheetTitle>
                  </SheetHeader>
                  {linkedReqs.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-4">
                      <Icon name="FileCheck" size={13} style={{ color: "#f59e0b" }} />
                      <span className="text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>
                        {linkedReqs.length} {linkedReqs.length === 1 ? "требование" : linkedReqs.length < 5 ? "требования" : "требований"}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Body ── */}
                <div className="px-8 py-6 space-y-7">

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Описание</p>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.8)" }}>
                      {viewTech2.description || <span style={{ color: "rgba(180,200,230,0.3)" }}>Описание не указано</span>}
                    </p>
                  </div>

                  {/* Attributes grid */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Атрибуты</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "ID технологии", value: viewTech2.id, icon: "Hash", mono: true },
                        { label: "Статус", value: viewTech2.status, icon: sm.icon, mono: false, color: sm.color },
                        { label: "Версий", value: viewTech2.versions?.length ? viewTech2.versions.length.toString() : "—", icon: "Tag", mono: true },
                        { label: "Доменов", value: viewTech2.tech_domain_ids?.length ? viewTech2.tech_domain_ids.length.toString() : "—", icon: "Layers", mono: true },
                      ].map((attr) => (
                        <div key={attr.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon name={attr.icon as Parameters<typeof Icon>[0]["name"]} size={12} style={{ color: "rgba(180,200,230,0.3)" }} />
                            <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>{attr.label}</span>
                          </div>
                          <span className={`text-sm font-medium ${attr.mono ? "font-mono" : ""}`} style={{ color: attr.color || "rgba(210,225,245,0.9)" }}>
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Versions */}
                  {viewTech2.versions && viewTech2.versions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Версии</p>
                      <div className="flex flex-wrap gap-2">
                        {viewTech2.versions.map((v) => (
                          <span key={v} className="text-xs font-mono px-3 py-1 rounded-lg" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>v{v}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Domains */}
                  {viewTech2.tech_domain_ids && viewTech2.tech_domain_ids.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Технические домены</p>
                      <div className="flex flex-wrap gap-2">
                        {viewTech2.tech_domain_ids.map((id) => {
                          const d = techDomainRefs.find((r) => r.id === id);
                          return (
                            <span key={id} className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5" style={{ background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                              <Icon name="Layers" size={11} />
                              {d ? d.name : id}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {viewTech2.tags && viewTech2.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Теги</p>
                      <div className="flex flex-wrap gap-2">
                        {viewTech2.tags.map((tag) => (
                          <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full font-medium" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {viewTech2.attachments && viewTech2.attachments.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Вложения</p>
                      <div className="space-y-2">
                        {viewTech2.attachments.map((att) => (
                          <div key={att.id} className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: att.type === "link" ? "rgba(99,176,255,0.1)" : att.type === "mermaid" ? "rgba(167,139,250,0.1)" : "rgba(245,158,11,0.1)" }}>
                                <Icon name={att.type === "link" ? "ExternalLink" : att.type === "mermaid" ? "GitBranch" : "FileText"} size={14} style={{ color: att.type === "link" ? "#63b0ff" : att.type === "mermaid" ? "#a78bfa" : "#f59e0b" }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm truncate font-medium" style={{ color: "rgba(210,225,245,0.9)" }}>{att.name}</p>
                                <p className="text-[11px] capitalize" style={{ color: "rgba(180,200,230,0.4)" }}>{att.type === "link" ? "Ссылка" : att.type === "mermaid" ? "Диаграмма" : "Документ"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {att.type === "link" ? (
                                <a href={att.content} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1.5 text-xs font-medium" style={{ color: "#63b0ff" }} onClick={(e) => e.stopPropagation()}>
                                  <Icon name="ExternalLink" size={13} /> Открыть
                                </a>
                              ) : (
                                <button onClick={() => setViewAttachment(att)} className="p-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1.5 text-xs font-medium" style={{ color: "rgba(180,200,230,0.6)" }}>
                                  <Icon name="Eye" size={13} /> Просмотр
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  {(viewTech2.created_at || viewTech2.updated_at) && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>История</p>
                      <div className="space-y-2">
                        {[
                          { label: "Создана", value: viewTech2.created_at, icon: "PlusCircle" },
                          { label: "Обновлена", value: viewTech2.updated_at, icon: "RefreshCw" },
                        ].filter((t) => t.value).map((t) => (
                          <div key={t.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="flex items-center gap-2">
                              <Icon name={t.icon as Parameters<typeof Icon>[0]["name"]} size={13} style={{ color: "rgba(180,200,230,0.3)" }} />
                              <span className="text-xs" style={{ color: "rgba(180,200,230,0.45)" }}>{t.label}</span>
                            </div>
                            <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.55)" }}>
                              {new Date(t.value!).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Linked Requirements ── */}
                  <div className="border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-medium uppercase tracking-widest flex items-center gap-2" style={{ color: "rgba(180,200,230,0.3)" }}>
                        <Icon name="FileCheck" size={13} style={{ color: "#f59e0b" }} />
                        Требования
                        {linkedReqs.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono normal-case" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                            {linkedReqs.length}
                          </span>
                        )}
                      </p>
                      {linkedReqs.length > 0 && critOptions.length > 2 && (
                        <div className="flex gap-1">
                          {critOptions.map((c) => {
                            const m = c !== "Все" ? REQ_CRITICALITY_META[c as ReqCriticality] : null;
                            return (
                              <button key={c} onClick={() => setTechReqFilter(c)}
                                className="px-2 py-0.5 rounded-md text-[11px] font-medium transition-all"
                                style={{ background: techReqFilter === c ? (m ? m.bg : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.03)", border: `1px solid ${techReqFilter === c ? (m ? m.color + "40" : "rgba(255,255,255,0.15)") : "rgba(255,255,255,0.06)"}`, color: techReqFilter === c ? (m ? m.color : "white") : "rgba(180,200,230,0.4)" }}>
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {linkedReqs.length === 0 ? (
                      <div className="py-6 text-center rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                        <Icon name="FileX" size={24} className="mx-auto mb-2" style={{ color: "rgba(180,200,230,0.2)" }} />
                        <p className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Требования не привязаны</p>
                      </div>
                    ) : filteredReqs.length === 0 ? (
                      <p className="text-xs py-4 text-center" style={{ color: "rgba(180,200,230,0.3)" }}>Нет требований с такой критичностью</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredReqs.map((r) => {
                          const tm = REQ_TYPE_META[r.req_type] || REQ_TYPE_META["Техническое"];
                          const cm = REQ_CRITICALITY_META[r.criticality] || REQ_CRITICALITY_META["Средний"];
                          const sm2 = REQ_STATUS_META[r.status] || REQ_STATUS_META["В разработке"];
                          return (
                            <button key={r.id} onClick={() => { setViewTech2(null); setViewReq(r); }}
                              className="w-full text-left px-4 py-3 rounded-xl transition-all hover:border-amber-500/20 group"
                              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.15)" }}>{r.id}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1" style={{ background: cm.bg, color: cm.color }}>
                                    <Icon name={cm.icon as Parameters<typeof Icon>[0]["name"]} size={9} />{r.criticality}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: sm2.bg, color: sm2.color }}>{r.status}</span>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors">{r.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] flex items-center gap-1" style={{ background: tm.bg, color: tm.color, padding: "2px 6px", borderRadius: 6 }}>
                                  <Icon name={tm.icon as Parameters<typeof Icon>[0]["name"]} size={9} />{r.req_type}
                                </span>
                                <span className="text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>Балл: <span style={{ color: "#f59e0b" }}>{r.score_value}</span> · Вес: <span style={{ color: "#63b0ff" }}>{r.score_weight}</span></span>
                                <Icon name="ChevronRight" size={11} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#f59e0b" }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="px-8 pb-8 pt-4 flex gap-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <button
                    onClick={() => { setViewTech2(null); openEditTech2(viewTech2); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
                  >
                    <Icon name="Pencil" size={14} />
                    Редактировать
                  </button>
                  <button
                    onClick={() => { setViewTech2(null); setDeleteTechId2(viewTech2.id); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
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

      {/* ── Technology Delete Confirm ── */}
      <Dialog open={!!deleteTechId2} onOpenChange={(o) => { if (!o) setDeleteTechId2(null); }}>
        <DialogContent className="max-w-sm border" style={{ background: "#0b1628", borderColor: "rgba(239,68,68,0.2)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} style={{ color: "#ef4444" }} />
              Удалить технологию?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "rgba(180,200,230,0.7)" }}>
            Технология <span className="font-mono text-white">{deleteTechId2}</span> будет удалена без возможности восстановления.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }} onClick={() => setDeleteTechId2(null)}>Отмена</Button>
            <button onClick={() => handleDeleteTech2(deleteTechId2!)} className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
              <Icon name="Trash2" size={14} /> Удалить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Attachment Viewer ── */}
      <Dialog open={!!viewAttachment} onOpenChange={(o) => { if (!o) setViewAttachment(null); }}>
        <DialogContent className="max-w-2xl border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "80vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-sm">
              <Icon name={viewAttachment?.type === "mermaid" ? "GitBranch" : "FileText"} size={15} style={{ color: viewAttachment?.type === "mermaid" ? "#a78bfa" : "#f59e0b" }} />
              {viewAttachment?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {viewAttachment?.type === "mermaid" ? (
              <MermaidViewer content={viewAttachment.content} />
            ) : (
              <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#a5f3fc" }}>
                {viewAttachment?.content}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Technology Full View Dialog ── */}
      {viewTechFull && (() => {
        const tech = viewTechFull;
        const sm = TECH_STATUS_META[tech.status] || TECH_STATUS_META["В разработке"];
        const linkedReqs = reqs.filter((r) => r.technology_id === tech.id);
        const mermaidAttachments = (tech.attachments || []).filter((a) => a.type === "mermaid");
        const linkAttachments = (tech.attachments || []).filter((a) => a.type === "link");
        const fileAttachments = (tech.attachments || []).filter((a) => a.type !== "mermaid" && a.type !== "link");

        const searchLower = techFullSearch.toLowerCase();
        const filteredReqs = linkedReqs.filter((r) => {
          if (techFullFilterType.length > 0 && !techFullFilterType.includes(r.req_type)) return false;
          if (techFullFilterCrit.length > 0 && !techFullFilterCrit.includes(r.criticality)) return false;
          if (techFullFilterStatus.length > 0 && !techFullFilterStatus.includes(r.status)) return false;
          if (techFullFilterEnv.length > 0 && !techFullFilterEnv.some((e) => r.environments.includes(e))) return false;
          if (techFullFilterStage.length > 0 && !techFullFilterStage.some((s) => r.stages.includes(s))) return false;
          if (searchLower) {
            const match =
              r.id.toLowerCase().includes(searchLower) ||
              r.name.toLowerCase().includes(searchLower) ||
              r.description.toLowerCase().includes(searchLower) ||
              r.req_type.toLowerCase().includes(searchLower) ||
              r.criticality.toLowerCase().includes(searchLower) ||
              r.status.toLowerCase().includes(searchLower) ||
              r.version.toLowerCase().includes(searchLower) ||
              r.control_metric.toLowerCase().includes(searchLower) ||
              r.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
              r.procurement.toLowerCase().includes(searchLower);
            if (!match) return false;
          }
          return true;
        });

        const exportReqsCSV = () => {
          const techDomain = (id: string) => domains.find((d) => d.id === id)?.name || id;
          const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
          const headers = [
            "Технология ID", "Технология", "Версии технологии", "Статус технологии",
            "ID требования", "Название", "Версия", "Тип", "Критичность", "Статус",
            "Домен", "Описание", "Контрольная метрика", "Описание контроля",
            "Среды", "Стадии", "Балл", "Вес", "Закупка",
            "Внешнее с ИОД", "Внешнее без ИОД", "Внутреннее с ИОД", "Внутреннее без ИОД",
            "Теги", "Норм. документ"
          ];
          const rows = filteredReqs.map((r) => [
            esc(tech.id), esc(tech.name), esc((tech.versions || []).join("; ")), esc(tech.status),
            esc(r.id), esc(r.name), esc(r.version), esc(r.req_type), esc(r.criticality), esc(r.status),
            esc(techDomain(r.tech_domain_id)), esc(r.description), esc(r.control_metric), esc(r.control_description),
            esc((r.environments || []).join("; ")), esc((r.stages || []).join("; ")),
            esc(r.score_value), esc(r.score_weight), esc(r.procurement),
            esc(r.ext_with_iod), esc(r.ext_without_iod), esc(r.int_with_iod), esc(r.int_without_iod),
            esc((r.tags || []).join("; ")), esc(r.norm_doc_link)
          ].join(","));
          const csv = "\uFEFF" + [headers.map(esc).join(","), ...rows].join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `${tech.id}_requirements.csv`; a.click();
          URL.revokeObjectURL(url);
        };

        const hasActiveFilters = techFullFilterType.length > 0 || techFullFilterCrit.length > 0 || techFullFilterStatus.length > 0 || techFullFilterEnv.length > 0 || techFullFilterStage.length > 0;
        const clearAllFilters = () => { setTechFullFilterType([]); setTechFullFilterCrit([]); setTechFullFilterStatus([]); setTechFullFilterEnv([]); setTechFullFilterStage([]); };

        const sortedReqs = [...filteredReqs].sort((a, b) => {
          let va: string | number = "";
          let vb: string | number = "";
          if (techFullSortField === "id") { va = a.id; vb = b.id; }
          else if (techFullSortField === "name") { va = a.name; vb = b.name; }
          else if (techFullSortField === "criticality") { va = a.criticality; vb = b.criticality; }
          else if (techFullSortField === "status") { va = a.status; vb = b.status; }
          else if (techFullSortField === "req_type") { va = a.req_type; vb = b.req_type; }
          else if (techFullSortField === "score_value") { va = a.score_value; vb = b.score_value; }
          else if (techFullSortField === "score_weight") { va = a.score_weight; vb = b.score_weight; }
          const cmp = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb), "ru");
          return techFullSortDir === "asc" ? cmp : -cmp;
        });

        const toggleSort = (field: string) => {
          if (techFullSortField === field) setTechFullSortDir((d) => d === "asc" ? "desc" : "asc");
          else { setTechFullSortField(field); setTechFullSortDir("asc"); }
        };

        const SortIcon = ({ field }: { field: string }) => {
          if (techFullSortField !== field) return <Icon name="ChevronsUpDown" size={12} style={{ color: "rgba(180,200,230,0.3)" }} />;
          return <Icon name={techFullSortDir === "asc" ? "ChevronUp" : "ChevronDown"} size={12} style={{ color: "#34d399" }} />;
        };

        return (
          <Dialog open onOpenChange={(o) => { if (!o) { setViewTechFull(null); clearAllFilters(); setTechFullSearch(""); } }}>
            <DialogContent
              className="border overflow-hidden flex flex-col"
              style={{
                background: "#080f1e",
                borderColor: "rgba(255,255,255,0.08)",
                maxWidth: "95vw",
                width: "1200px",
                maxHeight: "95vh",
                padding: 0,
              }}
            >
              {/* ── Header ── */}
              <div className="px-8 pt-7 pb-5 flex-shrink-0" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>{tech.id}</span>
                      {tech.versions && tech.versions.map((v) => (
                        <span key={v} className="font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(99,176,255,0.1)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>v{v}</span>
                      ))}
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                        <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={11} />{tech.status}
                      </span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white leading-tight">{tech.name}</DialogTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setViewTechFull(null); openEditTech2(tech); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
                    >
                      <Icon name="Pencil" size={14} /> Редактировать
                    </button>
                    <button
                      onClick={() => { setViewTechFull(null); setDeleteTechId2(tech.id); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.8)" }}
                    >
                      <Icon name="Trash2" size={14} /> Удалить
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 gap-0 min-h-0">
                  {/* Left column — description + meta */}
                  <div className="col-span-1 px-6 py-6 space-y-6 border-r" style={{ borderColor: "rgba(255,255,255,0.05)" }}>

                    {/* Description */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Описание</p>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.8)" }}>
                        {tech.description || <span style={{ color: "rgba(180,200,230,0.3)" }}>Не указано</span>}
                      </p>
                    </div>

                    {/* Tech domains */}
                    {tech.tech_domain_ids && tech.tech_domain_ids.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Технические домены</p>
                        <div className="flex flex-col gap-1.5">
                          {tech.tech_domain_ids.map((id) => {
                            const d = techDomainRefs.find((r) => r.id === id);
                            return (
                              <span key={id} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background: "rgba(16,185,129,0.07)", color: "#34d399", border: "1px solid rgba(16,185,129,0.15)" }}>
                                <Icon name="Layers" size={11} />{d ? d.name : id}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {tech.tags && tech.tags.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Теги</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tech.tags.map((tag) => (
                            <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {linkAttachments.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Ссылки</p>
                        <div className="flex flex-col gap-1.5">
                          {linkAttachments.map((att) => (
                            <a key={att.id} href={att.content} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs group hover:bg-white/5 transition-all"
                              style={{ background: "rgba(99,176,255,0.05)", border: "1px solid rgba(99,176,255,0.15)", color: "#63b0ff" }}>
                              <Icon name="ExternalLink" size={12} className="flex-shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File attachments */}
                    {fileAttachments.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Документы</p>
                        <div className="flex flex-col gap-1.5">
                          {fileAttachments.map((att) => (
                            <button key={att.id} onClick={() => setViewAttachment(att)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-all text-left"
                              style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                              <Icon name="FileText" size={12} className="flex-shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    {(tech.created_at || tech.updated_at) && (
                      <div className="border-t pt-4 space-y-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        {tech.created_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(180,200,230,0.35)" }}><Icon name="PlusCircle" size={11} />Создана</span>
                            <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>{new Date(tech.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                          </div>
                        )}
                        {tech.updated_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(180,200,230,0.35)" }}><Icon name="RefreshCw" size={11} />Обновлена</span>
                            <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.5)" }}>{new Date(tech.updated_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right 2 columns — mermaid + requirements */}
                  <div className="col-span-2 flex flex-col">

                    {/* Mermaid section */}
                    {mermaidAttachments.length > 0 && (
                      <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: "rgba(180,200,230,0.3)" }}>
                            <Icon name="GitBranch" size={13} style={{ color: "#a78bfa" }} />
                            Mermaid-схемы
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono normal-case" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{mermaidAttachments.length}</span>
                          </p>
                        </div>
                        <div className="space-y-5">
                          {mermaidAttachments.map((att) => (
                            <div key={att.id}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(167,139,250,0.1)" }}>
                                  <Icon name="GitBranch" size={13} style={{ color: "#a78bfa" }} />
                                </div>
                                <span className="text-sm font-medium" style={{ color: "rgba(210,225,245,0.9)" }}>{att.name}</span>
                              </div>
                              <MermaidViewer content={att.content} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements table */}
                    <div className="px-6 py-6 flex-1">
                      {/* Header row: title + search + CSV */}
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 flex-shrink-0" style={{ color: "rgba(180,200,230,0.3)" }}>
                          <Icon name="FileCheck" size={13} style={{ color: "#f59e0b" }} />
                          Привязанные требования
                          {linkedReqs.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono normal-case" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>{linkedReqs.length}</span>
                          )}
                          {filteredReqs.length !== linkedReqs.length && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono normal-case" style={{ background: "rgba(99,176,255,0.12)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>показано {filteredReqs.length}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                            <input
                              value={techFullSearch}
                              onChange={(e) => setTechFullSearch(e.target.value)}
                              placeholder="Поиск..."
                              className="pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none w-44"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(210,225,245,0.9)" }}
                            />
                          </div>
                          {linkedReqs.length > 0 && (
                            <button
                              onClick={exportReqsCSV}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}
                              title="Выгрузить в CSV"
                            >
                              <Icon name="Download" size={13} />
                              CSV
                              {(hasActiveFilters || techFullSearch) && filteredReqs.length !== linkedReqs.length && (
                                <span className="font-mono" style={{ color: "rgba(52,211,153,0.6)" }}>({filteredReqs.length})</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter panel */}
                      {linkedReqs.length > 0 && (
                        <div className="mb-4 flex flex-col gap-2 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          {/* Тип */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider w-16 shrink-0" style={{ color: "rgba(180,200,230,0.35)" }}>Тип</span>
                            {(Object.keys(REQ_TYPE_META) as ReqType[]).map((v) => {
                              const m = REQ_TYPE_META[v];
                              const active = techFullFilterType.includes(v);
                              return (
                                <button key={v} onClick={() => setTechFullFilterType((prev) => active ? prev.filter((x) => x !== v) : [...prev, v])}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all"
                                  style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.07)"}`, color: active ? m.color : "rgba(180,200,230,0.45)" }}>
                                  <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{v}
                                </button>
                              );
                            })}
                          </div>
                          {/* Критичность */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider w-16 shrink-0" style={{ color: "rgba(180,200,230,0.35)" }}>Критич.</span>
                            {(Object.keys(REQ_CRITICALITY_META) as ReqCriticality[]).map((v) => {
                              const m = REQ_CRITICALITY_META[v];
                              const active = techFullFilterCrit.includes(v);
                              return (
                                <button key={v} onClick={() => setTechFullFilterCrit((prev) => active ? prev.filter((x) => x !== v) : [...prev, v])}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all"
                                  style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.07)"}`, color: active ? m.color : "rgba(180,200,230,0.45)" }}>
                                  <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{v}
                                </button>
                              );
                            })}
                          </div>
                          {/* Статус */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider w-16 shrink-0" style={{ color: "rgba(180,200,230,0.35)" }}>Статус</span>
                            {(Object.keys(REQ_STATUS_META) as ReqStatus[]).map((v) => {
                              const m = REQ_STATUS_META[v];
                              const active = techFullFilterStatus.includes(v);
                              return (
                                <button key={v} onClick={() => setTechFullFilterStatus((prev) => active ? prev.filter((x) => x !== v) : [...prev, v])}
                                  className="px-2 py-0.5 rounded text-[11px] transition-all"
                                  style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.07)"}`, color: active ? m.color : "rgba(180,200,230,0.45)" }}>
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                          {/* Среда */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider w-16 shrink-0" style={{ color: "rgba(180,200,230,0.35)" }}>Среда</span>
                            {REQ_ENVS.map((v) => {
                              const active = techFullFilterEnv.includes(v);
                              return (
                                <button key={v} onClick={() => setTechFullFilterEnv((prev) => active ? prev.filter((x) => x !== v) : [...prev, v])}
                                  className="px-2 py-0.5 rounded text-[11px] font-mono transition-all"
                                  style={{ background: active ? "rgba(99,176,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(99,176,255,0.4)" : "rgba(255,255,255,0.07)"}`, color: active ? "#63b0ff" : "rgba(180,200,230,0.45)" }}>
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                          {/* Стадия */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider w-16 shrink-0" style={{ color: "rgba(180,200,230,0.35)" }}>Стадия</span>
                            {REQ_STAGES.map((v) => {
                              const active = techFullFilterStage.includes(v);
                              return (
                                <button key={v} onClick={() => setTechFullFilterStage((prev) => active ? prev.filter((x) => x !== v) : [...prev, v])}
                                  className="px-2 py-0.5 rounded text-[11px] transition-all"
                                  style={{ background: active ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.07)"}`, color: active ? "#a78bfa" : "rgba(180,200,230,0.45)" }}>
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                          {/* Сброс */}
                          {hasActiveFilters && (
                            <div className="flex justify-end pt-1">
                              <button onClick={clearAllFilters} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-all hover:opacity-80" style={{ color: "rgba(180,200,230,0.4)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                <Icon name="X" size={10} />Сбросить фильтры
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {linkedReqs.length === 0 ? (
                        <div className="py-10 text-center rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                          <Icon name="FileX" size={28} className="mx-auto mb-2" style={{ color: "rgba(180,200,230,0.2)" }} />
                          <p className="text-sm" style={{ color: "rgba(180,200,230,0.3)" }}>Требования не привязаны</p>
                        </div>
                      ) : sortedReqs.length === 0 ? (
                        <div className="py-10 text-center rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                          <p className="text-sm" style={{ color: "rgba(180,200,230,0.3)" }}>Ничего не найдено</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {sortedReqs.map((r) => {
                            const tm = REQ_TYPE_META[r.req_type] || REQ_TYPE_META["Техническое"];
                            const cm = REQ_CRITICALITY_META[r.criticality] || REQ_CRITICALITY_META["Средний"];
                            const sm2 = REQ_STATUS_META[r.status] || REQ_STATUS_META["В разработке"];
                            const reqDomain = domains.find((d) => d.id === r.tech_domain_id);
                            return (
                              <div
                                key={r.id}
                                onClick={() => { setViewTechFull(null); setViewReq(r); }}
                                className="cursor-pointer rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-white/[0.02]"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                              >
                                {/* Row 1: ID + name + version + badges + score */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded whitespace-nowrap shrink-0" style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.15)" }}>{r.id}</span>
                                    <span className="font-semibold text-sm" style={{ color: "rgba(210,225,245,0.95)" }}>{r.name}</span>
                                    {r.version && <span className="font-mono text-[10px]" style={{ color: "rgba(180,200,230,0.35)" }}>v{r.version}</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[11px] px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap" style={{ background: tm.bg, color: tm.color }}>
                                      <Icon name={tm.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{r.req_type}
                                    </span>
                                    <span className="text-[11px] px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap" style={{ background: cm.bg, color: cm.color }}>
                                      <Icon name={cm.icon as Parameters<typeof Icon>[0]["name"]} size={10} />{r.criticality}
                                    </span>
                                    <span className="text-[11px] px-2 py-0.5 rounded whitespace-nowrap" style={{ background: sm2.bg, color: sm2.color }}>{r.status}</span>
                                  </div>
                                </div>

                                {/* Row 2: description */}
                                {r.description && (
                                  <p className="text-xs leading-relaxed" style={{ color: "rgba(180,200,230,0.6)" }}>{r.description}</p>
                                )}

                                {/* Row 3: control metric + control description */}
                                {(r.control_metric || r.control_description) && (
                                  <div className="grid grid-cols-2 gap-2">
                                    {r.control_metric && (
                                      <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <p className="text-[10px] mb-0.5" style={{ color: "rgba(180,200,230,0.4)" }}>Контрольная метрика</p>
                                        <p className="text-xs" style={{ color: "rgba(210,225,245,0.8)" }}>{r.control_metric}</p>
                                      </div>
                                    )}
                                    {r.control_description && (
                                      <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <p className="text-[10px] mb-0.5" style={{ color: "rgba(180,200,230,0.4)" }}>Описание контроля</p>
                                        <p className="text-xs" style={{ color: "rgba(210,225,245,0.8)" }}>{r.control_description}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Row 4: environments + stages + domain */}
                                <div className="flex items-center flex-wrap gap-3">
                                  {reqDomain && (
                                    <div className="flex items-center gap-1.5">
                                      <Icon name="Link2" size={11} style={{ color: "rgba(180,200,230,0.35)" }} />
                                      <span className="text-[11px]" style={{ color: "rgba(180,200,230,0.55)" }}>{reqDomain.name}</span>
                                    </div>
                                  )}
                                  {r.environments && r.environments.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(180,200,230,0.3)" }}>Среды:</span>
                                      {r.environments.map((e) => (
                                        <span key={e} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.15)" }}>{e}</span>
                                      ))}
                                    </div>
                                  )}
                                  {r.stages && r.stages.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(180,200,230,0.3)" }}>Стадии:</span>
                                      {r.stages.map((s) => (
                                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>{s}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Row 5: interactions grid */}
                                {(r.ext_with_iod || r.ext_without_iod || r.int_with_iod || r.int_without_iod) && (
                                  <div className="grid grid-cols-4 gap-2">
                                    {([
                                      { key: "ext_with_iod" as const, label: "Внешнее с ИОД" },
                                      { key: "ext_without_iod" as const, label: "Внешнее без ИОД" },
                                      { key: "int_with_iod" as const, label: "Внутреннее с ИОД" },
                                      { key: "int_without_iod" as const, label: "Внутреннее без ИОД" },
                                    ] as { key: "ext_with_iod" | "ext_without_iod" | "int_with_iod" | "int_without_iod"; label: string }[]).map(({ key, label }) => {
                                      const val = r[key];
                                      const m = REQ_INTERACTION_META[val];
                                      return (
                                        <div key={key} className="px-2.5 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                          <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: "rgba(180,200,230,0.35)" }}>{label}</p>
                                          <p className="text-[11px] font-medium" style={{ color: m?.color || "rgba(180,200,230,0.5)" }}>{val}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Row 6: tags + score + procurement + norm_doc_link + open button */}
                                <div className="flex items-center justify-between gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {r.tags && r.tags.length > 0 && r.tags.map((tag) => (
                                      <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.07)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.12)" }}>{tag}</span>
                                    ))}
                                    {r.procurement && (
                                      <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(180,200,230,0.4)" }}>
                                        <Icon name="ShoppingCart" size={10} />{r.procurement}
                                      </span>
                                    )}
                                    {r.norm_doc_link && (
                                      <a
                                        href={r.norm_doc_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-[10px] flex items-center gap-1 hover:underline"
                                        style={{ color: "#63b0ff" }}
                                      >
                                        <Icon name="FileText" size={10} />Норм. документ
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[10px] font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>
                                      Балл: <span style={{ color: "#f59e0b" }}>{r.score_value}</span>
                                    </span>
                                    <span className="text-[10px] font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>
                                      Вес: <span style={{ color: "#63b0ff" }}>{r.score_weight}</span>
                                    </span>
                                    <Icon name="ChevronRight" size={13} style={{ color: "rgba(180,200,230,0.25)" }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

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
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#63b0ff" }}>
                  <Icon name="Hash" size={13} style={{ color: "rgba(99,176,255,0.4)" }} />
                  {domainForm.id}
                </div>
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

      {/* ── Tech Domain Detail Sheet ─────────────────────────────── */}
      <Sheet open={!!viewTech} onOpenChange={(o) => { if (!o) setViewTech(null); }}>
        <SheetContent side="right" className="w-[520px] sm:w-[520px] p-0 border-l overflow-y-auto"
          style={{ background: "#0a1120", borderColor: "rgba(255,255,255,0.07)" }}>
          {viewTech && (() => {
            const meta = DOMAIN_STATUS_META[viewTech.status];
            const linkedOrgs = techOrgRefs.filter((o) => viewTech.org_domain_ids.includes(o.id));
            return (
              <>
                <div className="relative px-8 pt-8 pb-6" style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>{viewTech.id}</span>
                      <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>v{viewTech.version}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}>
                      <Icon name={meta.icon} size={12} />{viewTech.status}
                    </span>
                  </div>
                  <SheetHeader>
                    <SheetTitle className="text-xl font-semibold text-white text-left leading-snug">{viewTech.name}</SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name="User" size={13} style={{ color: "rgba(180,200,230,0.35)" }} />
                      <span className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>{viewTech.owner || "—"}</span>
                    </div>
                    {viewTech.created_at && (<>
                      <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                      <div className="flex items-center gap-1.5">
                        <Icon name="Calendar" size={13} style={{ color: "rgba(180,200,230,0.35)" }} />
                        <span className="text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>
                          {new Date(viewTech.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </>)}
                  </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Описание</p>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.8)" }}>{viewTech.description || "Описание не указано"}</p>
                  </div>

                  {/* Tags */}
                  {viewTech.tags && viewTech.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Теги</p>
                      <div className="flex flex-wrap gap-2">
                        {viewTech.tags.map((tag) => (
                          <span key={tag} className="text-xs px-3 py-1 rounded-full font-mono font-medium"
                            style={{ background: "rgba(139,92,246,0.1)", color: "rgba(167,139,250,0.9)", border: "1px solid rgba(139,92,246,0.25)" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Org domains */}
                  {linkedOrgs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Связанные организационные домены</p>
                      <div className="space-y-2">
                        {linkedOrgs.map((o) => {
                          const om = DOMAIN_STATUS_META[o.status];
                          return (
                            <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                              style={{ background: "rgba(0,102,255,0.06)", border: "1px solid rgba(0,102,255,0.12)" }}>
                              <div className="flex items-center gap-2">
                                <Icon name="Link2" size={13} style={{ color: "rgba(99,176,255,0.5)" }} />
                                <span className="text-sm font-medium" style={{ color: "rgba(210,225,245,0.85)" }}>{o.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>{o.id}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: om.bg, color: om.color }}>{o.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Attributes */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(180,200,230,0.3)" }}>Атрибуты</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "ID домена", value: viewTech.id, icon: "Hash", mono: true },
                        { label: "Версия", value: viewTech.version, icon: "Tag", mono: true },
                        { label: "Владелец", value: viewTech.owner || "—", icon: "User", mono: false },
                        { label: "Статус", value: viewTech.status, icon: meta.icon, mono: false, color: meta.color },
                      ].map((attr) => (
                        <div key={attr.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon name={attr.icon} size={12} style={{ color: "rgba(180,200,230,0.3)" }} />
                            <span className="text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>{attr.label}</span>
                          </div>
                          <span className={`text-sm font-medium ${attr.mono ? "font-mono" : ""}`} style={{ color: attr.color || "rgba(210,225,245,0.9)" }}>
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
                        { label: "Создан", value: viewTech.created_at, icon: "PlusCircle" },
                        { label: "Обновлён", value: viewTech.updated_at || viewTech.created_at, icon: "RefreshCw" },
                      ].filter((t) => t.value).map((t) => (
                        <div key={t.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex items-center gap-2">
                            <Icon name={t.icon} size={13} style={{ color: "rgba(180,200,230,0.3)" }} />
                            <span className="text-xs" style={{ color: "rgba(180,200,230,0.45)" }}>{t.label}</span>
                          </div>
                          <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.55)" }}>
                            {new Date(t.value!).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 pt-2 flex gap-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <button onClick={() => { openEditTech(viewTech); setViewTech(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                    <Icon name="Pencil" size={14} />Редактировать
                  </button>
                  <button onClick={() => { setDeleteTechId(viewTech.id); setViewTech(null); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}>
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Tech Domain Create/Edit Dialog ───────────────────────── */}
      <Dialog open={techDialogOpen} onOpenChange={setTechDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          style={{ background: "#0d1528", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)" }}>
                <Icon name={editingTech ? "Pencil" : "Plus"} size={15} style={{ color: "#a78bfa" }} />
              </div>
              {editingTech ? "Редактировать тех. домен" : "Создать технический домен"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* ID + Version */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID технического домена</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#a78bfa" }}>
                  <Icon name="Hash" size={13} style={{ color: "rgba(167,139,250,0.4)" }} />
                  {techForm.id}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input value={techForm.version} onChange={(e) => setTechForm({ ...techForm, version: e.target.value })}
                  placeholder="1.0.0" className="font-mono text-sm"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Name with validation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название технического домена</Label>
                {techNameError && (
                  <span className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                    <Icon name="AlertCircle" size={11} />{techNameError}
                  </span>
                )}
                {techSaveError && !techNameError && (
                  <span className="text-xs flex items-center gap-1" style={{ color: "#f97316" }}>
                    <Icon name="AlertCircle" size={11} />{techSaveError}
                  </span>
                )}
              </div>
              <Input value={techForm.name}
                onChange={(e) => { setTechForm({ ...techForm, name: e.target.value }); setTechNameError(validateTechName(e.target.value)); setTechSaveError(""); }}
                onBlur={(e) => setTechNameError(validateTechName(e.target.value))}
                placeholder="Введите название домена"
                style={{ background: "rgba(15,22,41,0.8)", border: `1px solid ${techNameError || techSaveError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, color: "white" }} />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Минимум 3 символа · Уникальное в системе</span>
                <span className="text-xs font-mono" style={{ color: techForm.name.length > 90 ? "#f59e0b" : "rgba(180,200,230,0.3)" }}>{techForm.name.length}/100</span>
              </div>
            </div>

            {/* Owner + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Владелец</Label>
                <Input value={techForm.owner} onChange={(e) => setTechForm({ ...techForm, owner: e.target.value })}
                  placeholder="Отдел / ФИО"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <div className="relative">
                  <select value={techForm.status} onChange={(e) => setTechForm({ ...techForm, status: e.target.value as DomainStatus })}
                    className="w-full px-3 py-2 rounded-lg text-sm appearance-none outline-none"
                    style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: DOMAIN_STATUS_META[techForm.status].color }}>
                    {DOMAIN_STATUSES.map((s) => (
                      <option key={s} value={s} style={{ background: "#0d1528", color: DOMAIN_STATUS_META[s].color }}>{s}</option>
                    ))}
                  </select>
                  <Icon name="ChevronDown" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(180,200,230,0.4)" }} />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Тег</Label>
                <span className="text-xs font-mono" style={{ color: "rgba(180,200,230,0.3)" }}>{techForm.tags.length}/10</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Icon name="Hash" size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(139,92,246,0.5)" }} />
                  <input value={techTagInput}
                    onChange={(e) => setTechTagInput(e.target.value.replace(/[^a-zA-Zа-яёА-ЯЁ0-9\-_]/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "," || e.key === " ") { e.preventDefault(); addTechTag(techTagInput); } }}
                    placeholder="Введите тег и нажмите Enter"
                    maxLength={30} disabled={techForm.tags.length >= 10}
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none font-mono"
                    style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(210,225,245,0.9)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.2)")}
                  />
                </div>
                <button type="button" onClick={() => addTechTag(techTagInput)}
                  disabled={!techTagInput.trim() || techForm.tags.length >= 10}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ background: techTagInput.trim() ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${techTagInput.trim() ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.07)"}`, color: techTagInput.trim() ? "#a78bfa" : "rgba(180,200,230,0.2)", cursor: !techTagInput.trim() || techForm.tags.length >= 10 ? "not-allowed" : "pointer" }}>
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              {techForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {techForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
                      #{tag}
                      <button type="button" onClick={() => removeTechTag(tag)} className="ml-0.5 rounded-full" style={{ color: "rgba(167,139,250,0.5)", lineHeight: 1 }}>
                        <Icon name="X" size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание</Label>
              <textarea value={techForm.description} onChange={(e) => setTechForm({ ...techForm, description: e.target.value })}
                placeholder="Опишите назначение и область применения домена..."
                rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none font-sans"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(210,225,245,0.9)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Org domains multiselect */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>
                Организационные домены ({techForm.org_domain_ids.length} выбрано)
              </Label>
              {techOrgRefs.length === 0 ? (
                <div className="px-3 py-3 rounded-lg text-xs text-center" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(180,200,230,0.35)" }}>
                  Нет доступных организационных доменов
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {techOrgRefs.map((o) => {
                    const selected = techForm.org_domain_ids.includes(o.id);
                    const om = DOMAIN_STATUS_META[o.status];
                    return (
                      <button key={o.id} type="button" onClick={() => toggleOrgDomain(o.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={{ background: selected ? "rgba(0,102,255,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${selected ? "rgba(0,102,255,0.3)" : "rgba(255,255,255,0.05)"}` }}>
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: selected ? "rgba(0,102,255,0.3)" : "rgba(255,255,255,0.06)", border: `1px solid ${selected ? "rgba(0,102,255,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                          {selected && <Icon name="Check" size={10} style={{ color: "#63b0ff" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium" style={{ color: selected ? "rgba(210,225,245,0.95)" : "rgba(180,200,230,0.65)" }}>
                            {o.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>{o.id}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: om.bg, color: om.color }}>{o.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status preview */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: DOMAIN_STATUS_META[techForm.status].bg }}>
              <Icon name={DOMAIN_STATUS_META[techForm.status].icon} size={13} style={{ color: DOMAIN_STATUS_META[techForm.status].color }} />
              <span className="text-xs font-medium" style={{ color: DOMAIN_STATUS_META[techForm.status].color }}>
                Статус: {techForm.status}
              </span>
              <span className="font-mono text-xs ml-auto" style={{ color: "rgba(180,200,230,0.35)" }}>{techForm.id}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 text-sm"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}
                onClick={() => setTechDialogOpen(false)}>
                Отмена
              </Button>
              <button className="flex-1 rounded-lg text-sm font-medium py-2 transition-all flex items-center justify-center gap-2"
                onClick={handleSaveTech}
                disabled={!techForm.name.trim() || !!techNameError || !techForm.id.trim() || techSaving}
                style={{
                  background: !techForm.name.trim() || !!techNameError || !techForm.id.trim() || techSaving
                    ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #8b5cf6 0%, #0066ff 100%)",
                  color: !techForm.name.trim() || !!techNameError || !techForm.id.trim() || techSaving ? "rgba(180,200,230,0.3)" : "white",
                  cursor: !techForm.name.trim() || !!techNameError || !techForm.id.trim() || techSaving ? "not-allowed" : "pointer",
                }}>
                {techSaving && <Icon name="Loader" size={14} className="animate-spin" />}
                {techSaving ? "Сохранение..." : editingTech ? "Сохранить изменения" : "Создать домен"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Tech Domain Delete Confirm ────────────────────────────── */}
      <Dialog open={!!deleteTechId} onOpenChange={() => setDeleteTechId(null)}>
        <DialogContent className="sm:max-w-sm"
          style={{ background: "#0d1528", border: "1px solid rgba(239,68,68,0.2)", color: "white" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <Icon name="Trash2" size={15} style={{ color: "#ef4444" }} />
              </div>
              Удалить технический домен
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 space-y-4">
            <p className="text-sm" style={{ color: "rgba(180,200,230,0.7)" }}>
              Домен{" "}
              <span className="font-mono font-medium" style={{ color: "#ef4444" }}>{deleteTechId}</span>{" "}
              будет удалён без возможности восстановления.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 text-sm"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}
                onClick={() => setDeleteTechId(null)}>
                Отмена
              </Button>
              <button className="flex-1 rounded-lg text-sm font-medium py-2"
                onClick={() => deleteTechId && handleDeleteTech(deleteTechId)}
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
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

      {/* ── Hardening Create/Edit Dialog ── */}
      <Dialog open={hardDialogOpen} onOpenChange={(o) => { if (!o) setHardDialogOpen(false); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 z-10" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <Icon name="Shield" size={15} style={{ color: "#f87171" }} />
              </div>
              {editingHard ? "Редактировать харденинг" : "Добавить харденинг"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5">
            {/* ID */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID харденинга</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#f87171" }}>
                  <Icon name="Hash" size={13} style={{ color: "rgba(248,113,113,0.4)" }} />
                  {editingHard ? hardForm.id : (
                    <input value={hardForm.id} onChange={(e) => setHardForm((f) => ({ ...f, id: e.target.value }))} className="bg-transparent outline-none flex-1 font-mono" style={{ color: "#f87171" }} placeholder="hard-001" />
                  )}
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название харденинга *</Label>
              <Input value={hardForm.name} onChange={(e) => setHardForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Например: Харденинг Nginx для продакшена"
                className="text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            </div>

            {/* Tech Solution */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Техническое решение</Label>
              <div className="relative">
                <Input value={hardTsolSearch} onChange={(e) => setHardTsolSearch(e.target.value)} placeholder="Поиск технического решения..." className="text-sm mb-2" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                <div className="max-h-36 overflow-y-auto rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(15,22,41,0.8)" }}>
                  <button onClick={() => setHardForm((f) => ({ ...f, tech_solution_id: "" }))} className="w-full text-left px-3 py-2 text-xs transition-all hover:bg-white/5" style={{ color: hardForm.tech_solution_id === "" ? "#63b0ff" : "rgba(180,200,230,0.4)" }}>
                    — не выбрано —
                  </button>
                  {techSolutions.filter((s) => !hardTsolSearch || (s.name||"").toLowerCase().includes(hardTsolSearch.toLowerCase()) || s.id.toLowerCase().includes(hardTsolSearch.toLowerCase())).map((s) => (
                    <button key={s.id} onClick={() => { setHardForm((f) => ({ ...f, tech_solution_id: s.id, name: f.name || s.name })); setHardTsolSearch(""); }}
                      className="w-full text-left px-3 py-2 text-xs transition-all hover:bg-white/5 flex items-center justify-between"
                      style={{ background: hardForm.tech_solution_id === s.id ? "rgba(99,176,255,0.08)" : "transparent", color: hardForm.tech_solution_id === s.id ? "#63b0ff" : "rgba(210,225,245,0.7)" }}>
                      <span>{s.name}</span>
                      <span className="font-mono text-[10px]" style={{ color: "rgba(180,200,230,0.3)" }}>{s.id}</span>
                    </button>
                  ))}
                </div>
                {hardForm.tech_solution_id && (
                  <div className="mt-1 px-2 py-1 rounded text-xs inline-flex items-center gap-1" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                    <Icon name="Link2" size={10} /> {hardForm.tech_solution_id}
                  </div>
                )}
              </div>
            </div>

            {/* Deploy Hardening */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Харденинг развёртывания</Label>
              <textarea
                value={hardForm.deploy_hardening}
                onChange={(e) => setHardForm((f) => ({ ...f, deploy_hardening: e.target.value }))}
                rows={6}
                placeholder="# Конфигурация развёртывания&#10;## Шаг 1: Настройка окружения&#10;..."
                className="w-full px-3 py-2 rounded-lg text-xs resize-y outline-none font-mono"
                style={{ background: "rgba(15,22,41,0.95)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", minHeight: "120px" }}
              />
            </div>

            {/* Functional Hardening */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Харденинг функционала</Label>
              <textarea
                value={hardForm.functional_hardening}
                onChange={(e) => setHardForm((f) => ({ ...f, functional_hardening: e.target.value }))}
                rows={6}
                placeholder="# Функциональные настройки безопасности&#10;## Аутентификация&#10;..."
                className="w-full px-3 py-2 rounded-lg text-xs resize-y outline-none font-mono"
                style={{ background: "rgba(15,22,41,0.95)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", minHeight: "120px" }}
              />
            </div>

            {/* Status + Author + Version */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <div className="flex flex-col gap-1.5">
                  {HARDENING_STATUSES.map((s) => {
                    const m = HARDENING_STATUS_META[s]; const active = hardForm.status === s;
                    return <button key={s} onClick={() => setHardForm((f) => ({ ...f, status: s }))} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{s}
                    </button>;
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Автор</Label>
                <Input value={hardForm.author} onChange={(e) => setHardForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="Имя автора" className="text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input value={hardForm.version} onChange={(e) => setHardForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="1.0.0" className="text-sm font-mono" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги ({hardForm.tags.length}/10)</Label>
              <div className="flex gap-2">
                <Input value={hardTagInput} onChange={(e) => setHardTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addHardTag(hardTagInput); } }}
                  placeholder="Введите тег и нажмите Enter" className="text-sm flex-1" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                <button onClick={() => addHardTag(hardTagInput)} className="px-3 rounded-lg text-xs font-medium" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}>+</button>
              </div>
              {hardForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hardForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                      {tag}
                      <button onClick={() => setHardForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} className="hover:opacity-60 transition-opacity">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Approvals */}
            <div className="flex gap-4">
              <button onClick={() => setHardForm((f) => ({ ...f, approved_ib: !f.approved_ib }))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1" style={{ background: hardForm.approved_ib ? "rgba(99,176,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${hardForm.approved_ib ? "rgba(99,176,255,0.35)" : "rgba(255,255,255,0.08)"}`, color: hardForm.approved_ib ? "#63b0ff" : "rgba(180,200,230,0.4)" }}>
                <Icon name={hardForm.approved_ib ? "ShieldCheck" : "Shield"} size={16} />
                Согласован с ИБ
              </button>
              <button onClick={() => setHardForm((f) => ({ ...f, approved_it: !f.approved_it }))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1" style={{ background: hardForm.approved_it ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${hardForm.approved_it ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"}`, color: hardForm.approved_it ? "#34d399" : "rgba(180,200,230,0.4)" }}>
                <Icon name={hardForm.approved_it ? "BadgeCheck" : "Badge"} size={16} />
                Согласован с ИТ
              </button>
            </div>

            {hardSaveError && <p className="text-xs py-2 px-3 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>{hardSaveError}</p>}
          </div>

          <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Button variant="outline" className="flex-1" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }} onClick={() => setHardDialogOpen(false)}>Отмена</Button>
            <button onClick={handleSaveHard} disabled={hardSaving} className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: hardSaving ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(249,115,22,0.3))", border: "1px solid rgba(239,68,68,0.3)", color: hardSaving ? "rgba(180,200,230,0.3)" : "#fca5a5" }}>
              {hardSaving ? <><Icon name="Loader" size={14} className="animate-spin" /> Сохранение...</> : <><Icon name="Save" size={14} /> {editingHard ? "Сохранить" : "Создать харденинг"}</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Hardening Delete Confirm ── */}
      <Dialog open={!!deleteHardId} onOpenChange={(o) => { if (!o) setDeleteHardId(null); }}>
        <DialogContent className="max-w-sm border" style={{ background: "#0b1628", borderColor: "rgba(239,68,68,0.2)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} style={{ color: "#ef4444" }} />
              Удалить харденинг?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "rgba(180,200,230,0.7)" }}>
            Харденинг <span className="font-mono text-white">{deleteHardId}</span> будет удалён без возможности восстановления.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }} onClick={() => setDeleteHardId(null)}>Отмена</Button>
            <button onClick={() => handleDeleteHard(deleteHardId!)} className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
              <Icon name="Trash2" size={14} /> Удалить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Hardening View Sheet ── */}
      <Dialog open={!!viewHard} onOpenChange={(o) => { if (!o) setViewHard(null); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}>
          {viewHard && (() => {
            const sm = HARDENING_STATUS_META[viewHard.status];
            const linkedTsol = techSolutions.find((s) => s.id === viewHard.tech_solution_id);
            const linkedReqs = reqs.filter((r) => linkedTsol && (r.technology_id === linkedTsol.technology_ids?.[0] || linkedTsol.technology_ids?.includes(r.technology_id)));
            return (
              <>
                <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 z-10" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>{viewHard.id}</span>
                        <span className="text-xs font-mono" style={{ color: "rgba(180,200,230,0.35)" }}>v{viewHard.version}</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                          <Icon name={sm.icon as Parameters<typeof Icon>[0]["name"]} size={10} />
                          {viewHard.status}
                        </div>
                      </div>
                      <DialogTitle className="text-white text-lg font-semibold">{viewHard.name}</DialogTitle>
                      {linkedTsol && (
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgba(99,176,255,0.7)" }}>
                          <Icon name="Link2" size={11} /> Техническое решение: {linkedTsol.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {viewHard.approved_ib && <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(99,176,255,0.08)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>ИБ ✓</span>}
                      {viewHard.approved_it && <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>ИТ ✓</span>}
                    </div>
                  </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5">
                  {/* Meta */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "rgba(180,200,230,0.4)" }}>Автор</p>
                      <p className="text-sm text-white">{viewHard.author || "—"}</p>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "rgba(180,200,230,0.4)" }}>Дата создания</p>
                      <p className="text-sm text-white">{viewHard.created_at ? new Date(viewHard.created_at).toLocaleDateString("ru-RU") : "—"}</p>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "rgba(180,200,230,0.4)" }}>Дата изменения</p>
                      <p className="text-sm text-white">{viewHard.updated_at ? new Date(viewHard.updated_at).toLocaleDateString("ru-RU") : "—"}</p>
                    </div>
                  </div>

                  {/* Approvals */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: viewHard.approved_ib ? "rgba(99,176,255,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${viewHard.approved_ib ? "rgba(99,176,255,0.25)" : "rgba(255,255,255,0.05)"}` }}>
                      <Icon name={viewHard.approved_ib ? "ShieldCheck" : "ShieldOff"} size={20} style={{ color: viewHard.approved_ib ? "#63b0ff" : "rgba(180,200,230,0.2)" }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: viewHard.approved_ib ? "#63b0ff" : "rgba(180,200,230,0.3)" }}>Согласован с ИБ</p>
                        <p className="text-[10px]" style={{ color: "rgba(180,200,230,0.3)" }}>{viewHard.approved_ib ? "Да" : "Нет"}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: viewHard.approved_it ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${viewHard.approved_it ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.05)"}` }}>
                      <Icon name={viewHard.approved_it ? "BadgeCheck" : "Badge"} size={20} style={{ color: viewHard.approved_it ? "#34d399" : "rgba(180,200,230,0.2)" }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: viewHard.approved_it ? "#34d399" : "rgba(180,200,230,0.3)" }}>Согласован с ИТ</p>
                        <p className="text-[10px]" style={{ color: "rgba(180,200,230,0.3)" }}>{viewHard.approved_it ? "Да" : "Нет"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Deploy Hardening */}
                  {viewHard.deploy_hardening && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: "rgba(249,115,22,0.7)" }}>Харденинг развёртывания</p>
                      <pre className="text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed" style={{ background: "rgba(15,22,41,0.95)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {viewHard.deploy_hardening}
                      </pre>
                    </div>
                  )}

                  {/* Functional Hardening */}
                  {viewHard.functional_hardening && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: "rgba(239,68,68,0.7)" }}>Харденинг функционала</p>
                      <pre className="text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed" style={{ background: "rgba(15,22,41,0.95)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {viewHard.functional_hardening}
                      </pre>
                    </div>
                  )}

                  {/* Linked TechSolution info */}
                  {linkedTsol && (
                    <div className="p-4 rounded-xl" style={{ background: "rgba(99,176,255,0.05)", border: "1px solid rgba(99,176,255,0.15)" }}>
                      <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: "rgba(99,176,255,0.7)" }}>Техническое решение</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>Домен</p>
                          <p className="text-sm text-white">{linkedTsol.tech_domain || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px]" style={{ color: "rgba(180,200,230,0.4)" }}>Статус</p>
                          <p className="text-sm text-white">{linkedTsol.status}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {viewHard.tags && viewHard.tags.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Теги</p>
                      <div className="flex flex-wrap gap-2">
                        {viewHard.tags.map((tag) => <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{tag}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Related Requirements table */}
                  {linkedTsol && linkedReqs.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: "rgba(180,200,230,0.4)" }}>Связанные требования</p>
                      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>ID</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Название</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Тип</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Критичность</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Статус</th>
                            </tr>
                          </thead>
                          <tbody>
                            {linkedReqs.map((r, i) => (
                              <tr key={r.id} style={{ borderBottom: i < linkedReqs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                <td className="px-3 py-2 font-mono" style={{ color: "#f59e0b" }}>{r.id}</td>
                                <td className="px-3 py-2 text-white">{r.name}</td>
                                <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.6)" }}>{r.req_type}</td>
                                <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.6)" }}>{r.criticality}</td>
                                <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.6)" }}>{r.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button onClick={() => { setViewHard(null); openEditHard(viewHard); }} className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                      <Icon name="Pencil" size={14} /> Редактировать
                    </button>
                    <button onClick={() => { setViewHard(null); setDeleteHardId(viewHard.id); }} className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Arch Template Create/Edit Dialog ── */}
      <Dialog open={archDialogOpen} onOpenChange={(o) => { if (!o) setArchDialogOpen(false); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 z-10" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <Icon name="LayoutTemplate" size={15} style={{ color: "#22d3ee" }} />
              </div>
              {editingArch ? "Редактировать шаблон архитектуры" : "Новый шаблон типовой архитектуры"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            {/* ID + Version */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID шаблона *</Label>
                <Input value={archForm.id} onChange={(e) => setArchForm((f) => ({ ...f, id: e.target.value }))} className="font-mono text-sm" placeholder="ArchSec-001" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input value={archForm.version} onChange={(e) => setArchForm((f) => ({ ...f, version: e.target.value }))} className="font-mono text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название шаблона *</Label>
              <Input
                value={archForm.name}
                onChange={(e) => setArchForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Название типовой архитектуры безопасности"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
              {archTemplates.filter((a) => a.name === archForm.name && (!editingArch || a.id !== editingArch.id)).length > 0 && (
                <p className="text-xs" style={{ color: "#f87171" }}>Шаблон с таким названием уже существует</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Краткое описание</Label>
              <textarea value={archForm.description} onChange={(e) => setArchForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} placeholder="Описание типовой архитектуры..." />
            </div>

            {/* Status + Author */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <select value={archForm.status} onChange={(e) => setArchForm((f) => ({ ...f, status: e.target.value as ArchTemplateStatus }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                  {ARCH_TEMPLATE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Автор</Label>
                <Input value={archForm.author} onChange={(e) => setArchForm((f) => ({ ...f, author: e.target.value }))} style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {archForm.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.1)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                    #{tag}
                    <button onClick={() => setArchForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} className="hover:opacity-70 ml-0.5"><Icon name="X" size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={archTagInput} onChange={(e) => setArchTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && archTagInput.trim()) { setArchForm((f) => ({ ...f, tags: [...f.tags, archTagInput.trim()] })); setArchTagInput(""); e.preventDefault(); } }} placeholder="Введите тег и нажмите Enter" className="text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                <button onClick={() => { if (archTagInput.trim()) { setArchForm((f) => ({ ...f, tags: [...f.tags, archTagInput.trim()] })); setArchTagInput(""); } }} className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(99,176,255,0.1)", border: "1px solid rgba(99,176,255,0.2)", color: "#63b0ff" }}>+ Добавить</button>
              </div>
            </div>

            {/* Tech solutions link */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Связанные технические решения</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {archForm.tech_solution_ids.map((tsId) => {
                  const ts = techSolutions.find((s) => s.id === tsId);
                  return (
                    <span key={tsId} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                      {ts ? ts.name : tsId}
                      <button onClick={() => setArchForm((f) => ({ ...f, tech_solution_ids: f.tech_solution_ids.filter((id) => id !== tsId) }))} className="hover:opacity-70 ml-0.5"><Icon name="X" size={10} /></button>
                    </span>
                  );
                })}
              </div>
              <div className="relative">
                <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={archTsolSearch} onChange={(e) => setArchTsolSearch(e.target.value)} placeholder="Поиск техрешения для привязки..." className="pl-9 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              {archTsolSearch && (
                <div className="rounded-lg overflow-hidden border max-h-40 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {techSolutions.filter((s) => !archForm.tech_solution_ids.includes(s.id) && ((s.name||"").toLowerCase().includes(archTsolSearch.toLowerCase()) || (s.id||"").toLowerCase().includes(archTsolSearch.toLowerCase()))).slice(0, 8).map((s) => (
                    <button key={s.id} onClick={() => { setArchForm((f) => ({ ...f, tech_solution_ids: [...f.tech_solution_ids, s.id] })); setArchTsolSearch(""); }} className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-all" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "rgba(210,225,245,0.8)" }}>{s.name}</span>
                      <span className="font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>{s.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mermaid diagrams */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Диаграммы Mermaid</Label>
                <button
                  onClick={() => setArchForm((f) => ({ ...f, diagrams: [...f.diagrams, { id: `diag-${Date.now()}`, name: `Диаграмма ${f.diagrams.length + 1}`, content: "graph TD\n    A[Начало] --> B[Конец]" }] }))}
                  className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#22d3ee" }}
                >
                  <Icon name="Plus" size={11} /> Добавить диаграмму
                </button>
              </div>
              {archForm.diagrams.map((diag, idx) => (
                <div key={diag.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="px-3 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Input
                      value={diag.name}
                      onChange={(e) => setArchForm((f) => ({ ...f, diagrams: f.diagrams.map((d, i) => i === idx ? { ...d, name: e.target.value } : d) }))}
                      className="text-xs h-7 flex-1"
                      style={{ background: "transparent", border: "none", color: "white" }}
                    />
                    <button onClick={() => setArchForm((f) => ({ ...f, diagrams: f.diagrams.filter((_, i) => i !== idx) }))} className="p-1 rounded hover:bg-red-500/10">
                      <Icon name="Trash2" size={12} style={{ color: "#f87171" }} />
                    </button>
                  </div>
                  <textarea
                    value={diag.content}
                    onChange={(e) => setArchForm((f) => ({ ...f, diagrams: f.diagrams.map((d, i) => i === idx ? { ...d, content: e.target.value } : d) }))}
                    rows={6}
                    className="w-full px-3 py-2 text-xs font-mono outline-none resize-y"
                    style={{ background: "rgba(5,10,20,0.9)", color: "#22d3ee" }}
                    placeholder="graph TD&#10;    A[Начало] --> B[Конец]"
                  />
                  <div className="px-3 py-2" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Предпросмотр:</p>
                    <MermaidViewer content={diag.content} />
                  </div>
                </div>
              ))}
            </div>

            {/* Approvals */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={archForm.approved_ib} onChange={(e) => setArchForm((f) => ({ ...f, approved_ib: e.target.checked }))} className="sr-only" />
                  <div className="w-10 h-5 rounded-full transition-all" style={{ background: archForm.approved_ib ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)", border: `1px solid ${archForm.approved_ib ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.12)"}` }}>
                    <div className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all" style={{ background: archForm.approved_ib ? "#22c55e" : "rgba(180,200,230,0.4)", left: archForm.approved_ib ? "calc(100% - 18px)" : "2px" }} />
                  </div>
                </div>
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.7)" }}>Согласован с ИБ</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={archForm.approved_it} onChange={(e) => setArchForm((f) => ({ ...f, approved_it: e.target.checked }))} className="sr-only" />
                  <div className="w-10 h-5 rounded-full transition-all" style={{ background: archForm.approved_it ? "rgba(99,176,255,0.3)" : "rgba(255,255,255,0.08)", border: `1px solid ${archForm.approved_it ? "rgba(99,176,255,0.5)" : "rgba(255,255,255,0.12)"}` }}>
                    <div className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all" style={{ background: archForm.approved_it ? "#63b0ff" : "rgba(180,200,230,0.4)", left: archForm.approved_it ? "calc(100% - 18px)" : "2px" }} />
                  </div>
                </div>
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.7)" }}>Согласован с ИТ</span>
              </label>
            </div>

            {archSaveError && <p className="text-xs" style={{ color: "#f87171" }}>{archSaveError}</p>}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <button onClick={() => setArchDialogOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>Отмена</button>
            <button
              onClick={handleSaveArch}
              disabled={archSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee" }}
            >
              {archSaving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Save" size={14} />}
              {editingArch ? "Сохранить изменения" : "Создать шаблон"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Arch Template Delete Confirm ── */}
      <Dialog open={!!deleteArchId} onOpenChange={(o) => { if (!o) setDeleteArchId(null); }}>
        <DialogContent className="max-w-sm border" style={{ background: "#0b1628", borderColor: "rgba(239,68,68,0.25)" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Удалить шаблон?</DialogTitle>
          </DialogHeader>
          <p className="text-sm mt-2" style={{ color: "rgba(180,200,230,0.6)" }}>Это действие необратимо. Шаблон <span className="font-mono text-white">{deleteArchId}</span> будет удалён.</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteArchId(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.6)" }}>Отмена</button>
            <button onClick={() => deleteArchId && handleDeleteArch(deleteArchId)} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>Удалить</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Arch Template View Dialog ── */}
      <Dialog open={!!viewArch} onOpenChange={(o) => { if (!o) setViewArch(null); }}>
        <DialogContent className="p-0 overflow-hidden border flex flex-col" style={{ background: "#080f1e", borderColor: "rgba(255,255,255,0.08)", width: "min(1000px, 96vw)", maxWidth: "none", maxHeight: "93vh" }}>
          {viewArch && (() => {
            const sm = ARCH_TEMPLATE_STATUS_META[viewArch.status] ?? ARCH_TEMPLATE_STATUS_META["В разработке"];
            const linkedTsols = techSolutions.filter((ts) => (viewArch.tech_solution_ids||[]).includes(ts.id));
            const linkedReqs = linkedTsols.flatMap((ts) => reqs.filter((r) => ts.technology_ids?.includes(r.technology_id)));
            const uniqueReqs = linkedReqs.filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx);
            const filteredViewReqs = uniqueReqs.filter((r) => {
              const q = viewArchReqSearch.toLowerCase();
              const matchQ = !q || (r.title||"").toLowerCase().includes(q) || (r.code||"").toLowerCase().includes(q) || (r.category||"").toLowerCase().includes(q) || (r.description||"").toLowerCase().includes(q);
              const matchLevel = viewArchReqFilterLevel === "Все" || r.level === viewArchReqFilterLevel;
              const matchCat = viewArchReqFilterCat === "Все" || r.category === viewArchReqFilterCat;
              return matchQ && matchLevel && matchCat;
            });
            const reqCategories = [...new Set(uniqueReqs.map((r) => r.category).filter(Boolean))];
            return (
              <>
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}>{viewArch.id}</span>
                        <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>v{viewArch.version}</span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}>
                          <Icon name={sm.icon} size={11} />{viewArch.status}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-white leading-snug">{viewArch.name}</h2>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setViewArch(null); openEditArch(viewArch); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#22d3ee" }}>
                        <Icon name="Pencil" size={12} /> Редактировать
                      </button>
                      <button onClick={() => { setViewArch(null); setDeleteArchId(viewArch.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                        <Icon name="Trash2" size={12} /> Удалить
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Meta grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Автор</div>
                      <div className="text-sm" style={{ color: "rgba(210,225,245,0.85)" }}>{viewArch.author || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Версия</div>
                      <div className="text-sm" style={{ color: "rgba(210,225,245,0.85)" }}>{viewArch.version}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Дата создания</div>
                      <div className="text-sm" style={{ color: "rgba(210,225,245,0.85)" }}>{viewArch.created_at ? new Date(viewArch.created_at).toLocaleDateString("ru-RU") : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Дата изменения</div>
                      <div className="text-sm" style={{ color: "rgba(210,225,245,0.85)" }}>{viewArch.updated_at ? new Date(viewArch.updated_at).toLocaleDateString("ru-RU") : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Согласован с ИБ</div>
                      <span className="flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded" style={{ background: viewArch.approved_ib ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)", color: viewArch.approved_ib ? "#22c55e" : "#6b7280", border: `1px solid ${viewArch.approved_ib ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.2)"}` }}>
                        <Icon name={viewArch.approved_ib ? "ShieldCheck" : "ShieldOff"} size={11} />
                        {viewArch.approved_ib ? "Согласован" : "Не согласован"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Согласован с ИТ</div>
                      <span className="flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded" style={{ background: viewArch.approved_it ? "rgba(99,176,255,0.1)" : "rgba(107,114,128,0.1)", color: viewArch.approved_it ? "#63b0ff" : "#6b7280", border: `1px solid ${viewArch.approved_it ? "rgba(99,176,255,0.25)" : "rgba(107,114,128,0.2)"}` }}>
                        <Icon name={viewArch.approved_it ? "Server" : "ServerOff"} size={11} />
                        {viewArch.approved_it ? "Согласован" : "Не согласован"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {viewArch.description && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Описание</div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.75)" }}>{viewArch.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {viewArch.tags && viewArch.tags.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Теги</div>
                      <div className="flex flex-wrap gap-1.5">
                        {viewArch.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.7)", border: "1px solid rgba(99,176,255,0.15)" }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked tech solutions (tech domains) */}
                  {linkedTsols.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Связанные технические решения</div>
                      <div className="flex flex-wrap gap-2">
                        {linkedTsols.map((ts) => (
                          <span key={ts.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                            <Icon name="Lightbulb" size={11} />
                            {ts.name}
                            <span className="font-mono text-[10px]" style={{ color: "rgba(167,139,250,0.5)" }}>{ts.id}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mermaid diagrams tabs */}
                  {viewArch.diagrams && viewArch.diagrams.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(180,200,230,0.35)" }}>Диаграммы архитектуры</div>
                      {/* Tabs */}
                      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                        {viewArch.diagrams.map((diag, idx) => (
                          <button
                            key={diag.id}
                            onClick={() => setArchActiveDiagramTab(idx)}
                            className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all"
                            style={{
                              background: archActiveDiagramTab === idx ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${archActiveDiagramTab === idx ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.08)"}`,
                              color: archActiveDiagramTab === idx ? "#22d3ee" : "rgba(180,200,230,0.5)",
                            }}
                          >
                            <Icon name="GitBranch" size={11} className="inline mr-1" />
                            {diag.name}
                          </button>
                        ))}
                      </div>
                      {/* Active diagram */}
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-xs font-medium text-white">{viewArch.diagrams[archActiveDiagramTab]?.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee" }}>mermaid</span>
                        </div>
                        <div className="p-4">
                          <MermaidViewer content={viewArch.diagrams[archActiveDiagramTab]?.content || ""} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requirements table from linked tech solutions */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(180,200,230,0.35)" }}>
                      Требования из связанных технических решений
                      {uniqueReqs.length > 0 && <span className="ml-2 normal-case text-[10px]" style={{ color: "rgba(180,200,230,0.3)" }}>({uniqueReqs.length} всего)</span>}
                    </div>
                    {uniqueReqs.length === 0 ? (
                      <p className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Требования появятся после привязки технических решений с заполненными технологиями</p>
                    ) : (
                      <>
                        {/* Req filters */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="relative flex-1 min-w-40">
                            <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                            <Input value={viewArchReqSearch} onChange={(e) => setViewArchReqSearch(e.target.value)} placeholder="Поиск по требованиям..." className="pl-8 text-xs h-8" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
                          </div>
                          <select value={viewArchReqFilterLevel} onChange={(e) => setViewArchReqFilterLevel(e.target.value)} className="text-xs rounded-lg px-2 py-1.5 outline-none h-8" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: viewArchReqFilterLevel === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                            <option value="Все">Все уровни</option>
                            {["Критический","Высокий","Средний","Низкий"].map((l) => <option key={l} value={l}>{l}</option>)}
                          </select>
                          {reqCategories.length > 0 && (
                            <select value={viewArchReqFilterCat} onChange={(e) => setViewArchReqFilterCat(e.target.value)} className="text-xs rounded-lg px-2 py-1.5 outline-none h-8" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: viewArchReqFilterCat === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                              <option value="Все">Все категории</option>
                              {reqCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          )}
                        </div>
                        {/* Table */}
                        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Код</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Название</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Категория</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Уровень</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Стандарт</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredViewReqs.map((r, idx) => {
                                const levelMeta: Record<string, { color: string; bg: string }> = {
                                  "Критический": { color: "#f87171", bg: "rgba(239,68,68,0.1)" },
                                  "Высокий": { color: "#fb923c", bg: "rgba(249,115,22,0.1)" },
                                  "Средний": { color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
                                  "Низкий": { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
                                };
                                const lm = levelMeta[r.level] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
                                return (
                                  <tr key={r.id} style={{ borderBottom: idx < filteredViewReqs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                    <td className="px-3 py-2 font-mono" style={{ color: "#63b0ff" }}>{r.code}</td>
                                    <td className="px-3 py-2" style={{ color: "rgba(210,225,245,0.8)" }}>{r.title}</td>
                                    <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.55)" }}>{r.category}</td>
                                    <td className="px-3 py-2">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: lm.bg, color: lm.color }}>{r.level}</span>
                                    </td>
                                    <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.45)" }}>{r.standard || "—"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {filteredViewReqs.length === 0 && (
                            <div className="py-8 text-center text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>Требований не найдено</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Product Create/Edit Dialog ── */}
      <Dialog open={prodDialogOpen} onOpenChange={(o) => { if (!o) setProdDialogOpen(false); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 z-10" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Icon name="Package" size={15} style={{ color: "#fbbf24" }} />
              </div>
              {editingProd ? "Редактировать продукт" : "Новый продукт"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            {/* ID + Version */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>ID продукта *</Label>
                <Input value={prodForm.id} onChange={(e) => setProdForm((f) => ({ ...f, id: e.target.value }))} className="font-mono text-sm" placeholder="BizProd-001" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
                <Input value={prodForm.version} onChange={(e) => setProdForm((f) => ({ ...f, version: e.target.value }))} className="font-mono text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название продукта *</Label>
              <Input value={prodForm.name} onChange={(e) => setProdForm((f) => ({ ...f, name: e.target.value }))} placeholder="Название бизнес-продукта" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              {products.filter((p) => p.name === prodForm.name && (!editingProd || p.id !== editingProd.id)).length > 0 && (
                <p className="text-xs" style={{ color: "#f87171" }}>Продукт с таким названием уже существует</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Краткое описание</Label>
              <textarea value={prodForm.description} onChange={(e) => setProdForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} placeholder="Описание продукта..." />
            </div>

            {/* Status + Author + CMDB */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
                <select value={prodForm.status} onChange={(e) => setProdForm((f) => ({ ...f, status: e.target.value as ProductStatus }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                  {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Автор</Label>
                <Input value={prodForm.author} onChange={(e) => setProdForm((f) => ({ ...f, author: e.target.value }))} style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Мнемоника CMDB</Label>
                <Input value={prodForm.cmdb_mnemonic} onChange={(e) => setProdForm((f) => ({ ...f, cmdb_mnemonic: e.target.value }))} className="font-mono text-sm" placeholder="APP-001" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Теги</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {prodForm.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.1)", color: "#63b0ff", border: "1px solid rgba(99,176,255,0.2)" }}>
                    #{tag}<button onClick={() => setProdForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} className="hover:opacity-70 ml-0.5"><Icon name="X" size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={prodTagInput} onChange={(e) => setProdTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && prodTagInput.trim()) { setProdForm((f) => ({ ...f, tags: [...f.tags, prodTagInput.trim()] })); setProdTagInput(""); e.preventDefault(); } }} placeholder="Введите тег и нажмите Enter" className="text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                <button onClick={() => { if (prodTagInput.trim()) { setProdForm((f) => ({ ...f, tags: [...f.tags, prodTagInput.trim()] })); setProdTagInput(""); } }} className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(99,176,255,0.1)", border: "1px solid rgba(99,176,255,0.2)", color: "#63b0ff" }}>+ Добавить</button>
              </div>
            </div>

            {/* Arch templates link */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Связанные типовые архитектуры</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {prodForm.arch_template_ids.map((aid) => {
                  const a = archTemplates.find((t) => t.id === aid);
                  return (
                    <span key={aid} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono" style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}>
                      {a ? a.name : aid}<button onClick={() => setProdForm((f) => ({ ...f, arch_template_ids: f.arch_template_ids.filter((id) => id !== aid) }))} className="hover:opacity-70 ml-0.5"><Icon name="X" size={10} /></button>
                    </span>
                  );
                })}
              </div>
              <div className="relative">
                <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                <Input value={prodArchSearch} onChange={(e) => setProdArchSearch(e.target.value)} placeholder="Поиск архитектуры для привязки..." className="pl-9 text-sm" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              </div>
              {prodArchSearch && (
                <div className="rounded-lg overflow-hidden border max-h-40 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {archTemplates.filter((a) => !prodForm.arch_template_ids.includes(a.id) && ((a.name||"").toLowerCase().includes(prodArchSearch.toLowerCase()) || (a.id||"").toLowerCase().includes(prodArchSearch.toLowerCase()))).slice(0, 8).map((a) => (
                    <button key={a.id} onClick={() => { setProdForm((f) => ({ ...f, arch_template_ids: [...f.arch_template_ids, a.id] })); setProdArchSearch(""); }} className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-all" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "rgba(210,225,245,0.8)" }}>{a.name}</span>
                      <span className="font-mono" style={{ color: "rgba(180,200,230,0.4)" }}>{a.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Изображение продукта</Label>
              <div className="flex items-start gap-3">
                {prodImagePreview && (
                  <div className="relative shrink-0">
                    <img src={prodImagePreview} alt="preview" className="w-24 h-24 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    <button onClick={() => setProdImagePreview("")} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.8)" }}>
                      <Icon name="X" size={10} className="text-white" />
                    </button>
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all py-4" style={{ border: "2px dashed rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.04)" }}>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setProdImagePreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                  <Icon name="ImagePlus" size={20} style={{ color: "rgba(245,158,11,0.5)" }} />
                  <p className="text-xs text-center" style={{ color: "rgba(180,200,230,0.4)" }}>Нажмите для загрузки изображения<br/><span style={{ color: "rgba(180,200,230,0.25)" }}>PNG, JPG, WEBP до 2 МБ</span></p>
                </label>
              </div>
            </div>

            {/* Mermaid diagrams */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Диаграммы Mermaid</Label>
                <button onClick={() => setProdForm((f) => ({ ...f, diagrams: [...f.diagrams, { id: `diag-${Date.now()}`, name: `Диаграмма ${f.diagrams.length + 1}`, content: "graph TD\n    A[Начало] --> B[Конец]" }] }))} className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>
                  <Icon name="Plus" size={11} /> Добавить диаграмму
                </button>
              </div>
              {prodForm.diagrams.map((diag, idx) => (
                <div key={diag.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="px-3 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Input value={diag.name} onChange={(e) => setProdForm((f) => ({ ...f, diagrams: f.diagrams.map((d, i) => i === idx ? { ...d, name: e.target.value } : d) }))} className="text-xs h-7 flex-1" style={{ background: "transparent", border: "none", color: "white" }} />
                    <button onClick={() => setProdForm((f) => ({ ...f, diagrams: f.diagrams.filter((_, i) => i !== idx) }))} className="p-1 rounded hover:bg-red-500/10"><Icon name="Trash2" size={12} style={{ color: "#f87171" }} /></button>
                  </div>
                  <textarea value={diag.content} onChange={(e) => setProdForm((f) => ({ ...f, diagrams: f.diagrams.map((d, i) => i === idx ? { ...d, content: e.target.value } : d) }))} rows={5} className="w-full px-3 py-2 text-xs font-mono outline-none resize-y" style={{ background: "rgba(5,10,20,0.9)", color: "#fbbf24" }} />
                  <div className="px-3 py-2" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] mb-2" style={{ color: "rgba(180,200,230,0.3)" }}>Предпросмотр:</p>
                    <MermaidViewer content={diag.content} />
                  </div>
                </div>
              ))}
            </div>

            {/* Approvals */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={prodForm.approved_ib} onChange={(e) => setProdForm((f) => ({ ...f, approved_ib: e.target.checked }))} className="sr-only" />
                  <div className="w-10 h-5 rounded-full transition-all" style={{ background: prodForm.approved_ib ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)", border: `1px solid ${prodForm.approved_ib ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.12)"}` }}>
                    <div className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all" style={{ background: prodForm.approved_ib ? "#22c55e" : "rgba(180,200,230,0.4)", left: prodForm.approved_ib ? "calc(100% - 18px)" : "2px" }} />
                  </div>
                </div>
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.7)" }}>Согласован с ИБ</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={prodForm.approved_it} onChange={(e) => setProdForm((f) => ({ ...f, approved_it: e.target.checked }))} className="sr-only" />
                  <div className="w-10 h-5 rounded-full transition-all" style={{ background: prodForm.approved_it ? "rgba(99,176,255,0.3)" : "rgba(255,255,255,0.08)", border: `1px solid ${prodForm.approved_it ? "rgba(99,176,255,0.5)" : "rgba(255,255,255,0.12)"}` }}>
                    <div className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all" style={{ background: prodForm.approved_it ? "#63b0ff" : "rgba(180,200,230,0.4)", left: prodForm.approved_it ? "calc(100% - 18px)" : "2px" }} />
                  </div>
                </div>
                <span className="text-xs" style={{ color: "rgba(180,200,230,0.7)" }}>Согласован с ИТ</span>
              </label>
            </div>

            {prodSaveError && <p className="text-xs" style={{ color: "#f87171" }}>{prodSaveError}</p>}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}>
            <button onClick={() => setProdDialogOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "rgba(180,200,230,0.6)" }}>Отмена</button>
            <button onClick={handleSaveProd} disabled={prodSaving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {prodSaving ? <><Icon name="Loader" size={14} className="animate-spin" /> Сохранение...</> : <><Icon name="Save" size={14} />{editingProd ? "Сохранить" : "Создать продукт"}</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Product Delete Confirm ── */}
      <Dialog open={!!deleteProdId} onOpenChange={(o) => { if (!o) setDeleteProdId(null); }}>
        <DialogContent className="max-w-sm border" style={{ background: "#0b1628", borderColor: "rgba(239,68,68,0.25)" }}>
          <DialogHeader><DialogTitle className="text-white">Удалить продукт?</DialogTitle></DialogHeader>
          <p className="text-sm mt-2" style={{ color: "rgba(180,200,230,0.6)" }}>Это действие необратимо. Продукт <span className="font-mono text-white">{deleteProdId}</span> будет удалён.</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteProdId(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.6)" }}>Отмена</button>
            <button onClick={() => deleteProdId && handleDeleteProd(deleteProdId)} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>Удалить</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Product View Dialog ── */}
      <Dialog open={!!viewProd} onOpenChange={(o) => { if (!o) setViewProd(null); }}>
        <DialogContent className="p-0 overflow-hidden border flex flex-col" style={{ background: "#080f1e", borderColor: "rgba(255,255,255,0.08)", width: "min(1050px, 96vw)", maxWidth: "none", maxHeight: "93vh" }}>
          {viewProd && (() => {
            const sm = PRODUCT_STATUS_META[viewProd.status] ?? PRODUCT_STATUS_META["В разработке"];
            const linkedArchs = archTemplates.filter((a) => (viewProd.arch_template_ids||[]).includes(a.id));
            const archTsolIds = [...new Set(linkedArchs.flatMap((a) => a.tech_solution_ids||[]))];
            const linkedTsols = techSolutions.filter((ts) => archTsolIds.includes(ts.id));
            const linkedTechDomainIds = [...new Set(linkedTsols.map((ts) => ts.tech_domain).filter(Boolean) as string[])];
            const linkedTechDomains = techDomains.filter((td) => linkedTechDomainIds.includes(td.id));
            const linkedReqs = linkedTsols.flatMap((ts) => reqs.filter((r) => ts.technology_ids?.includes(r.technology_id)));
            const uniqueReqs = linkedReqs.filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx);
            const filteredViewReqs = uniqueReqs.filter((r) => {
              const q = viewProdReqSearch.toLowerCase();
              const matchQ = !q || (r.name||"").toLowerCase().includes(q) || (r.description||"").toLowerCase().includes(q) || (r.req_type||"").toLowerCase().includes(q);
              const matchLevel = viewProdReqFilterLevel === "Все" || r.criticality === viewProdReqFilterLevel;
              const matchCat = viewProdReqFilterCat === "Все" || r.req_type === viewProdReqFilterCat;
              return matchQ && matchLevel && matchCat;
            });
            const reqTypes = [...new Set(uniqueReqs.map((r) => r.req_type).filter(Boolean))];
            const criticalityLevels = [...new Set(uniqueReqs.map((r) => r.criticality).filter(Boolean))];
            return (
              <>
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-5">
                    {viewProd.image_url && (
                      <img src={viewProd.image_url} alt={viewProd.name} className="w-16 h-16 rounded-xl object-cover shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>{viewProd.id}</span>
                        <span className="font-mono text-xs" style={{ color: "rgba(180,200,230,0.4)" }}>v{viewProd.version}</span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}><Icon name={sm.icon} size={11} />{viewProd.status}</span>
                      </div>
                      <h2 className="text-xl font-semibold text-white leading-snug">{viewProd.name}</h2>
                      {viewProd.cmdb_mnemonic && <p className="text-xs mt-1 font-mono" style={{ color: "rgba(180,200,230,0.45)" }}>CMDB: {viewProd.cmdb_mnemonic}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setViewProd(null); openEditProd(viewProd); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}><Icon name="Pencil" size={12} /> Редактировать</button>
                      <button onClick={() => { setViewProd(null); setDeleteProdId(viewProd.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}><Icon name="Trash2" size={12} /> Удалить</button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Meta grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                    {[
                      { label: "Автор", value: viewProd.author || "—" },
                      { label: "Версия", value: viewProd.version },
                      { label: "Мнемоника CMDB", value: viewProd.cmdb_mnemonic || "—" },
                      { label: "Дата создания", value: viewProd.created_at ? new Date(viewProd.created_at).toLocaleDateString("ru-RU") : "—" },
                      { label: "Дата изменения", value: viewProd.updated_at ? new Date(viewProd.updated_at).toLocaleDateString("ru-RU") : "—" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>{item.label}</div>
                        <div className="text-sm" style={{ color: "rgba(210,225,245,0.85)" }}>{item.value}</div>
                      </div>
                    ))}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Согласован с ИБ</div>
                      <span className="flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded" style={{ background: viewProd.approved_ib ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)", color: viewProd.approved_ib ? "#22c55e" : "#6b7280", border: `1px solid ${viewProd.approved_ib ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.2)"}` }}>
                        <Icon name={viewProd.approved_ib ? "ShieldCheck" : "ShieldOff"} size={11} />{viewProd.approved_ib ? "Согласован" : "Не согласован"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(180,200,230,0.35)" }}>Согласован с ИТ</div>
                      <span className="flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded" style={{ background: viewProd.approved_it ? "rgba(99,176,255,0.1)" : "rgba(107,114,128,0.1)", color: viewProd.approved_it ? "#63b0ff" : "#6b7280", border: `1px solid ${viewProd.approved_it ? "rgba(99,176,255,0.25)" : "rgba(107,114,128,0.2)"}` }}>
                        <Icon name={viewProd.approved_it ? "Server" : "ServerOff"} size={11} />{viewProd.approved_it ? "Согласован" : "Не согласован"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {viewProd.description && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Описание</div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(210,225,245,0.75)" }}>{viewProd.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {viewProd.tags && viewProd.tags.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Теги</div>
                      <div className="flex flex-wrap gap-1.5">
                        {viewProd.tags.map((tag) => <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: "rgba(99,176,255,0.08)", color: "rgba(99,176,255,0.7)", border: "1px solid rgba(99,176,255,0.15)" }}>#{tag}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Linked tech domains */}
                  {linkedTechDomains.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Связанные технические домены</div>
                      <div className="flex flex-wrap gap-2">
                        {linkedTechDomains.map((td) => (
                          <span key={td.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <Icon name="Layers" size={11} />{td.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked arch templates */}
                  {linkedArchs.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(180,200,230,0.35)" }}>Связанные типовые архитектуры</div>
                      <div className="flex flex-wrap gap-2">
                        {linkedArchs.map((a) => (
                          <span key={a.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(6,182,212,0.08)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}>
                            <Icon name="LayoutTemplate" size={11} />{a.name}<span className="font-mono text-[10px]" style={{ color: "rgba(6,182,212,0.5)" }}>{a.id}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mermaid diagrams */}
                  {viewProd.diagrams && viewProd.diagrams.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(180,200,230,0.35)" }}>Диаграммы архитектуры</div>
                      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                        {viewProd.diagrams.map((diag, idx) => (
                          <button key={diag.id} onClick={() => setProdActiveDiagramTab(idx)} className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all" style={{ background: prodActiveDiagramTab === idx ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${prodActiveDiagramTab === idx ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, color: prodActiveDiagramTab === idx ? "#fbbf24" : "rgba(180,200,230,0.5)" }}>
                            <Icon name="GitBranch" size={11} className="inline mr-1" />{diag.name}
                          </button>
                        ))}
                      </div>
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-xs font-medium text-white">{viewProd.diagrams[prodActiveDiagramTab]?.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}>mermaid</span>
                        </div>
                        <div className="p-4"><MermaidViewer content={viewProd.diagrams[prodActiveDiagramTab]?.content || ""} /></div>
                      </div>
                    </div>
                  )}

                  {/* Requirements table */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(180,200,230,0.35)" }}>
                      Требования из связанных архитектур
                      {uniqueReqs.length > 0 && <span className="ml-2 normal-case text-[10px]" style={{ color: "rgba(180,200,230,0.3)" }}>({uniqueReqs.length} всего)</span>}
                    </div>
                    {uniqueReqs.length === 0 ? (
                      <p className="text-xs" style={{ color: "rgba(180,200,230,0.3)" }}>Требования появятся после привязки архитектур с заполненными техническими решениями</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="relative flex-1 min-w-40">
                            <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                            <Input value={viewProdReqSearch} onChange={(e) => setViewProdReqSearch(e.target.value)} placeholder="Поиск по требованиям..." className="pl-8 text-xs h-8" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
                          </div>
                          {criticalityLevels.length > 0 && (
                            <select value={viewProdReqFilterLevel} onChange={(e) => setViewProdReqFilterLevel(e.target.value)} className="text-xs rounded-lg px-2 py-1.5 outline-none h-8" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: viewProdReqFilterLevel === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                              <option value="Все">Все уровни</option>
                              {criticalityLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                          )}
                          {reqTypes.length > 0 && (
                            <select value={viewProdReqFilterCat} onChange={(e) => setViewProdReqFilterCat(e.target.value)} className="text-xs rounded-lg px-2 py-1.5 outline-none h-8" style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: viewProdReqFilterCat === "Все" ? "rgba(180,200,230,0.5)" : "white" }}>
                              <option value="Все">Все типы</option>
                              {reqTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Название</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Тип</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Критичность</th>
                                <th className="px-3 py-2.5 text-left font-medium" style={{ color: "rgba(180,200,230,0.5)" }}>Статус</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredViewReqs.map((r, idx) => (
                                <tr key={r.id} style={{ borderBottom: idx < filteredViewReqs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                  <td className="px-3 py-2" style={{ color: "rgba(210,225,245,0.8)" }}>{r.name}</td>
                                  <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.55)" }}>{r.req_type || "—"}</td>
                                  <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: r.criticality === "Критический" ? "rgba(239,68,68,0.1)" : r.criticality === "Высокий" ? "rgba(249,115,22,0.1)" : "rgba(245,158,11,0.1)", color: r.criticality === "Критический" ? "#f87171" : r.criticality === "Высокий" ? "#fb923c" : "#fbbf24" }}>{r.criticality || "—"}</span></td>
                                  <td className="px-3 py-2" style={{ color: "rgba(180,200,230,0.45)" }}>{r.status || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredViewReqs.length === 0 && <div className="py-8 text-center text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>Требований не найдено</div>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}