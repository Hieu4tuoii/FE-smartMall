"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ImportOrderService } from "@/services/importOrderService";
import { ImportOrderDetailResponse } from "@/types/ImportOrder";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Trang chi tiết đơn nhập
 * Hiển thị thông tin đơn nhập và danh sách sản phẩm đã nhập
 */
export default function ImportOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState<ImportOrderDetailResponse | null>(null);

  const orderId = params.id as string;

  /**
   * Load chi tiết đơn nhập
   */
  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await ImportOrderService.getById(orderId);
        setOrderDetail(data);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải chi tiết đơn nhập",
          variant: "destructive",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  /**
   * Format số tiền thành định dạng VNĐ
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  /**
   * Format ngày tháng
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetail) return null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Chi tiết đơn nhập</h1>
        </div>

        {/* Thông tin đơn nhập */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mã đơn nhập</p>
              <p className="font-medium">{orderDetail.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nhà cung cấp</p>
              <p className="font-medium">{orderDetail.supplierName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng tiền</p>
              <p className="font-medium text-lg text-blue-600">
                {formatCurrency(orderDetail.totalImportPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày nhập</p>
              <p className="font-medium">{formatDate(orderDetail.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Phiên bản</TableHead>
                <TableHead>Màu</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Thành tiền</TableHead>
                <TableHead>IMEI/Serial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderDetail.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.versionName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.colorName}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(item.importPrice)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.importPrice * item.quantity)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-blue-600 hover:underline">
                          Xem {item.imeiOrSerialList.length} IMEI
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto">
                          {item.imeiOrSerialList.map((imei, idx) => (
                            <div key={idx} className="py-1">
                              {idx + 1}. {imei}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


