"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { MetricsPoint } from "@/lib/types/analytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TelemetryChartProps {
  data: MetricsPoint[];
}

export function TelemetryChart({ data }: TelemetryChartProps) {
  // Map metrics into multi-series line chart for power/voltage/current.
  const series = [
    {
      name: "Power (W)",
      data: data.map((point) => ({
        x: new Date(point._time).getTime(),
        y: point.power,
      })),
    },
    {
      name: "Voltage (V)",
      data: data.map((point) => ({
        x: new Date(point._time).getTime(),
        y: point.voltage,
      })),
    },
    {
      name: "Current (A)",
      data: data.map((point) => ({
        x: new Date(point._time).getTime(),
        y: point.current,
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 320,
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: "#e2e8f0",
      background: "transparent",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#34d399", "#818cf8", "#fcd34d"],
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(226, 232, 240, 0.1)",
      strokeDashArray: 4,
    },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false },
      axisBorder: { color: "rgba(226, 232, 240, 0.16)" },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#cbd5e1",
        },
      },
    },
    legend: {
      position: "top",
      labels: { colors: "#e2e8f0" },
    },
    tooltip: {
      shared: true,
      theme: "dark",
      x: { format: "dd MMM, HH:mm" },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={320}
    />
  );
}
