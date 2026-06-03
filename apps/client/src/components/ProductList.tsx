import { Suspense } from "react";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";
import Pagination from "./Pagination";
import { PackageX, ArrowRight } from "lucide-react";
import { fetchProducts } from "@/features/products/api";

interface FetchProps {
  category?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  params: "homepage" | "products";
}

const ProductList = async (props: FetchProps) => {
  const currentPage = props.page ?? 0;
  const result = await fetchProducts({
    category: props.category,
    sort: props.sort,
    search: props.search,
    minPrice: props.minPrice,
    maxPrice: props.maxPrice,
    page: currentPage,
    size: props.params === "homepage" ? 8 : 20,
  });

  const { items: products, totalPages, hasNext, totalItems } = result;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 space-y-12 py-8">

      {/* HEADER: Categories & Filter */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">
              {props.params === "homepage" ? "Bộ sưu tập mới" : "Tất cả sản phẩm"}
            </h2>
            <p className="text-zinc-500 text-sm">
              Tìm thấy {totalItems > 0 ? totalItems : products.length} sản phẩm phù hợp
            </p>
          </div>

          {props.params === "products" && (
            <div className="flex items-center gap-3">
              <Filter />
            </div>
          )}
        </div>

        <Categories />
      </div>

      {/* PRODUCT GRID */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 text-zinc-500 transition-all">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <PackageX className="w-12 h-12 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Không có sản phẩm nào</h3>
          <p className="text-sm mt-1 max-w-[250px] text-center">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.
          </p>
        </div>
      )}

      {/* PAGINATION — chỉ hiển thị trên trang products */}
      {props.params === "products" && (
        <Suspense>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
          />
        </Suspense>
      )}

      {/* VIEW ALL — chỉ hiển thị trên homepage */}
      {props.params === "homepage" && products.length > 0 && (
        <div className="flex justify-center pt-8">
          <Link
            href={
              props.category && props.category !== "all"
                ? `/products?category=${props.category}`
                : "/products"
            }
            className="group flex items-center gap-2 bg-zinc-900 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductList;
