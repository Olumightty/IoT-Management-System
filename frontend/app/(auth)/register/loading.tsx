import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterLoading() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center">
      <div className="mb-10 h-16 w-64 space-y-3 text-center">
        <Skeleton className="mx-auto h-4 w-28" />
        <Skeleton className="mx-auto h-6 w-48" />
      </div>
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-white/10 bg-[var(--color-card)]/70 p-8">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
