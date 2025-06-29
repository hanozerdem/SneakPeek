import { Observable } from "rxjs";
export interface RegisterBody {
    username: string;
    email: string;
    password: string;
    wishlist: number[];
    cart: number[];
}
export interface RegisterResponse {
    status: boolean;
    message: string;
}
export interface LoginBody {
    email: string;
    password: string;
}
export interface LoginResponse {
    status: boolean;
    message: string;
    token?: string;
}
export interface UpdateBody {
    userId: string;
    username?: string;
    email?: string;
    password?: string;
    wishlist?: number[];
    cart?: number[];
}
export interface UpdateResponse {
    status: boolean;
    message: string;
}
export interface DeleteBody {
    userId: string;
}
export interface DeleteResponse {
    status: boolean;
    message: string;
}
export interface UserService {
    register(data: {
        username: string;
        email: string;
        password: string;
        wishlist: number[];
        cart: number[];
    }): Observable<{
        status: boolean;
        message: string;
    }>;
    login(data: {
        email: string;
        password: string;
    }): Observable<{
        status: boolean;
        message: string;
        token?: string;
    }>;
    update(data: {
        userId: string;
        username?: string;
        email?: string;
        password?: string;
        wishlist?: number[];
        cart?: number[];
    }): Observable<{
        status: boolean;
        message: string;
    }>;
    delete(data: {
        userId: string;
    }): Observable<{
        status: boolean;
        message: string;
    }>;
}
