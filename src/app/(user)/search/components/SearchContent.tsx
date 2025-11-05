"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ProductCard } from "@/components/custom/ProductCard";
import { ProductVersionResponse } from "@/types/ProductVersion";
import { CategoryResponse } from "@/types/Category";
import { BrandResponse } from "@/types/Brand";

interface SearchContentProps {
  initialProducts: ProductVersionResponse[];
  totalPages: number;
  currentPage: number;
  categories: CategoryResponse[];
  brands: BrandResponse[];
  keyword?: string;
  hasPromotion?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Client component xử lý UI, filter và pagination cho trang search
 */
export function SearchContent({
  initialProducts,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  categories,
  brands,
  keyword,
  hasPromotion: initialHasPromotion,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
}: SearchContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default price range: 0 - 100,000,000 VND
  const DEFAULT_MIN_PRICE = 0;
  const DEFAULT_MAX_PRICE = 100000000;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryIds = searchParams.get("categoryIds");
    return categoryIds ? categoryIds.split(",") : [];
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const brandIds = searchParams.get("brandIds");
    return brandIds ? brandIds.split(",") : [];
  });
  const [hasPromotion, setHasPromotion] = useState<boolean>(initialHasPromotion || false);
  const [sortBy, setSortBy] = useState<"price:asc" | "price:desc" | "">(() => {
    const sort = searchParams.get("sort");
    if (sort === "price:asc" || sort === "price:desc") return sort;
    return "";
  });
  // State cho giá trị hiển thị (trong khi kéo slider)
  const [displayPriceMin, setDisplayPriceMin] = useState<number>(initialMinPrice ?? DEFAULT_MIN_PRICE);
  const [displayPriceMax, setDisplayPriceMax] = useState<number>(initialMaxPrice ?? DEFAULT_MAX_PRICE);
  
  // State cho giá trị đã commit (sau khi thả chuột) - dùng để gọi API
  const [committedPriceMin, setCommittedPriceMin] = useState<number>(initialMinPrice ?? DEFAULT_MIN_PRICE);
  const [committedPriceMax, setCommittedPriceMax] = useState<number>(initialMaxPrice ?? DEFAULT_MAX_PRICE);
  
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);

  // Reset to page 0 when filters change (chỉ dùng committed values)
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategories, selectedBrands, hasPromotion, sortBy, keyword, committedPriceMin, committedPriceMax]);

  // Update URL when filters or page change (chỉ dùng committed values)
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (keyword) params.set("keyword", keyword);
    if (hasPromotion) params.set("hasPromotion", "true");
    if (selectedCategories.length > 0) params.set("categoryIds", selectedCategories.join(","));
    if (selectedBrands.length > 0) params.set("brandIds", selectedBrands.join(","));
    if (sortBy) params.set("sort", sortBy);
    if (committedPriceMin !== DEFAULT_MIN_PRICE) params.set("minPrice", committedPriceMin.toString());
    if (committedPriceMax !== DEFAULT_MAX_PRICE) params.set("maxPrice", committedPriceMax.toString());
    if (currentPage > 0) params.set("page", currentPage.toString());

    router.replace(`/search?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedBrands, hasPromotion, sortBy, committedPriceMin, committedPriceMax, currentPage]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => (prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]));
  };

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) => (prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]));
  };

  const toggleSort = () => {
    if (sortBy === "") {
      setSortBy("price:asc");
    } else if (sortBy === "price:asc") {
      setSortBy("price:desc");
    } else {
      setSortBy("");
    }
  };

  const getSortIcon = () => {
    if (sortBy === "price:asc") return <ArrowUp className="w-4 h-4" />;
    if (sortBy === "price:desc") return <ArrowDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getSortLabel = () => {
    if (sortBy === "price:asc") return "Giá tăng dần";
    if (sortBy === "price:desc") return "Giá giảm dần";
    return "Sắp xếp theo giá";
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setHasPromotion(false);
    setSortBy("");
    setDisplayPriceMin(DEFAULT_MIN_PRICE);
    setDisplayPriceMax(DEFAULT_MAX_PRICE);
    setCommittedPriceMin(DEFAULT_MIN_PRICE);
    setCommittedPriceMax(DEFAULT_MAX_PRICE);
    setCurrentPage(0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  // Cập nhật giá trị hiển thị khi kéo slider (không gọi API)
  const handlePriceChange = (values: number[]) => {
    setDisplayPriceMin(values[0]);
    setDisplayPriceMax(values[1]);
  };

  // Cập nhật giá trị commit khi thả chuột (gọi API)
  const handlePriceCommit = (values: number[]) => {
    setCommittedPriceMin(values[0]);
    setCommittedPriceMax(values[1]);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const totalPagesNum = initialTotalPages;

    if (totalPagesNum <= maxVisible) {
      for (let i = 0; i < totalPagesNum; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPagesNum - 1);
      } else if (currentPage >= totalPagesNum - 3) {
        pages.push(0);
        pages.push("ellipsis");
        for (let i = totalPagesNum - 4; i < totalPagesNum; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPagesNum - 1);
      }
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2">
        {keyword ? `Kết quả tìm kiếm: "${keyword}"` : hasPromotion ? "Sản phẩm khuyến mãi" : "Tất cả sản phẩm"}
      </h1>
      <p className="text-muted-foreground mb-8">
        Tìm thấy {initialProducts.length} sản phẩm
        {initialTotalPages > 1 && ` - Trang ${currentPage + 1}/${initialTotalPages}`}
      </p>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border p-6">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5" />
                <h3>Bộ lọc & Sắp xếp</h3>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="mb-3">Sắp xếp</h4>
                <Button variant={sortBy ? "default" : "outline"} size="sm" onClick={toggleSort} className="w-full justify-start gap-2">
                  {getSortIcon()}
                  <span>{getSortLabel()}</span>
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Promotion Filter */}
              <div className="mb-6">
                <h4 className="mb-3">Khuyến mãi</h4>
                <div className="flex items-center gap-2">
                  <Checkbox id="promo" checked={hasPromotion} onCheckedChange={(checked) => setHasPromotion(checked === true)} />
                  <Label htmlFor="promo" className="cursor-pointer text-sm">
                    Khuyến mãi
                  </Label>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Categories */}
              <div className="mb-6">
                <h4 className="mb-3">Danh mục</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`cat-${category.id}`} className="cursor-pointer text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Brands */}
              <div className="mb-6">
                <h4 className="mb-3">Hãng</h4>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`brand-${brand.id}`}
                        checked={selectedBrands.includes(brand.id)}
                        onCheckedChange={() => toggleBrand(brand.id)}
                      />
                      <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer text-sm">
                        {brand.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Price Range Slider */}
              <div>
                <h4 className="mb-3">Mức giá</h4>
                <div className="space-y-4">
                  <Slider
                    min={DEFAULT_MIN_PRICE}
                    max={DEFAULT_MAX_PRICE}
                    step={100000}
                    value={[displayPriceMin, displayPriceMax]}
                    onValueChange={handlePriceChange}
                    onValueCommit={handlePriceCommit}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Tối thiểu</span>
                      <span>{formatPrice(displayPriceMin)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-muted-foreground">Tối đa</span>
                      <span>{formatPrice(displayPriceMax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedCategories.length > 0 || selectedBrands.length > 0 || hasPromotion || sortBy !== "" || committedPriceMin !== DEFAULT_MIN_PRICE || committedPriceMax !== DEFAULT_MAX_PRICE) && (
                <>
                  <Separator className="my-6" />
                  <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                    Xóa bộ lọc
                  </Button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {initialProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {initialProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {initialTotalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                          className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => setCurrentPage(page as number)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {(page as number) + 1}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(initialTotalPages - 1, prev + 1))}
                          className={currentPage === initialTotalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

