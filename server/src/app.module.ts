import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomingMessage, ServerResponse } from 'node:http';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma';
import { OrganizationModule } from './organization/organization.module';
import { RoleModule } from './role/role.module';

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
                        // customProps: (req: IncomingMessage) => {
                        //     const expressReq = req as unknown as Request;
                        //     const user = expressReq.user as IAuthenticatedUser | undefined;
                        //     return {
                        //         userId: user?.userId ?? 'anonymous',
                        //         orgId: user?.organizationId ?? '-',
                        //         apiKeyId: user?.apiKeyId ?? '-',
                        //     };
                        // },
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
