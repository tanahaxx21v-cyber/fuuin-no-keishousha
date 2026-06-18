import type { Metadata } from "next";
import { DotGothic16 } from "next/font/google";
import "./globals.css";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dot-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "封印の継承者",
  description: "100日で3つの封印石を集め、魔王を倒せ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${dotGothic.variable} font-[family-name:var(--font-dot-gothic)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
