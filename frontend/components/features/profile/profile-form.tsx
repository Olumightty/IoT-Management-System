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
import { COUNTRIES } from "@/lib/constants";

const schema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  phone_number: z
    .string()
    .optional()
    .refine((value) => !value || /^\+234\d{10}$/.test(value), {
      message: "Use Nigerian format: +234XXXXXXXXXX",
    }),
  country: z.string().min(1, "Country is required").max(60, "Country name is too long").optional(),
  tarriff_rate: z.string().refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), "Invalid tarriff rate").optional(),
  address: z.string().min(1, "Address is required").optional(),
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
      address: profile.address ?? "",
      country: profile.country ?? "",
      tarriff_rate: String(profile.tarriff_rate ? profile.tarriff_rate /100 : null) ?? "",
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
        address: payload.address,
        country: payload.country,
        tarriff_rate: Number(payload.tarriff_rate) * 100,
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
      address: values.address,
      country: values.country,
      tarriff_rate: Number(values.tarriff_rate) / 100,
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
        <label className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Country
        </label>
        <select
          id="country"
          {...register("country")}
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-white/10 focus:bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          autoComplete="country"
        >
          <option value="" disabled hidden>
            Select a country
          </option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country ? (
          <p className="mt-1 text-xs text-rose-300">{errors.country.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Address
        </label>
        <Input {...register("address")} placeholder="123 Main Street" />
        {errors.address ? (
          <p className="mt-1 text-xs text-rose-300">{errors.address.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          {"Tariff Rate (This will be resolved to your country's local currency)"}
        </label>
        <Input
          {...register("tarriff_rate")}
          type="number"
          step="0.01"
          placeholder="0.00"
        />
        {errors.tarriff_rate ? (
          <p className="mt-1 text-xs text-rose-300">{errors.tarriff_rate.message}</p>
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
