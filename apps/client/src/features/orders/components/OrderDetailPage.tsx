'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, Calendar, Package, RefreshCw } from 'lucide-react';
import api from '@/lib/api/client';
import OrderTracker from '@/components/OrderTracker';
import ShippingTimeline, { ShippingLog } from '@/components/ShippingTimeline';

interface OrderDetail {
  id: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  stripeSessionId?: string | null;
  items: {
    productId: number;
    productName: string;
    sku: string;
    variantInfo: string;
    quantity: number;
    priceAtPurchase: number;
    productImage: string;
  }[];
  shippingLogs: ShippingLog[];
}


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);

    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Không tìm thấy thông tin đơn hàng này.');
    } finally {
      setLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-black w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 flex flex-col items-center gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Link href="/orders" className="text-blue-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const isOrderFinalized = order.status === 'COMPLETED' || order.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="p-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Chi tiết đơn hàng</h1>
            <p className="text-gray-400 font-mono text-sm">
              ORDER_ID: #{String(order.id).padStart(6, '0')}
            </p>
          </div>
        </div>

        {!isOrderFinalized && (
          <button
            onClick={() => fetchOrder(true)}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin text-black' : 'text-gray-500'}
            />
            {isRefreshing ? 'Đang cập nhật...' : 'Làm mới trạng thái'}
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 mb-8 shadow-sm">
        <OrderTracker currentStatus={order.status} />
      </div>

      {order.shippingLogs?.length ? (
        <div className="mb-8">
          <ShippingTimeline logs={order.shippingLogs} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
              <Package size={20} className="text-gray-400" />
              <h2 className="font-bold text-lg">Kiện hàng của bạn</h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item, index) => {
                const mainImage = item.productImage || '/product-placeholder.png';

                return (
                  <div key={index} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                    <div className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-50 flex-shrink-0">
                      <Image
                        src={mainImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.srcset = '';
                          e.currentTarget.src = '/product-placeholder.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{item.productName}</h3>
                      <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                        {item.variantInfo || `SKU: ${item.sku}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Số lượng:{' '}
                        <span className="font-bold text-black">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="font-black text-lg text-gray-900">
                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                        Đơn giá: {formatCurrency(item.priceAtPurchase)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black text-white p-6 rounded-2xl shadow-xl">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <CreditCard size={18} />
              Tổng thanh toán
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.totalAmount - (order.shippingFee ?? 0) + (order.discountAmount ?? 0))}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Phí vận chuyển</span>
                {(order.shippingFee ?? 0) === 0
                  ? <span className="text-green-400">Miễn phí</span>
                  : <span>{formatCurrency(order.shippingFee)}</span>
                }
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Giảm giá</span>
                  <span className="text-green-400">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between font-black text-xl">
                <span>Tổng cộng</span>
                <span className="text-yellow-400">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              Thông tin vận chuyển
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter mb-1">
                  Ngày đặt hàng
                </p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter mb-1">
                  Địa chỉ giao hàng
                </p>
                <p className="font-medium text-gray-700 leading-relaxed italic">
                  "{order.shippingAddress || 'Tại quầy / Địa chỉ mặc định'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

