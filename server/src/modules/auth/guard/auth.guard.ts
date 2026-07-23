import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt"
import { Reflector } from "@nestjs/core";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";
import type { Request } from 'express'
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";
import { IAuthenticatedUser } from "../../../common/interfaces/authenticated-user.interface";

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt'){
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private readonly reflector: Reflector
    ) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
       
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        
        if(isPublic) {
            return true;
        }

        return (await super.canActivate(context)) as boolean
    }

    handleRequest<T = IAuthenticatedUser>(err: Error | null, user: T | false): T {
        if(err) {
            if(err instanceof TokenExpiredError) {
                this.logger.warn('Authentication failed: token expired')
                throw new UnauthorizedException()
            }
            this.logger.warn('Authentication failed: invalid token')
            throw new UnauthorizedException()
        }

        if(!user) {
            this.logger.warn('Authentication failed: no user resolved');
            throw new UnauthorizedException();
        }

        return user
    }
}