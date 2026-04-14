import { generateWithClaude } from "../claude";
import { getBibleVerses } from "../bible/verses";
import { searchWOL } from "../scraper/jw-library";
import type { BibleText, DesarrolloPunto } from "../types";

interface DiscursoInput {
  tema: string;
  textos: string[];
  duracion: number;
  puntos: string[];
}

interface DiscursoResult {
  introduccion: string;
  desarrollo: DesarrolloPunto[];
  conclusion: string;
  bible_texts: BibleText[];
}

export async function generateDiscurso(
  input: DiscursoInput
): Promise<DiscursoResult> {
  // 1. Search for supporting material on WOL
  const wolResults = await searchWOL(input.tema);
  const materialContext = wolResults
    .map((r) => `- ${r.title}: ${r.snippet}`)
    .join("\n");

  // 2. Get full Bible texts
  const bibleTexts = await getBibleVerses(input.textos);
  const versesContext = bibleTexts
    .map((v) => `${v.reference}: "${v.text}"`)
    .join("\n");

  // 3. Calculate approximate word count based on duration
  // ~130 words per minute for spoken Spanish
  const targetWords = input.duracion * 130;

  // 4. Generate the speech with Claude
  const prompt = `Prepara un discurso de aproximadamente ${input.duracion} minutos (~${targetWords} palabras en total) sobre el tema: "${input.tema}"

TEXTOS BÍBLICOS (incluir completos):
${versesContext}

PUNTOS A DESARROLLAR:
${input.puntos.map((p, i) => `${i + 1}. ${p}`).join("\n")}

MATERIAL DE REFERENCIA (resumido de jw.org):
${materialContext || "No se encontró material adicional."}

INSTRUCCIONES:
- Genera una INTRODUCCIÓN que capte la atención y presente el tema
- Desarrolla CADA PUNTO por separado con explicaciones claras
- Genera una CONCLUSIÓN que resuma y motive
- Incluye las referencias bíblicas de forma natural
- Lenguaje claro, respetuoso y edificante
- NO copies texto literal de publicaciones
- Ajusta la longitud al tiempo indicado

Responde en formato JSON:
{
  "introduccion": "texto de la introducción",
  "desarrollo": [
    {"punto": "nombre del punto", "contenido": "desarrollo del punto"}
  ],
  "conclusion": "texto de la conclusión"
}

Responde SOLO con el JSON.`;

  const result = await generateWithClaude(
    "Eres un asistente que ayuda a preparar discursos bíblicos. Genera contenido original, claro y respetuoso. Nunca copies texto literal de publicaciones.",
    prompt
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]) as {
      introduccion: string;
      desarrollo: DesarrolloPunto[];
      conclusion: string;
    };

    return {
      introduccion: parsed.introduccion,
      desarrollo: parsed.desarrollo,
      conclusion: parsed.conclusion,
      bible_texts: bibleTexts,
    };
  } catch {
    return {
      introduccion: "Error al generar el discurso. Intenta de nuevo.",
      desarrollo: input.puntos.map((p) => ({
        punto: p,
        contenido: "Contenido no generado.",
      })),
      conclusion: "",
      bible_texts: bibleTexts,
    };
  }
}
