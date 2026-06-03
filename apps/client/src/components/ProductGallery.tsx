"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductImage {
    id: number;
    url: string;
    isMain: boolean;
    variantId: number | null;
}

export default function ProductGallery({
    images,
    selectedVariantImage,
    productName
}: {
    images: ProductImage[],
    selectedVariantImage: string,
    productName: string
}) {
    const [mainImage, setMainImage] = useState(selectedVariantImage);

    useEffect(() => {
        setMainImage(selectedVariantImage);
    }, [selectedVariantImage]);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-zinc-100 shadow-sm group">
                <Image
                    src={mainImage}
                    alt={productName}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {images.map((img) => (
                        <button
                            key={img.id}
                            onClick={() => setMainImage(img.url)}
                            className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${mainImage === img.url
                                    ? "border-red-600 shadow-sm"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            <Image src={img.url} alt="thumbnail" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}