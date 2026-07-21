import { Module } from "@nestjs/common";
import { AuthContoller } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [UserModule],
    controllers: [AuthContoller],
    providers: [AuthService]
})

export class AuthModule {}