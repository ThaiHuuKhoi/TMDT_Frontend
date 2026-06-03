"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/TablePagination";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react"; // Đổi Trash2 thành Lock
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosConfig";
import { UserAdmin } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const selectedRows = table.getSelectedRowModel().rows;
      await Promise.all(
        selectedRows.map(async (row) => {
          const userId = (row.original as UserAdmin).id;

          // Chuyển sang dùng PATCH để khóa tài khoản (isActive = false)
          // Đảm bảo Backend của bạn có API này trong UserController
          await api.patch(`/users/${userId}/status`, { isActive: false });
        })
      );
    },
    onSuccess: () => {
      toast.success("Đã khóa tài khoản thành công!");
      setRowSelection({}); // Reset lại các ô checkbox
      router.refresh();    // Tải lại dữ liệu mới nhất từ Server Component
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi khóa tài khoản");
    },
  });

  return (
    <div className="rounded-md border">
      {/* Thanh công cụ hiện lên khi có người dùng được chọn */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex justify-end bg-orange-50/50 border-b">
          <button
            className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 text-sm rounded-md m-3 cursor-pointer hover:bg-orange-600 transition shadow-sm disabled:opacity-50"
            onClick={() => {
              const count = Object.keys(rowSelection).length;
              if (window.confirm(`Bạn có chắc muốn khóa ${count} tài khoản đã chọn?`)) {
                mutation.mutate();
              }
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {mutation.isPending ? "Đang xử lý..." : "Khóa Tài Khoản"}
          </button>
        </div>
      )}

      {/* Bảng Dữ Liệu */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                Không tìm thấy dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <DataTablePagination table={table} />
    </div>
  );
}