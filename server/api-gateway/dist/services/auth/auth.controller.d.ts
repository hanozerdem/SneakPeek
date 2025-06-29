import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from "src/dtos/auth.dto";
import { DeleteResponse, LoginResponse, RegisterResponse, UpdateResponse } from "src/interfaces/auth.interface";
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    checkUser(req: Request): Promise<{
        loggedIn: boolean;
    }>;
    registerUser(user: RegisterUserDto): Promise<RegisterResponse>;
    loginUser(user: LoginUserDto, res: Response): Promise<LoginResponse>;
    updateUser(user: UpdateUserDto): Promise<UpdateResponse>;
    deleteUser(userId: string): Promise<DeleteResponse>;
}
