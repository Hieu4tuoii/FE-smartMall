"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from "@/services/adminOrderService";
import {
  AdminOrderDetailResponse,
  OrderStatus,
  ProductItemImeiPayload,
  PaymentMethod,
  PaymentStatus,
} from "@/types/Order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, X, User, Phone, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/commonUtils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Trang chi tiết đơn hàng
 * Hiển thị thông tin đơn hàng, khách hàng và danh sách sản phẩm
 */
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orderDetail, setOrderDetail] =
    useState<AdminOrderDetailResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [shippingPayload, setShippingPayload] =
    useState<ProductItemImeiPayload[]>([]);
  const [shippingErrors, setShippingErrors] = useState<Record<number, string>>(
    {},
  );

  const orderId = params.id as string;

  /**
   * Load chi tiết đơn hàng
   */
  const loadOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await getAdminOrderById(orderId);
      setOrderDetail(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết đơn hàng",
        variant: "destructive",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }, [orderId, router, toast]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const statusLabelMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Chờ xác nhận",
    [OrderStatus.CONFIRMED]: "Đã xác nhận",
    [OrderStatus.SHIPPING]: "Đang giao",
    [OrderStatus.DELIVERED]: "Hoàn thành",
    [OrderStatus.CANCELLED]: "Đã hủy",
  };

  /**
   * Lấy màu và text cho badge trạng thái
   */
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          label: "Chờ xác nhận",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case OrderStatus.CONFIRMED:
        return {
          label: "Đã xác nhận",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case OrderStatus.SHIPPING:
        return {
          label: "Đang giao",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case OrderStatus.DELIVERED:
        return {
          label: "Hoàn thành",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case OrderStatus.CANCELLED:
        return {
          label: "Đã hủy",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
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

  const handleStatusUpdate = async (
    status: OrderStatus,
    options?: {
      actionId?: string;
      productItemImeiList?: ProductItemImeiPayload[];
    },
  ) => {
    if (!orderDetail) return;
    const actionId = options?.actionId ?? status;
    try {
      setPendingAction(actionId);
      await updateAdminOrderStatus(orderDetail.id, {
        status,
        productItemImeiList: options?.productItemImeiList,
      });
      toast({
        title: "Thành công",
        description: `Đã cập nhật trạng thái đơn hàng thành ${statusLabelMap[status]}.`,
      });
      await loadOrderDetail();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Cập nhật trạng thái đơn hàng thất bại",
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleOpenShippingDialog = () => {
    if (!orderDetail) return;
    const initial: ProductItemImeiPayload[] = orderDetail.products.map(
      (product) => ({
        orderItemId: product.orderItemId,
        imeiOrSerial: product.imeiOrSerial || "",
      }),
    );
    setShippingPayload(initial);
    setShippingErrors({});
    setShippingDialogOpen(true);
  };

  const handleShippingInputChange = (index: number, value: string) => {
    setShippingPayload((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], imeiOrSerial: value };
      return next;
    });
    setShippingErrors((prev) => {
      const next = { ...prev };
      if (value.trim()) {
        if (next[index]) {
          delete next[index];
        }
      } else {
        next[index] = "Vui lòng nhập IMEI/Serial";
      }
      return next;
    });
  };

  const validateShippingImeis = () => {
    const errors: Record<number, string> = {};
    shippingPayload.forEach((item, index) => {
      if (!item.imeiOrSerial.trim()) {
        errors[index] = "Vui lòng nhập IMEI/Serial";
      }
    });
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmShipping = async () => {
    if (!validateShippingImeis()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập IMEI/Serial cho tất cả sản phẩm.",
        variant: "destructive",
      });
      return;
    }
    await handleStatusUpdate(OrderStatus.SHIPPING, {
      actionId: "shipping",
      productItemImeiList: shippingPayload.map((item) => ({
        orderItemId: item.orderItemId,
        imeiOrSerial: item.imeiOrSerial.trim(),
      })),
    });
    setShippingDialogOpen(false);
  };

  const renderActionButtons = () => {
    if (!orderDetail) return null;
    const currentStatus = orderDetail.status;
    const isProcessing = pendingAction !== null;
    const buttons: React.ReactNode[] = [];

    if (currentStatus === OrderStatus.PENDING) {
      buttons.push(
        <Button
          key="confirm"
          disabled={isProcessing}
          onClick={() =>
            handleStatusUpdate(OrderStatus.CONFIRMED, { actionId: "confirm" })
          }
        >
          {pendingAction === "confirm" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Xác nhận đơn
        </Button>,
      );
    }

    if (currentStatus === OrderStatus.CONFIRMED) {
      buttons.push(
        <Button
          key="shipping"
          disabled={isProcessing}
          onClick={handleOpenShippingDialog}
        >
          Giao hàng
        </Button>,
      );
    }

    if (
      currentStatus === OrderStatus.PENDING ||
      currentStatus === OrderStatus.CONFIRMED
    ) {
      buttons.push(
        <Button
          key="cancel"
          variant="destructive"
          disabled={isProcessing}
          onClick={() =>
            handleStatusUpdate(OrderStatus.CANCELLED, { actionId: "cancel" })
          }
        >
          {pendingAction === "cancel" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Hủy đơn
        </Button>,
      );
    }

    if (currentStatus === OrderStatus.SHIPPING) {
      buttons.push(
        <Button
          key="delivered"
          disabled={isProcessing}
          onClick={() =>
            handleStatusUpdate(OrderStatus.DELIVERED, {
              actionId: "delivered",
            })
          }
        >
          {pendingAction === "delivered" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Đã giao
        </Button>,
      );
      buttons.push(
        <Button
          key="ship-fail"
          variant="destructive"
          disabled={isProcessing}
          onClick={() =>
            handleStatusUpdate(OrderStatus.CANCELLED, {
              actionId: "ship-fail",
            })
          }
        >
          {pendingAction === "ship-fail" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Giao thất bại
        </Button>,
      );
    }

    if (!buttons.length) return null;

    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Thao tác trạng thái</h2>
          <p className="text-sm text-gray-500">
            Cập nhật tiến trình xử lý đơn hàng
          </p>
        </div>
        <div className="flex flex-wrap gap-3">{buttons}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      </div>
    );
  }

  if (!orderDetail) return null;

  const statusBadge = getStatusBadge(orderDetail.status);

  return (
    <div className="p-8">
      <div className=" ">
        {/* Header với nút X và trạng thái */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{orderDetail.id}</h1>
              <p className="text-gray-600 mt-1">{formatDate(orderDetail.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {renderActionButtons()}

        {/* Thông tin đơn hàng */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Hình thức thanh toán</div>
              <div className="font-medium">{getPaymentMethodLabel(orderDetail.paymentMethod)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Trạng thái thanh toán</div>
              <Badge variant="outline" className={getPaymentStatusBadge(orderDetail.paymentStatus).className}>
                {getPaymentStatusBadge(orderDetail.paymentStatus).label}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Trạng thái đơn hàng</div>
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            </div>
            {orderDetail.note && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Ghi chú</div>
                <div className="font-medium">{orderDetail.note}</div>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin khách hàng */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{orderDetail.customer.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <span>{orderDetail.customer.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{orderDetail.address}</span>
            </div>
          </div>
        </div>

        {/* Sản phẩm đặt hàng */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm đặt hàng</h2>
          <div className="space-y-4">
            {orderDetail.products.map((product, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg">
                {/* Hình ảnh sản phẩm (placeholder) */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Ảnh</span>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1">
                  <div className="font-medium text-lg mb-2">
                    {product.productName}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {product.productVersionName} - {product.colorName}
                  </div>
                  {product.imeiOrSerial && (
                    <div className="text-sm text-gray-600 mb-2">
                      IMEI/Serial: {product.imeiOrSerial}
                    </div>
                  )}
                </div>

                {/* Giá */}
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="bg-blue-50 rounded-lg p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tổng tiền</h2>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(orderDetail.totalPrice)}
          </div>
        </div>
      </div>

      <Dialog
        open={shippingDialogOpen}
        onOpenChange={(open) => {
          setShippingDialogOpen(open);
          if (!open) {
            setShippingErrors({});
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin IMEI/Serial</DialogTitle>
            <DialogDescription>
              Nhập IMEI/Serial cho từng sản phẩm trước khi chuyển đơn sang trạng
              thái giao hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {orderDetail?.products.map((product, index) => (
              <div
                key={`${product.orderItemId}-${index}`}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-500">
                      {product.productVersionName} - {product.colorName}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <Input
                  value={shippingPayload[index]?.imeiOrSerial ?? ""}
                  onChange={(e) =>
                    handleShippingInputChange(index, e.target.value)
                  }
                  placeholder="Nhập IMEI hoặc Serial"
                  disabled={pendingAction === "shipping"}
                />
                {shippingErrors[index] && (
                  <p className="text-sm text-red-500">
                    {shippingErrors[index]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShippingDialogOpen(false)}
              disabled={pendingAction === "shipping"}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmShipping}
              disabled={pendingAction === "shipping"}
              className="gap-2"
            >
              {pendingAction === "shipping" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Xác nhận giao hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

