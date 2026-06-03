"use client";

import { useEffect, Suspense } from "react";
import { logger } from "@/lib/logger";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

function getApiRoot(): string {
    return (
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
        "http://localhost:8080/api"
    )
        .trim()
        .replace(/\/$/, "");
}

function OAuth2Handler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hydrateFromServer } = useAuthStore();

    useEffect(() => {
        void (async () => {
            const oauth = searchParams.get("oauth");
            const error = searchParams.get("error");

            if (oauth === "success") {
                try {
                    const root = getApiRoot();
                    const rr = await fetch(`${root}/auth/refresh-token`, {
                        method: "POST",
                        credentials: "include",
                    });
                    if (!rr.ok) {
                        throw new Error("refresh failed");
                    }
                    const d = (await rr.json()) as {
                        accessToken?: string;
                        refreshToken?: string;
                    };
                    if (!d.accessToken) {
                        throw new Error("no access token");
                    }
                    await fetch("/api/auth/session", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            accessToken: d.accessToken,
                            refreshToken: d.refreshToken,
                        }),
                    });
                    await hydrateFromServer();
                    router.replace("/");
                    return;
                } catch {
                    router.replace("/login?error=oauth_failed");
                    return;
                }
            }

            logger.error("Đăng nhập OAuth2 thất bại:", error);
            router.replace("/login?error=oauth_failed");
        })();
    }, [searchParams, router, hydrateFromServer]);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-gray-500 font-medium">Đang xác thực...</p>
        </div>
    );
}

export default function OAuth2RedirectPage() {
    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Suspense fallback={<div className="text-center">Đang tải...</div>}>
                <OAuth2Handler />
            </Suspense>
        </div>
    );
}
