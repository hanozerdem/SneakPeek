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
exports.AuthGuard = void 0;
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const error_handler_1 = require("../exceptions/error-handler");
let AuthGuard = class AuthGuard {
    jwtService;
    reflector;
    constructor(jwtService, reflector) {
        this.jwtService = jwtService;
        this.reflector = reflector;
    }
    canActivate(context) {
        try {
            const request = context.switchToHttp().getRequest();
            const token = request.cookies ? request.cookies['accessToken'] : null;
            if (!token) {
                (0, error_handler_1.handleMappedError)("NO_TOKEN_PROVIDED");
            }
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
            request.user = decoded;
            return true;
        }
        catch (err) {
            console.error(err);
            if (err.name === 'TokenExpiredError') {
                (0, error_handler_1.handleMappedError)('TOKEN_EXPIRED');
            }
            (0, error_handler_1.handleMappedError)('INVALID_TOKEN');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map