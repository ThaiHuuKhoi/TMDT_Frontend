"use client";

import { useEffect, useState } from "react";
import { ShoppingBasket, Tag } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";
import { CategoryType } from "@repo/types";

const Categories = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    const fetchCats = async () => {
      try {
        // Không dùng axios client (có Bearer): token lỗi/hết hạn vẫn phải đọc được danh mục public.
        const res = await fetch(`${getPublicApiBaseUrl()}/categories`, {
          cache: "no-store",
        });
        const raw = await res.text();
        if (!res.ok) {
          console.error(
            "Lỗi tải danh mục:",
            res.status,
            res.statusText || "(no status text)",
            raw?.slice(0, 500) || "(empty body)"
          );
          return;
        }
        let data: unknown;
        try {
          data = raw ? JSON.parse(raw) : [];
        } catch {
          console.error("Danh mục: phản hồi không phải JSON:", raw?.slice(0, 200));
          return;
        }
        if (Array.isArray(data)) setCategories(data as CategoryType[]);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCats();
  }, []);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full overflow-x-auto pb-2 mb-4 scrollbar-hide">
      <div className="flex gap-3 px-1">
        {/* Nút All mặc định */}
        <button
          onClick={() => handleCategoryChange("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${!selectedCategory ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200"
            }`}
        >
          <ShoppingBasket className="w-4 h-4" /> All
        </button>

        {/* Danh sách từ Backend */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedCategory === cat.slug ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200"
              }`}
          >
            <Tag className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;