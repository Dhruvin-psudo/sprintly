import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly _logger = new Logger(PrismaService.name)

    async onModuleInit(): Promise<void> {
        this._logger.log('Connecting to database...')
        await this.$connect()
        this._logger.log('Database connection established')
    }

    async onModuleDestroy(): Promise<void> {
        this._logger.log('Disconnecting from database...')
        await this.$disconnect()
        this._logger.log('Database connection closed')
    }

    async setTenantContext(orgId?: string | null, userId?: string | null): Promise<void> {
        if (orgId) {
            await this.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, true)`;
        } else {
            await this.$executeRaw`SELECT set_config('app.current_org_id', '', true)`;
        }

        if (userId) {
            await this.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
        } else {
            await this.$executeRaw`SELECT set_config('app.current_user_id', '', true)`;
        }
    }
}