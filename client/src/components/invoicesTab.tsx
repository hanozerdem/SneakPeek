"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Search, FileText, ChevronDown, ChevronUp, ArrowDownNarrowWide, ArrowUpNarrowWide, Loader2 } from "lucide-react";
import { InvoiceSummary, InvoiceItem } from "@/interfaces/notification.interface";

interface DateRange {
  start: string;
  end: string;
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    end: new Date().toISOString().split('T')[0]
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"date" | "total" | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [dateRange]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:9000/api/notification/invoices?start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await res.json();
      if (data && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      setError("Failed to fetch invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoicesPdf = async () => {
    setIsDownloading(true);
    try {
      window.open(
        `http://localhost:9000/api/notification/invoices/pdf?start=${dateRange.start}&end=${dateRange.end}`,
        '_blank'
      );
    } catch (err) {
      console.error("PDF download error:", err);
      setError("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  const handleSortChange = (field: "date" | "total") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc" 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortField === "total") {
      return sortDirection === "asc" 
        ? a.total - b.total
        : b.total - a.total;
    }
    return 0;
  });

  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center text-gray-500">
                <Calendar size={16} className="mr-2" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 w-32"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center text-gray-500">
                <Calendar size={16} className="mr-2" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 w-32"
                />
              </div>
            </div>
            
            <button
              onClick={downloadInvoicesPdf}
              disabled={isDownloading || loading || invoices.length === 0}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export PDF
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center text-gray-500 w-full md:w-64">
            <Search size={16} className="mr-2" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-end">
            <div className="bg-white rounded-lg shadow-sm px-4 py-2 flex items-center text-gray-700">
              <FileText size={16} className="mr-2 text-blue-500" />
              <div>
                <span className="text-sm text-gray-500">Total Invoices</span>
                <div className="font-medium">{filteredInvoices.length}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm px-4 py-2 flex items-center text-gray-700">
              <Download size={16} className="mr-2 text-green-500" />
              <div>
                <span className="text-sm text-gray-500">Total Revenue</span>
                <div className="font-medium">${totalRevenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-500">Loading invoices...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FileText size={30} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No invoices found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? "No invoices match your search." 
              : "No invoices found in the selected date range."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === "date" && (
                        sortDirection === "asc" ? 
                          <ArrowUpNarrowWide size={14} /> : 
                          <ArrowDownNarrowWide size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("total")}
                  >
                    <div className="flex items-center gap-1">
                      Total
                      {sortField === "total" && (
                        sortDirection === "asc" ? 
                          <ArrowUpNarrowWide size={14} /> : 
                          <ArrowDownNarrowWide size={14} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInvoices.map((invoice) => (
                  <React.Fragment key={invoice.invoiceId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{invoice.invoiceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(invoice.invoiceId)}
                          className="text-gray-600 hover:text-gray-900 flex items-center justify-end"
                        >
                          {expandedInvoice === invoice.invoiceId ? (
                            <>
                              Hide Details
                              <ChevronUp size={16} className="ml-1" />
                            </>
                          ) : (
                            <>
                              View Details
                              <ChevronDown size={16} className="ml-1" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedInvoice === invoice.invoiceId && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm text-gray-700">
                            <h4 className="font-medium mb-2">Invoice Items</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Product
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Quantity
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Price
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        {item.productName}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        {item.quantity}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        ${item.price.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        ${(item.quantity * item.price).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}