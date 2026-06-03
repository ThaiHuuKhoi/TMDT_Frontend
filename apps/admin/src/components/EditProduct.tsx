"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Package } from "lucide-react";

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
import { ScrollArea } from "./ui/scroll-area";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { ProductAdminType } from "@/app/(dashboard)/products/columns";
import { CategoryType } from "@repo/types";

const EditProductSchema = z.object({
    name: z.string().trim().min(1, "Tên sản phẩm không được để trống").max(200),
    shortDescription: z.string().trim().max(500).optional(),
    description: z.string().trim().optional(),
    categorySlug: z.string().optional(),
});

type EditProductValues = z.infer<typeof EditProductSchema>;

interface EditProductProps {
    product: ProductAdminType;
    onClose: () => void;
}

const EditProduct = ({ product, onClose }: EditProductProps) => {
    const router = useRouter();

    const form = useForm<EditProductValues>({
        resolver: zodResolver(EditProductSchema),
        defaultValues: {
            name: product.name,
            shortDescription: product.shortDescription ?? "",
            description: "",
            categorySlug: "",
        },
    });

    const { data: fullProduct } = useQuery({
        queryKey: ["product-detail", product.id],
        queryFn: async () => {
            const res = await api.get(`/products/${product.id}`);
            return res.data;
        },
    });

    useEffect(() => {
        form.reset({
            name: product.name,
            shortDescription: product.shortDescription ?? "",
            description: fullProduct?.description ?? "",
            categorySlug: fullProduct?.category?.slug ?? "",
        });
    }, [product.id, fullProduct]);

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get("/categories");
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: EditProductValues) => {
            const payload: Record<string, unknown> = {
                name: values.name,
                shortDescription: values.shortDescription?.trim() || undefined,
            };
            if (values.description?.trim()) payload.description = values.description.trim();
            if (values.categorySlug) payload.categorySlug = values.categorySlug;

            const res = await api.put(`/products/${product.id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Cập nhật sản phẩm thành công!");
            router.refresh();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Cập nhật sản phẩm thất bại!");
        },
    });

    return (
        <SheetContent className="sm:max-w-[550px] p-0">
            <ScrollArea className="h-full p-6">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        Sửa sản phẩm
                    </SheetTitle>
                    <SheetDescription>Cập nhật thông tin cơ bản của sản phẩm.</SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5 pb-20">

                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên sản phẩm</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="categorySlug" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Danh mục (để trống nếu không đổi)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục mới..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories?.map((cat: CategoryType) => (
                                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="shortDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả ngắn</FormLabel>
                                <FormControl><Input placeholder="Tóm tắt tính năng nổi bật..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả chi tiết (Không bắt buộc)</FormLabel>
                                <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Button type="submit" className="w-full h-11 font-bold shadow-lg" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Lưu thay đổi"}
                        </Button>
                    </form>
                </Form>
            </ScrollArea>
        </SheetContent>
    );
};

export default EditProduct;
