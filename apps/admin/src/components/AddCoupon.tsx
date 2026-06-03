"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, TicketPercent } from "lucide-react";
import { useRouter } from "next/navigation";

import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import api from "@/utils/axiosConfig";

const CouponSchema = z.object({
    code: z.string().min(3, "Mã phải có ít nhất 3 ký tự").max(20).toUpperCase(),
    discountType: z.enum(["FIXED", "PERCENTAGE"]),
    discountValue: z.coerce.number().min(1, "Giá trị phải lớn hơn 0"),
    minOrderValue: z.coerce.number().default(0),
    maxUsage: z.coerce.number().min(1, "Ít nhất 1 lượt").default(100),
    limitPerUser: z.coerce.number().default(1),
    expiryDate: z.string().optional(),
}).refine((data) => {
    // Nếu là % thì không được giảm quá 100%
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) return false;
    return true;
}, { message: "Phần trăm giảm tối đa là 100%", path: ["discountValue"] });

type CouponFormValues = z.infer<typeof CouponSchema>;
type CouponFormInput = z.input<typeof CouponSchema>;

const AddCoupon = () => {
    const router = useRouter();
    const form = useForm<CouponFormInput, unknown, CouponFormValues>({
        resolver: zodResolver(CouponSchema),
        defaultValues: {
            code: "",
            discountType: "FIXED",
            discountValue: 0,
            minOrderValue: 0,
            maxUsage: 100,
            limitPerUser: 1,
            expiryDate: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: CouponFormValues) => {
            // Format lại date nếu có (bỏ string rỗng)
            const payload = {
                ...values,
                isActive: true,
                expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : null
            };
            const res = await api.post("/coupons/create", payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Tạo mã giảm giá thành công!");
            form.reset();
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Tạo mã thất bại (Mã có thể bị trùng)");
        },
    });

    return (
        <SheetContent className="sm:max-w-[500px] p-0">
            <ScrollArea className="h-full p-6">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <TicketPercent className="w-6 h-6 text-green-600" /> Tạo mã giảm giá
                    </SheetTitle>
                    <SheetDescription>Tạo mã khuyến mãi cho khách hàng</SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4 pb-20">

                        <FormField control={form.control} name="code" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã giảm giá (tự viết hoa)</FormLabel>
                                <FormControl><Input placeholder="VD: SUMMER50, FREESHIP..." className="uppercase font-bold" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border rounded-lg">
                            <FormField control={form.control} name="discountType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại giảm giá</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="FIXED">Giảm tiền mặt (VND)</SelectItem>
                                            <SelectItem value="PERCENTAGE">Giảm phần trăm (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="discountValue" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá trị giảm</FormLabel>
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
                        </div>

                        <FormField control={form.control} name="minOrderValue" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Đơn tối thiểu áp dụng (VND)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={Number(field.value ?? 0)}
                                        onChange={(e) => field.onChange(Number(e.target.value || 0))}
                                    />
                                </FormControl>
                                <FormDescription>Để 0 nếu áp dụng cho mọi đơn hàng</FormDescription>
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="maxUsage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tổng số lượt dùng</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            value={Number(field.value ?? 100)}
                                            onChange={(e) => field.onChange(Number(e.target.value || 0))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="limitPerUser" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giới hạn / 1 Khách</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            value={Number(field.value ?? 1)}
                                            onChange={(e) => field.onChange(Number(e.target.value || 0))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="expiryDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày giờ hết hạn (Tùy chọn)</FormLabel>
                                {/* Dùng type datetime-local mặc định của trình duyệt cho nhẹ và dễ dùng */}
                                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                            </FormItem>
                        )} />

                        <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Tạo mã giảm giá"}
                        </Button>
                    </form>
                </Form>
            </ScrollArea>
        </SheetContent>
    );
};

export default AddCoupon;