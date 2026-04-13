import { useState, useMemo, useCallback, memo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
const REQ_CRITICALITIES: ReqCriticality[] = ["Критический", "Высокий", "Средний", "Низкий"];
const REQ_STATUSES: ReqStatus[] = ["Активен", "Не активен", "В разработке", "Архив", "Устарел"];
const REQ_ENVS: ReqEnv[] = ["Prod", "ProdLike", "Stage", "Test", "Dev"];
const REQ_STAGES: ReqStage[] = ["Стадия дизайн", "Стадия деплоя", "Стадия рантайм"];
const REQ_INTERACTIONS: ReqInteraction[] = ["Обязательный", "Рекомендуемый", "Не требуется", "Запрещено"];

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
const REQ_INTERACTION_META: Record<ReqInteraction, { color: string }> = {
  "Обязательный":  { color: "#ef4444" },
  "Рекомендуемый": { color: "#f59e0b" },
  "Не требуется":  { color: "#6b7280" },
  "Запрещено":     { color: "#a78bfa" },
};

const INTERACTION_KEYS = [
  { key: "ext_with_iod" as const,    label: "Внешнее с ИОД" },
  { key: "ext_without_iod" as const, label: "Внешнее без ИОД" },
  { key: "int_with_iod" as const,    label: "Внутреннее с ИОД" },
  { key: "int_without_iod" as const, label: "Внутреннее без ИОД" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReq: Req | null;
  initialForm: Req;
  techRefs: { id: string; name: string }[];
  techDomainRefs: { id: string; name: string }[];
  onSave: (form: Req) => Promise<void>;
}

function RequirementFormDialog({ open, onOpenChange, editingReq, initialForm, techRefs, techDomainRefs, onSave }: Props) {
  const [form, setForm] = useState<Req>(initialForm);
  const [techSearch, setTechSearch] = useState("");
  const [techOpen, setTechOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setTechSearch("");
      setTechOpen(false);
      setTagInput("");
      setSaveError("");
    }
  }, [open, initialForm]);

  const handleOpenChange = useCallback((o: boolean) => {
    onOpenChange(o);
  }, [onOpenChange]);

  const filteredTechs = useMemo(() => {
    const q = techSearch.toLowerCase();
    if (!q) return techRefs;
    return techRefs.filter((t) =>
      (t.name || "").toLowerCase().includes(q) || (t.id || "").toLowerCase().includes(q)
    );
  }, [techRefs, techSearch]);

  const setField = useCallback(<K extends keyof Req>(key: K, value: Req[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const toggleEnv = useCallback((env: ReqEnv) => {
    setForm((f) => ({
      ...f,
      environments: f.environments.includes(env)
        ? f.environments.filter((e) => e !== env)
        : [...f.environments, env],
    }));
  }, []);

  const toggleStage = useCallback((s: ReqStage) => {
    setForm((f) => ({
      ...f,
      stages: f.stages.includes(s) ? f.stages.filter((x) => x !== s) : [...f.stages, s],
    }));
  }, []);

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").toLowerCase();
    if (!tag || form.tags.includes(tag) || form.tags.length >= 10) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput("");
  }, [form.tags]);

  const removeTag = useCallback((tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { setSaveError("Название обязательно"); return; }
    setSaving(true); setSaveError("");
    try {
      await onSave(form);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }, [form, onSave]);

  const selectedTechName = useMemo(() => {
    if (!form.technology_id) return null;
    return techRefs.find((t) => t.id === form.technology_id)?.name ?? form.technology_id;
  }, [techRefs, form.technology_id]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden border"
        style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92vh", overflowY: "auto" }}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4 border-b sticky top-0 z-10"
          style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}
        >
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
              {form.id}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Название требования *</Label>
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Например: Многофакторная аутентификация для привилегированных пользователей"
              className="text-sm"
              style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            />
          </div>

          {/* Technology + Tech Domain */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Технология</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setTechOpen((v) => !v); setTechSearch(""); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left"
                  style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: selectedTechName ? "rgba(210,225,245,0.9)" : "rgba(180,200,230,0.35)" }}
                >
                  <span className="truncate">{selectedTechName ?? "— не выбрано —"}</span>
                  <Icon name="ChevronsUpDown" size={13} style={{ color: "rgba(180,200,230,0.4)" }} />
                </button>
                {techOpen && (
                  <div className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,22,41,0.98)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                    <div className="p-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="relative">
                        <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,200,230,0.35)" }} />
                        <input
                          autoFocus
                          value={techSearch}
                          onChange={(e) => setTechSearch(e.target.value)}
                          placeholder="Поиск..."
                          className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => { setField("technology_id", ""); setTechOpen(false); setTechSearch(""); }}
                        className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-all"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <span className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center" style={{ background: !form.technology_id ? "rgba(99,176,255,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${!form.technology_id ? "rgba(99,176,255,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                          {!form.technology_id && <Icon name="Check" size={10} style={{ color: "#63b0ff" }} />}
                        </span>
                        <span style={{ color: "rgba(180,200,230,0.5)" }}>— не выбрано —</span>
                      </button>
                      {filteredTechs.map((t) => {
                        const selected = form.technology_id === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setField("technology_id", t.id); setTechOpen(false); setTechSearch(""); }}
                            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-all"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <span className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center" style={{ background: selected ? "rgba(99,176,255,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${selected ? "rgba(99,176,255,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                              {selected && <Icon name="Check" size={10} style={{ color: "#63b0ff" }} />}
                            </span>
                            <span className="flex-1 truncate" style={{ color: "rgba(210,225,245,0.85)" }}>{t.name}</span>
                          </button>
                        );
                      })}
                      {filteredTechs.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs" style={{ color: "rgba(180,200,230,0.35)" }}>Ничего не найдено</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Технический домен</Label>
              <select
                value={form.tech_domain_id}
                onChange={(e) => setField("tech_domain_id", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: form.tech_domain_id ? "white" : "rgba(180,200,230,0.4)" }}
              >
                <option value="">— не выбрано —</option>
                {techDomainRefs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание требования</Label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              placeholder="Подробное описание требования, его цель и область применения..."
              className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
              style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            />
          </div>

          {/* Type + Criticality + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Тип требования</Label>
              <div className="flex flex-col gap-1.5">
                {REQ_TYPES.map((t) => {
                  const m = REQ_TYPE_META[t]; const active = form.req_type === t;
                  return (
                    <button key={t} onClick={() => setField("req_type", t)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Критичность</Label>
              <div className="flex flex-col gap-1.5">
                {REQ_CRITICALITIES.map((c) => {
                  const m = REQ_CRITICALITY_META[c]; const active = form.criticality === c;
                  return (
                    <button key={c} onClick={() => setField("criticality", c)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Статус</Label>
              <div className="flex flex-col gap-1.5">
                {REQ_STATUSES.map((s) => {
                  const m = REQ_STATUS_META[s]; const active = form.status === s;
                  return (
                    <button key={s} onClick={() => setField("status", s)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "50" : "rgba(255,255,255,0.08)"}`, color: active ? m.color : "rgba(180,200,230,0.5)" }}>
                      <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} size={12} />{s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Control metric + description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Метрика контроля</Label>
              <Input
                value={form.control_metric}
                onChange={(e) => setField("control_metric", e.target.value)}
                placeholder="Например: % систем с MFA"
                className="text-sm"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Описание способа контроля</Label>
              <Input
                value={form.control_description}
                onChange={(e) => setField("control_description", e.target.value)}
                placeholder="Как проверяется выполнение..."
                className="text-sm"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
          </div>

          {/* Version + Norm doc link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Версия</Label>
              <Input
                value={form.version}
                onChange={(e) => setField("version", e.target.value)}
                placeholder="1.0.0"
                className="text-sm font-mono"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Ссылка на нормативный документ</Label>
              <Input
                value={form.norm_doc_link}
                onChange={(e) => setField("norm_doc_link", e.target.value)}
                placeholder="ГОСТ Р 57580, ISO 27001..."
                className="text-sm"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
          </div>

          {/* Environments */}
          <div className="space-y-1.5">
            <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Среда применения</Label>
            <div className="flex gap-2 flex-wrap">
              {REQ_ENVS.map((env) => {
                const active = form.environments.includes(env);
                return (
                  <button key={env} onClick={() => toggleEnv(env)} className="px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all" style={{ background: active ? "rgba(99,176,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(99,176,255,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#63b0ff" : "rgba(180,200,230,0.5)" }}>
                    {active && <Icon name="Check" size={11} className="inline mr-1" />}{env}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-1.5">
            <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Стадия применения</Label>
            <div className="flex gap-2 flex-wrap">
              {REQ_STAGES.map((s) => {
                const active = form.stages.includes(s);
                return (
                  <button key={s} onClick={() => toggleStage(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: active ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#a78bfa" : "rgba(180,200,230,0.5)" }}>
                    {active && <Icon name="Check" size={11} className="inline mr-1" />}{s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Procurement */}
          <div className="space-y-1.5">
            <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Закупки</Label>
            <textarea
              value={form.procurement}
              onChange={(e) => setField("procurement", e.target.value)}
              rows={2}
              placeholder="Требования к закупаемым компонентам, сертификаты, стандарты..."
              className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
              style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            />
          </div>

          {/* Interactions */}
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Взаимодействие</Label>
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {INTERACTION_KEYS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <span className="text-[11px]" style={{ color: "rgba(180,200,230,0.5)" }}>{label}</span>
                  <div className="flex gap-1 flex-wrap">
                    {REQ_INTERACTIONS.map((v) => {
                      const m = REQ_INTERACTION_META[v]; const active = form[key] === v;
                      return (
                        <button key={v} onClick={() => setField(key, v)} className="px-2 py-1 rounded-md text-[11px] font-medium transition-all" style={{ background: active ? `${m.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.color + "40" : "rgba(255,255,255,0.06)"}`, color: active ? m.color : "rgba(180,200,230,0.4)" }}>
                          {v}
                        </button>
                      );
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
                  <button key={v} onClick={() => setField("score_value", v)}
                    className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                    style={{ background: form.score_value === v ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.score_value === v ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, color: form.score_value === v ? "#f59e0b" : "rgba(180,200,230,0.4)" }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "rgba(180,200,230,0.6)" }}>Скор.Вес (1–10)</Label>
              <div className="flex gap-1 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map((v) => (
                  <button key={v} onClick={() => setField("score_weight", v)}
                    className="flex-1 min-w-[2rem] py-2 rounded-lg text-sm font-bold transition-all"
                    style={{ background: form.score_weight === v ? "rgba(99,176,255,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.score_weight === v ? "rgba(99,176,255,0.4)" : "rgba(255,255,255,0.08)"}`, color: form.score_weight === v ? "#63b0ff" : "rgba(180,200,230,0.4)" }}>
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
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="mfa, authn, gost..."
                className="text-sm flex-1"
                style={{ background: "rgba(15,22,41,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
              />
              <button onClick={() => addTag(tagInput)} className="px-3 rounded-lg text-xs font-medium" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }}>
                <Icon name="Plus" size={14} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors"><Icon name="X" size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Icon name="AlertTriangle" size={14} style={{ color: "#ef4444" }} />
              <span className="text-xs" style={{ color: "#ef4444" }}>{saveError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-sm"
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(180,200,230,0.7)" }}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 rounded-lg text-sm font-medium py-2 flex items-center justify-center gap-2 transition-all"
              style={{ background: saving || !form.name.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", color: saving || !form.name.trim() ? "rgba(180,200,230,0.3)" : "white", cursor: saving || !form.name.trim() ? "not-allowed" : "pointer" }}
            >
              {saving && <Icon name="Loader" size={14} className="animate-spin" />}
              {editingReq ? "Сохранить изменения" : "Добавить требование"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(RequirementFormDialog);