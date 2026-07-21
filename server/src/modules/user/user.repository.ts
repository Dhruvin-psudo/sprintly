import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { User } from '@prisma/client'

interface CreateUserData {
    name: string;
    email: string;
    password: string
}

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateUserData): Promise<Omit<User, 'password'>> {

        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password
            },
            omit: {
                password: true
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
}