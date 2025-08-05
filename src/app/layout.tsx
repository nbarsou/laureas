import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

export const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Laures Dashboard",
    default: "Laureas",
  },
  description: "The official Next.js Learn Dashboard built with App Router.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
