import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import { PromotionResponse, PromotionRequest } from "@/types/Promotion";

/**
 * Lấy danh sách tất cả chương trình giảm giá (không phân trang)
 * Sắp xếp theo thời gian tạo mới nhất lên đầu
 * GET /promotion
 * @returns Danh sách chương trình giảm giá
 */
export async function getAllPromotions(): Promise<PromotionResponse[]> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.PROMOTION.LIST);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách chương trình giảm giá thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Lấy thông tin chương trình giảm giá theo ID
 * GET /promotion/{id}
 * @param id ID của chương trình giảm giá
 * @returns Thông tin chương trình giảm giá
 */
export async function getPromotionById(id: string): Promise<PromotionResponse> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.PROMOTION.BY_ID(id));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy thông tin chương trình giảm giá thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Tạo mới chương trình giảm giá
 * POST /promotion
 * @param request Dữ liệu chương trình giảm giá
 * @returns ID của chương trình giảm giá vừa tạo
 */
export async function createPromotion(request: PromotionRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.PROMOTION.CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo chương trình giảm giá thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Cập nhật chương trình giảm giá
 * PUT /promotion/{id}
 * @param id ID của chương trình giảm giá
 * @param request Dữ liệu cập nhật
 * @returns ID của chương trình giảm giá đã cập nhật
 */
export async function updatePromotion(id: string, request: PromotionRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.PROMOTION.UPDATE(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật chương trình giảm giá thất bại");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Xóa chương trình giảm giá (soft delete)
 * DELETE /promotion/{id}
 * @param id ID của chương trình giảm giá
 */
export async function deletePromotion(id: string): Promise<void> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.PROMOTION.DELETE(id), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Xóa chương trình giảm giá thất bại");
  }
}
