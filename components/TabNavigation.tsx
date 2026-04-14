"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic,
  MapPin,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/discursos", label: "Discursos", icon: Mic },
  { href: "/salidas", label: "Salidas", icon: MapPin },
  { href: "/reuniones", label: "Reuniones", icon: Users },
  { href: "/atalayas", label: "Atalayas", icon: BookOpen },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-card-border">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground hover:border-card-border"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
