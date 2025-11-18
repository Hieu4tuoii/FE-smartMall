"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCartDetail, updateCartItem } from "@/services/cartService";
import type { CartResponse, CartItemResponse } from "@/types/Cart";
import { getImageUrl } from "@/services/uploadService";
import { toast } from "@/hooks/use-toast";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

/**
 * Trang giỏ hàng - hiển thị danh sách sản phẩm trong giỏ hàng
 */
export default function CartPage() {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  // Lấy dữ liệu giỏ hàng từ API
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const data = await getCartDetail();
        setCartData(data);
      } catch (error: any) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
        toast({
          title: "Lỗi",
          description: error?.message || "Không thể tải dữ liệu giỏ hàng",
          variant: "destructive",
        });
        setCartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  /**
   * Giảm số lượng sản phẩm trong giỏ hàng
   * Truyền quantity: -1
   */
  const handleDecreaseQuantity = async (item: CartItemResponse) => {
    try {
      setUpdating(item.id);
      await updateCartItem({
        productColorVersionId: item.productColorVersionId,
        quantity: -1,
      });
      // Lấy lại dữ liệu giỏ hàng sau khi cập nhật
      const data = await getCartDetail();
      setCartData(data);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể giảm số lượng sản phẩm",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  /**
   * Tăng số lượng sản phẩm trong giỏ hàng
   * Truyền quantity: 1
   */
  const handleIncreaseQuantity = async (item: CartItemResponse) => {
    try {
      setUpdating(item.id);
      await updateCartItem({
        productColorVersionId: item.productColorVersionId,
        quantity: 1,
      });
      // Lấy lại dữ liệu giỏ hàng sau khi cập nhật
      const data = await getCartDetail();
      setCartData(data);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể tăng số lượng sản phẩm",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * Truyền quantity = -quantity ban đầu
   */
  const handleRemoveItem = async (item: CartItemResponse) => {
    try {
      setUpdating(item.id);
      await updateCartItem({
        productColorVersionId: item.productColorVersionId,
        quantity: -item.quantity,
      });
      // Lấy lại dữ liệu giỏ hàng sau khi xóa
      const data = await getCartDetail();
      setCartData(data);
    } catch (error: any) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể xóa sản phẩm khỏi giỏ hàng",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6">Giỏ hàng</h1>
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!cartData || cartData.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6">Giỏ hàng</h1>
        <p className="text-muted-foreground">Chưa có sản phẩm trong giỏ hàng.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-6">Giỏ hàng ({cartData.totalItem} sản phẩm)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartData.cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-2xl">
              <img 
                src={item.imageUrl ? getImageUrl(item.imageUrl) : "/placeholder.png"} 
                alt={item.productName} 
                className="w-20 h-20 object-cover rounded-xl" 
              />
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.productVersionName} - {item.colorName}
                </p>
                <p className="text-sm text-primary font-semibold mt-1">
                  {formatPrice(item.totalPrice)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleDecreaseQuantity(item)}
                  disabled={updating === item.id}
                >
                  -
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleIncreaseQuantity(item)}
                  disabled={updating === item.id}
                >
                  +
                </Button>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => handleRemoveItem(item)}
                disabled={updating === item.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Xóa
              </Button>
            </div>
          ))}
        </div>
        <div className="p-6 border rounded-2xl h-fit">
          <div className="flex items-center justify-between mb-4">
            <span>Tổng tiền</span>
            <span className="text-lg text-primary font-bold">{formatPrice(cartData.totalPrice)}</span>
          </div>
          <Button 
            className="w-full rounded-xl mb-2" 
            onClick={() => router.push("/checkout")}
          >
            Đặt hàng ngay
          </Button>
          <Button 
            variant="outline"
            className="w-full rounded-xl" 
            onClick={() => router.push("/")}
          >
            Tiếp tục mua hàng
          </Button>
        </div>
      </div>
    </div>
  );
}


