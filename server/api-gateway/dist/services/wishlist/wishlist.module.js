"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistModule = void 0;
const common_1 = require("@nestjs/common");
const wishlist_service_1 = require("./wishlist.service");
const wishlist_controller_1 = require("./wishlist.controller");
const jwt_1 = require("@nestjs/jwt");
const auth_guard_1 = require("../../guards/auth.guard");
const product_module_1 = require("../product/product.module");
let WishlistModule = class WishlistModule {
};
exports.WishlistModule = WishlistModule;
exports.WishlistModule = WishlistModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET_KEY,
                signOptions: { expiresIn: '1h' },
            }),
            product_module_1.ProductModule,
        ],
        controllers: [wishlist_controller_1.WishlistController],
        providers: [wishlist_service_1.WishlistService, auth_guard_1.AuthGuard],
        exports: [wishlist_service_1.WishlistService]
    })
], WishlistModule);
//# sourceMappingURL=wishlist.module.js.map