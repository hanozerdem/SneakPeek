import * as PDFDocument from 'pdfkit';
import { Invoice } from '../models/invoice.model';

function formatDateTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'Unknown';
  const date = new Date(dateInput);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} - ${hours}:${minutes}`;
}

function formatDateOnly(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'Unknown';
  const date = new Date(dateInput);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export async function generateInvoiceReport(
  invoices: Invoice[],
  startDate: string,
  endDate: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const formattedStart = formatDateOnly(startDate);
    const formattedEnd = formatDateOnly(endDate);
    doc
      .fontSize(20)
      .fillColor('#333')
      .text(`Invoice Report (${formattedStart} - ${formattedEnd})`, { align: 'center' })
      .moveDown();

    let grandTotal = 0;
    let costTotal = 0;

    invoices.forEach((invoice, i) => {
      doc
        .moveDown()
        .fontSize(14)
        .fillColor('#000')
        .font('Helvetica-Bold')
        .text(`Invoice ${i + 1}`)
        .fontSize(12)
        .font('Helvetica')
        .text(`Customer Name: ${invoice.userName}`)
        .text(`Date: ${formatDateTime(invoice.createdAt)}`)
        .text(`Total: ${invoice.total} TL`)
        .text(`Shipping: ${invoice.shippingFee} TL`)
        .text(`Tax Rate: ${invoice.taxRate * 100}%`)
        .text(`SubTotal: ${invoice.subTotal} TL`)
        .moveDown();

      doc.font('Helvetica-Bold').text('Items:', { underline: true });
      doc.font('Helvetica');

      invoice.items.forEach((item) => {
        const total = item.price * item.quantity;
        doc.text(
          `- ${item.productName} | ${item.price} TL x ${item.quantity} = ${total} TL`,
          { indent: 20 }
        );
      });

      grandTotal += invoice.total;
      costTotal += invoice.total * 0.5;
      doc.moveDown();
    });

    const profit = grandTotal - costTotal;
    doc
      .addPage()
      .fontSize(16)
      .fillColor('#000')
      .text('Summary', { underline: true })
      .moveDown()
      .fontSize(12)
      .text(`Total Revenue: ${grandTotal.toFixed(2)} TL`)
      .text(`Estimated Cost (50%): ${costTotal.toFixed(2)} TL`)
      .text(`Estimated Profit: ${profit.toFixed(2)} TL`);

    doc.end();
  });
}