import { Injectable, Logger } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "../user/user.service";
import { loginUserDto } from "./dto/login-user.dto";
import { TokenType, User , UserStatus} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RoleService } from "../../modules/role/role.service";
import { TokenService } from "../../modules/token/token.service";
import { AuthInvalidCredentialsException, AuthNoMembershipException } from "../../common/errors";

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

        void this.userService.updateLastLoginAt(user.id).catch((err: unknown) => {
            this.logger.warn(
                { userId: user.id, err: err instanceof Error ? err.message : String(err) },
                'Failed to update lastLoginAt on register',
            );
        });

        this.logger.log({ userId: user.id }, 'User registered with onboarding tokens');

        return { user, accessToken, refreshToken };
    }

    /** Login User */
    async login(loginUserDto : loginUserDto) : Promise<AuthTokensResponse> {
        const user = await this.userService.getByEmail(loginUserDto.email)
        this.logger.debug({user}, 'User found in service')

        if(!user) {
            throw new AuthInvalidCredentialsException();
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.passwordHash)

        if (!isPasswordValid) {
            throw new AuthInvalidCredentialsException();
        }

        if (user.status === UserStatus.SUSPENDED) {
            throw new AuthInvalidCredentialsException()
        }
        if (user.status === UserStatus.INACTIVE) {
            throw new AuthInvalidCredentialsException()
        }

        const membership = user.lastActiveOrgId
            ? await this.roleService.getMembershipWithRole(user.id, user.lastActiveOrgId)
            : await this.roleService.getFirstMembershipWithRole(user.id);

        if(!membership) {
            throw new AuthNoMembershipException()
        }

        if (user.lastActiveOrgId !== membership.organizationId) {
            await this.userService.updateLastActiveOrg(user.id, membership.organizationId);
        }
        
        // Revoke all prior active sessions for this user (Single Active Session)
        await this.tokenService.revokeAllUserSessions(user.id);

        void this.userService.updateLastLoginAt(user.id).catch((err: unknown) => {
            this.logger.warn(
                { userId: user.id, err: err instanceof Error ? err.message : String(err) },
                'Failed to update lastLoginAt',
            );
        });

        const { accessToken, refreshToken } = await this.tokenService.generateAuthTokens(user.id, {
            organizationId: membership.organizationId,
            roleId: membership.roleId
        })

        const { passwordHash: _hash, ...userWithoutPassword } = user;

        this.logger.log({ userId: user.id }, 'Login successful (Single active session enforced)');

        return { user: userWithoutPassword, accessToken, refreshToken };
    }

    /** Logout User */
    async logout(refreshTokenId?: string, userId?: string): Promise<void> {
        if (refreshTokenId) {
            await this.tokenService.revokeToken(refreshTokenId);
        } else if (userId) {
            await this.tokenService.revokeAllUserSessions(userId);
        }
        this.logger.log({ userId }, 'Logout successful');
    }

    /** Refresh Access Token */
    async refreshAccessToken(refreshJwt: string) : Promise<{ accessToken: string }> {
        const tokenRecord = await this.tokenService.verifyAndGetToken(refreshJwt, [TokenType.REFRESH, TokenType.ONBOARDING])

        if (tokenRecord.type === TokenType.ONBOARDING) {
            const accessToken = this.tokenService.generateOnboardingAccessToken(
                tokenRecord.userId,
                tokenRecord.id
            );
            return { accessToken };
        }

        const metadata = tokenRecord.metadata as { organizationId: string; roleId: string };

        const accessToken = this.tokenService.generateAccessToken(
            tokenRecord.userId,
            tokenRecord.id,
            metadata.organizationId,
            metadata.roleId
        );

        return { accessToken };
    }
}