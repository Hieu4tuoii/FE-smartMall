"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search } from "lucide-react";
import { ProductVersion } from "@/types/ProductVersion";

interface ProductSelectorProps {
  versions: ProductVersion[]; // Thay đổi từ products thành versions
  selectedVersionIds: string[]; // Thay đổi từ selectedProductIds
  onSelectionChange: (versionIds: string[]) => void;
  loading?: boolean;
  promotionVersionIds?: string[]; // Thay đổi từ promotionProductIds - các versions đang áp dụng promotion
}

export function ProductSelector({
  versions,
  selectedVersionIds,
  onSelectionChange,
  loading = false,
  promotionVersionIds = [],
}: ProductSelectorProps) {
  const [searchKeyword, setSearchKeyword] = useState("");

  // Filter và sắp xếp versions
  const sortedAndFilteredVersions = useMemo(() => {
    let filtered = versions;

    // Filter theo search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = versions.filter((version) =>
        version.name.toLowerCase().includes(keyword)
      );
    }

    // Sắp xếp: versions đang áp dụng promotion lên đầu (nếu có), còn lại sắp xếp theo tên
    if (promotionVersionIds.length > 0) {
      return filtered.sort((a, b) => {
        const aHasPromotion = promotionVersionIds.includes(a.id);
        const bHasPromotion = promotionVersionIds.includes(b.id);

        if (aHasPromotion && !bHasPromotion) return -1;
        if (!aHasPromotion && bHasPromotion) return 1;

        return a.name.localeCompare(b.name);
      });
    }

    // Sắp xếp theo tên
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [versions, searchKeyword, promotionVersionIds]);

  const handleToggleVersion = (versionId: string) => {
    if (selectedVersionIds.includes(versionId)) {
      onSelectionChange(selectedVersionIds.filter((id) => id !== versionId));
    } else {
      onSelectionChange([...selectedVersionIds, versionId]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Tìm kiếm sản phẩm theo tên hoặc model..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      {/* Danh sách phiên bản sản phẩm */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Đang tải danh sách phiên bản sản phẩm...</span>
          </div>
        ) : sortedAndFilteredVersions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {searchKeyword ? "Không tìm thấy phiên bản sản phẩm nào" : "Không có phiên bản sản phẩm nào"}
          </p>
        ) : (
          <div className="space-y-2">
            {sortedAndFilteredVersions.map((version) => {
              const isSelected = selectedVersionIds.includes(version.id);
              const hasPromotion = promotionVersionIds.includes(version.id);
              return (
                <div
                  key={version.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    isSelected ? "bg-blue-50 border-blue-200" : "border-gray-200 hover:bg-gray-50"
                  } ${hasPromotion ? "border-l-4 border-l-blue-500" : ""}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleVersion(version.id)}
                    disabled={loading}
                  />
                  {/* Thông tin phiên bản sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block truncate">
                      {version.name}
                    </label>
                  </div>
                  {/* Badge */}
                  <div className="flex-shrink-0">
                    {hasPromotion && (
                      <span className="text-xs text-green-600 font-medium whitespace-nowrap">Đang áp dụng</span>
                    )}
                    {isSelected && !hasPromotion && (
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap">Đã chọn</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

