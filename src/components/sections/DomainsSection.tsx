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

interface DomainsSectionProps {
  domains: OrgDomain[];
  domainsLoading: boolean;
  sectionDesc: string;
  sectionDescEditing: boolean;
  sectionDescDraft: string;
  setSectionDescDraft: (v: string) => void;
  setSectionDescEditing: (v: boolean) => void;
  handleSaveSectionDesc: () => void;
  domainSearch: string;
  setDomainSearch: (v: string) => void;
  filteredDomains: OrgDomain[];
  viewDomain: OrgDomain | null;
  setViewDomain: (d: OrgDomain | null) => void;
  openCreateDomain: () => void;
  openEditDomain: (d: OrgDomain) => void;
  setDeleteDomainId: (id: string | null) => void;
  deleteDomainId: string | null;
  handleDeleteDomain: (id: string) => void;
  // Dialog props:
  domainDialogOpen: boolean;
  setDomainDialogOpen: (v: boolean) => void;
  editingDomain: OrgDomain | null;
  domainForm: OrgDomain;
  setDomainForm: (f: OrgDomain | ((prev: OrgDomain) => OrgDomain)) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  nameError: string;
  setNameError: (v: string) => void;
  validateName: (v: string) => string;
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void;
  handleSaveDomain: () => void;
  domainSaving: boolean;
}

export default function DomainsSection({
  domains,
  domainsLoading,
  sectionDesc,
  sectionDescEditing,
  sectionDescDraft,
  setSectionDescDraft,
  setSectionDescEditing,
  handleSaveSectionDesc,
  domainSearch,
  setDomainSearch,
  filteredDomains,
  viewDomain,
  setViewDomain,
  openCreateDomain,
  openEditDomain,
  setDeleteDomainId,
  deleteDomainId,
  handleDeleteDomain,
  domainDialogOpen,
  setDomainDialogOpen,
  editingDomain,
  domainForm,
  setDomainForm,
  tagInput,
  setTagInput,
  nameError,
  setNameError,
  validateName,
  addTag,
  removeTag,
  handleSaveDomain,
  domainSaving,
}: DomainsSectionProps) {
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
    </div>
  );
}
