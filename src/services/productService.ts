import { API_CONFIG } from "@/configs/apiConfig";
import { 
  PageParams, 
  PageResponse
} from "@/types/apiTypes";
import { Product, CreateProductRequest } from "@/types/Product";
import { 
  ProductVersion, 
  ProductColorVersion,
  CreateProductVersionRequest,
  CreateProductColorVersionRequest,
  UpdateProductVersionRequest,
  UpdateProductColorVersionRequest,
  ProductVersionResponse
} from "@/types/ProductVersion";
import { ProductItemAdmin, ProductItemStatus } from "@/types/ProductItem";
import { AuthService } from "./authService";


//    * Lấy danh sách sản phẩm với phân trang và tìm kiếm
   
   export async function getProductList(params: PageParams): Promise<PageResponse<Product>> {
     const queryParams = new URLSearchParams();
     if (params.page) queryParams.append("page", params.page.toString());
     if (params.size) queryParams.append("size", params.size.toString());
     if (params.sort) queryParams.append("sort", params.sort);
     if (params.keyword) queryParams.append("keyword", params.keyword);
      const response = await AuthService.fetchWithAuth( `${API_CONFIG.ENDPOINTS.PRODUCT.LIST}?${queryParams.toString()}` );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lấy danh sách sản phẩm thất bại");
      }
  
      const result = await response.json();
      return result.data;
  }

  /**
   * Tạo sản phẩm mới
   */
  export async function createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.CREATE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tạo sản phẩm thất bại");
    }

    const result = await response.json();
    return result.data;
  }

   /**
   * Lấy thông tin sản phẩm theo ID
   */
  export async function getProductById(productId: string): Promise<Product> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.BY_ID(productId),
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy thông tin sản phẩm thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Cập nhật sản phẩm
   */
  export async function updateProduct(productId: string, productData: CreateProductRequest): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.BY_ID(productId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Cập nhật sản phẩm thất bại");
    }
  }

  /**
   * Xóa sản phẩm theo ID
   */
  export async function deleteProduct(productId: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      `${API_CONFIG.ENDPOINTS.PRODUCT.DELETE}/${productId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa sản phẩm thất bại");
    }
  }

  /**
   * Lấy danh sách phiên bản theo productId
   */
  export async function getProductVersions(productId: string): Promise<ProductVersion[]> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.VERSIONS_BY_PRODUCT_ID(productId),
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách phiên bản thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Lấy tất cả phiên bản sản phẩm (cho promotion selector)
   */
  export async function getAllProductVersions(): Promise<ProductVersion[]> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.ALL_VERSIONS,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách phiên bản sản phẩm thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  // ========== PRODUCT VERSION FUNCTIONS ==========

  /**
   * Tạo phiên bản sản phẩm mới
   */
  export async function createProductVersion(versionData: CreateProductVersionRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.VERSION.CREATE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(versionData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tạo phiên bản sản phẩm thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Cập nhật phiên bản sản phẩm
   */
  export async function updateProductVersion(versionId: string, versionData: UpdateProductVersionRequest): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.VERSION.UPDATE(versionId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(versionData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Cập nhật phiên bản sản phẩm thất bại");
    }
  }

  /**
   * Xóa phiên bản sản phẩm
   */
  export async function deleteProductVersion(versionId: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.VERSION.DELETE(versionId),
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa phiên bản sản phẩm thất bại");
    }
  }

  // ========== PRODUCT COLOR VERSION FUNCTIONS ==========

  /**
   * Tạo màu sắc phiên bản sản phẩm mới
   */
  export async function createProductColorVersion(colorData: CreateProductColorVersionRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.COLOR_VERSION.CREATE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(colorData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tạo màu sắc phiên bản thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Cập nhật màu sắc phiên bản sản phẩm
   */
  export async function updateProductColorVersion(colorId: string, colorData: UpdateProductColorVersionRequest): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.COLOR_VERSION.UPDATE(colorId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(colorData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Cập nhật màu sắc phiên bản thất bại");
    }
  }

  /**
   * Xóa màu sắc phiên bản sản phẩm
   */
  export async function deleteProductColorVersion(colorId: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.PRODUCT.COLOR_VERSION.DELETE(colorId),
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa màu sắc phiên bản thất bại");
    }
  }

  /**
   * Tìm kiếm phiên bản sản phẩm công khai (không cần authentication)
   */
  export async function searchPublicProductVersions(params: {
    hasPromotion?: boolean;
    brandIds?: string[];
    categoryIds?: string[];
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<ProductVersionResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params.hasPromotion !== undefined) {
      queryParams.append("hasPromotion", params.hasPromotion.toString());
    }
    if (params.brandIds && params.brandIds.length > 0) {
      params.brandIds.forEach(id => queryParams.append("brandIds", id));
    }
    if (params.categoryIds && params.categoryIds.length > 0) {
      params.categoryIds.forEach(id => queryParams.append("categoryIds", id));
    }
    if (params.keyword) {
      queryParams.append("keyword", params.keyword);
    }
    if (params.minPrice !== undefined && params.minPrice !== null) {
      queryParams.append("minPrice", params.minPrice.toString());
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null) {
      queryParams.append("maxPrice", params.maxPrice.toString());
    }
    if (params.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append("size", params.size.toString());
    }
    if (params.sort) {
      queryParams.append("sort", params.sort);
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT.PUBLIC_VERSION_SEARCH}?${queryParams.toString()}`,
      {
        method: "GET",
        cache: 'no-store' // Tắt cache để luôn lấy dữ liệu mới nhất
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tìm kiếm sản phẩm thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Lấy chi tiết phiên bản sản phẩm công khai theo slug
   */
  export async function getPublicProductVersionDetail(slug: string) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT.PUBLIC_VERSION_BY_SLUG(slug)}`,
      { 
        method: "GET",
        cache: 'no-store' // Tắt cache để luôn lấy dữ liệu mới nhất
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy chi tiết phiên bản sản phẩm thất bại");
    }
    const result = await response.json();
    return result.data;
  }

  /**
   * Lấy danh sách phiên bản sản phẩm liên quan theo slug
   */
  export async function getRelatedPublicProductVersions(slug: string) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT.PUBLIC_VERSION_RELATED(slug)}`,
      { 
        method: "GET",
        cache: 'no-store' // Tắt cache để luôn lấy dữ liệu mới nhất
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách phiên bản liên quan thất bại");
    }
    const result = await response.json();
    return result.data;
  }

  interface GetProductItemsParams {
    colorVersionId: string;
    status?: ProductItemStatus;
    page?: number;
    size?: number;
    sort?: string;
    imeiOrSerial?: string;
  }

  export async function getProductItemsByColorVersionId(params: GetProductItemsParams): Promise<PageResponse<ProductItemAdmin>> {
    const {
      colorVersionId,
      status,
      page,
      size,
      sort,
      imeiOrSerial
    } = params;

    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    if (page !== undefined) queryParams.append("page", page.toString());
    if (size !== undefined) queryParams.append("size", size.toString());
    if (sort) queryParams.append("sort", sort);
    if (imeiOrSerial) queryParams.append("imeiOrSerial", imeiOrSerial);

    const response = await AuthService.fetchWithAuth(
      `${API_CONFIG.ENDPOINTS.PRODUCT.COLOR_VERSION.ITEMS(colorVersionId)}?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách sản phẩm tồn kho thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  