export type CategoryResponse = {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
};

export type CategoryRequest = {
  name: string;
};

// Interface cho Category (phù hợp với backend CategoryResponse)
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
  modifiedAt: string;
}

