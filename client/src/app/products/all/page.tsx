"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Product, ProductResponse } from "@/interfaces/products.interface";

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    tag: "",
    category: "",
    price: "",
    color: "",
  });

  const [sortOption, setSortOption] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://localhost:9000/api/products/")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data: ProductResponse) => {
        if (!data.status) throw new Error(data.message || "Unknown error");
        setProducts(data.products);
      })
      .catch((err) => setError(err.message || "Error fetching products"))
      .finally(() => setLoading(false));

  }, []);

  useEffect(() => {
    fetch("http://localhost:9000/api/wishlist/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.wishlist) {
          setFavorites(data.wishlist);
        }
      })
      .catch(console.error);
  }, []);

  const getStandardPrice = (product: Product) => {
    const std = product.prices?.find((p) => p.priceType === "standard");
    return std ? { price: std.price, currency: std.currency } : { price: product.price, currency: product.currency };
  };

  const availableTags = ["Adidas", "Converse", "Veja", "Nike", "New Balance", "UGG"];
  const availableCategories = Array.from(new Set([...products.map((p) => p.category).filter(Boolean), "Child", "Baby"]));
  const availableColors = Array.from(new Set(products.map((p) => p.color).filter(Boolean)));
  const availablePrices = Array.from(new Set(products.map((p) => getStandardPrice(p).price).filter(Boolean)));

  const filteredProducts = products
  .filter((product) => (getStandardPrice(product).price ?? 0) > 0) // fiyatı 0'dan büyük olanları al
  .filter((product) => {
    const price = getStandardPrice(product).price;
    return (
      (!filters.tag || product.tags?.some((tag) => tag.toLowerCase() === filters.tag.toLowerCase())) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.color || product.color === filters.color) &&
      (!filters.price || price === Number(filters.price))
    );
  });


  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = getStandardPrice(a).price || 0;
    const bPrice = getStandardPrice(b).price || 0;
  
    if (sortOption === "PriceAsc") return aPrice - bPrice;
    if (sortOption === "PriceDesc") return bPrice - aPrice;
    if (sortOption === "Popularity") return (b.popularity || 0) - (a.popularity || 0);
    if (sortOption === "Sales") return (b.sales || 0) - (a.sales || 0);
    if (sortOption === "Rating") return (b.rating || 0) - (a.rating || 0);
    
    return 0; 
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

  const clearAllFilters = () => {
    setFilters({ tag: "", category: "", price: "", color: "" });
    setSortOption("");
  };

  const getDisplayPrice = (product: Product) => {
    const { price, currency } = getStandardPrice(product);
    return price ? `${Math.ceil(price)} ${currency || "USD"}` : "Price not available";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="pt-24 px-4 md:px-8">
        <h1 className="px-2 text-4xl md:text-6xl font-bold mb-4">ALL</h1>

        <div className="mt-5 border-y border-gray-300 py-4 px-2 flex flex-wrap gap-4 items-center justify-start">
          {[{ label: "tag", values: availableTags },
            { label: "category", values: availableCategories },
            { label: "color", values: availableColors },
            { label: "price", values: availablePrices },
          ].map(({ label, values }) => (
            <div className="relative inline-block" key={label}>
              <select
                className="border border-black rounded px-4 py-2 text-sm appearance-none bg-white pr-8"
                onChange={(e) => setFilters({ ...filters, [label]: e.target.value })}
                value={filters[label as keyof typeof filters]}
              >
                <option value="">{label[0].toUpperCase() + label.slice(1)}</option>
                {values.map((v) => (
                  <option value={String(v)} key={String(v)}>
                    {label === "price" ? `$ ${v}` : String(v)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black-500">
                ▼
              </div>
            </div>
          ))}

          <div className="relative inline-block">
          <select
            className="border border-black rounded px-4 py-2 text-sm appearance-none bg-white pr-8"
            onChange={(e) => setSortOption(e.target.value)}
            value={sortOption}>
            <option value="">Sort by</option>
            <option value="PriceAsc">Price: Low to High</option>
            <option value="PriceDesc">Price: High to Low</option>
            <option value="Popularity">Popularity</option>
            <option value="Sales">Sales</option>
            <option value="Rating">Rating</option>
          </select>

            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black-500">
              ▼
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center gap-4">
          <h2 className="text-xl font-bold">{sortedProducts.length} PRODUCTS</h2>
          <button className="text-black cursor-pointer underline" onClick={clearAllFilters}>
            Clear all filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {sortedProducts.map((product) => (
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
          ))}
        </div>

        <div className="mb-20" />
      </div>

      <footer className="w-full bg-black py-12 flex flex-col items-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-white tracking-wider">SneakPeek</h2>
        </div>
        <div className="w-full flex justify-between px-16 text-white text-sm font-light">
          <div className="flex flex-col space-y-2">
            <a href="/all" className="hover:text-gray-400 transition cursor-pointer">ALL</a>
            <a href="/women" className="hover:text-gray-400 transition cursor-pointer">WOMAN</a>
            <a href="/men" className="hover:text-gray-400 transition cursor-pointer">MEN</a>
          </div>
          <div className="flex flex-col space-y-2 text-right">
            <a href="#workout" className="hover:text-gray-400 transition cursor-pointer">WORKOUT</a>
            <a href="#run" className="hover:text-gray-400 transition cursor-pointer">RUN</a>
            <a href="#football" className="hover:text-gray-400 transition cursor-pointer">FOOTBALL</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Page;
