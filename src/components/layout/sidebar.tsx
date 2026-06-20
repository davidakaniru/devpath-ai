"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BrainCircuit,
  ChevronsLeft,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Waypoints,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning-path", label: "Learning Path", icon: Waypoints },
  { href: "/revision", label: "Revision", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-assistant", label: "AI Assistant", icon: BrainCircuit },
];

interface SidebarProps {
  user: { fullName: string; email: string };
}

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* mobile topbar trigger */}
      <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg path-glow">
            <Route className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-base font-bold text-sidebar-foreground">
            DevPath AI
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/60 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg path-glow">
                  <Route className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-display text-base font-bold text-sidebar-foreground">
                  DevPath AI
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/60 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <NavLinks
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <SidebarFooter
              collapsed={false}
              initials={initials}
              user={user}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-18" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border px-4 py-4",
            collapsed ? "justify-center px-0" : "justify-between",
          )}
        >
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg path-glow">
                <Route className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display text-base font-bold text-sidebar-foreground">
                DevPath AI
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg path-glow">
              <Route className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks collapsed={collapsed} />
        </div>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            "flex items-center gap-2 border-t border-sidebar-border px-4 py-3 text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground cursor-pointer",
            collapsed && "justify-center px-0",
          )}
        >
          <ChevronsLeft
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>

        <SidebarFooter
          collapsed={collapsed}
          initials={initials}
          user={user}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}

function SidebarFooter({
  collapsed,
  initials,
  user,
  onLogout,
}: {
  collapsed: boolean;
  initials: string;
  user: { fullName: string; email: string };
  onLogout: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-sidebar-border px-4 py-4",
        collapsed && "justify-center px-0",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {initials}
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user.fullName}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/50">
            {user.email}
          </p>
        </div>
      )}
      <button
        onClick={onLogout}
        title="Log out"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-destructive/15 hover:text-destructive cursor-pointer"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
