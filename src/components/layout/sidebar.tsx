"use client";

import { cn } from "@/lib/utils";
import { ChevronsLeft, LogOut, LucideIcon, Menu, Route, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  user: { fullName: string; email: string };
  navItems: SidebarNavItem[];
  homeHref: string;
  brandLabel: string;
}

/** Animates width/opacity/margin instead of mounting-unmounting, so the
 * collapse/expand transition reads as a smooth slide rather than a snap. */
function Collapsible({
  collapsed,
  className,
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-200",
        collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-40 opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SidebarHeader({
  collapsed,
  homeHref,
  brandLabel,
  onClose,
}: {
  collapsed: boolean;
  homeHref: string;
  brandLabel: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center border-b border-sidebar-border px-4 py-4">
      <Link
        href={homeHref}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg path-glow"
      >
        <Route className="h-3.5 w-3.5 text-white" />
      </Link>
      <Collapsible
        collapsed={collapsed}
        className="flex-1 truncate font-display text-base font-bold text-sidebar-foreground"
      >
        {brandLabel}
      </Collapsible>
      {onClose && (
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/60 cursor-pointer"
          aria-label="Close menu"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
}

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center border-t border-sidebar-border px-4 py-3 text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground cursor-pointer"
    >
      <ChevronsLeft
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          collapsed && "rotate-180",
        )}
      />
      <Collapsible collapsed={collapsed}>Collapse</Collapsible>
    </button>
  );
}

function NavLinks({
  collapsed,
  navItems,
  onNavigate,
}: {
  collapsed: boolean;
  navItems: SidebarNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  // Pick the longest matching href rather than any prefix match, so a root
  // item like "/admin" doesn't light up alongside "/admin/users" — both
  // match the naive prefix check, but only the more specific one is "active".
  const activeHref = navItems
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <Collapsible collapsed={collapsed}>{label}</Collapsible>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ user, navItems, homeHref, brandLabel }: SidebarProps) {
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

  function toggleCollapsed() {
    setCollapsed((prev) => !prev);
  }

  return (
    <>
      {/* mobile topbar trigger */}
      <div className="flex w-full shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden">
        <Link href={homeHref} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg path-glow">
            <Route className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-base font-bold text-sidebar-foreground">
            {brandLabel}
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

      {/* mobile drawer — kept mounted (not conditionally rendered) so
          open/close can transition via transform/opacity instead of
          snapping in and out on mount/unmount */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ease-in-out",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex max-w-[80vw] flex-col bg-sidebar shadow-2xl transition-[width,transform] duration-200 ease-in-out",
            collapsed ? "w-20" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarHeader
            collapsed={collapsed}
            homeHref={homeHref}
            brandLabel={brandLabel}
            onClose={() => setMobileOpen(false)}
          />

          <div className="flex-1 overflow-y-auto py-4">
            <NavLinks
              collapsed={collapsed}
              navItems={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>

          <CollapseToggle collapsed={collapsed} onToggle={toggleCollapsed} />

          <SidebarFooter
            collapsed={collapsed}
            initials={initials}
            user={user}
            onLogout={handleLogout}
          />
        </aside>
      </div>

      {/* desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out lg:flex",
          collapsed ? "w-18" : "w-64",
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          homeHref={homeHref}
          brandLabel={brandLabel}
        />

        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks collapsed={collapsed} navItems={navItems} />
        </div>

        <CollapseToggle collapsed={collapsed} onToggle={toggleCollapsed} />

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
    <div className="flex items-center border-t border-sidebar-border px-4 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {initials}
      </div>
      <Collapsible collapsed={collapsed} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sidebar-foreground">
          {user.fullName}
        </p>
        <p className="truncate text-xs text-sidebar-foreground/50">
          {user.email}
        </p>
      </Collapsible>
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
