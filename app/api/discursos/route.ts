import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { generateDiscurso } from "@/lib/generators/discursos";

export async function GET(request: NextRequest) {
  const weekId = request.nextUrl.searchParams.get("weekId");
  if (!weekId) {
    return NextResponse.json({ error: "weekId required" }, { status: 400 });
  }

  const db = getServiceSupabase();
  const { data, error } = await db
    .from("discursos")
    .select("*")
    .eq("week_id", weekId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekId, tema, textos, duracion, puntos } = body;

    if (!weekId || !tema || !textos || !duracion || !puntos) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate the speech
    const result = await generateDiscurso({ tema, textos, duracion, puntos });

    // Store in database
    const db = getServiceSupabase();
    const { data, error } = await db
      .from("discursos")
      .insert({
        week_id: weekId,
        tema,
        textos_input: textos,
        duracion,
        puntos,
        introduccion: result.introduccion,
        desarrollo: result.desarrollo,
        conclusion: result.conclusion,
        bible_texts: result.bible_texts,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data, error } = await db
      .from("discursos")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
