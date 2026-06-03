import z from "zod";

// ==========================================
// 1. TYPES & INTERFACES (Khớp 100% với Backend JSON)
// ==========================================

export interface CategoryType {
  id: number;
  name: string;
  slug: string;
  image: string | null; // Cập nhật: Backend có trả về null
}

export interface AttributeType {
  id: number;
  name: string;
}

export interface AttributeValueType {
  id: number;
  value: string;
  attribute: AttributeType;
}

export interface BestPromo {
  code: string;
  discountAmount: number;
  finalPrice: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  /** Giá niêm yết / gốc (gạch ngang), optional. */
  originalPrice?: number;
  /** Mã giảm giá active tốt nhất cho đơn vị 1 sản phẩm (từ backend). */
  bestPromo?: BestPromo;
  stockQuantity: number;
  isActive: boolean;      // THÊM MỚI
  version: number;        // THÊM MỚI
  createdAt: string;      // THÊM MỚI
  updatedAt: string;      // THÊM MỚI
  attributeValues: AttributeValueType[];
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  variantId: number | null;
  displayOrder: number;   // THÊM MỚI
}

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  status: string;                 // THÊM MỚI (Ví dụ: "ACTIVE")
  averageRating: number | null;   // SỬA: Data thực tế có trả về null
  reviewCount: number | null;     // SỬA: Data thực tế có trả về null
  category: CategoryType;         // SỬA: Dùng thẳng interface CategoryType cho gọn
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;              // THÊM MỚI
  updatedAt: string;              // THÊM MỚI
}

export type ProductsType = ProductType[];

// ==========================================
// 2. MẢNG DỮ LIỆU MẶC ĐỊNH (Dùng cho UI Admin nếu cần)
// ==========================================

export const colors = [
  "blue", "green", "red", "yellow", "purple",
  "orange", "pink", "brown", "gray", "black", "white",
] as const;

export const sizes = [
  "xs", "s", "m", "l", "xl", "xxl",
  "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "47", "48",
] as const;

// ==========================================
// 3. ZOD SCHEMAS (Dùng để Validate Form Tạo mới/Edit ở trang Admin)
// ==========================================

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Name is Required!" })
    .min(1, { message: "Name is Required!" }),
  slug: z
    .string({ message: "Slug is Required!" })
    .min(1, { message: "Slug is Required!" }),
});

export const VariantSchema = z.object({
  sku: z.string().min(1, { message: "SKU is required" }),
  price: z.number().min(0, { message: "Price must be >= 0" }),
  originalPrice: z.number().min(0).optional(),
  stockQuantity: z.number().min(0, { message: "Stock must be >= 0" }),
  attributes: z.record(z.string(), z.string()).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: "At least one attribute is required" }
  ),
});

export const ProductFormSchema = z.object({
  name: z
    .string({ message: "Product name is required!" })
    .min(1, { message: "Product name is required!" }),
  shortDescription: z
    .string({ message: "Short description is required!" })
    .min(1, { message: "Short description is required!" })
    .max(500),
  description: z
    .string({ message: "Description is required!" })
    .min(1, { message: "Description is required!" }),
  categorySlug: z
    .string({ message: "Category is required!" })
    .min(1, { message: "Category is required!" }),
  imageUrls: z
    .array(z.string())
    .min(1, { message: "At least one image is required!" }),
  variants: z
    .array(VariantSchema)
    .min(1, { message: "At least one product variant is required!" }),
});