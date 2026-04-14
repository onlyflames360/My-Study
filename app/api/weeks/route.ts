import { NextResponse } from "next/server";
import { getWeeks } from "@/lib/weeks/manager";

export async function GET() {
  try {
    const weeks = await getWeeks();
    return NextResponse.json(weeks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
