"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import api from "@/lib/api/client";
import { useAuthStore } from "@/features/auth/store";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import type { ShippingFormInputs } from "@repo/types";

interface VNPayButtonProps {
    cartItems: Array<{ variantId: number; quantity: number }>;
    couponCode: string;
    shipping: ShippingFormInputs;
}

async function syncServerCartWithLocal(
    items: Array<{ variantId: number; quantity: number }>
) {
    await api.delete("/cart");
    for (const item of items) {
        if (!item.variantId || item.quantity < 1) continue;
        await api.post("/cart/items", {
            variantId: item.variantId,
            quantity: item.quantity,
        });
    }
}

const VNPayButton = ({ cartItems, couponCode, shipping }: VNPayButtonProps) => {
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuthStore();

    const handlePayment = async () => {
        if (typeof window === "undefined") return;
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thanh toán VNPay.");
            return;
        }
        if (!cartItems.length) {
            toast.error("Giỏ hàng trống.");
            return;
        }

        setLoading(true);
        try {
            await syncServerCartWithLocal(cartItems);

            const res = await api.post("/vnpay/create-payment", {
                couponCode: couponCode?.trim() || "",
                shipping: {
                    name: shipping.name,
                    email: shipping.email,
                    phone: shipping.phone,
                    address: shipping.address,
                    city: shipping.city,
                },
            });

            if (res.data?.paymentUrl) {
                window.location.href = res.data.paymentUrl as string;
            } else {
                toast.error("Không thể tạo phiên giao dịch VNPay");
                setLoading(false);
            }
        } catch (error: unknown) {
            console.error("Lỗi VNPay:", error);
            toast.error(
                getApiErrorMessage(error, "Lỗi kết nối đến cổng thanh toán")
            );
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-70"
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Đang kết nối VNPAY...
                </>
            ) : (
                <>
                    Thanh toán bảo mật với VNPAY
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
    );
};

export default VNPayButton;
