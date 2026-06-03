'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/client';
import { useCartStore } from '@/features/cart/store';

export default function VNPayReturnPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();

    // Dùng useRef để tránh việc chạy useEffect 2 lần trong Strict Mode của React
    const hasProcessed = useRef(false);

    // Đọc các tham số quan trọng từ VNPay trả về
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    const vnp_Amount = searchParams.get('vnp_Amount');

    useEffect(() => {
        if (hasProcessed.current) return;

        if (!vnp_ResponseCode) {
            setStatus('error');
            return;
        }

        hasProcessed.current = true;

        const confirmVNPayOrder = async () => {
            // Mã "00" của VNPay nghĩa là khách đã bị trừ tiền thành công
            if (vnp_ResponseCode === "00") {
                try {
                    // 🔥 BẢN VÁ: Chủ động lấy toàn bộ tham số URL gửi xuống Backend
                    const queryString = window.location.search;

                    // Xác thực chữ ký + chốt đơn qua endpoint return (tách khỏi IPN server-to-server)
                    const res = await api.get(`/vnpay/return${queryString}`);
                    if (res.data?.ok === true && res.data?.vnp_ResponseCode === '00') {
                        setStatus('success');
                        clearCart();
                    } else {
                        setStatus('error');
                    }
                } catch (error) {
                    console.error("Lỗi xác thực VNPay từ Server:", error);
                    // Nếu Backend báo chữ ký giả mạo hoặc lỗi, đánh rớt luôn
                    setStatus('error');
                }
            } else {
                setStatus('error');
            }
        };

        confirmVNPayOrder();
    }, [vnp_ResponseCode, clearCart]);

    // Format số tiền (VNPay nhân số tiền với 100 nên ta phải chia lại cho 100)
    const formattedAmount = vnp_Amount
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(vnp_Amount) / 100)
        : "";

    // --- 1. GIAO DIỆN LOADING ---
    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4 bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Đang xác thực kết quả thanh toán...</h2>
                <p className="text-sm text-gray-500">Vui lòng không đóng trình duyệt</p>
            </div>
        );
    }

    // --- 2. GIAO DIỆN THÀNH CÔNG ---
    if (status === 'success') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full animate-in fade-in zoom-in duration-500 border border-gray-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Thanh toán thành công!</h1>
                    <p className="text-gray-500 mb-6 font-medium">
                        Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được chuẩn bị.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-2xl mb-8 text-left border border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Mã giao dịch:</span>
                            <span className="font-bold text-gray-900">{vnp_TxnRef}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Số tiền:</span>
                            <span className="font-bold text-blue-600">{formattedAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Phương thức:</span>
                            <span className="font-bold text-gray-900">VNPAY</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/orders" className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200">
                            Xem đơn hàng của tôi
                        </Link>
                        <Link href="/products" className="w-full bg-zinc-100 text-zinc-700 py-3.5 rounded-xl hover:bg-zinc-200 transition font-bold">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- 3. GIAO DIỆN THẤT BẠI / HỦY ---
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Thanh toán chưa hoàn tất</h1>

                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 mt-4 flex items-start gap-3 text-left">
                    <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 font-medium text-sm leading-relaxed">
                        Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán qua ứng dụng ngân hàng.
                    </p>
                </div>

                <Link href="/cart" className="w-full bg-zinc-900 text-white py-3.5 rounded-xl hover:bg-zinc-800 transition block font-bold shadow-lg">
                    Quay lại giỏ hàng thử lại
                </Link>
            </div>
        </div>
    );
}