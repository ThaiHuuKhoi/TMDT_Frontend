import { ProductType } from '@repo/types';
import { getPublicApiBaseUrl } from '@/lib/api/publicBaseUrl';

interface FetchProductsParams {
  category?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Trang (0-based), mặc định 0 */
  page?: number;
  /** Kích thước trang; homepage thường dùng 8 */
  size?: number;
}

interface ProductPagePayload {
  items?: ProductType[];
  totalPages?: number;
  hasNext?: boolean;
  page?: number;
  totalItems?: number;
}

export interface ProductPageResult {
  items: ProductType[];
  totalPages: number;
  hasNext: boolean;
  page: number;
  totalItems: number;
}

export async function fetchProducts(params: FetchProductsParams): Promise<ProductPageResult> {
  try {
    const url = new URL(`${getPublicApiBaseUrl()}/products`);
    if (params.category && params.category !== 'all') {
      url.searchParams.append('category', params.category);
    }
    if (params.search) {
      url.searchParams.append('search', params.search);
    }
    if (params.sort) {
      url.searchParams.append('sort', params.sort);
    }
    if (params.minPrice !== undefined) {
      url.searchParams.append('minPrice', String(params.minPrice));
    }
    if (params.maxPrice !== undefined) {
      url.searchParams.append('maxPrice', String(params.maxPrice));
    }
    const page = params.page ?? 0;
    const size = params.size ?? 20;
    url.searchParams.append('page', String(page));
    url.searchParams.append('size', String(size));

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      return { items: [], totalPages: 0, hasNext: false, page: 0, totalItems: 0 };
    }
    const data: ProductPagePayload = await res.json();
    return {
      items: Array.isArray(data.items) ? data.items : [],
      totalPages: data.totalPages ?? 1,
      hasNext: data.hasNext ?? false,
      page: data.page ?? 0,
      totalItems: data.totalItems ?? 0,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { items: [], totalPages: 0, hasNext: false, page: 0, totalItems: 0 };
  }
}

export async function fetchProductById(id: string): Promise<ProductType | null> {
  try {
    const res = await fetch(`${getPublicApiBaseUrl()}/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching product ID ${id}:`, error);
    return null;
  }
}
