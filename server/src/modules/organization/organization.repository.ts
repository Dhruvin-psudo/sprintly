import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { CreateOrganizationData } from "./interfaces/organization.interface";
import { Organization } from "@prisma/client";

@Injectable()
export class OrganizationRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateOrganizationData): Promise<Organization> {
        return this.prisma.organization.create({
            data: {
                name: data.name,
                slug: data.slug,
                email: data.email,
                createdBy: data.createdBy
            }
        })
    }

    async isSlugTaken(slug: string): Promise<boolean> {
        const org = await this.prisma.organization.findFirst({
            where: { slug, isDeleted: false },
            select: { id: true }
        })
        return org !== null
    }
}