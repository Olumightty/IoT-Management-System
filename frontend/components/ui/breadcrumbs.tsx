"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link className="text-slate-50 hover:text-emerald-200" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-50" : ""}>{item.label}</span>
            )}
            {isLast ? null : <span>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
