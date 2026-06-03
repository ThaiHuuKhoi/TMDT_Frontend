"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward to an error-reporting service (e.g. Sentry) in production
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
      <div className="bg-red-50 p-4 rounded-full">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Đã xảy ra lỗi</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Có lỗi xảy ra khi tải trang này. Vui lòng thử lại hoặc liên hệ quản trị viên.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 font-mono">Mã lỗi: {error.digest}</p>
      )}
      <Button onClick={reset} variant="outline" className="mt-2">
        Thử lại
      </Button>
    </div>
  );
}
