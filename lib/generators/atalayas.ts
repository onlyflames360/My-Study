import { generateWatchtowerContent } from "../scraper/jw-watchtower";
import { getServiceSupabase } from "../supabase";

/**
 * Generate and store Watchtower study content for a given week.
 */
export async function generateAndStoreWatchtower(
  weekUuid: string,
  startDate: string
): Promise<void> {
  const db = getServiceSupabase();
  const paragraphs = await generateWatchtowerContent(startDate);

  if (paragraphs.length === 0) return;

  const rows = paragraphs.map((p) => ({
    week_id: weekUuid,
    article_title: p.article_title,
    paragraph_num: p.paragraph_num,
    question: p.question,
    answer: p.answer,
    bible_texts: p.bible_texts,
  }));

  const { error } = await db.from("atalayas").insert(rows);
  if (error) throw new Error(`Failed to store watchtower: ${error.message}`);
}
