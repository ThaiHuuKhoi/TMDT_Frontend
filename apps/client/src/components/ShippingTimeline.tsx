"use client";

import { Truck } from "lucide-react";

export interface ShippingLog {
    status: string;
    message: string;
    reportedAt: string | null;
    createdAt: string;
}

const ShippingTimeline = ({ logs }: { logs: ShippingLog[] }) => {
    // Nếu chưa có lịch sử vận chuyển thì không hiển thị khối này
    if (!logs || logs.length === 0) return null;

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Truck size={20} className="text-gray-400" />
                Chi tiết hành trình
            </h2>

            {/* Vùng chứa timeline với đường kẻ dọc bên trái */}
            <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-8 my-2">
                {logs.map((log, index) => {
                    const isLatest = index === 0;
                    const displayTime = log.reportedAt || log.createdAt;

                    return (
                        <div key={index} className="relative pl-6 md:pl-8">
                            {/* Dấu chấm tròn (Dot) */}
                            <div
                                className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center
                                    ${isLatest
                                        ? "border-black ring-4 ring-gray-100" // Mới nhất: Viền đen, có vòng sáng
                                        : "border-gray-300"                   // Cũ: Viền xám
                                    }
                                `}
                            >
                                {/* Chấm đen nhỏ ở giữa cho trạng thái mới nhất */}
                                {isLatest && <div className="h-1.5 w-1.5 bg-black rounded-full" />}
                            </div>

                            {/* Nội dung trạng thái */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                                <p className={`text-sm md:text-base ${isLatest ? "font-bold text-black" : "font-medium text-gray-500"}`}>
                                    {log.message}
                                </p>
                                <span className={`text-xs font-mono whitespace-nowrap ${isLatest ? "text-gray-500 font-semibold" : "text-gray-400"}`}>
                                    {displayTime ? new Date(displayTime).toLocaleString('vi-VN', {
                                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                                    }) : ''}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShippingTimeline;