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
import { pairDevice } from "@/lib/api/devices";
import type { Device } from "@/lib/types/device";

const macRegex =
  /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const pairSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters"),
  mac_address: z
    .string()
    .regex(macRegex, "Enter a valid MAC address (e.g., AA:BB:CC:DD:EE:FF)"),
});

type PairFormValues = z.infer<typeof pairSchema>;

interface PairDeviceFormProps {
  onDeviceCreated: (device: Device) => void;
}

export function PairDeviceForm({ onDeviceCreated }: PairDeviceFormProps) {
  const { apiClient } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PairFormValues>({
    resolver: zodResolver(pairSchema),
    defaultValues: {
      label: "",
      mac_address: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // Create the device then bubble it up to sync list selection.
      const device = await pairDevice(apiClient, values);
      onDeviceCreated(device);
      reset();
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(
          (error.response?.data as { message?: string })?.message ??
            "Unable to pair this device.",
        );
      } else {
        setFormError("Unable to pair this device right now.");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="label">
            Device label
          </label>
          <Input
            id="label"
            placeholder="Living room gateway"
            {...register("label")}
            error={errors.label?.message}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="mac_address">
            MAC address
          </label>
          <Input
            id="mac_address"
            placeholder="AA:BB:CC:DD:EE:FF"
            {...register("mac_address")}
            error={errors.mac_address?.message}
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Pairing..." : "Pair device"}
      </Button>
    </form>
  );
}
