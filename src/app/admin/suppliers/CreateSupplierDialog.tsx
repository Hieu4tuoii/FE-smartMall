"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SupplierRequest } from "@/types/Supplier";
import { SupplierService } from "@/services/supplierService";

interface CreateSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateSupplierDialog({ open, onOpenChange, onSuccess }: CreateSupplierDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<SupplierRequest>({ name: "", email: "", phoneNumber: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await SupplierService.create(form);
      toast({ title: "Thành công", description: "Tạo nhà cung cấp thành công" });
      onOpenChange(false);
      onSuccess();
      setForm({ name: "", email: "", phoneNumber: "" });
    } catch (error: any) {
      toast({ 
        title: "Lỗi", 
        description: error.message || "Tạo thất bại", 
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm nhà cung cấp</DialogTitle>
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
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
