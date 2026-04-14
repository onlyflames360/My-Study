import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TabNavigation from "@/components/TabNavigation";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Study",
  description: "Preparación semanal automática de contenido de estudio bíblico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <TabNavigation />
        {/* pb-20 on mobile to clear the fixed bottom nav */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 sm:pb-6">
          {children}
        </main>
        <footer className="hidden sm:block text-center text-xs text-muted py-4 border-t border-card-border">
          My Study &mdash; Preparación personal de estudio semanal
        </footer>
      </body>
    </html>
  );
}
