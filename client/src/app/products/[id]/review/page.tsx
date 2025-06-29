"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { reportWebVitals } from "next/dist/build/templates/pages";

interface ReviewData {
  reviewId: number;
  userId: number;
  rating: number;
  userName?: string;
  reviewText?: string;
  createdAt: string;
  status: string | number;
}


interface ProductData {
  productId: number;
  status: boolean;
  message: string;
  productName: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  price?: number;
  currency?: string;
  warrantyStatus?: string;
  distributor?: string;
  description?: string;
  color?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
}

export default function ProductReviewPage() {
  const params = useParams();
  const { id } = params;
  const productId = Number(id);

  // ----- STATE -----
  const [product, setProduct] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Modal (Review ekleme) state'leri
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Yıldız dağılımı (5-4-3-2-1)
  const [ratingDistribution, setRatingDistribution] = useState<
    { rating: number; count: number }[]
  >([]);

  // ---- FETCH PRODUCT & REVIEWS ----
  useEffect(() => {
    fetch("http://localhost:9000/api/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn && data.userId) {
          setUserId(data.userId);
        }
      })
      .catch((err) => console.error("Error checking auth:", err));
  }, []);

  // UserId check
useEffect(() => {
  fetch("http://localhost:9000/api/auth/check", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn && data.userId) {
        setUserId(data.userId); // bunu state'e koy
      }
    });
}, []);

  useEffect(() => {
    // Ürün bilgisi
    fetch(`http://localhost:9000/api/products/${productId}`)
      .then((res) => res.json())
      .then((data: ProductData) => {
        if (data) {
          setProduct(data);
        }
      })
      .catch((err) => console.error("Error fetching product:", err));

    // Reviews
    fetch(`http://localhost:9000/api/products/review/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [productId]);


  const handleSubmitReview = async () => {
    const body = { productId, rating, reviewText, userId };
  
    try {
      const res = await fetch(`http://localhost:9000/api/products/review/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log(data);
  
      if (data.status) {
        setShowReviewModal(false);
        setRating(0);
        setReviewText("");
  
        // If the review is empty but rating is given, approve the review
        if ((!data.review?.reviewText || data.review?.reviewText.trim() === "") && rating > 0) {
          await fetch(`http://localhost:9000/api/products/review/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ reviewId: data.review?.reviewId }),
          });
        }
        
  
        // fetch reviews again
        fetch(`http://localhost:9000/api/products/review/${productId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status && data.reviews) {
              setReviews(data.reviews);
            }
          })
          .catch((err) => console.error("Error re-fetching reviews:", err));
      }
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };
  
  

  // averageRating & reviewCount
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  // ----- Yıldız dağılımını hesapla -----
  useEffect(() => {
    const distArr = [
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ];

    reviews.forEach((rev) => {
      const idx = distArr.findIndex((d) => d.rating === rev.rating);
      if (idx !== -1) {
        distArr[idx].count += 1;
      }
    });

    setRatingDistribution(distArr);
  }, [reviews]);

  // Filtre
  const filteredReviews = selectedRating
  ? reviews.filter((r) => r.rating === selectedRating && r.status === "APPROVED")
  : reviews.filter((r) => r.status === "APPROVED");

  



  // 
  const renderStars = (ratingVal: number) => (
    <div className="flex items-center gap-1">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${i < ratingVal ? "fill-black" : "fill-gray-300"}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 
                     2 9.27l7.1-1.01L12 2z" />
          </svg>
        ))}
    </div>
  );

  // Tarih biçimlendirme
  const formatDate = (isoString: string) => {
    const dateObj = new Date(isoString);
    // 'tr-TR' istersen 27.03.2025 formatı alırsın.
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="pt-24 px-4 md:px-8">
      {/* Üst başlık */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Reviews for "{product?.productName || "..."}"
        </h1>
        { }
      </div>

      {/* Kapsayıcı Kutu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sol: Ürün resmi */}
          <div className="flex items-center justify-center w-full md:w-1/5">
            {(
          <Image
          src={product?.imageUrl || "https://via.placeholder.com/400"}
          alt={product?.productName || "Product image"}
          width={160}
          height={160}
          unoptimized
          className="rounded object-contain"
        />
        
        )}
          </div>

          {/* Orta: büyük rating & star */}
          <div className="flex flex-col items-center justify-center w-full md:w-1/4">
            <div className="text-4xl font-bold text-center">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mt-2 mb-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating) ? "fill-black" : "fill-gray-300"
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 
                             7 14.14 2 9.27l7.1-1.01L12 2z" />
                  </svg>
                ))}
            </div>
            <p className="text-gray-600 text-sm text-center">
              Based on {reviews.length} reviews
            </p>
          </div>
                
          {/* Sağ: Bar Breakdown */}
          <div className="w-full md:w-2/4 space-y-2 flex flex-col justify-center">
            {ratingDistribution.map((dist) => {
              const maxCount = Math.max(...ratingDistribution.map((d) => d.count));
              const barWidth = maxCount ? (dist.count / maxCount) * 100 : 0;

              return (
                <div
                  key={dist.rating}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() =>
                    setSelectedRating(selectedRating === dist.rating ? null : dist.rating)
                  }
                >
                  <div className="flex items-center gap-1 w-10">
                    <span className="text-sm font-medium">{dist.rating}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-black"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 
                               5.82 22 7 14.14 2 9.27l7.1-1.01L12 2z" />
                    </svg>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-black h-2 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-10 text-right">{dist.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Üstte geri dön & review yaz */}
      <div className="flex justify-between items-center mb-6">
        <Link href={`/products/${id}`} className="text-sm underline text-gray-600">
          Go back to product page
        </Link>
        <button
          onClick={() => setShowReviewModal(true)}
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Filtre Info */}
      {selectedRating && (
        <div className="mb-4 text-sm text-gray-600">
          Showing only {selectedRating}-star reviews.{" "}
          <button className="underline" onClick={() => setSelectedRating(null)}>
            Clear filter
          </button>
        </div>
      )}

      {/* Yorum Listesi */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => {
          // Tarihi okunabilir formata çevir
          const postedDate = formatDate(rev.createdAt);

          return (
            <div
              key={rev.reviewId}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              { rev.rating > 0 && (
              <div className="mb-2">{renderStars(rev.rating)}</div>
            )}
              {rev.userName && (
  <p className="font-semibold mb-1">{rev.userName}</p>
)}

              <p className="text-gray-600 text-sm mb-2">{rev.reviewText}</p>
              <p className="text-xs text-gray-400">Posted on {postedDate}</p>
            </div>
          );
        })}
        {filteredReviews.length === 0 && (
          <p className="col-span-full text-gray-500">
            No reviews found for this rating.
          </p>
        )}
      </div>

      {/* Modal */}
      {showReviewModal && (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 relative">
      <button
        onClick={() => setShowReviewModal(false)}
        className="absolute top-4 right-4 text-gray-600 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-1 text-center">Write a Review</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Share your thoughts with the community.
      </p>

      {/* Total Score */}
      <label className="block font-medium text-gray-800 mb-2">Total Score</label>
      <div className="flex justify-center gap-1 mb-4">
        {[0, 1, 2, 3, 4].map((starIndex) => (
          <svg
            key={starIndex}
            onClick={() => setRating(starIndex + 1)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-8 h-8 cursor-pointer transition-transform duration-100 ${
              starIndex < rating ? "fill-black" : "fill-gray-300"
            }`}
          >
            <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 
                     12 18.56 5.82 22 7 14.14 2 9.27l7.1-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Divider */}
      <hr className="my-4 border-gray-200" />

      {/* Review Text */}
      <label className="block font-medium text-gray-800 mb-2">Your review</label>
      <textarea
        placeholder="What do you think about the product?"
        className="border border-gray-300 rounded p-2 mb-6 resize-none h-32 w-full 
                   focus:outline-none focus:ring-2 focus:ring-black/50"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />

      <button
        className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
        onClick={handleSubmitReview}
      >
        Submit Review
      </button>
    </div>
  </div>
)}
    </div>
  );
}
