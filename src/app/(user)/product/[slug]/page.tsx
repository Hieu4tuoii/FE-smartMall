import { getPublicProductVersionDetail, getRelatedPublicProductVersions } from "@/services/productService";
import { getReviewList } from "@/services/reviewService";
import type { ProductVersionDetailResponse, ProductVersionResponse } from "@/types/ProductVersion";
import ProductVersionDetail from "./ProductVersionDetail";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [detail, related] = await Promise.all([
    getPublicProductVersionDetail(slug),
    getRelatedPublicProductVersions(slug),
  ]);

  // Fetch reviews sau khi có detail.id
  let reviewsData = null;
  try {
    reviewsData = await getReviewList(detail.id, 0, 10, "createdAt:desc");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đánh giá:", error);
    // Tạo default data khi fetch thất bại
    reviewsData = {
      reviews: [],
      statistics: {
        totalReviews: 0,
        averageRating: 0,
        rating1Count: 0,
        rating2Count: 0,
        rating3Count: 0,
        rating4Count: 0,
        rating5Count: 0,
      },
      pageNo: 0,
      pageSize: 10,
      totalPage: 0,
    };
  }

  return (
    <ProductVersionDetail detail={detail} related={related} reviewsData={reviewsData} />
  );
}




