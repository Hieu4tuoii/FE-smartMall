import { API_CONFIG } from "@/configs/apiConfig";
import { Brand } from "@/types/Brand";
import { AuthService } from "./authService";

/**
 * Lấy danh sách tất cả thương hiệu (không phân trang)
 */
export async function getAllBrands(): Promise<Brand[]> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BRAND.ALL);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách thương hiệu thất bại");
  }

  const result = await response.json();
  return result.data;
}

