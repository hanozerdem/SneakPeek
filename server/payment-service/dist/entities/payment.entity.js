"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
class Payment {
    invoiceId;
    userId;
    items;
    subTotal;
    shippingFee;
    taxRate;
    total;
    companyAddress;
    paymentMethodEncrypted;
    createdAt;
    pdfBase64;
    shippingAddress;
    creditCardMasked;
    paymentMethod;
    constructor(init) {
        Object.assign(this, init);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.entity.js.map