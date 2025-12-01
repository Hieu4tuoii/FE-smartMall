"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QrCode, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { checkPaymentStatus } from "@/services/bankService";
import { ImageWithFallback } from "@/components/custom/figma/ImageWithFallback";

const POLLING_INTERVAL = 5000;

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function QRPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const paymentAmount = amount ? Number(amount) : 0;

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success">("pending");
  const [pollingError, setPollingError] = useState<string | null>(null);
  const hasClearedCartRef = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const qrImageUrl = useMemo(() => {
    if (!orderId || !paymentAmount) return null;
    return `https://qr.sepay.vn/img?acc=02227912102004&bank=MB&amount=${paymentAmount}&des=${orderId}&template=qronly&download=DOWNLOAD`;
  }, [orderId, paymentAmount]);

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;

    const pollPaymentStatus = async () => {
      try {
        const isPaid = await checkPaymentStatus(orderId);
        if (!isMounted) return;

        if (isPaid) {
          setPaymentStatus("success");
          setPollingError(null);
          if (!hasClearedCartRef.current) {
            clearCart();
            hasClearedCartRef.current = true;
          }
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
      } catch (error: any) {
        if (!isMounted) return;
        setPollingError(error?.message || "Không thể kiểm tra trạng thái thanh toán, hệ thống sẽ thử lại.");
      }
    };

    pollPaymentStatus();
    pollingRef.current = setInterval(pollPaymentStatus, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [orderId, clearCart]);

  const handleComplete = () => {
    if (orderId) {
      router.push(`/order-success?orderId=${orderId}`);
    } else {
      router.push("/orders");
    }
  };

  if (!orderId || !paymentAmount) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-white border rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1>Không tìm thấy thông tin thanh toán</h1>
          <p className="text-muted-foreground">
            Vui lòng quay lại trang giỏ hàng để thực hiện đặt hàng lại.
          </p>
          <Button className="rounded-xl" onClick={() => router.push("/cart")}>
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border p-8">
          <div className="text-center mb-8">
            <h1 className="mb-2">Thanh toán đơn hàng</h1>
            <p className="text-muted-foreground">
              Quét mã QR bằng ứng dụng ngân hàng để hoàn tất thanh toán trực tuyến
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-white border-2 rounded-2xl p-6 mb-4 flex items-center justify-center">
                {paymentStatus === "pending" && qrImageUrl ? (
                  <ImageWithFallback
                    src={qrImageUrl}
                    alt="QR thanh toán SmartMall"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full bg-green-50 rounded-xl flex flex-col items-center justify-center"
                  >
                    <CheckCircle2 className="w-24 h-24 text-green-600 mb-4" />
                    <p className="text-green-600">Thanh toán thành công!</p>
                  </motion.div>
                )}
              </div>
              {paymentStatus === "pending" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Hệ thống tự động kiểm tra thanh toán mỗi 5 giây</span>
                </div>
              ) : (
                <Badge className="bg-green-600 text-white">Đã xác nhận thanh toán</Badge>
              )}
              {pollingError && (
                <p className="text-xs text-destructive mt-2 text-center px-4">
                  {pollingError}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="mb-4">Thông tin đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-mono text-xs md:text-sm break-all">{orderId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span className="text-lg text-primary">
                      {formatPrice(paymentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge className={paymentStatus === "success" ? "bg-green-500" : "bg-yellow-500"}>
                      {paymentStatus === "success" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <h4 className="mb-3">Thông tin chuyển khoản</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ngân hàng:</p>
                    <p>MB Bank (Ngân hàng Quân đội)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số tài khoản:</p>
                    <p className="font-mono text-base">02227912102004</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chủ tài khoản:</p>
                    <p>SMARTMALL</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nội dung chuyển khoản:</p>
                    <p className="font-mono text-xs md:text-sm break-all">{orderId}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <p>• Mã QR đã bao gồm số tiền và nội dung chuyển khoản.</p>
                  <p>• Vui lòng không chỉnh sửa nội dung để hệ thống tự động đối soát.</p>
                </div>
              </div>
            </div>
          </div>

          {paymentStatus === "success" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Button size="lg" className="w-full rounded-xl" onClick={handleComplete}>
                Xem trạng thái đơn hàng
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}




