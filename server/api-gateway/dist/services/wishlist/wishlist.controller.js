"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const wishlist_dto_1 = require("../../dtos/wishlist.dto");
const wishlist_service_1 = require("./wishlist.service");
const common_1 = require("@nestjs/common");
const error_handler_1 = require("../../exceptions/error-handler");
const auth_guard_1 = require("../../guards/auth.guard");
let WishlistController = class WishlistController {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async addProductToWishlist(body, req) {
        try {
            const data = { userId: req.user.id, ...body };
            return await this.wishlistService.addProductToWishlist(data);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
    async getUserWishlist(req) {
        try {
            const data = { userId: req.user.id };
            return await this.wishlistService.getProductFromWishlist(data);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
    async removeProductFromWishlist(body, req) {
        try {
            const data = { userId: req.user.id, ...body };
            return await this.wishlistService.removeProductFromWishlist(data);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
};
exports.WishlistController = WishlistController;
__decorate([
    (0, common_1.Post)("/add"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wishlist_dto_1.AddProductToWishlistDto, Object]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "addProductToWishlist", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "getUserWishlist", null);
__decorate([
    (0, common_1.Post)("/remove"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wishlist_dto_1.RemoveProductFromWishlistDto, Object]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "removeProductFromWishlist", null);
exports.WishlistController = WishlistController = __decorate([
    (0, common_1.Controller)("wishlist"),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistController);
//# sourceMappingURL=wishlist.controller.js.map