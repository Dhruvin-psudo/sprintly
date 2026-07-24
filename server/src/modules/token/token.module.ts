import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_EXPIRATION',
            '15m'
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        }
      })
    })
  ],
  providers: [TokenService, TokenRepository],
  exports: [TokenService, JwtModule]
})
export class TokenModule { }
