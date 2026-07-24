import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { IAuthenticatedUser } from "../../../common/interfaces/authenticated-user.interface";
import { TokenService } from "../../../token/token.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
        })
    }

    async validate(payload: IAuthenticatedUser) : Promise<IAuthenticatedUser> {
        if (
            !payload.userId ||
            !payload.refreshTokenId
        ) {
            throw new UnauthorizedException();
        }

        // Check DB to verify session has not been revoked
        const isRevoked = await this.tokenService.isTokenRevoked(payload.refreshTokenId);
        if (isRevoked) {
            throw new UnauthorizedException('Session has been revoked');
        }
        
        return {
            userId: payload.userId,
            organizationId: payload.organizationId ?? null,
            roleId: payload.roleId ?? null,
            refreshTokenId: payload.refreshTokenId,
            isCompletedOnboarding: payload.isCompletedOnboarding ?? Boolean(payload.organizationId)
        };
    }
}