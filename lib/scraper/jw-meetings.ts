import { generateWithClaude } from "../claude";
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
  const prompt = `Genera el programa COMPLETO de la reunión "Vida y ministerio cristiano" para la semana del ${startDate}, siguiendo la estructura EXACTA de la Guía de Actividades de jw.org.

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
    "content": "PARTE A — PREGUNTA:\\n[Escribir la pregunta]\\n\\nRESPUESTA:\\n[Respuesta clara y desarrollada basada en los textos bíblicos]\\n\\nPARTE B — ENSEÑANZAS DE LA LECTURA BÍBLICA SEMANAL:\\n\\n1. [Texto bíblico 1] — [Enseñanza y aplicación práctica]\\n\\n2. [Texto bíblico 2] — [Enseñanza y aplicación práctica]\\n\\n3. [Texto bíblico 3] — [Enseñanza y aplicación práctica]",
    "bible_texts": [{"reference": "...", "text": "Texto completo", "translation": "NWT"}, {"reference": "...", "text": "Texto completo", "translation": "NWT"}, {"reference": "...", "text": "Texto completo", "translation": "NWT"}]
  },
  {
    "section": "TESOROS DE LA BIBLIA",
    "title": "Lectura de la Biblia ([referencia bíblica])",
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
- Incluye los textos bíblicos COMPLETOS (no solo la referencia)
- El discurso de Tesoros debe ser extenso (~1300 palabras) para cubrir 10 minutos
- Perlas escondidas DEBE tener Parte A (pregunta+respuesta) Y Parte B (3 enseñanzas de la lectura bíblica semanal)
- La Lectura de la Biblia solo muestra el título, content vacío
- Las asignaciones de Seamos Mejores Maestros deben tener guion listo para representar
- NO copies texto literal de publicaciones
- Responde SOLO con el JSON array`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico experto. Genera contenido que siga EXACTAMENTE la estructura de la reunión 'Vida y ministerio cristiano' de los Testigos de Jehová. El contenido debe ser original, claro, respetuoso y basado en la Biblia. La pestaña Reuniones debe seguir exactamente la estructura de la Guía de Actividades de jw.org, usando únicamente la semana actual.",
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
