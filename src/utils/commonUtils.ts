/**
 * Format số tiền thành định dạng VNĐ
 * @param amount - Số tiền cần format
 * @returns Chuỗi đã format theo định dạng VNĐ
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format ngày tháng thành định dạng Việt Nam
 * @param dateString - Chuỗi ngày tháng (ISO string hoặc có thể parse được bởi Date)
 * @returns Chuỗi ngày tháng đã format theo định dạng vi-VN
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format ngày tháng thành định dạng Việt Nam (chỉ ngày, không có giờ)
 * @param dateString - Chuỗi ngày tháng (ISO string hoặc có thể parse được bởi Date)
 * @returns Chuỗi ngày tháng đã format theo định dạng vi-VN
 */
export function formatDateOnly(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Chuyển chuỗi thành slug thân thiện URL
 * @param value Chuỗi nguồn
 * @returns Chuỗi slug đã chuẩn hóa
 */
export function stringToSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Lấy màu badge theo trạng thái đơn hàng
 * @param status - Trạng thái đơn hàng
 * @returns Class CSS cho màu badge
 */
export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "DELIVERED": return "bg-green-500";
    case "SHIPPING": return "bg-blue-500";
    case "CONFIRMED":
    case "PENDING": return "bg-yellow-500";
    case "CANCELLED": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

/**
 * Lấy text hiển thị theo trạng thái đơn hàng
 * @param status - Trạng thái đơn hàng
 * @returns Text hiển thị
 */
export function getOrderStatusText(status: string): string {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "SHIPPING": return "Đang giao";
    case "DELIVERED": return "Đã giao";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}

/**
 * Lấy text hiển thị theo phương thức thanh toán
 * @param method - Phương thức thanh toán
 * @returns Text hiển thị
 */
export function getPaymentMethodText(method: string): string {
  switch (method) {
    case "CASH": return "Tiền mặt";
    case "BANK_TRANSFER": return "Chuyển khoản";
    default: return method;
  }
}

/**
 * Lấy text hiển thị theo trạng thái thanh toán
 * @param status - Trạng thái thanh toán
 * @returns Text hiển thị
 */
export function getPaymentStatusText(status: string): string {
  switch (status) {
    case "PAID": return "Đã thanh toán";
    case "UNPAID": return "Chưa thanh toán";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}

/**
 * Lấy màu badge theo trạng thái thanh toán
 * @param status - Trạng thái thanh toán
 * @returns Class CSS cho màu badge
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "PAID": return "bg-green-500";
    case "UNPAID": return "bg-yellow-500";
    case "CANCELLED": return "bg-red-500";
    default: return "bg-gray-500";
  }
}


