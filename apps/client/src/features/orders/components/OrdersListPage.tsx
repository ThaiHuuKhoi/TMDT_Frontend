'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, Calendar, CreditCard, ChevronRight, ExternalLink } from 'lucide-react';
import api from '@/lib/api/client';
import { useAuthStore } from '@/features/auth/store';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  /** Tham chiếu thanh toán (VNPay: txn ref) — tên field theo backend OrderResponse */
  stripeSessionId?: string | null;
}

const getStatusConfig = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || 'PENDING';

  switch (normalizedStatus) {
    case 'COMPLETED':
    case 'SUCCESS':
    case 'PAID':
      return { label: 'Thành công', className: 'bg-green-100 text-green-700 border-green-200' };
    case 'SHIPPING':
    case 'DELIVERING':
      return { label: 'Đang giao', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'PENDING':
      return { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    case 'FAILED':
    case 'CANCELLED':
      return { label: 'Đã hủy/Lỗi', className: 'bg-red-100 text-red-700 border-red-200' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function OrdersListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/user-orders');

        if (Array.isArray(res.data)) {
          const sortedOrders = res.data.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sortedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline hover:text-black"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-500 mt-2">
            Hãy khám phá các sản phẩm mới nhất của chúng tôi.
          </p>
        </div>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-1"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
          Tổng: {orders.length} đơn
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const payRef = order.stripeSessionId?.trim();
          const displayId = payRef
            ? payRef.slice(-8).toUpperCase()
            : String(order.id).padStart(6, '0');

          return (
            <Link href={`/orders/${order.id}`} key={order.id} className="block group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center shadow-sm hover:shadow-md hover:border-black/20 transition-all duration-200 gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-black transition-colors" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      #{displayId}
                      <ExternalLink
                        size={14}
                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      {payRef ? "VNPay / Online" : "Đơn hàng"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <p className="font-bold text-xl text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <div className="p-2 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

