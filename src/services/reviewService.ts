import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import type { ReviewCreationRequest, ReviewListResponse } from "@/types/Review";

/**
 * Tạo đánh giá sản phẩm (cần auth)
 * @param payload - Thông tin đánh giá
 * @returns ID của đánh giá đã tạo
 */
export async function createReview(payload: ReviewCreationRequest): Promise<string> {
  const response = await AuthService.fetchWithAuth(
    API_CONFIG.ENDPOINTS.REVIEW.CREATE,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Tạo đánh giá thất bại");
  }
  const result = await response.json();
  return result.data as string; // API trả về reviewId (String)
}

/**
 * Lấy danh sách đánh giá công khai theo productVersionId (không cần auth)
 * @param productVersionId - ID của product version
 * @param page - Số trang (mặc định 0)
 * @param size - Kích thước trang (mặc định 10)
 * @param sort - Sắp xếp (tùy chọn)
 * @returns Danh sách đánh giá và thống kê
 */
export async function getReviewList(
  productVersionId: string,
  page: number = 0,
  size: number = 10,
  sort?: string
): Promise<ReviewListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  if (sort) {
    queryParams.append("sort", sort);
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEW.PUBLIC_LIST(productVersionId)}?${queryParams.toString()}`,
    {
      method: "GET",
      cache: 'no-store' // Tắt cache để luôn lấy dữ liệu mới nhất
    }
  );
  
  if (!response.ok) {
    // Kiểm tra xem response có content không trước khi parse
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const error = await response.json();
        throw new Error(error.message || "Lấy danh sách đánh giá thất bại");
      } catch (parseError) {
        throw new Error(`Lỗi HTTP ${response.status}: Lấy danh sách đánh giá thất bại`);
      }
    } else {
      throw new Error(`Lỗi HTTP ${response.status}: Lấy danh sách đánh giá thất bại`);
    }
  }

  // Kiểm tra response có content không
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    throw new Error("Response rỗng từ server");
  }

  try {
    const result = JSON.parse(text);
    return result.data as ReviewListResponse;
  } catch (parseError) {
    console.error("Lỗi parse JSON:", parseError, "Response text:", text);
    throw new Error("Lỗi parse response từ server");
  }
}

