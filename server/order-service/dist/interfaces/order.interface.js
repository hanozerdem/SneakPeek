"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["ONWAY"] = "ONWAY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["REJECTED"] = "REJECTED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["PENDING"] = "PENDING";
    RefundStatus["APPROVED"] = "APPROVED";
    RefundStatus["REJECTED"] = "REJECTED";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
//# sourceMappingURL=order.interface.js.map