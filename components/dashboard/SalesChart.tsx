"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface SalesChartProps {
  data: { hour: string; sales: number; revenue: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  // Filter to only show hours with some data context
  const filteredData = data.filter((_, i) => i >= 7 && i <= 22);

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-bold text-foreground mb-4">
        📊 Penjualan Per Jam (Hari Ini)
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "#718096" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#718096" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => [
                name === "revenue"
                  ? formatRupiah(value as number)
                  : `${value} transaksi`,
                name === "revenue" ? "Pendapatan" : "Transaksi",
              ]}
            />
            <Bar
              dataKey="sales"
              fill="#1A365D"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
