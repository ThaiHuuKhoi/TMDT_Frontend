'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/logger';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Import Shadcn Button
import { Input } from '@/components/ui/input';   // Import Shadcn Input
import { Label } from '@/components/ui/label';   // Import Shadcn Label

export default function AdminLoginPage() {
    const { hydrateFromServer } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const backendOrigin =
        process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
        (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8080/api')
            .replace(/\/?api\/?$/, '');
    const adminOAuthRedirectUri =
        process.env.NEXT_PUBLIC_ADMIN_OAUTH_REDIRECT_URI || "http://localhost:3003/oauth2/redirect";
    const GOOGLE_LOGIN_URL = `${backendOrigin}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(adminOAuthRedirectUri)}`;

    const handleLocalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = (data as { message?: string }).message || 'Sai email hoặc mật khẩu!';
                toast.error(msg);
                return;
            }

            await hydrateFromServer();
            toast.success("Đăng nhập quản trị viên thành công!");
            window.location.href = '/';

        } catch (err: unknown) {
            logger.error(err);
            toast.error('Sai email hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl border border-zinc-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-zinc-900 p-3 rounded-xl mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Portal</h2>
                    <p className="text-sm text-zinc-500 mt-2">Đăng nhập vào hệ thống quản trị</p>
                </div>

                <form onSubmit={handleLocalLogin} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email quản trị</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@trendlama.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-zinc-50 focus-visible:ring-zinc-900"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-zinc-50 focus-visible:ring-zinc-900"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-11 text-base font-medium rounded-xl"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Đăng nhập'}
                    </Button>
                </form>

                {/* --- DÒNG KẺ NGĂN CÁCH --- */}
                <div className="my-6 flex items-center justify-between">
                    <span className="border-b border-zinc-200 w-full"></span>
                    <span className="text-xs text-center text-zinc-400 uppercase px-4 font-medium">Hoặc</span>
                    <span className="border-b border-zinc-200 w-full"></span>
                </div>

                {/* --- LOGIN GOOGLE --- */}
                <div>
                    <a
                        href={GOOGLE_LOGIN_URL}
                        className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-zinc-200 rounded-xl shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all focus:outline-none"
                    >
                        <Image
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                        Đăng nhập bằng Google
                    </a>
                </div>
            </div>
        </div>
    );
}