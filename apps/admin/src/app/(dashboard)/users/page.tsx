import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getData = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return { data: [], totalCount: 0 };

  try {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // Đảm bảo luôn lấy dữ liệu mới nhất khi load trang
    });

    if (!res.ok) {
      logger.error("Failed to fetch users, status:", res.status);
      return { data: [], totalCount: 0 };
    }

    const data = await res.json();

    const usersList = Array.isArray(data) ? data : (data.items || []);
    const total = data.totalItems || usersList.length;

    return { data: usersList, totalCount: total };
  } catch (err) {
    logger.error("Lỗi khi gọi API Users:", err);
    return { data: [], totalCount: 0 };
  }
};

const UsersPage = async () => {
  const res = await getData();

  return (
    <div className="space-y-6">
      <div className="mb-8 px-6 py-4 bg-white border shadow-sm rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tài khoản trên hệ thống</p>
        </div>
        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100 shadow-sm">
          Tổng số: {res.totalCount}
        </span>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-1">
        <DataTable columns={columns} data={res.data} />
      </div>
    </div>
  );
};

export default UsersPage;