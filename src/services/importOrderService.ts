import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import {
  ImportOrderResponse,
  ImportOrderRequest,
  ProductImportSelectResponse,
  ProductImportSelectRequest,
  ProductImportSelectOption,
} from "@/types/ImportOrder";
import { PageResponse } from "@/types/apiTypes";

export class ImportOrderService {
  /**
   * Lấy danh sách đơn nhập với phân trang
   * @param params - Tham số phân trang
   * @returns Danh sách đơn nhập
   */
  static async getList(
    params: { page?: number; size?: number } = {}
  ): Promise<PageResponse<ImportOrderResponse[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", (params.page || 0).toString());
    queryParams.append("size", (params.size || 10).toString());

    const response = await AuthService.fetchWithAuth(
      `${API_CONFIG.ENDPOINTS.IMPORT_ORDER.BASE}?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách đơn nhập thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Lấy danh sách products (level 1)
   * @returns Danh sách products
   */
  static async getProducts(): Promise<ProductImportSelectOption[]> {
    const request: ProductImportSelectRequest = {
      id: null,
      level: 1,
    };
    return this.getProductImportSelect(request);
  }

  /**
   * Lấy danh sách versions của một product (level 2)
   * @param productId - ID của product
   * @returns Danh sách versions
   */
  static async getVersions(productId: string): Promise<ProductImportSelectOption[]> {
    const request: ProductImportSelectRequest = {
      id: productId,
      level: 2,
    };
    return this.getProductImportSelect(request);
  }

  /**
   * Lấy danh sách colors của một version (level 3)
   * @param versionId - ID của version
   * @returns Danh sách colors
   */
  static async getColors(versionId: string): Promise<ProductImportSelectOption[]> {
    const request: ProductImportSelectRequest = {
      id: versionId,
      level: 3,
    };
    return this.getProductImportSelect(request);
  }

  /**
   * Lấy dữ liệu cho các dropdown theo level
   * @param request - Request body với level và id (nếu cần)
   * @returns Danh sách options
   */
  static async getProductImportSelect(
    request: ProductImportSelectRequest
  ): Promise<ProductImportSelectOption[]> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.IMPORT_ORDER.PRODUCT_IMPORT_SELECT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Lấy dữ liệu sản phẩm cho đơn nhập thất bại"
      );
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Tạo đơn nhập mới
   * @param request - Dữ liệu đơn nhập
   * @returns ID của đơn nhập vừa tạo
   */
  static async create(request: ImportOrderRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.IMPORT_ORDER.BASE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tạo đơn nhập thất bại");
    }

    const result = await response.json();
    return result.data;
  }
}

