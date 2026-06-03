"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import api from "@/utils/axiosConfig";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const LinkSchema = z.object({ label: z.string(), url: z.string() });

const StoreSchema = z.object({
    storeName: z.string(),
    description: z.string(),
    address: z.string(),
    hotline: z.string(),
    email: z.string(),
    facebook: z.string(),
    instagram: z.string(),
    youtube: z.string(),
    tiktok: z.string(),
    customerCareLinks: z.array(LinkSchema),
    aboutLinks: z.array(LinkSchema),
    showVisa: z.boolean(),
    showMastercard: z.boolean(),
    showVnpay: z.boolean(),
    countryRegion: z.string(),
});
type StoreForm = z.infer<typeof StoreSchema>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">{title}</h3>
            {children}
        </div>
    );
}

function LinkArrayEditor({ form, name, title }: {
    form: ReturnType<typeof useForm<StoreForm>>;
    name: "customerCareLinks" | "aboutLinks";
    title: string;
}) {
    const { fields, append, remove } = useFieldArray({ control: form.control, name });

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-700">{title}</h4>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => append({ label: "", url: "" })}
                >
                    <Plus size={12} className="mr-1" /> Thêm link
                </Button>
            </div>
            {fields.length === 0 && (
                <p className="text-sm text-zinc-400 italic">Chưa có liên kết nào.</p>
            )}
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.label` as any}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Tên hiển thị" className="h-8 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.url` as any}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="/duong-dan" className="h-8 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => remove(index)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function FooterSettingsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["store-config"],
        queryFn: async () => (await api.get("/admin/store-config")).data as StoreForm,
    });

    const form = useForm<StoreForm>({
        resolver: zodResolver(StoreSchema),
        defaultValues: {
            storeName: "", description: "", address: "", hotline: "", email: "",
            facebook: "", instagram: "", youtube: "", tiktok: "",
            customerCareLinks: [], aboutLinks: [],
            showVisa: true, showMastercard: true, showVnpay: true,
            countryRegion: "",
        },
    });

    useEffect(() => {
        if (data) form.reset({
            ...data,
            storeName: data.storeName ?? "",
            description: data.description ?? "",
            address: data.address ?? "",
            hotline: data.hotline ?? "",
            email: data.email ?? "",
            facebook: data.facebook ?? "",
            instagram: data.instagram ?? "",
            youtube: data.youtube ?? "",
            tiktok: data.tiktok ?? "",
            countryRegion: data.countryRegion ?? "",
            customerCareLinks: data.customerCareLinks ?? [],
            aboutLinks: data.aboutLinks ?? [],
        });
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (v: StoreForm) => (await api.put("/admin/store-config", v)).data,
        onSuccess: () => { toast.success("Đã lưu chân trang!"); queryClient.invalidateQueries({ queryKey: ["store-config"] }); },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lưu thất bại"),
    });

    if (isLoading) return <Loader2 className="animate-spin w-8 h-8 text-zinc-400 mx-auto mt-16" />;

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">Chân trang</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">

                    <Section title="Liên kết chân trang">
                        <LinkArrayEditor form={form} name="customerCareLinks" title="Chăm sóc khách hàng" />
                        <hr className="border-zinc-100" />
                        <LinkArrayEditor form={form} name="aboutLinks" title="Về cửa hàng" />
                    </Section>

                    <Section title="Thanh toán & thông tin khác">
                        <div className="space-y-2">
                            <FormLabel>Hiển thị logo thanh toán</FormLabel>
                            {([
                                { name: "showVisa" as const, label: "Visa" },
                                { name: "showMastercard" as const, label: "Mastercard" },
                                { name: "showVnpay" as const, label: "VNPay" },
                            ]).map(({ name, label }) => (
                                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">{label}</FormLabel>
                                    </FormItem>
                                )} />
                            ))}
                        </div>

                        <FormField control={form.control} name="countryRegion" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quốc gia & Khu vực</FormLabel>
                                <FormControl>
                                    <Input placeholder="Quốc gia & Khu vực: Việt Nam" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </Section>

                    <div className="flex justify-end pb-4">
                        <Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2">
                            {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                            Lưu chân trang
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
