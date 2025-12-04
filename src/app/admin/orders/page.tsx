"use client";

import { useState, useEffect } from "react";
import { 
  getAdminOrderList,
  getAdminWarrantyList,
  getAdminReturnList,
  updateAdminWarrantyStatus,
  updateAdminReturnStatus
} from "@/services/adminOrderService";
import { 
  AdminOrderResponse, 
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus,
  WarrantyClaimResponse,
  ReturnRequestResponse,
  WarrantyStatus,
  ReturnRequestStatus,
  UpdateWarrantyStatusRequest,
  UpdateReturnRequestStatusRequest
} from "@/types/Order";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Eye, Shield, Undo2, Package } from "lucide-react";
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
import { getImageUrl } from "@/services/uploadService";
import { ImageWithFallback } from "@/components/custom/figma/ImageWithFallback";

/**
 * Trang quản lý danh sách đơn hàng, bảo hành và trả hàng
 * Hiển thị các đơn hàng với thông tin: mã đơn, khách hàng, sản phẩm, tổng tiền, trạng thái, ngày đặt
 */
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "warranty" | "return">("orders");
  
  // Orders states
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<AdminOrderResponse> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  
  // Warranty states
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaimResponse[]>([]);
  const [warrantyLoading, setWarrantyLoading] = useState(true);
  const [warrantyPage, setWarrantyPage] = useState(0);
  const [warrantyPageData, setWarrantyPageData] = useState<PageResponse<WarrantyClaimResponse> | null>(null);
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus | "ALL">("ALL");
  
  // Return states
  const [returnRequests, setReturnRequests] = useState<ReturnRequestResponse[]>([]);
  const [returnLoading, setReturnLoading] = useState(true);
  const [returnPage, setReturnPage] = useState(0);
  const [returnPageData, setReturnPageData] = useState<PageResponse<ReturnRequestResponse> | null>(null);
  const [returnStatus, setReturnStatus] = useState<ReturnRequestStatus | "ALL">("ALL");
  
  
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

  /**
   * Lấy danh sách yêu cầu bảo hành từ API
   */
  const fetchWarrantyClaims = async (page: number = 0) => {
    try {
      setWarrantyLoading(true);
      const response = await getAdminWarrantyList({
        page,
        size: 10,
        sort: "createdAt:desc",
        status: warrantyStatus === "ALL" ? undefined : warrantyStatus,
      });
      setWarrantyPageData(response);
      setWarrantyClaims(response.items);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách bảo hành",
        variant: "destructive",
      });
    } finally {
      setWarrantyLoading(false);
    }
  };

  /**
   * Lấy danh sách yêu cầu trả hàng từ API
   */
  const fetchReturnRequests = async (page: number = 0) => {
    try {
      setReturnLoading(true);
      const response = await getAdminReturnList({
        page,
        size: 10,
        sort: "createdAt:desc",
        status: returnStatus === "ALL" ? undefined : returnStatus,
      });
      setReturnPageData(response);
      setReturnRequests(response.items);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách trả hàng",
        variant: "destructive",
      });
    } finally {
      setReturnLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders(currentPage);
    } else if (activeTab === "warranty") {
      fetchWarrantyClaims(warrantyPage);
    } else if (activeTab === "return") {
      fetchReturnRequests(returnPage);
    }
  }, [currentPage, status, warrantyPage, warrantyStatus, returnPage, returnStatus, activeTab]);

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
   * Lấy text cho hình thức thanh toán
   */
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return "Tiền mặt";
      case PaymentMethod.BANK_TRANSFER:
        return "Chuyển khoản";
      default:
        return method;
    }
  };

  /**
   * Lấy màu và text cho badge trạng thái thanh toán
   */
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { label: "Đã thanh toán", className: "bg-green-100 text-green-800 border-green-200" };
      case PaymentStatus.UNPAID:
        return { label: "Chưa thanh toán", className: "bg-red-100 text-red-800 border-red-200" };
      case PaymentStatus.CANCELLED:
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
   * Lấy màu và text cho badge trạng thái bảo hành
   */
  const getWarrantyStatusBadge = (status: WarrantyStatus) => {
    switch (status) {
      case WarrantyStatus.PENDING:
        return { label: "Đang chờ", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
      case WarrantyStatus.CONFIRMED:
        return { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" };
      case WarrantyStatus.IN_WARRANTY:
        return { label: "Đang bảo hành", className: "bg-purple-100 text-purple-800 border-purple-200" };
      case WarrantyStatus.RETURNING:
        return { label: "Đang hoàn hàng", className: "bg-orange-100 text-orange-800 border-orange-200" };
      case WarrantyStatus.COMPLETED:
        return { label: "Đã bảo hành", className: "bg-green-100 text-green-800 border-green-200" };
      case WarrantyStatus.CANCELLED:
        return { label: "Đã hủy", className: "bg-gray-100 text-gray-800 border-gray-200" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  /**
   * Lấy màu và text cho badge trạng thái trả hàng
   */
  const getReturnStatusBadge = (status: ReturnRequestStatus) => {
    switch (status) {
      case ReturnRequestStatus.PENDING:
        return { label: "Đang chờ", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
      case ReturnRequestStatus.CONFIRMED:
        return { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" };
      case ReturnRequestStatus.REFUNDING:
        return { label: "Đang hoàn tiền", className: "bg-orange-100 text-orange-800 border-orange-200" };
      case ReturnRequestStatus.REFUNDED:
        return { label: "Đã hoàn tiền", className: "bg-green-100 text-green-800 border-green-200" };
      case ReturnRequestStatus.CANCELLED:
        return { label: "Đã hủy", className: "bg-gray-100 text-gray-800 border-gray-200" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  /**
   * Lấy danh sách trạng thái có thể chuyển đổi từ trạng thái hiện tại (bảo hành)
   * Dựa trên validation từ backend
   */
  const getAvailableWarrantyStatuses = (currentStatus: WarrantyStatus): WarrantyStatus[] => {
    switch (currentStatus) {
      case WarrantyStatus.PENDING:
        // PENDING -> CONFIRMED hoặc CANCELLED
        return [WarrantyStatus.CONFIRMED, WarrantyStatus.CANCELLED];
      case WarrantyStatus.CONFIRMED:
        // CONFIRMED -> IN_WARRANTY hoặc CANCELLED
        return [WarrantyStatus.IN_WARRANTY, WarrantyStatus.CANCELLED];
      case WarrantyStatus.IN_WARRANTY:
        // IN_WARRANTY -> RETURNING
        return [WarrantyStatus.RETURNING];
      case WarrantyStatus.RETURNING:
        // RETURNING -> COMPLETED
        return [WarrantyStatus.COMPLETED];
      case WarrantyStatus.COMPLETED:
        // COMPLETED không thể chuyển sang trạng thái khác
        return [];
      case WarrantyStatus.CANCELLED:
        // CANCELLED không thể chuyển sang trạng thái khác
        return [];
      default:
        return [];
    }
  };

  /**
   * Lấy danh sách trạng thái có thể chuyển đổi từ trạng thái hiện tại (trả hàng)
   * Dựa trên validation từ backend
   */
  const getAvailableReturnStatuses = (currentStatus: ReturnRequestStatus): ReturnRequestStatus[] => {
    switch (currentStatus) {
      case ReturnRequestStatus.PENDING:
        // PENDING -> CONFIRMED hoặc CANCELLED
        return [ReturnRequestStatus.CONFIRMED, ReturnRequestStatus.CANCELLED];
      case ReturnRequestStatus.CONFIRMED:
        // CONFIRMED -> REFUNDING hoặc CANCELLED
        return [ReturnRequestStatus.REFUNDING, ReturnRequestStatus.CANCELLED];
      case ReturnRequestStatus.REFUNDING:
        // REFUNDING -> REFUNDED
        return [ReturnRequestStatus.REFUNDED];
      case ReturnRequestStatus.REFUNDED:
        // REFUNDED không thể chuyển sang trạng thái khác
        return [];
      case ReturnRequestStatus.CANCELLED:
        // CANCELLED không thể chuyển sang trạng thái khác
        return [];
      default:
        return [];
    }
  };


  /**
   * Xử lý cập nhật trạng thái
   */
  const handleUpdateStatus = async (
    status: WarrantyStatus | ReturnRequestStatus,
    id: string,
    type: "warranty" | "return"
  ) => {
    try {
      if (type === "warranty") {
        const payload: UpdateWarrantyStatusRequest = {
          status: status as WarrantyStatus,
        };
        await updateAdminWarrantyStatus(id, payload);
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái bảo hành thành công",
        });
        fetchWarrantyClaims(warrantyPage);
      } else {
        const payload: UpdateReturnRequestStatusRequest = {
          status: status as ReturnRequestStatus,
        };
        await updateAdminReturnStatus(id, payload);
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái trả hàng thành công",
        });
        fetchReturnRequests(returnPage);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Cập nhật trạng thái thất bại",
        variant: "destructive",
      });
    }
  };

  /**
   * Render phân trang cho orders
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

  /**
   * Render phân trang cho warranty
   */
  const renderWarrantyPagination = () => {
    if (!warrantyPageData || warrantyPageData.totalPage <= 1) return null;

    const pages = [];
    for (let i = 0; i < warrantyPageData.totalPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => warrantyPage > 0 && setWarrantyPage(warrantyPage - 1)}
              className={warrantyPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setWarrantyPage(page)}
                isActive={warrantyPage === page}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                warrantyPage < warrantyPageData.totalPage - 1 && setWarrantyPage(warrantyPage + 1)
              }
              className={
                warrantyPage >= warrantyPageData.totalPage - 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  /**
   * Render phân trang cho return
   */
  const renderReturnPagination = () => {
    if (!returnPageData || returnPageData.totalPage <= 1) return null;

    const pages = [];
    for (let i = 0; i < returnPageData.totalPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => returnPage > 0 && setReturnPage(returnPage - 1)}
              className={returnPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setReturnPage(page)}
                isActive={returnPage === page}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                returnPage < returnPageData.totalPage - 1 && setReturnPage(returnPage + 1)
              }
              className={
                returnPage >= returnPageData.totalPage - 1
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
          <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "orders" | "warranty" | "return")}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="warranty" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Bảo hành
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <Undo2 className="w-4 h-4" />
              Trả hàng
            </TabsTrigger>
          </TabsList>

          {/* Tab Đơn hàng */}
          <TabsContent value="orders">
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
                        <TableHead>Hình thức thanh toán</TableHead>
                        <TableHead>Trạng thái thanh toán</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            Không có đơn hàng nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.map((order) => {
                          const statusBadge = getStatusBadge(order.status);
                          const paymentStatusBadge = getPaymentStatusBadge(order.paymentStatus);
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
                                {getPaymentMethodLabel(order.paymentMethod)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={paymentStatusBadge.className}>
                                  {paymentStatusBadge.label}
                                </Badge>
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
          </TabsContent>

          {/* Tab Bảo hành */}
          <TabsContent value="warranty">
            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
              <Select 
                value={warrantyStatus} 
                onValueChange={(value) => {
                  setWarrantyStatus(value as WarrantyStatus | "ALL");
                  setWarrantyPage(0);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value={WarrantyStatus.PENDING}>Đang chờ</SelectItem>
                  <SelectItem value={WarrantyStatus.CONFIRMED}>Đã xác nhận</SelectItem>
                  <SelectItem value={WarrantyStatus.IN_WARRANTY}>Đang bảo hành</SelectItem>
                  <SelectItem value={WarrantyStatus.RETURNING}>Đang hoàn hàng</SelectItem>
                  <SelectItem value={WarrantyStatus.COMPLETED}>Đã bảo hành</SelectItem>
                  <SelectItem value={WarrantyStatus.CANCELLED}>Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {warrantyLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã yêu cầu</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Lý do</TableHead>
                        <TableHead>Thông tin liên hệ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày gửi</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warrantyClaims.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Không có yêu cầu bảo hành nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        warrantyClaims.map((claim) => {
                          const statusBadge = getWarrantyStatusBadge(claim.status);
                          const availableStatuses = getAvailableWarrantyStatuses(claim.status);
                          return (
                            <TableRow key={claim.id}>
                              <TableCell className="font-medium text-blue-600">
                                #{claim.id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <ImageWithFallback 
                                      src={getImageUrl(claim.product.imageUrl)} 
                                      alt={claim.product.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{claim.product.productName}</div>
                                    <div className="text-sm text-gray-500">
                                      {claim.product.productVersionName} - {claim.product.colorName}
                                    </div>
                                    {claim.product.imeiOrSerial && (
                                      <div className="text-xs text-gray-400">
                                        {claim.product.imeiOrSerial.startsWith("3") ? "IMEI" : "Serial"}: {claim.product.imeiOrSerial}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate" title={claim.reason}>
                                  {claim.reason || "Không có"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{claim.phoneNumber}</div>
                                  <div className="text-gray-500 text-xs truncate max-w-xs" title={claim.address}>
                                    {claim.address}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusBadge.className}>
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(claim.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                {availableStatuses.length > 0 ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        Cập nhật
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64" align="end">
                                      <div className="space-y-2">
                                        <div className="text-sm font-medium mb-3">Chọn trạng thái mới:</div>
                                        {availableStatuses.map((status) => {
                                          const newStatusBadge = getWarrantyStatusBadge(status);
                                          return (
                                            <Button
                                              key={status}
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                handleUpdateStatus(status);
                                              }}
                                              className={`w-full justify-start ${newStatusBadge.className} hover:opacity-80`}
                                            >
                                              {newStatusBadge.label}
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="text-sm text-gray-400">Không thể cập nhật</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  {renderWarrantyPagination()}
                </>
              )}
            </div>
          </TabsContent>

          {/* Tab Trả hàng */}
          <TabsContent value="return">
            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
              <Select 
                value={returnStatus} 
                onValueChange={(value) => {
                  setReturnStatus(value as ReturnRequestStatus | "ALL");
                  setReturnPage(0);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value={ReturnRequestStatus.PENDING}>Đang chờ</SelectItem>
                  <SelectItem value={ReturnRequestStatus.CONFIRMED}>Đã xác nhận</SelectItem>
                  <SelectItem value={ReturnRequestStatus.REFUNDING}>Đang hoàn tiền</SelectItem>
                  <SelectItem value={ReturnRequestStatus.REFUNDED}>Đã hoàn tiền</SelectItem>
                  <SelectItem value={ReturnRequestStatus.CANCELLED}>Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {returnLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã yêu cầu</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Lý do</TableHead>
                        <TableHead>Thông tin liên hệ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày gửi</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Không có yêu cầu trả hàng nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        returnRequests.map((request) => {
                          const statusBadge = getReturnStatusBadge(request.status);
                          const availableStatuses = getAvailableReturnStatuses(request.status);
                          return (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium text-blue-600">
                                #{request.id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <ImageWithFallback 
                                      src={getImageUrl(request.product.imageUrl)} 
                                      alt={request.product.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{request.product.productName}</div>
                                    <div className="text-sm text-gray-500">
                                      {request.product.productVersionName} - {request.product.colorName}
                                    </div>
                                    {request.product.imeiOrSerial && (
                                      <div className="text-xs text-gray-400">
                                        {request.product.imeiOrSerial.startsWith("3") ? "IMEI" : "Serial"}: {request.product.imeiOrSerial}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate" title={request.reason}>
                                  {request.reason || "Không có"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {request.phoneNumber && <div>{request.phoneNumber}</div>}
                                  {request.address && (
                                    <div className="text-gray-500 text-xs truncate max-w-xs" title={request.address}>
                                      {request.address}
                                    </div>
                                  )}
                                  {!request.phoneNumber && !request.address && (
                                    <div className="text-gray-400">Không có</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusBadge.className}>
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(request.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                {availableStatuses.length > 0 ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        Cập nhật
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64" align="end">
                                      <div className="space-y-2">
                                        <div className="text-sm font-medium mb-3">Chọn trạng thái mới:</div>
                                        {availableStatuses.map((status) => {
                                          const newStatusBadge = getReturnStatusBadge(status);
                                          return (
                                            <Button
                                              key={status}
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                handleUpdateStatus(status, request.id, "return");
                                              }}
                                              className={`w-full justify-start ${newStatusBadge.className} hover:opacity-80`}
                                            >
                                              {newStatusBadge.label}
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="text-sm text-gray-400">Không thể cập nhật</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  {renderReturnPagination()}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

