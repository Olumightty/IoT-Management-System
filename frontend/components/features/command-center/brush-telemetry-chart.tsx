"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import type { MetricsPoint } from "@/lib/types/analytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BrushTelemetryChartProps {
  data: MetricsPoint[];
  seriesLabel?: string;
}

export function BrushTelemetryChart({
  data,
  seriesLabel = "Power (W)",
}: BrushTelemetryChartProps) {
  const [selectionRange, setSelectionRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

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

  const timeRange = useMemo(() => {
    if (data.length === 0) {
      return null;
    }
    const timestamps = data.map((point) => new Date(point._time).getTime());
    return { min: Math.min(...timestamps), max: Math.max(...timestamps) };
  }, [data]);

  const stats = useMemo(() => {
    if (data.length === 0) {
      return null;
    }
    const powers = data.map((point) => point.power);
    const min = Math.min(...powers);
    const max = Math.max(...powers);
    const avg = powers.reduce((sum, value) => sum + value, 0) / powers.length;
    return { min, max, avg };
  }, [data]);

  useEffect(() => {
    if (!timeRange) {
      setSelectionRange(null);
      return;
    }
    setSelectionRange({ min: timeRange.min, max: timeRange.max });
  }, [timeRange]);

  const formatTimestamp = (value: number) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const setLastWindow = (hours: number) => {
    if (!timeRange) return;
    const max = timeRange.max;
    const min = Math.max(timeRange.min, max - hours * 60 * 60 * 1000);
    setSelectionRange({ min, max });
  };

  const mainOptions: ApexOptions = {
    chart: {
      id: "mainChart",
      type: "area",
      height: 260,
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
    markers: { size: 0, hover: { size: 4 } },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      x: { format: "dd MMM, HH:mm" },
    },
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
        xaxis: selectionRange ?? undefined,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {stats ? (
            <>
              <Badge variant="muted">Min {stats.min.toFixed(1)} W</Badge>
              <Badge variant="muted">Avg {stats.avg.toFixed(1)} W</Badge>
              <Badge variant="muted">Max {stats.max.toFixed(1)} W</Badge>
            </>
          ) : (
            <Badge variant="muted">Waiting for data</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* <Button size="sm" variant="ghost" onClick={() => setLastWindow(6)}>
            Last 6h
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setLastWindow(12)}>
            Last 12h
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setLastWindow(24)}>
            Last 24h
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              if (!timeRange) return;
              setSelectionRange({ min: timeRange.min, max: timeRange.max });
            }}
          >
            Full Range
          </Button> */}
        </div>
      </div>

      {selectionRange ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Viewing {formatTimestamp(selectionRange.min)} –{" "}
          {formatTimestamp(selectionRange.max)}. Drag the brush to zoom into a
          smaller window.
        </p>
      ) : null}

      <ReactApexChart options={mainOptions} series={series} type="area" height={260} />
      <ReactApexChart options={brushOptions} series={series} type="area" height={120} />
    </div>
  );
}
