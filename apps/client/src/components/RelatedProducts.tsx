"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@repo/types";
import { getVariantPricing } from "@/lib/pricing";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";

const RelatedProducts = ({ currentProductId }: { currentProductId: string }) => {
    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await fetch(
                    `${getPublicApiBaseUrl()}/products/${currentProductId}/related`
                );
                const data = await res.json();
                if (Array.isArray(data)) setProducts(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRelated();
    }, [currentProductId]);

    if (products.length === 0) return null;

    return (
        <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">Các sản phẩm tương tự</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {products.map((product) => {
                    // 1. Lấy ảnh chính an toàn
                    const mainImage = product.images?.find(img => img.isMain)?.url
                        || product.images?.[0]?.url
                        || "/product-placeholder.png";

                    const v0 = product.variants?.[0];
                    const price =
                      v0 != null ? getVariantPricing(v0).displayPrice : 0;

                    return (
                        <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col gap-4">
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                                <Image src={mainImage} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    {/* BẢN VÁ: Format VNĐ chuẩn xác */}
                                    <span className="font-semibold">{price.toLocaleString('vi-VN')} ₫</span>
                                    <span className="text-xs text-gray-500">{product.variants?.length || 0} Tùy chọn</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default RelatedProducts;