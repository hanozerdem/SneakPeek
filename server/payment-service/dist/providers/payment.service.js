"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const moment = require("moment");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const kafkajs_1 = require("kafkajs");
let PaymentService = class PaymentService {
    kafkaProducer;
    constructor() {
        const kafka = new kafkajs_1.Kafka({
            clientId: 'payment-service',
            brokers: ['localhost:9092'],
        });
        this.kafkaProducer = kafka.producer();
        this.kafkaProducer.connect()
            .then(() => console.log('Kafka Producer connected.'))
            .catch(err => console.error('Kafka Producer connection error:', err));
    }
    onModuleInit() {
    }
    processPayment(data) {
        return (0, rxjs_1.from)((async () => {
            console.log('Incoming payment data:', data);
            if (data.cardInformation.slice(-4) === '1234' || Math.random() >= 0.8) {
                return {
                    status: false,
                    message: 'Payment failed due to invalid card or processing error. Please try again.',
                    invoice: null,
                };
            }
            const subTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shippingFee = subTotal > 4000 ? 0 : 50;
            const taxRate = 0.18;
            const taxAmount = subTotal * taxRate;
            const total = subTotal + shippingFee + taxAmount;
            const maskedCreditCard = "**** **** **** " + data.cardInformation.slice(-4);
            const defaultPaymentMethod = 'Credit Card';
            let invoice = {
                invoiceId: (0, uuid_1.v4)(),
                userId: data.userId,
                items: data.items.map(item => ({
                    productId: Number(item.productId),
                    quantity: item.quantity,
                    price: item.price,
                })),
                subTotal,
                shippingFee,
                taxRate,
                total,
                companyAddress: '1234 Corporate Address, Istanbul, Turkey',
                paymentMethodEncrypted: crypto.createHash('sha256').update(defaultPaymentMethod).digest('hex'),
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                pdfBase64: '',
                shippingAddress: data.address,
                creditCardMasked: maskedCreditCard,
                paymentMethod: defaultPaymentMethod,
            };
            try {
                const pdfBase64 = await this.generateInvoicePDF(invoice);
                invoice.pdfBase64 = pdfBase64;
            }
            catch (pdfError) {
                console.error('Error generating PDF invoice:', pdfError);
                return {
                    status: false,
                    message: 'Payment succeeded, but failed to generate invoice PDF.',
                    invoice: null,
                };
            }
            try {
                const kafkaMessage = {
                    key: data.userId,
                    value: JSON.stringify({
                        invoiceId: invoice.invoiceId,
                        total: invoice.total,
                        timestamp: invoice.createdAt,
                    }),
                };
                await this.kafkaProducer.send({
                    topic: 'payment_notifications',
                    messages: [kafkaMessage],
                });
                console.log('Kafka message sent:', kafkaMessage);
            }
            catch (kafkaError) {
                console.error('Error sending Kafka message:', kafkaError);
            }
            return {
                status: true,
                message: 'Payment successful. Invoice generated.',
                invoice,
            };
        })());
    }
    generateInvoicePDF(invoice) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers).toString('base64');
                resolve(pdfData);
            });
            doc.on('error', (err) => reject(err));
            doc.fontSize(20).text('Invoice', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Invoice ID: ${invoice.invoiceId}`);
            doc.text(`User ID: ${invoice.userId}`);
            doc.text(`Shipping Address: ${invoice.shippingAddress}`);
            doc.text(`Created At: ${invoice.createdAt}`);
            doc.text(`Payment Method: ${invoice.paymentMethod}`);
            doc.text(`Credit Card: ${invoice.creditCardMasked}`);
            doc.moveDown();
            doc.text('Product ID', 50, doc.y, { continued: true });
            doc.text('Quantity', 150, doc.y, { continued: true });
            doc.text('Price', 250, doc.y, { continued: true });
            doc.text('Total', 350, doc.y);
            doc.moveDown();
            invoice.items.forEach((item) => {
                const totalItemPrice = item.price * item.quantity;
                doc.text(item.productId.toString(), 50, doc.y, { continued: true });
                doc.text(item.quantity.toString(), 150, doc.y, { continued: true });
                doc.text(item.price.toString(), 250, doc.y, { continued: true });
                doc.text(totalItemPrice.toString(), 350, doc.y);
                doc.moveDown();
            });
            doc.moveDown();
            doc.text(`SubTotal: ${invoice.subTotal}`);
            doc.text(`Shipping Fee: ${invoice.shippingFee}`);
            doc.text(`Tax Rate: ${invoice.taxRate}`);
            doc.text(`Total: ${invoice.total}`);
            doc.moveDown();
            doc.text(`Company Address: ${invoice.companyAddress}`);
            doc.end();
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PaymentService);
//# sourceMappingURL=payment.service.js.map