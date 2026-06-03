"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const Filter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const currentSort = searchParams.get("sort") || "default";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePriceFilter();
  };

  return (
    <div className="flex flex-col gap-3 my-6">
      <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
        <span>Sắp xếp:</span>
        <select
          name="sort"
          id="sort"
          className="ring-1 ring-gray-200 shadow-sm p-2 rounded-md bg-white focus:ring-black outline-none transition-all cursor-pointer"
          onChange={(e) => handleSort(e.target.value)}
          value={currentSort}
        >
          <option value="default">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="asc">Giá: Thấp đến Cao</option>
          <option value="desc">Giá: Cao đến Thấp</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 justify-end flex-wrap">
        <span>Khoảng giá:</span>
        <input
          type="number"
          placeholder="Từ (₫)"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          onKeyDown={handlePriceKeyDown}
          className="ring-1 ring-gray-200 shadow-sm p-2 rounded-md bg-white focus:ring-black outline-none w-28 text-zinc-900"
          min={0}
        />
        <span>–</span>
        <input
          type="number"
          placeholder="Đến (₫)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onKeyDown={handlePriceKeyDown}
          className="ring-1 ring-gray-200 shadow-sm p-2 rounded-md bg-white focus:ring-black outline-none w-28 text-zinc-900"
          min={0}
        />
        <button
          onClick={handlePriceFilter}
          className="px-4 py-2 bg-zinc-900 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default Filter;
