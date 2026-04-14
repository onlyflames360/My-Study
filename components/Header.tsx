"use client";

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* JW-style tower logo mark */}
        <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10 border border-white/20">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-warning"
            aria-hidden="true"
          >
            {/* Simplified tower/open book icon matching JW Library aesthetic */}
            <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.35C16.6 22.15 20 17.25 20 12V6L12 2zm-1 13H9V9h2v6zm4 0h-2V9h2v6z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight tracking-wide">
            My Study
          </h1>
          <p className="text-[11px] text-white/60 leading-none">
            Preparación semanal
          </p>
        </div>
      </div>
    </header>
  );
}
