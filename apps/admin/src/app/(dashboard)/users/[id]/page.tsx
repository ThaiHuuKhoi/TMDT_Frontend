import { cookies } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserStatusToggle from "@/components/UserStatusToggle";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive?: boolean;
};

const UserDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-600">Chưa đăng nhập.</p>
      </div>
    );
  }

  const res = await fetch(`${BASE_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-sm text-red-600">Không tải được người dùng (mã {res.status}).</p>
        <Button variant="outline" asChild>
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  const user = (await res.json()) as UserDetail;
  const isAdmin = user.role === "ADMIN" || user.role === "ROLE_ADMIN";
  const active = user.isActive ?? true;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Danh sách
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{user.name || "—"}</h1>
            <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
            <p className="mt-2 font-mono text-xs text-zinc-400">ID: {user.id}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Quản trị viên" : "Khách hàng"}
            </Badge>
            <Badge variant={active ? "outline" : "destructive"}>
              {active ? "Hoạt động" : "Đã khóa"}
            </Badge>
            {!isAdmin && (
              <UserStatusToggle
                userId={user.id}
                isActive={active}
                userName={user.name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
