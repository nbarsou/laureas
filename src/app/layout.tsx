import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1 flex flex-col">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
