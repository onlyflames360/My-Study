import { generateWithClaude } from "../claude";
import type { BibleText } from "../types";

interface MeetingPart {
  section: string;
  order_num: number;
  title: string;
  content: string;
  bible_texts: BibleText[];
}

/**
 * Generate meeting content in a SINGLE Gemini call to stay within
 * Vercel free tier timeout (60s).
 */
export async function generateMeetingContent(
  startDate: string
): Promise<MeetingPart[]> {
  const prompt = `Genera el programa completo de la reunión "Vida y ministerio cristiano" de los Testigos de Jehová para la semana del ${startDate}.

Devuelve SOLO un JSON array con esta estructura:
[
  {
    "section": "CANCIÓN Y ORACIÓN",
    "title": "Canción inicial y oración",
    "content": "Bienvenida a la reunión.",
    "bible_texts": []
  },
  {
    "section": "TESOROS DE LA BIBLIA",
    "title": "Tema del discurso",
    "content": "Desarrollo claro del tema con explicaciones...",
    "bible_texts": [{"reference": "Libro capítulo:versículo", "text": "Texto completo del versículo", "translation": "NWT"}]
  },
  {
    "section": "BUSQUEMOS PERLAS ESCONDIDAS",
    "title": "Busquemos perlas escondidas",
    "content": "Desarrollo del tema...",
    "bible_texts": [{"reference": "...", "text": "...", "translation": "NWT"}]
  },
  {
    "section": "LECTURA DE LA BIBLIA",
    "title": "Lectura de la Biblia",
    "content": "Instrucciones para la lectura...",
    "bible_texts": [{"reference": "...", "text": "...", "translation": "NWT"}]
  },
  {
    "section": "SEAMOS MEJORES MAESTROS",
    "title": "Primera conversación",
    "content": "Desarrollo...",
    "bible_texts": [{"reference": "...", "text": "...", "translation": "NWT"}]
  },
  {
    "section": "SEAMOS MEJORES MAESTROS",
    "title": "Revisita",
    "content": "Desarrollo...",
    "bible_texts": []
  },
  {
    "section": "NUESTRA VIDA CRISTIANA",
    "title": "Tema de la vida cristiana",
    "content": "Desarrollo completo...",
    "bible_texts": [{"reference": "...", "text": "...", "translation": "NWT"}]
  },
  {
    "section": "ESTUDIO BÍBLICO DE CONGREGACIÓN",
    "title": "Estudio bíblico de congregación",
    "content": "Desarrollo del tema de estudio...",
    "bible_texts": [{"reference": "...", "text": "...", "translation": "NWT"}]
  },
  {
    "section": "CANCIÓN FINAL Y ORACIÓN",
    "title": "Canción final y oración",
    "content": "Conclusión de la reunión.",
    "bible_texts": []
  }
]

REGLAS:
- Incluye los textos bíblicos COMPLETOS dentro de bible_texts (no solo la referencia, también el texto del versículo)
- El contenido debe ser original, claro y respetuoso
- NO copies texto literal de publicaciones
- Resume y explica con lenguaje propio
- Responde SOLO con el JSON array, sin texto adicional`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico. Genera contenido estructurado, respetuoso y preciso basado en la Biblia.",
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
      content: item.content,
      bible_texts: item.bible_texts || [],
    }));
  } catch {
    return [];
  }
}
