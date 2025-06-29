"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

// Define the structure of a product item
interface ProductData {
  productId: number;
  productName: string;
  brand?: string;
  price?: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
}

export default function FavoritesPage() {
  const [wishlist, setWishlist] = useState<ProductData[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch wishlist IDs + details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const wishRes = await fetch("http://localhost:9000/api/wishlist/", {
          credentials: "include",
        });

        if (!wishRes.ok) {
          throw new Error(`Wishlist request failed: ${wishRes.status}`);
        }

        const wishJson = await wishRes.json().catch(() => {
          throw new Error("Failed to parse wishlist response JSON.");
        });

        if (!wishJson.status || !Array.isArray(wishJson.wishlist)) {
          throw new Error(wishJson.message || "Invalid wishlist data.");
        }

        const ids: number[] = wishJson.wishlist;
        setFavorites(ids);

        const detailFetches = ids.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:9000/api/products/${id}`, {
              cache: "no-store",
            });

            if (!res.ok) {
              console.warn(`Product ${id} fetch failed: ${res.status}`);
              return null;
            }

            const data = await res.json().catch(() => {
              console.warn(`Product ${id} JSON parse failed`);
              return null;
            });

            if (!data?.status) return null;

            return {
              productId: id,
              productName: data.productName,
              brand: data.brand,
              price: data.price,
              currency: data.currency,
              category: data.category,
              imageUrl: data.imageUrl,
            } as ProductData;
          } catch (err) {
            console.warn("Error fetching product:", id, err);
            return null;
          }
        });

        const details = await Promise.all(detailFetches);
        setWishlist(details.filter((d): d is ProductData => !!d));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading favorites");
      } finally {
        setLoading(false);
      }
    };



    fetchData();
  }, []);

  // Remove from wishlist
  const handleToggleFavorite = async (
    e: React.MouseEvent,
    productId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch("http://localhost:9000/api/wishlist/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to remove from wishlist");

      setFavorites((prev) => prev.filter((id) => id !== productId));
      setWishlist((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading favorites…</div>;
  }
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-8">
      <h1 className="px-2 text-4xl md:text-6xl font-bold mb-4">
        FAVORITES
      </h1>
      <p className="px-2 text-lg font-bold mb-6">
        {wishlist.length} {wishlist.length === 1 ? "PRODUCT" : "PRODUCTS"}
      </p>

      {wishlist.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-xl font-medium text-gray-700">
            Your wishlist is currently empty.
          </p>
          <p className="text-gray-500">
            Browse our products and tap the heart icon to save your favorites!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product, idx) => (
            <Link
              key={`${product.productId}-${idx}`}
              href={`/products/${product.productId}`}
              className="block bg-white rounded-lg shadow-sm p-4 relative border border-gray-100 hover:shadow-md transition"
            >
              <div className="relative w-full aspect-square mb-3">
                <Image
                  src={product.imageUrl || "https://i.imgur.com/RrhWFY4.png"}
                  alt={product.productName}
                  fill
                  unoptimized
                  className="object-contain rounded"
                />
                <button
                  onClick={(e) => handleToggleFavorite(e, product.productId)}
                  className="absolute top-2 right-2 p-1 rounded-full transition-transform hover:scale-110"
                >
                  <FaHeart size={22} className="text-red-500" />
                </button>
              </div>

              <h3 className="font-semibold text-base">
                {product.productName}
              </h3>
              <p className="text-sm text-gray-500">{product.brand || "Brand"}</p>
              <p className="text-sm text-gray-400">
                {product.category || "Category"}
              </p>
              <p className="font-medium mt-1">
                {product.price?.toFixed(2)} {product.currency || "USD"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
