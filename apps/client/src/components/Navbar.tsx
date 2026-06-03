'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import SearchBar from "./SearchBar";
import ShoppingCartIcon from "./ShoppingCartIcon";
import WishlistIcon from "./WishlistIcon";
import ProfileButton from "./ProfileButton";
import { useAuthStore } from "@/features/auth/store";

const Navbar = ({ logoUrl }: { logoUrl?: string }) => {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <nav className="w-full flex items-center justify-between border-b border-gray-200 pb-4">
      {/* LEFT */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src={logoUrl || "/logo.png"}
          alt="KCG Shop"
          width={120}
          height={40}
          className="h-6 w-auto md:h-9"
        />
      </Link>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <SearchBar />

        <WishlistIcon />

        <ShoppingCartIcon />

        {isLoading ? (
          // 1. Khi đang tải (đang check token)
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        ) : !user ? (
          // 2. Khi CHƯA đăng nhập
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Đăng nhập
          </Link>
        ) : (
          // 3. Khi ĐÃ đăng nhập
          <ProfileButton />
        )}
      </div>
    </nav>
  );
};

export default Navbar;