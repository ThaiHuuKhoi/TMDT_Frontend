import { logger } from "@/lib/logger";
import { columns, CategoryAdminType } from "./columns";
import { DataTable } from "./data-table";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddCategory from "@/components/AddCategory";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getData = async (): Promise<CategoryAdminType[]> => {
    try {
        const res = await fetch(`${BASE_URL}/categories`, { cache: "no-store" });
        if (!res.ok) return [];

        const data = await res.json();
        if (Array.isArray(data)) return data;
        return data?.items || [];
    } catch (error) {
        logger.error("Error fetching categories:", error);
        return [];
    }
};

const CategoriesPage = async () => {
    const data = await getData();

    return (
        <div className="space-y-6">
            <div className="mb-8 px-6 py-4 bg-white border shadow-sm rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh Mục</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng cộng có {data.length} danh mục sản phẩm</p>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm Danh Mục
                        </Button>
                    </SheetTrigger>
                    <AddCategory />
                </Sheet>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-1">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    );
};

export default CategoriesPage;