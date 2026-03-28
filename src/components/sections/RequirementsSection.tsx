import Icon from "@/components/ui/icon";
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

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface RequirementsSectionProps {
  reqs: Req[];
  reqTechRefs: { id: string; name: string }[];
  reqTechDomainRefs: { id: string; name: string }[];
  reqsLoading: boolean;
  reqSectionDesc: string;
  reqSectionDescEditing: boolean;
  reqSectionDescDraft: string;
  setReqSectionDescDraft: (v: string) => void;
  setReqSectionDescEditing: (v: boolean) => void;
  handleSaveReqSectionDesc: () => void;
  reqSearch: string;
  setReqSearch: (v: string) => void;
  reqFilterType: string;
  setReqFilterType: (v: string) => void;
  reqFilterCrit: string;
  setReqFilterCrit: (v: string) => void;
  reqFilterStatus: string;
  setReqFilterStatus: (v: string) => void;
  filteredReqs: Req[];
  viewReq: Req | null;
  setViewReq: (r: Req | null) => void;
  openCreateReq: () => void;
  openEditReq: (r: Req) => void;
  deleteReqId: string | null;
  setDeleteReqId: (id: string | null) => void;
  handleDeleteReq: (id: string) => void;
  // Dialog:
  reqDialogOpen: boolean;
  setReqDialogOpen: (v: boolean) => void;
  editingReq: Req | null;
  reqForm: Req;
  setReqForm: (f: Req | ((prev: Req) => Req)) => void;
  reqTagInput: string;
  setReqTagInput: (v: string) => void;
  reqSaveError: string;
  addReqTag: (raw: string) => void;
  toggleReqEnv: (env: ReqEnv) => void;
  toggleReqStage: (s: ReqStage) => void;
  handleSaveReq: () => void;
  reqSaving: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RequirementsSection(props: RequirementsSectionProps) {
  const {
    reqs,
    reqTechRefs,
    reqTechDomainRefs,
    reqsLoading,
    reqSectionDesc,
    reqSectionDescEditing,
    reqSectionDescDraft,
    setReqSectionDescDraft,
    setReqSectionDescEditing,
    handleSaveReqSectionDesc,
    reqSearch,
    setReqSearch,
    reqFilterType,
    setReqFilterType,
    reqFilterCrit,
    setReqFilterCrit,
    reqFilterStatus,
    setReqFilterStatus,
    filteredReqs,
    viewReq,
    setViewReq,
    openCreateReq,
    openEditReq,
    deleteReqId,
    setDeleteReqId,
    handleDeleteReq,
    reqDialogOpen,
    setReqDialogOpen,
    editingReq,
    reqForm,
    setReqForm,
    reqTagInput,
    setReqTagInput,
    reqSaveError,
    addReqTag,
    toggleReqEnv,
    toggleReqStage,
    handleSaveReq,
    reqSaving,
  } = props;

  return (
    <>
      {/* === REQUIREMENTS SECTION === */}
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
    </>
  );
}
