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

const DOMAIN_STATUS_META: Record<DomainStatus, { color: string; bg: string; icon: string }> = {
  "Активен":       { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: "CheckCircle2" },
  "Не активен":    { color: "#6b7280", bg: "rgba(107,114,128,0.12)",  icon: "MinusCircle" },
  "В разработке":  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: "Wrench" },
  "Архив":         { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: "Archive" },
};

const DOMAIN_STATUSES: DomainStatus[] = ["Активен", "Не активен", "В разработке", "Архив"];

interface TechDomainsSectionProps {
  techDomains: TechDomain[];
  techOrgRefs: OrgDomainRef[];
  techLoading: boolean;
  techSectionDesc: string;
  techSectionDescEditing: boolean;
  techSectionDescDraft: string;
  setTechSectionDescDraft: (v: string) => void;
  setTechSectionDescEditing: (v: boolean) => void;
  handleSaveTechSectionDesc: () => void;
  techSearch: string;
  setTechSearch: (v: string) => void;
  filteredTechDomains: TechDomain[];
  viewTech: TechDomain | null;
  setViewTech: (d: TechDomain | null) => void;
  openCreateTech: () => void;
  openEditTech: (d: TechDomain) => void;
  deleteTechId: string | null;
  setDeleteTechId: (id: string | null) => void;
  handleDeleteTech: (id: string) => void;
  // Dialog props:
  techDialogOpen: boolean;
  setTechDialogOpen: (v: boolean) => void;
  editingTech: TechDomain | null;
  techForm: TechDomain;
  setTechForm: (f: TechDomain | ((prev: TechDomain) => TechDomain)) => void;
  techTagInput: string;
  setTechTagInput: (v: string) => void;
  techNameError: string;
  setTechNameError: (v: string) => void;
  techSaveError: string;
  setTechSaveError: (v: string) => void;
  validateTechName: (v: string) => string;
  addTechTag: (raw: string) => void;
  removeTechTag: (tag: string) => void;
  toggleOrgDomain: (id: string) => void;
  handleSaveTech: () => void;
  techSaving: boolean;
}

export default function TechDomainsSection({
  techDomains,
  techOrgRefs,
  techLoading,
  techSectionDesc,
  techSectionDescEditing,
  techSectionDescDraft,
  setTechSectionDescDraft,
  setTechSectionDescEditing,
  handleSaveTechSectionDesc,
  techSearch,
  setTechSearch,
  filteredTechDomains,
  viewTech,
  setViewTech,
  openCreateTech,
  openEditTech,
  deleteTechId,
  setDeleteTechId,
  handleDeleteTech,
  techDialogOpen,
  setTechDialogOpen,
  editingTech,
  techForm,
  setTechForm,
  techTagInput,
  setTechTagInput,
  techNameError,
  setTechNameError,
  techSaveError,
  setTechSaveError,
  validateTechName,
  addTechTag,
  removeTechTag,
  toggleOrgDomain,
  handleSaveTech,
  techSaving,
}: TechDomainsSectionProps) {
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

      {/* Tech Domain Detail Sheet */}
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

      {/* Tech Domain Create/Edit Dialog */}
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

      {/* Tech Domain Delete Confirm */}
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
    </div>
  );
}
