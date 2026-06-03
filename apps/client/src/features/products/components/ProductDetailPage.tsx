import { cache } from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, CalendarCheck } from 'lucide-react';
import { ProductType } from '@repo/types';
import { getVariantPricing } from '@/lib/pricing';
import ProductGallery from '@/features/products/components/ProductGallery';
import ProductInteraction from '@/features/products/components/ProductInteraction';
import Reviews from '@/features/products/components/Reviews';
import RelatedProducts from '@/features/products/components/RelatedProducts';
import { fetchProductById } from '@/features/products/api';

const fetchProduct = cache(async (id: string): Promise<ProductType | null> => {
  return fetchProductById(id);
});

export async function generateProductMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: 'Sản phẩm không tồn tại', robots: { index: false } };

  const image =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    '/product-placeholder.png';

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      url: `/products/${id}`,
      type: 'website' as const,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: product.name,
      description: product.description ?? undefined,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const product = await fetchProduct(id);

  if (!product?.variants?.length) {
    return null;
  }

  const parsedAttributes = Object.values(
    product.variants.reduce((acc, variant) => {
      variant.attributeValues.forEach(({ attribute, value }) => {
        if (!acc[attribute.name]) {
          acc[attribute.name] = { name: attribute.name, values: new Set<string>() };
        }
        acc[attribute.name]!.values.add(value);
      });
      return acc;
    }, {} as Record<string, { name: string; values: Set<string> }>)
  ).map((attr) => ({ name: attr.name, values: Array.from(attr.values) }));

  const defaultVariant = product.variants[0]!;
  const selectedAttributes: Record<string, string> = {};
  parsedAttributes.forEach((attr) => {
    const paramVal = resolvedSearchParams[attr.name];
    const urlValue = Array.isArray(paramVal) ? paramVal[0] : paramVal;
    const defaultVal = defaultVariant.attributeValues.find(
      (v) => v.attribute.name === attr.name
    )?.value;
    selectedAttributes[attr.name] = urlValue || defaultVal || attr.values[0]!;
  });

  const currentVariant =
    product.variants.find((variant) =>
      variant.attributeValues.every(
        (attrVal) => selectedAttributes[attrVal.attribute.name] === attrVal.value
      )
    ) || defaultVariant;

  const imageUrl =
    product.images?.find((img) => img.variantId === currentVariant.id)?.url ||
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    '/product-placeholder.png';

  const vp = getVariantPricing(currentVariant);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image:
      product.images?.find((img) => img.isMain)?.url ||
      product.images?.[0]?.url,
    sku: currentVariant.sku,
    offers: {
      "@type": "Offer",
      price: vp.displayPrice,
      priceCurrency: "VND",
      availability:
        currentVariant.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopkcg.com"}/products/${product.id}`,
    },
    ...(product.averageRating != null && (product as any).reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating,
        ratingCount: (product as any).reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <main className="min-h-screen bg-zinc-50 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="bg-white border-b border-zinc-200 mb-4">
        <nav className="max-w-6xl mx-auto px-4 py-3 text-xs md:text-sm text-zinc-500 flex items-center gap-2">
          <Link href="/" className="hover:text-red-600">
            Trang chủ
          </Link>
          <span>›</span>
          <Link href="/products" className="hover:text-red-600">
            Bách hóa
          </Link>
          <span>›</span>
          <span className="text-zinc-900 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 lg:col-span-4">
              <ProductGallery
                images={product.images || []}
                selectedVariantImage={imageUrl}
                productName={product.name}
              />
            </div>

            <div className="md:col-span-7 lg:col-span-8 flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-zinc-900 leading-snug mb-2">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-4">
                <span>
                  SKU:{' '}
                  <span className="font-medium text-zinc-900">
                    {currentVariant.sku}
                  </span>
                </span>
                <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                <span>
                  Tình trạng:
                  <span
                    className={`ml-1 font-bold ${
                      currentVariant.stockQuantity === 0 ? 'text-red-500' : 'text-green-600'
                    }`}
                  >
                    {currentVariant.stockQuantity > 0 ? 'Còn hàng' : 'Tạm hết'}
                  </span>
                </span>
              </div>

              <div className="bg-zinc-50 rounded-lg p-4 mb-6 border border-zinc-100 flex flex-col gap-1">
                <div className="flex flex-wrap items-end gap-3">
                  {(vp.showOriginalStrike && vp.originalListPrice != null) ||
                  (vp.showCouponDeal && !vp.showOriginalStrike) ? (
                    <span className="text-lg text-zinc-400 line-through">
                      {(vp.showOriginalStrike && vp.originalListPrice != null
                        ? vp.originalListPrice
                        : vp.salePrice
                      ).toLocaleString('vi-VN')}
                      ₫
                    </span>
                  ) : null}
                  <span className="text-3xl font-bold text-red-600">
                    {vp.displayPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-sm text-zinc-500 mb-1">
                    / {selectedAttributes['Đơn vị'] || 'Sản phẩm'}
                  </span>
                </div>
                {vp.showCouponDeal && vp.bestPromo && (
                  <p className="text-sm text-emerald-700 font-medium">
                    Giá sau ưu đãi với mã {vp.bestPromo.code} (đơn 1 sản phẩm tại giá bán hiện tại)
                  </p>
                )}
              </div>

              <div className="mb-6">
                <ProductInteraction
                  product={product}
                  parsedAttributes={parsedAttributes}
                  selectedAttributes={selectedAttributes}
                  currentVariant={currentVariant as any}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 pt-6 border-t border-zinc-100">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-red-50 rounded-lg shrink-0">
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Giao hỏa tốc 2H</p>
                    <p className="text-xs text-zinc-500">Khu vực nội thành</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-green-50 rounded-lg shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">100% Chính hãng</p>
                    <p className="text-xs text-zinc-500">Hoàn tiền 111% nếu hàng giả</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Date luôn mới</p>
                    <p className="text-xs text-zinc-500">Kiểm tra kỹ trước khi giao</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-lg font-bold border-b border-zinc-100 pb-3 mb-4">
                Thông tin sản phẩm
              </h2>
              <div className="prose prose-sm max-w-none text-zinc-700">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6">
              <Reviews productId={product.id.toString()} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6 sticky top-4">
              <h2 className="text-lg font-bold border-b border-zinc-100 pb-3 mb-4">
                Thường được mua cùng
              </h2>
              <RelatedProducts currentProductId={product.id.toString()} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

