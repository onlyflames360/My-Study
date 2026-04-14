import { searchYouTubeVideos } from "../youtube/search";
import { getVideoTranscript } from "../youtube/transcript";
import { generateWithClaude } from "../claude";
import { getBibleVerses } from "../bible/verses";
import type { BibleText } from "../types";

interface SalidaResult {
  source_url: string;
  source_title: string;
  introduccion: string;
  texto_biblico: BibleText[];
  aplicacion: string;
}

/**
 * Generate "Salidas" (field service) content for the week.
 * Searches YouTube for relevant videos, gets transcripts, and structures them.
 */
export async function generateSalidasContent(): Promise<SalidaResult[]> {
  const queries = [
    "predicación testigos de Jehová presentación",
    "cómo predicar de casa en casa testigos",
    "presentación bíblica puerta a puerta",
  ];

  const results: SalidaResult[] = [];

  for (const query of queries) {
    const videos = await searchYouTubeVideos(query, 1);
    if (videos.length === 0) continue;

    const video = videos[0];
    const transcript = await getVideoTranscript(video.videoId);

    if (!transcript || transcript.length < 50) continue;

    // Use Claude to structure the transcript content
    const structured = await generateWithClaude(
      `Eres un asistente de estudio bíblico. Tu tarea es organizar el contenido de una transcripción de video sobre predicación. NO copies el texto literal; resume y estructura con lenguaje propio. Organiza el contenido en tres secciones claras.`,
      `Transcripción del video "${video.title}":
${transcript.substring(0, 3000)}

Organiza este contenido en formato JSON:
{
  "introduccion": "Breve introducción sobre el tema de predicación tratado",
  "referencias_biblicas": ["Referencia 1", "Referencia 2"],
  "aplicacion": "Aplicación práctica: cómo usar esta información en el ministerio"
}

IMPORTANTE:
- Resume con tus propias palabras, NO copies literal
- Identifica los textos bíblicos mencionados
- La aplicación debe ser práctica y útil
- Responde SOLO con el JSON`
    );

    try {
      const jsonMatch = structured.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]) as {
        introduccion: string;
        referencias_biblicas: string[];
        aplicacion: string;
      };

      const bibleTexts = await getBibleVerses(
        parsed.referencias_biblicas || []
      );

      results.push({
        source_url: video.url,
        source_title: video.title,
        introduccion: parsed.introduccion,
        texto_biblico: bibleTexts,
        aplicacion: parsed.aplicacion,
      });
    } catch {
      continue;
    }

    // Limit to 2-3 results
    if (results.length >= 2) break;
  }

  // Fallback if no YouTube results
  if (results.length === 0) {
    return generateFallbackSalidas();
  }

  return results;
}

async function generateFallbackSalidas(): Promise<SalidaResult[]> {
  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico respetuoso.",
    `Genera 2 presentaciones para la predicación de casa en casa en formato JSON:
[
  {
    "introduccion": "Introducción de la presentación",
    "referencias": ["Texto bíblico 1"],
    "aplicacion": "Cómo aplicar esta presentación en la predicación"
  }
]
Las presentaciones deben ser prácticas, respetuosas y basadas en textos bíblicos.
Responde SOLO con el JSON.`
  );

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      introduccion: string;
      referencias: string[];
      aplicacion: string;
    }>;

    const results: SalidaResult[] = [];
    for (const p of parsed) {
      const bibleTexts = await getBibleVerses(p.referencias || []);
      results.push({
        source_url: "",
        source_title: "Generado automáticamente",
        introduccion: p.introduccion,
        texto_biblico: bibleTexts,
        aplicacion: p.aplicacion,
      });
    }
    return results;
  } catch {
    return [];
  }
}
