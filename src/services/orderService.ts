import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import type { OrderRequest, OrderResponse } from "@/types/Order";

/**
 * Tạo đơn hàng mới (cần auth)
 */
export async function createOrder(payload: OrderRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.CREATE,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo đơn hàng thất bại");
  }
  const result = await response.json();
  return result.data as string; // API trả về orderId (String)
}

