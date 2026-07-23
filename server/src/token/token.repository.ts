import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma";
import { Prisma, Token, TokenType } from "@prisma/client";

export interface CreateTokenData {
  userId: string;
  type: TokenType;
  token: string;
  familyId?: string;
  metadata?: Prisma.InputJsonValue;
  expiresAt: Date;
}

@Injectable()
export class TokenRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createToken(data: CreateTokenData): Promise<Token> {
    return this.prisma.token.create({
      data: {
        userId: data.userId,
        type: data.type,
        token: data.token,
        familyId: data.familyId,
        metadata: data.metadata ?? undefined,
        expiresAt: data.expiresAt,
      },
    });
  }

  // Find token by id
  async findTokenById(id: string): Promise<Token | null> {
    return this.prisma.token.findUnique({
      where: {
        id
      }
    })
  }

  // Find Active Token
  async findActiveToken(type: TokenType, token: string): Promise<Token | null> {
    return this.prisma.token.findFirst({
      where: {
        type,
        token,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    })
  }

  // Revoke Token
  async revokeToken(id: string): Promise<void> {
    await this.prisma.token.update({
      where: { id },
      data: { isRevoked: true }
    })
  }

  // Invalidate All Tokens by User 
  async revokeAllUserTokensByType(userId: string, type: TokenType): Promise<void> {
    await this.prisma.token.updateMany({
      where: { userId, type, isRevoked: false },
      data: { isRevoked: true }
    })
  }
}
