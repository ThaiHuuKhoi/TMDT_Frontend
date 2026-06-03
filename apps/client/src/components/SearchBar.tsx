"use client";

import { Search, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import Link from "next/link";
import publicApi from "@/lib/api/publicClient";
import { getVariantPricing } from "@/lib/pricing";
import { ProductType } from "@repo/types";

const SearchBar = () => {
  const [value, setValue] = useState("");
  // 🔥 DEBOUNCE: Chờ người dùng dừng gõ 500ms mới lấy giá trị để gọi API
  const [debouncedValue] = useDebounce(value, 500);

  const [results, setResults] = useState<ProductType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. Lắng nghe thay đổi của debouncedValue để gọi API ngầm
  useEffect(() => {
    const fetchQuickResults = async () => {
      if (!debouncedValue.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const res = await publicApi.get('/products', {
          params: {
            search: debouncedValue,
            page: 0,
            size: 5,
          },
        });
        const items = res.data?.items;
        setResults(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Lỗi tìm kiếm nhanh:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchQuickResults();
  }, [debouncedValue]);

  // 2. Xử lý click ra ngoài để đóng Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Xử lý khi bấm Enter (Chuyển sang trang kết quả đầy đủ)
  const handleSearch = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!value.trim()) return;

    setShowDropdown(false); // Đóng dropdown
    const params = new URLSearchParams(searchParams);
    params.set("search", value);
    router.push(`/products?${params.toString()}`);
  };

  const clearSearch = () => {
    setValue("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      {/* KHUNG TÌM KIẾM */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 rounded-full ring-1 ring-gray-200 px-4 py-1.5 shadow-sm focus-within:ring-black transition-all bg-white relative z-50"
      >
        <Search className="w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm sản phẩm..."
          className="text-sm outline-0 w-40 lg:w-60 bg-transparent"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.trim().length > 0) setShowDropdown(true);
          }}
          onFocus={() => {
            if (value.trim().length > 0) setShowDropdown(true);
          }}
        />
        {value && (
          <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* HIỂN THỊ KẾT QUẢ QUICK SEARCH (DROPDOWN) */}
      {showDropdown && value.trim().length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-40 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {isSearching ? (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {/* Danh sách sản phẩm mini */}
              {results.map((product) => {
                const mainImage = product.images?.find(img => img.isMain)?.url
                  || product.images?.[0]?.url
                  || "/product-placeholder.png";

                const v0 = product.variants?.[0];
                const display =
                  v0 != null ? getVariantPricing(v0).displayPrice : 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image src={mainImage} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
                      <span className="text-xs font-semibold text-red-600">
                        {display.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </Link>
                );
              })}

              {/* Nút Xem tất cả kết quả */}
              <button
                onClick={handleSearch}
                className="p-3 text-center text-sm text-blue-600 font-medium hover:bg-gray-50 border-t border-gray-100 transition-colors"
              >
                Xem tất cả kết quả cho "{value}"
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              Không tìm thấy sản phẩm nào cho "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;