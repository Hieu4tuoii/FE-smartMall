"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SupplierRequest, SupplierResponse } from "@/types/Supplier";
import { SupplierService } from "@/services/supplierService";

interface EditSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierResponse | null;
  onSuccess: () => void;
}

export function EditSupplierDialog({ open, onOpenChange, supplier, onSuccess }: EditSupplierDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<SupplierRequest>({ name: "", email: "", phoneNumber: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      setForm({ name: supplier.name, email: supplier.email, phoneNumber: supplier.phoneNumber });
    }
  }, [supplier]);

  const handleSubmit = async () => {
    if (!supplier) return;
    try {
      setSubmitting(true);
      await SupplierService.update(supplier.id, form);
      toast({ title: "Thành công", description: "Cập nhật nhà cung cấp thành công" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Cập nhật thất bại", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật nhà cung cấp</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tên nhà cung cấp</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nhập tên nhà cung cấp"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              placeholder="0123456789"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
