import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/custom/ProductCard";
import { ProductVersionResponse } from "@/types/ProductVersion";

interface PromotionProductsSectionProps {
  products: ProductVersionResponse[];
}

/**
 * Component hiển thị section sản phẩm đang khuyến mãi
 */
export function PromotionProductsSection({ products }: PromotionProductsSectionProps) {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2>Sản phẩm đang khuyến mãi</h2>
        <Link href={`/search?hasPromotion=true`} className="text-primary flex items-center gap-1 hover:gap-2 transition-all">
          Xem tất cả
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: ProductVersionResponse) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

