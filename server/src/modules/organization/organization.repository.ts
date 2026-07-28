import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { CreateOrganizationData } from "./interfaces/organization.interface";
import { Organization, Prisma } from "@prisma/client";

type PrismaLike = Pick<PrismaService, 'organization'> | Prisma.TransactionClient

@Injectable()
export class OrganizationRepository {
    constructor(private readonly prisma: PrismaService) { }

    private client(tx?: Prisma.TransactionClient): PrismaLike {
        return tx ?? this.prisma
    }

    async create(data: CreateOrganizationData): Promise<Organization> {
        return this.prisma.organization.create({
            data: {
                name: data.name,
                slug: data.slug,
                email: data.email,
                createdBy: data.createdBy
            }
        })
    };

    async isSlugTaken(slug: string): Promise<boolean> {
        const org = await this.prisma.organization.findFirst({
            where: { slug, isDeleted: false },
            select: { id: true }
        })
        return org !== null
    };

    async findOrgById(orgId: string, tx?: Prisma.TransactionClient) : Promise<Organization | null> {
        const db = this.client(tx);
        return db.organization.findUnique({
            where: { id: orgId , isDeleted: false}
        })
    };

    async findOrgsByUserId(userId: string) : Promise<Organization[]> {
        return this.prisma.organization.findMany({
            where: {
                isDeleted: false,
                members: { some: { userId }}
            }
        })
    }
}