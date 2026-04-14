import { getServiceSupabase } from "../supabase";
import type { BibleText } from "../types";

/**
 * Fetch a Bible verse. Checks local cache first, then fetches from
 * jw.org's Watchtower Online Library if not cached.
 */
export async function getBibleVerse(reference: string): Promise<BibleText> {
  const db = getServiceSupabase();

  // Check cache
  const { data: cached } = await db
    .from("bible_verses")
    .select("*")
    .eq("reference", reference)
    .single();

  if (cached) {
    return {
      reference: cached.reference,
      text: cached.text,
      translation: cached.translation,
    };
  }

  // Fetch from external source
  const text = await fetchVerseFromWOL(reference);

  // Cache it
  await db.from("bible_verses").insert({
    reference,
    text,
    translation: "NWT",
  });

  return { reference, text, translation: "NWT" };
}

/**
 * Fetch multiple Bible verses
 */
export async function getBibleVerses(
  references: string[]
): Promise<BibleText[]> {
  const results: BibleText[] = [];
  for (const ref of references) {
    try {
      const verse = await getBibleVerse(ref);
      results.push(verse);
    } catch {
      results.push({
        reference: ref,
        text: `[No se pudo obtener el texto de ${ref}]`,
        translation: "NWT",
      });
    }
  }
  return results;
}

/**
 * Fetch verse text from Watchtower Online Library (wol.jw.org).
 * Falls back to a placeholder if fetch fails.
 */
async function fetchVerseFromWOL(reference: string): Promise<string> {
  try {
    // Normalize reference for URL (e.g., "Juan 3:16" -> search query)
    const query = encodeURIComponent(reference);
    const url = `https://wol.jw.org/es/wol/l/r4/lp-s?q=${query}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyStudyApp/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      return `[Texto de ${reference} - consultar en jw.org]`;
    }

    const html = await res.text();

    // Extract verse text from the HTML response
    // WOL returns search results; we look for the verse text
    const verseMatch = html.match(
      /<p[^>]*class="[^"]*(?:v|verse)[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    if (verseMatch) {
      return cleanHtml(verseMatch[1]);
    }

    // Fallback: try to extract any result snippet
    const snippetMatch = html.match(
      /<em[^>]*>([\s\S]*?)<\/em>/i
    );
    if (snippetMatch) {
      return cleanHtml(snippetMatch[1]);
    }

    return `[Texto de ${reference} - consultar en jw.org]`;
  } catch {
    return `[Texto de ${reference} - consultar en jw.org]`;
  }
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
