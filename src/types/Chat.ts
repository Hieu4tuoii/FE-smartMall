import { ProductVersionResponse } from "./ProductVersion";

/**
 * Interface cho ToolCall trong chat history
 */
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Interface cho ProductColorVersion trong chat response (có modifiedAt thay vì updatedAt)
 */
export interface ChatProductColorVersion {
  id: string;
  color: string;
  sku: string;
  productVersionId: string;
  totalStock?: number;
  totalSold?: number;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Interface cho ChatHistoryResponse từ API
 */
export interface ChatHistoryResponse {
  id: number | null;
  content: string | null;
  role: "user" | "assistant" | "product_consulting" | "qr_code" | "payment_success";
  toolCalls: ToolCall[] | null;
  toolCallId: string | null;
  createdAt: string | null;
  productVersions: ProductVersionWithColors[] | null;
}

/**
 * Interface cho ProductVersion trong chat (có productColorVersions)
 */
export interface ProductVersionWithColors extends ProductVersionResponse {
  productColorVersions: ChatProductColorVersion[];
}

/**
 * Interface cho request gửi tin nhắn chat
 */
export interface UserChatRequest {
  content: string;
}

