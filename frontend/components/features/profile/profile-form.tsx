"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { updateProfile } from "@/lib/api/auth";
import type { UserProfile } from "@/lib/types/auth";

const schema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  phone_number: z
    .string()
    .optional()
    .refine((value) => !value || /^\+234\d{10}$/.test(value), {
      message: "Use Nigerian format: +234XXXXXXXXXX",
    }),
  theme: z.enum(["dark", "light"]),
});

type ProfileFormValues = z.infer<typeof schema>;

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { setProfile, apiClient } = useAuth();
  const { theme, setTheme } = useTheme();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const defaultValues = useMemo<ProfileFormValues>(
    () => ({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone_number: profile.phone_number ?? "",
      theme: theme === "light" ? "light" : "dark",
    }),
    [profile, theme],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ProfileFormValues) =>
      updateProfile(apiClient, {
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone_number: payload.phone_number,
      }),
    onSuccess: (response) => {
      setProfile(response.data);
      setStatusMessage("Profile updated successfully.");
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setStatusMessage(null);
    const previousProfile = profile;
    const optimisticProfile: UserProfile = {
      ...previousProfile,
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
    };
    setProfile(optimisticProfile);
    setTheme(values.theme);

    try {
      await updateMutation.mutateAsync(values);
    } catch {
      setProfile(previousProfile);
    }
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\s+/g, "");
    if (!value) {
      setValue("phone_number", "");
      return;
    }
    if (!value.startsWith("+234")) {
      value = value.replace(/^0+/, "");
      value = `+234${value.replace(/^\+/, "")}`;
    }
    setValue("phone_number", value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            First name
          </label>
          <Input {...register("first_name")} placeholder="John" />
          {errors.first_name ? (
            <p className="mt-1 text-xs text-rose-300">{errors.first_name.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Last name
          </label>
          <Input {...register("last_name")} placeholder="Doe" />
          {errors.last_name ? (
            <p className="mt-1 text-xs text-rose-300">{errors.last_name.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Phone number
        </label>
        <Input
          {...register("phone_number")}
          onChange={handlePhoneChange}
          placeholder="+2348012345678"
        />
        {errors.phone_number ? (
          <p className="mt-1 text-xs text-rose-300">{errors.phone_number.message}</p>
        ) : null}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Theme preference
        </p>
        <div className="mt-2 flex gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-50">
            <input
              type="radio"
              value="dark"
              {...register("theme")}
              className="h-4 w-4"
            />
            Command Center (Dark)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-50">
            <input
              type="radio"
              value="light"
              {...register("theme")}
              className="h-4 w-4"
            />
            Daylight (Light)
          </label>
        </div>
      </div>

      {statusMessage ? <Alert variant="success">{statusMessage}</Alert> : null}
      {updateMutation.isError ? (
        <Alert variant="error">
          {isAxiosError(updateMutation.error)
            ? (updateMutation.error.response?.data as { message?: string })
                ?.message ?? "Unable to update profile."
            : "Unable to update profile."}
        </Alert>
      ) : null}

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
