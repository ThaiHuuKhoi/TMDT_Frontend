import { Check, Truck, Package, CreditCard, XCircle, Clock } from "lucide-react";

// Khớp hoàn toàn với Enum OrderStatus ở Backend
const steps = [
    { status: "PENDING", label: "Chờ thanh toán", icon: CreditCard },
    { status: "PROCESSING", label: "Đang xử lý", icon: Clock },
    { status: "SHIPPED", label: "Đang vận chuyển", icon: Truck },
    { status: "COMPLETED", label: "Hoàn thành", icon: Package },
];

const OrderTracker = ({ currentStatus }: { currentStatus: string }) => {
    // Xử lý riêng giao diện cho đơn hàng ĐÃ HỦY
    if (currentStatus === "CANCELLED") {
        return (
            <div className="w-full py-6 flex flex-col items-center justify-center text-red-500">
                <XCircle size={40} className="mb-2" />
                <span className="font-semibold text-lg">Đơn hàng đã bị hủy</span>
                <p className="text-sm text-gray-500 mt-1">Vui lòng liên hệ CSKH nếu bạn cần hỗ trợ thêm.</p>
            </div>
        );
    }

    // Map trạng thái từ Backend ra Index của thanh tiến trình
    let activeIndex = 0;
    if (currentStatus === "COMPLETED") activeIndex = 3;
    else if (currentStatus === "SHIPPED") activeIndex = 2;
    else if (currentStatus === "PROCESSING") activeIndex = 1;
    else if (currentStatus === "PENDING") activeIndex = 0;

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Đường kẻ nền */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

                {/* Đường kẻ tiến độ (Màu đen/xanh tùy theme) */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-black -z-10 transition-all duration-500"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.status} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                    ? "bg-black border-black text-white"
                                    : "bg-white border-gray-300 text-gray-400"
                                    } ${isCurrent ? "ring-4 ring-gray-200 scale-110" : ""}`}
                            >
                                <Icon size={18} />
                            </div>
                            <span
                                className={`text-xs font-medium mt-2 ${isActive ? "text-black" : "text-gray-400"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracker;