'use client';

import { useAuthStore } from "@/features/auth/store";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut, FileText, Package } from "lucide-react";
import Image from "next/image";

const ProfileButton = () => {
  const { user, logout } = useAuthStore();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const displayName = user.name || user.email?.split('@')[0] || "Member";
  const firstLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* --- AVATAR BUTTON --- */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 pr-3 rounded-full border border-transparent hover:border-gray-200 transition"
      >
        {(user as any).avatar ? (
          <Image
            src={(user as any).avatar}
            alt="User"
            className="w-9 h-9 rounded-full object-cover border"
            width={36}
            height={36}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
            {firstLetter}
          </div>
        )}

        <div className="hidden md:block text-sm font-medium">
          {displayName}
        </div>
      </div>

      {/* --- DROPDOWN MENU --- */}
      {open && (
        <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl w-60 z-50 border border-gray-100 overflow-hidden animation-fade-in">
          {/* Header của Menu */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="font-bold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <p className="text-xs text-blue-600 font-medium mt-1 uppercase">
              {user.role || "USER"}
            </p>
          </div>

          {/* Các Link */}
          <div className="flex flex-col p-2 text-sm text-gray-700">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setOpen(false)}
            >
              <FileText size={16} /> Hồ sơ cá nhân
            </Link>

            <Link
              href="/orders"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setOpen(false)}
            >
              <Package size={16} /> Đơn hàng của tôi
            </Link>

            <div className="h-px bg-gray-100 my-1"></div>

            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;