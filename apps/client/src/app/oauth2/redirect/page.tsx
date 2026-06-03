'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { Loader2 } from 'lucide-react';

function getApiRoot(): string {
    return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api')
        .trim()
        .replace(/\/$/, '');
}

export default function OAuth2Redirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuthStore();
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        void (async () => {
            const error = searchParams.get('error');
            const oauth = searchParams.get('oauth');

            if (oauth === 'success') {
                try {
                    const root = getApiRoot();
                    const rr = await fetch(`${root}/auth/refresh-token`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                    if (!rr.ok) {
                        throw new Error('refresh failed');
                    }
                    const d = (await rr.json()) as {
                        accessToken?: string;
                        refreshToken?: string;
                    };
                    if (!d.accessToken) {
                        throw new Error('no access token');
                    }
                    await fetch('/api/auth/session', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            accessToken: d.accessToken,
                            refreshToken: d.refreshToken,
                        }),
                    });
                    await login();
                    router.replace('/');
                    return;
                } catch {
                    router.replace('/login?error=oauth_failed');
                    return;
                }
            }

            if (error === 'account_disabled') {
                router.replace('/login?error=account_disabled');
            } else {
                console.error('OAuth Error:', error || 'Đăng nhập OAuth thất bại');
                router.replace('/login?error=oauth_failed');
            }
        })();
    }, [login, router, searchParams]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
            <p className="text-gray-600 font-medium text-lg animate-pulse">
                Đang hoàn tất đăng nhập...
            </p>
        </div>
    );
}
