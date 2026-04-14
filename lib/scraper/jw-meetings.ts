import { generateWithClaude } from "../claude";
import { getWeekSchedule } from "../schedule/mwb-2026";
import type { BibleText } from "../types";

export interface MeetingPart {
  section: string;
  order_num: number;
  title: string;
  content: string;
  bible_texts: BibleText[];
}

/**
 * Generate meeting content following the EXACT structure of
 * "Vida y ministerio cristiano" from jw.org's activity guide.
 *
 * Structure:
 * 1. TESOROS DE LA BIBLIA
 *    - Discurso (10 min) - full speech with intro/body/conclusion
 *    - Perlas escondidas - Part A (answer question) + Part B (3 teachings from Bible reading)
 *    - Lectura de la Biblia - title only, no content
 * 2. SEAMOS MEJORES MAESTROS
 *    - Assignments/role-plays with structured scripts
 * 3. NUESTRA VIDA CRISTIANA
 *    - Talks with Q&A if applicable
 */
export async function generateMeetingContent(
  startDate: string
): Promise<MeetingPart[]> {
  const schedule = getWeekSchedule(startDate);
  const bibleReading = schedule?.bibleReading ?? null;

  const lecturaTitle = bibleReading
    ? `Lectura de la Biblia (${bibleReading})`
    : "Lectura de la Biblia (ver programa de la semana)";

  const readingInstruction = bibleReading
    ? `La lectura bíblica OFICIAL de esta semana es: ${bibleReading}.`
    : "Usa la lectura bíblica asignada para esta semana.";

  const prompt = `Genera el programa COMPLETO de la reunión "Vida y ministerio cristiano" para la semana del ${startDate}, siguiendo la estructura EXACTA de la Guía de Actividades de jw.org.

LECTURA BÍBLICA DE ESTA SEMANA: ${bibleReading ?? "(ver Guía de Actividades)"}

Devuelve SOLO un JSON array con EXACTAMENTE esta estructura:

[
  {
    "section": "TESOROS DE LA BIBLIA",
    "title": "Discurso: [título del tema] (10 min)",
    "content": "INTRODUCCIÓN:\\n[Párrafo de introducción que capte la atención]\\n\\nDESARROLLO:\\n[Desarrollo completo del tema con puntos claros, explicaciones y aplicaciones prácticas. Debe durar aproximadamente 10 minutos al leerlo (~1300 palabras). Incluir referencias a los textos bíblicos de forma natural.]\\n\\nCONCLUSIÓN:\\n[Párrafo de conclusión que resuma y motive]",
    "bible_texts": [{"reference": "Libro cap:vers", "text": "Texto COMPLETO del versículo", "translation": "NWT"}]
  },
  {
    "section": "TESOROS DE LA BIBLIA",
    "title": "Busquemos perlas escondidas (10 min)",
    "content": "PARTE A — PREGUNTA:\\n[Escribir la pregunta]\\n\\nRESPUESTA:\\n[Respuesta clara y desarrollada basada en los textos bíblicos]\\n\\nPARTE B — ENSEÑANZAS DE LA LECTURA BÍBLICA SEMANAL (${bibleReading ?? "lectura de la semana"}):\\n\\n1. [Texto bíblico 1 de ${bibleReading ?? "la lectura"}] — [Enseñanza y aplicación práctica]\\n\\n2. [Texto bíblico 2 de ${bibleReading ?? "la lectura"}] — [Enseñanza y aplicación práctica]\\n\\n3. [Texto bíblico 3 de ${bibleReading ?? "la lectura"}] — [Enseñanza y aplicación práctica]",
    "bible_texts": [{"reference": "...", "text": "Texto completo", "translation": "NWT"}, {"reference": "...", "text": "Texto completo", "translation": "NWT"}, {"reference": "...", "text": "Texto completo", "translation": "NWT"}]
  },
  {
    "section": "TESOROS DE LA BIBLIA",
    "title": "${lecturaTitle}",
    "content": "",
    "bible_texts": []
  },
  {
    "section": "SEAMOS MEJORES MAESTROS",
    "title": "[Tipo de asignación]: [Tema] ([X] min)",
    "content": "OBJETIVO: [Objetivo claro del ejercicio]\\n\\nGUIÓN:\\n[Guion estructurado y completo para representar la asignación. Incluir diálogos si aplica. Ajustado al tiempo indicado.]\\n\\nSUGERENCIAS:\\n- [Sugerencia para cumplir bien la asignación]\\n- [Otra sugerencia]",
    "bible_texts": [{"reference": "...", "text": "Texto completo", "translation": "NWT"}]
  },
  {
    "section": "SEAMOS MEJORES MAESTROS",
    "title": "[Segunda asignación] ([X] min)",
    "content": "OBJETIVO: [...]\\n\\nGUIÓN:\\n[...]\\n\\nSUGERENCIAS:\\n[...]",
    "bible_texts": []
  },
  {
    "section": "SEAMOS MEJORES MAESTROS",
    "title": "[Tercera asignación] ([X] min)",
    "content": "OBJETIVO: [...]\\n\\nGUIÓN:\\n[...]\\n\\nSUGERENCIAS:\\n[...]",
    "bible_texts": []
  },
  {
    "section": "NUESTRA VIDA CRISTIANA",
    "title": "[Tema] ([X] min)",
    "content": "[Desarrollo completo del tema. Si hay preguntas, incluirlas con sus respuestas claras y bien estructuradas. Añadir textos bíblicos completos.]",
    "bible_texts": [{"reference": "...", "text": "Texto completo", "translation": "NWT"}]
  },
  {
    "section": "NUESTRA VIDA CRISTIANA",
    "title": "Estudio bíblico de congregación (30 min)",
    "content": "[Resumen del tema del estudio bíblico de congregación con puntos principales y textos clave.]",
    "bible_texts": [{"reference": "...", "text": "Texto completo", "translation": "NWT"}]
  }
]

REGLAS OBLIGATORIAS:
- ${readingInstruction}
- La sección "Lectura de la Biblia" DEBE tener el título EXACTO: "${lecturaTitle}" y content vacío
- Perlas escondidas Parte B DEBE basarse en versículos de ${bibleReading ?? "la lectura bíblica de la semana"} — NO uses otros libros bíblicos
- NO inventes una lectura bíblica diferente. La lectura es: ${bibleReading ?? "la asignada para esta semana"}
- Incluye los textos bíblicos COMPLETOS (no solo la referencia)
- El discurso de Tesoros debe ser extenso (~1300 palabras) para cubrir 10 minutos
- Las asignaciones de Seamos Mejores Maestros deben tener guion listo para representar
- NO copies texto literal de publicaciones con derechos de autor
- Responde SOLO con el JSON array`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico experto. Genera contenido que siga EXACTAMENTE la estructura de la reunión 'Vida y ministerio cristiano' de los Testigos de Jehová. El contenido debe ser original, claro, respetuoso y basado en la Biblia. La lectura bíblica de la semana está indicada en el prompt — úsala exactamente, no la inventes.",
    prompt
  );

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      section: string;
      title: string;
      content: string;
      bible_texts: BibleText[];
    }>;

    return parsed.map((item, i) => ({
      section: item.section,
      order_num: i + 1,
      title: item.title,
      content: item.content || "",
      bible_texts: item.bible_texts || [],
    }));
  } catch {
    return [];
  }
}
