"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Save } from "lucide-react";
import api from "@/utils/axiosConfig";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ShippingSchema = z.object({
    defaultFeeVnd: z.coerce.number().min(0, "Phí không được âm"),
    gramsPerItemUnit: z.coerce.number().min(1, "Phải lớn hơn 0"),
});
type ShippingForm = z.infer<typeof ShippingSchema>;

export default function ShippingSettingsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["shipping-config"],
        queryFn: async () => (await api.get("/admin/shipping-config")).data as ShippingForm,
    });

    const form = useForm<ShippingForm>({
        resolver: zodResolver(ShippingSchema),
        defaultValues: { defaultFeeVnd: 20000, gramsPerItemUnit: 500 },
    });

    useEffect(() => { if (data) form.reset(data); }, [data]);

    const mutation = useMutation({
        mutationFn: async (v: ShippingForm) => (await api.put("/admin/shipping-config", v)).data,
        onSuccess: () => { toast.success("Đã lưu phí vận chuyển!"); queryClient.invalidateQueries({ queryKey: ["shipping-config"] }); },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lưu thất bại"),
    });

    if (isLoading) return <Loader2 className="animate-spin w-8 h-8 text-zinc-400 mx-auto mt-16" />;

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">Phí vận chuyển</h1>

            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                        <FormField control={form.control} name="defaultFeeVnd" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-semibold">Phí vận chuyển mặc định (VNĐ)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type="number" min={0} {...field} className="pr-16 text-lg font-bold" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">VNĐ</span>
                                    </div>
                                </FormControl>
                                <FormDescription>Đặt 0 để miễn phí ship. Áp dụng khi chưa tích hợp GHN/GHTK.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="gramsPerItemUnit" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-semibold">Khối lượng ước tính / sản phẩm (gram)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type="number" min={1} {...field} className="pr-16" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">gram</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                            <div>
                                <p className="text-xs text-zinc-500">Phí hiện tại</p>
                                <p className="text-2xl font-black text-blue-600">
                                    {Number(form.watch("defaultFeeVnd") || 0).toLocaleString("vi-VN")}đ
                                </p>
                            </div>
                            <Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2">
                                {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                                Lưu
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
