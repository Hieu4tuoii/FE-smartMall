"use client";
import { Star } from "lucide-react";
import type { ReviewListResponse } from "@/types/Review";
import { formatDateOnly } from "@/utils/commonUtils";

type Props = {
  reviewsData: ReviewListResponse;
};

/**
 * Component hiển thị section đánh giá sản phẩm
 * Bao gồm: điểm trung bình, breakdown theo sao, danh sách đánh giá
 */
export default function ReviewsSection({ reviewsData }: Props) {
  const { reviews, statistics } = reviewsData;
  const { averageRating, totalReviews, rating1Count, rating2Count, rating3Count, rating4Count, rating5Count } = statistics;

  // Tính phần trăm cho mỗi mức sao
  const getRatingPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  // Render sao
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // Render breakdown sao
  const renderRatingBreakdown = (rating: number, count: number) => {
    const percentage = getRatingPercentage(count);
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 w-20">
          <span className="text-sm">{rating}</span>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
      </div>
    );
  };

  return (
    <section className="mb-12">
      <h2 className="mb-6">Đánh giá sản phẩm</h2>
      <div className="bg-white rounded-2xl border p-6">
        {/* Phần tổng quan đánh giá */}
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b">
          {/* Điểm trung bình */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFull = star <= Math.floor(averageRating);
                  const isPartial = star === Math.ceil(averageRating) && averageRating % 1 !== 0;
                  return (
                    <div key={star} className="relative">
                      <Star className="w-5 h-5 fill-gray-200 text-gray-200" />
                      {isFull && (
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 absolute top-0 left-0" />
                      )}
                      {isPartial && (
                        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${(averageRating % 1) * 100}%` }}>
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Dựa trên {totalReviews} đánh giá
            </p>
          </div>

          {/* Breakdown theo sao */}
          <div className="flex-1 space-y-3">
            {renderRatingBreakdown(5, rating5Count)}
            {renderRatingBreakdown(4, rating4Count)}
            {renderRatingBreakdown(3, rating3Count)}
            {renderRatingBreakdown(2, rating2Count)}
            {renderRatingBreakdown(1, rating1Count)}
          </div>
        </div>

        {/* Danh sách đánh giá */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có đánh giá nào cho sản phẩm này
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium mb-1">{review.userFullName}</p>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateOnly(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground mt-2">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

