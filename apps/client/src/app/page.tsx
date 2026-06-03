import type { Metadata } from "next";
import ProductList from "@/components/ProductList";
import Slider from "@/components/Slider";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";
import { Suspense } from "react";
import PopupBanner from "@/components/PopupBanner";

export const metadata: Metadata = {
  title: "KCG Shop - Mua sắm tiện lợi, hàng chính hãng",
  description:
    "KCG Shop - Siêu thị mini trực tuyến với đầy đủ thực phẩm, đồ gia dụng, hàng tiêu dùng. Giao hỏa tốc 2H nội thành, miễn phí vận chuyển từ 300.000đ.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "KCG Shop - Mua sắm tiện lợi, hàng chính hãng",
    description:
      "Siêu thị mini trực tuyến với đầy đủ thực phẩm, đồ gia dụng, hàng tiêu dùng chính hãng.",
    url: "/",
    type: "website",
  },
};

const getBanners = async () => {
  try {
    const res = await fetch(
      `${getPublicApiBaseUrl()}/banners`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to fetch banners:",
        res.status,
        res.statusText
      );
      return [];
    }

    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

const Homepage = async ({ searchParams }: { searchParams: Promise<{ category: string }> }) => {
  const category = (await searchParams).category;
  const banners = await getBanners();

  const randomIndex = Math.floor(Math.random() * banners.length);

  // 2. Lấy banner ở vị trí ngẫu nhiên đó
  const popupBannerData = banners.length > 0 ? banners[randomIndex] : null;

  return (
    <div className="">
      {/* Gọi PopupBanner ở đây. Nó dùng z-index và fixed position nên đặt ở đâu trong code cũng được */}
      <PopupBanner banner={popupBannerData} />

      <Slider banners={banners} />

      <div className="mt-8 md:mt-12 px-4 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <h1 className="text-2xl font-bold mb-8">Sản phẩm nổi bật</h1>
        <Suspense fallback={
          <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 animate-pulse">Đang tải sản phẩm...</p>
          </div>
        }>
          <ProductList category={category} params="homepage" />
        </Suspense>
      </div>
    </div>
  );
};

export default Homepage;