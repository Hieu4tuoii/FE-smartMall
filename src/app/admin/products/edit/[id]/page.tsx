"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, updateProduct } from "@/services/productService";
import { listAllBrands } from "@/services/brandService";
import { getAllCategories } from "@/services/categoryService";
import { uploadImage, getImageUrl } from "@/services/uploadService";
import { CreateProductRequest, ImageRequest, Product } from "@/types/Product";
import { Brand } from "@/types/Brand";
import { Category } from "@/types/Category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Package, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    model: "",
    description: "",
    warrantyPeriod: 0,
    specifications: "",
    brandId: "",
    categoryId: "",
    imageList: [],
  });

  // State cho specifications (giờ là array key-value)
  const [specifications, setSpecifications] = useState<Array<{key: string, value: string}>>([]);
  
  // State cho danh sách ảnh (giờ là ImageRequest[])
  const [imageList, setImageList] = useState<ImageRequest[]>([]);

  // State cho brands và categories
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // State cho validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State cho upload ảnh
  const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleInputChange = (field: keyof CreateProductRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error khi user nhập
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Hàm xử lý danh sách ảnh
  const addImage = () => {
    setImageList(prev => [...prev, { url: "", isDefault: false }]);
  };

  const removeImage = (index: number) => {
    setImageList(prev => prev.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, field: 'url' | 'isDefault', value: string | boolean) => {
    setImageList(prev => prev.map((img, i) => 
      i === index ? { ...img, [field]: value } : img
    ));
  };

  const setDefaultImage = (index: number) => {
    setImageList(prev => prev.map((img, i) => ({
      ...img,
      isDefault: i === index
    })));
  };

  // Hàm xử lý upload ảnh
  const handleFileUpload = async (index: number, file: File) => {
    try {
      setUploadingImages(prev => ({ ...prev, [index]: true }));
      
      console.log('Starting upload for file:', file.name);
      const imageUrl = await uploadImage(file);
      console.log('Upload successful, image URL:', imageUrl);
      
      updateImage(index, 'url', imageUrl);
      
      toast({
        title: "Thành công",
        description: "Upload ảnh thành công",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể upload ảnh",
      });
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleFileSelect = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file ảnh",
        });
        return;
      }
      
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 5MB",
        });
        return;
      }
      
      handleFileUpload(index, file);
    }
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  // Hàm xử lý specifications
  const addSpecification = () => {
    setSpecifications(prev => [...prev, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    setSpecifications(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  // Load product data khi component mount
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoadingProduct(true);
        
        const [productData, brandsData, categoriesData] = await Promise.all([
          getProductById(productId),
          listAllBrands(),
          getAllCategories()
        ]);
        
        // Set form data từ product
        setFormData({
          name: productData.name || "",
          model: productData.model || "",
          description: productData.description || "",
          warrantyPeriod: productData.warrantyPeriod || 0,
          specifications: productData.specifications || "",
          brandId: productData.brandId || "",
          categoryId: productData.categoryId || "",
          imageList: productData.imageList || [],
        });

        // Parse specifications từ JSON string thành array
        if (productData.specifications) {
          try {
            const specsObj = JSON.parse(productData.specifications);
            const specsArray = Object.entries(specsObj).map(([key, value]) => ({
              key: key as string,
              value: value as string
            }));
            setSpecifications(specsArray);
          } catch (error) {
            console.error('Error parsing specifications:', error);
            setSpecifications([]);
          }
        }

        // Set image list
        if (productData.imageList && productData.imageList.length > 0) {
          setImageList(productData.imageList);
        } else {
          // Nếu không có ảnh, tạo một placeholder
          setImageList([{ url: "", isDefault: false }]);
        }
        
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải thông tin sản phẩm",
        });
        router.back();
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProductData();
  }, [productId, toast, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!formData.model.trim()) {
      newErrors.model = "Model là bắt buộc";
    }
    
    if (!formData.brandId || formData.brandId === "none") {
      newErrors.brandId = "Vui lòng chọn thương hiệu";
    }
    
    if (!formData.categoryId || formData.categoryId === "none") {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }
    
    // Kiểm tra ít nhất 1 ảnh
    const validImages = imageList.filter(img => img.url.trim());
    if (validImages.length === 0) {
      newErrors.images = "Vui lòng thêm ít nhất 1 ảnh";
    }
    
    // Nếu có lỗi, hiển thị và dừng
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
      });
      return;
    }
    
    // Clear errors nếu validation thành công
    setErrors({});

    try {
      setLoading(true);
      
      // Lọc imageList không rỗng và có URL hợp lệ
      const validImageList = imageList.filter(img => img.url.trim());

      // Chuyển đổi specifications thành JSON object
      const specificationsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specificationsObj[spec.key] = spec.value;
        }
      });

      const productData: CreateProductRequest = {
        ...formData,
        specifications: Object.keys(specificationsObj).length > 0 ? JSON.stringify(specificationsObj) : undefined,
        imageList: validImageList.length > 0 ? validImageList : undefined,
      };

      await updateProduct(productId, productData);
      
      toast({
        title: "Thành công",
        description: "Cập nhật sản phẩm thành công",
      });
      
      // Chuyển về trang danh sách sản phẩm
      router.push("/admin/products");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật sản phẩm",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Component hiển thị error message
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-sm text-red-600 mt-1">{error}</p>;
  };

  // Loading state
  if (loadingProduct) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên sản phẩm */}
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                  <ErrorMessage error={errors.name} />
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="Nhập model sản phẩm"
                    required
                  />
                  <ErrorMessage error={errors.model} />
                </div>

                {/* Thời gian bảo hành */}
                <div className="space-y-2">
                  <Label htmlFor="warrantyPeriod">Thời gian bảo hành (tháng)</Label>
                  <Input
                    id="warrantyPeriod"
                    type="number"
                    value={formData.warrantyPeriod || ""}
                    onChange={(e) => handleInputChange("warrantyPeriod", Number(e.target.value) || 0)}
                    placeholder="Nhập thời gian bảo hành"
                  />
                </div>

                {/* Brand ID */}
                <div className="space-y-2">
                  <Label htmlFor="brandId">Thương hiệu *</Label>
                  <Select
                    value={formData.brandId || "none"}
                    onValueChange={(value) => handleInputChange("brandId", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage error={errors.brandId} />
                </div>

                {/* Category ID */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Danh mục *</Label>
                  <Select
                    value={formData.categoryId || "none"}
                    onValueChange={(value) => handleInputChange("categoryId", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage error={errors.categoryId} />
                </div>
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả sản phẩm</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Nhập mô tả sản phẩm"
                  rows={4}
                />
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Thông số kỹ thuật</Label>
                  <Button type="button" onClick={addSpecification} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm thông số
                  </Button>
                </div>
                
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Tên thông số (VD: RAM)"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Giá trị (VD: 16GB)"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Danh sách ảnh */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Danh sách ảnh *</Label>
                  <Button type="button" onClick={addImage} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm ảnh
                  </Button>
                </div>
                
                {imageList.map((image, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {/* Vùng upload ảnh - click để upload */}
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => triggerFileInput(index)}
                    >
                      {image.url ? (
                        // Hiển thị ảnh đã upload
                        <div className="flex gap-4 items-start">
                          <div className="flex-shrink-0 relative group">
                            <img
                              src={getImageUrl(image.url)}
                              alt={`Preview ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                console.error('Error loading image:', image.url);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            {/* Overlay khi hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <div className="text-white text-center">
                                <Upload className="h-6 w-6 mx-auto mb-1" />
                                <p className="text-xs">Click để thay đổi</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="text-sm text-gray-600">
                              <strong>Ảnh {index + 1}</strong>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={image.isDefault ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDefaultImage(index);
                                }}
                                className="text-xs"
                              >
                                {image.isDefault ? "Mặc định" : "Đặt mặc định"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Placeholder khi chưa có ảnh
                        <div className="relative">
                          <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <div className="text-center">
                              {uploadingImages[index] ? (
                                <>
                                  <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-2 animate-spin" />
                                  <p className="text-sm text-blue-600">Đang upload...</p>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">Click để upload ảnh</p>
                                  <p className="text-xs text-gray-400">Chọn file ảnh từ máy tính</p>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Nút xóa cho ảnh trống */}
                          {!uploadingImages[index] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute top-2 right-2 text-red-600 hover:text-red-700 bg-white/90 hover:bg-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(index, e)}
                      className="hidden"
                    />
                  </div>
                ))}
                <ErrorMessage error={errors.images} />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
