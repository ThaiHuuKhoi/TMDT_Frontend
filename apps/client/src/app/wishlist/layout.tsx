import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách yêu thích",
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
