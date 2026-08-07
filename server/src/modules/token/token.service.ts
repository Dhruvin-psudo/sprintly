import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Token, TokenType } from '@prisma/client';
import { TokenRepository } from './token.repository'
import { IJwtUser } from '../../common/interfaces';
import { randomUUID } from 'crypto';
import { AuthResetTokenInvalidException } from '../../common/errors';

export interface OrgTokenContext {
    organizationId: string;
    roleId: string;
}

export interface GeneratedTokens {
    accessToken: string
    refreshToken: string
}

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name)

    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenRepository: TokenRepository,
        private readonly configService: ConfigService
    ) { }

    /**
     * Generate Access Token (with optional Org & Role Context)
     */
    generateAccessToken(
        userId: string,
        refreshTokenId: string,
        organizationId?: string | null,
        roleId?: string | null
    ): string {
        const payload: IJwtUser = {
            userId,
            refreshTokenId,
            organizationId: organizationId ?? null,
            roleId: roleId ?? null,
            hasOrganization: !!(organizationId && roleId)
        }

        return this.jwtService.sign(payload)
    }

    /**
     * Generate Full Auth Tokens (Refresh Token + Access Token)
     * orgContext is optional — when absent, tokens are issued without org/role context.
     */
    async generateAuthTokens(
        userId: string,
        orgContext?: OrgTokenContext
    ): Promise<GeneratedTokens> {
        // Step 1: Refresh Token
        const familyId = randomUUID();

        // Get Expiration Time Of Refresh Token
        const refreshTokenExpirationDays = this.configService.get<number>(
            'REFRESH_TOKEN_EXPIRATION_DAYS',
            7,
        );

        // Set Expiry Of Refresh Token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshTokenExpirationDays);

        const tokenType = TokenType.REFRESH;

        // Generate Refresh Token
        const refreshJwt = this.jwtService.sign(
            { sub: userId, tokenType, familyId },
            { expiresIn: `${refreshTokenExpirationDays}d` },
        );

        // Save Refresh Token on DB
        const tokenRow = await this.tokenRepository.createToken({
            userId,
            type: tokenType,
            token: refreshJwt,
            familyId,
            metadata: orgContext
                ? { organizationId: orgContext.organizationId, roleId: orgContext.roleId }
                : {},
            expiresAt,
        });

        // Step 2: Access Token
        const accessToken = this.generateAccessToken(
            userId,
            tokenRow.id,
            orgContext?.organizationId ?? null,
            orgContext?.roleId ?? null
        );

        return { accessToken, refreshToken: refreshJwt };
    }

    /**
     * Issue Auth Tokens
     * Revoke Refresh Token (If Exists)
     * @param userId
     * @param orgContext
     * @returns
     */
    async issueAuthTokens(
        userId: string,
        orgContext?: OrgTokenContext,
    ): Promise<GeneratedTokens> {
        // Revoke all prior active sessions (Single Active Session Policy)
        await this.revokeAllUserSessions(userId);

        // Generate and Return Auth Tokens
        return this.generateAuthTokens(userId, orgContext);
    }

    /**
     * Check if a token session has been revoked by ID
     */
    async isTokenRevoked(refreshTokenId: string): Promise<boolean> {
        const tokenRecord = await this.tokenRepository.findTokenById(refreshTokenId);

        // If token record doesn't exist, OR isRevoked is true, OR token has expired
        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt <= new Date()) {
            return true; // Token IS revoked / invalid
        }

        return false; // Token IS NOT revoked (it is active and valid)
    }


    /**
     * Verify Token
     * @param token
     * @param expectedType
     * @returns
     */
    async verifyAndGetToken(token: string, expectedType: TokenType[]): Promise<Token> {
        // Verify JWT signature and expiration
        try {
            this.jwtService.verify(token);
        } catch {
            throw new AuthResetTokenInvalidException()
        }

        // Find matching active record in DB
        const tokenRecord = await this.tokenRepository.findActiveToken(expectedType, token);

        if (!tokenRecord) {
            throw new AuthResetTokenInvalidException()
        }

        return tokenRecord;
    }

    /**
     * Revoke Token By Id
     * @param tokenId
     */
    async revokeToken(tokenId: string): Promise<void> {
        await this.tokenRepository.revokeToken(tokenId);
    }

    /**
     * Revoke All Active Refresh Sessions for a User
     * Enforces Single Active Session Policy
     */
    async revokeAllUserSessions(userId: string): Promise<void> {
        await this.tokenRepository.revokeAllUserTokensByType(userId, TokenType.REFRESH);
    }
}
