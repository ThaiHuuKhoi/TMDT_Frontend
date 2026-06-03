"use client";

import { ProductType } from "@repo/types";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { MouseEvent } from "react";
import { useWishlistStore } from "@/features/wishlist/store";
import { useCartStore } from "@/features/cart/store";
import { getVariantPricing } from "@/lib/pricing";

const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (price: number) => vndFormatter.format(price);

const ProductCard = ({ product }: { product: ProductType }) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const isSaved = isInWishlist(product.id);

  const handleWishlistClick = (e: MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    const variant = product.variants?.[0];
    if (!variant) return;
    const mainImage = product.images?.find(img => img.isMain)?.url
      || product.images?.[0]?.url
      || "/product-placeholder.png";
    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      quantity: 1,
      image: mainImage,
      attributes: variant.attributeValues?.reduce((acc: Record<string, string>, curr) => {
        if (curr?.attribute?.name) acc[curr.attribute.name] = curr.value;
        return acc;
      }, {}) ?? {},
    });
  };

  const mainImage = product.images?.find(img => img.isMain)?.url
    || product.images?.[0]?.url
    || "/product-placeholder.png";

  const v0 = product.variants?.[0];
  const p = v0 ? getVariantPricing(v0) : null;

  const showBadge = p != null && p.discountPercent > 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-zinc-100 hover:border-red-500 hover:shadow-lg transition-all duration-300 overflow-hidden">

      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 p-4">

        {showBadge && (
          <div className="absolute top-0 left-0 z-10">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-br-xl text-xs font-black shadow-sm flex items-center gap-1">
              Giảm {p!.discountPercent}%
            </div>
          </div>
        )}

        {product.variants?.length > 1 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-zinc-600 border border-zinc-200 shadow-sm">
              {product.variants.length} Phân loại
            </span>
          </div>
        )}

        <button onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm ${isSaved
            ? "bg-red-50 text-red-500"
            : "bg-white text-zinc-400 hover:bg-red-50 hover:text-red-500"
            }`}
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "transparent"} />
        </button>

        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={mainImage}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="p-3 flex flex-col flex-1">

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" />
            <span className="text-[11px] font-bold text-zinc-700">
              {product.averageRating != null ? product.averageRating.toFixed(1) : '--'}
            </span>
          </div>
          {(product as any).soldCount != null && (
            <>
              <div className="w-px h-3 bg-zinc-300"></div>
              <span className="text-[11px] text-zinc-500">Đã bán {(product as any).soldCount}</span>
            </>
          )}
        </div>

        <Link href={`/products/${product.id}`} className="flex-1">
          <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-col gap-0.5">
          {p?.showOriginalStrike && p.originalListPrice != null && (
            <span className="text-xs text-zinc-400 line-through decoration-zinc-400">
              {formatVND(p.originalListPrice)}
            </span>
          )}
          {p?.showCouponDeal && !p.showOriginalStrike && (
            <span className="text-xs text-zinc-400 line-through decoration-zinc-400">
              {formatVND(p.salePrice)}
            </span>
          )}

          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-bold text-red-600 tracking-tight">
              {p != null ? formatVND(p.displayPrice) : formatVND(0)}
            </span>

            {product.variants?.length === 1 ? (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                title="Thêm vào giỏ"
              >
                <ShoppingCart size={14} />
              </button>
            ) : (
              <Link
                href={`/products/${product.id}`}
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                title="Chọn phân loại"
              >
                <ShoppingCart size={14} />
              </Link>
            )}
          </div>

          {p?.showCouponDeal && p.bestPromo && (
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              Với mã {p.bestPromo.code}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
