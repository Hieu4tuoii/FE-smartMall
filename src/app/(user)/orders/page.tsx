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
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/custom/figma/ImageWithFallback";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/services/uploadService";
import { getOrderListByCurrentUser, cancelOrder } from "@/services/orderService";
import { createReview } from "@/services/reviewService";
import { getPublicProductVersionDetail } from "@/services/productService";
import type { UserOrderResponse } from "@/types/Order";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/Order";
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

const mockWarranties = [
  { id: "BH1729075200001", productName: "iPhone 14 Pro", startDate: "2024-10-16", endDate: "2025-10-16", status: "active", statusText: "Còn hạn" },
];

type RequestType = "warranty" | "exchange" | "return";
interface SelectedItem { orderId: string; itemName: string; itemImage: string; emeiSerial: string; }

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [requestType, setRequestType] = useState<RequestType>("warranty");
  const [reason, setReason] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [orders, setOrders] = useState<UserOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
      itemName, 
      itemImage: item.imageUrl || "", 
      emeiSerial: item.imeiOrSerial || "" 
    });
    setRequestType("warranty");
    setReason("");
    setImages([]);
    setIsModalOpen(true);
  }
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setImages([...images, ...Array.from(e.target.files)]);
  }
  function handleRemoveImage(index: number) { setImages(images.filter((_, i) => i !== index)); }
  function handleSubmitRequest() {
    if (!reason.trim()) { toast({ title: "Vui lòng nhập lý do", variant: "destructive" }); return; }
    const requestTypeText = { warranty: "bảo hành", exchange: "đổi", return: "trả" }[requestType];
    toast({ title: `Đã gửi yêu cầu ${requestTypeText} thành công` });
    setIsModalOpen(false);
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
                            <p className="font-medium">{product.productName} - {product.productVersionName} - {product.colorName}</p>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-1">
                            {product.imeiOrSerial ? (product.imeiOrSerial.startsWith("3") ? `IMEI: ${product.imeiOrSerial}` : `Serial: ${product.imeiOrSerial}`) : ""}
                          </p>
                          <p className="text-sm text-primary font-medium">{formatCurrency(product.price)}</p>
                        </div>
                        {order.status === OrderStatus.DELIVERED && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenModal(order.id, product)} 
                              className="rounded-xl"
                            >
                              Gửi yêu cầu
                            </Button>
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
          <div className="space-y-4">
            {mockWarranties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Không có sản phẩm bảo hành</div>
            ) : (
              mockWarranties.map((warranty) => (
                <div key={warranty.id} className="bg-white rounded-2xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="mb-2">{warranty.productName}</h3>
                      <p className="text-sm text-muted-foreground">Mã bảo hành: {warranty.id}</p>
                    </div>
                    <Badge className={warranty.status === "active" ? "bg-green-500" : "bg-gray-500"}>{warranty.statusText}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Ngày bắt đầu:</span><p>{warranty.startDate}</p></div>
                    <div><span className="text-muted-foreground">Ngày hết hạn:</span><p>{warranty.endDate}</p></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="exchange"><div className="text-center py-12 text-muted-foreground">Không có yêu cầu đổi hàng</div></TabsContent>
        <TabsContent value="return"><div className="text-center py-12 text-muted-foreground">Không có yêu cầu trả hàng</div></TabsContent>
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSubmitRequest} className="rounded-xl">Gửi yêu cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




