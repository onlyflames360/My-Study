import { NextRequest, NextResponse } from "next/server";
import { rotateWeeks } from "@/lib/weeks/manager";
import { generateAndStoreMeetings } from "@/lib/generators/reuniones";
import { generateAndStoreWatchtower } from "@/lib/generators/atalayas";
import { generateAndStoreSalidas } from "@/lib/generators/salidas-store";
import { getWeekRange } from "@/lib/weeks/manager";
import { addDays } from "date-fns";

export const maxDuration = 60;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) return false;
  return true;
}

/**
 * GET /api/cron/weekly?step=rotate|reuniones|atalayas|salidas|all
 *
 * On Vercel free tier (60s limit), run each step separately:
 *   1. ?step=rotate     → create/rotate week
 *   2. ?step=reuniones  → generate meetings
 *   3. ?step=atalayas   → generate watchtower
 *   4. ?step=salidas    → generate field service
 *
 * Or use ?step=all to try everything (works if function timeout > 60s).
 */
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const step = request.nextUrl.searchParams.get("step") || "rotate";

  try {
    // Always resolve the current week
    const now = new Date();
    const daysUntilMonday = ((8 - now.getDay()) % 7) || 7;
    const nextMonday = addDays(now, daysUntilMonday);
    const weekUuid = await rotateWeeks(nextMonday);
    const { start_date } = getWeekRange(nextMonday);

    if (step === "rotate") {
      return NextResponse.json({
        success: true,
        step: "rotate",
        weekId: weekUuid,
        startDate: start_date,
        message: "Week created. Now call ?step=reuniones, ?step=atalayas, ?step=salidas",
      });
    }

    if (step === "reuniones") {
      await generateAndStoreMeetings(weekUuid, start_date);
      return NextResponse.json({ success: true, step: "reuniones", weekId: weekUuid });
    }

    if (step === "atalayas") {
      await generateAndStoreWatchtower(weekUuid, start_date);
      return NextResponse.json({ success: true, step: "atalayas", weekId: weekUuid });
    }

    if (step === "salidas") {
      await generateAndStoreSalidas(weekUuid);
      return NextResponse.json({ success: true, step: "salidas", weekId: weekUuid });
    }

    if (step === "all") {
      const errors: string[] = [];
      for (const gen of [
        { name: "reuniones", fn: () => generateAndStoreMeetings(weekUuid, start_date) },
        { name: "atalayas", fn: () => generateAndStoreWatchtower(weekUuid, start_date) },
        { name: "salidas", fn: () => generateAndStoreSalidas(weekUuid) },
      ]) {
        try {
          await gen.fn();
        } catch (e) {
          errors.push(`${gen.name}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      return NextResponse.json({
        success: errors.length === 0,
        weekId: weekUuid,
        startDate: start_date,
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
