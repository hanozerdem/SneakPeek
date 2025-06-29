import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            // Check header
            const token = request.cookies ? request.cookies['accessToken'] : null;
            
            if(!token) {
                handleMappedError("NO_TOKEN_PROVIDED");
            }
            
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
            request.user = decoded; // Add user information to request
            return true;
        } catch(err) {
            console.error(err);
            if (err.name === 'TokenExpiredError') {
                handleMappedError('TOKEN_EXPIRED');
            }
            handleMappedError('INVALID_TOKEN');
        }
    }
}
