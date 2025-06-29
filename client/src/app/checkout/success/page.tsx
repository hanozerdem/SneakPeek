"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


interface InvoiceItem {
  productId: number;
  quantity: number;
  price: number;
  total: number;
  productName?: string;
  imageUrl?: string;
}

interface Invoice {
  invoiceId: string;
  userId: string;
  email: string;
  userName: string;
  total: number;
  createdAt: string;
  paymentMethod: string;
  expiryDate: string;
  cardType: "VISA" | "MASTERCARD";
  cardLogoUrl: string;
  items: InvoiceItem[];
  subTotal: number;
  shippingFee: number;
  taxRate: number;
  companyAddress: string;
  paymentMethodEncrypted: string;
  shippingAddress: string;
  creditCardMasked: string;
}
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
  }
}
export default function SuccessPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const payload = sessionStorage.getItem("invoice");
    if (!payload) {
      // invoice yoksa Checkout'a geri dön
      router.replace("/checkout");
      return;
    }
    setInvoice(JSON.parse(payload));
  }, [router]);

  const handleDownloadInvoice = () => {
    if (!invoice) return;
    
    // PDF oluştur
    const doc = new jsPDF();
    
    // Marka/logo üst kısımda
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SNEAKPEEK", 105, 20, { align: "center" });
    
    // Başlık
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 105, 35, { align: "center" });
    
    // Invoice detayları
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoice.invoiceId}`, 14, 50);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleString()}`, 14, 55);
    
    // Müşteri bilgileri
    doc.text(`Customer: ${invoice.userName}`, 14, 65);
    doc.text(`Email: ${invoice.email}`, 14, 70);
    
    // Kart bilgileri
    doc.text(`Payment Method: ${invoice.cardType}`, 140, 50);
    doc.text(`Card Number: ${invoice.creditCardMasked}`, 140, 55);
    doc.text(`Expiry: ${invoice.expiryDate}`, 140, 60);
    
    // Ürün tablosu
    const tableColumn = ["Product", "Unit Price", "Qty", "Total"];
    const tableRows: any[] = [];
    
    invoice.items.forEach(item => {
      const itemData = [
        item.productName || "",  
        `$${item.price.toFixed(2)}`,
        item.quantity,
        `$${item.total.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });
    
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'plain',
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
    });
    
    // Hesaplama kısmı için y pozisyonunu al
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Hesaplama detayları
    doc.text("Subtotal:", 140, finalY);
    doc.text(`$${invoice.subTotal.toFixed(2)}`, 175, finalY, { align: "right" });
    
    doc.text("Shipping:", 140, finalY + 5);
    doc.text(`$${invoice.shippingFee.toFixed(2)}`, 175, finalY + 5, { align: "right" });
    
    doc.text(`Tax (${(invoice.taxRate * 100).toFixed(0)}%):`, 140, finalY + 10);
    doc.text(`$${(invoice.subTotal * invoice.taxRate).toFixed(2)}`, 175, finalY + 10, { align: "right" });
    
    // Çizgi
    doc.line(140, finalY + 12, 180, finalY + 12);
    
    // Toplam
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 140, finalY + 17);
    doc.text(`$${invoice.total.toFixed(2)}`, 175, finalY + 17, { align: "right" });
    
    // Teslimat adresi
    doc.setFont("helvetica", "normal");
    doc.text("Shipping Address:", 14, finalY);
    doc.text(invoice.shippingAddress, 14, finalY + 5);
    
    // Alt kısımdaki notlar
    doc.setFontSize(8);
    doc.text("Thank you for your purchase!", 105, 270, { align: "center" });
    doc.text("For any questions or concerns, please contact our customer service.", 105, 275, { align: "center" });
    
    // PDF dosyasını indir
    doc.save(`invoice-${invoice.invoiceId}.pdf`);
  };

  const handleCancel = async () => {
    if (!invoice) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch("http://localhost:9000/api/order/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: invoice.invoiceId,
          userId: invoice.userId,
          reason: "Cancel requested",
        }),
      });
      const d = await res.json();
      setCancelMessage(d.message);
    } catch (err) {
      console.error(err);
      setCancelMessage("An error occurred while cancelling the order.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!invoice) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      <span className="ml-3 text-black font-medium">Loading invoice...</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Site Header with Join Now */}
      <div className="w-full bg-black text-white text-center py-3">
        <div className="flex justify-center items-center">
          <span>Members: Free Shipping on Orders $50+</span>
          <a href="#" className="ml-2 underline font-medium">Join now</a>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 px-8 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-black">Thank you for your order!</h1>
            <div className="flex space-x-4">
              <button 
                onClick={handleDownloadInvoice}
                className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download Invoice
              </button>
              <button 
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-6 py-3 bg-white text-black border border-black rounded hover:bg-gray-100 transition-colors"
              >
                {isCancelling ? 'Processing...' : 'Cancel Order'}
              </button>
            </div>
          </div>
          
          {cancelMessage && (
            <div className={`px-8 py-4 ${cancelMessage.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {cancelMessage}
            </div>
          )}
          
          <div className="px-8 py-6">
            <div className="flex justify-between flex-wrap">
              <div className="mb-4">
                <p className="text-gray-600 mb-1">Invoice #:</p>
                <p className="font-medium text-black text-lg">{invoice.invoiceId}</p>
                <p className="text-gray-600 mt-4 mb-1">Date:</p>
                <p className="font-medium text-black text-lg">{new Date(invoice.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-5 mb-4">
                <div className="flex items-center">
                  {invoice.cardLogoUrl ? (
                    <img 
                      src={invoice.cardLogoUrl} 
                      alt={invoice.cardType} 
                      className="h-12 w-20 mr-4 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-20 bg-black rounded mr-4 flex items-center justify-center text-white text-sm font-bold">
                      {invoice.cardType}
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 mb-1">Expiry: {invoice.expiryDate}</p>
                    <p className="font-medium text-black text-lg">{invoice.creditCardMasked}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-6 border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.imageUrl && (
                            <div className="flex-shrink-0 h-20 w-20 mr-6 overflow-hidden">
                              <img 
                                className="h-20 w-20 object-contain bg-gray-50 border border-gray-200" 
                                src={item.imageUrl} 
                                alt={item.productName}
                              />
                            </div>
                          )}
                          <div className="text-base font-medium text-black">
                            {item.productName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base text-gray-800">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base font-medium text-black">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-lg">Subtotal:</span>
                  <span className="font-medium text-black text-lg">${invoice.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-lg">Shipping:</span>
                  <span className="font-medium text-black text-lg">${invoice.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-lg">Tax ({(invoice.taxRate * 100).toFixed(0)}%):</span>
                  <span className="font-medium text-black text-lg">${(invoice.subTotal * invoice.taxRate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-300 mt-2 pt-3">
                  <span className="text-xl font-bold text-black">Total:</span>
                  <span className="text-xl font-bold text-black">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-6 border-t border-gray-200">
            <h3 className="font-medium text-black text-lg mb-2">Shipping Address:</h3>
            <p className="text-gray-600 text-lg">{invoice.shippingAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}