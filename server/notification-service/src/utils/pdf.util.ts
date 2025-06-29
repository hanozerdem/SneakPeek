import * as PDFDocument from 'pdfkit';
import { Invoice } from '../interfaces/invoice.interface';

/**
 * Generates a PDF invoice from the given invoice data.
 * Shows username instead of userId and formats date properly.
 */
export async function generateInvoicePdf(invoice: Invoice, username: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer.toString('base64'));
    });

    doc.on('error', (err) => reject(err));

    // ---------- HEADER ----------
    doc.fontSize(26).text('INVOICE', { align: 'right' });
    doc.moveDown();

    // ---------- CUSTOMER INFO ----------
    const issuedY = 100;
    const formattedDate = formatDate(invoice.createdAt);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Customer Username:', 50, issuedY, { continued: true })
      .font('Helvetica-Bold')
      .text(` ${username}`)
      .font('Helvetica') 
      .text(`Date: ${formattedDate}`, 400, issuedY);

    // ---------- PAY TO ----------
    const payToY = issuedY + 40;
    doc
      .fontSize(10)
      .text('PAY TO:', 50, payToY)
      .font('Helvetica-Bold')
      .text('SneakPeek Company', 50, payToY + 15)
      .font('Helvetica')
      .text('1234 Corporate Address, Istanbul, Turkey', 50, payToY + 30);

    // ---------- TABLE HEADER ----------
    let tableTop = payToY + 70;
    doc
      .moveDown()
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('DESCRIPTION', 50, tableTop)
      .text('UNIT PRICE', 250, tableTop)
      .text('QTY', 350, tableTop)
      .text('TOTAL', 430, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // ---------- ITEMS ----------
    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 25;
    let subtotal = 0;

    invoice.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      doc
        .text(`${item.productName || 'Unknown Product'}`, 50, y) // BURASI değişti
        .text(`${item.price} TL`, 250, y)
        .text(`${item.quantity}`, 350, y)
        .text(`${itemTotal} TL`, 430, y);
      y += 20;
    });

    // ---------- SUMMARY ----------
    y += 30;
    doc
      .font('Helvetica-Bold')
      .text(`Subtotal: ${invoice.subTotal} TL`, 400, y)
      .text(`Tax Rate: ${invoice.taxRate * 100}%`, 400, y + 15)
      .text(`Shipping Fee: ${invoice.shippingFee} TL`, 400, y + 30)
      .text(`Total: ${invoice.total} TL`, 400, y + 45);

    // ---------- FOOTER ----------
    doc
      .font('Helvetica-Oblique')
      .fontSize(10)
      .text('Thank you for shopping with us!', 50, y + 80, { align: 'center' });

    doc.end();
  });
}

/**
 * Helper to format date to dd.mm.yyyy
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}