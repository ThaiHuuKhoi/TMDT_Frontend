"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type PopupBannerType from "@/components/PopupBanner";

const PopupBanner = dynamic(() => import("@/components/PopupBanner"), { ssr: false });

export default function PopupBannerLoader(props: ComponentProps<typeof PopupBannerType>) {
  return <PopupBanner {...props} />;
}
