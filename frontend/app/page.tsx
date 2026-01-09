import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSession } from "@/lib/server/session";

function LandingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-64" />
    </div>
  );
}

async function HomeRouter() {
  // Route root requests to the right surface based on session presence.
  const session = await getServerSession();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}

export default function Home() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <HomeRouter />
    </Suspense>
  );
}
