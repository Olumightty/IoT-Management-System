"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchProfile, register as registerUser } from "@/lib/api/auth";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { apiClient, setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // Create the account then hydrate client auth and redirect.
      const authResponse = await registerUser(apiClient, values);
      const profile = await fetchProfile(apiClient);
      setSession(authResponse.accessToken, profile);
      router.push("/dashboard");
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(
          (error.response?.data as { message?: string })?.message ??
            "Unable to create your account. Please try again.",
        );
      } else {
        setFormError("Unable to create your account. Please try again.");
      }
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="first_name">
            First name
          </label>
          <Input
            id="first_name"
            placeholder="Ada"
            {...register("first_name")}
            error={errors.first_name?.message}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="last_name">
            Last name
          </label>
          <Input
            id="last_name"
            placeholder="Lovelace"
            {...register("last_name")}
            error={errors.last_name?.message}
            autoComplete="family-name"
          />
        </div>
      </div>
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
          autoComplete="new-password"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
