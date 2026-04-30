"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface TopProductsProps {
  data: { name: string; quantity: number; revenue: number }[];
}

const COLORS = ["#1A365D", "#2D5A9E", "#38A169", "#DD6B20", "#718096"];

export default function TopProducts({ data }: TopProductsProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-bold text-foreground mb-4">
        🏆 Top 5 Produk Terlaris
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          Belum ada data penjualan hari ini
        </p>
      ) : (
        <>
          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: "#718096" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value} pcs`, "Terjual"]}
                />
                <Bar dataKey="quantity" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {data.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {data.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-medium truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-muted">
                    {item.quantity} pcs ·{" "}
                  </span>
                  <span className="font-mono text-xs font-medium">
                    {formatRupiah(item.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
