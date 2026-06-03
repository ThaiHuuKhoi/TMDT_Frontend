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
import { ArrowUpDown, MoreHorizontal, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EditProduct from "@/components/EditProduct";

const STORE_BASE =
  process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3002";

export type ProductAdminType = {
  id: number;
  name: string;
  shortDescription: string;
  slug: string;
  images: { id: number; url: string; isMain: boolean }[];
  variants: { id: number; price: number; stockQuantity: number }[];
};

// Hàm lấy ảnh an toàn từ mảng images
const getProductImage = (product: ProductAdminType) => {
  if (product.images && product.images.length > 0) {
    // Ưu tiên tìm ảnh isMain: true
    const mainImg = product.images.find(img => img.isMain);
    if (mainImg) return mainImg.url;
    // Nếu không có main, lấy ảnh đầu tiên
    return product.images[0]?.url || "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
  }
  return "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
}

export const columns: ColumnDef<ProductAdminType>[] = [
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
    id: "image",
    header: "Hình ảnh",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="w-12 h-12 relative rounded-md border bg-gray-50 overflow-hidden flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <Package className="w-5 h-5 text-gray-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Tên Sản Phẩm
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue("name")}</span>
  },
  {
    id: "price",
    header: "Giá bán (Từ)",
    cell: ({ row }) => {
      const product = row.original;
      const basePrice = product.variants && product.variants.length > 0 ? (product.variants[0]?.price ?? 0) : 0;

      const formatted = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(basePrice);
      return <div className="font-bold text-gray-900">{formatted}</div>;
    },
  },
  {
    accessorKey: "shortDescription",
    header: "Mô tả ngắn",
    cell: ({ row }) => <span className="text-gray-500 text-sm line-clamp-1 max-w-[200px]">{row.getValue("shortDescription")}</span>
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(product.id))}>
                Sao chép ID sản phẩm
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${STORE_BASE}/products/${product.id}`} target="_blank" className="w-full cursor-pointer">
                  Xem trên trang bán hàng
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-blue-600 font-medium cursor-pointer"
                onSelect={() => setEditOpen(true)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <EditProduct product={product} onClose={() => setEditOpen(false)} />
          </Sheet>
        </>
      );
    },
  },
];