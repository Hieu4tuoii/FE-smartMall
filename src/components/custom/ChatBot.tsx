"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { MessageCircle, X, Send, Trash2, Loader2, CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ChatService } from "@/services/chatService";
import type { ChatHistoryResponse } from "@/types/Chat";
import { ProductConsultingCard } from "./ProductConsultingCard";
import { useAuth } from "@/contexts/AuthContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

/**
 * Component ChatBot - Floating button và popup chat window
 * Chỉ hiển thị khi user đã đăng nhập
 */
export function ChatBot() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatHistoryResponse[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingReloadRef = useRef(false);

  /**
   * Scroll đến tin nhắn cuối cùng
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Lấy lịch sử chat khi mở popup
   * @param shouldScroll - Có scroll xuống cuối sau khi load không (mặc định true)
   */
  const loadChatHistory = useCallback(async (shouldScroll: boolean = true) => {
    setIsLoadingHistory(true);
    try {
      const response = await ChatService.getChatHistory(0, 20);
      // API trả về items là array, nhưng trong response có thể là array của array
      const chatMessages = Array.isArray(response.items) ? response.items : [];
      setMessages(chatMessages);
      
      // Chỉ scroll khi được yêu cầu (không scroll khi reload do polling)
      if (shouldScroll) {
        setTimeout(scrollToBottom, 100);
      } else {
        // Đánh dấu đang reload do polling để không scroll trong useEffect
        isPollingReloadRef.current = true;
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử chat",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  /**
   * Xử lý mở/đóng popup
   */
  const handleToggleOpen = () => {
    if (!isOpen) {
      loadChatHistory();
    }
    setIsOpen(!isOpen);
  };

  /**
   * Gửi tin nhắn
   */
  const handleSendMessage = async () => {
    const trimmedContent = inputValue.trim();
    if (!trimmedContent || isLoading) return;

    const userMessage: ChatHistoryResponse = {
      id: null,
      content: trimmedContent,
      role: "user",
      toolCalls: null,
      toolCallId: null,
      createdAt: new Date().toISOString(),
      productVersions: null,
    };

    // Thêm tin nhắn user vào danh sách ngay lập tức
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Gửi tin nhắn và nhận phản hồi
      await ChatService.sendMessage({ content: trimmedContent });
      
      // Reload lịch sử để lấy phản hồi từ server
      const response = await ChatService.getChatHistory(0, 20);
      const chatMessages = Array.isArray(response.items) ? response.items : [];
      setMessages(chatMessages);
      
      scrollToBottom();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi tin nhắn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xóa toàn bộ lịch sử chat
   */
  const handleDeleteHistory = async () => {
    try {
      await ChatService.deleteAllChatHistory();
      setMessages([]);
      toast({
        title: "Thành công",
        description: "Đã xóa toàn bộ lịch sử chat",
      });
    } catch (error: any) {
      console.error("Error deleting chat history:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa lịch sử chat",
        variant: "destructive",
      });
    }
  };

  /**
   * Xử lý phím Enter để gửi tin nhắn
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto focus input khi mở popup
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Scroll đến cuối khi có tin nhắn mới (chỉ khi không phải reload do polling)
  useEffect(() => {
    // Không scroll nếu đang reload do polling payment status
    if (!isPollingReloadRef.current) {
      scrollToBottom();
    } else {
      // Reset flag sau khi đã skip scroll
      isPollingReloadRef.current = false;
    }
  }, [messages]);

  /**
   * Polling payment status khi có QR code
   * Gọi API payment-status mỗi 5s đến khi trả về true, sau đó reload history
   */
  useEffect(() => {
    // Tìm message có role qr_code và có id
    const qrCodeMessage = messages.find(
      (msg) => msg.role === "qr_code" && msg.id !== null && msg.content
    );

    if (!qrCodeMessage || !qrCodeMessage.id) {
      // Dừng polling nếu không có QR code
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Kiểm tra xem đã có payment_success chưa, nếu có thì không cần polling nữa
    const hasPaymentSuccess = messages.some((msg) => msg.role === "payment_success");
    if (hasPaymentSuccess) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const pollPaymentStatus = async () => {
      try {
        const isPaid = await ChatService.checkPaymentStatus(qrCodeMessage.id!);
        if (!isMounted) return;

        if (isPaid) {
          // Dừng polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          // Reload lịch sử chat để lấy message payment_success (không scroll)
          await loadChatHistory(false);
        }
      } catch (error: any) {
        if (!isMounted) return;
        console.error("Error checking payment status:", error);
        // Không hiển thị toast để tránh spam, chỉ log lỗi
      }
    };

    // Gọi ngay lập tức lần đầu
    pollPaymentStatus();
    // Sau đó gọi mỗi 5s
    pollingRef.current = setInterval(pollPaymentStatus, 5000);

    return () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [messages, loadChatHistory]);

  /**
   * Render tin nhắn theo role
   */
  const renderMessage = (message: ChatHistoryResponse, index: number) => {
    const isUser = message.role === "user";
    const isProductConsulting = message.role === "product_consulting";
    const isQrCode = message.role === "qr_code";
    const isPaymentSuccess = message.role === "payment_success";

    // Hiển thị payment success với icon check trong ô vuông (giống màn QR payment)
    if (isPaymentSuccess) {
      return (
        <div key={index} className="flex justify-start mb-4">
          <div className="max-w-[200px] w-full aspect-square bg-white border-2 rounded-2xl p-6 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full h-full bg-green-50 rounded-xl flex flex-col items-center justify-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-600 mb-3" />
              <p className="text-green-600 font-medium text-xs">Thanh toán thành công!</p>
            </motion.div>
          </div>
        </div>
      );
    }

    // Hiển thị QR code
    if (isQrCode && message.content) {
      return (
        <div key={index} className="flex justify-start mb-4">
          <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
            <div className="space-y-2">
              <div className="w-full max-w-[200px] aspect-square bg-white border-2 rounded-lg p-3 flex items-center justify-center relative">
                <ImageWithFallback
                  src={message.content}
                  alt="QR thanh toán"
                  className="object-contain rounded"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isProductConsulting && message.productVersions && message.productVersions.length > 0) {
      return (
        <div key={index} className="flex justify-start mb-4">
          <div className="flex flex-row gap-3 overflow-x-auto max-w-full pb-2">
            {message.productVersions.map((product, productIndex) => (
              <div key={productIndex} className="flex-shrink-0">
                <ProductConsultingCard product={product} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!message.content) return null;

    return (
      <div
        key={index}
        className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  };

  // Không hiển thị nếu chưa đăng nhập hoặc đang loading
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleToggleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Mở chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-5 right-6 z-50 w-[500px] max-w-[85vw] h-[600px] flex flex-col bg-background border rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Trợ lý SmartMall</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteHistory}
                title="Xóa lịch sử"
                className="h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleOpen}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
              </div>
            ) : (
              <>
                {messages.map((message, index) => renderMessage(message, index))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

