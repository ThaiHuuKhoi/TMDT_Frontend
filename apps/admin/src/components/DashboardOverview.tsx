"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/axiosConfig";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminDashboardStats = {
  totalRevenue: number | string;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  monthlyOrders: { month: string; total: number; successful: number }[];
  monthlyRevenue: { month: string; revenue: number | string }[];
  topProducts: {
    productId: number;
    productName: string;
    unitsSold: number;
    revenue: number | string;
  }[];
};

type RecentOrder = {
  id: number;
  status: string;
  createdAt: string;
  totalAmount: number;
  user?: { name?: string; email?: string };
};

function num(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

const barConfig = {
  total: { label: "Tổng đơn", color: "var(--chart-1)" },
  successful: { label: "Hoàn tất", color: "var(--chart-4)" },
} satisfies ChartConfig;

const areaConfig = {
  revenue: { label: "Doanh thu (VNĐ)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const DashboardOverview = () => {
  const { data, isLoading, error } = useQuery<AdminDashboardStats>({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const res = await api.get("/orders/admin/stats");
      return res.data;
    },
  });
  const { data: recentOrders, isLoading: isLoadingRecent } = useQuery<RecentOrder[]>({
    queryKey: ["adminRecentOrders"],
    queryFn: async () => {
      const res = await api.get("/orders/admin/all?limit=5");
      const payload = res.data;
      return Array.isArray(payload) ? payload : payload?.items || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Không tải được thống kê dashboard.
      </div>
    );
  }

  const revenue = num(data.totalRevenue);
  const pieEntries = Object.entries(data.ordersByStatus || {});
  const pieData = pieEntries.map(([status, count], i) => ({
    status,
    count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const pieTotal = pieData.reduce((a, b) => a + b.count, 0);

  const revenueChartData = (data.monthlyRevenue || []).map((r) => ({
    month: r.month,
    revenue: num(r.revenue),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Doanh thu (đơn đã thanh toán / giao / hoàn tất)</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
              revenue
            )}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Tổng số đơn</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{data.totalOrders}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-zinc-500">Trạng thái đơn</p>
          <ul className="mt-2 space-y-1 text-sm">
            {pieEntries.length === 0 ? (
              <li className="text-zinc-400">Chưa có dữ liệu</li>
            ) : (
              pieEntries.map(([st, c]) => (
                <li key={st} className="flex justify-between gap-2">
                  <span className="font-medium text-zinc-700">{st}</span>
                  <span className="tabular-nums text-zinc-600">{c}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-zinc-800">Đơn hàng theo tháng</h2>
          <ChartContainer config={barConfig} className="min-h-[260px] w-full">
            <BarChart data={data.monthlyOrders || []}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(v) => String(v).slice(0, 3)}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="successful" fill="var(--color-successful)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-zinc-800">Tỷ lệ trạng thái</h2>
          {pieData.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center text-zinc-400">Chưa có đơn</div>
          ) : (
            <ChartContainer
              config={
                pieEntries.reduce(
                  (acc, [st], i) => {
                    acc[st] = { label: st, color: CHART_COLORS[i % CHART_COLORS.length] ?? CHART_COLORS[0]! };
                    return acc;
                  },
                  {} as Record<string, { label: string; color: string }>
                ) as ChartConfig
              }
              className="mx-auto aspect-square max-h-[280px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={56}
                  strokeWidth={3}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                              {pieTotal}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                              Đơn
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-zinc-800">Doanh thu theo tháng (6 tháng gần nhất)</h2>
        <ChartContainer config={areaConfig} className="min-h-[260px] w-full">
          <AreaChart data={revenueChartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(v) => String(v).slice(0, 3)}
            />
            <YAxis tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                      Number(value)
                    )
                  }
                />
              }
            />
            <defs>
              <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="url(#fillRev)"
              fillOpacity={0.35}
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-zinc-800">Sản phẩm bán chạy (theo đơn đã thanh toán / giao / hoàn tất)</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Đã bán</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.topProducts || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-zinc-500">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.topProducts.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell className="font-medium">{p.productName}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.unitsSold}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                      num(p.revenue)
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-zinc-800">Đơn gần đây</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingRecent ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : !(recentOrders || []).length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  Chưa có đơn hàng
                </TableCell>
              </TableRow>
            ) : (
              (recentOrders || []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono">#{o.id}</TableCell>
                  <TableCell>{o.user?.name || o.user?.email || "—"}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                      Number(o.totalAmount || 0)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${o.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                      Xem
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DashboardOverview;
