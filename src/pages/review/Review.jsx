import React from "react";

// Sample data
const reviews = [
  { id: 1, name: "John Doe", rating: 5, comment: "Excellent service!", date: "2025-11-25" },
  { id: 2, name: "Jane Smith", rating: 4, comment: "Very good cleaning, punctual staff.", date: "2025-11-20" },
  { id: 3, name: "Alice Johnson", rating: 5, comment: "Highly recommended!", date: "2025-11-18" },
];

// Sample rating distribution
const ratingDistribution = { 5: 100, 4: 50, 3: 20, 2: 5, 1: 4 };

function Review() {
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  const renderStars = (count) => (
    <span className="text-yellow-400">
      {Array.from({ length: 5 }).map((_, index) =>
        index < count ? "★" : "☆"
      )}
    </span>
  );

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
            <div className="flex items-center gap-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-gray-500 mt-1">{totalReviews} Reviews</p>
          </div>

          <div className="flex-1 space-y-2">
            {Object.entries(ratingDistribution)
              .sort((a, b) => b[0] - a[0])
              .map(([star, count]) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-gray-700">{star}★</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-yellow-400 rounded-full"
                      style={{ width: `${(count / 100) * 100}%` }}
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
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">{review.name}</h3>
              {renderStars(review.rating)}
            </div>
            <p className="text-gray-700 mb-2">{review.comment}</p>
            <p className="text-gray-400 text-sm">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Review;
