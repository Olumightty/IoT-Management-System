import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { SessionHydrator } from "@/components/providers/session-hydrator";

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?reason=unauthorized");
  }

  return (
    <div className="space-y-8">
      {/* Hydrates client auth context with the server session before rendering protected children */}
      <SessionHydrator session={session} />
      {children}
    </div>
  );
}
