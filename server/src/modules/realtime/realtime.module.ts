import { Module } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { PrismaModule } from '../../prisma';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [TokenModule, PrismaModule],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
