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
exports.DeleteUserDto = exports.UpdateUserDto = exports.LoginUserDto = exports.RegisterUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RegisterUserDto {
    username;
    email;
    password;
    wishlist;
    cart;
}
exports.RegisterUserDto = RegisterUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Username is required' }),
    (0, class_validator_1.Length)(3, 20, { message: 'Username must be between 3 and 20 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9]+$/, { message: 'Username can only contain letters and numbers' }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    (0, class_transformer_1.Transform)(({ value }) => value.toLowerCase().trim()),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.Length)(8, 32, { message: 'Password must be between 8 and 32 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Wishlist must be an array' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each wishlist item must be an integer' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], RegisterUserDto.prototype, "wishlist", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Cart must be an array' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each cart item must be an integer' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], RegisterUserDto.prototype, "cart", void 0);
class LoginUserDto {
    email;
    password;
}
exports.LoginUserDto = LoginUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    (0, class_transformer_1.Transform)(({ value }) => value.toLowerCase().trim()),
    __metadata("design:type", String)
], LoginUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.Length)(8, 32, { message: 'Password must be between 8 and 32 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    __metadata("design:type", String)
], LoginUserDto.prototype, "password", void 0);
class UpdateUserDto {
    userId;
    username;
    email;
    password;
    wishlist;
    cart;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'User ID is required' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 20, { message: 'Username must be between 3 and 20 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9]+$/, { message: 'Username can only contain letters and numbers' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    (0, class_transformer_1.Transform)(({ value }) => value.toLowerCase().trim()),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(8, 32, { message: 'Password must be between 8 and 32 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Wishlist must be an array' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each wishlist item must be an integer' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "wishlist", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Cart must be an array' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each cart item must be an integer' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "cart", void 0);
class DeleteUserDto {
    userId;
}
exports.DeleteUserDto = DeleteUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'User ID is required' }),
    __metadata("design:type", String)
], DeleteUserDto.prototype, "userId", void 0);
//# sourceMappingURL=auth.dto.js.map