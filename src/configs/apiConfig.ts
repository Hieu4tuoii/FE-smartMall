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
        ITEMS: (id: string) => `/product/color-version/${id}/items`,
      },
    },
    CART: {
      COUNT: "/cart/count",
      UPDATE: "/cart/update",
      DETAIL: "/cart/detail",
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
    ORDER: {
      // POST /order/create - Tạo đơn hàng
      CREATE: "/order/create",
      // GET /order/list - Lấy danh sách đơn hàng (admin)
      LIST: "/order/list",
      // GET /order/list/current-user - Lấy danh sách đơn hàng của user hiện tại
      LIST_CURRENT_USER: "/order/list/current-user",
      // GET /order/detail/{id} - Lấy chi tiết đơn hàng (admin)
      DETAIL: (id: string) => `/order/detail/${id}`,
      // PUT /order/update-status/{id} - Cập nhật trạng thái đơn hàng (admin)
      UPDATE_STATUS: (id: string) => `/order/update-status/${id}`,
    },
    BANK: {
      // GET /bank/check/{orderId} - Kiểm tra trạng thái thanh toán banking
      CHECK: (orderId: string) => `/bank/check/${orderId}`,
    },
    REVIEW: {
      // POST /review/create - Tạo đánh giá
      CREATE: "/review/create",
      // GET /review/public/list/{productVersionId} - Lấy danh sách đánh giá công khai
      PUBLIC_LIST: (productVersionId: string) => `/review/public/list/${productVersionId}`,
    },
    CHAT: {
      // POST /chat/ - Gửi tin nhắn chat
      SEND: "/chat/",
      // GET /chat/history - Lấy lịch sử chat
      HISTORY: "/chat/history",
      // DELETE /chat/history - Xóa toàn bộ lịch sử chat
      DELETE_HISTORY: "/chat/history",
      // GET /chat/payment-status/{chatHistoryId} - Kiểm tra trạng thái thanh toán
      PAYMENT_STATUS: (chatHistoryId: number) => `/chat/payment-status/${chatHistoryId}`,
    },
  },
} as const;

