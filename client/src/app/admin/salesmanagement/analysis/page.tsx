"use client";

const API_BASE = process.env.BACKEND_API_BASE || "http://localhost:9000";

import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { Calendar, LineChart, BarChart3, PieChart } from "lucide-react";
import {
  LineChart as RechartLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart as RechartPieChart,
  Pie
} from "recharts";

// Define the interfaces based on the API responses
interface OrderHistoryResponse {
  status: boolean;
  message: string;
  orders: {
    orderId: string;
    orderStatus: string;
    createdAt: string;
    deliveredAt: string;
    totalPrice: number;
    totalQuantity: number;
    items: {
      productId: string;
      quantity: number;
      size: string;
    }[];
  }[];
}

interface Product {
  productId: number;
  productName?: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  price?: number;
  currency?: string;
  warrantyStatus?: string;
  distributor?: string;
  description?: string;
  color?: string;
  category?: string;
  imageUrl?: string;
  tags?: string[];
  sizes?: any[]; // ProductSize[] simplified for now
  prices?: any[]; // ProductPricing[] simplified for now
  reviews?: any[]; // Review[] simplified for now
  rating?: number;
  popularity?: number;
  sales?: number;
}

// Brand logo mapping
const BRAND_LOGOS = {
  "Veja": "https://res.cloudinary.com/dfubca7s3/image/upload/v1747339677/Veja_kckwoz.webp",
  "Converse": "https://res.cloudinary.com/dfubca7s3/image/upload/v1747338585/Converse_logo_mcnixd.png",
  "New Balance": "https://res.cloudinary.com/dfubca7s3/image/upload/v1747339724/New_Balance_Logo_swqmnu.png",
  "Adidas": "https://res.cloudinary.com/dfubca7s3/image/upload/v1747339866/Adidas_Logo_h7agjx.png",
  "UGG": "https://res.cloudinary.com/dfubca7s3/image/upload/v1747339794/UGG_logo_d1xqzw.png",
  "Nike": "https://res.cloudinary.com/dfubca7s3/image/upload/v1747338554/Nike-Logo_xf09g2.png"
};

// Data transformation functions
const calculateRefundCount = (orders: OrderHistoryResponse['orders']) => {
  return orders.filter(order => order.orderStatus === 'REJECTED').length;
};

const calculateTotalRevenue = (orders: OrderHistoryResponse['orders']) => {
  return orders.reduce((sum, order) => sum + order.totalPrice, 0);
};

const calculateTotalQuantity = (orders: OrderHistoryResponse['orders']) => {
  return orders.reduce((sum, order) => sum + order.totalQuantity, 0);
};

const calculateRefundRate = (orders: OrderHistoryResponse['orders']) => {
  const refundCount = calculateRefundCount(orders);
  return orders.length > 0 ? (refundCount / orders.length) * 100 : 0;
};

// For the revenue vs profit chart
const prepareRevenueVsProfitData = (orders: OrderHistoryResponse['orders']) => {
  // Group orders by month
  const monthlyData = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });
    
    if (!acc[month]) {
      acc[month] = {
        revenue: 0,
        count: 0
      };
    }
    
    acc[month].revenue += order.totalPrice;
    acc[month].count += 1;
    
    return acc;
  }, {} as Record<string, { revenue: number, count: number }>);
  
  // Convert to array and calculate estimated profit (30% of revenue for this example)
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    profit: data.revenue * 0.3 // Assuming 30% profit margin
  }));
};

// For the top selling products chart - fixed to handle missing product details
const prepareTopSellingProducts = (
  orders: OrderHistoryResponse["orders"],
  products: Record<string, Product>
) => {
  // Count quantities by product ID
  const productQuantities: Record<string, number> = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.productId;
      productQuantities[id] = (productQuantities[id] || 0) + item.quantity;
    });
  });

  // Convert to array, sort and get top 5
  return Object.entries(productQuantities)
  .map(([id, quantity]) => ({
    productId: id,
    name:  products[id]?.productName , // isim artık büyük ihtimalle var
    image: products[id]?.imageUrl,
    quantity,
  }))
  .sort((a, b) => b.quantity - a.quantity)
  .slice(0, 5);
};

// Function for Profit by Brand chart
const prepareProfitByBrand = (
  orders: OrderHistoryResponse['orders'],
  products: Record<string, Product>
) => {
  // Calculate profit by brand
  const brandProfit: Record<string, number> = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.productId;
      const product = products[productId];
      
      if (product) {
        // Use fallback if brand info isn't available
        const brand = product.brand || "Other";
        const price = product.price || 0;
        const profit = price * item.quantity * 0.3; // Assuming 30% profit margin
        
        if (!brandProfit[brand]) {
          brandProfit[brand] = 0;
        }
        
        brandProfit[brand] += profit;
      }
    });
  });
  
  // Convert to array format for chart
  return Object.entries(brandProfit)
    .map(([brand, profit]) => ({
      brand,
      profit,
      logo: BRAND_LOGOS[brand as keyof typeof BRAND_LOGOS] || null
    }))
    .sort((a, b) => b.profit - a.profit);
};

export default function AnalysisTab() {
  const todayISO = new Date().toISOString().split("T")[0];
  const monthAgoISO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [startDate, setStartDate] = useState(monthAgoISO);
  const [endDate, setEndDate] = useState(todayISO);
    
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderHistoryResponse | null>(null);
  const [productsData, setProductsData] = useState<Record<string, Product>>({});
  
  // Computed values
  const totalRevenue = orderData ? calculateTotalRevenue(orderData.orders) : 0;
  const totalSalesCount = orderData ? orderData.orders.length : 0;
  const totalRefundCount = orderData ? calculateRefundCount(orderData.orders) : 0;
  const refundRate = orderData ? calculateRefundRate(orderData.orders).toFixed(2) : "0";
  const totalProfit = totalRevenue * 0.3; // Assuming 30% profit margin
  
  // Chart data
  const revenueVsProfitData = orderData ? prepareRevenueVsProfitData(orderData.orders) : [];
  const topSellingProducts = orderData ? prepareTopSellingProducts(orderData.orders, productsData) : [];
  const profitByBrandData = orderData ? prepareProfitByBrand(orderData.orders, productsData) : [];

  const handlePreset = (range: string) => {
    const now = dayjs();
    let start;
  
    switch (range) {
      case "1w": start = now.subtract(1, "week"); break;
      case "1m": start = now.subtract(1, "month"); break;
      case "3m": start = now.subtract(3, "month"); break;
      case "6m": start = now.subtract(6, "month"); break;
      case "1y": start = now.subtract(1, "year"); break;
      default: return;
    }
  
    setStartDate(start.format("YYYY-MM-DD"));
    setEndDate(now.format("YYYY-MM-DD"));
  };
  
  // Fetch order data by date range
  const fetchOrdersByDate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/order/all-histories`);
      const all: OrderHistoryResponse = await res.json();
  
      // Filter by date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const filteredOrders = all.orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
  
      setOrderData({ ...all, orders: filteredOrders });
  
      // Collect product IDs to fetch details
      const productIds = new Set<string>();
                filteredOrders.forEach(o =>
                o.items.forEach(i => productIds.add(i.productId))
                );

      
      await fetchProductDetails(Array.from(productIds));  
    } catch (err) {
      console.error("orders fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fixed function to correctly fetch product details
  const fetchProductDetails = async (productIds: string[]) => {
    // Skip products we already have
    const idsToFetch = productIds.filter((id) => !productsData[id]);
  
    if (idsToFetch.length === 0) return; // All products already fetched
  
    try {
      // Create a mock function that returns dummy data if API fails
      const fetchProduct = async (id: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/products/${id}`);
          const data = await response.json();
          
          // Check if we got valid product data
          if (data) {
            return {
              productId: id,
              productName: data.productName || `Product ${id}`,
              brand: data.brand || "Unknown Brand",
              price: data.price || 0,
              imageUrl: data.imageUrl || "",
              //If needed, more fields can be added here for analysis
            };
          }
          
          // Return fallback data if API response is invalid
          return {
            productId: id,
            productName: `Product ${id}`,
            brand: "Unknown Brand",
            price: 0,
            imageUrl: ""
          };
        } catch (err) {
          console.error(`Error fetching product ${id}:`, err);
          // Return fallback data on error
          return {
            productId: id,
            productName: `Product ${id}`,
            brand: "Unknown Brand",
            price: 0,
            imageUrl: ""
          };
        }
      };
      
      // Fetch details for each product (with error handling)
      const productDetails = await Promise.all(
        idsToFetch.map(id => fetchProduct(id))
      );
      
      // Convert to map format and update state
      const newProductsMap = productDetails.reduce((acc, product) => {
        acc[Number(product.productId)] = { ...product, productId: Number(product.productId) };
        return acc;
      }, {} as Record<string, Product>);
      
      // Update state with new products while preserving existing ones
      setProductsData(prev => ({ ...prev, ...newProductsMap }));
    } catch (err) {
      console.error("Error fetching product details:", err);
    }
  };
  
  // Initialize data on component mount
  useEffect(() => {
    fetchOrdersByDate();
  }, []);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const COLORS_refund = ['#FF8042', '#00C49F'];
  const renderSmallLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius,
    percent, name, index
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text
        x={x}
        y={y}
        fontSize={11}
        fill={COLORS_refund[index % COLORS_refund.length]}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  
  // Custom pie chart label renderer with logo
  const renderBrandPieLabel = (entry: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 80;
    const x = entry.cx + (radius + 30) * Math.cos(-entry.midAngle * RADIAN);
    const y = entry.cy + (radius + 15) * Math.sin(-entry.midAngle * RADIAN);
    const percent = Math.round((entry.percent || 0) * 100);
    
    return (
      <g>
        <text x={x} y={y} fill="#333" textAnchor={x > entry.cx ? 'start' : 'end'} dominantBaseline="central">
          {`${entry.brand} (${percent}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full p-6 bg-white">

      {/* Date Filter Section */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center">
          <Calendar size={20} className="text-gray-500 mr-2" />
          <span className="mr-2 font-medium">Date Range:</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <select
            onChange={(e) => handlePreset(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 mr-4"
          >
            <option value="">Select Preset</option>
            <option value="1w">Last 1 Week</option>
            <option value="1m">Last 1 Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
          </select>
          <div className="flex items-center">
            <label className="mr-2">Start:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2">End:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button 
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            onClick={fetchOrdersByDate}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Analyze"}
          </button>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-gray-500 font-medium mb-1">Total Revenue</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-gray-500 font-medium mb-1">Total Profit</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalProfit)}</div>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-gray-500 font-medium mb-1">Total Sales Count</div>
          <div className="text-2xl font-semibold">{totalSalesCount.toLocaleString()}</div>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-gray-500 font-medium mb-1">Total Canceled/Refunded Count</div>
          <div className="text-2xl font-semibold">
            {totalRefundCount.toLocaleString()} <span className="text-red-500 text-lg">({refundRate}%)</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Profit Line Chart */}
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Revenue vs Profit</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartLineChart
                data={revenueVsProfitData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
              </RechartLineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Profit by Brand Chart */}
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Profit by Brand</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={profitByBrandData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="profit"
                  nameKey="brand"
                  label={renderBrandPieLabel}
                >
                  {profitByBrandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {profitByBrandData.map((entry, index) => (
              entry.logo && (
                <div key={index} className="flex items-center">
                  <img 
                    src={entry.logo} 
                    alt={entry.brand} 
                    className="h-6 w-auto object-contain mr-1"
                  />
                </div>
              )
            ))}
          </div>
        </div>
        
        {/* Top Selling Products Bar Chart */}
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Top 5 Selling Products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topSellingProducts}
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }} 
                    />
                <Tooltip />
                <Bar dataKey="quantity" fill="#8884d8">
                  {topSellingProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Refund Rate Donut Chart */}
        <div className="p-4 border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Canceled/Refunded Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={[
                    { name: "Canceled/Refunded", value: parseFloat(refundRate) },
                    { name: "Completed", value: 100 - parseFloat(refundRate) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderSmallLabel}
                  labelLine={false}
                  
                >
                  <Cell fill="#FF8042" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Sales Performance Section - Replacement for ML section */}
      <div className="mt-8 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 size={24} className="mr-2 text-gray-700" /> 
          Monthly Performance Breakdown
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-lg font-medium mb-4">Monthly Sales Volume</h3>
            
            {orderData && orderData.orders.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareRevenueVsProfitData(orderData.orders)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No data available for selected date range</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-blue-800 text-sm mb-1">Highest Sales Month</div>
                <div className="text-xl font-semibold">
                  {revenueVsProfitData.length > 0 
                    ? revenueVsProfitData.reduce((max, item) => item.revenue > max.revenue ? item : max).month
                    : "N/A"}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-green-800 text-sm mb-1">Average Monthly Revenue</div>
                <div className="text-xl font-semibold">
                  {revenueVsProfitData.length > 0
                    ? formatCurrency(revenueVsProfitData.reduce((sum, item) => sum + item.revenue, 0) / revenueVsProfitData.length)
                    : "N/A"}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-purple-800 text-sm mb-1">Total Items Sold</div>
                <div className="text-xl font-semibold">
                  {orderData ? calculateTotalQuantity(orderData.orders).toLocaleString() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}