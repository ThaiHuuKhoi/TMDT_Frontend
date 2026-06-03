"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import api from "@/utils/axiosConfig";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RecommendationItem = {
  productId: number;
  productName: string;
  categoryName: string;
  unitsSold30d: number;
  availableStock: number;
  daysOfCover: number;
  marketDemandIndex: number;
  internalSalesMomentum: number;
  stockRiskIndex: number;
  opportunityScore: number;
  recommendedQty: number;
  priority: string;
  reason: string;
};

type RecommendationResponse = {
  generatedAt: string;
  lookbackDays: number;
  horizonDays: number;
  totalCandidates: number;
  formula: string;
  items: RecommendationItem[];
};

const scoreClassName = (score: number) => {
  if (score >= 75) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-zinc-700 bg-zinc-50 border-zinc-200";
};

const MarketRecommendations = () => {
  const { data, isLoading, error } = useQuery<RecommendationResponse>({
    queryKey: ["marketRecommendations"],
    queryFn: async () => {
      const res = await api.get("/orders/admin/market-recommendations?limit=20&horizonDays=14");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        Không tải được dữ liệu phân tích thị trường.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Sản phẩm đủ điều kiện</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{data.totalCandidates}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Kỳ nhìn lại</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{data.lookbackDays} ngày</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Kỳ đề xuất nhập</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{data.horizonDays} ngày</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-zinc-600">
          Công thức: <span className="font-medium">{data.formula}</span>
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-zinc-800">Top sản phẩm nên nhập</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Bán 30 ngày</TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead className="text-right">Đủ hàng (ngày)</TableHead>
              <TableHead className="text-right">Điểm cơ hội</TableHead>
              <TableHead className="text-right">SL gợi ý nhập</TableHead>
              <TableHead>Lý do</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-500">
                  Chưa có gợi ý phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.unitsSold30d}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.availableStock}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.daysOfCover}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${scoreClassName(item.opportunityScore)}`}>
                      {item.opportunityScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{item.recommendedQty}</TableCell>
                  <TableCell className="max-w-[320px] text-sm text-zinc-600">{item.reason}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MarketRecommendations;
