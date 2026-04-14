import { getServiceSupabase } from "../supabase";
import {
  startOfWeek,
  endOfWeek,
  format,
  getISOWeek,
  getISOWeekYear,
} from "date-fns";

export function getWeekId(date: Date): string {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  return {
    start_date: format(start, "yyyy-MM-dd"),
    end_date: format(end, "yyyy-MM-dd"),
  };
}

/**
 * Rotate weeks: delete "previous", move "current" to "previous",
 * create new "current" for the upcoming week.
 * Returns the new week's UUID.
 */
export async function rotateWeeks(targetDate: Date): Promise<string> {
  const db = getServiceSupabase();
  const weekId = getWeekId(targetDate);
  const { start_date, end_date } = getWeekRange(targetDate);

  // Check if this week already exists
  const { data: existing } = await db
    .from("weeks")
    .select("id")
    .eq("week_id", weekId)
    .single();

  if (existing) {
    return existing.id;
  }

  // 1. Delete the "previous" week (cascade deletes related data)
  await db.from("weeks").delete().eq("status", "previous");

  // 2. Move "current" to "previous"
  await db
    .from("weeks")
    .update({ status: "previous" })
    .eq("status", "current");

  // 3. Create new "current" week
  const { data: newWeek, error } = await db
    .from("weeks")
    .insert({
      week_id: weekId,
      start_date,
      end_date,
      status: "current",
      generated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create week: ${error.message}`);
  return newWeek.id;
}

/** Get current and previous weeks */
export async function getWeeks() {
  const db = getServiceSupabase();
  const { data, error } = await db
    .from("weeks")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/** Get a specific week by status */
export async function getWeekByStatus(status: "current" | "previous") {
  const db = getServiceSupabase();
  const { data, error } = await db
    .from("weeks")
    .select("*")
    .eq("status", status)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data;
}
