"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'payment',
            protoPath: '../proto/payment.proto',
            url: '0.0.0.0:50053',
        },
    });
    await app.listen();
    console.log('Payment GRPC Service running on port 50053');
}
bootstrap();
//# sourceMappingURL=main.js.map