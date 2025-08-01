"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microservices_1 = require("@nestjs/microservices");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'product',
            protoPath: '/usr/src/proto/product.proto',
            url: '0.0.0.0:50052',
        }
    });
    await app.listen();
    console.log('Product service is running on gRPC!');
}
bootstrap();
//# sourceMappingURL=main.js.map