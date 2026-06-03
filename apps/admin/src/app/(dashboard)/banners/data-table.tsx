"use client";

import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/TablePagination";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosConfig";
import { BannerType } from "./columns";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async () => {
            const selectedRows = table.getSelectedRowModel().rows;
            await Promise.all(
                selectedRows.map(async (row) => {
                    const bannerId = (row.original as BannerType).id;
                    await api.delete(`/banners/${bannerId}`); // API Xóa banner
                })
            );
        },
        onSuccess: () => {
            toast.success("Đã xóa Banner thành công!");
            setRowSelection({});
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi xóa Banner");
        },
    });

    const table = useReactTable({
        data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(), onSortingChange: setSorting, onRowSelectionChange: setRowSelection,
        state: { sorting, rowSelection },
    });

    return (
        <div className="rounded-md border">
            {Object.keys(rowSelection).length > 0 && (
                <div className="flex justify-end bg-red-50/50 border-b">
                    <button
                        className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 text-sm rounded-md m-3 hover:bg-red-600 transition disabled:opacity-50"
                        onClick={() => {
                            const count = Object.keys(rowSelection).length;
                            if (window.confirm(`Bạn có chắc muốn xóa ${count} banner đã chọn? Hành động này không thể hoàn tác.`)) {
                                mutation.mutate();
                            }
                        }}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {mutation.isPending ? "Đang xử lý..." : "Xóa Banner"}
                    </button>
                </div>
            )}

            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">Không tìm thấy dữ liệu.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <DataTablePagination table={table} />
        </div>
    );
}