"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Tổng khách hàng",
      value: "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Tổng nhân viên",
      value: "0",
      icon: UserCog,
      color: "bg-green-500",
    },
    {
      title: "Đơn hàng",
      value: "0",
      icon: ShoppingCart,
      color: "bg-yellow-500",
    },
    {
      title: "Doanh thu",
      value: "0đ",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tổng quan hệ thống</h1>
          <p className="text-gray-600">
            Xin chào, <span className="font-semibold">{user?.fullName}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium w-32">Họ tên:</span>
                <span>{user?.fullName}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Vai trò:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {user?.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

