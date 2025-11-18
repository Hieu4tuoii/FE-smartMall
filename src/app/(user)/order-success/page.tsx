"use client";
import { CheckCircle2, Package, Home } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl mb-4">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground mb-2">Cảm ơn bạn đã mua hàng tại SmartMall</p>
          {orderId && <p className="text-sm text-muted-foreground mb-8">Mã đơn hàng: <span className="text-primary">{orderId}</span></p>}

          <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><span className="text-primary">1</span></div><p>Đơn hàng của bạn đã được tiếp nhận</p></div>
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0"><span className="text-muted-foreground">2</span></div><p className="text-muted-foreground">Chúng tôi sẽ liên hệ để xác nhận đơn hàng</p></div>
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0"><span className="text-muted-foreground">3</span></div><p className="text-muted-foreground">Đơn hàng sẽ được giao trong 2-3 ngày</p></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1 rounded-xl" onClick={() => router.push("/orders")}>
              <Package className="w-4 h-4 mr-2" />
              Xem đơn hàng
            </Button>
            <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={() => router.push("/")}>
              <Home className="w-4 h-4 mr-2" />
              Quay lại trang chủ
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}




