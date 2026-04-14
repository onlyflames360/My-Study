import { generateMeetingContent } from "../scraper/jw-meetings";
import { getServiceSupabase } from "../supabase";

/**
 * Generate and store meeting content for a given week.
 */
export async function generateAndStoreMeetings(
  weekUuid: string,
  startDate: string
): Promise<void> {
  const db = getServiceSupabase();
  const parts = await generateMeetingContent(startDate);

  if (parts.length === 0) return;

  const rows = parts.map((part) => ({
    week_id: weekUuid,
    section: part.section,
    order_num: part.order_num,
    title: part.title,
    content: part.content,
    bible_texts: part.bible_texts,
  }));

  const { error } = await db.from("reuniones").insert(rows);
  if (error) throw new Error(`Failed to store meetings: ${error.message}`);
}
