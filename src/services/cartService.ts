import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import type { UpdateCartItemRequest } from "@/types/ProductVersion";
import type { CartResponse } from "@/types/Cart";

/**
 * Lấy số lượng sản phẩm trong giỏ hàng (cần auth)
 */
export async function getCartCount(): Promise<number> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.CART.COUNT,
    { method: "GET" }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy số lượng giỏ hàng thất bại");
  }
  const result = await response.json();
  return result.data as number;
}

/**
 * Cập nhật/thêm sản phẩm vào giỏ hàng (cần auth)
 */
export async function updateCartItem(payload: UpdateCartItemRequest) {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.CART.UPDATE,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật giỏ hàng thất bại");
  }
  const result = await response.json();
  return result.data;
}

/**
 * Lấy thông tin chi tiết giỏ hàng (cần auth)
 */
export async function getCartDetail(): Promise<CartResponse> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.CART.DETAIL,
    { method: "GET" }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy thông tin giỏ hàng thất bại");
  }
  const result = await response.json();
  return result.data as CartResponse;
}

