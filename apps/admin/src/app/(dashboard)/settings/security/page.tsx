"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import api from "@/utils/axiosConfig";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SecuritySettingsPage() {
    const queryClient = useQueryClient();
    const [otpEnabled, setOtpEnabled] = useState(true);

    const { data, isLoading } = useQuery({
        queryKey: ["feature-flags"],
        queryFn: async () => (await api.get("/admin/feature-flags")).data as { otpRegistration: boolean },
    });

    useEffect(() => {
        if (data) setOtpEnabled(data.otpRegistration);
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (enabled: boolean) =>
            (await api.put("/admin/feature-flags", { otpRegistration: enabled })).data,
        onSuccess: (result) => {
            setOtpEnabled(result.otpRegistration);
            toast.success("Đã lưu cài đặt bảo mật!");
            queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
        },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lưu thất bại"),
    });

    if (isLoading) return <Loader2 className="animate-spin w-8 h-8 text-zinc-400 mx-auto mt-16" />;

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">Bảo mật</h1>

            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-zinc-900 text-sm">Xác thực OTP khi đăng ký</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Khi bật, người dùng phải xác nhận email qua mã OTP trước khi hoàn tất đăng ký.
                            Tắt tùy chọn này nếu dịch vụ gửi email đang gặp sự cố.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-8">
                    <Checkbox
                        id="otp-toggle"
                        checked={otpEnabled}
                        onCheckedChange={(checked) => setOtpEnabled(checked === true)}
                    />
                    <Label htmlFor="otp-toggle" className="cursor-pointer select-none">
                        {otpEnabled ? "Đang bật — yêu cầu xác thực OTP" : "Đang tắt — đăng ký không cần OTP"}
                    </Label>
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-100">
                    <Button
                        onClick={() => mutation.mutate(otpEnabled)}
                        disabled={mutation.isPending}
                        className="flex items-center gap-2"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                        Lưu
                    </Button>
                </div>
            </div>
        </div>
    );
}
