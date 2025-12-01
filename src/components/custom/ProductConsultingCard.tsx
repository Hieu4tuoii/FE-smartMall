"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductVersionWithColors } from "@/types/Chat";
import { getImageUrl } from "@/services/uploadService";
import { formatCurrency } from "@/utils/commonUtils";

interface ProductConsultingCardProps {
  product: ProductVersionWithColors;
}

/**
 * Component hiển thị card sản phẩm trong chat với khả năng chọn màu và kiểm tra tồn kho
 */
export function ProductConsultingCard({ product }: ProductConsultingCardProps) {
  const price = product.discountedPrice ?? product.price ?? 0;
  const originalPrice = product.discountedPrice ? product.price : undefined;

  const discount = originalPrice && originalPrice > price
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  // Auto select màu có tồn kho khi component mount hoặc product thay đổi
  useEffect(() => {
    if (!product.productColorVersions || product.productColorVersions.length === 0) {
      setSelectedColorId(null);
      return;
    }

    // Kiểm tra màu đầu tiên: nếu có tồn kho thì chọn màu đầu tiên
    const firstColor = product.productColorVersions[0];
    if (firstColor && (firstColor.totalStock ?? 0) > 0) {
      setSelectedColorId(firstColor.id);
      return;
    }

    // Nếu màu đầu tiên hết hàng, tìm màu tiếp theo có tồn kho
    const availableColor = product.productColorVersions.find(
      (color) => (color.totalStock ?? 0) > 0
    );
    
    // Nếu tìm thấy màu có tồn kho thì chọn, nếu không thì không chọn màu nào (null)
    if (availableColor) {
      setSelectedColorId(availableColor.id);
    } else {
      setSelectedColorId(null);
    }
  }, [product.productColorVersions]);

  const selectedColor = product.productColorVersions?.find(
    (color) => color.id === selectedColorId
  );

  const isColorAvailable = (colorId: string) => {
    const color = product.productColorVersions?.find((c) => c.id === colorId);
    return (color?.totalStock ?? 0) > 0;
  };

  return (
    <Card className="overflow-hidden border shadow-sm rounded-lg max-w-[280px]">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
            priority={false}
          />
        ) : null}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-white text-[10px] px-1.5 py-0.5">
            -{discount}%
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs mb-1.5 line-clamp-2 min-h-[2rem] hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <p className="text-xs">{product.averageRating ?? 0}</p>
          <p className="text-[10px] text-muted-foreground ml-1">
            | Đã bán {product.totalSold ?? 0}
          </p>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(Number(price))}
          </span>
          {originalPrice && Number(originalPrice) > Number(price) && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(Number(originalPrice))}
            </span>
          )}
        </div>

        {/* Chọn màu sắc */}
        {product.productColorVersions && product.productColorVersions.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-muted-foreground mb-1.5">Chọn màu sắc:</p>
            <div className="flex flex-wrap gap-1.5">
              {product.productColorVersions.map((color) => {
                const stock = color.totalStock ?? 0;
                const isOutOfStock = stock <= 0;
                const isSelected = selectedColorId === color.id;

                return (
                  <button
                    key={color.id}
                    onClick={() => !isOutOfStock && setSelectedColorId(color.id)}
                    disabled={isOutOfStock}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border-2 text-[10px] font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isOutOfStock
                        ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={isOutOfStock ? "Hết hàng" : `Tồn kho: ${stock}`}
                  >
                    <span>{color.color}</span>
                    {isSelected && !isOutOfStock && (
                      <Check className="w-2.5 h-2.5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedColor && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Tồn kho: {selectedColor.totalStock ?? 0} sản phẩm
              </p>
            )}
            {!selectedColor && (
              <p className="text-[10px] text-destructive mt-1.5">
                Tất cả màu đều hết hàng
              </p>
            )}
          </div>
        )}

        <Link href={`/product/${product.slug}`}>
          <Button
            className="w-full h-8 text-xs"
            disabled={!selectedColorId || !isColorAvailable(selectedColorId)}
          >
            Xem chi tiết
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

