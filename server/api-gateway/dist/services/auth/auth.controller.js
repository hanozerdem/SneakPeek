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
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("../../dtos/auth.dto");
const error_handler_1 = require("../../exceptions/error-handler");
const auth_exception_filter_1 = require("../../common/filters/auth-exception.filter");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    async checkUser(req) {
        try {
            const token = req.cookies ? req.cookies['accessToken'] : null;
            if (!token) {
                return { loggedIn: false };
            }
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
            if (!decoded) {
                return { loggedIn: false };
            }
            return { loggedIn: true };
        }
        catch (err) {
            return { loggedIn: true };
        }
    }
    async registerUser(user) {
        try {
            return await this.authService.register(user);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
    async loginUser(user, res) {
        try {
            const loginResponse = await this.authService.login(user);
            if (loginResponse.status && loginResponse.token) {
                res.cookie('accessToken', loginResponse.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 15 * 60 * 1000,
                    sameSite: 'lax',
                });
            }
            return loginResponse;
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
    async updateUser(user) {
        try {
            return await this.authService.update(user);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
    async deleteUser(userId) {
        try {
            const deleteUser = { userId: userId };
            return await this.authService.delete(deleteUser);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('/check'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkUser", null);
__decorate([
    (0, common_1.Post)('/register'),
    (0, common_1.UseFilters)(auth_exception_filter_1.AuthExceptionFilter),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseFilters)(auth_exception_filter_1.AuthExceptionFilter),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Post)('update'),
    (0, common_1.UseFilters)(auth_exception_filter_1.AuthExceptionFilter),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    (0, common_1.UseFilters)(auth_exception_filter_1.AuthExceptionFilter),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map