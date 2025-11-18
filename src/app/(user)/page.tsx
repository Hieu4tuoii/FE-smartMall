import BannerCarousel from "@/components/custom/BannerCarousel";
import { PromotionProductsSection } from "@/app/(user)/components/PromotionProductsSection";
import { CategoryProductsSection } from "@/app/(user)/components/CategoryProductsSection";
import { listBanners } from "@/services/bannerService";
import { listAllCategoriesWithCache } from "@/services/categoryService";
import { searchPublicProductVersions } from "@/services/productService";
import { ProductVersionResponse } from "@/types/ProductVersion";
import { CategoryResponse } from "@/types/Category";

export default async function Page() {
  const banners = await listBanners();
  
  // Fetch sản phẩm đang khuyến mãi và categories cùng lúc
  const [promoProductsResponse, allCategories] = await Promise.all([
    searchPublicProductVersions({
      hasPromotion: true,
      page: 0,
      size: 4,
      sort: "totalSold:desc",
    }),
    listAllCategoriesWithCache(),
  ]);

  // Lấy trực tiếp danh sách items từ API, không cần map
  const promoProducts = promoProductsResponse.items as ProductVersionResponse[];

  // Lấy 3 category đầu tiên
  const topCategories = allCategories.slice(0, 3);

  // Fetch sản phẩm cho từng category cùng lúc
  const categoryProductsPromises = topCategories.map(async (category) => {
    const productsResponse = await searchPublicProductVersions({
      categoryIds: [category.id],
      page: 0,
      size: 5,
      sort: "totalSold:desc",
    });
    return {
      category,
      products: productsResponse.items as ProductVersionResponse[],
    };
  });

  const categoryProductsData = await Promise.all(categoryProductsPromises);

  return (
    <div className="min-h-screen">
      <section className="relative">
        <BannerCarousel banners={banners} />
      </section>

      <div className="container mx-auto px-4">
        <PromotionProductsSection products={promoProducts} />
        
        {categoryProductsData.map(({ category, products }) => (
          products.length > 0 && (
            <CategoryProductsSection 
              key={category.id} 
              category={category} 
              products={products} 
            />
          )
        ))}
      </div>
    </div>
  );
}

