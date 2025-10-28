// Interface cho Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  model: string;
  averageRating: number;
  totalRating: number;
  totalSold: number;
  imageUrl: string; // ảnh chính của sản phẩm
  totalStock: number;
  createdAt: string;
  modifiedAt: string;
  // Thêm các properties cho edit
  description?: string;
  warrantyPeriod?: number;
  specifications?: string;
  brandId?: string;
  categoryId?: string;
  imageList?: ImageRequest[];
}

// Interface cho ImageRequest (phù hợp với backend)
export interface ImageRequest {
  id?: string;
  url: string;
  isDefault?: boolean;
}

// Interface cho tạo sản phẩm mới (phù hợp với backend ProductCreateRequest)
export interface CreateProductRequest {
  name: string;
  slug: string;
  model: string;
  warrantyPeriod?: number;
  description?: string;
  specifications?: string; // String thay vì JSON object
  brandId?: string;
  categoryId?: string;
  imageList?: ImageRequest[]; // Thay vì imageUrls
}
