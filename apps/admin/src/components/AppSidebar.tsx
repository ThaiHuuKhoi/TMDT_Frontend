"use client";

import {
  Home,
  Plus,
  Shirt,
  User,
  ShoppingBasket,
  Tags,
  Megaphone,
  Ticket,
  LineChart,
  Facebook,
  Settings,
  Truck,
  Store,
  LayoutTemplate,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Sheet, SheetTrigger } from "./ui/sheet";
import AddUser from "./AddUser";
import AddCategory from "./AddCategory";
import AddProduct from "./AddProduct";
import AddBanner from "./AddBanner";
import AddCoupon from "./AddCoupon";
import AddOrder from "./AddOrder";

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-zinc-50">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                  <Image src="/logo.svg" alt="logo" width={20} height={20} className="invert" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none ml-2">
                  <span className="font-bold text-zinc-900">Admin</span>
                  <span className="text-xs text-zinc-500">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        {/* --- ỨNG DỤNG --- */}
        <SidebarGroup>
          <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    <span>Tổng quan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/market-analysis")}>
                  <Link href="/market-analysis">
                    <LineChart className="w-4 h-4" />
                    <span>Phân tích thị trường</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* --- CỬA HÀNG --- */}
        <SidebarGroup>
          <SidebarGroupLabel>Cửa hàng</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus className="w-4 h-4" /> <span className="sr-only">Thêm sản phẩm</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* DANH MỤC */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/categories")}>
                  <Link href="/categories">
                    <Tags className="w-4 h-4" />
                    <span>Quản lý Danh Mục</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="text-zinc-500 hover:text-zinc-900">
                      <Plus className="w-4 h-4" />
                      Thêm Danh Mục
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCategory />
                </Sheet>
              </SidebarMenuItem>

              {/* SẢN PHẨM */}
              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton asChild isActive={pathname.startsWith("/products")}>
                  <Link href="/products">
                    <Shirt className="w-4 h-4" />
                    <span>Quản lý Sản Phẩm</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="text-zinc-500 hover:text-zinc-900">
                      <Plus className="w-4 h-4" />
                      Thêm Sản Phẩm
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddProduct />
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* --- MARKETING & KHUYẾN MÃI (NHÓM MỚI) --- */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-600 font-semibold">Marketing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* BANNER */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/banners")}>
                  <Link href="/banners">
                    <Megaphone className="w-4 h-4" />
                    <span>Quản lý Banner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="text-zinc-500 hover:text-zinc-900">
                      <Plus className="w-4 h-4" />
                      Thêm Banner
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddBanner />
                </Sheet>
              </SidebarMenuItem>

              {/* MÃ GIẢM GIÁ */}
              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton asChild isActive={pathname.startsWith("/coupons")}>
                  <Link href="/coupons">
                    <Ticket className="w-4 h-4" />
                    <span>Mã Giảm Giá</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="text-zinc-500 hover:text-zinc-900">
                      <Plus className="w-4 h-4" />
                      Thêm Mã Giảm Giá
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCoupon />
                </Sheet>
              </SidebarMenuItem>

              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton asChild isActive={pathname.startsWith("/facebook-posts")}>
                  <Link href="/facebook-posts">
                    <Facebook className="w-4 h-4" />
                    <span>Đăng bài Facebook</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* --- KHÁCH HÀNG & GIAO DỊCH --- */}
        <SidebarGroup>
          <SidebarGroupLabel>Khách hàng & Giao dịch</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* NGƯỜI DÙNG */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/users")}>
                  <Link href="/users">
                    <User className="w-4 h-4" />
                    <span>Quản lý Người Dùng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="text-zinc-500 hover:text-zinc-900">
                      <Plus className="w-4 h-4" />
                      Thêm Người Dùng
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddUser />
                </Sheet>
              </SidebarMenuItem>

              {/* ĐƠN HÀNG */}
              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton asChild isActive={pathname.startsWith("/orders")}>
                  <Link href="/orders">
                    <ShoppingBasket className="w-4 h-4" />
                    <span>Quản lý Đơn Hàng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="text-zinc-500 hover:text-zinc-900">
                      <Plus className="w-4 h-4" />
                      Tạo đơn (Admin)
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddOrder />
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* --- CÀI ĐẶT --- */}
        <SidebarGroup>
          <SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings/shipping"}>
                  <Link href="/settings/shipping">
                    <Truck className="w-4 h-4" />
                    <span>Phí Vận Chuyển</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings/store"}>
                  <Link href="/settings/store">
                    <Store className="w-4 h-4" />
                    <span>Thông Tin Cửa Hàng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings/footer"}>
                  <Link href="/settings/footer">
                    <LayoutTemplate className="w-4 h-4" />
                    <span>Chân Trang</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/info-pages")}>
                  <Link href="/info-pages">
                    <FileText className="w-4 h-4" />
                    <span>Trang Thông Tin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;