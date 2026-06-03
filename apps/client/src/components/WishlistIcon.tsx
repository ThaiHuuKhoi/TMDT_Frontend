"use client";

import { useWishlistStore } from "@/features/wishlist/store";
import { Heart } from "lucide-react";
import Link from "next/link";

const WishlistIcon = () => {
  const { items, hasHydrated } = useWishlistStore();

  // Đợi Client render xong để tránh lỗi Hydration
  if (!hasHydrated) return null;

  return (
    <Link href="/wishlist" className="relative group">
      <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
      {/* Chỉ hiện bong bóng báo số lượng nếu có sản phẩm */}
      {items.length > 0 && (
        <span className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm">
          {items.length}
        </span>
      )}
    </Link>
  );
};

export default WishlistIcon;