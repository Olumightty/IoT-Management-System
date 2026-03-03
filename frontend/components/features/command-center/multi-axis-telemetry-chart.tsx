"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import type { MetricsPoint } from "@/lib/types/analytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MultiAxisTelemetryChartProps {
  data: MetricsPoint[];
}

export function MultiAxisTelemetryChart({ data }: MultiAxisTelemetryChartProps) {
  const series = useMemo(
    () => [
      {
        name: "Voltage (V)",
        type: "line",
        data: data.map((point) => ({
          x: new Date(point._time).getTime(),
          y: point.voltage,
        })),
      },
      {
        name: "Current (A)",
        type: "line",
        data: data.map((point) => ({
          x: new Date(point._time).getTime(),
          y: point.current,
        })),
      },
      {
        name: "Power (W)",
        type: "area",
        data: data.map((point) => ({
          x: new Date(point._time).getTime(),
          y: point.power,
        })),
      },
    ],
    [data],
  );

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 320,
      toolbar: { show: false },
      foreColor: "#e2e8f0",
      background: "transparent",
    },
    stroke: { curve: "smooth", width: [2, 2, 1] },
    colors: ["#60a5fa", "#f97316", "#34d399"],
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(226,232,240,0.1)" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: [
      {
        seriesName: "Voltage (V)",
        title: { text: "Voltage (V)" },
        labels: { style: { colors: "#93c5fd" } },
      },
      {
        seriesName: "Current (A)",
        opposite: true,
        title: { text: "Current (A)" },
        labels: { style: { colors: "#fdba74" } },
      },
    ],
    tooltip: { shared: true, theme: "dark", x: { format: "dd MMM, HH:mm" } },
    legend: { position: "top", labels: { colors: "#e2e8f0" } },
  };

  return <ReactApexChart options={options} series={series} type="line" height={320} />;
}
