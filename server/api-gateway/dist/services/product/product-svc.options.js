"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductBaseClientOptions = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.ProductBaseClientOptions = {
    transport: microservices_1.Transport.GRPC,
    options: {
        url: 'product-service:50052',
        package: 'product',
        protoPath: '../proto/product.proto'
    },
};
//# sourceMappingURL=product-svc.options.js.map