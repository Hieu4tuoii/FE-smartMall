export type ProductItemStatus = "IN_STOCK" | "SOLD";

export interface ProductItemAdmin {
  id: string;
  imeiOrSerial: string;
  status: ProductItemStatus;
  createdAt: string;
  warrantyActivationDate?: string | null;
  warrantyExpirationDate?: string | null;
}

