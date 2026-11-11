import type { Metadata } from "next";
import { Figtree, Fraunces, Nunito } from "next/font/google";
import "./globals.css";

// Three fonts (see "Design" in PROJECT_CONTEXT.md):
// - Figtree: everything in the interface (buttons, labels, sentences)
// - Fraunces: screen titles (class "font-serif")
// - Nunito: a rounded font, used on the flashcards only (class "font-rounded")
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "German A1 Vocabulary",
  description: "Flashcards for German A1 vocabulary, lesson by lesson.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
