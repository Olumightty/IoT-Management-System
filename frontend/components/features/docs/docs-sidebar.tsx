"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/mqtt", label: "MQTT Setup" },
  { href: "/docs/telemetry", label: "Telemetry + Commands" },
  { href: "/docs/arduino", label: "Arduino Example" },
  { href: "/docs/frontend", label: "Frontend Features" },
  { href: "/docs/troubleshooting", label: "Troubleshooting" },
];

function isFuzzyMatch(query: string, target: string) {
  let queryIndex = 0;
  let targetIndex = 0;
  while (queryIndex < query.length && targetIndex < target.length) {
    if (query[queryIndex] === target[targetIndex]) {
      queryIndex += 1;
    }
    targetIndex += 1;
  }
  return queryIndex === query.length;
}

function highlightMatch(label: string, query: string) {
  if (!query) return label;
  const normalizedQuery = query.toLowerCase();
  const normalizedLabel = label.toLowerCase();
  let queryIndex = 0;

  return (
    <>
      {label.split("").map((char, index) => {
        const isMatch =
          queryIndex < normalizedQuery.length &&
          normalizedLabel[index] === normalizedQuery[queryIndex];
        if (isMatch) {
          queryIndex += 1;
        }
        return (
          <span
            key={`${char}-${index}`}
            className={isMatch ? "text-emerald-200" : undefined}
          >
            {char}
          </span>
        );
      })}
    </>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return NAV_ITEMS;
    }
    return NAV_ITEMS.filter((item) =>
      isFuzzyMatch(normalized, item.label.toLowerCase()),
    );
  }, [query]);

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-slate-50">Documentation</p>
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Connect devices, stream telemetry, and operate your appliance fleet.
        </p>
      </div>

      <nav className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-muted-foreground)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-50">
          Docs Sections
        </p>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search docs..."
          className="mb-3"
        />
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              No matching sections.
            </p>
          ) : (
            filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-2 py-1 transition hover:bg-white/5 hover:text-slate-50",
                  pathname === item.href && "bg-white/10 text-slate-50",
                )}
              >
                {highlightMatch(item.label, query.trim())}
              </Link>
            ))
          )}
        </div>
      </nav>
    </aside>
  );
}
