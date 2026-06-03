import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopkcg.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/profile",
          "/orders",
          "/cart",
          "/wishlist",
          "/payment/",
          "/oauth2/",
          "/return",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
