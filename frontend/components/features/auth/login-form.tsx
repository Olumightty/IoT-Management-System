"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchProfile, login } from "@/lib/api/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiClient, setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const redirectReason = searchParams.get("reason");

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // Authenticate, hydrate profile, and move the user into the dashboard.
      const authResponse = await login(apiClient, values);
      //because profile fetching requires an access token which cause a 401 error when not present leading to the loop I was seeing 
      const profile = await fetchProfile(apiClient, authResponse.accessToken);
      setSession(authResponse.accessToken, profile);
      router.push("/dashboard");
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(
          (error.response?.data as { message?: string })?.message ??
            "Unable to sign in with those credentials.",
        );
      } else {
        setFormError("Unable to sign in right now. Please try again.");
      }
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      {redirectReason === "unauthorized" ? (
        <Alert variant="warning">
          Your session ended. Please log back in to manage your devices.
        </Alert>
      ) : null}
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="email">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
            error={errors.email?.message}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
            autoComplete="current-password"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
