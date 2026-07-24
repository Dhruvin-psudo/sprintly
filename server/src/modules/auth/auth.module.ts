import { Module } from "@nestjs/common";
import { AuthContoller } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";
import { RoleModule } from "../role/role.module";
import { TokenModule } from "../token/token.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Module({
    imports: [UserModule, RoleModule, TokenModule, PassportModule],
    controllers: [AuthContoller],
    providers: [AuthService, JwtStrategy]
})

export class AuthModule { }