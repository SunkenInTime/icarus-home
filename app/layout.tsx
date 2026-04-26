import type { Metadata } from "next";
import { Geist, Geist_Mono, Onest } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Icarus — Valorant Strategy Planner",
  description:
    "Local-first Valorant strategy board. Zero gap between idea and board. Free, customizable, and shipping fast.",
  icons: "./favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://retn.io/script.js"
          data-token="8PeXBD7NmQXDLoIk2LbuKi0EZ0vclpO2"
          defer
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${onest.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
