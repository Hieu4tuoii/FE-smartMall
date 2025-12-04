import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import type { PageResponse } from "@/types/apiTypes";
import type {
  UserChatRequest,
  ChatHistoryResponse,
} from "@/types/Chat";

/**
 * Service xử lý các API liên quan đến chat
 */
export class ChatService {
  private static baseUrl = API_CONFIG.BASE_URL;

  /**
   * Gửi tin nhắn chat và nhận phản hồi
   * @param request - Nội dung tin nhắn
   * @returns Phản hồi từ chatbot
   */
  static async sendMessage(request: UserChatRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.CHAT.SEND,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gửi tin nhắn thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Lấy lịch sử chat với phân trang
   * @param page - Số trang (mặc định 0)
   * @param size - Kích thước trang (mặc định 20)
   * @returns Danh sách lịch sử chat
   */
  static async getChatHistory(
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<ChatHistoryResponse>> {
    const response = await AuthService.fetchWithAuth(
      `${API_CONFIG.ENDPOINTS.CHAT.HISTORY}?page=${page}&size=${size}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy lịch sử chat thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Xóa toàn bộ lịch sử chat của user hiện tại
   */
  static async deleteAllChatHistory(): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.CHAT.DELETE_HISTORY,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa lịch sử chat thất bại");
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán từ chat history
   * @param chatHistoryId - ID của chat history chứa QR code thanh toán
   * @returns true nếu thanh toán thành công, false nếu chưa thanh toán
   */
  static async checkPaymentStatus(chatHistoryId: number): Promise<boolean> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.CHAT.PAYMENT_STATUS(chatHistoryId),
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Kiểm tra trạng thái thanh toán thất bại");
    }

    const result = await response.json();
    return Boolean(result.data);
  }
}

