import { generateWithClaude } from "../claude";
import type { BibleText, FamiliaMode } from "../types";
import { getServiceSupabase } from "../supabase";

interface FamiliaContent {
  mode: FamiliaMode;
  tema: string;
  introduccion: string;
  lectura_biblica: string;
  ensenanza: string;
  aplicacion: string;
  preguntas: string;
  objetivo_espiritual: string;
  bible_texts: BibleText[];
}

const PROMPT_FAMILIAR = (startDate: string) => `
Genera un Estudio de Familia – Modo FAMILIAR (niños y adultos) para la semana del ${startDate}.

Devuelve SOLO un objeto JSON con esta estructura exacta:

{
  "tema": "Título claro del tema bíblico",
  "introduccion": "Párrafo breve con pregunta sencilla para captar la atención. Lenguaje simple.",
  "lectura_biblica": "El texto bíblico completo a leer (1-2 versículos con su referencia). Incluye el texto íntegro.",
  "ensenanza": "2-3 ideas principales explicadas de forma sencilla, numeradas. Cada idea en 2-3 frases cortas.",
  "aplicacion": "Aplicación práctica concreta para toda la familia esta semana. Algo que puedan hacer juntos.",
  "preguntas": "3-4 preguntas para comentar en familia. Lenguaje simple, adecuado para niños.",
  "objetivo_espiritual": "",
  "bible_texts": [
    {"reference": "Libro cap:vers", "text": "Texto completo del versículo", "translation": "NVI"}
  ]
}

REGLAS:
- Lenguaje claro y sencillo, apto para niños
- No inventar doctrinas
- Textos bíblicos COMPLETOS (no solo referencia)
- Duración recomendada: 20-30 minutos
- Enfocado en conversación y participación familiar
- Responde SOLO con el JSON
`.trim();

const PROMPT_ADULTOS = (startDate: string) => `
Genera un Estudio de Familia – Modo ADULTOS (pareja / 2 personas) para la semana del ${startDate}.

Devuelve SOLO un objeto JSON con esta estructura exacta:

{
  "tema": "Título reflexivo del tema bíblico",
  "introduccion": "Párrafo introductorio con una pregunta abierta y reflexiva para comenzar el diálogo.",
  "lectura_biblica": "2-3 textos bíblicos completos con sus referencias. Incluye el texto íntegro de cada versículo.",
  "ensenanza": "Análisis del texto: contexto, principio bíblico central y cómo se aplica hoy. Lenguaje reflexivo, no académico. 3-4 párrafos.",
  "aplicacion": "Aplicación práctica como pareja en situaciones reales de la semana. Concreta y alcanzable.",
  "preguntas": "3-4 preguntas abiertas para el diálogo. No de respuesta corta. Que inviten a reflexionar y compartir experiencias.",
  "objetivo_espiritual": "Un objetivo espiritual concreto y específico para trabajar juntos esta semana.",
  "bible_texts": [
    {"reference": "Libro cap:vers", "text": "Texto completo del versículo", "translation": "NVI"},
    {"reference": "Libro cap:vers", "text": "Texto completo del versículo", "translation": "NVI"}
  ]
}

REGLAS:
- Lenguaje reflexivo, no académico ni de sermón
- No inventar doctrinas
- Textos bíblicos COMPLETOS (no solo referencia)
- Duración recomendada: 30-40 minutos
- Preguntas abiertas que fomenten el diálogo genuino
- No convertirlo en una conferencia o clase magistral
- Responde SOLO con el JSON
`.trim();

async function generateForMode(
  startDate: string,
  mode: FamiliaMode
): Promise<FamiliaContent | null> {
  const prompt =
    mode === "familiar"
      ? PROMPT_FAMILIAR(startDate)
      : PROMPT_ADULTOS(startDate);

  const systemPrompt =
    mode === "familiar"
      ? "Eres un asistente de estudio bíblico familiar. Genera contenido claro, sencillo y participativo para familias con niños. Basado en la Biblia, sin inventar doctrinas."
      : "Eres un asistente de estudio bíblico para parejas. Genera contenido reflexivo, profundo y que fomente el diálogo genuino. Basado en la Biblia, sin inventar doctrinas.";

  const raw = await generateWithClaude(systemPrompt, prompt);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      mode,
      tema: parsed.tema || "",
      introduccion: parsed.introduccion || "",
      lectura_biblica: parsed.lectura_biblica || "",
      ensenanza: parsed.ensenanza || "",
      aplicacion: parsed.aplicacion || "",
      preguntas: parsed.preguntas || "",
      objetivo_espiritual: parsed.objetivo_espiritual || "",
      bible_texts: Array.isArray(parsed.bible_texts) ? parsed.bible_texts : [],
    };
  } catch {
    return null;
  }
}

export async function generateAndStoreFamilia(
  weekUuid: string,
  startDate: string
): Promise<void> {
  const db = getServiceSupabase();

  // Generate both modes in parallel
  const [familiar, adultos] = await Promise.all([
    generateForMode(startDate, "familiar"),
    generateForMode(startDate, "adultos"),
  ]);

  const rows = [familiar, adultos]
    .filter((r): r is FamiliaContent => r !== null)
    .map((r) => ({
      week_id: weekUuid,
      mode: r.mode,
      tema: r.tema,
      introduccion: r.introduccion,
      lectura_biblica: r.lectura_biblica,
      ensenanza: r.ensenanza,
      aplicacion: r.aplicacion,
      preguntas: r.preguntas,
      objetivo_espiritual: r.objetivo_espiritual,
      bible_texts: r.bible_texts,
    }));

  if (rows.length === 0) return;

  const { error } = await db.from("familia_estudios").insert(rows);
  if (error) throw new Error(`Failed to store familia: ${error.message}`);
}
