"use client";
import { useEffect, useMemo, useState } from "react";
import type { ProductVersionDetailResponse, ProductVersionResponse } from "@/types/ProductVersion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/custom/ProductCard";
import { Star, ShieldCheck, RefreshCw, Plus, Minus, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateCartItem } from "@/services/cartService";
import { getImageUrl } from "@/services/uploadService";
import Link from "next/link";
import ReviewsSection from "./ReviewsSection";
import type { ReviewListResponse } from "@/types/Review";

type Props = {
  detail: ProductVersionDetailResponse;
  related: ProductVersionResponse[];
  reviewsData: ReviewListResponse;
};

export default function ProductVersionDetail({ detail, related, reviewsData }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Tìm màu đầu tiên còn hàng (totalStock > 0)
  const firstAvailableColorId = useMemo(() => {
    const available = detail.productColorVersions?.find(
      (color) => (color.totalStock ?? 0) > 0
    );
    return available?.id || detail.productColorVersions?.[0]?.id || "";
  }, [detail.productColorVersions]);

  const [selectedColorId, setSelectedColorId] = useState<string>(firstAvailableColorId);

  useEffect(() => {
    // Set màu đầu tiên còn hàng khi mount
    setSelectedColorId(firstAvailableColorId);
  }, [firstAvailableColorId]);

  const selectedColor = useMemo(() => {
    return detail.productColorVersions.find(c => c.id === selectedColorId);
  }, [detail.productColorVersions, selectedColorId]);

  const formatPrice = (price?: number) =>
    typeof price === "number"
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
      : "";

  const specsEntries = useMemo(() => {
    if (!detail.specifications) return [] as { key: string; value: string }[];
    try {
      if (typeof detail.specifications === "string") {
        const parsed = JSON.parse(detail.specifications);
        if (Array.isArray(parsed)) {
          return parsed.flatMap((obj: Record<string, string>) =>
            Object.entries(obj).map(([key, value]) => ({ key, value }))
          );
        }
        return Object.entries(parsed as Record<string, string>).map(([key, value]) => ({ key, value }));
      }
      return detail.specifications.flatMap((obj) => Object.entries(obj).map(([key, value]) => ({ key, value })));
    } catch {
      return [] as { key: string; value: string }[];
    }
  }, [detail.specifications]);

  const averageRating = detail.averageRating ?? 5;

  const handleAddToCart = async () => {
    if (!selectedColorId) {
      toast({ title: "Vui lòng chọn màu sắc" });
      return;
    }
    try {
      await updateCartItem({ productColorVersionId: selectedColorId, quantity });
      toast({ title: "Đã thêm vào giỏ hàng" });
    } catch (e: any) {
      toast({ title: e?.message || "Thêm giỏ hàng thất bại", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
            <Image
              src={getImageUrl(detail.imageUrls?.[selectedImage] || "")}
              alt={detail.name}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {detail.imageUrls?.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${idx === selectedImage ? "border-primary" : "border-transparent"}`}>
                <Image
                  src={getImageUrl(img)}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="mb-4">{detail.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            {typeof detail.totalRating === "number" && (
              <span className="text-muted-foreground">{detail.totalRating} đánh giá</span>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl text-primary">{formatPrice(detail.discountedPrice ?? detail.price)}</span>
              {detail.discount && detail.discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(detail.price)}</span>
                  <Badge variant="destructive">-{Math.round(detail.discount)}%</Badge>
                </>
              )}
            </div>
          </div>

          {/* Hiển thị số lượng tồn kho của màu đang chọn ngay trên tiêu đề Phiên bản */}
          <div className="mb-2">
            {selectedColor && (
              <span className="text-sm text-muted-foreground">Kho: {Number(selectedColor.totalStock ?? 0)}</span>
            )}
          </div>

          {detail.productVersionNames && detail.productVersionNames.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3">Phiên bản</h4>
              <div className="flex flex-wrap gap-2">
                {detail.productVersionNames.map((v) => {
                  const isCurrent = v.slug === detail.slug;
                  return (
                    <Link
                      key={v.id}
                      href={`/product/${v.slug}`}
                      className={`px-4 py-2 rounded-xl transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {v.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {detail.productColorVersions && detail.productColorVersions.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3">Màu sắc</h4>
              <div className="flex flex-wrap gap-3">
                {detail.productColorVersions.map((color) => {
                  const isSelected = selectedColorId === color.id;
                  const stock = Number(color.totalStock ?? 0);
                  const isOutOfStock = stock <= 0;
                  return (
                    <button
                      key={color.id}
                      onClick={() => !isOutOfStock && setSelectedColorId(color.id)}
                      disabled={isOutOfStock}
                      className={`flex flex-col items-start gap-1 px-4 py-2 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-primary"
                          : isOutOfStock
                          ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{color.color}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      {/* {isOutOfStock && (
                        <span className="text-xs text-gray-400">Hết hàng</span>
                      )} */}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="mb-3">Số lượng</h4>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-xl">
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
              <span className="text-sm">Bảo hành {detail.warrantyPeriod ?? 12} tháng</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <RefreshCw className="w-6 h-6 text-primary shrink-0" />
              <span className="text-sm">Đổi trả 7 ngày nếu lỗi</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handleAddToCart} className="flex-1 rounded-xl">Thêm vào giỏ hàng</Button>
            <Button size="lg" disabled className="flex-1 rounded-xl">Mua ngay</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specs" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
          <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-6">
          <div className="bg-white rounded-2xl border p-6">
            <table className="w-full">
              <tbody>
                {specsEntries.map(({ key, value }) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground w-1/3">{key}</td>
                    <td className="py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="description" className="mt-6">
          <div className="bg-white rounded-2xl border p-6">
            <div className="whitespace-pre-line">{detail.description}</div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Section đánh giá */}
      <ReviewsSection reviewsData={reviewsData} />

      {related && related.length > 0 && (
        <section>
          <h2 className="mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


