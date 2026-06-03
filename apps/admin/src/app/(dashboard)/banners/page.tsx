import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddBanner from "@/components/AddBanner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getData = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return { data: [], totalCount: 0 };

    try {
        const res = await fetch(`${BASE_URL}/banners/admin/all`, { // Thay bằng endpoint thật của bạn
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return { data: [], totalCount: 0 };

        const data = await res.json();
        const bannerList = Array.isArray(data) ? data : (data.items || []);
        const total = data.totalItems || bannerList.length;

        return { data: bannerList, totalCount: total };
    } catch (err) {
        logger.error("Lỗi fetch banners:", err);
        return { data: [], totalCount: 0 };
    }
};

const BannersPage = async () => {
    const res = await getData();

    return (
        <div className="space-y-6">
            <div className="mb-8 px-6 py-4 bg-white border shadow-sm rounded-lg flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Banner</h1>
                    <p className="text-sm text-gray-500 mt-1">Điều hướng người dùng và chiến dịch Marketing</p>
                </div>
                    <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100 shadow-sm">
                        Tổng số: {res.totalCount}
                    </span>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Tạo Banner
                            </Button>
                        </SheetTrigger>
                        <AddBanner />
                    </Sheet>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-1">
                <DataTable columns={columns} data={res.data} />
            </div>
        </div>
    );
};

export default BannersPage;