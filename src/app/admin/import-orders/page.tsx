"use client";

import { useState, useEffect } from "react";
import { ImportOrderService } from "@/services/importOrderService";
import { ImportOrderResponse } from "@/types/ImportOrder";
import { PageResponse } from "@/types/apiTypes";
import { Input } from "@/components/ui/input";
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
import { Search, Loader2, Plus, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Trang quản lý danh sách đơn nhập
 * Hiển thị các đơn nhập với thông tin: nhà cung cấp, tổng tiền, ngày nhập
 */
export default function ImportOrdersPage() {
  const [orders, setOrders] = useState<ImportOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<ImportOrderResponse> | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Lấy danh sách đơn nhập từ API
   */
  const fetchOrders = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await ImportOrderService.getList({
        page,
        size: 10,
      });
      setPageData(response);
      setOrders(response.items);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn nhập",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

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

  /**
   * Render phân trang
   */
  const renderPagination = () => {
    if (!pageData || pageData.totalPage <= 1) return null;

    const pages = [];
    for (let i = 0; i < pageData.totalPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
              className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < pageData.totalPage - 1 && setCurrentPage(currentPage + 1)
              }
              className={
                currentPage === pageData.totalPage - 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quản lý đơn nhập</h1>
          <Button onClick={() => router.push("/admin/import-orders/add")} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm đơn nhập
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Không có đơn nhập nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.supplierName || "N/A"}
                        </TableCell>
                        <TableCell>{formatCurrency(order.totalImportPrice)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/import-orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
