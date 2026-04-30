"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "navy" | "emerald" | "warning" | "danger";
}

const colorMap = {
  navy: "bg-navy-50 text-navy-600",
  emerald: "bg-emerald-50 text-emerald-500",
  warning: "bg-orange-50 text-warning",
  danger: "bg-red-50 text-danger",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "navy",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            colorMap[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
