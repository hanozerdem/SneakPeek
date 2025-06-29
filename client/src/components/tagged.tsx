"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Product, ProductResponse } from "@/interfaces/products.interface";

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag") || "";
  const colorFilter = searchParams.get("color") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://localhost:9000/api/products/")
      .then((res) => res.json())
      .then((data: ProductResponse) => {
        if (data.status) {
          setProducts(data.products);
        } else {
          setError(data.message || "Error fetching products");
        }
      })
      .catch(() => setError("Error fetching products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("http://localhost:9000/api/wishlist/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.wishlist) {
          setFavorites(data.wishlist);
        }
      })
      .catch(console.error);
  }, []);



  const filteredProducts = products.filter((product) => {
    const matchesTag = tagFilter ? product.tags?.some(tag => tag.toLowerCase() === tagFilter.toLowerCase()) : false;
    const matchesColor = colorFilter ? (product.color?.toLowerCase() === colorFilter.toLowerCase()) : false;

    if (tagFilter || colorFilter) {
      return matchesTag || matchesColor;
    }
    return true; // Eğer ikisi de boşsa tüm ürünleri göster
  });

  const handleToggleFavorite = async (productId: number) => {
    const url = `http://localhost:9000/api/wishlist/${favorites.includes(productId) ? "remove" : "add"}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setFavorites((prev) =>
          prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
      }
    } catch (e) {
      console.error("Wishlist error:", e);
    }
  };

  if (loading) return <div className="pt-24 px-4 md:px-8">Loading...</div>;
  if (error) return <div className="pt-24 px-4 md:px-8">{error}</div>;

  return (
    <>
      <div className="pt-24 px-4 md:px-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Products</h1>

        {/* Aktif filtreleri göster */}
        <div className="text-gray-500 mb-6">
          {tagFilter && <span>Tag: <b>{tagFilter}</b> </span>}
          {colorFilter && <span> | Color: <b>{colorFilter}</b></span>}
        </div>

        {/* Ürün grid'i */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.productId}
                href={`/products/${product.productId}`}
                className="bg-gray-50 p-4 rounded relative hover:shadow-md transition-shadow cursor-pointer block h-[400px]"
              >
                <div
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleFavorite(product.productId);
                  }}
                >
                  {favorites.includes(product.productId) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-400 hover:text-red-500" />
                  )}
                </div>

                <div className="w-full h-[220px] flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.imageUrl || "https://via.placeholder.com/200"}
                    alt={product.productName || "Product Image"}
                    width={180}
                    height={180}
                    unoptimized
                    className="object-contain"
                  />
                </div>

                <div className="mt-2 space-y-1 min-h-[100px] flex flex-col justify-start">
                  <p className="font-semibold">{product.productName}</p>
                  {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
                  {product.category && (
                    <p className="text-sm text-gray-500">
                      {product.category.includes("Women")
                        ? "Women's shoes"
                        : product.category.includes("Men")
                        ? "Men's shoes"
                        : `${product.category} shoes`}
                    </p>
                  )}
                  {(() => {
                      const discountedPrice = product.prices?.find(p => p.priceType === "discounted");
                      const standardPrice = product.prices?.find(p => p.priceType === "standard");
                      const isDiscounted = product.currentPriceType?.toLowerCase() === "discounted";

                      return isDiscounted && discountedPrice ? (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-400 line-through text-base">
                            {Math.round(standardPrice?.price ?? product.price ?? 0)} {product.currency || "€"}
                          </span>
                          <span className="text-lg font-bold text-black-600">
                            {Math.round(discountedPrice.price ?? 0)} {product.currency || "€"}
                          </span>
                        </div>
                      ) : (
                        <p className="text-lg font-semibold mb-2">
                          {Math.round(standardPrice?.price ?? product.price ?? 0)} {product.currency || "€"}
                        </p>
                      );
                    })()}

                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No products found matching your criteria.</p>
          )}
        </div>

        <div className="mb-20" />
      </div>

      <footer className="w-full bg-black py-12 flex flex-col items-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-white tracking-wider">SneakPeek</h2>
        </div>
      </footer>
    </>
  );
};

export default ProductsPage;
