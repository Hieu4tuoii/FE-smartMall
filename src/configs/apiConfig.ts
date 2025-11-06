// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: "/api/auth/sign-in",
      SIGN_UP: "/api/auth/sign-up",
      CONFIRM_OTP: "/api/auth/confirm-otp",
      REGISTER_INFO: "/api/auth/register-information",
    },
    USER: {
      CUSTOMERS: "/user/customer",
      EMPLOYEES: "/user/employee",
      EMPLOYEE_BY_ID: (id: string) => `/user/employee/${id}`,
    },
    PRODUCT: {
      LIST: "/product/list",
      BY_ID: (id: string) => `/product/${id}`,
      DELETE: "/product",
      CREATE: "/product",
      VERSIONS_BY_PRODUCT_ID: (id: string) => `/product/${id}/versions`,
      ALL_VERSIONS: "/product/versions/all", // Lấy tất cả versions của tất cả products
      PUBLIC_VERSION_SEARCH: "/product/public/version/search", // Tìm kiếm phiên bản sản phẩm công khai
      PUBLIC_VERSION_BY_SLUG: (slug: string) => `/product/public/version/${slug}`,
      PUBLIC_VERSION_RELATED: (slug: string) => `/product/public/version/${slug}/related`,
      VERSION: {
        CREATE: "/product/version",
        UPDATE: (id: string) => `/product/version/${id}`,
        DELETE: (id: string) => `/product/version/${id}`,
      },
      COLOR_VERSION: {
        CREATE: "/product/color-version",
        UPDATE: (id: string) => `/product/color-version/${id}`,
        DELETE: (id: string) => `/product/color-version/${id}`,
      },
    },
    CART: {
      COUNT: "/cart/count",
      UPDATE: "/cart/update",
    },
    BRAND: {
      LIST: "/brand",
      ALL: "/brand/public/all",
      BY_ID: (id: string) => `/brand/${id}`,
    },
    SUPPLIER: {
      BASE: "/supplier",
      BY_ID: (id: string) => `/supplier/${id}`,
      SEARCH: "/supplier/search",
    },
    CATEGORY: {
      LIST: "/category",
      ALL: "/category/public/all",
      BY_ID: (id: string) => `/category/${id}`,
    },
    BANNER: {
      // GET /banner/all - Lấy danh sách banner không phân trang
      ALL: "/banner/public/all",
      // POST /banner - Tạo banner
      CREATE: "/banner",
      // PUT /banner/{id} - Cập nhật banner
      UPDATE: (id: string) => `/banner/${id}`,
      // DELETE /banner/{id} - Xóa banner
      DELETE: (id: string) => `/banner/${id}`,
    },
    IMPORT_ORDER: {
      BASE: "/import-order",
      BY_ID: (id: string) => `/import-order/${id}`,
      PRODUCT_IMPORT_SELECT: "/import-order/product-import-select",
    },
    PROMOTION: {
      // GET /promotion - Lấy danh sách tất cả chương trình giảm giá (không phân trang)
      LIST: "/promotion",
      // GET /promotion/{id} - Lấy thông tin chương trình giảm giá theo ID
      BY_ID: (id: string) => `/promotion/${id}`,
      // POST /promotion - Tạo mới chương trình giảm giá
      CREATE: "/promotion",
      // PUT /promotion/{id} - Cập nhật chương trình giảm giá
      UPDATE: (id: string) => `/promotion/${id}`,
      // DELETE /promotion/{id} - Xóa chương trình giảm giá (soft delete)
      DELETE: (id: string) => `/promotion/${id}`,
    },
  },
} as const;

