"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Kiểu dữ liệu Banner
interface Banner {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
    displayOrder: number;
}

const Slider = ({ banners }: { banners: Banner[] }) => {
    const [current, setCurrent] = useState(0);

    // Tự động chuyển slide sau 5s
    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    // Nếu chưa có banner nào -> Hiển thị Placeholder mặc định
    if (!banners || banners.length === 0) {
        return (
            <div className="h-[30vh] md:h-[30vh] overflow-hidden bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-400">Chưa có banner quảng cáo</p>
            </div>
        );
    }

    return (
        <div className="h-[30vh] md:h-[30vh] overflow-hidden relative group">
            <div
                className="w-max h-full flex transition-all ease-in-out duration-1000"
                style={{ transform: `translateX(-${current * 100}vw)` }}
            >
                {banners.map((banner, index) => (
                    <div
                        className="w-screen h-full flex flex-col gap-16 xl:flex-row bg-gray-50"
                        key={banner.id}
                    >
                        {/* TEXT CONTAINER */}
                        <div className="h-1/2 xl:w-1/2 xl:h-full flex flex-col items-center justify-center gap-8 2xl:gap-12 text-center">
                            <h2 className="text-xl lg:text-3xl 2xl:text-5xl">
                                {banner.description}
                            </h2>
                            <h1 className="text-5xl lg:text-7xl 2xl:text-8xl font-bold tracking-wide text-gray-900">
                                {banner.title}
                            </h1>
                            <Link href={banner.targetUrl || "/products"}>
                                <button className="rounded-md bg-black text-white py-3 px-8 hover:bg-gray-800 transition shadow-lg">
                                    SHOP NOW
                                </button>
                            </Link>
                        </div>

                        {/* IMAGE CONTAINER */}
                        <div className="h-1/2 xl:w-1/2 xl:h-full relative">
                            <Image
                                src={banner.imageUrl}
                                alt={banner.title}
                                fill
                                sizes="(max-width: 1280px) 100vw, 50vw"
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* INDICATORS (Dấu chấm tròn) */}
            <div className="absolute left-1/2 bottom-8 flex gap-4 -translate-x-1/2">
                {banners.map((_, index) => (
                    <div
                        className={`w-3 h-3 rounded-full ring-1 ring-gray-600 cursor-pointer flex items-center justify-center ${current === index ? "scale-150" : ""
                            }`}
                        key={index}
                        onClick={() => setCurrent(index)}
                    >
                        {current === index && (
                            <div className="w-[6px] h-[6px] bg-gray-600 rounded-full"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slider;