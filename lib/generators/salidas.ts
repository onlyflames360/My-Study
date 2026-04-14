import { generateWithClaude } from "../claude";
import type { BibleText } from "../types";

interface SalidaResult {
  source_url: string;
  source_title: string;
  introduccion: string;
  texto_biblico: BibleText[];
  aplicacion: string;
}

/**
 * Generate field service content in a SINGLE Gemini call.
 * No YouTube dependency to avoid extra API calls and timeouts.
 */
export async function generateSalidasContent(): Promise<SalidaResult[]> {
  const prompt = `Genera 2 presentaciones prácticas para la predicación de casa en casa de los Testigos de Jehová.

Devuelve SOLO un JSON array:
[
  {
    "title": "Título de la presentación",
    "introduccion": "Cómo iniciar la conversación de forma natural y respetuosa. Incluir una pregunta que invite a reflexionar.",
    "bible_texts": [{"reference": "Libro capítulo:versículo", "text": "Texto COMPLETO del versículo", "translation": "NWT"}],
    "aplicacion": "Cómo continuar la conversación, ofrecer una revisita y aplicar el tema en la vida diaria."
  }
]

REGLAS:
- Presentaciones prácticas y realistas
- Incluir textos bíblicos COMPLETOS
- Introducción con pregunta que invite a reflexionar
- Aplicación práctica clara
- Lenguaje respetuoso y natural
- Responde SOLO con el JSON array`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico. Genera presentaciones prácticas, respetuosas y basadas en la Biblia.",
    prompt
  );

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title: string;
      introduccion: string;
      bible_texts: BibleText[];
      aplicacion: string;
    }>;

    return parsed.map((p) => ({
      source_url: "",
      source_title: p.title || "Presentación generada",
      introduccion: p.introduccion,
      texto_biblico: p.bible_texts || [],
      aplicacion: p.aplicacion,
    }));
  } catch {
    return [];
  }
}
