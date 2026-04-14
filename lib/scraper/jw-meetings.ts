import * as cheerio from "cheerio";
import { generateWithClaude } from "../claude";
import { getBibleVerses } from "../bible/verses";
import type { BibleText } from "../types";

interface MeetingPart {
  section: string;
  order_num: number;
  title: string;
  content: string;
  bible_texts: BibleText[];
}

interface RawPart {
  section: string;
  title: string;
  references: string[];
}

/**
 * Scrape the weekly meeting program from jw.org and generate
 * structured content for each part.
 */
export async function generateMeetingContent(
  startDate: string
): Promise<MeetingPart[]> {
  const rawParts = await scrapeMeetingProgram(startDate);

  if (rawParts.length === 0) {
    // Fallback: generate based on known structure
    return generateFallbackMeeting(startDate);
  }

  const parts: MeetingPart[] = [];

  for (let i = 0; i < rawParts.length; i++) {
    const raw = rawParts[i];
    const bibleTexts = await getBibleVerses(raw.references);

    const content = await generateWithClaude(
      `Eres un asistente de estudio bíblico. Desarrolla el contenido de esta parte de la reunión de forma clara, respetuosa y bien estructurada. No copies texto literal de publicaciones. Resume y explica con lenguaje propio. Incluye las referencias bíblicas mencionadas.`,
      `Parte de la reunión: ${raw.section}\nTema: ${raw.title}\nTextos bíblicos: ${raw.references.join(", ")}\n\nDesarrolla esta parte de forma clara y ordenada, explicando el tema y cómo se relaciona con los textos bíblicos.`
    );

    parts.push({
      section: raw.section,
      order_num: i + 1,
      title: raw.title,
      content,
      bible_texts: bibleTexts,
    });
  }

  return parts;
}

async function scrapeMeetingProgram(startDate: string): Promise<RawPart[]> {
  try {
    // jw.org meeting workbook URL pattern
    const url = `https://www.jw.org/es/biblioteca/guia-actividades/`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyStudyApp/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    const parts: RawPart[] = [];

    // Look for weekly program sections
    $("h2, h3").each((_, el) => {
      const heading = $(el).text().trim();
      if (!heading) return;

      let section = "GENERAL";
      if (/tesoros/i.test(heading)) section = "TESOROS DE LA BIBLIA";
      else if (/mejores maestros|ministerio/i.test(heading))
        section = "SEAMOS MEJORES MAESTROS";
      else if (/vida cristiana/i.test(heading))
        section = "NUESTRA VIDA CRISTIANA";

      // Extract references from surrounding content
      const nextContent = $(el).nextUntil("h2, h3").text();
      const references = extractBibleReferences(nextContent);

      if (heading.length > 2) {
        parts.push({
          section,
          title: heading,
          references,
        });
      }
    });

    return parts;
  } catch {
    return [];
  }
}

async function generateFallbackMeeting(
  startDate: string
): Promise<MeetingPart[]> {
  const prompt = `Genera la estructura típica de una reunión "Vida y ministerio cristiano" de los Testigos de Jehová para la semana del ${startDate}.

Devuelve el contenido en formato JSON con esta estructura exacta:
[
  {"section": "CANCIÓN Y ORACIÓN", "title": "Canción inicial", "content": "...", "references": []},
  {"section": "TESOROS DE LA BIBLIA", "title": "...", "content": "...", "references": ["..."]},
  {"section": "BUSQUEMOS PERLAS ESCONDIDAS", "title": "...", "content": "...", "references": ["..."]},
  {"section": "LECTURA DE LA BIBLIA", "title": "...", "content": "...", "references": ["..."]},
  {"section": "SEAMOS MEJORES MAESTROS", "title": "Primera conversación", "content": "...", "references": ["..."]},
  {"section": "SEAMOS MEJORES MAESTROS", "title": "Revisita", "content": "...", "references": ["..."]},
  {"section": "SEAMOS MEJORES MAESTROS", "title": "Curso bíblico", "content": "...", "references": ["..."]},
  {"section": "NUESTRA VIDA CRISTIANA", "title": "...", "content": "...", "references": ["..."]},
  {"section": "ESTUDIO BÍBLICO DE CONGREGACIÓN", "title": "...", "content": "...", "references": ["..."]},
  {"section": "CANCIÓN FINAL Y ORACIÓN", "title": "Canción final", "content": "...", "references": []}
]

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional. El contenido debe ser orientativo y respetuoso.`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico. Genera contenido estructurado y respetuoso.",
    prompt
  );

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      section: string;
      title: string;
      content: string;
      references: string[];
    }>;

    const parts: MeetingPart[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      const bibleTexts = await getBibleVerses(item.references || []);
      parts.push({
        section: item.section,
        order_num: i + 1,
        title: item.title,
        content: item.content,
        bible_texts: bibleTexts,
      });
    }
    return parts;
  } catch {
    return [];
  }
}

function extractBibleReferences(text: string): string[] {
  const pattern =
    /(?:Génesis|Éxodo|Levítico|Números|Deuteronomio|Josué|Jueces|Rut|1\s*Samuel|2\s*Samuel|1\s*Reyes|2\s*Reyes|1\s*Crónicas|2\s*Crónicas|Esdras|Nehemías|Ester|Job|Salmo|Salmos|Proverbios|Eclesiastés|Cantar|Isaías|Jeremías|Lamentaciones|Ezequiel|Daniel|Oseas|Joel|Amós|Abdías|Jonás|Miqueas|Nahúm|Habacuc|Sofonías|Ageo|Zacarías|Malaquías|Mateo|Marcos|Lucas|Juan|Hechos|Romanos|1\s*Corintios|2\s*Corintios|Gálatas|Efesios|Filipenses|Colosenses|1\s*Tesalonicenses|2\s*Tesalonicenses|1\s*Timoteo|2\s*Timoteo|Tito|Filemón|Hebreos|Santiago|1\s*Pedro|2\s*Pedro|1\s*Juan|2\s*Juan|3\s*Juan|Judas|Revelación|Apocalipsis)\s+\d+:\d+(?:[,-]\s*\d+)*/gi;

  const matches = text.match(pattern);
  return matches ? [...new Set(matches)] : [];
}
