import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AdminProvider } from "@/lib/adminContext";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "KisanSetu Admin Portal — APMC Procurement Coordination",
  description: "Centralized administrative and mandi queue operations portal for Indian agricultural procurement centers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d6b3a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f7f4ef] text-[#1a2319]">
        <AdminProvider>
          <AdminShell>{children}</AdminShell>
        </AdminProvider>
      </body>
    </html>
  );
}
