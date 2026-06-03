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
import { Loader2, Ban } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/axiosConfig";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { OrderType } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const cancelMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/orders/admin/bulk-cancel", { ids });
    },
    onSuccess: (_, ids) => {
      toast.success(`Đã hủy ${ids.length} đơn (theo luồng trạng thái cho phép).`);
      setRowSelection({});
      void queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Hủy đơn thất bại");
    },
  });

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

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="rounded-md border">
      {/* Thanh công cụ thao tác hàng loạt (Chỉ hiện khi có dòng được chọn) */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-b bg-red-50/50 px-3 py-2">
          <span className="text-sm text-amber-900">
            Đã chọn {selectedCount} đơn — hủy theo quy tắc chuyển trạng thái (PENDING/PAID → CANCELLED khi được phép).
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={cancelMutation.isPending}
            onClick={() => {
              const ids = table
                .getSelectedRowModel()
                .rows.map((r) => (r.original as OrderType).id);
              cancelMutation.mutate(ids);
            }}
            className="gap-2"
          >
            {cancelMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Hủy các đơn đã chọn
          </Button>
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
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