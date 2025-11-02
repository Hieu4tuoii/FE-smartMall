import { SupplierResponse } from "./Supplier";

/**
 * Request cho API /import-order/product-import-select
 * level: 1 = product, 2 = product version, 3 = product color version
 */
export interface ProductImportSelectRequest {
  id?: string | null; // product thì null, version thì truyền productId, color thì truyền versionId
  level: number; // 1: product, 2: product version, 3: product color version
}

/**
 * Response từ API /import-order/product-import-select
 * Một mảng các option (product, version hoặc color)
 */
export type ProductImportSelectResponse = ProductImportSelectOption[];

/**
 * Option từ API /import-order/product-import-select
 */
export interface ProductImportSelectOption {
  id: string;
  name: string;
}

/**
 * Response từ API /import-order
 * Danh sách đơn nhập
 */
export interface ImportOrderResponse {
  id: string;
  supplierName: string;
  totalImportPrice: number;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Response từ API /import-order/{id}
 * Chi tiết đơn nhập
 */
export interface ImportOrderDetailResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  totalImportPrice: number;
  createdAt: string;
  modifiedAt?: string;
  items: ImportOrderItemDetail[];
}

/**
 * Chi tiết item trong đơn nhập
 */
export interface ImportOrderItemDetail {
  productId: string;
  productName: string;
  versionId: string;
  versionName: string;
  colorId: string;
  colorName: string;
  importPrice: number;
  quantity: number;
  imeiOrSerialList: string[];
}

/**
 * Request để tạo đơn nhập (khớp với backend)
 */
export interface ImportOrderRequest {
  supplierId: string;
  importColorVersionList: ImportColorVersionRequest[];
}

/**
 * Request cho color version trong đơn nhập (khớp với backend ImportColorVersionRequest)
 */
export interface ImportColorVersionRequest {
  id: string; // colorId - ProductColorVersion ID
  importPrice: number; // BigDecimal -> number
  imeiOrSerialList: string[]; // Danh sách IMEI/Serial
}

/**
 * Item trong đơn nhập (dùng cho UI form)
 */
export interface ImportOrderItem {
  productId: string;
  versionId: string;
  colorId: string;
  unitPrice: number;
  imeiList: string[];
}

