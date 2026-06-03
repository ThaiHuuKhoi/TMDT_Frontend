import type { Metadata } from "next";
import OrdersListPage from '@/features/orders/components/OrdersListPage';

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  robots: { index: false, follow: false },
};

export default function OrdersRoute() {
  return <OrdersListPage />;
}