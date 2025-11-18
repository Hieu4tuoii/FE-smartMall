"use client";

import { useState, useEffect } from "react";
import { getAdminOrderList } from "@/services/adminOrderService";
import { AdminOrderResponse, OrderStatus } from "@/types/Order";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/utils/commonUtils";

/**
 * Trang quản lý danh sách đơn hàng
 * Hiển thị các đơn hàng với thông tin: mã đơn, khách hàng, sản phẩm, tổng tiền, trạng thái, ngày đặt
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<AdminOrderResponse> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Lấy danh sách đơn hàng từ API
   */
  const fetchOrders = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await getAdminOrderList({
        page,
        size: 10,
        sort: "modifiedAt:desc",
        keyword,
        status: status === "ALL" ? undefined : status,
      });
      setPageData(response);
      setOrders(response.items);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, status]);

  /**
   * Xử lý tìm kiếm
   */
  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders(0);
  };

  /**
   * Xử lý nhấn Enter trong ô tìm kiếm
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Lấy màu và text cho badge trạng thái
   */
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
      case OrderStatus.CONFIRMED:
        return { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" };
      case OrderStatus.SHIPPING:
        return { label: "Đang giao", className: "bg-purple-100 text-purple-800 border-purple-200" };
      case OrderStatus.DELIVERED:
        return { label: "Hoàn thành", className: "bg-green-100 text-green-800 border-green-200" };
      case OrderStatus.CANCELLED:
        return { label: "Đã hủy", className: "bg-gray-100 text-gray-800 border-gray-200" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  /**
   * Hiển thị danh sách sản phẩm trong đơn hàng
   */
  const renderProducts = (products: AdminOrderResponse["products"]) => {
    if (products.length === 0) return "Không có sản phẩm";
    if (products.length === 1) {
      return (
        <div>
          {products[0].productName} {products[0].productVersionName} {products[0].colorName}
        </div>
      );
    }
    const firstProduct = products[0];
    const remainingCount = products.length - 1;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="space-y-1 cursor-pointer">
            <div>
              {firstProduct.productName} {firstProduct.productVersionName} {firstProduct.colorName}
            </div>
            <div className="text-sm text-gray-500">
              và {remainingCount} sản phẩm khác
            </div>
            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-gray-300">
              {products.length} sản phẩm
            </Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-black text-white p-4" align="start">
          <h4 className="font-semibold mb-3 text-white">Danh sách sản phẩm:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {products.map((product, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{product.productName}</div>
                <div className="text-gray-300 text-xs">
                  {product.productVersionName} - {product.colorName} (x{product.quantity})
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
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
                currentPage >= pageData.totalPage - 1
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Danh sách đơn hàng</h1>
        </div>

        {/* Search và Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus | "ALL")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value={OrderStatus.PENDING}>Chờ xác nhận</SelectItem>
              <SelectItem value={OrderStatus.CONFIRMED}>Đã xác nhận</SelectItem>
              <SelectItem value={OrderStatus.SHIPPING}>Đang giao</SelectItem>
              <SelectItem value={OrderStatus.DELIVERED}>Hoàn thành</SelectItem>
              <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Tìm kiếm
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
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const statusBadge = getStatusBadge(order.status);
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-blue-600">
                            #{order.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer.name}</div>
                              <div className="text-sm text-gray-500">{order.customer.phoneNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>{renderProducts(order.products)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.totalPrice)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
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

