import { BookOpen } from "lucide-react";
import type { BibleText } from "@/lib/types";

interface Props {
  verse: BibleText;
}

export default function BibleVerse({ verse }: Props) {
  return (
    <div className="bg-bible border-l-4 border-bible-border rounded-r-lg p-4 my-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-warning flex-shrink-0" />
        <span className="font-semibold text-sm" style={{ color: "var(--section-treasures)" }}>
          {verse.reference}
        </span>
        <span className="text-xs text-muted">({verse.translation})</span>
      </div>
      <p className="text-sm leading-relaxed italic text-foreground/80">{verse.text}</p>
    </div>
  );
}
