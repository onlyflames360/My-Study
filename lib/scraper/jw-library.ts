import * as cheerio from "cheerio";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

/**
 * Search the Watchtower Online Library for material related to a topic.
 * Used primarily for the Discursos tab to find supporting material.
 */
export async function searchWOL(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://wol.jw.org/es/wol/s/r4/lp-s?q=${encoded}&p=par&r=occ`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyStudyApp/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];

    $(".resultItems .result, .results .item, li.result").each((i, el) => {
      if (i >= limit) return false;

      const title =
        $(el).find("h3, .title, a").first().text().trim() || "Sin título";
      const snippet =
        $(el).find("p, .snippet, .description").first().text().trim() || "";
      const href = $(el).find("a").first().attr("href") || "";
      const fullUrl = href.startsWith("http")
        ? href
        : `https://wol.jw.org${href}`;

      if (title.length > 2) {
        results.push({ title, snippet: snippet.substring(0, 300), url: fullUrl });
      }
    });

    return results;
  } catch {
    return [];
  }
}
