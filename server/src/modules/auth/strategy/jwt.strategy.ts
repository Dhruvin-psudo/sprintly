import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { IJwtUser } from "../../../common/interfaces";
import { TokenService } from "../../../modules/token/token.service";
import { AuthInvalidCredentialsException, AuthTokenInvalidException } from "../../../common/errors";

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

    async validate(payload: IJwtUser) : Promise<IJwtUser> {
        if (
            !payload.userId ||
            !payload.refreshTokenId
        ) {
            throw new AuthInvalidCredentialsException()
        }

        // Check DB to verify session has not been revoked
        const isRevoked = await this.tokenService.isTokenRevoked(payload.refreshTokenId);
        if (isRevoked) {
            throw new AuthTokenInvalidException()
        }
        
        if (payload.organizationId && payload.roleId) {
            return {
                userId: payload.userId,
                refreshTokenId: payload.refreshTokenId,
                organizationId: payload.organizationId,
                roleId: payload.roleId,
                isCompletedOnboarding: true
            };
        }

        return {
            userId: payload.userId,
            refreshTokenId: payload.refreshTokenId,
            organizationId: null,
            roleId: null,
            isCompletedOnboarding: false
        };
    }
}