/**
 * 2026 JW Meeting Workbook — Weekly Bible Reading Schedule
 *
 * Each entry maps the Monday (week start) to the official weekly
 * Bible reading from the Guía de Actividades (jw.org).
 *
 * Anchor confirmed by user: "2026-04-20" → Isaías 54, 55
 * Surrounding weeks are approximated based on canonical chapter order
 * at the typical JW reading pace (~2–3 chapters/week).
 *
 * To correct or extend: update the bibleReading string for the week.
 */

export interface WeekSchedule {
  /** Display label, e.g. "Isaías 54, 55" */
  bibleReading: string;
}

const MWB_2026: Record<string, WeekSchedule> = {
  // ── January 2026 (Isaiah, approx.) ──────────────────────────────────────
  "2026-01-05": { bibleReading: "Isaías 16-18" },
  "2026-01-12": { bibleReading: "Isaías 19-21" },
  "2026-01-19": { bibleReading: "Isaías 22-24" },
  "2026-01-26": { bibleReading: "Isaías 25-27" },

  // ── February 2026 (Isaiah, approx.) ─────────────────────────────────────
  "2026-02-02": { bibleReading: "Isaías 28, 29" },
  "2026-02-09": { bibleReading: "Isaías 30, 31" },
  "2026-02-16": { bibleReading: "Isaías 32-34" },
  "2026-02-23": { bibleReading: "Isaías 35, 36" },

  // ── March 2026 (Isaiah, approx.) ─────────────────────────────────────────
  "2026-03-02": { bibleReading: "Isaías 37-39" },
  "2026-03-09": { bibleReading: "Isaías 40, 41" },
  "2026-03-16": { bibleReading: "Isaías 42-44" },
  "2026-03-23": { bibleReading: "Isaías 45, 46" },
  "2026-03-30": { bibleReading: "Isaías 47-49" },

  // ── April 2026 (Isaiah) ──────────────────────────────────────────────────
  "2026-04-06": { bibleReading: "Isaías 50, 51" },
  "2026-04-13": { bibleReading: "Isaías 52, 53" },
  "2026-04-20": { bibleReading: "Isaías 54, 55" }, // ← CONFIRMED
  "2026-04-27": { bibleReading: "Isaías 56-58" },

  // ── May 2026 (Isaiah ending → Jeremías beginning, approx.) ─────────────
  "2026-05-04": { bibleReading: "Isaías 59-61" },
  "2026-05-11": { bibleReading: "Isaías 62-64" },
  "2026-05-18": { bibleReading: "Isaías 65, 66" },
  "2026-05-25": { bibleReading: "Jeremías 1-3" },

  // ── June 2026 (Jeremías, approx.) ────────────────────────────────────────
  "2026-06-01": { bibleReading: "Jeremías 4-6" },
  "2026-06-08": { bibleReading: "Jeremías 7-9" },
  "2026-06-15": { bibleReading: "Jeremías 10-12" },
  "2026-06-22": { bibleReading: "Jeremías 13-15" },
  "2026-06-29": { bibleReading: "Jeremías 16-18" },

  // ── July 2026 (Jeremías, approx.) ────────────────────────────────────────
  "2026-07-06": { bibleReading: "Jeremías 19-21" },
  "2026-07-13": { bibleReading: "Jeremías 22-24" },
  "2026-07-20": { bibleReading: "Jeremías 25-27" },
  "2026-07-27": { bibleReading: "Jeremías 28-30" },

  // ── August 2026 (Jeremías, approx.) ──────────────────────────────────────
  "2026-08-03": { bibleReading: "Jeremías 31-33" },
  "2026-08-10": { bibleReading: "Jeremías 34-36" },
  "2026-08-17": { bibleReading: "Jeremías 37-39" },
  "2026-08-24": { bibleReading: "Jeremías 40-42" },
  "2026-08-31": { bibleReading: "Jeremías 43-45" },

  // ── September 2026 (Jeremías ending → Lamentaciones, approx.) ───────────
  "2026-09-07": { bibleReading: "Jeremías 46-48" },
  "2026-09-14": { bibleReading: "Jeremías 49, 50" },
  "2026-09-21": { bibleReading: "Jeremías 51, 52" },
  "2026-09-28": { bibleReading: "Lamentaciones 1, 2" },

  // ── October 2026 (Lamentaciones → Ezequiel, approx.) ────────────────────
  "2026-10-05": { bibleReading: "Lamentaciones 3-5" },
  "2026-10-12": { bibleReading: "Ezequiel 1-3" },
  "2026-10-19": { bibleReading: "Ezequiel 4-6" },
  "2026-10-26": { bibleReading: "Ezequiel 7-9" },

  // ── November 2026 (Ezequiel, approx.) ────────────────────────────────────
  "2026-11-02": { bibleReading: "Ezequiel 10-12" },
  "2026-11-09": { bibleReading: "Ezequiel 13-15" },
  "2026-11-16": { bibleReading: "Ezequiel 16-18" },
  "2026-11-23": { bibleReading: "Ezequiel 19-21" },
  "2026-11-30": { bibleReading: "Ezequiel 22-24" },

  // ── December 2026 (Ezequiel, approx.) ────────────────────────────────────
  "2026-12-07": { bibleReading: "Ezequiel 25-27" },
  "2026-12-14": { bibleReading: "Ezequiel 28-30" },
  "2026-12-21": { bibleReading: "Ezequiel 31-33" },
  "2026-12-28": { bibleReading: "Ezequiel 34-36" },
};

/**
 * Returns the weekly Bible reading for the given week start date (YYYY-MM-DD).
 * Returns null if the week is not in the schedule.
 */
export function getWeekSchedule(weekStartDate: string): WeekSchedule | null {
  return MWB_2026[weekStartDate] ?? null;
}
