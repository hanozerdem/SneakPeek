"use client";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  DollarSign,
  Edit,
  Plus,
  Menu,
  X,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Clock,
  Box,
  BarChart,
  Receipt

} from "lucide-react";
import {
  Product,
  ProductResponse,
  AddPriceToProductRequest,
  ProductPricing
} from "@/interfaces/products.interface";
import AnalysisTab from "./analysis/page";
import InvoicesTab from "@/components/invoicesTab";

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch("http://localhost:9000/api/products/");
  const data: ProductResponse = await res.json();
  if (!data.status) throw new Error(data.message);
  return data.products;
};

const fetchStock = async (productId: number, size: string): Promise<number | null> => {
  try {
    const res = await fetch(`http://localhost:9000/api/products/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size }),
    });
    const data = await res.json();
    if (data.status) return data.stock;
    else return null;
  } catch (e) {
    console.error("Stock fetch error:", e);
    return null;
  }
};

function stdPrice(p: Product): number {
  if (!isNaN(Number(p.price)) && Number(p.price) > 0) {
    return Number(p.price);
  }
  if (Array.isArray(p.prices)) {
    const std = p.prices.find(
      pr =>
        pr?.priceType?.toLowerCase() === "standard" &&
        !isNaN(Number(pr.price)) &&
        Number(pr.price) > 0
    );
    if (std) return std.price;
  }
  return 0;
}

export default function SalesManagerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"pending" | "existing" | "analysis" | "invoices">("pending");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stock, setStock] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message || "Fetch error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const defaultSize = selectedProduct.sizes?.[0]?.size;
      if (defaultSize) {
        fetchStock(selectedProduct.productId, defaultSize).then(setStock);
      }
    }
  }, [selectedProduct]);

  const pending = products.filter((p) => stdPrice(p) === 0);
  const existing = products.filter((p) => stdPrice(p) > 0);
  const filteredList = (tab === "pending" ? pending : existing).filter(p =>
    p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSidebarOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-screen backdrop-blur-sm bg-white/60"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div></div>;
  if (error) return <div className="p-10 text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${collapsed ? "w-20" : "w-64"} bg-black text-white transition-all duration-300 flex flex-col z-20`}>
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold">Sales Management</h1>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-800">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
        <div className="mt-8 space-y-2 px-4">
  <button
    className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} w-full p-3 rounded-lg hover:bg-gray-800 ${tab === "pending" ? "bg-gray-800" : ""}`}
    onClick={() => setTab("pending")}
  >
    <Clock size={20} />
    {!collapsed && <span className="ml-3">Pending Products</span>}
  </button>
  <button
    className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} w-full p-3 rounded-lg hover:bg-gray-800 ${tab === "existing" ? "bg-gray-800" : ""}`}
    onClick={() => setTab("existing")}
  >
    <Box size={20} />
    {!collapsed && <span className="ml-3">Existing Products</span>}
  </button>
  <button
    className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} w-full p-3 rounded-lg hover:bg-gray-800 ${tab === "analysis" ? "bg-gray-800" : ""}`}
    onClick={() => setTab("analysis")}
  >
    <BarChart size={20} />
    {!collapsed && <span className="ml-3">Analysis</span>}
  </button>
  <button
  className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} w-full p-3 rounded-lg hover:bg-gray-800 ${tab === "invoices" ? "bg-gray-800" : ""}`}
  onClick={() => setTab("invoices")}
>
  <Receipt size={20} />
  {!collapsed && <span className="ml-3">Invoices</span>}
</button>
</div>



      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {tab !== "analysis" && (
        <div className="sticky top-0 bg-gray-50 p-6 pb-4 z-10 border-b border-gray-200">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">
  {tab === "pending"
    ? "Pending Products"
    : tab === "existing"
    ? "Existing Products"
    : tab === "invoices"
    ? "Invoices"
    : ""}
</h3>

            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center text-gray-500">
              <Search size={16} className="mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>)}

        <div className="p-6 pt-4">
  <div className="max-w-5xl mx-auto">
        {tab === "analysis" ? (
        <AnalysisTab />
      ) : tab === "invoices" ? (
        <InvoicesTab />
      ) : (

      
      <>
        {filteredList.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingBag size={30} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500">
              No {tab === "pending" ? "pending" : "existing"} products match your search.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((product) => (
            <div
              key={product.productId}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md cursor-pointer flex flex-col"
              onClick={() => handleProductSelect(product)}
            >
              <div className="relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden mb-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="object-contain w-full h-full p-1"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ShoppingBag size={40} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {product.productName}
                </h4>
                <p className="text-sm text-gray-500 mb-2 truncate">{product.brand}</p>

                {stdPrice(product) > 0 ? (
                  <div className="text-sm text-gray-700 font-medium">
                    {Math.ceil(stdPrice(product))} {product.currency ?? "USD"}
                  </div>
                ) : (
                  <div className="text-sm text-red-500 font-medium">No Price Specified</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
</div>

      


</div>

{/* Sidebar / Product Details */}
<Transition show={sidebarOpen} as={Fragment}>
<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
    {selectedProduct && (
      <>
        <div className="relative w-full h-56 bg-gray-50 rounded-lg overflow-hidden mb-4">
          {selectedProduct.imageUrl ? (
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.productName}
              className="object-contain w-full h-full p-1"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-1">{selectedProduct.productName}</h3>
        <p className="text-sm text-gray-500 mb-4">{selectedProduct.brand}</p>

        <div className="grid gap-2 mb-4">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Product ID:</span> {selectedProduct.productId}
          </div>
          {selectedProduct.category && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Category:</span> {selectedProduct.category}
            </div>
          )}
          {stock !== null && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Stock:</span> {stock}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Price Informations</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Standart:</span>
              <span className="font-semibold">
                {stdPrice(selectedProduct) > 0
                  ? `${Math.ceil(stdPrice(selectedProduct))} ${selectedProduct.currency ?? "USD"}`
                  : "None"}
              </span>
            </div>
            {selectedProduct.prices?.find(p => p.priceType === "discounted") && (
              <div className="flex justify-between text-sm text-green-600 mt-1">
                <span>Sale:</span>
                <span className="font-semibold">
                  {selectedProduct.prices.find(p => p.priceType === "discounted")?.price} {selectedProduct.currency ?? "USD"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {stdPrice(selectedProduct) === 0 ? (
            <PriceModal
              product={selectedProduct}
              mode="add"
              trigger={
                <button className="bg-black text-white w-full py-2 rounded-md hover:bg-gray-800">
                  Add Price
                </button>
              }
            />
          ) : (
            <>
              <PriceModal
                product={selectedProduct}
                mode="edit"
                trigger={
                  <button className="bg-black text-white w-full py-2 rounded-md hover:bg-gray-800">
                    Edit Price
                  </button>
                }
              />
              <DiscountModal
                product={selectedProduct}
                trigger={
                  <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    Add Discount Price
                  </button>
                }
              />
            </>
          )}
          {selectedProduct.currentPriceType !== "discounted" ? (
    <button
      onClick={async () => {
        await fetch(`http://localhost:9000/api/products/update/${selectedProduct.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPriceType: "discounted" }),
        });
        location.reload();
      }}
      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
    >
      Put on Sale
    </button>
  ) : (
    <button
      onClick={async () => {
        await fetch(`http://localhost:9000/api/products/update/${selectedProduct.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPriceType: "standard" }),
        });
        location.reload();
      }}
      className="w-full py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400"
    >
      Remove from Sale
    </button>
  )}
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 mt-1"
          >
            <X size={24} className="inline mr-1" />
            Close
          </button>
        </div>
      </>
    )}
  </div>
</div>
</Transition>
</div>
  );
}
// ---------------- PriceModal ----------------
function PriceModal({
  product,
  mode,
  trigger,
}: {
  product: Product;
  mode: "add" | "edit";
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<number>(mode === "edit" ? stdPrice(product) : 0);
  const [currency, setCurrency] = useState<string>(product.currency ?? "USD");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload: AddPriceToProductRequest = {
      productId: product.productId,
      priceType: "standard",
      price,
      currency,
    };
    const res = await fetch("http://localhost:9000/api/products/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) location.reload();
    else alert("Kaydetme başarısız");
  };

  return (
    <>
      <span onClick={(e) => { e.stopPropagation(); setOpen(true); }}>{trigger}</span>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
              <Dialog.Title className="text-xl font-semibold text-gray-800 mb-6">
                {mode === "add" ? "Add Standard Price" : "Edit Standard Price"}
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    min={0}
                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Currency</label>
                  <input
                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-900 disabled:opacity-50"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
// ---------------- DiscountModal ----------------
function DiscountModal({
  product,
  trigger,
}: {
  product: Product;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const existing: ProductPricing | undefined = product.prices?.find(
    (p) => p.priceType === "discounted"
  );

  const [price, setPrice] = useState<number>(existing?.price ?? 0);
  const [currency, setCurrency] = useState<string>(existing?.currency ?? "USD");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload: AddPriceToProductRequest = {
      productId: product.productId,
      priceType: "discounted",
      price,
      currency,
    };
    await fetch("http://localhost:9000/api/products/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    location.reload();
  };

  const handleRemove = async () => {
    setSaving(true);
    await fetch(`http://localhost:9000/api/products/update/${product.productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prices: [] }),
    });
    location.reload();
  };

  return (
    <>
      <span onClick={(e) => { e.stopPropagation(); setOpen(true); }}>{trigger}</span>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
              <Dialog.Title className="text-xl font-semibold text-gray-800 mb-6">
                {existing ? "Edit Discounted Price" : "Add Discounted Price"}
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Discounted Price</label>
                  <input
                    type="number"
                    min={0}
                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {["TRY", "USD", "EUR"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                {existing && (
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={saving}
                    onClick={handleRemove}
                  >
                    {saving ? "Kaldırılıyor…" : "İndirimi Kaldır"}
                  </button>
                )}
                <div className={existing ? "flex gap-3 ml-auto" : "flex gap-3"}>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    İptal
                  </button>
                  <button
                    className="px-6 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-900 disabled:opacity-50"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

