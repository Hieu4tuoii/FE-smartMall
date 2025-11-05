"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerFormSchema, BannerFormValues } from "./validate";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createBanner } from "@/services/bannerService";
import { uploadImage, getImageUrl } from "@/services/uploadService";
import { Loader2, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CreateBannerDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    control,
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { 
      imageUrl: "", 
      link: "", 
    },
  });

  const imageUrlValue = watch("imageUrl");

  const onSubmit = async (values: BannerFormValues) => {
    try {
      await createBanner(values);
      toast({ title: "Thành công", description: "Tạo banner thành công" });
      onOpenChange(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error?.message || "Tạo banner thất bại", variant: "destructive" });
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Lỗi", description: "Vui lòng chọn file ảnh", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Lỗi", description: "Kích thước file tối đa 5MB", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const url = await uploadImage(file);
      // Ghi vào form để submit có imageUrl
      setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true });
      toast({ title: "Thành công", description: "Upload ảnh thành công" });
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Upload thất bại", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ảnh banner *</Label>
            {/* Hiển thị preview nếu đã có imageUrl */}
            {/** @ts-ignore */}
            {/** errors type could be undefined safe-checked below */}
            <div className="border rounded-lg p-4">
              {/** @ts-ignore value access via getValues not available here; rely on formState via watch would be better, but keep simple: store via reset -> register still holds value */}
              {/* Dùng input hidden để giữ giá trị imageUrl trong form */}
              <Input type="hidden" {...register("imageUrl")} />
              {/* Hiển thị preview thông qua getImageUrl với giá trị từ input hidden bằng cách đọc trực tiếp từ DOM không tiện; thay vào đó, render điều kiện dựa trên lỗi: nếu không lỗi và đã set trong form qua reset, input hidden có giá trị và chúng ta vẫn cần một preview.
                  Đơn giản: thêm một input text readOnly để nhìn giá trị và nút thay ảnh; và block preview nếu có string non-empty */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handlePickFile} className="gap-2">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Đang upload..." : "Chọn ảnh"}
                  </Button>
                </div>
                {imageUrlValue ? (
                  <div className="relative h-24 w-48 overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getImageUrl(imageUrlValue)} alt="preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border-2 border-dashed rounded text-gray-500">
                    <ImageIcon className="h-5 w-5 mr-2" /> Chưa chọn ảnh
                  </div>
                )}
              </div>
            </div>
            {errors.imageUrl && <p className="text-sm text-red-600">{errors.imageUrl.message}</p>}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label>Link</Label>
            <Controller
              name="link"
              control={control}
              render={({ field }) => (
                <Input 
                  placeholder="/duong-dan" 
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
            {errors.link && <p className="text-sm text-red-600">{errors.link.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


