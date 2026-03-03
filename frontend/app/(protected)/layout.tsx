import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { SessionHydrator } from "@/components/providers/session-hydrator";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/features/auth/logout-button";
import Link from "next/link";

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?reason=unauthorized");
  }

  return (
    <div className="space-y-8">
      {/* Hydrates client auth context with the server session before rendering protected children */}
      <SessionHydrator session={session} />
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-lg shadow-slate-950/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
            IoT Operations
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Control Center
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {session.profile.first_name} {session.profile.last_name} ·{" "}
            {session.profile.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:border-emerald-300/60"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:border-emerald-300/60"
          >
            Profile
          </Link>
          <Badge variant="accent">{session.profile.role}</Badge>
          <Badge variant="muted">
            Joined {new Date(session.profile.created_at).toLocaleDateString()}
          </Badge>
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
