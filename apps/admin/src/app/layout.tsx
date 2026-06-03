import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Guard runtime Node bị inject localStorage không hợp lệ (thiếu getItem),
// tránh crash SSR trong chế độ dev.
if (typeof window === "undefined") {
  const maybeStorage = (globalThis as { localStorage?: unknown }).localStorage as
    | { getItem?: unknown }
    | undefined;
  if (maybeStorage && typeof maybeStorage.getItem !== "function") {
    try {
      Reflect.deleteProperty(globalThis, "localStorage");
    } catch {
      (globalThis as any).localStorage = undefined;
    }
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trang quản trị TMĐT",
  description: "Hệ thống quản trị thương mại điện tử",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            {/* Component hiển thị thông báo (Toast) */}
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
              theme="colored"
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}