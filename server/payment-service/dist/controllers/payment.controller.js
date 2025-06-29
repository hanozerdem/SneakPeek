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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const payment_service_1 = require("../providers/payment.service");
let PaymentController = PaymentController_1 = class PaymentController {
    paymentService;
    logger = new common_1.Logger(PaymentController_1.name);
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async handlePaymentApproved(paymentData) {
        this.logger.log(`Received 'payment-approved' message for user: ${paymentData.userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.paymentService.processPayment(paymentData));
            this.logger.log(`Payment processed successfully: ${response.message}`);
        }
        catch (err) {
            this.logger.error(`Error processing payment for user ${paymentData.userId}: ${err.message}`);
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, microservices_1.MessagePattern)('payment-approved'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handlePaymentApproved", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map