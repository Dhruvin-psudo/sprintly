import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomingMessage, ServerResponse } from 'node:http';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { OrganizationRequiredGuard } from './common/guards/organization-required.guard';
import { MembershipContextGuard } from './common/guards/membership-context.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma';
import { OrganizationModule } from './modules/organization/organization.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import type { Request } from 'express';
import { IJwtUser } from './common/interfaces';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const isProduction = config.get<string>('NODE_ENV') === 'production';
                return {
                    pinoHttp: {
                        level: config.get<string>('LOG_LEVEL', 'info'),
                        transport: isProduction
                            ? undefined
                            : { target: 'pino-pretty', options: { colorize: true } },
                        autoLogging: true,
                        customProps: (req: IncomingMessage) => {
                            const expressReq = req as unknown as Request;
                            const user = expressReq.user as IJwtUser | undefined;
                            return {
                                userId: user?.userId ?? 'anonymous',
                                orgId: user?.organizationId ?? '-'
                            };
                        },
                        customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
                            return `${req.method} ${req.url} ${String(res.statusCode)}`;
                        },
                        customErrorMessage: (req: IncomingMessage, res: ServerResponse) => {
                            return `${req.method} ${req.url} ${String(res.statusCode)}`;
                        },
                        serializers: {
                            req: (req: Record<string, unknown>) => ({
                                id: req['id'],
                                method: req['method'],
                                url: req['url'],
                            }),
                            res: (res: Record<string, unknown>) => ({
                                statusCode: res['statusCode'],
                            }),
                        },
                        redact: ['req.headers.authorization', 'req.headers.cookie'],
                    },
                };
            },
        }),
        UserModule,
        AuthModule,
        PrismaModule,
        OrganizationModule,
        RoleModule,
        PermissionModule,
        ProjectModule,
        TaskModule,
        InvitationModule,
        RealtimeModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: MembershipContextGuard,
        },
        {
            provide: APP_GUARD,
            useClass: OrganizationRequiredGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
    ],
})
export class AppModule { }
