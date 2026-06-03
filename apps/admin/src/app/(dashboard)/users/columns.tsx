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
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, User as UserIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/utils/axiosConfig";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export type UserAdmin = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive?: boolean;
};

export const columns: ColumnDef<UserAdmin>[] = [
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
    accessorKey: "avatar",
    header: "Ảnh đại diện",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="w-9 h-9 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
          ) : (
            <UserIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Họ và tên",
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("name") || "Khách"}</div>
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "role",
    header: "Phân quyền",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";
      return (
        <span className={cn("px-2 py-1 rounded-md text-xs font-semibold", isAdmin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700")}>
          {isAdmin ? "Quản trị viên" : "Khách hàng"}
        </span>
      )
    }
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      // Nếu API không trả về isActive (bị null/undefined), ta ngầm hiểu là true (đang hoạt động)
      const isActive = row.getValue("isActive") ?? true;
      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className={cn(
            "font-medium shadow-sm uppercase text-[10px]",
            isActive ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {isActive ? "Hoạt động" : "Bị khóa"}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const [loading, setLoading] = useState(false);
      const router = useRouter();
      const isActive = user.isActive ?? true;
      const isAdmin = user.role === "ADMIN" || user.role === "ROLE_ADMIN";

      const toggleStatus = async () => {
        const action = isActive ? "khóa" : "kích hoạt";
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name || user.email}"?`)) return;
        setLoading(true);
        try {
          await api.patch(`/users/${user.id}/status`, { isActive: !isActive });
          toast.success(isActive ? "Đã khóa tài khoản!" : "Đã kích hoạt tài khoản!");
          router.refresh();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Cập nhật thất bại!");
        } finally {
          setLoading(false);
        }
      };

      const toggleRole = async () => {
        const newRole = isAdmin ? "USER" : "ADMIN";
        const label = isAdmin ? "hạ xuống Khách hàng" : "nâng lên Quản trị viên";
        if (!window.confirm(`Bạn có chắc muốn ${label} cho "${user.name || user.email}"?`)) return;
        setLoading(true);
        try {
          await api.patch(`/users/${user.id}/role`, { role: newRole });
          toast.success(`Đã ${label}!`);
          router.refresh();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Đổi quyền thất bại!");
        } finally {
          setLoading(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(user.id))}>Sao chép ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}`}>Chi tiết</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={toggleStatus}
              className={cn(
                "font-medium cursor-pointer",
                isActive
                  ? "text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                  : "text-green-600 focus:text-green-600 focus:bg-green-50"
              )}
            >
              {isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={toggleRole}
              className={cn(
                "font-medium cursor-pointer",
                isAdmin
                  ? "text-gray-600 focus:text-gray-600 focus:bg-gray-50"
                  : "text-purple-600 focus:text-purple-600 focus:bg-purple-50"
              )}
            >
              {isAdmin ? "Hạ xuống Khách hàng" : "Nâng lên Quản trị viên"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];