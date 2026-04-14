import { NextRequest, NextResponse } from "next/server";
import { rotateWeeks } from "@/lib/weeks/manager";
import { generateAndStoreMeetings } from "@/lib/generators/reuniones";
import { generateAndStoreWatchtower } from "@/lib/generators/atalayas";
import { generateAndStoreSalidas } from "@/lib/generators/salidas-store";
import { getWeekRange } from "@/lib/weeks/manager";
import { addDays } from "date-fns";

export const maxDuration = 300; // 5 minutes for Vercel Pro

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    // 2. Generate content SEQUENTIALLY to avoid rate limits on free tier
    const errors: string[] = [];

    let reunionesStatus = "pending";
    try {
      await generateAndStoreMeetings(weekUuid, start_date);
      reunionesStatus = "fulfilled";
    } catch (e) {
      reunionesStatus = "rejected";
      errors.push(`reuniones: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Wait between generations to respect rate limits
    await sleep(10000);

    let atalayasStatus = "pending";
    try {
      await generateAndStoreWatchtower(weekUuid, start_date);
      atalayasStatus = "fulfilled";
    } catch (e) {
      atalayasStatus = "rejected";
      errors.push(`atalayas: ${e instanceof Error ? e.message : String(e)}`);
    }

    await sleep(10000);

    let salidasStatus = "pending";
    try {
      await generateAndStoreSalidas(weekUuid);
      salidasStatus = "fulfilled";
    } catch (e) {
      salidasStatus = "rejected";
      errors.push(`salidas: ${e instanceof Error ? e.message : String(e)}`);
    }

    return NextResponse.json({
      success: true,
      weekId: weekUuid,
      startDate: start_date,
      reuniones: reunionesStatus,
      atalayas: atalayasStatus,
      salidas: salidasStatus,
      errors,
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
