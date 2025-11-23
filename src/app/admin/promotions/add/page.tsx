"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createPromotion } from "@/services/promotionService";
import { getAllProductVersions } from "@/services/productService";
import { ProductVersion } from "@/types/ProductVersion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { promotionFormSchema, PromotionFormValues } from "../validate";
import { ProductSelector } from "../components/ProductSelector";

export default function AddPromotionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      startAt: "",
      endAt: "",
      discount: 0,
      maximumDiscountAmount: undefined,
      productIds: [],
    },
  });

  // Load product versions when page loads
  useEffect(() => {
    const loadVersions = async () => {
      try {
        setLoadingVersions(true);
        const data = await getAllProductVersions();
        setVersions(data);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách phiên bản sản phẩm",
          variant: "destructive",
        });
      } finally {
        setLoadingVersions(false);
      }
    };
    loadVersions();
  }, [toast]);

  // Format datetime-local input value
  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = async (values: PromotionFormValues) => {
    try {
      const startDate = new Date(values.startAt);
      const endDate = new Date(values.endAt);

      const requestData = {
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        discount: values.discount,
        maximumDiscountAmount: values.maximumDiscountAmount || undefined,
        productIds: values.productIds && values.productIds.length > 0 ? values.productIds : undefined,
      };

      await createPromotion(requestData);
      toast({ title: "Thành công", description: "Tạo chương trình giảm giá thành công" });
      router.push("/admin/promotions");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Tạo thất bại",
        variant: "destructive",
      });
    }
  };

  const isLoading = form.formState.isSubmitting;
  const selectedProductIds = form.watch("productIds") || [];

  return (
    <div className="p-8">
      <div className=" ">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Thêm chương trình giảm giá</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Thời gian bắt đầu <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ? formatDateTimeLocal(field.value) : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const date = new Date(e.target.value);
                              field.onChange(date.toISOString());
                            } else {
                              field.onChange("");
                            }
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Thời gian kết thúc <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ? formatDateTimeLocal(field.value) : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const date = new Date(e.target.value);
                              field.onChange(date.toISOString());
                            } else {
                              field.onChange("");
                            }
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phần trăm giảm giá (%) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Nhập phần trăm giảm giá (1-100)"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : 0;
                            field.onChange(value);
                          }}
                          value={field.value || ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximumDiscountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giảm tối đa (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Nhập số tiền giảm tối đa (tùy chọn)"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            field.onChange(value);
                          }}
                          value={field.value || ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Chọn phiên bản sản phẩm áp dụng khuyến mãi */}
              <FormField
                control={form.control}
                name="productIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phiên bản sản phẩm áp dụng khuyến mãi</FormLabel>
                    <FormControl>
                      <ProductSelector
                        versions={versions}
                        selectedVersionIds={field.value || []}
                        onSelectionChange={field.onChange}
                        loading={loadingVersions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

