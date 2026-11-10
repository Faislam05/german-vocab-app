import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";

// Two fonts (see "Design" in PROJECT_CONTEXT.md):
// - Figtree: everything in the interface (buttons, labels, sentences)
// - Fraunces: the German word and screen titles (class "font-serif")
const figtree = Figtree({
  variable: "--font-figtree",
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
      className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
