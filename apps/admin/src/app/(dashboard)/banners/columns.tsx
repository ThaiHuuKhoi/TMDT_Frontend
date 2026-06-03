"use client";

import { useState } from "react";
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
import { Sheet } from "@/components/ui/sheet";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ImageIcon, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import EditBanner from "@/components/EditBanner";

// Định nghĩa Type dựa theo bảng Banners trong Database
export type BannerType = {
    id: number;
    title: string;
    imageUrl: string;
    targetType: "PRODUCT" | "CATEGORY" | "EXTERNAL_LINK";
    targetId?: number;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
};

export const columns: ColumnDef<BannerType>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        accessorKey: "imageUrl",
        header: "Hình ảnh",
        cell: ({ row }) => {
            const url = row.getValue("imageUrl") as string;
            return (
                <div className="w-24 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    {url ? (
                        <Image src={url} alt="Banner" fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "title",
        header: "Tiêu đề",
        cell: ({ row }) => <div className="font-medium">{row.getValue("title") || "Không có tiêu đề"}</div>,
    },
    {
        accessorKey: "targetType",
        header: "Loại chuyển hướng",
        cell: ({ row }) => {
            const type = row.getValue("targetType") as string;
            return (
                <Badge variant="outline" className={cn(
                    "font-semibold text-[10px]",
                    type === "PRODUCT" && "text-blue-600 border-blue-200 bg-blue-50",
                    type === "CATEGORY" && "text-purple-600 border-purple-200 bg-purple-50",
                    type === "EXTERNAL_LINK" && "text-gray-600 border-gray-200 bg-gray-50"
                )}>
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "displayOrder",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Thứ tự
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center font-mono">{row.getValue("displayOrder")}</div>,
    },
    {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean;
            return (
                <Badge
                    className={cn("shadow-sm uppercase text-[10px]", isActive ? "bg-green-500" : "bg-gray-400")}
                >
                    {isActive ? "Hiển thị" : "Đã ẩn"}
                </Badge>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const banner = row.original;
            const [editOpen, setEditOpen] = useState(false);
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(banner.id))}>Copy ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-blue-600 font-medium cursor-pointer"
                                onSelect={() => setEditOpen(true)}
                            >
                                Sửa Banner
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Sheet open={editOpen} onOpenChange={setEditOpen}>
                        <EditBanner banner={banner} onClose={() => setEditOpen(false)} />
                    </Sheet>
                </>
            );
        },
    },
];