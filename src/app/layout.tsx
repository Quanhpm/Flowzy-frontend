import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import type { ReactNode } from "react";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "F-Spark",
  description: "EXE Project Management System",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
