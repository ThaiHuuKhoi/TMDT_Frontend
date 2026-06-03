import type { ProductVariant } from "@repo/types";

export type VariantPricing = {
  salePrice: number;
  displayPrice: number;
  originalListPrice?: number;
  bestPromo: ProductVariant["bestPromo"];
  /** Gạch ngang giá niêm yết (originalPrice). */
  showOriginalStrike: boolean;
  /** Có mã tốt hơn giá bán — gạch giá bán nhỏ nếu không có original. */
  showCouponDeal: boolean;
  discountPercent: number;
};

export function getVariantPricing(variant: ProductVariant): VariantPricing {
  const salePrice = variant.price ?? 0;
  const originalList = variant.originalPrice;
  const best = variant.bestPromo;
  const showCouponDeal = best != null && best.finalPrice < salePrice;
  const displayPrice = showCouponDeal ? best!.finalPrice : salePrice;
  const showOriginalStrike =
    originalList != null && originalList > salePrice;

  let reference: number | null = null;
  if (showOriginalStrike) {
    reference = originalList!;
  } else if (showCouponDeal) {
    reference = salePrice;
  }

  const discountPercent =
    reference != null && displayPrice < reference
      ? Math.round(((reference - displayPrice) / reference) * 100)
      : 0;

  return {
    salePrice,
    displayPrice,
    originalListPrice:
      originalList != null && originalList > 0 ? originalList : undefined,
    bestPromo: best,
    showOriginalStrike,
    showCouponDeal,
    discountPercent,
  };
}
