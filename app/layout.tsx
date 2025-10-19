import "../styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeToggle } from "../components/ThemeToggle";
import Disclaimer from "../components/Disclaimer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto prediction",
  description: "Prijsdata, trends en mock-voorspellingen voor populaire crypto-assets.",
  metadataBase: new URL("https://crypto-prediction.example"),
  openGraph: {
    title: "Crypto prediction",
    description: "Prijsdata, trends en mock-voorspellingen voor populaire crypto-assets.",
    url: "https://crypto-prediction.example",
    siteName: "Crypto prediction",
    locale: "nl_NL",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                <Link href="/" className="flex items-center gap-2" aria-label="Crypto prediction home">
                  <Image src="/logo.svg" alt="Crypto prediction logo" width={32} height={32} />
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Crypto prediction</div>
                </Link>
                <ThemeToggle />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <footer className="border-t border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} Crypto prediction. Alle rechten voorbehouden.</p>
                <p className="max-w-xl text-xs">
                  De getoonde data is uitsluitend voor educatieve en experimentele doeleinden en vormt nadrukkelijk géén financieel advies.
                </p>
              </div>
            </footer>
            <Disclaimer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
