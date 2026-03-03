import { Skeleton } from "@/components/ui/skeleton";

export default function DeviceLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-64 rounded-xl" />
      <Skeleton className="h-80 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
