"use client";

import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const DashboardError: FC<DashboardErrorProps> = ({ error, reset }) => {
  return (
    <div className="space-y-4">
      {/* Route-level error boundary to surface failures from the dashboard tree */}
      <Alert variant="error" title="Dashboard failed to load">
        {error.message || "We could not load your dashboard data."}
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
};

export default DashboardError;
