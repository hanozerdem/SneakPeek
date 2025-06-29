import { OnModuleInit } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PaymentResponse } from '../interfaces/payment.interface';
import { CreateOrderRequest } from '../interfaces/payment.interface';
export declare class PaymentService implements OnModuleInit {
    private kafkaProducer;
    constructor();
    onModuleInit(): void;
    processPayment(data: CreateOrderRequest): Observable<PaymentResponse>;
    private generateInvoicePDF;
}
