import { Injectable, ExecutionContext } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";
import type { Request } from 'express'

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt'){
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private readonly reflector: Reflector,
        // private readonly apiKeyAuthenticator: ApiKeyAuthenticator
    ) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
       
        // const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        //     context.getHandler(),
        //     context.getClass()
        // ]);
        
        // if(isPublic) {
        //     return true;
        // }



        
        return true;
    }
}