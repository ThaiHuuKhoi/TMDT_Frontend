import { ReactNode } from "react";
import { INFO_PAGES } from "@/constants/infoPages";

export interface DynamicConfig {
  hotline: string;
  email: string;
  shippingFee: number;
}

export interface InfoLink {
  title: string;
  slug: string;
  content: ReactNode | ((cfg: DynamicConfig) => ReactNode);
}

export interface InfoSection {
  category: string;
  links: InfoLink[];
}

export const infoSections: InfoSection[] = INFO_PAGES;

export function findInfoPageBySlug(slug: string) {
  for (const section of infoSections) {
    const found = section.links.find((link) => link.slug === slug);
    if (found) {
      return found;
    }
  }
  return null;
}

export function getAllInfoSlugs() {
  const slugs: { slug: string }[] = [];
  infoSections.forEach((section) => {
    section.links.forEach((link) => slugs.push({ slug: link.slug }));
  });
  return slugs;
}

