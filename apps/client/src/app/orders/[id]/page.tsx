import type { Metadata } from "next";
import OrderDetailPage from '@/features/orders/components/OrderDetailPage';

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
  robots: { index: false, follow: false },
};

export default function OrderDetailRoute() {
  return <OrderDetailPage />;
}