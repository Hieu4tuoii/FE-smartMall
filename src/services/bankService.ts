import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";

/**
 * Kiểm tra trạng thái thanh toán của đơn hàng qua ngân hàng (cần auth)
 */
export async function checkPaymentStatus(orderId: string): Promise<boolean> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.BANK.CHECK(orderId),
    { method: "GET" }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không thể kiểm tra trạng thái thanh toán");
  }

  const result = await response.json();
  return Boolean(result.data);
}

