"use client";

import { ProductType, ProductVariant } from "@repo/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCartStore } from "@/features/cart/store";

interface ProductInteractionProps {
  product: ProductType;
  parsedAttributes: { name: string; values: string[] }[];
  selectedAttributes: Record<string, string>;
  currentVariant: ProductVariant;
}

const ProductInteraction = ({
  product,
  parsedAttributes,
  selectedAttributes,
  currentVariant,
}: ProductInteractionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [rawQuantity, setRawQuantity] = useState("1");

  const { addToCart, cart } = useCartStore();

  const cartQuantity = cart.find((item: any) => item.variantId === currentVariant?.id)?.quantity ?? 0;
  const remainingStock = Math.max(0, (currentVariant?.stockQuantity ?? 0) - cartQuantity);

  const updateQuantity = (val: number) => {
    setQuantity(val);
    setRawQuantity(String(val));
  };

  const handleAttributeChange = (attrName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(attrName, value);
    updateQuantity(1);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      updateQuantity(Math.min(quantity + 1, remainingStock, 99));
    } else {
      updateQuantity(Math.max(quantity - 1, 1));
    }
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setRawQuantity(str);
    const num = parseInt(str, 10);
    if (!isNaN(num) && num >= 1) {
      const max = Math.min(remainingStock, 99);
      setQuantity(Math.min(num, max));
    }
  };

  const handleQuantityBlur = () => {
    const num = parseInt(rawQuantity, 10);
    const max = Math.min(remainingStock, 99);
    const clamped = isNaN(num) || num < 1 ? 1 : Math.min(num, max);
    updateQuantity(clamped);
  };

  const isVariantSelected = !!currentVariant;
  const isOutOfStock = isVariantSelected ? remainingStock <= 0 : true;

  const handleAddToCart = async () => {
    if (!isVariantSelected) {
      toast.warning("Vui lòng chọn loại sản phẩm bạn muốn mua.");
      return;
    }

    if (isOutOfStock) {
      toast.error("Rất tiếc, phân loại này đã hết hàng!");
      return;
    }

    await addToCart({
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      price: currentVariant.price,
      quantity,
      image: product.images?.find(img => img.variantId === currentVariant.id)?.url
        || product.images?.find(img => img.isMain)?.url
        || "/product-placeholder.png",
      attributes: selectedAttributes,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleBuyNow = async () => {
    if (!isVariantSelected) {
      toast.warning("Vui lòng chọn loại sản phẩm bạn muốn mua.");
      return;
    }
    await handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. LỰA CHỌN PHÂN LOẠI (Thùng, Lốc, Gói, Vị...) */}
      {parsedAttributes.map((attr) => (
        <div key={attr.name} className="flex flex-col gap-2">
          <span className="text-sm font-bold text-zinc-800">{attr.name}:</span>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((val) => {
              const isSelected = selectedAttributes[attr.name] === val;

              return (
                <button
                  key={val}
                  onClick={() => handleAttributeChange(attr.name, val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${isSelected
                      ? "bg-red-50 text-red-600 border-red-500 shadow-sm"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-red-300 hover:text-red-500"
                    }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="h-px bg-zinc-100 my-1 w-full" />

      {/* 2. CHỌN SỐ LƯỢNG & NÚT MUA - Xếp ngang hàng cho tiết kiệm diện tích */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">

        {/* Bộ đếm số lượng */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center h-12 bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange("decrement")}
              className="w-10 h-full flex justify-center items-center text-zinc-500 hover:bg-zinc-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-zinc-500"
              disabled={quantity <= 1 || isOutOfStock}
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              value={rawQuantity}
              min={1}
              max={Math.min(remainingStock, 99)}
              disabled={isOutOfStock || !isVariantSelected}
              onChange={handleQuantityInput}
              onBlur={handleQuantityBlur}
              className="w-12 h-full text-center font-bold text-zinc-800 border-x border-zinc-200 bg-zinc-50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
            />
            <button
              onClick={() => handleQuantityChange("increment")}
              className="w-10 h-full flex justify-center items-center text-zinc-500 hover:bg-zinc-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-zinc-500"
              disabled={!isVariantSelected || quantity >= remainingStock || isOutOfStock}
            >
              <Plus size={18} />
            </button>
          </div>
          {/* Cảnh báo tồn kho */}
          <div className="h-4 flex flex-col gap-0.5">
            {cartQuantity > 0 && (
              <p className="text-xs text-blue-600 font-medium whitespace-nowrap">Đã có {cartQuantity} trong giỏ</p>
            )}
            {isVariantSelected && remainingStock > 0 && remainingStock < 10 && (
              <p className="text-xs text-amber-600 font-medium whitespace-nowrap">Còn thể thêm {remainingStock} sp!</p>
            )}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-1 w-full gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!isVariantSelected || isOutOfStock}
            className="flex-1 sm:flex-none sm:w-14 h-12 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={22} className={!isVariantSelected || isOutOfStock ? "" : "fill-current"} />
            <span className="sm:hidden ml-2 font-bold">Thêm giỏ</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!isVariantSelected || isOutOfStock}
            className="flex-[2] h-12 bg-red-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-all active:scale-[0.98] shadow-sm disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
          >
            {!isVariantSelected ? "Chọn Loại" : (isOutOfStock ? "Tạm Hết Hàng" : "Mua Ngay")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInteraction;