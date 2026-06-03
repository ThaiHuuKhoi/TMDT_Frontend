import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatbotWidgetLoader from "@/components/ChatbotWidgetLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shopkcg.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KCG Shop - Mua sắm tiện lợi, hàng chính hãng",
    template: "%s | KCG Shop",
  },
  description:
    "KCG Shop - Siêu thị mini trực tuyến với đầy đủ thực phẩm, đồ gia dụng, hàng tiêu dùng. Giao hỏa tốc 2H nội thành, miễn phí vận chuyển từ 300.000đ.",
  openGraph: {
    siteName: "KCG Shop",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
  },
};

async function getLogoUrl(): Promise<string> {
  try {
    const res = await fetch(`${getPublicApiBaseUrl()}/store/config`, { next: { revalidate: 300 } });
    if (!res.ok) return "";
    const data = await res.json();
    return data.logoUrl || "";
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = await getLogoUrl();

  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="mx-auto p-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-[1920px]">

          <Navbar logoUrl={logoUrl} />

          {/* Phần nội dung thay đổi giữa các trang */}
          <main className="min-h-[80vh]">
            {children}
          </main>

          <Footer />
        </div>

        <ChatbotWidgetLoader />

        {/* Thông báo nổi (Toast) */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}