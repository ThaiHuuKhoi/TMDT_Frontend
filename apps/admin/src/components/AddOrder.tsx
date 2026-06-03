"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/axiosConfig";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const lineSchema = z.object({
  variantId: z.string().trim().min(1, "Nhập variant ID"),
  quantity: z.coerce.number().min(1, "Số lượng tối thiểu 1"),
});

const formSchema = z.object({
  userId: z.string().trim().min(1, "Nhập user ID khách hàng"),
  lines: z.array(lineSchema).min(1, "Thêm ít nhất một dòng sản phẩm"),
  shippingName: z.string().optional(),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  couponCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

const AddOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      lines: [{ variantId: "", quantity: 1 }],
      shippingName: "",
      shippingPhone: "",
      shippingAddress: "",
      couponCode: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const userId = Number(values.userId);
      if (!Number.isFinite(userId) || userId < 1) {
        throw new Error("User ID không hợp lệ");
      }
      const lines = values.lines.map((l) => {
        const vid = Number(l.variantId);
        if (!Number.isFinite(vid) || vid < 1) {
          throw new Error("Variant ID không hợp lệ");
        }
        return { variantId: vid, quantity: l.quantity };
      });
      const payload = {
        userId,
        lines,
        shippingName: values.shippingName?.trim() || undefined,
        shippingPhone: values.shippingPhone?.trim() || undefined,
        shippingAddress: values.shippingAddress?.trim() || undefined,
        couponCode: values.couponCode?.trim() || undefined,
      };
      const res = await api.post("/orders/admin", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Đã tạo đơn hàng (PENDING). Chuyển Paid khi đã thu tiền để trừ kho.");
      form.reset({
        userId: "",
        lines: [{ variantId: "", quantity: 1 }],
        shippingName: "",
        shippingPhone: "",
        shippingAddress: "",
        couponCode: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Tạo đơn thất bại");
    },
  });

  return (
    <SheetContent className="overflow-y-auto sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>Tạo đơn (Admin)</SheetTitle>
        <SheetDescription>
          Đơn được tạo ở trạng thái PENDING. Chuyển sang PAID trên trang đơn hàng để trừ tồn kho và tăng lượt dùng coupon (nếu có).
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form
          className="mt-6 space-y-6"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID người dùng (khách)</FormLabel>
                <FormControl>
                  <Input placeholder="VD: 12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Dòng sản phẩm (variant)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ variantId: "", quantity: 1 })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm dòng
              </Button>
            </div>
            {fields.map((f, index) => (
              <div key={f.id} className="flex gap-2 items-start">
                <FormField
                  control={form.control}
                  name={`lines.${index}.variantId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="ID biến thể" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={Number(field.value ?? 1)}
                          onChange={(e) => field.onChange(Number(e.target.value || 1))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-600"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="shippingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên nhận (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SĐT (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="couponCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã giảm giá (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Tạo đơn
          </Button>
        </form>
      </Form>
    </SheetContent>
  );
};

export default AddOrder;
