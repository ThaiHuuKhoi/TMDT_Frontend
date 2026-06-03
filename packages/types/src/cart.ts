// File: packages/types/src/cart.ts (hoặc tùy cấu trúc của bạn)
import z from "zod";

// Dữ liệu 1 món hàng trong giỏ (Đã chuyển sang cấu trúc Variant)
export type CartItemType = {
  productId: number;
  variantId: number; // Định danh cốt lõi của giỏ hàng mới
  name: string;
  price: number;
  quantity: number;
  image: string;
  attributes: Record<string, string>; // VD: { "Size": "M", "Color": "Đỏ" }
};

export type CartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
    .min(1, "Email is required!"),
  phone: z
    .string()
    .min(7, "Phone number must be between 7 and 10 digits!")
    .max(10, "Phone number must be between 7 and 10 digits!")
    .regex(/^\d+$/, "Phone number must contain only numbers!"),
  address: z.string().min(1, "Address is required!"),
  city: z.string().min(1, "City is required!"),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export type CartStoreStateType = {
  cart: CartItemsType;
  hasHydrated: boolean;
};

// ĐÃ THÊM DẤU NGOẶC ĐÓNG } Ở ĐÂY
export type CartStoreActionsType = {
  addToCart: (item: CartItemType) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  updateQuantity: (variantId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCartFromServer: () => Promise<void>;
};