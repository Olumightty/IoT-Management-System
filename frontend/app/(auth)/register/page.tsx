import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/features/auth/register-form";
import { AuthShell } from "@/components/layouts/auth-shell";
import { getServerSession } from "@/lib/server/session";
import { Skeleton } from "@/components/ui/skeleton";

function RegisterFallback() {
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

async function RegisterContent() {
  // Prevent authenticated users from landing on the register page.
  const session = await getServerSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Provision secure access for your IoT fleet."
      footer={
        <p className="text-center text-[var(--color-muted-foreground)]">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-emerald-200 underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}
