import { API_CONFIG } from "@/configs/apiConfig";
import { CategoryRequest, CategoryResponse } from "@/types/Category";
import { Category } from "@/types/Category";
import { AuthService } from "./authService";

/**
 * Lấy tất cả danh mục không phân trang
 */
export async function listAllCategories(): Promise<CategoryResponse[]> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.ALL}`, {
    method: "GET",
    cache: 'no-store' // Tắt cache để luôn lấy dữ liệu mới nhất
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Không thể tải danh sách danh mục");
  return data.data as CategoryResponse[];
}

export async function listAllCategoriesWithCache(): Promise<CategoryResponse[]> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.ALL}`, {
    method: "GET",
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Không thể tải danh sách danh mục");
  return data.data as CategoryResponse[];
}
/**
 * Tạo danh mục
 */
export async function createCategory(payload: CategoryRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.CATEGORY.LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo danh mục thất bại");
  }
  const result = await response.json();
  return result.data as string;
}

/**
 * Cập nhật danh mục
 */
export async function updateCategory(id: string, payload: CategoryRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.CATEGORY.BY_ID(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật danh mục thất bại");
  }
  const result = await response.json();
  return result.data as string;
}

/**
 * Xóa danh mục
 */
export async function deleteCategory(id: string): Promise<void> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.CATEGORY.BY_ID(id), { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Xóa danh mục thất bại");
  }
}

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

