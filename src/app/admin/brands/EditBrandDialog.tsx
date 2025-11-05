"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandFormSchema, BrandFormValues } from "./validate";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateBrand } from "@/services/brandService";
import { Loader2 } from "lucide-react";
import { BrandResponse } from "@/types/Brand";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  brand: BrandResponse | null;
};

export function EditBrandDialog({ open, onOpenChange, onSuccess, brand }: Props) {
  const { toast } = useToast();
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (brand) {
      form.reset({ name: brand.name });
    } else {
      form.reset({ name: "" });
    }
  }, [brand, form]);

  const onSubmit = async (values: BrandFormValues) => {
    if (!brand) return;
    try {
      await updateBrand(brand.id, values);
      toast({ title: "Thành công", description: "Cập nhật thương hiệu thành công" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error?.message || "Cập nhật thương hiệu thất bại", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thương hiệu</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thương hiệu</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Samsung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


