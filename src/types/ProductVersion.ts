// Interface cho ProductVersion
export interface ProductVersion {
  id: string;
  name: string;
  slug?: string; // slug của phiên bản
  productId: string;
  averageRating?: number; // điểm đánh giá trung bình của phiên bản
  totalRating?: number;   // tổng số lượt đánh giá của phiên bản
  price?: number; // giá sản phẩm
  createdAt: string;
  updatedAt: string;
  colorVersions?: ProductColorVersion[];
}

// Interface cho ProductColorVersion
export interface ProductColorVersion {
  id: string;
  color: string;
  sku: string;
  productVersionId: string;
  totalStock?: number;
  totalSold?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface cho tạo phiên bản mới
export interface CreateProductVersionRequest {
  name: string;
  slug?: string;
  productId: string;
  price?: number;
}

// Interface cho tạo màu sắc phiên bản mới
export interface CreateProductColorVersionRequest {
  color: string;
  sku: string;
  productVersionId: string;
}

// Interface cho cập nhật phiên bản
export interface UpdateProductVersionRequest {
  name: string;
  slug?: string;
  price?: number;
}

// Interface cho cập nhật màu sắc phiên bản
export interface UpdateProductColorVersionRequest {
  color: string;
  sku: string;
}

// Interface cho ProductVersionResponse từ API public search
export interface ProductVersionResponse {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  averageRating?: number;
  totalRating?: number;
  totalSold?: number;
  price?: number; // giá gốc
  discount?: number; // % giảm giá
  discountedPrice?: number; // giá sau khuyến mãi
  createdAt: string;
  modifiedAt: string;
}

// Interface chi tiết phiên bản sản phẩm (từ API public /product/public/version/{slug})
export interface ProductVersionDetailResponse {
  id: string;
  name: string; // tên đầy đủ: product name + version name
  slug?: string;
  price: number;
  averageRating?: number;
  totalRating?: number;
  discountedPrice?: number;
  discount?: number;
  imageUrls: string[]; // danh sách ảnh (default đứng đầu)
  description?: string;
  model?: string;
  warrantyPeriod?: number; // thời gian bảo hành (tháng)
  specifications?: string | Record<string, string>[]; // chuỗi JSON hoặc mảng key-value
  productVersionNames: { id: string; name: string; slug?: string }[]; // các version khác của cùng product
  productColorVersions: ProductColorVersion[]; // danh sách màu
}

// Request update cart item (đồng bộ với backend)
export interface UpdateCartItemRequest {
  productColorVersionId: string;
  quantity: number; // >= 0
}
