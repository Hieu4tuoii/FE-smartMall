import { API_CONFIG } from "@/configs/apiConfig";
import { BannerRequest, BannerResponse } from "@/types/Banner";
import { AuthService } from "@/services/authService";


export async function listBanners(): Promise<BannerResponse[]> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BANNER.ALL}`, {
    method: "GET",
    // Revalidate cache after 60 seconds to ensure up-to-date banners
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Không thể tải danh sách banner");
  return data.data as BannerResponse[];
}

export async function createBanner(payload: BannerRequest): Promise<string> {
  // Transform: chuyển chuỗi rỗng thành null
  const transformedPayload = {
    ...payload,
    link: payload.link && payload.link.trim() !== "" ? payload.link.trim() : null,
  };
  
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BANNER.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transformedPayload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo banner thất bại");
  }

  const result = await response.json();
  return result.data as string;
}

export async function updateBanner(id: string, payload: BannerRequest): Promise<string> {
  // Transform: chuyển chuỗi rỗng thành null
  const transformedPayload = {
    ...payload,
    link: payload.link && payload.link.trim() !== "" ? payload.link.trim() : null,
  };
  
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BANNER.UPDATE(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transformedPayload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Cập nhật banner thất bại");
  }

  const result = await response.json();
  return result.data as string;
}

export async function deleteBanner(id: string): Promise<void> {
  const response = await AuthService.fetchWithAuth(API_CONFIG.ENDPOINTS.BANNER.DELETE(id), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Xóa banner thất bại");
  }
}


