import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '@prisma/client';
import { TokenRepository } from './token.repository'
import { IAuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { randomUUID } from 'crypto';

export interface OrgTokenContext {
    organizationId: string;
    roleId: string
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
    ) {}

    /**
     * Generate Access Token Only (used for refreshing)
     * @param userId
     * @param orgContext
     * @param refreshTokenId
     * @returns 
     */
    generateAccessToken(
        userId: string,
        refreshTokenId: string
    ) {
        const payload : IAuthenticatedUser = {
            userId,
            refreshTokenId
        }

        // Generate Token (Expiry: 15Min settled by default)
        return this.jwtService.sign(payload)
    }

    async generateAuthTokens(
        userId: string,
    ) : Promise<GeneratedTokens> {
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

        // Generate Refresh Token
        const refreshJwt = this.jwtService.sign(
            { sub: userId, tokenType: TokenType.REFRESH, familyId },
            { expiresIn: `${refreshTokenExpirationDays}d` },
        );

        // Save Refresh Token on DB
        const tokenRow = await this.tokenRepository.createToken({
            userId,
            type: TokenType.REFRESH,
            token: refreshJwt,
            familyId,
            expiresAt,
        });

        // Step 2: Access Token
        const accessToken = this.generateAccessToken(
            userId,
            tokenRow.id,
        );

        return { accessToken, refreshToken: refreshJwt };
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
        refreshTokenId?: string,
    ): Promise<GeneratedTokens> {
        // Revoke Refresh Token
        if (refreshTokenId) {
            await this.revokeToken(refreshTokenId);
        }
        // Generate and Return Auth Tokens
        return this.generateAuthTokens(userId);
    }

    /**
     * Revoke Token By Id
     * @param tokenId
     */
    async revokeToken(tokenId: string): Promise<void> {
        await this.tokenRepository.revokeToken(tokenId);
    }
}
