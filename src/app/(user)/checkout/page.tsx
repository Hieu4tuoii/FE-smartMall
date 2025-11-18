"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/custom/figma/ImageWithFallback";
import { createOrder } from "@/services/orderService";
import { PaymentMethod } from "@/types/Order";
import { getCartDetail } from "@/services/cartService";
import type { CartResponse } from "@/types/Cart";
import { getImageUrl } from "@/services/uploadService";

export default function CheckoutPage() {
  const router = useRouter();

  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ phone: "", address: "", note: "", paymentMethod: "cash" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const shippingFee = 30000;
  const total = (cartData?.totalPrice || 0) + shippingFee;

  // Lấy dữ liệu giỏ hàng từ API
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const data = await getCartDetail();
        setCartData(data);
        
        // Nếu giỏ hàng rỗng, redirect về trang cart
        if (data.cartItems.length === 0) {
          router.push("/cart");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
        // Nếu lỗi, redirect về trang cart
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [router]);

  /**
   * Xử lý submit form đặt hàng
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Map paymentMethod từ frontend sang enum backend
      const paymentMethod = formData.paymentMethod === "bank_transfer" 
        ? PaymentMethod.BANK_TRANSFER 
        : PaymentMethod.CASH;

      // Gọi API tạo đơn hàng
      const orderId = await createOrder({
        phoneNumber: formData.phone,
        address: formData.address,
        note: formData.note || undefined,
        paymentMethod: paymentMethod,
      });

      // Chuyển hướng theo phương thức thanh toán
      if (formData.paymentMethod === "bank_transfer") {
        router.push(`/payment/qr?orderId=${orderId}&amount=${total}`);
      } else {
        router.push(`/order-success`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8">Đặt hàng</h1>
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!cartData || cartData.cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Đặt hàng</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="mb-6">Thông tin khách hàng</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input id="phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1.5 rounded-xl" placeholder="Nhập số điện thoại" />
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                  <Textarea id="address" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1.5 rounded-xl" rows={3} placeholder="Nhập địa chỉ chi tiết" />
                </div>
                <div>
                  <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
                  <Textarea id="note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="mt-1.5 rounded-xl" rows={2} placeholder="Ghi chú cho người bán" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6">
              <h3 className="mb-6">Phương thức thanh toán</h3>
              <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <div className="flex items-center space-x-3 p-4 rounded-xl border hover:border-primary cursor-pointer transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                      <div>Thanh toán khi nhận hàng</div>
                      <div className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border hover:border-primary cursor-pointer transition-colors">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <div>Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-muted-foreground">Chuyển khoản qua QR code</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border p-6 sticky top-24">
              <h3 className="mb-6">Đơn hàng của bạn</h3>
              <div className="space-y-4 mb-6">
                {cartData.cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <ImageWithFallback 
                        src={item.imageUrl ? getImageUrl(item.imageUrl) : "/placeholder.png"} 
                        alt={item.productName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.productVersionName} - {item.colorName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.quantity} x {formatPrice(item.totalPrice / item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(cartData.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex items-center justify-between mb-6">
                <span>Tổng cộng</span>
                <span className="text-2xl text-primary">{formatPrice(total)}</span>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                  {error}
                </div>
              )}
              <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}




