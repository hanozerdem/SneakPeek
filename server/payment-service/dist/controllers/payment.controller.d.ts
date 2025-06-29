import { PaymentService } from '../providers/payment.service';
import { CreateOrderRequest } from '../interfaces/payment.interface';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    handlePaymentApproved(paymentData: CreateOrderRequest): Promise<void>;
}
