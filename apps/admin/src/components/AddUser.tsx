"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "@/utils/axiosConfig";
import { Loader2 } from "lucide-react";

const AddUserSchema = z.object({
  firstName: z.string().trim().min(1, "Họ không được để trống"),
  lastName: z.string().trim().min(1, "Tên không được để trống"),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

const AddUser = () => {
  type AddUserValues = z.infer<typeof AddUserSchema>;
  const form = useForm<AddUserValues>({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AddUserValues) => {
      // Chuẩn hóa dữ liệu trước khi gửi lên Spring Boot (RegisterRequest)
      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password
      };

      // Gọi API đăng ký (đảm bảo đường dẫn này khớp với AuthController)
      const res = await api.post("/auth/register", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.info("Đã gửi OTP đăng ký. Người dùng chỉ được tạo sau khi xác thực OTP.");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi tạo người dùng!");
    },
  });

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="mb-4">Thêm Người Dùng</SheetTitle>
        <SheetDescription asChild>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="email@example.com" />
                    </FormControl>
                    <FormDescription>OTP xác thực sẽ được gửi về email này.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mutation.isPending ? "Đang tạo..." : "Tạo người dùng"}
              </Button>
            </form>
          </Form>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default AddUser;