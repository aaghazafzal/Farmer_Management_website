"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, StatusBadge, Button } from "./ui";
import { useAdmin } from "../lib/adminContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/queue", label: "Live Queue Controller", icon: "🎫", highlight: true },
  { href: "/slots", label: "Slot Capacity Manager", icon: "⏱" },
  { href: "/farmers", label: "Farmer Verification", icon: "🧑‍🌾" },
  { href: "/procurement", label: "Weighbridge & Quality", icon: "⚖" },
  { href: "/centres", label: "Mandi Directory", icon: "🏛" },
  { href: "/alerts", label: "Broadcast Alerts", icon: "📢" },
  { href: "/reports", label: "Reports & Audit Trail", icon: "📈" },
  { href: "/settings", label: "Centre Settings", icon: "⚙" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { centres, currentCentre, selectedCentreId, setSelectedCentreId, backendOnline } = useAdmin();

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex text-[#1a2319]">
      {/* ── Sidebar (Desktop) ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#ddd9d2] bg-white shrink-0 sticky top-0 h-screen z-20">
        {/* Logo & Portal Header */}
        <div className="p-4 lg:p-5 border-b border-[#ddd9d2] flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size={34} />
            <div>
              <div className="font-display font-bold text-base leading-tight text-[#1d6b3a]">KisanSetu</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#697067]">APMC Admin</div>
            </div>
          </Link>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#e8f0e9] text-[#1d6b3a] rounded-full border border-emerald-200">
            v1.0
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto [scrollbar-width:thin]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1d6b3a] text-white shadow-xs font-bold"
                    : "text-[#1a2319] hover:bg-[#eeeae4]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Backend & Environment footer */}
        <div className="p-4 border-t border-[#ddd9d2] bg-[#f7f4ef] shrink-0 pb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#697067]">API Status</span>
            {backendOnline === true ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1d6b3a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live :8000
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Local Fallback
              </span>
            )}
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs font-semibold text-[#1d6b3a] hover:underline pt-1 border-t border-[#ddd9d2]/60"
          >
            <span>Switch to Farmer Portal</span>
            <span>↗</span>
          </a>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#ddd9d2] px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[#ddd9d2] text-[#1a2319] hover:bg-[#f7f4ef]"
            >
              ☰
            </button>

            {/* Mandi Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#697067] hidden sm:inline">Active Mandi:</span>
              <select
                value={selectedCentreId}
                onChange={(e) => setSelectedCentreId(e.target.value)}
                className="bg-[#f7f4ef] border border-[#ddd9d2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1d6b3a] focus:outline-none focus:ring-2 focus:ring-[#1d6b3a]"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.district})
                  </option>
                ))}
              </select>
              <StatusBadge status={currentCentre?.status || "open"} size="sm" />
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#eeeae4] rounded-xl border border-[#ddd9d2]">
              <span className="w-2 h-2 rounded-full bg-[#1d6b3a]" />
              <span className="text-xs font-semibold">Suresh Pal</span>
              <span className="text-[10px] text-[#697067]">Supervisor</span>
            </div>
            <Link href="/queue">
              <Button size="sm" variant="primary" icon="⚡">
                Live Queue
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ddd9d2]">
                  <div className="font-display font-bold text-[#1d6b3a]">KisanSetu Admin</div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                </div>
                <nav className="mt-4 space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        pathname === item.href ? "bg-[#1d6b3a] text-white" : "hover:bg-[#eeeae4]"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="pt-4 border-t border-[#ddd9d2] text-xs">
                <a href="http://localhost:3000" className="text-[#1d6b3a] font-bold">
                  Open Farmer View ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
