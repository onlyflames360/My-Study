import { getISOWeek, getISOWeekYear, parseISO } from "date-fns";
import type { BibleText } from "../types";

export interface MeetingPart {
  section: string;
  order_num: number;
  title: string;
  content: string;
  bible_texts: BibleText[];
}

const WOL_BASE = "https://wol.jw.org";
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9",
};

/** Remove all HTML tags and normalize whitespace */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fetch the WOL meeting document path for a given week */
async function getMeetingDocPath(
  year: number,
  isoWeek: number
): Promise<string | null> {
  try {
    const url = `${WOL_BASE}/es/wol/meetings/r4/lp-s/${year}/${isoWeek}`;
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) return null;
    const html = await res.text();
    // First /wol/d/ link on the meetings page is the meeting workbook
    const m = html.match(/href="(\/es\/wol\/d\/r4\/lp-s\/\d+)"/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Fetch the full HTML of the meeting document */
async function fetchDocHtml(docPath: string): Promise<string | null> {
  try {
    const res = await fetch(`${WOL_BASE}${docPath}`, {
      headers: FETCH_HEADERS,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Extract Bible references from an HTML snippet.
 * WOL marks them as <a class="b" ...>Is 54:13</a>
 */
function extractBibleRefs(html: string): BibleText[] {
  const refs: BibleText[] = [];
  const seen = new Set<string>();
  const regex = /<a[^>]+class="b"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const ref = stripTags(m[1]).trim();
    if (ref && !seen.has(ref)) {
      seen.add(ref);
      refs.push({ reference: ref, text: "", translation: "NWT" });
    }
  }
  return refs;
}

/**
 * Parse the WOL meeting HTML into structured MeetingPart[].
 *
 * Section heading structure in WOL HTML:
 *   <h2 ...><strong>TESOROS DE LA BIBLIA</strong></h2>
 *   <h3 ...><strong>1. ¿Cuánto está dispuesto a invertir?</strong></h3>
 *     <p>(10 mins.)</p>
 *     <p>bullet...</p>
 *   <h3 ...><strong>2. Busquemos perlas escondidas</strong></h3>
 *   ...
 *   <h2 ...><strong>SEAMOS MEJORES MAESTROS</strong></h2>
 *   ...
 *   <h2 ...><strong>NUESTRA VIDA CRISTIANA</strong></h2>
 */
function parseMeetingHtml(html: string): MeetingPart[] {
  // Extract the <article> body
  const articleMatch = html.match(/id="article"[^>]*>([\s\S]*?)<\/article>/);
  if (!articleMatch) return [];
  const article = articleMatch[1];

  const SECTIONS: Record<string, string> = {
    "TESOROS DE LA BIBLIA": "TESOROS DE LA BIBLIA",
    "SEAMOS MEJORES MAESTROS": "SEAMOS MEJORES MAESTROS",
    "NUESTRA VIDA CRISTIANA": "NUESTRA VIDA CRISTIANA",
  };

  const parts: MeetingPart[] = [];
  let currentSection = "";
  let orderNum = 0;

  // Collect all h2 and h3 with their positions
  const headingRe = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g;
  const headings: Array<{
    level: number;
    html: string;
    text: string;
    start: number;
    end: number;
  }> = [];

  let hm: RegExpExecArray | null;
  while ((hm = headingRe.exec(article)) !== null) {
    headings.push({
      level: parseInt(hm[1]),
      html: hm[0],
      text: stripTags(hm[3]),
      start: hm.index,
      end: hm.index + hm[0].length,
    });
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const nextStart = headings[i + 1]?.start ?? article.length;
    const contentBetween = article.substring(h.end, nextStart);

    if (h.level === 2) {
      // Detect section change
      for (const key of Object.keys(SECTIONS)) {
        if (h.text.includes(key)) {
          currentSection = SECTIONS[key];
          break;
        }
      }
      continue;
    }

    if (h.level === 3 && currentSection) {
      // Duration: extract "(X mins.)"
      const durMatch = contentBetween.match(/\((\d+\s*mins?\.)\)/);
      const duration = durMatch ? ` (${durMatch[1]})` : "";

      // Title: strip existing duration from h3 text then append clean one
      const titleBase = h.text.replace(/\(\d+\s*mins?\.\)/g, "").trim();
      const title = titleBase + duration;

      // Content: strip tags, remove textarea labels
      let content = stripTags(contentBetween)
        .replace(/\(\d+\s*mins?\.\)\s*/g, "")
        .replace(/\bRespuesta\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Bible refs from this part's HTML
      const bibleTexts = extractBibleRefs(contentBetween);

      orderNum++;
      parts.push({
        section: currentSection,
        order_num: orderNum,
        title,
        content,
        bible_texts: bibleTexts,
      });
    }
  }

  // Song/prayer items are h3-level in WOL and will be picked up as parts.
  // Filter them out from sections they don't belong to, but keep meaningful ones.
  return parts;
}

/**
 * Main entry point: fetch and parse the WOL meeting content for the given
 * week start date (YYYY-MM-DD, Monday).
 */
export async function generateMeetingContent(
  startDate: string
): Promise<MeetingPart[]> {
  const date = parseISO(startDate);
  const year = getISOWeekYear(date);
  const isoWeek = getISOWeek(date);

  // 1. Get the WOL document path for this week
  const docPath = await getMeetingDocPath(year, isoWeek);
  if (!docPath) return [];

  // 2. Fetch the document HTML
  const html = await fetchDocHtml(docPath);
  if (!html) return [];

  // 3. Parse into structured parts
  const parts = parseMeetingHtml(html);

  return parts;
}
