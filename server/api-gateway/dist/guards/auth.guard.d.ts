import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare class AuthGuard implements CanActivate {
    private jwtService;
    private reflector;
    constructor(jwtService: JwtService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
