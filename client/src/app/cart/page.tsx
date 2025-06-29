"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Tipler
export interface ExpandedCartItem {
  productId: number;
  size: string;
  quantity: number;
  price: number;
  brand?: string;
  model?: string;
  productName?: string;
  currency?: string;
  color?: string;
  ImageUrl?: string;
}

export interface GetCartExpandedResponse {
  status: boolean;
  message: string;
  items?: ExpandedCartItem[];
  totalPrice?: number;
}

export interface RemoveItemFromCartRequest {
  productId: number;
  size: string;
}

export interface UpdateCartItemRequest {
  productId: number;
  size: string;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<ExpandedCartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");

  const router = useRouter();

  // Login kontrolü
  const checkLogin = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/auth/check", {
        credentials: "include",
      });
    const data = await res.json().catch(() => ({ loggedIn: false }));
    if (typeof data.loggedIn !== "boolean") {
      setIsLoggedIn(false);
      fetchLocalCart();
      return;
    }
    if (data.loggedIn) {
      setIsLoggedIn(true);
      await fetchCart();
      await fetchFavorites();
    } else {
      setIsLoggedIn(false);
      fetchLocalCart();
    }

    } catch (error) {
      console.error("Login check failed:", error);
      setIsLoggedIn(false);
      fetchLocalCart();
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get<GetCartExpandedResponse>(
        "http://localhost:9000/api/cart/get",
        { withCredentials: true }
      );
      const data = response.data;
      if (data.status) {
        setCartItems(data.items || []);
        setTotal(data.totalPrice || 0);
      } else {
        console.error("Error fetching cart:", data.message);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchLocalCart = () => {
    const localCartStr = localStorage.getItem("cart");
    const localCart: ExpandedCartItem[] = localCartStr
      ? JSON.parse(localCartStr)
      : [];
    setCartItems(localCart);
    setTotal(
      localCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/wishlist/", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status && data.wishlist) {
        setFavorites(data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  const toggleFavorite = async (productId: number) => {
    if (!isLoggedIn) return; // Favorilere eklemek için login gerekli

    if (favorites.includes(productId)) {
      try {
        await fetch("http://localhost:9000/api/wishlist/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
          credentials: "include",
        });
        setFavorites(favorites.filter((id) => id !== productId));
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    } else {
      try {
        await fetch("http://localhost:9000/api/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
          credentials: "include",
        });
        setFavorites([...favorites, productId]);
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }
    }
  };

  const increaseQty = async (
    productId: number,
    size: string,
    currentQty: number
  ) => {
    if (isLoggedIn) {
      try {
        const payload: UpdateCartItemRequest = {
          productId,
          size,
          quantity: currentQty + 1,
        };
        await axios.put("http://localhost:9000/api/cart/update", payload, {
          withCredentials: true,
        });
        fetchCart();
      } catch (error) {
        console.error("Error increasing quantity:", error);
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const index = cart.findIndex(
        (item: any) => item.productId === productId && item.size === size
      );
      if (index !== -1) {
        cart[index].quantity += 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        fetchLocalCart();
      }
    }
  };

  const decreaseQty = async (
    productId: number,
    size: string,
    currentQty: number
  ) => {
    if (currentQty <= 1) return;
    if (isLoggedIn) {
      try {
        const payload: UpdateCartItemRequest = {
          productId,
          size,
          quantity: currentQty - 1,
        };
        await axios.put("http://localhost:9000/api/cart/update", payload, {
          withCredentials: true,
        });
        fetchCart();
      } catch (error) {
        console.error("Error decreasing quantity:", error);
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const index = cart.findIndex(
        (item: any) => item.productId === productId && item.size === size
      );
      if (index !== -1) {
        cart[index].quantity -= 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        fetchLocalCart();
      }
    }
  };

  const removeItem = async (productId: number, size: string) => {
    if (isLoggedIn) {
      try {
        await axios.post(
          "http://localhost:9000/api/cart/remove",
          { productId, size },
          { withCredentials: true }
        );
        fetchCart();
      } catch (error) {
        console.error("Error removing item:", error);
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cart.filter(
        (item: any) => !(item.productId === productId && item.size === size)
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      fetchLocalCart();
    }
  };

  const getCurrencySymbol = (currency?: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "TRY":
        return "₺";
      default:
        return "₺";
    }
  };

  if (loading) return <div>Loading...</div>;

  const computedTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const commonCurrency = cartItems[0]?.currency || "₺";

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-1">
        <div className="flex flex-col md:flex-row justify-between gap-12 px-8 py-20">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-10">Cart</h2>
            {cartItems.length === 0 ? (
              <div>Your cart is empty.</div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-6 border-b pb-6 mb-8"
                >
                  <img
                    src={item.ImageUrl || "https://via.placeholder.com/150"}
                    alt={item.productName || `Product ${item.productId}`}
                    className="w-40 h-32 object-contain"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {item.productName || `Product ${item.productId}`}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.brand || ""}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Color: {item.color || ""}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Size: <span className="underline">{item.size}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border rounded px-2">
                        <button
                          className="px-2 text-lg"
                          onClick={() =>
                            decreaseQty(
                              item.productId,
                              item.size,
                              item.quantity
                            )
                          }
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          className="px-2 text-lg"
                          onClick={() =>
                            increaseQty(
                              item.productId,
                              item.size,
                              item.quantity
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      {isLoggedIn && (
                        <button onClick={() => toggleFavorite(item.productId)}>
                          {favorites.includes(item.productId) ? (
                            <FaHeart className="text-red-500 text-xl" />
                          ) : (
                            <FaRegHeart className="text-gray-500 text-xl" />
                          )}
                        </button>
                      )}
                      <button
                        className="px-2 text-sm text-red-500"
                        onClick={() => removeItem(item.productId, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right ml-auto">
                    <p className="text-xl font-bold text-black">
                      {getCurrencySymbol(item.currency)}
                      {item.price.toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="w-full md:w-1/3">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal</span>
              <span>
                {getCurrencySymbol(commonCurrency)}
                {computedTotal.toLocaleString("tr-TR")}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>Estimated Shipping & Handling</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg my-4">
              <span>Total</span>
              <span>
                {getCurrencySymbol(commonCurrency)}
                {computedTotal.toLocaleString("tr-TR")}
              </span>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setCheckoutError("Please log in to proceed with payment.");
                } else {
                  setCheckoutError(""); // Clean the error
                  router.push("/checkout");
                }
              }}
              className="w-full bg-black text-white py-4 rounded-full text-sm font-semibold mt-2"
            >
              Checkout
            </button>
            {checkoutError && (
              <p className="text-red-500 text-sm mt-2">{checkoutError}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
