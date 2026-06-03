import type { Metadata } from "next";
import LoginForm from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <LoginForm />
        </div>
    );
}