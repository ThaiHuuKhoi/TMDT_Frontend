'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const err = searchParams.get('error');
        if (err === 'account_disabled') {
            setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
        } else if (err === 'oauth_failed') {
            setError('Đăng nhập bằng mạng xã hội thất bại. Vui lòng thử lại.');
        }
    }, [searchParams]);

    const oauthBaseUrl = process.env.NEXT_PUBLIC_OAUTH_BASE_URL || 'http://localhost:8080';
    const redirectUri =
        typeof window !== 'undefined'
            ? `${window.location.origin}/oauth2/redirect`
            : 'http://localhost:3002/oauth2/redirect';
    const GOOGLE_LOGIN_URL = `${oauthBaseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    const FACEBOOK_LOGIN_URL = `${oauthBaseUrl}/oauth2/authorization/facebook?redirect_uri=${encodeURIComponent(redirectUri)}`;

    const handleLocalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || 'Sai email hoặc mật khẩu!');
                return;
            }
            await login();
            router.push('/');
        } catch (err: unknown) {
            console.error(err);
            setError('Sai email hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng Nhập</h2>

            <form onSubmit={handleLocalLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                    <input
                        type="password"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="flex justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-red-600 hover:text-red-500 hover:underline"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
                <span className="border-b w-1/5 lg:w-1/4" />
                <span className="text-xs text-center text-gray-500 uppercase">Hoặc</span>
                <span className="border-b w-1/5 lg:w-1/4" />
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <a
                    href={GOOGLE_LOGIN_URL}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                >
                    <Image
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="h-5 w-5"
                        width={24}
                        height={24}
                    />
                    Đăng nhập bằng Google
                </a>

                <a
                    href={FACEBOOK_LOGIN_URL}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166FE5] focus:outline-none transition-colors"
                >
                    <Image
                        src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                        alt="Facebook"
                        className="h-5 w-5 filter brightness-0 invert"
                        width={24}
                        height={24}
                    />
                    Đăng nhập bằng Facebook
                </a>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="text-red-600 font-semibold hover:underline">
                    Đăng ký ngay
                </Link>
            </p>
        </div>
    );
}

