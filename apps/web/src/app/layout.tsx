import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { THEME_INIT_SCRIPT, ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Livestock Invest — Chorvachilikka Investitsiya Platformasi",
  description:
    "O'zbekistonda chorvachilikka Escrow kafolati va veterinar nazorati ostida xavfsiz hamda daromadli investitsiya platformasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` — pastdagi skript <html> ga `data-theme` va
    // `--font-scale` qo'shadi, ya'ni klientdagi belgilash serverdagidan farq
    // qiladi. Bu ataylab: mavzu sahifa chizilishidan OLDIN qo'yilmasa,
    // qorong'i mavzuda sahifa avval oq bo'lib chaqnab ketadi.
    <html lang="uz" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
