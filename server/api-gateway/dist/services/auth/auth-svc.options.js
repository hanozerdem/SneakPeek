"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServiceClientOptions = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.UserServiceClientOptions = {
    transport: microservices_1.Transport.GRPC,
    options: {
        url: 'user-service:50051',
        package: 'user',
        protoPath: '../proto/user.proto'
    },
};
//# sourceMappingURL=auth-svc.options.js.map