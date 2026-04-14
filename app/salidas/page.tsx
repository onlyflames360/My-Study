"use client";

import { useState, useCallback } from "react";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import WeekSelector from "@/components/WeekSelector";
import BibleVerse from "@/components/BibleVerse";
import EditableContent from "@/components/EditableContent";
import EmptyState from "@/components/EmptyState";
import type { Salida } from "@/lib/types";

export default function SalidasPage() {
  const [weekId, setWeekId] = useState("");
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSalidas = useCallback(async (wId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/salidas?weekId=${wId}`);
      const data = await res.json();
      setSalidas(Array.isArray(data) ? data : []);
    } catch {
      setSalidas([]);
    }
    setLoading(false);
  }, []);

  const handleWeekChange = useCallback(
    (wId: string) => {
      setWeekId(wId);
      loadSalidas(wId);
    },
    [loadSalidas]
  );

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await fetch("/api/salidas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
    } catch {
      // silent
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Salidas (Predicación)</h2>
        </div>
        <WeekSelector onWeekChange={handleWeekChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : salidas.length === 0 ? (
        <EmptyState
          title="Sin contenido de salidas"
          description="El contenido de salidas se genera automáticamente cada viernes. Si no hay contenido, ejecuta la generación semanal."
        />
      ) : (
        <div className="space-y-6">
          {salidas.map((s, idx) => (
            <div
              key={s.id}
              className="bg-card border border-card-border rounded-xl overflow-hidden"
            >
              <div className="bg-accent px-6 py-4 border-b border-card-border flex items-center justify-between">
                <h3 className="font-bold">
                  Presentación {idx + 1}
                </h3>
                {s.source_url && (
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {s.source_title || "Ver fuente"}
                  </a>
                )}
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h4 className="font-semibold text-primary mb-2 uppercase text-sm tracking-wide">
                    Introducción
                  </h4>
                  <EditableContent
                    content={s.introduccion || ""}
                    onSave={(v) => handleUpdate(s.id, "introduccion", v)}
                  />
                </div>

                {s.texto_biblico?.map((bt, i) => (
                  <BibleVerse key={i} verse={bt} />
                ))}

                <div>
                  <h4 className="font-semibold text-primary mb-2 uppercase text-sm tracking-wide">
                    Aplicación práctica
                  </h4>
                  <EditableContent
                    content={s.aplicacion || ""}
                    onSave={(v) => handleUpdate(s.id, "aplicacion", v)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
