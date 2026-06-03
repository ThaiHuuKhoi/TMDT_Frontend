"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Facebook } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/axiosConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
  message: z.string().trim().min(1, "Nhập nội dung bài đăng").max(5000),
  linkUrl: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

type ConnectionStatus = {
  configured: boolean;
  pageId?: string;
  message: string;
};

type SocialPost = {
  id: number;
  message: string;
  linkUrl?: string;
  imageUrl?: string;
  status: "DRAFT" | "PUBLISHED" | "FAILED";
  externalPostId?: string;
  errorMessage?: string;
  createdAt: string;
  publishedAt?: string;
};

const statusLabel: Record<SocialPost["status"], string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã đăng",
  FAILED: "Thất bại",
};

const FacebookPosts = () => {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "", linkUrl: "", imageUrl: "" },
  });

  const { data: status, isLoading: loadingStatus } = useQuery<ConnectionStatus>({
    queryKey: ["facebookConnectionStatus"],
    queryFn: async () => {
      const res = await api.get("/social/facebook/status");
      return res.data;
    },
  });

  const { data: posts, isLoading: loadingPosts } = useQuery<SocialPost[]>({
    queryKey: ["facebookPosts"],
    queryFn: async () => {
      const res = await api.get("/social/facebook/posts");
      return res.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await api.post("/social/facebook/publish", {
        message: values.message,
        linkUrl: values.linkUrl?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
      });
      return res.data as SocialPost;
    },
    onSuccess: (data) => {
      if (data.status === "PUBLISHED") {
        toast.success("Đã đăng bài lên Facebook Page!");
        form.reset();
      } else {
        toast.error(data.errorMessage || "Đăng bài thất bại");
      }
      void queryClient.invalidateQueries({ queryKey: ["facebookPosts"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể đăng bài lên Facebook");
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-zinc-900">Kết nối Facebook Page</h2>
        </div>
        {loadingStatus ? (
          <p className="text-sm text-zinc-500">Đang kiểm tra cấu hình...</p>
        ) : (
          <p
            className={`text-sm ${status?.configured ? "text-green-700" : "text-amber-700"}`}
          >
            {status?.message}
            {status?.configured && status.pageId ? ` (Page ID: ${status.pageId})` : ""}
          </p>
        )}
        {!status?.configured && (
          <p className="mt-2 text-xs text-zinc-500">
            Cấu hình trên server: FACEBOOK_PAGE_ID và FACEBOOK_PAGE_ACCESS_TOKEN (token Page, quyền
            pages_manage_posts).
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Soạn và đăng bài</h2>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => publishMutation.mutate(data))}
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung bài đăng</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[120px]" placeholder="Giới thiệu sản phẩm, khuyến mãi..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link sản phẩm / landing (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>Dùng khi không có ảnh — Facebook sẽ hiển thị preview link.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL ảnh (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://res.cloudinary.com/..." {...field} />
                  </FormControl>
                  <FormDescription>Nếu có ảnh, bài sẽ đăng dạng photo post.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!status?.configured || publishMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {publishMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Đăng lên Facebook
            </Button>
          </form>
        </Form>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Lịch sử đăng bài</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Post ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingPosts ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : !(posts || []).length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500">
                  Chưa có bài đăng nào
                </TableCell>
              </TableRow>
            ) : (
              (posts || []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm text-zinc-600 whitespace-nowrap">
                    {new Date(p.publishedAt || p.createdAt).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm">{p.message}</TableCell>
                  <TableCell>
                    <span
                      className={
                        p.status === "PUBLISHED"
                          ? "text-green-700"
                          : p.status === "FAILED"
                            ? "text-red-600"
                            : "text-zinc-600"
                      }
                    >
                      {statusLabel[p.status]}
                      {p.errorMessage ? `: ${p.errorMessage}` : ""}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.externalPostId || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FacebookPosts;
