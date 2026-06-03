"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartCrack, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/features/wishlist/store";
import { getVariantPricing } from "@/lib/pricing";

export default function WishlistPage() {
  const { items, toggleWishlist, hasHydrated } = useWishlistStore();

  if (!hasHydrated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-[70vh]">
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 text-zinc-900">
        Danh sách yêu thích
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100">
          <HeartCrack className="w-16 h-16 text-zinc-300 mb-4" />
          <h3 className="text-xl font-bold text-zinc-900">Chưa có sản phẩm nào</h3>
          <p className="text-zinc-500 mt-2 mb-6 text-sm">
            Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.
          </p>
          <Link
            href="/products"
            className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg"
          >
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const mainImage =
              product.images?.find((img) => img.isMain)?.url ||
              product.images?.[0]?.url ||
              "/product-placeholder.png";
            const v0 = product.variants?.[0];
            const price = v0 != null ? getVariantPricing(v0).displayPrice : 0;

            return (
              <div
                key={product.id}
                className="group relative bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-zinc-400 hover:text-red-500 hover:bg-white shadow-sm transition-all"
                >
                  <Trash2 size={16} />
                </button>

                <Link
                  href={`/products/${product.id}`}
                  className="block relative aspect-[3/4] bg-zinc-50"
                >
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="p-4 flex flex-col gap-2">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-zinc-900 truncate group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-black text-red-600">
                    {price.toLocaleString("vi-VN")} ₫
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-zinc-900 text-zinc-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all"
                  >
                    <ShoppingCart size={14} /> Tùy chọn mua
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}