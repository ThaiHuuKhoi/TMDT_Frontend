"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Image as ImageIcon, X, Link as LinkIcon } from "lucide-react";

import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { BannerType } from "@/app/(dashboard)/banners/columns";

const BannerFormSchema = z.object({
    title: z.string().trim().min(1, "Vui lòng nhập tiêu đề banner").max(200),
    description: z.string().trim().max(2000).optional(),
    imageUrl: z.string().trim().min(1, "Vui lòng tải lên hình ảnh banner").max(500),
    targetType: z.enum(["PRODUCT", "CATEGORY", "EXTERNAL_LINK"]),
    targetId: z.coerce.number().optional(),
    linkUrl: z.string().trim().max(500).optional(),
    displayOrder: z.coerce.number().default(0),
    isActive: z.boolean().default(true),
}).refine((data) => {
    if (data.targetType === "EXTERNAL_LINK" && !data.linkUrl) return false;
    return true;
}, { message: "Vui lòng nhập đường dẫn liên kết", path: ["linkUrl"] })
.refine((data) => {
    if ((data.targetType === "PRODUCT" || data.targetType === "CATEGORY") && !data.targetId) return false;
    return true;
}, { message: "Vui lòng chọn đối tượng đích", path: ["targetId"] });

type BannerFormValues = z.infer<typeof BannerFormSchema>;
type BannerFormInput = z.input<typeof BannerFormSchema>;

interface EditBannerProps {
    banner: BannerType;
    onClose: () => void;
}

const EditBanner = ({ banner, onClose }: EditBannerProps) => {
    const router = useRouter();

    const form = useForm<BannerFormInput, unknown, BannerFormValues>({
        resolver: zodResolver(BannerFormSchema),
        defaultValues: {
            title: banner.title,
            description: "",
            imageUrl: banner.imageUrl,
            targetType: banner.targetType,
            targetId: banner.targetId,
            linkUrl: banner.linkUrl ?? "",
            displayOrder: banner.displayOrder,
            isActive: banner.isActive,
        },
    });

    useEffect(() => {
        form.reset({
            title: banner.title,
            description: "",
            imageUrl: banner.imageUrl,
            targetType: banner.targetType,
            targetId: banner.targetId,
            linkUrl: banner.linkUrl ?? "",
            displayOrder: banner.displayOrder,
            isActive: banner.isActive,
        });
    }, [banner.id]);

    const watchTargetType = form.watch("targetType");

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get("/categories");
            return res.data;
        },
    });

    const { data: products } = useQuery({
        queryKey: ["products-short"],
        queryFn: async () => {
            const res = await api.get("/products");
            const data = res.data;
            return Array.isArray(data) ? data : (data.items || []);
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: BannerFormValues) => {
            const payload = {
                ...values,
                title: values.title.trim(),
                description: values.description?.trim() || undefined,
                imageUrl: values.imageUrl.trim(),
                linkUrl: values.linkUrl?.trim() || undefined,
            };
            if (payload.targetType === "EXTERNAL_LINK") payload.targetId = undefined;
            else payload.linkUrl = undefined;

            const res = await api.put(`/banners/${banner.id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Cập nhật banner thành công!");
            router.refresh();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Cập nhật banner thất bại!");
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "TMDT_ecom");
        try {
            toast.info("Đang tải ảnh lên...");
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            form.setValue("imageUrl", data.secure_url, { shouldValidate: true });
            toast.success("Tải ảnh thành công!");
        } catch {
            toast.error("Lỗi khi tải ảnh!");
        }
    };

    return (
        <SheetContent className="sm:max-w-[600px] p-0">
            <ScrollArea className="h-full p-6">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold">Sửa banner</SheetTitle>
                    <SheetDescription>Cập nhật thông tin banner đang hiển thị.</SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6 pb-20">

                        <div className="p-4 border rounded-lg bg-gray-50/50 shadow-sm">
                            <h3 className="font-semibold text-sm uppercase text-gray-500 mb-4">Hình ảnh Banner</h3>
                            <div className="flex flex-col items-center justify-center">
                                {form.watch("imageUrl") ? (
                                    <div className="relative w-full h-40 border rounded-md group overflow-hidden shadow-sm">
                                        <img src={form.watch("imageUrl")} alt="Banner preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => form.setValue("imageUrl", "")}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition border-blue-200 bg-white">
                                        <ImageIcon className="w-8 h-8 text-blue-400 mb-2" />
                                        <span className="text-sm text-blue-600 font-medium">Click để tải ảnh lên</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                )}
                                <FormMessage className="mt-2">{form.formState.errors.imageUrl?.message}</FormMessage>
                            </div>
                        </div>

                        <div className="grid gap-4 p-4 border rounded-lg shadow-sm">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiêu đề</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả (Không bắt buộc)</FormLabel>
                                    <FormControl><Textarea className="h-20" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="p-4 border rounded-lg bg-blue-50/20 shadow-sm space-y-4">
                            <h3 className="font-semibold text-sm uppercase text-blue-600 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" /> Hành động khi Click
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="targetType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại điều hướng</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="EXTERNAL_LINK">🔗 Đường dẫn ngoài</SelectItem>
                                                <SelectItem value="PRODUCT">👕 Tới 1 Sản phẩm</SelectItem>
                                                <SelectItem value="CATEGORY">📁 Tới 1 Danh mục</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {watchTargetType === "EXTERNAL_LINK" && (
                                    <FormField control={form.control} name="linkUrl" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nhập URL</FormLabel>
                                            <FormControl><Input className="bg-white" placeholder="https://..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}

                                {watchTargetType === "CATEGORY" && (
                                    <FormField control={form.control} name="targetId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chọn Danh mục</FormLabel>
                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {categories?.map((cat: any) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}

                                {watchTargetType === "PRODUCT" && (
                                    <FormField control={form.control} name="targetId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chọn Sản phẩm</FormLabel>
                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {products?.map((prod: any) => (
                                                        <SelectItem key={prod.id} value={prod.id.toString()}>{prod.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg shadow-sm">
                            <FormField control={form.control} name="displayOrder" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thứ tự hiển thị</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            value={Number(field.value ?? 0)}
                                            onChange={(e) => field.onChange(Number(e.target.value || 0))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="isActive" render={({ field }) => (
                                <FormItem className="flex flex-col justify-center">
                                    <FormLabel className="mb-2">Trạng thái</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        <span className="text-sm font-medium">Cho phép hiển thị</span>
                                    </div>
                                </FormItem>
                            )} />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Lưu thay đổi"}
                        </Button>
                    </form>
                </Form>
            </ScrollArea>
        </SheetContent>
    );
};

export default EditBanner;
