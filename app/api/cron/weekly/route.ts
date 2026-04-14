import { NextRequest, NextResponse } from "next/server";
import { rotateWeeks } from "@/lib/weeks/manager";
import { generateAndStoreMeetings } from "@/lib/generators/reuniones";
import { generateAndStoreWatchtower } from "@/lib/generators/atalayas";
import { generateAndStoreSalidas } from "@/lib/generators/salidas-store";
import { getWeekRange } from "@/lib/weeks/manager";
import { addDays } from "date-fns";

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Target: the upcoming Monday (next week)
    const now = new Date();
    const daysUntilMonday = ((8 - now.getDay()) % 7) || 7;
    const nextMonday = addDays(now, daysUntilMonday);

    // 1. Rotate weeks
    const weekUuid = await rotateWeeks(nextMonday);
    const { start_date } = getWeekRange(nextMonday);

    // 2. Generate content in parallel
    const results = await Promise.allSettled([
      generateAndStoreMeetings(weekUuid, start_date),
      generateAndStoreWatchtower(weekUuid, start_date),
      generateAndStoreSalidas(weekUuid),
    ]);

    const summary = {
      weekId: weekUuid,
      startDate: start_date,
      reuniones: results[0].status,
      atalayas: results[1].status,
      salidas: results[2].status,
      errors: results
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason?.message || "Unknown"),
    };

    return NextResponse.json({
      success: true,
      ...summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
