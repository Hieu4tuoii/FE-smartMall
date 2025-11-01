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
    BRAND: {
      LIST: "/brand",
      ALL: "/brand/all",
      BY_ID: (id: string) => `/brand/${id}`,
    },
    SUPPLIER: {
      BASE: "/supplier",
      BY_ID: (id: string) => `/supplier/${id}`,
      SEARCH: "/supplier/search",
    },
    CATEGORY: {
      LIST: "/category",
      ALL: "/category/all",
      BY_ID: (id: string) => `/category/${id}`,
    },
    IMPORT_ORDER: {
      BASE: "/import-order",
      PRODUCT_IMPORT_SELECT: "/import-order/product-import-select",
    },
  },
} as const;

