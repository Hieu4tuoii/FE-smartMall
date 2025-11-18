import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "@/services/authService";
import { BrandRequest, BrandResponse } from "@/types/Brand";

/**
 * Lấy tất cả thương hiệu không phân trang
 */
export async function listAllBrands(): Promise<BrandResponse[]> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BRAND.ALL}`, {
    method: "GET",
    cache: 'no-store' // Tắt cache để luôn lấy dữ liệu mới nhất
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Không thể tải danh sách thương hiệu");
  return data.data as BrandResponse[];
}

export async function listAllBrandsWithCache(): Promise<BrandResponse[]> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BRAND.ALL}`, {
    method: "GET",
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Không thể tải danh sách thương hiệu");
  return data.data as BrandResponse[];
}

/**
 * Tạo thương hiệu
 */
export async function createBrand(payload: BrandRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BRAND.LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo thương hiệu thất bại");
  }
  const result = await response.json();
  return result.data as string;
}

/**
 * Cập nhật thương hiệu
 */
export async function updateBrand(id: string, payload: BrandRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BRAND.BY_ID(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật thương hiệu thất bại");
  }
  const result = await response.json();
  return result.data as string;
}

/**
 * Xóa thương hiệu
 */
export async function deleteBrand(id: string): Promise<void> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BRAND.BY_ID(id), { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Xóa thương hiệu thất bại");
  }
}
