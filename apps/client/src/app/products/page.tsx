import type { Metadata } from "next";
import ProductsPage from "@/features/products/components/ProductsPage";

type SearchParams = Promise<{ category?: string; sort?: string; search?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category, search } = await searchParams;

  if (search) {
    return {
      title: `Tìm kiếm: ${search}`,
      description: `Kết quả tìm kiếm cho "${search}" tại KCG Shop.`,
      robots: { index: false, follow: true },
    };
  }

  if (category && category !== "all") {
    const name = category.replace(/-/g, " ");
    return {
      title: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
      description: `Mua ${name} chính hãng, giá tốt tại KCG Shop. Giao hỏa tốc 2H, đổi trả 30 ngày.`,
      alternates: { canonical: `/products?category=${category}` },
      openGraph: {
        title: `${name.charAt(0).toUpperCase() + name.slice(1)} | KCG Shop`,
        url: `/products?category=${category}`,
        type: "website",
      },
    };
  }

  return {
    title: "Tất cả sản phẩm",
    description:
      "Khám phá hàng nghìn sản phẩm thực phẩm, đồ gia dụng, hàng tiêu dùng chính hãng tại KCG Shop.",
    alternates: { canonical: "/products" },
    openGraph: {
      title: "Tất cả sản phẩm | KCG Shop",
      url: "/products",
      type: "website",
    },
  };
}

export default ProductsPage;
