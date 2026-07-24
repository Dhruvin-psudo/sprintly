import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Token, TokenType } from '@prisma/client';
import { TokenRepository } from './token.repository'
import { IAuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { randomUUID } from 'crypto';

export interface OrgTokenContext {
    organizationId?: string | null;
    roleId?: string | null;
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
     * Generate Access Token Only (used for refreshing)
     * @param userId
     * @param refreshTokenId
     * @param orgContext
     * @returns 
     */
    generateAccessToken(
        userId: string,
        refreshTokenId: string,
        orgContext?: OrgTokenContext
    ) {
        const payload: IAuthenticatedUser = {
            userId,
            refreshTokenId,
            organizationId: orgContext?.organizationId ?? null,
            roleId: orgContext?.roleId ?? null,
            isCompletedOnboarding: Boolean(orgContext?.organizationId)
        }

        // Generate Token (Expiry: 15Min settled by default)
        return this.jwtService.sign(payload)
    }

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

        const tokenType = orgContext?.organizationId ? TokenType.REFRESH : TokenType.ONBOARDING;

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
            expiresAt,
        });

        // Step 2: Access Token
        const accessToken = this.generateAccessToken(
            userId,
            tokenRow.id,
            orgContext
        );

        return { accessToken, refreshToken: refreshJwt };
    }

    /**
     * Generate Onboarding Tokens for new register flow
     */
    async generateOnboardingTokens(userId: string): Promise<GeneratedTokens> {
        return this.generateAuthTokens(userId, { organizationId: null, roleId: null });
    }

    /**
     * Issue Auth Tokens
     * Revoke Refresh Token (If Exists)
     * @param userId
     * @param orgContext
     * @param refreshTokenId
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
            throw new Error('Token not found');
        }

        // Find matching active record in DB
        const tokenRecord = await this.tokenRepository.findActiveToken(expectedType, token);

        if (!tokenRecord) {
            throw new Error('Token not found');
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
     * Revoke All Active Sessions (Refresh & Onboarding Tokens) for a User
     * Enforces Single Active Session Policy
     */
    async revokeAllUserSessions(userId: string): Promise<void> {
        await this.tokenRepository.revokeAllUserTokensByType(userId, TokenType.REFRESH);
        await this.tokenRepository.revokeAllUserTokensByType(userId, TokenType.ONBOARDING);
    }
}
