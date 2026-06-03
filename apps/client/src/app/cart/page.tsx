import type { Metadata } from "next";
import CartPage from "@/features/cart/components/CartPage";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  robots: { index: false, follow: false },
};

export default function CartRoute() {
  return <CartPage />;
}