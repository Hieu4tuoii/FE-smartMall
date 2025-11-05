import { searchPublicProductVersions } from "@/services/productService";
import { listAllCategoriesWithCache } from "@/services/categoryService";
import { listAllBrandsWithCache } from "@/services/brandService";
import { SearchContent } from "./components/SearchContent";
import { ProductVersionResponse } from "@/types/ProductVersion";

interface SearchPageProps {
  searchParams: {
    keyword?: string;
    q?: string; // Alias cho keyword
    hasPromotion?: string;
    promo?: string; // Alias cho hasPromotion
    categoryIds?: string;
    brandIds?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    size?: string;
    sort?: string;
  };
}

/**
 * Server component fetch data từ API và truyền props cho SearchContent
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Lấy các tham số từ URL
  const keyword = searchParams.keyword || searchParams.q || "";
  const hasPromotion = searchParams.hasPromotion === "true" || searchParams.promo === "true";
  const categoryIds = searchParams.categoryIds ? searchParams.categoryIds.split(",").filter(Boolean) : undefined;
  const brandIds = searchParams.brandIds ? searchParams.brandIds.split(",").filter(Boolean) : undefined;
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined;
  const page = parseInt(searchParams.page || "0", 10);
  const size = parseInt(searchParams.size || "20", 10);
  const sort = searchParams.sort || undefined; // Format: price:desc hoặc price:asc

  // Fetch categories và brands cùng lúc
  const [categories, brands] = await Promise.all([
    listAllCategoriesWithCache(),
    listAllBrandsWithCache(),
  ]);

  // Fetch sản phẩm từ API
  const productsResponse = await searchPublicProductVersions({
    keyword: keyword || undefined,
    hasPromotion: hasPromotion || undefined,
    categoryIds,
    brandIds,
    minPrice,
    maxPrice,
    page,
    size,
    sort,
  });

  return (
    <SearchContent
      initialProducts={productsResponse.items as ProductVersionResponse[]}
      totalPages={productsResponse.totalPage}
      currentPage={page}
      categories={categories}
      brands={brands}
      keyword={keyword}
      hasPromotion={hasPromotion}
      minPrice={minPrice}
      maxPrice={maxPrice}
    />
  );
}
