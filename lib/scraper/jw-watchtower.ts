import * as cheerio from "cheerio";
import { generateWithClaude } from "../claude";
import { getBibleVerses } from "../bible/verses";
import type { BibleText } from "../types";

interface WatchtowerParagraph {
  article_title: string;
  paragraph_num: number;
  question: string;
  answer: string;
  bible_texts: BibleText[];
}

/**
 * Scrape the Watchtower study article for the week and generate
 * answers to all study questions.
 */
export async function generateWatchtowerContent(
  startDate: string
): Promise<WatchtowerParagraph[]> {
  const scraped = await scrapeWatchtowerArticle(startDate);

  if (scraped.paragraphs.length === 0) {
    return generateFallbackWatchtower(startDate);
  }

  const results: WatchtowerParagraph[] = [];

  for (const para of scraped.paragraphs) {
    const bibleTexts = await getBibleVerses(para.references);

    const answer = await generateWithClaude(
      `Eres un asistente de estudio bíblico. Responde preguntas de estudio de La Atalaya de forma clara, no excesivamente corta, basándote en los textos bíblicos. Usa lenguaje sencillo y directo. No copies texto literal de la revista; resume y explica con tus propias palabras.`,
      `Artículo: "${scraped.title}"\nPárrafo ${para.num}: ${para.text}\nPregunta: ${para.question}\nTextos bíblicos: ${para.references.join(", ")}\n\nResponde la pregunta de forma clara y completa, haciendo referencia a los textos bíblicos.`
    );

    results.push({
      article_title: scraped.title,
      paragraph_num: para.num,
      question: para.question,
      answer,
      bible_texts: bibleTexts,
    });
  }

  return results;
}

interface ScrapedArticle {
  title: string;
  paragraphs: Array<{
    num: number;
    text: string;
    question: string;
    references: string[];
  }>;
}

async function scrapeWatchtowerArticle(
  startDate: string
): Promise<ScrapedArticle> {
  try {
    const url = `https://www.jw.org/es/biblioteca/revistas/atalaya-estudio/`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyStudyApp/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) return { title: "", paragraphs: [] };

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try to find the study article for this week
    const title =
      $("h1").first().text().trim() || "Artículo de estudio de La Atalaya";

    const paragraphs: ScrapedArticle["paragraphs"] = [];

    // Look for numbered paragraphs
    $("p[id^='p'], .sb, .bodyTxt p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) {
        // Extract bible references from the paragraph
        const refs = extractReferences(text);

        paragraphs.push({
          num: i + 1,
          text: text.substring(0, 500), // Limit to avoid copying entire paragraphs
          question: "",
          references: refs,
        });
      }
    });

    // Try to match questions to paragraphs
    $(".qu, [class*='question']").each((i, el) => {
      const question = $(el).text().trim();
      if (paragraphs[i]) {
        paragraphs[i].question = question;
      }
    });

    return { title, paragraphs };
  } catch {
    return { title: "", paragraphs: [] };
  }
}

async function generateFallbackWatchtower(
  startDate: string
): Promise<WatchtowerParagraph[]> {
  const prompt = `Genera un estudio de La Atalaya simulado para la semana del ${startDate}.

Devuelve SOLO un JSON con esta estructura:
{
  "title": "Título del artículo de estudio",
  "paragraphs": [
    {
      "num": 1,
      "question": "Pregunta de estudio para el párrafo 1",
      "answer": "Respuesta clara y desarrollada basada en textos bíblicos",
      "references": ["Referencia bíblica 1", "Referencia bíblica 2"]
    }
  ]
}

Genera al menos 10 párrafos con preguntas y respuestas. Cada respuesta debe:
- Ser clara y no excesivamente corta
- Estar basada en textos bíblicos
- Usar lenguaje sencillo y directo
- NO copiar texto literal de ninguna publicación

Responde SOLO con el JSON.`;

  const result = await generateWithClaude(
    "Eres un asistente de estudio bíblico respetuoso y preciso.",
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
        references: string[];
      }>;
    };

    const results: WatchtowerParagraph[] = [];
    for (const p of parsed.paragraphs) {
      const bibleTexts = await getBibleVerses(p.references || []);
      results.push({
        article_title: parsed.title,
        paragraph_num: p.num,
        question: p.question,
        answer: p.answer,
        bible_texts: bibleTexts,
      });
    }
    return results;
  } catch {
    return [];
  }
}

function extractReferences(text: string): string[] {
  const pattern =
    /(?:Génesis|Éxodo|Levítico|Números|Deuteronomio|Josué|Jueces|Rut|1\s*Samuel|2\s*Samuel|1\s*Reyes|2\s*Reyes|1\s*Crónicas|2\s*Crónicas|Esdras|Nehemías|Ester|Job|Salmo|Salmos|Proverbios|Eclesiastés|Cantar|Isaías|Jeremías|Lamentaciones|Ezequiel|Daniel|Oseas|Joel|Amós|Abdías|Jonás|Miqueas|Nahúm|Habacuc|Sofonías|Ageo|Zacarías|Malaquías|Mateo|Marcos|Lucas|Juan|Hechos|Romanos|1\s*Corintios|2\s*Corintios|Gálatas|Efesios|Filipenses|Colosenses|1\s*Tesalonicenses|2\s*Tesalonicenses|1\s*Timoteo|2\s*Timoteo|Tito|Filemón|Hebreos|Santiago|1\s*Pedro|2\s*Pedro|1\s*Juan|2\s*Juan|3\s*Juan|Judas|Revelación|Apocalipsis)\s+\d+:\d+(?:[,-]\s*\d+)*/gi;

  const matches = text.match(pattern);
  return matches ? [...new Set(matches)].slice(0, 5) : [];
}
