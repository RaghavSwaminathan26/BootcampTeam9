import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import Navbar from "@/components/Navbar";

import "./globals.css";

const readableFont = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-readable",
});

export const metadata: Metadata = {
  title: "Tableaux | Your dining journal",
  description: "Keep track of the restaurants you love and the places you want to try.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={readableFont.variable}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
