import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { InvitationRepository } from './invitation.repository';
import { PrismaModule } from '../../prisma';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, UserModule, RoleModule, TokenModule, MailModule, RealtimeModule],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationRepository],
  exports: [InvitationService, InvitationRepository],
})
export class InvitationModule {}
