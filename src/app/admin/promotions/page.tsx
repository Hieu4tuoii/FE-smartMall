"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { PromotionResponse } from "@/types/Promotion";
import { getAllPromotions, deletePromotion } from "@/services/promotionService";

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResponse | null>(null);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const list = await getAllPromotions();
      setPromotions(list);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách chương trình giảm giá",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDeleteClick = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (promotion: PromotionResponse) => {
    router.push(`/admin/promotions/edit/${promotion.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;
    try {
      await deletePromotion(selectedPromotion.id);
      toast({ title: "Thành công", description: "Xóa chương trình giảm giá thành công" });
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Xóa thất bại", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const isActive = (promotion: PromotionResponse) => {
    const now = new Date();
    const startAt = new Date(promotion.startAt);
    const endAt = new Date(promotion.endAt);
    return now >= startAt && now <= endAt;
  };

  const getStatusBadge = (promotion: PromotionResponse) => {
    const now = new Date();
    const startAt = new Date(promotion.startAt);
    const endAt = new Date(promotion.endAt);

    if (now < startAt) {
      return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Sắp diễn ra</span>;
    }
    if (now > endAt) {
      return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Đã kết thúc</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Đang diễn ra</span>;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quản lý chương trình giảm giá</h1>
          <Button onClick={() => router.push("/admin/promotions/add")} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm chương trình giảm giá
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian bắt đầu</TableHead>
                  <TableHead>Thời gian kết thúc</TableHead>
                  <TableHead>Giảm giá (%)</TableHead>
                  <TableHead>Giảm tối đa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có chương trình giảm giá nào
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>{formatDateTime(promotion.startAt)}</TableCell>
                      <TableCell>{formatDateTime(promotion.endAt)}</TableCell>
                      <TableCell className="font-medium">{promotion.discount}%</TableCell>
                      <TableCell>{formatCurrency(promotion.maximumDiscountAmount)}</TableCell>
                      <TableCell>{getStatusBadge(promotion)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(promotion)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(promotion)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa chương trình giảm giá?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Chương trình giảm giá sẽ bị vô hiệu hóa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

