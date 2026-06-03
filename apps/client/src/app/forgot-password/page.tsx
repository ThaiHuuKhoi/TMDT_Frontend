import type { Metadata } from "next";
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <ForgotPasswordForm />
        </div>
    );
}