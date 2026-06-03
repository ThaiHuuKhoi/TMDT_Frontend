import { Suspense } from 'react';
import { LayoutGrid, SlidersHorizontal } from 'lucide-react';
import ProductList from '@/features/products/components/ProductList';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort;
  const search = params.search;
  const page = params.page ? Math.max(0, parseInt(params.page, 10)) : 0;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="px-4 md:px-8 pt-12 flex items-center justify-between text-zinc-400">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <LayoutGrid size={14} className="text-black" />
            <span>Grid View</span>
          </div>
          <div className="flex lg:hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-zinc-200 px-4 py-2 rounded-full">
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                Đang tải bộ sưu tập...
              </p>
            </div>
          }
        >
          <ProductList
            category={category}
            sort={sort}
            search={search}
            page={page}
            minPrice={minPrice}
            maxPrice={maxPrice}
            params="products"
          />
        </Suspense>
      </div>

      <div className="py-20 flex justify-center">
        <div className="w-24 h-1 bg-zinc-100 rounded-full" />
      </div>
    </main>
  );
}
