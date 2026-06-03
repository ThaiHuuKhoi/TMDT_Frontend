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
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import api from "@/utils/axiosConfig";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export type CouponType = {
    id: number;
    code: string;
    discountType: "FIXED" | "PERCENTAGE";
    discountValue: number;
    minOrderValue: number;
    maxUsage: number;
    usedCount: number;
    expiryDate: string | null;
    isActive: boolean;
    isValid: boolean;
};

const ActionCell = ({ coupon }: { coupon: CouponType }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isActiveUI = coupon.isActive === true || (coupon.isActive as unknown) === 1;

    const toggleStatus = async () => {
        setLoading(true);
        try {
            await api.patch(`/coupons/admin/${coupon.id}/status`, { isActive: !isActiveUI });
            toast.success(!isActiveUI ? "Đã kích hoạt mã!" : "Đã khóa mã!");
            router.refresh();
        } catch (error: any) {
            toast.error("Cập nhật thất bại: " + (error.response?.data?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    toast.info("Đã copy mã!");
                }}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Mã
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={toggleStatus}
                    className={isActiveUI ? "text-orange-600 focus:text-orange-600 focus:bg-orange-50 font-medium cursor-pointer" : "text-green-600 focus:text-green-600 focus:bg-green-50 font-medium cursor-pointer"}
                >
                    {isActiveUI ? "Khóa mã này" : "Kích hoạt mã"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const columns: ColumnDef<CouponType>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            />
        ),
        cell: ({ row }) => (
            <Checkbox onCheckedChange={(value) => row.toggleSelected(!!value)} checked={row.getIsSelected()} />
        ),
    },
    {
        accessorKey: "code",
        header: "Mã giảm giá",
        cell: ({ row }) => <div className="font-bold text-blue-600 text-lg uppercase tracking-wider">{row.getValue("code")}</div>,
    },
    {
        accessorKey: "discountValue",
        header: "Mức giảm",
        cell: ({ row }) => {
            const type = row.original.discountType;
            const val = row.original.discountValue;
            return (
                <Badge variant="outline" className={type === "PERCENTAGE" ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700"}>
                    {type === "PERCENTAGE" ? `Giảm ${val}%` : `Giảm ${new Intl.NumberFormat("vi-VN").format(val)}đ`}
                </Badge>
            );
        },
    },
    {
        accessorKey: "usage",
        header: "Đã dùng / Tổng",
        cell: ({ row }) => (
            <div className="font-medium text-center">
                {row.original.usedCount} / {row.original.maxUsage || "∞"}
            </div>
        ),
    },
    {
        accessorKey: "expiryDate",
        header: "Hạn sử dụng",
        cell: ({ row }) => {
            const dateStr = row.getValue("expiryDate") as string;
            if (!dateStr) return <span className="text-gray-400">Không thời hạn</span>;
            return <div>{new Date(dateStr).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</div>;
        },
    },
    {
        accessorKey: "isValid",
        header: "Trạng thái",
        cell: ({ row }) => {
            const coupon = row.original;

            const active = coupon.isActive === true || (coupon.isActive as unknown) === 1;
            const isNotExpired = !coupon.expiryDate || new Date(coupon.expiryDate) > new Date();
            const hasUsageLeft = !coupon.maxUsage || coupon.usedCount < coupon.maxUsage;

            const isValid = active && isNotExpired && hasUsageLeft;

            if (!active) return <Badge variant="destructive" className="bg-red-500">Đã khóa</Badge>;
            return (
                <Badge className={isValid ? "bg-green-500" : "bg-gray-400"}>
                    {isValid ? "Hợp lệ" : "Hết hạn/Hết lượt"}
                </Badge>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell coupon={row.original} />,
    },
];