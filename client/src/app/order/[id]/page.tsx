"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdPending } from "react-icons/md";

interface StepProps {
  completed?: boolean;
  title: string;
  date: string;
  status: string;
}

function Step({ completed = false, title, date, status }: StepProps) {
  const dotBg = completed
    ? status === "REJECTED"
      ? "bg-red-600"
      : "bg-[#4B0082]"
    : "bg-gray-300";
  const textColor = completed
    ? status === "REJECTED"
      ? "text-red-600"
      : "text-[#4B0082]"
    : "text-gray-500";

  return (
    <div className="relative w-1/4 h-20 flex flex-col items-center justify-center">
      <div className={`text-center text-sm font-medium ${textColor}`}>{title}</div>
      <div className={`${dotBg} w-4 h-4 rounded-full my-1`} />
      <div className="text-xs text-gray-400">{date}</div>
    </div>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const stepMap: Record<string, number> = {
    PENDING: 0,
    SHIPPED: 1,
    ONWAY: 2,
    DELIVERED: 3,
    REJECTED: 3,
  };
  const current = stepMap[status] ?? 0;

  return (
    <div className="relative w-full">
      <div className="absolute top-1/2 h-0.5 bg-gray-300" style={{ transform: "translateY(-50%)", left: "12.5%", right: "12.5%" }} />
      <div
        className={`absolute top-1/2 h-0.5 ${status === "REJECTED" ? "bg-red-600" : "bg-[#4B0082]"}`}
        style={{ transform: "translateY(-50%)", left: "12.5%", width: `${current * 25}%` }}
      />
      <div className="flex w-full">
        {["Order Confirmed", "Shipped", "Out For Delivery", "Delivered"].map((title, i) => (
          <Step
            key={i}
            completed={i <= current}
            title={title}
            date={["Wed, 11th Jan", "Thu, 12th Jan", "Fri, 13th Jan", "Expected by, Mon 16th"][i]}
            status={status}
          />
        ))}
      </div>
    </div>
  );
}

export default function OrderDetails() {
  const params = useParams();
  const orderIdParam = params?.id as string;
  const router = useRouter();
  const [orderData, setOrderData] = useState<any | null>(null);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [cancelMessage, setCancelMessage] = useState("");
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundMessage, setRefundMessage] = useState<string>("");
  const [refundCode, setRefundCode] = useState(""); 
  const [showRefundCode, setShowRefundCode] = useState(false);
  const [refundReason, setRefundReason] = useState<string>("");

  const loadOrder = async () => {
    if (!orderIdParam) return;
    const r = await fetch(`http://localhost:9000/api/order/${orderIdParam}`, { credentials: "include" });
    const data = await r.json();
    if (data.status) setOrderData(data);
  };

  useEffect(() => {
    if (!orderIdParam) return;
    fetch(`http://localhost:9000/api/order/${orderIdParam}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.status) setOrderData(data);
      });
  }, [orderIdParam]);

  useEffect(() => {
    loadOrder();
  }, [orderIdParam]);

  useEffect(() => {
    if (!orderData) return;
    const ids = orderData.items.map((i: any) => i.productId).filter((id: string) => !products[id]);
    if (!ids.length) return;
    Promise.all(
      ids.map((id: string) =>
        fetch(`http://localhost:9000/api/products/${id}`, { credentials: "include" })
          .then((r) => r.json())
          .then((data) => ({ id, data }))
      )
    ).then((res) => {
      const map: Record<string, any> = {};
      res.forEach(({ id, data }) => {
        if (data.status) map[id] = data.product || data;
      });
      setProducts((p) => ({ ...p, ...map }));
    });
  }, [orderData]);


const handleCancel = async () => {
  if (!orderData) return;
  try {
    const res = await fetch("http://localhost:9000/api/order/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId: orderData.orderId,
        userId: orderData.userId,
        reason: "Cancel requested",
      }),
    });
    const d = await res.json();
    // only show message from backend
    setCancelMessage(d.message);
    await loadOrder();
  } catch (err) {
    console.error(err);
    setCancelMessage("An error occurred while cancelling the order.");
  }
};

// 2) Refund handler
const handleRefundChoice = async () => {
  setShowRefundConfirm(false);
  if (!orderData) return;

  try {
    const res = await fetch("http://localhost:9000/api/order/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId: orderData.orderId,
        reason : refundReason,
    
      }),
    });

    const data = await res.json();
    setRefundMessage(data.message);

    if (data.status) {
      const hash = btoa(orderData.orderId + Date.now())
        .slice(0, 12)
        .toUpperCase();
      setRefundCode(hash);
      setShowRefundCode(true);
    }

    await loadOrder();
  } catch (err) {
    console.error(err);
    setRefundMessage("An error occurred while requesting the refund.");
  }
};


  if (!orderData) return <div className="p-4">Loading...</div>;

  const { orderId, items, address, createdAt, orderStatus: status, total } = orderData;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-lg p-8 shadow mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Order ID: {orderId}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">Order date:</span>
                <span>
                  {new Date(createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-gray-300">|</span>
                <span
                  className={`font-medium ${
                    status === "REJECTED" ? "text-red-600" : "text-[#4B0082]"
                  }`}
                >
                  Status:
                </span>
                <span
                  className={status === "REJECTED" ? "text-red-600" : "text-[#4B0082]"}
                >
                  {status}
                </span>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button className="border border-gray-300 px-4 py-2 rounded-lg whitespace-nowrap hover:bg-gray-100 transition">
                Invoice
              </button>
              <div className="flex gap-4 flex-wrap">
          {/* Cancel vs. Refund */}
{!["SHIPPED","ONWAY","DELIVERING","DELIVERED"].includes(status) ? (
  <button
    onClick={handleCancel}
    className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
  >
    Cancel Order
  </button>
) : (
  <button
    onClick={() => setShowRefundConfirm(true)}
    className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
  >
    Refund Order
  </button>
)}

          
    
        </div>
              <button className="bg-[#4B0082] text-white px-4 py-2 rounded-lg whitespace-nowrap hover:bg-[#5A1AB4] transition">
                Track order
              </button>
            </div>
          </div>
          <div className="mt-8">
            <OrderTimeline status={status} />
            {cancelMessage && (
              <p className="mt-4 text-red-600 font-medium">{cancelMessage}</p>
            )}
          </div>
        </div>

        {/* ITEMS */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
      <h2 className="text-2xl font-semibold mb-4">Items</h2>
      <div className="space-y-4">
        {items.map((item: any, idx: number) => {
          const p = products[item.productId];
          return (
            <div
              key={idx}
              onClick={() => router.push(`/products/${item.productId}`)}
              className="flex items-center bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
            >
              {p ? (
                <img
                  src={p.imageUrl}
                  alt={p.productName}
                  className="w-24 h-24 object-contain rounded-lg mr-4"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4" />
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {p ? p.productName : `Product #${item.productId}`}{" "}
                  <span className="text-sm text-gray-500">
                    (Size: {item.size})
                  </span>
                </h3>
                <p className="text-gray-700">Quantity: {item.quantity}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
        

        {/* ADDRESS */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-2xl font-semibold mb-2">Delivery Address</h2>
          <p className="text-gray-700">{address}</p>
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Items:</span>
            <span className="font-medium">{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Price:</span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {/* Refund Confirmation Modal */}
      {showRefundConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-sm mx-4">
              <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
              <p className="mb-2 text-gray-600">Select a reason for refund:</p>
<select
  value={refundReason}
  onChange={(e) => setRefundReason(e.target.value)}
  className="w-full p-2 border border-gray-300 rounded mb-4"
>
  <option value="">-- Choose reason --</option>
  <option value="Wrong item delivered">Wrong item delivered</option>
  <option value="Product damaged">Product damaged</option>
  <option value="Size doesn’t fit">Size doesn’t fit</option>
  <option value="Changed my mind">Changed my mind</option>
</select>

              <div className="flex justify-end gap-4">
                <button onClick={() => setShowRefundConfirm(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition">No</button>
                <button onClick={() => handleRefundChoice()} className="px-4 py-2 bg-[#4B0082] text-white rounded hover:bg-[#5A1AB4] transition">Yes</button>
              </div>
            </div>
          </div>
        )}

        {showRefundCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
            <div className="relative z-10 bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Return Approved</h2>
              <p className="text-gray-600 mb-4">
                Please keep your return code. After the product is delivered, you can ship it back with this code.
              </p>
              <div className="text-[#4B0082] font-mono text-lg bg-gray-100 p-2 rounded-md mb-4 tracking-widest">
                {refundCode}
              </div>
              <button onClick={() => setShowRefundCode(false)} className="px-4 py-2 bg-[#4B0082] text-white rounded-md hover:bg-[#5A1AB4] transition">Got it</button>
            </div>
          </div>
        )}

        {refundMessage && <p className="mt-4 text-green-600 font-medium">{refundMessage}</p>}
      </div>
   
  );
}
