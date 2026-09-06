import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KisanSetu | Agricultural Procurement & Queue Management",
  description:
    "A simple, transparent digital coordination platform for farmers and agricultural procurement centres. Smart India Hackathon 2026 (SIH26032).",
  keywords: [
    "KisanSetu",
    "Smart India Hackathon",
    "SIH26032",
    "Agricultural Procurement",
    "Farmer Queue Management",
    "Slot Booking",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d6b3a",
};

import { LanguageProvider } from "@/lib/languageContext";
import { StaffProvider } from "@/lib/staffStore";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f7f4ef] text-[#1a2319]">
        <LanguageProvider>
          <StaffProvider>{children}</StaffProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
