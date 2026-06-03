"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
}

const Pagination = ({ currentPage, totalPages, hasNext }: PaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const pages: (number | "...")[] = [0];
    if (currentPage > 2) pages.push("...");
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 py-10">
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Trang trước"
        className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-zinc-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => navigate(p as number)}
            aria-label={`Trang ${(p as number) + 1}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
              p === currentPage
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 hover:bg-zinc-100 text-zinc-700"
            }`}
          >
            {(p as number) + 1}
          </button>
        )
      )}

      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Trang tiếp"
        className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
