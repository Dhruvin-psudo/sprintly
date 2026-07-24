import { ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "../user/user.service";
import { loginUserDto } from "./dto/login-user.dto";
import { TokenType, User , UserStatus} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RoleService } from "../../modules/role/role.service";
import { TokenService } from "../../modules/token/token.service";

export interface AuthTokensResponse {
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService
    ) { }

    async register(registerUserDto: RegisterUserDto): Promise<AuthTokensResponse> {
        const user = await this.userService.create(registerUserDto);
        await this.tokenService.revokeAllUserSessions(user.id);
        const { accessToken, refreshToken } = await this.tokenService.generateOnboardingTokens(user.id);

        this.logger.log({ userId: user.id }, 'User registered with onboarding tokens');

        return { user, accessToken, refreshToken };
    }

    /** Login User */
    async login(loginUserDto : loginUserDto) : Promise<AuthTokensResponse> {
        const user = await this.userService.getByEmail(loginUserDto.email)

        if(!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.passwordHash)

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.SUSPENDED) {
            throw new ForbiddenException('Account is suspended');
        }
        if (user.status === UserStatus.INACTIVE) {
            throw new ForbiddenException('Account is inactive');
        }

        let orgContext: { organizationId: string; roleId: string } | undefined;

        if (user.lastActiveOrgId) {
            const membership = await this.roleService.getMembershipWithRole(user.id, user.lastActiveOrgId);
            if (membership) {
                orgContext = { organizationId: membership.organizationId, roleId: membership.roleId };
            }
        }

        if (!orgContext) {
            const firstMembership = await this.roleService.getFirstMembershipWithRole(user.id);
            if (firstMembership) {
                orgContext = { organizationId: firstMembership.organizationId, roleId: firstMembership.roleId };
            }
        }

        // Revoke all prior active sessions for this user (Single Active Session)
        await this.tokenService.revokeAllUserSessions(user.id);

        const { accessToken, refreshToken } = orgContext
            ? await this.tokenService.generateAuthTokens(user.id, orgContext)
            : await this.tokenService.generateOnboardingTokens(user.id);

        const { passwordHash: _hash, ...userWithoutPassword } = user;

        this.logger.log({ userId: user.id }, 'Login successful (Single active session enforced)');

        return { user: userWithoutPassword, accessToken, refreshToken };
    }

    /** Logout User */
    async logout(refreshTokenId?: string, userId?: string): Promise<void> {
        if (refreshTokenId) {
            this.logger.log({ refreshTokenId }, "logout function started with refresh token")
            await this.tokenService.revokeToken(refreshTokenId);
            this.logger.log({ refreshTokenId }, "token revoked successfully")
        } else if (userId) {
            this.logger.log({ userId }, "logout function started with user id")
            await this.tokenService.revokeAllUserSessions(userId);
            this.logger.log({ userId }, "all sessions revoked successfully")
        }
        this.logger.log({ userId }, 'Logout successful');
    }

    /** Refresh Access Token */
    async refreshAccessToken(refreshJwt: string) : Promise<{ accessToken: string }> {
        const tokenRecord = await this.tokenService.verifyAndGetToken(refreshJwt, [TokenType.REFRESH, TokenType.ONBOARDING])

        const metadata = tokenRecord.metadata as { organizationId: string; roleId: string };

        const accessToken = this.tokenService.generateAccessToken(
            tokenRecord.userId,
            tokenRecord.id,
            { 
                organizationId : metadata.organizationId,
                roleId: metadata.roleId
            }
        )

        return {accessToken}
    }
}