"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Trash2, Plus, X, Package, Sparkles } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

import { CategoryType, ProductFormSchema } from "@repo/types";
import api from "@/utils/axiosConfig";
import type { AISuggestion } from "@/app/api/ai/suggest-product/route";

const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

/**
 * Hàm tính Tích Descartes để tạo tổ hợp biến thể
 * Ví dụ: [Red, Blue] x [S, M] => [[Red, S], [Red, M], [Blue, S], [Blue, M]]
 */
const generateCartesianProduct = (arrays: string[][]) => {
  return arrays.reduce(
    (a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())),
    [[]] as string[][]
  );
};

const AddProduct = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiPriceRef = useRef<{ price: number; originalPrice?: number } | null>(null);
  // SKU prefix cố định mỗi lần mở form, tránh trùng giữa các sản phẩm
  const skuSessionRef = useRef(Math.random().toString(36).substring(2, 6).toUpperCase());
  const form = useForm<any>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      categorySlug: "",
      imageUrls: [],
      variants: [],
      // Field tạm để quản lý thuộc tính động trên UI
      dynamicAttributes: [{ name: "", values: "" }],
    },
  });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: attrFields, append: addAttr, remove: removeAttr } = useFieldArray({
    control: form.control,
    name: "dynamicAttributes",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.post("/products", values);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Sản phẩm đã được tạo thành công!");
      form.reset();
      aiPriceRef.current = null;
      skuSessionRef.current = Math.random().toString(36).substring(2, 6).toUpperCase();
      // Delay để toast kịp render trước khi Sheet unmount và trang refresh
      setTimeout(() => {
        onClose?.();
        router.refresh();
      }, 300);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Tạo sản phẩm thất bại!");
    },
  });

  const handleAiSuggest = async () => {
    const imageUrls: string[] = form.getValues("imageUrls") || [];
    if (imageUrls.length === 0) {
      toast.warn("Hãy upload ít nhất 1 ảnh trước để AI phân tích!");
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrls[0] }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const suggestion = (await res.json()) as AISuggestion;

      form.setValue("name", suggestion.name, { shouldValidate: true });
      form.setValue("shortDescription", suggestion.shortDescription, { shouldValidate: true });
      form.setValue("description", suggestion.description, { shouldValidate: true });

      if (suggestion.attributes?.length > 0) {
        const mapped = suggestion.attributes.map((a) => ({ name: a.name, values: a.values }));
        form.setValue("dynamicAttributes", mapped, { shouldValidate: true });
      }

      if (suggestion.price) {
        aiPriceRef.current = {
          price: suggestion.price,
          originalPrice: suggestion.originalPrice,
        };
      }

      toast.success("AI đã gợi ý thông tin sản phẩm!");
    } catch {
      toast.error("AI gợi ý thất bại, vui lòng thử lại!");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Theo dõi thay đổi của tên SP và các thuộc tính để sinh biến thể
  const watchDynamicAttrs = form.watch("dynamicAttributes");
  const watchProductName = form.watch("name");

  useEffect(() => {
    // Lọc các nhóm thuộc tính hợp lệ (có tên và ít nhất 1 giá trị)
    const validGroups = watchDynamicAttrs.filter(
      (g: any) => g.name.trim() !== "" && g.values.trim() !== ""
    );

    if (validGroups.length > 0 && watchProductName) {
      const attrNames = validGroups.map((g: any) => g.name.trim());
      const attrValuesMatrix = validGroups.map((g: any) =>
        g.values
          .split(",")
          .map((v: string) => v.trim())
          .filter((v: string) => v !== "")
      );

      // Chỉ chạy nếu tất cả các nhóm đã nhập đều có giá trị
      if (attrValuesMatrix.every((arr: string[]) => arr.length > 0)) {
        const combinations = generateCartesianProduct(attrValuesMatrix);

        const newVariants = combinations.map((combo: string[]) => {
          // Tạo object attributes: { "Màu sắc": "Đỏ", "Dung lượng": "128GB" }
          const attributesObj = attrNames.reduce((obj: any, name: string, i: number) => {
            obj[name] = combo[i];
            return obj;
          }, {});

          const skuPart = combo.join("-").toUpperCase().replace(/\s+/g, "");

          return {
            sku: `${skuSessionRef.current}-${skuPart}`,
            price: aiPriceRef.current?.price ?? 0,
            originalPrice: aiPriceRef.current?.originalPrice,
            stockQuantity: 10,
            attributes: attributesObj,
          };
        });

        replaceVariants(newVariants);
      }
    } else {
      replaceVariants([]);
    }
  }, [watchDynamicAttrs, watchProductName, replaceVariants]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "TMDT_ecom");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      return data.secure_url;
    });

    try {
      toast.info("Đang tải ảnh lên...");
      const urls = await Promise.all(uploadPromises);
      const current = form.getValues("imageUrls") || [];
      form.setValue("imageUrls", [...current, ...urls], { shouldValidate: true });
      toast.success("Tải ảnh thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh!");
    }
  };

  return (
    <SheetContent className="sm:max-w-[750px] p-0">
      <ScrollArea className="h-full p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Tạo sản phẩm
          </SheetTitle>
          <SheetDescription>
            Tạo sản phẩm và các biến thể từ thuộc tính động.
          </SheetDescription>
          <Button
            type="button"
            onClick={handleAiSuggest}
            disabled={isAiLoading}
            className="mt-3 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold gap-2"
          >
            {isAiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isAiLoading ? "AI đang phân tích ảnh..." : "AI Gợi ý từ ảnh"}
          </Button>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6 pb-20">

            {/* THÔNG TIN CHUNG */}
            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-gray-50/50 shadow-sm">
              <h3 className="font-semibold text-sm uppercase text-gray-500">Thông tin chung</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl><Input  {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories?.map((cat: CategoryType) => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl><Input  {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl><Textarea className="min-h-[80px]" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* HÌNH ẢNH */}
            <div className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-semibold text-sm uppercase text-gray-500 mb-4">Hình ảnh</h3>
              <div className="flex flex-wrap gap-4">
                {form.watch("imageUrls")?.map((url: string, index: number) => (
                  <div key={index} className="relative w-20 h-20 border rounded-md group">
                    <img src={url} className="w-full h-full object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => {
                        const current = form.getValues("imageUrls");
                        form.setValue("imageUrls", current.filter((_: any, i: number) => i !== index));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition border-blue-200">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* CẤU HÌNH THUỘC TÍNH ĐỘNG */}
            <div className="p-4 border rounded-lg bg-blue-50/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase text-blue-700">Thiết lập thuộc tính tùy chỉnh</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => addAttr({ name: "", values: "" })}>
                  <Plus className="w-4 h-4 mr-1" /> Thêm loại thuộc tính
                </Button>
              </div>


              {attrFields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end bg-white p-3 rounded-md border border-blue-100 shadow-sm">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400">Tên thuộc tính</span>
                    <Input {...form.register(`dynamicAttributes.${index}.name`)} />
                  </div>
                  <div className="flex-[2] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400">Giá trị (cách nhau bằng dấu phẩy)</span>
                    <Input {...form.register(`dynamicAttributes.${index}.values`)} />
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeAttr(index)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* DANH SÁCH BIẾN THỂ TỰ ĐỘNG */}
            {variantFields.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-lg text-gray-800">Cấu hình Biến thể ({variantFields.length})</h3>
                </div>
                <div className="grid gap-4">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="p-4 border-2 border-gray-100 rounded-xl space-y-4 bg-white shadow-sm hover:border-blue-200 transition">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(form.getValues(`variants.${index}.attributes`)).map(([key, val]: any) => (
                          <Badge key={key} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
                            {key}: {val}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px]">Giá bán (VNĐ)</FormLabel>
                              <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.originalPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px]">Giá niêm yết (tuỳ chọn)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Để trống nếu không có"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    field.onChange(v === "" ? undefined : Number(v));
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stockQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px]">Số lượng</FormLabel>
                              <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px]">Mã SKU</FormLabel>
                              <FormControl><Input className="bg-gray-50 font-mono text-xs" {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold shadow-lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Tạo sản phẩm & biến thể"}
            </Button>
          </form>
        </Form>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;