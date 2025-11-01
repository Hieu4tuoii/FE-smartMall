import { API_CONFIG } from "@/configs/apiConfig";
import { SupplierRequest, SupplierResponse } from "@/types/Supplier";
import { AuthService } from "./authService";

export class SupplierService {
  static async search(keyword: string = ""): Promise<SupplierResponse[]> {
    const query = new URLSearchParams();
    if (keyword) query.append("keyword", keyword);
    const url = `${API_CONFIG.ENDPOINTS.SUPPLIER.SEARCH}?${query.toString()}`;

    const response = await AuthService.fetchWithAuth(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tìm kiếm nhà cung cấp thất bại");
    }
    const result = await response.json();
    return result.data as SupplierResponse[];
  }

  static async getById(id: string): Promise<SupplierResponse> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.SUPPLIER.BY_ID(id)
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy thông tin nhà cung cấp thất bại");
    }
    const result = await response.json();
    return result.data as SupplierResponse;
  }

  static async create(request: SupplierRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.SUPPLIER.BASE,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tạo nhà cung cấp thất bại");
    }
    const result = await response.json();
    return result.data as string;
  }

  static async update(id: string, request: SupplierRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.SUPPLIER.BY_ID(id),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Cập nhật nhà cung cấp thất bại");
    }
    const result = await response.json();
    return result.data as string;
  }

  static async delete(id: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.SUPPLIER.BY_ID(id),
      { method: "DELETE" }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa nhà cung cấp thất bại");
    }
  }
}
