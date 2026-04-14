"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import type { Week } from "@/lib/types";

interface Props {
  onWeekChange: (weekId: string) => void;
}

export default function WeekSelector({ onWeekChange }: Props) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    fetch("/api/weeks")
      .then((r) => r.json())
      .then((data: Week[]) => {
        setWeeks(data);
        const current = data.find((w) => w.status === "current");
        if (current) {
          setSelected(current.id);
          onWeekChange(current.id);
        } else if (data.length > 0) {
          setSelected(data[0].id);
          onWeekChange(data[0].id);
        }
      })
      .catch(() => {});
  }, [onWeekChange]);

  const handleChange = (id: string) => {
    setSelected(id);
    onWeekChange(id);
  };

  if (weeks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Calendar className="w-4 h-4" />
        <span>No hay semanas generadas</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted" />
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm bg-accent border border-card-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {weeks.map((w) => (
          <option key={w.id} value={w.id}>
            {w.start_date} al {w.end_date}
            {w.status === "current" ? " (Actual)" : " (Anterior)"}
          </option>
        ))}
      </select>
    </div>
  );
}
