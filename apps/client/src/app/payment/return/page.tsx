"use client";

import Link from "next/link";
import { Info } from "lucide-react";

/**
 * Trang return cũ dùng cho Stripe Checkout. Backend đã chuyển sang VNPay;
 * luồng hoàn tất đơn dùng `/payment/vnpay-return`.
 */
export default function LegacyPaymentReturnPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Cổng thanh toán đã thay đổi
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Shop hiện chỉ hỗ trợ thanh toán qua VNPay. Nếu bạn vừa thanh toán
          thành công, vui lòng kiểm tra mục đơn hàng. Kết quả VNPay được xử lý
          tại trang <span className="font-mono text-xs">/payment/vnpay-return</span>.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/cart"
            className="w-full border border-gray-200 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Về giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
