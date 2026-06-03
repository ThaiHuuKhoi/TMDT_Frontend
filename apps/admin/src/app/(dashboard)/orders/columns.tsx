"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "@/utils/axiosConfig";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export type OrderType = {
  id: number;
  user: { id: number; name: string; email: string };
  status: string;
  totalAmount: number;
  createdAt: string;
};

const ActionCell = ({ order }: { order: OrderType }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await api.patch(`/orders/admin/${order.id}/status`, { status: newStatus });
      toast.success(`Đã chuyển sang: ${newStatus}`);
      await queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Mở menu</span>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(order.id))}>
          Copy Mã Đơn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Đổi Trạng Thái
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => updateStatus("PAID")} className="cursor-pointer">
          Đã thanh toán
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("SHIPPED")} className="cursor-pointer">
          Đang giao
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("COMPLETED")} className="cursor-pointer text-green-600 font-medium">
          Hoàn thành
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => updateStatus("CANCELLED")} className="cursor-pointer text-red-600 font-medium">
          Hủy đơn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<OrderType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "id",
    header: "Mã Đơn",
    cell: ({ row }) => <div className="font-mono font-medium text-gray-600">#{row.getValue("id")}</div>,
  },
  {
    accessorKey: "user",
    header: "Khách hàng",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{user?.name || "Khách Vãng Lai"}</span>
          <span className="text-xs text-muted-foreground">{user?.email || "Không có email"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ngày đặt
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue("createdAt") as string;
      const formattedDate = new Date(dateStr).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      return <div className="text-sm">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "CANCELLED" ? "destructive" : "secondary"}
          className={cn(
            "font-medium shadow-sm",
            status === "PENDING" && "bg-yellow-500 hover:bg-yellow-600 text-white",
            status === "PAID" && "bg-blue-500 hover:bg-blue-600 text-white",
            status === "SHIPPED" && "bg-purple-500 hover:bg-purple-600 text-white",
            status === "COMPLETED" && "bg-green-500 hover:bg-green-600 text-white",
            status === "CANCELLED" && "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Tổng tiền</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
      return <div className="text-right font-bold text-gray-900">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell order={row.original} />,
  },
];