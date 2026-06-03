"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText, Pencil, CheckCircle } from "lucide-react";
import api from "@/utils/axiosConfig";
import { INFO_PAGE_LIST } from "@/constants/infoPageList";
import { Badge } from "@/components/ui/badge";

async function fetchCustomized(): Promise<string[]> {
    try {
        const res = await api.get<{ slug: string }[]>("/admin/info-pages");
        return res.data.map((p) => p.slug);
    } catch {
        return [];
    }
}

const CATEGORY_ORDER = ["Chăm sóc khách hàng", "Về cửa hàng"];

export default function InfoPagesListPage() {
    const { data: customized = [] } = useQuery({
        queryKey: ["info-pages-list"],
        queryFn: fetchCustomized,
    });

    const grouped = CATEGORY_ORDER.map((cat) => ({
        category: cat,
        pages: INFO_PAGE_LIST.filter((p) => p.category === cat),
    }));

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-zinc-700" />
                <h1 className="text-2xl font-bold text-zinc-900">Trang thông tin</h1>
            </div>
            <p className="text-sm text-zinc-500 mb-6">
                Chỉnh sửa nội dung các trang thông tin hiển thị ở chân trang website.
            </p>

            <div className="space-y-6">
                {grouped.map(({ category, pages }) => (
                    <div key={category}>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                            {category}
                        </h2>
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                            {pages.map((page, idx) => {
                                const isDone = customized.includes(page.slug);
                                return (
                                    <Link
                                        key={page.slug}
                                        href={`/info-pages/${page.slug}`}
                                        className={`flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 transition-colors ${
                                            idx !== pages.length - 1 ? "border-b border-zinc-100" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isDone
                                                ? <CheckCircle size={16} className="text-green-500 shrink-0" />
                                                : <FileText size={16} className="text-zinc-300 shrink-0" />
                                            }
                                            <span className="text-sm font-medium text-zinc-800">{page.title}</span>
                                            {isDone && (
                                                <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                                                    Đã chỉnh
                                                </Badge>
                                            )}
                                        </div>
                                        <Pencil size={14} className="text-zinc-400" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
