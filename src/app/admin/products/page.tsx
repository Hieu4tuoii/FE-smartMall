"use client";

import { useState, useEffect } from "react";
import { getProductList } from "@/services/productService";
import { Product } from "@/types/Product";
import { PageParams } from "@/types/apiTypes";
import { ProductTable } from "@/app/admin/products/components/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Plus, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);

  /**
   * Tải danh sách sản phẩm từ API
   */
  const loadProducts = async (params: PageParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductList({
        page: currentPage,
        size: pageSize,
        sort: "modifiedAt:desc",
        keyword: searchKeyword,
        ...params
      });

      setProducts(response.items);
      setTotalPages(response.totalPage);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý tìm kiếm sản phẩm
   */
  const handleSearch = () => {
    setCurrentPage(0);
    loadProducts({ keyword: searchKeyword, page: 0 });
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts({ page, keyword: searchKeyword });
  };

  /**
   * Xử lý nhấn Enter trong ô tìm kiếm
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Xử lý chuyển đến trang thêm sản phẩm
   */
  const handleAddProduct = () => {
    router.push("/admin/products/add");
  };

  // Tải danh sách sản phẩm khi component mount
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        </div>
        <p className="text-gray-600">
          Quản lý danh sách sản phẩm trong hệ thống Smart Mall
        </p>
      </div>

      {/* Search và Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tìm kiếm sản phẩm</span>
            <Button onClick={handleAddProduct} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Nhập tên sản phẩm để tìm kiếm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách sản phẩm</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={() => loadProducts()} variant="outline">
                Thử lại
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-600 mb-4">
                {searchKeyword 
                  ? "Không có sản phẩm nào khớp với từ khóa tìm kiếm."
                  : "Chưa có sản phẩm nào trong hệ thống."
                }
              </p>
              {searchKeyword && (
                <Button 
                  onClick={() => {
                    setSearchKeyword("");
                    setCurrentPage(0);
                    loadProducts({ keyword: "", page: 0 });
                  }}
                  variant="outline"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <ProductTable
              products={products}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onProductDeleted={() => loadProducts({ page: currentPage, keyword: searchKeyword })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
