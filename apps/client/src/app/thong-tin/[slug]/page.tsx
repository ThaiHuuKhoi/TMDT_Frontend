import type { Metadata } from "next";
import InfoPage from "@/features/info-pages/components/InfoPage";
import { getAllInfoSlugs, findInfoPageBySlug } from "@/features/info-pages/config";

export async function generateStaticParams() {
  return getAllInfoSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findInfoPageBySlug(slug);
  if (!page) return { robots: { index: false } };
  return {
    title: page.title,
    description: `${page.title} - KCG Shop`,
    alternates: { canonical: `/thong-tin/${slug}` },
    openGraph: {
      title: `${page.title} | KCG Shop`,
      url: `/thong-tin/${slug}`,
      type: "website",
    },
  };
}

export default async function InfoRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <InfoPage slug={slug} />;
}
