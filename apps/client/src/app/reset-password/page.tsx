import type { Metadata } from "next";
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  robots: { index: false, follow: false },
};
import { Loader2 } from 'lucide-react';
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <Suspense
                    fallback={
                        <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    }
                >
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}