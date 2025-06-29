import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const requiredRoles = this.reflector.get<string[]>('roles',context.getHandler());
            console.log(requiredRoles)
            if(!requiredRoles) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const user = request.user;
            console.log(user);

            if(!user || !requiredRoles.includes(user.role)) {
                handleMappedError("PERMISSION_DENIED");
            }

            return true;
    
        } catch(err) {
            console.error(err);
            handleMappedError("PERMISSION_DENIED");
        }

    }
}