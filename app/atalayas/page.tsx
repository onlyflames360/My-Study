"use client";

import { useState, useCallback } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import WeekSelector from "@/components/WeekSelector";
import BibleVerse from "@/components/BibleVerse";
import EditableContent from "@/components/EditableContent";
import EmptyState from "@/components/EmptyState";
import type { Atalaya } from "@/lib/types";

export default function AtalayasPage() {
  const [, setWeekId] = useState("");
  const [atalayas, setAtalayas] = useState<Atalaya[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAtalayas = useCallback(async (wId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/atalayas?weekId=${wId}`);
      const data = await res.json();
      setAtalayas(Array.isArray(data) ? data : []);
    } catch {
      setAtalayas([]);
    }
    setLoading(false);
  }, []);

  const handleWeekChange = useCallback(
    (wId: string) => {
      setWeekId(wId);
      loadAtalayas(wId);
    },
    [loadAtalayas]
  );

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await fetch("/api/atalayas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
    } catch {
      // silent
    }
  };

  const articleTitle = atalayas[0]?.article_title || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Atalayas</h2>
        </div>
        <WeekSelector onWeekChange={handleWeekChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : atalayas.length === 0 ? (
        <EmptyState
          title="Sin estudio de La Atalaya"
          description="El estudio de La Atalaya se genera automáticamente cada viernes."
        />
      ) : (
        <div>
          {articleTitle && (
            <div className="bg-primary text-white rounded-xl px-6 py-4 mb-6">
              <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                Artículo de estudio
              </p>
              <h3 className="text-lg font-bold">{articleTitle}</h3>
            </div>
          )}

          <div className="space-y-4">
            {atalayas.map((a) => (
              <div
                key={a.id}
                className="bg-card border border-card-border rounded-xl overflow-hidden"
              >
                <div className="bg-accent px-6 py-3 border-b border-card-border flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 bg-primary text-white text-xs font-bold rounded-full">
                    {a.paragraph_num}
                  </span>
                  <p className="text-sm font-medium flex-1">
                    {a.question || `Párrafo ${a.paragraph_num}`}
                  </p>
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                      Respuesta
                    </h4>
                    <EditableContent
                      content={a.answer || ""}
                      onSave={(v) => handleUpdate(a.id, "answer", v)}
                    />
                  </div>

                  {a.bible_texts?.map((bt, i) => (
                    <BibleVerse key={i} verse={bt} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
