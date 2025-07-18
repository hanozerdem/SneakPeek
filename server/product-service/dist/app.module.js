"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const product_entity_1 = require("./entities/product.entity");
const product_pricing_entity_1 = require("./entities/product-pricing.entity");
const product_size_entity_1 = require("./entities/product-size.entity");
const product_module_1 = require("./modules/product.module");
const review_entity_1 = require("./entities/review.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USER'),
                    password: configService.get('DB_PASS'),
                    database: configService.get('DB_NAME'),
                    entities: [product_entity_1.Product, product_pricing_entity_1.ProductPricing, product_size_entity_1.ProductSize, review_entity_1.Review],
                    synchronize: true,
                }),
            }),
            microservices_1.ClientsModule.register([
                {
                    name: 'PRODUCT_PACKAGE',
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'product',
                        protoPath: '../proto/product.proto',
                        url: '0.0.0.0:50052',
                    },
                },
            ]),
            product_module_1.ProductModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map