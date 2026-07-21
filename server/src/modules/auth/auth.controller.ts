import { Body, Controller, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../../common/decorators/public.decorator";
import { RegisterUsetDto } from "./dto/register-use.dto";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/dto/api-response.dto";

@Controller('auth')
export class AuthContoller {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Public()
    @Post('register')
    async register(
        @Body() registerUserDto: RegisterUsetDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log(registerUserDto)
        const result = await this.authService.register(registerUserDto)

        return ApiResponse.ok(result, 'Registration successful')
    }
}