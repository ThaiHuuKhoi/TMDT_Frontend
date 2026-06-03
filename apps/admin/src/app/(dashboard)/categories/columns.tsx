"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowUpDown, MoreHorizontal, Folder } from "lucide-react";
import Image from "next/image";
import EditCategory from "@/components/EditCategory";

export type CategoryAdminType = {
    id: number;
    name: string;
    slug: string;
    image: string | null;
};

export const columns: ColumnDef<CategoryAdminType>[] = [
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
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-mono text-gray-500">#{row.getValue("id")}</div>,
    },
    {
        accessorKey: "image",
        header: "Hình ảnh",
        cell: ({ row }) => {
            const img = row.getValue("image") as string | null;
            return (
                <div className="w-10 h-10 relative rounded-md border bg-gray-50 flex items-center justify-center overflow-hidden">
                    {img ? (
                        <Image src={img} alt="Category" fill className="object-cover" />
                    ) : (
                        <Folder className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Tên Danh Mục
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span className="font-semibold text-gray-900">{row.getValue("name")}</span>
    },
    {
        accessorKey: "slug",
        header: "Đường dẫn (Slug)",
        cell: ({ row }) => <span className="text-gray-500 text-sm">{row.getValue("slug")}</span>
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const category = row.original;
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(category.id))}>Copy ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-blue-600 font-medium cursor-pointer"
                                onSelect={() => setEditOpen(true)}
                            >
                                Chỉnh sửa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Sheet open={editOpen} onOpenChange={setEditOpen}>
                        <EditCategory category={category} onClose={() => setEditOpen(false)} />
                    </Sheet>
                </>
            );
        },
    },
];