import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { columns, ProductAdminType } from "./columns";
import { DataTable } from "./data-table";
import CreateProductSheet from "./CreateProductSheet";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getData = async (): Promise<ProductAdminType[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return [];
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch (error) {
    logger.error("Error fetching products:", error);
    return [];
  }
};

const ProductPage = async () => {
  const data = await getData();
  return (
    <div className="space-y-6">
      <div className="mb-8 px-6 py-4 bg-white border shadow-sm rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản Phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả mặt hàng đang bán</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100">
            Tổng: {data.length} SP
          </span>
          <CreateProductSheet />
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-1">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default ProductPage;