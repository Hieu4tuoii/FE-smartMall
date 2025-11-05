export type BannerResponse = {
  id: string;
  imageUrl: string;
  link?: string | null;
  createdAt: string;
  modifiedAt: string;
};

export type BannerRequest = {
  imageUrl: string;
  link?: string | null;
};


