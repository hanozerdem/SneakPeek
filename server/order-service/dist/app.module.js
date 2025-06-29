"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const payment_controller_1 = require("./payment.controller");
const payment_service_1 = require("./payment.service");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const order_model_1 = require("./models/order.model");
const refund_model_1 = require("./models/refund.model");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            microservices_1.ClientsModule.register([
                {
                    name: 'ORDER_PACKAGE',
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'order',
                        protoPath: '/usr/src/proto/order.proto',
                        url: '0.0.0.0:50053',
                    },
                },
            ]),
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'order-service',
                            brokers: ['kafka:9092'],
                        },
                        consumer: {
                            groupId: 'orders',
                        },
                    },
                },
            ]),
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || ''),
            mongoose_1.MongooseModule.forFeature([
                { name: order_model_1.Order.name, schema: order_model_1.OrderSchema },
                { name: refund_model_1.Refund.name, schema: refund_model_1.RefundSchema },
            ]),
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [payment_service_1.PaymentService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map