import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import type { 
  OrderRequest, 
  OrderResponse, 
  UserOrderResponse, 
  UpdateOrderStatusRequest, 
  ReturnRequestRequest,
  WarrantyClaimResponse,
  ReturnRequestResponse
} from "@/types/Order";
import { OrderStatus } from "@/types/Order";

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

/**
 * Lấy danh sách đơn hàng của user hiện tại (cần auth)
 */
export async function getOrderListByCurrentUser(): Promise<UserOrderResponse[]> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.LIST_CURRENT_USER
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách đơn hàng thất bại");
  }
  const result = await response.json();
  return result.data as UserOrderResponse[];
}

/**
 * Hủy đơn hàng (cần auth)
 * @param orderId - ID của đơn hàng cần hủy
 */
export async function cancelOrder(orderId: string): Promise<void> {
  const payload: UpdateOrderStatusRequest = {
    status: OrderStatus.CANCELLED,
  };
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.UPDATE_STATUS(orderId),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Hủy đơn hàng thất bại");
  }
}

/**
 * Tạo yêu cầu trả/đổi/bảo hành (cần auth)
 * @param payload - Thông tin yêu cầu trả/đổi/bảo hành
 */
export async function createReturnRequest(payload: ReturnRequestRequest): Promise<void> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.CREATE_RETURN_REQUEST,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo yêu cầu thất bại");
  }
}

/**
 * Lấy danh sách yêu cầu bảo hành của user hiện tại (cần auth)
 */
export async function getWarrantyClaimListByCurrentUser(): Promise<WarrantyClaimResponse[]> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.WARRANTY_LIST_CURRENT_USER
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách bảo hành thất bại");
  }
  const result = await response.json();
  return result.data as WarrantyClaimResponse[];
}

/**
 * Lấy danh sách yêu cầu trả hàng của user hiện tại (cần auth)
 */
export async function getReturnRequestListByCurrentUser(): Promise<ReturnRequestResponse[]> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.RETURN_LIST_CURRENT_USER
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách trả hàng thất bại");
  }
  const result = await response.json();
  return result.data as ReturnRequestResponse[];
}

