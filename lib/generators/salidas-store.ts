import { generateSalidasContent } from "./salidas";
import { getServiceSupabase } from "../supabase";

/**
 * Generate and store field service (salidas) content for a given week.
 */
export async function generateAndStoreSalidas(
  weekUuid: string
): Promise<void> {
  const db = getServiceSupabase();
  const salidas = await generateSalidasContent();

  if (salidas.length === 0) return;

  const rows = salidas.map((s) => ({
    week_id: weekUuid,
    source_url: s.source_url,
    source_title: s.source_title,
    introduccion: s.introduccion,
    texto_biblico: s.texto_biblico,
    aplicacion: s.aplicacion,
  }));

  const { error } = await db.from("salidas").insert(rows);
  if (error) throw new Error(`Failed to store salidas: ${error.message}`);
}
