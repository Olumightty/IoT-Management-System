"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    setSubmitting(true);
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={submitting}
    >
      {submitting ? "Signing out..." : "Sign out"}
    </Button>
  );
}
