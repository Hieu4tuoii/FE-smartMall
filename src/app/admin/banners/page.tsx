"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/services/uploadService";
import { BannerResponse } from "@/types/Banner";
import { deleteBanner, listBanners } from "@/services/bannerService";
import { CreateBannerDialog } from "./CreateBannerDialog";
import { EditBannerDialog } from "./EditBannerDialog";

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerResponse | null>(null);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const list = await listBanners();
      setBanners(list);
    } catch (error: any) {
      toast({ title: "Lỗi", description: error?.message || "Không thể tải danh sách banner", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return;
    try {
      await deleteBanner(selectedBanner.id);
      toast({ title: "Thành công", description: "Xóa banner thành công" });
      fetchBanners();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error?.message || "Xóa banner thất bại", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBanner(null);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quản lý banner</h1>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm banner
          </Button>
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
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      Chưa có banner nào
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        {b.imageUrl ? (
                          <div className="relative h-16 w-32 overflow-hidden rounded border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={getImageUrl(b.imageUrl)} alt="banner" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-gray-400">(Không có ảnh)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {b.link ? (
                          <Link href={b.link} className="text-blue-600 hover:underline">
                            {b.link}
                          </Link>
                        ) : (
                          <span className="text-gray-400">(Không có link)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBanner(b);
                              setEditDialogOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBanner(b);
                              setDeleteDialogOpen(true);
                            }}
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

        <CreateBannerDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={() => fetchBanners()} />

        <EditBannerDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} banner={selectedBanner} onSuccess={() => fetchBanners()} />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa banner?</AlertDialogTitle>
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


