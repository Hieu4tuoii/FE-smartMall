export type BrandResponse = {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
};

export type BrandRequest = {
  name: string;
};

// // Interface cho Brand (phù hợp với backend BrandResponse)
// export interface Brand {
//   id: string;
//   name: string;
//   slug: string;
//   imageUrl: string;
//   createdAt: string;
//   modifiedAt: string;
// }

// // Interface cho Category (phù hợp với backend CategoryResponse)
// export interface Category {
//   id: string;
//   name: string;
//   slug: string;
//   imageUrl: string;
//   createdAt: string;
//   modifiedAt: string;
// }

