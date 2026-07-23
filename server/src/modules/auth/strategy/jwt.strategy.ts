import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { IAuthenticatedUser } from "../../../common/interfaces/authenticated-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
        })
    }

    validate(payload: IAuthenticatedUser) : IAuthenticatedUser {
        if (
            !payload.userId ||
            !payload.refreshTokenId
        ) {
            throw new UnauthorizedException();
        }
        
        return {
            userId: payload.userId,
            refreshTokenId: payload.refreshTokenId
        };
    }
}