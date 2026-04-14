"use client";

import { useState, useCallback } from "react";
import { Mic, Plus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import WeekSelector from "@/components/WeekSelector";
import BibleVerse from "@/components/BibleVerse";
import EditableContent from "@/components/EditableContent";
import EmptyState from "@/components/EmptyState";
import type { Discurso } from "@/lib/types";

export default function DiscursosPage() {
  const [weekId, setWeekId] = useState("");
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [tema, setTema] = useState("");
  const [textos, setTextos] = useState("");
  const [duracion, setDuracion] = useState(10);
  const [puntos, setPuntos] = useState<string[]>([""]);

  const loadDiscursos = useCallback(async (wId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discursos?weekId=${wId}`);
      const data = await res.json();
      setDiscursos(Array.isArray(data) ? data : []);
    } catch {
      setDiscursos([]);
    }
    setLoading(false);
  }, []);

  const handleWeekChange = useCallback(
    (wId: string) => {
      setWeekId(wId);
      loadDiscursos(wId);
    },
    [loadDiscursos]
  );

  const addPunto = () => setPuntos([...puntos, ""]);
  const removePunto = (i: number) =>
    setPuntos(puntos.filter((_, idx) => idx !== i));
  const updatePunto = (i: number, val: string) => {
    const copy = [...puntos];
    copy[i] = val;
    setPuntos(copy);
  };

  const handleGenerate = async () => {
    if (!weekId || !tema || !textos) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/discursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekId,
          tema,
          textos: textos.split(",").map((t) => t.trim()),
          duracion,
          puntos: puntos.filter((p) => p.trim()),
        }),
      });
      const data = await res.json();
      if (data.id) {
        setDiscursos([data, ...discursos]);
        setShowForm(false);
        setTema("");
        setTextos("");
        setDuracion(10);
        setPuntos([""]);
      }
    } catch {
      alert("Error al generar el discurso");
    }
    setGenerating(false);
  };

  const handleUpdateContent = async (
    id: string,
    field: string,
    value: string
  ) => {
    try {
      await fetch("/api/discursos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
    } catch {
      // silent fail on edit save
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mic className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Discursos</h2>
        </div>
        <div className="flex items-center gap-3">
          <WeekSelector onWeekChange={handleWeekChange} />
          {weekId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Nuevo discurso</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tema</label>
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: La importancia de la oración"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Textos bíblicos (separados por coma)
              </label>
              <input
                type="text"
                value={textos}
                onChange={(e) => setTextos(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Filipenses 4:6, 1 Tesalonicenses 5:17"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Duración (minutos)
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuracion(d)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      duracion === d
                        ? "bg-primary text-white border-primary"
                        : "border-card-border hover:border-primary"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Puntos a desarrollar
              </label>
              {puntos.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => updatePunto(i, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Punto ${i + 1}`}
                  />
                  {puntos.length > 1 && (
                    <button
                      onClick={() => removePunto(i)}
                      className="p-2 text-muted hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPunto}
                className="text-sm text-primary hover:text-primary-dark"
              >
                + Agregar punto
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !tema || !textos}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando discurso...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generar discurso
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : discursos.length === 0 ? (
        <EmptyState
          title="Sin discursos"
          description="Crea un nuevo discurso usando el botón 'Nuevo' para comenzar."
        />
      ) : (
        <div className="space-y-6">
          {discursos.map((d) => (
            <div
              key={d.id}
              className="bg-card border border-card-border rounded-xl overflow-hidden"
            >
              <div className="bg-accent px-6 py-4 border-b border-card-border">
                <h3 className="font-bold text-lg">{d.tema}</h3>
                <p className="text-sm text-muted mt-1">
                  Duración: {d.duracion} min &middot; {d.puntos?.length || 0}{" "}
                  puntos
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Introducción */}
                <div>
                  <h4 className="font-semibold text-primary mb-2 uppercase text-sm tracking-wide">
                    Introducción
                  </h4>
                  <EditableContent
                    content={d.introduccion || ""}
                    onSave={(v) =>
                      handleUpdateContent(d.id, "introduccion", v)
                    }
                  />
                </div>

                {/* Bible texts */}
                {d.bible_texts?.map((bt, i) => (
                  <BibleVerse key={i} verse={bt} />
                ))}

                {/* Desarrollo */}
                <div>
                  <h4 className="font-semibold text-primary mb-3 uppercase text-sm tracking-wide">
                    Desarrollo
                  </h4>
                  {d.desarrollo?.map((punto, i) => (
                    <div key={i} className="mb-4 pl-4 border-l-2 border-primary-light">
                      <h5 className="font-medium text-sm mb-1">
                        {i + 1}. {punto.punto}
                      </h5>
                      <EditableContent
                        content={punto.contenido}
                        onSave={(v) => {
                          const newDesarrollo = [...(d.desarrollo || [])];
                          newDesarrollo[i] = { ...newDesarrollo[i], contenido: v };
                          handleUpdateContent(
                            d.id,
                            "desarrollo",
                            JSON.stringify(newDesarrollo)
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Conclusión */}
                <div>
                  <h4 className="font-semibold text-primary mb-2 uppercase text-sm tracking-wide">
                    Conclusión
                  </h4>
                  <EditableContent
                    content={d.conclusion || ""}
                    onSave={(v) => handleUpdateContent(d.id, "conclusion", v)}
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
