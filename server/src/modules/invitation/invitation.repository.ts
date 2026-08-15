import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Invitation, InvitationStatus, Prisma } from '@prisma/client';
import { InvitationQueryDto } from './dto';

export interface CreateInvitationData {
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  expiresAt: Date;
  invitedById: string;
}

@Injectable()
export class InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInvitationData): Promise<Invitation> {
    return this.prisma.invitation.create({
      data: {
        organizationId: data.organizationId,
        email: data.email.toLowerCase().trim(),
        roleId: data.roleId,
        token: data.token,
        expiresAt: data.expiresAt,
        invitedById: data.invitedById,
        status: InvitationStatus.PENDING,
      },
      include: {
        role: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
        invitedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findByToken(token: string) {
    return this.prisma.invitation.findUnique({
      where: { token },
      include: {
        role: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
        invitedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.invitation.findFirst({
      where: { id, organizationId },
      include: {
        role: { select: { id: true, name: true } },
        invitedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findPendingByEmail(organizationId: string, email: string) {
    return this.prisma.invitation.findFirst({
      where: {
        organizationId,
        email: email.toLowerCase().trim(),
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findMany(organizationId: string, query: InvitationQueryDto) {
    const { search, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvitationWhereInput = {
      organizationId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { role: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          role: { select: { id: true, name: true } },
          invitedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.invitation.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<Invitation> {
    return this.prisma.invitation.update({
      where: { id },
      data: { status },
    });
  }

  async updateTokenAndExpiration(id: string, token: string, expiresAt: Date): Promise<Invitation> {
    return this.prisma.invitation.update({
      where: { id },
      data: {
        token,
        expiresAt,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async isUserActiveOrgMember(organizationId: string, email: string): Promise<boolean> {
    const count = await this.prisma.organizationMember.count({
      where: {
        organizationId,
        user: {
          email: email.toLowerCase().trim(),
          isDeleted: false,
        },
      },
    });
    return count > 0;
  }

  async getOrganizationById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
  }

  async findPendingByEmailForUser(email: string) {
    return this.prisma.invitation.findMany({
      where: {
        email: email.toLowerCase().trim(),
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        role: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
        invitedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatusByToken(token: string, status: InvitationStatus): Promise<Invitation> {
    return this.prisma.invitation.update({
      where: { token },
      data: { status },
    });
  }
}
