// Interface cho CartItemResponse từ API
export interface CartItemResponse {
  id: string;
  productColorVersionId: string;
  productName: string;
  productVersionName: string;
  colorName: string;
  slug?: string;
  imageUrl?: string;
  quantity: number;
  totalPrice: number; // giá này là giá đã sau khuyến mãi
}

// Interface cho CartResponse từ API
export interface CartResponse {
  totalItem: number;
  totalPrice: number;
  cartItems: CartItemResponse[];
}

