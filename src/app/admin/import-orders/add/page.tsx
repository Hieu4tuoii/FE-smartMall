"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImportOrderService } from "@/services/importOrderService";
import { SupplierService } from "@/services/supplierService";
import {
  ProductImportSelectOption,
  ImportOrderItem,
  ImportOrderRequest,
  ImportColorVersionRequest,
} from "@/types/ImportOrder";
import { SupplierResponse } from "@/types/Supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

/**
 * Trang thêm đơn nhập mới
 * Cho phép thêm nhiều sản phẩm với thông tin: sản phẩm, phiên bản, màu, đơn giá, danh sách IMEI
 */
export default function AddImportOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Dữ liệu từ API
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [products, setProducts] = useState<ProductImportSelectOption[]>([]);
  // Cache versions và colors theo productId/versionId
  const [versionsCache, setVersionsCache] = useState<Record<string, ProductImportSelectOption[]>>({});
  const [colorsCache, setColorsCache] = useState<Record<string, ProductImportSelectOption[]>>({});
  
  // Form data
  const [supplierId, setSupplierId] = useState<string>("");
  const [items, setItems] = useState<ImportOrderItem[]>([
    {
      productId: "",
      versionId: "",
      colorId: "",
      unitPrice: 0,
      imeiList: [],
    },
  ]);

  /**
   * Load dữ liệu ban đầu: nhà cung cấp và danh sách products
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [suppliersData, productsData] = await Promise.all([
          SupplierService.search(""),
          ImportOrderService.getProducts(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải dữ liệu",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  /**
   * Thêm sản phẩm mới vào đơn nhập
   */
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        versionId: "",
        colorId: "",
        unitPrice: 0,
        imeiList: [],
      },
    ]);
  };

  /**
   * Xóa sản phẩm khỏi đơn nhập
   */
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  /**
   * Load versions khi chọn product
   */
  const loadVersions = async (productId: string) => {
    if (!productId || versionsCache[productId]) return;
    
    try {
      const versions = await ImportOrderService.getVersions(productId);
      setVersionsCache((prev) => ({ ...prev, [productId]: versions }));
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách phiên bản",
        variant: "destructive",
      });
    }
  };

  /**
   * Load colors khi chọn version
   */
  const loadColors = async (versionId: string) => {
    if (!versionId || colorsCache[versionId]) return;
    
    try {
      const colors = await ImportOrderService.getColors(versionId);
      setColorsCache((prev) => ({ ...prev, [versionId]: colors }));
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách màu",
        variant: "destructive",
      });
    }
  };

  /**
   * Cập nhật thông tin sản phẩm
   */
  const handleItemChange = async (
    index: number,
    field: keyof ImportOrderItem,
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === "unitPrice") {
      newItems[index][field] = Number(value);
    } else if (field === "productId") {
      // Khi chọn sản phẩm mới, reset version và color, load versions
      const productId = value as string;
      newItems[index] = {
        ...newItems[index],
        productId,
        versionId: "",
        colorId: "",
      };
      if (productId) {
        await loadVersions(productId);
      }
    } else if (field === "versionId") {
      // Khi chọn version mới, reset color, load colors
      const versionId = value as string;
      newItems[index] = {
        ...newItems[index],
        versionId,
        colorId: "",
      };
      if (versionId) {
        await loadColors(versionId);
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
    }
    setItems(newItems);
  };

  /**
   * Thêm IMEI vào danh sách
   */
  const handleAddImei = (index: number, imei: string) => {
    const trimmedImei = imei.trim();
    if (!trimmedImei) return;
    
    const newItems = [...items];
    if (!newItems[index].imeiList.includes(trimmedImei)) {
      newItems[index].imeiList = [...newItems[index].imeiList, trimmedImei];
      setItems(newItems);
    } else {
      toast({
        title: "Cảnh báo",
        description: "IMEI này đã tồn tại trong danh sách",
        variant: "destructive",
      });
    }
  };

  /**
   * Xóa IMEI khỏi danh sách
   */
  const handleRemoveImei = (itemIndex: number, imeiIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].imeiList = newItems[itemIndex].imeiList.filter(
      (_, i) => i !== imeiIndex
    );
    setItems(newItems);
  };

  /**
   * Lấy danh sách versions theo productId
   */
  const getVersionsByProductId = (productId: string): ProductImportSelectOption[] => {
    if (!productId) return [];
    return versionsCache[productId] || [];
  };

  /**
   * Lấy danh sách colors theo versionId
   */
  const getColorsByVersionId = (versionId: string): ProductImportSelectOption[] => {
    if (!versionId) return [];
    return colorsCache[versionId] || [];
  };

  /**
   * Validate form trước khi submit
   */
  const validateForm = (): boolean => {
    if (!supplierId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn nhà cung cấp",
        variant: "destructive",
      });
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || !item.versionId || !item.colorId) {
        toast({
          title: "Lỗi",
          description: `Vui lòng điền đầy đủ thông tin sản phẩm ${i + 1}`,
          variant: "destructive",
        });
        return false;
      }

      if (item.unitPrice <= 0) {
        toast({
          title: "Lỗi",
          description: `Đơn giá sản phẩm ${i + 1} phải lớn hơn 0`,
          variant: "destructive",
        });
        return false;
      }

      if (item.imeiList.length === 0) {
        toast({
          title: "Lỗi",
          description: `Vui lòng nhập ít nhất 1 IMEI cho sản phẩm ${i + 1}`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  /**
   * Submit form tạo đơn nhập
   * Transform data từ UI format sang backend format
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Transform từ items (UI format) sang importColorVersionList (backend format)
      const importColorVersionList: ImportColorVersionRequest[] = items.map((item) => ({
        id: item.colorId, // colorId là ProductColorVersion ID
        importPrice: item.unitPrice, // BigDecimal -> number
        imeiOrSerialList: item.imeiList, // Danh sách IMEI
      }));

      const request: ImportOrderRequest = {
        supplierId,
        importColorVersionList,
      };

      await ImportOrderService.create(request);
      toast({
        title: "Thành công",
        description: "Tạo đơn nhập thành công",
      });
      router.push("/admin/import-orders");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Tạo đơn nhập thất bại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Thêm đơn nhập</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Nhà cung cấp */}
          <div>
            <Label htmlFor="supplier">Nhà cung cấp</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger id="supplier" className="mt-2">
                <SelectValue placeholder="Chọn nhà cung cấp" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-4 relative"
              >
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Sản phẩm */}
                  <div>
                    <Label>Sản phẩm</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(index, "productId", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phiên bản */}
                  <div>
                    <Label>Phiên bản</Label>
                    <Select
                      value={item.versionId}
                      onValueChange={(value) => handleItemChange(index, "versionId", value)}
                      disabled={!item.productId}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn phiên bản" />
                      </SelectTrigger>
                      <SelectContent>
                        {getVersionsByProductId(item.productId).map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Màu */}
                  <div>
                    <Label>Màu</Label>
                    <Select
                      value={item.colorId}
                      onValueChange={(value) => handleItemChange(index, "colorId", value)}
                      disabled={!item.versionId}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn màu" />
                      </SelectTrigger>
                      <SelectContent>
                        {getColorsByVersionId(item.versionId).map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Đơn giá */}
                  <div>
                    <Label>Đơn giá</Label>
                    <Input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                      placeholder="Nhập đơn giá"
                      className="mt-2"
                      min="0"
                    />
                  </div>
                </div>

                {/* Danh sách IMEI */}
                <div>
                  <Label>Danh sách IMEI</Label>
                  
                  {/* Input thêm IMEI */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder="Nhập IMEI"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          handleAddImei(index, input.value);
                          input.value = "";
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input) {
                          handleAddImei(index, input.value);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Danh sách IMEI đã thêm */}
                  {item.imeiList.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 max-h-[200px] overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {item.imeiList.map((imei, imeiIndex) => (
                          <div
                            key={imeiIndex}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            <span>{imei}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImei(index, imeiIndex)}
                              className="ml-1 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Số lượng IMEI: {item.imeiList.length}
                  </p>
                </div>
              </div>
            ))}

            {/* Nút thêm sản phẩm */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </div>

          {/* Nút submit */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Tạo đơn nhập"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
