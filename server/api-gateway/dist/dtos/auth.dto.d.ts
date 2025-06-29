export declare class RegisterUserDto {
    username: string;
    email: string;
    password: string;
    wishlist: number[];
    cart: number[];
}
export declare class LoginUserDto {
    email: string;
    password: string;
}
export declare class UpdateUserDto {
    userId: string;
    username?: string;
    email?: string;
    password?: string;
    wishlist?: number[];
    cart?: number[];
}
export declare class DeleteUserDto {
    userId: string;
}
