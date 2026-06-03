"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Folder } from "lucide-react";

import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { CategoryAdminType } from "@/app/(dashboard)/categories/columns";

const EditCategorySchema = z.object({
    name: z.string().trim().min(1, "Tên danh mục không được để trống").max(100),
    slug: z.string().trim().min(1, "Slug không được để trống").max(100)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
    image: z.string().trim().max(500).optional(),
});

type EditCategoryValues = z.infer<typeof EditCategorySchema>;

interface EditCategoryProps {
    category: CategoryAdminType;
    onClose: () => void;
}

const EditCategory = ({ category, onClose }: EditCategoryProps) => {
    const router = useRouter();

    const form = useForm<EditCategoryValues>({
        resolver: zodResolver(EditCategorySchema),
        defaultValues: {
            name: category.name,
            slug: category.slug,
            image: category.image ?? "",
        },
    });

    useEffect(() => {
        form.reset({
            name: category.name,
            slug: category.slug,
            image: category.image ?? "",
        });
    }, [category.id]);

    const mutation = useMutation({
        mutationFn: async (values: EditCategoryValues) => {
            const payload = {
                name: values.name,
                slug: values.slug,
                image: values.image?.trim() || null,
            };
            const res = await api.put(`/categories/${category.id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Cập nhật danh mục thành công!");
            router.refresh();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Cập nhật danh mục thất bại!");
        },
    });

    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle className="mb-2 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    Sửa danh mục
                </SheetTitle>
                <SheetDescription>Cập nhật thông tin danh mục sản phẩm.</SheetDescription>
            </SheetHeader>

            <Form {...form}>
                <form
                    className="space-y-6 mt-6"
                    onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                >
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên danh mục</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="slug" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Đường dẫn (slug)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormDescription>Chỉ chữ thường, số và dấu gạch ngang.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Hình ảnh (Không bắt buộc)</FormLabel>
                            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Lưu thay đổi"}
                    </Button>
                </form>
            </Form>
        </SheetContent>
    );
};

export default EditCategory;
