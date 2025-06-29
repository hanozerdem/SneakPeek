import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, ChevronDown, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Product {
  productId: number;
  productName?: string;
  price?: number;
  imageUrl?: string;
  brand?: string;
}

interface Refund {
  refundId: string;
  orderId: string;
  userId: string;
  reviewerId?: string;
  reason: string;
  refundStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  // Additional fields for product info
  product?: {
    name: string;
    price: number;
    imageUrl: string;
  }
  productIds?: number[];
  products?: Array<Product & { quantity: number }>;
}

export const RefundsTabComponent: React.FC = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filterValue, setFilterValue] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [productsData, setProductsData] = useState<Record<string, Product>>({});
  
  // This would be provided by your auth contex

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:9000/api/order/refunds", { credentials: "include" })
      .then(res => res.json())
      .then(async data => {
        if (data.status && Array.isArray(data.refunds)) {
          const refunds = data.refunds;
  
          // Tüm productId'leri topla
          const allProductIds = new Set<number>();
          refunds.forEach((r: any) => {
            (r.productIds || []).forEach((id: number) => allProductIds.add(id));
          });
  
          // Ürün detaylarını getir
          const productArray = await Promise.all(
            Array.from(allProductIds).map(async (id) => {
              try {
                const res = await fetch(`http://localhost:9000/api/products/${id}`, { credentials: "include" });
                const prod = await res.json();
                return {
                  productId: id,
                  productName: prod.productName || `Product ${id}`,
                  price: prod.price || 0,
                  imageUrl: prod.imageUrl || "",
                  brand: prod.brand || "Unknown"
                };
              } catch (err) {
                return {
                  productId: id,
                  productName: `Product ${id}`,
                  price: 0,
                  imageUrl: "",
                  brand: "Unknown"
                };
              }
            })
          );
  
          // Map formatına çevir
          const productMap = productArray.reduce((acc, p) => {
            acc[p.productId] = p;
            return acc;
          }, {} as Record<number, Product>);
  
          setProductsData(productMap);
  
          // Refundlara product bilgilerini iliştir
          const enhanced = refunds.map((r: any) => {
            // İlk ürünü product alanına ata (geriye uyumluluk için)
            const firstProduct = r.productIds?.[0] ? productMap[r.productIds[0]] : null;
            
            // Ürünleri ve adetlerini hesapla
            const productsWithQuantity = [];
            const productCounts: Record<number, number> = {};
            
            // Ürün sayılarını bul
            if (r.productIds && r.productIds.length) {
              r.productIds.forEach((id: number) => {
                productCounts[id] = (productCounts[id] || 0) + 1;
              });
              
              // Ürün bilgilerini ve adetlerini products dizisine ekle
              for (const productId in productCounts) {
                const product = productMap[productId];
                if (product) {
                  productsWithQuantity.push({
                    ...product,
                    quantity: productCounts[productId]
                  });
                }
              }
            }
            
            return {
              ...r,
              refundStatus: r.refundStatus || "PENDING",
              product: firstProduct ? {
                name: firstProduct.productName || "",
                price: firstProduct.price || 0,
                imageUrl: firstProduct.imageUrl || ""
              } : null,
              products: productsWithQuantity
            };
          });
  
          setRefunds(enhanced);
        } else {
          setError("Invalid data format received");
        }
      })
      .catch(err => {
        console.error("Refund fetch error:", err);
        setError("Failed to load refund requests");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  
  const handleRefundAction = async (refundId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`http://localhost:9000/api/order/refunds/${refundId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reviewerId: "680ce4a40f9e40016982037d" }),
      });
  
      if (!res.ok) throw new Error();
  
      setRefunds(prev => prev.map(r =>
        r.refundId === refundId
          ? { ...r, refundStatus: action === "approve" ? "APPROVED" : "REJECTED" }
          : r
      ));
    } catch (err) {
      console.error(`Failed to ${action} refund`, err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">


      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      )}

      {/* No State */}
      {error && !isLoading && (
       <div className="bg-gray-50 rounded-xl p-8 text-center">
       <Package size={40} className="mx-auto text-gray-400 mb-3" />
       <h3 className="text-lg font-medium text-gray-800">No refund requests found</h3>
       <p className="text-gray-500 mt-1">
         {filterValue !== "All" 
           ? `There are no ${filterValue.toLowerCase()} refund requests.` 
           : "When customers request refunds, they'll appear here."}
       </p>
     </div>
      )}

      {/* Refund Cards */}
      {!isLoading && !error && (
        <div className="grid gap-6">
          {refunds
            .filter(ref => filterValue === "All" || 
                           ref.refundStatus === filterValue.toUpperCase())
            .map(refund => (
              <div 
                key={refund.refundId} 
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="font-medium text-gray-800">Refund #{refund.refundId.slice(-6)}</p>
                  <div>{getStatusBadge(refund.refundStatus)}</div>
                </div>
                
                {/* Products */}
                <div className="mt-2 space-y-4">
                  {refund.products && refund.products.map((product) => (
                    <div 
                      key={product.productId} 
                      className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="bg-gray-100 rounded-md h-20 w-20 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl || "https://via.placeholder.com/150"}
                              alt={`Product ${product.productId}`}
                              width={120}
                              height={120}
                              unoptimized
                              className="object-contain p-1"
                            />
                          ) : (
                            <Package size={24} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{product.productName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-medium text-gray-700">${product.price?.toFixed(2)}</p>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                            Qty: {product.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons for PENDING refunds */}
                {refund.refundStatus === "PENDING" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleRefundAction(refund.refundId, "approve")}
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex-1 flex items-center justify-center"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRefundAction(refund.refundId, "reject")}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex-1 flex items-center justify-center"
                    >
                      <XCircle size={16} className="mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          
          {/* Empty State */}
          {refunds.filter(ref => filterValue === "All" || ref.refundStatus === filterValue.toUpperCase()).length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Package size={40} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-800">No refund requests found</h3>
              <p className="text-gray-500 mt-1">
                {filterValue !== "All" 
                  ? `There are no ${filterValue.toLowerCase()} refund requests.` 
                  : "When customers request refunds, they'll appear here."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RefundsTabComponent;