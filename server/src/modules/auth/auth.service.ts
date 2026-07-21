import { Injectable, Logger } from "@nestjs/common";
import { RegisterUsetDto } from "./dto/register-use.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly userService: UserService
    ) { }

    async register(registerUserDto: RegisterUsetDto) {
        console.log(registerUserDto)
        const user = await this.userService.create(registerUserDto)
        this.logger.log({ userId: user.id }, 'User registered')
        return user
    }
}