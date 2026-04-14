"use client";

import { useState, useCallback } from "react";
import { Users, Loader2 } from "lucide-react";
import WeekSelector from "@/components/WeekSelector";
import BibleVerse from "@/components/BibleVerse";
import EditableContent from "@/components/EditableContent";
import EmptyState from "@/components/EmptyState";
import type { Reunion } from "@/lib/types";

// Colors match official JW meeting guide section strips
const sectionColors: Record<string, { bg: string; border: string; label: string }> = {
  "TESOROS DE LA BIBLIA":            { bg: "bg-amber-50",   border: "border-amber-600",   label: "text-amber-800" },
  "BUSQUEMOS PERLAS ESCONDIDAS":     { bg: "bg-amber-50",   border: "border-amber-600",   label: "text-amber-800" },
  "LECTURA DE LA BIBLIA":            { bg: "bg-amber-50",   border: "border-amber-600",   label: "text-amber-800" },
  "SEAMOS MEJORES MAESTROS":         { bg: "bg-green-50",   border: "border-green-700",   label: "text-green-900" },
  "NUESTRA VIDA CRISTIANA":          { bg: "bg-purple-50",  border: "border-purple-700",  label: "text-purple-900" },
  "ESTUDIO BÍBLICO DE CONGREGACIÓN": { bg: "bg-purple-50",  border: "border-purple-700",  label: "text-purple-900" },
  "CANCIÓN Y ORACIÓN":               { bg: "bg-slate-50",   border: "border-slate-400",   label: "text-slate-700" },
  "CANCIÓN FINAL Y ORACIÓN":         { bg: "bg-slate-50",   border: "border-slate-400",   label: "text-slate-700" },
};

export default function ReunionesPage() {
  const [, setWeekId] = useState("");
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReuniones = useCallback(async (wId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reuniones?weekId=${wId}`);
      const data = await res.json();
      setReuniones(Array.isArray(data) ? data : []);
    } catch {
      setReuniones([]);
    }
    setLoading(false);
  }, []);

  const handleWeekChange = useCallback(
    (wId: string) => {
      setWeekId(wId);
      loadReuniones(wId);
    },
    [loadReuniones]
  );

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await fetch("/api/reuniones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
    } catch {
      // silent
    }
  };

  // Group by section
  const grouped = reuniones.reduce(
    (acc, r) => {
      if (!acc[r.section]) acc[r.section] = [];
      acc[r.section].push(r);
      return acc;
    },
    {} as Record<string, Reunion[]>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Reuniones</h2>
        </div>
        <WeekSelector onWeekChange={handleWeekChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : reuniones.length === 0 ? (
        <EmptyState
          title="Sin contenido de reuniones"
          description="El programa de reuniones se genera automáticamente cada viernes."
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([section, parts]) => {
            const colors = sectionColors[section] ?? {
              bg: "bg-slate-50",
              border: "border-slate-400",
              label: "text-slate-700",
            };
            return (
              <div
                key={section}
                className="rounded-xl overflow-hidden shadow-sm border border-card-border"
              >
                {/* Section header strip */}
                <div className={`border-l-4 px-5 py-2.5 ${colors.bg} ${colors.border}`}>
                  <h3 className={`font-bold text-xs uppercase tracking-widest ${colors.label}`}>
                    {section}
                  </h3>
                </div>

                <div className="bg-card divide-y divide-card-border">
                  {parts.map((part) => (
                    <div key={part.id} className="px-5 py-4">
                      {part.title && (
                        <h4 className="font-semibold text-sm mb-2 text-foreground">
                          {part.title}
                        </h4>
                      )}

                      {part.content && (
                        <EditableContent
                          content={part.content}
                          onSave={(v) => handleUpdate(part.id, "content", v)}
                        />
                      )}

                      {part.bible_texts?.map((bt, i) => (
                        <BibleVerse key={i} verse={bt} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
