"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { LogoutButton } from "@/components/features/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[rgba(2,6,23,0.82)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200/90"
          >
            IoT Console
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-[var(--color-muted-foreground)] sm:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition hover:text-slate-50",
                  pathname === item.href && "text-slate-50",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" variant="primary">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              {profile ? (
                <Badge variant="muted" className="hidden sm:inline-flex">
                  {profile.first_name} {profile.last_name}
                </Badge>
              ) : null}
              <Button asChild size="sm" variant="ghost">
                <Link href="/docs">Docs</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <LogoutButton />
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="sm:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? "Close" : "Menu"}
          </Button>
        </div>
      </div>
      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-white/10 bg-[rgba(2,6,23,0.95)] px-6 py-4 transition-all duration-200 ease-out sm:hidden",
          isOpen
            ? "max-h-96 opacity-100"
            : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <div className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-2 py-1 transition hover:bg-white/5 hover:text-slate-50",
                pathname === item.href && "text-slate-50",
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" variant="primary">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              {profile ? (
                <Badge variant="muted">
                  {profile.first_name} {profile.last_name}
                </Badge>
              ) : null}
              <Button asChild size="sm" variant="ghost">
                <Link href="/docs">Docs</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
