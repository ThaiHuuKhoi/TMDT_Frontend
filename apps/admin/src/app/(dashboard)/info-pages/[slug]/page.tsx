"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/utils/axiosConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { INFO_PAGE_LIST } from "@/constants/infoPageList";

interface InfoPageDto {
    slug: string;
    title: string;
    contentHtml: string;
    updatedAt?: string;
}

export default function InfoPageEditorPage() {
    const { slug } = useParams<{ slug: string }>();
    const queryClient = useQueryClient();

    const meta = INFO_PAGE_LIST.find((p) => p.slug === slug);

    const { data, isLoading } = useQuery<InfoPageDto | null>({
        queryKey: ["info-page", slug],
        queryFn: async () => {
            try {
                return (await api.get<InfoPageDto>(`/admin/info-pages/${slug}`)).data;
            } catch (e: any) {
                if (e.response?.status === 404) return null;
                throw e;
            }
        },
    });

    const [title, setTitle] = useState("");
    const [contentHtml, setContentHtml] = useState("");

    useEffect(() => {
        if (data) {
            setTitle(data.title ?? meta?.title ?? "");
            setContentHtml(data.contentHtml ?? "");
        } else if (data === null) {
            setTitle(meta?.title ?? "");
            setContentHtml("");
        }
    }, [data, meta]);

    const mutation = useMutation({
        mutationFn: async () =>
            (await api.put(`/admin/info-pages/${slug}`, { slug, title, contentHtml })).data,
        onSuccess: () => {
            toast.success("Đã lưu nội dung trang!");
            queryClient.invalidateQueries({ queryKey: ["info-page", slug] });
            queryClient.invalidateQueries({ queryKey: ["info-pages-list"] });
        },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lưu thất bại"),
    });

    if (isLoading) return <Loader2 className="animate-spin w-8 h-8 text-zinc-400 mx-auto mt-16" />;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/info-pages">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft size={16} />
                    </Button>
                </Link>
                <div>
                    <p className="text-xs text-zinc-400">{meta?.category}</p>
                    <h1 className="text-xl font-bold text-zinc-900">{meta?.title}</h1>
                </div>
                {data?.updatedAt && (
                    <span className="ml-auto text-xs text-zinc-400">
                        Lưu lần cuối: {new Date(data.updatedAt).toLocaleString("vi-VN")}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-3">
                    <div>
                        <Label>Tiêu đề trang</Label>
                        <Input
                            className="mt-1"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tiêu đề hiển thị trên tab trình duyệt"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
                    <Label className="mb-2 block">Nội dung</Label>
                    <RichTextEditor value={contentHtml} onChange={setContentHtml} />
                </div>

                <div className="flex justify-end gap-3 pb-4">
                    <Button variant="outline" asChild>
                        <a
                            href={`${process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000"}/thong-tin/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Xem trên website
                        </a>
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        className="flex items-center gap-2"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                        Lưu nội dung
                    </Button>
                </div>
            </div>
        </div>
    );
}
