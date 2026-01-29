import React, { useEffect, useMemo } from "react";
import { useReviewStore } from "../../state/useReviewStore";

const renderStars = (count) => (
  <span className="text-yellow-400">
    {Array.from({ length: 5 }).map((_, index) =>
      index < count ? "★" : "☆"
    )}
  </span>
);

function Review() {
  const reviews = useReviewStore((state) => state.reviews);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);
  const isLoading = useReviewStore((state) => state.isLoading);
  const fetchError = useReviewStore((state) => state.error);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  const ratingDistribution = useMemo(() => {
    const counts = reviews.reduce(
      (acc, review) => {
        const rating = Math.max(1, Math.min(5, review.rating));
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star] || 0,
    }));
  }, [reviews]);

  useEffect(() => {
    fetchReviews().catch(() => {
      // ignore, UI state handles errors
    });
  }, [fetchReviews]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-5">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
        Customer Reviews
      </h1>

      {/* Rating Summary */}
      <div className="mb-10 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-gray-500 mt-1">{totalReviews} Reviews</p>
          </div>

          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 text-sm text-gray-700">{star}★</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-yellow-400 rounded-full"
                    style={{
                      width: `${totalReviews ? (count / totalReviews) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="w-8 text-sm text-gray-600 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {isLoading && (
          <p className="text-center text-gray-500">Loading reviews...</p>
        )}
        {!isLoading && fetchError && (
          <p className="text-center text-red-600">{fetchError}</p>
        )}
        {!isLoading && reviews.length === 0 && !fetchError && (
          <p className="text-center text-gray-500">No reviews yet.</p>
        )}
        {!isLoading &&
          reviews.map((review) => (
            <div
              key={review._id}
              className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">
                  {review.clientName || "Client"}
                </h3>
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700 mb-2">{review.comment || "—"}</p>
              <p className="text-gray-400 text-sm">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Review;
