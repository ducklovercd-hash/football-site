import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PitchSide | Live Football Scores, Predictions and Player Stats",
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
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
              {children}
            </main>
            <footer className="border-t border-pitch-800">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-[11px] text-fg-dim sm:flex-row sm:items-center sm:justify-between">
                <p>
                  PitchSide, built with Next.js &amp; Tailwind CSS, deployed on
                  Vercel.
                </p>
                <p>
                  Match data from FotMob, refreshed while you browse. Times
                  shown in HKT.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

