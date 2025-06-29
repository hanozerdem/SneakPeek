"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderClientOptions = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.OrderClientOptions = {
    transport: microservices_1.Transport.GRPC,
    options: {
        url: 'order-service:50053',
        package: 'order',
        protoPath: '../proto/order.proto'
    },
};
//# sourceMappingURL=order-svc.options.js.map