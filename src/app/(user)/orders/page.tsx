"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Shield, RefreshCcw, Undo2, Upload, X, Star, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/custom/figma/ImageWithFallback";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/services/uploadService";
import { 
  getOrderListByCurrentUser, 
  cancelOrder, 
  createReturnRequest,
  getWarrantyClaimListByCurrentUser,
  getReturnRequestListByCurrentUser
} from "@/services/orderService";
import { createReview } from "@/services/reviewService";
import { getPublicProductVersionDetail } from "@/services/productService";
import type { 
  UserOrderResponse,
  WarrantyClaimResponse,
  ReturnRequestResponse
} from "@/types/Order";
import { 
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus, 
  ReturnRequestType,
  WarrantyStatus,
  ReturnRequestStatus
} from "@/types/Order";
import type { ReviewCreationRequest } from "@/types/Review";
import { 
  formatCurrency, 
  formatDateOnly,
  getOrderStatusColor, 
  getOrderStatusText, 
  getPaymentMethodText, 
  getPaymentStatusText, 
  getPaymentStatusColor 
} from "@/utils/commonUtils";

/**
 * Hàm lấy màu badge cho trạng thái bảo hành
 */
function getWarrantyStatusColor(status: WarrantyStatus): string {
  switch (status) {
    case WarrantyStatus.PENDING:
      return "bg-yellow-500 hover:bg-yellow-600";
    case WarrantyStatus.CONFIRMED:
      return "bg-blue-500 hover:bg-blue-600";
    case WarrantyStatus.IN_WARRANTY:
      return "bg-purple-500 hover:bg-purple-600";
    case WarrantyStatus.RETURNING:
      return "bg-orange-500 hover:bg-orange-600";
    case WarrantyStatus.COMPLETED:
      return "bg-green-500 hover:bg-green-600";
    case WarrantyStatus.CANCELLED:
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

/**
 * Hàm lấy text cho trạng thái bảo hành
 */
function getWarrantyStatusText(status: WarrantyStatus): string {
  switch (status) {
    case WarrantyStatus.PENDING:
      return "Đang chờ";
    case WarrantyStatus.CONFIRMED:
      return "Đã xác nhận";
    case WarrantyStatus.IN_WARRANTY:
      return "Đang bảo hành";
    case WarrantyStatus.RETURNING:
      return "Đang hoàn hàng";
    case WarrantyStatus.COMPLETED:
      return "Đã bảo hành";
    case WarrantyStatus.CANCELLED:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
}

/**
 * Hàm lấy màu badge cho trạng thái trả hàng
 */
function getReturnStatusColor(status: ReturnRequestStatus): string {
  switch (status) {
    case ReturnRequestStatus.PENDING:
      return "bg-yellow-500 hover:bg-yellow-600";
    case ReturnRequestStatus.CONFIRMED:
      return "bg-blue-500 hover:bg-blue-600";
    case ReturnRequestStatus.REFUNDING:
      return "bg-orange-500 hover:bg-orange-600";
    case ReturnRequestStatus.REFUNDED:
      return "bg-green-500 hover:bg-green-600";
    case ReturnRequestStatus.CANCELLED:
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

/**
 * Hàm lấy text cho trạng thái trả hàng
 */
function getReturnStatusText(status: ReturnRequestStatus): string {
  switch (status) {
    case ReturnRequestStatus.PENDING:
      return "Đang chờ";
    case ReturnRequestStatus.CONFIRMED:
      return "Đã xác nhận";
    case ReturnRequestStatus.REFUNDING:
      return "Đang hoàn tiền";
    case ReturnRequestStatus.REFUNDED:
      return "Đã hoàn tiền";
    case ReturnRequestStatus.CANCELLED:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
}

type RequestType = "warranty" | "exchange" | "return";
interface SelectedItem { 
  orderId: string; 
  orderItemId: string;
  itemName: string; 
  itemImage: string; 
  emeiSerial: string; 
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [requestType, setRequestType] = useState<RequestType>("warranty");
  const [reason, setReason] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [orders, setOrders] = useState<UserOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaimResponse[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequestResponse[]>([]);
  const [loadingWarranty, setLoadingWarranty] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<{ slug: string; name: string; imageUrl: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  /**
   * Fetch danh sách đơn hàng từ API
   */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrderListByCurrentUser();
        setOrders(data);
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách đơn hàng",
          variant: "destructive",
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /**
   * Fetch danh sách bảo hành khi tab được chọn
   */
  useEffect(() => {
    if (activeTab === "warranty") {
      const fetchWarrantyClaims = async () => {
        try {
          setLoadingWarranty(true);
          const data = await getWarrantyClaimListByCurrentUser();
          setWarrantyClaims(data);
        } catch (error: any) {
          console.error("Lỗi khi lấy danh sách bảo hành:", error);
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tải danh sách bảo hành",
            variant: "destructive",
          });
          setWarrantyClaims([]);
        } finally {
          setLoadingWarranty(false);
        }
      };
      fetchWarrantyClaims();
    }
  }, [activeTab]);

  /**
   * Fetch danh sách trả hàng khi tab được chọn
   */
  useEffect(() => {
    if (activeTab === "return") {
      const fetchReturnRequests = async () => {
        try {
          setLoadingReturn(true);
          const data = await getReturnRequestListByCurrentUser();
          setReturnRequests(data);
        } catch (error: any) {
          console.error("Lỗi khi lấy danh sách trả hàng:", error);
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tải danh sách trả hàng",
            variant: "destructive",
          });
          setReturnRequests([]);
        } finally {
          setLoadingReturn(false);
        }
      };
      fetchReturnRequests();
    }
  }, [activeTab]);

  /**
   * Xử lý mở popup xác nhận hủy đơn hàng
   */
  function handleOpenCancelOrder(orderId: string) {
    setSelectedOrderId(orderId);
    setIsCancelOrderOpen(true);
  }

  /**
   * Xử lý xác nhận hủy đơn hàng
   */
  async function handleConfirmCancelOrder() {
    if (!selectedOrderId) return;
    
    try {
      setIsCancelling(true);
      await cancelOrder(selectedOrderId);
      toast({
        title: "Thành công",
        description: "Đã hủy đơn hàng thành công",
      });
      // Refresh danh sách đơn hàng
      const data = await getOrderListByCurrentUser();
      setOrders(data);
      setIsCancelOrderOpen(false);
      setSelectedOrderId(null);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  }

  /**
   * Xử lý mở popup đánh giá
   */
  async function handleOpenReview(product: any) {
    try {
      // Lấy productVersionId từ slug
      const detail = await getPublicProductVersionDetail(product.slug);
      setReviewProduct({
        slug: product.slug,
        name: `${product.productName} - ${product.productVersionName} - ${product.colorName}`,
        imageUrl: product.imageUrl,
      });
      setReviewRating(0);
      setReviewComment("");
      setIsReviewOpen(true);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể mở form đánh giá",
        variant: "destructive",
      });
    }
  }

  /**
   * Xử lý submit đánh giá
   */
  async function handleSubmitReview() {
    if (reviewRating === 0) {
      toast({
        title: "Vui lòng chọn số sao",
        variant: "destructive",
      });
      return;
    }

    if (!reviewProduct) return;

    try {
      setIsSubmittingReview(true);
      // Lấy productVersionId từ slug
      const detail = await getPublicProductVersionDetail(reviewProduct.slug);
      const payload: ReviewCreationRequest = {
        productVersionId: detail.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      };
      await createReview(payload);
      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được gửi thành công",
      });
      setIsReviewOpen(false);
      setReviewProduct(null);
      setReviewRating(0);
      setReviewComment("");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi đánh giá",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  }

  /**
   * Xử lý mở modal gửi yêu cầu
   */
  function handleOpenModal(orderId: string, item: any) {
    const itemName = `${item.productName} - ${item.productVersionName} - ${item.colorName}`;
    setSelectedItem({ 
      orderId, 
      orderItemId: item.orderItemId,
      itemName, 
      itemImage: item.imageUrl || "", 
      emeiSerial: item.imeiOrSerial || "" 
    });
    setRequestType("warranty");
    setReason("");
    setPhoneNumber("");
    setAddress("");
    setImages([]);
    setIsModalOpen(true);
  }
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setImages([...images, ...Array.from(e.target.files)]);
  }
  function handleRemoveImage(index: number) { setImages(images.filter((_, i) => i !== index)); }
  
  /**
   * Xử lý submit yêu cầu trả/đổi/bảo hành
   */
  async function handleSubmitRequest() {
    if (!selectedItem) return;
    
    if (!reason.trim()) {
      toast({ 
        title: "Vui lòng nhập lý do", 
        variant: "destructive" 
      });
      return;
    }

    // Kiểm tra phoneNumber và address cho bảo hành và đổi hàng
    if (requestType === "warranty" || requestType === "exchange") {
      if (!phoneNumber.trim()) {
        toast({ 
          title: "Vui lòng nhập số điện thoại", 
          variant: "destructive" 
        });
        return;
      }
      if (!address.trim()) {
        toast({ 
          title: "Vui lòng nhập địa chỉ", 
          variant: "destructive" 
        });
        return;
      }
    }

    try {
      setIsSubmittingRequest(true);
      
      // Map requestType từ frontend sang backend enum
      const returnRequestTypeMap: Record<RequestType, ReturnRequestType> = {
        warranty: ReturnRequestType.WARRANTY,
        exchange: ReturnRequestType.EXCHANGE,
        return: ReturnRequestType.RETURN,
      };

      const payload = {
        orderItemId: selectedItem.orderItemId,
        returnRequestType: returnRequestTypeMap[requestType],
        reason: reason.trim(),
        ...(requestType === "warranty" || requestType === "exchange" ? {
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
        } : {}),
      };

      await createReturnRequest(payload);
      
      const requestTypeText = { warranty: "bảo hành", exchange: "đổi", return: "trả" }[requestType];
      toast({ 
        title: "Thành công", 
        description: `Đã gửi yêu cầu ${requestTypeText} thành công` 
      });
      
      // Refresh danh sách đơn hàng
      const data = await getOrderListByCurrentUser();
      setOrders(data);
      
      setIsModalOpen(false);
      setReason("");
      setPhoneNumber("");
      setAddress("");
      setImages([]);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi yêu cầu",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Quản lý đơn hàng</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="orders" className="flex items-center gap-2"><Package className="w-4 h-4" />Đơn hàng</TabsTrigger>
          <TabsTrigger value="warranty" className="flex items-center gap-2"><Shield className="w-4 h-4" />Bảo hành</TabsTrigger>
          <TabsTrigger value="exchange" className="flex items-center gap-2"><RefreshCcw className="w-4 h-4" />Đổi</TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2"><Undo2 className="w-4 h-4" />Trả</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Không có đơn hàng nào</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold">Đơn hàng #{order.id}</h3>
                        <Badge className={getOrderStatusColor(order.status)}>{getOrderStatusText(order.status)}</Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Ngày đặt: {formatDateOnly(order.createdAt)}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Phương thức thanh toán: {getPaymentMethodText(order.paymentMethod)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Địa chỉ: {order.address}
                      </p>
                    </div>
                    {order.status === OrderStatus.PENDING && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleOpenCancelOrder(order.id)}
                        disabled={isCancelling}
                        className="rounded-xl shrink-0"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4 mb-4">
                    {order.products.map((product, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <Link href={`/product/${product.slug}`} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                          <ImageWithFallback 
                            src={getImageUrl(product.imageUrl)} 
                            alt={`${product.productName} - ${product.productVersionName} - ${product.colorName}`} 
                            className="w-full h-full object-cover" 
                          />
                        </Link>
                        <div className="flex-1">
                          <Link href={`/product/${product.slug}`} className="block mb-1 hover:text-primary transition-colors cursor-pointer">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{product.productName} - {product.productVersionName} - {product.colorName}</p>
                              {product.returnRequestType === ReturnRequestType.EXCHANGE && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0">Yêu cầu đổi hàng</Badge>
                              )}
                              {product.returnRequestType === ReturnRequestType.RETURN && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0">Yêu cầu trả hàng</Badge>
                              )}
                              {product.returnRequestType === ReturnRequestType.WARRANTY && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0">Yêu cầu bảo hành</Badge>
                              )}
                            </div>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-1">
                            {product.imeiOrSerial ? (product.imeiOrSerial.startsWith("3") ? `IMEI: ${product.imeiOrSerial}` : `Serial: ${product.imeiOrSerial}`) : ""}
                          </p>
                          <p className="text-sm text-primary font-medium">{formatCurrency(product.price)}</p>
                        </div>
                        {order.status === OrderStatus.DELIVERED && (
                          <div className="flex flex-col gap-2 shrink-0">
                            {!product.returnRequestType && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleOpenModal(order.id, product)} 
                                className="rounded-xl"
                              >
                                Gửi yêu cầu
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenReview(product)} 
                              className="rounded-xl"
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Đánh giá
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 flex items-center justify-between">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span className="text-xl text-primary font-semibold">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="warranty">
          {loadingWarranty ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : warrantyClaims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Không có yêu cầu bảo hành</div>
          ) : (
            <div className="space-y-4">
              {warrantyClaims.map((warranty) => (
                <div key={warranty.id} className="bg-white rounded-2xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold">Mã bảo hành: {warranty.id}</h3>
                        <Badge className={`${getWarrantyStatusColor(warranty.status)} text-white border-0`}>
                          {getWarrantyStatusText(warranty.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng: #{warranty.orderId}</p>
                      <p className="text-sm text-muted-foreground">Ngày gửi: {formatDateOnly(warranty.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Thông tin sản phẩm */}
                  <div className="flex gap-4 items-start mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <ImageWithFallback 
                        src={getImageUrl(warranty.product.imageUrl)} 
                        alt={`${warranty.product.productName} - ${warranty.product.productVersionName} - ${warranty.product.colorName}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-1">{warranty.product.productName} - {warranty.product.productVersionName} - {warranty.product.colorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {warranty.product.imeiOrSerial ? (warranty.product.imeiOrSerial.startsWith("3") ? `IMEI: ${warranty.product.imeiOrSerial}` : `Serial: ${warranty.product.imeiOrSerial}`) : ""}
                      </p>
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Lý do: </span>
                      <span>{warranty.reason || "Không có"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Số điện thoại: </span>
                      <span>{warranty.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Địa chỉ: </span>
                      <span>{warranty.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exchange">
          <div className="text-center py-12 text-muted-foreground">Không có yêu cầu đổi hàng</div>
        </TabsContent>

        <TabsContent value="return">
          {loadingReturn ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : returnRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Không có yêu cầu trả hàng</div>
          ) : (
            <div className="space-y-4">
              {returnRequests.map((returnRequest) => (
                <div key={returnRequest.id} className="bg-white rounded-2xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold">Mã yêu cầu: {returnRequest.id}</h3>
                        <Badge className={`${getReturnStatusColor(returnRequest.status)} text-white border-0`}>
                          {getReturnStatusText(returnRequest.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng: #{returnRequest.orderId}</p>
                      <p className="text-sm text-muted-foreground">Ngày gửi: {formatDateOnly(returnRequest.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Thông tin sản phẩm */}
                  <div className="flex gap-4 items-start mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <ImageWithFallback 
                        src={getImageUrl(returnRequest.product.imageUrl)} 
                        alt={`${returnRequest.product.productName} - ${returnRequest.product.productVersionName} - ${returnRequest.product.colorName}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-1">{returnRequest.product.productName} - {returnRequest.product.productVersionName} - {returnRequest.product.colorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {returnRequest.product.imeiOrSerial ? (returnRequest.product.imeiOrSerial.startsWith("3") ? `IMEI: ${returnRequest.product.imeiOrSerial}` : `Serial: ${returnRequest.product.imeiOrSerial}`) : ""}
                      </p>
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Lý do: </span>
                      <span>{returnRequest.reason || "Không có"}</span>
                    </div>
                    {returnRequest.phoneNumber && (
                      <div>
                        <span className="text-muted-foreground">Số điện thoại: </span>
                        <span>{returnRequest.phoneNumber}</span>
                      </div>
                    )}
                    {returnRequest.address && (
                      <div>
                        <span className="text-muted-foreground">Địa chỉ: </span>
                        <span>{returnRequest.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Popup xác nhận hủy đơn hàng */}
      <Dialog open={isCancelOrderOpen} onOpenChange={setIsCancelOrderOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Xác nhận hủy đơn hàng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Đơn hàng sẽ được hủy và không thể khôi phục. Vui lòng xác nhận nếu bạn chắc chắn muốn tiếp tục.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCancelOrderOpen(false);
                setSelectedOrderId(null);
              }} 
              className="rounded-xl"
              disabled={isCancelling}
            >
              Không hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancelOrder} 
              className="rounded-xl"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <XCircle className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Xác nhận hủy đơn
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup đánh giá */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>Chia sẻ trải nghiệm của bạn về sản phẩm này</DialogDescription>
          </DialogHeader>
          {reviewProduct && (
            <div className="space-y-6">
              <div className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                  <img src={getImageUrl(reviewProduct.imageUrl)} alt={reviewProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate mb-1 font-medium">{reviewProduct.name}</p>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Đánh giá *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {reviewRating === 1 && "Rất không hài lòng"}
                    {reviewRating === 2 && "Không hài lòng"}
                    {reviewRating === 3 && "Bình thường"}
                    {reviewRating === 4 && "Hài lòng"}
                    {reviewRating === 5 && "Rất hài lòng"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="review-comment">Nhận xét (tùy chọn)</Label>
                <Textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                  className="mt-1.5 rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)} className="rounded-xl" disabled={isSubmittingReview}>
              Hủy
            </Button>
            <Button onClick={handleSubmitReview} className="rounded-xl" disabled={isSubmittingReview || reviewRating === 0}>
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu</DialogTitle>
            <DialogDescription>Chọn loại yêu cầu và điền thông tin chi tiết</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                  <img src={getImageUrl(selectedItem.itemImage)} alt={selectedItem.itemName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate mb-1">{selectedItem.itemName}</p>
                  <p className="text-sm text-muted-foreground">{selectedItem.emeiSerial.startsWith("3") ? "IMEI" : "Serial"}: {selectedItem.emeiSerial}</p>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Loại yêu cầu</Label>
                <RadioGroup value={requestType} onValueChange={(value) => setRequestType(value as RequestType)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-xl border hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="warranty" id="warranty" />
                      <Label htmlFor="warranty" className="cursor-pointer flex-1 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Bảo hành</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-xl border hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="exchange" id="exchange" />
                      <Label htmlFor="exchange" className="cursor-pointer flex-1 flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-primary" />Đổi hàng</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-xl border hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="return" id="return" />
                      <Label htmlFor="return" className="cursor-pointer flex-1 flex items-center gap-2"><Undo2 className="w-4 h-4 text-primary" />Trả hàng</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="reason">Lý do *</Label>
                <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mô tả chi tiết lý do của bạn..." className="mt-1.5 rounded-xl min-h-[100px]" />
              </div>
              {(requestType === "warranty" || requestType === "exchange") && (
                <>
                  <div>
                    <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                    <Input 
                      id="phoneNumber" 
                      type="tel"
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      placeholder="Nhập số điện thoại của bạn" 
                      className="mt-1.5 rounded-xl" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Textarea 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Nhập địa chỉ của bạn" 
                      className="mt-1.5 rounded-xl min-h-[80px]" 
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="images">Hình ảnh (tùy chọn)</Label>
                <div className="mt-1.5">
                  <label htmlFor="images" className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click để tải ảnh lên</p>
                    </div>
                    <input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)} 
              className="rounded-xl"
              disabled={isSubmittingRequest}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitRequest} 
              className="rounded-xl"
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




