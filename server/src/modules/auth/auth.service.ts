import { Injectable, Logger, Optional } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "../user/user.service";
import { loginUserDto } from "./dto/login-user.dto";
import { TokenType, User , UserStatus} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RoleService } from "../../modules/role/role.service";
import { TokenService } from "../../modules/token/token.service";
import { AuthInvalidCredentialsException } from "../../common/errors";
import { OrganizationService } from '../organization/organization.service';
import { IJwtUser } from '../../common/interfaces';

export interface AuthTokensResponse {
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
    hasOrganization: boolean;
}

export interface RegisterResponse {
    user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService,
        @Optional() private readonly organizationService?: OrganizationService,
    ) { }

    async register(registerUserDto: RegisterUserDto): Promise<RegisterResponse> {
        const user = await this.userService.create(registerUserDto);

        this.logger.log({ userId: user.id }, 'User registered successfully');

        return { user };
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

        // Revoke all prior active sessions for this user (Single Active Session)
        await this.tokenService.revokeAllUserSessions(user.id);

        void this.userService.updateLastLoginAt(user.id).catch((err: unknown) => {
            this.logger.warn(
                { userId: user.id, err: err instanceof Error ? err.message : String(err) },
                'Failed to update lastLoginAt',
            );
        });

        const { passwordHash: _hash, ...userWithoutPassword } = user;

        if (!membership) {
            this.logger.log({ userId: user.id }, 'Login successful without membership (no org)');
            const { accessToken, refreshToken } = await this.tokenService.generateAuthTokens(user.id);
            return { user: userWithoutPassword, accessToken, refreshToken, hasOrganization: false };
        }

        if (user.lastActiveOrgId !== membership.organizationId) {
            await this.userService.updateLastActiveOrg(user.id, membership.organizationId);
        }

        const { accessToken, refreshToken } = await this.tokenService.generateAuthTokens(user.id, {
            organizationId: membership.organizationId,
            roleId: membership.roleId
        });

        this.logger.log({ userId: user.id }, 'Login successful with org membership');

        return { user: userWithoutPassword, accessToken, refreshToken, hasOrganization: true };
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
        const tokenRecord = await this.tokenService.verifyAndGetToken(refreshJwt, [TokenType.REFRESH])

        const metadata = tokenRecord.metadata as { organizationId?: string; roleId?: string } | null;
        const membership = this.organizationService && metadata?.organizationId
            ? await this.roleService.getMembershipWithRole(tokenRecord.userId, metadata.organizationId)
            : undefined;
        const organizationId = this.organizationService
            ? membership?.organizationId ?? null
            : metadata?.organizationId ?? null;
        const roleId = this.organizationService
            ? membership?.roleId ?? null
            : metadata?.roleId ?? null;

        const accessToken = this.tokenService.generateAccessToken(
            tokenRecord.userId,
            tokenRecord.id,
            organizationId,
            roleId,
        );

        return { accessToken };
    }

    async getSessionContext(user: IJwtUser) {
        const organizations = this.organizationService
            ? await this.organizationService.getUserOrganizations(user.userId)
            : [];
        const membership = user.organizationId
            ? await this.roleService.getMembershipWithRole(user.userId, user.organizationId)
            : null;

        return {
            hasOrganization: !!membership,
            contextMatches: !!membership && membership.roleId === user.roleId,
            activeOrganizationId: membership?.organizationId ?? null,
            activeRoleId: membership?.roleId ?? null,
            organizations,
        };
    }

    async reconcileSession(user: IJwtUser) {
        const context = await this.getSessionContext(user);
        const tokenContext = context.hasOrganization && context.activeOrganizationId && context.activeRoleId
            ? { organizationId: context.activeOrganizationId, roleId: context.activeRoleId }
            : undefined;
        const tokens = await this.tokenService.issueAuthTokens(user.userId, tokenContext);

        return {
            ...tokens,
            hasOrganization: !!tokenContext,
            removedFromActiveOrganization: !!user.organizationId && !tokenContext,
            organizations: context.organizations,
        };
    }
}
