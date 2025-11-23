// Interface cho ReviewCreationRequest gửi lên API
export interface ReviewCreationRequest {
  productVersionId: string;
  rating: number; // 1-5, bắt buộc
  comment?: string; // tùy chọn
}

// Interface cho ReviewResponse từ API
export interface ReviewResponse {
  id: string;
  productVersionId: string;
  userFullName: string;
  comment?: string;
  rating: number; // 1-5
  createdAt: string;
  modifiedAt: string;
}

// Interface cho ReviewStatistics từ API
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number; // 1.0 - 5.0
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

// Interface cho ReviewListResponse từ API
export interface ReviewListResponse {
  reviews: ReviewResponse[];
  statistics: ReviewStatistics;
  pageNo: number;
  pageSize: number;
  totalPage: number;
}

