import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { columns, OrderType } from "./columns";
import { DataTable } from "./data-table";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getData = async (): Promise<OrderType[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(`${BASE_URL}/orders/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // Quan trọng: Đảm bảo khi có đơn hàng mới nó luôn lấy dữ liệu tươi nhất
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data?.items || [];
  } catch (err) {
    logger.error("Error fetching orders:", err);
    return [];
  }
};

const OrdersPage = async () => {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="mb-8 px-6 py-4 bg-white border shadow-sm rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống xử lý giao dịch quản trị viên</p>
        </div>
        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100">
          Tổng: {data.length}
        </span>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-1">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default OrdersPage;