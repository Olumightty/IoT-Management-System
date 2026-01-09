"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { createAppliance } from "@/lib/api/devices";
import type { Appliance } from "@/lib/types/device";

const applianceSchema = z.object({
  label: z.string().min(2, "Appliance label is required"),
  rated_power: z
    .number({ coerce: true })
    .positive("Rated power must be greater than 0"),
});

type ApplianceFormValues = z.infer<typeof applianceSchema>;

interface CreateApplianceFormProps {
  deviceId: string | null;
  onCreated: (appliance: Appliance) => void;
}

export function CreateApplianceForm({
  deviceId,
  onCreated,
}: CreateApplianceFormProps) {
  const { apiClient } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplianceFormValues>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      label: "",
      rated_power: 0,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!deviceId) {
      setFormError("Pair a device before adding appliances.");
      return;
    }
    setFormError(null);
    try {
      // Persist appliance against the selected device and push into local list.
      const appliance = await createAppliance(apiClient, deviceId, values);
      onCreated(appliance);
      reset();
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(
          (error.response?.data as { message?: string })?.message ??
            "Unable to add this appliance.",
        );
      } else {
        setFormError("Unable to add this appliance right now.");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="appliance_label">
            Appliance label
          </label>
          <Input
            id="appliance_label"
            placeholder="fan_1"
            {...register("label")}
            error={errors.label?.message}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="rated_power">
            Rated power (W)
          </label>
          <Input
            id="rated_power"
            type="number"
            placeholder="120"
            {...register("rated_power", { valueAsNumber: true })}
            error={errors.rated_power?.message}
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || !deviceId}>
        {isSubmitting ? "Creating..." : "Add appliance"}
      </Button>
    </form>
  );
}
