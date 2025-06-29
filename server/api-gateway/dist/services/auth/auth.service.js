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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const auth_svc_options_1 = require("./auth-svc.options");
const rxjs_1 = require("rxjs");
const error_handler_1 = require("../../exceptions/error-handler");
let AuthService = class AuthService {
    userService;
    userServiceClient;
    onModuleInit() {
        this.userService = this.userServiceClient.getService('UserService');
        if (!this.userService) {
            console.error("Failed to connect userService");
        }
    }
    async register(user) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.userService.register({
                username: user.username,
                email: user.email,
                password: user.password,
                wishlist: user.wishlist,
                cart: user.cart
            }));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred"
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("REGISTER_FAILED");
        }
    }
    async login(user) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.userService.login({
                email: user.email,
                password: user.password
            }));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred",
                token: response?.token
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("LOGIN_FAILED");
        }
    }
    async update(user) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.userService.update({
                userId: user.userId,
                username: user?.username,
                email: user?.email,
                password: user?.password,
                wishlist: user?.wishlist,
                cart: user?.cart,
            }));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occured",
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("UPDATE_FAILED");
        }
    }
    async delete(user) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.userService.delete({
                userId: user.userId
            }));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occured",
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("DELETE_FAILED");
        }
    }
};
exports.AuthService = AuthService;
__decorate([
    (0, microservices_1.Client)(auth_svc_options_1.UserServiceClientOptions),
    __metadata("design:type", Object)
], AuthService.prototype, "userServiceClient", void 0);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map