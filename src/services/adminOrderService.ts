import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import {
  AdminOrderResponse,
  AdminOrderDetailResponse,
  OrderStatus,
  UpdateOrderStatusRequest,
  WarrantyClaimResponse,
  ReturnRequestResponse,
  WarrantyStatus,
  ReturnRequestStatus,
  UpdateWarrantyStatusRequest,
  UpdateReturnRequestStatusRequest,
} from "@/types/Order";
import { PageResponse } from "@/types/apiTypes";

/**
 * Lấy danh sách đơn hàng với phân trang và filter (admin)
 * @param params - Tham số phân trang và filter
 * @returns Danh sách đơn hàng
 */
export async function getAdminOrderList(params: {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  status?: OrderStatus;
}): Promise<PageResponse<AdminOrderResponse>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", (params.page || 0).toString());
  queryParams.append("size", (params.size || 10).toString());
  queryParams.append("sort", params.sort || "modifiedAt:desc");
  
  if (params.keyword) {
    queryParams.append("keyword", params.keyword);
  }
  
  if (params.status !== undefined) {
    queryParams.append("status", params.status);
  }

  const response = await AuthService.fetchWithAuth(
    `${API_CONFIG.ENDPOINTS.ORDER.LIST}?${queryParams.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách đơn hàng thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Lấy chi tiết đơn hàng theo ID (admin)
 * @param id - ID của đơn hàng
 * @returns Chi tiết đơn hàng
 */
export async function getAdminOrderById(id: string): Promise<AdminOrderDetailResponse> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.DETAIL(id)
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy thông tin đơn hàng thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Cập nhật trạng thái đơn hàng
 * @param id - ID đơn hàng
 * @param payload - Thông tin trạng thái mới
 */
export async function updateAdminOrderStatus(
  id: string,
  payload: UpdateOrderStatusRequest,
): Promise<void> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.UPDATE_STATUS(id),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật trạng thái đơn hàng thất bại");
  }
}

/**
 * Lấy danh sách yêu cầu bảo hành với phân trang và filter (admin)
 * @param params - Tham số phân trang và filter
 * @returns Danh sách yêu cầu bảo hành
 */
export async function getAdminWarrantyList(params: {
  page?: number;
  size?: number;
  sort?: string;
  status?: WarrantyStatus;
}): Promise<PageResponse<WarrantyClaimResponse>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", (params.page || 0).toString());
  queryParams.append("size", (params.size || 10).toString());
  queryParams.append("sort", params.sort || "createdAt:desc");
  
  if (params.status !== undefined) {
    queryParams.append("status", params.status);
  }

  const response = await AuthService.fetchWithAuth(
    `${API_CONFIG.ENDPOINTS.ORDER.ADMIN_WARRANTY_LIST}?${queryParams.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách bảo hành thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Lấy danh sách yêu cầu trả hàng với phân trang và filter (admin)
 * @param params - Tham số phân trang và filter
 * @returns Danh sách yêu cầu trả hàng
 */
export async function getAdminReturnList(params: {
  page?: number;
  size?: number;
  sort?: string;
  status?: ReturnRequestStatus;
}): Promise<PageResponse<ReturnRequestResponse>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", (params.page || 0).toString());
  queryParams.append("size", (params.size || 10).toString());
  queryParams.append("sort", params.sort || "createdAt:desc");
  
  if (params.status !== undefined) {
    queryParams.append("status", params.status);
  }

  const response = await AuthService.fetchWithAuth(
    `${API_CONFIG.ENDPOINTS.ORDER.ADMIN_RETURN_LIST}?${queryParams.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách trả hàng thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Cập nhật trạng thái bảo hành (admin)
 * @param id - ID yêu cầu bảo hành
 * @param payload - Thông tin trạng thái mới
 */
export async function updateAdminWarrantyStatus(
  id: string,
  payload: UpdateWarrantyStatusRequest,
): Promise<void> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.ADMIN_WARRANTY_UPDATE_STATUS(id),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật trạng thái bảo hành thất bại");
  }
}

/**
 * Cập nhật trạng thái trả hàng (admin)
 * @param id - ID yêu cầu trả hàng
 * @param payload - Thông tin trạng thái mới
 */
export async function updateAdminReturnStatus(
  id: string,
  payload: UpdateReturnRequestStatusRequest,
): Promise<void> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.ORDER.ADMIN_RETURN_UPDATE_STATUS(id),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật trạng thái trả hàng thất bại");
  }
}

