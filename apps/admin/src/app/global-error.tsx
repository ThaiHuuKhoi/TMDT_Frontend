"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "16px",
            fontFamily: "sans-serif",
            padding: "16px",
            textAlign: "center",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              background: "#fef2f2",
              borderRadius: "50%",
              padding: "16px",
              marginBottom: "8px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", margin: 0 }}>
            Ứng dụng gặp sự cố nghiêm trọng
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "360px", margin: 0 }}>
            Vui lòng tải lại trang hoặc liên hệ bộ phận kỹ thuật nếu lỗi tiếp tục xảy ra.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              background: "#18181b",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              marginTop: "8px",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
