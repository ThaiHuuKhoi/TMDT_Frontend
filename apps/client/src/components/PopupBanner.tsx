"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
}

const PopupBanner = ({ banner }: { banner: Banner | null }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Nếu không có banner thì không làm gì cả
        if (!banner) return;

        // Kiểm tra xem người dùng đã từng tắt popup này trong phiên truy cập này chưa
        const hasClosed = sessionStorage.getItem(`closed_popup_${banner.id}`);

        if (!hasClosed) {
            // Delay khoảng 1.5 giây sau khi vào web thì mới hiện lên cho đỡ "dội"
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [banner]);

    const handleClose = () => {
        setIsVisible(false);
        // Lưu vào sessionStorage để lần sau load lại trang không hiện nữa
        if (banner) {
            sessionStorage.setItem(`closed_popup_${banner.id}`, "true");
        }
    };

    // Nếu isVisible = false hoặc không có banner thì không render HTML gì cả
    if (!isVisible || !banner) return null;

    return (
        // Lớp phủ (Overlay) màu đen mờ, z-[9999] để luôn nằm trên cùng
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 transition-opacity">

            {/* Hộp thoại Popup */}
            <div className="relative w-[90vw] max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">

                {/* Nút X để tắt - Bắt buộc người dùng bấm vào đây mới tắt */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Nội dung quảng cáo (Bấm vào thì chuyển link và tự động đóng popup) */}
                <Link href={banner.targetUrl || "/products"} onClick={handleClose}>
                    <div className="relative w-full aspect-square sm:aspect-video">
                        <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 90vw, 500px"
                        />
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{banner.title}</h2>
                        <p className="text-gray-600 mb-5">{banner.description}</p>
                        <span className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-md">
                            XEM NGAY
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PopupBanner;