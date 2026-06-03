"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Save, X, Image as ImageIcon } from "lucide-react";
import api from "@/utils/axiosConfig";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const LinkSchema = z.object({ label: z.string(), url: z.string() });

const StoreSchema = z.object({
    logoUrl: z.string().optional(),
    storeName: z.string().min(1, "Không được để trống"),
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

export default function StoreSettingsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["store-config"],
        queryFn: async () => (await api.get("/admin/store-config")).data as StoreForm,
    });

    const form = useForm<StoreForm>({
        resolver: zodResolver(StoreSchema),
        defaultValues: {
            logoUrl: "",
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
            logoUrl: data.logoUrl ?? "",
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
        onSuccess: () => { toast.success("Đã lưu thông tin cửa hàng!"); queryClient.invalidateQueries({ queryKey: ["store-config"] }); },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lưu thất bại"),
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "TMDT_ecom");
        try {
            toast.info("Đang tải logo lên...");
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            form.setValue("logoUrl", data.secure_url, { shouldValidate: true });
            toast.success("Tải logo thành công!");
        } catch {
            toast.error("Lỗi khi tải logo!");
        }
    };

    if (isLoading) return <Loader2 className="animate-spin w-8 h-8 text-zinc-400 mx-auto mt-16" />;

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">Thông tin cửa hàng</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">

                    <Section title="Logo cửa hàng">
                        <div className="flex flex-col items-center justify-center">
                            {form.watch("logoUrl") ? (
                                <div className="relative group border rounded-lg overflow-hidden bg-zinc-50 p-3 flex items-center justify-center">
                                    <img src={form.watch("logoUrl")} alt="Logo preview" className="h-16 object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => form.setValue("logoUrl", "")}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition border-blue-200 bg-white">
                                    <ImageIcon className="w-6 h-6 text-blue-400 mb-1" />
                                    <span className="text-sm text-blue-600 font-medium">Click để tải logo lên</span>
                                    <span className="text-xs text-zinc-400 mt-0.5">PNG nền trong suốt được khuyến nghị</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                </label>
                            )}
                        </div>
                    </Section>

                    <Section title="Thông tin cơ bản">
                        {([
                            { name: "storeName" as const, label: "Tên cửa hàng" },
                            { name: "address" as const, label: "Địa chỉ" },
                            { name: "hotline" as const, label: "Hotline" },
                            { name: "email" as const, label: "Email hỗ trợ" },
                        ]).map(({ name, label }) => (
                            <FormField key={name} control={form.control} name={name} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ))}
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả cửa hàng (hiển thị ở chân trang)</FormLabel>
                                <FormControl>
                                    <Textarea rows={3} placeholder="Mô tả ngắn về cửa hàng..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </Section>

                    <Section title="Mạng xã hội">
                        {([
                            { name: "facebook" as const, label: "Facebook URL" },
                            { name: "instagram" as const, label: "Instagram URL" },
                            { name: "youtube" as const, label: "YouTube URL" },
                            { name: "tiktok" as const, label: "TikTok URL" },
                        ]).map(({ name, label }) => (
                            <FormField key={name} control={form.control} name={name} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ))}
                    </Section>

                    <div className="flex justify-end pb-4">
                        <Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2">
                            {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                            Lưu thông tin
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
