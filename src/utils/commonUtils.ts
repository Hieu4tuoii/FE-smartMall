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


