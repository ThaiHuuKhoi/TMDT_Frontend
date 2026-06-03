import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrderStatusActions from "./OrderStatusActions";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

type OrderDetail = {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress?: string;
  user?: { id: number; name: string; email: string };
  items?: Array<{
    productId: number;
    productName: string;
    sku?: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
};

const OrderDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return <div className="p-8 text-sm text-zinc-600">Chưa đăng nhập.</div>;
  }

  const res = await fetch(`${BASE_URL}/orders/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="space-y-4 p-8">
        <p className="text-sm text-red-600">Không tải được đơn hàng (mã {res.status}).</p>
        <Button variant="outline" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  const order = (await res.json()) as OrderDetail;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Danh sách đơn
        </Link>
      </Button>

      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Đơn #{order.id}</h1>
            <p className="text-sm text-zinc-600">
              {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}
            </p>
          </div>
          <Badge>{order.status}</Badge>
        </div>

        <div className="grid gap-2 text-sm text-zinc-700">
          <p>
            <span className="font-medium">Khách hàng:</span>{" "}
            {order.user ? `${order.user.name} (${order.user.email})` : "—"}
          </p>
          <p>
            <span className="font-medium">Địa chỉ giao:</span> {order.shippingAddress || "—"}
          </p>
          <p>
            <span className="font-medium">Tổng tiền:</span>{" "}
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
              Number(order.totalAmount || 0)
            )}
          </p>
        </div>
        <div className="pt-2 border-t">
          <p className="mb-2 text-sm font-medium text-zinc-700">Thao tác trạng thái</p>
          <OrderStatusActions orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Sản phẩm</h2>
        <div className="space-y-3">
          {order.items?.length ? (
            order.items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-zinc-500">SKU: {item.sku || "—"}</p>
                </div>
                <div className="text-right text-sm">
                  <p>x{item.quantity}</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      Number(item.priceAtPurchase || 0)
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">Không có dòng sản phẩm.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
