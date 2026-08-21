import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { PrismaModule } from '../../prisma';

@Module({
    imports: [PrismaModule],
    controllers: [DashboardController],
    providers: [DashboardService, DashboardRepository],
    exports: [DashboardService],
})
export class DashboardModule {}
