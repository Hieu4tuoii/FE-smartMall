"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  ProductVersion, 
  ProductColorVersion,
  CreateProductVersionRequest,
  CreateProductColorVersionRequest,
  UpdateProductVersionRequest,
  UpdateProductColorVersionRequest
} from "@/types/ProductVersion";
import { 
  getProductVersions,
  createProductVersion,
  createProductColorVersion,
  updateProductVersion,
  updateProductColorVersion,
  deleteProductVersion,
  deleteProductColorVersion,
  getProductById
} from "@/services/productService";
import { Product } from "@/types/Product";

export default function VersionManagerPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  
  // Modal states
  const [isAddVersionOpen, setIsAddVersionOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  const [isEditVersionOpen, setIsEditVersionOpen] = useState(false);
  const [isEditColorOpen, setIsEditColorOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  
  // Confirm dialog states
  const [confirmDeleteVersion, setConfirmDeleteVersion] = useState<{
    open: boolean;
    versionId: string;
    versionName: string;
  }>({ open: false, versionId: "", versionName: "" });
  
  const [confirmDeleteColor, setConfirmDeleteColor] = useState<{
    open: boolean;
    colorId: string;
    colorName: string;
    versionId: string;
  }>({ open: false, colorId: "", colorName: "", versionId: "" });
  
  // Form states
  const [versionName, setVersionName] = useState("");
  const [versionSlug, setVersionSlug] = useState("");
  const [versionPrice, setVersionPrice] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false); // Flag để biết slug được chỉnh sửa thủ công
  const [editVersionName, setEditVersionName] = useState("");
  const [editVersionSlug, setEditVersionSlug] = useState("");
  const [editVersionPrice, setEditVersionPrice] = useState("");
  const [isManualEditSlug, setIsManualEditSlug] = useState(false); // Flag cho form sửa
  const [colorForm, setColorForm] = useState({
    color: "",
    sku: ""
  });
  const [editColorForm, setEditColorForm] = useState({
    color: "",
    sku: ""
  });

  // Hàm chuyển đổi string sang slug format
  const stringToSlug = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD') // Tách dấu tiếng Việt khỏi ký tự gốc
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ toàn bộ dấu thanh
      .replace(/đ/g, 'd') // thay đ → d
      .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt còn lại
      .replace(/[\s_]+/g, '-') // Thay khoảng trắng/underscore bằng gạch ngang
      .replace(/-+/g, '-') // Gom nhiều gạch ngang liên tiếp thành một
      .replace(/^-+|-+$/g, ''); // Loại bỏ gạch ở đầu/cuối
  };

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [versionsData, productData] = await Promise.all([
          getProductVersions(productId),
          getProductById(productId)
        ]);
        setVersions(versionsData);
        setProduct(productData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phiên bản:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách phiên bản"
        });
        setVersions([]);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Tự động tạo slug khi versionName thay đổi (form thêm)
  useEffect(() => {
    if (versionName.trim() && product && !isManualSlug) {
      const productSlug = stringToSlug(product.name);
      const versionSlug = stringToSlug(versionName);
      const fullSlug = `${productSlug}-${versionSlug}`;
      setVersionSlug(fullSlug);
    } else if (!versionName.trim()) {
      setVersionSlug("");
      setIsManualSlug(false);
    }
  }, [versionName, product, isManualSlug]);

  // Tự động tạo slug khi editVersionName thay đổi (form sửa)
  useEffect(() => {
    if (editVersionName.trim() && product && !isManualEditSlug) {
      const productSlug = stringToSlug(product.name);
      const versionSlug = stringToSlug(editVersionName);
      const fullSlug = `${productSlug}-${versionSlug}`;
      setEditVersionSlug(fullSlug);
    } else if (!editVersionName.trim()) {
      setEditVersionSlug("");
      setIsManualEditSlug(false);
    }
  }, [editVersionName, product, isManualEditSlug]);

  const handleAddVersion = async () => {
    if (!versionName.trim() || !versionPrice.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin"
      });
      return;
    }

    try {
      const request: CreateProductVersionRequest = {
        name: versionName,
        slug: versionSlug.trim() || undefined,
        productId: productId,
        price: parseInt(versionPrice)
      };
      
      await createProductVersion(request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setVersionName("");
      setVersionSlug("");
      setVersionPrice("");
      setIsManualSlug(false);
      setIsAddVersionOpen(false);
      
      toast({
        title: "Thành công",
        description: "Tạo phiên bản thành công"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Tạo phiên bản thất bại"
      });
    }
  };

  const handleAddColor = async () => {
    if (!colorForm.color.trim() || !colorForm.sku.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin"
      });
      return;
    }

    try {
      const request: CreateProductColorVersionRequest = {
        color: colorForm.color,
        sku: colorForm.sku,
        productVersionId: selectedVersionId
      };
      
      await createProductColorVersion(request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setColorForm({ color: "", sku: "" });
      setIsAddColorOpen(false);
      
      toast({
        title: "Thành công",
        description: "Tạo màu sắc thành công"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Tạo màu sắc thất bại"
      });
    }
  };

  const handleDeleteVersionClick = (versionId: string, versionName: string) => {
    setConfirmDeleteVersion({
      open: true,
      versionId,
      versionName
    });
  };

  const handleDeleteVersionConfirm = async () => {
    try {
      await deleteProductVersion(confirmDeleteVersion.versionId);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      toast({
        title: "Thành công",
        description: "Xóa phiên bản thành công"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Xóa phiên bản thất bại"
      });
    }
  };

  const handleDeleteColorClick = (colorId: string, colorName: string, versionId: string) => {
    setConfirmDeleteColor({
      open: true,
      colorId,
      colorName,
      versionId
    });
  };

  const handleDeleteColorConfirm = async () => {
    try {
      await deleteProductColorVersion(confirmDeleteColor.colorId);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      toast({
        title: "Thành công",
        description: "Xóa màu sắc thành công"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Xóa màu sắc thất bại"
      });
    }
  };

  const handleEditVersionClick = (versionId: string, version: ProductVersion) => {
    setSelectedVersionId(versionId);
    setEditVersionName(version.name);
    setEditVersionSlug(version.slug || "");
    setEditVersionPrice(version.price?.toString() || "");
    setIsManualEditSlug(!!version.slug); // Nếu có slug sẵn thì coi như đã chỉnh sửa thủ công
    setIsEditVersionOpen(true);
  };

  const handleEditVersion = async () => {
    if (!editVersionName.trim() || !editVersionPrice.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin"
      });
      return;
    }

    try {
      const request: UpdateProductVersionRequest = {
        name: editVersionName,
        slug: editVersionSlug.trim() || undefined,
        price: parseInt(editVersionPrice)
      };
      
      await updateProductVersion(selectedVersionId, request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setEditVersionName("");
      setEditVersionSlug("");
      setEditVersionPrice("");
      setIsManualEditSlug(false);
      setIsEditVersionOpen(false);
      
      toast({
        title: "Thành công",
        description: "Cập nhật phiên bản thành công"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Cập nhật phiên bản thất bại"
      });
    }
  };

  const handleEditColorClick = (color: ProductColorVersion) => {
    setSelectedColorId(color.id);
    setEditColorForm({
      color: color.color,
      sku: color.sku
    });
    setIsEditColorOpen(true);
  };

  const handleEditColor = async () => {
    if (!editColorForm.color.trim() || !editColorForm.sku.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin"
      });
      return;
    }

    try {
      const request: UpdateProductColorVersionRequest = {
        color: editColorForm.color,
        sku: editColorForm.sku
      };
      
      await updateProductColorVersion(selectedColorId, request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setEditColorForm({ color: "", sku: "" });
      setIsEditColorOpen(false);
      
      toast({
        title: "Thành công",
        description: "Cập nhật màu sắc thành công"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Cập nhật màu sắc thất bại"
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatNumber = (value: number | undefined) => {
    return new Intl.NumberFormat('vi-VN').format(value ?? 0);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách phiên bản</h1>
        <p className="text-gray-600">Thêm các phiên bản dung lượng và màu sắc tương ứng</p>
      </div>

      {/* Add Version Button */}
      <div className="flex justify-end mb-6">
        <Dialog open={isAddVersionOpen} onOpenChange={(open) => {
          setIsAddVersionOpen(open);
          if (!open) {
            setVersionName("");
            setVersionSlug("");
            setVersionPrice("");
            setIsManualSlug(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm phiên bản
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm phiên bản mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Nhập tên phiên bản sản phẩm (ví dụ: 128GB, 256GB, 512GB)
              </p>
              <div className="space-y-2">
                <Label htmlFor="versionName">Tên phiên bản *</Label>
                <Input
                  id="versionName"
                  placeholder="Ví dụ: 128GB, 256GB, 512GB..."
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versionSlug">Slug</Label>
                <Input
                  id="versionSlug"
                  placeholder="Ví dụ: 128gb, 256gb, 512gb..."
                  value={versionSlug}
                  onChange={(e) => {
                    setVersionSlug(e.target.value);
                    setIsManualSlug(true);
                  }}
                  onFocus={() => setIsManualSlug(true)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versionPrice">Giá (VNĐ) *</Label>
                <Input
                  id="versionPrice"
                  placeholder="Ví dụ: 25000000"
                  value={versionPrice}
                  onChange={(e) => setVersionPrice(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddVersionOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddVersion} className="bg-blue-600 text-white hover:bg-blue-700">
                  Lưu phiên bản
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Versions List */}
      <div className="space-y-6">
        {versions.map((version) => (
          <Card key={version.id} className="bg-gray-50">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-semibold">{version.name}</h3>
                  {version.price && (
                    <Badge variant="default" className="bg-green-600">
                      {formatPrice(version.price)}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {version.colorVersions?.length || 0} màu sắc
                  </Badge>
                  {typeof version.averageRating === "number" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {(version.averageRating ?? 0).toFixed(1)}
                      <span className="text-yellow-500">★</span>
                      <span>· {version.totalRating ?? 0} đánh giá</span>
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Chỉnh sửa phiên bản"
                    onClick={() => handleEditVersionClick(version.id, version)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteVersionClick(version.id, version.name)}
                    title="Xóa phiên bản"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Màu sắc phiên bản</h4>
                  <Dialog open={isAddColorOpen && selectedVersionId === version.id} onOpenChange={(open) => {
                    setIsAddColorOpen(open);
                    if (open) setSelectedVersionId(version.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedVersionId(version.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm màu
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Thêm màu sắc mới</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Nhập thông tin màu sắc cho phiên bản sản phẩm
                        </p>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="colorName">Tên màu *</Label>
                            <Input
                              id="colorName"
                              placeholder="Ví dụ: Đen, Trắng, Xanh Dương..."
                              value={colorForm.color}
                              onChange={(e) => setColorForm(prev => ({ ...prev, color: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                              id="sku"
                              placeholder="Ví dụ: IP15-128-BLK"
                              value={colorForm.sku}
                              onChange={(e) => setColorForm(prev => ({ ...prev, sku: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddColorOpen(false)}>
                            Hủy
                          </Button>
                          <Button onClick={handleAddColor} className="bg-blue-600 text-white hover:bg-blue-700">
                            Lưu màu sắc
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Color Versions */}
                <div className="grid gap-4">
                  {version.colorVersions?.map((color) => (
                    <div key={color.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-4 gap-6">
                        <div>
                          <Label className="text-xs text-gray-500">Tên màu</Label>
                          <p className="font-medium truncate">{color.color}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">SKU</Label>
                          <p className="text-sm bg-gray-100 px-2 py-1 rounded-full w-fit">{color.sku}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Tồn kho</Label>
                          <p className="font-medium">{formatNumber(color.totalStock)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Đã bán</Label>
                          <p className="font-medium">{formatNumber(color.totalSold)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Chỉnh sửa màu sắc"
                          onClick={() => handleEditColorClick(color)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteColorClick(color.id, color.color, version.id)}
                          title="Xóa màu sắc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Version Modal */}
      <Dialog open={isEditVersionOpen} onOpenChange={(open) => {
        setIsEditVersionOpen(open);
        if (!open) {
          setEditVersionName("");
          setEditVersionSlug("");
          setEditVersionPrice("");
          setIsManualEditSlug(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phiên bản</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Chỉnh sửa tên phiên bản sản phẩm
            </p>
            <div className="space-y-2">
              <Label htmlFor="editVersionName">Tên phiên bản *</Label>
              <Input
                id="editVersionName"
                placeholder="Ví dụ: 128GB, 256GB, 512GB..."
                value={editVersionName}
                onChange={(e) => setEditVersionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editVersionSlug">Slug</Label>
              <Input
                id="editVersionSlug"
                placeholder="Ví dụ: 128gb, 256gb, 512gb..."
                value={editVersionSlug}
                onChange={(e) => {
                  setEditVersionSlug(e.target.value);
                  setIsManualEditSlug(true);
                }}
                onFocus={() => setIsManualEditSlug(true)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editVersionPrice">Giá (VNĐ) *</Label>
              <Input
                id="editVersionPrice"
                placeholder="Ví dụ: 25000000"
                value={editVersionPrice}
                onChange={(e) => setEditVersionPrice(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditVersionOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditVersion} className="bg-blue-600 text-white hover:bg-blue-700">
                Cập nhật phiên bản
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Color Modal */}
      <Dialog open={isEditColorOpen} onOpenChange={setIsEditColorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa màu sắc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Chỉnh sửa thông tin màu sắc cho phiên bản sản phẩm
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editColorName">Tên màu *</Label>
                <Input
                  id="editColorName"
                  placeholder="Ví dụ: Đen, Trắng, Xanh Dương..."
                  value={editColorForm.color}
                  onChange={(e) => setEditColorForm(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSku">SKU *</Label>
                <Input
                  id="editSku"
                  placeholder="Ví dụ: IP15-128-BLK"
                  value={editColorForm.sku}
                  onChange={(e) => setEditColorForm(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditColorOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditColor} className="bg-blue-600 text-white hover:bg-blue-700">
                Cập nhật màu sắc
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmDeleteVersion.open}
        onOpenChange={(open) => setConfirmDeleteVersion(prev => ({ ...prev, open }))}
        title="Xóa phiên bản"
        description={`Bạn có chắc chắn muốn xóa phiên bản "${confirmDeleteVersion.versionName}"? Hành động này sẽ xóa tất cả màu sắc thuộc phiên bản này và không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteVersionConfirm}
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmDeleteColor.open}
        onOpenChange={(open) => setConfirmDeleteColor(prev => ({ ...prev, open }))}
        title="Xóa màu sắc"
        description={`Bạn có chắc chắn muốn xóa màu sắc "${confirmDeleteColor.colorName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteColorConfirm}
        variant="destructive"
      />
    </div>
  );
}