/**
 * Dashboard Layout
 * ================
 * The main app shell with sidebar navigation.
 *
 * DESIGN.MD layout:
 * - 220px fixed left sidebar ("Cabinet Tabs")
 * - 1px vertical hairline separator (#D8D0C0)
 * - 48px page margin from sidebar to content
 * - 1100px max content width
 * - AI Status at bottom of sidebar: "LEDGER · ONLINE · [timestamp]"
 * - Command bar fixed at bottom (implemented in child pages)
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Target,
  MessageSquare,
  Inbox,
  Workflow,
  LogOut,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
    stamp: "BRIEFING",
  },
  {
    label: "Contacts",
    href: "/crm/contacts",
    icon: Users,
    stamp: "CRM",
  },
  {
    label: "Opportunities",
    href: "/crm/opportunities",
    icon: Target,
    stamp: "PIPELINE",
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: Inbox,
    stamp: "UNIFIED",
  },
  {
    label: "Chat",
    href: "/chat",
    icon: MessageSquare,
    stamp: "AI AGENT",
  },
  {
    label: "Workflows",
    href: "/workflows",
    icon: Workflow,
    stamp: "AUTOMATION",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ─── Sidebar ("Cabinet Tabs") ────────────────────────────── */}
      <aside
        className="w-[220px] shrink-0 bg-surface-container-low border-r border-hairline flex flex-col fixed top-0 left-0 h-screen z-40"
      >
        {/* Logo */}
        <div className="p-4 pb-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-container rounded-[var(--radius-default)] flex items-center justify-center">
              <BookOpen
                className="w-4 h-4 text-on-primary"
                strokeWidth={1.5}
              />
            </div>
            <span className="font-headline text-lg font-medium text-on-surface">
              Ledger
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          <div className="text-stamp-label text-on-surface-variant mb-3 px-2">
            NAVIGATION
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-default)] text-body-sm transition-colors group ${
                  isActive
                    ? "bg-primary-fixed/20 text-on-surface border border-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container border border-transparent"
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive
                      ? "text-primary-container"
                      : "text-on-surface-variant"
                  }`}
                  strokeWidth={1.5}
                />
                <span className="flex-1">{item.label}</span>
                {/* DESIGN.MD: stamp-label style badge */}
                <span
                  className={`text-[9px] font-mono font-bold tracking-[0.1em] ${
                    isActive
                      ? "text-primary-container"
                      : "text-on-surface-variant/50 group-hover:text-on-surface-variant"
                  }`}
                >
                  {item.stamp}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* AI Status Line — bottom of sidebar */}
        <div className="p-4 border-t border-hairline">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-stamp-label text-secondary">
              LEDGER · ONLINE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles
              className="w-3.5 h-3.5 text-on-surface-variant"
              strokeWidth={1.5}
            />
            <span className="text-[10px] font-mono text-on-surface-variant">
              AI Agent Ready
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-3 flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-error transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ───────────────────────────────────── */}
      {/* DESIGN.MD: 48px margin from sidebar, 1100px max content width */}
      <main className="ml-[220px] flex-1">
        <div className="max-w-[1100px] mx-auto px-12 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
