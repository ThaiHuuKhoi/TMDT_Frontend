import type { MetadataRoute } from "next";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";
import { getAllInfoSlugs } from "@/features/info-pages/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopkcg.com";

const PAGE_SIZE = 200;

type ProductItem = { id: number | string };
type ProductPage = { items?: ProductItem[]; totalPages?: number };

async function fetchAllProducts(): Promise<ProductItem[]> {
  const base = getPublicApiBaseUrl();
  const all: ProductItem[] = [];

  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await fetch(
      `${base}/products?page=${page}&size=${PAGE_SIZE}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) break;

    const data: ProductPage = await res.json();
    if (!Array.isArray(data.items) || data.items.length === 0) break;

    all.push(...data.items);
    totalPages = data.totalPages ?? 1;
    page++;
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const infoRoutes: MetadataRoute.Sitemap = getAllInfoSlugs().map(({ slug }) => ({
    url: `${SITE_URL}/thong-tin/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchAllProducts();
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // sitemap vẫn hoạt động nếu API lỗi
  }

  return [...staticRoutes, ...infoRoutes, ...productRoutes];
}
