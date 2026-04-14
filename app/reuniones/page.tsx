"use client";

import { useState, useCallback } from "react";
import { Users, Loader2 } from "lucide-react";
import WeekSelector from "@/components/WeekSelector";
import BibleVerse from "@/components/BibleVerse";
import EditableContent from "@/components/EditableContent";
import EmptyState from "@/components/EmptyState";
import type { Reunion } from "@/lib/types";

const sectionColors: Record<string, string> = {
  "TESOROS DE LA BIBLIA": "bg-amber-50 border-amber-400",
  "BUSQUEMOS PERLAS ESCONDIDAS": "bg-amber-50 border-amber-400",
  "LECTURA DE LA BIBLIA": "bg-amber-50 border-amber-400",
  "SEAMOS MEJORES MAESTROS": "bg-green-50 border-green-400",
  "NUESTRA VIDA CRISTIANA": "bg-purple-50 border-purple-400",
  "ESTUDIO BÍBLICO DE CONGREGACIÓN": "bg-purple-50 border-purple-400",
  "CANCIÓN Y ORACIÓN": "bg-slate-50 border-slate-400",
  "CANCIÓN FINAL Y ORACIÓN": "bg-slate-50 border-slate-400",
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
            const colorClass =
              sectionColors[section] || "bg-slate-50 border-slate-300";
            return (
              <div
                key={section}
                className={`border-l-4 rounded-r-xl overflow-hidden ${colorClass}`}
              >
                <div className="px-6 py-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                    {section}
                  </h3>
                </div>

                <div className="bg-card">
                  {parts.map((part) => (
                    <div
                      key={part.id}
                      className="px-6 py-4 border-t border-card-border"
                    >
                      {part.title && (
                        <h4 className="font-semibold mb-2">{part.title}</h4>
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
