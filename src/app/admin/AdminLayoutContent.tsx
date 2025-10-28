"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Users, UserCog, LayoutDashboard, Package } from "lucide-react";
import Link from "next/link";

export function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, hasRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/dang-nhap");
      } else if (!hasRole("ROLE_ADMIN")) {
        router.push("/");
      }
    }
  }, [user, isLoading, hasRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !hasRole("ROLE_ADMIN")) {
    return null;
  }

  const menuItems = [
    {
      href: "/admin",
      label: "Tổng quan",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/products",
      label: "Sản phẩm",
      icon: Package,
    },
    {
      href: "/admin/customers",
      label: "Khách hàng",
      icon: Users,
    },
    {
      href: "/admin/employees",
      label: "Nhân viên",
      icon: UserCog,
    },
  ];

  return (
    <div className="min-h-screen flex shadow-md">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Smart Mall Admin</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="mb-3 px-4">
            <p className="text-sm ">Đăng nhập với</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}

