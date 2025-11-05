import { Product } from "./Product";

export type PromotionResponse = {
  id: string;
  startAt: string;
  endAt: string;
  discount: number; // tính theo %
  maximumDiscountAmount?: number; // tính theo VNĐ
  createdAt: string;
  modifiedAt: string;
  products?: Product[]; // Danh sách sản phẩm áp dụng khuyến mãi
};

export type PromotionRequest = {
  startAt: string;
  endAt: string;
  discount: number; // tính theo %
  maximumDiscountAmount?: number; // tính theo VNĐ
  productIds?: string[]; // Danh sách ID sản phẩm áp dụng khuyến mãi
};

