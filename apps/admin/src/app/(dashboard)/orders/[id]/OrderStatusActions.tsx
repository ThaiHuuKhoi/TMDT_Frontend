"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/utils/axiosConfig";

const TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const LABELS: Record<string, string> = {
  PAID: "Đã thanh toán",
  SHIPPED: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Hủy đơn",
};

type Props = {
  orderId: number;
  status: string;
};

const OrderStatusActions = ({ orderId, status }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  const nextStatuses = TRANSITIONS[status] || [];

  const updateStatus = async (newStatus: string) => {
    try {
      setLoadingStatus(newStatus);
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      toast.success(`Đã chuyển sang: ${newStatus}`);
      await queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại!");
    } finally {
      setLoadingStatus(null);
    }
  };

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-zinc-500">Đơn đã ở trạng thái cuối, không có thao tác tiếp theo.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={s === "CANCELLED" ? "destructive" : "default"}
          disabled={!!loadingStatus}
          onClick={() => updateStatus(s)}
        >
          {loadingStatus === s ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {LABELS[s] || s}
        </Button>
      ))}
    </div>
  );
};

export default OrderStatusActions;
