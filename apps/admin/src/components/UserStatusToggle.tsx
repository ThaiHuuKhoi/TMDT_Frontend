"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/utils/axiosConfig";

interface UserStatusToggleProps {
    userId: number;
    isActive: boolean;
    userName?: string;
}

const UserStatusToggle = ({ userId, isActive, userName }: UserStatusToggleProps) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        const action = isActive ? "khóa" : "kích hoạt";
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${userName || userId}"?`)) return;

        setLoading(true);
        try {
            await api.patch(`/users/${userId}/status`, { isActive: !isActive });
            toast.success(isActive ? "Đã khóa tài khoản!" : "Đã kích hoạt tài khoản!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className={isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isActive ? (
                <Lock className="mr-2 h-4 w-4" />
            ) : (
                <Unlock className="mr-2 h-4 w-4" />
            )}
            {loading ? "Đang xử lý..." : isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
        </Button>
    );
};

export default UserStatusToggle;
