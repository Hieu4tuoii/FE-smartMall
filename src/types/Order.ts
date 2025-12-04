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

// Enum cho loại yêu cầu trả/đổi/bảo hành
export enum ReturnRequestType {
  EXCHANGE = "EXCHANGE",
  RETURN = "RETURN",
  WARRANTY = "WARRANTY",
}

// Enum cho trạng thái bảo hành
export enum WarrantyStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_WARRANTY = "IN_WARRANTY",
  RETURNING = "RETURNING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Enum cho trạng thái trả hàng
export enum ReturnRequestStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REFUNDING = "REFUNDING",
  REFUNDED = "REFUNDED",
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

// Interface cho ProductOrderResponse từ API /order/list/current-user (user)
export interface UserProductOrderResponse {
  orderItemId: string;
  productName: string;
  productVersionName: string;
  colorName: string;
  price: number;
  imeiOrSerial: string;
  imageUrl: string;
  slug: string;
  returnRequestType?: ReturnRequestType;
}

// Interface cho OrderResponse từ API /order/list/current-user (user)
export interface UserOrderResponse {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  note?: string;
  address: string;
  phoneNumber: string;
  products: UserProductOrderResponse[];
  createdAt: string;
  modifiedAt: string;
}

// Request tạo yêu cầu trả/đổi/bảo hành
export interface ReturnRequestRequest {
  orderItemId: string;
  returnRequestType: ReturnRequestType;
  reason?: string;
  phoneNumber?: string;
  address?: string;
}

// Interface cho thông tin sản phẩm trong yêu cầu bảo hành/trả hàng
export interface ProductWarrantyResponse {
  orderItemId: string;
  productName: string;
  productVersionName: string;
  colorName: string;
  imeiOrSerial: string;
  imageUrl: string;
}

export interface ProductReturnResponse {
  orderItemId: string;
  productName: string;
  productVersionName: string;
  colorName: string;
  imeiOrSerial: string;
  imageUrl: string;
}

// Interface cho yêu cầu bảo hành
export interface WarrantyClaimResponse {
  id: string;
  orderId: string;
  status: WarrantyStatus;
  reason: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  product: ProductWarrantyResponse;
}

// Interface cho yêu cầu trả hàng
export interface ReturnRequestResponse {
  id: string;
  orderId: string;
  status: ReturnRequestStatus;
  reason: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  product: ProductReturnResponse;
}

// Request cập nhật trạng thái bảo hành
export interface UpdateWarrantyStatusRequest {
  status: WarrantyStatus;
}

// Request cập nhật trạng thái trả hàng
export interface UpdateReturnRequestStatusRequest {
  status: ReturnRequestStatus;
}

