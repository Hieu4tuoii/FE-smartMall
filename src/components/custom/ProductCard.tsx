import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductVersionResponse } from "@/types/ProductVersion";
import { getImageUrl } from "@/services/uploadService";

interface ProductCardProps {
  product: ProductVersionResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.discountedPrice ?? product.price ?? 0;
  const originalPrice = product.discountedPrice ? product.price : undefined;

  const discount = originalPrice && originalPrice > price
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              priority={false}
            />
          ) : null}
          {discount > 0 && <Badge className="absolute top-3 left-3 bg-destructive text-white">-{discount}%</Badge>}
        </div>
        <CardContent className="p-4">
          <h3 className="text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <p className="text-sm">{product.averageRating ?? 0}</p>
            <p className="text-xs text-muted-foreground ml-1">| Đã bán {product.totalSold ?? 0}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg text-primary">{formatPrice(Number(price))}</span>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(Number(originalPrice))}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}




