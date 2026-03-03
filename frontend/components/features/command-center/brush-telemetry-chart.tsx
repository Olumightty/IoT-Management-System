"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import type { MetricsPoint } from "@/lib/types/analytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BrushTelemetryChartProps {
  data: MetricsPoint[];
  seriesLabel?: string;
}

export function BrushTelemetryChart({
  data,
  seriesLabel = "Power (W)",
}: BrushTelemetryChartProps) {
  const series = useMemo(
    () => [
      {
        name: seriesLabel,
        data: data.map((point) => ({
          x: new Date(point._time).getTime(),
          y: point.power,
        })),
      },
    ],
    [data, seriesLabel],
  );

  const mainOptions: ApexOptions = {
    chart: {
      id: "mainChart",
      type: "area",
      height: 260,
      toolbar: { show: false },
      zoom: { enabled: true },
      foreColor: "#e2e8f0",
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#38bdf8"],
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(226,232,240,0.12)" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: {
      labels: { style: { colors: "#cbd5e1" } },
    },
    tooltip: { theme: "dark", x: { format: "dd MMM, HH:mm" } },
  };

  const brushOptions: ApexOptions = {
    chart: {
      id: "brushChart",
      type: "area",
      height: 120,
      brush: { target: "mainChart", enabled: true },
      selection: {
        enabled: true,
        fill: { color: "#22d3ee", opacity: 0.2 },
        stroke: { color: "#22d3ee" },
      },
      toolbar: { show: false },
      foreColor: "#e2e8f0",
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 1 },
    colors: ["#22d3ee"],
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(226,232,240,0.1)" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: { labels: { show: false } },
  };

  return (
    <div className="space-y-4">
      <ReactApexChart options={mainOptions} series={series} type="area" height={260} />
      <ReactApexChart options={brushOptions} series={series} type="area" height={120} />
    </div>
  );
}
