"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import type { MetricsPoint } from "@/lib/types/analytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MultiAxisTelemetryChartProps {
  data: MetricsPoint[];
}

export function MultiAxisTelemetryChart({ data }: MultiAxisTelemetryChartProps) {
  const [focus, setFocus] = useState<"voltage" | "current" | "power" | null>(
    null,
  );
  const [visibleSeries, setVisibleSeries] = useState({
    voltage: true,
    current: true,
    power: true,
  });

  const rawSeries = useMemo(
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

  const filteredSeries = useMemo(() => {
    if (focus) {
      return rawSeries.filter((entry) =>
        entry.name.toLowerCase().includes(focus),
      );
    }
    return rawSeries.filter((entry) => {
      if (entry.name.startsWith("Voltage")) return visibleSeries.voltage;
      if (entry.name.startsWith("Current")) return visibleSeries.current;
      return visibleSeries.power;
    });
  }, [focus, rawSeries, visibleSeries]);

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 320,
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      foreColor: "#e2e8f0",
      background: "transparent",
    },
    stroke: { curve: "smooth", width: [2, 2, 1] },
    colors: ["#60a5fa", "#f97316", "#34d399"],
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(226,232,240,0.1)" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis:
      focus === "power"
        ? [
            {
              seriesName: "Power (W)",
              title: { text: "Power (W)" },
              labels: { style: { colors: "#34d399" } },
            },
          ]
        : [
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
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      x: { format: "dd MMM, HH:mm" },
    },
    legend: { position: "top", labels: { colors: "#e2e8f0" } },
    noData: {
      text: "Waiting for telemetry...",
      style: { color: "#94a3b8" },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">Toggle series</Badge>
          <Button
            size="sm"
            variant={visibleSeries.voltage ? "primary" : "ghost"}
            onClick={() =>
              setVisibleSeries((prev) => ({
                ...prev,
                voltage: !prev.voltage,
              }))
            }
          >
            Voltage
          </Button>
          <Button
            size="sm"
            variant={visibleSeries.current ? "primary" : "ghost"}
            onClick={() =>
              setVisibleSeries((prev) => ({
                ...prev,
                current: !prev.current,
              }))
            }
          >
            Current
          </Button>
          <Button
            size="sm"
            variant={visibleSeries.power ? "primary" : "ghost"}
            onClick={() =>
              setVisibleSeries((prev) => ({
                ...prev,
                power: !prev.power,
              }))
            }
          >
            Power
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">Focus view</Badge>
          <Button
            size="sm"
            variant={focus === null ? "primary" : "ghost"}
            onClick={() => setFocus(null)}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={focus === "voltage" ? "primary" : "ghost"}
            onClick={() => setFocus("voltage")}
          >
            Voltage
          </Button>
          <Button
            size="sm"
            variant={focus === "current" ? "primary" : "ghost"}
            onClick={() => setFocus("current")}
          >
            Current
          </Button>
          <Button
            size="sm"
            variant={focus === "power" ? "primary" : "ghost"}
            onClick={() => setFocus("power")}
          >
            Power
          </Button>
        </div>
      </div>

      <ReactApexChart
        options={options}
        series={filteredSeries}
        type="line"
        height={320}
      />
    </div>
  );
}
