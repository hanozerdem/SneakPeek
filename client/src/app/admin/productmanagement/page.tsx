"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, Package, Truck, RotateCcw, Star, ChevronDown } from "lucide-react";

import ProductsTabComponent from "@/components/admin"; 
import {RefundsTabComponent} from "@/components/refundTab";



/* ---------- TYPES ---------- */
interface Review {
  reviewId: number;
  productId: number;
  userId: number;
  reviewText?: string | null;
  rating: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  imageUrl?: string; // Product image URL
}

interface OrderItem {
  productId: number;
  quantity: number;
  size: string;
  imageUrl: string;
}

interface Order {
  orderId: string;
  status: "pending" | "shipped" | "delivered" | "rejected" | "processing";
  date: string;
  items: OrderItem[];
  totalPrice: number;
}

/* ---------- COMPONENT ---------- */
export default function AdminPanel() {
  /* ---------- UI STATE ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reviews" | "orders" | "products" | "refunds">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("adminActiveTab") as any) || "products";
    }
    return "products";
  });
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminActiveTab", activeTab);
    }
  }, [activeTab]);
  

  const [filterValue, setFilterValue] = useState("All");

  /* ---------- DATA STATE ---------- */
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalContent, setModalContent] = useState<Review | Order | null>(null);
  const [products, setProducts] = useState<{productId: number, imageUrl: string}[]>([]);

  /* ===============================================================
      1)  PRODUCTS - Fetch product data first
  =================================================================*/
  useEffect(() => {
    (async () => {
      try {
        const prodRes = await fetch("http://localhost:9000/api/products/", { credentials: "include" });
        const prodJson = await prodRes.json();
        if (!prodJson?.status || !prodJson.products) return;
        
        setProducts(prodJson.products);
        
      } catch (e) {
        console.error("Products fetch error:", e);
      }
    })();
  }, []);

  /* ===============================================================
      2)  REVIEWS - Modified to correctly attach product images
  =================================================================*/
  useEffect(() => {
    if (products.length === 0) return;
    
    (async () => {
      try {
        // Fetch all reviews for all products
        const allReviews: Review[] = [];
        
        for (const product of products) {
          try {
            const response = await fetch(`http://localhost:9000/api/products/review/${product.productId}`, { 
              credentials: "include" 
            });
            const data = await response.json();
            
            if (data.status && data.reviews && Array.isArray(data.reviews)) {
              // Add the product image URL to each review
              const reviewsWithImages = data.reviews.map((review: Review) => ({
                ...review,
                imageUrl: product.imageUrl || "https://via.placeholder.com/150"
              }));
              
              allReviews.push(...reviewsWithImages);
            }
          } catch (error) {
            console.error(`Error fetching reviews for product ${product.productId}:`, error);
          }
        }
        
        // Filter for pending reviews only
        const pendingOnly = allReviews.filter(review => review.status === "PENDING");
        setPendingReviews(pendingOnly);
        
      } catch (e) {
        console.error("Review fetch error:", e);
      }
    })();
  }, [products]);

  /* ===============================================================
      3)  ORDERS
  =================================================================*/
  useEffect(() => {
    if (products.length === 0) return;
    
    (async () => {
      try {
        const ordersRes = await fetch("http://localhost:9000/api/order/all-histories", { credentials: "include" });
        const ordersJson = await ordersRes.json();
  
        if (!ordersJson?.status) return;
  
        const mappedOrders: Order[] = ordersJson.orders.map((order: any) => {
          const mappedItems = (order.items || []).map((item: any) => {
            // Find matching product for image URL
            const matchedProduct = products.find(p => p.productId === Number(item.productId));
            return {
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              size: item.size || "",
              imageUrl: matchedProduct?.imageUrl || "https://via.placeholder.com/150",
              
            };
          });
  
          return {
            orderId: order.orderId,
            status: order.orderStatus.toLowerCase() as Order["status"],
            date: order.createdAt.split("T")[0],
            items: mappedItems,
            totalPrice: order.totalPrice || 0,
          };
        });
  
        setOrders(mappedOrders);
      } catch (err) {
        console.error("Error fetching all orders:", err);
      }
    })();
  }, [products]);
  
  /* ===============================================================
      4)  ACTION HELPERS
  =================================================================*/
  const reviewAction = async (reviewId: number, act: "approve" | "reject") => {
    try {
      await fetch(`http://localhost:9000/api/products/review/${act}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reviewId }),
      });
      setPendingReviews(prev => prev.filter(r => r.reviewId !== reviewId));
    } catch (e) {
      console.error(`${act} review error:`, e);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await fetch("http://localhost:9000/api/order/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, newStatus: newStatus.toUpperCase() }),
      });
      setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status: newStatus } : o)));
    } catch (e) {
      console.error("Order status update error:", e);
    }
  };

  /* ---------- SMALL RENDER HELPERS ---------- */
  const openModal = (c: Review | Order) => setModalContent(c);
  const closeModal = () => setModalContent(null);

  const stars = (n: number) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < n ? "text-yellow-500" : "text-gray-300"}`}>★</span>
    ));

  const badge = (s: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      processing: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors[s] || "bg-gray-100 text-gray-800"}`}>
        {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
      </span>
    );
  };

  // Helper function to filter orders based on selected filter
  const filterOrders = (order: Order) => {
    if (filterValue === "All") {
      return true; // Show all orders when "All" is selected
    }
    return order.status.toLowerCase() === filterValue.toLowerCase();
  };

  // Helper function to filter reviews based on selected filter
  const filterReviews = (review: Review) => {
    if (filterValue === "All") {
      return true; // Show all reviews when "All" is selected
    }
    return review.status === filterValue.toUpperCase();
  };

  /* ---------- JSX ---------- */
  return (
    <div className="flex h-screen bg-white">
      {/* ---------- SIDEBAR ---------- */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-black text-white transition-all duration-300 flex flex-col z-20`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-800">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}

          </button>
        </div>
        <div className="mt-8 space-y-2 px-4">
        <button
            className={`flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} w-full p-3 rounded-lg hover:bg-gray-800 ${
              activeTab === "products" && "bg-gray-800"
            }`}
            onClick={() => {
              setActiveTab("products");
              setFilterValue("All");
            }}
          >
            <Package size={20} />
            {sidebarOpen && <span className="ml-3">Products</span>}
          </button>
          
          <button
            className={`flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} w-full p-3 rounded-lg hover:bg-gray-800 ${
              activeTab === "reviews" && "bg-gray-800"
            }`}
            onClick={() => {
              setActiveTab("reviews");
              setFilterValue("All"); // Reset filter when changing tabs
            }}
          >
            <Star size={20} />
            {sidebarOpen && <span className="ml-3">Reviews</span>}
          </button>
          <button
            className={`flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} w-full p-3 rounded-lg hover:bg-gray-800 ${
              activeTab === "orders" && "bg-gray-800"
            }`}
            onClick={() => {
              setActiveTab("orders");
              setFilterValue("All"); // Reset filter when changing tabs
            }}
          >
            <Truck size={20} />
            {sidebarOpen && <span className="ml-3">Orders</span>}
          </button>
          <button
          className={`flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} w-full p-3 rounded-lg hover:bg-gray-800 ${
            activeTab === "refunds" && "bg-gray-800"
          }`}
          onClick={() => {
            setActiveTab("refunds");
            setFilterValue("All");
          }}
        >
          <RotateCcw size={20} />
          {sidebarOpen && <span className="ml-3">Refunds</span>}
        </button>

        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-gray-50 p-6 pb-4 z-10 border-b border-gray-200">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">
  {activeTab === "reviews"
    ? "Pending Reviews"
    : activeTab === "orders"
    ? "Order Tracking"
    : activeTab === "refunds"
    ? "Refund Requests"
    : "Product Management"}
</h3>


            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center text-gray-500">
              <span className="mr-1">Filter:</span>
              <select
  className="bg-transparent border-none focus:ring-0 text-gray-700 appearance-none"
  value={filterValue}
  onChange={e => setFilterValue(e.target.value)}
>
  {activeTab === "reviews" ? (
    ["All", "Pending", "Approved", "Rejected"].map((status) => (
      <option key={status} value={status}>{status}</option>
    ))
  ) : activeTab === "orders" ? (
    ["All", "Pending", "Processing", "Shipped", "Delivered", "Rejected"].map((status) => (
      <option key={status} value={status}>{status}</option>
    ))
  ) : activeTab === "refunds" ? (
    ["All", "PENDING", "APPROVED", "REJECTED"].map((status) => (
      <option key={status} value={status}>{status}</option>
    ))
  ) : (
    ["All", "Active", "Inactive"].map((status) => (
      <option key={status} value={status}>{status}</option>
    ))
  )}
</select>


              <ChevronDown size={16} className="ml-1" />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 pt-4">
          <div className="max-w-5xl mx-auto">
            {/* ===================== PRODUCTS ===================== */}
            {activeTab === "products" && (
  <ProductsTabComponent filterValue={filterValue} />
)}


            {/* ===================== REVIEWS ===================== */}
            {activeTab === "reviews" && (
              <div className="grid gap-4">
                {/* Debug element to show filter results */}
                {pendingReviews.filter(filterReviews).length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Star size={30} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews found</h3>
                    <p className="text-gray-500">
                      {filterValue === "All" ? "No reviews are available." : `No "${filterValue}" reviews are available.`}
                    </p>
                  </div>
                )}

                {pendingReviews
                  .filter(filterReviews)
                  .map(rev => (
                    <div
                      key={rev.reviewId}
                      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md cursor-pointer"
                      onClick={() => openModal(rev)}
                    >
                      <div className="flex justify-between">
                        <div className="flex gap-4 flex-1">
                          {/* Product image display */}
                          <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={rev.imageUrl || "https://via.placeholder.com/150"}
                              alt={`Product ${rev.productId}`}
                              fill
                              unoptimized
                              className="object-contain p-1"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium">
                                U{String(rev.userId).slice(-2)}
                              </div>
                              <div className="ml-2">
                                <p className="font-medium text-gray-800">User #{rev.userId}</p>
                                <p className="text-sm text-gray-500">Product #{rev.productId}</p>
                              </div>
                            </div>
                            <div className="flex items-center mb-2">
                              {stars(rev.rating)}
                              <span className="ml-2 text-gray-500 text-sm">{rev.rating}/5</span>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-2">{rev.reviewText || "No comment"}</p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-start">
                          {badge(rev.status)}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            reviewAction(rev.reviewId, "approve");
                          }}
                          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            reviewAction(rev.reviewId, "reject");
                          }}
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex-1"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ===================== ORDERS ===================== */}
            {activeTab === "orders" && (
              <div className="grid gap-4">
                {/* Debug element to show filter results */}
                {orders.filter(filterOrders).length === 0 && orders.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Package size={30} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No orders found</h3>
                    <p className="text-gray-500">
                      {filterValue === "All" 
                        ? "No orders are available." 
                        : `No orders with status "${filterValue}" are available.`}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Total orders: {orders.length}</p>
                  </div>
                )}

                {/* Loading indicator for orders */}
                {orders.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Package size={30} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Loading orders...</h3>
                    <p className="text-gray-500">Please wait while we fetch your orders.</p>
                  </div>
                )}

                {orders
                  .filter(filterOrders)
                  .map(o => (
                    <div
                      key={o.orderId}
                      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md cursor-pointer"
                      onClick={() => openModal(o)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-800 mb-1">Order #{o.orderId.slice(-6)}</p>
                              <p className="text-sm text-gray-500 mb-2">{o.date}</p>
                            </div>
                            <div className="ml-4">{badge(o.status)}</div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">Total: ${o.totalPrice}</p>

                          {/* Thumbnail list */}
                          <div className="flex gap-3 mt-4 flex-wrap">
                            {o.items.map((it, idx) => (
                              <div
                                key={`${it.productId}-${idx}`}
                                className="relative w-14 h-14 bg-gray-50 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={it.imageUrl}
                                  alt={`Product ${it.productId}`}
                                  fill
                                  unoptimized
                                  className="object-contain p-1"
                                />
                                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1">
                                  x{it.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {o.status === "pending" && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              updateOrderStatus(o.orderId, "processing");
                            }}
                            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex-1"
                          >
                            Process Order
                          </button>
                        )}
                        {o.status === "processing" && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              updateOrderStatus(o.orderId, "shipped");
                            }}
                            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex-1"
                          >
                            Mark as Shipped
                          </button>
                        )}
                        {o.status === "shipped" && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              updateOrderStatus(o.orderId, "delivered");
                            }}
                            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex-1"
                          >
                            Mark as Delivered
                          </button>
                        )}
                        {o.status === "delivered" && (
                          <button
                            disabled
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex-1 cursor-default"
                          >
                            Completed
                          </button>
                        )}
                        {(o.status === "rejected" || o.status === "delivered") && (
                          <button
                            disabled
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex-1 cursor-default"
                          >
                            {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {activeTab === "refunds" && (
              <RefundsTabComponent/>
            )}

          </div>
        </div>
      </div>

      {/* ---------- MODAL ---------- */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {"reviewId" in modalContent ? "Review Details" : "Order Details"}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* ------------- REVIEW MODAL ------------- */}
            {"reviewId" in modalContent ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  {/* Product image in modal */}
                  <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={modalContent.imageUrl || "https://via.placeholder.com/150"}
                      alt={`Product ${modalContent.productId}`}
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Product #{modalContent.productId}</p>
                    <div className="flex items-center mb-1">
                      {stars(modalContent.rating)}
                      <span className="ml-2 text-gray-500 text-sm">{modalContent.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">{modalContent.reviewText || "No comment provided."}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      reviewAction(modalContent.reviewId, "approve");
                      closeModal();
                    }}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      reviewAction(modalContent.reviewId, "reject");
                      closeModal();
                    }}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex-1"
                  >
                    Reject
                  </button>
                </div>
              </>
            ) : (
              /* ------------- ORDER MODAL ------------- */
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="mb-1">
                      <span className="font-medium">Order ID:</span> {modalContent.orderId}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Placed:</span> {modalContent.date}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Total:</span> ${modalContent.totalPrice}
                    </p>
                  </div>
                  <div>{badge(modalContent.status)}</div>
                </div>

                <div className="grid gap-3 mb-4">
                  {modalContent.items.map((it, idx) => (
                    <div key={`${it.productId}-${idx}`} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                      <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden">
                        <Image
                          src={it.imageUrl}
                          alt={`Product ${it.productId}`}
                          fill
                          unoptimized
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Product #{it.productId}</p>
                        <p className="text-sm text-gray-500">Size: {it.size}</p>
                        <p className="text-sm text-gray-700">Quantity: {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {modalContent.status === "pending" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(modalContent.orderId, "processing");
                      closeModal();
                    }}
                    className="bg-black text-white w-full py-2 rounded-md hover:bg-gray-800"
                  >
                    Process Order
                  </button>
                )}
                {modalContent.status === "processing" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(modalContent.orderId, "shipped");
                      closeModal();
                    }}
                    className="bg-black text-white w-full py-2 rounded-md hover:bg-gray-800"
                  >
                    Mark as Shipped
                  </button>
                )}
                {modalContent.status === "shipped" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(modalContent.orderId, "delivered");
                      closeModal();
                    }}
                    className="bg-black text-white w-full py-2 rounded-md hover:bg-gray-800"
                  >
                    Mark as Delivered
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}