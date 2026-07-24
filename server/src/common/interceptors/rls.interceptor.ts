import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RlsInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const userId = user?.userId || user?.id || null;
        const orgId = 
            request.headers['x-organization-id'] || 
            request.params?.organizationId || 
            request.params?.orgId || 
            user?.organizationId || 
            null;

        if (userId || orgId) {
            try {
                await this.prisma.setTenantContext(orgId, userId);
            } catch (err) {
                // Log RLS context error non-blocking
            }
        }

        return next.handle();
    }
}
