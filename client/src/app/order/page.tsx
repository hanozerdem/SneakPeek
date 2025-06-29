"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  productId: number;
  imageUrl: string;
  quantity: number;
}

interface Order {
  orderId: string;
  status: string;
  total: number;
  currency: string;
  items: OrderItem[];
  totalQuantity: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>("₺");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const historyRes = await fetch("http://localhost:9000/api/order/history/", { credentials: "include" });
        if (!historyRes.ok) {
          throw new Error(`Order history request failed with status ${historyRes.status}`);
        }
        const historyData = await historyRes.json();
        if (!historyData.status || !historyData.orders) {
          console.error("Failed to fetch order history.");
          setLoading(false);
          return;
        }

        const fullOrders = await Promise.all(
          historyData.orders.map(async (historyOrder: any) => {
            try {
              const fullOrderRes = await fetch(`http://localhost:9000/api/order/${historyOrder.orderId}`, { credentials: "include" });
              if (!fullOrderRes.ok) {
                console.warn(`Order ${historyOrder.orderId} fetch failed`);
                return null;
              }
              const fullOrderData = await fullOrderRes.json();
              if (!fullOrderData.status) return null;

              const items = await Promise.all(
                fullOrderData.items.map(async (item: any) => {
                  try {
                    const productRes = await fetch(`http://localhost:9000/api/products/${item.productId}`, { cache: "no-store" });
                    if (!productRes.ok) return null;
                    const productData = await productRes.json();
                    if (!productData.status) return null;

                    // Burada product prices içinde standard olanı buluyoruz:
                    const standardPrice = productData.prices?.find((p: any) => p.priceType === "standard");
                    const productCurrency = standardPrice?.currency || "₺"; // yoksa default ₺

                    return {
                      productId: Number(item.productId),
                      imageUrl: productData.imageUrl || "https://via.placeholder.com/150",
                      quantity: item.quantity || 1,
                      currency: productCurrency,
                    };
                  } catch {
                    return null;
                  }
                })
              );

              const validItems = items.filter(Boolean) as (OrderItem & { currency: string })[];
              const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0);

              // Burada ilk ürünün currency'siyle setCurrency yapıyoruz:
              if (validItems.length > 0 && validItems[0].currency && validItems[0].currency !== currency) {
                setCurrency(validItems[0].currency);
              }

              return {
                orderId: fullOrderData.orderId,
                status: fullOrderData.orderStatus,
                total: fullOrderData.total,
                currency: validItems[0]?.currency || "₺", // order'ın currency'si de producttan gelsin
                items: validItems,
                totalQuantity,
              };
            } catch {
              return null;
            }
          })
        );

        setOrders(fullOrders.filter(Boolean));
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="pt-24 px-4 md:px-8">Loading...</div>;

  return (
    <div className="pt-24 px-4 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">My Orders</h1>

      {/* Para birimi bilgisi */}
      <p className="text-gray-500 mb-8">Currency used: {currency}</p>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="space-y-12">
          {orders.map((order) => (
            <div key={order.orderId}>
              {/* Üst satır: Sipariş bilgileri ve buton */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">No. {order.orderId}</p>
                  <p
                    className={`text-sm font-medium mb-2 ${
                      order.status === "Delivered"
                        ? "text-green-600"
                        : order.status === "Pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {order.status}
                  </p>
                  <p className="text-lg font-semibold">
                    {order.total.toLocaleString()} {order.currency}
                  </p>
                  {/* Ürün adedi */}
                  <p className="text-sm text-gray-500 mt-1">Total items: {order.totalQuantity}</p>
                </div>
                <Link
                  href={`/order/${order.orderId}`}
                  className="px-6 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  Show details
                </Link>
              </div>

              {/* Alt satır: Thumbnail ürünler */}
              <div className="mt-6 flex flex-wrap gap-6">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="relative w-28 h-28 bg-gray-50 rounded-lg shadow overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={`Product ${item.productId}`}
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>

              <hr className="mt-8 border-t border-gray-200" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
