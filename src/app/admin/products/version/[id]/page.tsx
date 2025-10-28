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
  deleteProductColorVersion
} from "@/services/productService";

export default function VersionManagerPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  const [editVersionName, setEditVersionName] = useState("");
  const [colorForm, setColorForm] = useState({
    color: "",
    sku: "",
    price: "",
    colorHex: "#000000"
  });
  const [editColorForm, setEditColorForm] = useState({
    color: "",
    sku: "",
    price: "",
    colorHex: "#000000"
  });

  // Fetch data từ API
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const data = await getProductVersions(productId);
        setVersions(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phiên bản:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách phiên bản"
        });
        // Fallback về mock data nếu API lỗi
        const mockVersions: ProductVersion[] = [
          {
            id: "1",
            name: "128GB",
            productId: productId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            colorVersions: [
              {
                id: "1-1",
                color: "Đen",
                sku: "IP15-128-BLK",
                price: 25000000,
                productVersionId: "1",
                colorHex: "#000000",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: "1-2",
                color: "Trắng",
                sku: "ykyuk",
                price: 24000000,
                productVersionId: "1",
                colorHex: "#FFFFFF",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          },
          {
            id: "2",
            name: "512GB",
            productId: productId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            colorVersions: [
              {
                id: "2-1",
                color: "đỏ",
                sku: "uqeqweqwe",
                price: 23000000,
                productVersionId: "2",
                colorHex: "#FF0000",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          }
        ];
        setVersions(mockVersions);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchVersions();
    }
  }, [productId]);

  const handleAddVersion = async () => {
    if (!versionName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên phiên bản"
      });
      return;
    }

    try {
      const request: CreateProductVersionRequest = {
        name: versionName,
        productId: productId
      };
      
      await createProductVersion(request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setVersionName("");
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
    if (!colorForm.color.trim() || !colorForm.sku.trim() || !colorForm.price.trim()) {
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
        price: parseInt(colorForm.price),
        productVersionId: selectedVersionId,
        colorHex: colorForm.colorHex
      };
      
      await createProductColorVersion(request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setColorForm({ color: "", sku: "", price: "", colorHex: "#000000" });
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

  const handleEditVersionClick = (versionId: string, versionName: string) => {
    setSelectedVersionId(versionId);
    setEditVersionName(versionName);
    setIsEditVersionOpen(true);
  };

  const handleEditVersion = async () => {
    if (!editVersionName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên phiên bản"
      });
      return;
    }

    try {
      const request: UpdateProductVersionRequest = {
        name: editVersionName
      };
      
      await updateProductVersion(selectedVersionId, request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setEditVersionName("");
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
      sku: color.sku,
      price: color.price.toString(),
      colorHex: color.colorHex
    });
    setIsEditColorOpen(true);
  };

  const handleEditColor = async () => {
    if (!editColorForm.color.trim() || !editColorForm.sku.trim() || !editColorForm.price.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin"
      });
      return;
    }

    try {
      const request: UpdateProductColorVersionRequest = {
        color: editColorForm.color,
        sku: editColorForm.sku,
        price: parseInt(editColorForm.price),
        colorHex: editColorForm.colorHex
      };
      
      await updateProductColorVersion(selectedColorId, request);
      
      // Refresh data từ API
      const data = await getProductVersions(productId);
      setVersions(data);
      
      setEditColorForm({ color: "", sku: "", price: "", colorHex: "#000000" });
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
        <Dialog open={isAddVersionOpen} onOpenChange={setIsAddVersionOpen}>
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
                  <Badge variant="secondary">
                    {version.colorVersions?.length || 0} màu sắc
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Chỉnh sửa phiên bản"
                    onClick={() => handleEditVersionClick(version.id, version.name)}
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
                          <div className="space-y-2">
                            <Label htmlFor="price">Giá (VNĐ) *</Label>
                            <Input
                              id="price"
                              placeholder="Ví dụ: 25000000"
                              value={colorForm.price}
                              onChange={(e) => setColorForm(prev => ({ ...prev, price: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="colorHex">Mã màu *</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="colorHex"
                                type="color"
                                value={colorForm.colorHex}
                                onChange={(e) => setColorForm(prev => ({ ...prev, colorHex: e.target.value }))}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                placeholder="#000000"
                                value={colorForm.colorHex}
                                onChange={(e) => setColorForm(prev => ({ ...prev, colorHex: e.target.value }))}
                              />
                            </div>
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
                      <div className="flex items-center space-x-6">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.colorHex }}
                        />
                        <div className="flex items-center space-x-8">
                          <div>
                            <Label className="text-xs text-gray-500">Tên màu</Label>
                            <p className="font-medium">{color.color}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">SKU</Label>
                            <p className="text-sm bg-gray-100 px-2 py-1 rounded-full">{color.sku}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Giá</Label>
                            <p className="font-medium">{formatPrice(color.price)}</p>
                          </div>
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
      <Dialog open={isEditVersionOpen} onOpenChange={setIsEditVersionOpen}>
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
              <div className="space-y-2">
                <Label htmlFor="editPrice">Giá (VNĐ) *</Label>
                <Input
                  id="editPrice"
                  placeholder="Ví dụ: 25000000"
                  value={editColorForm.price}
                  onChange={(e) => setEditColorForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editColorHex">Mã màu *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="editColorHex"
                    type="color"
                    value={editColorForm.colorHex}
                    onChange={(e) => setEditColorForm(prev => ({ ...prev, colorHex: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    placeholder="#000000"
                    value={editColorForm.colorHex}
                    onChange={(e) => setEditColorForm(prev => ({ ...prev, colorHex: e.target.value }))}
                  />
                </div>
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