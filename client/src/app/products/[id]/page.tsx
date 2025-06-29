"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface SizeData {
  sizeId: number;
  size: string; // Example : 42
  quantity: number;
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
  sizes?: SizeData[]; // All stock informations that comes from
  // product api
  prices?: {
    pricingId: number;
    priceType: string;
    price: number;
    currency: string;
  }[];
  currentPriceType?: string; 
}

interface ReviewData {
  userName: string;
  reviewId: number;
  userId: number;
  reviewText?: string;
  rating: number;
  createdAt: string;
  status:  number | string; 

}

type SortOption = "latest" | "lowToHigh" | "highToLow";

// These are constant shoes sizes
const fixedShoeSizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  // ------ State ------
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isFavorite, setIsFavorite] = useState<number>(-1);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  // Sort + Modal states
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  // State for error messages (example. Add To Cart)
  const [cartError, setCartError] = useState("");
  const isOutOfStock = product?.sizes?.every(size => size.quantity === 0);


  // ------ Effects ------
  // 1) Load product and reviews information
  useEffect(() => {
    // Fetch product data from backend
    // no cache for products
    fetch(`http://localhost:9000/api/products/${productId}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product data");
        return res.json();
      })
      .then((data: ProductData) => {
        if (data.status) setProduct(data);
      })
      .catch((err) => console.error("Error fetching product:", err));

    // Fetch review data
    fetch(`http://localhost:9000/api/products/review/${productId}`)
  .then((res) => res.json())
  .then((data) => {
    console.log("Fetched Reviews:", data.reviews); // 🔥 burada bakacağız
    if (data.status && data.reviews) {
      const approved = (data.reviews as ReviewData[]).filter(
        r => r.status === 1
      );      
      setReviews(approved);
    }
  })

      .catch((err) => console.error("Error fetching reviews:", err));
  }, [productId]);

  // 2) Fetch wishlist informations
  useEffect(() => {
    fetch("http://localhost:9000/api/wishlist/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.wishlist) {
          if (data.wishlist.includes(productId)) setIsFavorite(productId);
          else setIsFavorite(-1);
        }
      })
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, [productId]);

  // 3) Calculate the average of the reviews
  useEffect(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      setAverageRating(sum / reviews.length);
    } else {
      setAverageRating(0);
    }
  }, [reviews]);

  // ------ Favorites Toggle ------
  const handleToggleFavorite = async () => {
    if (isFavorite === productId) {
      // Remove from favorites
      try {
        const res = await fetch("http://localhost:9000/api/wishlist/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({productId }),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
        setIsFavorite(-1);
      } catch (err) {
        console.error("Error removing from wishlist:", err);
      }
    } else {
      // Add to favorites
      try {
        const res = await fetch("http://localhost:9000/api/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to add to wishlist");
        setIsFavorite(productId);
      } catch (err) {
        console.error("Error adding to wishlist:", err);
      }
    }
  };

  // ------ Add To Cart Process ------
  const handleAddToCart = async () => {
    if (!selectedSize) {
      setCartError("Please select a number to add to cart.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:9000/api/auth/check", {
        credentials: "include",
      });
  
      const data = await res.json();
  
      if (data.loggedIn) {
        // Kullanıcı login ise sunucuya istek at
        const payload = {
          productId: productId,
          size: selectedSize.toString(),
          quantity: 1,
          price: product?.prices?.find(p => p.priceType === "standard")?.price || 0,
        };
  
        const resAdd = await fetch("http://localhost:9000/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        if (!resAdd.ok) {
          const errData = await resAdd.json();
          setCartError(errData.message || "An error occurred while adding to cart.");
        } else {
          setCartError("");
          router.push('/cart');
        }
      } else {
        // Kullanıcı login değilse localStorage'a kaydet
        if (product && selectedSize) {
          addToLocalCart(product, selectedSize);
          alert("Product added to local cart!");
        }
      }
    } catch (err) {
      console.error("Error checking login status or adding to cart:", err);
      setCartError("An error occurred while adding to cart.");
    }
  };
  

  function addToLocalCart(product: ProductData, size: number) {
    const key = "cart"; // localStorage key'imiz
    
    // 1. Önce var mı diye kontrol edelim
    const cartStr = localStorage.getItem(key);
    let cartItems: any[] = cartStr ? JSON.parse(cartStr) : [];
  
    // 2. Bu ürün + bu beden zaten var mı?
    const existingIndex = cartItems.findIndex(
      (item) => item.productId === product.productId && item.size === size
    );
  
    if (existingIndex !== -1) {
      // 3. Varsa quantity artır
      cartItems[existingIndex].quantity += 1;
    } else {

      // 4. Yoksa yeni ürün ekle
      cartItems.push({
        productId: productId,
        productName: product.productName,
        ImageUrl: product.imageUrl,
        price: product?.prices?.find(p => p.priceType === "standard")?.price || 0,
        currency: product?.prices?.find(p => p.priceType === "standard")?.currency || "€",
        size: size,
        quantity: 1,
      });
    }
  
    // 5. Güncellenmiş cart'ı tekrar kaydet
    localStorage.setItem(key, JSON.stringify(cartItems));
  }
  

  // ------ Add Comment (Modal) ------
  const handleSubmitReview = async () => {
    const body = { productId, rating, reviewText };
    try {
      const res = await fetch("http://localhost:9000/api/products/review/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        setShowReviewModal(false);
        setRating(0);
        setReviewText("");
        // If the review is empty, we need to approve it immediately
        if ((body.reviewText ?? "").trim() === "" && rating > 0) {
          console.log("Review text boş, approve isteği atılıyor...");
          console.log("Gönderilecek reviewId:", data.review?.reviewId);

          const approveRes = await fetch(`http://localhost:9000/api/products/review/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ reviewId: data.review?.reviewId }),
          });
          const approveData = await approveRes.json();
          console.log("Approve isteği sonucu:", approveData);
        }
        
        // Get all reviews again
        fetch(`http://localhost:9000/api/products/review/${productId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status && data.reviews) {
              const approved = (data.reviews as ReviewData[]).filter(r => r.status === "APPROVED");
              setReviews(approved);
            }
          })          
          .catch((err) => console.error("Error re-fetching reviews:", err));
      }
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  // ------ Sorting ------
  const sortedApprovedReviews = [...reviews];
  if (sortOption === "latest") {
    sortedApprovedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortOption === "lowToHigh") {
    sortedApprovedReviews.sort((a, b) => a.rating - b.rating);
  } else if (sortOption === "highToLow") {
    sortedApprovedReviews.sort((a, b) => b.rating - a.rating);
  }

  // ------ Half Star Logic ------
  function renderStar(index: number, ratingVal: number) {
    const floorVal = Math.floor(ratingVal);
    const fraction = ratingVal - floorVal;
    if (index < floorVal) {
      return (
        <path
          fill="black"
          d="M12 2l2.9 6.26L22 9.27l-5 4.87
             1.18 6.86L12 18.56 5.82 22
             7 14.14 2 9.27l7.1-1.01L12 2z"
        />
      );
    } else if (index > floorVal) {
      return (
        <path
          fill="lightgray"
          d="M12 2l2.9 6.26L22 9.27l-5 4.87
             1.18 6.86L12 18.56 5.82 22
             7 14.14 2 9.27l7.1-1.01L12 2z"
        />
      );
    } else {
      const percent = Math.round(fraction * 100);
      const gradId = `starGrad-${index}`;
      return (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
              <stop offset={`${percent}%`} stopColor="black" />
              <stop offset={`${percent}%`} stopColor="lightgray" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path fill={`url(#${gradId})`} d="M12 2l2.9 6.26L22 9.27l-5 4.87
             1.18 6.86L12 18.56 5.82 22
             7 14.14 2 9.27l7.1-1.01L12 2z" />
        </>
      );
    }
  }

  // ------ Auxiliary Function: Price Display ------
  const displayPrice = () => {
    const stdPrice = product?.prices?.find(p => p.priceType === "standard");
    if (stdPrice) return `${Math.ceil(stdPrice.price)} ${stdPrice.currency }`;
    if (product?.price) return `${Math.ceil(product.price)} ${product.currency}`;
    return "Price not available";
  };

  if (!product) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* BreadCrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          Home &gt; New arrivals &gt; {product.productName}
        </nav>
        
        {/* Above: Image + Details */}
        <div className="flex flex-col md:flex-row items-stretch gap-8">
          {/* Left: Picture */}
          <div className="relative bg-gray-50 p-4 pr-8 lg:pr-16 rounded-md w-full lg:w-[60%]">
            <div className="relative w-full aspect-square">
              <Image
                src={product.imageUrl || "https://via.placeholder.com/400"}
                alt={product.productName}
                fill
                unoptimized
                className="object-contain"
              />
              <div
                className="absolute top-2 right-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggleFavorite();
                }}
              >
                {isFavorite !== -1 ? (
                  <FaHeart className="text-red-500" size={24} />
                ) : (
                  <FaRegHeart className="text-gray-400 hover:text-red-500" size={24} />
                )}
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="w-full lg:w-[40%] flex flex-col">
            <p className="text-sm text-gray-500 mb-2">
              {product.category ? `${product.category} shoes` : "Shoes"}
            </p>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
            {product.currentPriceType === "discounted" ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 line-through text-base">
                  {product.prices?.find(p => p.priceType === "standard")?.price} {product.currency || "€"}
                </span>
                <span className="text-lg font-bold text-black-600">
                  {product.prices?.find(p => p.priceType === "discounted")?.price} {product.currency || "€"}
                </span>
              </div>
            ) : (
              <p className="text-lg font-semibold mb-2">
                {displayPrice()}
              </p>
            )}

            <p className="text-gray-600 mb-6">
              {product.description || "No description available."}
            </p>

            {/* Stars + Average Rating + Review Count */}
            <div
              onClick={() => router.push(`/products/${productId}/review`)}
              className="flex items-center gap-1 cursor-pointer"
            >
              {[0, 1, 2, 3, 4].map((starIndex) => (
                <svg key={starIndex} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                  {renderStar(starIndex, averageRating)}
                </svg>
              ))}
              <span className="ml-2 text-gray-600 text-base flex items-center gap-2">
                {averageRating.toFixed(1)}/5
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {sortedApprovedReviews.length} reviews
                </span>
              </span>
            </div>

            {/* You Choice */}
            <div className="mb-4">
              <p className="font-medium mb-2 mt-6">Select Size</p>
              <div className="flex flex-wrap gap-3">
                {fixedShoeSizes.map((fixedSize) => {
                  // The relevant number in product.sizes coming from the API is checked according to the stock status.
                  const availableSize = product.sizes?.find(
                    (sizeObj) => Number(sizeObj.size) === fixedSize && sizeObj.quantity > 0
                  );
                  const outOfStock = !availableSize;
                  const isSelected = selectedSize === fixedSize;
                  return (
                    <button
                      key={fixedSize}
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(fixedSize)}
                      className={`
                        relative px-4 py-2 border rounded min-w-[90px] text-center font-medium text-sm
                        transition-all
                        ${outOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through" : ""}
                        ${
                          isSelected && !outOfStock
                            ? "border-black text-black"
                            : "border-gray-300 text-black hover:border-black hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="whitespace-nowrap">EU {fixedSize}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col gap-4 w-full mt-6">
            {isOutOfStock ? (
              <button
                disabled
                className="bg-red-500 text-white px-6 py-4 rounded-full text-base font-semibold cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-6 py-4 rounded-full text-base font-semibold hover:bg-gray-800 transition"
              >
                Add To Cart
              </button>
            )}

              {cartError && (
                <p className="text-red-500 text-sm mt-2">{cartError}</p>
              )}
              <button
                onClick={handleToggleFavorite}
                className="border-2 border-gray-300 text-black px-6 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition"
              >
                {isFavorite !== -1 ? "Remove From Wishlist" : "Move To Wishlist"}
              </button>
              {selectedSize !== null && (() => {
              const sz = product.sizes?.find(s => Number(s.size) === selectedSize);
              const qty = sz?.quantity ?? 0;
              if (qty < 5) {
                return (
                  <div className="mt-2 px-6 py-4 w-full bg-red-50 border border-red-500 text-red-700 rounded-full text-center text-sm">
                    Only {qty} left in size {selectedSize}
                  </div>
                );
              }
              return null;
            })()}

            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex" aria-label="Tabs">
          <button
            className={`w-1/2 text-center py-5 border-b-2 font-medium text-base ${
              activeTab === "details"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-black hover:border-black"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Product Details
          </button>
          <button
            className={`w-1/2 text-center py-5 border-b-2 font-medium text-base ${
              activeTab === "reviews"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-black hover:border-black"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Rating & Reviews
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "details" && (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm w-full">
            <div className="grid grid-cols-[80px_1fr] gap-y-1 text-sm">
              <div className="font-semibold text-gray-700">Brand:</div>
              <div>{product.brand || "-"}</div>
              <div className="font-semibold text-gray-700">Model:</div>
              <div>{product.model || "-"}</div>
              <div className="font-semibold text-gray-700">Color:</div>
              <div>{product.color || "-"}</div>
              <div className="font-semibold text-gray-700">Warranty:</div>
              <div>{product.warrantyStatus || "-"}</div>
              <div className="font-semibold text-gray-700">Distributor:</div>
              <div>{product.distributor || "-"}</div>
              <div className="font-semibold text-gray-700">Serial #:</div>
              <div>{product.serialNumber || "-"}</div>
              <div className="font-semibold text-gray-700">Category:</div>
              <div>{product.category || "-"}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Title, Sort and Comment Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">
              All Reviews <span className="text-sm text-gray-400">({reviews.length})</span>
            </h2>

            <div className="flex gap-4 flex-wrap">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors appearance-none pr-10 relative"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg fill='white' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path d='M5.5 7l4.5 4.5L14.5 7z'/></svg>\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="latest">Latest</option>
                <option value="lowToHigh">Low to High</option>
                <option value="highToLow">High to Low</option>
              </select>

              <button
                onClick={() => setShowReviewModal(true)}
                className="border border-black text-black px-4 py-2 rounded hover:bg-black hover:text-white transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Comment List */}
          <div className="grid md:grid-cols-2 gap-4">
            {sortedApprovedReviews.map((rev) => (
              <div key={rev.reviewId} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                {rev.rating > 0 && (
                <div className="flex items-center mb-2">
                  {[0, 1, 2, 3, 4].map((starIndex) => (
                    <svg key={starIndex} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                      {renderStar(starIndex, rev.rating)}
                    </svg>
                  ))}
                </div>
              )}

               <p className="font-semibold mb-1">{rev.userName}</p>
              {rev.reviewText && (
               <p className="text-gray-600 text-sm mb-2">{rev.reviewText}</p>
              )}
                <p className="text-xs text-gray-400">
                  {new Date(rev.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
            {sortedApprovedReviews.length === 0 && (
              <p className="col-span-full text-gray-500">No reviews found.</p>
            )}
          </div>
        </div>
      )}

      {/* Comment Writing Modal */}
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
            <p className="text-sm text-gray-500 text-center mb-6">Share your thoughts with the community.</p>
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
                  <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l7.1-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <hr className="my-4 border-gray-200" />
            {/* Review Text */}
            <label className="block font-medium text-gray-800 mb-2">Your review</label>
            <textarea
              placeholder="What do you think about the product?"
              className="border border-gray-300 rounded p-2 mb-6 resize-none h-32 w-full focus:outline-none focus:ring-2 focus:ring-black/50"
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
    </>
  );
}
