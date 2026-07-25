import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { Prisma, User } from '@prisma/client'

interface CreateUserData {
    firstName: string;
    lastName?: string;
    email: string;
    passwordHash: string
}

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateUserData): Promise<Omit<User, 'passwordHash'>> {

        return this.prisma.user.create({
            data: {
                firstName: data.firstName,
                email: data.email,
                passwordHash: data.passwordHash,
                ...(data.lastName ? { lastName: data.lastName } : {})
            },
            omit: {
                passwordHash: true
            }
        })
    }

    async isEmailTaken(email: string): Promise<boolean> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email,
                isDeleted: false
            },
            select: {
                id: true
            }
        })
        return user !== null
    }

    // Get User by Email (passwordHash omitted)
    async getByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email, isDeleted: false },
        });
    }

    // Get User by Id
    async findById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
        return this.prisma.user.findUnique({
            where: { id, isDeleted: false },
            omit: {
                passwordHash: true
            }
        });
    }

    // Get User by Id for their current Organization member role
    async getWithMembership(
        userId: string,
        organizationId: string,
    ): Promise<
        (Omit<User, 'passwordHash'> & {
            currentRole: { id: string; name: string } | null;
        }) | null
    > {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                isDeleted: false,
            }, 
            omit: { passwordHash: true,},
            include: {
            memberships: {
                where: { organizationId },
                take: 1,
                include: {
                role: {
                    select: {
                    id: true,
                    name: true,
                    },
                },
                },
            },
            },
        });

        if (!user) return null;

        const { memberships, ...rest } = user;

        return {
            ...rest,
            currentRole: memberships[0]?.role ?? null,
        };
        }

    // update user
    async update(userId: string, data: Prisma.UserUpdateInput): Promise<Omit<User, 'passwordHash'>> {
        return this.prisma.user.update({
            where: { id: userId, isDeleted: false },
            data: { ...data },
            omit: {
                passwordHash: true
            }
        });
    }

    // Delete User 
    async softDelete(id: string) : Promise<void> {
        await this.prisma.user.update({
            where: { id: id },
            data: { isDeleted: true , deletedAt: new Date()},
        });
    }

    // Update User Last Active Organization
    async updateLastActiveOrg(userId: string, organizationId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveOrgId: organizationId, updatedBy: userId },
        });
    }

    // Update last login 
    async updateLastLoginAt(userId: string, lastLoginAt: Date = new Date()): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: lastLoginAt },
        });
    }
}