import { Injectable, OnModuleInit } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import * as crypto from 'crypto';
import { Kafka } from 'kafkajs';
import { PaymentResponse, Invoice, CartItem } from '../interfaces/payment.interface';
import { CreateOrderRequest } from '../interfaces/payment.interface';

@Injectable()
export class PaymentService implements OnModuleInit {
  private kafkaProducer;

  // constructor() {
  //   // Initialize KafkaJS producer with a default broker at localhost:9092.
  //   const kafka = new Kafka({
  //     clientId: 'payment-service',
  //     brokers: ['localhost:9092'],
  //   });
  //   this.kafkaProducer = kafka.producer();
  //   this.kafkaProducer.connect()
  //     .then(() => console.log('Kafka Producer connected.'))
  //     .catch(err => console.error('Kafka Producer connection error:', err));
  // }

  onModuleInit() {
    // No external GRPC client injection or database dependency is needed.
    const kafka = new Kafka({
      clientId: 'payment-service',
      brokers: ['kafka:9092'],
    });

    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect()
      .then(() => console.log('✅ Kafka Producer connected.'))
      .catch(err => console.error('❌ Kafka connection failed:', err));
  }

  /**
   * processPayment
   *
   * This method processes a payment request by:
   * 1. Simulating payment processing:
   *    - Fails if the cardInformation ends with "1234" or randomly (20% failure chance).
   * 2. Calculating totals: subTotal, shipping fee (50 TL if subTotal ≤ 4000, free otherwise), tax (18%), and total.
   * 3. Creating an invoice object that includes the user's address, masked credit card, and a default payment method.
   * 4. Sending a Kafka notification with invoice details.
   * 5. Returning a PaymentResponse containing the generated invoice.
   */
  processPayment(data: CreateOrderRequest): Observable<PaymentResponse> {
    return from(
      (async (): Promise<PaymentResponse> => {
        console.log('Incoming payment data:', data);

        // Step 1: Simulate payment.
        // Payment fails if cardInformation ends with "1234" or randomly (20% failure chance).
        if (data.cardInformation.slice(-4) === '1234' || Math.random() >= 0.8) {
          return {
            status: false,
            message: 'Payment failed due to invalid card or processing error. Please try again.',
            invoice: null,
          };
        }

        // Step 2: Calculate subTotal for all items.
        const subTotal = data.items.reduce(
          (sum, item) => sum + item.price * item.quantity, 
          0
        );

        // Step 3: Determine shipping fee: 50 TL if subTotal is 4000 TL or less; free otherwise.
        const shippingFee = subTotal > 4000 ? 0 : 50;

        // Step 4: Calculate tax (18% of subTotal).
        const taxRate = 0.18;
        const taxAmount = subTotal * taxRate;

        // Step 5: Compute total amount.
        const total = subTotal + shippingFee + taxAmount;

        // Step 6: Create a masked version of the credit card number (show only last 4 digits).
        const maskedCreditCard = "**** **** **** " + data.cardInformation.slice(-4);

        // Use a default payment method since CreateOrderRequest doesn't include one.
        const defaultPaymentMethod = 'Credit Card';

        // Step 7: Construct the invoice object.
        // Convert OrderItem.productId from string to number.
        let invoice: Invoice = {
          invoiceId: uuidv4(),
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
          pdfBase64: '', // Now handled by notification-service
          shippingAddress: data.address,
          creditCardMasked: maskedCreditCard,
          paymentMethod: defaultPaymentMethod,
        };

        // Step 8: Send a Kafka notification with invoice details.
        try {
          const kafkaMessage = {
            key: data.userId,
            value: JSON.stringify(invoice),
          };
          await this.kafkaProducer.send({
            topic: 'invoice-created',
            messages: [kafkaMessage],
          });
          console.log('Kafka message sent:', kafkaMessage);
        } catch (kafkaError) {
          console.error('Error sending Kafka message:', kafkaError);
          // Continue processing even if Kafka fails.
        }

        // Step 9: Return a successful payment response with the generated invoice.
        return {
          status: true,
          message: 'Payment successful. Invoice generated.',
          invoice,
        };
      })()
    );
  }
}