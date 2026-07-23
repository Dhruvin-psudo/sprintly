import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { User } from '@prisma/client'

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
}