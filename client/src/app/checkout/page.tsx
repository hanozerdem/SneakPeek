"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  isFavorite?: boolean;
}

export interface GetCartExpandedResponse {
  status: boolean;
  message: string;
  items?: ExpandedCartItem[];
  totalPrice?: number;
}

export interface CreateOrderRequest {
  address: string;
  cardInformation: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    size: string;
  }[];
}

export interface RemoveItemFromCartRequest {
  productId: number;
  size: string;
}

function getCurrencySymbol(currency?: string): string {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'TRY':
    default: return '₺';
  }
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<ExpandedCartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const router = useRouter();

  const [address, setAddress] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  const fetchCart = async () => {
    try {
      const response = await axios.get<GetCartExpandedResponse>(
        "http://localhost:9000/api/cart/get",
        { withCredentials: true }
      );
      const data = response.data;
      if (data.status && data.items) {
        setCartItems(data.items);
        setCartTotal(data.totalPrice || 0);
      } else {
        console.error("Error fetching cart:", data.message);
      }
    } catch (error: any) {
      console.error("Error fetching cart:", error.message);
    }
    setLoadingCart(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    const plainCardNumber = cardNumber.replace(/[^\d]/g, "");
    const plainExpiryDate = expiryDate
    const cardInformation = `${plainCardNumber} ${cvv} ${plainExpiryDate}`;

    console.log(cardInformation)

    const orderPayload: CreateOrderRequest = {
      address,
      cardInformation,
      items: cartItems.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      })),
    };

    try {
      setPlacingOrder(true);
      const response = await axios.post(
        "http://localhost:9000/api/order/create",
        orderPayload,
        { withCredentials: true }
      );
      const data = response.data as { status: boolean; message?: string ;  invoice?: any;};
      if (data.status && data.invoice) {
        sessionStorage.setItem("invoice", JSON.stringify(data.invoice));
        
        await Promise.all(
          cartItems.map((item) => {
            const removeRequest: RemoveItemFromCartRequest = {
              productId: item.productId,
              size: item.size,
            };
            return axios.post(
              "http://localhost:9000/api/cart/remove",
              removeRequest,
              { withCredentials: true }
            );
          })
        );
        router.push("/checkout/success");
      } else {
        alert("Order failed: " + (data as { message: string }).message);
      }
    } catch (error: any) {
      console.error("Order creation error:", error.message);
      alert("Unexpected error occurred during order placement.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCart) return <div>Loading your cart...</div>;
  if (cartItems.length === 0) return <div>Your cart is empty.</div>;

  const computedTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-col md:flex-row justify-between gap-12 px-8 py-20">
      <div className="flex-1">
        <h2 className="text-4xl font-bold mb-10">Order Summary</h2>
        {cartItems.map((item) => (
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
                <p className="text-gray-600 text-sm">{item.brand || ""}</p>
                <p className="text-gray-600 text-sm">Color: {item.color || ""}</p>
                <p className="text-gray-600 text-sm">Size: <span className="underline">{item.size}</span></p>
                <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <p className="text-xl font-bold">
                  {getCurrencySymbol(item.currency)}{item.price.toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between font-semibold text-lg my-4">
          <span>Total</span>
          <span>{getCurrencySymbol(cartItems[0]?.currency)}{computedTotal.toLocaleString("tr-TR")}</span>
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <h2 className="text-2xl font-bold mb-4">Delivery and Payment Details</h2>
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
          <label className="flex flex-col">
            Delivery Address:
            <textarea
              required
              className="border p-2 mt-1 rounded"
              placeholder="Enter your address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            Card Number:
            <input
              type="text"
              required
              className="border p-2 mt-1 rounded"
              placeholder="Your card number"
              value={cardNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                let formatted = value.replace(/(.{4})/g, "$1-").slice(0, 19).replace(/-$/, "");
                setCardNumber(formatted);
              }}
            />
          </label>
          <label className="flex flex-col">
            Security Code (CVV):
            <input
              type="text"
              required
              className="border p-2 mt-1 rounded"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, "").slice(0, 3);
                setCvv(val);
              }}
            />
          </label>
          <label className="flex flex-col">
            Expiry Date:
            <input
              type="text"
              required
              className="border p-2 mt-1 rounded"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                if (val.length >= 3) {
                  let month = parseInt(val.slice(0, 2));
                  if (month < 1 || month > 12) return;
                  val = val.slice(0, 2) + "/" + val.slice(2);
                }
                setExpiryDate(val);
              }}
            />
          </label>
          <button
            type="submit"
            disabled={placingOrder}
            className="w-full bg-black text-white py-4 rounded-full text-sm font-semibold mt-2"
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
