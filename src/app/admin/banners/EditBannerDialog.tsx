"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerFormSchema, BannerFormValues } from "./validate";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateBanner } from "@/services/bannerService";
import { uploadImage, getImageUrl } from "@/services/uploadService";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { BannerResponse } from "@/types/Banner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  banner: BannerResponse | null;
};

export function EditBannerDialog({ open, onOpenChange, onSuccess, banner }: Props) {
  const { toast } = useToast();
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (banner) {
      setValue("imageUrl", banner.imageUrl || "");
      setValue("link", banner.link || "");
    } else {
      reset({ imageUrl: "", link: "" });
    }
  }, [banner, setValue, reset]);

  const onSubmit = async (values: BannerFormValues) => {
    if (!banner) return;
    try {
      await updateBanner(banner.id, values);
      toast({ title: "Thành công", description: "Cập nhật banner thành công" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error?.message || "Cập nhật banner thất bại", variant: "destructive" });
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
      setValue("imageUrl", url, { shouldValidate: true });
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
          <DialogTitle>Chỉnh sửa banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ảnh banner *</Label>
            <div className="border rounded-lg p-4 space-y-3">
              <Input type="hidden" {...register("imageUrl")} />
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
            {errors.imageUrl && <p className="text-sm text-red-600">{errors.imageUrl.message}</p>}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label>Link     </Label>
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
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


