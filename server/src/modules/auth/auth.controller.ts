import { Body, Controller, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../../common/decorators/public.decorator";
import { RegisterUserDto } from "./dto/register-user.dto";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/dto/api-response.dto";
import { loginUserDto } from "./dto/login-user.dto";

@Controller('auth')
export class AuthContoller {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Public()
    @Post('register')
    async register(
        @Body() registerUserDto: RegisterUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.register(registerUserDto)

        return ApiResponse.ok(result, 'Registration successful')
    }

    @Public()
    @Post('login')
    async login(@Body() loginUserDto: loginUserDto, @Res({ passthrough: true }) res: Response) {
        const { refreshToken, ...result } = await this.authService.login(loginUserDto);

        // this.setRefreshTokenCookie(res, refreshToken);

        return ApiResponse.ok(result, 'Login successful');
    }

    @Post('logout')
    async logout() { }

    @Public()
    @Post('refresh')
    async refresh() { }
}