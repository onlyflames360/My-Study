"use client";

import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-primary text-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <BookOpen className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-tight">My Study</h1>
      </div>
    </header>
  );
}
