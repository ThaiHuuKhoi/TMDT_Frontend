"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trash2, Minus, Plus, ShoppingBag, ChevronLeft } from "lucide-react";
import ShippingForm from "@/components/ShippingForm";
import CouponInput from "@/components/CouponInput";
import { useCartStore } from "@/features/cart/store";
import { ShippingFormInputs } from "@repo/types";
import VNPayButton from "@/components/VNPayButton";
import api from "@/lib/api/client";
import publicApi from "@/lib/api/publicClient";

const STEPS = [
  { id: 1, title: "Giỏ hàng" },
  { id: 2, title: "Giao hàng" },
  { id: 3, title: "Thanh toán" },
];

const formatVND = (price: number) => {
  return price.toLocaleString("vi-VN") + " ₫";
};

const CartSteps = ({ activeStep, router }: { activeStep: number; router: any }) => (
  <div className="flex flex-col md:flex-row justify-center items-start md:items-center gap-4 md:gap-12 w-full max-w-3xl mx-auto mb-10">
    {STEPS.map((step, index) => (
      <div key={step.id} className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => step.id < activeStep && router.push(`/cart?step=${step.id}`)}
          disabled={step.id >= activeStep}
          className={`flex items-center gap-3 transition-all duration-300 ${
            step.id <= activeStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-colors duration-300 ${
              step.id === activeStep
                ? "bg-red-600 text-white ring-4 ring-red-100"
                : step.id < activeStep
                ? "bg-green-500 text-white"
                : "bg-zinc-200 text-zinc-500"
            }`}
          >
            {step.id}
          </div>
          <p
            className={`text-sm font-bold ${
              step.id === activeStep ? "text-red-600" : "text-zinc-600"
            }`}
          >
            {step.title}
          </p>
        </button>
        {index < STEPS.length - 1 && (
          <div
            className={`hidden md:block w-16 h-0.5 rounded-full ${
              step.id < activeStep ? "bg-green-500" : "bg-zinc-200"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const CartItem = ({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: any;
  onRemove: (id: number) => void;
  onUpdateQuantity?: (id: number, qty: number) => void;
}) => {
  const imageUrl = item.image || "/product-placeholder.png";

  return (
    <div className="flex gap-4 items-start justify-between border-b border-zinc-100 last:border-0 py-5 first:pt-0 last:pb-0">
      <div className="flex gap-4 flex-1">
        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-zinc-50 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
          <Image src={imageUrl} alt={item.name} fill className="object-contain p-2" />
        </div>

        <div className="flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 line-clamp-2 text-sm md:text-base leading-snug">
              {item.name}
            </h3>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
              {item.attributes &&
                Object.entries(item.attributes).map(([key, value]) => (
                  <span
                    key={key}
                    className="bg-zinc-100 px-2 py-0.5 rounded-md text-zinc-700 font-medium"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="font-black text-red-600 text-base">{formatVND(item.price)}</p>

            <div className="flex items-center h-8 bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  onUpdateQuantity && onUpdateQuantity(item.variantId, Math.max(1, item.quantity - 1))
                }
                disabled={item.quantity <= 1}
                className="w-8 h-full flex justify-center items-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <div className="w-8 h-full flex justify-center items-center font-bold text-sm text-zinc-900 border-x border-zinc-200 bg-zinc-50">
                {item.quantity}
              </div>
              <button
                onClick={() =>
                  onUpdateQuantity && onUpdateQuantity(item.variantId, item.quantity + 1)
                }
                className="w-8 h-full flex justify-center items-center text-zinc-500 hover:bg-zinc-100"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onRemove(item.variantId)}
        className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors self-start ml-2"
        title="Xóa sản phẩm"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const CartPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore() as any;

  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingFeeNote, setShippingFeeNote] = useState("");

  const activeStep = useMemo(() => {
    const step = parseInt(searchParams.get("step") || "1");
    return isNaN(step) ? 1 : step;
  }, [searchParams]);

  const itemCount = useMemo(
    () => cart.reduce((acc: number, item: any) => acc + item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    if (cart.length === 0 || itemCount < 1) {
      setShippingFee(0);
      setShippingFeeNote("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await publicApi.post("/shipping/quote", { itemCount });
        const fee = res.data?.fee;
        const src = res.data?.source as string | undefined;
        if (!cancelled && fee != null && Number.isFinite(Number(fee))) {
          setShippingFee(Math.round(Number(fee)));
          setShippingFeeNote(
            src === "CARRIER"
              ? " (theo đối tác vận chuyển)"
              : " (mức cố định, chờ tích hợp địa chỉ GHN để tính chính xác theo tuyến)"
          );
        }
      } catch {
        if (!cancelled) {
          setShippingFee(20_000);
          setShippingFeeNote(" (fallback)");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemCount, cart.length]);

  const { subtotal, finalTotal } = useMemo(() => {
    const sub = cart.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    const total = Math.max(0, sub + shippingFee - discountAmount);
    return { subtotal: sub, finalTotal: total };
  }, [cart, discountAmount, shippingFee]);

  useEffect(() => {
    if (cart.length === 0) {
      setDiscountAmount(0);
      setCouponCode("");
    }
  }, [cart.length]);

  const handleNextStep = () => {
    router.push("/cart?step=2", { scroll: true });
  };

  if (cart.length === 0 && activeStep === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4">
        <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={48} className="text-zinc-300" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">Giỏ hàng của bạn đang trống</h2>
        <p className="text-zinc-500 text-center max-w-md">
          Có vẻ như bạn chưa chọn mua sản phẩm nào. Hãy khám phá các sản phẩm hấp dẫn của chúng
          tôi nhé!
        </p>
        <Link
          href="/"
          className="mt-4 bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-sm"
        >
          <ChevronLeft size={20} /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-black text-center mb-10 text-zinc-900">
          Thanh Toán Đơn Hàng
        </h1>

        <CartSteps activeStep={activeStep} router={router} />

        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white shadow-sm border border-zinc-200 p-5 md:p-8 rounded-2xl">
              {activeStep === 1 && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-zinc-900">Sản phẩm đã chọn</h2>
                      <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {cart.length} món
                      </span>
                    </div>
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa tất cả
                    </button>
                  </div>

                  {cart.map((item: any) => (
                    <CartItem
                      key={`cart-item-${item.variantId}`}
                      item={item}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              )}

              {activeStep === 2 && (
                <>
                  <h2 className="text-lg font-bold mb-6 text-zinc-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full" /> Thông tin nhận hàng
                  </h2>
                  <ShippingForm setShippingForm={setShippingForm} />
                </>
              )}

              {activeStep === 3 ? (
                shippingForm ? (
                  <>
                    <h2 className="text-lg font-bold mb-6 text-zinc-900 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-red-600 rounded-full" /> Phương thức thanh toán
                    </h2>

                    <div className="flex flex-col gap-4 mb-6">
                      <div className="flex items-center gap-4 p-4 border-2 border-blue-500 bg-blue-50/50 rounded-xl">
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-bold text-zinc-900 text-sm md:text-base">
                            Thanh toán VNPAY (QR, thẻ nội địa, thẻ quốc tế)
                          </span>
                          <img
                            src="/vnpay-logo.png"
                            alt="VNPay"
                            className="h-6 md:h-8 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <VNPayButton
                      cartItems={cart.map((item: { variantId: number; quantity: number }) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                      }))}
                      couponCode={couponCode}
                      shipping={shippingForm}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                      !
                    </div>
                    <p className="text-red-600 font-bold mb-2">Chưa có thông tin nhận hàng</p>
                    <p className="text-sm text-red-500/80 mb-4">
                      Vui lòng cung cấp địa chỉ giao hàng trước khi thanh toán.
                    </p>
                    <button
                      onClick={() => router.push("/cart?step=2")}
                      className="bg-white text-red-600 font-bold border border-red-200 px-6 py-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Quay lại bước Giao Hàng
                    </button>
                  </div>
                )
              ) : null}
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow-sm border border-zinc-200 p-6 md:p-8 rounded-2xl flex flex-col gap-6 sticky top-24">
              <h2 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-bold text-zinc-900">{formatVND(subtotal)}</span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-zinc-500">
                    Phí vận chuyển
                    {shippingFeeNote ? (
                      <span className="block text-[10px] font-normal text-zinc-400 leading-tight mt-0.5">
                        {shippingFeeNote.trim()}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-bold text-zinc-900 shrink-0">
                    {formatVND(shippingFee)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg -mx-2">
                    <span className="font-semibold">Mã giảm giá</span>
                    <span className="font-bold">-{formatVND(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-zinc-200 border-dashed border-b" />

              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-zinc-900">Tổng cộng</span>
                <span className="text-2xl font-black text-red-600">{formatVND(finalTotal)}</span>
              </div>

              {activeStep === 1 && (
                <div className="mt-2">
                  <CouponInput
                    orderAmount={subtotal}
                    onCouponApplied={(code, discount) => {
                      setCouponCode(code);
                      setDiscountAmount(discount);
                    }}
                  />
                </div>
              )}

              {activeStep === 1 && (
                <button
                  onClick={handleNextStep}
                  disabled={cart.length === 0}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all shadow-sm mt-2"
                >
                  Tiến hành đặt hàng
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

