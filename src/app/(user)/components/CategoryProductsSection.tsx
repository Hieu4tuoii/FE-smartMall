import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/custom/ProductCard";
import { ProductVersionResponse } from "@/types/ProductVersion";
import { CategoryResponse } from "@/types/Category";

interface CategoryProductsSectionProps {
  category: CategoryResponse;
  products: ProductVersionResponse[];
}

/**
 * Component hiển thị section sản phẩm theo category
 */
export function CategoryProductsSection({ category, products }: CategoryProductsSectionProps) {

  return (
    <section className="py-12 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2>{category.name}</h2>
        <Link
          href={`/search?categoryIds=${category.id}`}
          className="text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          Xem thêm
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

