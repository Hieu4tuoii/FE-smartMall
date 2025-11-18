// Enum cho phương thức thanh toán
export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

// Enum cho trạng thái đơn hàng
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// Enum cho trạng thái thanh toán
export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  CANCELLED = "CANCELLED",
}

// Interface cho OrderRequest gửi lên API (tạo đơn hàng)
export interface OrderRequest {
  phoneNumber: string;
  address: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

// Interface cho OrderResponse từ API (tạo đơn hàng)
export interface OrderResponse {
  orderId: string;
}

// Interface cho CustomerOrderResponse
export interface CustomerOrderResponse {
  id: string;
  name: string;
  phoneNumber: string;
}

// Interface cho ProductOrderResponse (dùng trong danh sách)
export interface ProductOrderResponse {
  id: string;
  orderItemId?: string;
  productName: string;
  productVersionName: string;
  colorName: string;
  quantity: number;
}

// Interface cho ProductOrderDetailResponse (dùng trong chi tiết)
export interface ProductOrderDetailResponse {
  id?: string;
  orderItemId: string;
  productName: string;
  productVersionName: string;
  colorName: string;
  price: number;
  imeiOrSerial: string;
}

// Interface cho OrderResponse từ API /order/list (admin)
export interface AdminOrderResponse {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  customer: CustomerOrderResponse;
  products: ProductOrderResponse[];
  createdAt: string;
  modifiedAt: string;
}

// Interface cho OrderDetailResponse từ API /order/detail/{id} (admin)
export interface AdminOrderDetailResponse {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  note?: string;
  address: string;
  phoneNumber: string;
  customer: CustomerOrderResponse;
  products: ProductOrderDetailResponse[];
  createdAt: string;
  modifiedAt: string;
}

// Payload cập nhật IMEI/Serial cho từng order item khi đổi trạng thái
export interface ProductItemImeiPayload {
  orderItemId: string;
  imeiOrSerial: string;
}

// Request cập nhật trạng thái đơn hàng
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  productItemImeiList?: ProductItemImeiPayload[];
}

