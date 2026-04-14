"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, MapPin, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/discursos", label: "Discursos", icon: Mic },
  { href: "/salidas", label: "Salidas", icon: MapPin },
  { href: "/familia", label: "Familia", icon: Home },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top tab bar */}
      <nav className="hidden sm:block bg-primary-dark border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(tab.href + "/");
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all",
                    isActive
                      ? "border-warning text-white"
                      : "border-transparent text-white/50 hover:text-white/80 hover:border-white/30"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation bar (fixed, JW Library style) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                  isActive ? "text-warning" : "text-white/50 active:text-white/80"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
