// Interface cho ProductVersion
export interface ProductVersion {
  id: string;
  name: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  colorVersions?: ProductColorVersion[];
}

// Interface cho ProductColorVersion
export interface ProductColorVersion {
  id: string;
  color: string;
  sku: string;
  price: number;
  productVersionId: string;
  colorHex: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho tạo phiên bản mới
export interface CreateProductVersionRequest {
  name: string;
  productId: string;
}

// Interface cho tạo màu sắc phiên bản mới
export interface CreateProductColorVersionRequest {
  color: string;
  sku: string;
  price: number;
  productVersionId: string;
  colorHex: string;
}

// Interface cho cập nhật phiên bản
export interface UpdateProductVersionRequest {
  name: string;
}

// Interface cho cập nhật màu sắc phiên bản
export interface UpdateProductColorVersionRequest {
  color: string;
  sku: string;
  price: number;
  colorHex: string;
}
