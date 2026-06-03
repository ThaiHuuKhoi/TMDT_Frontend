import type { Metadata } from "next";
import RegisterForm from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <RegisterForm />
        </div>
    );
}