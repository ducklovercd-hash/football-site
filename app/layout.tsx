import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "PitchSide — Live Football Scores, Predictions & Player Stats",
  description:
    "Near-live scores, Poisson-model predictions, player statistics and odds intelligence across Europe's top five leagues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pitch-950 text-fg">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 border-t border-pitch-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-[11px] text-fg-dim sm:flex-row sm:items-center sm:justify-between">
            <p>
              PitchSide — built with Next.js &amp; Tailwind CSS, deployed on
              Vercel.
            </p>
            <p>
              Currently running on <span className="text-brand-500">demo data</span>.
              Live provider integration pending.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
