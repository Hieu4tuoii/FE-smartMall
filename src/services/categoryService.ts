import { API_CONFIG } from "@/configs/apiConfig";
import { Category } from "@/types/Category";
import { AuthService } from "./authService";

/**
 * Lấy danh sách tất cả danh mục (không phân trang)
 */
export async function getAllCategories(): Promise<Category[]> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.CATEGORY.ALL);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lấy danh sách danh mục thất bại");
  }

  const result = await response.json();
  return result.data;
}

