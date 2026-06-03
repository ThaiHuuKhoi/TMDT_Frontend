import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddCoupon from "@/components/AddCoupon";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getData = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return { data: [], totalCount: 0 };

    try {
        const res = await fetch(`${BASE_URL}/coupons/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return { data: [], totalCount: 0 };

        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.items || []);
        const totalCount = Array.isArray(data) ? data.length : (data.totalItems ?? list.length);
        return { data: list, totalCount };
    } catch (err) {
        logger.error("Lỗi fetch coupons:", err);
        return { data: [], totalCount: 0 };
    }
};

const CouponsPage = async () => {
    const res = await getData();

    return (
        <div className="space-y-6">
            <div className="mb-8 px-6 py-4 bg-white border shadow-sm rounded-lg flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mã Giảm Giá</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý voucher và các chương trình khuyến mãi</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100 shadow-sm">
                        Tổng số: {res.totalCount}
                    </span>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Tạo Mã Giảm Giá
                            </Button>
                        </SheetTrigger>
                        <AddCoupon />
                    </Sheet>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-1">
                <DataTable columns={columns} data={res.data} />
            </div>
        </div>
    );
};

export default CouponsPage;