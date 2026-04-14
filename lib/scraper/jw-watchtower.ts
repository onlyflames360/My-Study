import { generateWithClaude } from "../claude";
import type { BibleText } from "../types";

interface WatchtowerParagraph {
  article_title: string;
  paragraph_num: number;
  question: string;
  answer: string;
  bible_texts: BibleText[];
}

/**
 * Generate Watchtower study content in a SINGLE Gemini call.
 */
export async function generateWatchtowerContent(
  startDate: string
): Promise<WatchtowerParagraph[]> {
  const prompt = `Genera un estudio completo de La Atalaya para la semana del ${startDate}.

Devuelve SOLO un JSON con esta estructura:
{
  "title": "Título del artículo de estudio",
  "paragraphs": [
    {
      "num": 1,
      "question": "Pregunta de estudio para el párrafo",
      "answer": "Respuesta clara y desarrollada basada en textos bíblicos. No excesivamente corta.",
      "bible_texts": [{"reference": "Libro capítulo:versículo", "text": "Texto COMPLETO del versículo", "translation": "NWT"}]
    }
  ]
}

REGLAS:
- Genera 10-12 párrafos con preguntas y respuestas
- Cada respuesta debe ser clara, no excesivamente corta (3-5 oraciones mínimo)
- Basada en textos bíblicos (incluir el texto COMPLETO de cada versículo)
- Lenguaje sencillo y directo
- NO copies texto literal de La Atalaya; resume y explica con tus propias palabras
- Responde SOLO con el JSON`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico respetuoso y preciso. Genera contenido original basado en la Biblia.",
    prompt
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as {
      title: string;
      paragraphs: Array<{
        num: number;
        question: string;
        answer: string;
        bible_texts: BibleText[];
      }>;
    };

    return parsed.paragraphs.map((p) => ({
      article_title: parsed.title,
      paragraph_num: p.num,
      question: p.question,
      answer: p.answer,
      bible_texts: p.bible_texts || [],
    }));
  } catch {
    return [];
  }
}
