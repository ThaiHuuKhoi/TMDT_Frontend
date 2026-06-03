import { notFound } from "next/navigation";
import { findInfoPageBySlug, DynamicConfig } from "@/features/info-pages/config";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";

async function getDynamicConfig(): Promise<DynamicConfig> {
  const defaults: DynamicConfig = { hotline: "1900 8888", email: "cskh@kcgshop.com", shippingFee: 20000 };
  try {
    const [storeRes, shippingRes] = await Promise.all([
      fetch(`${getPublicApiBaseUrl()}/store/config`, { next: { revalidate: 300 } }),
      fetch(`${getPublicApiBaseUrl()}/admin/shipping-config`, { next: { revalidate: 300 } }),
    ]);
    const store = storeRes.ok ? await storeRes.json() : {};
    const shipping = shippingRes.ok ? await shippingRes.json() : {};
    return {
      hotline: store.hotline || defaults.hotline,
      email: store.email || defaults.email,
      shippingFee: shipping.defaultFeeVnd ?? defaults.shippingFee,
    };
  } catch {
    return defaults;
  }
}

async function getCustomContent(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${getPublicApiBaseUrl()}/info-pages/${slug}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.contentHtml ?? null;
  } catch {
    return null;
  }
}

export default async function InfoPage({ slug }: { slug: string }) {
  const customHtml = await getCustomContent(slug);

  if (customHtml) {
    return (
      <article
        className="prose prose-zinc max-w-none prose-headings:font-bold prose-h2:text-red-600 prose-a:text-blue-600"
        dangerouslySetInnerHTML={{ __html: customHtml }}
      />
    );
  }

  // Fallback: nội dung hardcode
  const page = findInfoPageBySlug(slug);
  if (!page) notFound();

  const cfg = await getDynamicConfig();
  const content = typeof page.content === "function" ? page.content(cfg) : page.content;

  return (
    <article className="prose prose-zinc max-w-none prose-headings:font-bold prose-h2:text-red-600 prose-a:text-blue-600">
      {content}
    </article>
  );
}
