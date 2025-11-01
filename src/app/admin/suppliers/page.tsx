"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { SupplierResponse } from "@/types/Supplier";
import { SupplierService } from "@/services/supplierService";
import { CreateSupplierDialog } from "./CreateSupplierDialog";
import { EditSupplierDialog } from "./EditSupplierDialog";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null);
  const { toast } = useToast();

  const fetchSuppliers = async (keyword: string = "") => {
    try {
      setLoading(true);
      const list = await SupplierService.search(keyword);
      setSuppliers(list);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách nhà cung cấp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers("");
  }, []);

  const handleSearch = () => {
    fetchSuppliers(searchKeyword);
  };

  const handleDeleteClick = (supplier: SupplierResponse) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (supplier: SupplierResponse) => {
    setSelectedSupplier(supplier);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return;
    try {
      await SupplierService.delete(selectedSupplier.id);
      toast({ title: "Thành công", description: "Xóa nhà cung cấp thành công" });
      fetchSuppliers(searchKeyword);
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Xóa thất bại", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quản lý nhà cung cấp</h1>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm nhà cung cấp
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Tìm kiếm</Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Không tìm thấy nhà cung cấp nào
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(s)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(s)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <CreateSupplierDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => fetchSuppliers(searchKeyword)}
        />

        <EditSupplierDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          supplier={selectedSupplier}
          onSuccess={() => fetchSuppliers(searchKeyword)}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa nhà cung cấp?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Nhà cung cấp sẽ bị vô hiệu hóa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
