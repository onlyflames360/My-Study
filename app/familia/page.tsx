"use client";

import { useState, useCallback } from "react";
import { Home, Loader2, Users, Heart } from "lucide-react";
import WeekSelector from "@/components/WeekSelector";
import BibleVerse from "@/components/BibleVerse";
import EditableContent from "@/components/EditableContent";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import type { EstudioFamilia, FamiliaMode } from "@/lib/types";

const SECTIONS: {
  key: keyof EstudioFamilia;
  label: string;
  icon: string;
  familiarOnly?: boolean;
  adultosOnly?: boolean;
}[] = [
  { key: "introduccion", label: "Introducción", icon: "💬" },
  { key: "lectura_biblica", label: "Lectura bíblica", icon: "📖" },
  { key: "ensenanza", label: "Enseñanza", icon: "✨" },
  { key: "aplicacion", label: "Aplicación práctica", icon: "🏠" },
  { key: "preguntas", label: "Preguntas para comentar", icon: "❓" },
  {
    key: "objetivo_espiritual",
    label: "Objetivo espiritual de la semana",
    icon: "🎯",
    adultosOnly: true,
  },
];

export default function FamiliaPage() {
  const [weekId, setWeekId] = useState("");
  const [mode, setMode] = useState<FamiliaMode>("familiar");
  const [estudio, setEstudio] = useState<EstudioFamilia | null>(null);
  const [loading, setLoading] = useState(false);

  const loadEstudio = useCallback(async (wId: string, m: FamiliaMode) => {
    if (!wId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/familia?weekId=${wId}&mode=${m}`);
      const data = await res.json();
      setEstudio(data || null);
    } catch {
      setEstudio(null);
    }
    setLoading(false);
  }, []);

  const handleWeekChange = useCallback(
    (wId: string) => {
      setWeekId(wId);
      loadEstudio(wId, mode);
    },
    [mode, loadEstudio]
  );

  const handleModeChange = (m: FamiliaMode) => {
    setMode(m);
    loadEstudio(weekId, m);
  };

  const handleUpdate = async (field: string, value: string) => {
    if (!estudio) return;
    // Optimistic update
    setEstudio((prev) => (prev ? { ...prev, [field]: value } : prev));
    try {
      await fetch("/api/familia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: estudio.id, [field]: value }),
      });
    } catch {
      // silent
    }
  };

  const visibleSections = SECTIONS.filter((s) => {
    if (s.familiarOnly && mode !== "familiar") return false;
    if (s.adultosOnly && mode !== "adultos") return false;
    return true;
  });

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Home className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Estudio de Familia</h2>
        </div>
        <WeekSelector onWeekChange={handleWeekChange} />
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6 p-1 bg-accent rounded-xl">
        <button
          onClick={() => handleModeChange("familiar")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
            mode === "familiar"
              ? "bg-card shadow-sm text-primary"
              : "text-muted hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Familiar</span>
          <span className="hidden sm:inline text-xs opacity-60">
            (niños / mixto)
          </span>
        </button>
        <button
          onClick={() => handleModeChange("adultos")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
            mode === "adultos"
              ? "bg-card shadow-sm text-primary"
              : "text-muted hover:text-foreground"
          )}
        >
          <Heart className="w-4 h-4" />
          <span>Adultos</span>
          <span className="hidden sm:inline text-xs opacity-60">
            (pareja)
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
        </div>
      ) : !estudio ? (
        <EmptyState
          title="Sin estudio de familia"
          description="El estudio de familia se genera automáticamente cada semana."
        />
      ) : (
        <div className="space-y-4">
          {/* Tema */}
          <div className="bg-primary text-white rounded-xl px-5 py-4">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
              {mode === "familiar" ? "Tema familiar · 20-30 min" : "Tema para adultos · 30-40 min"}
            </p>
            <EditableContent
              content={estudio.tema || ""}
              onSave={(v) => handleUpdate("tema", v)}
              className="text-lg font-bold text-white [&>div]:text-white"
            />
          </div>

          {/* Content sections */}
          {visibleSections.map((sec) => {
            const value = estudio[sec.key] as string | null;
            return (
              <div
                key={sec.key}
                className="bg-card rounded-xl overflow-hidden shadow-sm border border-card-border"
              >
                {/* Section header */}
                <div className="bg-accent px-5 py-3 border-b border-card-border flex items-center gap-2">
                  <span className="text-base">{sec.icon}</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                    {sec.label}
                  </h3>
                </div>

                <div className="px-5 py-4">
                  <EditableContent
                    content={value || ""}
                    onSave={(v) => handleUpdate(sec.key as string, v)}
                  />
                </div>
              </div>
            );
          })}

          {/* Bible verses */}
          {estudio.bible_texts && estudio.bible_texts.length > 0 && (
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-card-border">
              <div className="bg-accent px-5 py-3 border-b border-card-border flex items-center gap-2">
                <span className="text-base">📜</span>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                  Textos bíblicos
                </h3>
              </div>
              <div className="px-5 py-4 space-y-1">
                {estudio.bible_texts.map((bt, i) => (
                  <BibleVerse key={i} verse={bt} />
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <p className="text-xs text-muted text-center pb-2">
            Todo el contenido es editable. Adapta el estudio a tu familia.
          </p>
        </div>
      )}
    </div>
  );
}
