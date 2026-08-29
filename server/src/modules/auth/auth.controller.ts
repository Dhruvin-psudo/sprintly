import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../../common/decorators/public.decorator";
import { RegisterUserDto } from "./dto/register-user.dto";
import { AuthService } from "./auth.service";
import type { Request, Response } from "express"
import { ApiResponse } from "../../common/dto";
import { loginUserDto } from "./dto/login-user.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { REFRESH_TOKEN_COOKIE_NAME } from "../../common/constants";
import { AllowWithoutOrg } from '../../common/decorators/allow-without-org.decorator';
import type { IJwtUser } from '../../common/interfaces';

@Controller('auth')
export class AuthContoller {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    // Set Refresh Token into cookie
    private setRefreshTokenCookie(res: Response, refreshToken: string): void {
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth',
            maxAge:
                this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS', 7) *
                24 *
                60 *
                60 *
                1000,
        });
    }

    @Public()
    @Post('register')
    async register(
        @Body() registerUserDto: RegisterUserDto,
    ) {
        const result = await this.authService.register(registerUserDto)

        return ApiResponse.ok(result, 'Registration successful')
    }

    @Public()
    @Post('login')
    async login(@Body() loginUserDto: loginUserDto, @Res({ passthrough: true }) res: Response) {
        const {refreshToken, ...result} = await this.authService.login(loginUserDto);

        this.setRefreshTokenCookie(res, refreshToken)

        return ApiResponse.ok(result, 'Login successful');
    }

    @Post('logout')
    async logout(
        @CurrentUser('refreshTokenId') refreshTokenId: string,
        @Res({ passthrough: true }) res: Response
    ) {
        await this.authService.logout(refreshTokenId);

        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth',
        })

        return ApiResponse.ok(null, 'Logout successful');
    }

    @Public()
    @Post('refresh')
    async refresh(@Req() req: Request) {
        const refreshJwt = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

        if (!refreshJwt) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const result = await this.authService.refreshAccessToken(refreshJwt);

        return ApiResponse.ok(result, 'Token refreshed successfully');
    }

    @AllowWithoutOrg()
    @Get('session/context')
    async sessionContext(@CurrentUser() user: IJwtUser) {
        return ApiResponse.ok(
            await this.authService.getSessionContext(user),
            'Session context fetched successfully',
        );
    }

    @AllowWithoutOrg()
    @Post('session/reconcile')
    async reconcileSession(
        @CurrentUser() user: IJwtUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshToken, ...result } = await this.authService.reconcileSession(user);
        this.setRefreshTokenCookie(res, refreshToken);
        return ApiResponse.ok(result, 'Session reconciled successfully');
    }
}
