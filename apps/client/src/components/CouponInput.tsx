"use client";

import { useState } from "react";
import api from "@/lib/api/client";
import { Loader2, Tag, X, CheckCircle2 } from "lucide-react";

interface CouponInputProps {
    orderAmount: number;
    onCouponApplied: (code: string, discountAmount: number) => void;
}

const CouponInput = ({ orderAmount, onCouponApplied }: CouponInputProps) => {
    const [inputCode, setInputCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount: number } | null>(null);

    const handleApply = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputCode.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/coupons/apply", {
                code: inputCode.toUpperCase(),
                orderAmount: orderAmount,
            });

            const data = res.data;

            if (data.valid) {
                const discount = data.discountAmount;

                // 1. Cập nhật state nội bộ
                setActiveCoupon({ code: inputCode.toUpperCase(), discount });
                setError("");

                // 2. Báo cho Parent biết
                onCouponApplied(inputCode.toUpperCase(), discount);
            } else {
                setError(data.message || "Mã giảm giá không hợp lệ");
                setActiveCoupon(null);
                onCouponApplied("", 0);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi kiểm tra mã.";
            setError(msg);
            setActiveCoupon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setInputCode("");
        setActiveCoupon(null);
        setError("");
        onCouponApplied("", 0);
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                    <Tag size={16} className="text-black" />
                    Mã giảm giá / Quà tặng
                </h3>
            </div>

            {activeCoupon ? (
                // --- TRẠNG THÁI: ĐÃ ÁP DỤNG MÃ ---
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-1.5 rounded-full">
                            <CheckCircle2 size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-green-800 text-sm">{activeCoupon.code}</p>
                            <p className="text-xs text-green-600">
                                Đã giảm {activeCoupon.discount.toLocaleString()}đ
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                        title="Gỡ mã"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                // --- TRẠNG THÁI: NHẬP MÃ ---
                <form onSubmit={handleApply} className="relative">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nhập mã giảm giá"
                            value={inputCode}
                            onChange={(e) => {
                                setInputCode(e.target.value);
                                setError("");
                            }}
                            className={`flex-1 border px-3 py-2.5 rounded-lg text-sm font-medium uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-1 transition-all
                ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-black focus:ring-gray-200'}
              `}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !inputCode}
                            className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all min-w-[80px] flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Áp dụng"}
                        </button>
                    </div>

                    {/* Thông báo lỗi */}
                    {error && (
                        <p className="absolute -bottom-6 left-1 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                            {error}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};

export default CouponInput;